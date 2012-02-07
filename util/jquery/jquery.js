steal('./jquery.1.7.1.js', function(){
	
	$.extend(Can,jQuery)
	Can.trigger = function(obj, event, args){
		if(obj.trigger){
			obj.trigger(event,args)
		} else {
			$.event.trigger(event, args, obj, true)
		}
		
	}
	Can.$ = jQuery
	
	// a primitive to bind on 'this' ... just pass to jquery
	Can.bind = function( ev, cb){
		// if we can bind to it ...
		if(this.bind){
			this.bind(ev, cb)
		} else {
			$([this]).bind(ev, cb)
		}
		return this;
	}
	Can.unbind = function(ev, cb){
		// if we can bind to it ...
		if(this.unbind){
			this.unbind(ev, cb)
		} else {
			$([this]).unbind(ev, cb)
		}
		return this;
	}
	Can.delegate = function(selector,ev, cb){
		if(this.delegate){
			this.delegate(selector, ev, cb)
		} else {
			$([this]).delegate(selector,ev, cb)
		}
	}
	Can.undelegate = function(selector,ev, cb){
		if(this.undelegate){
			this.undelegate(selector, ev, cb)
		} else {
			$([this]).undelegate(selector,ev, cb)
		}
	}
	Can.addEvent = function(ev, cb){
		$([this]).bind(ev, cb)
		return this;
	}
	Can.removeEvent = function(ev, cb){
		$([this]).unbind(ev, cb)
		return this;
	}
	$.each(["append","filter","addClass","remove","data"], function(i,name){
		Can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, Can.makeArray(arguments).slice(1))
		}
	})
	
})
