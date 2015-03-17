/* ReClo API: /login/
 * ------------------
 * v3.0
 * Carlton Duffett
 * 3-17-2015
 */

var express = require('express');
var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');
var router = express.Router();

/*
 * API Call: POST /login/
 *
 * Req Params:  email, password
 *
 * Res Params:
 * -----------
 * On error:    error
 * On success:  user_id, token, date_created, message 
 *
 * Validates user with MySQL database, checks if user is already logged in,
 * then creates a new session token.
 */
router.post('/', function(req, res) {

    // process request
    var email = req.body.email;
    var password = req.body.password;

    // validate form information
    var tests = [];
    tests[0] = corelib.validatePassword(password);
    tests[1] = corelib.validateEmail(email);

    var allValid = true;

    for (i = 0; i < tests.length; i++){
        if (tests[i] == false){
            allValid = false;
            break;
        }
    }

    if (!allValid){

        var emsg = 'Invalid ';
        if (tests[0] == false) {
            console.log('Validation Error: invalid password format.')
            emsg = emsg + 'password format, ';
        }
        if (tests[1] == false) {
            console.log('Validation Error: invalid email format.')
            emsg = emsg + 'email format';
        }

        console.log('Validation Error: ' + emsg);
        res.status(500).json({error: emsg});
        return;
    }

    // what DBConnection should do in the event of a connection error
    function errCallback(err) {
        console.log('There was an error getting db password: ' + err);
        res.status(500).json({error: 'There was an error connecting to the database'});
    }; // errCallback

    // Open MySQL database connection
    var db = new DBConnection(errCallback);

    // verify user in database
    var qry = "SELECT * FROM reclodb.users WHERE email = ? AND user_status = 'A'";
    var params = [email];

    function verifyUserCallback(err,results) {

        if (err) {
            console.log('verifyUser ' + err);
            res.status(500).json({error: 'There was an error connecting to the database'}); // MySQL error
            return;
        }

        if (results[0] == null) {
            // user not found
            console.log('Error: User not found');
            res.status(500).json({error:'User not found'});
            return;
        }

        var hash = results[0].hash;

        // check that passwords match
        if (!corelib.checkPasswordHash(password,hash)){
            // Password does not match
            console.log('Error: Password does not match');
            res.status(500).json({error:'Password does not match'});
            return;
        }

        // check if user is already logged in
        var user_id = results[0].user_id;
        var qry = "SELECT token_id FROM reclodb.tokens WHERE user_id = ? AND token_status = 'A'";
        var params = [user_id];

        function checkLoginStatusCallback(err,results) {

            if (err) {
                console.log('checkLoginStatus ' + err);
                res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                return;
            }

            if (results[0] != null) {
                // user already logged in!
                console.log('Error: User aleady logged in');
                res.status(500).json({error:'User already logged in'});
                return;
            }

            // login user, add token to token table
            var qry = "INSERT INTO reclodb.tokens SET ?";

            var token_id = corelib.createToken();
            var timestamp = corelib.createTimestamp();

            var params = {
                'token_id'      : token_id, 
                'user_id'       : user_id,
                'date_created'  : timestamp,
                'token_status'  : 'A',
            };

            function createTokenCallback() {
                if (err) {
                    console.log('createToken' + err);
                    res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                    return;
                }

                console.log('Login successful');
                res.status(200).json({user_id: user_id, token: token_id, date_created: timestamp, message:'login successful'});

            }; // createTokenCallback
            db.query(qry,params,createTokenCallback);

        }; // checkLoginStatusCallback
        db.query(qry,params,checkLoginStatusCallback);

    }; // verifyUserCallback
    db.query(qry,params,verifyUserCallback);

}); // router

module.exports = router;
