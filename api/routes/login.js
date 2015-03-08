// ReClo: /ua/login
// ----------------
// API Login Script
// v2.0.0
// Carlton Duffett
// 3-7-2015

var express = require('express');
var mysql = require('mysql');
var http = require('http');
var bl = require('bl');
var corelib = require('../lib/core');
var router = express.Router();

// Response Error Codes:
// --------------------
// 1 = System Error (MySQL query error, database connection error, etc.)
// 2 = User Error (invalid user credentials, user not found, etc.)

/***************************************************************************************/
/* FUNCTION DEFINITIONS                                                                */
/***************************************************************************************/

// connect to MySQL Database using user-data password
function openDBConnection(res,email,password) {
    
    // Amazon RDS host address
    var host = corelib.getMySQLHost().toString();
    var url = "http://169.254.169.254/latest/user-data";

    // get password securely
    http.get(url, function handleResponse(pwres){

        pwres.pipe(bl(function(err,data){

            if (err) {
                console.error('There was an error getting db password: ' + err);
                res.json({success: 0, error: 1, msg:'Failed to obtain database password'}); // Error 1: MySQL Error
                res.send();
            }
            else {
                var pw = data.toString().slice(5);

                // connect to ReClo databse
                var db = mysql.createConnection({
                    host     : host,
                    port     : '3306',
                    user     : 'reclo',
                    password : pw,
                    database : 'reclodb',
                });
                db.connect();

                // proceed with user verification
                verifyUser(res,db,email,password);
            }
        }));
    });
}

// verify user in database
function verifyUser(res,db,email,password) {

    // query database for user
    var qry = "SELECT * FROM reclodb.users WHERE email = ? AND user_status = 'A'";
    db.query(qry,[email],function(err,results){

        if (err) {
            console.log('verifyUser ' + err);
            res.json({success: 0, error: 1, msg:'MySQL verifyUser query failed'}); // Error 1: MySQL error
            res.send();
            closeDBConnection(db);
        }
        else {
            if (results[0] == null) {
                // user not found
                console.log('Error: User not found');
                res.json({success: 0, error: 2, msg:'User not found'}); // Error 2: User not found
                res.send();
                closeDBConnection(db);
            }
            else {
                var hash = results[0].hash;

                // check that passwords match
                if (corelib.checkPasswordHash(password,hash)){
                    // proceed with login
                    var user_id = results[0].user_id;
                    checkUserLoginStatus(res,db,user_id);
                }
                else {
                    console.log('Error: Password does not match');
                    res.json({success: 0, error: 2, msg:'Password does not match'}); // Error 2: Password does not match
                    res.send();
                    closeDBConnection(db);
                }
            }
        }
    });
}

function checkUserLoginStatus(res,db,user_id) {

    // verify that user is not already logged in
    var qry = "SELECT token_id FROM reclodb.tokens WHERE user_id = ? AND token_status = 'A'";
    db.query(qry,[user_id],function(err,results){

        if (err) {
            console.log('loginUser ' + err);
            res.json({success: 0, error: 1, msg:'MySQL loginUser query failed'}); // Error 1: MySQL error
            res.send();
            closeDBConnection(db);
        }
        else {

            if (results[0].token_id == null) {
                // user not already logged in, okay to proceed
                loginUser(res,db,user_id);
            }
            else {
                // user already logged in!
                console.log('Error: User aleady logged in');
                res.json({success: 0, error: 2, msg:'User already logged in'}); // Error 2: Password does not match
                res.send();
                closeDBConnection(db);
            }
        }
    });
}

function loginUser(res,db,user_id) {

    // generate token, timestamp
    var token_id = corelib.createToken();
    var timestamp = corelib.createTimestamp();

    // add token to token table
    var post = {token_id: token_id, 
                user_id: user_id,
                date_created: timestamp,
                token_status: 'A',
            };
    var qry = "INSERT INTO reclodb.tokens SET ?";
    db.query(qry,post,function(err,results){

        if (err) {
            console.log('loginUser ' + err);
            res.json({success: 0, error: 1, msg:'MySQL loginUser query failed'}); // Error 1: MySQL error
            res.send();
            closeDBConnection(db);
        }
        else {
            console.log('loginUser successful!');
            res.json({success: 1, error: 0, user_id: user_id, token: token_id, date_created: timestamp, msg:'login successful'});
            res.send();

            // disconnect from database
            closeDBConnection(db);
        }
    });
}

// close database connection after success
function closeDBConnection(db) {
    db.end();
}

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
        openDBConnection(res,email,password);
    }
    else {
        console.log('Validation Error: email or password of invalid format');
        res.json({success: 0, error: 2, msg:'Invalid email or password'});
        res.send();
    }
});

module.exports = router;
