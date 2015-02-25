// ReClo Amazon DynamoDB core functions
// 2-25-2015

// Module dependencies
// ---------------------------------

// connect to AWS DynamoDB
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

// core library functions
var corelib = require('./core.js');

// Module functions
// ---------------------------------

module.exports = {

	createNewUser: function(username,email,password) {
		// queries the dynamoDB for the existence of an email address.
		// if email not found, creates a new user entry

		// check dynamoDB for existing user (by email)
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

		db.query(params, function(err, data) {
		    if (err) {
		      	// error occured, data is null
		      	console.log("Email Query Error: " + err);
		    }
		    else
		    {
		    	// query successful, err is null
		    	if (data.Count > 0) {
		     		console.log('Email found: ' + data.Items[0].email['S']); // email located
		     		console.log('putItem Unsuccessful');
				}
		     	else
		     	{
					// create GUID for new user
					var uuid = corelib.generateUUID();

					// hash user password for storage
					var hashed_password = corelib.hashPassword(password);

					// current timestamp
					var timestamp = new Date().toUTCString();

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
						}
						else {
							// put successful, err is null
							console.log('putItem Successful');
						}
					});
				}
			}
		});
	}, // createNewUser
};