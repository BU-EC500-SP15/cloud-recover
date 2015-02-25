// ReClo basic core functions
// 2-22-2015

// Module dependencies
// ---------------------------------

// phpass password hashing
var PasswordHash = require('phpass').PasswordHash;

// Module functions
// ---------------------------------

module.exports = {

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
		else {
			console.log('Password hash failed.');
			return null;
		}
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