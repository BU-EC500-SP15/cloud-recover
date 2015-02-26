// ReClo: user_authentication
// --------------------------
// API Login Script
// v1.0.0
// Konstantino Sparakis
// 2-25-2015

var express = require('express');
var router = express.Router();
var corelib = require('../lib/core.js');

// connect to AWS DynamoDB
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

/* Login user and return session token */
router.post('/', function(req, res) {

    // process request
    var email = req.body.email;
    var password = req.body.password;

    var params = {
        TableName : 'users',
        IndexName: "email-index",
        AttributesToGet: [
            "user_id",
            "hash", 
            "user_status"
            ],
        KeyConditions : { 
            "email" : {
            "AttributeValueList" : [ 
                {"S" :  email}
                ],
            "ComparisonOperator" : "EQ",
            }
        }
    }

    // query DynamoDB for user email and password
    db.query(params, function(err, data) {
        if (err) {
            console.log('Query Error: ' + err); // an error occurred
            res.json({success:0, error:1, error_msg:"Password or Email Invalid"});
            res.send();
        } 
        else {

            // user exists
            if (data.Count > 0) {

                //check that password matches hash
                var uuid = data.Items[0].user_id['S'];
                var hash = data.Items[0].hash['S'];
                var userStatus= data.Items[0].user_status['S'];


                if(corelib.checkPasswordHash(hash, password) && userStatus == "A")
                {
                    loginUser(uuid, res);
                }
                else
                {
                    var err_msg = '';

                    if (userStatus != "A")
                        err_msg = 'Authentication Error: user inactive.';
                    else
                        err_msg = 'Authentication Error: password invalid.';

                    console.log(err_msg);
                    res.json({success:0, error:1, error_msg:err_msg});
                    res.send()
                }
            }
            else {
                console.log('Authentication Error: user does not exist');
                res.json({success:0, error:1,error_msg:'Authentication Error: user does not exist'});
            }
        }// if (err)
    });
});

// login user and return session token
function loginUser(uuid, res) {

    //generate token
    var token_id = corelib.createToken();
    var timestamp = corelib.createTimestamp();

    var params = {
        TableName: "tokens",
        Item: {
            "token_id": {"S": token_id},
            "token_status": {"S": "A"},
            "user_id": {"S": uuid},
            "date_created": {"S": timestamp}
        },
    };

    db.putItem(params, function(err, data) {

        if (err) {
            // put failed, data is null
            console.log('putItem Error: ' + err + ', ' + err.stack);
            res.json({success:0, error:2, error_msg:"failed inserting token"});
            res.send();
        }
        else {
            // put successful, err is null
            console.log('putItem Successful: user logged in');
            res.json({success:1, error:0, user_id: uuid, token:token_id, date_created: timestamp });
            res.send();
        }
    });
}

module.exports = router;
