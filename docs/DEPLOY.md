# For DevOps

The directory ```deploy``` at the project root contains configs used on the staging site, consisting of a continuous integration script ```ci.sh```, 
as well as configuration files for nginx and supervisor.

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
```supervisorctl reread```

Run the service with
```supervisorctl start monitor-uk:*```
note: since monitor-uk is a group of programs, the wildcard is necessary; you are starting ```monitor-uk:app``` and ```monitor-uk:scheduler```

Chech the status with
```supervisorctl status```
If you have an error, don't forget to look at the log locations as specified in the ```monitor-uk.conf``` file.

And of course it can be stopped with
```supervisorctl stop monitor-uk:*```
Since we are using a group, individual components can be started and stopped, e.g. ```supervisorctl stop monitor-uk:scheduler``` to stop the scheduler only

Plus the handy restart:
```supervisorctl restart monitor-uk:*```

You can see the rest of supervisor's actions using ```supervisorctl help```
note: if you see a socket error, ensure you are running supervisor as a superuser.
