steal(function(){
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
	
	can.simpleExtend = function(d, s){
		for(var prop in s){
			d[prop] = s[prop]
		}
		return d;
	}
	
	// this is here in case can.compute hasn't loaded
	can.__reading = function(){};
	
	return can;
});
