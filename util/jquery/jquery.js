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
	var maker = function(func){
		return function(){
			var t = this[func] ? this : $([this])
			t[func].apply(t, arguments)
			return this;
		}
	}
	// a primitive to bind on 'this' ... just pass to jquery
	Can.bind = maker("bind");;
	Can.unbind = maker("unbind");
	Can.delegate = maker("delegate");
	Can.undelegate = maker("undelegate");
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
