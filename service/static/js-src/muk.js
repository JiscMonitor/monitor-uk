var muk = {
    activeEdges : {},
    
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
};
