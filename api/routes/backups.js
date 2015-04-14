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

            // get list of backups for given user
            var qry = "SELECT backup_id, file_size, file_name, date_created FROM reclodb.backups WHERE user_id = ? AND backup_status = 'A'";
            var params = [user_id];

            function getBackupsListCallback(err,results) {

                if (err) {
                    console.log('getBackupsList ' + err);
                    res.status(500).json({error: 301, message: 'Failed to obtain list of backups'}); // MySQL error
                    db.disconnect();
                    return;
                }

                if (results.length == 0) {
                    console.log('No backups found for user ' + user_id);
                    res.status(500).json({error: 302, message: 'No backups found'}); // MySQL error
                    db.disconnect();
                    return;
                }

                // backups is an array of objects with fields backup_id, size, date_created
                console.log(results.length + ' backups obtained for user ' + user_id);
                res.status(200).json({message: 'Backups obtained successfully', backups: results});
                db.disconnect();

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

            // get information for a single backup
            var qry = "SELECT backup_id, file_size, file_name, date_created FROM reclodb.backups WHERE user_id = ? AND backup_id = ? AND backup_status = 'A'";
            var params = [user_id,backup_id];

            function getBackupCallback(err,results) {

                if (err) {
                    console.log('getBackup ' + err);
                    res.status(500).json({error: 301, message: 'Failed to obtain backup'}); // MySQL error
                    db.disconnect();
                    return;
                }

                if (results.length == 0) {
                    console.log('No backup with id = ' + backup_id + ' found for user ' + user_id);
                    res.status(500).json({error: 302, message: 'No backup found'}); // MySQL error
                    db.disconnect();
                    return;
                }

                // backup is an object with fields backup_id, size, date_created
                console.log(results.length + ' backups obtained for user ' + user_id);
                res.status(200).json({message: 'Backup obtained successfully', backup: results});
                db.disconnect();

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
            res.status(500).json({error: 102, message: 'Invalid token.'});
            db.disconnect();
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
                res.status(500).json({error: 303, message: 'Unable to get temporary S3 credentials'});
                db.disconnect();
                return;
            }

            // prepare temporary credentials for client
            var credentials = data.Credentials;
            console.log('Obtained temporary credentials for user ' + user_id);

            // create new upload record in database
            function connectionCallback(err) {

                if (err) {
                    console.log('There was an error connecting to the database: ' + err);
                    res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
                    db.disconnect();
                    return;
                }

                var qry = 'INSERT INTO reclodb.uploads SET time_started = NOW(), ?';

                var params = {
                    'upload_id'         : upload_id,
                    'user_id'           : user_id,
                    'time_completed'    : '',
                    'upload_status'     : 'A',
                    'file_name'         : file_name,
                    'file_size'         : file_size,
                };

                function createUploadCallback(err,results) {

                    if (err) {
                        console.log('createUpload ' + err);
                        res.status(500).json({error: 101, message:'There was an error connecting to the database'}); // MySQL error
                        db.disconnect();
                        return;
                    }

                    console.log('Upload created');

                    res.status(200).json({
                        message     : 'Obtained temporary credentials. Credentials expire in 12 hours.',
                        upload_id   : upload_id,
                        credentials : credentials
                    });
                    db.disconnect();

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
    var token           = req.query.token;

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

            // get information for a single backup
            var qry = "UPDATE reclodb.uploads SET upload_status = ?, time_completed = NOW()"
                        + " WHERE upload_id = ?";

            var params = [upload_status,upload_id];

            function completeUploadCallback(err,results) {

                if (err) {
                    console.log('completeUpload ' + err);
                    res.status(500).json({error: 304, message: 'Failed to complete upload'}); // MySQL error
                    db.disconnect();
                    return;
                }

                if (results.length == 0) {
                    console.log('No upload with id = ' + upload_id + ' found');
                    res.status(500).json({error: 305, message: 'No upload found'}); // MySQL error
                    db.disconnect();
                    return;
                }

                console.log('completeUpload successful.');

                // get file_name and file_size from the uploads table
                var qry = "SELECT file_name, file_size FROM reclodb.uploads WHERE upload_id = ?";
                var params = [upload_id];

                function getBackupInfoCallback(err,results) {

                    if (err) {
                        console.log('getBackupInfo ' + err);
                        res.status(500).json({error: 306, message: 'Failed to get backup information'}); // MySQL error
                        db.disconnect();
                        return;
                    }

                    var file_name = results[0].file_name;
                    var file_size = results[0].file_size;

                    // add new backup to backups table if upload_status = 'S'
                    if (upload_status == 'S') {

                        var backup_id = corelib.createToken();

                        // backup upload was successful, create new backup entry
                        var qry = "INSERT INTO reclodb.backups SET date_created = NOW(), ?";

                        var params = {
                            'backup_id'     : backup_id,
                            'user_id'       : user_id,
                            'file_name'     : file_name,
                            'file_size'     : file_size,
                            'backup_status' : 'A',
                        };

                        function createBackupCallback(err,results) {

                            if (err) {
                                console.log('createBackup ' + err);
                                res.status(500).json({error: 101, message:'There was an error connecting to the database'}); // MySQL error
                                db.disconnect();
                                return;
                            }

                            console.log('Backup upload successful. File: ' + file_name);
                            res.status(200).json({message: 'Backup created'});
                            db.disconnect();

                        } // createBackupCallback
                        db.query(qry,params,createBackupCallback);
                    }
                    else {
                        // backup upload was unsuccessful
                        console.log('Backup upload confirmed failed. File: ' + file_name);
                        res.status(200).send({message: 'Backup upload confirmed failed'}); // no content
                        db.disconnect();
                    }
                } // getBackupInfoCallback
                db.query(qry,params,getBackupInfoCallback);

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

    var user_id     = req.params.user_id;
    var backup_id   = req.params.backup_id;
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

        // what DBConnection should do after connection is established
        function connectionCallback(err) {

            if (err) {
                console.log('There was an error connecting to the database: ' + err);
                res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
                db.disconnect();
                return;
            }

            // get filename (key) for backup to delete
            var qry = "SELECT file_name FROM reclodb.backups WHERE backup_id = ?";
            var params = [backup_id];

            function getFileKeyCallback(err,results) {

                if (err) {
                    console.log('getFileKey ' + err);
                    res.status(500).json({error: 308, message: 'Failed to obtain file_name. Cannot complete delete.'}); // MySQL error
                    db.disconnect();
                    return;
                }

                if (results.length == 0) {
                    console.log('No backup with id = ' + backup_id + ' found');
                    res.status(500).json({error: 309, message: 'No backup found'}); // MySQL error
                    db.disconnect();
                    return;
                }

                // use file_name to delete object in S3
                var s3 = new AWS.S3();
                var bucket = 'reclo-client-backups';
                var file_name = user_id + '/' + results[0].file_name;

                var params = {
                    Bucket  : bucket,
                    Key     : file_name
                };

                function deleteBackupCallback(err,data) {

                    if (err) {
                        console.log('deleteBackup Error: ' + err);
                        res.status(500).json({error: 310, message: 'Failed to delete backup'});
                        db.disconnect();
                        return;
                    }

                    console.log('deleteBackup successful.');
                    res.status(200).json({message: 'Delete backup successful'});
                    db.disconnect();
                }
                s3.deleteObject(params,deleteBackupCallback);
            }
            db.query(qry,params,getFileKeyCallback);

        }; // connectionCallback

        // Open MySQL database connection
        var db = new DBConnection();
        db.connect(connectionCallback.bind(db));

    } // validationCallback
    corelib.validateToken(token,validationCallback);
});

module.exports = router;
