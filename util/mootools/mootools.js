steal({
	src: './mootools-core-1.4.3.js',
	_skip: true
}, '../event.js','../fragment', function(){
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
	can.trim = function(s){
		return s && s.trim()
	}
	
	// Array
	can.makeArray = Array.from;
	can.isArray = function(arr){
		return typeOf(arr) === 'array'
	};
	can.inArray = function(item,arr){
		return arr.indexOf(item)
	}
	can.map = function(arr, fn){
		return Array.from(arr||[]).map(fn);
	}
	can.each = function(elements, callback) {
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
	can.extend = function(first){
		if(first === true){
			var args = can.makeArray(arguments);
			args.shift();
			return Object.merge.apply(Object, args)
		}
		return Object.append.apply(Object, arguments)
	}
	can.param = function(object){
		return Object.toQueryString(object)
	}
	can.isEmptyObject = function(object){
		return Object.keys(object).length === 0;
	}
	// Function
	can.proxy = function(func){
		var args = can.makeArray(arguments),
			func = args.shift();
		
		return func.bind.apply(func, args)
	}
	can.isFunction = function(f){
		return typeOf(f) == 'function'
	}
	// make this object so you can bind on it
	can.bind = function( ev, cb){
		// if we can bind to it ...
		if(this.bind && this.bind !== can.bind){
			this.bind(ev, cb)
		} else if(this.addEvent) {
			this.addEvent(ev, cb)
		} else {
			// make it bind-able ...
			can.addEvent.call(this, ev, cb)
		}
		return this;
	}
	can.unbind = function(ev, cb){
		// if we can bind to it ...
		if(this.unbind && this.unbind !== can.unbind){
			this.unbind(ev, cb)
		} else if(this.removeEvent) {
			this.removeEvent(ev, cb)
		} else {
			// make it bind-able ...
			can.removeEvent.call(this, ev, cb)
		}
		return this;
	}
	can.trigger = function(item, event, args, bubble){
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
			can.dispatch.call(item, event)
		}
	}
	can.delegate = function(selector, ev , cb){
		if(this.delegate) {
			this.delegate(selector, ev , cb)
		}
		 else if(this.addEvent) {
			this.addEvent(ev+":relay("+selector+")", cb)
		} else {
			// make it bind-able ...
		}
		return this;
	}
	can.undelegate = function(selector, ev , cb){
		if(this.undelegate) {
			this.undelegate(selector, ev , cb)
		}
		 else if(this.removeEvent) {
			this.removeEvent(ev+":relay("+selector+")", cb)
		} else {
			// make it bind-able ...
			
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
	can.ajax = function(options){
		var d = can.Deferred(),
			requestOptions = can.extend({}, options);
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
			error(request.xhr,"error");
		}
		
		var request = new Request(requestOptions);
		request.send();
		updateDeferred(request.xhr, d);
		return d;
			
	}
	// element ... get the wrapped helper
	can.$ = function(selector){
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
	can.append = function(wrapped, html){
		if(typeof html === 'string'){
			html = can.buildFragment([html],[]).fragment
		}
		return wrapped.grab(html)
	}
	can.filter = function(wrapped, filter){
		return wrapped.filter(filter);
	}
	can.data = function(wrapped, key, value){
		if(value === undefined){
			return wrapped[0].retrieve(key)
		} else {
			return wrapped.store(key, value)
		}
	}
	can.addClass = function(wrapped, className){
		return wrapped.addClass(className);
	}
	can.remove = function(wrapped){
		// we need to remove text nodes ourselves
		
		return wrapped.filter(function(node){ 
			if(node.nodeType !== 1){
				node.parentNode.removeChild(node);
			} else {
				return true;
			}
		}).destroy();
	}
	// destroyed method
	var destroy = Element.prototype.destroy;
	Element.prototype.destroy = function(){
		can.trigger(this,"destroyed",[],false)
		var elems = this.getElementsByTagName("*");
		for ( var i = 0, elem; (elem = elems[i]) !== undefined; i++ ) {
			can.trigger(elem,"destroyed",[],false);
		}
		destroy.apply(this, arguments)
	}
	can.get = function(wrapped, index){
		return wrapped[index];
	}
	
	
},'../deferred.js')
