/* ReClo API: /lib/FailRecovery.js
 * ---------------------------------
 * v1.0
 * Carlton Duffett
 * 5-2-2015
 *
 * Run Frequency: once per day
 *
 * Fails recovery tasks after 24 hours if they are not yet complete.
 *
 */
 
var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

var ts = corelib.createTimestamp();
console.log('Starting Failure Management at ' + ts);

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
    var qry = "SELECT recovery_id FROM reclodb.recovery WHERE " +
              "DATEDIFF(NOW(),date_started) > 1 AND recovery_status = 'A' " + 
              "AND recovery_state != 'finished' AND recovery_state != 'failed'";

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
            
            var recovery_id   = results[i].recovery_id;
            failRecovery(recovery_id);
        } // for
    } // getRecoveryTasksCallback
    db.query(qry,getRecoveryTasksCallback);
}
var db = new DBConnection();
db.connect(connectionCallback.bind(db));

/* -------------------------------------------------------------------------------------------------
 * FAIL LONG-RUNNING RECOVERY TASKS
 * -------------------------------------------------------------------------------------------------
 */
function failRecovery(recovery_id) {

    console.log('FAILING recovery task ' + recovery_id);

    function connectionCallback(err) {

        if (err) {
            console.log('Recovery management failed for task ' + recovery_id + 
                        ', Unable to connect to the database');
            
            db.disconnect();
            return;
        }
        
        // move to failed
        var qry = "UPDATE reclodb.recovery SET recovery_state = ?, " + 
                  "date_completed = NOW() WHERE recovery_id = ?";
        
        var params = [
            'failed',
            recovery_id
        ];

        function failRecoveryCallback(err,results) {
        
            if (err) {
                console.log('Recovery management failed for task ' + recovery_id + 
                            ', there was an error connecting to the database');
                
                db.disconnect();
                return;
            }
            
            console.log('Recovery failed for recovery ' + recovery_id);
            db.disconnect();
            
        } // getRecoveryTasksCallback
        db.query(qry,params,failRecoveryCallback);
    }
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));
}
