# ElasticSearch Backups

There's [plenty of documentation](https://www.elastic.co/guide/en/elasticsearch/guide/1.x/backing-up-your-cluster.html) on creating
snapshots of ES indexes. Posting snapshot requests to the API can be scripted to run regularly, and the snapshots can (should!) be stored on 
redundant shared storage. The process is fairly speedy, since it uses delta backups.

## Backing up to AWS

Up to version 1.7 of ElasticSearch, the [elasticsearch-cloud-aws](https://github.com/elastic/elasticsearch-cloud-aws) plugin is required to 
send data to AWS. THe full documentation can be found [here](https://github.com/elastic/elasticsearch-cloud-aws/tree/v2.7.1/#version-271-for-elasticsearch-17).
 
Firstly, you will need your AWS credentials, and register the settings with the plugin:

```
curl -XPUT 'http://localhost:9200/_snapshot/muk_s3' -d '{
   "type": "s3",
   "settings": {
       "bucket": "muk-es-backups",
       "region": "eu-west-1",
       "access_key": "",
       "secret_key": ""
   }
}'
```

Subsequently, start a new the snapshot with:

```
curl -XPUT 'http://localhost:9200/_snapshot/muk_s3/<snapshot_name>'
```

## Restore from AWS

To restore the data to a new clean index, register the AWS settings as above, then close the index for writing:

```
curl -XPOST 'http://localhost:9200/muk/_close'
```

Then initialise the restore, and wait for it to complete:

```
curl -XPOST 'http://localhost:9200/_snapshot/muk_s3/<snapshot_name>/_restore'
```

Finally, reopen the index:

```
curl -XPOST 'http://localhost:9200/muk/open'
```
