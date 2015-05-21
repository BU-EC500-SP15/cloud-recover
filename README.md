Recovery in the Cloud
=====================

**ReClo** is lightweight software for small and medium business recovery. Our simple client applications backup a user's Windows server to Amazon Web Services (AWS). In the event of hardware failure, users can access their backups and recover to a new virtual instance running in AWS. Connection to recovered instances is handled securely with a VPN connection.

ReClo offers two client apps:  

* **Backup Manager** is downloaded to a client's server. Once installed, we take regular backups of the system
and store them securely in S3. We take one full backup per week, followed by incremental backups (of just the files that have changed) in-between full backups. These backups are automatically uploaded from the client into AWS. 
* **Recovery Manager** is downloaded to a client's desktop computer. Recovery Manager shows clients a list of thier backups, allowing them to choose one to recover. These backup are compressed and imported as a new virtual instances in EC2. Recovery takes about one hour to complete. Recovery Manager provides a secure VPN connection so users can continue to access their important files once recovered. 


**This repository contains the following resources:**

REST API (api/)
--------------
Our server-side RESTful API written in node.js. Our API interacts with our AWS resources and MySQL database.

* **app.js** is our main API setup and handles all request routing using the [express.js](http://expressjs.com) routing framework.
* **lib** contains our core libraries, database management tools, and cron jobs.
* **node_modules** contain all of our node.js dependencies needed for our app.
* **public** contains basic stylesheets for our API's web portal.
* **routes** contains all of our request handlers for each set of API calls (user authentication, backup, and recovery).
* **views** contains basic views for our API's web portal.

Clients (clients/)
-----------------
Our native Windows applications that orchestrate backups and connection to restored instances from the client's computer.

* **client_lib** contains our core libraries for our client apps.
* **powershell_backups** contains our powershell scripts that orchestrate backups.
* **Reclo Backup Manager** contains our client Windows app for backup management.
* **Reclo Recovery Manager** contains our client Windows app for recovery management.

Documentation (docs/)
--------------------
Our project proposal, project architecture, and an overview of each sprint used in the development process.

Website (website/)
-----------------
Our website with information about our service and links to download our client apps.  
We borrowed our theme from [BlackTie.co](http://blacktie.co).    

Hosted publicly on Github at:  
**[reclo.github.io](http://reclo.github.io)**

Authors
-------
**The ReClo Team**  
Boston University  
EC500 Cloud Computing  
Spring 2015 

<!-- Authors table -->
<table style='margin-left:0px; padding-left:0px;'>
    <tr>
        <td>Carlton Duffett</td><td><a href='mailto:cduffett@bu.edu'>cduffett@bu.edu</a></td>
    </tr>
    <tr>
        <td>Deema Kutbi</td><td><a href='mailto:deemak@bu.edu'>deemak@bu.edu</a></td>
    </tr>
    <tr>
        <td>Emilio Teran</td><td><a href='mailto:eteran@bu.edu'>eteran@bu.edu</a></td>
    </tr>
    <tr>
        <td>Konstantino Sparakis</td><td><a href='mailto:sparakis@bu.edu'>sparakis@bu.edu</a></td>
    </tr> 
    <tr>
        <td>Minhan Xiang</td><td><a href='mailto:xmh@bu.edu'>xmh@bu.edu</a></td>
    </tr>   
</table>

Setup Instructions
==================

ReClo API Server
----------------

### Installing the Server ###

Our main API server runs on an AWS AMI Linux instance. We use the AMI setup as it comes pre-configured with the AWS command line interface (CLI). We chose Linux instead of a Windows server for its customizability and ease of use.

After starting a free-tier instance (30GB storage), [install Node.js](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

You can then use the node package manager (npm) to install [forever.js](https://github.com/foreverjs/forever), a simple CLI tool that keeps a node.js script running continuously, forever. We use this to keep our API server running.  
`sudo npm install forever`

The remaining node packages are already part of our repository. Simply [download the API folder](https://github.com/BU-EC500-SP15/cloud-recover/tree/master/api) to your instance. This should be located in the directory:  
`~/cloud-recover/api`

Lastly, create a folder at the root `mkdir /backups-tmp/` to hold backups during the import process. Because backups are generally large, we mounted a separate 100GB volume for this purpose. You may need to change the permissions of this folder `sudo chmod 700 /backups-tmp/`.

### Running the Server ###

To start the API server, run:  
`cd ~/cloud-recover/api`  
`forever start -l forever.log -o ./logs/out.log -e ./logs/err.log ./bin/www`
 
This creates several logs that you can check to mointor the server's activity. The master log is in:  
`~/.forever/forever.log`
 
Output and error logs are maintained in:  
`api/logs/out.log  
api/logs/err.log`
 
### Stopping the Server ###
 
To stop the server, run `forever list` and note the process ID (PID) of script `bin/www`.
Then run `forever stop <pid>`.
 
Before you can restart the server, you need to clear the previous run's logs:  
`rm ~/.forever/forever.log`

### Cron Jobs ###

Several cron jobs are used to perform background tasks and to manage API resources. The crontab can easily be edited using
`env EDITOR=nano crontab -e`. Add the following jobs to your cron tab:

1. deactivates expired tokens once per day at 4:01am UTC  
`01 04 * * * /usr/bin/node ~/cloud-recover/api/lib/ManageSession.js`

2. terminates recovered instances after stopped for 2 weeks  
`02 04 * * * /usr/bin/node ~/cloud-recover/api/lib/FreeInstances.js`

3. fails recovery tasks that are more than 24 hours old  
`03 04 * * * /usr/bin/node ~/cloud-recover/api/lib/FailRecovery.js`

4. scans for pending recovery tasks once per minute  
`* * * * * /usr/bin/node ~/cloud-recover/api/lib/ManagePending.js`

5. scans for downloading recovery tasks once per minute  
`* * * * * /usr/bin/node ~/cloud-recover/api/lib/ManageDownloads.js`

6. scans for importing recovery tasks once per minute  
`* * * * * /usr/bin/node ~/cloud-recover/api/lib/ManageImports.js`

7. scans for finishing recovery tasks once per minute  
`* * * * * /usr/bin/node ~/cloud-recover/api/lib/FinishRecovery.js`

Client Applications
-------------------

Our [client applications](https://github.com/BU-EC500-SP15/cloud-recover/tree/master/clients) are still in the developmental stage. Download them to your Windows computer and run them using MS Visual Studio or a similar development tool. Our clients talk directly to our server at a specific IP address. Change the root of our API requests:  
`private static string urlhead = 'http://52.24.77.177:3000/'`  
to match the IP address of your server. Our API server runs on port 3000.

AWS Resources
-------------

### S3 Storage ###

We use a master bucket in S3 to hold all of our client backups, `reclo-client-backups`. Backups for each client are grouped into folders named using each clients unique ID. We also use a bucket to hold all of our imported instances (recovered from client backups), `reclo-imported-vms`. Create these buckets in S3 and give your API server permission to access them.

### RDS MySQL Database ###

All or our records are maintained in a single database, `reclodb`. This holds records for:

* users
* session tokens
* backups
* uploads
* recovery tasks
* running instances

Create the following tables in a new MySQL database:

<!-- users table -->
<table>
    <tr>
        <td><strong>users</strong></td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>id</td>
        <td>user_id</td>
        <td>username</td>
        <td>email</td>
        <td>hash</td>
        <td>date_created</td>
        <td>user_status</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>VARCHAR(36)</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(255)</td>
        <td>VARCHAR(60)</td>
        <td>DATETIME</td>
        <td>VARCHAR(1)</td>
    </tr>
</table>

<!-- tokens table -->
<table>
    <tr>
        <td><strong>tokens</strong></td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>id</td>
        <td>token_id</td>
        <td>user_id</td>
        <td>date_created</td>
        <td>date_deactivated</td>
        <td>token_status</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(36)</td>
        <td>DATETIME</td>
        <td>DATETIME</td>
        <td>VARCHAR(1)</td>
    </tr>
</table>

<!-- backups -->
<table>
    <tr>
        <td><strong>backups</strong></td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>id</td>
        <td>backup_id</td>
        <td>user_id</td>
        <td>file_size</td>
        <td>file_name</td>
        <td>type</td>
        <td>date_created</td>
        <td>backup_status</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(36)</td>
        <td>FLOAT</td>
        <td>VARCHAR(100)</td>
        <td>VARCHAR(11)</td>
        <td>DATETIME</td>
        <td>VARCHAR(1)</td>
    </tr>
</table>

<!-- uploads -->
<table>
    <tr>
        <td><strong>uploads</strong></td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>id</td>
        <td>upload_id</td>
        <td>user_id</td>
        <td>file_size</td>
        <td>file_name</td>
        <td>time_started</td>
        <td>time_completed</td>
        <td>upload_status</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(36)</td>
        <td>FLOAT</td>
        <td>VARCHAR(100)</td>
        <td>DATETIME</td>
        <td>DATETIME</td>
        <td>VARCHAR(1)</td>
    </tr>
</table>

<!-- recovery -->
<table>
    <tr>
        <td><strong>recovery</strong></td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>id</td>
        <td>recovery_id</td>
        <td>user_id</td>
        <td>backup_id</td>
        <td>instance_id</td>
        <td>conversion_id</td>
        <td>file_name</td>
        <td>recovery_state</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(36)</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(10)</td>
        <td>VARCHAR(18)</td>
        <td>VARCHAR(100)</td>
        <td>VARCHAR(12)</td>
    </tr>    
    <tr style="background-color:#DDDDDD">
        <td>total_progress</td>
        <td>state_progress</td>
        <td>no_downloads</td>
        <td>no_completed</td>
        <td>instance_state</td>
        <td>date_started</td>
        <td>date_completed</td>
        <td>recovery_status</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>INT</td>
        <td>INT</td>
        <td>INT</td>
        <td>VARCHAR(12)</td>
        <td>DATETIME</td>
        <td>DATETIME</td>
        <td>VARCHAR(1)</td>
    </tr>
</table>

<!-- instances -->
<table>
    <tr>
        <td><strong>instances</strong></td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>id</td>
        <td>user_id</td>
        <td>instance_id</td>
        <td>instance_name</td>
        <td>ip_address</td>
    </tr>
    <tr>
        <td>INT</td>
        <td>VARCHAR(36)</td>
        <td>VARCHAR(10)</td>
        <td>VARCHAR(32)</td>
        <td>VARCHAR(16)</td>
    </tr>
    <tr style="background-color:#DDDDDD">
        <td>instance_state</td>
        <td>availability_zone</td>
        <td>date_created</td>
        <td>date_last_stopped</td>
        <td>upload_status</td>
    </tr>
    <tr>
        <td>VARCHAR(23)</td>
        <td>VARCHAR(20)</td>
        <td>DATETIME</td>
        <td>DATETIME</td>
        <td>VARCHAR(1)</td>
    </tr>
</table>

The database password, our AWS access key, and AWS secret key are stored in the API server's userdata. All of our userdata is maintained as a list of comma-separated, key-value pairs. For example:  
`mysql=mysqlpassword1,  
 access_key=ACCESSKEYto43AWS-23ab,  
 secret_key=234t+3#SECRETKEY1!-vrs2`
