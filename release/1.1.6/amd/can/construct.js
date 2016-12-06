/*!
 * CanJS - 1.1.6
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 05 Jun 2013 18:02:51 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/string"], function(can) {

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
		 * @function can.Construct.newInstance newInstance
		 * @parent can.Construct.static
		 * @description Create a new instance of a Construct.
		 * @signature `newInstance([...args])`
		 * @param {*} [args] arguments that get passed to [can.Construct::setup] and [can.Construct::init]. Note
		 * that if [can.Construct::setup] returns an array, those arguments will be passed to [can.Construct::init]
		 * instead.
		 * @return {class} instance of the class
		 *
		 * @body
		 * Creates a new instance of the constructor function. This method is useful for creating new instances
		 * with arbitrary parameters. Typically, however, you will simply want to call the constructor with the
		 * __new__ operator.
		 * 
		 * ## Example
		 * 
		 * The following creates a `Person` Construct and then creates a new instance of Person,
		 * using `apply` on newInstance to pass arbitrary parameters.
		 * 
		 * @codestart
		 * var Person = can.Construct({
		 *   init : function(first, middle, last) {
		 *     this.first = first;
		 *     this.middle = middle;
		 *     this.last = last;
		 *   }
		 * });
		 * 
		 * var args = ["Justin","Barry","Meyer"],
		 *     justin = new Person.newInstance.apply(null, args);
		 * @codeend
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
		 * @function can.Construct.setup setup
		 * @parent can.Construct.static
		 * @description Perform initialization logic for a constructor function.
		 * @signature `setup(base, fullName, staticProps, protoProps)`
		 * @param {constructor} base The base constructor that is being inherited from.
		 * @param {String} fullName The name of the new constructor.
		 * @param {Object} staticProps The static properties of the new constructor.
		 * @param {Object} protoProps The prototype properties of the new constructor.
		 *
		 * @body
		 * The static `setup` method is called immediately after a constructor function is created and 
		 * set to inherit from its base constructor. It is useful for setting up additional inheritance work.
		 * Do not confuse this with the prototype `[can.Construct::setup]` method.
		 * 
		 * ## Setup Extends Defaults
		 * 
		 * Setup deeply extends the static `defaults` property of the base constructor with 
		 * properties of the inheriting constructor.  For example:
		 * 
		 * @codestart
		 * Parent = can.Construct({
		 *   defaults : {
		 *     parentProp: 'foo'
		 *   }
		 * },{})
		 * 
		 * Child = Parent({
		 *   defaults : {
		 *     childProp : 'bar'
		 *   }
		 * },{}
		 *     
		 * Child.defaults // {parentProp: 'foo', 'childProp': 'bar'}
		 * @codeend
		 * 
		 * ## Example
		 * 
		 * This `Parent` class adds a reference to its base class to itself, and
		 * so do all the classes that inherit from it.
		 * 
		 * @codestart
		 * Parent = can.Construct({
		 *   setup : function(base, fullName, staticProps, protoProps){
		 *     this.base = base;
		 * 
		 *     // call base functionality
		 *     can.Construct.setup.apply(this, arguments)
		 *   }
		 * },{});
		 * 
		 * Parent.base; // can.Construct
		 *     
		 * Child = Parent({});
		 * 
		 * Child.base; // Parent
		 * @codeend
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
		 * You no longer have to use `extend`.  Instead, you can pass those options directly to
		 * can.Construct (and any inheriting classes):
		 * 
		 *     // with className, static and prototype functions
		 *     can.Construct('Task',{ STATIC },{ PROTOTYPE })
		 *     // with just classname and prototype functions
		 *     can.Construct('Task',{ PROTOTYPE })
		 *     // with just a className
		 *     can.Construct('Task')
		 * 
		 * @param {String} [fullName]  the class's name (used for classes w/ introspection)
		 * @param {Object.<string, function>} [klass]  the new class's static functions
		 * @param {Object.<string, function>} [proto]  the new class's prototype functions
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
				 * @property {String} can.Construct.namespace namespace
				 * @parent can.Construct.static
				 *
				 * The `namespace` property returns the namespace your constructor is in.
				 * This provides a way organize code and ensure globally unique types.
				 * 
				 * @codestart
				 * can.Construct("MyApplication.MyConstructor",{},{});
				 * MyApplication.MyConstructor.namespace // "MyApplication"
				 * MyApplication.MyConstructor.shortName // "MyConstructor"
				 * MyApplication.MyConstructor.fullName  // "MyApplication.MyConstructor"
				 * @codeend
				 */
				namespace: namespace,
				/**
				 * @property {String} can.Construct.shortName shortName
				 * @parent can.Construct.static
				 *
				 * If you pass a name when creating a Construct, the `shortName` property will be set to the
				 * name you passed without the namespace.
				 * 
				 * @codestart
				 * can.Construct("MyApplication.MyConstructor",{},{});
				 * MyApplication.MyConstructor.namespace // "MyApplication"
				 * MyApplication.MyConstructor.shortName // "MyConstructor"
				 * MyApplication.MyConstructor.fullName  // "MyApplication.MyConstructor"
				 * @codeend
				 */
				_shortName : _shortName,
				/**
				 * @property {String} can.Construct.fullName fullName
				 * @parent can.Construct.static
				 *
				 * If you pass a name when creating a Construct, the `fullName` property will be set to
				 * the name you passed.
				 * 
				 * @codestart
				 * can.Construct("MyApplication.MyConstructor",{},{});
				 * MyApplication.MyConstructor.namespace // "MyApplication"
				 * MyApplication.MyConstructor.shortName // "MyConstructor"
				 * MyApplication.MyConstructor.fullName  // "MyApplication.MyConstructor"
				 * @codeend
				 */
				fullName: fullName,
				_fullName: _fullName
			});

			// Dojo and YUI extend undefined
			if(shortName !== undefined) {
				Constructor.shortName = shortName;
			}

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
			 * @function can.Construct.prototype.setup setup
			 * @parent can.Construct.prototype
			 * @signature `setup(...args)`
			 * @param {*} args the arguments passed to the constructor.
			 * @return {Array|undefined} if an array is returned, the elements of that array are passed as
			 * arguments to [can.Construct::init]. Otherwise, the arguments to the
			 * constructor are passed to [can.Construct::init] and the return value of `setup` is discarded.
			 * 
			 * @body
			 * If a prototype `setup` method is provided, it is called when a new 
			 * instance is created. It is passed the same arguments that were passed
			 * to the constructor.
			 *
			 * Because `setup` is not defined on `can.Construct` itself, calling super from
			 * directly-inheriting classes will break. In other words, don't do this:
			 * 
			 * @codestart
			 * can.Construct('Snowflake', {
			 *     setup: function() {
			 *         this._super(); // this will break!
			 *     }
			 * });
			 * @codeend
			 * 
			 * ## `setup` vs. `init`
			 * Usually, you should use [can.Construct::init] to do your class's initialization.
			 * Use `setup` instead for:
			 * 
			 *   - initialization code that you want to run before the inheriting constructor's 
			 *     `init` method is called.
			 *   - initialization code that should run whether or not inheriting constructors
			 *     call their base's `init` methods.
			 *   - modifying the arguments that will get passed to `init`.
			 * 
			 * ## Example
			 * 
			 * This code is a simplified version of the code in [can.Control]'s setup
			 * method. It converts the first argument to a jQuery collection and
			 * extends the controller's defaults with the options that were passed.
			 * 
			 * @codestart
			 * can.Construct("can.Control", {
			 *     setup: function(domElement, rawOptions) {
			 *         // set up this.element
			 *         this.element = $(domElement);
			 * 
			 *         // set up this.options
			 *         this.options = can.extend({},
			 *                                   this.constructor.defaults,
			 *                                   rawOptions
			 *                                  );
			 * 
			 *         // pass this.element and this.options to init.
			 *         return [this.element, this.options];        
			 *     }
			 * });
			 * @codeend
			 */
			//  
			/** 
			 * @function can.Construct.prototype.init init
			 * @parent can.Construct.prototype
			 * @signature `init(...args)`
			 * @param {*} args the arguments passed to the constructor (or the elements of the array returned from [can.Construct::setup])
			 * 
			 * @body
			 * If a prototype `init` method is provided, it is called when a new Construct is created,
			 * after [can.Construct::setup]. The `init` method is where the bulk of your initialization code
			 * should go, and a common thing to do in `init` is to save the arguments passed into the constructor.
			 * 
			 * ## Examples
			 * 
			 * First, we'll make a Person constructor that has a first and last name:
			 *
			 * @codestart
			 * can.Construct("Person", {
			 *     init: function(first, last) {
			 *         this.first = first;
			 *         this.last  = last;
			 *     }
			 * });
			 * 
			 * var justin = new Person("Justin", "Meyer");
			 * justin.first; // "Justin"
			 * justin.last; // "Meyer"
			 * @codeend
			 * 
			 * Then we'll extend Person into Programmer and add a favorite language:
			 * 
			 * @codestart
			 * Person("Programmer", {
			 *     init: function(first, last, language) {
			 *         // call base's init
			 *         Person.prototype.init.apply(this, arguments);
			 *
			 *         // other initialization code
			 *         this.language = language;
			 *     },
			 *     bio: function() {
			 *         return 'Hi! I'm ' + this.first + ' ' + this.last +
			 *             ' and I write ' + this.language + '.';
			 *     }
			 * });
			 * 
			 * var brian = new Programmer("Brian", "Moschel", 'ECMAScript');
			 * brian.bio(); // "Hi! I'm Brian Moschel and I write ECMAScript.";
			 * @codeend
			 * 
			 * ## Be Aware
			 * 
			 * [can.Construct::setup] is able to modify the arguments passed to `init`.
			 * If you aren't receiving the right arguments to `init`, check to make sure
			 * that they aren't being changed by `setup` somewhere along the inheritance chain.
			 */
			//  
			/**
			 * @property {Function} can.Construct.prototype.constructor constructor
			 * @parent can.Construct.prototype
			 *
			 * A reference to the constructor function that created the instance. This allows you to access
			 * the constructor's static properties from an instance.
			 * 
			 * ## Example
			 * 
			 * This class has a static counter that counts how mane instances have been created:
			 *
			 * @codestart
			 * can.Construct("Counter", {
			 *     count: 0
			 * }, {
			 *     init: function() {
			 *         this.constructor.count++;
			 *     }
			 * });
			 * 
			 * new Counter();
			 * Counter.count; // 1
			 * @codeend 
			 */
		}

	});
	return can.Construct;
});