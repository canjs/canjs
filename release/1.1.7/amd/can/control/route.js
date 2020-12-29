/*!
 * CanJS - 1.1.7
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 24 Jul 2013 00:23:28 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/route", "can/control"], function(can){
	
	// ## control/route.js  
	// _Controller route integration._
	
	can.Control.processors.route = function( el, event, selector, funcName, controller ) {
		selector = selector || "";
		can.route( selector );
		var batchNum,
			check = function( ev, attr, how ) {
				if ( can.route.attr('route') === ( selector ) && 
					( ev.batchNum === undefined || ev.batchNum !== batchNum ) ) {
					
					batchNum = ev.batchNum;
					
					var d = can.route.attr();
					delete d.route;
					if ( can.isFunction( controller[ funcName ] )) {
						controller[funcName]( d );
					} else {
						controller[controller[funcName]](d);
					}
					
				}
			};
		can.route.bind( 'change', check );
		return function() {
			can.route.unbind( 'change', check );
		};
	};

	return can;
});