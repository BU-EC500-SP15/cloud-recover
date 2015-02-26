// ReClo: user_authentication
// --------------------------
// API User Registration Script
// v1.0.0
// Carlton Duffett
// 2-25-2015

var express = require('express');
var corelib = require('../lib/core');
var router = express.Router();

// connect to AWS DynamoDB
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

/* New user creation */
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
		// query the dynamoDB for the existence of an email address.
		// if email not found, create a new user entry

		// query parameters
		var params = {
			TableName: "users",
			IndexName: "email-index",
			KeyConditions: {
				"email": 
	            {
	                "AttributeValueList" : [
	                	{"S" : email}
	                ],
	                "ComparisonOperator" : "EQ"
	            }
			},
		};

		// query database
		db.query(params, function(err, data) {
		    if (err) {
		      	// error occured, data is null
		      	console.log("Query Error: " + err);
		      	res.json({success: 0, error: 1}); // Error 1: dynamoDB error
		      	res.send();
		    }
		    else
		    {
		    	// query successful, err is null
		    	if (data.Count > 0) {
		     		console.log('Email found: ' + data.Items[0].email['S']); // email located
		     		console.log('putItem failed: user already exists!');
		     		res.json({success: 0, error: 2}); // Error 2: user already exists
		     		res.send();
				}
		     	else
		     	{
		     		// no user defined with provided email. OK to create new user.
		     		createNewUser(email,username,password);
				}
			} // if (err)
		});
	} // if (allValid)
	else
	{
		if (tests[0] == false)
			console.log('Validation Error: invalid username. Must be at least 5 characters.');
		if (tests[1] == false)
			console.log('Validation Error: invalid password. Must be 6 characters long with 1 number, 1 upper case and 1 lowercase letter.')
		if (tests[2] == false)
			console.log('Validation Error: invalid email.')

		res.json({success: 0, error: 3}); // Error 3: invalid username, password, or email
		res.send();
	}
});

// Create a new user entry in the DynamoDB users table
function createNewUser(email,username,password) {

	// create GUID for new user
	var uuid = corelib.generateUUID();

	// hash user password for storage
	var hashed_password = corelib.hashPassword(password);

	// current timestamp
	var timestamp = corelib.createToken();

	var params = {
		TableName: "users",
		Item: {

			"user_id": {"S": uuid},

			"email": {"S": email},

			"hash": {"S": hashed_password},

			"user_status": {"S": 'A'}, // active by default

			"username": {"S": username},

			"date_created": {"S": timestamp},
		},
	};

	db.putItem(params, function(err, data) {

		if (err) {
			// put failed, data is null
			console.log('putItem Error: ' + err + ', ' + err.stack);
			res.json({success: 0, error: 1}); // Error 1: dynamoDB error
				res.send();
		}
		else {
			// put successful, err is null
			console.log('putItem Successful: user created!');
			res.json({success: 1, error: 0}); // User creation successful
			res.send();
		}
	});
}

module.exports = router;
