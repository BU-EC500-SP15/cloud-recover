// ReClo: /ua/logout
// -----------------
// API Logout Script
// v2.0.0
// Carlton Duffett
// 3-8-2015

var express = require('express');
var mysql = require('mysql');
var http = require('http');
var bl = require('bl');
var corelib = require('../lib/core.js');
var router = express.Router();

// Response Error Codes:
// --------------------
// 1 = System Error (MySQL query error, database connection error, etc.)
// 2 = User Error (invalid user credentials, user not found, etc.)

/***************************************************************************************/
/* FUNCTION DEFINITIONS                                                                */
/***************************************************************************************/

// connect to MySQL Database using user-data password
function openDBConnection(res,token) {
    
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
                deactivateToken(res,db,token);
            }
        }));
    });
}

// change token_status to disabled 'D'
function deactivateToken(res,db,token) {

    var timestamp = corelib.createTimestamp();
    var qry = "UPDATE reclodb.tokens SET token_status = 'D', date_deactivated = ? WHERE token_id = ?";

    db.query(qry,[timestamp,token],function(err,results){

        if (err) {
            console.log('deactivateToken ' + err);
            res.json({success: 0, error: 1, msg:'MySQL deactivateToken query failed'}); // Error 1: MySQL error
            res.send();
            closeDBConnection(db);
        }
        else {
            console.log('logoutUser successful!');
            res.json({success: 1, error: 0, msg:'logout successful'});
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
    var token = req.body.token;

    // invalidate token in Token table
    openDBConnection(res,token);
});

module.exports = router;
