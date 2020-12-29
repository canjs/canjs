var set = require("../set");
var is = require("./comparisons");

// THIS IS REALLY INTEGERS!!!

module.exports = function(min, max) {




    function RealNumberRangeInclusive(start, end){

        this.start =  arguments.length > 0 ? +start : min;
        this.end = arguments.length > 1 ? +end : max;
		this.range = new is.And([
			new is.GreaterThanEqual( this.start ),
			new is.LessThanEqual( this.end )
		]);
    }

	var universeRange = new RealNumberRangeInclusive( min , max );

    function isUniversal(range) {
        return set.isSubset(universeRange.range, range.range);
    }

	function rangeFromAnd(aSet) {
		var values = {};
		aSet.values.forEach(function(value){
			if(value instanceof is.GreaterThanEqual) {
				values.start = value.value;
			}
			if(value instanceof is.GreaterThan) {
				values.start = value.value+1;
			}
			if(value instanceof is.LessThanEqual) {
				values.end = value.value;
			}
			if(value instanceof is.LessThan) {
				values.end = value.value-1;
			}
		});
		if("start" in values && "end" in values) {
			return new RealNumberRangeInclusive(values.start, values.end );
		}
	}

	function toRange(aSet) {
		var range;
		if(aSet instanceof is.And) {
			range = rangeFromAnd(aSet);
		}
		if(aSet instanceof is.Or) {
			// check if next to each other ...
			var first = rangeFromAnd(aSet.values[0]),
				second = rangeFromAnd(aSet.values[1]);
			if(first && second) {
				var firstValues = first.range.values,
					secondValues = second.range.values;
				if(firstValues[1].value + 1 === secondValues[0].value) {
					range = new RealNumberRangeInclusive(firstValues[0].value, secondValues[1].value );
				}
				else if(secondValues[1].value + 1 === firstValues[0].value) {
					range = new RealNumberRangeInclusive(secondValues[0].value, firstValues[1].value );
				} else {
					return set.UNDEFINABLE;
				}
			} else {
				return set.UNDEFINABLE;
			}
		}
		if(range && isUniversal(range)) {
			return set.UNIVERSAL;
		} else {
			return range;
		}
	}

    function intersection(range1, range2){
		var intersection = toRange(set.intersection(range1.range, range2.range));
		if(intersection) {
			return intersection;
		} else {
            return set.EMPTY;
        }
    }

    function difference(range1, range2){

		var difference = toRange( set.difference(range1.range, range2.range) );
		if(difference) {
			return difference;
		} else {
            return set.EMPTY;
        }
    }

    set.defineComparison(RealNumberRangeInclusive, RealNumberRangeInclusive,{
        union: function(range1, range2){
			var union = toRange( set.union(range1.range, range2.range) );
			if(union) {
				return union;
			} else {
	            return set.EMPTY;
	        }
        },
        intersection: intersection,
        difference: difference
    });

    set.defineComparison(set.UNIVERSAL,RealNumberRangeInclusive, {
        difference: function(universe, range){
            if(isUniversal(range)) {
                return set.EMPTY;
            } else {
                return difference(universeRange, range);
            }
        }
    });

    return RealNumberRangeInclusive;
};
