# Production Environment Description

NOTE: documentation for production set-up valid in October 2016

* Web URL: [monitoruk.jisc.ac.uk](https://monitoruk.jisc.ac.uk) 
* Main web server domain: search.monitor.jisc.ac.uk
* SSH access to port 22, firewalled to named IPs

* Monitor files are held by user: monitoruk
* Application git checkout is in: /monitorES/monitoruk/monitor-uk

* Application is installed and operated as per DEPLOY.md

* Elasticsearch instance is provided by the Jisc ES cluster
* Supervisor configuration is in: /etc/supervisor/conf.d/monitor-uk.conf
    * in turn, logs are in /var/log/supervisor/app-access.log and /var/log/supervisor/app-error.log