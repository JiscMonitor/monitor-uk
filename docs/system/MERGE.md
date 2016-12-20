# Metadata merge rules for Public records

This document describes the rules used when merging the metadata between
two PublicAPC records.  This can happen when more than one Request is
made for an article with the same identifier.

Merge takes place between a "target" (the original PublicAPC record) and
a "source" (the incoming record).

There are several rules that are applied, as follows:

* **Copy if missing** - the target receives a copy of this metadata from the source only if it does not already have that field itself
* **Override** - the target's copy of this metadata is always replaced by that from the source, if it is exists in the source.
* **Append lists** - values from the source are appended to the lists in the target.  If the list does not exist in the target, it is created.  If values in the source are duplicates of those in the target, they are removed

Merge of the objects happens recursively.  If a field is a complex type (i.e. a sub-object), the
internal structure of the object is also merged.

## Copy if missing

* dcterms:dateSubmitted
* dcterms:dateAccepted
* rioxxterms:publication_date
* dc:identifier
* rioxxterms:type
* dc:title
* dc:subject
* rioxxterms:author
* rioxxterms:contributor
* dcterms:publisher
* dc:source
* rioxxterms:project
* ali:license_ref
* jm:license_received
* jm:repository
* jm:provenance

## Override

* rioxxterms:version
* ali:free_to_read

## Append lists

* dc:identifier - if type and id are not already present
* dc:subject
* rioxxterms:author - if no author identifiers match
* rioxxterms:contributor - if no contributor identifiers match
* rioxxterms:project - if name or identifiers don't match
* ali:license_ref - if any sub-fields are different
* jm:license_received - if date and result are different
* jm:repository - if repo_url is different
* jm:provenance

## Merge sub-objects

### rioxxterms:author

#### Copy if missing

* name
* identifier

#### Append lists

* identifier - if type and id are not already present
* affiliation - if no affiliation identifiers match

### rioxxterms:contributor

#### Copy if missing

* name
* identifier

#### Append lists

* identifier - if type and id are not already present
* affiliation - if no affiliation identifiers match

### dcterms:publisher

#### Copy if missing

* name
* identifier

#### Append lists

* identifier - if type and id are not already present

### dc:source

#### Copy if missing

* name
* identifier
* oa_type
* self_archiving.preprint
* self_archiving.postprint
* self_archiving.publisher

#### Append lists

* identifier - if type and id are not already present

### rioxxterms:project

#### Copy if missing

* funder_name
* funder_identifier
* grant_number

#### Append lists

* funder_identifier  - if type and id are not already present
