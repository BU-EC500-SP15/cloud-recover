// ReClo basic core functions
// 2-22-2015

// Module dependencies
// ---------------------------------

// bycrypt password hashing
var bcrypt = require('bcrypt-nodejs');

// Module functions
// ---------------------------------

module.exports = {

	createToken: function() {
		// creates a unique token 
	    var d = new Date().getTime();
	    var token = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
    	return token;		
	},

	generateUUID: function() {
		// generates a unique user_id for each new user added to the database
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
    	return uuid;
	},

	hashPassword: function(password) {
		// hashes a user password using an bcrypt-nodejs
		// returns:
		//  hash if hash was successful
		//  null if hash failed

		var hash = bcrypt.hashSync(password);

		if (hash)
			return hash;
		else {
			console.log('Password hash failed.');
			return null;
		}
	},

	checkPasswordHash: function(hash,password) {
		// compares a user password to a generated hash
		// returns:
		//  true if password matches hash
		//  false if password does not match hash

		return bcrypt.compareSync(password,hash);
	}

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