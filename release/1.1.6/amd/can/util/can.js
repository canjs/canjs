/*!
 * CanJS - 1.1.6
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 05 Jun 2013 18:02:51 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(function(){
	var can = window.can || {};
	if(typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
		window.can = can;
	}

	can.isDeferred = function( obj ) {
		var isFunction = this.isFunction;
		// Returns `true` if something looks like a deferred.
		return obj && isFunction(obj.then) && isFunction(obj.pipe);
	};
	
	var cid = 0;
	can.cid = function(object, name){
		if(object._cid){
			return object._cid
		} else{
			return object._cid = (name ||"" ) + (++cid)
		}
	}
	can.VERSION = '@EDGE';
	return can;
});