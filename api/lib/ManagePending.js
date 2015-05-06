/* ReClo API: /lib/ManagePending.js
 * ---------------------------------
 * v1.0
 * Carlton Duffett
 * 5-2-2015
 *
 * Run Frequency: every minute
 *
 * Checks for pending recovery tasks and starts the download process.
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
console.log('Starting PENDING recovery management at ' + ts);

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
            console.log('No PENDING recovery tasks in-progress');
            return;
        }
        
        // update the progress and advance each recovery task
        for (i = 0; i < results.length; i++) {
            
            var this_state    = results[i].recovery_state;
            var user_id       = results[i].user_id;
            var recovery_id   = results[i].recovery_id;
            var backup_id     = results[i].backup_id;
            
            if (this_state == 'pending') {
                
                handlePending(recovery_id,user_id,backup_id);                                              
            } // if
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
            var file_name   = backups[0].file_name;
            
            var qry = "UPDATE reclodb.recovery SET no_downloads = ?, " +
                        "no_completed = 0, " + 
                        "recovery_state = 'downloading', " +
                        "total_progress = ?, " +
                        "file_name = ? " +
                        "WHERE recovery_id = ?";
            
            var params = [backups.length, progress.downloading, file_name, recovery_id];
            
            function startDownloadCallback(err,results) {
                
                if (err) {
                    console.log('Recovery management failed for task ' + recovery_id + 
                                ', there was an error connecting to the database');
                    
                    db.disconnect(); 
                    return;
                }               
                 
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
                    qry = "UPDATE reclodb.recovery SET date_completed = NOW(), " +
                          "recovery_state = 'failed' WHERE recovery_id = ?";
                              
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
} // handlePending
