/*!
 * CanJS - 2.2.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 03 Apr 2015 23:27:46 GMT
 * Licensed MIT
 */

/*can@2.2.4#util/array/makeArray*/
steal('./each.js', function (can) {
	can.makeArray = function (arr) {
		var ret = [];
		can.each(arr, function (a, i) {
			ret[i] = a;
		});
		return ret;
	};
	return can;
});
