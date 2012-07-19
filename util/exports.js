steal('can/util', function( can ) {

	// Register as an AMD module if supported, otherwise attach to the window
	if (false && typeof define === "function" && define.amd ) {
		define( "can", [], function () { return can; } );
	} else {
		window.can = can;
	}

});
