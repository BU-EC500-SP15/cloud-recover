/* ReClo API: /recovery/
 * ---------------------
 * v1.0
 * Carlton Duffett
 * 3-25-2015
 */

var express = require('express');
var DBConnection = require('../lib/LOCALDBConnection.js');
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
 * On error:    error
 * On success:  message, ip
 *
 * Starts a new AWS instance from a specified backup. Returs the IP
 * address of the new instance if startup was successful.
 */

 router.post('/:user_id/:backup_id', function(req,res) {

    var user_id = req.params.user_id;
    var backup_id = req.params.backup_id;

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
 * On error:    error
 * On success:  message, instances[instance_id, instance_name, ip_address, availability_zone, instance_state]
 *
 * Returns information on running instance(s) for a given user.
 */

 router.get('/:user_id', function(req,res) {

    var user_id = req.params.user_id;
    var token   = req.query.token;

    function validationCallback(err) {

        if (err) {
            console.log('Invalid token.');
            res.status(500).json({error: 'Invalid token.'});
            return;
        }

        // what DBConnection should do after connection is established
        function connectionCallback(err) {

            if (err) {
                console.log('There was an error getting db password: ' + err);
                res.status(500).json({error: 'There was an error connecting to the database'});
                return;
            }

            // get information on all active EC2 instances
            var qry = "SELECT * FROM reclodb.instances WHERE user_id = ? AND ";
            var params = [backup_id];

            function getFileKeyCallback(err,results) {

                if (err) {
                    console.log('getFileKey ' + err);
                    res.status(500).json({error: 'Failed to obtain file_name. Cannot complete delete.'}); // MySQL error
                    return;
                }

            }
            db.query(qry,params,getFileKeyCallback);

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
 * On error:    error
 * On success:  message
 *
 * Stops a running EC2 instance once the backups are no longer needed.
 */

 router.delete('/:instance_id', function(req,res) {

    var instance_id = req.params.instance_id;

 });

