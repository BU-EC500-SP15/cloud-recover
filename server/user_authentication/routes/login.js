var express = require('express');
var router = express.Router();
var corelib = require('../lib/core.js');
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var db = new AWS.DynamoDB();

/* GET users listing. */
router.post('/', function(req, res) {
  //res.send('respond with a resource');
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
      	"AttributeValueList" : [ {"S" :  email}],
      	 "ComparisonOperator" : "EQ",
      }
    }
  }

  db.query(params, function(err, data) {
    if (err) {
      console.log(err); // an error occurred
      //json response with error
      //res
      res.json({success:0, error:1, error_msg:"Password or Email Invalid"});
      } 
    else {
      console.log(data); // successful response
      //check has here
       var uuid = data.Items[0].user_id['S'];
       var hash = data.Items[0].hash['S'];
       var userStatus= data.Items[0].user_status['S'];


	      if(corelib.checkPasswordHash(hash, password) && userStatus == "A")
	      {
	      	loginUser(uuid, res);
	      }
	      else
	      {
	      	res.json({success:0, error:1, error_msg:"Password or Email Invalid"});
	      }
      }

  });
});


function loginUser(uuid, res)
{
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
						}
						else {
							// put successful, err is null
							res.json({success:1, error:0, user_id: uuid, token:token_id, date_created: timestamp });
							console.log('Logged in user Successful');

						}
					});
}

module.exports = router;
