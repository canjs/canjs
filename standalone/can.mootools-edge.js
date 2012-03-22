(function(can, window, undefined){

can.addEvent = function(event, fn){
	if(!this.__bindEvents){
		this.__bindEvents = {};
	}
	var eventName = event.split(".")[0];
	
	if(!this.__bindEvents[eventName]){
		this.__bindEvents[eventName] = [];
	}
	this.__bindEvents[eventName].push({
		handler: fn,
		name: event
	});
	return this;
};
can.removeEvent = function(event, fn){
	if(!this.__bindEvents){
		return;
	}
	var i =0,
		events = this.__bindEvents[event.split(".")[0]],
		ev;
	while(i < events.length){
		ev = events[i]
		if((fn && ev.handler === fn) || (!fn && ev.name === event)){
			events.splice(i, 1);
		} else {
			i++;
		}
	}	
	return this;
};
can.dispatch = function(event){
	if(!this.__bindEvents){
		return;
	}
	
	var eventName = event.type.split(".")[0],
		handlers = this.__bindEvents[eventName] || [],
		self= this,
		args = [event].concat(event.data || []);
		
	can.each(handlers, function(i, ev){
		event.data = args.slice(1);
		ev.handler.apply(self, args);
	});
}



;

	
	var table = document.createElement('table'),
    	tableRow = document.createElement('tr'),
		containers = {
		  'tr': document.createElement('tbody'),
		  'tbody': table, 'thead': table, 'tfoot': table,
		  'td': tableRow, 'th': tableRow,
		  '*': document.createElement('div')
		},
   		fragmentRE = /^\s*<(\w+)[^>]*>/,
   		fragment  = function(html, name) {
		    if (name === undefined) {
		    	name = fragmentRE.test(html) && RegExp.$1;
		    }
		    if (!(name in containers)) name = '*';
		    var container = containers[name];
		    container.innerHTML = '' + html;
		    return [].slice.call(container.childNodes);
		}
	
	can.buildFragment = function(htmls, nodes){
		var parts = fragment(htmls[0]),
			frag = document.createDocumentFragment();
		parts.forEach(function(part){
			frag.appendChild(part);
		})
		return {
			fragment: frag
		}
	};
	
;

	
	var Deferred = function( func ) {
		if ( ! ( this instanceof Deferred ))
			return new Deferred();

		this._doneFuncs = [];
		this._failFuncs = [];
		this._resultArgs = null;
		this._status = "";

		// check for option function: call it with this as context and as first 
		// parameter, as specified in jQuery api
		func && func.call(this, this);
	};
	can.Deferred = Deferred;
	can.when = Deferred.when = function() {
		var args = can.makeArray( arguments );
		if (args.length < 2) {
			var obj = args[0];
			if (obj && ( can.isFunction( obj.isResolved ) && can.isFunction( obj.isRejected ))) {
				return obj;			
			} else {
				return Deferred().resolve(obj);
			}
		} else {
			
			var df = Deferred(),
				done = 0,
				// resolve params: params of each resolve, we need to track down 
				// them to be able to pass them in the correct order if the master 
				// needs to be resolved
				rp = [];

			can.each(args, function(j, arg){
				arg.done(function() {
					rp[j] = (arguments.length < 2) ? arguments[0] : arguments;
					if (++done == args.length) {
						df.resolve.apply(df, rp);
					}
				}).fail(function() {
					df.reject(arguments);
				});
			});

			return df;
			
		}
	}
	
	var resolveFunc = function(type, _status){
		return function(context){
			var args = this._resultArgs = (arguments.length > 1) ? arguments[1] : [];
			return this.exec(context, this[type], args, _status);
		}
	},
	doneFunc = function(type, _status){
		return function(){
			var self = this;
			can.each(arguments, function( i, v, args ) {
				if ( ! v )
					return;
				if ( v.constructor === Array ) {
					args.callee.apply(self, v)
				} else {
					// immediately call the function if the deferred has been resolved
					if (self._status === _status)
						v.apply(self, self._resultArgs || []);
	
					self[type].push(v);
				}
			});
			return this;
		}
	};

	can.extend( Deferred.prototype, {
		pipe : function(done, fail){
			var d = can.Deferred();
			this.done(function(){
				d.resolve( done.apply(this, arguments) );
			});
			
			this.fail(function(){
				if(fail){
					d.reject( fail.apply(this, arguments) );
				} else {
					d.reject.apply(d, arguments);
				}
			});
			return d;
		},
		resolveWith : resolveFunc("_doneFuncs","rs"),
		rejectWith : resolveFunc("_failFuncs","rj"),
		done : doneFunc("_doneFuncs","rs"),
		fail : doneFunc("_failFuncs","rj"),
		always : function() {
			var args = can.makeArray(arguments);
			if (args.length && args[0])
				this.done(args[0]).fail(args[0]);

			return this;
		},

		then : function() {
			var args = can.makeArray( arguments );
			// fail function(s)
			if (args.length > 1 && args[1])
				this.fail(args[1]);

			// done function(s)
			if (args.length && args[0])
				this.done(args[0]);

			return this;
		},

		isResolved : function() {
			return this._status === "rs";
		},

		isRejected : function() {
			return this._status === "rj";
		},

		reject : function() {
			return this.rejectWith(this, arguments);
		},

		resolve : function() {
			return this.resolveWith(this, arguments);
		},

		exec : function(context, dst, args, st) {
			if (this._status !== "")
				return this;

			this._status = st;

			can.each(dst, function(i, d){
				d.apply(context, args);
			});

			return this;
		}
	});


;

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
	
	
;

	
	// Several of the methods in this plugin use code adapated from Prototype
	//  Prototype JavaScript framework, version 1.6.0.1
	//  (c) 2005-2007 Sam Stephenson
	var undHash= /_|-/,
		colons= /==/,
		words= /([A-Z]+)([A-Z][a-z])/g,
		lowUp= /([a-z\d])([A-Z])/g,
		dash= /([a-z\d])([A-Z])/g,
		replacer= /\{([^\}]+)\}/g,
		quote= /"/g,
		singleQuote= /'/g,
		// gets the nextPart property from current
		// add - if true and nextPart doesnt exist, create it as an empty object
		getNext = function(current, nextPart, add){
			return nextPart in current ? current[nextPart] : ( add && (current[nextPart] = {}) );
		},
		// returns true if the object can have properties (no nulls)
		isContainer = function(current){
			return /^f|^o/.test( typeof current );
		},
		// a reference
		getObject;
		/** 
		 * @class can
		 * @parent can.util
		 * 
		 * A collection of useful string helpers. Available helpers are:
		 * <ul>
		 *   <li>[can.util.String.capitalize|capitalize]: Capitalizes a string (some_string &raquo; Some_string)</li>
		 *   <li>[can.util.String.camelize|camelize]: Capitalizes a string from something undercored 
		 *       (some_string &raquo; someString, some-string &raquo; someString)</li>
		 *   <li>[can.util.String.classize|classize]: Like [can.util.String.camelize|camelize], 
		 *       but the first part is also capitalized (some_string &raquo; SomeString)</li>
		 *   <li>[can.util.String.niceName|niceName]: Like [can.util.String.classize|classize], but a space separates each 'word' (some_string &raquo; Some String)</li>
		 *   <li>[can.util.String.underscore|underscore]: Underscores a string (SomeString &raquo; some_string)</li>
		 *   <li>[can.util.String.sub|sub]: Returns a string with {param} replaced values from data.
		 *       <code><pre>
		 *       can.sub("foo {bar}",{bar: "far"})
		 *       //-> "foo far"</pre></code>
		 *   </li>
		 * </ul>
		 * 
		 */
		can.extend(can, {
			esc : function(content){
				return ("" + content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(quote, '&#34;').replace(singleQuote, "&#39;");
			},
			
			/**
			 * @function getObject
			 * Gets an object from a string.  It can also modify objects on the
			 * 'object path' by removing or adding properties.
			 * 
			 *     Foo = {Bar: {Zar: {"Ted"}}}
		 	 *     can.getObject("Foo.Bar.Zar") //-> "Ted"
			 * 
			 * @param {String} name the name of the object to look for
			 * @param {Array} [roots] an array of root objects to look for the 
			 *   name.  If roots is not provided, the window is used.
			 * @param {Boolean} [add] true to add missing objects to 
			 *  the path. false to remove found properties. undefined to 
			 *  not modify the root object
			 * @return {Object} The object.
			 */
			getObject : getObject = function( name, roots, add ) {
			
				// the parts of the name we are looking up
				// ['App','Models','Recipe']
				var parts = name ? name.split('.') : [],
					length =  parts.length,
					current,
					ret, 
					i,
					r = 0;
				
				// make sure roots is an array
				roots = can.isArray(roots) ? roots : [roots || window];
				
				if(length == 0){
					return roots[0];
				}
				// for each root, mark it as current
				while( current = roots[r++] ) {
					// walk current to the 2nd to last object
					// or until there is not a container
					for (i =0; i < length - 1 && isContainer(current); i++ ) {
						current = getNext(current, parts[i], add);
					}
					// if we can get a property from the 2nd to last object
					if( isContainer(current) ) {
						
						// get (and possibly set) the property
						ret = getNext(current, parts[i], add); 
						
						// if there is a value, we exit
						if( ret !== undefined ) {
							// if add is false, delete the property
							if ( add === false ) {
								delete current[parts[i]];
							}
							return ret;
							
						}
					}
				}
			},
			/**
			 * Capitalizes a string
			 * @param {String} s the string.
			 * @return {String} a string with the first character capitalized.
			 */
			capitalize: function( s, cache ) {
				// used to make newId ...
				return s.charAt(0).toUpperCase() + s.slice(1);
			},
			
			/**
			 * Underscores a string.
			 * @codestart
			 * can.underscore("OneTwo") //-> "one_two"
			 * @codeend
			 * @param {String} s
			 * @return {String} the underscored string
			 */
			underscore: function( s ) {
				return s.replace(colons, '/').replace(words, '$1_$2').replace(lowUp, '$1_$2').replace(dash, '_').toLowerCase();
			},
			/**
			 * Returns a string with {param} replaced values from data.
			 * 
			 *     can.sub("foo {bar}",{bar: "far"})
			 *     //-> "foo far"
			 *     
			 * @param {String} s The string to replace
			 * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
			 * objects can be used.
			 * @param {Boolean} [remove] if a match is found, remove the property from the object
			 */
			sub: function( s, data, remove ) {
				var obs = [],
					remove = typeof remove == 'boolean' ? !remove : remove;
				obs.push(s.replace(replacer, function( whole, inside ) {
					//convert inside to type
					var ob = getObject(inside, data, remove);
					
					// if a container, push into objs (which will return objects found)
					if( isContainer(ob) ){
						obs.push(ob);
						return "";
					}else{
						return ""+ob;
					}
				}));
				
				return obs.length <= 1 ? obs[0] : obs;
			},
			replacer : replacer,
			undHash :undHash
		});
;


	
	var initializing = 0;

	/** 
	 * @add can.Construct 
	 */
	can.Construct = function() {
		if (arguments.length) {
			return can.Construct.extend.apply(can.Construct, arguments);
		}
	};

	/**
	 * @static
	 */
	can.extend(can.Construct, {
		/**
		 * @function newInstance
		 * Creates a new instance of the constructor function.  This method is useful for creating new instances
		 * with arbitrary parameters.  Typically you want to simply call `new Constructor` instead.
		 * 
		 * ## Example
		 * 
		 * The following creates a `Person` constructor method, then creates a new instance of person, but
		 * by using `apply` on newInstance to pass arbitrary parameters.
		 * 
		 *     var Person = can.Construct({
		 *       init : function(first, middle, last) {
		 *         this.first = first;
		 *         this.middle = middle;
		 *         this.last = last;
		 *       }
		 *     });
		 * 
		 *     var args = ["Justin","Barry","Meyer"],
		 *         justin = new Person.newInstance.apply(null, args);
		 * 
		 * @param {Object} [args] arguments that get passed to [can.Construct::setup] and [can.Construct::init]. Note
		 * that if [can.Construct::setup] returns an array, those arguments will be passed to [can.Construct::init]
		 * instead.
		 * @return {class} instance of the class
		 */
		newInstance: function() {
			// get a raw instance objet (init is not called)
			var inst = this.instance(),
				arg = arguments,
				args;
				
			// call setup if there is a setup
			if ( inst.setup ) {
				args = inst.setup.apply(inst, arguments);
			}
			// call init if there is an init, if setup returned args, use those as the arguments
			if ( inst.init ) {
				inst.init.apply(inst, args || arguments);
			}
			return inst;
		},
		// overwrites an object with methods, sets up _super
		//   newProps - new properties
		//   oldProps - where the old properties might be
		//   addTo - what we are adding to
		_inherit: function( newProps, oldProps, addTo ) {
			can.extend(addTo || newProps, newProps || {})
		},
		/**
		 * Setup is called immediately after a constructor function is created and 
		 * set to inherit from its base constructor.  It is called with base constructor and
		 * the params used to extend the base constructor.  
		 * 
		 * It is useful for setting up an additional inheritence work.
		 * 
		 * ## Example
		 * 
		 * The following creates a `Base` class that when extended, adds a reference to the base
		 * class.
		 * 
		 * 
		 *     Base = can.Construct({
		 *       setup : function(base, fullName, staticProps, protoProps){
		 * 	       this.base = base;
		 *         // call base functionality
		 *         can.Construct.setup.apply(this, arguments)
		 *       }
		 *     },{});
		 * 
		 *     Base.base //-> can.Construct
		 *     
		 *     Inherting = Base({});
		 * 
		 *     Inheriting.base //-> Base
		 * 
		 * ## Base Functionality
		 * 
		 * Setup deeply extends the static `defaults` property of the base constructor with 
		 * properties of the inheriting constructor.  For example:
		 * 
		 *     MyBase = can.Construct({
		 *       defaults : {
		 *         foo: 'bar'
		 *       }
		 *     },{})
		 * 
		 *     Inheriting = MyBase({
		 *       defaults : {
		 *         newProp : 'newVal'
		 *       }
		 *     },{}
		 *     
		 *     Inheriting.defaults // -> {foo: 'bar', 'newProp': 'newVal'}
		 * 
		 * @param {Object} base the base constructor that is being inherited from
		 * @param {String} [fullName] the name of the new constructor
		 * @param {Object} [staticProps] the static properties of the new constructor
		 * @param {Object} [protoProps] the prototype properties of the new constructor
		 */
		setup: function( base, fullName ) {
			// set defaults as the merger of the parent defaults and this object's defaults
			this.defaults = can.extend(true,{}, base.defaults, this.defaults);
		},
		instance: function() {
			// prevent running init
			initializing = 1;
			var inst = new this();
			initializing = 0;
			// allow running init
			return inst;
		},
		/**
		 * @hide
		 * Extends a class with new static and prototype functions.  There are a variety of ways
		 * to use extend:
		 * 
		 *     // with className, static and prototype functions
		 *     can.Construct('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     can.Construct('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     can.Construct('Task')
		 * 
		 * You no longer have to use <code>.extend</code>.  Instead, you can pass those options directly to
		 * can.Construct (and any inheriting classes):
		 * 
		 *     // with className, static and prototype functions
		 *     can.Construct('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     can.Construct('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     can.Construct('Task')
		 * 
		 * @param {String} [fullName]  the classes name (used for classes w/ introspection)
		 * @param {Object} [klass]  the new classes static/class functions
		 * @param {Object} [proto]  the new classes prototype functions
		 * 
		 * @return {can.Construct} returns the new class
		 */
		extend: function( fullName, klass, proto ) {
			// figure out what was passed and normalize it
			if ( typeof fullName != 'string' ) {
				proto = klass;
				klass = fullName;
				fullName = null;
			}
			if (!proto ) {
				proto = klass;
				klass = null;
			}

			proto = proto || {};
			var _super_class = this,
				_super = this.prototype,
				string = can,
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			prototype = this.instance();
			
			// Copy the properties over onto the new prototype
			this._inherit(proto, _super, prototype);

			// The dummy class constructor
			function Constructor() {
				// All construction is actually done in the init method
				if ( ! initializing ) {
					// we are being called w/o new, we are extending
					return this.constructor !== Constructor && arguments.length ?
						arguments.callee.extend.apply(arguments.callee, arguments) :
						//we are being called w/ new
						this.constructor.newInstance.apply(this.constructor, arguments);
				}
			}
			// Copy old stuff onto class (can probably be merged w/ inherit)
			for ( name in this ) {
				if ( this.hasOwnProperty(name) ) {
					Constructor[name] = this[name];
				}
			}
			// copy new static props on class
			this._inherit(klass, this, Constructor);

			// do namespace stuff
			if ( fullName ) {

				var parts = fullName.split('.'),
					shortName = parts.pop(),
					current = can.getObject(parts.join('.'), window, true),
					namespace = current,
					_fullName = can.underscore(fullName.replace(/\./g, "_")),
					_shortName = can.underscore(shortName);

				//@steal-remove-start
				if(current[shortName]){
					
				}
				//@steal-remove-end
				
				current[shortName] = Constructor;
			}

			// set things that can't be overwritten
			can.extend(Constructor, {
				prototype: prototype,
				/**
				 * @attribute namespace 
				 * The namespaces object
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.namespace //-> MyOrg
				 * 
				 */
				namespace: namespace,
				/**
				 * @attribute shortName 
				 * The name of the class without its namespace, provided for introspection purposes.
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.shortName //-> 'MyConstructor'
				 *     MyOrg.MyConstructor.fullName //->  'MyOrg.MyConstructor'
				 * 
				 */
				shortName: shortName,
				_shortName : _shortName,
				_fullName: _fullName,
				constructor: Constructor,
				/**
				 * @attribute fullName 
				 * The full name of the class, including namespace, provided for introspection purposes.
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.shortName //-> 'MyConstructor'
				 *     MyOrg.MyConstructor.fullName //->  'MyOrg.MyConstructor'
				 * 
				 */
				fullName: fullName
			});

			//make sure our prototype looks nice
			Constructor.prototype.constructor = Constructor;

			
			// call the class setup
			var t = [_super_class].concat(can.makeArray(arguments)),
				args = Constructor.setup.apply(Constructor, t );
			
			// call the class init
			if ( Constructor.init ) {
				Constructor.init.apply(Constructor, args || t );
			}

			/* @Prototype*/
			return Constructor;
			/** 
			 * @function setup
			 * 
			 * If a prototype `setup` method is provided, it is called when a new 
			 * instance is created.  It is passed the same arguments that
			 * were passed to the Constructor constructor 
			 * function (`new Constructor( arguments ... )`).  If `setup` returns an
			 * array, those arguments are passed to [can.Construct::init] instead
			 * of the original arguments.
			 * 
			 * Typically, you should only provide [can.Construct::init] methods to 
			 * handle initilization code. Use `setup` for:
			 * 
			 *   - initialization code that you want to run before inheriting constructor's 
			 *     init method is called.
			 *   - initialization code that should run without inheriting constructors having to 
			 *     call base methods (ex: `MyBase.prototype.init.call(this, arg1)`).
			 *   - passing modified/normalized arguments to `init`.
			 * 
			 * ## Examples
			 * 
			 * The following is similar to code in [can.Control]'s setup method that
			 * converts the first argument to a jQuery collection and extends the 
			 * second argument with the constructor's [can.Construct.defaults defaults]:
			 * 
			 *     can.Construct("can.Control",{
			 *       setup: function( htmlElement, rawOptions ) {
			 *         // set this.element
			 *         this.element = $(htmlElement);
			 * 
			 *         // set this.options
			 *         this.options = can.extend( {}, 
			 * 	                               this.constructor.defaults, 
			 * 	                               rawOptions );
			 * 
			 *         // pass the wrapped element and extended options
			 *         return [this.element, this.options] 
			 *       }
			 *     })
			 * 
			 * ## Base Functionality
			 * 
			 * Setup is not defined on can.Construct itself, so calling super in inherting classes
			 * will break.  Don't do the following:
			 * 
			 *     Thing = can.Construct({
			 *       setup : function(){
			 *         this._super(); // breaks!
			 *       }
			 *     })
			 * 
			 * @return {Array|undefined} If an array is return, [can.Construct.prototype.init] is 
			 * called with those arguments; otherwise, the original arguments are used.
			 */
			//break up
			/** 
			 * @function init
			 * 
			 * If a prototype `init` method is provided, it gets called when a new instance
			 * is created.  It gets called after [can.Construct::setup], typically with the 
			 * same arguments passed to the Constructor 
			 * constructor: (<code> new Constructor( arguments ... )</code>).  
			 * 
			 * The `init` method is where your constructor code should go.  Typically,
			 * you will find it saving the arguments passed to the constructor function for later use. 
			 * 
			 * ## Examples
			 * 
			 * The following creates a Person constructor with a first and last name property:
			 * 
			 *     var Person = can.Construct({
			 *       init : function(first, last){
			 *         this.first = first;
			 *         this.last = last;
			 *       }
			 *     })
			 * 
			 *     var justin = new Person("Justin","Meyer");
			 *     justin.first //-> "Justin"
			 *     justin.last  //-> "Meyer"
			 * 
			 * The following extends person to create a Programmer constructor
			 * 
			 *     var Programmer = Person({
			 *       init : function(first, last, lang){
			 *         // call base functionality
			 *         Person.prototype.init.call(this, first, last);
			 * 
			 *         // save the lang
			 *         this.lang = lang
			 *       },
			 *       greet : function(){
			 *         return "I am "+this.first+" "+this.last+"."+
			 *                "I write "+this.lang +".";
			 *       }
			 *     })
			 * 
			 *     var brian = new Programmer("Brian","Moschel","ECMAScript")
			 *     brian.greet() //-> "I am Brian Moschel.\
			 *                   //    I write ECMAScript."
			 * 
			 * ## Notes
			 * 
			 * [can.Construct::setup] is able to modify the arguments passed to init.
			 * 
			 * It doesn't matter what init returns.  This is because the `new` keyword always
			 * returns the new object.
			 * 
			 * There is no `init` method defined on can.Construct so calling _super will not work.
			 * 
			 */
			//Breaks up code
			/**
			 * @attribute constructor
			 * 
			 * A reference to the constructor function that created the instance.  Its allows one to access 
			 * the constructor function's static properties from an instance.
			 * 
			 * ## Example
			 * 
			 * `Counter` counts how many instances are created:
			 * 
			 *     Counter = can.Construct({
			 * 	     count : 0
			 *     },{
			 *       init : function(){
			 *         this.constructor.count++;
			 *       }
			 *     })
			 * 
			 *     new Counter();
			 *     Counter.count //-> 1; 
			 * 
			 */
		}

	});





;


	// returns if something is an object with properties of its own
	var canMakeObserve = function( obj ) {
			return obj && typeof obj === 'object' && !(obj instanceof Date);
		},
		// removes all listeners
		unhookup = function(items, namespace){
			return can.each(items, function(i, item){
				if(item && item.unbind){
					item.unbind("change" + namespace);
				}
			});
		},
		// listens to changes on val and 'bubbles' the event up
		// - val the object to listen to changes on
		// - prop the property name val is at on
		// - parent the parent object of prop
		hookupBubble = function( val, prop, parent ) {
			// if it's an array make a list, otherwise a val
			if (val instanceof Observe){
				// we have an observe already
				// make sure it is not listening to this already
				unhookup([val], parent._namespace);
			} else if ( can.isArray(val) ) {
				val = new Observe.List(val);
			} else {
				val = new Observe(val);
			}
			// attr (like target, how you (delegate) to get to the target)
            // currentAttr (how to get to you)
            // delegateAttr (hot to get to the delegated Attr)
			
			//listen to all changes and batchTrigger upwards
			val.bind("change" + parent._namespace, function( ev, attr ) {
				// batchTrigger the type on this ...
				var args = can.makeArray(arguments),
					ev = args.shift();
					args[0] = prop === "*" ? 
						parent.indexOf(val)+"." + args[0] :
						prop +  "." + args[0];
				can.trigger(parent, ev, args);
			});

			return val;
		},
		
		// an id to track events for a given observe
		observeId = 0,
		// a reference to an array of events that will be dispatched
		collecting = undefined,
		// call to start collecting events (Observe sends all events at once)
		collect = function() {
			if (!collecting ) {
				collecting = [];
				return true;
			}
		},
		// creates an event on item, but will not send immediately 
		// if collecting events
		// - item - the item the event should happen on
		// - event - the event name ("change")
		// - args - an array of arguments
		batchTrigger = function( item, event, args ) {
			// send no events if initalizing
			if ( ! item._init) {
				if (!collecting ) {
					return can.trigger(item, event, args);
				} else {
					collecting.push([
					item,
					{
						type: event,
						batchNum : batchNum
					}, 
					args ] );
				}
			}
		},
		// which batch of events this is for, might not want to send multiple
		// messages on the same batch.  This is mostly for 
		// event delegation
		batchNum = 1,
		// sends all pending events
		sendCollection = function() {
			var items = collecting.slice(0);
			collecting = undefined;
			batchNum++;
			can.each(items, function( i, item) {
				can.trigger.apply(can, item)
			})
			
		},
		// a helper used to serialize an Observe or Observe.List where:
		// observe - the observable
		// how - to serialize with 'attr' or 'serialize'
		// where - to put properties, in a {} or [].
		serialize = function( observe, how, where ) {
			// go through each property
			observe.each(function( name, val ) {
				// if the value is an object, and has a attrs or serialize function
				where[name] = canMakeObserve(val) && can.isFunction( val[how] ) ?
				// call attrs or serialize to get the original data back
				val[how]() :
				// otherwise return the value
				val
			})
			return where;
		},
		$method = function( name ) {
			return function() {
				return can[name].apply(this, arguments );
			}
		},
		bind = $method('addEvent'),
		unbind = $method('removeEvent'),
		attrParts = function(attr){
			return can.isArray(attr) ? attr : (""+attr).split(".")
		};
	/**
	 * @add can.Observe
	 */
	var Observe = can.Construct('can.Observe', {
		// keep so it can be overwritten
		setup : function(){
			can.Construct.setup.apply(this, arguments)
		},
		bind : bind,
		unbind: unbind,
		id: "id"
	},
	/**
	 * @prototype
	 */
	{
		setup: function( obj ) {
			// _data is where we keep the properties
			this._data = {};
			// the namespace this object uses to listen to events
			this._namespace = ".observe" + (++observeId);
			// sets all attrs
			this._init = 1;
			this.attr(obj);
			delete this._init;
		},
		/**
		 * Get or set an attribute or attributes on the observe.
		 * 
		 *     o = new can.Observe({});
		 *     
		 *     // sets a user property
		 *     o.attr('user',{name: 'hank'})
		 *     
		 *     // read the user's name
		 *     o.attr('user.name') //-> 'hank'
		 * 
		 *     // merge multiple properties
		 *     o.attr({
		 *        grade : "A"
		 *     })
		 * 
		 *     // get properties
		 *     o.attr()           //-> {user: {name: 'hank'}, grade: "A"}
		 * 
		 *     // set multiple properties and remove absent attrs
		 *     o.attr({foo: 'bar'}, true)
		 * 
		 *     o.attr()           //-> {foo: 'bar'}
		 * 
		 * ## Setting Properties
		 * 
		 * `attr( PROPERTY, VALUE )` sets the observable's PROPERTY to VALUE.  For example:
		 * 
		 *     o = new can.Observe({});
		 *     o.attr('user',"Justin");
		 * 
		 * This call to attr fires two events on __o__ immediately after the value is set, the first is a "change" event that can be 
		 * listened to like:
		 * 
		 *     o.bind('change', function(ev, attr, how, newVal, oldVal){})
		 * 
		 * where:
		 * 
		 *  - ev - the "change" event
		 *  - attr - the name of the attribute changed: `"user"`
		 *  - how - how the attribute was changed: `"add"` because the property was set for the first time
		 *  - newVal - the new value of the property: `"Justin"`
		 *  - oldVal - the old value of the property: `undefined`
		 * 
		 * "change" events are the generic event that gets fired on all changes to an 
		 * observe's properties. The second event shares the name of the property being changed
		 * and can be bound to like:
		 * 
		 *     o.bind('name', function(ev, newVal, oldVal){});
		 * 
		 * where:
		 * 
		 *   - ev - the "name" event
		 *   - newVal - the new value of the name property: `'Justin'`
		 *   - oldVal - the old value of the name property: `undefined`
		 * 
		 * `attr( PROPERTY, VALUE )` allows setting of deep properties like:
		 * 
		 *      o = new can.Observe({person: {name: {first: "Just"}}});
		 *      o.attr('person.name.first',"Justin");
		 * 
		 *  All property names should be seperated with a __"."__.
		 * 
		 * `attr( PROPERTIES )` sets multiple properties at once and removes
		 * properties not in `PROPERTIES`.  For example:
		 * 
		 *     o = new can.Observe({first: "Just", middle: "B"})
		 *     o.attr({
		 *       first : "Justin",
		 *       last : "Meyer"
		 *     })
		 * 
		 * This results in an object that looks like:
		 * 
		 *     { first: "Justin", last: "Meyer" }
		 * 
		 * Notice that the `middle` property is removed.  This results in
		 * 3 change events (and the corresponding property-named events) that
		 * are triggered after all properties have been set:
		 * 
		 * <table>
		 *   <tr><th>attr</th><th>how</th><th>newVal</th><th>oldVal</th></tr>
		 *   <tr>
		 * 	   <td>"first"</td><td>"set"</td><td>"Justin"</td><td>"Just"</td>
		 *   </tr>
		 *   <tr>
		 * 	   <td>"last"</td><td>"add"</td><td>"Meyer"</td><td>undefined</td>
		 *   </tr>
		 *   <tr>
		 * 	   <td>"middle"</td><td>"remove"</td><td>undefined</td><td>"B"</td>
		 *   </tr>
		 * </table>
		 * 
		 * `attr( PROPERTIES , true )` merges properties into existing 
		 * properties. For example:
		 * 
		 *     o = new can.Observe({first: "Just", middle: "B"})
		 *     o.attr({
		 *       first : "Justin",
		 *       last : "Meyer"
		 *     })
		 * 
		 * This results in an object that looks like:
		 * 
		 *     { first: "Justin", middle: "B", last: "Meyer" }
		 * 
		 * and results in 2 change events (and the corresponding 
		 * property-named events):
		 * 
		 * <table>
		 *   <tr><th>attr</th><th>how</th><th>newVal</th><th>oldVal</th></tr>
		 *   <tr>
		 * 	   <td>"first"</td><td>"set"</td><td>"Justin"</td><td>"Just"</td>
		 *   </tr>
		 *   <tr>
		 * 	   <td>"last"</td><td>"add"</td><td>"Meyer"</td><td>undefined</td>
		 *   </tr>
		 * </table>
		 * 
		 * Use [can.Observe::removeAttr removeAttr] to remove an attribute.
		 * 
		 * ## Reading Properties
		 * 
		 * `attr( PROPERTY )` returns a property value.  For example:
		 * 
		 *     o = new can.Observe({ first: "Justin" })
		 *     o.attr('first') //-> "Justin"
		 * 
		 * You can also read properties that don't conflict with Observe's inherited
		 * methods direclty like:
		 * 
		 *     o.first //-> "Justin"
		 * 
		 * `attr( PROPERTY )` can read nested properties like:
		 * 
		 *      o = new can.Observe({person: {name: {first: "Justin"}}});
		 *      o.attr('person.name.first') //-> "Justin"
		 * 
		 * If `attr( PROPERTY )` returns an object or an array, it returns
		 * the Observe wrapped object or array. For example:
		 * 
		 *      o = new can.Observe({person: {name: {first: "Justin"}}});
		 *      o.attr('person').attr('name.first') //-> "Justin"
		 * 
		 * 
		 * `attr()` returns all properties in the observe, for example:
		 * 
		 *     o = new can.Observe({ first: "Justin" })
		 *     o.attr() //-> { first: "Justin" }
		 * 
		 * If the observe has nested objects, `attr()` returns the 
		 * data as plain JS objects, not as observes.  Example:
		 * 
		 *      o = new can.Observe({person: {name: {first: "Justin"}}});
		 *      o.attr() //-> {person: {name: {first: "Justin"}}}
		 * 
		 * @param {String} attr the attribute to read or write.
		 * 
		 *     o.attr('name') //-> reads the name
		 *     o.attr('name', 'Justin') //-> writes the name
		 *     
		 * You can read or write deep property names.  For example:
		 * 
		 *     o.attr('person', {name: 'Justin'})
		 *     o.attr('person.name') //-> 'Justin'
		 * 
		 * @param {Object} [val] if provided, sets the value.
		 * @return {Object} the observable or the attribute property.
		 * 
		 * If you are reading, the property value is returned:
		 * 
		 *     o.attr('name') //-> Justin
		 *     
		 * If you are writing, the observe is returned for chaining:
		 * 
		 *     o.attr('name',"Brian").attr('name') //-> Justin
		 */
		attr: function( attr, val ) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a number or a string
			if ( !~ "ns".indexOf((typeof attr).charAt(0))) {
				return this._attrs(attr, val)
			} else if ( val === undefined ) {// if we are getting a value
				// let people know we are reading (
				Observe.__reading && Observe.__reading(this, attr)
				return this._get(attr)
			} else {
				// otherwise we are setting
				this._set(attr, val);
				return this;
			}
		},
		/**
		 * Iterates through each attribute, calling handler 
		 * with each attribute name and value.
		 * 
		 *     new Observe({foo: 'bar'})
		 *       .each(function(name, value){
		 *         equals(name, 'foo')
		 *         equals(value,'bar')
		 *       })
		 * 
		 * @param {function} handler(attrName,value) A function that will get 
		 * called back with the name and value of each attribute on the observe.
		 * 
		 * Returning `false` breaks the looping.  The following will never
		 * log 3:
		 * 
		 *     new Observe({a : 1, b : 2, c: 3})
		 *       .each(function(name, value){
		 *         console.log(value)
		 *         if(name == 2){
		 *           return false;
		 *         }
		 *       })
		 * 
		 * @return {can.Observe} the original observable.
		 */
		each: function() {
			return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
		},
		/**
		 * Removes a property by name from an observe.
		 * 
		 *     o =  new can.Observe({foo: 'bar'});
		 *     o.removeAttr('foo'); //-> 'bar'
		 * 
		 * This creates a `'remove'` change event. Learn more about events
		 * in [can.Observe.prototype.bind bind] and [can.Observe.prototype.delegate delegate].
		 * 
		 * @param {String} attr the attribute name to remove.
		 * @return {Object} the value that was removed.
		 */
		removeAttr: function( attr ) {
			// convert the attr into parts (if nested)
			var parts = attrParts(attr),
				// the actual property to remove
				prop = parts.shift(),
				// the current value
				current = this._data[prop];

			// if we have more parts, call removeAttr on that part
			if ( parts.length ) {
				return current.removeAttr(parts)
			} else {
				// otherwise, delete
				delete this._data[prop];
				// create the event
				if (!(prop in this.constructor.prototype)) {
					delete this[prop]
				}
				batchTrigger(this, "change", [prop, "remove", undefined, current]);
				batchTrigger(this, prop, undefined, current);
				return current;
			}
		},
		// reads a property from the object
		_get: function( attr ) {
			var parts = attrParts(attr),
				current = this.__get(parts.shift());
			return parts.length ? current ? current._get(parts) : undefined : current;
		},
		// reads a property directly if an attr is provided, otherwise
		// returns the 'real' data object itself
		__get: function( attr ) {
			return attr ? this._data[attr] : this._data;
		},
		// sets attr prop as value on this object where
		// attr - is a string of properties or an array  of property values
		// value - the raw value to set
		// description - an object with converters / attrs / defaults / getterSetters ?
		_set: function( attr, value ) {
			// convert attr to attr parts (if it isn't already)
			var parts = attrParts(attr),
				// the immediate prop we are setting
				prop = parts.shift(),
				// its current value
				current = this.__get(prop);

			// if we have an object and remaining parts
			if ( canMakeObserve(current) && parts.length ) {
				// that object should set it (this might need to call attr)
				current._set(parts, value)
			} else if (!parts.length ) {
				// we're in 'real' set territory
				if(this.__convert){
					value = this.__convert(prop, value)
				}
				this.__set(prop, value, current)
				
			} else {
				throw "can.Observe: Object does not exist"
			}
		},
		__set : function(prop, value, current){
			
			// otherwise, we are setting it on this object
			// todo: check if value is object and transform
			// are we changing the value
			if ( value !== current ) {

				// check if we are adding this for the first time
				// if we are, we need to create an 'add' event
				var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

				// set the value on data
				this.___set(prop,
				// if we are getting an object
				canMakeObserve(value) ?
				// hook it up to send event to us
				hookupBubble(value, prop, this) :
				// value is normal
				value);

				// batchTrigger the change event
				batchTrigger(this, "change", [prop, changeType, value, current]);
				batchTrigger(this, prop, value, current);
				// if we can stop listening to our old value, do it
				current && unhookup([current], this._namespace);
			}

		},
		// directly sets a property on this object
		___set: function( prop, val ) {
			this._data[prop] = val;
			// add property directly for easy writing
			// check if its on the prototype so we don't overwrite methods like attrs
			if (!(prop in this.constructor.prototype)) {
				this[prop] = val
			}
		},
		/**
		 * @function bind
		 * `bind( eventType, handler )` Listens to changes on a can.Observe.
		 * 
		 * When attributes of an observe change, two types of events are produced
		 * 
		 *   - "change" events - a generic event so you can listen to any property changes
		 *   - ATTR_NAME events - bind to specific attribute changes
		 * 
		 * Example:
		 * 
		 *     o = new can.Observe({name : "Payal"});
		 *     o.bind('change', function(ev, attr, how, newVal, oldVal){
		 *       
		 *     }).bind('name', function(ev, newVal, oldVal){
		 *     	
		 *     })
		 *     
		 *     o.attr('name', 'Justin') 
		 * 
		 * ## Change Events
		 * 
		 * A `'change'` event is triggered on the observe.  These events come
		 * in three flavors:
		 * 
		 *   - `add` - a attribute is added
		 *   - `set` - an existing attribute's value is changed
		 *   - `remove` - an attribute is removed
		 * 
		 * The change event is fired with:
		 * 
		 *  - the attribute changed
		 *  - how it was changed
		 *  - the newValue of the attribute
		 *  - the oldValue of the attribute
		 * 
		 * Example:
		 * 
		 *     o = new can.Observe({name : "Payal"});
		 *     o.bind('change', function(ev, attr, how, newVal, oldVal){
		 *       // ev    -> {type: 'change'}
		 *       // attr  -> "name"
		 *       // how   -> "add"
		 *       // newVal-> "Justin"
		 *       // oldVal-> undefined 
		 *     })
		 *     
		 *     o.attr('name', 'Justin')
		 * 
		 * ## ATTR_NAME events
		 * 
		 * When a attribute value is changed, an event with the name of the attribute
		 * is triggered on the observable with the new value and old value as 
		 * parameters. For example:
		 * 
		 *     o = new can.Observe({name : "Payal"});
		 *     o.bind('name', function(ev, newVal, oldVal){
		 *       // ev    -> {type : "name"}
		 *       // newVal-> "Justin"
		 *       // oldVal-> undefined 
		 *     })
		 *     
		 *     o.attr('name', 'Justin')
		 * 
		 * 
		 * @param {String} eventType the event name.  Currently,
		 * only `'change'`  and `ATTR_NAME` events are supported. 
		 * 
		 * @param {Function} handler(event, attr, how, newVal, oldVal) A 
		 * callback function where
		 * 
		 *   - event - the event
		 *   - attr - the name of the attribute changed
		 *   - how - how the attribute was changed (add, set, remove)
		 *   - newVal - the new value of the attribute
		 *   - oldVal - the old value of the attribute
		 * 
		 * @return {can.Observe} the observe for chaining.
		 */
		bind: bind,
		/**
		 * @function unbind
		 * Unbinds an event listener.  This works similar to jQuery's unbind.  This means you can 
		 * use namespaces or unbind all event handlers for a given event:
		 * 
		 *     // unbind a specific event handler
		 *     o.unbind('change', handler)
		 *     
		 *     // unbind all change event handlers bound with the
		 *     // foo namespace
		 *     o.unbind('change.foo')
		 *     
		 *     // unbind all change event handlers
		 *     o.unbind('change')
		 * 
		 * @param {String} eventType - the type of event with
		 * any optional namespaces. 
		 * 
		 * @param {Function} [handler] - The original handler function passed
		 * to [can.Observe.prototype.bind bind].
		 * 
		 * @return {can.Observe} the original observe for chaining.
		 */
		unbind: unbind,
		/**
		 * @hide
		 * Get the serialized Object form of the observe.  Serialized
		 * data is typically used to send back to a server.
		 * 
		 *     o.serialize() //-> { name: 'Justin' }
		 *     
		 * Serialize currently returns the same data 
		 * as [can.Observe.prototype.attrs].  However, in future
		 * versions, serialize will be able to return serialized
		 * data similar to [can.Model].  The following will work:
		 * 
		 *     new Observe({time: new Date()})
		 *       .serialize() //-> { time: 1319666613663 }
		 * 
		 * @return {Object} a JavaScript Object that can be 
		 * serialized with `JSON.stringify` or other methods. 
		 * 
		 */
		serialize: function() {
			return serialize(this, 'serialize', {});
		},
		/**
		 * @hide
		 * Set multiple properties on the observable
		 * @param {Object} props
		 * @param {Boolean} remove true if you should remove properties that are not in props
		 */
		_attrs: function( props, remove ) {
			if ( props === undefined ) {
				return serialize(this, 'attr', {})
			}

			props = can.extend(true, {}, props);
			var prop, 
				collectingStarted = collect(),
				self = this,
				newVal;
			
			this.each(function(prop, curVal){
				newVal = props[prop];

				// if we are merging ...
				if ( newVal === undefined ) {
					remove && self.removeAttr(prop);
					return;
				}
				if ( canMakeObserve(curVal) && canMakeObserve(newVal) ) {
					curVal.attr(newVal, remove)
				} else if ( curVal != newVal ) {
					self._set(prop, newVal)
				} else {

				}
				delete props[prop];
			})
			// add remaining props
			for ( var prop in props ) {
				newVal = props[prop];
				this._set(prop, newVal)
			}
			if ( collectingStarted ) {
				sendCollection();
			}
			return this;
		}
	});
	// Helpers for list
	/**
	 * @class can.Observe.List
	 * @inherits can.Observe
	 * @parent index
	 * 
	 * Provides the observable pattern for JavaScript arrays.  It lets you:
	 * 
	 *   - change the structure of an array
	 *   - listen to changes in the array
	 * 
	 * ## Creating an observe list
	 * 
	 * To create an observable list, use `new can.Observe.List( ARRAY )` like:
	 * 
	 *     var hobbies = new can.Observe.List(['programming', 'basketball', 'nose picking'])
	 * 
	 * can.Observe.List inherits from [can.Observe], including it's 
	 * [can.Observe::bind bind], [can.Observe::each], and [can.Observe.unbind] 
	 * methods.
	 * 
	 * can.Observe.List is inherited by [can.Model.List].
	 * 
	 * ## Getting and Setting Properties
	 * 
	 * Similar to an array, use the index operator to access items of a list:
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list[1] //-> "b"
	 * 
	 * Or, use the `attr( PROPERTY )` method like:
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list.attr(1)  //-> "b"
	 * 
	 * Using the 'attr' method lets Observe know you accessed the 
	 * property. This is used by [can.EJS] for live-binding.
	 * 
	 * Get back a js Array with `attr()`:
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list.attr()  //-> ["a","b"]
	 * 
	 * Change the structure of the array with:
	 * 
	 *    - [can.Observe.List::attr attr]
	 *    - [can.Observe.List::pop pop]
	 *    - [can.Observe.List::push push]
	 *    - [can.Observe.List::shift shift]
	 *    - [can.Observe.List::unshift unshift]
	 *    - [can.Observe.List::splice splice]
	 * 
	 * ## Events
	 * 
	 * When an item is added, removed, or updated in a list, it triggers
	 * events that can be [can.Observe::bind bind]ed to for changes.
	 * 
	 * There are 5 types of events: add, remove, set, length, and change.
	 * 
	 * ### add events
	 * 
	 * Add events are fired when items are added to the list. Listen 
	 * to them like:
	 * 
	 *     list.bind("add", handler(ev, newVals, index) )
	 * 
	 * where:
	 * 
	 *  - `newVals` - the values added to the list
	 *  - `index` - where the items where added
	 * 
	 * ### remove events
	 * 
	 * Removes events are fired when items are removed from the list. Listen 
	 * to them like:
	 * 
	 *     list.bind("remove", handler(ev, oldVals, index) )
	 * 
	 * where:
	 * 
	 *   - `oldVals` - the values removed from the list
	 *   - `index` - where the items where removed
	 * 
	 * ### set events
	 * 
	 * Set events happen when an item in the list is updated. Listen to 
	 * these events with:
	 * 
	 *     list.bind("set", handler(ev, newVal, index) )
	 * 
	 * where:
	 * 
	 *   - `newVal` - the new value at index
	 *   - `index` - where the items where removed
	 * 
	 * ### length events
	 * 
	 * Anytime the length is changed a length attribute event is
	 * fired.
	 * 
	 *     list.bind("length", handler(ev, length) )
	 * 
	 * where:
	 * 
	 * - `length` - the new length of the array.
	 * 
	 * ### change events
	 * 
	 * Change events are fired when any type of change 
	 * happens on the array.  They get called with:
	 * 
	 *     .bind("change", handler(ev, attr, how, newVal, oldVal) )
	 * 
	 * Where:
	 * 
	 *   - `attr` - the index of the item changed
	 *   - `how` - how the item was changed (add, remove, set)
	 *   - `newVal` - For set, a single item. For add events, an array 
	 *     of items. For remove event, undefined.
	 *   - `oldVal` - the old values at `attr`.
	 * 
	 * @constructor
	 * 
	 * @param {Array} [items...] the array of items to create the list with
	 */
	var splice = [].splice,
		list = Observe('can.Observe.List',
	/**
	 * @prototype
	 */
	{
		setup: function( instances, options ) {
			this.length = 0;
			this._namespace = ".observe" + (++observeId);
			this._init = 1;
			this.bind('change',can.proxy(this._changes,this));
			this.push.apply(this, can.makeArray(instances || []));
			can.extend(this, options);
			//if(this.comparator){
			//	this.sort()
			//}
			delete this._init;
		},
		_changes : function(ev, attr, how, newVal, oldVal){
			// detects an add, sorts it, re-adds?			
			
			// if we are sorting, and an attribute inside us changed
			/*if(this.comparator && /^\d+./.test(attr) ) {
				
				// get the index
				var index = +/^\d+/.exec(attr)[0],
					// and item
					item = this[index],
					// and the new item
					newIndex = this.sortedIndex(item);
				
				if(newIndex !== index){
					// move ...
					splice.call(this, index, 1);
					splice.call(this, newIndex, 0, item);
					
					batchTrigger(this, "move", [item, newIndex, index]);
					ev.stopImmediatePropagation();
					batchTrigger(this,"change", [
						attr.replace(/^\d+/,newIndex),
						how,
						newVal,
						oldVal
					]);
					return;
				}
			}*/
			
			// if we add items, we need to handle 
			// sorting and such
			
			// batchTrigger direct add and remove events ...
			if ( !~ attr.indexOf('.')){
				
				if( how === 'add' ) {
					batchTrigger(this, how, [newVal,+attr]);
					batchTrigger(this,'length',[this.length]);
				} else if( how === 'remove' ) {
					batchTrigger(this, how, [oldVal, +attr]);
					batchTrigger(this,'length',[this.length]);
				} else {
					batchTrigger(this,how,[newVal, +attr])
				}
				
			}
			// issue add, remove, and move events ...
		},
		/**
		 * @hide
		   sortedIndex : function(item){
			var itemCompare = item.attr(this.comparator),
				equaled = 0,
				i;
			for(var i =0; i < this.length; i++){
				if(item === this[i]){
					equaled = -1;
					continue;
				}
				if(itemCompare <= this[i].attr(this.comparator) ) {
					return i+equaled;
				}
			}
			return i+equaled;
		},*/
		__get : function(attr){
			return attr ? this[attr] : this;
		},
		___set : function(attr, val){
			this[attr] = val;
		},
		/**
		 * @hide
		 * Returns the serialized form of this list.
		 */
		serialize: function() {
			return serialize(this, 'serialize', []);
		},
		/**
		 * Iterates through each item of the list, calling handler 
		 * with each index and value.
		 * 
		 *     new Observe.List(['a'])
		 *       .each(function(index, value){
		 *         equals(index, 1)
		 *         equals(value,'a')
		 *       })
		 * 
		 * @param {function} handler(index,value) A function that will get 
		 * called back with the index and value of each item on the list.
		 * 
		 * Returning `false` breaks the looping.  The following will never
		 * log 'c':
		 * 
		 *     new Observe(['a','b','c'])
		 *       .each(function(index, value){
		 *         console.log(value)
		 *         if(index == 1){
		 *           return false;
		 *         }
		 *       })
		 * 
		 * @return {can.Observe.List} the original observable.
		 */
		// placeholder for each
		/**
		 * `splice(index, [ howMany, elements... ] )` remove or add items 
		 * from a specific point in the list.
		 * 
		 * ### Example
		 * 
		 * The following creates a list of numbers and replaces 2 and 3 with
		 * "a", and "b".
		 * 
		 *     var l = new can.Observe.List([0,1,2,3]);
		 *     
		 *     l.splice(1,2, "a", "b"); // results in [0,"a","b",3]
		 *     
		 * This creates 2 change events.  The first event is the removal of 
		 * numbers one and two where it's callback is 
		 * `bind('change', function( ev, attr, how, newVals, oldVals, where ) )`
		 * and it's values are:
		 * 
		 *   - attr - "1" - indicates where the remove event took place
		 *   - how - "remove"
		 *   - newVals - undefined
		 *   - oldVals - [1,2] -the array of removed values
		 *   - where - 1 - the location of where these items where removed
		 * 
		 * The second change event is the addition of the "a", and "b" values where 
		 * the callback values will be:
		 * 
		 *   - attr - "1" - indicates where the add event took place
		 *   - how - "added"
		 *   - newVals - ["a","b"]
		 *   - oldVals - [1, 2] - the array of removed values
		 *   - where - 1 - the location of where these items where added
		 * 
		 * @param {Number} index where to start removing or adding items
		 * @param {Object} [howMany=0] the number of items to remove
		 * @param {Object} [elements...] items to add to the array
		 */
		splice: function( index, howMany ) {
			var args = can.makeArray(arguments),
				i;

			for ( i = 2; i < args.length; i++ ) {
				var val = args[i];
				if ( canMakeObserve(val) ) {
					args[i] = hookupBubble(val, "*", this)
				}
			}
			if ( howMany === undefined ) {
				howMany = args[1] = this.length - index;
			}
			var removed = splice.apply(this, args);
			if ( howMany > 0 ) {
				batchTrigger(this, "change", [""+index, "remove", undefined, removed]);
				unhookup(removed, this._namespace);
			}
			if ( args.length > 2 ) {
				batchTrigger(this, "change", [""+index, "add", args.slice(2), removed]);
			}
			return removed;
		},
		/**
		 * @function attr
		 * Gets or sets an item or items in the observe list.  Examples:
		 * 
		 *     list = new can.Observe.List(["a","b","c"]);
		 *      
		 *     // sets an array item
		 *     list.attr(3,'d')
		 *     
		 *     // read an array's item
		 *     list.attr(3) //-> 'd'
		 * 
		 *     // merge array's properties
		 *     list.attr( ["b","BOO"] )
		 * 
		 *     // get properties
		 *     o.attr()           //-> ["b","BOO","c","d"]
		 *     
		 *     // set array
		 *     o.attr(["item"])
		 *     o.attr() //-> ["item"]
		 * 
		 * ## Setting Properties
		 * 
		 * `attr( array , true )` updates the list to look like array.  For example:
		 * 
		 *     list = new can.Observe.List(["a","b","c"])
		 *     list.attr(["foo"], true)
		 *     
		 *     list.attr() //-> ["foo"]
		 * 
		 * 
		 * When the array is changed, it produces events that detail the changes
		 * in the list. They are listed in the
		 * order they are produced for the above example:
		 * 
		 *   1. `.bind( "change", handler(ev, attr, how, newVal, oldVal) )` where:
		 *       
		 *      - ev = {type: "change"}
		 *      - attr = "0"
		 *      - how = "set"
		 *      - newVal = "foo"
		 *      - oldVal = "a"
		 * 
		 *   2. `.bind( "set", handler(ev, newVal, index) )` where:
		 *       
		 *      - ev = {type: "set"}
		 *      - newVal = "foo"
		 *      - index = 0
		 * 
		 *   3. `.bind( "change", handler(ev, attr, how, newVal, oldVal) )` where:
		 *       
		 *      - ev = {type: "change"}
		 *      - attr = "1"
		 *      - how = "remove"
		 *      - newVal = undefined
		 *      - oldVal = ["b","c"]
		 * 
		 *   4. `.bind( "remove", handler(ev, newVal, index) )` where:
		 *       
		 *      - ev = {type: "remove"}
		 *      - newVal = undefined
		 *      - index = 1
		 * 
		 *   5. `.bind( "length", handler(ev, length) )` where:
		 *       
		 *      - ev = {type: "length"}
		 *      - length = 1
		 * 
		 * In general, it is possible to listen to events and reproduce the
		 * changes in a facsimile of the list.  This is useful for implementing 
		 * high-performance widgets that need to reflect the contents of the list without
		 * redrawing the entire list.  Here's an example of how that would look:
		 * 
		 *     list.bind("set", function(ev, newVal, index){
		 * 	     // update the item at index with newVal
		 *     }).bind("remove", function(ev, oldVals, index){
		 * 	     // remove oldVals.length items at index
		 *     }).bind("add", function(ev, newVals, index){
		 *       // insert newVals at index
		 *     })
		 * 
		 * `attr( array )` merges items into the beginning of the array.  For example:
		 * 
		 *     list = new can.Observe.List(["a","b"])
		 *     list.attr(["foo"])
		 *     
		 *     list.attr() //-> ["foo","b"]
		 * 
		 * `attr( INDEX, VALUE )` sets or updates an item at `INDEX`.  Example:
		 * 
		 *     list.attr(0, "ITEM")
		 * 
		 * ## Reading Properties
		 * 
		 * `attr()` returns the lists content as an array.  For example:
		 * 
		 *      list = new can.Observe.List(["a", {foo: "bar"}])
		 *      list.attr()  //-> ["a", {foo: "bar"}]
		 * 
		 * `attr( INDEX )` reads a property at `INDEX` like:
		 * 
		 *      list = new can.Observe.List(["a", {foo: "bar"}])
		 *      list.attr(0)  //-> "a",
		 * 
		 * @param {Array|Number} props
		 * @param {Boolean|Object} {optional:remove} 
		 * @return {list|Array} returns the props on a read or the observe
		 * list on a write.
		 */
		_attrs: function( props, remove ) {
			if ( props === undefined ) {
				return serialize(this, 'attr', []);
			}

			// copy
			props = props.slice(0);

			var len = Math.min(props.length, this.length),
				collectingStarted = collect(),
				prop;

			for ( var prop = 0; prop < len; prop++ ) {
				var curVal = this[prop],
					newVal = props[prop];

				if ( canMakeObserve(curVal) && canMakeObserve(newVal) ) {
					curVal.attr(newVal, remove)
				} else if ( curVal != newVal ) {
					this._set(prop, newVal)
				} else {

				}
			}
			if ( props.length > this.length ) {
				// add in the remaining props
				this.push(props.slice(this.length))
			} else if ( props.length < this.length && remove ) {
				this.splice(props.length)
			}
			//remove those props didn't get too
			if ( collectingStarted ) {
				sendCollection()
			}
		}
	}),


		// create push, pop, shift, and unshift
		// converts to an array of arguments 
		getArgs = function( args ) {
			return args[0] && can.isArray(args[0]) ?
				args[0] :
				can.makeArray(args);
		};
	// describes the method and where items should be added
	can.each({
		/**
		 * @function push
		 * Add items to the end of the list.
		 * 
		 *     var l = new can.Observe.List([]);
		 *     
		 *     l.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used 
		 *         how,       // "add"
		 *         newVals,   // an array of new values pushed
		 *         oldVals,   // undefined
		 *         where      // the location where these items where added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     l.push('0','1','2');
		 * 
		 * @return {Number} the number of items in the array
		 */
		push: "length",
		/**
		 * @function unshift
		 * Add items to the start of the list.  This is very similar to
		 * [can.Observe.List::push].  Example:
		 * 
		 *     var l = new can.Observe.List(["a","b"]);
		 *     l.unshift(1,2,3) //-> 5
		 *     l.attr() //-> [1,2,3,"a","b"]
		 * 
		 * @param {Object} [items...] items to add to the start of the list.
		 * @return {Number} the length of the array.
		 */
		unshift: 0
	},
	// adds a method where
	// - name - method name
	// - where - where items in the array should be added


	function( name, where ) {
		list.prototype[name] = function() {
			// get the items being added
			var args = getArgs(arguments),
				// where we are going to add items
				len = where ? this.length : 0;

			// go through and convert anything to an observe that needs to be converted
			for ( var i = 0; i < args.length; i++ ) {
				var val = args[i];
				if ( canMakeObserve(val) ) {
					args[i] = hookupBubble(val, "*", this)
				}
			}
			
			// if we have a sort item, add that
			if( args.length == 1 && this.comparator ) {
				// add each item ...
				// we could make this check if we are already adding in order
				// but that would be confusing ...
				var index = this.sortedIndex(args[0]);
				this.splice(index, 0, args[0]);
				return this.length;
			}
			
			// call the original method
			var res = [][name].apply(this, args)
			
			// cause the change where the args are:
			// len - where the additions happened
			// add - items added
			// args - the items added
			// undefined - the old value
			if ( this.comparator  && args.length > 1) {
				this.sort(null, true);
				batchTrigger(this,"reset", [args])
			} else {
				batchTrigger(this, "change", [""+len, "add", args, undefined])
			}
			

			return res;
		}
	});

	can.each({
		/**
		 * @function pop
		 * 
		 * Removes an item from the end of the list. Example:
		 * 
		 *     var l = new can.Observe.List([0,1,2]);
		 *     l.pop() //-> 2;
		 * 
		 * This produces a change event like
		 * 
		 *     l.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used 
		 *         how,       // "remove"
		 *         newVals,   // undefined
		 *         oldVals,   // 2
		 *         where      // the location where these items where added
		 *         ) {
		 *     
		 *     })
		 * 
		 * @return {Object} the element at the end of the list or undefined if the
		 * list is empty.
		 */
		pop: "length",
		/**
		 * @function shift
		 * Removes an item from the start of the list.  This is very similar to
		 * [can.Observe.List::pop]. Example:
		 * 
		 *     var l = new can.Observe.List([0,1,2]);
		 *     l.shift() //-> 0;
		 * 
		 * @return {Object} the element at the start of the list
		 */
		shift: 0
	},
	// creates a 'remove' type method


	function( name, where ) {
		list.prototype[name] = function() {
			
			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;


			var res = [][name].apply(this, args)

			// create a change where the args are
			// "*" - change on potentially multiple properties
			// "remove" - items removed
			// undefined - the new values (there are none)
			// res - the old, removed values (should these be unbound)
			// len - where these items were removed
			batchTrigger(this, "change", [""+len, "remove", undefined, [res]])

			if ( res && res.unbind ) {
				res.unbind("change" + this._namespace)
			}
			return res;
		}
	});
	
	list.prototype.
	/**
	 * @function indexOf
	 * Returns the position of the item in the array.  Returns -1 if the
	 * item is not in the array.  Examples:
	 * 
	 *     list = new can.Observe.List(["a","b","c"]);
	 *     list.indexOf("b") //-> 1
	 *     list.indexOf("f") //-> -1
	 * 
	 * @param {Object} item the item to look for
	 * @return {Number} the index of the object in the array or -1.
	 */
	indexOf = [].indexOf || function(item){
		return can.inArray(item, this)
	};
;

	
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g,
		paramTest = /([^?#]*)(#.*)?$/,
		prep = function( str ) {
			return decodeURIComponent( str.replace(/\+/g, " ") );
		}
	
	/**
	 * @add can
	 */
	can.extend(can, { 
		
		/**
		 * @function deparam
		 * 
		 * Takes a string of name value pairs and returns a Object literal that represents those params.
		 * 
		 * @param {String} params a string like <code>"foo=bar&person[age]=3"</code>
		 * @return {Object} A JavaScript Object that represents the params:
		 * 
		 *     {
		 *       foo: "bar",
		 *       person: {
		 *         age: "3"
		 *       }
		 *     }
		 */
		deparam: function(params){
		
			var data = {},
				pairs;

			if ( params && paramTest.test( params )) {
				
				pairs = params.split('&'),
				
				can.each( pairs, function( i, pair ) {

					var parts = pair.split('='),
						key   = prep( parts.shift() ),
						value = prep( parts.join("=") );

					current = data;
					parts = key.match(keyBreaker);
			
					for ( var j = 0, l = parts.length - 1; j < l; j++ ) {
						if (!current[parts[j]] ) {
							// if what we are pointing to looks like an array
							current[parts[j]] = digitTest.test(parts[j+1]) || parts[j+1] == "[]" ? [] : {}
						}
						current = current[parts[j]];
					}
					lastPart = parts.pop()
					if ( lastPart == "[]" ) {
						current.push(value)
					}else{
						current[lastPart] = value;
					}
				});
			}
			return data;
		}
	});
	
;


    // Helper methods used for matching routes.
	var 
		// RegEx used to match route variables of the type ':name'.
        // Any word character or a period is matched.
        matcher = /\:([\w\.]+)/g,
        // Regular expression for identifying &amp;key=value lists.
        paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
        // Converts a JS Object into a list of parameters that can be 
        // inserted into an html element tag.
		makeProps = function( props ) {
			return can.map(props, function( val, name ) {
				return ( name === 'className' ? 'class'  : name )+ '="' + can.esc(val) + '"';
			}).join(" ");
		},
		// Checks if a route matches the data provided. If any route variable
        // is not present in the data the route does not match. If all route
        // variables are present in the data the number of matches is returned 
        // to allow discerning between general and more specific routes. 
		matchesData = function(route, data) {
			var count = 0, i = 0;
			for (; i < route.names.length; i++ ) {
				if (!data.hasOwnProperty(route.names[i]) ) {
					return -1;
				}
				count++;
			}
			return count;
		},
        // 
		onready = !0,
		location = window.location,
		each = can.each,
		extend = can.extend;

	/**
	 * @class can.route
	 * @inherits can.Observe
	 * @plugin can/route
	 * @parent index
	 * 
	 * can.route helps manage browser history (and
	 * client state) by
	 * synchronizing the window.location.hash with
	 * an [can.Control].
	 * 
	 * ## Background Information
	 * 
	 * To support the browser's back button and bookmarking
	 * in an Ajax application, most applications use
	 * the <code>window.location.hash</code>.  By
	 * changing the hash (via a link or JavaScript), 
	 * one is able to add to the browser's history 
	 * without changing the page.  The [jQuery.event.special.hashchange event] allows
	 * you to listen to when the hash is changed.
	 * 
	 * Combined, this provides the basics needed to
	 * create history enabled Ajax websites.  However,
	 * jQuery.Route addresses several other needs such as:
	 * 
	 *   - Pretty Routes
	 *   - Keeping routes independent of application code
	 *   - Listening to specific parts of the history changing
	 *   - Setup / Teardown of widgets.
	 * 
	 * ## How it works
	 * 
	 * <code>can.route</code> is a [can.Control can.Observe] that represents the
	 * <code>window.location.hash</code> as an 
	 * object.  For example, if the hash looks like:
	 * 
	 *     #!type=videos&id=5
	 *     
	 * the data in <code>can.route</code> would look like:
	 * 
	 *     { type: 'videos', id: 5 }
	 * 
	 * 
	 * can.route keeps the state of the hash in-sync with the data in
	 * can.route.
	 * 
	 * ## can.Observe
	 * 
	 * can.route is a [can.Control can.Observe]. Understanding
	 * can.Observe is essential for using can.route correctly.
	 * 
	 * You can
	 * listen to changes in an Observe with bind and
	 * delegate and change can.route's properties with 
	 * attr and attrs.
	 * 
	 * ### Listening to changes in an Observable
	 * 
	 * Listen to changes in history 
	 * by [can.Control.prototype.bind bind]ing to
	 * changes in <code>can.route</code> like:
	 * 
	 *     can.route.bind('change', function(ev, attr, how, newVal, oldVal) {
	 *     
	 *     })
	 * 
     *  - attr - the name of the changed attribute
     *  - how - the type of Observe change event (add, set or remove)
     *  - newVal/oldVal - the new and old values of the attribute
     * 
	 * You can also listen to specific changes 
	 * with [can.Control.prototype.delegate delegate]:
	 * 
	 *     can.route.delegate('id','change', function(){ ... })
	 * 
	 * Observe lets you listen to the following events:
	 * 
	 *  - change - any change to the object
	 *  - add - a property is added
	 *  - set - a property value is added or changed
	 *  - remove - a property is removed
	 * 
	 * Listening for <code>add</code> is useful for widget setup
	 * behavior, <code>remove</code> is useful for teardown.
	 * 
	 * ### Updating an observable
	 * 
	 * Create changes in the route data like:
	 * 
	 *     can.route.attr('type','images');
	 * 
	 * Or change multiple properties at once with
	 * [can.Control.prototype.attrs attrs]:
	 * 
	 *     can.route.attr({type: 'pages', id: 5}, true)
	 * 
	 * When you make changes to can.route, they will automatically
	 * change the <code>hash</code>.
	 * 
	 * ## Creating a Route
	 * 
	 * Use <code>can.route(url, defaults)</code> to create a 
	 * route. A route is a mapping from a url to 
	 * an object (that is the can.route's state).
	 * 
	 * If no routes are added, or no route is matched, 
	 * can.route's data is updated with the [jQuery.String.deparam deparamed]
	 * hash.
	 * 
	 *     location.hash = "#!type=videos";
	 *     // can.route -> {type : "videos"}
	 *     
	 * Once routes are added and the hash changes,
	 * can.route looks for matching routes and uses them
	 * to update can.route's data.
	 * 
	 *     can.route( "content/:type" );
	 *     location.hash = "#!content/images";
	 *     // can.route -> {type : "images"}
	 *     
	 * Default values can also be added:
	 * 
	 *     can.route("content/:type",{type: "videos" });
	 *     location.hash = "#!content/"
	 *     // can.route -> {type : "videos"}
	 *     
	 * ## Delay setting can.route
	 * 
	 * By default, <code>can.route</code> sets its initial data
	 * on document ready.  Sometimes, you want to wait to set 
	 * this data.  To wait, call:
	 * 
	 *     can.route.ready(false);
	 * 
	 * and when ready, call:
	 * 
	 *     can.route.ready(true);
	 * 
	 * ## Changing the route.
	 * 
	 * Typically, you never want to set <code>location.hash</code>
	 * directly.  Instead, you can change properties on <code>can.route</code>
	 * like:
	 * 
	 *     can.route.attr('type', 'videos')
	 *     
	 * This will automatically look up the appropriate 
	 * route and update the hash.
	 * 
	 * Often, you want to create links.  <code>can.route</code> provides
	 * the [jQuery.route.link] and [jQuery.route.url] helpers to make this 
	 * easy:
	 * 
	 *     can.route.link("Videos", {type: 'videos'})
	 * 
	 * @param {String} url the fragment identifier to match.  
	 * @param {Object} [defaults] an object of default values
	 * @return {jQuery.route}
	 */
	can.route = function( url, defaults ) {
        // Extract the variable names and replace with regEx that will match an atual URL with values.
		var names = [],
			test = url.replace(matcher, function( whole, name ) {
				names.push(name)
				// TODO: I think this should have a +
				return "([^\\/\\&]*)"  // The '\\' is for string-escaping giving single '\' for regEx escaping
			});

		// Add route in a form that can be easily figured out
		can.route.routes[url] = {
            // A regular expression that will match the route when variable values 
            // are present; i.e. for :page/:type the regEx is /([\w\.]*)/([\w\.]*)/ which
            // will match for any value of :page and :type (word chars or period).
			test: new RegExp("^" + test+"($|&)"),
            // The original URL, same as the index for this entry in routes.
			route: url,
            // An array of all the variable names in this route
			names: names,
            // Default values provided for the variables.
			defaults: defaults || {},
            // The number of parts in the URL separated by '/'.
			length: url.split('/').length
		}
		return can.route;
	};

	extend(can.route, {
		/**
		 * Parameterizes the raw JS object representation provided in data.
		 * If a route matching the provided data is found that URL is built
         * from the data. Any remaining data is added at the end of the
         * URL as &amp; separated key/value parameters.
		 * 
		 * @param {Object} data
         * @return {String} The route URL and &amp; separated parameters.
		 */
		param: function( data ) {
			delete data.route;
			// Check if the provided data keys match the names in any routes;
			// get the one with the most matches.
			var route,
				// need it to be at least 1 match
				matches = 0,
				matchCount,
				routeName = data.route;
			
			// if we have a route name in our can.route data, use it
			if ( ! ( routeName && (route = can.route.routes[routeName]))){
				// otherwise find route
				each(can.route.routes, function(name, temp){
					matchCount = matchesData(temp, data);
					if ( matchCount > matches ) {
						route = temp;
						matches = matchCount
					}
				});
			}

			// if this is match
			if ( route ) {
				var cpy = extend({}, data),
                    // Create the url by replacing the var names with the provided data.
                    // If the default value is found an empty string is inserted.
				    res = route.route.replace(matcher, function( whole, name ) {
                        delete cpy[name];
                        return data[name] === route.defaults[name] ? "" : encodeURIComponent( data[name] );
                    }),
                    after;
					// remove matching default values
					each(route.defaults, function(name,val){
						if(cpy[name] === val) {
							delete cpy[name]
						}
					})
					
					// The remaining elements of data are added as 
					// $amp; separated parameters to the url.
				    after = can.param(cpy);
				return res + (after ? "&" + after : "")
			}
            // If no route was found there is no hash URL, only paramters.
			return can.isEmptyObject(data) ? "" : "&" + can.param(data);
		},
		/**
		 * Populate the JS data object from a given URL.
		 * 
		 * @param {Object} url
		 */
		deparam: function( url ) {
			// See if the url matches any routes by testing it against the route.test regEx.
            // By comparing the URL length the most specialized route that matches is used.
			var route = {
				length: -1
			};
			each(can.route.routes, function(name, temp){
				if ( temp.test.test(url) && temp.length > route.length ) {
					route = temp;
				}
			});
            // If a route was matched
			if ( route.length > -1 ) { 
				var // Since RegEx backreferences are used in route.test (round brackets)
                    // the parts will contain the full matched string and each variable (backreferenced) value.
                    parts = url.match(route.test),
                    // start will contain the full matched string; parts contain the variable values.
					start = parts.shift(),
                    // The remainder will be the &amp;key=value list at the end of the URL.
					remainder = url.substr(start.length - (parts[parts.length-1] === "&" ? 1 : 0) ),
                    // If there is a remainder and it contains a &amp;key=value list deparam it.
                    obj = (remainder && paramsMatcher.test(remainder)) ? can.deparam( remainder.slice(1) ) : {};

                // Add the default values for this route
				obj = extend(true, {}, route.defaults, obj);
                // Overwrite each of the default values in obj with those in parts if that part is not empty.
				each(parts,function(i, part){
					if ( part && part !== '&') {
						obj[route.names[i]] = decodeURIComponent( part );
					}
				});
				obj.route = route.route;
				return obj;
			}
            // If no route was matched it is parsed as a &amp;key=value list.
			if ( url.charAt(0) !== '&' ) {
				url = '&' + url;
			}
			return paramsMatcher.test(url) ? can.deparam( url.slice(1) ) : {};
		},
		/**
		 * @hide
		 * A can.Observe that represents the state of the history.
		 */
		data: new can.Observe({}),
        /**
         * @attribute
         * @type Object
		 * @hide
		 * 
         * A list of routes recognized by the router indixed by the url used to add it.
         * Each route is an object with these members:
         * 
 		 *  - test - A regular expression that will match the route when variable values 
         *    are present; i.e. for :page/:type the regEx is /([\w\.]*)/([\w\.]*)/ which
         *    will match for any value of :page and :type (word chars or period).
		 * 
         *  - route - The original URL, same as the index for this entry in routes.
         * 
		 *  - names - An array of all the variable names in this route
         * 
		 *  - defaults - Default values provided for the variables or an empty object.
         * 
		 *  - length - The number of parts in the URL separated by '/'.
         */
		routes: {},
		/**
		 * Indicates that all routes have been added and sets can.route.data
		 * based upon the routes and the current hash.
		 * 
		 * By default, ready is fired on jQuery's ready event.  Sometimes
		 * you might want it to happen sooner or earlier.  To do this call
		 * 
		 *     can.route.ready(false); //prevents firing by the ready event
		 *     can.route.ready(true); // fire the first route change
		 * 
		 * @param {Boolean} [start]
		 * @return can.route
		 */
		ready: function(val) {
			if( val === false ) {
				onready = val;
			}
			if( val === true || onready === true ) {
				setState();
			}
			return can.route;
		},
		/**
		 * Returns a url from the options
		 * @param {Object} options
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {String} 
		 */
		url: function( options, merge ) {
			if (merge) {
				options = extend({}, curParams, options)
			}
			return "#!" + can.route.param(options)
		},
		/**
		 * Returns a link
		 * @param {Object} name The text of the link.
		 * @param {Object} options The route options (variables)
		 * @param {Object} props Properties of the &lt;a&gt; other than href.
         * @param {Boolean} merge true if the options should be merged with the current options
		 */
		link: function( name, options, props, merge ) {
			return "<a " + makeProps(
			extend({
				href: can.route.url(options, merge)
			}, props)) + ">" + name + "</a>";
		},
		/**
		 * Returns true if the options represent the current page.
		 * @param {Object} options
         * @return {Boolean}
		 */
		current: function( options ) {
			return location.hash == "#!" + can.route.param(options)
		}
	});
	
	
    // The functions in the following list applied to can.route (e.g. can.route.attr('...')) will
    // instead act on the can.route.data Observe.
	each(['bind','unbind','delegate','undelegate','attr','removeAttr'], function(i, name){
		can.route[name] = function(){
			return can.route.data[name].apply(can.route.data, arguments)
		}
	})

	var // A ~~throttled~~ debounced function called multiple times will only fire once the
        // timer runs down. Each call resets the timer. (throttled functions
		// are called once every x seconds)
		timer,
        // Intermediate storage for can.route.data.
        curParams,
        // Deparameterizes the portion of the hash of interest and assign the
        // values to the can.route.data removing existing values no longer in the hash.
        setState = function() {
			curParams = can.route.deparam( location.hash.split(/#!?/).pop() );
			can.route.attr(curParams, true);
		};

	// If the hash changes, update the can.route.data
	can.bind.call(window,'hashchange', setState);

	// If the can.route.data changes, update the hash.
    // Using .serialize() retrieves the raw data contained in the observable.
    // This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
	can.route.bind("change", function() {
		clearTimeout( timer );
		timer = setTimeout(function() {
			location.hash = "#!" + can.route.param(can.route.data.serialize())
		}, 1);
	});
	// onready event ...
	can.bind.call(document,"ready",can.route.ready);
;

	// ------- HELPER FUNCTIONS  ------
	
	// Binds an element, returns a function that unbinds
	var bind = function( el, ev, callback ) {
		can.bind.call( el, ev, callback )
		//var binder = el.bind && el.unbind ? el : $(isFunction(el) ? [el] : el);

		//binder.bind(ev, callback);
		// if ev name has >, change the name and bind
		// in the wrapped callback, check that the element matches the actual element
		return function() {
			can.unbind.call(el, ev, callback);
		};
	},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
		special = can.getObject("$.event.special") || {},

		// Binds an element, returns a function that unbinds
		delegate = function( el, selector, ev, callback ) {
			//var binder = el.delegate && el.undelegate ? el : $(isFunction(el) ? [el] : el)
			//binder.delegate(selector, ev, callback);
			can.delegate.call(el, selector, ev, callback)
			return function() {
				can.undelegate.call(el, selector, ev, callback);
			};
		},
		
		// calls bind or unbind depending if there is a selector
		binder = function( el, ev, callback, selector ) {
			return selector ?
				delegate( el, can.trim( selector ), ev, callback ) : 
				bind( el, ev, callback );
		},
		
		// moves 'this' to the first argument, wraps it with jQuery if it's an element
		shifter = function shifter(context, name) {
			var method = typeof name == "string" ? context[name] : name;
			return function() {
				context.called = name;
    			return method.apply(context, [this.nodeName ? can.$(this) : this].concat( slice.call(arguments, 0)));
			};
		},
		basicProcessor;
	
	/**
	 * @add can.Control
	 */
	can.Construct("can.Control",
	/** 
	 * @Static
	 */
	{
		/**
		 * @hide
		 * 
		 * Setup pre-process which methods are event listeners.
		 * 
		 */
		setup: function() {

			// Allow contollers to inherit "defaults" from superclasses as it done in can.Construct
			can.Construct.setup.apply( this, arguments );

			// if you didn't provide a name, or are control, don't do anything
			if ( this !== can.Control ) {

				// cache the underscored names
				var control = this,
					funcName;

				// calculate and cache actions
				control.actions = {};

				for ( funcName in control.prototype ) {
					if (funcName == 'constructor' || ! isFunction(control.prototype[funcName]) ) {
						continue;
					}
					if ( control._isAction(funcName) ) {
						control.actions[funcName] = control._action(funcName);
					}
				}
			}
		},
		/**
		 * @hide
		 * @param {String} methodName a prototype function
		 * @return {Boolean} truthy if an action or not
		 */
		_isAction: function( methodName ) {
			// RegExp literals don't carry a last index property so this is
			// safe
			return special[methodName] || processors[methodName] || /[^\w]/.test(methodName);
		},
		/**
		 * @hide
		 * Takes a method name and the options passed to a control
		 * and tries to return the data necessary to pass to a processor
		 * (something that binds things).
		 * 
		 * For performance reasons, this called twice.  First, it is called when 
		 * the Control class is created.  If the methodName is templated
		 * like : "{window} foo", it returns null.  If it is not templated
		 * it returns event binding data.
		 * 
		 * The resulting data is added to this.actions.
		 * 
		 * When a control instance is created, _action is called again, but only
		 * on templated actions.  
		 * 
		 * @param {Object} methodName the method that will be bound
		 * @param {Object} [options] first param merged with class default options
		 * @return {Object} null or the processor and pre-split parts.  
		 * The processor is what does the binding/subscribing.
		 */
		_action: function( methodName, options ) {
			// reset the test index
			
			//if we don't have options (a control instance), we'll run this later
			                  // Parameter replacer regex
			if ( options || ! /\{([^\}]+)\}/g.test( methodName )) {
				// If we have options, run sub to replace templates "{}" with a value from the options
				// or the window
				var convertedName = options ? can.sub(methodName, [options, window]) : methodName,
					
					// If a "{}" resolves to an object, convertedName will be an array
					arr = can.isArray(convertedName),
					
					// get the parts of the function = [convertedName, delegatePart, eventPart]
					                                                       // Breaker regex
					parts = (arr ? convertedName[1] : convertedName).match(/^(?:(.*?)\s)?([\w\.\:>]+)$/),
					event = parts[2],
					processor = processors[event] || basicProcessor;
				return {
					processor: processor,
					parts: parts,
					delegate : arr ? convertedName[0] : undefined
				};
			}
		},
		/**
		 * @attribute processors
		 * An object of {eventName : function} pairs that Control uses to hook up events
		 * auto-magically.  A processor function looks like:
		 * 
		 *     jQuery.Control.processors.
		 *       myprocessor = function( el, event, selector, cb, control ) {
		 *          //el - the control's element
		 *          //event - the event (myprocessor)
		 *          //selector - the left of the selector
		 *          //cb - the function to call
		 *          //control - the binding control
		 *       };
		 * 
		 * This would bind anything like: "foo~3242 myprocessor".
		 * 
		 * The processor must return a function that when called, 
		 * unbinds the event handler.
		 * 
		 * Control already has processors for the following events:
		 * 
		 *   - change 
		 *   - click 
		 *   - contextmenu 
		 *   - dblclick 
		 *   - focusin
		 *   - focusout
		 *   - keydown 
		 *   - keyup 
		 *   - keypress 
		 *   - mousedown 
		 *   - mouseenter
		 *   - mouseleave
		 *   - mousemove 
		 *   - mouseout 
		 *   - mouseover 
		 *   - mouseup 
		 *   - reset 
		 *   - resize 
		 *   - scroll 
		 *   - select 
		 *   - submit  
		 * 
		 * Listen to events on the document or window 
		 * with templated event handlers:
		 * 
		 *
		 *     can.Control('Sized',{
		 *       "{window} resize" : function(){
		 *         this.element.width(this.element.parent().width() / 2);
		 *       }
		 *     });
		 *     
		 *     $('.foo').sized();
		 */
		processors: {},
		/**
		 * @attribute defaults
		 * A object of name-value pairs that act as default values for a control's 
		 * [can.Control::options this.options].
		 * 
		 *     Message = can.Control({
		 *       defaults : {
		 *         message : "Hello World"
		 *       }
		 *     },{
		 *       init : function(){
		 *         this.element.text(this.options.message);
		 *       }
		 *     })
		 *     
		 *     new Message("#el1"); //writes "Hello World"
		 *     new Message("#el12",{message: "hi"}); //writes hi
		 *     
		 * In [can.Control::setup] the options passed to the control
		 * are merged with defaults.  This is not a deep merge.
		 */
		defaults: {}
	},
	/** 
	 * @Prototype
	 */
	{
		/**
		 * Setup is where most of control's magic happens.  It does the following:
		 * 
		 * ### 1. Sets this.element
		 * 
		 * The first parameter passed to new Control(el, options) is expected to be 
		 * an element.  This gets converted to a jQuery wrapped element and set as
		 * [jQuery.Control.prototype.element this.element].
		 * 
		 * ### 2. Adds the control's name to the element's className.
		 * 
		 * Control adds it's plugin name to the element's className for easier 
		 * debugging.  For example, if your Control is named "Foo.Bar", it adds
		 * "foo_bar" to the className.
		 * 
		 * ### 3. Saves the control in $.data
		 * 
		 * A reference to the control instance is saved in $.data.  You can find 
		 * instances of "Foo.Bar" like: 
		 * 
		 *     $("#el").data("controls")['foo_bar'].
		 * 
		 * ### Binds event handlers
		 * 
		 * Setup does the event binding described in [jquery.control.listening Listening To Events].
		 * 
		 * @param {HTMLElement} element the element this instance operates on.
		 * @param {Object} [options] option values for the control.  These get added to
		 * this.options and merged with [jQuery.Control.static.defaults defaults].
		 * @return {Array} return an array if you wan to change what init is called with. By
		 * default it is called with the element and options passed to the control.
		 */
		setup: function( element, options ) {
			var cls = this.constructor,
				pluginname = cls.pluginName || cls._fullName;

			// want the raw element here
			this.element = can.$(element)

			if( pluginname && pluginname !== 'can_control') {
				//set element and className on element
				this.element.addClass(pluginname);
			}
			
			(can.data(this.element,"controls")) || can.data(this.element,"controls", [ this ]);
			
			/**
			 * @attribute options
			 * 
			 * Options are used to configure an control.  They are
			 * the 2nd argument
			 * passed to a control (or the first argument passed to the 
			 * [jquery.control.plugin control's jQuery plugin]).
			 * 
			 * For example:
			 * 
			 *     can.Control('Hello')
			 *     
			 *     var h1 = new Hello($('#content1'), {message: 'World'} );
			 *     equal( h1.options.message , "World" )
			 *     
			 *     var h2 = $('#content2').hello({message: 'There'})
			 *                            .control();
			 *     equal( h2.options.message , "There" )
			 * 
			 * Options are merged with [jQuery.Control.static.defaults defaults] in
			 * [jQuery.Control.prototype.setup setup].
			 * 
			 * For example:
			 * 
			 *     can.Control("Tabs", 
			 *     {
			 *        defaults : {
			 *          activeClass: "ui-active-state"
			 *        }
			 *     },
			 *     {
			 *        init : function(){
			 *          this.element.addClass(this.options.activeClass);
			 *        }
			 *     })
			 *     
			 *     $("#tabs1").tabs()                         // adds 'ui-active-state'
			 *     $("#tabs2").tabs({activeClass : 'active'}) // adds 'active'
			 *     
			 * Options are typically updated by calling 
			 * [jQuery.Control.prototype.update update];
			 *
			 */
			this.options = extend({}, cls.defaults, options);

			// bind all event handlers
			this.on();

			/**
			 * @attribute element
			 * 
			 * The control instance's HTMLElement (or window) wrapped by the 
			 * util library for ease of use. It is set by the first
			 * parameter to `new can.Construct(element, options)` 
			 * in [can.Control::setup].  Control listens on `this.element`
			 * for events.
			 * 
			 * ### Quick Example
			 * 
			 * The following `HelloWorld` control sets the control`s text to "Hello World":
			 * 
			 *     HelloWorld = can.Control({
			 *       init : function(){
			 * 	       this.element.text('Hello World')
			 *       }
			 *     })
			 *     
			 *     // create the controller on the element
			 *     new HelloWorld(document.getElementById('#helloworld'))
			 * 
			 * 
			 * ## Wrapped NodeList
			 * 
			 * `this.element` is a wrapped NodeList of one HTMLELement (or window).  This
			 * is for convience in libraries like jQuery where all methods operate only on a
			 * NodeList.  To get the raw HTMLElement, write:
			 * 
			 *     this.element[0] //-> HTMLElement
			 * 
			 * The following details the NodeList used by each library with 
			 * an example of updating it's text:
			 * 
			 * __jQuery__ `jQuery( HTMLElement )`
			 * 
			 *     this.element.text("Hello World")
			 * 
			 * __Zepto__ `Zepto( HTMLElement )`
			 * 
			 *     this.element.text("Hello World")
			 * 
			 * __Dojo__ `new dojo.NodeList( HTMLElement )`
			 * 
			 *     // TODO
			 * 
			 * __Mootools__ `$$( HTMLElement )`
			 * 
			 *    this.element.empty().appendText("Hello World")
			 * 
			 * __YUI__ 
			 * 
			 *    // TODO
			 * 
			 * 
			 * ## Changing `this.element`
			 * 
			 * Sometimes you don't want what's passed to `new can.Control`
			 * to be this.element.  You can change this by overwriting
			 * setup or by unbinding, setting this.element, and rebinding.
			 * 
			 * ### Overwriting Setup
			 * 
			 * The following Combobox overwrites setup to wrap a
			 * select element with a div.  That div is used 
			 * as `this.element`. Notice how `destroy` sets back the
			 * original element.
			 * 
			 *     Combobox = can.Control({
			 *       setup : function(el, options){
			 *          this.oldElement = $(el);
			 *          var newEl = $('<div/>');
			 *          this.oldElement.wrap(newEl);
			 *          can.Controll.prototype.setup.call(this, newEl, options);
			 *       },
			 *       init : function(){
			 *          this.element //-> the div
			 *       },
			 *       ".option click" : function(){
			 *         // event handler bound on the div
			 *       },
			 *       destroy : function(){
			 *          var div = this.element; //save reference
			 *          can.Control.prototype.destroy.call(this);
			 *          div.replaceWith(this.oldElement);
			 *       }
			 *     })
			 * 
			 * ### unbining, setting, and rebinding.
			 * 
			 * You could also change this.element by calling
			 * [can.Control::off], setting this.element, and 
			 * then calling [can.Control::on] like:
			 * 
			 *     move : function(newElement) {
			 *        this.off();
			 *        this.element = $(newElement);
			 *        this.on();  
			 *     }
			 */
			return [this.element, this.options];
		},
		/**
		 * `this.on( [element, selector, eventName, handler] )` is used to rebind 
		 * all event handlers when [can.Control::options this.options] has changed.  It
		 * can also be used to bind or delegate from other elements or objects.
		 * 
		 * ## Rebinding
		 * 
		 * By using templated event handlers, a control can listen to objects outside
		 * `this.element`.  This is extremely common in MVC programming.  For example,
		 * the following control might listen to a task model's `completed` property and
		 * toggle a strike className like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed" : function(){
		 * 	       this.update();
		 *       },
		 *       update : function(){
		 *         if(this.options.task.completed){
		 * 	         this.element.addClass('strike')
		 * 	       } else {
		 *           this.element.removeClass('strike')
		 *         }
		 *       }
		 *     }) 
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({completed: 'true'}) 
		 *     })
		 * 
		 * To update the taskstriker's task, add a task method that updates
		 * this.options and calls rebind like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed" : function(){
		 * 	       this.update();
		 *       },
		 *       update : function(){
		 *         if(this.options.task.completed){
		 * 	         this.element.addClass('strike')
		 * 	       } else {
		 *           this.element.removeClass('strike')
		 *         }
		 *       },
		 *       task : function(newTask){
		 *         this.options.task = newTask;
		 *         this.on();
		 *         this.update();
		 *       }
		 *     });
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({completed: true}) 
		 *     });
		 *     taskstriker.task( new TaskStriker({ 
		 *       task: new Task({completed: false}) 
		 *     }))
		 * 
		 * ## Adding new events
		 * 
		 * If events need to be bound to outside of the control and templated event handlers
		 * are not sufficent, you can call this.on to bind or delegate programatically:
		 * 
		 *     init: function() {
		 *        // calls somethingClicked(el,ev)
		 *        this.on('click','somethingClicked') 
		 *     
		 *        // calls function when the window is clicked
		 *        this.on(window, 'click', function(ev){
		 *          //do something
		 *        })
		 *     },
		 *     somethingClicked: function( el, ev ) {
		 *       
		 *     }
		 * 
		 * @param {HTMLElement|jQuery.fn|Object} [el=this.element] 
		 * The element to be bound.  If an eventName is provided,
		 * the control's element is used instead.
		 * @param {String} [selector] A css selector for event delegation.
		 * @param {String} [eventName] The event to listen for.
		 * @param {Function|String} [func] A callback function or the String name of a control function.  If a control
		 * function name is given, the control function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		on: function( el, selector, eventName, func ) {
			
			if ( ! el ) {
				//adds bindings
				this.off();
				//go through the cached list of actions and use the processor to bind
				
				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element,
					destroyCB = shifter(this,"destroy");
					
				for ( funcName in actions ) {
					if ( actions.hasOwnProperty( funcName )) {
						ready = actions[funcName] || cls._action(funcName, this.options);
						bindings.push(
							ready.processor(ready.delegate || element, 
							                ready.parts[2], 
											ready.parts[1], 
											funcName, 
											this));
					}
				}
	
	
				// setup to be destroyed ... don't bind b/c we don't want to remove it
				can.bind.call(element,"destroyed", destroyCB);
				bindings.push(function( el ) {
					can.unbind.call(el,"destroyed", destroyCB);
				});
				return bindings.length;
			}

			if ( typeof el == 'string' ) {
				func = eventName;
				eventName = selector;
				selector = el;
				el = this.element;
			}
			
			if ( typeof func == 'string' ) {
				func = shifter(this,func);
			}

			this._bindings.push( binder( el, eventName, func, selector ));

			return this._bindings.length;
		},
		/**
		 * @hide
		 * Unbinds all event handlers on the controller. You should never
		 * be calling this unless in use with [can.Control::on].
		 * 
		 * 
		 */
		off : function(){
			var el = this.element[0]
			each(this._bindings || [], function( key, value ) {
				value(el);
			});
			//adds bindings
			this._bindings = [];
		},
		/**
		 * @hide
		 * Update extends [jQuery.Control.prototype.options this.options] 
		 * with the `options` argument and rebinds all events.  It basically
		 * re-configures the control.
		 * 
		 * For example, the following control wraps a recipe form. When the form
		 * is submitted, it creates the recipe on the server.  When the recipe
		 * is `created`, it resets the form with a new instance.
		 * 
		 *     can.Control('Creator',{
		 *       "{recipe} created" : function(){
		 *         this.update({recipe : new Recipe()});
		 *         this.element[0].reset();
		 *         this.find("[type=submit]").val("Create Recipe")
		 *       },
		 *       "submit" : function(el, ev){
		 *         ev.preventDefault();
		 *         var recipe = this.options.recipe;
		 *         recipe.attrs( this.element.formParams() );
		 *         this.find("[type=submit]").val("Saving...")
		 *         recipe.save();
		 *       }
		 *     });
		 *     $('#createRecipes').creator({recipe : new Recipe()})
		 * 
		 * 
		 * @demo jquery/control/demo-update.html
		 * 
		 * Update is called if a control's [jquery.control.plugin jQuery helper] is 
		 * called on an element that already has a control instance
		 * of the same type. 
		 * 
		 * For example, a widget that listens for model updates
		 * and updates it's html would look like.  
		 * 
		 *     can.Control('Updater',{
		 *       // when the control is created, update the html
		 *       init : function(){
		 *         this.updateView();
		 *       },
		 *       
		 *       // update the html with a template
		 *       updateView : function(){
		 *         this.element.html( "content.ejs",
		 *                            this.options.model ); 
		 *       },
		 *       
		 *       // if the model is updated
		 *       "{model} updated" : function(){
		 *         this.updateView();
		 *       },
		 *       update : function(options){
		 *         // make sure you call super
		 *         this._super(options);
		 *          
		 *         this.updateView();
		 *       }
		 *     })
		 * 
		 *     // create the control
		 *     // this calls init
		 *     $('#item').updater({model: recipe1});
		 *     
		 *     // later, update that model
		 *     // this calls "{model} updated"
		 *     recipe1.update({name: "something new"});
		 *     
		 *     // later, update the control with a new recipe
		 *     // this calls update
		 *     $('#item').updater({model: recipe2});
		 *     
		 *     // later, update the new model
		 *     // this calls "{model} updated"
		 *     recipe2.update({name: "something newer"});
		 * 
		 * _NOTE:_ If you overwrite `update`, you probably need to call
		 * this._super.
		 * 
		 * ### Example
		 * 
		 *     can.Control("Thing",{
		 *       init: function( el, options ) {
		 *         alert( 'init:'+this.options.prop )
		 *       },
		 *       update: function( options ) {
		 *         this._super(options);
		 *         alert('update:'+this.options.prop)
		 *       }
		 *     });
		 *     $('#myel').thing({prop : 'val1'}); // alerts init:val1
		 *     $('#myel').thing({prop : 'val2'}); // alerts update:val2
		 * 
		 * @param {Object} options A list of options to merge with 
		 * [jQuery.Control.prototype.options this.options].  Often, this method
		 * is called by the [jquery.control.plugin jQuery helper function].
		 */
		update: function( options ) {
			extend(this.options, options);
			this.on();
		},
		/**
		 * `destroy` prepares a control for garbage collection and is a place to
		 * reset any changes the control has made.  
		 * 
		 * ## Allowing Garbage Collection
		 * 
		 * Destroy is called whenever a control's element is removed from the page using 
		 * the library's standard HTML modifier methods.  This means that you
		 * don't have to call destroy yourself and it 
		 * will be called automatically when appropriate.  
		 * 
		 * The following `Clicker` widget listens on the window for clicks and updates
		 * its element's innerHTML.  If we remove the element, the window's event handler
		 * is removed auto-magically:
		 *  
		 * 
		 *      Clickr = can.Control({
		 *       "{window} click" : function(){
		 * 	       this.element.html( this.count ? 
		 * 	                          this.count++ : this.count = 0)
		 *       }  
		 *     })
		 *     
		 *     // create a clicker on an element
		 *     new Clicker("#clickme");
		 * 
		 *     // remove the element
		 *     $('#clickme').remove();
		 * 
		 * 
		 * The methods you can use that will destroy controls automatically by library:
		 * 
		 * __jQuery and Zepto__
		 * 
		 *   - $.fn.remove
		 *   - $.fn.html
		 *   - $.fn.replaceWith
		 *   - $.fn.empty
		 * 
		 * __Dojo__
		 * 
		 *   - dojo.destroy
		 *   - dojo.empty
		 *   - dojo.place (with the replace option)
		 * 
		 * __Mootools__
		 * 
		 *   - Element.prototype.destroy
		 * 
		 * __YUI__
		 * 
		 *   - TODO!
		 * 
		 * 
		 * ## Teardown in Destroy
		 * 
		 * Sometimes, you want to reset a controlled element back to its
		 * original state when the control is destroyed.  Overwriting destroy
		 * lets you write teardown code of this manner.  __When overwriting
		 * destroy, make sure you call Control's base functionality__.
		 * 
		 * The following example changes an element's text when the control is
		 * created and sets it back when the control is removed:
		 * 
		 *     Changer = can.Control({
		 *       init : function(){
		 *         this.oldText = this.element.text();
		 *         this.element.text("Changed!!!")
		 *       },
		 *       destroy : function(){
		 *         this.element.text(this.oldText);
		 *         can.Control.prototype.destroy.call(this)
		 *     })
		 *     
		 *     // create a changer which changes #myel's text
		 *     var changer = new Changer('#myel')
		 * 
		 *     // destroy changer which will reset it
		 *     changer.destroy()
		 * 
		 * ## Base Functionality
		 * 
		 * Control prepares the control for garbage collection by:
		 * 
		 *   - unbinding all event handlers
		 *   - clearing references to this.element and this.options
		 *   - clearing the element's reference to the control
		 *   - removing it's [can.Control.pluginName] from the element's className
		 * 
		 */
		destroy: function() {
			var Class = this.constructor,
				pluginName = Class.pluginName || Class._fullName,
				controls;
			
			// unbind bindings
			this.off();
			
			if(pluginName && pluginName !== 'can_control'){
				// remove the className
				this.element.removeClass(pluginName);
			}
			
			// remove from data
			controls = can.data(this.element,"controls");
			controls.splice(can.inArray(this, controls),1);
			
			can.trigger( this, "destroyed"); //in case we want to know if the control is removed
			
			this.element = null;
		}
	});

	var processors = can.Control.processors,

	//------------- PROCESSSORS -----------------------------
	//processors do the binding.  They return a function that
	//unbinds when called.
	//the basic processor that binds events
	basicProcessor = function( el, event, selector, methodName, control ) {
		return binder( el, event, shifter(control, methodName), selector);
	};




	//set common events to be processed as a basicProcessor
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", "keypress", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin", "focusout", "mouseenter", "mouseleave"], function( i, v ) {
		processors[v] = basicProcessor;
	});
	

	

;


	// a path like string into something that's ok for an element ID
	var toId = function( src ) {
		return src.split(/\/|\./g).join("_");
	},
		isFunction = can.isFunction,
		makeArray = can.makeArray,
		// used for hookup ids
		hookupId = 1,
	// this might be useful for testing if html
	// htmlTest = /^[\s\n\r\xA0]*<(.|[\r\n])*>[\s\n\r\xA0]*$/
	/**
	 * @add can.view
	 */
	$view = can.view = function(view, data, helpers, callback){
		// get the result
		var result = $view.render(view, data, helpers, callback);
		if(can.isDeferred(result)){
			return result.pipe(function(result){
				return $view.frag(result);
			})
		}
		
		// convert it into a dom frag
		return $view.frag(result);
	};

	can.extend( $view, {
		frag: function(result){
			var frag = can.buildFragment([result],[document.body]).fragment;
			// if we have an empty frag
			if(!frag.childNodes.length) { 
				frag.appendChild(document.createTextNode(''))
			}
			return $view.hookup(frag);
		},
		hookup: function(fragment){
			var hookupEls = [],
				id, 
				func, 
				el,
				i=0;
			
			// get all childNodes
			can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function(i, node){
				if(node.nodeType != 3){
					hookupEls.push(node)
					hookupEls.push.apply(hookupEls, can.makeArray( node.getElementsByTagName('*')))
				}
			});
			// filter by data-view-id attribute
			for (; el = hookupEls[i++]; ) {

				if ( el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id]) ) {
					func(el, id);
					delete $view.hookups[id];
					el.removeAttribute('data-view-id');
				}
			}
			return fragment;
		},
		/**
		 * @attribute hookups
		 * @hide
		 * A list of pending 'hookups'
		 */
		hookups: {},
		/**
		 * @function hook
		 * Registers a hookup function that can be called back after the html is 
		 * put on the page.  Typically this is handled by the template engine.  Currently
		 * only EJS supports this functionality.
		 * 
		 *     var id = can.View.hookup(function(el){
		 *            //do something with el
		 *         }),
		 *         html = "<div data-view-id='"+id+"'>"
		 *     $('.foo').html(html);
		 * 
		 * 
		 * @param {Function} cb a callback function to be called with the element
		 * @param {Number} the hookup number
		 */
		hook: function( cb ) {
			$view.hookups[++hookupId] = cb;
			return " data-view-id='"+hookupId+"'";
		},
		/**
		 * @attribute cached
		 * @hide
		 * Cached are put in this object
		 */
		cached: {},
		/**
		 * @attribute cache
		 * Should the views be cached or reloaded from the server. Defaults to true.
		 */
		cache: true,
		/**
		 * @function register
		 * Registers a template engine to be used with 
		 * view helpers and compression.  
		 * 
		 * ## Example
		 * 
		 * @codestart
		 * can.View.register({
		 * 	suffix : "tmpl",
		 *  plugin : "jquery/view/tmpl",
		 * 	renderer: function( id, text ) {
		 * 		return function(data){
		 * 			return jQuery.render( text, data );
		 * 		}
		 * 	},
		 * 	script: function( id, text ) {
		 * 		var tmpl = can.tmpl(text).toString();
		 * 		return "function(data){return ("+
		 * 		  	tmpl+
		 * 			").call(jQuery, jQuery, data); }";
		 * 	}
		 * })
		 * @codeend
		 * Here's what each property does:
		 * 
		 *    * plugin - the location of the plugin
		 *    * suffix - files that use this suffix will be processed by this template engine
		 *    * renderer - returns a function that will render the template provided by text
		 *    * script - returns a string form of the processed template function.
		 * 
		 * @param {Object} info a object of method and properties 
		 * 
		 * that enable template integration:
		 * <ul>
		 *   <li>plugin - the location of the plugin.  EX: 'jquery/view/ejs'</li>
		 *   <li>suffix - the view extension.  EX: 'ejs'</li>
		 *   <li>script(id, src) - a function that returns a string that when evaluated returns a function that can be 
		 *    used as the render (i.e. have func.call(data, data, helpers) called on it).</li>
		 *   <li>renderer(id, text) - a function that takes the id of the template and the text of the template and
		 *    returns a render function.</li>
		 * </ul>
		 */
		register: function( info ) {
			this.types["." + info.suffix] = info;
		},
		types: {},
		/**
		 * @attribute ext
		 * The default suffix to use if none is provided in the view's url.  
		 * This is set to .ejs by default.
		 */
		ext: ".ejs",
		/**
		 * Returns the text that 
		 * @hide 
		 * @param {Object} type
		 * @param {Object} id
		 * @param {Object} src
		 */
		registerScript: function() {},
		/**
		 * @hide
		 * Called by a production script to pre-load a renderer function
		 * into the view cache.
		 * @param {String} id
		 * @param {Function} renderer
		 */
		preload: function( ) {},
		render: function( view, data, helpers, callback ) {
			// if helpers is a function, it is actually a callback
			if ( isFunction( helpers )) {
				callback = helpers;
				helpers = undefined;
			}
	
			// see if we got passed any deferreds
			var deferreds = getDeferreds(data);
	
	
			if ( deferreds.length ) { // does data contain any deferreds?
				// the deferred that resolves into the rendered content ...
				var deferred = new can.Deferred();
	
				// add the view request to the list of deferreds
				deferreds.push(get(view, true))
	
				// wait for the view and all deferreds to finish
				can.when.apply(can, deferreds).then(function( resolved ) {
					// get all the resolved deferreds
					var objs = makeArray(arguments),
						// renderer is last [0] is the data
						renderer = objs.pop(),
						// the result of the template rendering with data
						result; 
	
					// make data look like the resolved deferreds
					if ( can.isDeferred(data) ) {
						data = usefulPart(resolved);
					}
					else {
						// go through each prop in data again,
						// replace the defferreds with what they resolved to
						for ( var prop in data ) {
							if ( can.isDeferred(data[prop]) ) {
								data[prop] = usefulPart(objs.shift());
							}
						}
					}
					// get the rendered result
					result = renderer(data, helpers);
	
					//resolve with the rendered view
					deferred.resolve(result); 
					// if there's a callback, call it back with the result
					callback && callback(result);
				});
				// return the deferred ....
				return deferred;
			}
			else {
				// no deferreds, render this bad boy
				var response, 
					// if there's a callback function
					async = isFunction( callback ),
					// get the 'view' type
					deferred = get(view, async);
	
				// if we are async, 
				if ( async ) {
					// return the deferred
					response = deferred;
					// and callback callback with the rendered result
					deferred.then(function( renderer ) {
						callback(renderer(data, helpers))
					})
				} else {
					// otherwise, the deferred is complete, so
					// set response to the result of the rendering
					deferred.then(function( renderer ) {
						response = renderer(data, helpers);
					});
				}
	
				return response;
			}
		}
	});
	// returns true if something looks like a deferred
	can.isDeferred = function( obj ) {
		return obj && isFunction(obj.then) && isFunction(obj.pipe) // check if obj is a can.Deferred
	} 
	// makes sure there's a template, if not, has steal provide a warning
	var	checkText = function( text, url ) {
			if ( ! text.length ) {
				//@steal-remove-start
				;
				//@steal-remove-end
				throw "can.view: No template or empty template:" + url;
			}
		},
		// returns a 'view' renderer deferred
		// url - the url to the view template
		// async - if the ajax request should be synchronous
		// returns a deferred
		get = function( url, async ) {
			
			
			var suffix = url.match(/\.[\w\d]+$/),
			type, 
			// if we are reading a script element for the content of the template
			// el will be set to that script element
			el, 
			// a unique identifier for the view (used for caching)
			// this is typically derived from the element id or
			// the url for the template
			id, 
			// the AJAX request used to retrieve the template content
			jqXHR, 
			// used to generate the response 
			response = function( text ) {
				// get the renderer function
				var func = type.renderer(id, text),
					d = new can.Deferred();
				d.resolve(func)
				// cache if if we are caching
				if ( $view.cache ) {
					$view.cached[id] = d;
				}
				// return the objects for the response's dataTypes 
				// (in this case view)
				return d;
			};

			// if we have an inline template, derive the suffix from the 'text/???' part
			// this only supports '<script></script>' tags
			if ( el = document.getElementById(url) ) {
				suffix = "."+el.type.match(/\/(x\-)?(.+)/)[2];
			}
	
			// if there is no suffix, add one
			if (!suffix ) {
				url += ( suffix = $view.ext );
			}
			if(can.isArray(suffix)){
				suffix = suffix[0]
			}
	
			// convert to a unique and valid id
			id = toId(url);
	
			// if a absolute path, use steal to get it
			// you should only be using // if you are using steal
			if ( url.match(/^\/\//) ) {
				var sub = url.substr(2);
				url = window.steal ? 
					"/" + sub : 
					steal.root.mapJoin(sub);
			}
	
			//set the template engine type 
			type = $view.types[suffix];
	
			// if it is cached, 
			if ( $view.cached[id] ) {
				// return the cached deferred renderer
				return $view.cached[id];
			
			// otherwise if we are getting this from a script elment
			} else if ( el ) {
				// resolve immediately with the element's innerHTML
				return response(el.innerHTML);
			} else {
				// make an ajax request for text
				var d = new can.Deferred();
				can.ajax({
					async: async,
					url: url,
					dataType: "text",
					error: function(jqXHR) {
						checkText("", url);
						d.reject(jqXHR);
					},
					success: function( text ) {
						// make sure we got some text back
						checkText(text, url);
						d.resolve(type.renderer(id, text))
						// cache if if we are caching
						if ( $view.cache ) {
							$view.cached[id] = d;
						}
						
					}
				});
				return d;
			}
		},
		// gets an array of deferreds from an object
		// this only goes one level deep
		getDeferreds = function( data ) {
			var deferreds = [];

			// pull out deferreds
			if ( can.isDeferred(data) ) {
				return [data]
			} else {
				for ( var prop in data ) {
					if ( can.isDeferred(data[prop]) ) {
						deferreds.push(data[prop]);
					}
				}
			}
			return deferreds;
		},
		// gets the useful part of deferred
		// this is for Models and can.ajax that resolve to array (with success and such)
		// returns the useful, content part
		usefulPart = function( resolved ) {
			return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved
		};
	
;

	
	/**
	 * @add can.Model
	 */
	var	pipe = function(def, model, func){
		var d = new can.Deferred();
		def.then(function(){
			arguments[0] = model[func](arguments[0])
			d.resolve.apply(d, arguments)
		},function(){
			d.resolveWith.apply(this,arguments)
		})
		return d;
	},
		modelNum = 0,
		ignoreHookup = /change.observe\d+/,
		getId = function( inst ) {
			return inst[inst.constructor.id]
		},
		ajax = function(ajaxOb, data, type, dataType, success, error ) {

			
			// if we get a string, handle it
			if ( typeof ajaxOb == "string" ) {
				// if there's a space, it's probably the type
				var parts = ajaxOb.split(" ")
				ajaxOb = {
					url : parts.pop()
				};
				if(parts.length){
					ajaxOb.type = parts.pop();
				}
			}

			// if we are a non-array object, copy to a new attrs
			ajaxOb.data = typeof data == "object" && !can.isArray(data) ?
				can.extend(ajaxOb.data || {}, data) : data;
	

			// get the url with any templated values filled out
			ajaxOb.url = can.sub(ajaxOb.url, ajaxOb.data, true);

			return can.ajax(can.extend({
				type: type || "post",
				dataType: dataType ||"json",
				success : success,
				error: error
			},ajaxOb));
		},
		makeRequest = function( self, type, success, error, method ) {
			var deferred ,
				args = [self.serialize()],
				// the Model
				model = self.constructor,
				jqXHR;

			// destroy does not need data
			if ( type == 'destroy' ) {
				args.shift();
			}
			// update and destroy need the id
			if ( type !== 'create' ) {
				args.unshift(getId(self))
			}
			
			jqXHR = model[type].apply(model, args);
			
			deferred = jqXHR.pipe(function(data){
				self[method || type + "d"](data, jqXHR);
				return self
			})
			//promise = deferred.promise();
			// hook up abort
			if(jqXHR.abort){
				deferred.abort = function(){
					jqXHR.abort();
				}
			}
			
			return deferred.then(success,error);
		},
	
	/** 
	 * @Static
	 */
	
	// this object describes how to make an ajax request for each ajax method
	// the available properties are
	// url - the default url to use as indicated as a property on the model
	// type - the default http request type
	// data - a method that takes the arguments and returns data used for ajax
	// 292 bytes
	ajaxMethods = {
		/**
		 * @function create
		 */
		create : {
			url : "_shortName",
			type :"post"
		},
		/**
		 * @function update
		 */
		update : {
			data : function(id, attrs){
				attrs = attrs || {};
				var identity = this.id;
				if ( attrs[identity] && attrs[identity] !== id ) {
					attrs["new" + can.capitalize(id)] = attrs[identity];
					delete attrs[identity];
				}
				attrs[identity] = id;
				return attrs;
			},
			type : "put"
		},
		/**
		 * @function destroy
		 */
		destroy : {
			type : "delete",
			data : function(id){
				return {}[this.id] = id;
			}
		},
		/**
		 * @function findAll
		 */
		findAll : {
			url : "_shortName"
		},
		/**
		 * @function findOne
		 */
		findOne: {}
	},
		// makes an ajax request function from a string
		// ajaxMethod - the ajaxMethod object defined above
		// str - the string the user provided. ex: findAll: "/recipes.json"
		ajaxMaker = function(ajaxMethod, str){
			// return a function that serves as the ajax method
			return function(data){
				// if the ajax method has it's own way of getting data, use that
				data = ajaxMethod.data ? 
					ajaxMethod.data.apply(this, arguments) :
					// otherwise use the data passed in
					data;
				// return the ajax method with data and the type provided
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get")
			}
		}


	
	
	can.Observe("can.Model",{
		setup : function(){
			can.Observe.apply(this, arguments);
			if(this === can.Model){
				return;
			}
			var self = this;
			
			can.each(ajaxMethods, function(name, method){
				if ( ! can.isFunction( self[name] )) {
					self[name] = ajaxMaker(method, self[name]);
				}
			});
			var clean = can.proxy(this._clean, self);
			can.each({findAll : "models", findOne: "model"}, function(name, method){
				var old = self[name];
				self[name] = function(params, success, error){
					// increment requests
					self._reqs++;
					// make the request
					return pipe( old.call(self,params),
						self, 
						method ).then(success,error).then(clean, clean);
				}
				
			})
			// convert findAll and findOne
			var oldFindAll
			if(self.fullName == "can.Model"){
				self.fullName = "Model"+(++modelNum);
			}
			//add ajax converters
			
			if(window.jQuery){
				var converters = {},
					convertName = "* " + self.fullName + ".model";
	
				converters[convertName + "s"] = can.proxy(self.models,self);
				converters[convertName] = can.proxy(self.model,self);
				$.ajaxSetup({
					converters: converters
				});
			}
			this.store = {};
			this._reqs = 0;
			this._url = this._shortName+"/{"+this.id+"}"
		},
		_clean : function(){
			this._reqs--;
			if(!this._reqs){
				for(var id in this.store) {
					if(!this.store[id]._bindings){
						delete this.store[id];
					}
				}
			}
		},
		/**
		 * @function models
		 */
		models: function( instancesRawData ) {
			if ( ! instancesRawData ) {
				return;
			}
			// get the list type
			var self = this,
				res = new( self.List || ML),
				// did we get an array
				arr = can.isArray(instancesRawData),
				
				// did we get a model list?
				ml = (instancesRawData instanceof ML),
				// get the raw array of objects
				raw = arr ?
				// if an array, return the array
				instancesRawData :
				// otherwise if a model list
				(ml ?
				// get the raw objects from the list
				instancesRawData.serialize() :
				// get the object's data
				instancesRawData.data),
				i = 0;

			

			can.each(raw, function( i, rawPart ) {
				res.push( self.model( rawPart ));
			});

			if (!arr ) { //push other stuff onto array
				can.each(instancesRawData, function(prop, val){
					if ( prop !== 'data' ) {
						res[prop] = val;
					}
				})
			}
			return res;
		},
		/**
		 * @function model
		 */
		model: function( attributes ) {
			if (!attributes ) {
				return;
			}
			if ( attributes instanceof this ) {
				attributes = attributes.serialize();
			}
			var model = this.store[attributes.id] || new this( attributes );
			if(this._reqs){
				this.store[attributes.id] = model;
			}
			return model;
		}
		/**
		 * @function bind
		 */
		// inherited with can.Observe
		/**
		 * @function unbind
		 */
		// inherited with can.Observe
	},
	/**
	 * @prototype
	 */
	{
		/**
		 * @function isNew
		 */
		isNew: function() {
			var id = getId(this);
			// id || id === 0?
			return !(id || id === 0); //if null or undefined
		},
		/**
		 * @function save
		 */
		save: function( success, error ) {
			return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
		},
		/**
		 * Destroys the instance by calling 
		 * [Can.Model.destroy] with the id of the instance.
		 * 
		 *     recipe.destroy(success, error);
		 * 
		 * This triggers "destroyed" events on the instance and the 
		 * Model constructor function which can be listened to with
		 * [can.Model::bind] and [can.Model.bind]. 
		 * 
		 *     Recipe = can.Model({
		 *       destroy : "DELETE /services/recipes/{id}",
		 *       findOne : "/services/recipes/{id}"
		 *     },{})
		 *     
		 *     Recipe.bind("destroyed", function(){
		 *       console.log("a recipe destroyed");	
		 *     });
		 * 
		 *     // get a recipe
		 *     Recipe.findOne({id: 5}, function(recipe){
		 *       recipe.bind("destroyed", function(){
		 *         console.log("this recipe destroyed")	
		 *       })
		 *       recipe.destroy();
		 *     })
		 * 
		 * @param {Function} [success(instance)] called if a successful destroy
		 * @param {Function} [error(xhr)] called if an unsuccessful destroy
		 * @return {can.Deferred} a deferred that resolves with the destroyed instance
		 */
		destroy: function( success, error ) {
			return makeRequest(this, 'destroy', success, error, 'destroyed');
		},
		/**
		 * @function bind
		 * 
		 * `bind(eventName, handler(ev, args...) )` is used to listen
		 * to events on this model instance.  Example:
		 * 
		 *     Task = can.Model()
		 *     var task = new Task({name : "dishes"})
		 *     task.bind("name", function(ev, newVal, oldVal){})
		 * 
		 * Use `bind` the
		 * same as [can.Observe::bind] which should be used as
		 * a reference for listening to property changes.
		 * 
		 * Bind on model can be used to listen to when 
		 * an instance is:
		 * 
		 *  - created
		 *  - updated
		 *  - destroyed
		 * 
		 * like:
		 * 
		 *     Task = can.Model()
		 *     var task = new Task({name : "dishes"})
		 * 
		 *     task.bind("created", function(ev, newTask){
		 * 	     console.log("created", newTask)
		 *     })
		 *     .bind("updated", function(ev, updatedTask){
		 *       console.log("updated", updatedTask)
		 *     })
		 *     .bind("destroyed", function(ev, destroyedTask){
		 * 	     console.log("destroyed", destroyedTask)
		 *     })
		 * 
		 *     // create, update, and destroy
		 *     task.save(function(){
		 *       task.attr('name', "do dishes")
		 *           .save(function(){
		 * 	            task.destroy()
		 *           })
		 *     }); 
		 *     
		 * 
		 * `bind` also extends the inherited 
		 * behavior of [can.Observe::bind] to track the number
		 * of event bindings on this object which is used to store
		 * the model instance.  When there are no bindings, the 
		 * model instance is removed from the store, freeing memory.  
		 * 
		 */
		bind : function(eventName){
			if(!ignoreHookup.test(eventName)) { 
				if(!this._bindings){
					this.constructor.store[getId(this)] = this;
					this._bindings = 0;
				}
				this._bindings++;
			}
			
			return can.Observe.prototype.bind.apply(this, arguments);
		},
		/**
		 * @function unbind
		 */
		unbind : function(eventName){
			if(!ignoreHookup.test(eventName)) { 
				this._bindings--;
				if(!this._bindings){
					delete this.constructor.store[getId(this)];
				}
			}
			return can.Observe.prototype.unbind.apply(this, arguments);
		},
		// change ID
		___set: function( prop, val ) {
			can.Observe.prototype.___set.call(this,prop, val)
			// if we add an id, move it to the store
			if(prop === this.constructor.id && this._bindings){
				this.constructor.store[getId(this)] = this;
			}
		}
	});
	
		can.each([
	/**
	 * @function created
	 * @hide
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
	"created",
	/**
	 * @function updated
	 * @hide
	 * Called by save after an instance is updated.  Publishes 'updated'.
	 * @param {Object} attrs
	 */
	"updated",
	/**
	 * @function destroyed
	 * @hide
	 * Called after an instance is destroyed.  
	 *   - Publishes "shortName.destroyed".
	 *   - Triggers a "destroyed" event on this model.
	 *   - Removes the model from the global list if its used.
	 * 
	 */
	"destroyed"], function( i, funcName ) {
		can.Model.prototype[funcName] = function( attrs ) {
			var stub, 
				constructor = this.constructor;

			// update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

			// call event on the instance
			can.trigger(this,funcName);
			can.trigger(this,"change",funcName)
			

			// call event on the instance's Class
			can.trigger(constructor,funcName, this);
		};
	});
	
	// model lists are just like Observe.List except that when their items is destroyed, it automatically
	// gets removed from the list
	/**
	 * @class can.Model.List
	 * @inherits can.Observe.List
	 * @parent index
	 */
	var ML = can.Observe.List('can.Model.List',{
		setup : function(){
			can.Observe.List.prototype.setup.apply(this, arguments );
			// send destroy events
			var self = this;
			this.bind('change', function(ev, how){
				if(/\w+\.destroyed/.test(how)){
					self.splice(self.indexOf(ev.target),1);
				}
			})
		}
	})
	
;

	
	can.Control.processors.route = function(el, event, selector, funcName, controller){
		can.route(selector||"")
		var batchNum,
			check = function(ev, attr, how){
				if(can.route.attr('route') === (selector||"") && 
				   (ev.batchNum === undefined || ev.batchNum !== batchNum ) ){
					
					batchNum = ev.batchNum;
					
					var d = can.route.attr();
					delete d.route;
					
					controller[funcName](d)
				}
			}
		can.route.bind('change',check);
		return function(){
			can.route.unbind('change',check)
		}
	}
;


	// HELPER METHODS ==============
	var myEval = function( script ) {
		eval(script);
	},
		// removes the last character from a string
		// this is no longer needed
		extend = can.extend,
		// regular expressions for caching
		quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
		attrReg = /([^\s]+)=$/,
		attributeReplace = /__!!__/g,
		tagMap = {"": "span", table: "tr", tr: "td", ol: "li", ul: "li", tbody: "tr", thead: "tr", tfoot: "tr"},
		// escapes characters starting with \
		clean = function( content ) {
			return content
				.split('\\').join("\\\\")
				.split("\n").join("\\n")
				.split('"').join('\\"')
				.split("\t").join("\\t");
		},
		bracketNum = function(content){
			return (--content.split("{").length) - (--content.split("}").length);
		},
		// used to bind to an observe, and unbind when the element is removed
		liveBind = function(observed, el, cb){
			can.each(observed, function(i, ob){
				ob.obj.bind(ob.attr, cb)
			})
			can.bind.call(el,'destroyed', function(){
				can.each(observed, function(i, ob){
					ob.obj.unbind(ob.attr, cb)
				})
			})
		},
		contentEscape = function( txt ) {
			//return sanatized text
			return (typeof txt == 'string' || typeof txt == 'number') ?
				can.esc( txt ) :
				contentText(txt);
		},
		contentText =  function( input ) {	
			
			// if it's a string, return
			if ( typeof input == 'string' ) {
				return input;
			}
			// if has no value
			if ( !input && input != 0 ) {
				return '';
			}

			// if it's an object, and it has a hookup method
			var hook = (input.hookup &&
			// make a function call the hookup method

			function( el, id ) {
				input.hookup.call(input, el, id);
			}) ||
			// or if it's a function, just use the input
			(typeof input == 'function' && input);
			// finally, if there is a funciton to hookup on some dom
			// pass it to hookup to get the data-view-id back
			if ( hook ) {
				return can.view.hook(hook);
			}
			// finally, if all else false, toString it
			return ""+input;
		},
		/**
		 * @class can.EJS
		 * 
		 * @plugin can/view/ejs
		 * @parent can.View
		 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/view/ejs/ejs.js
		 * @test can/view/ejs/qunit.html
		 * 
		 * 
		 * Ejs provides <a href="http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/">ERB</a> 
		 * style client side templates.  Use them with controllers to easily build html and inject
		 * it into the DOM.
		 * 
		 * ###  Example
		 * 
		 * The following generates a list of tasks:
		 * 
		 * @codestart html
		 * &lt;ul>
		 * &lt;% for(var i = 0; i < tasks.length; i++){ %>
		 *     &lt;li class="task &lt;%= tasks[i].identity %>">&lt;%= tasks[i].name %>&lt;/li>
		 * &lt;% } %>
		 * &lt;/ul>
		 * @codeend
		 * 
		 * For the following examples, we assume this view is in <i>'views\tasks\list.ejs'</i>.
		 * 
		 * 
		 * ## Use
		 * 
		 * ### Loading and Rendering EJS:
		 * 
		 * You should use EJS through the helper functions [jQuery.View] provides such as:
		 * 
		 *   - [jQuery.fn.after after]
		 *   - [jQuery.fn.append append]
		 *   - [jQuery.fn.before before]
		 *   - [jQuery.fn.html html], 
		 *   - [jQuery.fn.prepend prepend],
		 *   - [jQuery.fn.replaceWith replaceWith], and 
		 *   - [jQuery.fn.text text].
		 * 
		 * or [Can.Control.prototype.view].
		 * 
		 * ### Syntax
		 * 
		 * EJS uses 5 types of tags:
		 * 
		 *   - <code>&lt;% CODE %&gt;</code> - Runs JS Code.
		 *     For example:
		 *     
		 *         <% alert('hello world') %>
		 *     
		 *   - <code>&lt;%= CODE %&gt;</code> - Runs JS Code and writes the _escaped_ result into the result of the template.
		 *     For example:
		 *     
		 *         <h1><%= 'hello world' %></h1>
		 *         
		 *   - <code>&lt;%== CODE %&gt;</code> - Runs JS Code and writes the _unescaped_ result into the result of the template.
		 *     For example:
		 *     
		 *         <h1><%== '<span>hello world</span>' %></h1>
		 *         
		 *   - <code>&lt;%%= CODE %&gt;</code> - Writes <%= CODE %> to the result of the template.  This is very useful for generators.
		 *     
		 *         <%%= 'hello world' %>
		 *         
		 *   - <code>&lt;%# CODE %&gt;</code> - Used for comments.  This does nothing.
		 *     
		 *         <%# 'hello world' %>
		 *        
		 * ## Hooking up controllers
		 * 
		 * After drawing some html, you often want to add other widgets and plugins inside that html.
		 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
		 * 
		 * @codestart
		 * &lt;ul &lt;%= Mxui.Tabs%>>...&lt;ul>
		 * @codeend
		 * 
		 * You can even hook up multiple controllers:
		 * 
		 * @codestart
		 * &lt;ul &lt;%= [Mxui.Tabs, Mxui.Filler]%>>...&lt;ul>
		 * @codeend
		 * 
		 * To hook up a controller with options or any other jQuery plugin use the
		 * [can.EJS.Helpers.prototype.plugin | plugin view helper]:
		 * 
		 * @codestart
		 * &lt;ul &lt;%= plugin('mxui_tabs', { option: 'value' }) %>>...&lt;ul>
		 * @codeend
		 * 
		 * Don't add a semicolon when using view helpers.
		 * 
		 * 
		 * <h2>View Helpers</h2>
		 * View Helpers return html code.  View by default only comes with 
		 * [can.EJS.Helpers.prototype.view view] and [can.EJS.Helpers.prototype.text text].
		 * You can include more with the view/helpers plugin.  But, you can easily make your own!
		 * Learn how in the [can.EJS.Helpers Helpers] page.
		 * 
		 * @constructor Creates a new view
		 * @param {Object} options A hash with the following options
		 * <table class="options">
		 *     <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
		 *     <tr>
		 *      <td>text</td>
		 *      <td>&nbsp;</td>
		 *      <td>uses the provided text as the template. Example:<br/><code>new View({text: '&lt;%=user%>'})</code>
		 *      </td>
		 *     </tr>
		 *     <tr>
		 *      <td>type</td>
		 *      <td>'<'</td>
		 *      <td>type of magic tags.  Options are '&lt;' or '['
		 *      </td>
		 *     </tr>
		 *     <tr>
		 *      <td>name</td>
		 *      <td>the element ID or url </td>
		 *      <td>an optional name that is used for caching.
		 *      </td>
		 *     </tr>
		 *    </tbody></table>
		 */
		EJS = function( options ) {
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers);
				};
			}
			// if we get a function directly, it probably is coming from
			// a steal-packaged view
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}
			//set options on self
			extend(this, options);
			this.template = scan(this.text, this.name);
		};
	// add EJS to jQuery if it exists
	can.EJS = EJS;
	/** 
	 * @Prototype
	 */
	EJS.prototype.
	/**
	 * Renders an object with view helpers attached to the view.
	 * 
	 *     new EJS({text: "<%= message %>"}).render({
	 *       message: "foo"
	 *     },{helper: function(){ ... }})
	 *     
	 * @param {Object} object data to be rendered
	 * @param {Object} [extraHelpers] an object with view helpers
	 * @return {String} returns the result of the string
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
	};
	/**
	 * @Static
	 */
	extend(EJS, {
		/**
		 * @hide
		 * called to setup unescaped text
		 * @param {Number|String} status
		 *   - "string" - the name of the attribute  <div string="HERE">
		 *   - 1 - in an html tag <div HERE></div>
		 *   - 0 - in the content of a tag <div>HERE</div>
		 *   
		 * @param {Object} self
		 * @param {Object} func
		 */
		txt : function(tagName, status, self, func, escape){
			// set callback on reading ...
			if (can.Observe) {
				can.Observe.__reading = function(obj, attr){
					observed.push({
						obj: obj,
						attr: attr
					});
				}
			}
			// get value
			var observed = [],
				input = func.call(self),
				tag = (tagMap[tagName] || "span");
	
			// set back so we are no longer reading
			if(can.Observe){
				delete can.Observe.__reading;
			}

			// if we had no observes
			if(!observed.length){
				return (escape || status !== 0? contentEscape : contentText)(input);
			}

			if(status == 0){
				return "<" +tag+can.view.hook(
				// are we escaping
				escape ? 
					// 
					function(el){
						// remove child, bind on parent
						var parent = el.parentNode,
							node = document.createTextNode(input);
						
						parent.insertBefore(node, el);
						parent.removeChild(el);
						
						// create textNode
						liveBind(observed, parent, function(){
							node.nodeValue = func.call(self)
						});
					}
					:
					function(span){
						// remove child, bind on parent
						var makeAndPut = function(val, remove){
								// get fragement of html to fragment
								var frag = can.view.frag(val),
									// wrap it to keep a reference to the elements .. 
									nodes = can.$(can.map(frag.childNodes,function(node){
										return node;
									})),
									last = remove[remove.length - 1];
								
								// insert it in the document
								if( last.nextSibling ){
									last.parentNode.insertBefore(frag, last.nextSibling)
								} else {
									last.parentNode.appendChild(frag)
								}
								
								// remove the old content
								can.remove( can.$(remove) );
								//can.view.hookup(nodes);
								return nodes;
							},
							nodes = makeAndPut(input, [span]);
						// listen to changes and update
						// make sure the parent does not die
						// we might simply check that nodes is still in the document 
						// before a write ...
						liveBind(observed, span.parentNode, function(){
							nodes = makeAndPut(func.call(self), nodes);
						});
						//return parent;
				}) + "></" +tag+">";
			} else if(status === 1){ // in a tag
				// mark at end!
				var attrName = func.call(self).replace(/['"]/g, '').split('=')[0];
				pendingHookups.push(function(el) {
					liveBind(observed, el, function() {
						var attr = func.call(self),
							parts = (attr || "").replace(/['"]/g, '').split('='),
							newAttrName = parts[0];
						
						// remove if we have a change and used to have an attrName
						if((newAttrName != attrName) && attrName){
							el.removeAttribute(attrName)
						}
						// set if we have a new attrName
						if(newAttrName){
							el.setAttribute(newAttrName, parts[1])
						}
					});
				});

				return input;
			} else { // in an attribute
				pendingHookups.push(function(el){
					var wrapped = can.$(el),
						hooks;
						
					(hooks = can.data(wrapped,'hooks')) || can.data(wrapped, 'hooks', hooks = {});
					var attr = el.getAttribute(status),
						parts = attr.split("__!!__"),
						hook;

					if(hooks[status]) {
						hooks[status].funcs.push(func);
					}
					else {

						hooks[status] = {
							render: function() {
								var i =0,
									newAttr = attr.replace(attributeReplace, function() {
										return contentText( hook.funcs[i++].call(self) );
									});
								return newAttr;
							},
							funcs: [func],
							batchNum : undefined
						};
					}
					hook = hooks[status];
					
					parts.splice(1,0,input);
					el.setAttribute(status, parts.join(""));
					

					liveBind(observed, el, function(ev) {
						if(ev.batchNum === undefined || ev.batchNum !== hook.batchNum){
							hook.batchNum = ev.batchNum;
							el.setAttribute(status, hook.render());
						} 
						
						
					});
				})
				return "__!!__";
			}
		},
		// called to setup escaped text
		esc : function(tagName, status, self, func){
			return EJS.txt(tagName, status, self, func, true)
		},
		pending: function() {
			if(pendingHookups.length) {
				var hooks = pendingHookups.slice(0);

				pendingHookups = [];
				return can.view.hook(function(el){
					can.each(hooks, function(i, fn){
						fn(el);
					})
				});
			}else {
				return "";
			}
		}
});
	// ========= SCANNING CODE =========
	var tokenReg = new RegExp("(" +["<%%","%%>","<%==","<%=","<%#","<%","%>","<",">",'"',"'"].join("|")+")"),
		// commands for caching
		startTxt = 'var ___v1ew = [];',
		finishTxt = "return ___v1ew.join('')",
		put_cmd = "___v1ew.push(",
		insert_cmd = put_cmd,
		// global controls (used by other functions to know where we are)
		// are we inside a tag
		htmlTag =null,
		// are we within a quote within a tag
		quote = null,
		// what was the text before the current quote (used to get the attr name)
		beforeQuote = null,
		// used to mark where the element is
		status = function(){
			// t - 1
			// h - 0
			// q - string beforeQuote
			return quote ? "'"+beforeQuote.match(attrReg)[1]+"'" : (htmlTag ? 1 : 0)
		},
		pendingHookups = [],
		
		scan = function(source, name){
			var tokens = source.replace(/(\r|\n)+/g, "\n")
				.split(tokenReg),
				content = '',
				buff = [startTxt],
				// helper function for putting stuff in the view concat
				put = function( content, bonus ) {
					buff.push(put_cmd, '"', clean(content), '"'+(bonus||'')+');');
				},
				// a stack used to keep track of how we should end a bracket }
				// once we have a <%= %> with a leftBracket
				// we store how the file should end here (either '))' or ';' )
				endStack =[],
				// the last token, used to remember which tag we are in
				lastToken,
				// the corresponding magic tag
				startTag = null,
				// was there a magic tag inside an html tag
				magicInTag = false,
				// the current tag name
				tagName = '',
				// declared here
				bracketCount,
				i = 0,
				token;

			// re-init the tag state goodness
			htmlTag = quote = beforeQuote = null;

			for (; (token = tokens[i++]) !== undefined;) {

				if ( startTag === null ) {
					switch ( token ) {
					case '<%':
					case '<%=':
					case '<%==':
						magicInTag = 1;
					case '<%#':
						// a new line, just add whatever content w/i a clean
						// reset everything
						startTag = token;
						if ( content.length > 0 ) {
							put(content);
						}
						content = '';
						break;

					case '<%%':
						// replace <%% with <%
						content += '<%';
						break;
					case '<':
						htmlTag = 1;
						content += token;
						magicInTag = 0;
						break;
					case '>':
						htmlTag = 0;
						// TODO: all <%= in tags should be added to pending hookups
						if(magicInTag){
							put(content, ",can.EJS.pending(),\">\"");
							content = '';
						} else {
							content += token;
						}
						
						break;
					case "'":
					case '"':
						// if we are in an html tag, finding matching quotes
						if(htmlTag){
							// we have a quote and it matches
							if(quote && quote === token){
								// we are exiting the quote
								quote = null;
								// otherwise we are creating a quote
								// TOOD: does this handle "\""
							} else if(quote === null){
								quote = token;
								beforeQuote = lastToken;
							}
						}
					default:
						if(lastToken === '<'){
							tagName = token.split(' ')[0];
						}
						content += token;
						break;
					}
				}
				else {
					//we have a start tag
					switch ( token ) {
					case '%>':
						// %>
						switch ( startTag ) {
						case '<%':
							// <%
							
							// get the number of { minus }
							bracketCount = bracketNum(content);
							
							// we are ending a block
							if (bracketCount == 1) {
								// we are starting on
								buff.push(insert_cmd, "can.EJS.txt('"+tagName+"'," + status() + ",this,function(){", startTxt, content);
								
								endStack.push({
									before: "",
									after: finishTxt+"}));"
								})
							}
							else {
								
								// how are we ending this statement
								var last = // if the stack has value and we are ending a block
									 endStack.length && bracketCount == -1 ? // use the last item in the block stack
									 endStack.pop() : // or use the default ending
								{
									after: ";"
								};
								
								// if we are ending a returning block
								// add the finish text which returns the result of the
								// block 
								if (last.before) {
									buff.push(last.before)
								}
								// add the remaining content
								buff.push(content, ";",last.after);
							}
							break;
						case '<%=':
						case '<%==':
							// - we have an extra { -> block
							// get the number of { minus } 
							bracketCount = bracketNum(content);
							// if we have more {, it means there is a block
							if( bracketCount ){
								// when we return to the same # of { vs } end wiht a doubleParen
								endStack.push({
									before : finishTxt,
									after: "}));"
								})
							} 
							// check if its a func like ()->
							if(quickFunc.test(content)){
								var parts = content.match(quickFunc)
								content = "function(__){var "+parts[1]+"=can.$(__);"+parts[2]+"}"
							}
							
							// if we have <%== a(function(){ %> then we want
							//  can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];
							buff.push(insert_cmd, "can.EJS."+(startTag === '<%=' ? "esc" : "txt")+"('"+tagName+"'," + status()+",this,function(){ return ", content, 
								// if we have a block
								bracketCount ? 
								// start w/ startTxt "var _v1ew = [];"
								startTxt : 
								// if not, add doubleParent to close push and text
								"}));"
								);
							break;
						}
						startTag = null;
						content = '';
						break;
					case '<%%':
						content += '<%';
						break;
					default:
						content += token;
						break;
					}
					
				}
				lastToken = token;
			}
			
			// put it together ..
			
			if ( content.length > 0 ) {
				// Should be content.dump in Ruby
				put(content)
			}
			buff.push(";")
			var template = buff.join(''),
				out = {
					out: 'with(_VIEW) { with (_CONTEXT) {' + template + " "+finishTxt+"}}"
				};
			//use eval instead of creating a function, b/c it is easier to debug
			myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL=' + name + ".js");
			return out;
		};
	
	

	/**
	 * @class can.EJS.Helpers
	 * @parent can.EJS
	 * By adding functions to can.EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * 
	 * The following helper converts a given string to upper case:
	 * 
	 * 	can.EJS.Helpers.prototype.toUpper = function(params)
	 * 	{
	 * 		return params.toUpperCase();
	 * 	}
	 * 
	 * Use it like this in any EJS template:
	 * 
	 * 	<%= toUpper('javascriptmvc') %>
	 * 
	 * To access the current DOM element return a function that takes the element as a parameter:
	 * 
	 * 	can.EJS.Helpers.prototype.upperHtml = function(params)
	 * 	{
	 * 		return function(el) {
	 * 			$(el).html(params.toUpperCase());
	 * 		}
	 * 	}
	 * 
	 * In your EJS view you can then call the helper on an element tag:
	 * 
	 * 	<div <%= upperHtml('javascriptmvc') %>></div>
	 * 
	 * 
	 * @constructor Creates a view helper.  This function 
	 * is called internally.  You should never call it.
	 * @param {Object} data The data passed to the 
	 * view.  Helpers have access to it through this._data
	 */
	EJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};
	/**
	 * @prototype
	 */
	EJS.Helpers.prototype = {
		/**
		 * Renders a partial view.  This is deprecated in favor of <code>can.View()</code>.
		 */
		view: function( url, data, helpers ) {
			return $View(url, data || this._data, helpers || this._extras); //new EJS(options).render(data, helpers);
		},
		list : function(list, cb){
			list.attr('length')
			for(var i = 0, len = list.length; i < len; i++){
				cb(list[i], i, list)
			}
		}
	};

	// options for steal's build
	can.view.register({
		suffix: "ejs",
		//returns a function that renders the view
		script: function( id, src ) {
			return "can.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src,
				name: id
			}).template.out + " })";
		},
		renderer: function( id, text ) {
			return EJS({
				text: text,
				name: id
			});
		}
	});
})(can = {}, this )