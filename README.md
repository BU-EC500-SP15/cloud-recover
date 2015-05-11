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

### Running the Server ###

To start the API server, run:  
`cd ~/cloud-recover/api  
forever start -l forever.log -o ./logs/out.log -e ./logs/err.log ./bin/www`
 
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
  
 







