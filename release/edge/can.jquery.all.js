(function() {
 var module = { _define : window.define };
module['jquery'] = jQuery;
define = function(id, deps, value) {
	module[id] = value();
};
define.amd = { jQuery: true };

module['can/util/can.js'] = (function(){
	window.can = window.can || {};
	window.can.isDeferred = function( obj ) {
		var isFunction = this.isFunction;
		// Returns `true` if something looks like a deferred.
		return obj && isFunction(obj.then) && isFunction(obj.pipe);
	};
	return window.can;
})();
module['can/util/preamble.js'] = (function() {
// # CanJS v#{VERSION}
// (c) 2012 Bitovi  
// MIT license  
// [http://canjs.us/](http://canjs.us/)
})();
module['can/util/array/each.js'] = (function (can) {
	can.each = function (elements, callback, context) {
		var i = 0, key;
		if (elements) {
			if (typeof elements.length === 'number' && elements.pop) {
				if ( elements.attr ) {
					elements.attr('length');
				}
				for (key = elements.length; i < key; i++) {
					if (callback.call(context || elements[i], elements[i], i, elements) === false) {
						break;
					}
				}
			} else {
				for (key in elements) {
					if (callback.call(context || elements[key], elements[key], key, elements) === false) {
						break;
					}
				}
			}
		}
		return elements;
	};
})(module["can/util/can.js"]);
module['can/util/jquery/jquery.js'] = (function($, can) {
	// jquery.js
	// ---------
	// _jQuery node list._
	$.extend( can, jQuery, {
		trigger: function( obj, event, args ) {
			if ( obj.trigger ) {
				obj.trigger( event, args );
			} else {
				$.event.trigger( event, args, obj, true );
			}
		},
		addEvent: function(ev, cb){
			$([this]).bind(ev, cb);
			return this;
		},
		removeEvent: function(ev, cb){
			$([this]).unbind(ev, cb);
			return this;
		},
		// jquery caches fragments, we always needs a new one
		buildFragment : function(result, element){
			var ret = $.buildFragment([result],element);
			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment;
		},
		$: jQuery,
		each: can.each
	});

	// Wrap binding functions.
	$.each(['bind','unbind','undelegate','delegate'],function(i,func){
		can[func] = function(){
			var t = this[func] ? this : $([this]);
			t[func].apply(t, arguments);
			return this;
		};
	});

	// Wrap modifier functions.
	$.each(["append","filter","addClass","remove","data","get"], function(i,name){
		can[name] = function(wrapped){
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
		};
	});

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function( elems ) {
		$.each( elems, function( i, elem ) {
			if ( elem ) {
				can.trigger(elem,"destroyed",[],false);
			}
		});
		oldClean(elems);
	};

	return can;
})(module["jquery"], module["can/util/can.js"], module["jquery"], module["can/util/preamble.js"], module["can/util/array/each.js"]);
module['can/util/string/string.js'] = (function(can) {
	// ##string.js
	// _Miscellaneous string utility functions._  
	
	// Several of the methods in this plugin use code adapated from Prototype
	// Prototype JavaScript framework, version 1.6.0.1.
	// © 2005-2007 Sam Stephenson
	var undHash     = /_|-/,
		colons      = /\=\=/,
		words       = /([A-Z]+)([A-Z][a-z])/g,
		lowUp       = /([a-z\d])([A-Z])/g,
		dash        = /([a-z\d])([A-Z])/g,
		replacer    = /\{([^\}]+)\}/g,
		quote       = /"/g,
		singleQuote = /'/g,

		// Returns the `prop` property from `obj`.
		// If `add` is true and `prop` doesn't exist in `obj`, create it as an 
		// empty object.
		getNext = function( obj, prop, add ) {
			return prop in obj ?
				obj[ prop ] : 
				( add && ( obj[ prop ] = {} ));
		},

		// Returns `true` if the object can have properties (no `null`s).
		isContainer = function( current ) {
			return (/^f|^o/).test( typeof current );
		};

		can.extend(can, {
			// Escapes strings for HTML.
			/**
			 * @function can.esc
			 * @parent can.util
			 *
			 * `can.esc(string)` escapes a string for insertion into html.
			 * 
			 *     can.esc( "<foo>&<bar>" ) //-> "&lt;foo&lt;&amp;&lt;bar&lt;"
			 */
			esc : function( content ) {
				return ( "" + content )
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(quote, '&#34;')
					.replace(singleQuote, "&#39;");
			},
			
			/**
			 * @function can.getObject
			 * @parent can.util
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
			getObject : function( name, roots, add ) {
			
				// The parts of the name we are looking up  
				// `['App','Models','Recipe']`
				var	parts = name ? name.split('.') : [],
					length =  parts.length,
					current,
					r = 0,
					ret, i;

				// Make sure roots is an `array`.
				roots = can.isArray(roots) ? roots : [roots || window];
				
				if ( ! length ) {
					return roots[0];
				}

				// For each root, mark it as current.
				while ( roots[r] ) {
					current = roots[r];

					// Walk current to the 2nd to last object or until there 
					// is not a container.
					for (i =0; i < length - 1 && isContainer( current ); i++ ) {
						current = getNext( current, parts[i], add );
					}

					// If we can get a property from the 2nd to last object...
					if( isContainer(current) ) {
						
						// Get (and possibly set) the property.
						ret = getNext(current, parts[i], add); 
						
						// If there is a value, we exit.
						if ( ret !== undefined ) {
							// If `add` is `false`, delete the property
							if ( add === false ) {
								delete current[parts[i]];
							}
							return ret;
							
						}
					}
					r++;
				}
			},
			// Capitalizes a string.
			/**
			 * @function can.capitalize
			 * @parent can.util
			 * `can.capitalize(string)` capitalizes the first letter of the string passed.
			 *
			 *		can.capitalize('candy is fun!'); //-> Returns: 'Candy is fun!'
			 *
			 * @param {String} s the string.
			 * @return {String} a string with the first character capitalized.
			 */
			capitalize: function( s, cache ) {
				// Used to make newId.
				return s.charAt(0).toUpperCase() + s.slice(1);
			},
			
			// Underscores a string.
			/**
			 * @function can.underscore
			 * @parent can.util
			 * 
			 * Underscores a string.
			 * 
			 *     can.underscore("OneTwo") //-> "one_two"
			 * 
			 * @param {String} s
			 * @return {String} the underscored string
			 */
			underscore: function( s ) {
				return s
					.replace(colons, '/')
					.replace(words, '$1_$2')
					.replace(lowUp, '$1_$2')
					.replace(dash, '_')
					.toLowerCase();
			},
			// Micro-templating.
			/**
			 * @function can.sub
			 * @parent can.util
			 * 
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
			sub: function( str, data, remove ) {

				var obs = [];

				obs.push( str.replace( replacer, function( whole, inside ) {

					// Convert inside to type.
					var ob = can.getObject( inside, data, remove === undefined? remove : !remove );
					
					// If a container, push into objs (which will return objects found).
					if ( isContainer( ob ) ) {
						obs.push( ob );
						return "";
					} else {
						return "" + ob;
					}
				}));
				
				return obs.length <= 1 ? obs[0] : obs;
			},

			// These regex's are used throughout the rest of can, so let's make
			// them available.
			replacer : replacer,
			undHash : undHash
		});
	return can;
})(module["can/util/jquery/jquery.js"]);
module['can/construct/construct.js'] = (function(can) {

	// ## construct.js
	// `can.Construct`  
	// _This is a modified version of
	// [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
	// It provides class level inheritance and callbacks._
	
	// A private flag used to initialize a new class instance without
	// initializing it's bindings.
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
		 * with arbitrary parameters.  Typically you want to simply use the __new__ operator instead.
		 * 
		 * ## Example
		 * 
		 * The following creates a `Person` Construct and then creates a new instance of person, but
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
			// Get a raw instance object (`init` is not called).
			var inst = this.instance(),
				arg = arguments,
				args;
				
			// Call `setup` if there is a `setup`
			if ( inst.setup ) {
				args = inst.setup.apply(inst, arguments);
			}

			// Call `init` if there is an `init`  
			// If `setup` returned `args`, use those as the arguments
			if ( inst.init ) {
				inst.init.apply(inst, args || arguments);
			}

			return inst;
		},
		// Overwrites an object with methods. Used in the `super` plugin.
		// `newProps` - New properties to add.  
		// `oldProps` - Where the old properties might be (used with `super`).  
		// `addTo` - What we are adding to.
		_inherit: function( newProps, oldProps, addTo ) {
			can.extend(addTo || newProps, newProps || {})
		},
		// used for overwriting a single property.
		// this should be used for patching other objects
		// the super plugin overwrites this
		_overwrite : function(what, oldProps, propName, val){
			what[propName] = val;
		},
		// Set `defaults` as the merger of the parent `defaults` and this 
		// object's `defaults`. If you overwrite this method, make sure to
		// include option merging logic.
		/**
		 * Setup is called immediately after a constructor function is created and 
		 * set to inherit from its base constructor.  It is called with a base constructor and
		 * the params used to extend the base constructor. It is useful for setting up additional inheritance work.
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
			this.defaults = can.extend(true,{}, base.defaults, this.defaults);
		},
		// Create's a new `class` instance without initializing by setting the
		// `initializing` flag.
		instance: function() {

			// Prevents running `init`.
			initializing = 1;

			var inst = new this();

			// Allow running `init`.
			initializing = 0;

			return inst;
		},
		// Extends classes.
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
			// Figure out what was passed and normalize it.
			if ( typeof fullName != 'string' ) {
				proto = klass;
				klass = fullName;
				fullName = null;
			}

			if ( ! proto ) {
				proto = klass;
				klass = null;
			}
			proto = proto || {};

			var _super_class = this,
				_super = this.prototype,
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor).
			prototype = this.instance();
			
			// Copy the properties over onto the new prototype.
			can.Construct._inherit(proto, _super, prototype);

			// The dummy class constructor.
			function Constructor() {
				// All construction is actually done in the init method.
				if ( ! initializing ) {
					return this.constructor !== Constructor && arguments.length ?
						// We are being called without `new` or we are extending.
						arguments.callee.extend.apply(arguments.callee, arguments) :
						// We are being called with `new`.
						this.constructor.newInstance.apply(this.constructor, arguments);
				}
			}

			// Copy old stuff onto class (can probably be merged w/ inherit)
			for ( name in _super_class ) {
				if ( _super_class.hasOwnProperty(name) ) {
					Constructor[name] = _super_class[name];
				}
			}

			// Copy new static properties on class.
			can.Construct._inherit(klass, _super_class, Constructor);

			// Setup namespaces.
			if ( fullName ) {

				var parts = fullName.split('.'),
					shortName = parts.pop(),
					current = can.getObject(parts.join('.'), window, true),
					namespace = current,
					_fullName = can.underscore(fullName.replace(/\./g, "_")),
					_shortName = can.underscore(shortName);

				
				
				current[shortName] = Constructor;
			}

			// Set things that shouldn't be overwritten.
			can.extend(Constructor, {
				constructor: Constructor,
				prototype: prototype,
				/**
				 * @attribute namespace 
				 * The namespace keyword is used to declare a scope. This enables you to organize
				 * code and provides a way to create globally unique types.
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.namespace //-> MyOrg
				 * 
				 */
				namespace: namespace,
				/**
				 * @attribute shortName
				 * If you pass a name when creating a Construct, the `shortName` property will be set to the
				 * actual name without the namespace:
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.shortName //-> 'MyConstructor'
				 *     MyOrg.MyConstructor.fullName //->  'MyOrg.MyConstructor'
				 * 
				 */
				shortName: shortName,
				_shortName : _shortName,
				/**
				 * @attribute fullName 
				 * If you pass a name when creating a Construct, the `fullName` property will be set to
				 * the actual name including the full namespace:
				 * 
				 *     can.Construct("MyOrg.MyConstructor",{},{})
				 *     MyOrg.MyConstructor.shortName //-> 'MyConstructor'
				 *     MyOrg.MyConstructor.fullName //->  'MyOrg.MyConstructor'
				 * 
				 */
				fullName: fullName,
				_fullName: _fullName
			});

			// Make sure our prototype looks nice.
			Constructor.prototype.constructor = Constructor;

			
			// Call the class `setup` and `init`
			var t = [_super_class].concat(can.makeArray(arguments)),
				args = Constructor.setup.apply(Constructor, t );
			
			if ( Constructor.init ) {
				Constructor.init.apply(Constructor, args || t );
			}

			/**
			 * @prototype
			 */
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
			//  
			/** 
			 * @function init
			 * 
			 * If a prototype `init` method is provided, it gets called after [can.Construct::setup] when a new instance
			 * is created. The `init` method is where your constructor code should go. Typically,
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
			 *         return "I am " + this.first + " " + this.last + ". " +
			 *                "I write " + this.lang + ".";
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
			 * It doesn't matter what init returns because the `new` keyword always
			 * returns the new object.
			 */
			//  
			/**
			 * @attribute constructor
			 * 
			 * A reference to the constructor function that created the instance. It allows you to access
			 * the constructor function's static properties from an instance.
			 * 
			 * ## Example
			 * 
			 * Incrementing a static counter, that counts how many instances have been created:
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
	return can.Construct;
})(module["can/util/string/string.js"]);
module['can/construct/proxy/proxy.js'] = (function(can, Construct){
var isFunction = can.isFunction,
	isArray = can.isArray,
	makeArray = can.makeArray,

proxy = function( funcs ) {

			//args that should be curried
			var args = makeArray(arguments),
				self;

			// get the functions to callback
			funcs = args.shift();

			// if there is only one function, make funcs into an array
			if (!isArray(funcs) ) {
				funcs = [funcs];
			}
			
			// keep a reference to us in self
			self = this;
			
			
			return function class_cb() {
				// add the arguments after the curried args
				var cur = args.concat(makeArray(arguments)),
					isString, 
					length = funcs.length,
					f = 0,
					func;
				
				// go through each function to call back
				for (; f < length; f++ ) {
					func = funcs[f];
					if (!func ) {
						continue;
					}
					
					// set called with the name of the function on self (this is how this.view works)
					isString = typeof func == "string";
					
					// call the function
					cur = (isString ? self[func] : func).apply(self, cur || []);
					
					// pass the result to the next function (if there is a next function)
					if ( f < length - 1 ) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		}
	can.Construct.proxy = can.Construct.prototype.proxy = proxy;
	return can;
})(module["can/util/jquery/jquery.js"], module["can/construct/construct.js"]);
module['can/construct/super/super.js'] = (function(can, Construct){

// tests if we can get super in .toString()
	var isFunction = can.isFunction,
		
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/;
		
		// overwrites a single property so it can still call super
		can.Construct._overwrite = function(addTo, base, name, val){
			// Check if we're overwriting an existing function
			addTo[name] = isFunction(val) && 
							  isFunction(base[name]) && 
							  fnTest.test(val) ? (function( name, fn ) {
					return function() {
						var tmp = this._super,
							ret;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = base[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, val) : val;
		}
		// overwrites an object with methods, sets up _super
		//   newProps - new properties
		//   oldProps - where the old properties might be
		//   addTo - what we are adding to
		can.Construct._inherit = function( newProps, oldProps, addTo ) {
			addTo = addTo || newProps
			for ( var name in newProps ) {
				can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
			}
		}

	return can;
})(module["can/util/jquery/jquery.js"], module["can/construct/construct.js"]);
module['can/control/control.js'] = (function( can ) {
	// ## control.js
	// `can.Control`  
	// _Controller_
	
	// Binds an element, returns a function that unbinds.
	var bind = function( el, ev, callback ) {

			can.bind.call( el, ev, callback );

			return function() {
				can.unbind.call(el, ev, callback);
			};
		},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
		paramReplacer = /\{([^\}]+)\}/g,
		special = can.getObject("$.event.special") || {},

		// Binds an element, returns a function that unbinds.
		delegate = function( el, selector, ev, callback ) {
			can.delegate.call(el, selector, ev, callback);
			return function() {
				can.undelegate.call(el, selector, ev, callback);
			};
		},
		
		// Calls bind or unbind depending if there is a selector.
		binder = function( el, ev, callback, selector ) {
			return selector ?
				delegate( el, can.trim( selector ), ev, callback ) : 
				bind( el, ev, callback );
		},
		
		basicProcessor;
	
	/**
	 * @add can.Control
	 */
	var Control = can.Control = can.Construct(
	/** 
	 * @Static
	 */
	{
		// Setup pre-processes which methods are event listeners.
		/**
		 * @hide
		 * 
		 * Setup pre-process which methods are event listeners.
		 * 
		 */
		setup: function() {

			// Allow contollers to inherit "defaults" from super-classes as it 
			// done in `can.Construct`
			can.Construct.setup.apply( this, arguments );

			// If you didn't provide a name, or are `control`, don't do anything.
			if ( can.Control ) {

				// Cache the underscored names.
				var control = this,
					funcName;

				// Calculate and cache actions.
				control.actions = {};
				for ( funcName in control.prototype ) {
					if ( control._isAction(funcName) ) {
						control.actions[funcName] = control._action(funcName);
					}
				}
			}
		},

		// Moves `this` to the first argument, wraps it with `jQuery` if it's an element
		_shifter : function( context, name ) {

			var method = typeof name == "string" ? context[name] : name;

			if ( ! isFunction( method )) {
				method = context[ method ];
			}
			
			return function() {
				context.called = name;
				return method.apply(context, [this.nodeName ? can.$(this) : this].concat( slice.call(arguments, 0)));
			};
		},

		// Return `true` if is an action.
		/**
		 * @hide
		 * @param {String} methodName a prototype function
		 * @return {Boolean} truthy if an action or not
		 */
		_isAction: function( methodName ) {
			
			var val = this.prototype[methodName],
				type = typeof val;
			// if not the constructor
			return (methodName !== 'constructor') &&
				// and is a function or links to a function
				( type == "function" || (type == "string" &&  isFunction(this.prototype[val] ) ) ) &&
				// and is in special, a processor, or has a funny character
				!! ( special[methodName] || processors[methodName] || /[^\w]/.test(methodName) );
		},
		// Takes a method name and the options passed to a control
		// and tries to return the data necessary to pass to a processor
		// (something that binds things).
		/**
		 * @hide
		 * Takes a method name and the options passed to a control
		 * and tries to return the data necessary to pass to a processor
		 * (something that binds things).
		 * 
		 * For performance reasons, this called twice.  First, it is called when 
		 * the Control class is created.  If the methodName is templated
		 * like: "{window} foo", it returns null.  If it is not templated
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
			
			// If we don't have options (a `control` instance), we'll run this 
			// later.  
			paramReplacer.lastIndex = 0;
			if ( options || ! paramReplacer.test( methodName )) {
				// If we have options, run sub to replace templates `{}` with a
				// value from the options or the window
				var convertedName = options ? can.sub(methodName, [options, window]) : methodName,
					
					// If a `{}` template resolves to an object, `convertedName` will be
					// an array
					arr = can.isArray(convertedName),

					// Get the name
					name = arr ? convertedName[1] : convertedName,

					// Grab the event off the end
					parts = name.split(/\s+/g),
					event = parts.pop();

				return {
					processor: processors[event] || basicProcessor,
					parts: [name, parts.join(" "), event],
					delegate : arr ? convertedName[0] : undefined
				};
			}
		},
		// An object of `{eventName : function}` pairs that Control uses to 
		// hook up events auto-magically.
		/**
		 * @attribute processors
		 * An object of `{eventName : function}` pairs that Control uses to hook up events
		 * auto-magically.  A processor function looks like:
		 * 
		 *     can.Control.processors.
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
		 *     Sized = can.Control({
		 *       "{window} resize": function(){
		 *         this.element.width( this.element.parent().width() / 2 );
		 *       }
		 *     });
		 *     
		 *     new Sized( $( '#foo' ) );
		 */
		processors: {},
		// A object of name-value pairs that act as default values for a 
		// control instance
		/**
		 * @attribute defaults
		 * A object of name-value pairs that act as default values for a control's 
		 * [can.Control::options this.options].
		 * 
		 *     Message = can.Control({
		 *       defaults: {
		 *         message: "Hello World"
		 *       }
		 *     }, {
		 *       init: function(){
		 *         this.element.text( this.options.message );
		 *       }
		 *     });
		 *     
		 *     new Message( "#el1" ); //writes "Hello World"
		 *     new Message( "#el12", { message: "hi" } ); //writes hi
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
		// Sets `this.element`, saves the control in `data, binds event
		// handlers.
		/**
		 * Setup is where most of control's magic happens.  It does the following:
		 * 
		 * ### Sets this.element
		 * 
		 * The first parameter passed to new Control( el, options ) is expected to be 
		 * an element.  This gets converted to a Wrapped NodeList element and set as
		 * [can.Control.prototype.element this.element].
		 * 
		 * ### Adds the control's name to the element's className.
		 * 
		 * Control adds it's plugin name to the element's className for easier 
		 * debugging.  For example, if your Control is named "Foo.Bar", it adds
		 * "foo_bar" to the className.
		 * 
		 * ### Saves the control in $.data
		 * 
		 * A reference to the control instance is saved in $.data.  You can find 
		 * instances of "Foo.Bar" like: 
		 * 
		 *     $( '#el' ).data( 'controls' )[ 'foo_bar' ]
		 *
		 * ### Merges Options
		 * Merges the default options with optional user-supplied ones.
		 * Additionally, default values are exposed in the static [can.Control.static.defaults defaults] 
		 * so that users can change them.
		 * 
		 * ### Binds event handlers
		 * 
		 * Setup does the event binding described in [can.control.listening Listening To Events].
		 * 
		 * @param {HTMLElement} element the element this instance operates on.
		 * @param {Object} [options] option values for the control.  These get added to
		 * this.options and merged with [can.Control.static.defaults defaults].
		 * @return {Array} return an array if you wan to change what init is called with. By
		 * default it is called with the element and options passed to the control.
		 */
		setup: function( element, options ) {

			var cls = this.constructor,
				pluginname = cls.pluginName || cls._fullName,
				arr;

			// Want the raw element here.
			this.element = can.$(element)

			if ( pluginname && pluginname !== 'can_control') {
				// Set element and `className` on element.
				this.element.addClass(pluginname);
			}
			
			(arr = can.data(this.element,"controls")) || can.data(this.element,"controls",arr = []);
			arr.push(this);
			
			// Option merging.
			/**
			 * @attribute options
			 * 
			 * Options are used to configure an control.  They are
			 * the 2nd argument
			 * passed to a control (or the first argument passed to the 
			 * [can.Control.plugin control's jQuery plugin]).
			 * 
			 * For example:
			 * 
			 *     can.Control('Hello')
			 *     
			 *     var h1 = new Hello( $( '#content1' ), { message: 'World' } );
			 *     equal( h1.options.message , "World" );
			 *     
			 *     var h2 = $( '#content2' ).hello({ message: 'There' })
			 *                              .control();
			 *     equal( h2.options.message , "There" );
			 * 
			 * Options are merged with [can.Control.static.defaults defaults] in
			 * [can.Control.prototype.setup setup].
			 * 
			 * For example:
			 * 
			 *     Tabs = can.Control({
			 *        defaults: {
			 *          activeClass: "ui-active-state"
			 *        }
			 *     }, {
			 *        init: function(){
			 *          this.element.addClass( this.options.activeClass );
			 *        }
			 *     });
			 *     
			 *     new Tabs( $( "#tabs1" ) ); // adds 'ui-active-state'
			 *     new Tabs( $( "#tabs2" ), { activeClass : 'active' } ); // adds 'active'
			 *     
			 * Options are typically updated by calling 
			 * [can.Control.prototype.update update];
			 *
			 */
			this.options = extend({}, cls.defaults, options);

			// Bind all event handlers.
			this.on();

			// Get's passed into `init`.
			/**
			 * @attribute element
			 * 
			 * The control instance's HTMLElement (or window) wrapped by the 
			 * util library for ease of use. It is set by the first
			 * parameter to `new can.Construct( element, options )` 
			 * in [can.Control::setup].  Control listens on `this.element`
			 * for events.
			 * 
			 * ### Quick Example
			 * 
			 * The following `HelloWorld` control sets the control`s text to "Hello World":
			 * 
			 *     HelloWorld = can.Control({
			 *       init: function(){
			 * 	       this.element.text( 'Hello World' );
			 *       }
			 *     });
			 *     
			 *     // create the controller on the element
			 *     new HelloWorld( document.getElementById( '#helloworld' ) );
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
			 *       setup: function( el, options ) {
			 *          this.oldElement = $( el );
			 *          var newEl = $( '<div/>' );
			 *          this.oldElement.wrap( newEl );
			 *          can.Controll.prototype.setup.call( this, newEl, options );
			 *       },
			 *       init: function() {
			 *          this.element //-> the div
			 *       },
			 *       ".option click": function() {
			 *         // event handler bound on the div
			 *       },
			 *       destroy: function() {
			 *          var div = this.element; //save reference
			 *          can.Control.prototype.destroy.call( this );
			 *          div.replaceWith( this.oldElement );
			 *       }
			 *     });
			 * 
			 * ### unbining, setting, and rebinding.
			 * 
			 * You could also change this.element by calling
			 * [can.Control::off], setting this.element, and 
			 * then calling [can.Control::on] like:
			 * 
			 *     move: function( newElement ) {
			 *        this.off();
			 *        this.element = $( newElement );
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
		 *       "{task} completed": function(){
		 * 	       this.update();
		 *       },
		 *       update: function(){
		 *         if ( this.options.task.completed ) {
		 * 	         this.element.addClass( 'strike' );
		 * 	       } else {
		 *           this.element.removeClass( 'strike' );
		 *         }
		 *       }
		 *     });
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({ completed: 'true' }) 
		 *     });
		 * 
		 * To update the taskstriker's task, add a task method that updates
		 * this.options and calls rebind like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed": function(){
		 * 	       this.update();
		 *       },
		 *       update: function() {
		 *         if ( this.options.task.completed ) {
		 * 	         this.element.addClass( 'strike' );
		 * 	       } else {
		 *           this.element.removeClass( 'strike' );
		 *         }
		 *       },
		 *       task: function( newTask ) {
		 *         this.options.task = newTask;
		 *         this.on();
		 *         this.update();
		 *       }
		 *     });
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({ completed: true }) 
		 *     });
		 *     taskstriker.task( new TaskStriker({ 
		 *       task: new Task({ completed: false }) 
		 *     }));
		 * 
		 * ## Adding new events
		 * 
		 * If events need to be bound to outside of the control and templated event handlers
		 * are not sufficent, you can call this.on to bind or delegate programatically:
		 * 
		 *     init: function() {
		 *        // calls somethingClicked( el, ev )
		 *        this.on( 'click', 'somethingClicked' ); 
		 *     
		 *        // calls function when the window is clicked
		 *        this.on( window, 'click', function( ev ) {
		 *          //do something
		 *        });
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

				// Adds bindings.
				this.off();

				// Go through the cached list of actions and use the processor 
				// to bind
				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element,
					destroyCB = can.Control._shifter(this,"destroy"),
					funcName, ready;
					
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
	
	
				// Setup to be destroyed...  
				// don't bind because we don't want to remove it.
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

			if(func === undefined) {
				func = eventName;
				eventName = selector;
				selector = null;
			}

			if ( typeof func == 'string' ) {
				func = can.Control._shifter(this,func);
			}

			this._bindings.push( binder( el, eventName, func, selector ));

			return this._bindings.length;
		},
		// Unbinds all event handlers on the controller.
		/**
		 * @hide
		 * Unbinds all event handlers on the controller. You should never
		 * be calling this unless in use with [can.Control::on].
		 */
		off : function(){
			var el = this.element[0]
			each(this._bindings || [], function( value ) {
				value(el);
			});
			// Adds bindings.
			this._bindings = [];
		},
		// Prepares a `control` for garbage collection
		/**
		 * @function destroy
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
		 *       "{window} click": function() {
		 * 	       this.element.html( this.count ? 
		 * 	                          this.count++ : this.count = 0 );
		 *       }  
		 *     });
		 *     
		 *     // create a clicker on an element
		 *     new Clicker( "#clickme" );
		 * 
		 *     // remove the element
		 *     $( '#clickme' ).remove();
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
		 *       init: function() {
		 *         this.oldText = this.element.text();
		 *         this.element.text( "Changed!!!" );
		 *       },
		 *       destroy: function() {
		 *         this.element.text( this.oldText );
		 *         can.Control.prototype.destroy.call( this );
		 *       }
		 *     });
		 *     
		 *     // create a changer which changes #myel's text
		 *     var changer = new Changer( '#myel' );
		 * 
		 *     // destroy changer which will reset it
		 *     changer.destroy();
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
			
			// Unbind bindings.
			this.off();
			
			if(pluginName && pluginName !== 'can_control'){
				// Remove the `className`.
				this.element.removeClass(pluginName);
			}
			
			// Remove from `data`.
			controls = can.data(this.element,"controls");
			controls.splice(can.inArray(this, controls),1);
			
			can.trigger( this, "destroyed"); // In case we want to know if the `control` is removed.
			
			this.element = null;
		}
	});

	var processors = can.Control.processors,
	// Processors do the binding.
	// They return a function that unbinds when called.  
	//
	// The basic processor that binds events.
	basicProcessor = function( el, event, selector, methodName, control ) {
		return binder( el, event, can.Control._shifter(control, methodName), selector);
	};




	// Set common events to be processed as a `basicProcessor`
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", 
		 "keypress", "mousedown", "mousemove", "mouseout", "mouseover", 
		 "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
		 "focusout", "mouseenter", "mouseleave"], function( v ) {
		processors[v] = basicProcessor;
	});

	return Control;
})(module["can/util/jquery/jquery.js"], module["can/construct/construct.js"]);
module['can/control/plugin/plugin.js'] = (function($, can) {
//used to determine if a control instance is one of controllers
//controllers can be strings or classes
var i, 
	isAControllerOf = function( instance, controllers ) {
		for ( i = 0; i < controllers.length; i++ ) {
			if ( typeof controllers[i] == 'string' ? instance.constructor._shortName == controllers[i] : instance instanceof controllers[i] ) {
				return true;
			}
		}
		return false;
	},
	data = function(el, data){
		return $el.data('controls');
	},
	makeArray = can.makeArray,
	old = can.Control.setup;

/*
 * static
 */
can.Control.setup = function() {
	// if you didn't provide a name, or are control, don't do anything
	if ( this !== can.Control ) {

		/**
		 * @attribute can.Control.plugin.static.pluginName
		 * @parent can.Control.plugin
		 *
		 * Setting the static `pluginName` property allows you to override the default name
		 * with your own.
		 *
		 *		var Filler = can.Control({
		 *		  pluginName: 'fillWith'
		 *		},{});
		 * 
		 *		$("#foo").fillWith();
		 *
		 * If you don't provide a `pluginName`, the control falls back to the
		 * [can.Construct.fullName fullName] attribute:
		 *
		 *		can.Control('Ui.Layout.FillWith', {}, {});
		 *		$("#foo").ui_layout_fill_with();
		 *
		 */
		var pluginName = this.pluginName || this._fullName;
			
		// create jQuery plugin
		if(pluginName !== 'can_control'){
			this.plugin(pluginName);
		}
			
		old.apply(this, arguments);
	}
};

/*
 * prototype
 */
$.fn.extend({

	/**
	 * @function jQuery.fn.controls
	 * @parent can.Control.plugin
	 * 
	 * When the widget is initialized, the plugin control creates an array 
	 * of control instance(s) with the DOM element it was initialized on using 
	 * [can.data] method.
	 *
	 * The `controls` method allows you to get the control instance(s) for any element.  
	 *
	 *		//- Inits the widgets
	 *		$('.widgets:eq(0)').my_box();
	 *		$('.widgets:eq(1)').my_clock();
	 *
	 *		<div class="widgets my_box" />
	 *		<div class="widgets my_clock" />
	 *
	 *		$('.widgets').controls() //-> [ MyBox, MyClock ]
	 *
	 * Additionally, you can invoke it passing the name of a control
	 * to fetch a specific instance(s).
	 *
	 *		//- Inits the widgets
	 *		$('.widgets:eq(0)').my_box();
	 *		$('.widgets:eq(1)').my_clock();
	 *
	 *		<div class="widgets my_box" />
	 *		<div class="widgets my_clock" />
	 *
	 *		$('.widgets').controls('MyBox') //-> [ MyBox ]
	 *
	 * @param {Object} control (optional) if exists the control instance(s) with that constructor function or type will be returned.
	 * @return {Array} an array of control instance(s).
	 */
	controls: function() {
		var controllerNames = makeArray(arguments),
			instances = [],
			controls, c, cname;
		//check if arguments
		this.each(function() {

			controls = can.$(this).data("controls");
			if(!controls){
				return;
			}
			for(var i=0; i<controls.length; i++){
				c = controls[i];
				if (!controllerNames.length || isAControllerOf(c, controllerNames) ) {
					instances.push(c);
				}
			}
		});
		return instances;
	},
	
	/**
	 * @function jQuery.fn.control
	 * @parent can.Control.plugin
	 * 
	 * The `control` does the same as [jQuery.fn.controls controls] execept it only 
	 * returns the first instance found.
	 *
	 *		//- Init MyBox widget
	 *		$('.widgets').my_box();
	 *
	 *		<div class="widgets my_box" />
	 *
	 *		$('.widgets').controls() //-> MyBox
	 *
	 * @param {Object} control (optional) if exists the first control instance with that constructor function or type will be returned.
	 * @return {can.Control} the first control.
	 */
	control: function( control ) {
		return this.controls.apply(this, arguments)[0];
	}
});

can.Control.plugin = function(pluginname){
	var control = this;

	if (!$.fn[pluginname]) {
		$.fn[pluginname] = function(options){
		
			var args = makeArray(arguments),   //if the arg is a method on this control
			isMethod = typeof options == "string" && $.isFunction(control.prototype[options]), meth = args[0],
			returns;
			this.each(function(){
				//check if created
				var plugin = can.$(this).control(control);
				
				if (plugin) {
					if (isMethod) {
						// call a method on the control with the remaining args
						returns = plugin[meth].apply(plugin, args.slice(1));
					}
					else {
						// call the plugin's update method
						plugin.update.apply(plugin, args);
					}
				}
				else {
					//create a new control instance
					control.newInstance.apply(control, [this].concat(args));
				}
			});
			return returns !== undefined ? returns : this;
		};
	}
}

/**
 * @function can.Control.prototype.update
 * @parent can.Control.plugin
 * 
 * Update extends [can.Control.prototype.options options] 
 * with the `options` argument and rebinds all events.  It 
 * re-configures the control.
 * 
 * For example, the following control wraps a recipe form. When the form
 * is submitted, it creates the recipe on the server.  When the recipe
 * is `created`, it resets the form with a new instance.
 * 
 *		var Creator = can.Control({
 *		  "{recipe} created" : function(){
 *		    this.update({recipe : new Recipe()});
 *		    this.element[0].reset();
 *		    this.element.find("[type=submit]").val("Create Recipe")
 *		  },
 *		  "submit" : function(el, ev){
 *		    ev.preventDefault();
 *		    var recipe = this.options.recipe;
 *			recipe.attrs( this.element.formParams() );
 *			this.element.find("[type=submit]").val("Saving...")
 *			recipe.save();
 *		  }
 *		});
 *
 *		$('#createRecipes').creator({ recipe : new Recipe() })
 * 
 * *Update* is called if a control's plugin helper is called with the plugin options on an element
 * that already has a control instance of the same type. If you want to implement your
 * own update method make sure to call the old one either using the [can.Construct.super super] plugin or
 * by calling `can.Control.prototype.update.apply(this, arguments);`.
 * For example, you can change the content of the control element every time the options change:
 * 
 *		var Plugin = can.Control({
 *		    pluginName: 'myPlugin'
 *		  }, {
 *		    init : function(el, options) {
 *			  this.updateCount = 0;
 *			  this.update({
 *			    text : 'Initialized'
 *			  });
 *			},
 *			update : function(options) {
 *			  // Call the can.Control update first.
 *			  // Use this._super when using can/construct/super
 *			  can.Control.prototype.update.call(this, options);
 *			  this.element.html(this.options.text + ' ' +
 *			    (++this.updateCount) + ' times');
 *			}
 *		});
 *
 *		$('#control').myPlugin();
 *		$('#control').html();
 *		// Initialized. Updated 1 times
 *
 *		$('#control').myPlugin({ text : 'Calling update. Updated' });
 *		$('#control').html();
 *		// Calling update. Updated 2 times
 *
 * @demo can/control/plugin/demo-update.html
 * 
 * @param {Object} options A list of options to merge with 
 * [can.Control.prototype.options this.options].  Often this method
 * is called by the [can.Control.plugin jQuery helper function].
 */
can.Control.prototype.update = function( options ) {
		can.extend(this.options, options);
		this.on();
};

})(module["jquery"], module["can/util/jquery/jquery.js"], module["can/control/control.js"]);
module['can/util/function/function.js'] = (function( can ) {

  can.extend( can, {

    debounce : function( fn, time, context ) {

      var timeout;

      return function() {

        var args = arguments;
            
        context = context || this;

        clearTimeout( timeout );
        timeout = setTimeout(function() {
          fn.apply( context, args );
        }, time );
      };

    },

    throttle : function( fn, time, context ) {

      var run;

      return function() {

        var args = arguments;

        context = context || this;

        if ( ! run ) {
          run = true;
          setTimeout(function() {
            fn.apply( context, args );
            run = false;
          }, time );
        }

      };
    },

    defer : function( fn, context ) {

      var args = arguments;
      context = context || this;

      setTimeout(function() {
        fn.apply( context, args );
      }, 0 );

    }

  });

  return can;
})(module["can/util/jquery/jquery.js"]);
module['can/control/modifier/modifier.js'] = (function() {

	// Hang on to original action
	var originalSetup = can.Control.setup,
		processors = can.Control.processors,
		modifier =  {
			delim: ":",
			hasModifier: function( name ) {
				return name.indexOf( modifier.delim ) !== -1;
			},
			modify: function( name, fn, options ) {
				var parts = name.match(/([\w]+)\((.+)\)/),
					mod, args;

				if ( parts ) {
					mod = can.getObject( parts[1], [options || {}, can, window] );
					args = can.sub( parts[2], [options || {}, can, window] ).split(",");
					if ( mod ) {
						args.unshift( fn );
						fn = mod.apply( null, args );
					}
				}

				return fn;
			},
			addProcessor : function( event, mod ) {

				var processorName = [event, mod].join( modifier.delim );
				
				processors[ processorName ] = function( el, nil, selector, methodName, control ) {

					var callback = modifier.modify( mod, can.Control._shifter(control, methodName), control.options );
					control[event] = callback;

					if ( selector ) {
						can.bind( el, event, callback );
						return function() {
							can.unbind( el, event, callback );
						};
					} else {
						selector = can.trim( selector );
						can.delegate.call(el, selector, event, callback);
						return function() {
							can.undelegate.call(el, selector, event, callback);
						};
					}


				};
			}
		};

	// Redefine _isAction to handle new syntax
	can.extend( can.Control, {

		modifier: modifier,

		setup: function( el, options ) {

			can.each( this.prototype, function( fn, key, prototype ) {
				var parts, event, mod;
				if ( modifier.hasModifier( key )) {
					// Figure out parts
					parts = key.split( modifier.delim );
					event = parts.shift().split(" ").pop();
					mod = parts.join("");

					if ( ! ( can.trim( key ) in processors )) {
						modifier.addProcessor( event, mod );
					}

				}
			});

			originalSetup.apply( this, arguments );

		}

	});

})(module["can/control/control.js"], module["can/util/function/function.js"]);
module['can/view/view.js'] = (function( can ) {
	// ## view.js
	// `can.view`  
	// _Templating abstraction._

	var isFunction = can.isFunction,
		makeArray = can.makeArray,
		// Used for hookup `id`s.
		hookupId = 1,
	/**
	 * @add can.view
	 */
	$view = can.view = function(view, data, helpers, callback){
		// Get the result.
		var result = $view.render(view, data, helpers, callback);
		if(can.isFunction(result))  {
			return result;
		}
		if(can.isDeferred(result)){
			return result.pipe(function(result){
				return $view.frag(result);
			});
		}
		
		// Convert it into a dom frag.
		return $view.frag(result);
	};

	can.extend( $view, {
		// creates a frag and hooks it up all at once
		frag: function(result, parentNode ){
			return $view.hookup( $view.fragment(result), parentNode );
		},
		// simply creates a frag
		// this is used internally to create a frag
		// insert it
		// then hook it up
		fragment: function(result){
			var frag = can.buildFragment(result,document.body);
			// If we have an empty frag...
			if(!frag.childNodes.length) { 
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		},
    // Convert a path like string into something that's ok for an `element` ID.
    toId : function( src ) {
      return can.map(src.toString().split(/\/|\./g), function( part ) {
        // Dont include empty strings in toId functions
        if ( part ) {
          return part;
        }
      }).join("_");
    },
		hookup: function(fragment, parentNode ){
			var hookupEls = [],
				id, 
				func;
			
			// Get all `childNodes`.
			can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function(node){
				if(node.nodeType === 1){
					hookupEls.push(node);
					hookupEls.push.apply(hookupEls, can.makeArray( node.getElementsByTagName('*')));
				}
			});

			// Filter by `data-view-id` attribute.
			can.each( hookupEls, function( el ) {
				if ( el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id]) ) {
					func(el, parentNode, id);
					delete $view.hookups[id];
					el.removeAttribute('data-view-id');
				}
			});

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
		cachedRenderers: {},
		/**
		 * @attribute cache
		 * By default, views are cached on the client.  If you'd like the
		 * the views to reload from the server, you can set the `cache` attribute to `false`.
		 *
		 * 		//- Forces loads from server
		 * 		can.view.cache = false; 
		 *
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
		 * This is set to `.ejs` by default.
		 *
		 * 		// Changes view ext to 'txt'
		 * 		can.view.ext = 'txt';
		 *
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
		/**
		 * @function render
		 * `can.view.render(view, data, [helpers], callback)` returns the rendered markup produced by the corresponding template
		 * engine as String. If you pass a deferred object in as data, render returns
		 * a deferred resolving to the rendered markup.
		 * 
		 * `can.view.render` is commonly used for sub-templates.
		 * 
		 * ## Example
		 * 
		 * _welcome.ejs_ looks like:
		 * 
		 *     <h1>Hello <%= hello %></h1>
		 * 
		 * Render it to a string like:
		 * 
		 *     can.view.render("welcome.ejs",{hello: "world"})
		 *       //-> <h1>Hello world</h1>
		 * 
		 * ## Use as a Subtemplate
		 * 
		 * If you have a template like:
		 * 
		 *     <ul>
		 *       <% list(items, function(item){ %>
		 *         <%== can.view.render("item.ejs",item) %>
		 *       <% }) %>
		 *     </ul>
		 * 
		 * @param {String|Object} view the path of the view template or a view object
		 * @param {Object} data the object passed to a template
		 * @param {Object} [helpers] additional helper methods to be passed to the view template
		 * @param {Function} [callback] function executed after template has been processed
		 * @param {String|Object} returns a string of processed text or a deferred that resolves to the processed text
		 * 
		 */
		render: function( view, data, helpers, callback ) {
			// If helpers is a `function`, it is actually a callback.
			if ( isFunction( helpers )) {
				callback = helpers;
				helpers = undefined;
			}

			// See if we got passed any deferreds.
			var deferreds = getDeferreds(data);


			if ( deferreds.length ) { // Does data contain any deferreds?
				// The deferred that resolves into the rendered content...
				var deferred = new can.Deferred();
	
				// Add the view request to the list of deferreds.
				deferreds.push(get(view, true))
	
				// Wait for the view and all deferreds to finish...
				can.when.apply(can, deferreds).then(function( resolved ) {
					// Get all the resolved deferreds.
					var objs = makeArray(arguments),
						// Renderer is the last index of the data.
						renderer = objs.pop(),
						// The result of the template rendering with data.
						result; 
	
					// Make data look like the resolved deferreds.
					if ( can.isDeferred(data) ) {
						data = usefulPart(resolved);
					}
					else {
						// Go through each prop in data again and
						// replace the defferreds with what they resolved to.
						for ( var prop in data ) {
							if ( can.isDeferred(data[prop]) ) {
								data[prop] = usefulPart(objs.shift());
							}
						}
					}
					// Get the rendered result.
					result = renderer(data, helpers);
	
					// Resolve with the rendered view.
					deferred.resolve(result); 
					// If there's a `callback`, call it back with the result.
					callback && callback(result);
				});
				// Return the deferred...
				return deferred;
			}
			else {
				// No deferreds! Render this bad boy.
				var response, 
					// If there's a `callback` function
					async = isFunction( callback ),
					// Get the `view` type
					deferred = get(view, async);
	
				// If we are `async`...
				if ( async ) {
					// Return the deferred
					response = deferred;
					// And fire callback with the rendered result.
					deferred.then(function( renderer ) {
						callback(data ? renderer(data, helpers) : renderer);
					})
				} else {
					// if the deferred is resolved, call the cached renderer instead
					// this is because it's possible, with recursive deferreds to
					// need to render a view while its deferred is _resolving_.  A _resolving_ deferred
					// is a deferred that was just resolved and is calling back it's success callbacks.
					// If a new success handler is called while resoliving, it does not get fired by
					// jQuery's deferred system.  So instead of adding a new callback
					// we use the cached renderer.
					// We also add __view_id on the deferred so we can look up it's cached renderer.
					// In the future, we might simply store either a deferred or the cached result.
					if(deferred.state() === "resolved" && deferred.__view_id  ){
						var currentRenderer = $view.cachedRenderers[ deferred.__view_id ];
						return data ? currentRenderer(data, helpers) : currentRenderer;
					} else {
						// Otherwise, the deferred is complete, so
						// set response to the result of the rendering.
						deferred.then(function( renderer ) {
							response = data ? renderer(data, helpers) : renderer;
						});
					}
					
				}
	
				return response;
			}
		}
	});

	// Makes sure there's a template, if not, have `steal` provide a warning.
	var	checkText = function( text, url ) {
			if ( ! text.length ) {
				
				throw "can.view: No template or empty template:" + url;
			}
		},
		// `Returns a `view` renderer deferred.  
		// `url` - The url to the template.  
		// `async` - If the ajax request should be asynchronous.  
		// Returns a deferred.
		get = function( url, async ) {
			
			
			var suffix = url.match(/\.[\w\d]+$/),
			type, 
			// If we are reading a script element for the content of the template,
			// `el` will be set to that script element.
			el, 
			// A unique identifier for the view (used for caching).
			// This is typically derived from the element id or
			// the url for the template.
			id, 
			// The ajax request used to retrieve the template content.
			jqXHR, 
			// Used to generate the response.
			response = function( text, d ) {
				// Get the renderer function.
				var func = type.renderer(id, text);
				d = d || new can.Deferred();
				
				// Cache if we are caching.
				if ( $view.cache ) {
					$view.cached[id] = d;
					d.__view_id = id;
					$view.cachedRenderers[id] = func;
				}
				d.resolve(func);
				// Return the objects for the response's `dataTypes`
				// (in this case view).
				return d;
			};

			//If the url has a #, we assume we want to use an inline template
			//from a script element and not current page's HTML
			if( url.match(/^#/) ) {
				url = url.substr(1);
			}
			// If we have an inline template, derive the suffix from the `text/???` part.
			// This only supports `<script>` tags.
			if ( el = document.getElementById(url) ) {
				suffix = "."+el.type.match(/\/(x\-)?(.+)/)[2];
			}
	
			// If there is no suffix, add one.
			if (!suffix && !$view.cached[url] ) {
				url += ( suffix = $view.ext );
			}

			if ( can.isArray( suffix )) {
				suffix = suffix[0]
			}
	
			// Convert to a unique and valid id.
			id = can.view.toId(url);
	
			// If an absolute path, use `steal` to get it.
			// You should only be using `//` if you are using `steal`.
			if ( url.match(/^\/\//) ) {
				var sub = url.substr(2);
				url = ! window.steal ? 
					"/" + sub : 
					steal.config().root.mapJoin(sub);
			}
	
			// Set the template engine type.
			type = $view.types[suffix];
	
			// If it is cached, 
			if ( $view.cached[id] ) {
				// Return the cached deferred renderer.
				return $view.cached[id];
			
			// Otherwise if we are getting this from a `<script>` element.
			} else if ( el ) {
				// Resolve immediately with the element's `innerHTML`.
				return response(el.innerHTML);
			} else {
				// Make an ajax request for text.
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
						// Make sure we got some text back.
						checkText(text, url);
						response(text, d)
					}
				});
				return d;
			}
		},
		// Gets an `array` of deferreds from an `object`.
		// This only goes one level deep.
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
		// Gets the useful part of a resolved deferred.
		// This is for `model`s and `can.ajax` that resolve to an `array`.
		usefulPart = function( resolved ) {
			return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved
		};
	
	
	if ( window.steal ) {
		steal.type("view js", function( options, success, error ) {
			var type = can.view.types["." + options.type],
				id = can.view.toId(options.id);
			/**
			 * should return something like steal("dependencies",function(EJS){
			 * 	 return can.view.preload("ID", options.text)
			 * })
			 */
			options.text = "steal('" + (type.plugin || "can/view/" + options.type) + "',function(can){return " + "can.view.preload('" + id + "'," + options.text + ");\n})";
			success();
		})
	}

	//!steal-pluginify-remove-start
	can.extend(can.view, {
		register: function( info ) {
			this.types["." + info.suffix] = info;

			if ( window.steal ) {
				steal.type(info.suffix + " view js", function( options, success, error ) {
					var type = can.view.types["." + options.type],
						id = can.view.toId(options.id+'');

					options.text = type.script(id, options.text)
					success();
				})
			}
			can.view[info.suffix] = function(id, text){
				$view.preload(id, info.renderer(id, text) )
			}
		},
		registerScript: function( type, id, src ) {
			return "can.view.preload('" + id + "'," + $view.types["." + type].script(id, src) + ");";
		},
		preload: function( id, renderer ) {
			can.view.cached[id] = new can.Deferred().resolve(function( data, helpers ) {
				return renderer.call(data, data, helpers);
			});
			return function(){
				return $view.frag(renderer.apply(this,arguments))
			};
		}

	});
	//!steal-pluginify-remove-end
	return can;
})(module["can/util/jquery/jquery.js"]);
module['can/view/modifiers/modifiers.js'] = (function($, can) {
	//---- ADD jQUERY HELPERS -----
	//converts jquery functions to use views	
	var convert, modify, isTemplate, isHTML, isDOM, getCallback,
		// text and val cannot produce an element, so don't run hookups on them
		noHookup = {'val':true,'text':true};

	convert = function( func_name ) {
		// save the old jQuery helper
		var old = $.fn[func_name];

		// replace it with our new helper
		$.fn[func_name] = function() {
			
			var args = can.makeArray(arguments),
				callbackNum, 
				callback, 
				self = this,
				result;
			
			// if the first arg is a deferred
			// wait until it finishes, and call
			// modify with the result
			if ( can.isDeferred(args[0]) ) {
				args[0].done(function( res ) {
					modify.call(self, [res], old);
				})
				return this;
			}
			//check if a template
			else if ( isTemplate(args) ) {

				// if we should operate async
				if ((callbackNum = getCallback(args))) {
					callback = args[callbackNum];
					args[callbackNum] = function( result ) {
						modify.call(self, [result], old);
						callback.call(self, result);
					};
					can.view.apply(can.view, args);
					return this;
				}
				// call view with args (there might be deferreds)
				result = can.view.apply(can.view, args);
				
				// if we got a string back
				if (!can.isDeferred(result) ) {
					// we are going to call the old method with that string
					args = [result];
				} else {
					// if there is a deferred, wait until it is done before calling modify
					result.done(function( res ) {
						modify.call(self, [res], old);
					})
					return this;
				}
			}
			return noHookup[func_name] ? old.apply(this,args) : 
				modify.call(this, args, old);
		};
	};

	// modifies the content of the element
	// but also will run any hookup
	modify = function( args, old ) {
		var res, stub, hooks;

		//check if there are new hookups
		for ( var hasHookups in can.view.hookups ) {
			break;
		}

		//if there are hookups, turn into a frag
		// and insert that
		// by using a frag, the element can be recursively hooked up
		// before insterion
		if ( hasHookups && args[0] && isHTML(args[0]) ) {
			args[0] = can.view.frag(args[0])
		}
	
		//then insert into DOM
		res = old.apply(this, args);

		return res;
	};

	// returns true or false if the args indicate a template is being used
	// $('#foo').html('/path/to/template.ejs',{data})
	// in general, we want to make sure the first arg is a string
	// and the second arg is data
	isTemplate = function( args ) {
		// save the second arg type
		var secArgType = typeof args[1];
		
		// the first arg is a string
		return typeof args[0] == "string" && 
				// the second arg is an object or function
		       (secArgType == 'object' || secArgType == 'function') && 
			   // but it is not a dom element
			   !isDOM(args[1]);
	};
	// returns true if the arg is a jQuery object or HTMLElement
	isDOM = function(arg){
		return arg.nodeType || (arg[0] && arg[0].nodeType)
	};
	// returns whether the argument is some sort of HTML data
	isHTML = function( arg ) {
		if ( isDOM(arg) ) {
			// if jQuery object or DOM node we're good
			return true;
		} else if ( typeof arg === "string" ) {
			// if string, do a quick sanity check that we're HTML
			arg = can.trim(arg);
			return arg.substr(0, 1) === "<" && arg.substr(arg.length - 1, 1) === ">" && arg.length >= 3;
		} else {
			// don't know what you are
			return false;
		}
	};

	//returns the callback arg number if there is one (for async view use)
	getCallback = function( args ) {
		return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
	};

	/**
	 *  @add jQuery.fn
	 *  @parent can.View
	 *  Called on a jQuery collection that was rendered with can.View with pending hookups.  can.View can render a 
	 *  template with hookups, but not actually perform the hookup, because it returns a string without actual DOM 
	 *  elements to hook up to.  So hookup performs the hookup and clears the pending hookups, preventing errors in 
	 *  future templates.
	 *  
	 * @codestart
	 * $(can.View('//views/recipes.ejs',recipeData)).hookup()
	 * @codeend
	 */
	$.fn.hookup = function() {
		can.view.frag(this);
		return this;
	};

	/**
	 *  @add jQuery.fn
	 */
	can.each([
	/**
	 *  @function jQuery.fn.prepend
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/prepend/ jQuery().prepend()]
	 *  to render [can.view] templates inserted at the beginning of each element in the set of matched elements.
	 *  
	 *  	$('#test').prepend('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"prepend",
	/**
	 *  @function jQuery.fn.append
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/append/ jQuery().append()]
	 *  to render [can.view] templates inserted at the end of each element in the set of matched elements.
	 *  
	 *  	$('#test').append('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"append",
	/**
	 *  @function jQuery.fn.after
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/after/ jQuery().after()]
	 *  to render [can.view] templates inserted after each element in the set of matched elements.
	 *  
	 *  	$('#test').after('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"after",
	/**
	 *  @function jQuery.fn.before
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/before/ jQuery().before()]
	 *  to render [can.view] templates inserted before each element in the set of matched elements.
	 *  
	 *  	$('#test').before('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"before",
	/**
	 *  @function jQuery.fn.text
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/text/ jQuery().text()]
	 *  to render [can.View] templates as the content of each matched element.
	 *  Unlike [jQuery.fn.html] jQuery.fn.text also works with XML, escaping the provided
	 *  string as necessary.
	 *  
	 *  	$('#test').text('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"text",
	/**
	 *  @function jQuery.fn.html
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/html/ jQuery().html()]
	 *  to render [can.view] templates as the content of each matched element.
	 *  
	 *  	$('#test').html('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"html",
	/**
	 *  @function jQuery.fn.replaceWith
	 *  @parent can.view.modifiers
	 *  
	 *  Extending the original [http://api.jquery.com/replaceWith/ jQuery().replaceWith()]
	 *  to render [can.view] templates replacing each element in the set of matched elements.
	 *  
	 *  	$('#test').replaceWith('path/to/template.ejs', { name : 'canjs' });
	 *  
	 *  @param {String|Object|Function} content A template filename or the id of a view script tag 
	 *  or a DOM element, array of elements, HTML string, or can object.
	 *  @param {Object} [data] The data to render the view with.
	 *  If rendering a view template this parameter always has to be present
	 *  (use the empty object initializer {} for no data).
	 *  @param {Function} [callback] A success callback to load the view asynchronously
	 *
	 *  @return {jQuery|can.Deferred} The jQuery object or a [can.Deferred] if a deferred has
	 *  been passed in data.
	 */
	"replaceWith", "val"],function(func){
		convert(func);
	});
})(module["jquery"], module["can/view/view.js"]);
module['can/observe/observe.js'] = (function(can, Construct) {
	// ## observe.js  
	// `can.Observe`  
	// _Provides the observable pattern for JavaScript Objects._  
	//  
	// Returns `true` if something is an object with properties of its own.
	var canMakeObserve = function( obj ) {
			return obj && typeof obj === 'object' && !(obj instanceof Date);
		},

		// Removes all listeners.
		unhookup = function(items, namespace){
			return can.each(items, function(item){
				if(item && item.unbind){
					item.unbind("change" + namespace);
				}
			});
		},
		// Listens to changes on `val` and "bubbles" the event up.  
		// `val` - The object to listen for changes on.  
		// `prop` - The property name is at on.  
		// `parent` - The parent object of prop.  
		hookupBubble = function( val, prop, parent ) {
			// If it's an `array` make a list, otherwise a val.
			if (val instanceof Observe){
				// We have an `observe` already...
				// Make sure it is not listening to this already
				unhookup([val], parent._cid);
			} else if ( can.isArray(val) ) {
				val = new Observe.List(val);
			} else {
				val = new Observe(val);
			}
			
			// Listen to all changes and `batchTrigger` upwards.
			val.bind("change" + parent._cid, function( /* ev, attr */ ) {
				// `batchTrigger` the type on this...
				var args = can.makeArray(arguments),
					ev = args.shift();
					args[0] = (prop === "*" ? 
						[ parent.indexOf( val ), args[0]] :
						[ prop, args[0]] ).join(".");

				// track objects dispatched on this observe		
				ev.triggeredNS = ev.triggeredNS || {};

				// if it has already been dispatched exit
				if (ev.triggeredNS[parent._cid]) {
					return;
				}

				ev.triggeredNS[parent._cid] = true;
						
				can.trigger(parent, ev, args);
				can.trigger(parent, args[0], args);
			});

			return val;
		},
		
		// An `id` to track events for a given observe.
		observeId = 0,
		// A reference to an `array` of events that will be dispatched.
		collecting,
		// Call to start collecting events (`Observe` sends all events at
		// once).
		collect = function() {
			if (!collecting ) {
				collecting = [];
				return true;
			}
		},
		// Creates an event on item, but will not send immediately 
		// if collecting events.  
		// `item` - The item the event should happen on.  
		// `event` - The event name, ex: `change`.  
		// `args` - Tn array of arguments.
		batchTrigger = function( item, event, args ) {
			// Don't send events if initalizing.
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
		// Which batch of events this is for -- might not want to send multiple
		// messages on the same batch.  This is mostly for event delegation.
		batchNum = 1,
		// Sends all pending events.
		sendCollection = function() {
			var items = collecting.slice(0);
			collecting = undefined;
			batchNum++;
			can.each(items, function( item ) {
				can.trigger.apply(can, item);
			});
			
		},
		// A helper used to serialize an `Observe` or `Observe.List`.  
		// `observe` - The observable.  
		// `how` - To serialize with `attr` or `serialize`.  
		// `where` - To put properties, in an `{}` or `[]`.
		serialize = function( observe, how, where ) {
			// Go through each property.
			observe.each(function( val, name ) {
				// If the value is an `object`, and has an `attrs` or `serialize` function.
				where[name] = canMakeObserve(val) && can.isFunction( val[how] ) ?
				// Call `attrs` or `serialize` to get the original data back.
				val[how]() :
				// Otherwise return the value.
				val;
			});
			return where;
		},
		$method = function( name ) {
			return function() {
				return can[name].apply(this, arguments );
			};
		},
		bind = $method('addEvent'),
		unbind = $method('removeEvent'),
		attrParts = function(attr){
			return can.isArray(attr) ? attr : (""+attr).split(".");
		};
	/**
	 * @add can.Observe
	 */
	var Observe = can.Observe = Construct( {
		// keep so it can be overwritten
		setup : function(){
			Construct.setup.apply(this, arguments);
		},
		bind : bind,
		unbind: unbind,
		id: "id",
    canMakeObserve : canMakeObserve
	},
	/**
	 * @prototype
	 */
	{
		setup: function( obj ) {
			// `_data` is where we keep the properties.
			this._data = {};
			// The namespace this `object` uses to listen to events.
			this._cid = ".observe" + (++observeId);
			// Sets all `attrs`.
			this._init = 1;
			this.attr(obj);
			delete this._init;
		},
		/**
		 * @attribute _cid
		 *
		 * A globally unique ID for this Observe instance.
		 */

		/**
		 * Get or set an attribute or attributes on the observe.
		 * 
		 *     o = new can.Observe({});
		 *     
		 *     // sets a user property
		 *     o.attr( 'user', { name: 'hank' } );
		 *     
		 *     // read the user's name
		 *     o.attr( 'user.name' ) //-> 'hank'
		 * 
		 *     // merge multiple properties
		 *     o.attr({
		 *        grade: 'A'
		 *     });
		 * 
		 *     // get properties
		 *     o.attr()           //-> {user: {name: 'hank'}, grade: "A"}
		 * 
		 *     // set multiple properties and remove absent attrs
		 *     o.attr( { foo: 'bar' }, true );
		 * 
		 *     o.attr()           //-> {foo: 'bar'}
		 * 
		 * ## Setting Properties
		 * 
		 * `attr( PROPERTY, VALUE )` sets the observable's PROPERTY to VALUE.  For example:
		 * 
		 *     o = new can.Observe({});
		 *     o.attr( 'user', 'Justin' );
		 * 
		 * This call to attr fires two events on __o__ immediately after the value is set, the first is a "change" event that can be 
		 * listened to like:
		 * 
		 *     o.bind( 'change', function( ev, attr, how, newVal, oldVal ) {} );
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
		 *     o.bind( 'name', function( ev, newVal, oldVal ) {} );
		 * 
		 * where:
		 * 
		 *   - ev - the "name" event
		 *   - newVal - the new value of the name property: `'Justin'`
		 *   - oldVal - the old value of the name property: `undefined`
		 * 
		 * `attr( PROPERTY, VALUE )` allows setting of deep properties like:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Just' } } });
		 *      o.attr( 'person.name.first', 'Justin' );
		 * 
		 *  All property names should be seperated with a __"."__.
		 * 
		 * `attr( PROPERTIES )` sets multiple properties at once and removes
		 * properties not in `PROPERTIES`.  For example:
		 * 
		 *     o = new can.Observe({ first: 'Just', middle: 'B' });
		 *     o.attr({
		 *       first: 'Justin',
		 *       last: 'Meyer'
		 *     });
		 * 
		 * This results in an object that looks like:
		 * 
		 *     { first: 'Justin', last: 'Meyer' }
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
		 *     o = new can.Observe({ first: 'Just', middle: 'B' });
		 *     o.attr({
		 *       first: 'Justin',
		 *       last: 'Meyer'
		 *     })
		 * 
		 * This results in an object that looks like:
		 * 
		 *     { first: 'Justin', middle: 'B', last: 'Meyer' }
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
		 *     o = new can.Observe({ first: 'Justin' });
		 *     o.attr( 'first' ) //-> "Justin"
		 * 
		 * You can also read properties that don't conflict with Observe's inherited
		 * methods direclty like:
		 * 
		 *     o.first //-> "Justin"
		 * 
		 * `attr( PROPERTY )` can read nested properties like:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Justin' } } });
		 *      o.attr( 'person.name.first' ) //-> "Justin"
		 * 
		 * If `attr( PROPERTY )` returns an object or an array, it returns
		 * the Observe wrapped object or array. For example:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Justin' } } });
		 *      o.attr( 'person' ).attr( 'name.first' ) //-> "Justin"
		 * 
		 * 
		 * `attr()` returns all properties in the observe, for example:
		 * 
		 *     o = new can.Observe({ first: 'Justin' });
		 *     o.attr() //-> { first: "Justin" }
		 * 
		 * If the observe has nested objects, `attr()` returns the 
		 * data as plain JS objects, not as observes.  Example:
		 * 
		 *      o = new can.Observe({ person: { name: { first: 'Justin' } } });
		 *      o.attr() //-> { person: { name: { first: 'Justin' } } }
		 * 
		 * @param {String} attr the attribute to read or write.
		 * 
		 *     o.attr( 'name' ) //-> reads the name
		 *     o.attr( 'name', 'Justin' ) //-> writes the name
		 *     
		 * You can read or write deep property names.  For example:
		 * 
		 *     o.attr( 'person', { name: 'Justin' } );
		 *     o.attr( 'person.name' ) //-> 'Justin'
		 * 
		 * @param {Object} [val] if provided, sets the value.
		 * @return {Object} the observable or the attribute property.
		 * 
		 * If you are reading, the property value is returned:
		 * 
		 *     o.attr( 'name' ) //-> Justin
		 *     
		 * If you are writing, the observe is returned for chaining:
		 * 
		 *     o.attr( 'name', 'Brian' ).attr( 'name' ) //-> Brian
		 */
		attr: function( attr, val ) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a `number` or a `string`.
			var type = typeof attr;
			if ( type !== "string" && type !== "number" ) {
				return this._attrs(attr, val)
			} else if ( val === undefined ) {// If we are getting a value.
				// Let people know we are reading.
				Observe.__reading && Observe.__reading(this, attr)
				return this._get(attr)
			} else {
				// Otherwise we are setting.
				this._set(attr, val);
				return this;
			}
		},
		/**
		 * Iterates through each attribute, calling handler 
		 * with each attribute name and value.
		 * 
		 *     new Observe({ foo: 'bar' })
		 *       .each( function( value, name ) {
		 *         equals( name, 'foo' );
		 *         equals( value,'bar' );
		 *       });
		 * 
		 * @param {function} handler( attrName, value ) A function that will get 
		 * called back with the name and value of each attribute on the observe.
		 * 
		 * Returning `false` breaks the looping. The following will never
		 * log 3:
		 * 
		 *     new Observe({ a: 1, b: 2, c: 3 })
		 *       .each( function( value, name ) {
		 *         console.log(value);
		 *         if ( name == 2 ) {
		 *           return false;
		 *         }
		 *       });
		 * 
		 * @return {can.Observe} the original observable.
		 */
		each: function() {
			return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
		},
		/**
		 * Removes a property by name from an observe.
		 * 
		 *     o =  new can.Observe({ foo: 'bar' });
		 *     o.removeAttr('foo'); //-> 'bar'
		 * 
		 * This creates a `'remove'` change event. Learn more about events
		 * in [can.Observe.prototype.bind bind] and [can.Observe.prototype.delegate delegate].
		 * 
		 * @param {String} attr the attribute name to remove.
		 * @return {Object} the value that was removed.
		 */
		removeAttr: function( attr ) {
			// Convert the `attr` into parts (if nested).
			var parts = attrParts(attr),
				// The actual property to remove.
				prop = parts.shift(),
				// The current value.
				current = this._data[prop];

			// If we have more parts, call `removeAttr` on that part.
			if ( parts.length ) {
				return current.removeAttr(parts)
			} else {
				// Otherwise, `delete`.
				delete this._data[prop];
				// Create the event.
				if (!(prop in this.constructor.prototype)) {
					delete this[prop]
				}
				batchTrigger(this, "change", [prop, "remove", undefined, current]);
				batchTrigger(this, prop, [undefined, current]);
				return current;
			}
		},
		// Reads a property from the `object`.
		_get: function( attr ) {
			// break up the attr (`"foo.bar"`) into `["foo","bar"]`
			var parts = attrParts(attr),
				// get the value of the first attr name (`"foo"`)
				current = this.__get(parts.shift());
			// if there are other attributes to read
			return parts.length ? 
				// and current has a value
				current ?
					// lookup the remaining attrs on current
					current._get(parts) : 
					// or if there's no current, return undefined
					undefined 	
				: 
				// if there are no more parts, return current
				current;
		},
		// Reads a property directly if an `attr` is provided, otherwise
		// returns the "real" data object itself.
		__get: function( attr ) {
			return attr ? this._data[attr] : this._data;
		},
		// Sets `attr` prop as value on this object where.
		// `attr` - Is a string of properties or an array  of property values.
		// `value` - The raw value to set.
		_set: function( attr, value ) {
			// Convert `attr` to attr parts (if it isn't already).
			var parts = attrParts(attr),
				// The immediate prop we are setting.
				prop = parts.shift(),
				// The current value.
				current = this.__get(prop);

			// If we have an `object` and remaining parts.
			if ( canMakeObserve(current) && parts.length ) {
				// That `object` should set it (this might need to call attr).
				current._set(parts, value)
			} else if (!parts.length ) {
				// We're in "real" set territory.
				if(this.__convert){
					value = this.__convert(prop, value)
				}
				this.__set(prop, value, current)
				
			} else {
				throw "can.Observe: Object does not exist"
			}
		},
		__set : function(prop, value, current){
		
			// Otherwise, we are setting it on this `object`.
			// TODO: Check if value is object and transform
			// are we changing the value.
			if ( value !== current ) {

				// Check if we are adding this for the first time --
				// if we are, we need to create an `add` event.
				var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

				// Set the value on data.
				this.___set(prop,

				// If we are getting an object.
				canMakeObserve(value) ?

				// Hook it up to send event.
				hookupBubble(value, prop, this) :
				// Value is normal.
				value);

				// `batchTrigger` the change event.
				batchTrigger(this, "change", [prop, changeType, value, current]);
				batchTrigger(this, prop, [value, current]);
				// If we can stop listening to our old value, do it.
				current && unhookup([current], this._cid);
			}

		},
		// Directly sets a property on this `object`.
		___set: function( prop, val ) {
			this._data[prop] = val;
			// Add property directly for easy writing.
			// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
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
		 *     o = new can.Observe({ name: 'Payal' });
		 *     o.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
		 *       
		 *     }).bind( 'name', function( ev, newVal, oldVal ) {
		 *     	
		 *     });
		 *     
		 *     o.attr( 'name', 'Justin' ); 
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
		 *     o = new can.Observe({ name: 'Payal' });
		 *     o.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
		 *       // ev    -> {type: 'change'}
		 *       // attr  -> "name"
		 *       // how   -> "add"
		 *       // newVal-> "Justin"
		 *       // oldVal-> "Payal"
		 *     });
		 *     
		 *     o.attr( 'name', 'Justin' );
		 * 
		 * ## ATTR_NAME events
		 * 
		 * When a attribute value is changed, an event with the name of the attribute
		 * is triggered on the observable with the new value and old value as 
		 * parameters. For example:
		 * 
		 *     o = new can.Observe({ name: 'Payal' });
		 *     o.bind( 'name', function( ev, newVal, oldVal ) {
		 *       // ev    -> {type : "name"}
		 *       // newVal-> "Justin"
		 *       // oldVal-> "Payal"
		 *     });
		 *     
		 *     o.attr( 'name', 'Justin' );
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
		 *     o.unbind( 'change', handler );
		 *     
		 *     // unbind all change event handlers bound with the
		 *     // foo namespace
		 *     o.unbind( 'change.foo' );
		 *     
		 *     // unbind all change event handlers
		 *     o.unbind( 'change' );
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
			
			this.each(function(curVal, prop){
				newVal = props[prop];

				// If we are merging...
				if ( newVal === undefined ) {
					remove && self.removeAttr(prop);
					return;
				}
				if ( canMakeObserve(curVal) && canMakeObserve(newVal) && curVal.attr ) {
					curVal.attr(newVal, remove)
				} else if ( curVal != newVal ) {
					self._set(prop, newVal)
				} else {

				}
				delete props[prop];
			})
			// Add remaining props.
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
	// Helpers for `observable` lists.
	/**
	 * @class can.Observe.List
	 * @inherits can.Observe
	 * @parent canjs
	 * 
	 * `new can.Observe.List([items])` provides the observable pattern for JavaScript arrays.  It lets you:
	 * 
	 *   - change the structure of an array
	 *   - listen to changes in the array
	 * 
	 * ## Creating an observe list
	 * 
	 * To create an observable list, use `new can.Observe.List( ARRAY )` like:
	 * 
	 *     var hobbies = new can.Observe.List(
	 * 		 			['programming', 'basketball', 'nose picking'])
	 * 
	 * can.Observe.List inherits from [can.Observe], including it's 
	 * [can.Observe.prototype.bind bind], [can.Observe.prototype.each each], and [can.Observe.prototype.unbind unbind] 
	 * methods.
	 * 
	 * can.Observe.List is inherited by [can.Model.List].
	 * 
	 * ## Getting and Setting Properties
	 * 
	 * Similar to an array, use the index operator to access items of a list:
	 * 
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list[1] //-> "b"
	 * 
	 * Or, use the `attr( PROPERTY )` method like:
	 * 
	 *     list = new can.Observe.List(["a","b"])
	 *     list.attr(1)  //-> "b"
	 *
	 * __WARNING:__ while using the index operator with [] is possible, 
	 * it should be noted that changing properties of objects that way
	 * will not call bound events to the observed list that would let
	 * it know that an object in the list has changed. In almost every
	 * case you will use [can.Model.static.findAll findAll].
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
	 *  - `index` - where the items were added
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
	 *   - `index` - where the items were removed
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
	 *   - `index` - where the items were removed
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
	 * @constructor Creates a new observable list from an array
	 * 
	 * @param {Array} [items...] the array of items to create the list with
	 */
	var splice = [].splice,
		list = Observe(
	/**
	 * @prototype
	 */
	{
		setup: function( instances, options ) {
			this.length = 0;
			this._cid = ".observe" + (++observeId);
			this._init = 1;
			this.bind('change',can.proxy(this._changes,this));
			this.push.apply(this, can.makeArray(instances || []));
			can.extend(this, options);
			delete this._init;
		},
		_changes : function(ev, attr, how, newVal, oldVal){
			// `batchTrigger` direct add and remove events...
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
		},
		__get : function(attr){
			return attr ? this[attr] : this;
		},
		___set : function(attr, val){
			this[attr] = val;
			if(+attr >= this.length){
				this.length = (+attr+1)
			}
		},
		// Returns the serialized form of this list.
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
		 *       .each(function( value , index ){
		 *         equals(index, 1)
		 *         equals(value,'a')
		 *       })
		 * 
		 * @param {function} handler(value,index) A function that will get 
		 * called back with the index and value of each item on the list.
		 * 
		 * Returning `false` breaks the looping.  The following will never
		 * log 'c':
		 * 
		 *     new Observe(['a','b','c'])
		 *       .each(function(value, index){
		 *         console.log(value)
		 *         if(index == 1){
		 *           return false;
		 *         }
		 *       })
		 * 
		 * @return {can.Observe.List} the original observable.
		 */
		//  
		/**
		 * `splice(index, [ howMany, elements... ] )` remove or add items 
		 * from a specific point in the list.
		 * 
		 * ### Example
		 * 
		 * The following creates a list of numbers and replaces 2 and 3 with
		 * "a", and "b".
		 * 
		 *     var list = new can.Observe.List([0,1,2,3]);
		 *     
		 *     list.splice(1,2, "a", "b"); // results in [0,"a","b",3]
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
		 *   - where - 1 - the location of where these items were removed
		 * 
		 * The second change event is the addition of the "a", and "b" values where 
		 * the callback values will be:
		 * 
		 *   - attr - "1" - indicates where the add event took place
		 *   - how - "added"
		 *   - newVals - ["a","b"]
		 *   - oldVals - [1, 2] - the array of removed values
		 *   - where - 1 - the location of where these items were added
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
				unhookup(removed, this._cid);
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
		 * @param {Array|Number} items
		 * @param {Boolean|Object} {optional:remove} 
		 * @return {list|Array} returns the props on a read or the observe
		 * list on a write.
		 */
		_attrs: function( items, remove ) {
			if ( items === undefined ) {
				return serialize(this, 'attr', []);
			}

			// Create a copy.
			items = can.makeArray( items );

      var collectingStarted = collect();
			this._updateAttrs(items, remove);
			if ( collectingStarted ) {
				sendCollection()
			}
		},

    _updateAttrs : function( items, remove ){
      var len = Math.min(items.length, this.length);

      for ( var prop = 0; prop < len; prop++ ) {
        var curVal = this[prop],
          newVal = items[prop];

        if ( canMakeObserve(curVal) && canMakeObserve(newVal) ) {
          curVal.attr(newVal, remove)
        } else if ( curVal != newVal ) {
          this._set(prop, newVal)
        } else {

        }
      }
      if ( items.length > this.length ) {
        // Add in the remaining props.
        this.push.apply( this, items.slice( this.length ) );
      } else if ( items.length < this.length && remove ) {
        this.splice(items.length)
      }
    }
	}),


		// Converts to an `array` of arguments.
		getArgs = function( args ) {
			return args[0] && can.isArray(args[0]) ?
				args[0] :
				can.makeArray(args);
		};
	// Create `push`, `pop`, `shift`, and `unshift`
	can.each({
		/**
		 * @function push
		 * Add items to the end of the list.
		 * 
		 *     var list = new can.Observe.List([]);
		 *     
		 *     list.attr() // -> []
		 *     
		 *     list.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed,
		 *     			   // for multiple items, "*" is used 
		 *         how,       // "add"
		 *         newVals,   // an array of new values pushed
		 *         oldVals,   // undefined
		 *         where      // the location where these items were added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     list.push('0','1','2'); 
		 *     list.attr() // -> ['0', '1', '2']
		 * 
		 * @return {Number} the number of items in the array
		 */
		push: "length",
		/**
		 * @function unshift
		 * Add items to the start of the list.  This is very similar to
		 * [can.Observe.List::push can.Observe.prototype.List].  Example:
		 * 
		 *     var list = new can.Observe.List(["a","b"]);
		 *     list.unshift(1,2,3) //-> 5
		 *     .attr() //-> [1,2,3,"a","b"]
		 * 
		 * @param {Object} [items...] items to add to the start of the list.
		 * @return {Number} the length of the array.
		 */
		unshift: 0
	},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.
	function( where, name ) {
		list.prototype[name] = function() {
			// Get the items being added.
			var args = getArgs(arguments),
				// Where we are going to add items.
				len = where ? this.length : 0;

			// Go through and convert anything to an `observe` that needs to be converted.
			for ( var i = 0; i < args.length; i++ ) {
				var val = args[i];
				if ( canMakeObserve(val) ) {
					args[i] = hookupBubble(val, "*", this)
				}
			}
			
			// Call the original method.
			var res = [][name].apply(this, args);
			
			if ( !this.comparator || !args.length ) {
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
		 *     var list = new can.Observe.List([0,1,2]);
		 *     list.pop() //-> 2;
		 *     list.attr() //-> [0,1]
		 * 
		 * This produces a change event like
		 * 
		 *     list.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, 
		 *     			   // for multiple items, "*" is used 
		 *         how,       // "remove"
		 *         newVals,   // undefined
		 *         oldVals,   // 2
		 *         where      // the location where these items were added
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
		 *     var list = new can.Observe.List([0,1,2]);
		 *     list.shift() //-> 0;
		 *     list.attr() //-> [1,2]
		 * 
		 * @return {Object} the element at the start of the list
		 */
		shift: 0
	},
	// Creates a `remove` type method
	function( where, name ) {
		list.prototype[name] = function() {
			
			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;


			var res = [][name].apply(this, args)

			// Create a change where the args are
			// `*` - Change on potentially multiple properties.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			// `len` - Where these items were removed.
			batchTrigger(this, "change", [""+len, "remove", undefined, [res]])

			if ( res && res.unbind ) {
				res.unbind("change" + this._cid)
			}
			return res;
		}
	});
	
	can.extend(list.prototype, {
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
		indexOf: function(item) {
			this.attr('length')
			return can.inArray(item, this)
		},

		/**
		 * @function join
		 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/join
		 *
		 * Joins the string representation of all elements into a string.
		 *
		 *      list = new can.Observe.List(["a","b","c"]);
		 *      list.join(',') // -> "a, b, c"
		 *
		 * @param {String} separator The element separator
		 * @return {String} The joined string
		 */
		join : [].join,

		/**
		 * @function slice
		 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/slice
		 *
		 * Creates a flat copy of a section of the observable list and returns
		 * a new observable list.
		 *
		 * @param {Integer} start The beginning index of the section to extract.
		 * @param {Integer} [end] The end index of the section to extract.
		 * @return {can.Observe.List} The sliced list
		 */
		slice : function() {
			var temp = Array.prototype.slice.apply(this, arguments);
			return new this.constructor( temp );
		},

		/**
		 * @function concat
		 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/concat
		 *
		 * Returns a new can.Observe.List comprised of this list joined with other
		 * array(s), value(s) and can.Observe.Lists.
		 *
		 * @param {Array|can.Observe.List} args... One or more arrays or observable lists to concatenate
		 * @return {can.Observe.List} The concatenated list
		 */
		concat : function() {
			var args = [];
			can.each( can.makeArray( arguments ), function( arg, i ) {
				args[i] = arg instanceof can.Observe.List ? arg.serialize() : arg ;
			});
			return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
		},

		/**
		 * @function forEach
		 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
		 *
		 * Calls a function for each element in the list.
		 *
		 * > Note that [each can.Observe.each] will iterate over the actual properties.
		 *
		 * @param {Function} callback The callback to execute.
		 * It gets passed the element and the index in the list.
		 * @param {Object} [thisarg] Object to use as `this` when executing `callback`
		 */
		forEach : function( cb, thisarg ) {
			can.each(this, cb, thisarg || this );
		}
	});

	Observe.List = list;
	return Observe;
})(module["can/util/jquery/jquery.js"], module["can/construct/construct.js"]);
module['can/model/model.js'] = (function( can ) {
	
	// ## model.js  
	// `can.Model`  
	// _A `can.Observe` that connects to a RESTful interface._
	//  
	// Generic deferred piping function
	/**
	 * @add can.Model
	 */
	var	pipe = function( def, model, func ) {
		var d = new can.Deferred();
		def.then(function(){
			var args = can.makeArray( arguments );
			args[0] = model[func](args[0]);
			d.resolveWith(d, args);
		},function(){
			d.rejectWith(this, arguments);
		});
		return d;
	},
		modelNum = 0,
		ignoreHookup = /change.observe\d+/,
		getId = function( inst ) {
			return inst[inst.constructor.id];
		},
		// Ajax `options` generator function
		ajax = function( ajaxOb, data, type, dataType, success, error ) {

			var params = {};
			
			// If we get a string, handle it.
			if ( typeof ajaxOb == "string" ) {
				// If there's a space, it's probably the type.
				var parts = ajaxOb.split(/\s/);
				params.url = parts.pop();
				if ( parts.length ) {
					params.type = parts.pop();
				}
			} else {
				can.extend( params, ajaxOb );
			}

			// If we are a non-array object, copy to a new attrs.
			params.data = typeof data == "object" && ! can.isArray( data ) ?
				can.extend(params.data || {}, data) : data;
	
			// Get the url with any templated values filled out.
			params.url = can.sub(params.url, params.data, true);

			return can.ajax( can.extend({
				type: type || "post",
				dataType: dataType ||"json",
				success : success,
				error: error
			}, params ));
		},
		makeRequest = function( self, type, success, error, method ) {
			var deferred,
				args = [self.serialize()],
				// The model.
				model = self.constructor,
				jqXHR;

			// `destroy` does not need data.
			if ( type == 'destroy' ) {
				args.shift();
			}
			// `update` and `destroy` need the `id`.
			if ( type !== 'create' ) {
				args.unshift(getId(self));
			}

			
			jqXHR = model[type].apply(model, args);
			
			deferred = jqXHR.pipe(function(data){
				self[method || type + "d"](data, jqXHR);
				return self;
			});

			// Hook up `abort`
			if(jqXHR.abort){
				deferred.abort = function(){
					jqXHR.abort();
				};
			}

			deferred.then(success,error);
			return deferred;
		},
	
	// This object describes how to make an ajax request for each ajax method.  
	// The available properties are:
	//		`url` - The default url to use as indicated as a property on the model.
	//		`type` - The default http request type
	//		`data` - A method that takes the `arguments` and returns `data` used for ajax.
	/** 
	 * @Static
	 */
	//
		/**
		 * @function bind
		 * `bind(eventType, handler(event, instance))` listens to
		 * __created__, __updated__, __destroyed__ events on all 
		 * instances of the model.
		 * 
		 *     Task.bind("created", function(ev, createdTask){
		 * 	     this //-> Task
		 *       createdTask.attr("name") //-> "Dishes"
		 *     })
		 *     
		 *     new Task({name: "Dishes"}).save();
		 * 
		 * @param {String} eventType The type of event.  It must be
		 * `"created"`, `"udpated"`, `"destroyed"`.
		 * 
		 * @param {Function} handler(event,instance) A callback function
		 * that gets called with the event and instance that was
		 * created, destroyed, or updated.
		 * 
		 * @return {can.Model} the model constructor function.
		 */
		// 
		/**
		 * @function unbind
		 * `unbind(eventType, handler)` removes a listener
		 * attached with [can.Model.bind].
		 * 
		 *     var handler = function(ev, createdTask){
		 * 	     
		 *     }
		 *     Task.bind("created", handler)
		 *     Task.unbind("created", handler)
		 * 
		 * You have to pass the same function to `unbind` that you
		 * passed to `bind`.
		 * 
		 * @param {String} eventType The type of event.  It must be
		 * `"created"`, `"udpated"`, `"destroyed"`.
		 * 
		 * @param {Function} handler(event,instance) A callback function
		 * that was passed to `bind`.
		 * 
		 * @return {can.Model} the model constructor function.
		 */
		// 
		/**
		 * @attribute id
		 * The name of the id field.  Defaults to 'id'. Change this if it is something different.
		 * 
		 * For example, it's common in .NET to use Id.  Your model might look like:
		 * 
		 *     Friend = can.Model({
		 *       id: "Id"
		 *     },{});
		 */
	ajaxMethods = {
		/**
		 * @function create
		 * `create(attributes) -> Deferred` is used by [can.Model::save save] to create a 
		 * model instance on the server. 
		 * 
		 * ## Implement with a URL
		 * 
		 * The easiest way to implement create is to give it the url 
		 * to post data to:
		 * 
		 *     var Recipe = can.Model({
		 *       create: "/recipes"
		 *     },{})
		 *     
		 * This lets you create a recipe like:
		 *  
		 *     new Recipe({name: "hot dog"}).save();
		 * 
		 * 
		 * ## Implement with a Function
		 * 
		 * You can also implement create by yourself. Create gets called 
		 * with `attrs`, which are the [can.Observe::serialize serialized] model 
		 * attributes.  Create returns a `Deferred` 
		 * that contains the id of the new instance and any other 
		 * properties that should be set on the instance.
		 *  
		 * For example, the following code makes a request 
		 * to `POST /recipes.json {'name': 'hot+dog'}` and gets back
		 * something that looks like:
		 *  
		 *     { 
		 *       "id": 5,
		 *       "createdAt": 2234234329
		 *     }
		 * 
		 * The code looks like:
		 * 
		 *     can.Model("Recipe", {
		 *       create : function( attrs ){
		 *         return $.post("/recipes.json",attrs, undefined ,"json");
		 *       }
		 *     },{})
		 * 
		 * 
		 * @param {Object} attrs Attributes on the model instance
		 * @return {Deferred} A deferred that resolves to 
		 * an object with the id of the new instance and
		 * other properties that should be set on the instance.
		 */
		create : {
			url : "_shortName",
			type :"post"
		},
		/**
		 * @function update
		 * `update( id, attrs ) -> Deferred` is used by [can.Model::save save] to 
		 * update a model instance on the server. 
		 * 
		 * ## Implement with a URL
		 * 
		 * The easist way to implement update is to just give it the url to `PUT` data to:
		 * 
		 *     Recipe = can.Model({
		 *       update: "/recipes/{id}"
		 *     },{});
		 *     
		 * This lets you update a recipe like:
		 *  
		 *     Recipe.findOne({id: 1}, function(recipe){
		 *       recipe.attr('name','salad');
		 *       recipe.save();
		 *     })
		 * 
		 * This will make an XHR request like:
		 * 
		 *     PUT /recipes/1 
		 *     name=salad
		 *  
		 * If your server doesn't use PUT, you can change it to post like:
		 * 
		 *     $.Model("Recipe",{
		 *       update: "POST /recipes/{id}"
		 *     },{});
		 * 
		 * The server should send back an object with any new attributes the model 
		 * should have.  For example if your server udpates the "updatedAt" property, it
		 * should send back something like:
		 * 
		 *     // PUT /recipes/4 {name: "Food"} ->
		 *     {
		 *       updatedAt : "10-20-2011"
		 *     }
		 * 
		 * ## Implement with a Function
		 * 
		 * You can also implement update by yourself.  Update takes the `id` and
		 * `attributes` of the instance to be udpated.  Update must return
		 * a [can.Deferred Deferred] that resolves to an object that contains any 
		 * properties that should be set on the instance.
		 *  
		 * For example, the following code makes a request 
		 * to '/recipes/5.json?name=hot+dog' and gets back
		 * something that looks like:
		 *  
		 *     { 
		 *       updatedAt: "10-20-2011"
		 *     }
		 * 
		 * The code looks like:
		 * 
		 *     Recipe = can.Model({
		 *       update : function(id, attrs ) {
		 *         return $.post("/recipes/"+id+".json",attrs, null,"json");
		 *       }
		 *     },{});
		 * 
		 * 
		 * @param {String} id the id of the model instance
		 * @param {Object} attrs Attributes on the model instance
		 * @return {Deferred} A deferred that resolves to
		 * an object of attribute / value pairs of property changes the client doesn't already 
		 * know about. For example, when you update a name property, the server might 
		 * update other properties as well (such as updatedAt). The server should send 
		 * these properties as the response to updates.  
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
		 * `destroy(id) -> Deferred` is used by [can.Model::destroy] remove a model 
		 * instance from the server.
		 * 
		 * ## Implement with a URL
		 * 
		 * You can implement destroy with a string like:
		 * 
		 *     Recipe = can.Model({
		 *       destroy : "/recipe/{id}"
		 *     },{})
		 * 
		 * And use [can.Model::destroy] to destroy it like:
		 * 
		 *     Recipe.findOne({id: 1}, function(recipe){
		 * 	      recipe.destroy();
		 *     });
		 * 
		 * This sends a `DELETE` request to `/thing/destroy/1`.
		 * 
		 * If your server does not support `DELETE` you can override it like:
		 * 
		 *     Recipe = can.Model({
		 *       destroy : "POST /recipe/destroy/{id}"
		 *     },{})
		 * 
		 * ## Implement with a function
		 * 
		 * Implement destroy with a function like:
		 * 
		 *     Recipe = can.Model({
		 *       destroy : function(id){
		 *         return $.post("/recipe/destroy/"+id,{});
		 *       }
		 *     },{})
		 * 
		 * Destroy just needs to return a deferred that resolves.
		 * 
		 * @param {String|Number} id the id of the instance you want destroyed
		 * @return {Deferred} a deferred that resolves when the model instance is destroyed.
		 */
		destroy : {
			type : "delete",
			data : function(id){
				var args = {};
				args.id = args[this.id] = id;
				return args;
			}
		},
		/**
		 * @function findAll
		 * `findAll( params, success(instances), error(xhr) ) -> Deferred` is used to retrieve model 
		 * instances from the server. Before you can use `findAll`, you must implement it.
		 * 
		 * ## Implement with a URL
		 * 
		 * Implement findAll with a url like:
		 * 
		 *     Recipe = can.Model({
		 *       findAll : "/recipes.json"
		 *     },{});
		 * 
		 * The server should return data that looks like:
		 * 
		 *     [
		 *       {"id" : 57, "name": "Ice Water"},
		 *       {"id" : 58, "name": "Toast"}
		 *     ]
		 * 
		 * ## Implement with an Object
		 * 
		 * Implement findAll with an object that specifies the parameters to
		 * `can.ajax` (jQuery.ajax) like:
		 * 
		 *     Recipe = can.Model({
		 *       findAll : {
		 *         url: "/recipes.xml",
		 *         dataType: "xml"
		 *       }
		 *     },{})
		 * 
		 * ## Implement with a Function
		 * 
		 * To implement with a function, `findAll` is passed __params__ to filter
		 * the instances retrieved from the server and it should return a
		 * deferred that resolves to an array of model data. For example:
		 * 
		 *     Recipe = can.Model({
		 *       findAll : function(params){
		 *         return $.ajax({
		 *           url: '/recipes.json',
		 *           type: 'get',
		 *           dataType: 'json'})
		 *       }
		 *     },{})
		 * 
		 * ## Use
		 * 
		 * After implementing `findAll`, you can use it to retrieve instances of the model
		 * like:
		 * 
		 *     Recipe.findAll({favorite: true}, function(recipes){
		 *       recipes[0].attr('name') //-> "Ice Water"
		 *     }, function( xhr ){
		 *       // called if an error
		 *     }) //-> Deferred
		 * 
		 * The following API details the use of `findAll`.
		 * 
		 * @param {Object} params data to refine the results.  An example might be passing {limit : 20} to
		 * limit the number of items retrieved.
		 * 
		 *     Recipe.findAll({limit: 20})
		 * 
		 * @param {Function} [success(items)] called with a [can.Model.List] of model 
		 * instances.  The model isntances are created from the Deferred's resolved data.
		 * 
		 *     Recipe.findAll({limit: 20}, function(recipes){
		 *       recipes.constructor //-> can.Model.List
		 *     })
		 * 
		 * @param {Function} error(xhr) `error` is called if the Deferred is rejected with the
		 * xhr handler.
		 * 
		 * @return {Deferred} a [can.Deferred Deferred] that __resolves__ to
		 * a [can.Model.List] of the model instances and __rejects__ to the XHR object.
		 * 
		 *     Recipe.findAll()
		 *           .then(function(recipes){
		 * 	
		 *           }, function(xhr){
		 * 	
		 *           })
		 */
		findAll : {
			url : "_shortName"
		},
		/**
		 * @function findOne
		 * `findOne( params, success(instance), error(xhr) ) -> Deferred` is used to retrieve a model 
		 * instance from the server. Before you can use `findOne`, you must implement it.
		 * 
		 * ## Implement with a URL
		 * 
		 * Implement findAll with a url like:
		 * 
		 *     Recipe = can.Model({
		 *       findOne : "/recipes/{id}.json"
		 *     },{});
		 * 
		 * If `findOne` is called like:
		 * 
		 *     Recipe.findOne({id: 57});
		 * 
		 * The server should return data that looks like:
		 * 
		 *     {"id" : 57, "name": "Ice Water"}
		 * 
		 * ## Implement with an Object
		 * 
		 * Implement `findOne` with an object that specifies the parameters to
		 * `can.ajax` (jQuery.ajax) like:
		 * 
		 *     Recipe = can.Model({
		 *       findOne : {
		 *         url: "/recipes/{id}.xml",
		 *         dataType: "xml"
		 *       }
		 *     },{})
		 * 
		 * ## Implement with a Function
		 * 
		 * To implement with a function, `findOne` is passed __params__ to specify
		 * the instance retrieved from the server and it should return a
		 * deferred that resolves to the model data.  Also notice that you now need to
		 * build the URL manually. For example:
		 * 
		 *     Recipe = can.Model({
		 *       findOne : function(params){
		 *         return $.ajax({
		 *           url: '/recipes/' + params.id,
		 *           type: 'get',
		 *           dataType: 'json'})
		 *       }
		 *     },{})
		 * 
		 * ## Use
		 * 
		 * After implementing `findOne`, you can use it to retrieve an instance of the model
		 * like:
		 * 
		 *     Recipe.findOne({id: 57}, function(recipe){
		 * 	     recipe.attr('name') //-> "Ice Water"
		 *     }, function( xhr ){
		 * 	     // called if an error
		 *     }) //-> Deferred
		 * 
		 * The following API details the use of `findOne`.
		 * 
		 * @param {Object} params data to specify the instance. 
		 * 
		 *     Recipe.findAll({id: 20})
		 *
		 * @param {Function} [success(item)] called with a model 
		 * instance.  The model isntance is created from the Deferred's resolved data.
		 * 
		 *     Recipe.findOne({id: 20}, function(recipe){
		 *       recipe.constructor //-> Recipe
		 *     })
		 * 
		 * @param {Function} error(xhr) `error` is called if the Deferred is rejected with the
		 * xhr handler.
		 * 
		 * @return {Deferred} a [can.Deferred Deferred] that __resolves__ to
		 * the model instance and __rejects__ to the XHR object.
		 * 
		 *     Recipe.findOne({id: 20})
		 *           .then(function(recipe){
		 * 	
		 *           }, function(xhr){
		 * 	
		 *           })
		 */
		findOne: {}
	},
		// Makes an ajax request `function` from a string.
		//		`ajaxMethod` - The `ajaxMethod` object defined above.
		//		`str` - The string the user provided. Ex: `findAll: "/recipes.json"`.
		ajaxMaker = function(ajaxMethod, str){
			// Return a `function` that serves as the ajax method.
			return function(data){
				// If the ajax method has it's own way of getting `data`, use that.
				data = ajaxMethod.data ? 
					ajaxMethod.data.apply(this, arguments) :
					// Otherwise use the data passed in.
					data;
				// Return the ajax method with `data` and the `type` provided.
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get")
			}
		}


	
	
	can.Model = can.Observe({
		fullName: "can.Model",
		setup : function(base){
			can.Observe.apply(this, arguments);
			if(!can.Model){
				return;
			}
			var self = this,
				clean = can.proxy(this._clean, self);
			
			
			// go through ajax methods and set them up
			can.each(ajaxMethods, function(method, name){
				// if an ajax method is not a function, it's either
				// a string url like findAll: "/recipes" or an
				// ajax options object like {url: "/recipes"}
				if ( ! can.isFunction( self[name] )) {
					// use ajaxMaker to convert that into a function
					// that returns a deferred with the data
					self[name] = ajaxMaker(method, self[name]);
				}
				// check if there's a make function like makeFindAll
				// these take deferred function and can do special
				// behavior with it (like look up data in a store)
				if (self["make"+can.capitalize(name)]){
					// pass the deferred method to the make method to get back
					// the "findAll" method.
					var newMethod = self["make"+can.capitalize(name)](self[name]);
					can.Construct._overwrite(self, base, name,function(){
						// make sure super is called
						this._super;
						// increment the numer of requests
						this._reqs++;
						return newMethod.apply(this, arguments).then(clean, clean);
					})
				}
			});

			var oldFindAll
			if(self.fullName == "can.Model" || !self.fullName){
				self.fullName = "Model"+(++modelNum);
			}
			// Ddd ajax converters.
			this.store = {};
			this._reqs = 0;
			this._url = this._shortName+"/{"+this.id+"}"
		},
		_ajax : ajaxMaker,
		_clean : function(){
			this._reqs--;
			if(!this._reqs){
				for(var id in this.store) {
					if(!this.store[id]._bindings){
						delete this.store[id];
					}
				}
			}
			return arguments[0];
		},
		/**
		 * `can.Model.models(data, xhr)` is used to 
		 * convert the raw response of a [can.Model.findAll] request 
		 * into a [can.Model.List] of model instances.  
		 * 
		 * This method is rarely called directly. Instead the deferred returned
		 * by findAll is piped into `models`.  This creates a new deferred that
		 * resolves to a [can.Model.List] of instances instead of an array of
		 * simple JS objects.
		 * 
		 * If your server is returning data in non-standard way,
		 * overwriting `can.Model.models` is the best way to normalize it.
		 * 
		 * ## Quick Example
		 * 
		 * The following uses models to convert to a [can.Model.List] of model
		 * instances.
		 * 
		 *     Task = can.Model({},{})
		 *     var tasks = Task.models([
		 *       {id: 1, name : "dishes", complete : false},
		 *       {id: 2, name: "laundry", compelte: true}
		 *     ])
		 *     
		 *     tasks.attr("0.complete", true)
		 * 
		 * ## Non-standard Services
		 * 
		 * `can.Model.models` expects data to be an array of name-value pair 
		 * objects like:
		 * 
		 *     [{id: 1, name : "dishes"},{id:2, name: "laundry"}, ...]
		 *     
		 * It can also take an object with additional data about the array like:
		 * 
		 *     {
		 *       count: 15000 //how many total items there might be
		 *       data: [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
		 *     }
		 * 
		 * In this case, models will return a [can.Model.List] of instances found in 
		 * data, but with additional properties as expandos on the list:
		 * 
		 *     var tasks = Task.models({
		 *       count : 1500,
		 *       data : [{id: 1, name: 'dishes'}, ...]
		 *     })
		 *     tasks.attr("name") // -> 'dishes'
		 *     tasks.count // -> 1500
		 * 
		 * ### Overwriting Models
		 * 
		 * If your service returns data like:
		 * 
		 *     {thingsToDo: [{name: "dishes", id: 5}]}
		 * 
		 * You will want to overwrite models to pass the base models what it expects like:
		 * 
		 *     Task = can.Model({
		 *       models : function(data){
		 *         return can.Model.models.call(this,data.thingsToDo);
		 *       }
		 *     },{})
		 * 
		 * `can.Model.models` passes each intstance's data to `can.Model.model` to
		 * create the individual instances.
		 * 
		 * @param {Array|Objects} instancesRawData An array of raw name - value pairs objects like:
		 * 
		 *      [{id: 1, name : "dishes"},{id:2, name: "laundry"}, ...]
		 * 
		 * Or an Object with a data property and other expando properties like:
		 * 
		 *     {
		 *       count: 15000 //how many total items there might be
		 *       data: [{id: 1, name : "justin"},{id:2, name: "brian"}, ...]
		 *     }
		 * 
		 * @return {Array} a [can.Model.List] of instances.  Each instance is created with
		 * [can.Model.model].
		 */
		models: function( instancesRawData ) {

			if ( ! instancesRawData ) {
				return;
			}
      
			if ( instancesRawData instanceof this.List ) {
				return instancesRawData;
			}

			// Get the list type.
			var self = this,
				res = new( self.List || ML),
				// Did we get an `array`?
				arr = can.isArray(instancesRawData),
				
				// Did we get a model list?
				ml = (instancesRawData instanceof ML),

				// Get the raw `array` of objects.
				raw = arr ?

				// If an `array`, return the `array`.
				instancesRawData :

				// Otherwise if a model list.
				(ml ?

				// Get the raw objects from the list.
				instancesRawData.serialize() :

				// Get the object's data.
				instancesRawData.data),
				i = 0;

			

			can.each(raw, function( rawPart ) {
				res.push( self.model( rawPart ));
			});

			if ( ! arr ) { // Push other stuff onto `array`.
				can.each(instancesRawData, function(val, prop){
					if ( prop !== 'data' ) {
						res[prop] = val;
					}
				})
			}
			return res;
		},
		/**
		 * `can.Model.model(attributes)` is used to convert data from the server into
		 * a model instance.  It is rarely called directly.  Instead it is invoked as 
		 * a result of [can.Model.findOne] or [can.Model.findAll].  
		 * 
		 * If your server is returning data in non-standard way,
		 * overwriting `can.Model.model` is a good way to normalize it.
		 * 
		 * ## Example
		 * 
		 * The following uses `model` to convert to a model
		 * instance.
		 * 
		 *     Task = can.Model({},{})
		 *     var task = Task.model({id: 1, name : "dishes", complete : false})
		 *     
		 *     tasks.attr("complete", true)
		 * 
		 * `Task.model(attrs)` is very similar to simply calling `new Model(attrs)` except
		 * that it checks the model's store if the instance has already been created.  The model's 
		 * store is a collection of instances that have event handlers.  
		 * 
		 * This means that if the model's store already has an instance, you'll get the same instance
		 * back.  Example:
		 * 
		 *     // create a task
		 *     var taskA = new Task({id: 5, complete: true});
		 * 
		 *     // bind to it, which puts it in the store
		 * 	   taskA.bind("complete", function(){});
		 *     
		 *     // use model to create / retrieve a task
		 *     var taskB = Task.model({id: 5, complete: true});
		 *     
		 *     taskA === taskB //-> true
		 * 
		 * ## Non-standard Services
		 * 
		 * `can.Model.model` expects to retreive attributes of the model 
		 * instance like:
		 * 
		 * 
		 *     {id: 5, name : "dishes"}
		 *     
		 * 
		 * If the service returns data formatted differently, like:
		 * 
		 *     {todo: {name: "dishes", id: 5}}
		 * 
		 * Overwrite `model` like:
		 * 
		 *     Task = can.Model({
		 *       model : function(data){
		 *         return can.Model.model.call(this,data.todo);
		 *       }
		 *     },{});
		 * 
		 * @param {Object} attributes An object of property name and values like:
		 * 
		 *      {id: 1, name : "dishes"}
		 * 
		 * @return {model} a model instance.
		 */
		model: function( attributes ) {
			if ( ! attributes ) {
				return;
			}
			if ( attributes instanceof this ) {
				attributes = attributes.serialize();
			}
			var id = attributes[ this.id ],
			    model = id && this.store[id] ? this.store[id].attr(attributes) : new this( attributes );
			if(this._reqs){
				this.store[attributes[this.id]] = model;
			}
			return model;
		}
	},
	/**
	 * @prototype
	 */
	{
		/**
		 * `isNew()` returns if the instance is has been created 
		 * on the server.  
		 * This is essentially if the [can.Model.id] property is null or undefined.
		 * 
		 *     new Recipe({id: 1}).isNew() //-> false
		 * @return {Boolean} false if an id is set, true if otherwise.
		 */
		isNew: function() {
			var id = getId(this);
			return ! ( id || id === 0 ); // If `null` or `undefined`
		},
		/**
		 * `model.save([success(model)],[error(xhr)])` creates or updates 
		 * the model instance using [can.Model.create] or
		 * [can.Model.update] depending if the instance
		 * [can.Model::isNew has an id or not].
		 * 
		 * ## Using `save` to create an instance.
		 * 
		 * If `save` is called on an instance that does not have 
		 * an [can.Model.id id] property, it calls [can.Model.create]
		 * with the instance's properties.  It also [can.trigger triggers]
		 * a "created" event on the instance and the model.
		 * 
		 *     // create a model instance
		 *     var todo = new Todo({name: "dishes"})
		 *     
		 *     // listen when the instance is created
		 *     todo.bind("created", function(ev){
		 * 	     this //-> todo
		 *     })
		 *     
		 *     // save it on the server
		 *     todo.save(function(todo){
		 * 	     console.log("todo", todo, "created")
		 *     });
		 * 
		 * ## Using `save` to update an instance.
		 * 
		 * If save is called on an instance that has 
		 * an [can.Model.id id] property, it calls [can.Model.create]
		 * with the instance's properties.  When the save is complete,
		 * it triggers an "updated" event on the instance and the instance's model.
		 * 
		 * Instances with an
		 * __id__ are typically retrieved with [can.Model.findAll] or
		 * [can.Model.findOne].  
		 * 
		 *  
		 *     // get a created model instance
		 *     Todo.findOne({id: 5},function(todo){
		 *       	     
		 *       // listen when the instance is updated
		 *       todo.bind("updated", function(ev){
		 * 	       this //-> todo
		 *       })
		 * 
		 *       // update the instance's property
		 *       todo.attr("complete", true)
		 *       
		 *       // save it on the server
		 *       todo.save(function(todo){
		 * 	       console.log("todo", todo, "updated")
		 *       });
		 * 
		 *     });
		 * 
		 * 
		 * @param {Function} [success(instance,data)]  Called if a successful save.
		 * 
		 * @param {Function} [error(xhr)] Called with (jqXHR) if the 
		 * save was not successful. It is passed the ajax request's jQXHR object.
		 * 
		 * @return {can.Deferred} a deferred that resolves to the instance
		 * after it has been created or updated.
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
			if ( ! ignoreHookup.test( eventName )) { 
				if ( ! this._bindings ) {
					this.constructor.store[getId(this)] = this;
					this._bindings = 0;
				}
				this._bindings++;
			}
			
			return can.Observe.prototype.bind.apply( this, arguments );
		},
		/**
		 * @function unbind
		 * `unbind(eventName, handler)` removes a listener
		 * attached with [can.Model::bind].
		 * 
		 *     var handler = function(ev, createdTask){
		 * 	     
		 *     }
		 *     task.bind("created", handler)
		 *     task.unbind("created", handler)
		 * 
		 * You have to pass the same function to `unbind` that you
		 * passed to `bind`.
		 * 
		 * Unbind will also remove the instance from the store
		 * if there are no other listeners.
		 * 
		 * @param {String} eventName The type of event.  
		 * 
		 * @param {Function} handler(event,args...) A callback function
		 * that was passed to `bind`.
		 * 
		 * @return {model} the model instance.
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
		// Change `id`.
		___set: function( prop, val ) {
			can.Observe.prototype.___set.call(this,prop, val)
			// If we add an `id`, move it to the store.
			if(prop === this.constructor.id && this._bindings){
				this.constructor.store[getId(this)] = this;
			}
		}
	});
	
	can.each({
		makeFindAll : "models",
		makeFindOne: "model"
	}, function( method, name ) {
		can.Model[name] = function( oldFind ) {
			return function( params, success, error ) {
				return pipe( oldFind.call( this, params ), this, method ).then( success, error );
			};
		};
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
	"destroyed"], function( funcName ) {
		can.Model.prototype[funcName] = function( attrs ) {
			var stub, 
				constructor = this.constructor;

			// Update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

			// Call event on the instance
			can.trigger(this,funcName);
			can.trigger(this,"change",funcName)
			

			// Call event on the instance's Class
			can.trigger(constructor,funcName, this);
		};
	});
  
  // Model lists are just like `Observe.List` except that when their items are 
  // destroyed, it automatically gets removed from the list.
  /**
   * @class can.Model.List
   * @inherits can.Observe.List
   * @parent canjs
   *
   * Works exactly like [can.Observe.List] and has all of the same properties,
   * events, and functions as an observable list. The only difference is that 
   * when an item from the list is destroyed, it will automatically get removed
   * from the list.
   *
   * ## Creating a new Model List
   *
   * To create a new model list, just use `new {model_name}.List(ARRAY)` like:
   *
   *     var todo1 = new Todo( { name: "Do the dishes" } ),
   *         todo2 = new Todo( { name: "Wash floors" } )
   *     var todos = new Todo.List( [todo1, todo2] );
   *
   * ### Model Lists in `can.Model`
   * [can.Model.static.findAll can.Model.findAll] or [can.Model.models] will
   * almost always be used to return a `can.Model.List` object, even though it
   * is possible to create new lists like below:
   *
   *     var todos = Todo.models([
   *         new Todo( { name: "Do the dishes" } ),
   *         new Todo( { name: "Wash floors" } )
   *     ])
   *     
   *     todos.constructor // -> can.Model.List
   *
   *     // the most correct way to get a can.Model.List
   *     Todo.findAll({}, function(todos) {
   *         todos.constructor // -> can.Model.List
   *     })
   *
   * ### Extending `can.Model.List`
   *
   * Creating custom `can.Model.Lists` allows you to extend lists with helper
   * functions for a list of a specific type. So, if you wanted to be able to
   * see how many todos were completed and remaining something could be written
   * like:
   *
   *     Todo.List = can.Model.List({
   *         completed: function() {
   *             var completed = 0;
   *             this.each(function(i, todo) {
   *                 completed += todo.attr('complete') ? 1 : 0
   *             })
   *             return completed;
   *         },
   *         remaining: function() {
   *             return this.attr('length') - this.completed();
   *         }
   *     })
   *
   *     Todo.findAll({}, function(todos) {
   *         todos.completed() // -> 0
   *         todos.remaining() // -> 2
   *     });
   *
   * ## Removing models from model list
   *
   * The advantage that `can.Model.List` has over a traditional `can.Observe.List`
   * is that when you destroy a model, if it is in that list, it will automatically
   * be removed from the list. 
   *
   *     // Listen for when something is removed from the todos list.
   *     todos.bind("remove", function( ev, oldVals, indx ) {
   *         console.log(oldVals[indx].attr("name") + " removed")
   *     })
   *
   *     todo1.destory(); // console shows "Do the dishes removed"
   *
   *
   */
	var ML = can.Model.List = can.Observe.List({
		setup : function(){
			can.Observe.List.prototype.setup.apply(this, arguments );
			// Send destroy events.
			var self = this;
			this.bind('change', function(ev, how){
				if(/\w+\.destroyed/.test(how)){
					var index = self.indexOf(ev.target);
					if (index != -1) {
						self.splice(index, 1);
					}
				}
			})
		}
	})

	return can.Model;
})(module["can/util/jquery/jquery.js"], module["can/observe/observe.js"]);
module['can/observe/compute/compute.js'] = (function(can) {
	
	// returns the
    // - observes and attr methods are called by func
	// - the value returned by func
	// ex: `{value: 100, observed: [{obs: o, attr: "completed"}]}`
	var getValueAndObserved = function(func, self){
		
		var oldReading;
		if (can.Observe) {
			// Set a callback on can.Observe to know
			// when an attr is read.
			// Keep a reference to the old reader
			// if there is one.  This is used
			// for nested live binding.
			oldReading = can.Observe.__reading;
			can.Observe.__reading = function(obj, attr){
				// Add the observe and attr that was read
				// to `observed`
				observed.push({
					obj: obj,
					attr: attr
				});
			};
		}
		
		var observed = [],
			// Call the "wrapping" function to get the value. `observed`
			// will have the observe/attribute pairs that were read.
			value = func.call(self);

		// Set back so we are no longer reading.
		if(can.Observe){
			can.Observe.__reading = oldReading;
		}
		return {
			value : value,
			observed : observed
		};
	},
		// Calls `callback(newVal, oldVal)` everytime an observed property
		// called within `getterSetter` is changed and creates a new result of `getterSetter`.
		// Also returns an object that can teardown all event handlers.
		computeBinder = function(getterSetter, context, callback){
			// track what we are observing
			var observing = {},
				// a flag indicating if this observe/attr pair is already bound
				matched = true,
				// the data to return 
				data = {
					// we will maintain the value while live-binding is taking place
					value : undefined,
					// a teardown method that stops listening
					teardown: function(){
						for ( var name in observing ) {
							var ob = observing[name];
							ob.observe.obj.unbind(ob.observe.attr, onchanged);
							delete observing[name];
						}
					}
				};
			
			// when a property value is cahnged
			var onchanged = function(){
				// store the old value
				var oldValue = data.value,
					// get the new value
					newvalue = getValueAndBind();
				// update the value reference (in case someone reads)
				data.value = newvalue;
				// if a change happened
				if ( newvalue !== oldValue ) {
					callback(newvalue, oldValue);
				}
			};
			
			// gets the value returned by `getterSetter` and also binds to any attributes
			// read by the call
			var getValueAndBind = function(){
				var info = getValueAndObserved( getterSetter, context ),
					newObserveSet = info.observed;
				
				var value = info.value;
				matched = !matched;
				
				// go through every attribute read by this observe
				can.each(newObserveSet, function(ob){
					// if the observe/attribute pair is being observed
					if(observing[ob.obj._cid+"|"+ob.attr]){
						// mark at as observed
						observing[ob.obj._cid+"|"+ob.attr].matched = matched;
					} else {
						// otherwise, set the observe/attribute on oldObserved, marking it as being observed
						observing[ob.obj._cid+"|"+ob.attr] = {
							matched: matched,
							observe: ob
						};
						ob.obj.bind(ob.attr, onchanged);
					}
				});
				
				// Iterate through oldObserved, looking for observe/attributes
				// that are no longer being bound and unbind them
				for ( var name in observing ) {
					var ob = observing[name];
					if(ob.matched !== matched){
						ob.observe.obj.unbind(ob.observe.attr, onchanged);
						delete observing[name];
					}
				}
				return value;
			};
			// set the initial value
			data.value = getValueAndBind();
			data.isListening = ! can.isEmptyObject(observing);
			return data;
		}
	
	// if no one is listening ... we can not calculate every time
	/**
	 * @class can.compute
	 * @parent can.util
	 * 
	 * `can.compute( getterSetter, [context] ) -> compute` returns a computed method that represents 
	 * some value.  A `compute` can can be:
	 * 
	 *  - __read__ - by calling the method like `compute()`
	 *  - __updated__ - by passing a new value like `compute( "new value" )`
	 *  - __listened__ to for changes - like `compute.bind( "change", handler )`
	 * 
	 * The value maintained by a `compute` can represent:
	 * 
	 *  - A __static__ JavaScript object or value like `{foo : 'bar'}` or `true`.
	 *  - A __composite__ value of one or more [can.Observe] property values.
	 *  - A __converted value__ derived from another value.
	 * 
	 * Computes are an abstraction for some value that can be changed. [can.Control]s that 
	 * accept computes (or convert params to computes) can be easily hooked up to 
	 * any data source and be live widgets (widgets that update themselves when data changes).
	 * 
	 * ## Static values
	 * 
	 * `can.compute([value])` creates a `computed` with some value.  For example:
	 * 
	 *     // create a compute
	 *     var age = can.compute(29);
	 * 
	 *     // read the value
	 *     console.log("my age is currently", age());
	 * 
	 *     // listen to changes in age
	 *     age.bind("change", function(ev, newVal, oldVal){
	 *       console.log("my age changed from",oldVal,"to",newVal)
	 *     })
	 *     // update the age
	 *     age(30);
	 * 
	 * Notice that you can __read__, __update__, 
	 * and __listen__ to changes in any single value.
	 * 
	 * _NOTE: [can.Observe] is similar to compute, but used for objects with multiple properties._
	 * 
	 * ## Composite values
	 * 
	 * Computes can represent a composite value of one 
	 * or more `can.Observe` properties.  The following
	 * creates a fullName compute that is the `person`
	 * observe's first and last name:
	 * 
	 *     var person = new can.Observe({
	 *       first : "Justin",
	 *       last : "Meyer"
	 *     });
	 *     var fullName = can.compute(function(){
	 *       return person.attr("first") +" "+ person.attr("last")
	 *     })
	 * 
	 * Read from fullName like:
	 * 
	 *     fullName() //-> "Justin Meyer"
	 * 
	 * Listen to changes in fullName like:
	 * 
	 *     fullName.bind("change", function(ev, newVal, oldVal){
	 *     
	 *     })
	 * 
	 * When an event handler is bound to fullName it starts
	 * caching the computes value so additional reads are faster!
	 * 
	 * ## Converted values
	 * 
	 * `can.compute( getterSetter( [newVal] ) )` can be used to convert one observe's value into
	 * another value.  For example, a `PercentDone` widget might accept
	 * a compute that needs to have values from `0` to `100`, but your project's
	 * progress is given between `0` and `1`. Pass that widget a compute!
	 * 
	 *     var project = new can.Observe({
	 *       progress :  0.5
	 *     });
	 *     var percentage = can.compute(function(newVal){
	 *       // are we setting?
	 *       if(newVal !=== undefined){
	 *         project.attr("progress", newVal / 100)  
	 *       } else {
	 *         return project.attr("progress") * 100;  
	 *       }
	 *     })
	 * 
	 *     // We can read from percentage.
	 *     percentage() //-> 50
	 * 
	 *     // Write to percentage,
	 *     percentage(75)
	 *     // but it updates project!
	 *     project.attr('progress') //-> 0.75
	 * 
	 *     // pass it to PercentDone
	 *     new PercentDone({
	 *       val : percentage
	 *     })
	 * 
	 * ## Using computes in building controls.
	 * 
	 * Widgets that listen to data changes and automatically update 
	 * themselves kick ass. It's what the V in MVC is all about.  
	 * 
	 * However, some enironments don't have observeable data. In an ideal
	 * world, you'd like to make your widgets still useful to them.
	 * 
	 * `can.compute` lets you have your cake and eat it too. Simply convert
	 * all options to compute.  Provide methods to update the compute
	 * values and listen to changes in computes.  Lets see how that
	 * looks with `PercentDone`:
	 * 
	 *     var PercentDone = can.Control({
	 *       init : function(){
	 *         this.options.val = can.compute(this.options.val)
	 *         // rebind event handlers
	 *         this.on();
	 *         this.updateContent();
	 *       },
	 *       val: function(value){
	 * 	       return this.options.val(value)
	 *       },
	 *       "{val} change" : "updateContent",
	 *       updateContent : function(){
	 *         this.element.html(this.options.val())
	 *       }
	 *     })
	 * 
	 * 
	 */
	can.compute = function(getterSetter, context){
		if(getterSetter.isComputed){
			return getterSetter;
		}
		// get the value right away
		// TODO: eventually we can defer this until a bind or a read
		var computedData,
			bindings = 0,
			computed,
			canbind = true;
		if(typeof getterSetter === "function"){
			computed = function(value){
				if(value === undefined){
					// we are reading
					if(computedData){
						return computedData.value;
					} else {
						return getterSetter.call(context || this)
					}
				} else {
					return getterSetter.apply(context || this, arguments)
				}
			}
			
		} else {
			// we just gave it a value
			computed = function(val){
				if(val === undefined){
					return getterSetter;
				} else {
					var old = getterSetter;
					getterSetter = val;
					if( old !== val){
						can.trigger(computed, "change",[val, old]);
					}
					
					return val;
				}
				
			}
			canbind = false;
		}
		/**
		 * @attribute isComputed
		 * 
		 */
		computed.isComputed = true;
		

		/**
		 * @function bind
		 * `compute.bind("change", handler(event, newVal, oldVal))`
		 */
		computed.bind = function(ev, handler){
			can.addEvent.apply(computed, arguments);
			if( bindings === 0 && canbind){
				// setup live-binding
				computedData = computeBinder(getterSetter, context || this, function(newValue, oldValue){
					can.trigger(computed, "change",[newValue, oldValue])
				});
			}
			bindings++;
		}
		/**
		 * @function unbind
		 * `compute.unbind("change", handler)`
		 */
		computed.unbind = function(ev, handler){
			can.removeEvent.apply(computed, arguments);
			bindings--;
			if( bindings === 0 && canbind){
				computedData.teardown();
			}
			
		};
		return computed;
	};
	can.compute.binder = computeBinder;
	return can.compute;
})(module["can/util/jquery/jquery.js"]);
module['can/view/ejs/ejs.js'] = (function( can ) {

	// ## ejs.js
	// `can.EJS`  
	// _Embedded JavaScript Templates._

	// Helper methods.
	var myEval = function( script ) {
		eval(script);
	},
		extend = can.extend,
		// Regular expressions for caching.
		quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
		attrReg = /([^\s]+)=$/,
		newLine = /(\r|\n)+/g,
		attributeReplace = /__!!__/g,		
		tagMap = {
			"": "span", 
			table: "tr", 
			tr: "td", 
			ol: "li", 
			ul: "li", 
			tbody: "tr",
			thead: "tr",
			tfoot: "tr",
			select: "option",
			optgroup: "option"
		},
		tagToContentPropMap= {
			option: "textContent",
			textarea: "value"
		},
		// Escapes characters starting with `\`.
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
		// Cross-browser attribute methods.
		// These should be mapped to the underlying library.
		attrMap = {
			"class" : "className",
			"value": "value",
			"textContent" : "textContent"
		},
		bool = can.each(["checked","disabled","readonly","required"], function(n){
			attrMap[n] = n;
		}),
		setAttr = function(el, attrName, val){
			// if this is a special property
			if ( attrMap[attrName] ) {
				// set the value as true / false
				el[attrMap[attrName]] = can.inArray(attrName,bool) > -1 ? true  : val;
			} else {
				el.setAttribute(attrName, val);
			}
		},
		getAttr = function(el, attrName){
			return attrMap[attrName]?
				el[attrMap[attrName]]:
				el.getAttribute(attrName);
		},
		removeAttr = function(el, attrName){
			if(can.inArray(attrName,bool) > -1){
				el[attrName] = false;
			} else{
				el.removeAttribute(attrName);
			}
		},
		// a helper to get the parentNode for a given element el
		// if el is in a documentFragment, it will return defaultParentNode
		getParentNode = function(el, defaultParentNode){
			return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
		},
		// helper to know if property is not an expando on oldObserved's list of observes
		// this should probably be removed and oldObserved should just have a
		// property with observes
		observeProp = function(name){
			return name.indexOf("|") >= 0;
		},
		// a mapping of element ids to nodeList ids
		nodeMap = {},
		// a mapping of nodeList ids to nodeList
		nodeListMap = {},
		expando = "ejs_"+Math.random(),
		_id=0,
		id = function(node){
			if ( node[expando] ) {
				return node[expando];
			} else {
				return node[expando] = (node.nodeName ? "element_" : "obj_")+(++_id);
			}
		},
		// 
		register= function(nodeList){
			var nLId = id(nodeList);
			nodeListMap[nLId] = nodeList;
			
			can.each(nodeList, function(node){
				addNodeListId(node, nLId);
			});
		},
		addNodeListId = function(node, nodeListId){
			var nodeListIds = nodeMap[id(node)];
				if(!nodeListIds){
					nodeListIds = nodeMap[id(node)] = [];
				}
				nodeListIds.push(nodeListId);
		},
		unregister= function(nodeList){
			var nLId = id(nodeList);
			can.each(nodeList, function(node){
				removeNodeListId(node, nLId);
			});
			delete nodeListMap[nLId];
		},
		// removes a nodeListId from a node's nodeListIds
		removeNodeListId= function(node, nodeListId){
			var nodeListIds = nodeMap[id(node)];
			if( nodeListIds ) {
				var index = can.inArray(nodeListId, nodeListIds);
			
				if ( index >= 0 ) {
					nodeListIds.splice( index ,  1 );
				}
				if(!nodeListIds.length){
					delete nodeMap[id(node)];
				}
			}
			
		},
		// all lists
		replace= function(oldNodeList, newNodes){
			// for each node in the node list
			oldNodeList = can.makeArray( oldNodeList );
			
			can.each( oldNodeList, function(node){
				// for each nodeList the node is in
				can.each( can.makeArray( nodeMap[id(node)] ), function( nodeListId ){
					var nodeList = nodeListMap[nodeListId];
					var startIndex = can.inArray( node, nodeList ),
						endIndex = can.inArray( oldNodeList[oldNodeList.length - 1], nodeList  );
					
					// remove this nodeListId from each node
					if(startIndex >=0 && endIndex >= 0){
						//
						for( var i = startIndex; i <= endIndex; i++){
							var n = nodeList[i];
							removeNodeListId(n, nodeListId);
						}
						// swap in new nodes into the nodeLIst
						nodeList.splice.apply(nodeList, [startIndex,endIndex-startIndex+1 ].concat(newNodes));
						// tell these new nodes they belong to the nodeList
						can.each(newNodes, function( node ) {
							addNodeListId(node, nodeListId);
						});
					} else {
						unregister( nodeList );
					}
					
				});
				
			});
		},
		// Returns escaped/sanatized content for anything other than a live-binding
		contentEscape = function( txt ) {
			return (typeof txt == 'string' || typeof txt == 'number') ?
				can.esc( txt ) :
				contentText(txt);
		},
		// Returns text content for anything other than a live-binding 
		contentText =  function( input ) {	
			
			// If it's a string, return.
			if ( typeof input == 'string' ) {
				return input;
			}
			// If has no value, return an empty string.
			if ( !input && input !== 0 ) {
				return '';
			}

			// If it's an object, and it has a hookup method.
			var hook = (input.hookup &&

			// Make a function call the hookup method.
			function( el, id ) {
				input.hookup.call(input, el, id);
			}) ||

			// Or if it's a `function`, just use the input.
			(typeof input == 'function' && input);

			// Finally, if there is a `function` to hookup on some dom,
			// add it to pending hookups.
			if ( hook ) {
				pendingHookups.push(hook);
				return '';
			}

			// Finally, if all else is `false`, `toString()` it.
			return "" + input;
		},
		// The EJS constructor function
		EJS = function( options ) {
			// Supports calling EJS without the constructor
			// This returns a function that renders the template.
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers);
				};
			}
			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}
			// Set options on self.
			extend(this, options);
			this.template = scan(this.text, this.name);
		};

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
		// Called to return the content within a magic tag like `<%= %>`.
		// - escape - if the content returned should be escaped
		// - tagName - the tag name the magic tag is within or the one that proceeds the magic tag
		// - status - where the tag is in.  The status can be:
		//    - _STRING_ - The name of the attribute the magic tag is within
		//    - `1` - The magic tag is within a tag like `<div <%= %>>`
		//    - `0` - The magic tag is outside (or between) tags like `<div><%= %></div>`
		// - self - the `this` the template was called with
		// - func - the "wrapping" function.  For example:  `<%= task.attr('name') %>` becomes
		//   `(function(){return task.attr('name')})
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
		txt: function(escape, tagName, status, self, func){
			// call the "wrapping" function and get the binding information
			var binding = can.compute.binder(func, self, function(newVal, oldVal){
				// call the update method we will define for each
				// type of attribute
				update(newVal, oldVal);
			});
			
			// If we had no observes just return the value returned by func.
			if(!binding.isListening){
				return (escape || status !== 0? contentEscape : contentText)(binding.value);
			}
			// The following are helper methods or varaibles that will
			// be defined by one of the various live-updating schemes.
			
			// The parent element we are listening to for teardown
			var	parentElement,
				nodeList,
				teardown= function(){
					binding.teardown();
					if ( nodeList ) {
						unregister( nodeList );
					}
				},
				// if the parent element is removed, teardown the binding
				setupTeardownOnDestroy = function(el){
					can.bind.call(el,'destroyed', teardown);
					parentElement = el;
				},
				// if there is no parent, undo bindings
				teardownCheck = function(parent){
					if(!parent){
						teardown();
						can.unbind.call(parentElement,'destroyed', teardown);
					}
				},
				// the tag type to insert
				tag = (tagMap[tagName] || "span"),
				// this will be filled in if binding.isListening
				update,
				// the property (instead of innerHTML elements) to adjust. For
				// example options should use textContent
				contentProp = tagToContentPropMap[tagName];
			
			
			// The magic tag is outside or between tags.
			if ( status === 0 && !contentProp ) {
				// Return an element tag with a hookup in place of the content
				return "<" +tag+can.view.hook(
				escape ? 
					// If we are escaping, replace the parentNode with 
					// a text node who's value is `func`'s return value.
					function(el, parentNode){
						// updates the text of the text node
						update = function(newVal){
							node.nodeValue = ""+newVal;
							teardownCheck(node.parentNode);
						};
						
						var parent = getParentNode(el, parentNode),
							node = document.createTextNode(binding.value);
							
						parent.insertBefore(node, el);
						parent.removeChild(el);
						setupTeardownOnDestroy(parent);
					} 
					:
					// If we are not escaping, replace the parentNode with a
					// documentFragment created as with `func`'s return value.
					function( span, parentNode ) {
						// updates the elements with the new content
						update = function(newVal){
							// is this still part of the DOM?
							var attached = nodes[0].parentNode;
							// update the nodes in the DOM with the new rendered value
							if( attached ) {
								makeAndPut(newVal);
							} else {
								// no longer attached
							}
							teardownCheck(nodes[0].parentNode);
						};
						
						// make sure we have a valid parentNode
						parentNode = getParentNode(span, parentNode);
						// A helper function to manage inserting the contents
						// and removing the old contents
						var nodes,
							makeAndPut = function(val){
								// create the fragment, but don't hook it up
								// we need to insert it into the document first
								var frag = can.view.frag(val, parentNode),
									// keep a reference to each node
									newNodes = can.makeArray(frag.childNodes),
									last = nodes ? nodes[nodes.length - 1] : span;
								
								// Insert it in the `document` or `documentFragment`
								if( last.nextSibling ){
									last.parentNode.insertBefore(frag, last.nextSibling);
								} else {
									last.parentNode.appendChild(frag);
								}
								// nodes hasn't been set yet
								if( !nodes ) {
									can.remove( can.$(span) );
									nodes = newNodes;
									// set the teardown nodeList
									nodeList = nodes;
									register(nodes);
								} else {
									can.remove( can.$(nodes) );
									replace(nodes,newNodes);
								}
							};
							// nodes are the nodes that any updates will replace
							// at this point, these nodes could be part of a documentFragment
						makeAndPut(binding.value, [span]);
						
						
						setupTeardownOnDestroy(parentNode);
						
				}) + "></" +tag+">";
			// In a tag, but not in an attribute
			} else if( status === 1 ) { 
				// remember the old attr name
				var attrName = binding.value.replace(/['"]/g, '').split('=')[0];
				pendingHookups.push(function(el) {
					update = function(newVal){
						var parts = (newVal|| "").replace(/['"]/g, '').split('='),
							newAttrName = parts[0];
						
						// Remove if we have a change and used to have an `attrName`.
						if((newAttrName != attrName) && attrName){
							removeAttr(el,attrName);
						}
						// Set if we have a new `attrName`.
						if(newAttrName){
							setAttr(el, newAttrName, parts[1]);
							attrName = newAttrName;
						}
					};
					setupTeardownOnDestroy(el);
				});

				return binding.value;
			} else { // In an attribute...
				var attributeName = status === 0 ? contentProp : status;
				// if the magic tag is inside the element, like `<option><% TAG %></option>`,
				// we add this hookup to the last element (ex: `option`'s) hookups.
				// Otherwise, the magic tag is in an attribute, just add to the current element's
				// hookups.
				(status === 0  ? lastHookups : pendingHookups ).push(function(el){
					// update will call this attribute's render method
					// and set the attribute accordingly
					update = function(){
						setAttr(el, attributeName, hook.render(), contentProp);
					};
					
					var wrapped = can.$(el),
						hooks;
					
					// Get the list of hookups or create one for this element.
					// Hooks is a map of attribute names to hookup `data`s.
					// Each hookup data has:
					// `render` - A `function` to render the value of the attribute.
					// `funcs` - A list of hookup `function`s on that attribute.
					// `batchNum` - The last event `batchNum`, used for performance.
					hooks = can.data(wrapped,'hooks');
					if ( ! hooks ) {
						can.data(wrapped, 'hooks', hooks = {});
					}
					
					// Get the attribute value.
					var attr = getAttr(el, attributeName, contentProp),
						// Split the attribute value by the template.
						parts = attr.split("__!!__"),
						hook;

					
					// If we already had a hookup for this attribute...
					if(hooks[attributeName]) {
						// Just add to that attribute's list of `function`s.
						hooks[attributeName].bindings.push(binding);
					} else {
						// Create the hookup data.
						hooks[attributeName] = {
							render: function() {
								var i =0,
									newAttr = attr.replace(attributeReplace, function() {
										return contentText( hook.bindings[i++].value );
									});
								return newAttr;
							},
							bindings: [binding],
							batchNum : undefined
						};
					}

					// Save the hook for slightly faster performance.
					hook = hooks[attributeName];

					// Insert the value in parts.
					parts.splice(1,0,binding.value);

					// Set the attribute.
					setAttr(el, attributeName, parts.join(""), contentProp);
					
					// Bind on change.
					//liveBind(observed, el, binder,oldObserved);
					setupTeardownOnDestroy(el);
				});
				return "__!!__";
			}
		},
		pending: function() {
			// TODO, make this only run for the right tagName
			if(true  || pendingHookups.length) {
				var hooks = pendingHookups.slice(0);
				lastHookups = hooks;
				pendingHookups = [];
				return can.view.hook(function(el){
					can.each(hooks, function(fn){
						fn(el);
					});
				});
			} else {
				return "";
			}
		},
		register: register,
		unregister: unregister,
		replace: replace,
		nodeMap: nodeMap,
		// a mapping of nodeList ids to nodeList
		nodeListMap: nodeListMap
});
	// Start scanning code.
	var tokenReg = new RegExp("(" +[ "<%%", "%%>", "<%==", "<%=", 
					"<%#", "<%", "%>", "<", ">", '"', "'"].join("|")+")","g"),
		// Commands for caching.
		startTxt = 'var ___v1ew = [];',
		finishTxt = "return ___v1ew.join('')",
		put_cmd = "___v1ew.push(",
		insert_cmd = put_cmd,
		// Global controls (used by other functions to know where we are).
		//  
		// Are we inside a tag?
		htmlTag = null,
		// Are we within a quote within a tag?
		quote = null,
		// What was the text before the current quote? (used to get the `attr` name)
		beforeQuote = null,
		// Used to mark where the element is.
		status = function(){
			// `t` - `1`.
			// `h` - `0`.
			// `q` - String `beforeQuote`.
			return quote ? "'"+beforeQuote.match(attrReg)[1]+"'" : (htmlTag ? 1 : 0);
		},
		pendingHookups = [],
		lastHookups = [],
		scan = function(source, name){
			var tokens = [],
				last = 0;
			
			source = source.replace(newLine, "\n");
			source.replace(tokenReg, function(whole, part, offset){
				// if the next token starts after the last token ends
				// push what's in between
				if(offset > last){
					tokens.push( source.substring(last, offset) );
				}
				// push the token 
				tokens.push(part);
				// update the position of the last part of the last token
				last = offset+part.length;
			});
			// if there's something at the end, add it
			if(last < source.length){
				tokens.push(source.substr(last));
			}
			
			var content = '',
				buff = [startTxt],
				// Helper `function` for putting stuff in the view concat.
				put = function( content, bonus ) {
					buff.push(put_cmd, '"', clean(content), '"'+(bonus||'')+');');
				},
				// A stack used to keep track of how we should end a bracket
				// `}`.  
				// Once we have a `<%= %>` with a `leftBracket`,
				// we store how the file should end here (either `))` or `;`).
				endStack =[],
				// The last token, used to remember which tag we are in.
				lastToken,
				// The corresponding magic tag.
				startTag = null,
				// Was there a magic tag inside an html tag?
				magicInTag = false,
				// The current tag name.
				tagName = '',
				// stack of tagNames
				tagNames = [],
				// Declared here.
				bracketCount,
				i = 0,
				token;

			// Reinitialize the tag state goodness.
			htmlTag = quote = beforeQuote = null;

			for (; (token = tokens[i++]) !== undefined;) {

				if ( startTag === null ) {
					switch ( token ) {
					case '<%':
					case '<%=':
					case '<%==':
						magicInTag = 1;
					case '<%#':
						// A new line -- just add whatever content within a clean.  
						// Reset everything.
						startTag = token;
						if ( content.length ) {
							put(content);
						}
						content = '';
						break;

					case '<%%':
						// Replace `<%%` with `<%`.
						content += '<%';
						break;
					case '<':
						// Make sure we are not in a comment.
						if(tokens[i].indexOf("!--") !== 0) {
							htmlTag = 1;
							magicInTag = 0;
						}
						content += token;
						break;
					case '>':
						htmlTag = 0;
						// if there was a magic tag
						// or it's an element that has text content between its tags, 
						// but content is not other tags add a hookup
						// TODO: we should only add `can.EJS.pending()` if there's a magic tag 
						// within the html tags.
						if(magicInTag || tagToContentPropMap[ tagNames[tagNames.length -1] ]){
							put(content, ",can.EJS.pending(),\">\"");
							content = '';
						} else {
							content += token;
						}
						// if it's a tag like <input/>
						if(lastToken.substr(-1) == "/"){
							// remove the current tag in the stack
							tagNames.pop();
							// set the current tag to the previous parent
							tagName = tagNames[tagNames.length-1];
						}
						break;
					case "'":
					case '"':
						// If we are in an html tag, finding matching quotes.
						if(htmlTag){
							// We have a quote and it matches.
							if(quote && quote === token){
								// We are exiting the quote.
								quote = null;
								// Otherwise we are creating a quote.
								// TODO: does this handle `\`?
							} else if(quote === null){
								quote = token;
								beforeQuote = lastToken;
							}
						}
					default:
						// Track the current tag
						if(lastToken === '<'){
							tagName = token.split(/\s/)[0];
							// If 
							if( tagName.indexOf("/") === 0 && tagNames.pop() === tagName.substr(1) ) {
								tagName = tagNames[tagNames.length-1]|| tagName.substr(1);
							} else {
								tagNames.push(tagName);
							}
						}
						content += token;
						break;
					}
				}
				else {
					// We have a start tag.
					switch ( token ) {
					case '%>':
						// `%>`
						switch ( startTag ) {
						case '<%':
							// `<%`
							
							// Get the number of `{ minus }`
							bracketCount = bracketNum(content);
							
							// We are ending a block.
							if (bracketCount == 1) {

								// We are starting on.
								buff.push(insert_cmd, "can.EJS.txt(0,'"+tagName+"'," + status() + ",this,function(){", startTxt, content);
								
								endStack.push({
									before: "",
									after: finishTxt+"}));\n"
								});
							}
							else {
								
								// How are we ending this statement?
								last = // If the stack has value and we are ending a block...
									endStack.length && bracketCount == -1 ? // Use the last item in the block stack.
									endStack.pop() : // Or use the default ending.
								{
									after: ";"
								};
								
								// If we are ending a returning block, 
								// add the finish text which returns the result of the
								// block.
								if (last.before) {
									buff.push(last.before);
								}
								// Add the remaining content.
								buff.push(content, ";",last.after);
							}
							break;
						case '<%=':
						case '<%==':
							// We have an extra `{` -> `block`.
							// Get the number of `{ minus }`.
							bracketCount = bracketNum(content);
							// If we have more `{`, it means there is a block.
							if( bracketCount ){
								// When we return to the same # of `{` vs `}` end with a `doubleParent`.
								endStack.push({
									before : finishTxt,
									after: "}));"
								});
							} 
							// Check if its a func like `()->`
							if(quickFunc.test(content)){
								var parts = content.match(quickFunc);
								content = "function(__){var "+parts[1]+"=can.$(__);"+parts[2]+"}";
							}
							
							// If we have `<%== a(function(){ %>` then we want
							// `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.
							buff.push(insert_cmd, "can.EJS.txt("+(startTag === '<%=' ? 1 : 0)+",'"+tagName+"'," + status()+",this,function(){ return ", content, 
								// If we have a block.
								bracketCount ? 
								// Start with startTxt `"var _v1ew = [];"`.
								startTxt : 
								// If not, add `doubleParent` to close push and text.
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
			
			// Put it together...
			if ( content.length ) {
				// Should be `content.dump` in Ruby.
				put(content);
			}
			buff.push(";");
			
			var template = buff.join(''),
				out = {
					out: 'with(_VIEW) { with (_CONTEXT) {' + template + " "+finishTxt+"}}"
				};
			// Use `eval` instead of creating a function, because it is easier to debug.
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
		 * @function list
		 * @hide
		 * 
		 * `can.EJS.Helpers.list` iterates over an observable list and
		 * sets up live binding. `list` takes a list of observables and a callback 
		 * function with the signature `callback( currentItem, index, itemList )`
		 *
		 * Typically, this will look like:
		 *
		 *     <% list(items, function(item){ %>
		 *          <li><%= item.attr('name') %></li>
		 *     <% }) %>
		 *
		 * Whenever the list of observables changes, such as when an item is added or removed, 
		 * the EJS view will redraw the list in the DOM.
		 */
		// TODO Deprecated!!
		list : function(list, cb){
			can.each(list, function(item, i){
				cb(item, i, list)
			})
		}
	};

	// Options for `steal`'s build.
	can.view.register({
		suffix: "ejs",
		// returns a `function` that renders the view.
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

	return can;
})(module["can/util/jquery/jquery.js"], module["can/view/view.js"], module["can/util/string/string.js"], module["can/observe/compute/compute.js"]);
module['can/util/string/deparam/deparam.js'] = (function( can ){
	
	// ## deparam.js  
	// `can.deparam`  
	// _Takes a string of name value pairs and returns a Object literal that represents those params._
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g,
		paramTest = /([^?#]*)(#.*)?$/,
		prep = function( str ) {
			return decodeURIComponent( str.replace(/\+/g, " ") );
		};
	

	can.extend(can, { 
		/**
		 * @function can.deparam
		 * @parent can.util
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
				pairs, lastPart;

			if ( params && paramTest.test( params )) {
				
				pairs = params.split('&'),
				
				can.each( pairs, function( pair ) {

					var parts = pair.split('='),
						key   = prep( parts.shift() ),
						value = prep( parts.join("=") );

					current = data;
					parts = key.match(keyBreaker);
			
					for ( var j = 0, l = parts.length - 1; j < l; j++ ) {
						if (!current[parts[j]] ) {
							// If what we are pointing to looks like an `array`
							current[parts[j]] = digitTest.test(parts[j+1]) || parts[j+1] == "[]" ? [] : {};
						}
						current = current[parts[j]];
					}
					lastPart = parts.pop();
					if ( lastPart == "[]" ) {
						current.push(value);
					} else {
						current[lastPart] = value;
					}
				});
			}
			return data;
		}
	});
	return can;
})(module["can/util/jquery/jquery.js"], module["can/util/string/string.js"]);
module['can/route/route.js'] = (function(can) {

	// ## route.js  
	// `can.route`  
	// _Helps manage browser history (and client state) by synchronizing the 
	// `window.location.hash` with a `can.Observe`._  
	//   
    // Helper methods used for matching routes.
	var 
		// `RegExp` used to match route variables of the type ':name'.
        // Any word character or a period is matched.
        matcher = /\:([\w\.]+)/g,
        // Regular expression for identifying &amp;key=value lists.
        paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
        // Converts a JS Object into a list of parameters that can be 
        // inserted into an html element tag.
		makeProps = function( props ) {
			var tags = [];
			can.each(props, function(val, name){
				tags.push( ( name === 'className' ? 'class'  : name )+ '="' + 
						(name === "href" ? val : can.esc(val) ) + '"');
			});
			return tags.join(" ");
		},
		// Checks if a route matches the data provided. If any route variable
        // is not present in the data, the route does not match. If all route
        // variables are present in the data, the number of matches is returned 
        // to allow discerning between general and more specific routes. 
		matchesData = function(route, data) {
			var count = 0, i = 0, defaults = {};
			// look at default values, if they match ...
			for( var name in route.defaults ) {
				if(route.defaults[name] === data[name]){
					// mark as matched
					defaults[name] = 1;
					count++;
				}
			}
			for (; i < route.names.length; i++ ) {
				if (!data.hasOwnProperty(route.names[i]) ) {
					return -1;
				}
				if(!defaults[route.names[i]]){
					count++;
				}
				
			}
			
			return count;
		},
		onready = !0,
		location = window.location,
		quote = function(str) {
			return (str+'').replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
		},
		each = can.each,
		extend = can.extend;


	can.route = function( url, defaults ) {
        defaults = defaults || {};
        // Extract the variable names and replace with `RegExp` that will match
		// an atual URL with values.
		var names = [],
			test = url.replace(matcher, function( whole, name, i ) {
				names.push(name);
				var next = "\\"+( url.substr(i+whole.length,1) || can.route._querySeparator );
				// a name without a default value HAS to have a value
				// a name that has a default value can be empty
				// The `\\` is for string-escaping giving single `\` for `RegExp` escaping.
				return "([^" +next+"]"+(defaults[name] ? "*" : "+")+")";
			});

		// Add route in a form that can be easily figured out.
		can.route.routes[url] = {
            // A regular expression that will match the route when variable values 
            // are present; i.e. for `:page/:type` the `RegExp` is `/([\w\.]*)/([\w\.]*)/` which
            // will match for any value of `:page` and `:type` (word chars or period).
			test: new RegExp("^" + test+"($|"+quote(can.route._querySeparator)+")"),
            // The original URL, same as the index for this entry in routes.
			route: url,
            // An `array` of all the variable names in this route.
			names: names,
            // Default values provided for the variables.
			defaults: defaults,
            // The number of parts in the URL separated by `/`.
			length: url.split('/').length
		};
		return can.route;
	};

	extend(can.route, {

		_querySeparator: '&',
		_paramsMatcher: paramsMatcher,

		/**
		 * @function can.route.param
		 * @parent can.route
		 * Parameterizes the raw JS object representation provided in data.
		 *
		 *     can.route.param( { type: "video", id: 5 } ) 
		 *          // -> "type=video&id=5"
		 *
		 * If a route matching the provided data is found, that URL is built
		 * from the data. Any remaining data is added at the end of the
		 * URL as &amp; separated key/value parameters.
		 *
		 *     can.route(":type/:id")
		 *     
		 *     can.route.param( { type: "video", id: 5 } ) // -> "video/5"
		 *     can.route.param( { type: "video", id: 5, isNew: false } ) 
		 *          // -> "video/5&isNew=false"
		 * 
		 * @param {Object} data Data object containing key/value properies to be parameterized
		 * @return {String} The route URL and &amp; separated parameters.
		 */
		param: function( data , _setRoute ) {
			// Check if the provided data keys match the names in any routes;
			// Get the one with the most matches.
			var route,
				// Need to have at least 1 match.
				matches = 0,
				matchCount,
				routeName = data.route,
				propCount = 0;
				
			delete data.route;
			
			each(data, function(){
				propCount++;
			});
			// Otherwise find route.
			each(can.route.routes, function(temp, name){
				// best route is the first with all defaults matching
				
				
				matchCount = matchesData(temp, data);
				if ( matchCount > matches ) {
					route = temp;
					matches = matchCount;
				}
				if(matchCount >= propCount){
					return false;
				}
			});
			// If we have a route name in our `can.route` data, and it's
			// just as good as what currently matches, use that
			if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data ) === matches) {
				route = can.route.routes[routeName];
			}
			// If this is match...
			if ( route ) {
				var cpy = extend({}, data),
                    // Create the url by replacing the var names with the provided data.
                    // If the default value is found an empty string is inserted.
					res = route.route.replace(matcher, function( whole, name ) {
                        delete cpy[name];
                        return data[name] === route.defaults[name] ? "" : encodeURIComponent( data[name] );
                    }),
                    after;
				// Remove matching default values
				each(route.defaults, function(val,name){
					if(cpy[name] === val) {
						delete cpy[name];
					}
				});
				
				// The remaining elements of data are added as 
				// `&amp;` separated parameters to the url.
				after = can.param(cpy);
				// if we are paraming for setting the hash
				// we also want to make sure the route value is updated
				if(_setRoute){
					can.route.attr('route',route.route);
				}
				return res + (after ? can.route._querySeparator + after : "");
			}
            // If no route was found, there is no hash URL, only paramters.
			return can.isEmptyObject(data) ? "" : can.route._querySeparator + can.param(data);
		},
		/**
		 * @function can.route.deparam
		 * @parent can.route
		 * 
		 * Creates a data object based on the query string passed into it. This is 
		 * useful to create an object based on the `location.hash`.
		 *
		 *     can.route.deparam("id=5&type=videos") 
		 *          // -> { id: 5, type: "videos" }
		 *
		 * 
		 * It's important to make sure the hash or exclamantion point is not passed
		 * to `can.route.deparam` otherwise it will be included in the first property's
		 * name.
		 *
		 *     can.route.attr("id", 5) // location.hash -> #!id=5
		 *     can.route.attr("type", "videos") 
		 *          // location.hash -> #!id=5&type=videos
		 *     can.route.deparam(location.hash) 
		 *          // -> { #!id: 5, type: "videos" }
		 *
		 * `can.route.deparam` will try and find a matching route and, if it does,
		 * will deconstruct the URL and parse our the key/value parameters into the data object.
		 *
		 *     can.route(":type/:id")
		 *
		 *     can.route.deparam("videos/5");
		 *          // -> { id: 5, route: ":type/:id", type: "videos" }
		 *
		 * @param {String} url Query string to be turned into an object.
		 * @return {Object} Data object containing properties and values from the string
		 */
		deparam: function( url ) {
			// See if the url matches any routes by testing it against the `route.test` `RegExp`.
            // By comparing the URL length the most specialized route that matches is used.
			var route = {
				length: -1
			};
			each(can.route.routes, function(temp, name){
				if ( temp.test.test(url) && temp.length > route.length ) {
					route = temp;
				}
			});
            // If a route was matched.
			if ( route.length > -1 ) { 

				var // Since `RegExp` backreferences are used in `route.test` (parens)
                    // the parts will contain the full matched string and each variable (back-referenced) value.
                    parts = url.match(route.test),
                    // Start will contain the full matched string; parts contain the variable values.
					start = parts.shift(),
                    // The remainder will be the `&amp;key=value` list at the end of the URL.
					remainder = url.substr(start.length - (parts[parts.length-1] === can.route._querySeparator ? 1 : 0) ),
                    // If there is a remainder and it contains a `&amp;key=value` list deparam it.
                    obj = (remainder && can.route._paramsMatcher.test(remainder)) ? can.deparam( remainder.slice(1) ) : {};

                // Add the default values for this route.
				obj = extend(true, {}, route.defaults, obj);
                // Overwrite each of the default values in `obj` with those in 
				// parts if that part is not empty.
				each(parts,function(part,  i){
					if ( part && part !== can.route._querySeparator) {
						obj[route.names[i]] = decodeURIComponent( part );
					}
				});
				obj.route = route.route;
				return obj;
			}
            // If no route was matched, it is parsed as a `&amp;key=value` list.
			if ( url.charAt(0) !== can.route._querySeparator ) {
				url = can.route._querySeparator + url;
			}
			return can.route._paramsMatcher.test(url) ? can.deparam( url.slice(1) ) : {};
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
         *    are present; i.e. for :page/:type the `RegExp` is /([\w\.]*)/([\w\.]*)/ which
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
		 * @function can.route.ready
		 * @parent can.route
		 * Indicates that all routes have been added and sets can.route.data
		 * based upon the routes and the current hash.
		 * 
		 * By default, ready is fired on jQuery's ready event.  Sometimes
		 * you might want it to happen sooner or earlier.  To do this, call:
		 * 
		 *     can.route.ready(false); //prevents firing by the ready event
		 *     can.route.ready(true); // fire the first route change
		 * 
		 * @param {Boolean} [val] Whether or not to fire the ready event.
		 * @return {can.route} `can.route` object.
		 */
		ready: function(val) {
			if( val === false ) {
				onready = val;
			}
			if( val === true || onready === true ) {
				can.route._setup();
				setState();
			}
			return can.route;
		},
		/**
		 * @function can.route.url
		 * @parent can.route
		 * 
		 * Similar to [can.route.link], but instead of creating an anchor tag, `can.route.url` creates 
		 * only the URL based on the route options passed into it.
		 *
		 *     can.route.url( { type: "videos", id: 5 } ) 
		 *          // -> "#!type=videos&id=5"
		 *
		 * If a route matching the provided data is found the URL is built from the data. Any remaining
		 * data is added at the end of the URL as & separated key/value parameters.
		 *
		 *     can.route(":type/:id")
		 *
		 *     can.route.url( { type: "videos", id: 5 } ) // -> "#!videos/5"
		 *     can.route.url( { type: "video", id: 5, isNew: false } ) 
		 *          // -> "#!video/5&isNew=false"
		 *
		 *
		 * @param {Object} options The route options (variables)
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {String} The route URL & separated parameters
		 */
		url: function( options, merge ) {
			if (merge) {
				options = extend({}, curParams, options)
			}
			return "#!" + can.route.param(options);
		},
		/**
		 * @function can.route.link
		 * @parent can.route
		 * 
		 * Creates and returns an anchor tag with an href of the route 
		 * attributes passed into it, as well as any properies desired
		 * for the tag.
		 *
		 *     can.route.link( "My videos", { type: "videos" }, {}, false )
		 *          // -> <a href="#!type=videos">My videos</a>
		 * 
		 * Other attributes besides href can be added to the anchor tag
		 * by passing in a data object with the attributes desired.
		 *
		 *     can.route.link( "My videos", { type: "videos" }, 
		 *       { className: "new" }, false ) 
		 *          // -> <a href="#!type=videos" class="new">My Videos</a>
		 *
		 * It is possible to utilize the current route options when making anchor
		 * tags in order to make your code more reusable. If merge is set to true,
		 * the route options passed into `can.route.link` will be passed into the
		 * current ones.
		 *
		 *     location.hash = "#!type=videos" 
		 *     can.route.link( "The zoo", { id: 5 }, true )
		 *          // -> <a href="#!type=videos&id=5">The zoo</true>
		 *
		 *     location.hash = "#!type=pictures" 
		 *     can.route.link( "The zoo", { id: 5 }, true )
		 *          // -> <a href="#!type=pictures&id=5">The zoo</true>
		 *
		 *
		 * @param {Object} name The text of the link.
		 * @param {Object} options The route options (variables)
		 * @param {Object} props Properties of the &lt;a&gt; other than href.
		 * @param {Boolean} merge true if the options should be merged with the current options
		 * @return {string} String containing the formatted &lt;a&gt; HTML element
		 */
		link: function( name, options, props, merge ) {
			return "<a " + makeProps(
			extend({
				href: can.route.url(options, merge)
			}, props)) + ">" + name + "</a>";
		},
		/**
		 * @function can.route.current
		 * @parent can.route
		 * 
		 * Checks the page's current URL to see if the route represents the options passed 
		 * into the function.
		 *
		 * Returns true if the options respresent the current URL.
		 * 
		 *     can.route.attr('id', 5) // location.hash -> "#!id=5"
		 *     can.route.current({ id: 5 }) // -> true
		 *     can.route.current({ id: 5, type: 'videos' }) // -> false
		 *     
		 *     can.route.attr('type', 'videos') 
		 *            // location.hash -> #!id=5&type=videos
		 *     can.route.current({ id: 5, type: 'videos' }) // -> true
		 * 
		 * 
		 * @param {Object} options Data object containing properties and values that might represent the route.
         * @return {Boolean} Whether or not the options match the current URL.
		 */
		current: function( options ) {
			return location.hash == "#!" + can.route.param(options)
		},
		_setup: function() {
			// If the hash changes, update the `can.route.data`.
			can.bind.call(window,'hashchange', setState);
		},
		_getHash: function() {
			return location.href.split(/#!?/)[1] || "";
		},
		_setHash: function(serialized) {
			var path = (can.route.param(serialized, true));
			location.hash = "#!" + path;
			return path;
		}
	});
	
	
    // The functions in the following list applied to `can.route` (e.g. `can.route.attr('...')`) will
    // instead act on the `can.route.data` observe.
	each(['bind','unbind','delegate','undelegate','attr','removeAttr'], function(name){
		can.route[name] = function(){
			return can.route.data[name].apply(can.route.data, arguments)
		}
	})

	var // A ~~throttled~~ debounced function called multiple times will only fire once the
        // timer runs down. Each call resets the timer.
		timer,
        // Intermediate storage for `can.route.data`.
        curParams,
        // Deparameterizes the portion of the hash of interest and assign the
        // values to the `can.route.data` removing existing values no longer in the hash.
        // setState is called typically by hashchange which fires asynchronously
        // So it's possible that someone started changing the data before the 
        // hashchange event fired.  For this reason, it will not set the route data
        // if the data is changing or the hash already matches the hash that was set.
        setState = can.route.setState = function() {
			var hash = can.route._getHash();
			curParams = can.route.deparam( hash );
			
			// if the hash data is currently changing, or
			// the hash is what we set it to anyway, do NOT change the hash
			if(!changingData || hash !== lastHash){
				can.route.attr(curParams, true);
			}
		},
		// The last hash caused by a data change
		lastHash,
		// Are data changes pending that haven't yet updated the hash
		changingData;

	// If the `can.route.data` changes, update the hash.
    // Using `.serialize()` retrieves the raw data contained in the `observable`.
    // This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
    // This might be able to use batchNum and avoid this.
	can.route.bind("change", function(ev, attr) {
		// indicate that data is changing
		changingData = 1;
		clearTimeout( timer );
		timer = setTimeout(function() {
			// indicate that the hash is set to look like the data
			changingData = 0;
			var serialized = can.route.data.serialize();

			lastHash = can.route._setHash(serialized);
		}, 1);
	});
	// `onready` event...
	can.bind.call(document,"ready",can.route.ready);
	return can.route;
})(module["can/util/jquery/jquery.js"], module["can/observe/observe.js"], module["can/util/string/deparam/deparam.js"]);
module['can/util/can-all.js'] = (function(can) {
	return can;
})(module["can/util/jquery/jquery.js"], module["can/construct/proxy/proxy.js"], module["can/construct/super/super.js"], module["can/control/control.js"], module["can/control/plugin/plugin.js"], module["can/control/modifier/modifier.js"], module["can/view/modifiers/modifiers.js"], module["can/model/model.js"], module["can/view/ejs/ejs.js"], module["can/route/route.js"]);
window['can'] = module['can/util/can.js'];

window.define = module._define;
})();