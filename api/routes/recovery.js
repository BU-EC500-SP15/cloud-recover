/* ReClo API: /recovery/
 * ---------------------
 * v1.1
 * Carlton Duffett
 * 3-25-2015
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
 * C# Call:     reclo.startImport()
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error, message
 * On success:  message, conversion_id
 *
 * Starts a new AWS instance import task from a specified backup.
 * Returns the conversion id that can be polled to find when the conversion is complete.
 */

 router.post('/:user_id/:backup_id', function(req,res) {

var user_id     = req.params.user_id;
var backup_id   = req.params.backup_id;

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
    
    var qry = "SELECT file_name, file_size FROM reclodb.backups WHERE backup_id = ?";
    var params = [backup_id];
    
function getBackupCallback(err,results) {
    
    if (err) {
        console.log('There was an error connecting to the database: ' + err);
        res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
        db.disconnect();
        return;
    }
    
    var file_name = results[0].file_name;
    
    // connect to s3 and initiate download to temporary storage
    var path = '../tmp/' + user_id + '/' + file_name;
    var file = fs.createWriteStream(path);

    var s3 = new AWS.S3();               
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
    res.status(500).json({error: 408, message: 'Failed to prepare backup(s) for import'});
    db.disconnect();
}

function getObjectChunkHandler(chunk) {
    
    file.write(chunk);
    no_chunks++;
}

function getObjectDoneHandler(response) {
    
    console.log('Prepare completed with ' + no_chunks + ' chunks transferred');
    file.end();
    
    // get final file size
    var stats = fs.statSync(path);
    var file_size_in_bytes = stats["size"];
    
    // determine volume size (in 100GB increments, up to 2TB)
    var vol_size = 100; // defaulting to 100GB for now
    
    // get pre-signed URL for s3 manifest bucket
    var params = {
        Bucket : bucket,
        Key: key,
        Expires: 3600   // 1 hour
    }
    var url = s3.getSignedUrl('putObject',params);
    
    // get user data to include with new instance
    // Will need to read this from a local file that we maintain
    // as part of our repository
    var user_data = 'foo';
    
    // other parameters
    var zone    = 'us-west-2a';
    var subnet  = 'subnet-b4f42ed1';
    var group   = 'reclo-windows';
    
    // initiate ec2-import-instance
    var ec2 = new AWS.EC2();
    var params = {
        Platform: 'Windows',
        Description: 'Recovered instance for client ' + user_id,
        DiskImages: [
            {
              Image: {
                Bytes: file_size_in_bytes,
                Format: 'VHD',
                ImportManifestUrl: url
              },
              Volume: {
                Size: vol_size
              }
            }
          ],
          LaunchSpecification: {
            Architecture: 'x86_64',
            InstanceInitiatedShutdownBehavior: 'stop',
            InstanceType: 't2.micro',
            Placement: {
              AvailabilityZone: zone,
              GroupName: group
            },
            SubnetId: subnet,
            UserData: {
              Data: user_data
            }
          }
        };
        
function importInstanceCallback(err, data) {
    
    if (err) {
        console.log('importInstance Error: ' + err);
        res.status(500).json({error: 409, message: 'Failed to initate import-instance task'});
        db.disconnect();
        return;
    }
    
    var instance_id = data.ConversionTask.ImportInstance.InstanceId;
    var ip_address = '0.0.0.0'; // unknown until the instance is finished importing
    var instance_state = 'pending';
    var instance_name = 'reclo-' + file_name.split('.')[0]; // filename of backup without extension
    
    // log new conversion task
    var qry = "INSERT INTO reclodb.instances SET instance_id = ?, user_id = ?, date_created = NOW(), " +
              "instance_name = ?, ip_address = ?, availability_zone = ?, instance_state = ?, " +
              "date_last_stopped = NOW(), instance_status = 'A'";
    
    var params = [instance_id,
                  user_id,
                  instance_name,
                  ip_address,
                  availability_zone,
                  instance_state];
                  
function newInstanceCallback(err,results) {
    
    if (err) {
        console.log('There was an error connecting to the database: ' + err);
        res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
        db.disconnect();
        return;
    }
    
    console.log('New instance ' + instance_id + ' created');
    res.status(200).json({message: 'Import started successfully, new instance created',
                            instance_id: instance_id});
    db.disconnect();        
    
} // newInstanceCallback
db.query(qry,params,newInstanceCallback);
    
} // importInstanceCallback
ec2.importInstance(params,importInstanceCallback);
        
} // getObjectCallback
    
var request = s3.getObject(params);
request.on('error', getObjectErrorHandler);
request.on('httpData', getObjectChunkHandler);
request.on('httpDone', getObjectDoneHandler);
request.send();   
                            
} // getBackupCallback
db.query(qry,params,getBackupCallback);

}; // connectionCallback

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

}; // connectionCallback

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

}; // connectionCallback

// Open MySQL database connection
var db = new DBConnection();
db.connect(connectionCallback.bind(db));

} // validationCallback
corelib.validateToken(token,validationCallback);

});

module.exports = router;
