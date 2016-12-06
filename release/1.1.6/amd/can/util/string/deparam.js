/*!
 * CanJS - 1.1.6
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 05 Jun 2013 18:02:51 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/util/string"], function( can ){
	
	// ## deparam.js  
	// `can.deparam`  
	// _Takes a string of name value pairs and returns a Object literal that represents those params._
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g,
		paramTest = /([^?#]*)(#.*)?$/,
		prep = function( str ) {
			return decodeURIComponent( str.replace(/\+/g, " ") );
		};
	

	can.extend(can, { 
		/**
		 * @function can.deparam
		 * @parent can.util.function
		 * Takes a string of name value pairs and returns a Object literal that represents those params.
		 * 
		 * @param {String} params a string like <code>"foo=bar&person[age]=3"</code>
		 * @return {Object} A JavaScript Object that represents the params:
		 * 
		 *     {
		 *       foo: "bar",
		 *       person: {
		 *         age: "3"
		 *       }
		 *     }
		 */
		deparam: function(params){
		
			var data = {},
				pairs, lastPart;

			if ( params && paramTest.test( params )) {
				
				pairs = params.split('&'),
				
				can.each( pairs, function( pair ) {

					var parts = pair.split('='),
						key   = prep( parts.shift() ),
						value = prep( parts.join("=")),
						current = data;
					
					if(key) {
						parts = key.match(keyBreaker);
				
						for ( var j = 0, l = parts.length - 1; j < l; j++ ) {
							if (!current[parts[j]] ) {
								// If what we are pointing to looks like an `array`
								current[parts[j]] = digitTest.test(parts[j+1]) || parts[j+1] == "[]" ? [] : {};
							}
							current = current[parts[j]];
						}
						lastPart = parts.pop();
						if ( lastPart == "[]" ) {
							current.push(value);
						} else {
							current[lastPart] = value;
						}
					}
				});
			}
			return data;
		}
	});
	return can;
});