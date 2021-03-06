/* ReClo API: /logout/
 * -------------------
 * v3.2
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
    function connectionCallback(err) {

        if (err) {
            console.log('There was an error connecting to the database: ' + err);
            res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
            db.disconnect();
            return;
        }

        // invalidate token in Token table
        var qry = "UPDATE reclodb.tokens SET token_status = 'D', date_deactivated = NOW() WHERE token_id = ?";
        var params = [token];

        function queryCallback(err,results) {

            if (err) {
                console.log('deactivateToken ' + err);
                res.status(500).json({error: 211, message: 'Failed to deactivate session token'}); // MySQL error
                db.disconnect();
                return;
            }

            console.log('Logout successful');
            res.status(200).json({message: 'Logout successful'});
            db.disconnect();

        }; // queryCallback
        db.query(qry,params,queryCallback);

    }; // connectionCallback

    // Open MySQL database connection
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));

}); // router

module.exports = router;
