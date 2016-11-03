# For DevOps

See ```INSTALL.md``` for how to get the web app up and running.

For information regarding JS / CSS assets, see ```ASSETS.md```. It is recommended to use compiled / minified assets in production.

The directory ```deploy``` at the project root contains configs used on the staging site during development, consisting of a continuous integration script ```ci.sh```, 
as well as configuration files for ```nginx``` and ```supervisor```. You can use these as a starting point for your own deployment.

**Note: SSL / HTTPS configs were not used on the staging site, but should definitely be used in production. This is left as an exercise for the reader.**

## Deploying Monitor UK using supervisor

```deploy/supervisor/monitor-uk.conf``` contains the program configuration for monitor-uk. 
The syntax is specified [here](http://supervisord.org/configuration.html#program-x-section-settings) This file should be copied or symlinked to reside in
```/etc/supervisor/conf.d/monitor-uk.conf``` on the server. To check it will be picked up by supervisor, ensure the following lines are present at the end 
of the supervisor configuration file, at ```/etc/supervisor/supervisord.conf```:

```
[include]
files = /etc/supervisor/conf.d/*.conf
```

You can then read the config files with

    supervisorctl reread

Run the service with

    supervisorctl start monitor-uk:*

Note: since monitor-uk is a group of programs, the wildcard is necessary; you are starting ```monitor-uk:app``` and ```monitor-uk:scheduler```

Chech the status with

    supervisorctl status

If you have an error, don't forget to look at the log locations as specified in the ```monitor-uk.conf``` file.

And of course it can be stopped with

    supervisorctl stop monitor-uk:*
    
Since we are using a group, individual components can be started and stopped, e.g. ```supervisorctl stop monitor-uk:scheduler``` to stop the scheduler only.

Plus the handy restart command:

    supervisorctl restart monitor-uk:*

You can see the rest of supervisor's actions using ```supervisorctl help```
Note: if you see a socket error, ensure you are running supervisor as a super-user.

## Serving Monitor UK using nginx

The example *sites* file is at ```deploy/nginx/montior-uk``` - this is symlinked to ```/etc/nginx/sites-available/monitor-uk```
and in turn to ```/etc/ngix/sites-endabled/monitor-uk``` to configure the staging site monitoruk.cottagelabs.com.

When writing your *sites* file, remember to set the ```proxy-pass``` line to be the same port you are serving the app on,
as defined in ```local.cfg```, and the ```server_name``` to the name you used in your DNS configuration.

Once the nginx files have been updated, they should be tested for correct syntax with:

    nginx -t

Then nginx must be reloaded to get the changes:

    nginx -s reload

In the continuous integration script ```ci.sh``` these commands are combined to only reload the webserver if the syntax check passes:

    sudo nginx -t && sudo nginx -s reload
