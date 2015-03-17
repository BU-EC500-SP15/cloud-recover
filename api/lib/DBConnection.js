// MySQL Database Connection Class

var mysql = require('mysql');
var http = require('http');
var bl = require('bl');

// Constructor
function DBConnection(errCallback) {

	var that = this; // that = DBConnection object
	that.host = 'reclodb.ctng2ag7pnrb.us-west-2.rds.amazonaws.com';
	that.url = 'http://169.254.169.254/latest/user-data';

	// get password securely from EC2 userdata
	function handleResponse(response) {

		// connect to MySQL database
		function connectToDB(err,data) {

			if (err) {
                errCallback(err);
              	return;
            }

	        var pw = data.toString().slice(5);

	        // connect to ReClo databse
	        that.db = mysql.createConnection({
	            host     : that.host,
	            port     : '3306',
	            user     : 'reclo',
	            password : pw,
	            database : 'reclodb',
	        });
	        that.db.connect();
		}
		response.pipe(bl(connectToDB));
    }
    http.get(that.url,handleResponse);
}

// Member functions
DBConnection.prototype.query = function(qry,params,callback) {

	// MySQL query
	this.db.query(qry,params,callback);
}

// Export the class
module.exports = DBConnection;
