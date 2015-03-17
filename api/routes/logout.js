// ReClo: /logout
// -----------------
// v2.0.1
// Carlton Duffett
// 3-8-2015

var express = require('express');
var corelib = require('../lib/core.js');
var router = express.Router();

/***************************************************************************************/
/* FUNCTION DEFINITIONS                                                                */
/***************************************************************************************/

var cb = function logout(res,db,params) {

    // change token_status to disabled 'D'
    var timestamp = corelib.createTimestamp();
    var qry = "UPDATE reclodb.tokens SET token_status = 'D', date_deactivated = ? WHERE token_id = ?";

    db.query(qry,[timestamp,params.token],function(err,results){

        if (err) {
            console.log('deactivateToken ' + err);
            res.status(500).json({error: 'Failed to deactivate session token'}); // MySQL error
            closeDBConnection(db);
        }
        else {
            console.log('logoutUser successful!');
            res.status(200).json({message: 'Logout successful'});

            // disconnect from database
            corelib.closeDBConnection(db);
        }
    });
}

/***************************************************************************************/
/* REQUEST HANDLING                                                                    */
/***************************************************************************************/

router.post('/', function(req, res) {

    // process request
    var token = req.body.token;

    // invalidate token in Token table
    var params = {'token': token};
    corelib.openDBConnection(res,cb,params);
});

module.exports = router;
