"use strict";
var canReflect = require("can-reflect");
var dev = require("can-log/dev/dev");
var namespace = require('can-namespace');
var canSymbol = require("can-symbol");

var inSetupSymbol = canSymbol.for("can.initializing");

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var CanString = require('can-string');
	var reservedWords = {
		"abstract": true,
		"boolean": true,
		"break": true,
		"byte": true,
		"case": true,
		"catch": true,
		"char": true,
		"class": true,
		"const": true,
		"continue": true,
		"debugger": true,
		"default": true,
		"delete": true,
		"do": true,
		"double": true,
		"else": true,
		"enum": true,
		"export": true,
		"extends": true,
		"false": true,
		"final": true,
		"finally": true,
		"float": true,
		"for": true,
		"function": true,
		"goto": true,
		"if": true,
		"implements": true,
		"import": true,
		"in": true,
		"instanceof": true,
		"int": true,
		"interface": true,
		"let": true,
		"long": true,
		"native": true,
		"new": true,
		"null": true,
		"package": true,
		"private": true,
		"protected": true,
		"public": true,
		"return": true,
		"short": true,
		"static": true,
		"super": true,
		"switch": true,
		"synchronized": true,
		"this": true,
		"throw": true,
		"throws": true,
		"transient": true,
		"true": true,
		"try": true,
		"typeof": true,
		"var": true,
		"void": true,
		"volatile": true,
		"while": true,
		"with": true
	};
	var constructorNameRegex = /[^A-Z0-9_]/gi;
}
//!steal-remove-end

// ## construct.js
// `Construct`
// _This is a modified version of
// [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).
// It provides class level inheritance and callbacks._
// A private flag used to initialize a new class instance without
// initializing it's bindings.
var initializing = 0;

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	var namedCtor = (function(cache){
		return function(name, fn) {
			return ((name in cache) ? cache[name] : cache[name] = new Function(
				"__", "function "+name+"(){return __.apply(this,arguments)};return "+name
			))( fn );
		};
	}({}));
}
//!steal-remove-end

/**
 * @add can-construct
 */
var Construct = function () {
	if (arguments.length) {
		return Construct.extend.apply(Construct, arguments);
	}
};

var canGetDescriptor;
try {
	Object.getOwnPropertyDescriptor({});
	canGetDescriptor = true;
} catch(e) {
	canGetDescriptor = false;
}

var getDescriptor = function(newProps, name) {
		var descriptor = Object.getOwnPropertyDescriptor(newProps, name);
		if(descriptor && (descriptor.get || descriptor.set)) {
			return descriptor;
		}
		return null;
	},
	inheritGetterSetter = function(newProps, oldProps, addTo) {
		addTo = addTo || newProps;
		var descriptor;

		for (var name in newProps) {
			if( (descriptor = getDescriptor(newProps, name)) ) {
				this._defineProperty(addTo, oldProps, name, descriptor);
			} else {
				Construct._overwrite(addTo, oldProps, name, newProps[name]);
			}
		}
	},
	simpleInherit = function (newProps, oldProps, addTo) {
		addTo = addTo || newProps;

		for (var name in newProps) {
			Construct._overwrite(addTo, oldProps, name, newProps[name]);
		}
	},
	defineNonEnumerable = function(obj, prop, value) {
		Object.defineProperty(obj, prop, {
			configurable: true,
			writable: true,
			enumerable: false,
			value: value
		});
	};
/**
 * @static
 */
canReflect.assignMap(Construct, {
	/**
	 * @property {Boolean} can-construct.constructorExtends constructorExtends
	 * @parent can-construct.static
	 *
	 * @description
	 * Toggles the behavior of a constructor function called
	 * without the `new` keyword to extend the constructor function or
	 * create a new instance.
	 *
	 * ```js
	 * var animal = Animal();
	 * // vs
	 * var animal = new Animal();
	 * ```
	 *
	 * @body
	 *
	 * If `constructorExtends` is:
	 *
	 *  - `true` - the constructor extends
	 *  - `false` - a new instance of the constructor is created
	 *
	 * This property defaults to false.
	 *
	 * Example of constructExtends as `true`:
	 *
	 * ```js
	 * var Animal = Construct.extend({
	 *   constructorExtends: true // the constructor extends
	 * },{
	 *   sayHi: function() {
	 *     console.log("hai!");
	 *   }
	 * });
	 *
	 * var Pony = Animal({
	 *   gallop: function () {
	 *      console.log("Galloping!!");
	 *   }
	 * }); // Pony is now a constructor function extended from Animal
	 *
	 * var frank = new Animal(); // frank is a new instance of Animal
	 *
	 * var gertrude = new Pony(); // gertrude is a new instance of Pony
	 * gertrude.sayHi(); // "hai!" - sayHi is "inherited" from Animal
	 * gertrude.gallop(); // "Galloping!!" - gallop is unique to instances of Pony
	 *```
	 *
	 * The default behavior is shown in the example below:
	 *
	 * ```js
	 * var Animal = Construct.extend({
	 *   constructorExtends: false // the constructor does NOT extend
	 * },{
	 *   sayHi: function() {
	 *     console.log("hai!");
	 *   }
	 * });
	 *
	 * var pony = Animal(); // pony is a new instance of Animal
	 * var frank = new Animal(); // frank is a new instance of Animal
	 *
	 * pony.sayHi() // "hai!"
	 * frank.sayHi() // "hai!"
	 *```
	 * By default to extend a constructor, you must use [can-construct.extend extend].
	 */
	constructorExtends: true,
	/**
	 * @function can-construct.newInstance newInstance
	 * @parent can-construct.static
	 *
	 * @description Returns an instance of `Construct`. This method
	 * can be overridden to return a cached instance.
	 *
	 * @signature `Construct.newInstance([...args])`
	 *
	 * @param {*} [args] arguments that get passed to [can-construct::setup] and [can-construct::init]. Note
	 * that if [can-construct::setup] returns an array, those arguments will be passed to [can-construct::init]
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
	 * The following creates a `Person` Construct and overrides `newInstance` to cache all
	 * instances of Person to prevent duplication. If the properties of a new Person match an existing one it
	 * will return a reference to the previously created object, otherwise it returns a new object entirely.
	 *
	 * ```js
	 * // define and create the Person constructor
	 * var Person = Construct.extend({
	 *   init : function(first, middle, last) {
	 *     this.first = first;
	 *     this.middle = middle;
	 *     this.last = last;
	 *   }
	 * });
	 *
	 * // store a reference to the original newInstance function
	 * var _newInstance = Person.newInstance;
	 *
	 * // override Person's newInstance function
	 * Person.newInstance = function() {
	 *   // if cache does not exist make it an new object
	 *   this.__cache = this.__cache || {};
	 *   // id is a stingified version of the passed arguments
	 *   var id = JSON.stringify(arguments);
	 *
	 *   // look in the cache to see if the object already exists
	 *   var cachedInst = this.__cache[id];
	 *   if(cachedInst) {
	 *     return cachedInst;
	 *   }
	 *
	 *   //otherwise call the original newInstance function and return a new instance of Person.
	 *   var newInst = _newInstance.apply(this, arguments);
	 *   this.__cache[id] = newInst;
	 *   return newInst;
	 * };
	 *
	 * // create two instances with the same arguments
	 * var justin = new Person('Justin', 'Barry', 'Meyer'),
	 *		brian = new Person('Justin', 'Barry', 'Meyer');
	 *
	 * console.log(justin === brian); // true - both are references to the same instance
	 * ```
	 *
	 */
	newInstance: function () {
		// Get a raw instance object (`init` is not called).
		var inst = this.instance(),
			args;
		// Call `setup` if there is a `setup`
		if (inst.setup) {
			Object.defineProperty(inst,"__inSetup",{
				configurable: true,
				enumerable: false,
				value: true,
				writable: true
			});
			Object.defineProperty(inst, inSetupSymbol, {
				configurable: true,
				enumerable: false,
				value: true,
				writable: true
			});
			args = inst.setup.apply(inst, arguments);
			if (args instanceof Construct.ReturnValue){
				return args.value;
			}
			inst.__inSetup = false;
			inst[inSetupSymbol] = false;
		}
		// Call `init` if there is an `init`
		// If `setup` returned `args`, use those as the arguments
		if (inst.init) {
			inst.init.apply(inst, args || arguments);
		}
		return inst;
	},
	// Overwrites an object with methods. Used in the `super` plugin.
	// `newProps` - New properties to add.
	// `oldProps` - Where the old properties might be (used with `super`).
	// `addTo` - What we are adding to.
	_inherit: canGetDescriptor ? inheritGetterSetter : simpleInherit,

	// Adds a `defineProperty` with the given name and descriptor
	// Will only ever be called if ES5 is supported
	_defineProperty: function(what, oldProps, propName, descriptor) {
		Object.defineProperty(what, propName, descriptor);
	},

	// used for overwriting a single property.
	// this should be used for patching other objects
	// the super plugin overwrites this
	_overwrite: function (what, oldProps, propName, val) {
		Object.defineProperty(what, propName, {value: val, configurable: true, enumerable: true, writable: true});
	},
	// Set `defaults` as the merger of the parent `defaults` and this
	// object's `defaults`. If you overwrite this method, make sure to
	// include option merging logic.
	/**
	 * @function can-construct.setup setup
	 * @parent can-construct.static
	 *
	 * @description Perform initialization logic for a constructor function.
	 *
	 * @signature `Construct.setup(base, fullName, staticProps, protoProps)`
	 *
	 * A static `setup` method provides inheritable setup functionality
	 * for a Constructor function. The following example
	 * creates a Group constructor function.  Any constructor
	 * functions that inherit from Group will be added to
	 * `Group.childGroups`.
	 *
	 * ```js
	 * Group = Construct.extend({
	 *   setup: function(Construct, fullName, staticProps, protoProps){
	 *     this.childGroups = [];
	 *     if(Construct !== Construct){
	 *       this.childGroups.push(Construct)
	 *     }
	 *     Construct.setup.apply(this, arguments)
	 *   }
	 * },{})
	 * var Flock = Group.extend(...)
	 * Group.childGroups[0] //-> Flock
	 * ```
	 * @param {constructor} base The base constructor that is being inherited from.
	 * @param {String} fullName The name of the new constructor.
	 * @param {Object} staticProps The static properties of the new constructor.
	 * @param {Object} protoProps The prototype properties of the new constructor.
	 *
	 * @body
	 * The static `setup` method is called immediately after a constructor
	 * function is created and
	 * set to inherit from its base constructor. It is useful for setting up
	 * additional inheritance work.
	 * Do not confuse this with the prototype `[can-construct::setup]` method.
	 *
	 * ## Example
	 *
	 * This `Parent` class adds a reference to its base class to itself, and
	 * so do all the classes that inherit from it.
	 *
	 * ```js
	 * Parent = Construct.extend({
	 *   setup : function(base, fullName, staticProps, protoProps){
	 *     this.base = base;
	 *
	 *     // call base functionality
	 *     Construct.setup.apply(this, arguments)
	 *   }
	 * },{});
	 *
	 * Parent.base; // Construct
	 *
	 * Child = Parent({});
	 *
	 * Child.base; // Parent
	 * ```
	 */
	setup: function (base) {
		var defaults = base.defaults ? canReflect.serialize(base.defaults) : {};
		this.defaults = canReflect.assignDeepMap(defaults,this.defaults);
	},
	// Create's a new `class` instance without initializing by setting the
	// `initializing` flag.
	instance: function () {
		// Prevents running `init`.
		initializing = 1;
		var inst = new this();
		// Allow running `init`.
		initializing = 0;
		return inst;
	},
	// Extends classes.
	/**
	 * @function can-construct.extend extend
	 * @parent can-construct.static
	 *
	 * @signature `Construct.extend([name,] [staticProperties,] instanceProperties)`
	 *
	 * Extends `Construct`, or constructor functions derived from `Construct`,
	 * to create a new constructor function. Example:
	 *
	 * ```js
	 * var Animal = Construct.extend({
	 *   sayHi: function(){
	 *     console.log("hi")
	 *   }
	 * });
	 *
	 * var animal = new Animal()
	 * animal.sayHi();
	 * ```
	 *
	 * @param {String} [name] Adds a name to the constructor function so
	 * it is nicely labeled in the developer tools. The following:
	 *
	 *     Construct.extend("ConstructorName",{})
	 *
	 * returns a constructur function that will show up as `ConstructorName`
	 * in the developer tools.
	 * It also sets "ConstructorName" as [can-construct.shortName shortName].
	 *
	 * @param {Object} [staticProperties] Properties that are added the constructor
	 * function directly. For example:
	 *
	 * ```js
	 * var Animal = Construct.extend({
	 *   findAll: function(){
	 *     return can.ajax({url: "/animals"})
	 *   }
	 * },{}); // need to pass an empty instanceProperties object
	 *
	 * Animal.findAll().then(function(json){ ... })
	 * ```
	 *
	 * The [can-construct.setup static setup] method can be used to
	 * specify inheritable behavior when a Constructor function is created.
	 *
	 * @param {Object} instanceProperties Properties that belong to
	 * instances made with the constructor. These properties are added to the
	 * constructor's `prototype` object. Example:
	 *
	 *     var Animal = Construct.extend({
	 *		  findAll: function() {
	 *			return can.ajax({url: "/animals"});
	 *		  }
	 *     },{
	 *       init: function(name) {
	 *         this.name = name;
	 *       },
	 *       sayHi: function() {
	 *         console.log(this.name," says hai!");
	 *       }
	 *     })
	 *     var pony = new Animal("Gertrude");
	 *     pony.sayHi(); // "Gertrude says hai!"
	 *
	 * The [can-construct::init init] and [can-construct::setup setup] properties
	 * are used for initialization.
	 *
	 * @return {function} The constructor function.
	 *
	 * ```js
	 *	var Animal = Construct.extend(...);
	 *	var pony = new Animal(); // Animal is a constructor function
	 * ```
	 * @body
	 * ## Inheritance
	 * Creating "subclasses" with `Construct` is simple. All you need to do is call the base constructor
	 * with the new function's static and instance properties. For example, we want our `Snake` to
	 * be an `Animal`, but there are some differences:
	 *
	 *
	 *     var Snake = Animal.extend({
	 *         legs: 0
	 *     }, {
	 *         init: function() {
	 *             Animal.prototype.init.call(this, 'ssssss');
	 *         },
	 *         slither: function() {
	 *             console.log('slithering...');
	 *         }
	 *     });
	 *
	 *     var baslisk = new Snake();
	 *     baslisk.speak();   // "ssssss"
	 *     baslisk.slither(); // "slithering..."
	 *     baslisk instanceof Snake;  // true
	 *     baslisk instanceof Animal; // true
	 *
	 *
	 * ## Static properties and inheritance
	 *
	 * If you pass all three arguments to Construct, the second one will be attached directy to the
	 * constructor, allowing you to imitate static properties and functions. You can access these
	 * properties through the `[can-construct::constructor this.constructor]` property.
	 *
	 * Static properties can get overridden through inheritance just like instance properties. In the example below,
	 * we override both the legs static property as well as the the init function for each instance:
	 *
	 * ```js
	 * var Animal = Construct.extend({
	 *     legs: 4
	 * }, {
	 *     init: function(sound) {
	 *         this.sound = sound;
	 *     },
	 *     speak: function() {
	 *         console.log(this.sound);
	 *     }
	 * });
	 *
	 * var Snake = Animal.extend({
	 *     legs: 0
	 * }, {
	 *     init: function() {
	 *         this.sound = 'ssssss';
	 *     },
	 *     slither: function() {
	 *         console.log('slithering...');
	 *     }
	 * });
	 *
	 * Animal.legs; // 4
	 * Snake.legs; // 0
	 * var dog = new Animal('woof');
	 * var blackMamba = new Snake();
	 * dog.speak(); // 'woof'
	 * blackMamba.speak(); // 'ssssss'
	 * ```
	 *
	 * ## Alternative value for a new instance
	 *
	 * Sometimes you may want to return some custom value instead of a new object when creating an instance of your class.
	 * For example, you want your class to act as a singleton, or check whether an item with the given id was already
	 * created and return an existing one from your cache store (e.g. using [can-connect/constructor/store/store]).
	 *
	 * To achieve this you can return [can-construct.ReturnValue] from `setup` method of your class.
	 *
	 * Lets say you have `myStore` to cache all newly created instances. And if an item already exists you want to merge
	 * the new data into the existing instance and return the updated instance.
	 *
	 * ```
	 * var myStore = {};
	 *
	 * var Item = Construct.extend({
	 *     setup: function(params){
	 *         if (myStore[params.id]){
	 *             var item = myStore[params.id];
	 *
	 *             // Merge new data to the existing instance:
	 *             Object.assign(item, params);
	 *
	 *             // Return the updated item:
	 *             return new Construct.ReturnValue( item );
	 *         } else {
	 *             // Save to cache store:
	 *             myStore[this.id] = this;
	 *
	 *             return [params];
	 *         }
	 *     },
	 *     init: function(params){
	 *         Object.assign(this, params);
	 *     }
	 * });
	 *
	 * var item_1  = new Item( {id: 1, name: "One"} );
	 * var item_1a = new Item( {id: 1, name: "OnePlus"} )
	 * ```
	 */
	extend: function (name, staticProperties, instanceProperties) {
		var shortName = name,
			klass = staticProperties,
			proto = instanceProperties;

		// Figure out what was passed and normalize it.
		if (typeof shortName !== 'string') {
			proto = klass;
			klass = shortName;
			shortName = null;
		}
		if (!proto) {
			proto = klass;
			klass = null;
		}
		proto = proto || {};
		var _super_class = this,
			_super = this.prototype,
			Constructor, prototype;
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor).
		prototype = this.instance();
		// Copy the properties over onto the new prototype.
		Construct._inherit(proto, _super, prototype);

		if(shortName) {

		} else if(klass && klass.shortName) {
			shortName = klass.shortName;
		} else if(this.shortName) {
			shortName = this.shortName;
		}
		// We want constructor.name to be the same as shortName, within
		// the bounds of what the JS VM will allow (meaning no non-word characters).
		// new Function() is significantly faster than eval() here.

		// Strip semicolons
		//!steal-remove-start
		// wrapping this var will cause "used out of scope." when linting
		var constructorName = shortName ? shortName.replace(constructorNameRegex, '_') : 'Constructor';
		if(process.env.NODE_ENV !== 'production') {
			if(reservedWords[constructorName]) {
				constructorName = CanString.capitalize(constructorName);
			}
		}
		//!steal-remove-end

		// The dummy class constructor.
		function init() {
			/* jshint validthis: true */
			// All construction is actually done in the init method.
			if (!initializing) {
				//!steal-remove-start
				if(process.env.NODE_ENV !== 'production') {
					if(!this || (this.constructor !== Constructor) &&
					// We are being called without `new` or we are extending.
					arguments.length && Constructor.constructorExtends) {
						dev.warn('can/construct/construct.js: extending a Construct without calling extend');
					}
				}
				//!steal-remove-end

				return (!this || this.constructor !== Constructor) &&
				// We are being called without `new` or we are extending.
				arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) :
				// We are being called with `new`.
				Constructor.newInstance.apply(Constructor, arguments);
			}
		}
		Constructor = typeof namedCtor === "function" ?
			namedCtor( constructorName, init ) :
			function() { return init.apply(this, arguments); };

		// Copy old stuff onto class (can probably be merged w/ inherit)
		for (var propName in _super_class) {
			if (_super_class.hasOwnProperty(propName)) {
				Constructor[propName] = _super_class[propName];
			}
		}
		// Copy new static properties on class.
		Construct._inherit(klass, _super_class, Constructor);

		// Set things that shouldn't be overwritten.
		canReflect.assignMap(Constructor, {
			constructor: Constructor,
			prototype: prototype
			/**
			 * @property {String} can-construct.shortName shortName
			 * @parent can-construct.static
			 *
			 * If you pass a name when creating a Construct, the `shortName` property will be set to the
			 * name.
			 *
			 * ```js
			 * var MyConstructor = Construct.extend("MyConstructor",{},{});
			 * MyConstructor.shortName // "MyConstructor"
			 * ```
			 */
		});

		if (shortName !== undefined) {
			if (Object.getOwnPropertyDescriptor) {
				var desc = Object.getOwnPropertyDescriptor(Constructor, 'name');
				if (!desc || desc.configurable) {
					Object.defineProperty(
						Constructor,
						'name',
						{ writable: true, value: shortName, configurable: true }
					);
				}
			}
			Constructor.shortName = shortName;
		}
		// Make sure our prototype looks nice.
		defineNonEnumerable(Constructor.prototype, "constructor", Constructor);
		// Call the class `setup` and `init`
		var t = [_super_class].concat(Array.prototype.slice.call(arguments)),
			args = Constructor.setup.apply(Constructor, t);
		if (Constructor.init) {
			Constructor.init.apply(Constructor, args || t);
		}
		/**
		 * @prototype
		 */
		return Constructor; //
		/**
		 * @property {Object} can-construct.prototype.constructor constructor
		 * @parent can-construct.prototype
		 *
		 * A reference to the constructor function that created the instance. This allows you to access
		 * the constructor's static properties from an instance.
		 *
		 * @body
		 * ## Example
		 *
		 * This Construct has a static counter that counts how many instances have been created:
		 *
		 * ```js
		 * var Counter = Construct.extend({
		 *     count: 0
		 * }, {
		 *     init: function() {
		 *         this.constructor.count++;
		 *     }
		 * });
		 *
		 * var childCounter = new Counter();
		 * console.log(childCounter.constructor.count); // 1
		 * console.log(Counter.count); // 1
		 * ```
		 */
	},
	/**
	 * @function can-construct.ReturnValue ReturnValue
	 * @parent can-construct.static
	 *
	 * Use to overwrite the return value of new Construct(...).
	 *
	 * @signature `new Construct.ReturnValue( value )`
	 *
	 *   This constructor function can be used for creating a return value of the `setup` method.
	 *   [can-construct] will check if the return value is an instance of `Construct.ReturnValue`.
	 *   If it is then its `value` will be used as the new instance.
	 *
	 *   @param {Object} value A value to be used for a new instance instead of a new object.
	 *
	 *   ```js
	 *   var Student = function( name, school ){
	 *       this.name = name;
	 *       this.school = school;
	 *   }
	 *
	 *   var Person = Construct.extend({
	 *       setup: function( options ){
	 *           if (options.school){
	 *               return new Constructor.ReturnValue( new Student( options.name, options.school ) );
	 *           } else {
	 *               return [options];
	 *           }
	 *       }
	 *   });
	 *
	 *   var myPerson = new Person( {name: "Ilya", school: "PetrSU"} );
	 *
	 *   myPerson instanceof Student // => true
	 *   ```
   */
	ReturnValue: function(value){
		this.value = value;
	}
});
/**
 * @function can-construct.prototype.setup setup
 * @parent can-construct.prototype
 *
 * @signature `construct.setup(...args)`
 *
 * A setup function for the instantiation of a constructor function.
 *
 * @param {*} args The arguments passed to the constructor.
 *
 * @return {Array|undefined|can-construct.ReturnValue} If an array is returned, the array's items are passed as
 * arguments to [can-construct::init init]. If a [can-construct.ReturnValue] instance is returned, the ReturnValue
 * instance's value will be returned as the result of calling new Construct(). The following example always makes
 * sure that init is called with a jQuery wrapped element:
 *
 * ```js
 * 	WidgetFactory = Construct.extend({
 * 			setup: function(element){
 * 					return [$(element)]
 * 			}
 * 	});
 *
 * 	MyWidget = WidgetFactory.extend({
 * 			init: function($el){
 * 					$el.html("My Widget!!")
 * 			}
 * 	});
 *  ```
 *
 * Otherwise, the arguments to the
 * constructor are passed to [can-construct::init] and the return value of `setup` is discarded.
 *
 * @body
 *
 * ## Deciding between `setup` and `init`
 *
 *
 * Usually, you should use [can-construct::init init] to do your constructor function's initialization.
 * You should, instead, use `setup` when:
 *
 *   - there is initialization code that you want to run before the inheriting constructor's
 *     `init` method is called.
 *   - there is initialization code that should run whether or not inheriting constructors
 *     call their base's `init` methods.
 *   - you want to modify the arguments that will get passed to `init`.
 *
 */
defineNonEnumerable(Construct.prototype, "setup", function () {});
/**
 * @function can-construct.prototype.init init
 * @parent can-construct.prototype
 *
 * @description Called when a new instance of a Construct is created.
 *
 * @signature `construct.init(...args)`
 * @param {*} args the arguments passed to the constructor (or the items of the array returned from [can-construct::setup])
 *
 * @body
 * If a prototype `init` method is provided, `init` is called when a new Construct is created---
 * after [can-construct::setup]. The `init` method is where the bulk of your initialization code
 * should go. A common thing to do in `init` is save the arguments passed into the constructor.
 *
 * ## Examples
 *
 * First, we'll make a Person constructor that has a first and last name:
 *
 * ```js
 * var Person = Construct.extend({
 *     init: function(first, last) {
 *         this.first = first;
 *         this.last  = last;
 *     }
 * });
 *
 * var justin = new Person("Justin", "Meyer");
 * justin.first; // "Justin"
 * justin.last; // "Meyer"
 * ```
 *
 * Then, we'll extend Person into Programmer, and add a favorite language:
 *
 * ```js
 * var Programmer = Person.extend({
 *     init: function(first, last, language) {
 *         // call base's init
 *         Person.prototype.init.apply(this, arguments);
 *
 *         // other initialization code
 *         this.language = language;
 *     },
 *     bio: function() {
 *         return "Hi! I'm " + this.first + " " + this.last +
 *             " and I write " + this.language + ".";
 *     }
 * });
 *
 * var brian = new Programmer("Brian", "Moschel", 'ECMAScript');
 * brian.bio(); // "Hi! I'm Brian Moschel and I write ECMAScript.";
 * ```
 *
 * ## Modified Arguments
 *
 * [can-construct::setup] is able to modify the arguments passed to `init`.
 * If you aren't receiving the arguments you passed to `new Construct(args)`,
 * check that they aren't being changed by `setup` along
 * the inheritance chain.
 */
defineNonEnumerable(Construct.prototype, "init", function () {});

module.exports = namespace.Construct = Construct;
