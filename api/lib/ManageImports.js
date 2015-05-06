/* ReClo API: /lib/ManageImports.js
 * ---------------------------------
 * v1.0
 * Carlton Duffett
 * 5-2-2015
 *
 * Run Frequency: once per minute
 *
 * Regularly scans the recovery database and manages imports that are in-progress.
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
console.log('Starting IMPORTS recovery management at ' + ts);

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
            console.log('No IMPORTING recovery tasks in-progress');
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
                                  
                case 'importing':
                    handleImporting(recovery_id,conversion_id);
                    break;                          
                                
                case 'converting':
                    handleConverting(recovery_id,conversion_id);
                    break;               
                                
                case 'converted':
                    handleConverted(recovery_id,user_id,instance_id);
                    break;               
                                             
            } // switch
        } // for
    } // getRecoveryTasksCallback
    db.query(qry,getRecoveryTasksCallback);
}
var db = new DBConnection();
db.connect(connectionCallback.bind(db));
 
 /* -------------------------------------------------------------------------------------------------
 * HANDLE IMPORTING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function handleImporting(recovery_id,conversion_id) {

    console.log('Handling IMPORTING recovery task ' + recovery_id);

    if (conversion_id == 'tbd') {
        console.log('Import initializing. Cannot query progress yet');
        return;
    }

    // importing initialized, ready to monitor progress
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
function handleConverted(recovery_id,user_id,instance_id) {

    console.log('Handling CONVERTED recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // attempt to start new instance
        var ec2 = new AWS.EC2();

        var params = {
          InstanceIds: [
            instance_id,
          ]
        };
        
        function startInstanceCallback(err,data) {
            
            if (err) {
                
                console.log('Instance ' + instance_id + ' not ready');
                db.disconnect();
                return;
            }
            
            // instance started successfully, move to finishing state
            if (data.StartingInstances[0].CurrentState.Code == 0) { // pending == 0
                console.log('Starting instance ' + instance_id);
                
                // update database
                var qry = "UPDATE reclodb.recovery SET recovery_state = ?, instance_state = ? " +
                          "WHERE recovery_id = ?; " +
                          "INSERT INTO reclodb.instances SET instance_id = ?, user_id = ?, " +
                          "date_created = NOW(), ip_address = '0.0.0.0', availability_zone = ?, " + 
                          "instance_name = 'client-1', instance_state = ?, instance_status = 'A'";
                          
                var params = [
                    'finishing', // query 1
                    'running',
                    recovery_id,
                    instance_id, // query 2
                    user_id,
                    'us-west-2',
                    'running'
                ];
                
                function updateRecoveryStateCallback(err,results) {
                    
                    if (err) {
                        console.log('Recovery management failed for task ' + recovery_id + 
                                    ', there was an error connecting to the database');
                        
                        db.disconnect();
                        return;
                    }                   
                    
                    console.log('Moved recovery ' + recovery_id + ' to FINISHING state');
                    db.disconnect();
                    
                } // updateRecoveryStateCallback
                db.query(qry,params,updateRecoveryStateCallback);
                
            } // if
            else { 
                
                console.log('Instance ' + instance_id + ' is already running.');
                db.disconnect();
            }
            
        } // startInstanceCallback 
        ec2.startInstances(params,startInstanceCallback);
    }   
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}
