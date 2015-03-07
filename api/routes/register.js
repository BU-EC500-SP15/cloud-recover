// ReClo: /ua/register
// ----------------------------
// API User Registration Script
// v2.0.0
// Carlton Duffett
// 3-7-2015

var express = require('express');
var mysql = require('mysql');
var http = require('http');
var bl = require('bl');
var corelib = require('../lib/core');
var router = express.Router();

/***************************************************************************************/
/* FUNCTION DEFINITIONS                                                                */
/***************************************************************************************/

// connect to MySQL Database using meta-data password
function openDBConnection(res,username,email,password) {
    
    // Amazon RDS host address
    var host = corelib.getMySQLHost().toString();
    var url = "http://169.254.169.254/latest/user-data";

    // get password securely
    http.get(url, function handleResponse(pwres){

        pwres.pipe(bl(function(err,data){

            if (err) {
                console.error('There was an error getting db password: ' + err);
                res.json({success: 0, error: 1, msg:'Failed to obtain database password'});
                res.send();
            }
            else {
                var pw = data.toString().slice(5);

                // connect to ReClo databse
                var db = mysql.createConnection({
                    host     : host,
                    user     : 'reclo',
                    password : pw,
                    database: 'reclodb',
                });
                db.connect();

                // proceed with user registration
                checkUserExistence(res,db,username,email,password);
            }
        }));
    });
}

// check that user does not already exist
function checkUserExistence(res,db,username,email,password) {
    var qry = "SELECT email FROM reclodb.users WHERE email = ? AND user_status = 'A'"
    db.query(qry,[email],function(err,results){

        if (err) {
            console.log('checkUserExistence ' + err);
            res.json({success: 0, error: 1, msg:'MySQL checkUserExistence query failed'}); // Error 1: MySQL error
            res.send();
        }
        else {
            if (results[0] == null) {
                // email not found, OK to create new user
                registerNewUser(res,db,username,email,password);
            }
            else {
                console.log('Error: User already exists');
                res.json({success: 0, error: 2, msg:'User with that email aleady exists'}); // Error 2: User already exists
                res.send();
            }
        }
    });
}

// register user
function registerNewUser(res,db,username,email,password) {

    // create GUID for new user
    var uuid = corelib.generateUUID();

    // hash user password for storage
    var hashed_password = corelib.hashPassword(password);

    // current timestamp
    var timestamp = corelib.createTimestamp();

    // add new user to database
    var post = {user_id: uuid, 
                username: username,
                email: email,
                hash: hashed_password,
                date_created: timestamp,
                user_status: 'A',
            };
    var qry = 'INSERT INTO reclodb.users SET ?';

    db.query(qry,post,function(err,results){

        if (err) {
            console.log('registerNewUser ' + err);
            res.json({success: 0, error: 1, msg:'MySQL registerNewUser query failed'}); // Error 1: MySQL error
            res.send();
        }
        else {
            console.log('registerNewUser successful!');
            res.json({success: 1, error: 0, msg:'New user created'}); // Error 0: No error
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

router.post('/', function(req,res) {
  
    // process request and validate fields
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    
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

    if (allValid) {
        // connect to database and begin registration process
        openDBConnection(res,username,email,password);

    }
    else {
        if (tests[0] == false)
            console.log('Validation Error: invalid username. Must be at least 5 characters.');
        if (tests[1] == false)
            console.log('Validation Error: invalid password. Must be 6 characters long with 1 number, 1 upper case and 1 lowercase letter.')
        if (tests[2] == false)
            console.log('Validation Error: invalid email.')

        res.json({success: 0, error: 3, msg:'Invalid username, password, or email'}); // Error 3: invalid username, password, or email
        res.send();
    }
});

module.exports = router;
