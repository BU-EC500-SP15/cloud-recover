/* ReClo API: /login/
 * ------------------
 * v3.2
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
 * On success:  user_id, token, message
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

    if (!allValid) {

        var emsg = 'Invalid ';
        var error = 0;
        if (tests[0] == false) {
            console.log('Validation Error: invalid password format.');
            error = 209;
            emsg = emsg + 'password format, ';
        }
        if (tests[1] == false) {
            console.log('Validation Error: invalid email format.');
            error = 208;
            emsg = emsg + 'email format';
        }

        console.log('Validation Error: ' + emsg);
        res.status(500).json({error: error, message: emsg});
        return;
    }

    // what DBConnection should do in the event of a connection error
    function connectionCallback(err) {

        if (err) {
            console.log('There was an error getting db password: ' + err);
            res.status(500).json({error: 101, message: 'There was an error connecting to the database'});
            db.disconnect();
            return;
        }

        // verify user in database
        var qry = "SELECT * FROM reclodb.users WHERE email = ? AND user_status = 'A'";
        var params = [email];

        function verifyUserCallback(err,results) {

            if (err) {
                console.log('verifyUser ' + err);
                res.status(500).json({error: 101, message: 'There was an error connecting to the database'}); // MySQL error
                db.disconnect();
                return;
            }

            if (results.length == 0) {
                // user not found
                console.log('Error: User not found');
                res.status(500).json({error: 206, message:'User not found'});
                db.disconnect();
                return;
            }

            var hash = results[0].hash;

            // check that passwords match
            if (!corelib.checkPasswordHash(password,hash)){
                // Password does not match
                console.log('Error: Password does not match');
                res.status(500).json({error: 207, message:'Password does not match'});
                db.disconnect();
                return;
            }

            // check if user is already logged in
            var user_id = results[0].user_id;
            var qry = "SELECT token_id FROM reclodb.tokens WHERE user_id = ? AND token_status = 'A'";
            var params = [user_id];

            function checkLoginStatusCallback(err,results) {

                if (err) {
                    console.log('checkLoginStatus ' + err);
                    res.status(500).json({error: 101, message:'There was an error connecting to the database'}); // MySQL error
                    db.disconnect();
                    return;
                }

                var already_logged_in = false;
                if (results.length != 0) {
                    // user already logged in!
                    already_logged_in = true;
                    var old_token = results[0].token_id;
                    console.log('User aleady logged in. Generating new token.');
                }

                // login user, add token to token table
                var qry = "INSERT INTO reclodb.tokens SET date_created = NOW(), ?";

                var token_id = corelib.createToken();

                var params = {
                    'token_id'      : token_id,
                    'user_id'       : user_id,
                    'token_status'  : 'A',
                };

                function createTokenCallback() {

                    if (err) {
                        console.log('createToken' + err);
                        res.status(500).json({error: 101, message:'There was an error connecting to the database'}); // MySQL error
                        db.disconnect();
                        return;
                    }

                    console.log('Login successful');

                    if (already_logged_in) {

                        // invalidate old token in Token table
                        var qry = "UPDATE reclodb.tokens SET token_status = 'D', date_deactivated = NOW() WHERE token_id = ?";
                        var params = [old_token];

                        function invalidateTokenCallback(err,results) {

                            if (err) {
                                console.log('deactivateToken ' + err);
                                res.status(500).json({error: 211, message: 'Failed to deactivate session token'}); // MySQL error
                                db.disconnect();
                                return;
                            }

                            console.log('Old token deactivated');
                            res.status(200).json({user_id: user_id, token: token_id, message:'login successful'});
                            db.disconnect();

                        }; // queryCallback
                        db.query(qry,params,invalidateTokenCallback);
                    }
                    else {
                        res.status(200).json({user_id: user_id, token: token_id, message:'login successful'});
                        db.disconnect();
                    }

                }; // createTokenCallback
                db.query(qry,params,createTokenCallback);

            }; // checkLoginStatusCallback
            db.query(qry,params,checkLoginStatusCallback);

        }; // verifyUserCallback
        db.query(qry,params,verifyUserCallback);

    }; // connectionCallback

    // Open MySQL database connection
    var db = new DBConnection();
    db.connect(connectionCallback.bind(db));

}); // router

module.exports = router;
