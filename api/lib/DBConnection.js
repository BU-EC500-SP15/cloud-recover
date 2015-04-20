/* ReClo API: MySQL Database Connection
 * ------------------------------------
 * v3.3
 * Carlton Duffett
 * 3-17-2015
 */

var mysql = require('mysql');
var http = require('http');
var bl = require('bl');

// Constructor
function DBConnection() {

    this.host = 'reclodb.ctng2ag7pnrb.us-west-2.rds.amazonaws.com';
    this.url = 'http://169.254.169.254/latest/user-data';
}

// Initiate connection to MySQL database
DBConnection.prototype.connect = function(connectionCallback) {

    var that = this;

    // get password securely from EC2 userdata
    function handleResponse(response) {

        // connect to MySQL database
        function connectToDB(err,data) {

            if (err) {
                connectionCallback(err);
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
                multipleStatements : true
            });
            that.db.connect();

            connectionCallback(0);

        }; // connectToDB
        response.pipe(bl(connectToDB));

    }; // handleResponse
    http.get(this.url,handleResponse);
}

// Perform MySQL query
DBConnection.prototype.query = function(qry,params,callback) {

    // MySQL query
    this.db.query(qry,params,callback);
}

// Close MySQL connection
DBConnection.prototype.disconnect = function() {
    this.db.end();
}

// Export the class
module.exports = DBConnection;
