/* jshint maxdepth:7*/
steal('can/util/can.js', function (can) {
	
	// The following is from jQuery
	var isArrayLike = function(obj){
		var length = obj.length;
		return typeof arr !== "function" &&
			( length === 0 || typeof length === "number" && length > 0 && ( length - 1 ) in obj );
	};
	
	can.each = function (elements, callback, context) {
		var i = 0,
			key,
			len,
			item;
		if (elements) {
			if ( isArrayLike(elements) ) {
				if(can.List && elements instanceof can.List ) {
					for (len = elements.attr("length"); i < len; i++) {
						item = elements.attr(i);
						if (callback.call(context || item, item, i, elements) === false) {
							break;
						}
					}
				} else {
					for (len = elements.length; i < len; i++) {
						item = elements[i];
						if (callback.call(context || item, item, i, elements) === false) {
							break;
						}
					}
				}
				
			} else if (typeof elements === "object") {
				
				if (can.Map && elements instanceof can.Map || elements === can.route) {
					var keys = can.Map.keys(elements);
					for(i =0, len = keys.length; i < len; i++) {
						key = keys[i];
						item = elements.attr(key);
						if (callback.call(context || item, item, key, elements) === false) {
							break;
						}
					}
				} else {
					for (key in elements) {
						if (elements.hasOwnProperty(key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
							break;
						}
					}
				}
				
			}
		}
		return elements;
	};
	return can;
});
