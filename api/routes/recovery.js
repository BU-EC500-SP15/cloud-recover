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

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';


/*
 * API Call:    POST /recovery/:user_id/:backup_id?token=
 * C# Call:     reclo.startInstance()
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error, message
 * On success:  message, instance[instance_id, instance_name, ip_address, availability_zone, etc.]
 *
 * Starts a new AWS instance from a specified backup. Returs the IP
 * address of the new instance if startup was successful.
 */

 router.post('/:user_id/:backup_id', function(req,res) {

    var user_id     = req.params.user_id;
    var backup_id   = req.params.backup_id;

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
                console.log('There was an error getting db password: ' + err);
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
                console.log('There was an error getting db password: ' + err);
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
