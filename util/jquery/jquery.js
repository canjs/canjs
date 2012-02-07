steal('./jquery.1.7.1.js', function(){
	
	$.extend(Can,jQuery)
	Can.trigger = function(obj, event, args){
		$.event.trigger(event, args, obj, true)
	}
	Can.$ = jQuery
	
	// a primitive to bind on 'this' ... just pass to jquery
	Can.bind = function( ev, cb){
		// if we can bind to it ...
		$([this]).bind(ev, cb)
	}
	Can.unbind = function(ev, cb){
		// if we can bind to it ...
		$([this]).unbind(ev, cb)
	}

	
	
})
