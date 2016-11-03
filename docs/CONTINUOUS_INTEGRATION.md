# Continuous Integration for Monitor UK using Codeship

During development, ```monitor.cottagelabs.com``` was deployed automatically via [Codeship](https://codeship.com) - a service which provides 
virtual machines to run tests and deployment, triggered by commits on GitHub. The entry point to the relevant documentation is [here](https://documentation.codeship.com/continuous-integration/welcome-classic-infrastructure/).

## Configuring Tests

In the first box on the test settings screen, we put the initial setup commands. These will look familiar if you have followed the instructions in ```INSTALL.md``` 
in your local environment. The ```curl``` command is Codeship's method to install ElasticSearch on their VMs. Finally, adding the ES port to a local config file 
allows the app to contact ElasticSearch when running the tests.

```
git submodule update --init --recursive
git submodule update --recursive
pip install -r requirements.txt --use-mirrors
\curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/elasticsearch.sh | bash -s
echo "ELASTIC_SEARCH_HOST = \"http://localhost:${ELASTICSEARCH_PORT}\"" > local.cfg
```

The tests are run from the project root, using ```nosetests -v service/tests/unit```. Add this command to the **Configure Test Pipelines** box then project collaborators 
will receive notifications when the tests fail, and the status will be shown on the GitHub UI.

## Deployment Configuration 

On the deployment screen, input commands to ssh into the staging server to update the application. In our case, that is getting the latest code changes on the machine 
with ```git pull``` and running the continuous integration script, in ```deploy/ci.sh```. The script itself simply runs the install steps again then reloads the app 
using ```supervisor``` and reloads ```nginx```. Ensure you have added the CodeShip SSH key to your server's ```authorized_keys``` file so it can log in. Likewise, Codeship 
won't be able to fetch code from GitHub unless its ssh key is authorised in the project settings. The following commands can be added to the deployment settings:

```
ssh cloo@monitoruk.cottagelabs.com 'cd /home/cloo/monitor-uk/src && git checkout develop && git pull'
ssh cloo@monitoruk.cottagelabs.com '/home/cloo/monitor-uk/src/deploy/ci.sh'
```
