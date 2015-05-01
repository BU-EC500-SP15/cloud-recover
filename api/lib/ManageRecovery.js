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
 * IMPORTED     - (55%) sucessfully imported into EC2, ready to start conversion
 * CONVERTING   - ( - ) in-progress conversion from VHD to EC2 AMI instance (started automatically)
 * CONVERTED    - (90%) conversion task finished (determined by successfully attempting to start instance)
 * FINISHING    - ( - ) starting new instance
 * FINISHED     - (100) new instance started, recovery process complete
 * FAILED       - ( - ) recovery failed at some point during the download/import/conversion process
 * -------------------------------------------------------------------------------------------------
 */

var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var fs = require('fs');

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

var ts = corelib.createTimestamp();
console.log('Starting recovery management at ' + ts);

// current progress percentage weights
var progress = {downloading: 10,
                downloaded: 35,
                imported: 55,
                converted: 90,
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
    var qry = "SELECT recovery_id, user_id, backup_id, recovery_state FROM reclodb.recovery WHERE " +
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
            
            var this_state  = results[i].recovery_state;
            var user_id     = results[i].user_id;
            var recovery_id = results[i].recovery_id;
            var backup_id   = results[i].backup_id;
            
            switch (this_state) {
                
                case 'pending':
                    handlePending(user_id,recovery_id,backup_id);
                    break;               
                                
                case 'downloading':
                    handleDownloading(recovery_id);
                    break;               
                                
                case 'downloaded':
                    handleDownloaded(recovery_id);
                    break;               
                    
                case 'importing':
                    handleImporting(user_id,recovery_id);
                    break;               
                                
                case 'imported':
                    handleImported(user_id,recovery_id);
                    break;               
                                
                case 'converting':
                    handleConverting(user_id,recovery_id);
                    break;               
                                
                case 'converted':
                    handleConverted(user_id,recovery_id);
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
function handlePending(user_id,recovery_id,backup_id) {

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
                
                // download full backup
                console.log('Downloading file ' + backups[0].file_name);
                
                var dir = '/backups-tmp/' + user_id + '/';

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                
                // backups download to separate volume mounted on our server 
                var file_name   = backups[0].file_name;
                var path        = '/backups-tmp/' + user_id + '/' + file_name;  
                var stream      = fs.createWriteStream(path);     
                var bucket      = 'reclo-client-backups';
                var key         = user_id + '/' + file_name;
                
                var download = {
                    path        : path,
                    stream      : stream,
                    file_name   : file_name,
                    no_chunks   : 0
                }
                
                var params = {
                    Bucket  : bucket,
                    Key     : key
                };
        
                var s3 = new AWS.S3();

                function getObjectErrorHandler(err,response) {
                        
                    console.log('prepareBackup Error: ' + err);
                    console.log('download failed for file ' + download.file_name);
                    download.stream.end();
                    
                    // update database to indicate failure
                    var qry = "UPDATE reclodb.recovery SET recovery_state = 'failed' " +
                              "WHERE recovery_id = ?"; 
                                      
                    var params = [recovery_id];
                    
                    function failRecoveryCallback(err,results) {
                        
                        db.disconnect();
                        
                        if (err) {
                            console.log('Recovery management failed for task ' + recovery_id + 
                                        ', there was an error connecting to the database');
                            console.log('Management failed while setting recovery ' + recovery_id + ' to FAILED.');
                            return;
                        }                             
                    } // failRecoveryCallback        
                    db.query(qry,params,failRecoveryCallback); 
                                    
                } // getObjectErrorHandler

                function getObjectChunkHandler(chunk) {
                    
                    download.stream.write(chunk);
                    download.no_chunks++;
                    process.stdout.write("Downloaded " + download.no_chunks + " chunks\r");
                          
                } // getObjectChunkHandler

                function getObjectDoneHandler(response) {
                    
                    console.log('Prepare of ' + download.file_name + 
                                ' completed with ' + download.no_chunks + 
                                ' chunks transferred');  
                                              
                    download.stream.end();
                    
                    // update database, all downloads completed
                    var qry = "UPDATE reclodb.recovery SET no_completed = 1, " +
                                "state_progress = 100 " + // 100% complete
                                "WHERE recovery_id = ?"; 
                                                 
                    var params = [recovery_id];
                    
                    function completeDownloadCallback(err,results) {
                        
                        db.disconnect();
                        
                        if (err) {
                            console.log('Recovery management failed for task ' + recovery_id + 
                                        ', there was an error connecting to the database');
                            console.log('Management failed while setting recovery ' + recovery_id + ' to DOWNLOADED.');
                            return;
                        }                    
                    } // completeDownloadCallback
                    db.query(qry,params,completeDownloadCallback); 
                                                                       
                } // getObjectDoneHandler
                
                // start download from s3
                var request = s3.getObject(params);
                request.on('error', getObjectErrorHandler);
                request.on('httpData', getObjectChunkHandler);
                request.on('httpDone', getObjectDoneHandler);
                request.send();
            }  
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
                    
                    console.log('Download complete for recovery ' + recovery_id);
                    db.disconnect();
                                   
                } // updateDownloadingProgress
                db.query(qry,params,completeDownloadCallback);
            }
            else {
                
                console.log('Download still in-progress.');
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
function handleDownloaded(recovery_id) {

    console.log('Handling DOWNLOADED recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + ', Unable to connect to the database');
            db.disconnect();
            return;
        }
        
        // get a list of current recovery tasks in progress
        var qry = "UPDATE reclodb.recovery SET recovery_state = 'merging', state WHERE recovery_id = ?";
        var params = [recovery_id];

        function startImportCallback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + ', there was an error connecting to the database');
                return;
            }
            
            // begin import task here
            var import_task = 'foo';
            
            
        } // getRecoveryTasksCallback
        db.query(qry,params,startImportCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE MERGING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
/*function handleMerging(user_id,recovery_id) {

    console.log('Handling MERGING recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + ', Unable to connect to the database');
            db.disconnect();
            return;
        }
        
        // get a list of current recovery tasks in progress
        var qry = 

        function Callback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + ', there was an error connecting to the database');
                return;
            }
            
            // do something here
            
        } // getRecoveryTasksCallback
        db.query(qry,getRecoveryTasksCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE MERGED RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
/*function handleMerged(user_id,recovery_id) {

    console.log('Handling MERGED recovery task ' + recovery_id);

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
            
            // do something here
            
        } // getRecoveryTasksCallback
        db.query(qry,getRecoveryTasksCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}

/* -------------------------------------------------------------------------------------------------
 * HANDLE IMPORTING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleImporting(user_id,recovery_id) {

    console.log('Handling IMPORTING recovery task ' + recovery_id);

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

/* -------------------------------------------------------------------------------------------------
 * HANDLE IMPORTED RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleImported(user_id,recovery_id) {

    console.log('Handling IMPORTED recovery task ' + recovery_id);

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

/* -------------------------------------------------------------------------------------------------
 * HANDLE CONVERTING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleConverting(user_id,recovery_id) {

    console.log('Handling CONVERTING recovery task ' + recovery_id);

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

/* -------------------------------------------------------------------------------------------------
 * HANDLE CONVERTED RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleConverted(user_id,recovery_id) {

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
            
            // do something polite here
            
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
