/* ReClo API: /lib/FinishRecovery.js
 * ---------------------------------
 * v1.0
 * Carlton Duffett
 * 5-2-2015
 *
 * Run Frequency: once per minute
 *
 * Regularly scans the recovery database and manages recovery tasks that are finished.
 * Optionally, you can configure EC2 instance settings here before handing them over
 * to the user.
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
            
            if (this_state == 'finishing') { 
                        
                handleFinishing(user_id,recovery_id,instance_id);              
            } // if
        } // for
    } // getRecoveryTasksCallback
    db.query(qry,getRecoveryTasksCallback);
}
var db = new DBConnection();
db.connect(connectionCallback.bind(db));

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
        
        // optionally adjust instance attributes here
        
        // move to finished
        var qry = "UPDATE reclodb.recovery SET recovery_state = ?, total_progress = ?, " + 
                  "date_completed = NOW(), instance_state = ? WHERE recovery_id = ?";
        
        var params = [
            'finished',
            progress.finished,
            'running',
            recovery_id
        ];

        function finishRecoveryCallback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + 
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            console.log('Recovery finished for recovery ' + recovery_id);
            db.disconnect();
            
        } // getRecoveryTasksCallback
        db.query(qry,params,finishRecoveryCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}
