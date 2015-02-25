# cloud-recover

Recovery in the Cloud
---------------------

**ReClo** is lightweight software for small and medium business recovery using the cloud. Our simple client applications backup a user's server to Amazon Web Services and provide access to critical files and documents in the event of hardware failure.

ReClo offers two client apps:  
* **Backup Manager** handles the routine backup of a Windows Server 2012 and automatically pushes backups to secure AWS S3 storage  
* **Recovery Manager** provides a VPN connection to a client's restored instance (running on AWS EC2) so users can continue to access their important files.  

This repository contains the following resources:

Documentation
-------------
Our project proposal, project architecture, and an overview of each sprint used in the development process.

Server
------
Our server code running in EC2 that supports user authentication, the management of our AWS resources such as backup files and restored client EC2 instances.

Clients
-------
Our native Windows applications that orchestrate backups and connection to restored instances from the client's computer.

Website
-------
Our website with information about our service and links to download our client apps.

Authors
-------
The ReClo Team  
Boston University  
EC500 Cloud Computing  

Carlton Duffett&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[cduffett@bu.edu](mailto:cduffett@bu.edu)  
Deema Kutbi&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[deemak@bu.edu](mailto:deemak@bu.edu)  
Emilio Teran&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[eteran@bu.edu](mailto:eteran@bu.edu)  
Konstantino Sparakis&nbsp;&nbsp;&nbsp;[sparakis@bu.edu](mailto:sparakis@bu.edu)  
Minhan Xiang&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[xmh@bu.edu](mailto:xmh@bu.edu)  

Spring 2015