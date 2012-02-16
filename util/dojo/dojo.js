steal("https://ajax.googleapis.com/ajax/libs/dojo/1.6.1/dojo/dojo.xd.js.uncompressed.js", 
	'../event.js').then(
	'http://ajax.googleapis.com/ajax/libs/dojo/1.6.1/dojox/NodeList/delegate.xd.js',
	'http://ajax.googleapis.com/ajax/libs/dojo/1.6.1/dojo/NodeList-traverse.xd.js',
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
	
	dojo.require("dojox.NodeList.delegate");
	
	Can.delegate = function(selector, ev , cb){
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
	Can.undelegate = function(selector, ev , cb){
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
	//require(["dojo/on"], function(on){
	//  on(document, "click", function(){alert('hi')});
	//});
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
	
	
	
	// Can.data
	
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
		cleanData(node);
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
