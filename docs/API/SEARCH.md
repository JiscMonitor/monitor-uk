# Search API

The Search API provides both general public (though still authenticated) access to the public dataset, as well as access
to an organisation's own content through a private API.

## Public

This provides access to the entire public dataset, and allows queries on the bibliographic record data

    GET /search/public?api_key=<api_key>[& params]

Although public, you must have a user account to access this API, and you must have the role "read_apc"

## Private

This provides access to the public dataset such that authenticated users only see materials that they contributed
themselves.  It is intended to enable integration with account-holder's other management systems.  It does not provide
any additional functionality over the Public Search API.

    GET /search/private?api_key=<api_key>[& params]

You must have a valid user account, and have the role "write_apc" to use this endpoint

## Allowed Parameters

* api_key - Your API key.  Required.  If you do not provide this you will receive a 401
* q - The query string.  Required.  If you do not provide this you will receive a 400
* page - The page number of the result set you want to see.  Defaults to 1.
* pageSize - The number of results you want to see.  Defaults to 10.  Maximum size allowed is 100.
* sortBy - The field you want to sort the results by.  If omitted, the results are sorted according to relevance to your query.
* sortDir - "asc" or "desc" - the direction you want to sort in.  Defaults to "asc" if sortBy is specified and this is omitted

## Query string syntax

### Basic Queries

The query parameter can be a simple free-text string that you want to search for across all of the records in MUK.

    q="understanding shadows in 3D scenes"
    
The default behaviour of this is to return results which only contain *all* of them.  This provides a set of results which
is likely highly focussed on your query, but may miss some results which are similar but omit some of your key terms.

To change this, you may specify the keyword OR in your search

    q = "understanding OR shadows OR 3D OR scenes"
    
This will return results in which *any* of the words appear.  This will likely give you a broad set of results, not all of
which will necessarily be relevant to your search requirements.

### Field searches

When you are querying on a specific field you can use json dot notation. So, for example to access the author name you could use the path

    rioxxterms:author.name
    
To search within this field, then, separate the field from the value with a ":".  This means that if the field path also contains a ":" (as many do), we need to escape it by using a "\":

    rioxxterms\:author.name:"Richard Jones"

Note that all searchable fields are analysed, which means that the above search does not look for the exact string "Richard Jones" - instead it looks for Richard and/or Jones in the field, without any case sensitivity.

To match exactly, add ".exact" to any string field (not date or number fields) to match the exact contents:

    rioxxterms\:author.name.exact:"Richard Jones"

### Special characters

All forward slash ("/") characters will be automatically escaped for you unless you escape them yourself. 

This means any forward slashes / will become \/ which ends up encoded as %5C/ in a URL since a "naked" backslash \ is not allowed in a 
URL. So you can search for a DOI by giving endpoint either of the following queries (they will give you the same results):

    doi:10.3389/fpsyg.2013.00479
    doi:10.3389%5C/fpsyg.2013.00479

### Advanced usage

The format of the query part of the URL is that of an Elasticsearch query string, as documented here: https://www.elastic.co/guide/en/elasticsearch/reference/1.4/query-dsl-query-string-query.html#query-string-syntax. Elasticsearch uses Lucene under the hood.

Some of the Elasticsearch query syntax has been disabled in order to prevent queries which may damage performance. The disabled features are:

* Wildcard searches. You may not put a * into a query string: https://www.elastic.co/guide/en/elasticsearch/reference/1.4/query-dsl-query-string-query.html#_wildcards

* Regular expression searches. You may not put an expression between two forward slashes /regex/ into a query string: https://www.elastic.co/guide/en/elasticsearch/reference/1.4/query-dsl-query-string-query.html#_regular_expressions. This is done both for performance reasons and because of the escaping of forward slashes / described above.

* Fuzzy Searches. You may not use the ~ notation: https://www.elastic.co/guide/en/elasticsearch/reference/1.4/query-dsl-query-string-query.html#_fuzziness

* Proximity Searches. https://www.elastic.co/guide/en/elasticsearch/reference/1.4/query-dsl-query-string-query.html#_proximity_searches

## Sorting

Each request can take a "sortBy" and a "sortDir" url parameter, which can be of the form of one of:

    sortBy=dc:title&sortDir=asc

The field in sortBy again uses the json dot notation.

If specifying the direction, it must be one of "asc" or "desc". If no direction is supplied then "asc" is used.

Note that for fields which may contain multiple values (i.e. arrays), the sort will use the "smallest" value in that field to sort by 
(depending on the definition of "smallest" for that field type)

## Results Format

When you receive the results of a successful search, they will be formatted as follows:

```
{
    "pageSize": 10,
    "timestamp": "2016-09-02T16:38:40Z",
    "query": "My Query",
    "total": 298,
    "page": 1
    "results": [
        {JSON Record Body}
    ],
}
```

* pageSize - the number of records you requested per page.  This may not be the same as the number of records in the results array, if you are on the last page
* timestamp - the server's time stamp for when it processed your query
* query - the query string you sent to the server
* total - the total number of individual results
* page - the current page number in the result set that you are looking at
* results - list of the records which match the search, a set of JSON documents, each conforming to our schema (see [Contribution API](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/API/CONTRIBUTION.md) for details)
