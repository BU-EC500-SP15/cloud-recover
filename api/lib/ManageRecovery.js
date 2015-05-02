/* ReClo API: /lib/ManageRecovery.js
 * ---------------------------------
 * v1.0
 * Carlton Duffett
 * 4-20-2015
 *
 *
 * Regularly scans the recovery database and manages recovery tasks that are in-progress.
 * Currently this job runs once per minute. Typical recovery takes 1 hour to complete.
 *
 * Possible recovery states and (progress) are:
 * -------------------------------------------------------------------------------------------------
 * PENDING      - ( 0%) waiting to start backup downloads
 * DOWNLOADING  - ( - ) downloading full and incremental backups to temporary storage for import
 * DOWNLOADED   - (35%) ready to merge downloaded backups into one VHD
 * IMPORTING    - ( - ) importing backup into EC2, see progress using ec2-describe-conversion-tasks
 * IMPORTED     - (55%) #deprecated# sucessfully imported into EC2, ready to start conversion
 * CONVERTING   - ( - ) in-progress conversion from VHD to EC2 AMI instance (started automatically)
 * CONVERTED    - (90%) conversion task finished (attempting to start instance)
 * FINISHING    - ( - ) starting new instance
 * FINISHED     - (100) new instance started, recovery process complete
 * FAILED       - ( - ) recovery failed at some point during the download/import/conversion process
 * -------------------------------------------------------------------------------------------------
 */

var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var fs = require('fs');
var exec = require('child_process').exec;

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

var ts = corelib.createTimestamp();
console.log('Starting recovery management at ' + ts);

// current progress percentage weights
var progress = {downloading: 10,
                downloaded: 35,
                imported: 55,
                converted: 80,
                finished: 100};

/* -------------------------------------------------------------------------------------------------
 * MANAGE ALL ACTIVE RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function connectionCallback(err) {

    if (err) {
        console.log('Recovery management failed. Unable to connect to the database');
        db.disconnect();
        return;
    }
    
    // get a list of current recovery tasks in progress
    var qry = "SELECT recovery_id, user_id, backup_id, " + 
              "conversion_id, instance_id, recovery_state FROM reclodb.recovery WHERE " +
              "recovery_state != 'finished' AND " +
              "recovery_state != 'failed' AND " + 
              "recovery_status = 'A'";

    function getRecoveryTasksCallback(err,results) {
        
        db.disconnect();

        if (err) {
            console.log('Recovery management failed, there was an error connecting to the database');
            return;
        }
        
        if (results.length == 0) {
            console.log('No recovery tasks in-progress');
            return;
        }
        
        // update the progress and advance each recovery task
        for (i = 0; i < results.length; i++) {
            
            var this_state    = results[i].recovery_state;
            var user_id       = results[i].user_id;
            var recovery_id   = results[i].recovery_id;
            var backup_id     = results[i].backup_id;
            var conversion_id = results[i].conversion_id;
            var instance_id   = results[i].instance_id;
            
            switch (this_state) {
                
                case 'pending':
                    handlePending(recovery_id,user_id,backup_id);
                    break;               
                                
                case 'downloading':
                    handleDownloading(recovery_id);
                    break;               
                                
                case 'downloaded':
                    handleDownloaded(recovery_id,user_id,backup_id);
                    break;               
                    
                case 'importing':
                    handleImporting(recovery_id,conversion_id);
                    break;                          
                                
                case 'converting':
                    handleConverting(recovery_id,conversion_id);
                    break;               
                                
                case 'converted':
                    handleConverted(recovery_id,instance_id);
                    break;               
                                
                case 'finishing':
                    handleFinishing(user_id,recovery_id);
                    break;               
            } // switch
        } // for
    } // getRecoveryTasksCallback
    db.query(qry,getRecoveryTasksCallback);
}
var db = new DBConnection();
db.connect(connectionCallback.bind(db));

/* -------------------------------------------------------------------------------------------------
 * HANDLE PENDING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handlePending(recovery_id,user_id,backup_id) {

    console.log('Handling PENDING recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id +
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get list of vhd backups to download
        var qry =   "SET @date_selected = (" +
                        "SELECT date_created FROM reclodb.backups WHERE " +
                        "backup_id = ?); " +
        
                    "SET @date_of_last_full = (" +
                        "SELECT date_created FROM reclodb.backups WHERE " +
                        "type = 'full' AND " +
                        "date_created <= @date_selected " +
                        "ORDER BY date_created DESC LIMIT 1); " +
        
                    "SELECT file_name FROM reclodb.backups WHERE " +
                        "backup_status = 'A' AND " + 
                        "user_id = ? AND " + 
                        "type = 'full' AND " + // just grab the full backup for now
                        "date_created BETWEEN @date_of_last_full AND @date_selected;";
                               
        var params = [backup_id,user_id];

        function getBackupListCallback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + 
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            backups = results[2]; // first 2 results (0-1) are garbage from the "SET" statements
            
            var qry = "UPDATE reclodb.recovery SET no_downloads = ?, " +
                        "no_completed = 0, " + 
                        "recovery_state = 'downloading', " +
                        "total_progress = ? " +
                        "WHERE recovery_id = ?";
            
            var params = [backups.length, progress.downloading, recovery_id];
            
            function startDownloadCallback(err,results) {
                
                if (err) {
                    console.log('Recovery management failed for task ' + recovery_id + 
                                ', there was an error connecting to the database');
                    
                    db.disconnect(); 
                    return;
                }               
                
                var file_name   = backups[0].file_name;
                 
                // download full backup
                console.log('Downloading file ' + file_name);
                
                var dir = '/backups-tmp/' + user_id + '/';

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                
                // backups download to separate volume mounted on our server
                var path_for_download = dir + file_name;    
                var bucket            = 'reclo-client-backups';
                var key               = user_id + '/' + file_name;
                
                // run download through CLI
                var cmd = 'aws s3 cp s3://' + bucket +
                          '/' + key +
                          ' ' + path_for_download;
 
                // used with child process
                var failed = false; 
                var qry = '';
                var params = [];
                  
                // child process handlers
                function handle_stdout(data) {
                     // nothing to do here
                } // handle_stdout
                
                function handle_stderr(err) {
                    
                    console.log('Download Error: ' + err);
                    failed = true;
                    
                    // query to use if failed
                    qry = "UPDATE reclodb.recovery SET recovery_state = 'failed' WHERE " +
                              "recovery_id = ?";
                              
                    params = [recovery_id];                
                } // handle_stderr
                
                function handle_close(code) {
                    
                    console.log('download closed with code ' + code);
                    
                    if (!failed) {
                    
                        // query to use if successful
                        qry = "UPDATE reclodb.recovery SET no_completed = 1, " +
                                    "state_progress = 100 " + // 100% complete
                                    "WHERE recovery_id = ?"; 
                                                     
                        params = [recovery_id];
                    }
                    
                    function updateRecoveryStateCallback(err,results) {
                        
                        if (err) {
                            console.log('Recovery management failed for task ' + recovery_id +
                                        ', there was an error connecting to the database');
                            
                            db.disconnect();
                            return;
                        }
                        
                        console.log('Successfully downloaded backup ' + backup_id);
                        db.disconnect();  
        
                    } // updateRecoveryStateCallback
                    db.query(qry,params,updateRecoveryStateCallback);
                    
                } // handle_close
                
                // run child process for ec2-import-instance
                var child = exec(cmd);
                child.stdout.on('data',handle_stdout);
                child.stderr.on('data',handle_stderr);
                child.on('close',handle_close);               

            } // startDownloadCallback
            db.query(qry,params,startDownloadCallback);
            
        } // getRecoveryTasksCallback
        db.query(qry,params,getBackupListCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));    
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE DOWNLOADING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleDownloading(recovery_id) {

    console.log('Handling DOWNLOADING recovery task ' + recovery_id);
    
    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get a list of current download tasks
        var qry = "SELECT no_downloads, state_progress, no_completed FROM reclodb.recovery WHERE recovery_id = ?";
        var params = [recovery_id];

        function getDownloadProgressCallback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + 
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            no_downloads   = results[0].no_downloads;
            no_completed   = results[0].no_completed;
            state_progress = results[0].state_progress;
            
            if (no_downloads == no_completed) {
                
                // downloading is complete
                var qry = "UPDATE reclodb.recovery SET recovery_state = ?, " + 
                            "state_progress = ?, " + 
                            "total_progress = ? " + 
                            "WHERE recovery_id = ?";
                 
                 
                var next_state      = 'downloaded';
                var state_progress  = 0;
                var total_progress  = progress.downloaded;
                           
                var params = [next_state, state_progress, total_progress, recovery_id];  
            
                function completeDownloadCallback(err,results) {
                    
                    if (err) {
                        console.log('Recovery management failed for task ' + recovery_id + 
                                    ', there was an error connecting to the database');
                        
                        db.disconnect();
                        return;
                    }
                    
                    console.log('Download completed for recovery ' + recovery_id);
                    db.disconnect();
                                   
                } // updateDownloadingProgress
                db.query(qry,params,completeDownloadCallback);
            }
            else {
                
                console.log('Download(s) still in-progress.');
                db.disconnect();
            } // if
            
        } // getRecoveryTasksCallback
        db.query(qry,params,getDownloadProgressCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE DOWNLOADED RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleDownloaded(recovery_id,user_id,backup_id) {

    console.log('Handling DOWNLOADED recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get name of backup to import
        var qry = "SELECT file_name FROM reclodb.backups WHERE backup_id = ?";
                  
        var params = [backup_id];

        function startImportCallback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id +
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            var file_name = results[0].file_name;

            // bucket to hold import
            var bucket = 'reclo-imported-vms';

            // get final file size
            var path_to_backup = '/backups-tmp/' + user_id + '/' + file_name;
            var stats = fs.statSync(path_to_backup);
            var file_size_in_bytes = stats["size"];

            // determine volume size (in 100GB increments, up to 2TB)
            var vol_size = 100; // defaulting to 100GB for now

            // get user data to include with new instance
            // Will need to read this from a local file that we maintain
            // as part of our repository
            var user_data = 'foo';

            // other parameters
            var region   = 'us-west-2';
            var zone     = 'us-west-2c';
            var subnet   = 'subnet-b4f42ed1';
            var group    = 'reclo-windows';
            var group_id = 'sg-4efda52b'; // reclo-windows
            var type     = 't2.micro';

            // get ACCESS_KEY and SECRET_KEY for AWS resources
            function getAccessKeysCallback(err,data) {
                
                if (err) {
                    
                    console.log('getAccessKeys Error: ' + err);
                    db.disconnect();
                    return;
                }
                
                var ACCESS_KEY = data.AccessKey;
                var SECRET_KEY = data.SecretKey;
                
                // Build ec2-import-instance CLI command
                var cmd = 'ec2-import-instance' + 
                  ' -O ' + ACCESS_KEY + ' -W ' + SECRET_KEY + 
                  ' -o ' + ACCESS_KEY + ' -w ' + SECRET_KEY + 
                  ' -t ' + type + ' -f VHD -s ' + vol_size + 
                  ' -a x86_64 -b ' + bucket +
                  ' --group ' + group + ' --region ' + region +
                  ' -z ' + zone + ' --subnet ' + subnet + 
                  ' ' + path_to_backup;
                
                // used with child process  
                var buffer = '';
                var valid_output = true; 
                var failed = false; 
                var qry = '';
                var params = [];
                  
                // child process handlers
                function handle_stdout(data) {
                     
                    if (data.indexOf('Uploading') != -1) { // end of useful stdout
                        valid_output = false;
                    }
                
                    // buffer the valid stdout for parsing later
                    if (valid_output) {
                        buffer = buffer + data.toString();
                    }
                } // handle_stdout
                
                function handle_stderr(err) {
                    
                    console.log('ec2-import-instance Error: ' + err);
                    failed = true;
                    
                    // query to use if failed
                    qry = "UPDATE reclodb.recovery SET recovery_state = 'failed' WHERE " +
                              "recovery_id = ?";
                              
                    params = [recovery_id];                
                } // handle_stderr
                
                function handle_close(code) {
                    
                    console.log('ec2-import-instance closed with code ' + code);
                    
                    if (!failed) {
                    
                        // parse the buffer for ids
                        var instance_id   = 'i-' + buffer.split('\ti-')[1].substr(0,8);
                        var conversion_id = 'import-i-' + buffer.split('import-i-')[1].substr(0,8);
                        
                        // query to use if successful
                        qry = "UPDATE reclodb.recovery SET conversion_id = ?, " +
                          "instance_id = ?, recovery_state = ?, file_size = ? WHERE " +
                          "recovery_id = ?";
                          
                        params = [
                            conversion_id,
                            instance_id,
                            'importing',
                            file_size_in_bytes,
                            recovery_id
                        ];
                    }
                    
                    function updateRecoveryStateCallback(err,results) {
                        
                        if (err) {
                            console.log('Recovery management failed for task ' + recovery_id +
                                        ', there was an error connecting to the database');
                            
                            db.disconnect();
                            return;
                        }
                        
                        if (!failed) {
                            console.log('Importing instance ' + instance_id);   
                        }
                        db.disconnect();  
        
                    } // updateRecoveryStateCallback
                    db.query(qry,params,updateRecoveryStateCallback);
                    
                } // handle_close
                
                // run child process for ec2-import-instance
                var child = exec(cmd);
                child.stdout.on('data',handle_stdout);
                child.stderr.on('data',handle_stderr);
                child.on('close',handle_close);
                
            } // getAccessKeysCallback
            corelib.getAccessKeys(getAccessKeysCallback);
                        
        } // getRecoveryTasksCallback
        db.query(qry,params,startImportCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE IMPORTING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleImporting(recovery_id,conversion_id) {

    console.log('Handling IMPORTING recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get progress of import task
        var ec2 = new AWS.EC2();
        
        var params = {
          ConversionTaskIds: [
            conversion_id
          ]
        };
        
        function describeConversionTasksCallback(err,data) {
            
            if (err) {
                console.log('DescribeConversionTasks error: ' + err,err.stack);
                db.disconnect();
                return;
            }
            
            // update database with conversion progress
            var total_size = data.ConversionTasks[0].ImportInstance.Volumes[0].Image.Size;
            var status = data.ConversionTasks[0].ImportInstance.Volumes[0].Status; // as string
            
            if (status == 'completed') {
                
                // should never be anything but 'active' while in this state, but just in case
                var state_progress = 100;   
            }
            else { 
                  
                var status_message = data.ConversionTasks[0].ImportInstance.Volumes[0].StatusMessage;
                var bytes_imported = Number(status_message.split("Downloaded ")[1]); // convert to integer
                var state_progress = Math.floor((bytes_imported / total_size) * 100);
            }

            // query to run if importing is not yet finished
            var qry = "UPDATE reclodb.recovery SET state_progress = ? WHERE recovery_id = ?";
            var params = [state_progress,recovery_id];
                               
            if (state_progress == 100) {
                    
                // import completed, move on to converting
                var recovery_state = 'converting';
                var total_progress = progress.imported;
                var new_state_progress = 0;
                
                qry = "UPDATE reclodb.recovery SET state_progress = ?, recovery_state = ?, " +
                      "total_progress = ? WHERE recovery_id = ?";
                params = [new_state_progress, recovery_state, total_progress, recovery_id];
            }

            function updateImportProgressCallback(err,results) {
                
                if (err) {
                    console.log('Recovery management failed for task ' + recovery_id + 
                                ', there was an error connecting to the database');
                    
                    db.disconnect();
                    return;
                }
                
                console.log('Updated import progress for recovery ' + recovery_id);
                console.log('Total progress: ' + state_progress);
                
                db.disconnect();                   
                
            } // updateImportProgressCallback
            db.query(qry,params,updateImportProgressCallback);
            
        } // describeConversionTasksCallback            
        ec2.describeConversionTasks(params,describeConversionTasksCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE CONVERTING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleConverting(recovery_id,conversion_id) {

    console.log('Handling CONVERTING recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get progress of conversion task
        var ec2 = new AWS.EC2();
        
        var params = {
          ConversionTaskIds: [
            conversion_id
          ]
        };
        
        function describeConversionTasksCallback(err,data) {
            
            if (err) {
                console.log('DescribeConversionTasks error: ' + err,err.stack);
                db.disconnect();
                return;
            }
            
            var total_size = data.ConversionTasks[0].ImportInstance.Volumes[0].Image.Size;
            var conversion_state = data.ConversionTasks[0].State;

            if (conversion_state == 'completed') {
                
                // volume converted, move to next state
                var state_progress = 100;   
            }
            else {
                
                // check conversion progress
                var status_message = data.ConversionTasks[0].StatusMessage;
                
                if (status_message == 'Pending') {
                    
                    // converting import into AMI volume, check number of bytes converted
                    var bytes_converted = data.ConversionTasks[0].ImportInstance.Volumes[0].BytesConverted;
                    var state_progress = Math.floor((bytes_converted / total_size) * 50); // 50% of conversion process
                }
                else {
                    
                    // conversion into AMI volume complete, check conversion percentage
                    var percentage_converted = data.ConversionTasks[0].StatusMessage.split("Progress: ")[1];
                    percentage_converted = Number(percentage_converted.split('%')[0]);
                    var state_progress = Math.floor(percentage_converted / 2) + 50;          
                }
            } // if (conversion_state)
            
            // query to run if conversion is not yet finished
            var qry = "UPDATE reclodb.recovery SET state_progress = ? WHERE recovery_id = ?";
            var params = [state_progress,recovery_id];
                               
            if (state_progress == 100) {
                    
                // import completed, move on to converted
                var recovery_state = 'converted';
                var total_progress = progress.converted;
                var new_state_progress = 0;
                
                qry = "UPDATE reclodb.recovery SET state_progress = ?, recovery_state = ?, " +
                      "total_progress = ? WHERE recovery_id = ?";
                params = [new_state_progress, recovery_state, total_progress, recovery_id];
            }

            function updateImportProgressCallback(err,results) {
                
                if (err) {
                    console.log('Recovery management failed for task ' + recovery_id + 
                                ', there was an error connecting to the database');
                    
                    db.disconnect();
                    return;
                }
                
                console.log('Updated conversion progress for recovery ' + recovery_id);
                console.log('Total progress: ' + state_progress);
                
                db.disconnect();                   
                
            } // updateImportProgressCallback
            db.query(qry,params,updateImportProgressCallback);
            
        } // describeConversionTasksCallback            
        ec2.describeConversionTasks(params,describeConversionTasksCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE CONVERTED RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleConverted(recovery_id,conversion_id) {

    console.log('Handling CONVERTED recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get a list of current recovery tasks in progress
        var qry = 

        function Callback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + 
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            // attempt to start instance
            
        } // getRecoveryTasksCallback
        db.query(qry,getRecoveryTasksCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE FINISHING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleFinishing(user_id,recovery_id) {

    console.log('Handling FINISHING recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // get a list of current recovery tasks in progress
        var qry = 

        function Callback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + 
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            // do something polite here
            
        } // getRecoveryTasksCallback
        db.query(qry,getRecoveryTasksCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}
