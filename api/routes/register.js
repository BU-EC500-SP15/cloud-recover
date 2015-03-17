// ReClo: /register
// ----------------
// v2.0.1
// Carlton Duffett
// 3-7-2015

var express = require('express');
var corelib = require('../lib/core');
var router = express.Router();

/***************************************************************************************/
/* FUNCTION DEFINITIONS                                                                */
/***************************************************************************************/

var cb = function registerNewUser(res,db,params) {

    // check that user does not already exist
    function checkUserExistence(res,db,params) {

        var qry = "SELECT email FROM reclodb.users WHERE email = ? AND user_status = 'A'"
        db.query(qry,[params.email],function(err,results){

            if (err) {
                console.log('checkUserExistence ' + err);
                res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                corelib.closeDBConnection(db);
            }
            else {
                if (results[0] == null) {
                    // email not found, OK to create new user
                    insertNewUser(res,db,params);
                }
                else {
                    console.log('Error: User already exists');
                    res.status(500).json({error: 'User with that email aleady exists'}); // User already exists
                    corelib.closeDBConnection(db);
                }
            }
        });
    }

    // insert user into database
    function insertNewUser(res,db,params) {

        // create GUID for new user
        var uuid = corelib.generateUUID();

        // hash user password for storage
        var hashed_password = corelib.hashPassword(params.password);

        // current timestamp
        var timestamp = corelib.createTimestamp();

        // add new user to database
        var post = {user_id: uuid, 
                    username: params.username,
                    email: params.email,
                    hash: hashed_password,
                    date_created: timestamp,
                    user_status: 'A',
                };
        var qry = 'INSERT INTO reclodb.users SET ?';

        db.query(qry,post,function(err,results){

            if (err) {
                console.log('registerNewUser ' + err);
                res.status(500).json({error:'There was an error connecting to the database'}); // MySQL error
                corelib.closeDBConnection(db);
            }
            else {
                console.log('registerNewUser successful!');
                res.status(200).json({message:'New user created'});

                // disconnect from database
                corelib.closeDBConnection(db);
            }
        });
    }

    // begin registration process
    checkUserExistence(res,db,params);
};


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
        var params = {'username':username,'email':email,'password':password};
        corelib.openDBConnection(res,cb,params);

    }
    else {
        var emsg = 'Invalid ';
        if (tests[0] == false) {
            console.log('Validation Error: invalid username. Must be at least 5 characters.');
            emsg = emsg + 'username, ';
        }
        if (tests[1] == false) {
            console.log('Validation Error: invalid password. Must be 6 characters long with 1 number, 1 upper case and 1 lowercase letter.')
            emsg = emsg + 'password, ';
        }
        if (tests[2] == false) {
            console.log('Validation Error: invalid email.')
            emsg = emsg + 'email';
        }

        res.status(500).json({error: emsg}); // Error 2: invalid username, password, or email
    }
});

module.exports = router;
