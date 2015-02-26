var express = require('express');
var router = express.Router();
var corelib = require('../lib/core.js');

// connect to AWS DynamoDB
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

/* Logout user and invalidate token */
router.post('/', function(req, res) {

	// process request
	var token = req.body.token;

	// invalidate token in Token table

	// updateItem parameters
	var params = {
			TableName: "tokens",
			Key:{
				token_id:{"S": token}
			},
			AttributeUpdates: {
				token_status:{
					Value:{"S": 'D'}
				}
			}
		};

	db.updateItem(params, function(err, data) {
  		if (err) {
  			console.log('updateItem Error: ' + err); // an error occurred
  			res.json({success: 0, error: 1}); // Error 1: table update failed
  			res.send();
  		}
  		else {
  			console.log('updateItem successful: token disabled'); // successful response
  			res.json({success: 1, error: 0});
  			res.send();
  		}
	});
});

module.exports = router;
