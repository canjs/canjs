steal('can/util/can.js', function (can) {

	// The following is from jQuery
	can.isArrayLike = function(obj){
		// The `in` check is from jQuery’s fix for an iOS 8 64-bit JIT object length bug:
		// https://github.com/jquery/jquery/pull/2185
		// When passing a non-object (e.g. boolean) can.each fails where it previously did nothing.
		// https://github.com/canjs/canjs/issues/1989
		var length = obj && typeof obj !== 'boolean' &&
			typeof obj !== 'number' &&
			"length" in obj && obj.length;
		
		// var length = "length" in obj && obj.length;
		return typeof arr !== "function" &&
			( length === 0 || typeof length === "number" && length > 0 && ( length - 1 ) in obj );
	};
});