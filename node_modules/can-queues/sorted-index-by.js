module.exports = function(compare, array, value) {
	if (!array || !array.length) {
		return undefined;
	}
	// check the start and the end
	if (compare(value, array[0]) === -1) {
		return 0;
	} else if (compare(value, array[array.length - 1]) === 1) {
		return array.length;
	}
	var low = 0,
		high = array.length;

	// From lodash lodash 4.6.1 <https://lodash.com/>
	// Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	while (low < high) {
		var mid = (low + high) >>> 1,
			item = array[mid],
			computed = compare(value, item);
		if (computed === -1) {
			high = mid;
		} else {
			low = mid + 1;
		}
	}
	return high;
	// bisect by calling sortFunc
};
