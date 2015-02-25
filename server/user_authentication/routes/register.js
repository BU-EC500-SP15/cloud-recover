var express = require('express');
var router = express.Router();

// connect to AWS DynamoDB
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

/* New user creation */
router.get('/', function(req, res, next) {
  
	// process request and validate fields

	/* These will need to be parsed from the http request */
	var username = 'cduffett';
	var pw = 'abc123';
	var email = 'cduffett@example.com';

	tests[0] = validateUsername(username);
	tests[1] = validatePassword(pw);
	tests[2] = validateEmail(email);

	var allValid = true;

	for (i = 0; i < tests.length; i++){
		if (tests[i] == false){
			allValid = false;
			break;
		}
	}

	if (allValid){
		var alreadyExists = corelib.DDBsearchUserEmail(email);
		if (alreadyExists)
			console.error('User already exists')
		else
			console.log('Create a new one!')
	} // if



  	res.send();
});

module.exports = router;
