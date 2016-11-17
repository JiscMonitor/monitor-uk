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
$.extend(true, edges, {
    bs3: {
        newSearchBoxRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.SearchBoxRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.SearchBoxRenderer(params)
        },
        SearchBoxRenderer: function(params) {
            this.searchButton = edges.getParam(params.searchButton, false);
            this.searchButtonText = edges.getParam(params.searchButtonText, false);
            this.clearButton = edges.getParam(params.clearButton, true);
            this.searchPlaceholder = edges.getParam(params.searchPlaceholder, "Search");
            this.freetextSubmitDelay = edges.getParam(params.freetextSubmitDelay, 500);
            this.namespace = "edges-bs3-search-box";
            this.draw = function() {
                var comp = this.component;
                var searchClasses = edges.css_classes(this.namespace, "search", this);
                var searchFieldClass = edges.css_classes(this.namespace, "field", this);
                var resetClass = edges.css_classes(this.namespace, "reset", this);
                var textClass = edges.css_classes(this.namespace, "text", this);
                var searchButtonClass = edges.css_classes(this.namespace, "search-button", this);
                var textId = edges.css_id(this.namespace, "text", this);
                var field_select = "";
                if (comp.fieldOptions && comp.fieldOptions.length > 0) {
                    field_select += '<select class="form-control ' + searchFieldClass + '" style="width: 120px">';
                    field_select += '<option value="">search all</option>';
                    for (var i = 0; i < comp.fieldOptions.length; i++) {
                        var obj = comp.fieldOptions[i];
                        field_select += '<option value="' + obj["field"] + '">' + edges.escapeHtml(obj["display"]) + "</option>"
                    }
                    field_select += "</select>"
                }
                var clearFrag = "";
                if (this.clearButton) {
                    clearFrag = '<span class="input-group-btn">                         <button type="button" class="btn btn-danger ' + resetClass + '" title="Clear all search parameters and start again">                             <span class="glyphicon glyphicon-remove"></span>                         </button>                     </span>'
                }
                var searchFrag = "";
                if (this.searchButton) {
                    var text = '<span class="glyphicon glyphicon-white glyphicon-search"></span>';
                    if (this.searchButtonText !== false) {
                        text = this.searchButtonText
                    }
                    searchFrag = '<span class="input-group-btn">                         <button type="button" class="btn btn-info ' + searchButtonClass + '">                             ' + text + "                         </button>                     </span>"
                }
                var searchBox = '<div class="' + searchClasses + '"><div class="form-inline">                         <div class="form-group">                             <div class="input-group">                                 ' + clearFrag + field_select + '                                <input type="text" id="' + textId + '" class="form-control ' + textClass + '" name="q" value="" placeholder="' + this.searchPlaceholder + '"/>                                 ' + searchFrag + "                             </div>                         </div>                     </div></div>";
                var frag = '<div class="row"><div class="col-md-12">{{SEARCH}}</div></div>';
                frag = frag.replace(/{{SEARCH}}/g, searchBox);
                comp.context.html(frag);
                if (comp.fieldOptions && comp.fieldOptions.length > 0) {
                    this.setUISearchField()
                }
                this.setUISearchText();
                if (comp.fieldOptions && comp.fieldOptions.length > 0) {
                    var fieldSelector = edges.css_class_selector(this.namespace, "field", this);
                    edges.on(fieldSelector, "change", this, "changeSearchField")
                }
                var textSelector = edges.css_class_selector(this.namespace, "text", this);
                if (this.freetextSubmitDelay > -1) {
                    edges.on(textSelector, "keyup", this, "setSearchText", this.freetextSubmitDelay)
                } else {
                    function onlyEnter(event) {
                        var code = event.keyCode ? event.keyCode : event.which;
                        return code === 13
                    }
                    edges.on(textSelector, "keyup", this, "setSearchText", false, onlyEnter)
                }
                if (this.clearButton) {
                    var resetSelector = edges.css_class_selector(this.namespace, "reset", this);
                    edges.on(resetSelector, "click", this, "clearSearch")
                }
                if (this.searchButton) {
                    var searchSelector = edges.css_class_selector(this.namespace, "search-button", this);
                    edges.on(searchSelector, "click", this, "doSearch")
                }
            };
            this.setUISearchField = function() {
                if (!this.component.searchField) {
                    return
                }
                var fieldSelector = edges.css_class_selector(this.namespace, "field", this);
                var el = this.component.jq(fieldSelector);
                el.val(this.component.searchField)
            };
            this.setUISearchText = function() {
                if (!this.component.searchString) {
                    return
                }
                var textSelector = edges.css_class_selector(this.namespace, "text", this);
                var el = this.component.jq(textSelector);
                el.val(this.component.searchString)
            };
            this.changeSearchField = function(element) {
                var val = this.component.jq(element).val();
                this.component.setSearchField(val)
            };
            this.setSearchText = function(element) {
                var val = this.component.jq(element).val();
                this.component.setSearchText(val)
            };
            this.clearSearch = function(element) {
                this.component.clearSearch()
            };
            this.doSearch = function(element) {
                var textId = edges.css_id_selector(this.namespace, "text", this);
                var text = this.component.jq(textId).val();
                this.component.setSearchText(text)
            }
        }
    }
});
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
$.extend(true, edges, {
    bs3: {
        newFacetFilterSetterRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.FacetFilterSetterRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.FacetFilterSetterRenderer(params)
        },
        FacetFilterSetterRenderer: function(params) {
            this.open = edges.getParam(params.open, false);
            this.togglable = edges.getParam(params.togglable, true);
            this.showCount = edges.getParam(params.showCount, true);
            this.facetTitle = edges.getParam(params.facetTitle, "Untitled");
            this.intro = edges.getParam(params.intro, false);
            this.openIcon = edges.getParam(params.openIcon, "glyphicon glyphicon-plus");
            this.closeIcon = edges.getParam(params.closeIcon, "glyphicon glyphicon-minus");
            this.layout = edges.getParam(params.layout, "left");
            this.namespace = "edges-bs3-facet-filter-setter";
            this.draw = function() {
                var comp = this.component;
                var namespace = this.namespace;
                var filterClass = edges.css_classes(namespace, "filter", this);
                var valClass = edges.css_classes(namespace, "value", this);
                var filterRemoveClass = edges.css_classes(namespace, "filter-remove", this);
                var facetClass = edges.css_classes(namespace, "facet", this);
                var headerClass = edges.css_classes(namespace, "header", this);
                var bodyClass = edges.css_classes(this.namespace, "body", this);
                var introClass = edges.css_classes(this.namespace, "intro", this);
                var countClass = edges.css_classes(namespace, "count", this);
                var toggleId = edges.css_id(namespace, "toggle", this);
                var resultsId = edges.css_id(namespace, "results", this);
                var filters = "";
                for (var i = 0; i < comp.filters.length; i++) {
                    var filter = comp.filters[i];
                    var id = filter.id;
                    var display = filter.display;
                    var count = comp.filter_counts[id];
                    var active = comp.active_filters[id];
                    if (count === undefined) {
                        count = 0
                    }
                    filters += '<div class="' + filterClass + '">';
                    if (active) {
                        filters += "<strong>" + edges.escapeHtml(display);
                        if (this.showCount) {
                            filters += " (" + count + ")"
                        }
                        filters += '&nbsp;<a href="#" class="' + filterRemoveClass + '" data-filter="' + edges.escapeHtml(id) + '">';
                        filters += '<i class="glyphicon glyphicon-black glyphicon-remove"></i></a>';
                        filters += "</strong>"
                    } else {
                        filters += '<a href="#" class="' + valClass + '" data-filter="' + edges.escapeHtml(id) + '">' + edges.escapeHtml(display) + "</a>";
                        if (this.showCount) {
                            filters += ' <span class="' + countClass + '">(' + count + ")</span>"
                        }
                    }
                    filters += "</div>"
                }
                var header = this.headerLayout({
                    toggleId: toggleId
                });
                var introFrag = "";
                if (this.intro !== false) {
                    introFrag = '<div class="' + introClass + '">' + this.intro + "</div>"
                }
                var frag = '<div class="' + facetClass + '">                        <div class="' + headerClass + '"><div class="row">                             <div class="col-md-12">                                ' + header + '                            </div>                        </div></div>                        <div class="' + bodyClass + '">                            <div class="row" style="display:none" id="' + resultsId + '">                                <div class="col-md-12">                                    ' + introFrag + "                                    {{FILTERS}}                                </div>                            </div></div>                        </div>";
                frag = frag.replace(/{{FILTERS}}/g, filters);
                comp.context.html(frag);
                this.setUIOpen();
                var valueSelector = edges.css_class_selector(namespace, "value", this);
                var filterRemoveSelector = edges.css_class_selector(namespace, "filter-remove", this);
                var toggleSelector = edges.css_id_selector(namespace, "toggle", this);
                edges.on(valueSelector, "click", this, "filterSelected");
                edges.on(toggleSelector, "click", this, "toggleOpen");
                edges.on(filterRemoveSelector, "click", this, "removeFilter")
            };
            this.headerLayout = function(params) {
                var toggleId = params.toggleId;
                var iconClass = edges.css_classes(this.namespace, "icon", this);
                if (this.layout === "left") {
                    var tog = this.facetTitle;
                    if (this.togglable) {
                        tog = '<a href="#" id="' + toggleId + '"><i class="' + this.openIcon + '"></i>&nbsp;' + tog + "</a>"
                    }
                    return tog
                } else if (this.layout === "right") {
                    var tog = "";
                    if (this.togglable) {
                        tog = '<a href="#" id="' + toggleId + '">' + this.facetTitle + '&nbsp;<i class="' + this.openIcon + " " + iconClass + '"></i></a>'
                    } else {
                        tog = this.facetTitle
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
            this.filterSelected = function(element) {
                var filter_id = this.component.jq(element).attr("data-filter");
                this.component.addFilter(filter_id)
            };
            this.removeFilter = function(element) {
                var filter_id = this.component.jq(element).attr("data-filter");
                this.component.removeFilter(filter_id)
            };
            this.toggleOpen = function(element) {
                this.open = !this.open;
                this.setUIOpen()
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
$.extend(true, edges, {
    bs3: {
        newNumberedPager: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.NumberedPager.prototype = edges.newRenderer(params);
            return new edges.bs3.NumberedPager(params)
        },
        NumberedPager: function(params) {
            this.scroll = edges.getParam(params.scroll, true);
            this.scrollSelector = edges.getParam(params.scrollSelector, "body");
            this.namespace = "edges-bs3-numbered-pager";
            this.draw = function() {
                if (this.component.total === false || this.component.total === 0) {
                    this.component.context.html("");
                    return
                }
                var containerClass = edges.css_classes(this.namespace, "container", this);
                var navClass = edges.css_classes(this.namespace, "nav", this);
                var prevClass = edges.css_classes(this.namespace, "prev", this);
                var pageClass = edges.css_classes(this.namespace, "page", this);
                var nextClass = edges.css_classes(this.namespace, "next", this);
                var navListClass = edges.css_classes(this.namespace, "nav-list", this);
                var prev = '<a href="#" class="' + prevClass + '"><i class="glyphicon glyphicon-chevron-left"></i>&nbsp;Previous</a>';
                if (this.component.page === 1) {
                    prev = '<span class="' + prevClass + ' disabled"><i class="glyphicon glyphicon-chevron-left"></i>&nbsp;Previous</span>'
                }
                prev = "<li>" + prev + "</li>";
                var next = '<a href="#" class="' + nextClass + '">Next&nbsp;<i class="glyphicon glyphicon-chevron-right"></i></a>';
                if (this.component.page === this.component.totalPages) {
                    next = '<span class="' + nextClass + ' disabled">Next&nbsp;<i class="glyphicon glyphicon-chevron-right"></i></a>'
                }
                next = "<li>" + next + "</li>";
                var pageList = "";
                if (this.component.totalPages <= 9) {
                    for (var pageNum = 1; pageNum <= this.component.totalPages; pageNum++) {
                        pageList += "<li>" + pageNum + "</li>"
                    }
                } else {
                    for (var pageNum = 1; pageNum <= 2; pageNum++) {
                        pageList += this._pageLi({
                            pageNum: pageNum
                        })
                    }
                    if (this.component.page <= 5) {
                        for (var pageNum = 3; pageNum <= 7; pageNum++) {
                            pageList += this._pageLi({
                                pageNum: pageNum
                            })
                        }
                        pageList += "<li>...</li>";
                        for (var pageNum = this.component.totalPages - 1; pageNum <= this.component.totalPages; pageNum++) {
                            pageList += this._pageLi({
                                pageNum: pageNum
                            })
                        }
                    } else if (this.component.page >= this.component.totalPages - 5) {
                        pageList += "<li>...</li>";
                        for (var pageNum = this.component.totalPages - 6; pageNum <= this.component.totalPages; pageNum++) {
                            pageList += this._pageLi({
                                pageNum: pageNum
                            })
                        }
                    } else {
                        pageList += "<li>...</li>";
                        for (var pageNum = this.component.page - 2; pageNum <= this.component.page + 2; pageNum++) {
                            pageList += this._pageLi({
                                pageNum: pageNum
                            })
                        }
                        pageList += "<li>...</li>";
                        for (var pageNum = this.component.totalPages - 1; pageNum <= this.component.totalPages; pageNum++) {
                            pageList += this._pageLi({
                                pageNum: pageNum
                            })
                        }
                    }
                }
                var nav = '<div class="' + navClass + '"><ul class="' + navListClass + '">' + prev + pageList + next + "</ul>";
                var frag = '<div class="' + containerClass + '"><div class="row"><div class="col-md-12">{{NAV}}</div></div></div>';
                frag = frag.replace(/{{NAV}}/g, nav);
                this.component.context.html(frag);
                var prevSelector = edges.css_class_selector(this.namespace, "prev", this);
                var nextSelector = edges.css_class_selector(this.namespace, "next", this);
                var pageSelector = edges.css_class_selector(this.namespace, "page", this);
                if (this.component.page !== 1) {
                    edges.on(prevSelector, "click", this, "goToPrev")
                }
                if (this.component.page !== this.component.totalPages) {
                    edges.on(nextSelector, "click", this, "goToNext")
                }
                edges.on(pageSelector, "click", this, "goToPage")
            };
            this._pageLi = function(params) {
                var pageNum = params.pageNum;
                var pageList = "";
                if (pageNum === this.component.page) {
                    var currentClass = edges.css_classes(this.namespace, "current", this);
                    pageList += '<li><span class="' + currentClass + '">' + pageNum + "</span></li>"
                } else {
                    var pageClass = edges.css_classes(this.namespace, "page", this);
                    pageList += '<li><a href="#" class="' + pageClass + '" data-page="' + pageNum + '">' + pageNum + "</a></li>"
                }
                return pageList
            };
            this.doScroll = function() {
                $(this.scrollSelector).animate({
                    scrollTop: $(this.scrollSelector).offset().top
                }, 1)
            };
            this.goToPrev = function(element) {
                if (this.scroll) {
                    this.doScroll()
                }
                this.component.decrementPage()
            };
            this.goToNext = function(element) {
                if (this.scroll) {
                    this.doScroll()
                }
                this.component.incrementPage()
            };
            this.goToPage = function(element) {
                if (this.scroll) {
                    this.doScroll()
                }
                var page = parseInt($(element).attr("data-page"));
                this.component.goToPage({
                    page: page
                })
            }
        }
    }
});
$.extend(muk, {
    search: {
        newSearchTemplate: function(params) {
            if (!params) {
                params = {}
            }
            muk.search.SearchTemplate.prototype = edges.newTemplate(params);
            return new muk.search.SearchTemplate(params)
        },
        SearchTemplate: function(params) {
            this.edge = false;
            this.namespace = "muk-search-template";
            this.draw = function(edge) {
                this.edge = edge;
                var containerClass = edges.css_classes(this.namespace, "container");
                var searchClass = edges.css_classes(this.namespace, "search");
                var facetsClass = edges.css_classes(this.namespace, "facets");
                var countClass = edges.css_classes(this.namespace, "count");
                var sortClass = edges.css_classes(this.namespace, "sort");
                var resultsClass = edges.css_classes(this.namespace, "results");
                var itemsClass = edges.css_classes(this.namespace, "items");
                var pagerClass = edges.css_classes(this.namespace, "pager");
                var facetClass = edges.css_classes(this.namespace, "facet");
                var searchingClass = edges.css_classes(this.namespace, "searching");
                var panelClass = edges.css_classes(this.namespace, "panel");
                var refineClass = edges.css_classes(this.namespace, "refine");
                var frag = '<div class="' + containerClass + '"><div class="row"><div class="col-md-12"><div class="' + searchClass + '">{{SEARCH}}</div></div></div><div class="row"><div class="col-md-12"><div class="' + searchingClass + '">{{SEARCHING}}</div></div></div><div class="' + panelClass + '"><div class="row"><div class="col-md-3"><div class="' + facetsClass + '"><div class="' + refineClass + '">Refine</div>{{FACETS}}</div></div><div class="col-md-9"><div class="row"><div class="col-md-6"><div class="' + countClass + '">{{RESULTCOUNT}}</div></div><div class="col-md-6"><div class="' + sortClass + '">{{SORT}}</div></div></div><div class="row"><div class="col-md-12"><div class="' + resultsClass + '">{{RESULTS}}</div></div>                            </div><div class="row"><div class="col-md-12"><div class="' + itemsClass + '">{{ITEMSPERPAGE}}</div></div></div><div class="row"><div class="col-md-12"><div class="' + pagerClass + '">{{PAGER}}</div></div></div></div></div></div></div>';
                var searchFrag = "";
                var searches = edge.category("search");
                for (var i = 0; i < searches.length; i++) {
                    searchFrag += '<div id="' + searches[i].id + '"></div>'
                }
                var searchingFrag = "";
                var searchings = edge.category("searching-notification");
                for (var i = 0; i < searchings.length; i++) {
                    searchingFrag += '<div id="' + searchings[i].id + '"></div>'
                }
                var facets = edge.category("facet");
                var facetsFrag = "";
                for (var i = 0; i < facets.length; i++) {
                    facetsFrag += '<div class="' + facetClass + '"><div id="' + facets[i].id + '"></div></div>'
                }
                var countFrag = "";
                var counts = edge.category("count");
                for (var i = 0; i < counts.length; i++) {
                    countFrag += '<div id="' + counts[i].id + '"></div>'
                }
                var sortFrag = "";
                var sorts = edge.category("sort");
                for (var i = 0; i < sorts.length; i++) {
                    sortFrag += '<div id="' + sorts[i].id + '"></div>'
                }
                var resultsFrag = "";
                var results = edge.category("results");
                for (var i = 0; i < results.length; i++) {
                    resultsFrag += '<div id="' + results[i].id + '"></div>'
                }
                var itemsFrag = "";
                var items = edge.category("items");
                for (var i = 0; i < items.length; i++) {
                    itemsFrag += '<div id="' + items[i].id + '"></div>'
                }
                var pagerFrag = "";
                var pagers = edge.category("pager");
                for (var i = 0; i < pagers.length; i++) {
                    pagerFrag += '<div id="' + pagers[i].id + '"></div>'
                }
                frag = frag.replace(/{{SEARCH}}/g, searchFrag).replace(/{{SEARCHING}}/g, searchingFrag).replace(/{{FACETS}}/g, facetsFrag).replace(/{{RESULTCOUNT}}/g, countFrag).replace(/{{SORT}}/g, sortFrag).replace(/{{RESULTS}}/g, resultsFrag).replace(/{{ITEMSPERPAGE}}/g, itemsFrag).replace(/{{PAGER}}/g, pagerFrag);
                edge.context.html(frag)
            }
        },
        newAPCRenderer: function(params) {
            if (!params) {
                params = {}
            }
            muk.search.APCRenderer.prototype = edges.newRenderer(params);
            return new muk.search.APCRenderer(params)
        },
        APCRenderer: function(params) {
            this.noResultsText = edges.getParam(params.noResultsText, "No results to display");
            this.namespace = "muk-search-apc";
            this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            this.draw = function() {
                var frag = this.noResultsText;
                if (this.component.results === false) {
                    frag = ""
                }
                var results = this.component.results;
                if (results && results.length > 0) {
                    var recordClasses = edges.css_classes(this.namespace, "record", this);
                    frag = "";
                    for (var i = 0; i < results.length; i++) {
                        var rec = this._renderResult(results[i]);
                        frag += '<div class="row"><div class="col-md-12"><div class="' + recordClasses + '">' + rec + "</div></div></div>"
                    }
                }
                var containerClasses = edges.css_classes(this.namespace, "container", this);
                var container = '<div class="' + containerClasses + '">' + frag + "</div>";
                this.component.context.html(container);
                var moreSelector = edges.css_class_selector(this.namespace, "more-link", this);
                edges.on(moreSelector, "click", this, "showMore");
                var lessSelector = edges.css_class_selector(this.namespace, "less-link", this);
                edges.on(lessSelector, "click", this, "showLess")
            };
            this._renderResult = function(res) {
                var id = edges.objVal("id", res);
                var titleClass = edges.css_classes(this.namespace, "title", this);
                var costClass = edges.css_classes(this.namespace, "cost", this);
                var biblioClass = edges.css_classes(this.namespace, "biblio", this);
                var labelClass = edges.css_classes(this.namespace, "label", this);
                var valueClass = edges.css_classes(this.namespace, "value", this);
                var moreLinkClass = edges.css_classes(this.namespace, "more-link", this);
                var moreLinkBoxClass = edges.css_classes(this.namespace, "more-link-box", this);
                var lessLinkClass = edges.css_classes(this.namespace, "less-link", this);
                var lessLinkBoxClass = edges.css_classes(this.namespace, "less-link-box", this);
                var moreBoxClass = edges.css_classes(this.namespace, "more-box", this);
                var vatClass = edges.css_classes(this.namespace, "vat", this);
                var inlineLabelClass = edges.css_classes(this.namespace, "inline-label", this);
                var rightClass = edges.css_classes(this.namespace, "right", this);
                var biblioRowClass = edges.css_classes(this.namespace, "bib-row", this);
                var innerMoreClass = edges.css_classes(this.namespace, "inner-more", this);
                var innerMoreLinkClass = edges.css_classes(this.namespace, "inner-more-link", this);
                var innerLessLinkClass = edges.css_classes(this.namespace, "inner-less-link", this);
                var moreBoxId = edges.css_id(this.namespace, "more-" + id, this);
                var moreLinkBoxId = edges.css_id(this.namespace, "more-link-" + id, this);
                var lessLinkBoxId = edges.css_id(this.namespace, "less-link-" + id, this);
                var title = edges.objVal("record.dc:title", res, "Untitled");
                var cost = edges.objVal("index.amount_inc_vat", res, false);
                var publisher = edges.objVal("record.dcterms:publisher.name", res, "Unknown");
                var journal = edges.objVal("record.dc:source.name", res, "Unknown");
                var apcs = edges.objVal("record.jm:apc", res, []);
                var journal_ids = edges.objVal("record.dc:source.identifier", res, []);
                var projects = edges.objVal("record.rioxxterms:project", res, []);
                var license_ref = edges.objVal("record.ali:license_ref", res, []);
                if (cost !== false) {
                    cost = muk.toGBPIntFormat()(cost)
                } else {
                    cost = "£-"
                }
                var orgList = [];
                var fundList = [];
                for (var i = 0; i < apcs.length; i++) {
                    var org = edges.objVal("organisation_name", apcs[i], false);
                    if (org !== false && $.inArray(org, orgList) === -1) {
                        orgList.push(org)
                    }
                    var funds = edges.objVal("fund", apcs[i], []);
                    for (var j = 0; j < funds.length; j++) {
                        var fname = funds[j].name;
                        if (fname && $.inArray(fname, fundList) === -1) {
                            fundList.push(fname)
                        }
                    }
                }
                var orgs = orgList.join(", ");
                var funds = fundList.join(", ");
                var issnList = [];
                for (var i = 0; i < journal_ids.length; i++) {
                    var jid = journal_ids[i];
                    if (jid.type === "issn") {
                        issnList.push(jid.id)
                    }
                }
                var issnFrag = "";
                var journalWidth = "10";
                if (issnList.length > 0) {
                    issnFrag = '<div class="col-md-8">(<span class="' + inlineLabelClass + '">ISSN:</span>&nbsp;<span class="' + valueClass + '">' + edges.escapeHtml(issnList.join(", ")) + "</span>)</div>";
                    journalWidth = "2"
                }
                var funderList = [];
                for (var i = 0; i < projects.length; i++) {
                    var fname = projects[i].funder_name;
                    if (fname && $.inArray(fname, funderList) === -1) {
                        funderList.push(fname)
                    }
                }
                var funders = funderList.join(", ");
                var licenceList = [];
                for (var i = 0; i < license_ref.length; i++) {
                    var lname = license_ref[i].type;
                    if (lname && $.inArray(lname, licenceList) === -1) {
                        licenceList.push(lname)
                    }
                }
                var licences = licenceList.join(", ");
                var biblio = '<div class="' + biblioRowClass + '"><div class="row">                    <div class="col-md-2"><span class="' + labelClass + '">Publisher</span></div>                    <div class="col-md-10"><span class="' + valueClass + '">' + edges.escapeHtml(publisher) + '</span></div>                </div></div>                <div class="' + biblioRowClass + '"><div class="row">                    <div class="col-md-2"><span class="' + labelClass + '">Journal</span></div>                    <div class="col-md-' + journalWidth + '"><span class="' + valueClass + '">' + edges.escapeHtml(journal) + "</span></div>                    " + issnFrag + '                </div></div>                <div class="' + biblioRowClass + '"><div class="row">                    <div class="col-md-2"><span class="' + labelClass + '">Organisation</span></div>                    <div class="col-md-10"><span class="' + valueClass + '">' + edges.escapeHtml(orgs) + '</span></div>                </div></div>                <div class="' + biblioRowClass + '"><div class="row">                    <div class="col-md-2"><span class="' + labelClass + '">Funder</span></div>                    <div class="col-md-2"><span class="' + valueClass + '">' + edges.escapeHtml(funders) + '</span></div>                    <div class="col-md-2"><span class="' + labelClass + '">Paid from fund</span></div>                    <div class="col-md-2"><span class="' + valueClass + '">' + edges.escapeHtml(funds) + '</span></div>                    <div class="col-md-2"><span class="' + labelClass + '">Licence</span></div>                    <div class="col-md-2"><span class="' + valueClass + '">' + edges.escapeHtml(licences) + "</span></div>                </div></div>";
                var apc = "";
                for (var i = 0; i < apcs.length; i++) {
                    var apc_record = apcs[i];
                    var inst = edges.objVal("organisation_name", apc_record, "Unknown Organisation");
                    var total = edges.objVal("amount_inc_vat_gbp", apc_record, false);
                    var date = edges.objVal("date_paid", apc_record);
                    var funds = edges.objVal("fund", apc_record, []);
                    if (total !== false) {
                        total = muk.toGBPIntFormat()(total)
                    } else {
                        total = "Unknown Amount"
                    }
                    var fund_names = [];
                    for (var j = 0; j < funds.length; j++) {
                        var fund = funds[j];
                        var fund_name = edges.objVal("name", fund, "Unknown Fund");
                        fund_names.push(fund_name)
                    }
                    if (date) {
                        var dobj = new Date(date);
                        var day = dobj.getUTCDate();
                        var month = this.months[dobj.getUTCMonth()];
                        var year = dobj.getUTCFullYear();
                        date = day + " " + month + " " + year
                    } else {
                        date = "Unknown Date"
                    }
                    apc += '<div class="row">                        <div class="col-md-12">                            <span class="' + valueClass + '">' + edges.escapeHtml(inst) + '</span>                             paid                             <span class="' + valueClass + '">' + edges.escapeHtml(total) + '</span>                             on                             <span class="' + valueClass + '">' + edges.escapeHtml(date) + '</span>                             from fund(s):                             <span class="' + valueClass + '">' + edges.escapeHtml(fund_names.join(", ")) + "</span>                         </div>                    </div>"
                }
                var frag = '<div class="row">                     <div class="col-md-10"><span class="' + titleClass + '">' + edges.escapeHtml(title) + '</span></div>                    <div class="col-md-2"><div class="' + rightClass + '"><span class="' + costClass + '">' + edges.escapeHtml(cost) + '</span><br>                        <span class="' + vatClass + '">(inc VAT)</span>                    </div></div>                </div>                <div class="' + biblioClass + '"><div class="row">                     <div class="col-md-12">{{BIBLIO}}</div>                </div></div>                <div class="' + moreBoxClass + '" id="' + moreBoxId + '"><div class="row">                     <div class="col-md-12"><div class="' + innerMoreClass + '">{{APCS}}</div></div>                </div></div>                <div id="' + moreLinkBoxId + '" class="' + moreLinkBoxClass + '"><div class="row">                     <div class="col-md-12"><div class="' + innerMoreLinkClass + '"><a href="#" class="' + moreLinkClass + '" data-id="' + id + '">More</a></div></div>                </div></div>                <div id="' + lessLinkBoxId + '" class="' + lessLinkBoxClass + '"><div class="row">                     <div class="col-md-12"><div class="' + innerLessLinkClass + '"><a href="#" class="' + lessLinkClass + '" data-id="' + id + '">Less</a></div></div>                </div></div>';
                frag = frag.replace(/{{BIBLIO}}/g, biblio).replace(/{{APCS}}/g, apc);
                return frag
            };
            this.showMore = function(element) {
                var e = this.component.jq(element);
                var id = e.attr("data-id");
                var moreBoxSelector = edges.css_id_selector(this.namespace, "more-" + id, this);
                var lessLinkBoxSelector = edges.css_id_selector(this.namespace, "less-link-" + id, this);
                var moreLinkBoxSelector = edges.css_id_selector(this.namespace, "more-link-" + id, this);
                this.component.jq(moreLinkBoxSelector).hide();
                this.component.jq(moreBoxSelector).slideDown(200);
                this.component.jq(lessLinkBoxSelector).show()
            };
            this.showLess = function(element) {
                var e = this.component.jq(element);
                var id = e.attr("data-id");
                var moreBoxSelector = edges.css_id_selector(this.namespace, "more-" + id, this);
                var moreLinkBoxSelector = edges.css_id_selector(this.namespace, "more-link-" + id, this);
                var lessLinkBoxSelector = edges.css_id_selector(this.namespace, "less-link-" + id, this);
                this.component.jq(lessLinkBoxSelector).hide();
                this.component.jq(moreBoxSelector).slideUp(200);
                this.component.jq(moreLinkBoxSelector).show()
            }
        },
        formatDateRange: function(params) {
            var field = params.field;
            var from = params.from;
            var to = params.to;
            var fd = new Date(from);
            var td = new Date(to);
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var fs = months[fd.getUTCMonth()] + " " + fd.getUTCDate() + ", " + fd.getUTCFullYear();
            var ts = months[td.getUTCMonth()] + " " + td.getUTCDate() + ", " + td.getUTCFullYear();
            return {
                to: to,
                from: from,
                display: "From " + fs + " to " + ts
            }
        },
        makeSearch: function(params) {
            if (!params) {
                params = {}
            }
            var selector = edges.getParam(params.selector, "#muk_search");
            var opening_query = es.newQuery();
            opening_query.addSortBy(es.newSort({
                field: "created_date",
                dir: "desc"
            }));
            var e = edges.newEdge({
                selector: selector,
                template: muk.search.newSearchTemplate(),
                search_url: octopus.config.public_query_endpoint,
                manageUrl: true,
                openingQuery: opening_query,
                components: [edges.newFullSearchController({
                    id: "search-box",
                    category: "search",
                    renderer: edges.bs3.newSearchBoxRenderer({
                        clearButton: false,
                        searchButton: true,
                        searchButtonText: "Search",
                        searchPlaceholder: "Enter a title, journal, publisher, funder, organisation...",
                        freetextSubmitDelay: -1
                    })
                }), edges.newSelectedFilters({
                    id: "selected-filters",
                    category: "facet",
                    fieldDisplays: {
                        "record.dcterms:publisher.name.exact": "Publisher",
                        "record.dc:source.name.exact": "Journal",
                        "index.amount_inc_vat": "APC Cost",
                        "record.jm:apc.organisation_name.exact": "Institution",
                        "index.apc_count": "Multiple APCs",
                        "index.org_count": "Multiple Organisations",
                        "index.account_count": "Multiple Contributors",
                        "record.dc:source.oa_type.exact": "Journal Type",
                        "record.rioxxterms:publication_date": "Publication Date",
                        "record.jm:apc.date_applied": "APC Application",
                        "record.jm:apc.date_paid": "Date Paid"
                    },
                    valueMaps: {
                        "record.dc:source.oa_type.exact": {
                            oa: "Pure OA",
                            hybrid: "Hybrid",
                            unknown: "Unknown"
                        }
                    },
                    rangeMaps: {
                        "index.apc_count": [{
                            from: 2,
                            display: "Yes"
                        }],
                        "index.org_count": [{
                            from: 2,
                            display: "Yes"
                        }],
                        "index.account_count": [{
                            from: 2,
                            display: "Yes"
                        }]
                    },
                    rangeFunctions: {
                        "record.rioxxterms:publication_date": muk.search.formatDateRange,
                        "record.jm:apc.date_applied": muk.search.formatDateRange,
                        "record.jm:apc.date_paid": muk.search.formatDateRange
                    },
                    renderer: edges.bs3.newCompactSelectedFiltersRenderer({
                        header: "Refined by",
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        open: true
                    })
                }), edges.newORTermSelector({
                    id: "journal",
                    field: "record.dc:source.name.exact",
                    display: "Journal",
                    size: 1e4,
                    category: "facet",
                    lifecycle: "update",
                    renderer: edges.bs3.newORTermSelectorRenderer({
                        showCount: true,
                        hideEmpty: true,
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        open: true
                    })
                }), edges.newORTermSelector({
                    id: "organisation",
                    field: "record.jm:apc.organisation_name.exact",
                    display: "Institution",
                    size: 500,
                    category: "facet",
                    lifecycle: "update",
                    renderer: edges.bs3.newORTermSelectorRenderer({
                        showCount: true,
                        hideEmpty: true,
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        open: true
                    })
                }), edges.newNumericRangeEntry({
                    id: "apc_cost",
                    field: "index.amount_inc_vat",
                    display: "APC Cost",
                    category: "facet",
                    increment: 500,
                    renderer: edges.bs3.newNumericRangeEntryRenderer({
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        open: true
                    })
                }), edges.newORTermSelector({
                    id: "oa_type",
                    field: "record.dc:source.oa_type.exact",
                    display: "Journal Type",
                    category: "facet",
                    lifecycle: "update",
                    valueMap: {
                        oa: "Pure OA",
                        hybrid: "Hybrid",
                        unknown: "Unknown"
                    },
                    renderer: edges.bs3.newORTermSelectorRenderer({
                        showCount: true,
                        hideEmpty: false,
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        open: true
                    })
                }), edges.newMultiDateRangeEntry({
                    id: "date_range",
                    category: "facet",
                    display: "Date",
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
                    renderer: edges.bs3.newBSMultiDateRangeFacet({
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        prefix: "Show records where",
                        ranges: muk.yearRanges({
                            "academic year": "09-01",
                            "fiscal year": "04-01",
                            "calendar year": "01-01"
                        }, {
                            "This ": 0,
                            "Last ": 1
                        }),
                        open: true
                    })
                }), edges.newFilterSetter({
                    id: "deduplicate",
                    category: "facet",
                    aggregations: [es.newRangeAggregation({
                        name: "apc_count",
                        field: "index.apc_count",
                        ranges: [{
                            from: 2
                        }]
                    }), es.newRangeAggregation({
                        name: "org_count",
                        field: "index.org_count",
                        ranges: [{
                            from: 2
                        }]
                    }), es.newRangeAggregation({
                        name: "account_count",
                        field: "index.account_count",
                        ranges: [{
                            from: 2
                        }]
                    })],
                    filters: [{
                        id: "multiple_apcs",
                        display: "More than one APC has been paid (by anyone)",
                        must: [es.newRangeFilter({
                            field: "index.apc_count",
                            gte: 2
                        })],
                        agg_name: "apc_count",
                        bucket_field: "from",
                        bucket_value: 2
                    }, {
                        id: "multiple_orgs",
                        display: "More than one organisation has paid an APC",
                        must: [es.newRangeFilter({
                            field: "index.org_count",
                            gte: 2
                        })],
                        agg_name: "org_count",
                        bucket_field: "from",
                        bucket_value: 2
                    }, {
                        id: "multiple_accs",
                        display: "More than one user account has reported an APC payment",
                        must: [es.newRangeFilter({
                            field: "index.account_count",
                            gte: 2
                        })],
                        agg_name: "account_count",
                        bucket_field: "from",
                        bucket_value: 2
                    }],
                    renderer: edges.bs3.newFacetFilterSetterRenderer({
                        facetTitle: "Search for duplicates",
                        intro: "Show records where:",
                        openIcon: "glyphicon glyphicon-chevron-down",
                        closeIcon: "glyphicon glyphicon-chevron-up",
                        layout: "right",
                        open: true
                    })
                }), edges.newPager({
                    id: "result-count",
                    category: "count",
                    renderer: edges.bs3.newResultCountRenderer({
                        prefix: "Results (",
                        suffix: ")"
                    })
                }), edges.newFullSearchController({
                    id: "sort-box",
                    category: "sort",
                    sortOptions: [{
                        field: "record.dc:title.exact",
                        dir: "asc",
                        display: "Title (A-Z)"
                    }, {
                        field: "record.dc:title.exact",
                        dir: "desc",
                        display: "Title (Z-A)"
                    }, {
                        field: "index.amount_inc_vat",
                        dir: "asc",
                        display: "APC Cost (Low - High)"
                    }, {
                        field: "index.amount_inc_vat",
                        dir: "desc",
                        display: "APC Cost (High - Low)"
                    }, {
                        field: "created_date",
                        dir: "desc",
                        display: "Most recent"
                    }],
                    renderer: edges.bs3.newSortRenderer({
                        prefix: "Sort: ",
                        dirSwitcher: false
                    })
                }), edges.newPager({
                    id: "results-size",
                    category: "pager",
                    renderer: edges.bs3.newPagerRenderer({
                        showRecordCount: false,
                        showPageNavigation: false,
                        sizePrefix: "Show ",
                        sizeSuffix: "&nbsp;&nbsp;&nbsp;&nbsp;items per page"
                    })
                }), edges.newPager({
                    id: "page-navigation",
                    category: "pager",
                    renderer: edges.bs3.newNumberedPager({})
                }), edges.newSearchingNotification({
                    id: "searching-notification",
                    category: "searching-notification"
                }), edges.newResultsDisplay({
                    id: "results",
                    category: "results",
                    renderer: muk.search.newAPCRenderer({})
                })]
            });
            muk.activeEdges[selector] = e
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newResultCountRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.ResultCountRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.ResultCountRenderer(params)
        },
        ResultCountRenderer: function(params) {
            this.prefix = edges.getParam(params.prefix, "");
            this.suffix = edges.getParam(params.suffix, "");
            this.namespace = "edges-bs3-result-count";
            this.draw = function() {
                var containerClass = edges.css_classes(this.namespace, "container", this);
                var totalClass = edges.css_classes(this.namespace, "total", this);
                var prefixClass = edges.css_classes(this.namespace, "prefix", this);
                var suffixClass = edges.css_classes(this.namespace, "suffix", this);
                var total = this.component.total;
                if (!total) {
                    total = 0
                }
                var recordCount = '<span class="' + prefixClass + '">' + this.prefix + '</span><span class="' + totalClass + '">' + total + '</span><span class="' + suffixClass + '">' + this.suffix + "</span>";
                var frag = '<div class="' + containerClass + '"><div class="row"><div class="col-md-12">{{COUNT}}</div></div></div>';
                frag = frag.replace(/{{COUNT}}/g, recordCount);
                this.component.context.html(frag)
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
$.extend(true, edges, {
    bs3: {
        newPagerRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.PagerRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.PagerRenderer(params)
        },
        PagerRenderer: function(params) {
            this.scroll = edges.getParam(params.scroll, true);
            this.scrollSelector = edges.getParam(params.scrollSelector, "body");
            this.showSizeSelector = edges.getParam(params.showSizeSelector, true);
            this.sizeOptions = edges.getParam(params.sizeOptions, [10, 25, 50, 100]);
            this.sizePrefix = edges.getParam(params.sizePrefix, "");
            this.sizeSuffix = edges.getParam(params.sizeSuffix, " per page");
            this.showRecordCount = edges.getParam(params.showRecordCount, true);
            this.showPageNavigation = edges.getParam(params.showPageNavigation, true);
            this.namespace = "edges-bs3-pager";
            this.draw = function() {
                if (this.component.total === false || this.component.total === 0) {
                    this.component.context.html("");
                    return
                }
                var containerClass = edges.css_classes(this.namespace, "container", this);
                var totalClass = edges.css_classes(this.namespace, "total", this);
                var navClass = edges.css_classes(this.namespace, "nav", this);
                var firstClass = edges.css_classes(this.namespace, "first", this);
                var prevClass = edges.css_classes(this.namespace, "prev", this);
                var pageClass = edges.css_classes(this.namespace, "page", this);
                var nextClass = edges.css_classes(this.namespace, "next", this);
                var sizeSelectClass = edges.css_classes(this.namespace, "size", this);
                var recordCount = "";
                if (this.showRecordCount) {
                    recordCount = '<span class="' + totalClass + '">' + this.component.total + "</span> results found"
                }
                var sizer = "";
                if (this.showSizeSelector) {
                    var sizer = '<div class="form-inline">' + recordCount + this.sizePrefix + '<div class="form-group"><select class="form-control input-sm ' + sizeSelectClass + '" name="' + this.component.id + '-page-size">{{SIZES}}</select></div>' + this.sizeSuffix + "</div>";
                    var sizeopts = "";
                    var optarr = this.sizeOptions.slice(0);
                    if ($.inArray(this.component.pageSize, optarr) === -1) {
                        optarr.push(this.component.pageSize)
                    }
                    optarr.sort(function(a, b) {
                        return a - b
                    });
                    for (var i = 0; i < optarr.length; i++) {
                        var so = optarr[i];
                        var selected = "";
                        if (so === this.component.pageSize) {
                            selected = "selected='selected'"
                        }
                        sizeopts += '<option name="' + so + '" ' + selected + ">" + so + "</option>"
                    }
                    sizer = sizer.replace(/{{SIZES}}/g, sizeopts)
                }
                var nav = "";
                if (this.showPageNavigation) {
                    var first = '<a href="#" class="' + firstClass + '">First</a>';
                    var prev = '<a href="#" class="' + prevClass + '">Prev</a>';
                    if (this.component.page === 1) {
                        first = '<span class="' + firstClass + ' disabled">First</span>';
                        prev = '<span class="' + prevClass + ' disabled">Prev</span>'
                    }
                    var next = '<a href="#" class="' + nextClass + '">Next</a>';
                    if (this.component.page === this.component.totalPages) {
                        next = '<span class="' + nextClass + ' disabled">Next</a>'
                    }
                    nav = '<div class="' + navClass + '">' + first + prev + '<span class="' + pageClass + '">Page ' + this.component.page + " of " + this.component.totalPages + "</span>" + next + "</div>"
                }
                var frag = "";
                if (this.showSizeSelector && !this.showPageNavigation) {
                    frag = '<div class="' + containerClass + '"><div class="row"><div class="col-md-12">{{COUNT}}</div></div></div>'
                } else if (!this.showSizeSelector && this.showPageNavigation) {
                    frag = '<div class="' + containerClass + '"><div class="row"><div class="col-md-12">{{NAV}}</div></div></div>'
                } else {
                    frag = '<div class="' + containerClass + '"><div class="row"><div class="col-md-6">{{COUNT}}</div><div class="col-md-6">{{NAV}}</div></div></div>'
                }
                frag = frag.replace(/{{COUNT}}/g, sizer).replace(/{{NAV}}/g, nav);
                this.component.context.html(frag);
                if (this.showPageNavigation) {
                    var firstSelector = edges.css_class_selector(this.namespace, "first", this);
                    var prevSelector = edges.css_class_selector(this.namespace, "prev", this);
                    var nextSelector = edges.css_class_selector(this.namespace, "next", this);
                    if (this.component.page !== 1) {
                        edges.on(firstSelector, "click", this, "goToFirst");
                        edges.on(prevSelector, "click", this, "goToPrev")
                    }
                    if (this.component.page !== this.component.totalPages) {
                        edges.on(nextSelector, "click", this, "goToNext")
                    }
                }
                if (this.showSizeSelector) {
                    var sizeSelector = edges.css_class_selector(this.namespace, "size", this);
                    edges.on(sizeSelector, "change", this, "changeSize")
                }
            };
            this.doScroll = function() {
                $(this.scrollSelector).animate({
                    scrollTop: $(this.scrollSelector).offset().top
                }, 1)
            };
            this.goToFirst = function(element) {
                if (this.scroll) {
                    this.doScroll()
                }
                this.component.setFrom(1)
            };
            this.goToPrev = function(element) {
                if (this.scroll) {
                    this.doScroll()
                }
                this.component.decrementPage()
            };
            this.goToNext = function(element) {
                if (this.scroll) {
                    this.doScroll()
                }
                this.component.incrementPage()
            };
            this.changeSize = function(element) {
                var size = $(element).val();
                this.component.setSize(size)
            }
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newCompactSelectedFiltersRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.CompactSelectedFiltersRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.CompactSelectedFiltersRenderer(params)
        },
        CompactSelectedFiltersRenderer: function(params) {
            this.showFilterField = edges.getParam(params.showFilterField, true);
            this.header = edges.getParam(params.header, "Active Filters");
            this.togglable = edges.getParam(params.togglable, true);
            this.open = edges.getParam(params.open, false);
            this.openIcon = edges.getParam(params.openIcon, "glyphicon glyphicon-plus");
            this.closeIcon = edges.getParam(params.closeIcon, "glyphicon glyphicon-minus");
            this.layout = edges.getParam(params.layout, "left");
            this.truncateSearchDisplay = edges.getParam(params.truncateSearchDisplay, 100);
            this.namespace = "edges-bs3-compact-selected-filters";
            this.draw = function() {
                var sf = this.component;
                var ns = this.namespace;
                var facetClass = edges.css_classes(ns, "facet", this);
                var headerClass = edges.css_classes(ns, "header", this);
                var fieldClass = edges.css_classes(ns, "field", this);
                var filterBoxClass = edges.css_classes(ns, "filter-box", this);
                var valClass = edges.css_classes(ns, "value", this);
                var removeClass = edges.css_classes(ns, "remove", this);
                var filtersClass = edges.css_classes(ns, "filters", this);
                var searchTextClass = edges.css_classes(ns, "search-text", this);
                var bodyClass = edges.css_classes(ns, "body", this);
                var highlightedText = edges.css_classes(ns, "text", this);
                var labelClass = edges.css_classes(ns, "label", this);
                var searchClearClass = edges.css_classes(ns, "search-clear", this);
                var clearAllClass = edges.css_classes(ns, "clear-all", this);
                var toggleId = edges.css_id(ns, "toggle", this);
                var bodyId = edges.css_id(ns, "body", this);
                var filters = "";
                var fields = Object.keys(sf.mustFilters);
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    var def = sf.mustFilters[field];
                    filters += '<div class="' + fieldClass + '">';
                    if (this.showFilterField) {
                        filters += '<span class="' + labelClass + '">' + def.display + ":</span><br>"
                    }
                    for (var j = 0; j < def.values.length; j++) {
                        var val = def.values[j];
                        filters += '<div class="' + filterBoxClass + '"><span class="' + valClass + '">' + val.display + "</span>";
                        if (def.filter == "term" || def.filter === "terms") {
                            filters += '<a class="' + removeClass + '" data-bool="must" data-filter="' + def.filter + '" data-field="' + field + '" data-value="' + val.val + '" alt="Remove" title="Remove" href="#">';
                            filters += '<i class="glyphicon glyphicon-black glyphicon-remove"></i>';
                            filters += "</a>"
                        } else if (def.filter === "range") {
                            var from = val.from ? ' data-from="' + val.from + '" ' : "";
                            var to = val.to ? ' data-to="' + val.to + '" ' : "";
                            filters += '<a class="' + removeClass + '" data-bool="must" data-filter="' + def.filter + '" data-field="' + field + '" ' + from + to + ' alt="Remove" title="Remove" href="#">';
                            filters += '<i class="glyphicon glyphicon-black glyphicon-remove"></i>';
                            filters += "</a>"
                        }
                        filters += "</div>"
                    }
                    filters += "</div>"
                }
                var header = this.headerLayout({
                    toggleId: toggleId
                });
                var filterFrag = "";
                if (filters !== "") {
                    filterFrag = '<div class="' + filtersClass + '">{{FILTERS}}</div>';
                    filterFrag = filterFrag.replace(/{{FILTERS}}/g, filters)
                }
                var searchTextFrag = "";
                if (this.component.searchString !== false) {
                    var display = this.component.searchString;
                    if (display.length > this.truncateSearchDisplay + 3) {
                        display = display.substring(0, this.truncateSearchDisplay) + "..."
                    }
                    searchTextFrag = '<div class="' + searchTextClass + '">                        <span class="' + labelClass + '">Search:</span><br>                        <div class="' + highlightedText + '"><div class="row">                            <div class="col-md-10">' + display + '</div>                            <div class="col-md-2"><a href="#" class="' + searchClearClass + '"><i class="glyphicon glyphicon-black glyphicon-remove"></i></a></div>                        </div></div>                    </div>'
                }
                var clearAllFrag = '<div class="row"><div class="col-md-12"><a href="#" class="' + clearAllClass + '">clear all</a></div></div>';
                if (searchTextFrag === "" && filterFrag === "") {
                    searchTextFrag = "No filters set";
                    clearAllFrag = ""
                }
                var frag = '<div class="' + facetClass + '">                    <div class="' + headerClass + '"><div class="row">                         <div class="col-md-12">                            ' + header + '                        </div>                    </div></div>                    <div class="' + bodyClass + '">                        <div class="row" style="display:none" id="' + bodyId + '">                            <div class="col-md-12">                                ' + searchTextFrag + "                                " + filterFrag + "                                " + clearAllFrag + "                            </div>                        </div>                    </div>                </div>";
                sf.context.html(frag);
                this.setUIOpen();
                var removeSelector = edges.css_class_selector(ns, "remove", this);
                edges.on(removeSelector, "click", this, "removeFilter");
                var toggleSelector = edges.css_id_selector(ns, "toggle", this);
                edges.on(toggleSelector, "click", this, "toggleOpen");
                var clearSelector = edges.css_class_selector(ns, "search-clear", this);
                edges.on(clearSelector, "click", this, "clearSearch");
                var allSelector = edges.css_class_selector(ns, "clear-all", this);
                edges.on(allSelector, "click", this, "clearAll")
            };
            this.headerLayout = function(params) {
                var toggleId = params.toggleId;
                var iconClass = edges.css_classes(this.namespace, "icon", this);
                if (this.layout === "left") {
                    var tog = this.header;
                    if (this.togglable) {
                        tog = '<a href="#" id="' + toggleId + '"><i class="' + this.openIcon + '"></i>&nbsp;' + tog + "</a>"
                    }
                    return tog
                } else if (this.layout === "right") {
                    var tog = "";
                    if (this.togglable) {
                        tog = '<a href="#" id="' + toggleId + '">' + this.header + '&nbsp;<i class="' + this.openIcon + " " + iconClass + '"></i></a>'
                    } else {
                        tog = this.header
                    }
                    return tog
                }
            };
            this.setUIOpen = function() {
                var bodySelector = edges.css_id_selector(this.namespace, "body", this);
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                var body = this.component.jq(bodySelector);
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
                    body.show()
                } else {
                    var i = toggle.find("i");
                    for (var j = 0; j < closeBits.length; j++) {
                        i.removeClass(closeBits[j])
                    }
                    for (var j = 0; j < openBits.length; j++) {
                        i.addClass(openBits[j])
                    }
                    body.hide()
                }
            };
            this.removeFilter = function(element) {
                var el = this.component.jq(element);
                var field = el.attr("data-field");
                var ft = el.attr("data-filter");
                var bool = el.attr("data-bool");
                var value = false;
                if (ft === "terms" || ft === "term") {
                    value = el.attr("data-value")
                } else if (ft === "range") {
                    value = {};
                    var from = el.attr("data-from");
                    var to = el.attr("data-to");
                    if (from) {
                        value["from"] = parseInt(from)
                    }
                    if (to) {
                        value["to"] = parseInt(to)
                    }
                }
                this.component.removeFilter(bool, ft, field, value)
            };
            this.toggleOpen = function(element) {
                this.open = !this.open;
                this.setUIOpen()
            };
            this.clearSearch = function(element) {
                this.component.clearQueryString()
            };
            this.clearAll = function(element) {
                this.component.clearSearch()
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
                var results = "Loading...";
                if (ts.terms.length > 0) {
                    results = "";
                    for (var i = 0; i < ts.terms.length; i++) {
                        var val = ts.terms[i];
                        if (val.count === 0 && this.hideEmpty) {
                            continue
                        }

                        if ($.inArray(val.term.toString(), ts.selected) !== -1) {
                            results += '<div class="form ' + resultClass + '"><div class="form-fields__item-checkbox ' + filterRemoveClass + '" data-key="' + edges.escapeHtml(val.term) + '"><label><input type="checkbox" checked/> ' + edges.escapeHtml(val.display);
                            if (this.showCount) {
                                results += ' <span class="' + countClass + '">(' + val.count + ")</span>"
                            }
                            results += "</label></div></div>"
                        } else {
                            results += '<div class="form ' + resultClass + '"><div class="form-fields__item-checkbox ' + valClass + '" data-key="' + edges.escapeHtml(val.term) + '"><label><input type="checkbox" /> ' + edges.escapeHtml(val.display);
                            if (this.showCount) {
                                results += ' <span class="' + countClass + '">(' + val.count + ")</span>"
                            }
                            results += "</label></div></div>"
                        }
                    }
                }

                var header = this.headerLayout({
                    toggleId: toggleId
                });
                var frag = '<div class="' + facetClass + '"><div class="' + headerClass + '"><div class="row"><div class="col-md-12">' + header + '</div></div></div><div class="' + bodyClass + '">'+
                '<div class="row" style="display:none" id="' + resultsId + '"><div class="col-md-12"><div class="' + selectionsClass + '">'+results+'</div></div></div></div></div>';

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
$.extend(true, edges, {
    bs3: {
        newNumericRangeEntryRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.NumericRangeEntryRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.NumericRangeEntryRenderer(params)
        },
        NumericRangeEntryRenderer: function(params) {
            this.open = edges.getParam(params.open, false);
            this.fromText = edges.getParam(params.fromText, "From");
            this.toText = edges.getParam(params.toText, "To");
            this.openIcon = edges.getParam(params.openIcon, "glyphicon glyphicon-plus");
            this.closeIcon = edges.getParam(params.closeIcon, "glyphicon glyphicon-minus");
            this.layout = edges.getParam(params.layout, "left");
            this.namespace = "edges-bs3-numeric-range-entry";
            this.draw = function() {
                var facetClass = edges.css_classes(this.namespace, "facet", this);
                var headerClass = edges.css_classes(this.namespace, "header", this);
                var labelClass = edges.css_classes(this.namespace, "label", this);
                var selectClass = edges.css_classes(this.namespace, "select", this);
                var bodyClass = edges.css_classes(this.namespace, "body", this);
                var toggleId = edges.css_id(this.namespace, "toggle", this);
                var formId = edges.css_id(this.namespace, "form", this);
                var fromName = edges.css_id(this.namespace, "from", this);
                var toName = edges.css_id(this.namespace, "to", this);
                var theform = "";
                var numbers = [];
                var lower = this.component.lower === false ? 0 : this.component.lower;
                var upper = this.component.upper === false ? 0 : this.component.upper;
                for (var i = lower; i < upper; i += this.component.increment) {
                    numbers.push(i)
                }
                numbers.push(upper);
                var options = "";
                for (var i = 0; i < numbers.length; i++) {
                    options += '<option value="' + numbers[i] + '">' + numbers[i] + "</option>"
                }
                theform += '<div class="row"><div class="col-md-4"><span class="' + labelClass + '">' + this.fromText + "</span></div>";
                theform += '<div class="col-md-8"><select name="' + fromName + '" id="' + fromName + '" class="form-control ' + selectClass + '">' + options + "</select></div>";
                theform += "</div>";
                theform += '<div class="row"><div class="col-md-4"><span class="' + labelClass + '">' + this.toText + "</span></div>";
                theform += '<div class="col-md-8"><select name="' + toName + '" id="' + toName + '" class="form-control ' + selectClass + '">' + options + "</select></div>";
                theform += "</div></div>";
                var header = this.headerLayout({
                    toggleId: toggleId
                });
                var frag = '<div class="' + facetClass + '">                    <div class="' + headerClass + '"><div class="row">                         <div class="col-md-12">                            ' + header + '                        </div>                    </div></div>                    <div class="' + bodyClass + '">                        <div class="row" style="display:none" id="' + formId + '">                            <div class="col-md-12">                                <form>{{THEFORM}}</form>                            </div>                        </div>                    </div>                </div>';
                frag = frag.replace(/{{THEFORM}}/g, theform);
                this.component.context.html(frag);
                this.setUIFrom();
                this.setUITo();
                this.setUIOpen();
                var fromSelector = edges.css_id_selector(this.namespace, "from", this);
                var toSelector = edges.css_id_selector(this.namespace, "to", this);
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                edges.on(fromSelector, "change", this, "fromChanged");
                edges.on(toSelector, "change", this, "toChanged");
                edges.on(toggleSelector, "click", this, "toggleOpen")
            };
            this.headerLayout = function(params) {
                var toggleId = params.toggleId;
                var iconClass = edges.css_classes(this.namespace, "icon", this);
                if (this.layout === "left") {
                    var tog = '<a href="#" id="' + toggleId + '"><i class="' + this.openIcon + '"></i>&nbsp;' + this.component.display + "</a>";
                    return tog
                } else if (this.layout === "right") {
                    var tog = '<a href="#" id="' + toggleId + '">' + this.component.display + '&nbsp;<i class="' + this.openIcon + " " + iconClass + '"></i></a>';
                    return tog
                }
            };
            this.setUIOpen = function() {
                var formSelector = edges.css_id_selector(this.namespace, "form", this);
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                var form = this.component.jq(formSelector);
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
                    form.show()
                } else {
                    var i = toggle.find("i");
                    for (var j = 0; j < closeBits.length; j++) {
                        i.removeClass(closeBits[j])
                    }
                    for (var j = 0; j < openBits.length; j++) {
                        i.addClass(openBits[j])
                    }
                    form.hide()
                }
            };
            this.setUIFrom = function() {
                if (this.component.from) {
                    var fromName = edges.css_id_selector(this.namespace, "from", this);
                    var fromSel = this.component.jq(fromName);
                    fromSel.val(this.component.from)
                }
            };
            this.setUITo = function() {
                if (this.component.to) {
                    var toName = edges.css_id_selector(this.namespace, "to", this);
                    var toSel = this.component.jq(toName);
                    toSel.val(this.component.to)
                }
            };
            this.toggleOpen = function(element) {
                this.open = !this.open;
                this.setUIOpen()
            };
            this.fromChanged = function(element) {
                var from = parseInt($(element).val());
                var toSelector = edges.css_id_selector(this.namespace, "to", this);
                var toSel = this.component.jq(toSelector);
                var to = parseInt(toSel.val());
                if (from > to) {
                    to = from;
                    toSel.val(from)
                }
                this.component.selectRange(from, to)
            };
            this.toChanged = function(element) {
                var to = parseInt($(element).val());
                var fromSelector = edges.css_id_selector(this.namespace, "from", this);
                var fromSel = this.component.jq(fromSelector);
                var from = parseInt(fromSel.val());
                if (to < from) {
                    from = to;
                    fromSel.val(to)
                }
                this.component.selectRange(from, to)
            }
        }
    }
});
$.extend(true, edges, {
    bs3: {
        newBSMultiDateRangeFacet: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.BSMultiDateRangeFacet.prototype = edges.newRenderer(params);
            return new edges.bs3.BSMultiDateRangeFacet(params)
        },
        BSMultiDateRangeFacet: function(params) {
            this.open = edges.getParam(params.open, false);
            this.togglable = edges.getParam(params.togglable, true);
            this.openIcon = edges.getParam(params.openIcon, "glyphicon glyphicon-plus");
            this.closeIcon = edges.getParam(params.closeIcon, "glyphicon glyphicon-minus");
            this.layout = edges.getParam(params.layout, "left");
            this.dateFormat = edges.getParam(params.dateFormat, "MMMM D, YYYY");
            this.useSelect2 = edges.getParam(params.useSelect2, false);
            this.ranges = edges.getParam(params.ranges, false);
            this.prefix = edges.getParam(params.prefix, "");
            this.dre = false;
            this.selectId = false;
            this.rangeId = false;
            this.selectJq = false;
            this.rangeJq = false;
            this.drp = false;
            this.namespace = "edges-bs3-bs-multi-date-range-facet";
            this.draw = function() {
                var dre = this.component;
                var selectClass = edges.css_classes(this.namespace, "select", this);
                var inputClass = edges.css_classes(this.namespace, "input", this);
                var prefixClass = edges.css_classes(this.namespace, "prefix", this);
                var facetClass = edges.css_classes(this.namespace, "facet", this);
                var headerClass = edges.css_classes(this.namespace, "header", this);
                var bodyClass = edges.css_classes(this.namespace, "body", this);
                var toggleId = edges.css_id(this.namespace, "toggle", this);
                var formId = edges.css_id(this.namespace, "form", this);
                var rangeDisplayId = edges.css_id(this.namespace, "range", this);
                var pluginId = edges.css_id(this.namespace, dre.id + "_plugin", this);
                this.selectId = edges.css_id(this.namespace, dre.id + "_date-type", this);
                this.rangeId = edges.css_id(this.namespace, dre.id + "_range", this);
                var options = "";
                for (var i = 0; i < dre.fields.length; i++) {
                    var field = dre.fields[i];
                    var selected = dre.currentField == field.field ? ' selected="selected" ' : "";
                    options += '<option value="' + field.field + '"' + selected + ">" + field.display + "</option>"
                }
                var frag = '<div class="form-inline">';
                if (dre.display) {
                    frag += '<span class="' + prefixClass + '">' + this.prefix + "</span>"
                }
                frag += '<div class="form-group"><select class="' + selectClass + ' form-control input-sm" name="' + this.selectId + '" id="' + this.selectId + '">' + options + "</select></div>";
                frag += '<div id="' + this.rangeId + '" class="' + inputClass + '">                    <div class="row"><div class="col-md-1"><i class="glyphicon glyphicon-calendar"></i></div>                    <div class="col-md-9"><div id="' + rangeDisplayId + '"></div></div>                    <div class="col-md-1"><b class="caret"></b></div></div>                </div>';
                frag += "</div>";
                var header = this.headerLayout({
                    toggleId: toggleId
                });
                var facet = '<div class="' + facetClass + '">                    <div class="' + headerClass + '"><div class="row">                         <div class="col-md-12">                            ' + header + '                        </div>                    </div></div>                    <div class="' + bodyClass + '">                        <div class="row" style="display:none" id="' + formId + '">                            <div class="col-md-12">                                {{FORM}}                            </div>                        </div>                    </div>                    </div></div>';
                facet = facet.replace(/{{FORM}}/g, frag);
                dre.context.html(facet);
                this.setUIOpen();
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                edges.on(toggleSelector, "click", this, "toggleOpen");
                var selectIdSelector = edges.css_id_selector(this.namespace, dre.id + "_date-type", this);
                var rangeIdSelector = edges.css_id_selector(this.namespace, dre.id + "_range", this);
                this.selectJq = dre.jq(selectIdSelector);
                this.rangeJq = dre.jq(rangeIdSelector);
                var cb = edges.objClosure(this, "updateDateRange", ["start", "end"]);
                var props = {
                    locale: {
                        format: "DD/MM/YYYY"
                    },
                    opens: "right"
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
                var formSelector = edges.css_id_selector(this.namespace, "form", this);
                var toggleSelector = edges.css_id_selector(this.namespace, "toggle", this);
                var form = this.component.jq(formSelector);
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
                    form.show()
                } else {
                    var i = toggle.find("i");
                    for (var j = 0; j < closeBits.length; j++) {
                        i.removeClass(closeBits[j])
                    }
                    for (var j = 0; j < openBits.length; j++) {
                        i.addClass(openBits[j])
                    }
                    form.hide()
                }
            };
            this.toggleOpen = function(element) {
                this.open = !this.open;
                this.setUIOpen()
            };
            this.dateRangeDisplay = function(params) {
                var start = params.start;
                var end = params.end;
                var rangeDisplaySelector = edges.css_id_selector(this.namespace, "range", this);
                this.rangeJq.find(rangeDisplaySelector).html("<strong>From</strong>: " + start.utc().format(this.dateFormat) + "<br><strong>To</strong>: " + end.utc().format(this.dateFormat))
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
$.extend(true, edges, {
    bs3: {
        newSortRenderer: function(params) {
            if (!params) {
                params = {}
            }
            edges.bs3.SortRenderer.prototype = edges.newRenderer(params);
            return new edges.bs3.SortRenderer(params)
        },
        SortRenderer: function(params) {
            this.prefix = edges.getParam(params.prefix, "");
            this.dirSwitcher = edges.getParam(params.dirSwitcher, true);
            this.namespace = "edges-bs3-search-controller";
            this.draw = function() {
                var comp = this.component;
                var sortOptions = "";
                if (comp.sortOptions && comp.sortOptions.length > 0) {
                    var directionClass = edges.css_classes(this.namespace, "direction", this);
                    var sortFieldClass = edges.css_classes(this.namespace, "sortby", this);
                    var prefixClass = edges.css_classes(this.namespace, "prefix", this);
                    var selectName = edges.css_id(this.namespace, "select", this);
                    var label = '<label class="' + prefixClass + '" for="' + selectName + '">' + this.prefix + "</label>";
                    var direction = "";
                    if (this.dirSwitcher) {
                        direction = '<span class="input-group-btn">                             <button type="button" class="btn btn-default btn-sm ' + directionClass + '" title="" href="#"></button>                         </span>'
                    }
                    sortOptions = '<div class="form-inline">                             <div class="form-group">                                 ' + label + '                                <div class="input-group">                                     ' + direction + '                                     <select name="' + selectName + '" class="form-control input-sm ' + sortFieldClass + '">                                         <option value="_score">Relevance</option>';
                    for (var i = 0; i < comp.sortOptions.length; i++) {
                        var field = comp.sortOptions[i].field;
                        var display = comp.sortOptions[i].display;
                        var dir = comp.sortOptions[i].dir;
                        if (dir === undefined) {
                            dir = ""
                        }
                        dir = " " + dir;
                        sortOptions += '<option value="' + field + "" + dir + '">' + edges.escapeHtml(display) + "</option>"
                    }
                    sortOptions += " </select>                                 </div>                             </div>                         </div>"
                }
                var frag = '<div class="row"><div class="col-md-12">{{SORT}}</div></div>';
                frag = frag.replace(/{{SORT}}/g, sortOptions);
                comp.context.html(frag);
                if (comp.sortOptions && comp.sortOptions.length > 0) {
                    if (this.dirSwitcher) {
                        this.setUISortDir()
                    }
                    this.setUISortField()
                }
                if (comp.sortOptions && comp.sortOptions.length > 0) {
                    var directionSelector = edges.css_class_selector(this.namespace, "direction", this);
                    var sortSelector = edges.css_class_selector(this.namespace, "sortby", this);
                    edges.on(directionSelector, "click", this, "changeSortDir");
                    edges.on(sortSelector, "change", this, "changeSortBy")
                }
            };
            this.setUISortDir = function() {
                var directionSelector = edges.css_class_selector(this.namespace, "direction", this);
                var el = this.component.jq(directionSelector);
                if (this.component.sortDir === "asc") {
                    el.html('sort <i class="glyphicon glyphicon-arrow-up"></i> by');
                    el.attr("title", "Current order ascending. Click to change to descending")
                } else {
                    el.html('sort <i class="glyphicon glyphicon-arrow-down"></i> by');
                    el.attr("title", "Current order descending. Click to change to ascending")
                }
            };
            this.setUISortField = function() {
                if (!this.component.sortBy) {
                    return
                }
                var sortSelector = edges.css_class_selector(this.namespace, "sortby", this);
                var el = this.component.jq(sortSelector);
                var options = el.find("option");
                var vals = [];
                for (var i = 0; i < options.length; i++) {
                    vals.push($(options[i]).attr("value"))
                }
                var fieldVal = this.component.sortBy;
                var fullVal = this.component.sortBy + " " + this.component.sortDir;
                var setVal = false;
                if ($.inArray(fieldVal, vals) > -1) {
                    setVal = fieldVal
                } else if ($.inArray(fullVal, vals) > -1) {
                    setVal = fullVal
                }
                if (setVal !== false) {
                    el.val(setVal)
                }
            };
            this.changeSortDir = function(element) {
                this.component.changeSortDir()
            };
            this.changeSortBy = function(element) {
                var val = this.component.jq(element).val();
                var bits = val.split(" ");
                var field = bits[0];
                var dir = false;
                if (bits.length === 2) {
                    dir = bits[1]
                }
                this.component.setSort({
                    field: field,
                    dir: dir
                })
            }
        }
    }
});