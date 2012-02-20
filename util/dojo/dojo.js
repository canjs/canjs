steal("https://ajax.googleapis.com/ajax/libs/dojo/1.7.1/dojo/dojo.js.uncompressed.js", 
	'../event.js'
	
	).then('./nodelist-traverse').then(
	'./trigger',
	function(){
	
	// String
	Can.trim = function(s){
		return dojo.trim(s);
	}
	
	// Array
	Can.makeArray = function(arr){
		array = [];
		dojo.forEach(arr, function(item){ array.push(item)});
		return array;
	};
	Can.isArray = dojo.isArray;
	Can.inArray = function(item,arr){
		return dojo.indexOf(arr, item);
	};
	Can.map = function(arr, fn){
		return dojo.map(Can.makeArray(arr||[]), fn);
	};
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
			return dojo.mixin.apply(dojo, args)
		}
		return dojo.mixin.apply(dojo, arguments)
	}
	Can.param = function(object){
		return dojo.objectToQuery(object)
	}
	Can.isEmptyObject = function(object){
		var prop;
		for(prop in object){
			break;
		}
		return prop === undefined;;
	}
	// Function
	Can.proxy = function(func, context){
		return dojo.hitch(context, func)
	}
	Can.isFunction = function(f){
		return dojo.isFunction(f);
	}
	/**
	 * EVENTS
	 * 
	 * Dojo does not use the callback handler when unbinding.  Instead
	 * when binding (dojo.connect or dojo.on) an object with a remove
	 * method is returned.
	 * 
	 * Because of this, we have to map each callback to the "remove"
	 * object to it can be passed to dojo.disconnect.
	 */
	
	// these should be pre-loaded by steal
	// we might want to wrap
	require(["dojo/query", "plugd/trigger"], function(){})
	
	// the id of the function to be bound, used as an expando on the function
	// so we can lookup it's "remove" object
	var id = 0,
		// takes a node list, goes through each node
		// and adds events data that has a map of events to 
		// callbackId to "remove" object.  It looks like
		// {click: {5: {remove: fn}}}		
		addBinding = function(nodelist, ev, cb){
			nodelist.forEach(function(node){
				var node = new dojo.NodeList(node)
				var events = Can.data(node,"events");
				if(!events){
					Can.data(node,"events", events = {})
				}
				if(!events[ev]){
					events[ev] = {};
				}
				if(cb.__bindingsIds === undefined) {
					cb.__bindingsIds=id++;
				} 
				events[ev][cb.__bindingsIds] = node.on(ev, cb)[0]
			});
		},
		// removes a binding on a nodelist by finding
		// the remove object within the object's data
		removeBinding = function(nodelist,ev,cb){
			nodelist.forEach(function(node){
				var node = new dojo.NodeList(node),
					events = Can.data(node,"events"),
					handlers = events[ev],
					handler = handlers[cb.__bindingsIds];
				
				dojo.disconnect(handler);
				delete handlers[cb.__bindingsIds];
				
				if(Can.isEmptyObject(handlers)){
					delete events[ev]
				}
				if(Can.isEmptyObject(events)){
					// clear data
				}
			});
		}
	
	Can.bind = function( ev, cb){
		// if we can bind to it ...
		if(this.bind && this.bind !== Can.bind){
			this.bind(ev, cb)
			
		// otherwise it's an element or node List
		} else if(this.on || this.nodeType){
			addBinding( new dojo.NodeList(this), ev, cb)
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
		} 
		
		else if(this.on || this.nodeType) {
			removeBinding(new dojo.NodeList(this), ev, cb);
		} else {
			// make it bind-able ...
			Can.removeEvent.call(this, ev, cb)
		}
		return this;
	}
	
	Can.trigger = function(item, event, args, bubble){
		if(item.trigger){
			if(bubble === false){
				//  force stop propagation by
				// listening to On and then immediately disconnecting
				var connect = item.on(event, function(ev){
					ev.stopPropagation();
					dojo.disconnect(connect);
				})
				item.trigger(event,args)
			} else {
				item.trigger(event,args)
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
		if(this.on || this.nodeType){
			addBinding( new dojo.NodeList(this), selector+":"+ev, cb)
		} else if(this.delegate) {
			this.delegate(selector, ev , cb)
		} 
		return this;
	}
	Can.undelegate = function(selector, ev , cb){
		if(this.on || this.nodeType){
			removeBinding(new dojo.NodeList(this), selector+":"+ev, cb);
		} else if(this.undelegate) {
			this.undelegate(selector, ev , cb)
		}

		return this;
	}


	/**
	 * Ajax
	 */
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
	Can.Deferred = dojo.Deferred;
	Can.When = dojo.Deferred.When;
	Can.Deferred.prototype.pipe = function(done, fail){
			var d = new Can.Deferred();
		this.addCallback(function(){
			d.resolve( done.apply(this, arguments) );
		});
		
		this.addErrback(function(){
			if(fail){
				d.reject( fail.apply(this, arguments) );
			} else {
				d.reject.apply(d, arguments);
			}
		});
		return d;
	};
	
	Can.ajax = function(options){
		var type = Can.String.capitalize( (options.type || "get").toLowerCase() ),
			method = dojo["xhr"+type];
		var success = options.success,
			error = options.error,
			d = new Can.Deferred();
			
		var def = method({
			url : options.url,
			handleAs : options.dataType,
			sync : !options.async,
			headers : options.headers,
			content: options.data
		})
		def.then(function(data, ioargs){
			updateDeferred(xhr, d);
			d.resolve(data,"success",xhr);
			success && success(data,"success",xhr);
		},function(data,ioargs){
			updateDeferred(xhr, d);
			d.reject(xhr,"error");
			error(xhr,"error");
		})
		
		var xhr = def.ioArgs.xhr;
		

		updateDeferred(xhr, d);
		return d;
			
	}
	// element ... get the wrapped helper
	Can.$ = function(selector){
		if(selector === window){
			return window;
		}
		return dojo.query(selector)
	}
	Can.buildFragment = function(frags, nodes){
		var owner = nodes.length && nodes[0].ownerDocument;
		return dojo.toDom(frags[0], owner );
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
		return wrapped.forEach(function(node){
			dojo.place( html, node)
		});
	}
	Can.filter = function(wrapped, filter){
		return wrapped.filter(filter);
	}
	
	
	
	/**
	 * Can.data
	 * 
	 * Can.data is used to store arbitrary data on an element.
	 * Dojo does not support this, so we implement it itself.
	 * 
	 * The important part is to call cleanData on any elements 
	 * that are removed from the DOM.  For this to happen, we
	 * overwrite 
	 * 
	 *   -dojo.empty
	 *   -dojo.destroy
	 *   -dojo.place when "replace" is used TODO!!!!
	 * 
	 * For Can.Control, we also need to trigger a non bubbling event
	 * when an element is removed.  We do this also in cleanData.
	 */
	
	var data = {},
	    uuid = Can.uuid = +new Date(),
	    exp  = Can.expando = 'Can' + uuid;
	
	function getData(node, name) {
	    var id = node[exp], store = id && data[id];
	    return name === undefined ? store || setData(node) :
	      (store && store[name]);
	}
	
	function setData(node, name, value) {
	    var id = node[exp] || (node[exp] = ++uuid),
	      store = data[id] || (data[id] = {});
	    if (name !== undefined) store[name] = value;
	    return store;
	};
	
	var cleanData = function(elems){
	  	Can.trigger(new dojo.NodeList(elems),"destroyed",false)
	  	for ( var i = 0, elem;
			(elem = elems[i]) !== undefined; i++ ) {
				var id = elem[exp]
				delete data[id];
			}
	  }
	Can.data = function(wrapped, name, value){
		return value === undefined ?
			wrapped.length == 0 ? undefined : getData(wrapped[0], name) :
			wrapped.forEach(function(node){
				setData(node, name, value);
			});
	};
	// overwrite dojo.destroy and dojo.empty and dojo.palce
	var empty = dojo.empty;
	dojo.empty = function(){
		for(var c; c = node.lastChild;){ // intentional assignment
			dojo.destroy(c);
		} 
	}
	var destroy = dojo.destroy;
	dojo.destroy = function(node){
		node = dojo.byId(node);
		cleanData([node]);
		node.getElementsByTagName && cleanData(node.getElementsByTagName('*'))
		
		return destroy.apply(dojo, arguments);
	};
	


	
	Can.addClass = function(wrapped, className){
		return wrapped.addClass(className);
	}
	Can.remove = function(wrapped){
		// we need to remove text nodes ourselves
		wrapped.forEach(function(node){
			dojo.destroy(node)
		});
	}

	
	
	
	
	

	
	
})
