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

formatNumberToGbp = function(number) {
    return "£" + Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

showResultQuerySuccess = function(data) {

    var oa_title = data.data.hits.hits[0]._source.record["dc:title"]

    var apc_cost = data.data.hits.hits[0]._source.index.amount_inc_vat
    var publisher_name = data.data.hits.hits[0]._source.record["dcterms:publisher"].name
    var issn = data.data.hits.hits[0]._source.index.issn[0]
    var oa_type = data.data.hits.hits[0]._source.record["dc:source"].oa_type
    var organisation_name = data.data.hits.hits[0]._source.record["jm:apc"]["0"].organisation_name
    var funder_name = data.data.hits.hits[0]._source.record["rioxxterms:project"]["0"].funder_name
    var fund_name = data.data.hits.hits[0]._source.record["jm:apc"]["0"].fund["0"].name

    var html_str = '<div class="row"><p>Academic output:</p></div>'
                 + '<div class="row"><h1 class="report-header">'+oa_title+'</h1></div>'
                 + '<div class="row"><div class="col-md-2"><span>APC Cost:</span></div><div class="col-md-10"><span>'+formatNumberToGbp(apc_cost)+'</span></div></div>'
                 + '<div class="row"><div class="col-md-2"><span>Publisher:</span></div><div class="col-md-10"><span>'+publisher_name+'</span></div></div>'
                 + '<div class="row"><div class="col-md-2"><span>Organisation:</span></div><div class="col-md-10"><span>'+organisation_name+'</span></div></div>'
                 + '<div class="row"><div class="col-md-2"><span>Funder:</span></div><div class="col-md-10"><span>'+funder_name+'</span></div></div>'
                 + '<div class="row"><div class="col-md-2"><span>Paid from fund:</span></div><div class="col-md-10"><span>'+fund_name+'</span></div></div>'



    $("#main").html(html_str);

}

showResultQueryFail = function(data) {
    console.log("moo")
}
showResult = function (id) {
    //try {
        var q = es.newQuery();
        var f = es.newTermsFilter({field: "id", values: [id]})
        q.addMust(f)
        es.doQuery({
            search_url: octopus.config.public_query_endpoint,
            queryobj: q.objectify(),
            datatype: "jsonp",
            success: function(data){showResultQuerySuccess(data)},
            error: function(data){showResultQueryFail(data)}
        })


    //catch(err) {}
};