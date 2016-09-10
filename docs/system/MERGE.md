# Metadata merge rules for Public records

## Copy if missing

dcterms:dateSubmitted
dcterms:dateAccepted
rioxxterms:publication_date
dc:identifier
rioxxterms:type
dc:title
dc:subject
rioxxterms:author
rioxxterms:contributor
dcterms:publisher
dc:source
rioxxterms:project
ali:license_ref
jm:license_received
jm:repository
jm:provenance

## Override

rioxxterms:version
ali:free_to_read

## Append lists (de-duplicated)

dc:identifier - if type and id are not already present
dc:subject
rioxxterms:author - if no author identifiers match
rioxxterms:contributor - if no contributor identifiers match
rioxxterms:project - if name or identifiers don't match
ali:license_ref - if any sub-fields are different
jm:license_received - if date and result are different
jm:repository - if repo_url is different
jm:provenance

## Merge sub-objects

### rioxxterms:author

#### Copy if missing

name
identifier


#### Append lists (de-duplicated)

identifier - if type and id are not already present
affiliation - if no affiliation identifiers match

### rioxxterms:contributor

#### Copy if missing

name
identifier


#### Append lists (de-duplicated)

identifier - if type and id are not already present
affiliation - if no affiliation identifiers match


### dcterms:publisher

#### Copy if missing

name
identifier

#### Append lists (de-duplicated)

identifier - if type and id are not already present

### dc:source

#### Copy if missing

name
identifier
oa_type
self_archiving.preprint
self_archiving.postprint
self_archiving.publisher

#### Append lists (de-duplicated)

identifier - if type and id are not already present

### rioxxterms:project

#### Copy if missing

funder_name
funder_identifier
grant_number

#### Append lists (de-duplicated)

funder_identifier  - if type and id are not already present
