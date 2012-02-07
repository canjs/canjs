steal('./zepto.0.8.js').then('./data').then('../event','../fragment.js',function(){

// extend what you can out of Zepto
$.extend(Can,Zepto);

var arrHas = function(obj, name){
	return obj[0] && obj[0][name] || obj[name]
}

// do what's similar for jQuery
Can.trigger = function(obj, event, args){
	if(obj.trigger){
		obj.trigger(event, args)
	} else if(arrHas(obj, "dispatchEvent")){
		$([obj]).trigger(event, args)
	} else {
		if(typeof event == "string"){
			event = {type: event}
		}
		event.data = args;
		Can.dispatch.call(obj, event)
	}
	
}

Can.$ = Zepto

	Can.bind = function( ev, cb){
		// if we can bind to it ...
		if(this.bind){
			this.bind(ev, cb)
		} else if(arrHas(this, "addEventListener")){
			$([this]).bind(ev, cb)
		} else {
			Can.addEvent.call(this, ev, cb)
		}
		return this;
	}
	Can.unbind = function(ev, cb){
		// if we can bind to it ...
		if(this.unbind){
			this.unbind(ev, cb)
		} else if(arrHas(this, "addEventListener")){
			$([this]).unbind(ev, cb)
		} else {
			Can.removeEvent.call(this, ev, cb)
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

	$.each(["append","filter","addClass","remove","data"], function(i,name){
		Can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, Can.makeArray(arguments).slice(1))
		}
	})


	Can.makeArray = function(arr){
		var ret = []
		Can.each(arr, function(i,a){
			ret[i] = a
		})
		return ret;
	};
	Can.inArray =function(item, arr){
		return arr.indexOf(item)
	}
	
	Can.proxy = function(f, ctx){
		return function(){
			return f.apply(ctx, arguments)
		}
	}
	
	// make ajax
	var XHR = $.ajaxSettings.xhr;
	$.ajaxSettings.xhr = function(){
		var xhr = XHR()
		var open = xhr.open;
		xhr.open = function(type, url, async){
			open.call(this, type, url, ASYNC === undefined ? true : ASYNC)
		}
		return xhr;
	}
	var ASYNC;
	var AJAX = $.ajax;
	var updateDeferred = function(xhr, d){
		for(var prop in xhr){
			if(typeof d[prop] == 'function'){
				d[prop] = function(){
					xhr[prop].apply(xhr, arguments)
				}
			} else {
				d[prop] = prop[xhr]
			}
		}
	}
	Can.ajax = function(options){
		
		var success = options.success,
			error = options.error;
		var d = Can.Deferred();
		
		options.success = function(){
			
			updateDeferred(xhr, d);
			d.resolve.apply(d, arguments);
			success && success.apply(this,arguments);
		}
		options.error = function(){
			updateDeferred(xhr, d);
			d.reject.apply(d, arguments);
			error && error.apply(this,arguments);
		}
		if(options.async === false){
			ASYNC = false
		}
		var xhr = AJAX(options);
		ASYNC = undefined;
		updateDeferred(xhr, d);
		return d;
	};
	

	

	
	
	// make destroyed and empty work
	$.fn.empty = function(){
		return this.each(function(){ 
			$.cleanData(this.getElementsByTagName('*'))
			this.innerHTML = '' 
		}) 
	}
	
	$.fn.remove= function () {
		$.cleanData(this);
		this.each(function () {
			if (this.parentNode != null) {
				// might be a text node
				this.getElementsByTagName && $.cleanData(this.getElementsByTagName('*'))
				this.parentNode.removeChild(this);
			}
		});
		return this;
    }
    
    
    Can.trim = function(str){
    	return str.trim();
    }
	Can.isEmptyObject = function(object){
		var name;
		for(name in object){};
		return name !== undefined;
	}
	// make extend handle true for deep

	Can.extend = function(first){
		if(first === true){
			var args = Can.makeArray(arguments);
			args.shift();
			return $.extend.apply($, args)
		}
		return $.extend.apply($, arguments)
	}




	
}).then('../deferred.js')
