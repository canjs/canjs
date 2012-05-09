steal(function() {

	// Register as an AMD module if supported, otherwise attach to the window
	if ( typeof define === "function" && define.amd ) {
		define( "can", [], function () { return can; } );
	} else {
		window.can = can;
	}

});
