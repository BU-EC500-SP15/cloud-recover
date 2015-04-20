/* ReClo API: /recovery/
 * ---------------------
 * v2.0
 * Carlton Duffett
 * 4-19-2015
 */

var express = require('express');
var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var router = express.Router();
var fs = require('fs');

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

/*
 * API Call:    POST /recovery/:user_id/:backup_id?token=
 * C# Call:     reclo.getInstances()
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error, message
 * On success:  message, recovery_id, overall_progress, current_task, task_progress
 *
 * Initiates the recovery operation and begins download of backups from S3.
 */
 
router.post('/:user_id/:backup_id', function(req,res) {
   
    var user_id     = req.params.user_id;
    var backup_id   = req.params.backup_id;
    var token       = req.query.token;
    
    function validationCallback(err) {
        
        if (err) {
            console.log('Invalid token.');
            res.status(500).json({error: 102, message: 'Invalid token.'});
            db.disconnect();
            return;
        }      
          
    function connectionCallback(err) {
        
         if (err) {
            console.log('There was an error connecting to the database: ' + err);
            res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
            db.disconnect();
            return;
        }
        
        // get list of backups to download
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
                        "date_created BETWEEN @date_of_last_full AND @date_selected;";
                               
        var params = [backup_id,user_id];
            
    function getBackupListCallback(err,results) {

        if (err) {
            console.log('getBackupList ' + err);
            res.status(500).json({error: 408, message: 'Failed to obtain backups. Cannot start recovery.'}); // MySQL error
            db.disconnect();
            return;
        }
        
        backups = results[2]; // first 2 entries are results from 2x SET queries
        
        if (backups.length == 0) {
            console.log('No backups found');
            res.status(500).json({error: 409, message: 'No backups found. Cannot start recovery.'});
            db.disconnect();
            return;
        }
         
        // create new entry in recovery table
        var recovery_id = corelib.createToken();
        var no_downloads = 1; // just the full backup for now. otherwise use >> results.length;
        var no_completed = 0;
        
        var qry = "UPDATE reclodb.recovery SET date_started = NOW(), ?";
        var params = {
            recovery_id     :   recovery_id,
            user_id         :   user_id,
            total_progress  :   1,
            instance_state  :   'pending',
            recovery_state  :   'downloading',
            state_progress  :   1,
            no_downloads    :   no_downloads,
            no_completed    :   0,
            recovery_status :   'A' 
        }
        
    function createRecoveryCallback(err,results) {
        
        if (err) {
            console.log('createRecovery ' + err);
            res.status(500).json({error: 410, message: 'Failed to create recovery task'}); // MySQL error
            db.disconnect();
            return;
        }
        
        db.disconnect(); // release mysql database connection
        
        // start download tasks
        var s3 = new AWS.S3(); 

        var dir = '/backups-tmp/' + user_id + '/';
        
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
               
        // just download full backup for now
        var file_name = backups[0].file_name;  
        var path = '/backups-tmp/' + user_id + '/' + file_name;
        var stream = fs.createWriteStream(path);
        var bucket = 'reclo-client-backups';
        var key = user_id + '/' + file_name;
        var no_chunks = 0;

        var params = {
            Bucket  : bucket,
            Key     : key
        };
        
        console.log('Preparing backup ' + file_name + ' ...');        
       
        function getObjectErrorHandler(err,response) {
        
            console.log('prepareBackup Error: ' + err);
            console.log('download failed for file ' + file_name);
            stream.end();
            
            function connectionCallback(err) {
                
                if (err) {
                    console.log('There was an error connecting to the database: ' + err);
                    db.disconnect();
                    return;
                }
            
                var qry = "UPDATE reclodb.recovery SET " +
                          "recovery_state = 'failed' WHERE " +
                          "recovery_id = ?";
                
                var params = [recovery_id];                
                
            function failRecoveryCallback(err,results) {
                
                if (err) {
                    console.log('There was an error connecting to the database: ' + err);
                    db.disconnect();
                    return;
                }           
                         
                console.log('Recovery ' + recovery_id + ' failed. File ' + file_name + ' failed to download.');
                db.disconnect();
                
            } // failRecoveryCallback
            db.query(qry,params,failRecoveryCallback);
                
            } // connectionCallback
            
            // Open new MySQL database connection
            var db = new DBConnection();
            db.connect(connectionCallback.bind(db));
            
        } // getObjectErrorHandler

        function getObjectChunkHandler(chunk) {
            
            stream.write(chunk);
            no_chunks++;
            
        } // getObjectChunkHandler

        function getObjectDoneHandler(response) {
            
            console.log('Prepare ' + file_name + ' completed with ' + no_chunks + ' chunks transferred');
            stream.end();
            
            function connectionCallback(err) {
                
                if (err) {
                    console.log('There was an error connecting to the database: ' + err);
                    db.disconnect();
                    return;
                }
                
                no_completed++;
                
                var progress = (no_downloads / no_completed) * 100;
                
                var qry = "UPDATE reclodb.recovery SET " +
                          "no_completed = 1, " +
                          "state_progress = ? WHERE " +
                          "recovery_id = ?";
                
                var params = [progress,recovery_id];                
                
            function updateProgressCallback(err,results) {
                
                if (err) {
                    console.log('There was an error connecting to the database: ' + err);
                    db.disconnect();
                    return;
                }
                                   
                console.log('updated download progress for recovery_id: ' + recovery_id);
                db.disconnect();
                
            } // updateProgressCallback
            db.query(qry,params,updateProgressCallback);
                
            } // connectionCallback
        
            // Open MySQL database connection
            var db = new DBConnection();
            db.connect(connectionCallback.bind(db));
            
        } // getObjectDoneHandler
        
       
        var request = s3.getObject(params);
        request.on('error', getObjectErrorHandler);
        request.on('httpData', getObjectChunkHandler);
        request.on('httpDone', getObjectDoneHandler);
        request.send();
        
        res.status(200).json({message: 'Recovery process started',
                              recovery_id: recovery_id,
                              total_progress: 1,
                              current_state: 'downloading',
                              state_progress: 1
                            });
   
    } // createRecoveryCallback
    db.query(qry,params,createRecoveryCallback);
            
    } // getBackupListCallback 
    db.query(qry,params,getBackupListCallback);
                    
    } // connectionCallback

    // Open MySQL database connection
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));

    } // validationCallback
    corelib.validateToken(token,validationCallback);
 });

/*
 * API Call:    GET /recovery/:user_id?token=
 * C# Call:     reclo.getInstances()
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error, message
 * On success:  message, instances[instance_id, instance_name, ip_address, availability_zone, etc.]
 *
 * Returns information on active instance(s) for a given user.
 */

router.get('/:user_id', function(req,res) {

    var user_id = req.params.user_id;
    var token   = req.query.token;

    function validationCallback(err) {

        if (err) {
            console.log('Invalid token.');
            res.status(500).json({error: 102, message: 'Invalid token.'});
            db.disconnect();
            return;
        }

    // what DBConnection should do after connection is established
    function connectionCallback(err) {

        if (err) {
            console.log('There was an error connecting to the database: ' + err);
            res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
            db.disconnect();
            return;
        }

    // get information on all active (running) EC2 instances
    var qry = "SELECT * FROM reclodb.instances WHERE user_id = ? AND instance_status = 'A'";
    var params = [user_id];

    function getInstanceCallback(err,results) {

        if (err) {
            console.log('getInstance ' + err);
            res.status(500).json({error: 401, message: 'Failed to obtain instance information.'}); // MySQL error
            db.disconnect();
            return;
        }

        res.status(200).json({message:'Instances obtained successfully', instances: results[0]});
        db.disconnect();
    }
    db.query(qry,params,getInstanceCallback);

    } // connectionCallback

    // Open MySQL database connection
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));

    } // validationCallback
    corelib.validateToken(token,validationCallback);

});

/*
 * API Call:    DELETE /recovery/:instance_id?token=
 * C# Call:     reclo.stopInstance(id)
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error, message
 * On success:  message
 *
 * Stops a running EC2 instance once the backups are no longer needed.
 * Inactive instances are terminated after 2 weeks.
 */

router.delete('/:instance_id', function(req,res) {

    var instance_id = req.params.instance_id;
    var token       = req.query.token;

    function validationCallback(err) {

        if (err) {
            console.log('Invalid token.');
            res.status(500).json({error: 102, message: 'Invalid token.'});
            db.disconnect();
            return;
        }

    // what DBConnection should do after connection is established
    function connectionCallback(err) {

        if (err) {
            console.log('There was an error connecting to the database: ' + err);
            res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
            db.disconnect();
            return;
        }

        // check that instance is active
        var qry = "SELECT instance_state, instance_status FROM reclodb.instances " +
                  "WHERE instance_id = ?";

        var params = [instance_id];


    function checkInstanceStateCallback(err,results) {

        if (err) {
            console.log('Failed to obtain instance status for instance ' + instance_id);
            res.status(500).json({error: 404, message: 'Failed to obtain instance status'});
            db.disconnect();
            return;
        }

        if (results.length == 0) {
            console.log('Instance ' + instance_id + ' not found');
            res.status(500).json({error: 405, message: 'Instance ' + instance_id + ' not found'});
            db.disconnect();
            return;
        }

        if (results[0].instance_status == 'D') {
            console.log('Instance ' + instance_id + ' no longer active');
            res.status(500).json({error: 406, message: 'Instance ' + instance_id + ' no longer active'});
            db.disconnect();
            return;
        }

        if (results[0].instance_state == 'stopped') {
            console.log('Instance ' + instance_id + ' already stopped');
            res.status(500).json({error: 407, message: 'Instance ' + instance_id + ' already stopped'});
            db.disconnect();
            return;
        }

        // stop specified EC2 instance
        var ec2 = new AWS.EC2();

        var params = {
            InstanceIds: [
                instance_id,
            ]
        };

    function stopInstanceCallback(err,data) {

        if (err) {
            console.log('Failed to stop EC2 instance ' + instance_id);
            console.log('EC2 Error: ' + err);
            res.status(500).json({error: 402, message: 'Failed to stop instance'});
            db.disconnect();
            return;
        }

        var stopped_instance = data.StoppingInstances[0].InstanceId;

        // update instance records
        var qry = "UPDATE reclodb.instances SET instance_state = 'stopped', date_last_stopped = NOW() " +
                  "WHERE instance_id = ?";

        var params = [instance_id];

    function updateInstanceCallback(err,results) {

        if (err) {
            console.log('updateInstances ' + err);
            res.status(500).json({error: 403, message: 'Failed to update instance information'}); // MySQL error
            db.disconnect();
            return;
        }

        console.log('Instance ' + stopped_instance + ' stopped');
        res.status(200).json({message: 'Instance stopped'});
        db.disconnect();

    } // updateInstanceCallback
    db.query(qry,params,updateInstanceCallback);

    } // stopInstanceCallback
    ec2.stopInstances(params,stopInstanceCallback);

    } // checkInstanceStateCallback
    db.query(qry,params,checkInstanceStateCallback);

    } // connectionCallback

    // Open MySQL database connection
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));

    } // validationCallback
    corelib.validateToken(token,validationCallback);

});

module.exports = router;
