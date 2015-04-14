/* ReClo API: /register/
 * ---------------------
 * v3.2
 * Carlton Duffett
 * 3-17-2015
 */

var express = require('express');
var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var router = express.Router();

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

/*
 * API Call: POST /register/
 *
 * Req Params:  username, email, password
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message
 *
 * Validates provided username, email, and password, then
 * creates a new entry in the user database. Also creates
 * a new folder in the reclo-client-backups bucket to hold
 * the user's backups. This folder has the same name as the
 * user's GUID.
 */
router.post('/', function(req,res) {

    var username = req.body.username;
    var password = req.body.password;
    var email    = req.body.email;

    // validate form information
    var tests = [];
    tests[0] = corelib.validateUsername(username);
    tests[1] = corelib.validatePassword(password);
    tests[2] = corelib.validateEmail(email);

    var allValid = true;

    for (i = 0; i < tests.length; i++){
        if (tests[i] == false){
            allValid = false;
            break;
        }
    }

    if (!allValid) {

        var error = 0;
        var emsg = 'Invalid ';
        if (tests[0] == false) {
            error = 202;
            emsg = emsg + 'username, ';
        }
        if (tests[1] == false) {
            error = 203;
            emsg = emsg + 'password, ';
        }
        if (tests[2] == false) {
            error = 204;
            emsg = emsg + 'email';
        }
        console.log('Validation Error: ' + emsg);
        res.status(500).json({error: error, message: emsg});
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

        // check that user does not already exist
        var qry = "SELECT email FROM reclodb.users WHERE email = ? AND user_status = 'A'"
        var params = [email];

        function checkUserExistenceCallback(err,results) {

            if (err) {
                console.log('checkUserExistence ' + err);
                res.status(500).json({error: 101, message:'There was an error connecting to the database'}); // MySQL error
                db.disconnect();
                return;
            }

            if (results.length != 0) {
                // user already exists with that email address
                console.log('Error: User already exists');
                res.status(500).json({error: 201, message: 'User with that email aleady exists'}); // User already exists
                db.disconnect();
                return;
            }

            // insert new user into the database
            var qry = 'INSERT INTO reclodb.users SET date_created = NOW(), ?';

            var user_id = corelib.generateUUID();
            var hashed_password = corelib.hashPassword(password);

            var params = {
                'user_id'       : user_id,
                'username'      : username,
                'email'         : email,
                'hash'          : hashed_password,
                'user_status'   : 'A',
            };

            function registerUserCallback(err,results) {

                if (err) {
                    console.log('registerUser ' + err);
                    res.status(500).json({error: 101, message:'There was an error connecting to the database'}); // MySQL error
                    db.disconnect();
                    return;
                }

                console.log('registerUser successful!');

                // create new directory in S3 reclo-client-backups bucket
                var bucket = 'reclo-client-backups/' + user_id + '/';
                var params = {
                    Bucket: bucket,
                };
                var s3 = new AWS.S3();

                function createBucketCallback(err,data) {

                    if (err) {
                        console.log('createBucket Error: ' + err);
                        res.status(500).json({error: 205, message: 'New user created. Failed to create S3 bucket.'});
                        db.disconnect();
                        return;
                    }
                    console.log('Bucket created for user ' + user_id);
                    res.status(200).json({message:'New user created. S3 Bucket provisioned'});
                    db.disconnect();

                };// createBucketCallback
                s3.createBucket(params,createBucketCallback);

            }; // registerUserCallback
            db.query(qry,params,registerUserCallback);

        }; // checkUserExistenceCallback
        db.query(qry,params,checkUserExistenceCallback);

    }; // connectionCallback

    // Open MySQL database connection
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));

}); // router

module.exports = router;
