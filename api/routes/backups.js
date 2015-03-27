/* ReClo API: /backups/
 * --------------------
 * v1.1
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
 * API Call:    GET /backups/:user_id?token=
 * C# Call:     reclo.getBackupList(user_id,token)
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message, backups: [backup_id,size,date_created]
 *
 * Returns a list of backups for user with user_id. User must
 * provide an active session token.
 */
router.get('/:user_id', function(req, res) {

    var user_id = req.params.user_id;
    var token   = req.query.token;

    // what to do after token validation
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

            // get list of backups for given user
            var qry = "SELECT backup_id, file_size, file_name, date_created FROM reclodb.backups WHERE user_id = ? AND backup_status = 'A'";
            var params = [user_id];

            function getBackupsListCallback(err,results) {

                if (err) {
                    console.log('getBackupsList ' + err);
                    res.status(500).json({error: 'Failed to obtain list of backups'}); // MySQL error
                    return;
                }

                if (results.length == 0) {
                    console.log('No backups found for user ' + user_id);
                    res.status(500).json({error: 'No backups found'}); // MySQL error
                    return;
                }

                // backups is an array of objects with fields backup_id, size, date_created
                console.log(results.length + ' backups obtained for user ' + user_id);
                res.status(200).json({message: 'Backups obtained successfully', backups: results});

            }; // getBackupsListCallback
            db.query(qry,params,getBackupsListCallback);

        }; // connectionCallback

        // Open MySQL database connection
        var db = new DBConnection();
        db.connect(connectionCallback.bind(db));

    }; // validationCallback
    corelib.validateToken(token,validationCallback);
});


/*
 * API Call:    GET /backups/:user_id/:backup_id?token=
 * C# Call:     reclo.getBackupList(user_id,backup_id,token)
 *
 * Req Params:
 * -----------
 * Url query:   token
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message, backups[backup_id,size,date_created]
 *
 * Returns a single backup backup_id for user with user_id.
 * User must provide an active session token.
 */
router.get('/:user_id/:backup_id', function(req,res) {

    var user_id     = req.params.user_id;
    var backup_id   = req.params.backup_id;
    var token       = req.query.token;

    // what to do after token validation
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

            // get information for a single backup
            var qry = "SELECT backup_id, file_size, file_name, date_created FROM reclodb.backups WHERE user_id = ? AND backup_id = ? AND backup_status = 'A'";
            var params = [user_id,backup_id];

            function getBackupCallback(err,results) {

                if (err) {
                    console.log('getBackup ' + err);
                    res.status(500).json({error: 'Failed to obtain backup'}); // MySQL error
                    return;
                }

                if (results.length == 0) {
                    console.log('No backup with id = ' + backup_id + ' found for user ' + user_id);
                    res.status(500).json({error: 'No backup found'}); // MySQL error
                    return;
                }

                // backup is an object with fields backup_id, size, date_created
                console.log(results.length + ' backups obtained for user ' + user_id);
                res.status(200).json({message: 'Backup obtained successfully', backup: results});

            }; // getBackupCallback
            db.query(qry,params,getBackupCallback);

        }; // connectionCallback

        // Open MySQL database connection
        var db = new DBConnection();
        db.connect(connectionCallback.bind(db));

    }; // validationCallback
    corelib.validateToken(token,validationCallback);
});


/*
 * API Call:    POST /backups/uploads/:user_id?token=
 * C# Call:     reclo.startUpload(user_id,token)
 *
 * Req Params:
 * -----------
 * Url query:   token
 * Body:        file_name, file_size
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message, credentials{AccessKeyId, SecretAccessKey, SessionToken, Expiration}
 *
 * Returns temporary AWS credentials for the client to use when
 * initiating a multipart upload to S3. These credentials will
 * valid for 12 hours.
 */
 router.post('/uploads/:user_id', function(req,res) {

    var user_id     = req.params.user_id;
    var file_name   = req.body.file_name;
    var file_size   = req.body.file_size;
    var token       = req.query.token;

    function validationCallback(err) {

        if (err) {
            console.log('Invalid token.');
            res.status(500).json({error: 'Invalid token.'});
            return;
        }

        // connect to Security Token Service
        var sts = new AWS.STS();

        // allow client access only to its S3 bucket
        var policy = {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Action": [
                    "s3:*"
                  ],
                  "Resource": [
                    "arn:aws:s3:::reclo-client-backups/" + user_id + '/*'
                  ]
                },
              ]
            };

        // use random token for unique upload_id
        var upload_id = corelib.createToken();

        var params = {
            Name:               upload_id,
            DurationSeconds:    43200, // 12 hours
            Policy:             JSON.stringify(policy),
        };

        function getFedTokenCallback(err,data) {

            if (err) {
                console.log('getFedToken Error: ' + err);
                res.status(500).json({error: 'Unable to get temporary S3 credentials'});
                return;
            }

            // prepare temporary credentials for client
            var credentials = data.Credentials;
            console.log('Obtained temporary credentials for user ' + user_id);

            // create new upload record in database
            function connectionCallback(err) {

                if (err) {
                    console.log('There was an error getting db password: ' + err);
                    res.status(500).json({error: 'There was an error connecting to the database'});
                    return;
                }

                var qry = 'INSERT INTO reclodb.uploads SET ?';

                var timestamp = corelib.createTimestamp();

                var params = {
                    'upload_id'         : upload_id,
                    'user_id'           : user_id,
                    'time_started'      : timestamp,
                    'time_completed'    : '',
                    'upload_status'     : 'A',
                    'file_name'         : file_name,
                    'file_size'         : file_size,
                };

                function createUploadCallback(err,results) {

                    if (err) {
                        console.log('createUpload ' + err);
                        res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                        return;
                    }

                    console.log('Upload created');

                    res.status(200).json({
                        message     : 'Obtained temporary credentials. Credentials expire in 12 hours.',
                        upload_id   : upload_id,
                        credentials : credentials
                    });

                } // createUploadCallback
                db.query(qry,params,createUploadCallback);

            }; // connectionCallback

            // Open MySQL database connection
            var db = new DBConnection();
            db.connect(connectionCallback.bind(db));

        } // getFedTokenCallback
        sts.getFederationToken(params,getFedTokenCallback);

    } // validationCallback
    corelib.validateToken(token,validationCallback);

 });


/*
 * API Call:    PUT /backups/uploads/:user_id?token=
 * C# Call:     reclo.completeUpload(user_id,token,status)
 *
 * Req Params:
 * -----------
 * Url query:   token
 * Body:        upload_status
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message
 *
 * Updates the upload_status to either 'S' for successful
 * or 'F' for failed. Calling completeUpload concludes the
 * upload process for the given file.
 */

router.put('/uploads/:user_id/:upload_id', function(req, res) {

    var user_id         = req.params.user_id;
    var upload_id       = req.params.upload_id;
    var upload_status   = req.body.upload_status;
    var file_name       = req.body.file_name;
    var file_size       = req.body.file_size;
    var token           = req.query.token;

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

            // get information for a single backup
            var qry = "UPDATE reclodb.uploads SET upload_status = ?, time_completed = ?"
                        + " WHERE upload_id = ?";

            var time_completed = corelib.createTimestamp();
            var params = [upload_status,time_completed,upload_id];

            function completeUploadCallback(err,results) {

                if (err) {
                    console.log('completeUpload ' + err);
                    res.status(500).json({error: 'Failed to complete upload'}); // MySQL error
                    return;
                }

                if (results.length == 0) {
                    console.log('No upload with id = ' + upload_id + ' found');
                    res.status(500).json({error: 'No upload found'}); // MySQL error
                    return;
                }

                console.log('completeUpload successful.');

                // add new backup to backups table if upload_status = 'S'
                if (upload_status == 'S') {

                    // backup upload was successful, create new backup entry
                    var qry = "INSERT INTO reclodb.backups SET ?";

                    var backup_id = corelib.createToken();
                    var timestamp = corelib.createTimestamp();

                    var params = {
                        'backup_id'     : backup_id,
                        'user_id'       : user_id,
                        'file_name'     : file_name,
                        'file_size'     : file_size,
                        'date_created'  : timestamp,
                        'backup_status' : 'A',
                    };

                    function createBackupCallback(err,results) {

                        if (err) {
                            console.log('createBackup ' + err);
                            res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                            return;
                        }

                        console.log('Backup upload successful. File: ' + file_name);
                        res.status(200).json({message: 'Backup created'});

                    } // createBackupCallback
                    db.query(qry,params,createBackupCallback);

                }
                else {

                    // backup upload was unsuccessful
                    console.log('Backup upload failed. File: ' + file_name);
                    res.status(204).send(); // 204, no content
                }

            }; // completeUploadCallback
            db.query(qry,params,completeUploadCallback);

        }; // connectionCallback

        // Open MySQL database connection
        var db = new DBConnection();
        db.connect(connectionCallback.bind(db));

    } // validationCallback
    corelib.validateToken(token,validationCallback);

});


/*
 * API Call: DELETE /backups/:user_id/:backup_id
 *
 * Req Params:  token
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message
 *
 * Deletes a backup record in the database. Deletes backup in S3.
 * This sets the backup_status = 'D'. User must provide an active session token.
 */
router.delete('/:user_id/:backup_id', function(req,res) {

    var user_id = req.params.user_id;
    var backup_id = req.params.backup_id;

});

module.exports = router;
