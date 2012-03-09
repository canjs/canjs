// 674
//can.Construct 
// This is a modified version of John Resig's class
// http://ejohn.org/blog/simple-javascript-inheritance/
// It provides class level inheritance and callbacks.
//@steal-clean
steal("can/util/string",function( $ ) {

	
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
				string = can.String,
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
					current = can.String.getObject(parts.join('.'), window, true),
					namespace = current,
					_fullName = can.String.underscore(fullName.replace(/\./g, "_")),
					_shortName = can.String.underscore(shortName);

				//@steal-remove-start
				if(current[shortName]){
					steal.dev.warn("class.js There's already something called "+fullName)
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





})
