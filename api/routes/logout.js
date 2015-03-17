/* ReClo API: /logout/
 * -------------------
 * v3.0
 * Carlton Duffett
 * 3-17-2015
 */

var express = require('express');
var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var router = express.Router();

/*
 * API Call: POST /logout/
 *
 * Req Params:  token
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  message 
 *
 * Deactivates the provided token, ending the user's session.
 */
router.post('/', function(req, res) {

    // process request
    var token = req.body.token;

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {

        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    };

    // Open MySQL database connection
    var db = new DBConnection(errCallback);

    // invalidate token in Token table
    var timestamp = corelib.createTimestamp();
    var qry = "UPDATE reclodb.tokens SET token_status = 'D', date_deactivated = ? WHERE token_id = ?";
    var params = [timestamp, token];

    function queryCallback(err,results) {

        if (err) {
            console.log('deactivateToken ' + err);
            res.status(500).json({error: 'Failed to deactivate session token'}); // MySQL error
            return;
        }

        console.log('Logout successful');
        res.status(200).json({message: 'Logout successful'});
    
    }; // queryCallback
    db.query(qry,params,queryCallback);

}); // router

module.exports = router;
