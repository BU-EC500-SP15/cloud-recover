/* ReClo API: /lib/FreeInstances.js
 * --------------------------------
 * v1.0
 * Carlton Duffett
 * 4-1-2015
 *
 *
 * Periodically scans the database of AWS instances and terminates
 * any instances that have been stopped for more than 2 weeks.
 */

var DBConnection = require('../lib/DBConnection.js');

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

console.log('Scanning EC2 instances...');

function connectionCallback(err) {

    if (err) {
        console.log('Instance termination failed');
        console.log('There was an error connecting to the database');
        db.disconnect();
        return;
    }

    // find any instances that have been stopped for more than 2 weeks
    var qry = "SELECT instance_id FROM reclodb.instances WHERE " +
              "DATEDIFF(NOW(),date_last_stopped) > 14 AND instance_status = 'A'"; // 14 days

    function findInstancesCallback(err,results) {

        if (err) {
            console.log('Instance termination failed');
            console.log('There was an error connecting to the database');
            db.disconnect();
            return;
        }

        if (results.length == 0) {
            console.log('... ' + results.length + ' instances terminated.');
            db.disconnect();
            return;
        }

        // run an EC2 task to terminate each instance
        var ec2 = new AWS.EC2();
        var ids = [];

        for (i = 0; i < results.length; i++) {
            ids.push(results[i].instance_id);
        }

        var params = {
            InstanceIds: ids
        };

        console.log('Terminating instances ' + ids + ' ...');

        function terminateInstancesCallback(err,data) {

            if (err) {
                console.log('Failed to terminate EC2 instance(s)');
                console.log('EC2 Error: ' + err);
                db.disconnect();
                return;
            }

            // update instance records
            var qry = "UPDATE reclodb.instances SET " +
                      "instance_state = 'terminated', " +
                      "date_last_stopped = NOW(), " +
                      "instance_status = 'D' " +
                      "WHERE instance_id IN (?)";

            var params = ids;

            function updateInstancesCallback(err,results) {

                if (err) {
                    console.log('updateInstances ' + err);
                    db.disconnect();
                    return;
                }

                console.log('... ' + results.affectedRows + ' instances terminated.');
                db.disconnect();

            } // updateInstancesCallback
            db.query(qry,params,updateInstancesCallback);

        } // terminateInstancesCallback
        ec2.terminateInstances(params,terminateInstancesCallback);

    } // invalidateTokenCallback
    db.query(qry,findInstancesCallback);
}
var db = new DBConnection();
db.connect(connectionCallback.bind(db));

