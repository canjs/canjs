(function( window, undefined ) {

	var jQuery = function() {
		return new jQuery.fn.init();
	};
	jQuery.fn = jQuery.prototype = {
		// The current version of jQuery being used
		jquery: "custom",
		init: function() {
			return this;
		}
	};

	// Give the init function the jQuery prototype for later instantiation
	jQuery.fn.init.prototype = jQuery.fn;
	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) { window.$ = _$; }
		if ( deep && window.jQuery === jQuery ) { window.jQuery = _jQuery; }
		return jQuery;
	};




	//export stuff
	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
		module.exports = jQuery;
	} else if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return jQuery; } );
	}
	if ( typeof window === "object" && typeof window.document === "object" ) {
		window.jQuery = window.$ = jQuery;
	}

})( window );
