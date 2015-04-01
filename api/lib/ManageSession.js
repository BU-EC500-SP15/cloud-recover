/* ReClo API: /lib/ManageSession.js
 * --------------------------------
 * v1.0
 * Carlton Duffett
 * 3-17-2015
 *
 *
 * Periodically scans the database of session tokens and invalidates any
 * expired tokens. In our system, tokens expire after 60 days.
 */

var DBConnection = require('../lib/DBConnection.js');
var corelib = require('../lib/core.js');

console.log('Scanning session tokens...');

function connectionCallback(err) {

    if (err) {
        console.log('Token invalidation failed');
        console.log('There was an error connecting to the database');
        db.disconnect();
        return;
    }

    // invalidate any session tokens where the timestamp is expired
    var qry = "UPDATE reclodb.tokens SET token_status = 'D', date_deactivated = NOW() WHERE " +
              "DATEDIFF(NOW(),date_created) > 60 AND token_status = 'A'"; // 60 days

    function invalidateTokenCallback(err,results) {

        if (err) {
            console.log('Token invalidation failed');
            console.log('There was an error connecting to the database');
            db.disconnect();
            return;
        }

        console.log('... ' + results.affectedRows + ' session tokens invalidated.');
        db.disconnect();

    } // invalidateTokenCallback
    db.query(qry,invalidateTokenCallback);
}
var db = new DBConnection();
db.connect(connectionCallback.bind(db));

