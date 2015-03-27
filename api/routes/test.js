var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

var s3 = new AWS.S3();

var bucket = 'reclo-client-backups/';
var file_name = 'c2cf281d-061c-40e8-8732-7bedb9e763ec/backup02.vhdx';

var lsparams = {
    Bucket  : bucket,
};

var params = {
    Bucket  : bucket,
    Key     : file_name
};

function listCallback(err,data) {

    if (err) {
        console.log('listBackup Error: ' + err);
        return;
    }

    console.log('Contents: ' + data.Contents);

    for(i = 0; i < data.Contents.length; i++) {
        console.log(data.Contents[i]);
    }

    function getCallback(err,data) {
        if (err) {
            console.log('getBackup Error: ' + err);
            return;
        }
        console.log('Body: ' + data.Body);
        console.log('Version: ' + data.VersionId);

        function deleteCallback(err,data) {

            if (err) {
                console.log('deleteBackup Error: ' + err);
                return;
            }
            console.log('deleteBackup successful.');
        }
        s3.deleteObject(params,deleteCallback);
    }
    s3.getObject(params,getCallback);
}
s3.listObjects(lsparams,listCallback);
