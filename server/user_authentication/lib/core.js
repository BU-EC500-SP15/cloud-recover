// reclo core functions
// 2-22-2015

// requirements
// ------------------------------
// connect to AWS DynamoDB
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

// phpass password hashing
var PasswordHash = require('phpass').PasswordHash;

// core functions
// ------------------------------

// NOTES:
// All dyanmoDB functions are prefixed with DDB

module.exports = {

	DDBsearchUserEmail: function(email) {
		// queries the dynamoDB for the existence of an email address.
		// returns:
		//  true if user with that email exists
		//  false if user does not exist yet
		//  null if error

		// check dynamoDB for existing user (by email)
		var params = {
			TableName: "users",
			IndexName: "email-index",
			KeyConditions: {
				"email": 
	            {
	                "AttributeValueList" : [
	                {
	                    "S" : email
	                }
	                ],
	                "ComparisonOperator" : "EQ"
	            }
			},

		};

		db.query(params, function(err, data) {
		    if (err) {
		      console.log(err); // an error occurred
		    }
		    else {
		      console.log('Email found.')
		  	}
		});
	},

	DDBcreateNewUser: function(username,email,password) {
		// creates a new dynamoDB entry in the users table.
		// returns:
		//  true if new entry succesfully created
		//  false if failed

		// create GUID for new user
		var uuid = this.generateUUID();

		// hash user password for storage
		var hashed_password = this.hashPassword(password);

		// current timestamp
		var timestamp = new Date().toUTCString();

		var params = {
			TableName: "users",
			Item: {

				"user_id": {
					"S": uuid
				},

				"email": {
					"S": email
				},

				"hash": {
					"S": hashed_password
				},

				"user_status": {
					"S": 'A' // active
				},

				"username": {
					"S": username
				},

				"date_created": {
					"S": timestamp
				},
			},
		};

		db.putItem(params, function(err, data) {

			if (err)
				console.log(err, err.stack); // an error occurred
			else
				console.log('Put successful.')
		});
	},

	generateUUID: function() {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
    	return uuid;
	},

	hashPassword: function(password) {
		// hashes a user password using an open-source hashing algorithm
		// returns:
		//  hash if hash was successful
		//  null if hash failed

		var passwordHash = new PasswordHash();
		var hash = passwordHash.hashPassword(password);
		var success = passwordHash.checkPassword(password,hash);

		if (success)
			return hash;
		else
			return null;
	},

	validateEmail: function(email) {
		// validates a provided email address using the RFC 2822 compliant regexp
    	var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    	return re.test(email);
	},

	validatePassword: function(password) {
		// validates a user password. Current criteria:
		// At least one number, one lowercase and one uppercase letter
		// At least 6 characters in length
    	var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    	return re.test(password);

	},

	validateUsername: function(username) {
		// Username must be at least 5 characters long
		if (username.length < 5)
			return false;
		return true;
	}
};