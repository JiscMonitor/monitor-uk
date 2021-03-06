/** @namespace */
var muk = {

    /**
     * where we'll store the page's active Edges
     *
     * @type {Object}
     */
    activeEdges : {},

    /**
     * Calculate a set of year ranges based on a specified list of boundaries, and a number of years to lookback
     *
     * @param {Object} boundaries a set of key value pairs, setting the month/year boundaries.  E.g. { "academic year" : "09-01" }
     * @param {Object} lookback a set of key value pairs setting the prefixes and the number of years to lookback.  e.g. {"This " : 0, "Last" : 1}
     * @returns {Object} a set of ranges of the form {range : [start, end]}
     */
    yearRanges : function(boundaries, lookback) {
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
                lower = moment(tyb).subtract(1, "year");
            } else {
                upper = moment(tyb).add(1, "year").subtract(1, "day");
                lower = moment(tyb);
            }

            // now for each lookback, create the key and the range
            var prefixes = Object.keys(lookback);
            for (var j = 0; j < prefixes.length; j++) {
                var prefix = prefixes[j];
                var offset = lookback[prefix];
                var name = prefix + key;
                if (offset === 0) {
                    ranges[name] = [lower, upper];
                } else {
                    ranges[name] = [moment(lower).subtract(offset, "year"), moment(upper).subtract(offset, "year")];
                }
            }
        }

        return ranges;
    },

    /**
     * Return a function that will suitably format an integer for the UI
     *
     * @returns {Function} can be called to format an int
     */
    toIntFormat : function() {
        return edges.numFormat({
            decimalPlaces: 0,
            thousandsSeparator: ","
        })
    },

    /**
     * Return a function that will suitably format an GBP currency value for the UI
     *
     * @returns {Function} can be called to format a currency value
     */
    toGBPIntFormat : function() {
        return edges.numFormat({
            prefix: "£",
            decimalPlaces: 0,
            thousandsSeparator: ","
        })
    }
};