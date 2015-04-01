/* ReClo API: Core Functions
 * -------------------------
 * v2.1
 * Carlton Duffett
 * Konstantino Sparakis
 * 3-17-2015
 */

var DBConnection = require('./DBConnection.js');
var bcrypt = require('bcrypt-nodejs'); // hashing

module.exports.validateToken = function(token,validationCallback) {

    function checkForActiveToken(err) {

        if (err) {
            console.log('checkForActiveToken ' + err); // MySQL error
            return;
        }

        // check if user-provided token is valid (active)
        var qry = 'SELECT id FROM reclodb.tokens WHERE token_id = ?';
        var params = [token];

        function queryCallback(err,results) {

            if (err) {
                console.log('validateToken ' + err); // MySQL error
                validationCallback(1);
                return;
            }

            if (results[0] == null) {
                console.log('Invalid token');
                validationCallback(1);
                return;
            }

            console.log('Valid token');
            validationCallback(0);

        } // validationCallback
        db.query(qry,params,queryCallback);

    }; // checkForActiveToken

    var db = new DBConnection();
    db.connect(checkForActiveToken.bind(db));
}

module.exports.createTimestamp = function() {
	// creates a mysql formatted datetime string
    function ISODateString(d) {
      function pad(n) {return n<10 ? '0'+n : n}
      return d.getUTCFullYear()+'-'
          + pad(d.getUTCMonth()+1)+'-'
          + pad(d.getUTCDate()) +' '
          + pad(d.getUTCHours())+':'
          + pad(d.getUTCMinutes())+':'
          + pad(d.getUTCSeconds())
    }
	var d = new Date();
	return ISODateString(d);
};

module.exports.createToken = function() {
	// creates a unique token
    var d = new Date().getTime();
    var token = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
	return token;
};

module.exports.generateUUID = function() {
	// generates a unique user_id for each new user added to the database
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
	return uuid;
};

module.exports.hashPassword = function(password) {
	// hashes a user password using a bcrypt-nodejs
	return bcrypt.hashSync(password);
};

module.exports.checkPasswordHash = function(password,hash) {
	// compares a user password to a generated hash
	return bcrypt.compareSync(password,hash);
};

module.exports.validateEmail = function(email) {
	// validates a provided email address using the RFC 2822 compliant regexp
	var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	return re.test(email);
};

module.exports.validatePassword = function(password) {
	// validates a user password. Current criteria:
	// At least one number, one lowercase and one uppercase letter
	// At least 6 characters in length
	var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	return re.test(password);
};

module.exports.validateUsername = function(username) {
	// Username must be at least 5 characters long and no more than 32
	if (username.length < 5 || username.length > 32)
		return false;
	return true;
};
