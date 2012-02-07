steal('./mootools-core-1.4.3.js', '../event.js','../fragment',function(){
	/**
	 * makeArray
	 * isArray
	 * each
	 * extend
	 * proxy
	 * bind
	 * unbind
	 * trigger
	 * 
	 * inArray
	 * Deferred
	 * When
	 * ajax
	 * 
	 * delegate
	 * undelegate
	 * 
	 * buildFragement
	 */
	Can.trim = function(s){
		return s.trim()
	}
	
	// Array
	Can.makeArray = Array.from;
	Can.isArray = function(arr){
		return typeOf(arr) === 'array'
	};
	Can.inArray = function(item,arr){
		return arr.indexOf(item)
	}
	Can.each = function(elements, callback) {
    	var i, key;
	    if (typeof  elements.length == 'number' && elements.pop)
	      for(i = 0; i < elements.length; i++) {
	        if(callback(i, elements[i]) === false) return elements;
	      }
	    else
	      for(key in elements) {
	        if(callback(key, elements[key]) === false) return elements;
	      }
	    return elements;
  	}
	// Object
	Can.extend = function(first){
		if(first === true){
			var args = Can.makeArray(arguments);
			args.shift();
			return Object.merge.apply(Object, args)
		}
		return Object.append.apply(Object, arguments)
	}
	
	// Function
	Can.proxy = function(func){
		var args = Can.makeArray(arguments),
			func = args.shift();
		
		return func.bind.apply(func, args)
	}
	Can.isFunction = function(f){
		return typeOf(f) == 'function'
	}
	// make this object so you can bind on it
	Can.bind = function( ev, cb){
		// if we can bind to it ...
		if(this.bind && this.bind !== Can.bind){
			this.bind(ev, cb)
		} else if(this.addEvent) {
			this.addEvent(ev, cb)
		} else {
			// make it bind-able ...
			Can.addEvent.call(this, ev, cb)
		}
		return this;
	}
	Can.unbind = function(ev, cb){
		// if we can bind to it ...
		if(this.unbind && this.unbind !== Can.unbind){
			this.unbind(ev, cb)
		} else if(this.removeEvent) {
			this.removeEvent(ev, cb)
		} else {
			// make it bind-able ...
			Can.removeEvent.call(this, ev, cb)
		}
		return this;
	}
	Can.trigger = function(item, event, args, bubble){
		// defaults to true
		bubble = (bubble === undefined ? true : bubble);
		args = args || []
		if(item.fireEvent){
			item = item[0] || item;
			// walk up parents to simulate bubbling 
			while(item) {
			// handle walking yourself
				if(!event.type){
					event = {
						type : event,
						target : item
					}
				}
				var events = item.retrieve('events');
				if (events && events[event.type]) {
					
					events[event.type].keys.each(function(fn){
						fn.apply(this, [event].concat(args));
					}, this); 
				} 
				// if we are bubbling, get parent node
				item = bubble && item.parentNode
				
			
				
			}
			
	
		} else {
			if(typeof event === 'string'){
				event = {type: event}
			}
			event.data = args
			Can.dispatch.call(item, event)
		}
	}
	Can.delegate = function(selector, ev , cb){
		if(this.delegate) {
			this.delegate(selector, ev , cb)
		}
		 else if(this.addEvent) {
			this.addEvent(ev+":relay("+selector+")", cb)
		} else {
			// make it bind-able ...
			console.log("this does not support event delegation")
		}
		return this;
	}
	Can.undelegate = function(selector, ev , cb){
		if(this.undelegate) {
			this.undelegate(selector, ev , cb)
		}
		 else if(this.removeEvent) {
			this.removeEvent(ev+":relay("+selector+")", cb)
		} else {
			// make it bind-able ...
			console.log("this does not support event delegation")
		}
		return this;
	}
	var optionsMap = {
		type:"method",
		success : undefined,
		error: undefined
	}
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
		var d = Can.Deferred(),
			requestOptions = Can.extend({}, options);
		// maap jQuery options to mootools options
		
		for(var option in optionsMap){
			if(requestOptions[option] !== undefined){
				requestOptions[optionsMap[option]] = requestOptions[option];
				delete requestOptions[option]
			}
		}

		var success = options.success,
			error = options.error;
		
		requestOptions.onSuccess = function(responseText, xml){
			var data = responseText;
			if(options.dataType ==='json'){
				data = eval("("+data+")")
			}
			updateDeferred(request.xhr, d);
			d.resolve(data,"success",request.xhr);
			success && success(data,"success",request.xhr);
		}
		requestOptions.onError = function(){
			updateDeferred(request.xhr, d);
			d.reject(request.xhr,"error");
			error(equest.xhr,"error");
		}
		
		var request = new Request(requestOptions);
		console.log(request);
		request.send();
		updateDeferred(request.xhr, d);
		return d;
			
	}
	// element ... get the wrapped helper
	Can.$ = function(selector){
		if(selector === window){
			return window;
		}
		return $$(selector)
	}
	
	// add document fragement support
	var old = document.id;
	document.id =  function(el){
		if(el && el.nodeType === 11){
			return el
		} else{
			return old.apply(document, arguments);
		}
	};
	Can.append = function(wrapped, html){
		if(typeof html === 'string'){
			html = Can.buildFragment([html],[]).fragment
		}
		return wrapped.grab(html)
	}
	Can.data = function(wrapped, key, value){
		if(value === undefined){
			return wrapped[0].retrieve(key)
		} else {
			return wrapped.store(key, value)
		}
	}
	Can.addClass = function(wrapped, className){
		return wrapped.addClass(className);
	}
	Can.remove = function(wrapped){
		
		return wrapped.destroy();
	}
	// destroyed method
	var destroy = Element.prototype.destroy;
	Element.prototype.destroy = function(){
		Can.trigger(this,"destroyed",[],false)
		var elems = this.getElementsByTagName("*");
		for ( var i = 0, elem; (elem = elems[i]) !== undefined; i++ ) {
			Can.trigger(elem,"destroyed",[],false);
		}
		destroy.apply(this, arguments)
	}
	
},'../deferred.js')
