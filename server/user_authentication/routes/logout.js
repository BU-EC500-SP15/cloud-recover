// ReClo: user_authentication
// --------------------------
// API Logout Script
// v1.0.0
// Carlton Duffett
// 2-25-2015

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

	// query database to check if token already exists
	var params = {
        TableName : 'tokens',
        KeyConditions : { 
            "token_id" : {
            "AttributeValueList" : [ 
                {"S" :  token}
                ],
            "ComparisonOperator" : "EQ",
            }
        }
    }

	// query DynamoDB for desired token
    db.query(params, function(err, data) {
        if (err) {
            console.log('Query Error: ' + err); // an error occurred
            res.json({success:0, error:1, msg:"query Error: token not found"});
            res.send();
      	}
      	else {
      		if (data.Count > 0) {
      			// token exists and okay to deactivate
      			deactivateToken(token,res);
      		}
      	}
    });
});


// change token_status to disabled 'D'
function deactivateToken(token,res) {

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
  			res.json({success: 0, error: 1, msg:"updateItem Error: token deactivation failed"}); // Error 1: table update failed
  			res.send();
  		}
  		else {
  			console.log('updateItem successful: token disabled'); // successful response
  			res.json({success: 1, error: 0, msg:'logout successful: token disabled'});
  			res.send();
  		}
	});
}

module.exports = router;
