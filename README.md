# cloud-recover

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
