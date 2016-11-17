var es = {
    specialChars: ["\\", "+", "-", "=", "&&", "||", ">", "<", "!", "(", ")", "{", "}", "[", "]", "^", '"', "~", "*", "?", ":", "/"],
    specialCharsSubSet: ["\\", "+", "-", "=", "&&", "||", ">", "<", "!", "(", ")", "{", "}", "[", "]", "^", "~", "?", ":", "/"],
    characterPairs: ['"'],
    distanceUnits: ["km", "mi", "miles", "in", "inch", "yd", "yards", "kilometers", "mm", "millimeters", "cm", "centimeters", "m", "meters"],
    aggregationFactory: function(type, params) {
        var constructors = {
            terms: es.newTermsAggregation,
            range: es.newRangeAggregation,
            geo_distance: es.newGeoDistanceAggregation,
            date_histogram: es.newDateHistogramAggregation,
            stats: es.StatsAggregation,
            cardinality: es.CardinalityAggregation
        };
        if (constructors[type]) {
            return constructors[type](params)
        }
    },
    filterFactory: function(type, params) {
        var constructors = {
            query_string: es.newQueryString,
            term: es.newTermFilter,
            terms: es.newTermsFilter,
            range: es.newRangeFilter,
            geo_distance_range: es.newGeoDistanceRangeFilter
        };
        if (constructors[type]) {
            return constructors[type](params)
        }
    },
    newQuery: function(params) {
        if (!params) {
            params = {}
        }
        return new es.Query(params)
    },
    Query: function(params) {
        this.filtered = params.filtered || true;
        this.size = params.size !== undefined ? params.size : false;
        this.from = params.from || false;
        this.fields = params.fields || [];
        this.aggs = params.aggs || [];
        this.must = params.must || [];
        this.queryString = false;
        this.sort = [];
        this.source = params.source || false;
        this.should = params.should || [];
        this.mustNot = params.mustNot || [];
        this.partialFields = params.partialFields || false;
        this.scriptFields = params.scriptFields || false;
        this.minimumShouldMatch = params.minimumShouldMatch || false;
        this.partialFields = params.partialFields || false;
        this.scriptFields = params.scriptFields || false;
        this.facets = params.facets || [];
        this.getSize = function() {
            if (this.size !== undefined && this.size !== false) {
                return this.size
            }
            return 10
        };
        this.getFrom = function() {
            if (this.from) {
                return this.from
            }
            return 0
        };
        this.addField = function(field) {
            if ($.inArray(field, this.fields) === -1) {
                this.fields.push(field)
            }
        };
        this.setQueryString = function(params) {
            var qs = params;
            if (!(params instanceof es.QueryString)) {
                if ($.isPlainObject(params)) {
                    qs = es.newQueryString(params)
                } else {
                    qs = es.newQueryString({
                        queryString: params
                    })
                }
            }
            this.queryString = qs
        };
        this.getQueryString = function() {
            return this.queryString
        };
        this.removeQueryString = function() {
            this.queryString = false
        };
        this.setSortBy = function(params) {
            this.sort = [];
            var sorts = params;
            if (!$.isArray(params)) {
                sorts = [params]
            }
            for (var i = 0; i < sorts.length; i++) {
                this.addSortBy(sorts[i])
            }
        };
        this.addSortBy = function(params) {
            var sort = params;
            if (!(params instanceof es.Sort)) {
                sort = es.newSort(params)
            }
            for (var i = 0; i < this.sort.length; i++) {
                var so = this.sort[i];
                if (so.field === sort.field) {
                    return
                }
            }
            this.sort.push(sort)
        };
        this.prependSortBy = function(params) {
            var sort = params;
            if (!(params instanceof es.Sort)) {
                sort = es.newSort(params)
            }
            this.removeSortBy(sort);
            this.sort.unshift(sort)
        };
        this.removeSortBy = function(params) {
            var sort = params;
            if (!(params instanceof es.Sort)) {
                sort = es.newSort(params)
            }
            var removes = [];
            for (var i = 0; i < this.sort.length; i++) {
                var so = this.sort[i];
                if (so.field === sort.field) {
                    removes.push(i)
                }
            }
            removes = removes.sort().reverse();
            for (var i = 0; i < removes.length; i++) {
                this.sort.splice(removes[i], 1)
            }
        };
        this.getSortBy = function() {
            return this.sort
        };
        this.setSource = function(include, exclude) {};
        this.addFacet = function() {};
        this.removeFacet = function() {};
        this.clearFacets = function() {};
        this.getAggregation = function(params) {
            var name = params.name;
            for (var i = 0; i < this.aggs.length; i++) {
                var a = this.aggs[i];
                if (a.name === name) {
                    return a
                }
            }
        };
        this.addAggregation = function(agg, overwrite) {
            if (overwrite) {
                this.removeAggregation(agg.name)
            } else {
                for (var i = 0; i < this.aggs.length; i++) {
                    if (this.aggs[i].name === agg.name) {
                        return
                    }
                }
            }
            this.aggs.push(agg)
        };
        this.removeAggregation = function(name) {
            var removes = [];
            for (var i = 0; i < this.aggs.length; i++) {
                if (this.aggs[i].name === name) {
                    removes.push(i)
                }
            }
            removes = removes.sort().reverse();
            for (var i = 0; i < removes.length; i++) {
                this.aggs.splice(removes[i], 1)
            }
        };
        this.clearAggregations = function() {
            this.aggs = []
        };
        this.listAggregations = function() {
            return this.aggs
        };
        this.addMust = function(filter) {
            var existing = this.listMust(filter);
            if (existing.length === 0) {
                this.must.push(filter)
            }
        };
        this.listMust = function(template) {
            return this.listFilters({
                boolType: "must",
                template: template
            })
        };
        this.removeMust = function(template) {
            var removes = [];
            for (var i = 0; i < this.must.length; i++) {
                var m = this.must[i];
                if (m.matches(template)) {
                    removes.push(i)
                }
            }
            removes = removes.sort().reverse();
            for (var i = 0; i < removes.length; i++) {
                this.must.splice(removes[i], 1)
            }
            return removes.length
        };
        this.clearMust = function() {};
        this.addShould = function() {};
        this.listShould = function() {};
        this.removeShould = function() {};
        this.clearShould = function() {};
        this.addMustNot = function() {};
        this.listMustNot = function() {};
        this.removeMustNot = function() {};
        this.removeMustNot = function() {};
        this.hasFilters = function() {
            return this.must.length > 0 || this.should.length > 0 || this.mustNot.length > 0
        };
        this.listFilters = function(params) {
            var boolType = params.boolType || "must";
            var template = params.template || false;
            var bool = [];
            if (boolType === "must") {
                bool = this.must
            } else if (boolType === "should") {
                bool = this.should
            } else if (boolType === "must_not") {
                bool = this.mustNot
            }
            if (!template) {
                return bool
            }
            var l = [];
            for (var i = 0; i < bool.length; i++) {
                var m = bool[i];
                if (m.matches(template)) {
                    l.push(m)
                }
            }
            return l
        };
        this.merge = function(source) {
            this.filtered = source.filtered;
            if (source.size) {
                this.size = source.size
            }
            if (source.from) {
                this.from = source.from
            }
            if (source.fields && source.fields.length > 0) {
                for (var i = 0; i < source.fields.length; i++) {
                    this.addField(source.fields[i])
                }
            }
            var aggs = source.listAggregations();
            for (var i = 0; i < aggs.length; i++) {
                this.addAggregation(aggs[i], true)
            }
            var must = source.listMust();
            for (var i = 0; i < must.length; i++) {
                this.addMust(must[i])
            }
            if (source.getQueryString()) {
                this.setQueryString(source.getQueryString())
            }
            var sorts = source.getSortBy();
            if (sorts && sorts.length > 0) {
                sorts.reverse();
                for (var i = 0; i < sorts.length; i++) {
                    this.prependSortBy(sorts[i])
                }
            }
        };
        this.objectify = function(params) {
            if (!params) {
                params = {}
            }
            var include_query_string = params.include_query_string === undefined ? true : params.include_query_string;
            var include_filters = params.include_filters === undefined ? true : params.include_filters;
            var include_paging = params.include_paging === undefined ? true : params.include_paging;
            var include_sort = params.include_sort === undefined ? true : params.include_sort;
            var include_fields = params.include_fields === undefined ? true : params.include_fields;
            var include_aggregations = params.include_aggregations === undefined ? true : params.include_aggregations;
            var include_facets = params.include_facets === undefined ? true : params.include_facets;
            var q = {};
            var query_part = {};
            var bool = {};
            if (this.queryString && include_query_string) {
                $.extend(query_part, this.queryString.objectify())
            }
            if (include_filters) {
                if (this.must.length > 0) {
                    var musts = [];
                    for (var i = 0; i < this.must.length; i++) {
                        var m = this.must[i];
                        musts.push(m.objectify())
                    }
                    bool["must"] = musts
                }
            }
            if (this.filtered && this.hasFilters()) {
                if (Object.keys(query_part).length == 0) {
                    query_part["match_all"] = {}
                }
                q["query"] = {
                    filtered: {
                        filter: {
                            bool: bool
                        },
                        query: query_part
                    }
                }
            } else {
                if (this.hasFilters()) {
                    query_part["bool"] = bool
                }
                if (Object.keys(query_part).length == 0) {
                    query_part["match_all"] = {}
                }
                q["query"] = query_part
            }
            if (include_paging) {
                if (this.size !== undefined && this.size !== false) {
                    q["size"] = this.size
                }
                if (this.from) {
                    q["from"] = this.from
                }
            }
            if (this.sort.length > 0 && include_sort) {
                q["sort"] = [];
                for (var i = 0; i < this.sort.length; i++) {
                    q.sort.push(this.sort[i].objectify())
                }
            }
            if (this.fields.length > 0 && include_fields) {
                q["fields"] = this.fields
            }
            if (this.aggs.length > 0 && include_aggregations) {
                q["aggs"] = {};
                for (var i = 0; i < this.aggs.length; i++) {
                    var agg = this.aggs[i];
                    $.extend(q.aggs, agg.objectify())
                }
            }
            return q
        };
        es.Query.prototype.toString = function queryToString() {
            return JSON.stringify(this.objectify())
        };
        this.parse = function(obj) {
            function parseBool(bool, target) {
                if (bool.must) {
                    for (var i = 0; i < bool.must.length; i++) {
                        var type = Object.keys(bool.must[i])[0];
                        var fil = es.filterFactory(type, {
                            raw: bool.must[i]
                        });
                        if (fil) {
                            target.addMust(fil)
                        }
                    }
                }
            }

            function parseQuery(q, target) {
                var keys = Object.keys(q);
                for (var i = 0; i < keys.length; i++) {
                    var type = keys[i];
                    var impl = es.filterFactory(type, {
                        raw: q[type]
                    });
                    if (impl) {
                        if (type === "query_string") {
                            target.setQueryString(impl)
                        }
                    }
                }
            }
            if (obj.query) {
                if (obj.query.filtered) {
                    this.filtered = true;
                    var bool = obj.query.filtered.filter.bool;
                    if (bool) {
                        parseBool(bool, this)
                    }
                    var q = obj.query.filtered.query;
                    parseQuery(q, this)
                } else {
                    var q = obj.query;
                    parseQuery(q, this)
                }
            }
            if (obj.size) {
                this.size = obj.size
            }
            if (obj.from) {
                this.from = obj.from
            }
            if (obj.fields) {
                this.fields = obj.fields
            }
            if (obj.sort) {
                for (var i = 0; i < obj.sort.length; i++) {
                    var so = obj.sort[i];
                    this.addSortBy(es.newSort({
                        raw: so
                    }))
                }
            }
            if (obj.aggs || obj.aggregations) {
                var aggs = obj.aggs ? obj.aggs : obj.aggregations;
                var anames = Object.keys(aggs);
                for (var i = 0; i < anames.length; i++) {
                    var name = anames[i];
                    var agg = aggs[name];
                    var type = Object.keys(agg)[0];
                    var raw = {};
                    raw[name] = agg;
                    var oa = es.aggregationFactory(type, {
                        raw: raw
                    });
                    if (oa) {
                        this.addAggregation(oa)
                    }
                }
            }
        };
        if (params.queryString) {
            this.setQueryString(params.queryString)
        }
        if (params.sort) {
            this.setSortBy(params.sort)
        }
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newQueryString: function(params) {
        if (!params) {
            params = {}
        }
        return new es.QueryString(params)
    },
    QueryString: function(params) {
        this.queryString = params.queryString || false;
        this.defaultField = params.defaultField || false;
        this.defaultOperator = params.defaultOperator || "OR";
        this.fuzzify = params.fuzzify || false;
        this.escapeSet = params.escapeSet || es.specialCharsSubSet;
        this.pairs = params.pairs || es.characterPairs;
        this.unEscapeSet = params.unEscapeSet || es.specialChars;
        this.objectify = function() {
            var qs = this._escape(this._fuzzify(this.queryString));
            var obj = {
                query_string: {
                    query: qs
                }
            };
            if (this.defaultOperator) {
                obj.query_string["default_operator"] = this.defaultOperator
            }
            if (this.defaultField) {
                obj.query_string["default_field"] = this.defaultField
            }
            return obj
        };
        this.parse = function(obj) {
            if (obj.query_string) {
                obj = obj.query_string
            }
            this.queryString = this._unescape(obj.query);
            if (obj.default_operator) {
                this.defaultOperator = obj.default_operator
            }
            if (obj.default_field) {
                this.defaultField = obj.default_field
            }
        };
        this._fuzzify = function(str) {
            if (!this.fuzzify || !(this.fuzzify === "*" || this.fuzzify === "~")) {
                return str
            }
            if (!(str.indexOf("*") === -1 && str.indexOf("~") === -1 && str.indexOf(":") === -1)) {
                return str
            }
            var pq = "";
            var optparts = str.split(" ");
            for (var i = 0; i < optparts.length; i++) {
                var oip = optparts[i];
                if (oip.length > 0) {
                    oip = oip + this.fuzzify;
                    this.fuzzify == "*" ? oip = "*" + oip : false;
                    pq += oip + " "
                }
            }
            return pq
        };
        this._escapeRegExp = function(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
        };
        this._replaceAll = function(string, find, replace) {
            return string.replace(new RegExp(this._escapeRegExp(find), "g"), replace)
        };
        this._unReplaceAll = function(string, find) {
            return string.replace(new RegExp("\\\\(" + this._escapeRegExp(find) + ")", "g"), "$1")
        };
        this._paired = function(string, pair) {
            var matches = string.match(new RegExp(this._escapeRegExp(pair), "g")) || [];
            return matches.length % 2 === 0
        };
        this._escape = function(str) {
            var scs = this.escapeSet.slice(0);
            for (var i = 0; i < this.pairs.length; i++) {
                var char = this.pairs[i];
                if (!this._paired(str, char)) {
                    scs.push(char)
                }
            }
            for (var i = 0; i < scs.length; i++) {
                var char = scs[i];
                str = this._replaceAll(str, char, "\\" + char)
            }
            return str
        };
        this._unescape = function(str) {
            for (var i = 0; i < this.unEscapeSet.length; i++) {
                var char = this.unEscapeSet[i];
                str = this._unReplaceAll(str, char)
            }
            return str
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newSort: function(params) {
        if (!params) {
            params = {}
        }
        return new es.Sort(params)
    },
    Sort: function(params) {
        this.field = params.field || "_score";
        this.order = params.order || "desc";
        this.objectify = function() {
            var obj = {};
            obj[this.field] = {
                order: this.order
            };
            return obj
        };
        this.parse = function(obj) {
            this.field = Object.keys(obj)[0];
            if (obj[this.field].order) {
                this.order = obj[this.field].order
            }
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newAggregation: function(params) {
        if (!params) {
            params = {}
        }
        return new es.Aggregation(params)
    },
    Aggregation: function(params) {
        this.name = params.name;
        this.aggs = params.aggs || [];
        this.addAggregation = function(agg) {
            for (var i = 0; i < this.aggs.length; i++) {
                if (this.aggs[i].name === agg.name) {
                    return
                }
            }
            this.aggs.push(agg)
        };
        this.removeAggregation = function() {};
        this.clearAggregations = function() {};
        this._make_aggregation = function(type, body) {
            var obj = {};
            obj[this.name] = {};
            obj[this.name][type] = body;
            if (this.aggs.length > 0) {
                obj[this.name]["aggs"] = {};
                for (var i = 0; i < this.aggs.length; i++) {
                    $.extend(obj[this.name]["aggs"], this.aggs[i].objectify())
                }
            }
            return obj
        };
        this._parse_wrapper = function(obj, type) {
            this.name = Object.keys(obj)[0];
            var body = obj[this.name][type];
            var aggs = obj[this.name].aggs ? obj[this.name].aggs : obj[this.name].aggregations;
            if (aggs) {
                var anames = Object.keys(aggs);
                for (var i = 0; i < anames.length; i++) {
                    var name = anames[i];
                    var agg = aggs[anames[i]];
                    var subtype = Object.keys(agg)[0];
                    var raw = {};
                    raw[name] = agg;
                    var oa = es.aggregationFactory(subtype, {
                        raw: raw
                    });
                    if (oa) {
                        this.addAggregation(oa)
                    }
                }
            }
            return body
        }
    },
    newTermsAggregation: function(params) {
        if (!params) {
            params = {}
        }
        es.TermsAggregation.prototype = es.newAggregation(params);
        return new es.TermsAggregation(params)
    },
    TermsAggregation: function(params) {
        this.field = params.field || false;
        this.size = params.size || 10;
        this.orderBy = "_count";
        if (params.orderBy) {
            this.orderBy = params.orderBy;
            if (this.orderBy[0] !== "_") {
                this.orderBy = "_" + this.orderBy
            }
        }
        this.orderDir = params.orderDir || "desc";
        this.setOrdering = function(orderBy, orderDir) {
            this.orderBy = orderBy;
            if (this.orderBy[0] !== "_") {
                this.orderBy = "_" + this.orderBy
            }
            this.orderDir = orderDir
        };
        this.objectify = function() {
            var body = {
                field: this.field,
                size: this.size,
                order: {}
            };
            body.order[this.orderBy] = this.orderDir;
            return this._make_aggregation("terms", body)
        };
        this.parse = function(obj) {
            var body = this._parse_wrapper(obj, "terms");
            this.field = body.field;
            if (body.size) {
                this.size = body.size
            }
            if (body.order) {
                this.orderBy = Object.keys(body.order)[0];
                this.orderDir = body.order[this.orderBy]
            }
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newCardinalityAggregation: function(params) {
        if (!params) {
            params = {}
        }
        es.CardinalityAggregation.prototype = es.newAggregation(params);
        return new es.CardinalityAggregation(params)
    },
    CardinalityAggregation: function(params) {
        this.field = es.getParam(params.field, false);
        this.objectify = function() {
            var body = {
                field: this.field
            };
            return this._make_aggregation("cardinality", body)
        };
        this.parse = function(obj) {
            var body = this._parse_wrapper(obj, "cardinality");
            this.field = body.field
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newRangeAggregation: function(params) {
        if (!params) {
            params = {}
        }
        es.RangeAggregation.prototype = es.newAggregation(params);
        return new es.RangeAggregation(params)
    },
    RangeAggregation: function(params) {
        this.field = params.field || false;
        this.ranges = params.ranges || [];
        this.objectify = function() {
            var body = {
                field: this.field,
                ranges: this.ranges
            };
            return this._make_aggregation("range", body)
        };
        this.parse = function(obj) {
            var body = this._parse_wrapper(obj, "range");
            this.field = body.field;
            this.ranges = body.ranges
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newGeoDistanceAggregation: function(params) {
        if (!params) {
            params = {}
        }
        es.GeoDistanceAggregation.prototype = es.newAggregation(params);
        return new es.GeoDistanceAggregation(params)
    },
    GeoDistanceAggregation: function(params) {
        this.field = params.field || false;
        this.lat = params.lat || false;
        this.lon = params.lon || false;
        this.unit = params.unit || "m";
        this.distance_type = params.distance_type || "sloppy_arc";
        this.ranges = params.ranges || [];
        this.objectify = function() {
            var body = {
                field: this.field,
                origin: {
                    lat: this.lat,
                    lon: this.lon
                },
                unit: this.unit,
                distance_type: this.distance_type,
                ranges: this.ranges
            };
            return this._make_aggregation("geo_distance", body)
        };
        this.parse = function(obj) {
            var body = this._parse_wrapper(obj, "range");
            this.field = body.field;
            var origin = body.origin;
            if (origin.lat) {
                this.lat = origin.lat
            }
            if (origin.lon) {
                this.lon = origin.lon
            }
            if (body.unit) {
                this.unit = body.unit
            }
            if (body.distance_type) {
                this.distance_type = body.distance_type
            }
            this.ranges = body.ranges
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newStatsAggregation: function(params) {
        if (!params) {
            params = {}
        }
        es.StatsAggregation.prototype = es.newAggregation(params);
        return new es.StatsAggregation(params)
    },
    StatsAggregation: function(params) {
        this.field = params.field || false;
        this.objectify = function() {
            var body = {
                field: this.field
            };
            return this._make_aggregation("stats", body)
        };
        this.parse = function(obj) {};
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newDateHistogramAggregation: function(params) {
        if (!params) {
            params = {}
        }
        es.DateHistogramAggregation.prototype = es.newAggregation(params);
        return new es.DateHistogramAggregation(params)
    },
    DateHistogramAggregation: function(params) {
        this.field = params.field || false;
        this.interval = params.interval || "month";
        this.format = params.format || false;
        this.objectify = function() {
            var body = {
                field: this.field,
                interval: this.interval
            };
            if (this.format) {
                body["format"] = this.format
            }
            return this._make_aggregation("date_histogram", body)
        };
        this.parse = function(obj) {
            var body = this._parse_wrapper(obj, "date_histogram");
            this.field = body.field;
            if (body.interval) {
                this.interval = body.interval
            }
            if (body.format) {
                this.format = body.format
            }
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newFilter: function(params) {
        if (!params) {
            params = {}
        }
        return new es.Filter(params)
    },
    Filter: function(params) {
        this.field = params.field;
        this.type_name = params.type_name;
        this.matches = function(other) {
            if (other.type_name !== this.type_name) {
                return false
            }
            if (other.field && other.field !== this.field) {
                return false
            }
            return true
        };
        this.objectify = function() {};
        this.parse = function() {}
    },
    newTermFilter: function(params) {
        if (!params) {
            params = {}
        }
        params.type_name = "term";
        es.TermFilter.prototype = es.newFilter(params);
        return new es.TermFilter(params)
    },
    TermFilter: function(params) {
        this.value = params.value || false;
        this.matches = function(other) {
            var pm = Object.getPrototypeOf(this).matches.call(this, other);
            if (!pm) {
                return false
            }
            if (other.value && other.value !== this.value) {
                return false
            }
            return true
        };
        this.objectify = function() {
            var obj = {
                term: {}
            };
            obj.term[this.field] = this.value;
            return obj
        };
        this.parse = function(obj) {
            if (obj.term) {
                obj = obj.term
            }
            this.field = Object.keys(obj)[0];
            this.value = obj[this.field]
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newTermsFilter: function(params) {
        if (!params) {
            params = {}
        }
        params.type_name = "terms";
        es.TermsFilter.prototype = es.newFilter(params);
        return new es.TermsFilter(params)
    },
    TermsFilter: function(params) {
        this.values = params.values || false;
        this.execution = params.execution || false;
        this.matches = function(other) {
            var pm = Object.getPrototypeOf(this).matches.call(this, other);
            if (!pm) {
                return false
            }
            if (other.values) {
                if (other.values.length !== this.values.length) {
                    return false
                }
                for (var i = 0; i < other.values.length; i++) {
                    if ($.inArray(other.values[i], this.values) === -1) {
                        return false
                    }
                }
            }
            return true
        };
        this.objectify = function() {
            var val = this.values || [];
            var obj = {
                terms: {}
            };
            obj.terms[this.field] = val;
            if (this.execution) {
                obj.terms["execution"] = this.execution
            }
            return obj
        };
        this.parse = function(obj) {
            if (obj.terms) {
                obj = obj.terms
            }
            this.field = Object.keys(obj)[0];
            this.values = obj[this.field];
            if (obj.execution) {
                this.execution = obj.execution
            }
        };
        this.add_term = function(term) {
            if (!this.values) {
                this.values = []
            }
            if ($.inArray(term, this.values) === -1) {
                this.values.push(term)
            }
        };
        this.has_term = function(term) {
            if (!this.values) {
                return false
            }
            return $.inArray(term, this.values) >= 0
        };
        this.remove_term = function(term) {
            if (!this.values) {
                return
            }
            var idx = $.inArray(term, this.values);
            if (idx >= 0) {
                this.values.splice(idx, 1)
            }
        };
        this.has_terms = function() {
            return this.values !== false && this.values.length > 0
        };
        this.term_count = function() {
            return this.values === false ? 0 : this.values.length
        };
        this.clear_terms = function() {
            this.values = false
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newRangeFilter: function(params) {
        if (!params) {
            params = {}
        }
        params.type_name = "range";
        es.RangeFilter.prototype = es.newFilter(params);
        return new es.RangeFilter(params)
    },
    RangeFilter: function(params) {
        this.lt = es.getParam(params.lt, false);
        this.lte = es.getParam(params.lte, false);
        this.gte = es.getParam(params.gte, false);
        this.matches = function(other) {
            var pm = Object.getPrototypeOf(this).matches.call(this, other);
            if (!pm) {
                return false
            }
            if (other.lt) {
                if (other.lt !== this.lt) {
                    return false
                }
            }
            if (other.lte) {
                if (other.lte !== this.lte) {
                    return false
                }
            }
            if (other.gte) {
                if (other.gte !== this.gte) {
                    return false
                }
            }
            return true
        };
        this.objectify = function() {
            var obj = {
                range: {}
            };
            obj.range[this.field] = {};
            if (this.lte !== false) {
                obj.range[this.field]["lte"] = this.lte
            }
            if (this.lt !== false && this.lte === false) {
                obj.range[this.field]["lt"] = this.lt
            }
            if (this.gte !== false) {
                obj.range[this.field]["gte"] = this.gte
            }
            return obj
        };
        this.parse = function(obj) {
            if (obj.range) {
                obj = obj.range
            }
            this.field = Object.keys(obj)[0];
            if (obj[this.field].lte !== undefined && obj[this.field].lte !== false) {
                this.lte = obj[this.field].lte
            }
            if (obj[this.field].lt !== undefined && obj[this.field].lt !== false) {
                this.lt = obj[this.field].lt
            }
            if (obj[this.field].gte !== undefined && obj[this.field].gte !== false) {
                this.gte = obj[this.field].gte
            }
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newGeoDistanceRangeFilter: function(params) {
        if (!params) {
            params = {}
        }
        params.type_name = "geo_distance_range";
        es.GeoDistanceRangeFilter.prototype = es.newFilter(params);
        return new es.GeoDistanceRangeFilter(params)
    },
    GeoDistanceRangeFilter: function(params) {
        this.lt = params.lt || false;
        this.gte = params.gte || false;
        this.lat = params.lat || false;
        this.lon = params.lon || false;
        this.unit = params.unit || "m";
        this.objectify = function() {
            var obj = {
                geo_distance_range: {}
            };
            obj.geo_distance_range[this.field] = {
                lat: this.lat,
                lon: this.lon
            };
            if (this.lt) {
                obj.geo_distance_range["lt"] = this.lt + this.unit
            }
            if (this.gte) {
                obj.geo_distance_range["gte"] = this.gte + this.unit
            }
            return obj
        };
        this.parse = function(obj) {
            function endsWith(str, suffix) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1
            }

            function splitUnits(str) {
                var unit = false;
                for (var i = 0; i < es.distanceUnits.length; i++) {
                    var cu = es.distanceUnits[i];
                    if (endsWith(str, cu)) {
                        str = str.substring(0, str.length - cu.length);
                        unit = str.substring(str.length - cu.length)
                    }
                }
                return [str, unit]
            }
            if (obj.geo_distance_range) {
                obj = obj.geo_distance_range
            }
            this.field = Object.keys(obj)[0];
            this.lat = obj[this.field].lat;
            this.lon = obj[this.field].lon;
            var lt = obj[this.field].lt;
            var gte = obj[this.field].gte;
            if (lt) {
                lt = lt.trim();
                var parts = splitUnits(lt);
                this.lt = parts[0];
                this.unit = parts[1]
            }
            if (gte) {
                gte = gte.trim();
                var parts = splitUnits(gte);
                this.gte = parts[0];
                this.unit = parts[1]
            }
        };
        if (params.raw) {
            this.parse(params.raw)
        }
    },
    newResult: function(params) {
        if (!params) {
            params = {}
        }
        return new es.Result(params)
    },
    Result: function(params) {
        this.data = params.raw;
        this.buckets = function(agg_name) {
            return this.data.aggregations[agg_name].buckets
        };
        this.aggregation = function(agg_name) {
            return this.data.aggregations[agg_name]
        };
        this.results = function() {
            var res = [];
            if (this.data.hits && this.data.hits.hits) {
                for (var i = 0; i < this.data.hits.hits.length; i++) {
                    var source = this.data.hits.hits[i];
                    if ("_source" in source) {
                        res.push(source._source)
                    } else if ("fields" in source) {
                        res.push(source.fields)
                    }
                }
            }
            return res
        };
        this.total = function() {
            if (this.data.hits && this.data.hits.total) {
                return parseInt(this.data.hits.total)
            }
            return false
        }
    },
    doQuery: function(params) {
        var success = params.success;
        var complete = params.complete;
        var search_url = params.search_url;
        var queryobj = params.queryobj;
        var datatype = params.datatype;
        var querystring = JSON.stringify(queryobj);
        $.ajax({
            type: "get",
            url: search_url,
            data: {
                source: querystring
            },
            dataType: datatype,
            success: es.querySuccess(success),
            complete: complete
        })
    },
    querySuccess: function(callback) {
        return function(data) {
            var result = es.newResult({
                raw: data
            });
            callback(result)
        }
    },
    getParam: function(value, def) {
        return value !== undefined ? value : def
    }
};
(function($) {
    $.fn.bindWithDelay = function(type, data, fn, timeout, throttle) {
        var wait = null;
        var that = this;
        if ($.isFunction(data)) {
            throttle = timeout;
            timeout = fn;
            fn = data;
            data = undefined
        }

        function cb() {
            var e = $.extend(true, {}, arguments[0]);
            var throttler = function() {
                wait = null;
                fn.apply(that, [e])
            };
            if (!throttle) {
                clearTimeout(wait)
            }
            if (!throttle || !wait) {
                wait = setTimeout(throttler, timeout)
            }
        }
        return this.bind(type, data, cb)
    }
})(jQuery);
var muk = {
    activeEdges: {},
    yearRanges: function(boundaries, lookback) {
        var keys = Object.keys(boundaries);
        var now = moment();
        var ranges = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var boundary = boundaries[key];
            var tyb = moment(now.year() + "-" + boundary, "YYYY-MM-DD");
            var upper = false;
            var lower = false;
            if (now <= tyb) {
                upper = moment(tyb).subtract(1, "day");
                lower = moment(tyb).subtract(1, "year")
            } else {
                upper = moment(tyb).add(1, "year").subtract(1, "day");
                lower = moment(tyb)
            }
            var prefixes = Object.keys(lookback);
            for (var j = 0; j < prefixes.length; j++) {
                var prefix = prefixes[j];
                var offset = lookback[prefix];
                var name = prefix + key;
                if (offset === 0) {
                    ranges[name] = [lower, upper]
                } else {
                    ranges[name] = [moment(lower).subtract(offset, "year"), moment(upper).subtract(offset, "year")]
                }
            }
        }
        return ranges
    },
    toIntFormat: function() {
        return edges.numFormat({
            decimalPlaces: 0,
            thousandsSeparator: ","
        })
    },
    toGBPIntFormat: function() {
        return edges.numFormat({
            prefix: "£",
            decimalPlaces: 0,
            thousandsSeparator: ","
        })
    }
};
var edges = {
    newEdge: function(params) {
        if (!params) {
            params = {}
        }
        return new edges.Edge(params)
    },
    Edge: function(params) {
        this.selector = params.selector || "body";
        this.search_url = edges.getParam(params.search_url, false);
        this.datatype = params.datatype || "jsonp";
        this.preflightQueries = edges.getParam(params.preflightQueries, false);
        this.baseQuery = params.baseQuery || false;
        this.openingQuery = params.openingQuery || es.newQuery();
        this.secondaryQueries = edges.getParam(params.secondaryQueries, false);
        this.initialSearch = edges.getParam(params.initialSearch, true);
        this.staticFiles = edges.getParam(params.staticFiles, []);
        this.manageUrl = params.manageUrl || false;
        this.urlQuerySource = params.urlQuerySource || "source";
        this.template = params.template || false;
        this.components = params.components || [];
        this.renderPacks = params.renderPacks || [edges.bs3, edges.nvd3, edges.highcharts, edges.google, edges.d3];
        this.urlQuery = false;
        this.urlParams = {};
        this.shortUrl = false;
        this.currentQuery = false;
        this.result = false;
        this.preflightResults = {};
        this.realisedSecondaryQueries = {};
        this.secondaryResults = {};
        this.searching = false;
        this.context = false;
        this.static = {};
        this.resources = {};
        this.errorLoadingStatic = [];
        this.startup = function() {
            this.context = $(this.selector);
            this.context.trigger("edges:pre-init");
            if (this.manageUrl) {
                var urlParams = this.getUrlParams();
                if (this.urlQuerySource in urlParams) {
                    this.urlQuery = es.newQuery({
                        raw: urlParams[this.urlQuerySource]
                    });
                    delete urlParams[this.urlQuerySource]
                }
                this.urlParams = urlParams
            }
            if (this.template) {
                this.template.draw(this)
            }
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                component.init(this)
            }
            this.draw();
            var onward = edges.objClosure(this, "startupPart2");
            this.loadStaticsAsync(onward)
        };
        this.startupPart2 = function() {
            var onward = edges.objClosure(this, "startupPart3");
            this.runPreflightQueries(onward)
        };
        this.startupPart3 = function() {
            var requestedQuery = this.openingQuery;
            if (this.urlQuery) {
                requestedQuery = this.urlQuery;
                this.urlQuery = false
            }
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                component.contrib(requestedQuery)
            }
            this.pushQuery(requestedQuery);
            this.context.trigger("edges:post-init");
            this.cycle()
        };
        this.doQuery = function() {
            this.cycle()
        };
        this.cycle = function() {
            if (this.searching) {
                return
            }
            this.searching = true;
            this.shortUrl = false;
            this.context.trigger("edges:pre-query");
            if (this.manageUrl) {
                this.updateUrl()
            }
            if (this.search_url) {
                var onward = edges.objClosure(this, "cyclePart2");
                this.doPrimaryQuery(onward)
            } else {
                this.cyclePart2()
            }
        };
        this.cyclePart2 = function() {
            var onward = edges.objClosure(this, "cyclePart3");
            this.runSecondaryQueries(onward)
        };
        this.cyclePart3 = function() {
            this.synchronise();
            this.context.trigger("edges:pre-render");
            this.draw();
            this.context.trigger("edges:post-render");
            this.searching = false
        };
        this.synchronise = function() {
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                component.synchronise()
            }
        };
        this.draw = function() {
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                component.draw(this)
            }
        };
        this.reset = function() {
            this.context.trigger("edges:pre-reset");
            var requestedQuery = this.cloneOpeningQuery();
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                component.contrib(requestedQuery)
            }
            this.pushQuery(requestedQuery);
            this.context.trigger("edges:post-reset");
            this.cycle()
        };
        this.cloneQuery = function() {
            if (this.currentQuery) {
                return $.extend(true, {}, this.currentQuery)
            }
            return false
        };
        this.pushQuery = function(query) {
            if (this.baseQuery) {
                query.merge(this.baseQuery)
            }
            this.currentQuery = query
        };
        this.cloneBaseQuery = function() {
            if (this.baseQuery) {
                return $.extend(true, {}, this.baseQuery)
            }
            return es.newQuery()
        };
        this.cloneOpeningQuery = function() {
            if (this.openingQuery) {
                return $.extend(true, {}, this.openingQuery)
            }
            return es.newQuery()
        };
        this.doPrimaryQuery = function(callback) {
            var context = {
                callback: callback
            };
            es.doQuery({
                search_url: this.search_url,
                queryobj: this.currentQuery.objectify(),
                datatype: this.datatype,
                success: edges.objClosure(this, "querySuccess", ["result"], context),
                error: edges.objClosure(this, "queryFail", context)
            })
        };
        this.queryFail = function(params) {
            var callback = params.context;
            this.context.trigger("edges:query-fail");
            callback()
        };
        this.querySuccess = function(params) {
            this.result = params.result;
            var callback = params.callback;
            this.context.trigger("edges:query-success");
            callback()
        };
        this.runPreflightQueries = function(callback) {
            if (!this.preflightQueries || Object.keys(this.preflightQueries).length == 0) {
                callback();
                return
            }
            this.context.trigger("edges:pre-preflight");
            var entries = [];
            var ids = Object.keys(this.preflightQueries);
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                entries.push({
                    id: id,
                    query: this.preflightQueries[id]
                })
            }
            var that = this;
            var pg = edges.newAsyncGroup({
                list: entries,
                action: function(params) {
                    var entry = params.entry;
                    var success = params.success_callback;
                    var error = params.error_callback;
                    es.doQuery({
                        search_url: that.search_url,
                        queryobj: entry.query.objectify(),
                        datatype: that.datatype,
                        success: success,
                        error: error
                    })
                },
                successCallbackArgs: ["result"],
                success: function(params) {
                    var result = params.result;
                    var entry = params.entry;
                    that.preflightResults[entry.id] = result
                },
                errorCallbackArgs: ["result"],
                error: function(params) {
                    that.context.trigger("edges:error-preflight")
                },
                carryOn: function() {
                    that.context.trigger("edges:post-preflight");
                    callback()
                }
            });
            pg.process()
        };
        this.runSecondaryQueries = function(callback) {
            this.realisedSecondaryQueries = {};
            if (!this.secondaryQueries || Object.keys(this.secondaryQueries).length == 0) {
                callback();
                return
            }
            var entries = [];
            for (var key in this.secondaryQueries) {
                var entry = {};
                entry["query"] = this.secondaryQueries[key](this);
                entry["id"] = key;
                entries.push(entry);
                this.realisedSecondaryQueries[key] = entry.query
            }
            var that = this;
            var pg = edges.newAsyncGroup({
                list: entries,
                action: function(params) {
                    var entry = params.entry;
                    var success = params.success_callback;
                    var error = params.error_callback;
                    es.doQuery({
                        search_url: that.search_url,
                        queryobj: entry.query.objectify(),
                        datatype: that.datatype,
                        success: success,
                        complete: false
                    })
                },
                successCallbackArgs: ["result"],
                success: function(params) {
                    var result = params.result;
                    var entry = params.entry;
                    that.secondaryResults[entry.id] = result
                },
                errorCallbackArgs: ["result"],
                error: function(params) {},
                carryOn: function() {
                    callback()
                }
            });
            pg.process()
        };
        this.getComponent = function(params) {
            var id = params.id;
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                if (component.id === id) {
                    return component
                }
            }
            return false
        };
        this.category = function(cat) {
            var comps = [];
            for (var i = 0; i < this.components.length; i++) {
                var component = this.components[i];
                if (component.category === cat) {
                    comps.push(component)
                }
            }
            return comps
        };
        this.getRenderPackObject = function(oname, params) {
            for (var i = 0; i < this.renderPacks.length; i++) {
                var rp = this.renderPacks[i];
                if (rp && rp.hasOwnProperty(oname)) {
                    return rp[oname](params)
                }
            }
        };
        this.jq = function(selector) {
            return $(selector, this.context)
        };
        this.getUrlParams = function() {
            var params = {};
            var url = window.location.href;
            var fragment = false;
            if (url.indexOf("#") > -1) {
                fragment = url.slice(url.indexOf("#"));
                url = url.substring(0, url.indexOf("#"))
            }
            var args = url.slice(url.indexOf("?") + 1).split("&");
            for (var i = 0; i < args.length; i++) {
                var kv = args[i].split("=");
                if (kv.length === 2) {
                    var val = decodeURIComponent(kv[1]);
                    if (val[0] == "[" || val[0] == "{") {
                        val = val.replace(/^"/, "").replace(/"$/, "");
                        val = JSON.parse(val)
                    }
                    params[kv[0]] = val
                }
            }
            if (fragment) {
                params["#"] = fragment
            }
            return params
        };
        this.urlQueryArg = function(objectify_options) {
            if (!objectify_options) {
                objectify_options = {
                    include_query_string: true,
                    include_filters: true,
                    include_paging: true,
                    include_sort: true,
                    include_fields: false,
                    include_aggregations: false,
                    include_facets: false
                }
            }
            var q = JSON.stringify(this.currentQuery.objectify(objectify_options));
            var obj = {};
            obj[this.urlQuerySource] = encodeURIComponent(q);
            return obj
        };
        this.fullQueryArgs = function() {
            var args = $.extend(true, {}, this.urlParams);
            $.extend(args, this.urlQueryArg());
            return args
        };
        this.fullUrlQueryString = function() {
            return this._makeUrlQuery(this.fullQueryArgs())
        };
        this._makeUrlQuery = function(args) {
            var keys = Object.keys(args);
            var entries = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var val = args[key];
                entries.push(key + "=" + val)
            }
            return entries.join("&")
        };
        this.fullUrl = function() {
            var args = this.fullQueryArgs();
            var fragment = "";
            if (args["#"]) {
                fragment = "#" + args["#"];
                delete args["#"]
            }
            var wloc = window.location.toString();
            var bits = wloc.split("?");
            var url = bits[0] + "?" + this._makeUrlQuery(args) + fragment;
            return url
        };
        this.updateUrl = function() {
            if ("pushState" in window.history) {
                var qs = "?" + this.fullUrlQueryString();
                window.history.pushState("", "", qs)
            }
        };
        this.loadStaticsAsync = function(callback) {
            if (!this.staticFiles || this.staticFiles.length == 0) {
                this.context.trigger("edges:post-load-static");
                callback();
                return
            }
            var that = this;
            var pg = edges.newAsyncGroup({
                list: this.staticFiles,
                action: function(params) {
                    var entry = params.entry;
                    var success = params.success_callback;
                    var error = params.error_callback;
                    var id = entry.id;
                    var url = entry.url;
                    var datatype = edges.getParam(entry.datatype, "text");
                    $.ajax({
                        type: "get",
                        url: url,
                        dataType: datatype,
                        success: success,
                        error: error
                    })
                },
                successCallbackArgs: ["data"],
                success: function(params) {
                    var data = params.data;
                    var entry = params.entry;
                    if (entry.processor) {
                        var processed = entry.processor({
                            data: data
                        });
                        that.resources[entry.id] = processed;
                        if (entry.opening) {
                            entry.opening({
                                resource: processed
                            })
                        }
                    }
                    that.static[entry.id] = data
                },
                errorCallbackArgs: ["data"],
                error: function(params) {
                    that.errorLoadingStatic.push(params.entry.id);
                    that.context.trigger("edges:error-load-static")
                },
                carryOn: function() {
                    that.context.trigger("edges:post-load-static");
                    callback()
                }
            });
            pg.process()
        };
        this.startup()
    },
    newAsyncGroup: function(params) {
        if (!params) {
            params = {}
        }
        return new edges.AsyncGroup(params)
    },
    AsyncGroup: function(params) {
        this.list = params.list;
        this.successCallbackArgs = params.successCallbackArgs;
        this.errorCallbackArgs = params.errorCallbackArgs;
        var action = params.action;
        var success = params.success;
        var carryOn = params.carryOn;
        var error = params.error;
        this.functions = {
            action: action,
            success: success,
            carryOn: carryOn,
            error: error
        };
        this.checkList = [];
        this.finished = false;
        this.construct = function(params) {
            for (var i = 0; i < this.list.length; i++) {
                this.checkList.push(0)
            }
        };
        this.process = function(params) {
            if (this.list.length == 0) {
                this.functions.carryOn()
            }
            for (var i = 0; i < this.list.length; i++) {
                var context = {
                    index: i
                };
                var success_callback = edges.objClosure(this, "_actionSuccess", this.successCallbackArgs, context);
                var error_callback = edges.objClosure(this, "_actionError", this.successCallbackArgs, context);
                var complete_callback = false;
                this.functions.action({
                    entry: this.list[i],
                    success_callback: success_callback,
                    error_callback: error_callback,
                    complete_callback: complete_callback
                })
            }
        };
        this._actionSuccess = function(params) {
            var index = params.index;
            delete params.index;
            params["entry"] = this.list[index];
            this.functions.success(params);
            this.checkList[index] = 1;
            if (this._isComplete()) {
                this._finalise()
            }
        };
        this._actionError = function(params) {
            var index = params.index;
            delete params.index;
            params["entry"] = this.list[index];
            this.functions.error(params);
            this.checkList[index] = -1;
            if (this._isComplete()) {
                this._finalise()
            }
        };
        this._actionComplete = function(params) {};
        this._isComplete = function() {
            return $.inArray(0, this.checkList) === -1
        };
        this._finalise = function() {
            if (this.finished) {
                return
            }
            this.finished = true;
            this.functions.carryOn()
        };
        this.construct()
    },
    newRenderer: function(params) {
        if (!params) {
            params = {}
        }
        return new edges.Renderer(params)
    },
    Renderer: function(params) {
        this.component = params.component || false;
        this.init = function(component) {
            this.component = component
        };
        this.draw = function(component) {}
    },
    newComponent: function(params) {
        if (!params) {
            params = {}
        }
        return new edges.Component(params)
    },
    Component: function(params) {
        this.id = params.id;
        this.renderer = params.renderer;
        this.category = params.category || "none";
        this.defaultRenderer = params.defaultRenderer || "newRenderer";
        this.init = function(edge) {
            this.edge = edge;
            this.context = this.edge.jq("#" + this.id);
            if (!this.renderer) {
                this.renderer = this.edge.getRenderPackObject(this.defaultRenderer)
            }
            if (this.renderer) {
                this.renderer.init(this)
            }
        };
        this.draw = function() {
            if (this.renderer) {
                this.renderer.draw()
            }
        };
        this.contrib = function(query) {};
        this.synchronise = function() {};
        this.jq = function(selector) {
            return this.edge.jq(selector)
        }
    },
    newSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.Selector.prototype = edges.newComponent(params);
        return new edges.Selector(params)
    },
    Selector: function(params) {
        this.field = params.field;
        this.display = params.display || this.field;
        this.active = params.active || true;
        this.disabled = params.disabled || false;
        this.category = params.category || "selector"
    },
    newTemplate: function(params) {
        if (!params) {
            params = {}
        }
        return new edges.Template(params)
    },
    Template: function(params) {
        this.draw = function(edge) {}
    },
    objClosure: function(obj, fn, args, context_params) {
        return function() {
            if (args) {
                var params = {};
                for (var i = 0; i < args.length; i++) {
                    if (arguments.length > i) {
                        params[args[i]] = arguments[i]
                    }
                }
                if (context_params) {
                    params = $.extend(params, context_params)
                }
                obj[fn](params)
            } else {
                var slice = Array.prototype.slice;
                var theArgs = slice.apply(arguments);
                if (context_params) {
                    theArgs.push(context_params)
                }
                obj[fn].apply(obj, theArgs)
            }
        }
    },
    eventClosure: function(obj, fn, conditional) {
        return function(event) {
            if (conditional) {
                if (!conditional(event)) {
                    return
                }
            }
            event.preventDefault();
            obj[fn](this)
        }
    },
    css_classes: function(namespace, field, renderer) {
        var cl = namespace + "-" + field;
        if (renderer) {
            cl += " " + cl + "-" + renderer.component.id
        }
        return cl
    },
    css_class_selector: function(namespace, field, renderer) {
        var sel = "." + namespace + "-" + field;
        if (renderer) {
            sel += sel + "-" + renderer.component.id
        }
        return sel
    },
    css_id: function(namespace, field, renderer) {
        var id = namespace + "-" + field;
        if (renderer) {
            id += "-" + renderer.component.id
        }
        return id
    },
    css_id_selector: function(namespace, field, renderer) {
        return "#" + edges.css_id(namespace, field, renderer)
    },
    on: function(selector, event, caller, targetFunction, delay, conditional) {
        if (caller.component && caller.component.id) {
            event = event + "." + caller.component.id
        } else if (caller.namespace) {
            event = event + "." + caller.namespace
        }
        var clos = edges.eventClosure(caller, targetFunction, conditional);
        if (delay) {
            if (caller.component) {
                caller.component.jq(selector).bindWithDelay(event, clos, delay)
            } else if (caller.edge) {
                caller.edge.jq(selector).bindWithDelay(event, clos, delay)
            } else {
                console.log("attempt to bindWithDelay on caller which has neither inner component or edge")
            }
        } else {
            if (caller.component) {
                caller.component.jq(selector).on(event, clos)
            } else if (caller.edge) {
                caller.edge.jq(selector).on(event, clos)
            } else {
                console.log("attempt to bindWithDelay on caller which has neither inner component or edge")
            }
        }
    },
    escapeHtml: function(unsafe, def) {
        if (def === undefined) {
            def = ""
        }
        if (unsafe === undefined || unsafe == null) {
            return def
        }
        try {
            if (typeof unsafe.replace !== "function") {
                return unsafe
            }
            return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
        } catch (err) {
            return def
        }
    },
    objVal: function(path, rec, def) {
        if (def === undefined) {
            def = false
        }
        var bits = path.split(".");
        var val = rec;
        for (var i = 0; i < bits.length; i++) {
            var field = bits[i];
            if (field in val) {
                val = val[field]
            } else {
                return def
            }
        }
        return val
    },
    getParam: function(value, def) {
        return value !== undefined ? value : def
    },
    safeId: function(unsafe) {
        return unsafe.replace(/&/g, "_").replace(/</g, "_").replace(/>/g, "_").replace(/"/g, "_").replace(/'/g, "_").replace(/\./gi, "_").replace(/\:/gi, "_").replace(/\s/gi, "_")
    },
    numFormat: function(params) {
        var prefix = edges.getParam(params.prefix, "");
        var zeroPadding = edges.getParam(params.zeroPadding, false);
        var decimalPlaces = edges.getParam(params.decimalPlaces, false);
        var thousandsSeparator = edges.getParam(params.thousandsSeparator, false);
        var decimalSeparator = edges.getParam(params.decimalSeparator, ".");
        var suffix = edges.getParam(params.suffix, "");
        return function(num) {
            num = parseFloat(num);
            if (decimalPlaces !== false) {
                num = num.toFixed(decimalPlaces)
            } else {
                num = num.toString()
            }
            var bits = num.split(".");
            if (zeroPadding !== false) {
                var zeros = zeroPadding - bits[0].length;
                var pad = "";
                for (var i = 0; i < zeros; i++) {
                    pad += "0"
                }
                bits[0] = pad + bits[0]
            }
            if (thousandsSeparator !== false) {
                bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
            }
            if (bits.length == 1) {
                return prefix + bits[0] + suffix
            } else {
                return prefix + bits[0] + decimalSeparator + bits[1] + suffix
            }
        }
    }
};
$.extend(edges, {
    newNumericRangeEntry: function(params) {
        if (!params) {
            params = {}
        }
        edges.NumericRangeEntry.prototype = edges.newSelector(params);
        return new edges.NumericRangeEntry(params)
    },
    NumericRangeEntry: function(params) {
        this.lower = edges.getParam(params.lower, false);
        this.upper = edges.getParam(params.upper, false);
        this.increment = edges.getParam(params.increment, 1);
        this.defaultRenderer = edges.getParam(params.defaultRenderer, "newNumericRangeEntryRenderer");
        this.from = false;
        this.to = false;
        this.init = function(edge) {
            edges.newSelector().init.call(this, edge);
            if (!this.lower || !this.upper) {
                var bq = this.edge.cloneBaseQuery();
                bq.clearAggregations();
                bq.size = 0;
                bq.addAggregation(es.newStatsAggregation({
                    name: this.id,
                    field: this.field
                }));
                es.doQuery({
                    search_url: this.edge.search_url,
                    queryobj: bq.objectify(),
                    datatype: this.edge.datatype,
                    success: edges.objClosure(this, "querySuccess", ["result"]),
                    error: edges.objClosure(this, "queryFail")
                })
            }
        };
        this.synchronise = function() {
            this.from = this.lower;
            this.to = this.upper;
            if (this.edge.currentQuery) {
                var filters = this.edge.currentQuery.listMust(es.newRangeFilter({
                    field: this.field
                }));
                for (var i = 0; i < filters.length; i++) {
                    this.to = filters[i].lte;
                    this.from = filters[i].gte
                }
            }
        };
        this.querySuccess = function(params) {
            var result = params.result;
            var agg = result.aggregation(this.id);
            if (this.lower === false) {
                this.lower = agg.min
            }
            if (this.upper === false) {
                this.upper = agg.max
            }
            this.draw()
        };
        this.queryFail = function(params) {
            if (this.lower === false) {
                this.lower = 0
            }
            if (this.upper === false) {
                this.upper = 0
            }
        };
        this.selectRange = function(from, to) {
            var nq = this.edge.cloneQuery();
            nq.removeMust(es.newRangeFilter({
                field: this.field
            }));
            if (!(from === this.lower && to === this.upper)) {
                nq.addMust(es.newRangeFilter({
                    field: this.field,
                    gte: from,
                    lte: to
                }))
            }
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        }
    },
    newMultiDateRangeEntry: function(params) {
        if (!params) {
            params = {}
        }
        edges.MultiDateRangeEntry.prototype = edges.newComponent(params);
        return new edges.MultiDateRangeEntry(params)
    },
    MultiDateRangeEntry: function(params) {
        this.display = edges.getParam(params.display, false);
        this.fields = edges.getParam(params.fields, []);
        this.earliest = edges.getParam(params.earliest, {});
        this.latest = edges.getParam(params.latest, {});
        this.autoLookupRange = edges.getParam(params.autoLookupRange, false);
        this.category = edges.getParam(params.category, "selector");
        this.defaultEarliest = edges.getParam(params.defaultEarliest, new Date(0));
        this.defaultLatest = edges.getParam(params.defaultLatest, new Date);
        this.defaultRenderer = edges.getParam(params.defaultRenderer, "newMultiDateRangeRenderer");
        this.currentField = false;
        this.fromDate = false;
        this.toDate = false;
        this.touched = false;
        this.dateOptions = {};
        this.init = function(edge) {
            Object.getPrototypeOf(this).init.call(this, edge);
            this.currentField = this.fields[0].field;
            this.lastField = false;
            if (!this.autoLookupRange) {
                this.loadDates()
            } else {
                if (edge.secondaryQueries === false) {
                    edge.secondaryQueries = {}
                }
                edge.secondaryQueries["multidaterange_" + this.id] = this.getSecondaryQueryFunction()
            }
        };
        this.synchronise = function() {
            this.currentField = false;
            this.fromDate = false;
            this.toDate = false;
            if (this.autoLookupRange) {
                for (var i = 0; i < this.fields.length; i++) {
                    var field = this.fields[i].field;
                    var agg = this.edge.secondaryResults["multidaterange_" + this.id].aggregation(field);
                    var min = this.defaultEarliest;
                    var max = this.defaultLatest;
                    if (agg.min !== null) {
                        min = new Date(agg.min)
                    }
                    if (agg.max !== null) {
                        max = new Date(agg.max)
                    }
                    this.dateOptions[field] = {
                        earliest: min,
                        latest: max
                    }
                }
            }
            for (var i = 0; i < this.fields.length; i++) {
                var field = this.fields[i].field;
                var filters = this.edge.currentQuery.listMust(es.newRangeFilter({
                    field: field
                }));
                if (filters.length > 0) {
                    this.currentField = field;
                    var filter = filters[0];
                    this.fromDate = filter.gte;
                    this.toDate = filter.lt
                }
            }
            if (!this.currentField && this.fields.length > 0) {
                this.currentField = this.fields[0].field
            }
        };
        this.currentEarliest = function() {
            if (!this.currentField) {
                return false
            }
            if (this.dateOptions[this.currentField]) {
                return this.dateOptions[this.currentField].earliest
            }
        };
        this.currentLatest = function() {
            if (!this.currentField) {
                return false
            }
            if (this.dateOptions[this.currentField]) {
                return this.dateOptions[this.currentField].latest
            }
        };
        this.changeField = function(newField) {
            this.lastField = this.currentField;
            if (newField !== this.currentField) {
                this.touched = true;
                this.currentField = newField
            }
        };
        this.setFrom = function(from) {
            if (from !== this.fromDate) {
                this.touched = true;
                this.fromDate = from
            }
        };
        this.setTo = function(to) {
            if (to !== this.toDate) {
                this.touched = true;
                this.toDate = to
            }
        };
        this.triggerSearch = function() {
            if (this.touched) {
                this.touched = false;
                var nq = this.edge.cloneQuery();
                var removeCount = 0;
                for (var i = 0; i < this.fields.length; i++) {
                    var fieldName = this.fields[i].field;
                    removeCount += nq.removeMust(es.newRangeFilter({
                        field: fieldName
                    }))
                }
                var addFilter = this.currentField && (this.toDate || this.fromDate);
                var doSearch = removeCount > 0 || addFilter;
                if (!doSearch) {
                    return false
                }
                if (addFilter) {
                    var range = {
                        field: this.currentField
                    };
                    if (this.toDate) {
                        range["lt"] = this.toDate
                    }
                    if (this.fromDate) {
                        range["gte"] = this.fromDate
                    }
                    nq.addMust(es.newRangeFilter(range))
                }
                this.edge.pushQuery(nq);
                this.edge.doQuery();
                return true
            }
        };
        this.loadDates = function() {
            for (var i = 0; i < this.fields.length; i++) {
                var field = this.fields[i].field;
                var early = this.defaultEarliest;
                var late = this.defaultLatest;
                var earlyFn = this.earliest[field];
                var lateFn = this.latest[field];
                if (earlyFn) {
                    early = earlyFn()
                }
                if (lateFn) {
                    late = lateFn()
                }
                this.dateOptions[field] = {
                    earliest: early,
                    latest: late
                }
            }
        };
        this.getSecondaryQueryFunction = function() {
            var that = this;
            return function(edge) {
                var query = edge.cloneQuery();
                for (var i = 0; i < that.fields.length; i++) {
                    var field = that.fields[i];
                    query.removeMust(es.newRangeFilter({
                        field: field.field
                    }))
                }
                query.clearAggregations();
                for (var i = 0; i < that.fields.length; i++) {
                    var field = that.fields[i].field;
                    query.addAggregation(es.newStatsAggregation({
                        name: field,
                        field: field
                    }))
                }
                query.size = 0;
                query.from = 0;
                return query
            }
        }
    }
});
$.extend(edges, {
    nvd3: {
        DataSeriesConversions: {
            toXY: function(data_series) {
                var new_series = [];
                for (var i = 0; i < data_series.length; i++) {
                    var os = data_series[i];
                    var ns = {};
                    ns["key"] = os["key"];
                    ns["values"] = [];
                    for (var j = 0; j < os.values.length; j++) {
                        var vector = os.values[j];
                        ns["values"].push({
                            x: vector.label,
                            y: vector.value
                        })
                    }
                    new_series.push(ns)
                }
                return new_series
            }
        },
        tools: {
            persistingPieColour: function(colours, persistence) {
                if (!colours) {
                    colours = ["#ea6ccb", "#8fc8b0", "#a9cf85", "#d90d4c", "#6c537e", "#64d54f", "#ecc7c4", "#f1712b"]
                }
                if (!persistence) {
                    persistence = {}
                }
                var i = 0;
                return function(d, x) {
                    if (d.label in persistence) {
                        return persistence[d.label]
                    } else {
                        var c = colours[i % (colours.length - 1)];
                        i++;
                        persistence[d.label] = c;
                        return c
                    }
                }
            }
        },
        newPieChartRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.nvd3.PieChartRenderer.prototype = edges.newRenderer(params);
            return new edges.nvd3.PieChartRenderer(params)
        },
        PieChartRenderer: function(params) {
            this.showLabels = edges.getParam(params.showLabels, true);
            this.donut = edges.getParam(params.donut, false);
            this.labelThreshold = params.labelThreshold || .05;
            this.transitionDuration = params.transitionDuration || 500;
            this.noDataMessage = params.noDataMessage || false;
            this.color = params.color || false;
            this.legendPosition = params.legendPosition || "top";
            this.labelsOutside = edges.getParam(params.labelsOutside, false);
            this.valueFormat = params.valueFormat || false;
            this.marginTop = params.marginTop || 30;
            this.marginRight = params.marginRight || 30;
            this.marginBottom = params.marginBottom || 30;
            this.marginLeft = params.marginLeft || 30;
            this.namespace = "edges-nvd3-pie";
            this.draw = function() {
                var displayClasses = edges.css_classes(this.namespace, "display", this);
                var displayFrag = "";
                if (this.component.display) {
                    displayFrag = '<span class="' + displayClasses + '">' + this.component.display + "</span><br>"
                }
                var svgId = edges.css_id(this.namespace, "svg", this);
                var svgSelector = edges.css_id_selector(this.namespace, "svg", this);
                this.component.context.html(displayFrag + '<svg id="' + svgId + '"></svg>');
                var data_series = this.component.dataSeries;
                if (!data_series) {
                    data_series = []
                }
                if (data_series.length > 0) {
                    data_series = data_series[0].values
                } else {
                    data_series = []
                }
                var outer = this;
                nv.addGraph(function() {
                    var chart = nv.models.pieChart().x(function(d) {
                        return d.label
                    }).y(function(d) {
                        return d.value
                    }).showLabels(outer.showLabels).legendPosition(outer.legendPosition).labelsOutside(outer.labelsOutside).margin({
                        left: outer.marginLeft,
                        right: outer.marginRight,
                        top: outer.marginTop,
                        bottom: outer.marginBottom
                    });
                    if (outer.noDataMessage) {
                        chart.noData(outer.noDataMessage)
                    }
                    if (outer.color) {
                        chart.color(outer.color)
                    }
                    if (outer.valueFormat) {
                        chart.valueFormat(outer.valueFormat)
                    }
                    d3.select(svgSelector).datum(data_series).transition().duration(outer.transitionDuration).call(chart);
                    return chart
                })
            }
        },
        newHorizontalMultibarRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.nvd3.HorizontalMultibarRenderer.prototype = edges.newRenderer(params);
            return new edges.nvd3.HorizontalMultibarRenderer(params)
        },
        HorizontalMultibarRenderer: function(params) {
            this.showValues = edges.getParam(params.showValues, true);
            this.toolTips = edges.getParam(params.toolTips, true);
            this.controls = edges.getParam(params.controls, false);
            this.stacked = edges.getParam(params.stacked, false);
            this.legend = edges.getParam(params.legend, true);
            this.color = params.color || false;
            this.noDataMessage = edges.getParam(params.noDataMessage, false);
            this.transitionDuration = params.transitionDuration || 500;
            this.marginTop = params.marginTop || 30;
            this.marginRight = params.marginRight || 50;
            this.marginBottom = params.marginBottom || 50;
            this.marginLeft = params.marginLeft || 200;
            this.yTickFormat = edges.getParam(params.yTickFormat, ",.0f");
            this.xTickFormat = edges.getParam(params.xTickFormat, false);
            this.valueFormat = edges.getParam(params.valueFormat, false);
            this.xAxisLabel = edges.getParam(params.xAxisLabel, false);
            this.yAxisLabel = edges.getParam(params.yAxisLabel, false);
            this.tooltipGenerator = edges.getParam(params.tooltipGenerator, false);
            this.namespace = "edges-nvd3-horizontal-multibar";
            this.draw = function() {
                $(".nvtooltip").remove();
                var svgId = edges.css_id(this.namespace, "svg", this);
                var svgSelector = edges.css_id_selector(this.namespace, "svg", this);
                this.component.context.html('<svg id="' + svgId + '"></svg>');
                var data_series = this.component.dataSeries;
                if (!data_series) {
                    data_series = []
                }
                var that = this;
                nv.addGraph(function() {
                    var chart = nv.models.multiBarHorizontalChart().x(function(d) {
                        return d.label
                    }).y(function(d) {
                        return d.value
                    }).margin({
                        top: that.marginTop,
                        right: that.marginRight,
                        bottom: that.marginBottom,
                        left: that.marginLeft
                    }).showValues(that.showValues).tooltips(that.toolTips).showControls(that.controls).showLegend(that.legend);
                    if (that.stacked) {
                        chart.multibar.stacked(that.stacked)
                    }
                    if (that.yTickFormat) {
                        var fn = that.yTickFormat;
                        if (typeof that.yTickFormat === "string") {
                            fn = d3.format(that.yTickFormat)
                        }
                        chart.yAxis.tickFormat(fn)
                    }
                    if (that.yAxisLabel) {
                        chart.yAxis.axisLabel(that.yAxisLabel)
                    }
                    if (that.xTickFormat) {
                        var fn = that.xTickFormat;
                        if (typeof that.xTickFormat === "string") {
                            fn = d3.format(that.xTickFormat)
                        }
                        chart.xAxis.tickFormat(fn)
                    }
                    if (that.xAxisLabel) {
                        chart.xAxis.axisLabel(that.xAxisLabel)
                    }
                    if (that.valueFormat) {
                        var fn = that.valueFormat;
                        if (typeof that.valueFormat === "string") {
                            fn = d3.format(that.xTickFormat)
                        }
                        chart.valueFormat(fn)
                    }
                    if (that.noDataMessage) {
                        chart.noData(that.noDataMessage)
                    }
                    if (that.color) {
                        chart.color(that.color)
                    }
                    if (that.tooltipGenerator) {
                        chart.tooltip.contentGenerator(that.tooltipGenerator)
                    }
                    d3.select(svgSelector).datum(data_series).transition().duration(that.transitionDuration).call(chart);
                    nv.utils.windowResize(chart.update);
                    return chart
                })
            }
        },
        newMultibarRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.nvd3.MultibarRenderer.prototype = edges.newRenderer(params);
            return new edges.nvd3.MultibarRenderer(params)
        },
        MultibarRenderer: function(params) {
            this.xTickFormat = params.xTickFormat || ",.2f";
            this.yTickFormat = params.yTickFormat || ",.2f";
            this.transitionDuration = params.transitionDuration || 500;
            this.controls = edges.getParam(params.controls, false);
            this.barColor = params.barColor || false;
            this.showLegend = edges.getParam(params.showLegend, true);
            this.xAxisLabel = params.xAxisLabel || "";
            this.yAxisLabel = params.yAxisLabel || "";
            this.namespace = "edges-nvd3-multibar";
            this.draw = function() {
                var displayClasses = edges.css_classes(this.namespace, "display", this);
                var displayFrag = "";
                if (this.component.display) {
                    displayFrag = '<span class="' + displayClasses + '">' + this.component.display + "</span><br>"
                }
                var svgId = edges.css_id(this.namespace, "svg", this);
                var svgSelector = edges.css_id_selector(this.namespace, "svg", this);
                this.component.context.html(displayFrag + '<svg id="' + svgId + '"></svg>');
                var data_series = this.component.dataSeries;
                if (!data_series) {
                    data_series = []
                }
                data_series = edges.nvd3.DataSeriesConversions.toXY(this.component.dataSeries);
                var outer = this;
                nv.addGraph(function() {
                    var chart = nv.models.multiBarChart().showControls(outer.controls);
                    chart.xAxis.axisLabel(outer.xAxisLabel).tickFormat(d3.format(outer.xTickFormat));
                    chart.yAxis.axisLabel(outer.yAxisLabel).tickFormat(d3.format(outer.yTickFormat));
                    if (outer.barColor) {
                        chart.barColor(outer.barColor)
                    }
                    chart.showLegend(outer.showLegend);
                    d3.select(svgSelector).datum(data_series).transition().duration(outer.transitionDuration).call(chart);
                    nv.utils.windowResize(chart.update);
                    return chart
                })
            }
        },
        newSimpleLineChartRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.nvd3.SimpleLineChartRenderer.prototype = edges.newRenderer(params);
            return new edges.nvd3.SimpleLineChartRenderer(params)
        },
        SimpleLineChartRenderer: function(params) {
            this.interactiveGuideline = params.interactiveGuideline || true;
            this.xTickFormat = params.xTickFormat || ",.2f";
            this.yTickFormat = params.yTickFormat || ",.2f";
            this.transitionDuration = params.transitionDuration || 500;
            this.lineColor = params.lineColor || false;
            this.includeOnY = params.includeOnY || false;
            this.showLegend = edges.getParam(params.showLegend, true);
            this.xAxisLabel = params.xAxisLabel || "";
            this.yAxisLabel = params.yAxisLabel || "";
            this.namespace = "edges-nvd3-simple-line-chart";
            this.draw = function() {
                var displayClasses = edges.css_classes(this.namespace, "display", this);
                var displayFrag = "";
                if (this.component.display) {
                    displayFrag = '<span class="' + displayClasses + '">' + this.component.display + "</span><br>"
                }
                var svgId = edges.css_id(this.namespace, "svg", this);
                var svgSelector = edges.css_id_selector(this.namespace, "svg", this);
                this.component.context.html(displayFrag + '<svg id="' + svgId + '"></svg>');
                var data_series = this.component.dataSeries;
                if (!data_series) {
                    data_series = []
                }
                var ds = edges.nvd3.DataSeriesConversions.toXY(data_series);
                var outer = this;
                nv.addGraph(function() {
                    var chart = nv.models.lineChart().useInteractiveGuideline(outer.interactiveGuideline);
                    chart.xAxis.axisLabel(outer.xAxisLabel).tickFormat(d3.format(outer.xTickFormat));
                    if (outer.lineColor) {
                        chart.color(outer.lineColor)
                    }
                    if (outer.includeOnY) {
                        chart.forceY(outer.includeOnY)
                    }
                    chart.yAxis.axisLabel(outer.yAxisLabel).tickFormat(d3.format(outer.yTickFormat));
                    chart.showLegend(outer.showLegend);
                    d3.select(svgSelector).datum(ds).transition().duration(outer.transitionDuration).call(chart);
                    nv.utils.windowResize(chart.update);
                    return chart
                })
            }
        }
    }
});
$.extend(edges, {
    newFilterSetter: function(params) {
        if (!params) {
            params = {}
        }
        edges.FilterSetter.prototype = edges.newComponent(params);
        return new edges.FilterSetter(params)
    },
    FilterSetter: function(params) {
        this.filters = edges.getParam(params.filters, []);
        this.aggregations = edges.getParam(params.aggregations, []);
        this.defaultRenderer = edges.getParam(params.defaultRenderer, "newFilterSetterRenderer");
        this.filter_counts = {};
        this.active_filters = {};
        this.contrib = function(query) {
            for (var i = 0; i < this.aggregations.length; i++) {
                query.addAggregation(this.aggregations[i])
            }
        };
        this.synchronise = function() {
            for (var i = 0; i < this.filters.length; i++) {
                var filter_def = this.filters[i];
                if (!filter_def.agg_name || !filter_def.bucket_field || !filter_def.bucket_value) {
                    continue
                }
                var agg = this.edge.result.aggregation(filter_def.agg_name);
                if (!agg) {
                    continue
                }
                var bfield = filter_def.bucket_field;
                var bvalue = filter_def.bucket_value;
                var count = 0;
                var buckets = agg.buckets;
                for (var k = 0; k < buckets.length; k++) {
                    var bucket = buckets[k];
                    if (bucket[bfield] && bucket[bfield] == bvalue) {
                        count = bucket["doc_count"];
                        break
                    }
                }
                this.filter_counts[filter_def.id] = count
            }
            for (var i = 0; i < this.filters.length; i++) {
                var filter_def = this.filters[i];
                if (!filter_def.must) {
                    continue
                }
                var toactivate = filter_def.must.length;
                var active = 0;
                for (var j = 0; j < filter_def.must.length; j++) {
                    var must = filter_def.must[j];
                    var current = this.edge.currentQuery.listMust(must);
                    if (current.length > 0) {
                        active += 1
                    }
                }
                if (active === toactivate) {
                    this.active_filters[filter_def.id] = true
                } else {
                    this.active_filters[filter_def.id] = false
                }
            }
        };
        this.addFilter = function(filter_id) {
            var filter = false;
            for (var i = 0; i < this.filters.length; i++) {
                if (this.filters[i].id === filter_id) {
                    filter = this.filters[i];
                    break
                }
            }
            if (!filter || !filter.must) {
                return
            }
            var nq = this.edge.cloneQuery();
            for (var i = 0; i < filter.must.length; i++) {
                var must = filter.must[i];
                nq.addMust(must)
            }
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.removeFilter = function(filter_id) {
            var filter = false;
            for (var i = 0; i < this.filters.length; i++) {
                if (this.filters[i].id === filter_id) {
                    filter = this.filters[i];
                    break
                }
            }
            if (!filter || !filter.must) {
                return
            }
            var nq = this.edge.cloneQuery();
            for (var i = 0; i < filter.must.length; i++) {
                var must = filter.must[i];
                nq.removeMust(must)
            }
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        }
    },
    newFullSearchController: function(params) {
        if (!params) {
            params = {}
        }
        edges.FullSearchController.prototype = edges.newComponent(params);
        return new edges.FullSearchController(params)
    },
    FullSearchController: function(params) {
        this.fuzzify = params.fuzzify || false;
        this.sortOptions = params.sortOptions || false;
        this.fieldOptions = params.fieldOptions || false;
        this.urlShortener = params.urlShortener || false;
        this.defaultOperator = params.defaultOperator || "OR";
        this.defaultRenderer = params.defaultRenderer || "newFullSearchControllerRenderer";
        this.searchField = false;
        this.searchString = false;
        this.sortBy = false;
        this.sortDir = "desc";
        this.shortUrl = false;
        this.synchronise = function() {
            this.searchString = false;
            this.searchField = false;
            this.sortBy = false;
            this.sortDir = "desc";
            if (this.edge.currentQuery) {
                var qs = this.edge.currentQuery.getQueryString();
                if (qs) {
                    this.searchString = qs.queryString;
                    this.searchField = qs.defaultField
                }
                var sorts = this.edge.currentQuery.getSortBy();
                if (sorts.length > 0) {
                    this.sortBy = sorts[0].field;
                    this.sortDir = sorts[0].order
                }
            }
        };
        this.setSort = function(params) {
            var dir = params.dir;
            var field = params.field;
            if (dir === undefined || dir === false) {
                dir = "desc"
            }
            var nq = this.edge.cloneQuery();
            nq.setSortBy(es.newSort({
                field: field,
                order: dir
            }));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.changeSortDir = function() {
            var dir = this.sortDir === "asc" ? "desc" : "asc";
            var sort = this.sortBy ? this.sortBy : "_score";
            var nq = this.edge.cloneQuery();
            nq.setSortBy(es.newSort({
                field: sort,
                order: dir
            }));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.setSortBy = function(field) {
            var nq = this.edge.cloneQuery();
            if (!field || field === "") {
                field = "_score"
            }
            nq.setSortBy(es.newSort({
                field: field,
                order: this.sortDir
            }));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.setSearchField = function(field) {
            this.searchField = field;
            if (!this.searchString || this.searchString === "") {
                return
            }
            var nq = this.edge.cloneQuery();
            nq.setQueryString(es.newQueryString({
                queryString: this.searchString,
                defaultField: field,
                defaultOperator: this.defaultOperator,
                fuzzify: this.fuzzify
            }));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.setSearchText = function(text) {
            var nq = this.edge.cloneQuery();
            if (text !== "") {
                var params = {
                    queryString: text,
                    defaultOperator: this.defaultOperator,
                    fuzzify: this.fuzzify
                };
                if (this.searchField && this.searchField !== "") {
                    params["defaultField"] = this.searchField
                }
                nq.setQueryString(es.newQueryString(params))
            } else {
                nq.removeQueryString()
            }
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.clearSearch = function() {
            this.edge.reset()
        }
    },
    newSelectedFilters: function(params) {
        if (!params) {
            params = {}
        }
        edges.SelectedFilters.prototype = edges.newComponent(params);
        return new edges.SelectedFilters(params)
    },
    SelectedFilters: function(params) {
        this.fieldDisplays = edges.getParam(params.fieldDisplays, {});
        this.valueMaps = edges.getParam(params.valueMaps, {});
        this.valueFunctions = edges.getParam(params.valueFunctions, {});
        this.rangeMaps = edges.getParam(params.rangeMaps, {});
        this.rangeFunctions = edges.getParam(params.rangeFunctions, {});
        this.formatUnknownRange = edges.getParam(params.formatUnknownRange, false);
        this.defaultRenderer = edges.getParam(params.defaultRenderer, "newSelectedFiltersRenderer");
        this.mustFilters = {};
        this.searchString = false;
        this.searchField = false;
        this.synchronise = function() {
            this.mustFilters = {};
            this.searchString = false;
            this.searchField = false;
            if (!this.edge.currentQuery) {
                return
            }
            var musts = this.edge.currentQuery.listMust();
            for (var i = 0; i < musts.length; i++) {
                var f = musts[i];
                if (f.type_name === "term") {
                    this._synchronise_term(f)
                } else if (f.type_name === "terms") {
                    this._synchronise_terms(f)
                } else if (f.type_name === "range") {
                    this._synchronise_range(f)
                } else if (f.type_name === "geo_distance_range") {}
            }
            var qs = this.edge.currentQuery.getQueryString();
            if (qs) {
                this.searchString = qs.queryString;
                this.searchField = qs.defaultField
            }
        };
        this.removeFilter = function(boolType, filterType, field, value) {
            var nq = this.edge.cloneQuery();
            if (filterType === "term") {
                var template = es.newTermFilter({
                    field: field,
                    value: value
                });
                if (boolType === "must") {
                    nq.removeMust(template)
                }
            } else if (filterType === "terms") {
                var template = es.newTermsFilter({
                    field: field
                });
                if (boolType === "must") {
                    var filters = nq.listMust(template);
                    for (var i = 0; i < filters.length; i++) {
                        if (filters[i].has_term(value)) {
                            filters[i].remove_term(value)
                        }
                        if (!filters[i].has_terms()) {
                            nq.removeMust(filters[i])
                        }
                    }
                }
            } else if (filterType == "range") {
                var params = {
                    field: field
                };
                if (value.to) {
                    params["lt"] = value.to
                }
                if (value.from) {
                    params["gte"] = value.from
                }
                var template = es.newRangeFilter(params);
                if (boolType === "must") {
                    nq.removeMust(template)
                }
            } else if (filterType == "geo_distance_range") {}
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.clearQueryString = function() {
            var nq = this.edge.cloneQuery();
            nq.removeQueryString();
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.clearSearch = function() {
            this.edge.reset()
        };
        this._synchronise_term = function(filter) {
            var display = this.fieldDisplays[filter.field] || filter.field;
            if (filter.field in this.mustFilters) {
                this.mustFilters[filter.field].values.push({
                    val: filter.value,
                    display: this._translate(filter.field, filter.value)
                })
            } else {
                this.mustFilters[filter.field] = {
                    filter: filter.type_name,
                    display: display,
                    values: [{
                        val: filter.value,
                        display: this._translate(filter.field, filter.value)
                    }],
                    rel: "AND"
                }
            }
        };
        this._synchronise_terms = function(filter) {
            var display = this.fieldDisplays[filter.field] || filter.field;
            var values = [];
            for (var i = 0; i < filter.values.length; i++) {
                var v = filter.values[i];
                var d = this._translate(filter.field, v);
                values.push({
                    val: v,
                    display: d
                })
            }
            this.mustFilters[filter.field] = {
                filter: filter.type_name,
                display: display,
                values: values,
                rel: "OR"
            }
        };
        this._synchronise_range = function(filter) {
            var display = this.fieldDisplays[filter.field] || filter.field;
            var to = filter.lt;
            if (to === false) {
                to = filter.lte
            }
            var from = filter.gte;
            var r = this._getRangeDef(filter.field, from, to);
            var values = [];
            if (!r) {
                values.push({
                    to: to,
                    from: from,
                    display: this._formatUnknown(from, to)
                })
            } else {
                values.push(r)
            }
            this.mustFilters[filter.field] = {
                filter: filter.type_name,
                display: display,
                values: values
            }
        };
        this._translate = function(field, value) {
            if (field in this.valueMaps) {
                if (value in this.valueMaps[field]) {
                    return this.valueMaps[field][value]
                }
            } else if (field in this.valueFunctions) {
                return this.valueFunctions[field](value)
            }
            return value
        };
        this._getRangeDef = function(field, from, to) {
            if (!this.rangeMaps[field] && !this.rangeFunctions[field]) {
                return false
            }
            if (this.rangeMaps[field]) {
                for (var i = 0; i < this.rangeMaps[field].length; i++) {
                    var r = this.rangeMaps[field][i];
                    var frMatch = true;
                    var toMatch = true;
                    if (from && !r.from || !from && r.from) {
                        frMatch = false
                    }
                    if (to && !r.to || !to && r.to) {
                        toMatch = false
                    }
                    if (from && r.from && from !== r.from) {
                        frMatch = false
                    }
                    if (to && r.to && to !== r.to) {
                        toMatch = false
                    }
                    if (frMatch && toMatch) {
                        return r
                    }
                }
            } else if (this.rangeFunctions[field]) {
                var fn = this.rangeFunctions[field];
                return fn({
                    field: field,
                    from: from,
                    to: to
                })
            }
            return false
        };
        this._formatUnknown = function(from, to) {
            if (this.formatUnknownRange) {
                return this.formatUnknownRange(from, to)
            } else {
                if (from !== false || to !== false) {
                    if (from === to) {
                        return from
                    }
                }
                var frag = "";
                if (from !== false) {
                    frag += from
                } else {
                    frag += "< "
                }
                if (to !== false) {
                    if (from !== false) {
                        frag += " - " + to
                    } else {
                        frag += to
                    }
                } else {
                    if (from !== false) {
                        frag += "+"
                    } else {
                        frag = "unknown"
                    }
                }
                return frag
            }
        }
    },
    newPager: function(params) {
        if (!params) {
            params = {}
        }
        edges.Pager.prototype = edges.newComponent(params);
        return new edges.Pager(params)
    },
    Pager: function(params) {
        this.defaultRenderer = params.defaultRenderer || "newPagerRenderer";
        this.from = false;
        this.to = false;
        this.total = false;
        this.page = false;
        this.pageSize = false;
        this.totalPages = false;
        this.synchronise = function() {
            this.from = false;
            this.to = false;
            this.total = false;
            this.page = false;
            this.pageSize = false;
            this.totalPages = false;
            if (this.edge.currentQuery) {
                this.from = parseInt(this.edge.currentQuery.getFrom()) + 1;
                this.pageSize = parseInt(this.edge.currentQuery.getSize())
            }
            if (this.edge.result) {
                this.total = this.edge.result.total()
            }
            if (this.from !== false && this.total !== false) {
                this.to = this.from + this.pageSize - 1;
                this.page = Math.ceil((this.from - 1) / this.pageSize) + 1;
                this.totalPages = Math.ceil(this.total / this.pageSize)
            }
        };
        this.setFrom = function(from) {
            var nq = this.edge.cloneQuery();
            from = from - 1;
            if (from < 0) {
                from = 0
            }
            nq.from = from;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.setSize = function(size) {
            var nq = this.edge.cloneQuery();
            nq.size = size;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.decrementPage = function() {
            var from = this.from - this.pageSize;
            this.setFrom(from)
        };
        this.incrementPage = function() {
            var from = this.from + this.pageSize;
            this.setFrom(from)
        };
        this.goToPage = function(params) {
            var page = params.page;
            var nf = (page - 1) * this.pageSize + 1;
            this.setFrom(nf)
        }
    },
    newSearchingNotification: function(params) {
        if (!params) {
            params = {}
        }
        edges.SearchingNotification.prototype = edges.newComponent(params);
        return new edges.SearchingNotification(params)
    },
    SearchingNotification: function(params) {
        this.defaultRenderer = params.defaultRenderer || "newSearchingNotificationRenderer";
        this.searching = false;
        this.init = function(edge) {
            Object.getPrototypeOf(this).init.call(this, edge);
            edge.context.on("edges:pre-query", edges.eventClosure(this, "searchingBegan"));
            edge.context.on("edges:query-fail", edges.eventClosure(this, "searchingFinished"));
            edge.context.on("edges:query-success", edges.eventClosure(this, "searchingFinished"))
        };
        this.draw = function() {};
        this.searchingBegan = function() {
            this.searching = true;
            this.renderer.draw()
        };
        this.searchingFinished = function() {
            this.searching = false;
            this.renderer.draw()
        }
    },
    newResultsDisplay: function(params) {
        if (!params) {
            params = {}
        }
        edges.ResultsDisplay.prototype = edges.newComponent(params);
        return new edges.ResultsDisplay(params)
    },
    ResultsDisplay: function(params) {
        this.category = params.category || "results";
        this.defaultRenderer = params.defaultRenderer || "newResultsDisplayRenderer";
        this.results = false;
        this.synchronise = function() {
            this.results = [];
            if (this.edge.result) {
                this.results = this.edge.result.results()
            }
        }
    }
});
$.extend(edges, {
    newChart: function(params) {
        if (!params) {
            params = {}
        }
        edges.Chart.prototype = edges.newComponent(params);
        return new edges.Chart(params)
    },
    Chart: function(params) {
        this.category = params.category || "chart";
        this.display = params.display || "";
        this.dataSeries = params.dataSeries || false;
        this.dataFunction = params.dataFunction || false;
        this.dataFunctionClosure = params.dataFunctionClosure || false;
        this.aggregations = params.aggregations || [];
        this.dfArgs = params.dfArgs || {
            useAggregations: [],
            seriesKeys: {}
        };
        this.defaultRenderer = params.defaultRenderer || "newMultibarRenderer";
        this.init = function(edge) {
            edges.newComponent().init.call(this, edge);
            for (var i = 0; i < this.aggregations.length; i++) {
                var agg = this.aggregations[i];
                if ($.inArray(agg.name, this.dfArgs.useAggregations) === -1) {
                    this.dfArgs.useAggregations.push(agg.name)
                }
            }
            if (this.aggregations.length > 0 && this.dataFunctionClosure) {
                this.dataFunction = this.dataFunctionClosure(this.dfArgs)
            }
        };
        this.contrib = function(query) {
            for (var i = 0; i < this.aggregations.length; i++) {
                query.addAggregation(this.aggregations[i])
            }
        };
        this.synchronise = function() {
            if (this.dataFunction) {
                this.dataSeries = this.dataFunction(this)
            }
        }
    },
    ChartDataFunctions: {
        terms: function(params) {
            var useAggregations = params.useAggregations || [];
            var seriesKeys = params.seriesKeys || {};
            return function(ch) {
                var data_series = [];
                if (!ch.edge.result) {
                    return data_series
                }
                for (var i = 0; i < useAggregations.length; i++) {
                    var agg = useAggregations[i];
                    var buckets = ch.edge.result.data.aggregations[agg].buckets;
                    var series = {};
                    series["key"] = seriesKeys[agg];
                    series["values"] = [];
                    for (var j = 0; j < buckets.length; j++) {
                        var doccount = buckets[j].doc_count;
                        var key = buckets[j].key;
                        series.values.push({
                            label: key,
                            value: doccount
                        })
                    }
                    data_series.push(series)
                }
                return data_series
            }
        },
        termsStats: function(params) {
            var useAggregations = params.useAggregations || [];
            var seriesKeys = params.seriesKeys || {};
            var seriesFor = params.seriesFor || [];
            return function(ch) {
                var data_series = [];
                if (!ch.edge.result) {
                    return data_series
                }
                for (var i = 0; i < useAggregations.length; i++) {
                    var agg = useAggregations[i];
                    var parts = agg.split(" ");
                    for (var j = 0; j < seriesFor.length; j++) {
                        var seriesStat = seriesFor[j];
                        var series = {};
                        series["key"] = seriesKeys[agg + " " + seriesStat];
                        series["values"] = [];
                        var buckets = ch.edge.result.data.aggregations[parts[0]].buckets;
                        for (var k = 0; k < buckets.length; k++) {
                            var stats = buckets[k][parts[1]];
                            var key = buckets[k].key;
                            var val = stats[seriesStat];
                            series.values.push({
                                label: key,
                                value: val
                            })
                        }
                        data_series.push(series)
                    }
                }
                return data_series
            }
        },
        recordsXY: function(params) {
            var x = params.x;
            var x_default = params.x_default === undefined ? 0 : params.x_default;
            var y = params.y;
            var y_default = params.y_default === undefined ? 0 : params.y_default;
            var key = params.key;
            return function(ch) {
                var data_series = [];
                if (!ch.edge.result) {
                    return data_series
                }
                var series = {};
                series["key"] = key;
                series["values"] = [];
                var results = ch.edge.result.results();
                for (var i = 0; i < results.length; i++) {
                    var res = results[i];
                    var xval = edges.objVal(x, res, x_default);
                    var yval = edges.objVal(y, res, y_default);
                    series.values.push({
                        label: xval,
                        value: yval
                    })
                }
                data_series.push(series);
                return data_series
            }
        },
        cumulativeXY: function(params) {
            var x = params.x;
            var x_default = params.x_default === undefined ? 0 : params.x_default;
            var y = params.y;
            var y_default = params.y_default === undefined ? 0 : params.y_default;
            var key = params.key;
            var accumulate = params.accumulate || "y";
            return function(ch) {
                var data_series = [];
                if (!ch.edge.result) {
                    return data_series
                }
                var series = {};
                series["key"] = key;
                series["values"] = [];
                var total = 0;
                var results = ch.edge.result.results();
                for (var i = 0; i < results.length; i++) {
                    var res = results[i];
                    var xval = edges.objVal(x, res, x_default);
                    var yval = edges.objVal(y, res, y_default);
                    if (accumulate === "x") {
                        total += xval;
                        series.values.push({
                            label: total,
                            value: yval
                        })
                    } else if (accumulate === "y") {
                        total += yval;
                        series.values.push({
                            label: xval,
                            value: total
                        })
                    }
                }
                data_series.push(series);
                return data_series
            }
        },
        totalledList: function(params) {
            var listPath = params.listPath || "";
            var seriesKey = params.seriesKey || "";
            var keyField = params.keyField || false;
            var valueField = params.valueField || false;
            return function(ch) {
                var data_series = [];
                if (!ch.edge.result) {
                    return data_series
                }
                var series = {};
                series["key"] = seriesKey;
                series["values"] = [];
                var counter = {};
                var results = ch.edge.result.results();
                for (var i = 0; i < results.length; i++) {
                    var res = results[i];
                    var l = edges.objVal(listPath, res, []);
                    for (var j = 0; j < l.length; j++) {
                        var lo = l[j];
                        var key = edges.objVal(keyField, lo, false);
                        var value = edges.objVal(valueField, lo, 0);
                        if (key in counter) {
                            counter[key] += value
                        } else {
                            counter[key] = value
                        }
                    }
                }
                for (key in counter) {
                    var val = counter[key];
                    series.values.push({
                        label: key,
                        value: val
                    })
                }
                data_series.push(series);
                return data_series
            }
        }
    },
    newPieChart: function(params) {
        if (!params) {
            params = {}
        }
        edges.PieChart.prototype = edges.newChart(params);
        return new edges.PieChart(params)
    },
    PieChart: function(params) {
        this.defaultRenderer = params.defaultRenderer || "newPieChartRenderer"
    },
    newHorizontalMultibar: function(params) {
        if (!params) {
            params = {}
        }
        edges.HorizontalMultibar.prototype = edges.newChart(params);
        return new edges.HorizontalMultibar(params)
    },
    HorizontalMultibar: function(params) {
        this.defaultRenderer = params.defaultRenderer || "newHorizontalMultibarRenderer"
    },
    newMultibar: function(params) {
        if (!params) {
            params = {}
        }
        edges.Multibar.prototype = edges.newChart(params);
        return new edges.Multibar(params)
    },
    Multibar: function(params) {
        this.defaultRenderer = params.defaultRenderer || "newMultibarRenderer"
    },
    newSimpleLineChart: function(params) {
        if (!params) {
            params = {}
        }
        edges.SimpleLineChart.prototype = edges.newChart(params);
        return new edges.SimpleLineChart(params)
    },
    SimpleLineChart: function(params) {
        this.xAxisLabel = params.xAxisLabel || "";
        this.yAxisLabel = params.yAxisLabel || "";
        this.defaultRenderer = params.defaultRenderer || "newSimpleLineChartRenderer"
    },
    newChartsTable: function(params) {
        if (!params) {
            params = {}
        }
        edges.ChartsTable.prototype = edges.newComponent(params);
        return new edges.ChartsTable(params)
    },
    ChartsTable: function(params) {
        this.chartComponents = edges.getParam(params.chartComponents, false);
        this.tabularise = edges.getParam(params.tabularise, false);
        this.defaultRenderer = params.defaultRenderer || "newChartsTableRenderer";
        this.results = [];
        this.synchronise = function() {
            this.results = [];
            if (!this.chartComponents) {
                return
            }
            var comps = [];
            for (var i = 0; i < this.edge.components.length; i++) {
                var comp = this.edge.components[i];
                if ($.inArray(comp.id, this.chartComponents) > -1) {
                    comps.push(comp)
                }
            }
            if (this.tabularise) {
                this.results = this.tabularise(comps)
            }
        }
    }
});
$.extend(edges, {
    newRefiningANDTermSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.RefiningANDTermSelector.prototype = edges.newSelector(params);
        return new edges.RefiningANDTermSelector(params)
    },
    RefiningANDTermSelector: function(params) {
        this.size = params.size || 10;
        this.orderBy = params.orderBy || "count";
        this.orderDir = params.orderDir || "desc";
        this.deactivateThreshold = params.deactivateThreshold || false;
        this.ignoreEmptyString = params.ignoreEmptyString || true;
        this.excludePreDefinedFilters = params.excludePreDefinedFilters || true;
        this.valueMap = params.valueMap || false;
        this.valueFunction = params.valueFunction || false;
        this.inflation = params.inflation || 100;
        this.defaultRenderer = params.defaultRenderer || "newRefiningANDTermSelectorRenderer";
        this.filters = [];
        this.values = false;
        this.contrib = function(query) {
            var params = {
                name: this.id,
                field: this.field,
                orderBy: this.orderBy,
                orderDir: this.orderDir
            };
            if (this.size) {
                params["size"] = this.size
            }
            query.addAggregation(es.newTermsAggregation(params))
        };
        this.synchronise = function() {
            this.values = [];
            this.filters = [];
            if (this.edge.result) {
                var buckets = this.edge.result.buckets(this.id);
                if (buckets.length < this.deactivateThreshold) {
                    this.active = false
                } else {
                    this.active = true
                }
                var predefined = [];
                if (this.excludePreDefinedFilters && this.edge.baseQuery) {
                    predefined = this.edge.baseQuery.listMust(es.TermFilter({
                        field: this.field
                    }))
                }
                var realCount = 0;
                for (var i = 0; i < buckets.length; i++) {
                    var bucket = buckets[i];
                    if (this.ignoreEmptyString && bucket.key === "") {
                        continue
                    }
                    if (this.excludePreDefinedFilters) {
                        var exclude = false;
                        for (var j = 0; j < predefined.length; j++) {
                            var f = predefined[j];
                            if (bucket.key === f.value) {
                                exclude = true;
                                break
                            }
                        }
                        if (exclude) {
                            continue
                        }
                    }
                    realCount++;
                    if (realCount > this.size) {
                        break
                    }
                    var key = this._translate(bucket.key);
                    var obj = {
                        display: key,
                        term: bucket.key,
                        count: bucket.doc_count
                    };
                    this.values.push(obj)
                }
            }
            var filters = this.edge.currentQuery.listMust(es.newTermFilter({
                field: this.field
            }));
            for (var i = 0; i < filters.length; i++) {
                var val = filters[i].value;
                val = this._translate(val);
                this.filters.push({
                    display: val,
                    term: filters[i].value
                })
            }
        };
        this.selectTerm = function(term) {
            var nq = this.edge.cloneQuery();
            var removeCount = nq.removeMust(es.newTermFilter({
                field: this.field,
                value: term
            }));
            if (removeCount > 0) {
                return false
            }
            nq.addMust(es.newTermFilter({
                field: this.field,
                value: term
            }));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery();
            return true
        };
        this.removeFilter = function(term) {
            var nq = this.edge.cloneQuery();
            nq.removeMust(es.newTermFilter({
                field: this.field,
                value: term
            }));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.changeSize = function(newSize) {
            this.size = newSize;
            var nq = this.edge.cloneQuery();
            var agg = nq.getAggregation({
                name: this.id
            });
            agg.size = this.size;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.changeSort = function(orderBy, orderDir) {
            this.orderBy = orderBy;
            this.orderDir = orderDir;
            var nq = this.edge.cloneQuery();
            var agg = nq.getAggregation({
                name: this.id
            });
            agg.setOrdering(this.orderBy, this.orderDir);
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this._translate = function(term) {
            if (this.valueMap) {
                if (term in this.valueMap) {
                    return this.valueMap[term]
                }
            } else if (this.valueFunction) {
                return this.valueFunction(term)
            }
            return term
        }
    },
    newORTermSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.ORTermSelector.prototype = edges.newSelector(params);
        return new edges.ORTermSelector(params)
    },
    ORTermSelector: function(params) {
        this.lifecycle = edges.getParam(params.lifecycle, "static");
        this.orderBy = edges.getParam(params.orderBy, "term");
        this.orderDir = edges.getParam(params.orderDir, "asc");
        this.size = edges.getParam(params.size, 10);
        this.valueMap = edges.getParam(params.valueMap, false);
        this.valueFunction = edges.getParam(params.valueFunction, false);
        this.defaultRenderer = edges.getParam(params.defaultRenderer, "newORTermSelectorRenderer");
        this.terms = edges.getParam(params.terms, false);
        this.selected = [];
        this.updating = false;
        this.init = function(edge) {
            edges.newSelector().init.call(this, edge);
            if (!this.terms) {
                this.listAll()
            }
        };
        this.synchronise = function() {
            this.selected = [];
            var filters = this.edge.currentQuery.listMust(es.newTermsFilter({
                field: this.field
            }));
            for (var i = 0; i < filters.length; i++) {
                for (var j = 0; j < filters[i].values.length; j++) {
                    var val = filters[i].values[j];
                    this.selected.push(val)
                }
            }
        };
        this.listAll = function() {
            var bq = this.edge.cloneBaseQuery();
            bq.clearAggregations();
            bq.size = 0;
            var params = {
                name: this.id,
                field: this.field,
                orderBy: this.orderBy,
                orderDir: this.orderDir,
                size: this.size
            };
            bq.addAggregation(es.newTermsAggregation(params));
            es.doQuery({
                search_url: this.edge.search_url,
                queryobj: bq.objectify(),
                datatype: this.edge.datatype,
                success: edges.objClosure(this, "listAllQuerySuccess", ["result"]),
                error: edges.objClosure(this, "listAllQueryFail")
            })
        };
        this.listAllQuerySuccess = function(params) {
            var result = params.result;
            this.terms = [];
            var buckets = result.buckets(this.id);
            for (var i = 0; i < buckets.length; i++) {
                var bucket = buckets[i];
                this.terms.push({
                    term: bucket.key,
                    display: this._translate(bucket.key),
                    count: bucket.doc_count
                })
            }
            this.setupEvent();
            this.draw()
        };
        this.listAllQueryFail = function() {
            this.terms = []
        };
        this.setupEvent = function() {
            if (this.lifecycle === "update") {
                this.edge.context.on("edges:pre-query", edges.eventClosure(this, "doUpdate"))
            }
        };
        this.doUpdate = function() {
            if (this.updating) {
                return
            }
            this.udpating = true;
            var bq = this.edge.cloneQuery();
            bq.removeMust(es.newTermsFilter({
                field: this.field
            }));
            bq.clearAggregations();
            bq.size = 0;
            var params = {
                name: this.id,
                field: this.field,
                orderBy: this.orderBy,
                orderDir: this.orderDir,
                size: this.size
            };
            bq.addAggregation(es.newTermsAggregation(params));
            es.doQuery({
                search_url: this.edge.search_url,
                queryobj: bq.objectify(),
                datatype: this.edge.datatype,
                success: edges.objClosure(this, "doUpdateQuerySuccess", ["result"]),
                error: edges.objClosure(this, "doUpdateQueryFail")
            })
        };
        this.doUpdateQuerySuccess = function(params) {
            var result = params.result;
            var buckets = result.buckets(this.id);
            for (var i = 0; i < this.terms.length; i++) {
                var t = this.terms[i];
                var found = false;
                for (var j = 0; j < buckets.length; j++) {
                    var b = buckets[j];
                    if (t.term === b.key) {
                        t.count = b.doc_count;
                        found = true;
                        break
                    }
                }
                if (!found) {
                    t.count = 0
                }
            }
            this.updating = false;
            this.draw()
        };
        this.doUpdateQueryFail = function() {};
        this.selectTerms = function(params) {
            var terms = params.terms;
            var clearOthers = edges.getParam(params.clearOthers, false);
            var nq = this.edge.cloneQuery();
            var filters = nq.listMust(es.newTermsFilter({
                field: this.field
            }));
            if (filters.length > 0) {
                var filter = filters[0];
                if (clearOthers) {
                    filter.clear_terms()
                }
                var hadTermAlready = 0;
                for (var i = 0; i < terms.length; i++) {
                    var term = terms[i];
                    if (filter.has_term(term)) {
                        hadTermAlready++
                    } else {
                        filter.add_term(term)
                    }
                }
                if (filter.has_terms() && hadTermAlready == terms.length) {
                    return false
                } else if (!filter.has_terms()) {
                    nq.removeMust(es.newTermsFilter({
                        field: this.field
                    }))
                }
            } else {
                nq.addMust(es.newTermsFilter({
                    field: this.field,
                    values: terms
                }))
            }
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery();
            return true
        };
        this.selectTerm = function(term) {
            return this.selectTerms({
                terms: [term]
            })
        };
        this.removeFilter = function(term) {
            var nq = this.edge.cloneQuery();
            var filters = nq.listMust(es.newTermsFilter({
                field: this.field
            }));
            if (filters.length > 0) {
                var filter = filters[0];
                if (filter.has_term(term)) {
                    filter.remove_term(term)
                }
                if (!filter.has_terms()) {
                    nq.removeMust(es.newTermsFilter({
                        field: this.field
                    }))
                }
            }
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this._translate = function(term) {
            if (this.valueMap) {
                if (term in this.valueMap) {
                    return this.valueMap[term]
                }
            } else if (this.valueFunction) {
                return this.valueFunction(term)
            }
            return term
        }
    },
    newBasicRangeSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.BasicRangeSelector.prototype = edges.newSelector(params);
        return new edges.BasicRangeSelector(params)
    },
    BasicRangeSelector: function(params) {
        this.ranges = params.ranges || [];
        this.formatUnknown = params.formatUnknown || false;
        this.defaultRenderer = params.defaultRenderer || "newBasicRangeSelectorRenderer";
        this.values = [];
        this.filters = [];
        this.contrib = function(query) {
            var ranges = [];
            for (var i = 0; i < this.ranges.length; i++) {
                var r = this.ranges[i];
                var obj = {};
                if (r.from) {
                    obj.from = r.from
                }
                if (r.to) {
                    obj.to = r.to
                }
                ranges.push(obj)
            }
            query.addAggregation(es.newRangeAggregation({
                name: this.id,
                field: this.field,
                ranges: ranges
            }))
        };
        this.synchronise = function() {
            this.values = [];
            this.filters = [];
            if (this.edge.result) {
                var buckets = this.edge.result.buckets(this.id);
                for (var i = 0; i < this.ranges.length; i++) {
                    var r = this.ranges[i];
                    var bucket = this._getRangeBucket(buckets, r.from, r.to);
                    var obj = $.extend(true, {}, r);
                    obj["count"] = bucket.doc_count;
                    this.values.push(obj)
                }
            }
            if (this.edge.currentQuery) {
                var filters = this.edge.currentQuery.listMust(es.newRangeFilter({
                    field: this.field
                }));
                for (var i = 0; i < filters.length; i++) {
                    var to = filters[i].lt;
                    var from = filters[i].gte;
                    var r = this._getRangeDef(from, to);
                    if (r) {
                        this.filters.push(r)
                    } else {
                        this.filters.push({
                            display: this._formatUnknown(from, to),
                            from: from,
                            to: to
                        })
                    }
                }
            }
        };
        this.selectRange = function(from, to) {
            var nq = this.edge.cloneQuery();
            var params = {
                field: this.field
            };
            if (from) {
                params["gte"] = from
            }
            if (to) {
                params["lt"] = to
            }
            nq.addMust(es.newRangeFilter(params));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this.removeFilter = function(from, to) {
            var nq = this.edge.cloneQuery();
            var params = {
                field: this.field
            };
            if (from) {
                params["gte"] = from
            }
            if (to) {
                params["lt"] = to
            }
            nq.removeMust(es.newRangeFilter(params));
            nq.from = 0;
            this.edge.pushQuery(nq);
            this.edge.doQuery()
        };
        this._getRangeDef = function(from, to) {
            for (var i = 0; i < this.ranges.length; i++) {
                var r = this.ranges[i];
                var frMatch = true;
                var toMatch = true;
                if (from && !r.from || !from && r.from) {
                    frMatch = false
                }
                if (to && !r.to || !to && r.to) {
                    toMatch = false
                }
                if (from && r.from && from !== r.from) {
                    frMatch = false
                }
                if (to && r.to && to !== r.to) {
                    toMatch = false
                }
                if (frMatch && toMatch) {
                    return r
                }
            }
            return false
        };
        this._getRangeBucket = function(buckets, from, to) {
            for (var i = 0; i < buckets.length; i++) {
                var r = buckets[i];
                var frMatch = true;
                var toMatch = true;
                if (from && !r.from || !from && r.from) {
                    frMatch = false
                }
                if (to && !r.to || !to && r.to) {
                    toMatch = false
                }
                if (from && r.from && from !== r.from) {
                    frMatch = false
                }
                if (to && r.to && to !== r.to) {
                    toMatch = false
                }
                if (frMatch && toMatch) {
                    return r
                }
            }
            return false
        };
        this._formatUnknown = function(from, to) {
            if (this.formatUnknown) {
                return this.formatUnknown(from, to)
            } else {
                var frag = "";
                if (from) {
                    frag += from
                } else {
                    frag += "< "
                }
                if (to) {
                    if (from) {
                        frag += " - " + to
                    } else {
                        frag += to
                    }
                } else {
                    if (from) {
                        frag += "+"
                    } else {
                        frag = "unknown"
                    }
                }
                return frag
            }
        }
    },
    newBasicGeoDistanceRangeSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.BasicGeoDistanceRangeSelector.prototype = edges.newSelector(params);
        return new edges.BasicGeoDistanceRangeSelector(params)
    },
    BasicGeoDistanceRangeSelector: function(params) {
        this.distances = params.distances || [];
        this.hideEmptyDistance = params.hideEmptyDistance || true;
        this.unit = params.unit || "m";
        this.lat = params.lat || false;
        this.lon = params.lon || false;
        this.values = [];
        this.synchronise = function() {
            this.values = []
        }
    },
    newDateHistogramSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.BasicRangeSelector.prototype = edges.newSelector(params);
        return new edges.BasicRangeSelector(params)
    },
    DateHistogramSelector: function(params) {
        this.interval = params.interval || "year";
        this.sort = params.sort || "asc";
        this.hideEmptyDateBin = params.hideEmptyDateBin || true;
        this.shortDisplay = params.shortDisplay || false;
        this.values = [];
        this.synchronise = function() {
            this.values = []
        }
    },
    newAutocompleteTermSelector: function(params) {
        if (!params) {
            params = {}
        }
        edges.AutocompleteTermSelector.prototype = edges.newComponent(params);
        return new edges.AutocompleteTermSelector(params)
    },
    AutocompleteTermSelector: function(params) {
        this.defaultRenderer = params.defaultRenderer || "newAutocompleteTermSelectorRenderer"
    }
});
$.extend(muk, {
    institution: {
        newInstitutionReportTemplate: function(params) {
            if (!params) {
                params = {}
            }
            muk.institution.InstitutionReportTemplate.prototype = edges.newTemplate(params);
            return new muk.institution.InstitutionReportTemplate(params)
        },
        InstitutionReportTemplate: function(params) {
            this.edge = false;
            this.hidden = {};
            this.tabIds = [];
            this.namespace = "muk-institution-report-template";
            this.draw = function(edge) {
                this.edge = edge;
                var intro = "See the amount of APCs, total APC expenditure, or average APC cost for several institutions for a given period. Filter by publisher or journal type. Examples of how to use this report:                <ul>                    <li>Compare the number of APCs paid by similar institutions</li>                    <li>See overall expenditure with a specific publisher for a group of institutions</li>                    <li>Compare average APC to see how an institution benefits from offsetting deals</li>                </ul>";
                var panelClass = edges.css_classes(this.namespace, "panel");
                var topClass = edges.css_classes(this.namespace, "top");
                var filtersClass = edges.css_classes(this.namespace, "filters");
                var filterClass = edges.css_classes(this.namespace, "filter");
                var tabViewClass = edges.css_classes(this.namespace, "tabview");
                var tabContainerClass = edges.css_classes(this.namespace, "tab-container");
                var tabLabelBarClass = edges.css_classes(this.namespace, "tab-bar");
                var tabClass = edges.css_classes(this.namespace, "tab");
                var storyClass = edges.css_classes(this.namespace, "stories");
                var dataClass = edges.css_classes(this.namespace, "data");
                var filterHeaderClass = edges.css_classes(this.namespace, "filter-header");
                var loadingClass = edges.css_classes(this.namespace, "loading");
                var loading = edge.category("loading");
                var loadContainers = "";
                if (loading.length > 0) {
                    for (var i = 0; i < loading.length; i++) {
                        loadContainers += '<div class="row"><div class="col-md-12"><div id="' + loading[i].id + '"></div></div></div>'
                    }
                }
                var topstrap = edge.category("top-right");
                var topContainers = "";
                if (topstrap.length > 0) {
                    for (var i = 0; i < topstrap.length; i++) {
                        topContainers += '<div class="row"><div class="col-md-12"><div id="' + topstrap[i].id + '"></div></div></div>'
                    }
                }
                topContainers = '<div class="row"><div class="col-md-8 report-intro-text">' + intro + '</div><div class="col-md-4">' + topContainers + "</div></div>";
                var lhs = edge.category("lhs");
                var controlContainers = "";
                for (var i = 0; i < lhs.length; i++) {
                    controlContainers += '<div class="' + filterClass + '" id="' + lhs[i].id + '"></div>'
                }
                var tabs = edge.category("tab");
                var tabLabels = "";
                var tabContents = "";
                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    var containerId = edges.css_id(this.namespace, "tab-" + tab.id);
                    var linkId = edges.css_id(this.namespace, "link-" + tab.id);
                    this.tabIds.push(tab.id);
                    tabLabels += '<li><a href="#" id="' + linkId + '" data-id="' + tab.id + '">' + tab.display + "</a></li>";
                    tabContents += '<div class="' + tabContainerClass + '" id="' + containerId + '">                            <div class="row">                                <div class="col-md-12">                                     <div class="' + tabClass + '" id="' + tab.id + '"></div>                                </div>                             </div>                        </div>'
                }
                tabLabels = 'Show:&nbsp;&nbsp;<ul class="nav nav-tabs navbar-right">' + tabLabels + "</ul>";
                var stories = edge.category("story");
                var storyContainers = "";
                if (stories.length > 0) {
                    for (var i = 0; i < stories.length; i++) {
                        storyContainers += '<div class="row"><div class="col-md-12"><div id="' + stories[i].id + '"></div></div></div>'
                    }
                }
                var data = edge.category("data");
                var dataContainers = "";
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        dataContainers += '<div class="row"><div class="col-md-12"><div id="' + data[i].id + '"></div></div></div>'
                    }
                }
                var filterHeader = '<div class="' + filterHeaderClass + '"><div class="row"><div class="col-md-12"><span class="glyphicon glyphicon-filter"></span>&nbsp;FILTER</div></div></div>';
                var template = '<div class="' + panelClass + '">                     <div class="' + loadingClass + '">' + loadContainers + '</div>                    <div class="' + topClass + '">' + topContainers + '</div>                    <div class="row">                        <div class="col-md-3">                            <div class="' + filtersClass + '">' + filterHeader + controlContainers + '</div>                        </div>                        <div class="col-md-9">                            <div class="' + tabViewClass + '">                                <div class="' + tabLabelBarClass + '"><div class="row"><div class="col-md-12">' + tabLabels + "</div></div></div>                                " + tabContents + '                            </div>                        </div>                    </div>                    <div class="' + storyClass + '">' + storyContainers + '</div>                    <div class="' + dataClass + '">' + dataContainers + "</div>                </div>";
                edge.context.html(template);
                for (var i = 0; i < this.tabIds.length; i++) {
                    var tabSelector = edges.css_id_selector(this.namespace, "tab-" + this.tabIds[i]);
                    this.hideOffScreen(tabSelector)
                }
                var startWith = this.tabIds[0];
                this.activateTab(startWith);
                for (var i = 0; i < this.tabIds.length; i++) {
                    var linkSelector = edges.css_id_selector(this.namespace, "link-" + this.tabIds[i]);
                    edges.on(linkSelector, "click", this, "tabClicked")
                }
            };
            this.hideOffScreen = function(selector) {
                if (selector in this.hidden) {
                    return
                }
                var el = this.edge.jq(selector);
                this.hidden[selector] = {
                    position: el.css("position"),
                    margin: el.css("margin-left")
                };
                el.css("position", "absolute").css("margin-left", -9999)
            };
            this.bringIn = function(selector) {
                if (!this.hidden[selector]) {
                    return
                }
                var pos = this.hidden[selector].position;
                var mar = this.hidden[selector].margin;
                var el = this.edge.jq(selector);
                el.css("position", pos).css("margin-left", mar);
                delete this.hidden[selector]
            };
            this.activateTab = function(activate) {
                var tabs = this.edge.category("tab");
                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    var tabSelector = edges.css_id_selector(this.namespace, "tab-" + tab.id);
                    var linkSelector = edges.css_id_selector(this.namespace, "link-" + tab.id);
                    if (tab.id === activate) {
                        this.bringIn(tabSelector);
                        this.edge.jq(linkSelector).parent().addClass("active")
                    } else {
                        this.hideOffScreen(tabSelector);
                        this.edge.jq(linkSelector).parent().removeClass("active")
                    }
                }
            };
            this.tabClicked = function(element) {
                var id = $(element).attr("data-id");
                this.activateTab(id)
            }
        },
        newStory: function(params) {
            if (!params) {
                params = {}
            }
            muk.institution.Story.prototype = edges.newComponent(params);
            return new muk.institution.Story(params)
        },
        Story: function(params) {
            this.countMax = false;
            this.countAvg = false;
            this.totalMin = false;
            this.totalMax = false;
            this.totalAvg = false;
            this.avgMin = false;
            this.avgMax = false;
            this.avgAvg = false;
            this.synchronise = function() {
                this.countMax = false;
                this.countAvg = false;
                this.totalMin = false;
                this.totalMax = false;
                this.totalAvg = false;
                this.avgMin = false;
                this.avgMax = false;
                this.avgAvg = false;
                var results = this.edge.secondaryResults.avg;
                var cardinality = results.aggregation("inst_count");
                var insts = results.buckets("institutions");
                var general = results.aggregation("general_stats");
                if (insts.length > 0) {
                    this.countMax = insts[0].doc_count
                } else {
                    this.countMax = 0
                }
                if (cardinality.value > 0) {
                    this.countAvg = results.total() / cardinality.value;
                    this.totalAvg = general.sum / cardinality.value
                } else {
                    this.countAvg = 0;
                    this.totalAvg = 0
                }
                for (var i = 0; i < insts.length; i++) {
                    var inst = insts[i];
                    var sum = inst.inst_stats.sum;
                    var avg = inst.inst_stats.avg;
                    if (this.totalMin === false || sum < this.totalMin) {
                        this.totalMin = sum
                    }
                    if (this.totalMax === false || sum > this.totalMax) {
                        this.totalMax = sum
                    }
                    if (this.avgMin === false || avg < this.avgMin) {
                        this.avgMin = avg
                    }
                    if (this.avgMax === false || avg > this.avgMax) {
                        this.avgMax = avg
                    }
                }
                this.avgAvg = general.avg
            };
            this.draw = function() {
                if (this.countMax === false || this.countAvg === false || this.totalMin === false || this.totalMax === false || this.totalAvg === false || this.avgMin === false || this.avgMax === false || this.avgAvg === false) {
                    this.context.html("");
                    return
                }
                var story = "<p>In this time period, an institution may have up to <strong>{{a}}</strong> APCs, with the average being <strong>{{b}}</strong></p>";
                story += "<p>The least amount spent by any institution was <strong>£{{c}}</strong>, the most was <strong>£{{d}}</strong>, with the average being <strong>£{{e}}</strong></p>";
                story += "<p>The smallest average APC for an institution was <strong>£{{f}}</strong>, the largest average was <strong>£{{g}}</strong>, and the overall average APC cost is <strong>£{{h}}</strong></p>";
                var format = muk.toIntFormat();
                story = story.replace(/{{a}}/g, format(this.countMax)).replace(/{{b}}/g, format(this.countAvg)).replace(/{{c}}/g, format(this.totalMin)).replace(/{{d}}/g, format(this.totalMax)).replace(/{{e}}/g, format(this.totalAvg)).replace(/{{f}}/g, format(this.avgMin)).replace(/{{g}}/g, format(this.avgMax)).replace(/{{h}}/g, format(this.avgAvg));
                this.context.html(story)
            }
        },
        averagesQuery: function(edge) {
            var query = edge.cloneQuery();
            query.removeMust(es.newTermsFilter({
                field: "record.jm:apc.organisation_name.exact"
            }));
            query.clearAggregations();
            query.addAggregation(es.newTermsAggregation({
                name: "institutions",
                field: "record.jm:apc.organisation_name.exact",
                size: 1e4,
                orderBy: "count",
                orderDir: "desc",
                aggs: [es.newStatsAggregation({
                    name: "inst_stats",
                    field: "index.amount_inc_vat"
                })]
            }));
            query.addAggregation(es.newCardinalityAggregation({
                name: "inst_count",
                field: "record.jm:apc.organisation_name.exact"
            }));
            query.addAggregation(es.newStatsAggregation({
                name: "general_stats",
                field: "index.amount_inc_vat"
            }));
            query.size = 0;
            query.from = 0;
            return query
        },
        reportDF: function(params) {
            var ch = params.chart;
            var valueFunction = params.valueFunction;
            var seriesKey = params.seriesKey;
            var maxSeries = 0;
            var data_series = [];
            if (!ch.edge.result) {
                return data_series
            }
            var instFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({
                field: "record.jm:apc.organisation_name.exact"
            }));
            if (instFilters.length == 0) {
                maxSeries = 10
            }
            var series = {};
            series["key"] = seriesKey;
            series["values"] = [];
            var insts = [];
            var inst_buckets = ch.edge.result.buckets("institution");
            for (var i = 0; i < inst_buckets.length; i++) {
                if (maxSeries > 0 && i >= maxSeries) {
                    break
                }
                var ibucket = inst_buckets[i];
                var ikey = ibucket.key;
                var skip = false;
                for (var j = 0; j < instFilters.length; j++) {
                    var filt = instFilters[j];
                    if (!filt.has_term(ikey)) {
                        skip = true;
                        break
                    }
                }
                if (skip) {
                    continue
                }
                var value = valueFunction(ibucket);
                series["values"].push({
                    label: ikey,
                    value: value
                });
                insts.push(ikey)
            }
            for (var i = 0; i < instFilters.length; i++) {
                var filt = instFilters[i];
                for (var j = 0; j < filt.values.length; j++) {
                    var val = filt.values[j];
                    if ($.inArray(val, insts) === -1) {
                        series["values"].push({
                            label: val,
                            value: 0
                        })
                    }
                }
            }
            data_series.push(series);
            return data_series
        },
        apcCountDF: function(ch) {
            return muk.institution.reportDF({
                chart: ch,
                seriesKey: "Number of APCs",
                valueFunction: function(bucket) {
                    return bucket.doc_count
                }
            })
        },
        apcExpenditureDF: function(ch) {
            return muk.institution.reportDF({
                chart: ch,
                seriesKey: "Total expenditure",
                valueFunction: function(bucket) {
                    return bucket.institution_stats.sum
                }
            })
        },
        avgAPCDF: function(ch) {
            return muk.institution.reportDF({
                chart: ch,
                seriesKey: "Average APC Cost",
                valueFunction: function(bucket) {
                    return bucket.institution_stats.avg
                }
            })
        },
        tableData: function(charts) {
            var seriesNames = {
                apc_count: "APC Count",
                total_expenditure: "Total expenditure",
                mean: "Average APC cost"
            };
            var formatter = muk.toIntFormat();
            var rows = {};
            for (var i = 0; i < charts.length; i++) {
                var chart = charts[i];
                if (!chart.dataSeries) {
                    continue
                }
                var dataSeries = chart.dataSeries;
                for (var j = 0; j < dataSeries.length; j++) {
                    var ds = dataSeries[j];
                    for (var k = 0; k < ds.values.length; k++) {
                        var val = ds.values[k];
                        var inst = val.label;
                        var num = val.value;
                        var row = {};
                        if (inst in rows) {
                            row = rows[inst]
                        }
                        var col = seriesNames[chart.id];
                        row[col] = formatter(num);
                        rows[inst] = row
                    }
                }
            }
            var rowNames = Object.keys(rows);
            rowNames.sort();
            var table = [];
            for (var i = 0; i < rowNames.length; i++) {
                var obj = rows[rowNames[i]];
                obj["Institution"] = rowNames[i];
                table.push(obj)
            }
            return table
        },
        makeInstitutionReport: function(params) {
            if (!params) {
                params = {}
            }
            var check_query = es.newQuery();
            check_query.addMust(es.newTermsFilter({
                field: "record.jm:apc.organisation_name.exact",
                values: [myInstituion]
            }));
            check_query.size = 0;
            es.doQuery({
                search_url: octopus.config.public_query_endpoint,
                queryobj: check_query.objectify(),
                success: function(result) {
                    if (result.total() == 0) {
                        myInstituion = false
                    }
                    muk.institution.makeInstitutionReport2(params)
                },
                error: function() {
                    myInstituion = false;
                    muk.institution.makeInstitutionReport2(params)
                }
            })
        },
        makeInstitutionReport2: function(params) {
            if (!params) {
                params = {}
            }
            var selector = edges.getParam(params.selector, "#muk_institution");
            var base_query = es.newQuery({
                size: 0
            });
            base_query.addAggregation(es.newTermsAggregation({
                name: "institution",
                field: "record.jm:apc.organisation_name.exact",
                size: 1e3,
                aggs: [es.newStatsAggregation({
                    name: "institution_stats",
                    field: "index.amount_inc_vat"
                }), es.newTermsAggregation({
                    name: "oa_type",
                    field: "record.dc:source.oa_type.exact",
                    size: 10
                })]
            }));
            var opening_query = es.newQuery();
            if (myInstituion && myInstituion != "") {
                opening_query.addMust(es.newTermsFilter({
                    field: "record.jm:apc.organisation_name.exact",
                    values: [myInstituion]
                }))
            }
            var e = edges.newEdge({
                selector: selector,
                template: muk.institution.newInstitutionReportTemplate(),
                search_url: octopus.config.public_query_endpoint,
                baseQuery: base_query,
                openingQuery: opening_query,
                secondaryQueries: {
                    avg: muk.institution.averagesQuery
                },
                components: [edges.newMultiDateRangeEntry({
                    id: "date_range",
                    display: "REPORT PERIOD:<br>",
                    fields: [{
                        field: "record.rioxxterms:publication_date",
                        display: "Publication Date"
                    }, {
                        field: "record.jm:apc.date_applied",
                        display: "APC Application"
                    }, {
                        field: "record.jm:apc.date_paid",
                        display: "APC Paid"
                    }],
                    autoLookupRange: true,
                    category: "top-right",
                    renderer: edges.bs3.newBSMultiDateRange({
                        ranges: muk.yearRanges({
                            "academic year": "09-01",
                            "fiscal year": "04-01",
                            "calendar year": "01-01"
                        }, {
                            "This ": 0,
                            "Last ": 1
                        })
                    })
                }), edges.newORTermSelector({
                    id: "institution",
                    field: "record.jm:apc.organisation_name.exact",
                    display: "Compare Institutions",
                    lifecycle: "static",
                    size: 1e4,
                    category: "lhs",
                    renderer: edges.bs3.newORTermSelectorRenderer({
                        open: true,
                        togglable: false,
                        showCount: true,
                        hideEmpty: true
                    })
                }), edges.newRefiningANDTermSelector({
                    id: "publisher",
                    field: "record.dcterms:publisher.name.exact",
                    display: "Publisher",
                    size: 1e4,
                    category: "lhs",
                    orderBy: "term",
                    orderDir: "asc",
                    renderer: edges.bs3.newRefiningANDTermSelectorRenderer({
                        hideInactive: true,
                        open: true,
                        togglable: false,
                        controls: false
                    })
                }), edges.newRefiningANDTermSelector({
                    id: "oa_type",
                    field: "record.dc:source.oa_type.exact",
                    display: "Journal type",
                    category: "lhs",
                    valueMap: {
                        oa: "Pure OA",
                        hybrid: "Hybrid",
                        unknown: "Unknown"
                    },
                    renderer: edges.bs3.newRefiningANDTermSelectorRenderer({
                        open: true,
                        togglable: false,
                        controls: false
                    })
                }), edges.newHorizontalMultibar({
                    id: "apc_count",
                    display: "Number of APCs",
                    dataFunction: muk.institution.apcCountDF,
                    category: "tab",
                    renderer: edges.nvd3.newHorizontalMultibarRenderer({
                        noDataMessage: "No results match your filter criteria - try changing the date range",
                        legend: false,
                        valueFormat: muk.toIntFormat(),
                        yAxisLabel: "Number of APCs"
                    })
                }), edges.newHorizontalMultibar({
                    id: "total_expenditure",
                    display: "Total expenditure",
                    dataFunction: muk.institution.apcExpenditureDF,
                    category: "tab",
                    renderer: edges.nvd3.newHorizontalMultibarRenderer({
                        noDataMessage: "No results match your filter criteria - try changing the date range",
                        legend: false,
                        valueFormat: muk.toGBPIntFormat(),
                        yTickFormat: muk.toGBPIntFormat(),
                        yAxisLabel: "Total expenditure"
                    })
                }), edges.newHorizontalMultibar({
                    id: "mean",
                    display: "Average APC Cost",
                    dataFunction: muk.institution.avgAPCDF,
                    category: "tab",
                    renderer: edges.nvd3.newHorizontalMultibarRenderer({
                        noDataMessage: "No results match your filter criteria - try changing the date range",
                        legend: false,
                        valueFormat: muk.toGBPIntFormat(),
                        yTickFormat: muk.toGBPIntFormat(),
                        yAxisLabel: "Average APC Cost"
                    })
                }), muk.institution.newStory({
                    id: "story",
                    category: "story"
                }), edges.newChartsTable({
                    id: "data_table",
                    display: "Raw Data",
                    category: "data",
                    chartComponents: ["apc_count", "total_expenditure", "mean"],
                    tabularise: muk.institution.tableData,
                    renderer: edges.bs3.newTabularResultsRenderer({
                        fieldDisplay: [{
                            field: "Institution",
                            display: "Institution"
                        }],
                        displayListedOnly: false,
                        download: true,
                        downloadText: "download as csv"
                    })
                }), edges.newSearchingNotification({
                    id: "loading-bar",
                    category: "loading"
                })]
            });
            muk.activeEdges[selector] = e
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newRefiningANDTermSelectorRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.RefiningANDTermSelectorRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.RefiningANDTermSelectorRenderer(params)
        },
        RefiningANDTermSelectorRenderer: function(params) {
            this.hideInactive = edges.getParam(params.hideInactive, false);
            this.controls = edges.getParam(params.controls, true);
            this.open = edges.getParam(params.open, false);
            this.togglable = edges.getParam(params.togglable, true);
            this.showSelected = edges.getParam(params.showSelected, true);
            this.sortCycle = edges.getParam(params.sortCycle, ["count desc", "count asc", "term desc", "term asc"]);
            this.namespace = "edges-bs3-refiningand-term-selector";
            this.draw = function() {
                var ts = this.component;
                var namespace = this.namespace;
                var resultsListClass = edges.css_classes(namespace, "results-list", this);
                var resultClass = edges.css_classes(namespace, "result", this);
                var valClass = edges.css_classes(namespace, "value", this);
                var controlClass = edges.css_classes(namespace, "controls", this);
                var filterRemoveClass = edges.css_classes(namespace, "filter-remove", this);
                var facetClass = edges.css_classes(namespace, "facet", this);
                var headerClass = edges.css_classes(namespace, "header", this);
                var selectedClass = edges.css_classes(namespace, "selected", this);
                var controlId = edges.css_id(namespace, "controls", this);
                var sizeId = edges.css_id(namespace, "size", this);
                var orderId = edges.css_id(namespace, "order", this);
                var toggleId = edges.css_id(namespace, "toggle", this);
                var resultsId = edges.css_id(namespace, "results", this);
                var countClass = edges.css_classes(namespace, "count", this);
                var results = "Loading...";
                if (ts.values.length > 0) {
                    var self = this;
                    results = '<div class="form ' + resultClass + '">';
                    for(i in ts.values){
                        val = ts.values[i]
                        if (val.count !==0 || !this.hideEmpty) {
                            if(($.inArray(val.term.toString(), ts.filters)) === -1 ) {
                                results += '<div class="form-fields__item-checkbox ' + valClass
                                results += '" data-key="' + edges.escapeHtml(val.term) + '"><label><input type="checkbox"/> ' + edges.escapeHtml(val.display)
                                results += '<span class="' + countClass + '"> (' + val.count + ")</span>"
                                results += "</label></div>"
                            }
                        }
                    }
                    results += '</div>';
                }

                var controlFrag = "";
                if (this.controls) {
                    var ordering = '<a href="#" title=""><i class="glyphicon glyphicon-arrow-up"></i></a>';
                    controlFrag = '<div class="' + controlClass + '" style="display:none" id="' + controlId + '"><div class="row"><div class="col-md-12"><div class="btn-group"><button type="button" class="btn btn-default btn-sm" id="' + sizeId + '" title="List Size" href="#">0</button><button type="button" class="btn btn-default btn-sm" id="' + orderId + '" title="List Order" href="#"></button></div></div></div></div>'
                }
                var filterFrag = "";
                if (ts.filters.length > 0 && this.showSelected) {
                    for (var i = 0; i < ts.filters.length; i++) {
                        var filt = ts.filters[i];
                            results = '<div class="form ' + resultClass + '"><div class="form-fields__item-checkbox ' + filterRemoveClass + '" data-key="' + edges.escapeHtml(filt.term) + '"><label><input type="checkbox" checked/> ' + edges.escapeHtml(filt.display);
                            results += "</label></div></div>"
                    }
                }
                var tog = ts.display;
                if (this.togglable) {
                    tog = '<a href="#" id="' + toggleId + '"><i class="glyphicon glyphicon-plus"></i>&nbsp;' + tog + "</a>"
                }
                var frag = '<div class="' + facetClass + '"><div class="' + headerClass + '"><div class="row"><div class="col-md-12">' + tog + '</div></div></div>'+controlFrag+'<div class="row" style="display:none" id="' + resultsId + '"><div class="col-md-12"><div class="' + selectedClass + '">'+filterFrag+'</div><div class="' + resultsListClass + '">'+results+'</div></div></div></div>';
                ts.context.html(frag);
                this.setUISize();
                this.setUISort();
                this.setUIOpen();
                var valueSelector = edges.css_class_selector(namespace, "value", this);
                var filterRemoveSelector = edges.css_class_selector(namespace, "filter-remove", this);
                var toggleSelector = edges.css_id_selector(namespace, "toggle", this);
                var sizeSelector = edges.css_id_selector(namespace, "size", this);
                var orderSelector = edges.css_id_selector(namespace, "order", this);
                edges.on(valueSelector, "click", this, "termSelected");
                edges.on(toggleSelector, "click", this, "toggleOpen");
                edges.on(filterRemoveSelector, "click", this, "removeFilter");
                edges.on(sizeSelector, "click", this, "changeSize");
                edges.on(orderSelector, "click", this, "changeSort")
            };
            this.setUIOpen = function() {
                var resultsSelector = edges.css_id_selector(this.namespace, "results", this);
                var controlsSelector = edges.css_id_selector(this.namespace, "controls", this);
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                var results = this.component.jq(resultsSelector);
                var controls = this.component.jq(controlsSelector);
                var toggle = this.component.jq(toggleSelector);
                if (this.open) {
                    toggle.find("i").removeClass("glyphicon-plus").addClass("glyphicon-minus");
                    controls.show();
                    results.show()
                } else {
                    toggle.find("i").removeClass("glyphicon-minus").addClass("glyphicon-plus");
                    controls.hide();
                    results.hide()
                }
            };
            this.setUISize = function() {
                var sizeSelector = edges.css_id_selector(this.namespace, "size", this);
                this.component.jq(sizeSelector).html(this.component.size)
            };
            this.setUISort = function() {
                var orderSelector = edges.css_id_selector(this.namespace, "order", this);
                var el = this.component.jq(orderSelector);
                if (this.component.orderBy === "count") {
                    if (this.component.orderDir === "asc") {
                        el.html('count <i class="glyphicon glyphicon-arrow-down"></i>')
                    } else if (this.component.orderDir === "desc") {
                        el.html('count <i class="glyphicon glyphicon-arrow-up"></i>')
                    }
                } else if (this.component.orderBy === "term") {
                    if (this.component.orderDir === "asc") {
                        el.html('a-z <i class="glyphicon glyphicon-arrow-down"></i>')
                    } else if (this.component.orderDir === "desc") {
                        el.html('a-z <i class="glyphicon glyphicon-arrow-up"></i>')
                    }
                }
            };
            this.termSelected = function(element) {
                var term = this.component.jq(element).attr("data-key");
                this.component.selectTerm(term)
            };
            this.removeFilter = function(element) {
                var term = this.component.jq(element).attr("data-key");
                this.component.removeFilter(term)
            };
            this.toggleOpen = function(element) {
                this.open = !this.open;
                this.setUIOpen()
            };
            this.changeSize = function(element) {
                var newSize = prompt("Currently displaying " + this.component.size + " results per page. How many would you like instead?");
                if (newSize) {
                    this.component.changeSize(parseInt(newSize))
                }
            };
            this.changeSort = function(element) {
                var current = this.component.orderBy + " " + this.component.orderDir;
                var idx = $.inArray(current, this.sortCycle);
                var next = this.sortCycle[(idx + 1) % 4];
                var bits = next.split(" ");
                this.component.changeSort(bits[0], bits[1])
            }
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newORTermSelectorRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.ORTermSelectorRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.ORTermSelectorRenderer(params)
        },
        ORTermSelectorRenderer: function(params) {
            this.open = edges.getParam(params.open, false);
            this.togglable = edges.getParam(params.togglable, true);
            this.showCount = edges.getParam(params.showCount, false);
            this.hideEmpty = edges.getParam(params.hideEmpty, false);
            this.openIcon = edges.getParam(params.openIcon, "glyphicon glyphicon-plus");
            this.closeIcon = edges.getParam(params.closeIcon, "glyphicon glyphicon-minus");
            this.layout = edges.getParam(params.layout, "left");
            this.namespace = "edges-bs3-or-term-selector";
            this.draw = function() {
                var ts = this.component;
                var namespace = this.namespace;
                var resultClass = edges.css_classes(namespace, "result", this);
                var valClass = edges.css_classes(namespace, "value", this);
                var filterRemoveClass = edges.css_classes(namespace, "filter-remove", this);
                var facetClass = edges.css_classes(namespace, "facet", this);
                var headerClass = edges.css_classes(namespace, "header", this);
                var selectionsClass = edges.css_classes(namespace, "selections", this);
                var bodyClass = edges.css_classes(namespace, "body", this);
                var countClass = edges.css_classes(namespace, "count", this);
                var toggleId = edges.css_id(namespace, "toggle", this);
                var resultsId = edges.css_id(namespace, "results", this);
                this.showCount = edges.getParam(params.showCount, false);
                var results = "Loading...";
                if (ts.terms.length > 0) {
                    var self = this;
                    results = '<div class="form ' + resultClass + '">';
                    for(i in ts.terms){
                        val = ts.terms[i]
                        if (val.count !==0 || !this.hideEmpty) {
                            var sel = $.inArray(val.term.toString(), ts.selected)
                            results += '<div class="form-fields__item-checkbox '
                            results += sel !== -1 ? filterRemoveClass : valClass
                            results += '" data-key="' + edges.escapeHtml(val.term) + '"><label><input type="checkbox"'+(sel !== -1 ? ' checked':'' )+'/> ' + edges.escapeHtml(val.display)
                            results += this.showCount ? '<span class="' + countClass + '"> (' + val.count + ")</span>" : ''
                            results += "</label></div>"
                        }
                    }
                    results += '</div>';
                }

                var header = this.headerLayout({
                    toggleId: toggleId
                });
                var frag = '<div class="' + facetClass + '"><div class="' + headerClass + '"><div class="row"><div class="col-md-12">' + header + '</div></div></div><div class="' + bodyClass + '">                            <div class="row" style="display:none" id="' + resultsId + '"><div class="col-md-12"><div class="' + selectionsClass + '">'+results+'</div></div></div></div></div>';
                ts.context.html(frag);
                this.setUIOpen();
                var valueSelector = edges.css_class_selector(namespace, "value", this);
                var filterRemoveSelector = edges.css_class_selector(namespace, "filter-remove", this);
                var toggleSelector = edges.css_id_selector(namespace, "toggle", this);
                edges.on(valueSelector, "click", this, "termSelected");
                edges.on(toggleSelector, "click", this, "toggleOpen");
                edges.on(filterRemoveSelector, "click", this, "removeFilter")
            };
            this.headerLayout = function(params) {
                var toggleId = params.toggleId;
                var iconClass = edges.css_classes(this.namespace, "icon", this);
                if (this.layout === "left") {
                    var tog = this.component.display;
                    if (this.togglable) {
                        tog = '<a href="#" id="' + toggleId + '"><i class="' + this.openIcon + '"></i>&nbsp;' + tog + "</a>"
                    }
                    return tog
                } else if (this.layout === "right") {
                    var tog = "";
                    if (this.togglable) {
                        tog = '<a href="#" id="' + toggleId + '">' + this.component.display + '&nbsp;<i class="' + this.openIcon + " " + iconClass + '"></i></a>'
                    } else {
                        tog = this.component.display
                    }
                    return tog
                }
            };
            this.setUIOpen = function() {
                var resultsSelector = edges.css_id_selector(this.namespace, "results", this);
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                var results = this.component.jq(resultsSelector);
                var toggle = this.component.jq(toggleSelector);
                var openBits = this.openIcon.split(" ");
                var closeBits = this.closeIcon.split(" ");
                if (this.open) {
                    var i = toggle.find("i");
                    for (var j = 0; j < openBits.length; j++) {
                        i.removeClass(openBits[j])
                    }
                    for (var j = 0; j < closeBits.length; j++) {
                        i.addClass(closeBits[j])
                    }
                    results.show()
                } else {
                    var i = toggle.find("i");
                    for (var j = 0; j < closeBits.length; j++) {
                        i.removeClass(closeBits[j])
                    }
                    for (var j = 0; j < openBits.length; j++) {
                        i.addClass(openBits[j])
                    }
                    results.hide()
                }
            };
            this.termSelected = function(element) {
                var term = this.component.jq(element).attr("data-key");
                this.component.selectTerm(term)
            };
            this.removeFilter = function(element) {
                var term = this.component.jq(element).attr("data-key");
                this.component.removeFilter(term)
            };
            this.toggleOpen = function(element) {
                this.open = !this.open;
                this.setUIOpen()
            };
            this._getFilterDef = function(term) {
                for (var i = 0; i < this.component.terms.length; i++) {
                    var t = this.component.terms[i];
                    if (term === t.term) {
                        return t
                    }
                }
                return false
            }
        }
    }
});
$.extend(edges, {
    csv: {
        serialise: function(params) {
            var json = params.data;
            return Papa.unparse(json, {
                newline: "\n"
            })
        },
        newObjectByRow: function(params) {
            if (!params) {
                params = {}
            }
            return new edges.csv.ObjectByRow(params)
        },
        ObjectByRow: function(params) {
            this.sheet = false;
            this.filters = [];
            this.parse = function(params) {
                var data = params.data.replace(/\r\n/g, "\n");
                this.sheet = Papa.parse(data, {
                    header: true,
                    newline: "\n",
                    skipEmptyLines: true
                })
            };
            this.add_filter = function(params) {
                var filter = params.filter;
                this.filters.push(filter)
            };
            this.clear_filter = function(params) {
                var filter = params.filter;
                var remove = false;
                for (var i = 0; i < this.filters.length; i++) {
                    var filt = this.filters[i];
                    var field_match = filter.field === filt.field;
                    var type_match = filter.type === filt.type || filter.type === undefined;
                    var val_match = filter.value === undefined || filter.value.toString() === filt.value.toString();
                    if (field_match && type_match && val_match) {
                        remove = i;
                        break
                    }
                }
                if (remove !== false) {
                    this.filters.splice(remove, 1)
                }
            };
            this.iterator = function(params) {
                if (!params) {
                    params = {}
                }
                var filtered = edges.getParam(params.filtered, true);
                var count = 0;
                var that = this;
                return {
                    next: function() {
                        if (that.sheet.data.length <= count) {
                            return false
                        }
                        for (var i = count; i < that.sheet.data.length; i++) {
                            var ret = that.sheet.data[i];
                            var match = false;
                            if (!filtered) {
                                match = true
                            } else {
                                match = that._filterMatch({
                                    record: ret
                                })
                            }
                            if (match) {
                                count = i + 1;
                                return ret
                            }
                        }
                        return false
                    }
                }
            };
            this.aggregation = function(params) {
                var agg = params.agg;
                var type = Object.keys(agg)[0];
                var field = agg[type];
                var filtered = edges.getParam(params.filtered, true);
                if (type === "terms") {
                    return this._termsAggregation({
                        field: field,
                        filtered: filtered
                    })
                }
                return []
            };
            this._termsAggregation = function(params) {
                var field = params.field;
                var filtered = edges.getParam(params.filtered, true);
                var agg = [];
                var aggMap = {};
                var iter = this.iterator({
                    filtered: filtered
                });
                var res = iter.next();
                while (res) {
                    if (res.hasOwnProperty(field)) {
                        var val = res[field];
                        if (val in aggMap) {
                            agg[aggMap[val]].count++
                        } else {
                            var i = agg.length;
                            agg.push({
                                term: val,
                                count: 1
                            });
                            aggMap[val] = i
                        }
                    }
                    res = iter.next()
                }
                return agg
            };
            this._filterMatch = function(params) {
                var record = params.record;
                for (var i = 0; i < this.filters.length; i++) {
                    var filter = this.filters[i];
                    if (filter.type === "exact") {
                        if (!this._exactFilterMatch({
                                filter: filter,
                                record: record
                            })) {
                            return false
                        }
                    } else {
                        return false
                    }
                }
                return true
            };
            this._exactFilterMatch = function(params) {
                var filter = params.filter;
                var record = params.record;
                var field = filter.field;
                var val = filter.value;
                if (record[field] !== val) {
                    return false
                }
                return true
            };
            this.parse(params)
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newTabularResultsRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.TabularResultsRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.TabularResultsRenderer(params)
        },
        TabularResultsRenderer: function(params) {
            this.noResultsText = params.noResultsText || "No results to display";
            this.defaultCellContent = params.defaultCellContent || "-";
            this.fieldDisplay = params.fieldDisplay || [];
            this.displayListedOnly = edges.getParam(params.displayListedOnly, true);
            this.headerOrderingFunction = edges.getParam(params.headerOrderingFunction, false);
            this.download = edges.getParam(params.download, false);
            this.downloadText = edges.getParam(params.downloadText, "download");
            this.downloadPrefix = edges.getParam(params.downloadPrefix, "download");
            this.namespace = "edges-bs3-tabular-results";
            this.draw = function() {
                var frag = this.noResultsText;
                if (this.component.results === false) {
                    frag = ""
                }
                var results = this.component.results;
                if (results && results.length > 0) {
                    var headerKeys = this._getHeaderRow();
                    var tableClasses = edges.css_classes(this.namespace, "table", this);
                    var headerClasses = edges.css_classes(this.namespace, "header", this);
                    var cellClasses = edges.css_classes(this.namespace, "cell", this);
                    var downloadClasses = edges.css_classes(this.namespace, "download", this);
                    var tableDivClasses = edges.css_classes(this.namespace, "tablediv", this);
                    var downloadId = edges.css_id(this.namespace, "download", this);
                    var down = "";
                    if (this.download) {
                        down = '<div class="row"><div class="col-md-12"><div class="' + downloadClasses + '"><a href="#" id="' + downloadId + '">' + edges.escapeHtml(this.downloadText) + "</a></div></div></div>"
                    }
                    var frag = '<div class="table-responsive ' + tableDivClasses + '">';
                    frag += '<table class="' + tableClasses + '"><thead><tr>_HEADERS_</tr></thead><tbody>';
                    var headerDisplay = [];
                    for (var i = 0; i < headerKeys.length; i++) {
                        var trip = false;
                        for (var j = 0; j < this.fieldDisplay.length; j++) {
                            var fd = this._getFieldDisplay(headerKeys[i]);
                            if (fd) {
                                headerDisplay.push(fd.display);
                                trip = true;
                                break
                            }
                        }
                        if (!trip) {
                            headerDisplay.push(headerKeys[i])
                        }
                    }
                    var headers = "";
                    for (var i = 0; i < headerDisplay.length; i++) {
                        var header = headerDisplay[i];
                        headers += '<th class="' + headerClasses + '">' + header + "</th>"
                    }
                    frag = frag.replace(/_HEADERS_/g, headers);
                    for (var i = 0; i < results.length; i++) {
                        var res = results[i];
                        frag += "<tr>";
                        for (var j = 0; j < headerKeys.length; j++) {
                            var key = headerKeys[j];
                            var def = this.defaultCellContent;
                            var fd = this._getFieldDisplay(key);
                            if (fd) {
                                def = fd.default
                            }
                            var val = edges.objVal(key, res, def);
                            var fieldClasses = edges.css_classes(this.namespace, "cell-" + edges.safeId(key), this);
                            frag += '<td class="' + cellClasses + " " + fieldClasses + '">' + edges.escapeHtml(val) + "</td>"
                        }
                        frag += "</tr>"
                    }
                    frag += "</tbody></table></div>" + down
                }
                this.component.context.html(frag);
                if (this.download) {
                    var downloadIdSelector = edges.css_id_selector(this.namespace, "download", this);
                    edges.on(downloadIdSelector, "click", this, "doDownload")
                }
            };
            this.doDownload = function(element) {
                if (!this.download) {
                    return
                }
                var downloadInfo = this._downloadData();
                var blob = new Blob([downloadInfo.data], {
                    type: downloadInfo.fileType
                });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = downloadInfo.fileName;
                a.click();
                window.URL.revokeObjectURL(url)
            };
            this._downloadData = function() {
                if (!this.download) {
                    return false
                }
                var table = [];
                var results = this.component.results;
                if (results && results.length > 0) {
                    var headerKeys = this._getHeaderRow();
                    var headerDisplay = [];
                    for (var i = 0; i < headerKeys.length; i++) {
                        var trip = false;
                        for (var j = 0; j < this.fieldDisplay.length; j++) {
                            var fd = this._getFieldDisplay(headerKeys[i]);
                            if (fd) {
                                headerDisplay.push(fd.display);
                                trip = true;
                                break
                            }
                        }
                        if (!trip) {
                            headerDisplay.push(headerKeys[i])
                        }
                    }
                    table.push(headerDisplay);
                    for (var i = 0; i < results.length; i++) {
                        var res = results[i];
                        var row = [];
                        for (var j = 0; j < headerKeys.length; j++) {
                            var key = headerKeys[j];
                            var val = edges.objVal(key, res, "");
                            row.push(val)
                        }
                        table.push(row)
                    }
                }
                var data = edges.csv.serialise({
                    data: table
                });
                var fileType = "text/csv;charset=UTF-8";
                var extension = "csv";
                var stamp = (new Date).getTime();
                var fileName = this.downloadPrefix + "_" + stamp + "." + extension;
                return {
                    data: data,
                    fileType: fileType,
                    fileName: fileName
                }
            };
            this._getFieldDisplay = function(field) {
                for (var j = 0; j < this.fieldDisplay.length; j++) {
                    if (this.fieldDisplay[j].field == field) {
                        return this.fieldDisplay[j]
                    }
                }
                return false
            };
            this._getHeaderRow = function() {
                if (this.headerOrderingFunction) {
                    return this.headerOrderingFunction(this)
                }
                var results = this.component.results;
                var hasResults = results !== false && results.length > 0;
                if (!hasResults || this.fieldDisplay.length == 0 && this.displayListedOnly) {
                    return []
                }
                var headers = [];
                if (this.fieldDisplay.length > 0) {
                    for (var i = 0; i < this.fieldDisplay.length; i++) {
                        headers.push(this.fieldDisplay[i].field)
                    }
                }
                if (!this.displayListedOnly) {
                    var keySet = {};
                    for (var i = 0; i < results.length; i++) {
                        var ks = Object.keys(results[i]);
                        for (var j = 0; j < ks.length; j++) {
                            if (!(ks[j] in keySet)) {
                                keySet[ks[j]] = true
                            }
                        }
                    }
                    var keys = Object.keys(keySet);
                    keys.sort();
                    for (var i = 0; i < keys.length; i++) {
                        if ($.inArray(keys[i], headers) == -1) {
                            headers.push(keys[i])
                        }
                    }
                }
                return headers
            }
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newBSMultiDateRange: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.BSMultiDateRange.prototype = edges.newRenderer(params);
            return new edges.bs3.BSMultiDateRange(params)
        },
        BSMultiDateRange: function(params) {
            this.dateFormat = edges.getParam(params.dateFormat, "MMMM D, YYYY");
            this.useSelect2 = edges.getParam(params.useSelect2, false);
            this.ranges = edges.getParam(params.ranges, false);
            this.dre = false;
            this.selectId = false;
            this.rangeId = false;
            this.selectJq = false;
            this.rangeJq = false;
            this.drp = false;
            this.namespace = "edges-bs3-bs-multi-date-range";
            this.draw = function() {
                var dre = this.component;
                var selectClass = edges.css_classes(this.namespace, "select", this);
                var inputClass = edges.css_classes(this.namespace, "input", this);
                var prefixClass = edges.css_classes(this.namespace, "prefix", this);
                this.selectId = edges.css_id(this.namespace, dre.id + "_date-type", this);
                this.rangeId = edges.css_id(this.namespace, dre.id + "_range", this);
                var pluginId = edges.css_id(this.namespace, dre.id + "_plugin", this);
                var options = "";
                for (var i = 0; i < dre.fields.length; i++) {
                    var field = dre.fields[i];
                    var selected = dre.currentField == field.field ? ' selected="selected" ' : "";
                    options += '<option value="' + field.field + '"' + selected + ">" + field.display + "</option>"
                }
                var frag = '<div class="form-inline">';
                if (dre.display) {
                    frag += '<span class="' + prefixClass + '">' + dre.display + "</span>"
                }
                frag += '<div class="form-group"><select class="' + selectClass + ' form-control" name="' + this.selectId + '" id="' + this.selectId + '">' + options + "</select></div>";
                frag += '<div id="' + this.rangeId + '" class="' + inputClass + ' form-control">                    <i class="glyphicon glyphicon-calendar"></i>&nbsp;                    <span></span> <b class="caret"></b>                </div>';
                frag += "</div>";
                dre.context.html(frag);
                var selectIdSelector = edges.css_id_selector(this.namespace, dre.id + "_date-type", this);
                var rangeIdSelector = edges.css_id_selector(this.namespace, dre.id + "_range", this);
                this.selectJq = dre.jq(selectIdSelector);
                this.rangeJq = dre.jq(rangeIdSelector);
                var cb = edges.objClosure(this, "updateDateRange", ["start", "end"]);
                var props = {
                    locale: {
                        format: "DD/MM/YYYY"
                    },
                    opens: "left"
                };
                if (this.ranges) {
                    props["ranges"] = this.ranges
                }
                var pluginSelector = edges.css_id_selector(this.namespace, dre.id + "_plugin", this);
                $(pluginSelector).remove();
                this.rangeJq.daterangepicker(props, cb);
                this.drp = this.rangeJq.data("daterangepicker");
                this.drp.container.attr("id", pluginId).addClass("show-calendar");
                this.prepDates();
                if (this.useSelect2) {
                    this.selectJq.select2()
                }
                edges.on(selectIdSelector, "change", this, "typeChanged")
            };
            this.dateRangeDisplay = function(params) {
                var start = params.start;
                var end = params.end;
                this.rangeJq.find("span").html(start.utc().format(this.dateFormat) + " - " + end.utc().format(this.dateFormat))
            };
            this.updateDateRange = function(params) {
                var start = params.start;
                var end = params.end;
                var date_type = null;
                if (this.useSelect2) {
                    date_type = this.selectJq.select2("val")
                } else {
                    date_type = this.selectJq.val()
                }
                this.component.changeField(date_type);
                this.component.setFrom(start.toDate());
                this.component.setTo(end.toDate());
                this.dateRangeDisplay(params);
                var triggered = this.component.triggerSearch();
                if (!triggered) {
                    this.prepDates()
                }
            };
            this.typeChanged = function(element) {
                var date_type = null;
                if (this.useSelect2) {
                    date_type = this.selectJq.select2("val")
                } else {
                    date_type = this.selectJq.val()
                }
                this.component.changeField(date_type);
                this.component.setFrom(false);
                this.component.setTo(false);
                var triggered = this.component.triggerSearch();
                if (!triggered) {
                    this.prepDates()
                }
            };
            this.prepDates = function() {
                var min = this.component.currentEarliest();
                var max = this.component.currentLatest();
                var fr = this.component.fromDate;
                var to = this.component.toDate;
                if (min) {
                    this.drp.minDate = moment(min);
                    this.drp.setStartDate(moment(min))
                } else {
                    this.drp.minDate = moment(this.component.defaultEarliest);
                    this.drp.setStartDate(moment(this.component.defaultEarliest))
                }
                if (max) {
                    this.drp.maxDate = moment(max);
                    this.drp.setEndDate(moment(max))
                } else {
                    this.drp.maxDate = moment(this.component.defaultLatest);
                    this.drp.setEndDate(moment(this.component.defaultLatest))
                }
                if (fr) {
                    if (fr < this.drp.minDate) {
                        this.drp.minDate = moment(fr)
                    }
                    if (fr > this.drp.maxDate) {
                        this.drp.maxDate = moment(fr)
                    }
                    this.drp.setStartDate(moment(fr))
                }
                if (to) {
                    if (to < this.drp.minDate) {
                        this.drp.minDate = moment(to)
                    }
                    if (to > this.drp.maxDate) {
                        this.drp.maxDate = moment(to)
                    }
                    this.drp.setEndDate(moment(to))
                }
                this.dateRangeDisplay({
                    start: this.drp.startDate,
                    end: this.drp.endDate
                })
            }
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newSearchingNotificationRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.SearchingNotificationRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.SearchingNotificationRenderer(params)
        },
        SearchingNotificationRenderer: function(params) {
            this.searchingMessage = params.searchingMessage || "Loading, please wait...";
            this.namespace = "edges-bs3-searching-notification";
            this.draw = function() {
                var frag = "";
                if (this.component.searching) {
                    var barClasses = edges.css_classes(this.namespace, "bar", this);
                    frag = '<div class="progress-bar progress-bar-info progress-bar-striped active ' + barClasses + '">                             ' + this.searchingMessage + "                         </div>"
                }
                this.component.context.html(frag)
            }
        }
    }
});