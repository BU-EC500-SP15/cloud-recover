/* ReClo API: /backups/
 * --------------------
 * v1.0
 * Carlton Duffett
 * Konstantino Sparakis
 * 3-17-2015
 */

var express = require('express');
var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var router = express.Router();

/*
 * API Call: GET /backups/:user_id/
 *
 * Req Params:  token
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message, backups[backup_id,size,date_created]
 *
 * Returns a list of backups for user with user_id. User must
 * provide an active session token.
 */
router.get('/:user_id', function(req, res) {

    var user_id = req.params.user_id;

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {
        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    }; // errCallback

    // Open MySQL database connection
    var db = new DBConnection(errCallback);
});

/*
 * API Call: GET /backups/:user_id/:backup_id
 *
 * Req Params:  token
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

    var user_id = req.params.user_id;
    var backup_id = req.params.backup_id;

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {
        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    }; // errCallback

    // Open MySQL database connection
    var db = new DBConnection(errCallback);

});

/*
 * API Call: POST /backups/:user_id/:backup_id
 *
 * Req Params:  token, url
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message backups[backup_id,size,date_created]
 *
 * Creates a new backup in S3 and a new entry in the database.
 * User must provide an active session token and a url to the location
 * of the backup on their local file system. Returns information
 * on the backup if successful.
 */
router.post('/:user_id/:backup_id', function(req, res) {

    var user_id = req.params.user_id;
    var backup_id = req.params.backup_id;

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {
        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    }; // errCallback

    // Open MySQL database connection
    var db = new DBConnection(errCallback);
});

/*
 * API Call: PUT /backups/:user_id/:backup_id
 *
 * Req Params:  token, url
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message backups[backup_id,size,date_created]
 *
 * Updates a backup record in the database. Used when a backup
 * changes location on the user's local file system. Returns
 * updated information on the backup if successful. User must
 * provide an active session token.
 */
router.put('/:user_id/:backup_id', function(req,res) {

    var user_id = req.params.user_id;
    var backup_id = req.params.backup_id;

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {
        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    }; // errCallback

    // Open MySQL database connection
    var db = new DBConnection(errCallback);
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
 * Deletes a backup record in the database. This sets the 
 * backup_status = 'D'. User must provide an active session token.
 */
router.delete('/:user_id/:backup_id', function(req,res) {

    var user_id = req.params.user_id;
    var backup_id = req.params.backup_id;

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {
        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    }; // errCallback

    // Open MySQL database connection
    var db = new DBConnection(errCallback);	
});

module.exports = router;