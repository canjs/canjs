steal('can/util', function( can ) {

	// Register as an AMD module if supported, otherwise attach to the window
	if ( typeof define === "function" && define.amd ) {
		define(function() {
			return can;
		});
	}

});
