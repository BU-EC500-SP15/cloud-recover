/* ReClo API: LOCALDBConnection hook
 * ---------------------------------
 * DO NOT UPLOAD TO GITHUB. CONTAINS SENSITIVE INFORMATION.
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

    var pw = 'fJ1nkJG3jvxgZCNo';

    // connect to ReClo databse
    this.db = mysql.createConnection({
        host     : this.host,
        port     : '3306',
        user     : 'reclo',
        password : pw,
        database : 'reclodb',
    });
    this.db.connect();

    connectionCallback(0);
}

// Perform MySQL query
DBConnection.prototype.query = function(qry,params,callback) {

    // MySQL query
    this.db.query(qry,params,callback);
}

// Export the class
module.exports = DBConnection;
