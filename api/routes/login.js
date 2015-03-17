// ReClo: /login
// ----------------
// v2.0.1
// Carlton Duffett
// 3-8-2015

var express = require('express');
var corelib = require('../lib/core');
var router = express.Router();

/***************************************************************************************/
/* FUNCTION DEFINITIONS                                                                */
/***************************************************************************************/

var cb = function login(res,db,params) {

    // verify user in database
    function verifyUser(res,db,params) {

        // query database for user
        var qry = "SELECT * FROM reclodb.users WHERE email = ? AND user_status = 'A'";
        db.query(qry,[params.email],function(err,results){

            if (err) {
                console.log('verifyUser ' + err);
                res.status(500).json({error: 'There was an error connecting to the database'}); // MySQL error
                corelib.closeDBConnection(db);
            }
            else {
                if (results[0] == null) {
                    // user not found
                    console.log('Error: User not found');
                    res.status(500).json({error:'User not found'}); // User not found
                    corelib.closeDBConnection(db);
                }
                else {
                    var hash = results[0].hash;

                    // check that passwords match
                    if (corelib.checkPasswordHash(params.password,hash)){
                        // proceed with login
                        params.user_id = results[0].user_id;
                        checkUserLoginStatus(res,db,params);
                    }
                    else {
                        console.log('Error: Password does not match');
                        res.status(500).json({error:'Password does not match'}); // Password does not match
                        corelib.closeDBConnection(db);
                    }
                }
            }
        });
    }

    function checkUserLoginStatus(res,db,params) {

        // verify that user is not already logged in
        var qry = "SELECT token_id FROM reclodb.tokens WHERE user_id = ? AND token_status = 'A'";
        db.query(qry,[params.user_id],function(err,results){

            if (err) {
                console.log('loginUser ' + err);
                res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                corelib.closeDBConnection(db);
            }
            else {

                if (results[0] == null) {
                    // user not already logged in, okay to proceed
                    createToken(res,db,params);
                }
                else {
                    // user already logged in!
                    console.log('Error: User aleady logged in');
                    res.status(500).json({error:'User already logged in'});
                    corelib.closeDBConnection(db);
                }
            }
        });
    }

    function createToken(res,db,params) {

        // generate token, timestamp
        var token_id = corelib.createToken();
        var timestamp = corelib.createTimestamp();

        // add token to token table
        var post = {token_id: token_id, 
                    user_id: params.user_id,
                    date_created: timestamp,
                    token_status: 'A',
                };
        var qry = "INSERT INTO reclodb.tokens SET ?";
        db.query(qry,post,function(err,results){

            if (err) {
                console.log('loginUser ' + err);
                res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                corelib.closeDBConnection(db);
            }
            else {
                console.log('loginUser successful!');
                res.status(200).json({user_id: params.user_id, token: token_id, date_created: timestamp, message:'login successful'});

                // disconnect from database
                corelib.closeDBConnection(db);
            }
        });
    }

    // begin login process
    verifyUser(res,db,params);
};

/***************************************************************************************/
/* REQUEST HANDLING                                                                    */
/***************************************************************************************/

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

    if (allValid){
        // connect to database and begin login process
        var params = {'email': email, 'password': password};
        corelib.openDBConnection(res,cb,params);
    }
    else {
        var emsg = 'Invalid ';
        if (tests[0] == false) {
            console.log('Validation Error: invalid password. Must be 6 characters long with 1 number, 1 upper case and 1 lowercase letter.')
            emsg = emsg + 'password, ';
        }
        if (tests[1] == false) {
            console.log('Validation Error: invalid email.')
            emsg = emsg + 'email';
        }

        console.log('Validation Error: email or password of invalid format');
        res.status(500).json({error: emsg});
    }
});

module.exports = router;
