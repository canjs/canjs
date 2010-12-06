(function( $ ) {

	// if we are initializing a new class
	var initializing = false,

		// tests if we can get super in .toString()
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/,

		// overwrites an object with methods, sets up _super
		inheritProps = function( newProps, oldProps, addTo ) {
			addTo = addTo || newProps
			for ( var name in newProps ) {
				// Check if we're overwriting an existing function
				addTo[name] = typeof newProps[name] == "function" && typeof oldProps[name] == "function" && fnTest.test(newProps[name]) ? (function( name, fn ) {
					return function() {
						var tmp = this._super,
							ret;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = oldProps[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, newProps[name]) : newProps[name];
			}
		};


	/**
	 * @class jQuery.Class
	 * @plugin jquery/class
	 * @tag core
	 * @download dist/jquery/jquery.class.js
	 * @test jquery/class/qunit.html
	 * Class provides simulated inheritance in JavaScript. Use $.Class to bridge the gap between
	 * jQuery's functional programming style and Object Oriented Programming.
	 * It is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class]
	 * Inheritance library.  Besides prototypal inheritance, it includes a few important features:
	 * <ul>
	 *     <li>Static inheritance</li>
	 *     <li>Introspection</li>
	 *     <li>Namespaces</li>
	 *     <li>Setup and initialization methods</li>
	 *     <li>Easy callback function creation</li>
	 * </ul>
	 * <h2>Static v. Prototype</h2>
	 * <p>Before learning about Class, it's important to
	 * understand the difference between
	 * a class's <b>static</b> and <b>prototype</b> properties.
	 * </p>
	 * @codestart
	 * //STATIC
	 * MyClass.staticProperty  //shared property
	 *
	 * //PROTOTYPE
	 * myclass = new MyClass()
	 * myclass.prototypeMethod() //instance method
	 * @codeend
	 * <p>A static (or class) property is on the Class constructor
	 * function itself
	 * and can be thought of being shared by all instances of the Class.
	 * Prototype propertes are available only on instances of the Class.
	 * </p>
	 * <h2>A Basic Class</h2>
	 * <p>The following creates a Monster class with a
	 * name (for introspection), static, and prototype members.
	 * Every time a monster instance is created, the static
	 * count is incremented.
	 *
	 * </p>
	 * @codestart
	 * $.Class.extend('Monster',
	 * /* @static *|
	 * {
	 *   count: 0
	 * },
	 * /* @prototype *|
	 * {
	 *   init: function( name ) {
	 *
	 *     // saves name on the monster instance
	 *     this.name = name;
	 *
	 *     // sets the health
	 *     this.health = 10;
	 *
	 *     // increments count
	 *     this.Class.count++;
	 *   },
	 *   eat: function( smallChildren ){
	 *     this.health += smallChildren;
	 *   },
	 *   fight: function() {
	 *     this.health -= 2;
	 *   }
	 * });
	 *
	 * hydra = new Monster('hydra');
	 *
	 * dragon = new Monster('dragon');
	 *
	 * hydra.name        // -> hydra
	 * Monster.count     // -> 2
	 * Monster.shortName // -> 'Monster'
	 *
	 * hydra.eat(2);     // health = 12
	 *
	 * dragon.fight();   // health = 8
	 *
	 * @codeend
	 *
	 * <p>
	 * Notice that the prototype <b>init</b> function is called when a new instance of Monster is created.
	 * </p>
	 * <h2>Inheritance</h2>
	 * <p>When a class is extended, all static and prototype properties are available on the new class.
	 * If you overwrite a function, you can call the base class's function by calling
	 * <code>this._super</code>.  Lets create a SeaMonster class.  SeaMonsters are less
	 * efficient at eating small children, but more powerful fighters.
	 * </p>
	 * @codestart
	 * Monster.extend("SeaMonster",{
	 *   eat: function( smallChildren ) {
	 *     this._super(smallChildren / 2);
	 *   },
	 *   fight: function() {
	 *     this.health -= 1;
	 *   }
	 * });
	 *
	 * lockNess = new SeaMonster('Lock Ness');
	 * lockNess.eat(4);   //health = 12
	 * lockNess.fight();  //health = 11
	 * @codeend
	 * <h3>Static property inheritance</h3>
	 * You can also inherit static properties in the same way:
	 * @codestart
	 * $.Class.extend("First",
	 * {
	 *     staticMethod: function() { return 1;}
	 * },{})
	 *
	 * First.extend("Second",{
	 *     staticMethod: function() { return this._super()+1;}
	 * },{})
	 *
	 * Second.staticMethod() // -> 2
	 * @codeend
	 * <h2>Namespaces</h2>
	 * <p>Namespaces are a good idea! We encourage you to namespace all of your code.
	 * It makes it possible to drop your code into another app without problems.
	 * Making a namespaced class is easy:
	 * </p>
	 * @codestart
	 * $.Class.extend("MyNamespace.MyClass",{},{});
	 *
	 * new MyNamespace.MyClass()
	 * @codeend
	 * <h2 id='introspection'>Introspection</h2>
	 * Often, it's nice to create classes whose name helps determine functionality.  Ruby on
	 * Rails's [http://api.rubyonrails.org/classes/ActiveRecord/Base.html|ActiveRecord] ORM class
	 * is a great example of this.  Unfortunately, JavaScript doesn't have a way of determining
	 * an object's name, so the developer must provide a name.  Class fixes this by taking a String name for the class.
	 * @codestart
	 * $.Class.extend("MyOrg.MyClass",{},{})
	 * MyOrg.MyClass.shortName //-> 'MyClass'
	 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
	 * @codeend
	 * The fullName (with namespaces) and the shortName (without namespaces) are added to the Class's
	 * static properties.
	 *
	 *
	 * <h2>Setup and initialization methods</h2>
	 * <p>
	 * Class provides static and prototype initialization functions.
	 * These come in two flavors - setup and init.
	 * Setup is called before init and
	 * can be used to 'normalize' init's arguments.
	 * </p>
	 * <div class='whisper'>PRO TIP: Typically, you don't need setup methods in your classes. Use Init instead.
	 * Reserve setup methods for when you need to do complex pre-processing of your class before init is called.
	 *
	 * </div>
	 * @codestart
	 * $.Class.extend("MyClass",
	 * {
	 *   setup: function() {} //static setup
	 *   init: function() {} //static constructor
	 * },
	 * {
	 *   setup: function() {} //prototype setup
	 *   init: function() {} //prototype constructor
	 * })
	 * @codeend
	 *
	 * <h3>Setup</h3>
	 * <p>Setup functions are called before init functions.  Static setup functions are passed
	 * the base class followed by arguments passed to the extend function.
	 * Prototype static functions are passed the Class constructor function arguments.</p>
	 * <p>If a setup function returns an array, that array will be used as the arguments
	 * for the following init method.  This provides setup functions the ability to normalize
	 * arguments passed to the init constructors.  They are also excellent places
	 * to put setup code you want to almost always run.</p>
	 * <p>
	 * The following is similar to how [jQuery.Controller.prototype.setup]
	 * makes sure init is always called with a jQuery element and merged options
	 * even if it is passed a raw
	 * HTMLElement and no second parameter.
	 * </p>
	 * @codestart
	 * $.Class.extend("jQuery.Controller",{
	 *   ...
	 * },{
	 *   setup: function( el, options ) {
	 *     ...
	 *     return [$(el),
	 *             $.extend(true,
	 *                this.Class.defaults,
	 *                options || {} ) ]
	 *   }
	 * })
	 * @codeend
	 * Typically, you won't need to make or overwrite setup functions.
	 * <h3>Init</h3>
	 *
	 * <p>Init functions are called after setup functions.
	 * Typically, they receive the same arguments
	 * as their preceding setup function.  The Foo class's <code>init</code> method
	 * gets called in the following example:
	 * </p>
	 * @codestart
	 * $.Class.Extend("Foo", {
	 *   init: function( arg1, arg2, arg3 ) {
	 *     this.sum = arg1+arg2+arg3;
	 *   }
	 * })
	 * var foo = new Foo(1,2,3);
	 * foo.sum //-> 6
	 * @codeend
	 * <h2>Callbacks</h2>
	 * <p>Similar to jQuery's proxy method, Class provides a
	 * [jQuery.Class.static.callback callback]
	 * function that returns a callback to a method that will always
	 * have
	 * <code>this</code> set to the class or instance of the class.
	 * </p>
	 * The following example uses this.callback to make sure
	 * <code>this.name</code> is available in <code>show</code>.
	 * @codestart
	 * $.Class.extend("Todo",{
	 *   init: function( name ) { this.name = name }
	 *   get: function() {
	 *     $.get("/stuff",this.callback('show'))
	 *   },
	 *   show: function( txt ) {
	 *     alert(this.name+txt)
	 *   }
	 * })
	 * new Todo("Trash").get()
	 * @codeend
	 * <p>Callback is available as a static and prototype method.</p>
	 * <h2>Demo</h2>
	 * @demo jquery/class/class.html
	 *
	 * @constructor Creating a new instance of an object that has extended jQuery.Class
	 *     calls the init prototype function and returns a new instance of the class.
	 *
	 */

	jQuery.Class = function() {
		if (arguments.length) {
			jQuery.Class.extend.apply(jQuery.Class, arguments);
		}
	};

	/* @Static*/
	$.extend($.Class, {
		/**
		 * @function callback
		 * Returns a callback function for a function on this Class.
		 * The callback function ensures that 'this' is set appropriately.  
		 * @codestart
		 * $.Class.extend("MyClass",{
		 *     getData: function() {
		 *         this.showing = null;
		 *         $.get("data.json",this.callback('gotData'),'json')
		 *     },
		 *     gotData: function( data ) {
		 *         this.showing = data;
		 *     }
		 * },{});
		 * MyClass.showData();
		 * @codeend
		 * <h2>Currying Arguments</h2>
		 * Additional arguments to callback will fill in arguments on the returning function.
		 * @codestart
		 * $.Class.extend("MyClass",{
		 *    getData: function( <b>callback</b> ) {
		 *      $.get("data.json",this.callback('process',<b>callback</b>),'json');
		 *    },
		 *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
		 *        jsonData.processed = true;
		 *        callback(jsonData);
		 *    }
		 * },{});
		 * MyClass.getData(showDataFunc)
		 * @codeend
		 * <h2>Nesting Functions</h2>
		 * Callback can take an array of functions to call as the first argument.  When the returned callback function
		 * is called each function in the array is passed the return value of the prior function.  This is often used
		 * to eliminate currying initial arguments.
		 * @codestart
		 * $.Class.extend("MyClass",{
		 *    getData: function( callback ) {
		 *      //calls process, then callback with value from process
		 *      $.get("data.json",this.callback(['process2',callback]),'json') 
		 *    },
		 *    process2: function( type,jsonData ) {
		 *        jsonData.processed = true;
		 *        return [jsonData];
		 *    }
		 * },{});
		 * MyClass.getData(showDataFunc);
		 * @codeend
		 * @param {String|Array} fname If a string, it represents the function to be called.  
		 * If it is an array, it will call each function in order and pass the return value of the prior function to the
		 * next function.
		 * @return {Function} the callback function.
		 */
		callback: function( funcs ) {

			//args that should be curried
			var args = jQuery.makeArray(arguments),
				self;

			funcs = args.shift();

			if (!jQuery.isArray(funcs) ) {
				funcs = [funcs];
			}

			self = this;
			
			return function class_cb() {
				var cur = args.concat(jQuery.makeArray(arguments)),
					isString, 
					length = funcs.length,
					f = 0,
					func;

				for (; f < length; f++ ) {
					func = funcs[f];
					if (!func ) {
						continue;
					}

					isString = typeof func == "string";
					if ( isString && self._set_called ) {
						self.called = func;
					}
					cur = (isString ? self[func] : func).apply(self, cur || []);
					if ( f < length - 1 ) {
						cur = !jQuery.isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		},
		/**
		 *   @function getObject 
		 *   Gets an object from a String.
		 *   If the object or namespaces the string represent do not
		 *   exist it will create them.  
		 *   @codestart
		 *   Foo = {Bar: {Zar: {"Ted"}}}
		 *   $.Class.getobject("Foo.Bar.Zar") //-> "Ted"
		 *   @codeend
		 *   @param {String} objectName the object you want to get
		 *   @param {Object} [current=window] the object you want to look in.
		 *   @return {Object} the object you are looking for.
		 */
		getObject: function( objectName, current ) {
			var current = current || window,
				parts = objectName ? objectName.split(/\./) : [],
				i = 0;
			for (; i < parts.length; i++ ) {
				current = current[parts[i]] || (current[parts[i]] = {})
			}
			return current;
		},
		/**
		 * @function newInstance
		 * Creates a new instance of the class.  This method is useful for creating new instances
		 * with arbitrary parameters.
		 * <h3>Example</h3>
		 * @codestart
		 * $.Class.extend("MyClass",{},{})
		 * var mc = MyClass.newInstance.apply(null, new Array(parseInt(Math.random()*10,10))
		 * @codeend
		 * @return {class} instance of the class
		 */
		newInstance: function() {
			var inst = this.rawInstance(),
				args;
			if ( inst.setup ) {
				args = inst.setup.apply(inst, arguments);
			}
			if ( inst.init ) {
				inst.init.apply(inst, $.isArray(args) ? args : arguments);
			}
			return inst;
		},
		/**
		 * Copy and overwrite options from old class
		 * @param {Object} oldClass
		 * @param {String} fullName
		 * @param {Object} staticProps
		 * @param {Object} protoProps
		 */
		setup: function( oldClass, fullName ) {
			this.defaults = $.extend(true, {}, oldClass.defaults, this.defaults);
			return arguments;
		},
		rawInstance: function() {
			initializing = true;
			var inst = new this();
			initializing = false;
			return inst;
		},
		/**
		 * Extends a class with new static and prototype functions.  There are a variety of ways
		 * to use extend:
		 * @codestart
		 * //with className, static and prototype functions
		 * $.Class.extend('Task',{ STATIC },{ PROTOTYPE })
		 * //with just classname and prototype functions
		 * $.Class.extend('Task',{ PROTOTYPE })
		 * //With just a className
		 * $.Class.extend('Task')
		 * @codeend
		 * @param {String} [fullName]  the classes name (used for classes w/ introspection)
		 * @param {Object} [klass]  the new classes static/class functions
		 * @param {Object} [proto]  the new classes prototype functions
		 * @return {jQuery.Class} returns the new class
		 */
		extend: function( fullName, klass, proto ) {
			// figure out what was passed
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
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			prototype = new this();
			initializing = false;
			// Copy the properties over onto the new prototype
			inheritProps(proto, _super, prototype);

			// The dummy class constructor

			function Class() {
				// All construction is actually done in the init method
				if ( initializing ) return;

				if ( this.constructor !== Class && arguments.length ) { //we are being called w/o new
					return this.extend.apply(this, arguments)
				} else { //we are being called w/ new
					return this.Class.newInstance.apply(this.Class, arguments)
				}
			}
			// Copy old stuff onto class
			for ( name in this ) {
				if ( this.hasOwnProperty(name) && $.inArray(name, ['prototype', 'defaults', 'getObject']) == -1 ) {
					Class[name] = this[name];
				}
			}

			// do static inheritance
			inheritProps(klass, this, Class);

			// do namespace stuff
			if ( fullName ) {

				var parts = fullName.split(/\./),
					shortName = parts.pop(),
					current = $.Class.getObject(parts.join('.')),
					namespace = current;

				
				current[shortName] = Class;
			}

			// set things that can't be overwritten
			$.extend(Class, {
				prototype: prototype,
				namespace: namespace,
				shortName: shortName,
				constructor: Class,
				fullName: fullName
			});

			//make sure our prototype looks nice
			Class.prototype.Class = Class.prototype.constructor = Class;


			/**
			 * @attribute fullName 
			 * The full name of the class, including namespace, provided for introspection purposes.
			 * @codestart
			 * $.Class.extend("MyOrg.MyClass",{},{})
			 * MyOrg.MyClass.shortName //-> 'MyClass'
			 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
			 * @codeend
			 */

			var args = Class.setup.apply(Class, [_super_class].concat($.makeArray(arguments)));

			if ( Class.init ) {
				Class.init.apply(Class, args || []);
			}

			/* @Prototype*/
			return Class;
			/** 
			 * @function setup
			 * Called with the same arguments as new Class(arguments ...) when a new instance is created.
			 * @codestart
			 * $.Class.extend("MyClass",
			 * {
			 *    setup: function( val ) {
			 *       this.val = val;
			 *    }
			 * })
			 * var mc = new MyClass("Check Check")
			 * mc.val //-> 'Check Check'
			 * @codeend
			 * 
			 * <div class='whisper'>PRO TIP: 
			 * Setup functions are used to normalize constructor arguments and provide a place for
			 * setup code that extending classes don't have to remember to call _super to
			 * run.
			 * </div>
			 * 
			 * @return {Array|undefined} If an array is return, [jQuery.Class.prototype.init] is 
			 * called with those arguments; otherwise, the original arguments are used.
			 */
			//break up
			/** 
			 * @function init
			 * Called with the same arguments as new Class(arguments ...) when a new instance is created.
			 * @codestart
			 * $.Class.extend("MyClass",
			 * {
			 *    init: function( val ) {
			 *       this.val = val;
			 *    }
			 * })
			 * var mc = new MyClass("Check Check")
			 * mc.val //-> 'Check Check'
			 * @codeend
			 */
			//Breaks up code
			/**
			 * @attribute Class
			 * References the static properties of the instance's class.
			 * <h3>Quick Example</h3>
			 * @codestart
			 * // a class with a static classProperty property
			 * $.Class.extend("MyClass", {classProperty : true}, {});
			 * 
			 * // a new instance of myClass
			 * var mc1 = new MyClass();
			 * 
			 * //
			 * mc1.Class.classProperty = false;
			 * 
			 * // creates a new MyClass
			 * var mc2 = new mc.Class();
			 * @codeend
			 * Getting static properties via the Class property, such as it's 
			 * [jQuery.Class.static.fullName fullName] is very common.
			 */
		}

	})





	jQuery.Class.prototype.
	/**
	 * @function callback
	 * Returns a callback function.  This does the same thing as and is described better in [jQuery.Class.static.callback].
	 * The only difference is this callback works
	 * on a instance instead of a class.
	 * @param {String|Array} fname If a string, it represents the function to be called.  
	 * If it is an array, it will call each function in order and pass the return value of the prior function to the
	 * next function.
	 * @return {Function} the callback function
	 */
	callback = jQuery.Class.callback;


})(jQuery);
(function( $ ) {
	// Several of the methods in this plugin use code adapated from Prototype
	//  Prototype JavaScript framework, version 1.6.0.1
	//  (c) 2005-2007 Sam Stephenson
	var regs = {
		undHash: /_|-/,
		colons: /::/,
		words: /([A-Z]+)([A-Z][a-z])/g,
		lowerUpper: /([a-z\d])([A-Z])/g,
		dash: /([a-z\d])([A-Z])/g,
		replacer: /\{([^\}]+)\}/g
	},
	getObject = function( objectName, current, remove) {
		var current = current || window,
			parts = objectName ? objectName.split(/\./) : [],
			ret,
			i = 0;
		for (; i < parts.length-1 && current; i++ ) {
			current = current[parts[i]]
		}
		ret = current[parts[i]];
		if(remove){
			delete current[parts[i]];
		}
		return ret;
	};

	/** 
	 * @class jQuery.String
	 */
	var str = ($.String =
	/* @Static*/
	{
		/**
		 * @function strip
		 * @param {String} s returns a string with leading and trailing whitespace removed.
		 */
		strip: function( string ) {
			return string.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		/**
		 * Capitalizes a string
		 * @param {String} s the string to be lowercased.
		 * @return {String} a string with the first character capitalized, and everything else lowercased
		 */
		capitalize: function( s, cache ) {
			return s.charAt(0).toUpperCase() + s.substr(1);
		},

		/**
		 * Returns if string ends with another string
		 * @param {String} s String that is being scanned
		 * @param {String} pattern What the string might end with
		 * @return {Boolean} true if the string ends wtih pattern, false if otherwise
		 */
		endsWith: function( s, pattern ) {
			var d = s.length - pattern.length;
			return d >= 0 && s.lastIndexOf(pattern) === d;
		},
		/**
		 * Capitalizes a string from something undercored. Examples:
		 * @codestart
		 * jQuery.String.camelize("one_two") //-> "oneTwo"
		 * "three-four".camelize() //-> threeFour
		 * @codeend
		 * @param {String} s
		 * @return {String} a the camelized string
		 */
		camelize: function( s ) {
			var parts = s.split(regs.undHash),
				i = 1;
			parts[0] = parts[0].charAt(0).toLowerCase() + parts[0].substr(1);
			for (; i < parts.length; i++ ) {
				parts[i] = str.capitalize(parts[i]);
			}

			return parts.join('');
		},
		/**
		 * Like camelize, but the first part is also capitalized
		 * @param {String} s
		 * @return {String} the classized string
		 */
		classize: function( s ) {
			var parts = s.split(regs.undHash),
				i = 0;
			for (; i < parts.length; i++ ) {
				parts[i] = str.capitalize(parts[i]);
			}

			return parts.join('');
		},
		/**
		 * Like [jQuery.String.static.classize|classize], but a space separates each 'word'
		 * @codestart
		 * jQuery.String.niceName("one_two") //-> "One Two"
		 * @codeend
		 * @param {String} s
		 * @return {String} the niceName
		 */
		niceName: function( s ) {
			var parts = s.split(regs.undHash),
				i = 0;
			for (; i < parts.length; i++ ) {
				parts[i] = str.capitalize(parts[i]);
			}

			return parts.join(' ');
		},

		/**
		 * Underscores a string.
		 * @codestart
		 * jQuery.String.underscore("OneTwo") //-> "one_two"
		 * @codeend
		 * @param {String} s
		 * @return {String} the underscored string
		 */
		underscore: function( s ) {
			return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowerUpper, '$1_$2').replace(regs.dash, '_').toLowerCase();
		},
		/**
		 * Returns a string with {param} replaced with parameters
		 * from data.
		 *     $.String.sub("foo {bar}",{bar: "far"})
		 *     //-> "foo far"
		 * @param {String} s
		 * @param {Object} data
		 */
		sub : function( s, data, remove ){
			return s.replace(regs.replacer, function( whole, inside ) {
				//convert inside to type
				return getObject(inside, data, remove).toString(); //gets the value in options
			})
		}
	});

})(jQuery);
(function( $ ) {
	/**
	 * @attribute destroyed
	 * @parent specialevents
	 * @download jquery/dist/jquery.event.destroyed.js
	 * @test jquery/event/destroyed/qunit.html
	 * Provides a destroyed event on an element.
	 * <p>
	 * The destroyed event is called when the element
	 * is removed as a result of jQuery DOM manipulators like remove, html,
	 * replaceWith, etc. Destroyed events do not bubble, so make sure you don't use live or delegate with destroyed
	 * events.
	 * </p>
	 * <h2>Quick Example</h2>
	 * @codestart
	 * $(".foo").bind("destroyed", function(){
	 *    //clean up code
	 * })
	 * @codeend
	 * <h2>Quick Demo</h2>
	 * @demo jquery/event/destroyed/destroyed.html 
	 * <h2>More Involved Demo</h2>
	 * @demo jquery/event/destroyed/destroyed_menu.html 
	 */

	var oldClean = jQuery.cleanData;

	$.cleanData = function( elems ) {
		for ( var i = 0, elem;
		(elem = elems[i]) !== undefined; i++ ) {
			$(elem).triggerHandler("destroyed");
			//$.event.remove( elem, 'destroyed' );
		}
		oldClean(elems);
	};

})(jQuery);
(function( $ ) {

	// ------- helpers  ------
	// Binds an element, returns a function that unbinds
	var bind = function( el, ev, callback ) {
		var wrappedCallback;
		//this is for events like >click.
		if ( ev.indexOf(">") === 0 ) {
			ev = ev.substr(1);
			wrappedCallback = function( event ) {
				if ( event.target === el ) {
					callback.apply(this, arguments);
				} else {
					event.handled = null;
				}
			};
		}
		$(el).bind(ev, wrappedCallback || callback);
		// if ev name has >, change the name and bind
		// in the wrapped callback, check that the element matches the actual element
		return function() {
			$(el).unbind(ev, wrappedCallback || callback);
			el = ev = callback = wrappedCallback = null;
		};
	},
		// Binds an element, returns a function that unbinds
		delegate = function( el, selector, ev, callback ) {
			$(el).delegate(selector, ev, callback);
			return function() {
				$(el).undelegate(selector, ev, callback);
				el = ev = callback = selector = null;
			};
		},
		binder = function( el, ev, callback, selector ) {
			return selector ? delegate(el, selector, ev, callback) : bind(el, ev, callback);
		},
		/**
		 * moves 'this' to the first argument 
		 */
		shifter = function shifter(cb) {
			return function() {
				return cb.apply(null, [$(this)].concat(Array.prototype.slice.call(arguments, 0)));
			};
		},
		// matches dots
		dotsReg = /\./g,
		// matches controller
		controllersReg = /_?controllers?/ig,
		//used to remove the controller from the name
		underscoreAndRemoveController = function( className ) {
			return $.String.underscore(className.replace(dotsReg, '_').replace(controllersReg, ""));
		},
		// checks if it looks like an action
		actionMatcher = /[^\w]/,
		// gets jus the event
		eventCleaner = /^(>?default\.)|(>)/,
		// handles parameterized action names
		parameterReplacer = /\{([^\}]+)\}/g,
		breaker = /^(?:(.*?)\s)?([\w\.\:>]+)$/,
		basicProcessor;
	/**
	 * @tag core
	 * @plugin jquery/controller
	 * @download jquery/dist/jquery.controller.js
	 * @test jquery/controller/qunit.html
	 * 
	 * Controllers organize event handlers using event delegation. 
	 * If something happens in your application (a user click or a [jQuery.Model|Model] instance being updated), 
	 * a controller should respond to it.
	 * 
	 * ## Benefits
	 * 
	 *  - <i>Know your code.</i>
	 *    
	 *    Group events and label your html in repeatable ways so it's easy to find your code.
	 *  
	 *  - <i>Controllers are inheritable.</i>
	 *         
	 *    Package, inherit, and reuse your widgets.
	 *    
	 *  - <i>Write less.</i>
	 *         
	 *    Controllers take care of setup / teardown auto-magically.
	 * 
	 * 
	 * ## Basic Example
	 * 
	 * Controllers organize jQuery code into resuable, inheritable, and extendable widgets.  So instead of
	 * 
	 * @codestart
	 * $(function(){
	 *   $('#tabs').click(someCallbackFunction1)
	 *   $('#tabs .tab').click(someCallbackFunction2)
	 *   $('#tabs .delete click').click(someCallbackFunction3)
	 * });
	 * @codeend
	 * 
	 * do this
	 * 
	 * @codestart
	 * $.Controller.extend('Tabs',{
	 *   click: function() {...},
	 *   '.tab click' : function() {...},
	 *   '.delete click' : function() {...}
	 * })
	 * $('#tabs').tabs();
	 * @codeend
	 * 
	 * ## Tabs Example
	 * 
	 * @demo jquery/controller/controller.html
	 * 
	 * 
	 * ## Using Controllers
	 * 
	 * 
	 * A Controller is mostly a list of functions that get called back when specific events happen.  
	 * A function's name provides a description of when the function should be called.  
	 * By naming your functions like "<b>selector</b> <b>event</b>", 
	 * Controller recognizes them as an <b>Action</b> and binds them appropriately.  
	 * 
	 * The event binding happens when you create a [jQuery.Controller.prototype.setup|new controller instance].
	 * 
	 * Lets look at a very basic example - 
	 * a list of todos and a button you want to click to create a new todo.
	 * Your HTML might look like:
	 * 
	 * @codestart html
	 * &lt;div id='todos'>
	 *  &lt;ol>
	 *    &lt;li class="todo">Laundry&lt;/li>
	 *    &lt;li class="todo">Dishes&lt;/li>
	 *    &lt;li class="todo">Walk Dog&lt;/li>
	 *  &lt;/ol>
	 *  &lt;a class="create">Create&lt;/a>
	 * &lt;/div>
	 * @codeend
	 * 
	 * To add a mousover effect and create todos, your controller might look like:
	 * 
	 * @codestart
	 * $.Controller.extend('Todos',{
	 *   ".todo mouseover" : function( el, ev ) {
	 *    el.css("backgroundColor","red")
	 *   },
	 *   ".todo mouseout" : function( el, ev ) {
	 *    el.css("backgroundColor","")
	 *   },
	 *   ".create click" : function() {
	 *    this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
	 *   }
	 * })
	 * @codeend
	 * 
	 * Now that you've created the controller class, you've must attach the event handlers on the '#todos' div by
	 * creating [jQuery.Controller.prototype.init|a new controller instance].  There are 2 ways of doing this.
	 * 
	 * @codestart
	 * //1. Create a new controller directly:
	 * new Todos($('#todos'));
	 * //2. Use jQuery function
	 * $('#todos').todos();
	 * @codeend
	 * 
	 * As you've likely noticed, when the [jQuery.Controller.static.init|controller class is created], it creates helper
	 * functions on [jQuery.fn]. The "#todos" element is known as the <b>controller</b> element.
	 * 
	 * ### Event Handler Matching
	 * 
	 * With the exception of subscribe actions, controller uses jQuery.fn.bind or jQuery.fn.delegate to 
	 * attach event handlers.  Controller uses the following rules to determine if a function name is
	 * an event handler:
	 * 
	 *  - Does the function name contain a selector?  Ex: <code>"a.foo click"</code>
	 *  - Does the function name match an event in jQuery.event.special? Ex: <code>"mouseenter"</code>
	 *  - Does the function name match a standard event name? Ex: <code>"click"</code>
	 *  - Does the function name match a value in the controller's static listensTo array? Ex: <code>"activate"</code>
	 * 
	 * In general, Controller will know automatically when to bind event handler functions except for 
	 * one case - event names without selectors that are not in $.event.special.  But to correct for this, you
	 * just need to add the function to the listensTo property.  Here's how:
	 * 
	 * @codestart
	 * $.Controller.extend("MyShow",{
	 *   listensTo: ["show"]
	 * },{
	 *   show: function( el, ev ) {
	 *     el.show();
	 *   }
	 * })
	 * $('.show').my_show().trigger("show");
	 * @codeend
	 * 
	 * 
	 * ### Callback Parameters
	 * 
	 * For most actions, the first two parameters are always:
	 * 
	 * - el : the jQuery wrapped element.
	 * - ev : the jQuery wrapped DOM event.
	 * 
	 * @codestart
	 * ".something click" : function( el, ev ) {
	 *    el.slideUp()
	 *    ev.stopDelegation();  //stops this event from delegating to any other
	 *                          // delegated events for this delegated element.
	 *    ev.preventDefault();  //prevents the default action from happening.
	 *    ev.stopPropagation(); //stops the event from going to other elements.
	 * }
	 * @codeend
	 * 
	 * If the action provides different parameters, they are in each action's documentation.
	 * 
	 * 
	 * ## Document Controllers
	 * 
	 * Document Controllers delegate on the documentElement.  You don't have to attach an instance as this will be done
	 * for you when the controller class is created.  Document Controllers, with the exception of MainControllers,
	 * add an implicit '#CONTROLLERNAME' before every selector.
	 * 
	 * To create a document controller, you just have to set the controller's [jQuery.Controller.static.onDocument static onDocument]
	 * property to true.
	 * 
	 * @codestart
	 * $.Controller.extend('TodosController',
	 * {onDocument: true},
	 * {
	 *   ".todo mouseover" : function( el, ev ) { //matches #todos .todo
	 *       el.css("backgroundColor","red")
	 *   },
	 *   ".todo mouseout" : function( el, ev ) { //matches #todos .todo
	 *       el.css("backgroundColor","")
	 *   },
	 *   ".create click" : function() {        //matches #todos .create
	 *       this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
	 *   }
	 * })
	 * @codeend
	 * 
	 * DocumentControllers are typically used for page layout and functionality that is 
	 * extremely unlikely to be repeated such as a SidebarController.  
	 * Often, a Document Controller's <b>"ready"</b> event will be used to create
	 * necessary Element Controllers.
	 * 
	 * @codestart
	 * $.Controller.extend('SidebarController',
	 * {onDocument: true},
	 * {
	 *   <b>ready</b> : function() {
	 *       $(".slider").slider_controller()
	 *   },
	 *   "a.tag click" : function() {..}
	 * })
	 * @codeend
	 * 
	 * ### MainControllers 
	 * 
	 * MainControllers are documentControllers that do not add '#CONTROLLERNAME' before every selector.  This controller
	 * should only be used for page wide functionality and setup.
	 * 
	 * @codestart
	 * $.Controller.extend("MainController",{
	 *   hasActiveElement : document.activeElement || false
	 * },{
	 *   focus : funtion(el){
	 *      if(!this.Class.hasActiveElement)
	 *          document.activeElement = el[0] //tracks active element
	 *   }
	 * })
	 * @codeend
	 * 
	 * ## Controller Initialization
	 * 
	 * It can be extremely useful to overwrite [jQuery.Controller.prototype.init Controller.prototype.init] with 
	 * setup functionality for your widget.
	 * 
	 * In the following example, I create a controller that when created, will put a message as the content of the element:
	 * 
	 * @codestart
	 * $.Controller.extend("SpecialController",
	 * {
	 *   init: function( el, message ) {
	 *      this.element.html(message)
	 *   }
	 * })
	 * $(".special").special("Hello World")
	 * @codeend
	 * 
	 * ## Removing Controllers
	 * 
	 * Controller removal is built into jQuery.  So to remove a controller, you just have to remove its element:
	 * 
	 * @codestart
	 * $(".special_controller").remove()
	 * $("#containsControllers").html("")
	 * @codeend
	 * 
	 * It's important to note that if you use raw DOM methods (<code>innerHTML, removeChild</code>), the controllers won't be destroyed.
	 * 
	 * If you just want to remove controller functionality, call destroy on the controller instance:
	 * 
	 * @codestart
	 * $(".special_controller").controller().destroy()
	 * @codeend
	 * 
	 * ## Accessing Controllers
	 * 
	 * Often you need to get a reference to a controller, there are a few ways of doing that.  For the 
	 * following example, we assume there are 2 elements with <code>className="special"</code>.
	 * 
	 * @codestart
	 * //creates 2 foo controllers
	 * $(".special").foo()
	 * 
	 * //creates 2 bar controllers
	 * $(".special").bar()
	 * 
	 * //gets all controllers on all elements:
	 * $(".special").controllers() //-> [foo, bar, foo, bar]
	 * 
	 * //gets only foo controllers
	 * $(".special").controllers(FooController) //-> [foo, foo]
	 * 
	 * //gets all bar controllers
	 * $(".special").controllers(BarController) //-> [bar, bar]
	 * 
	 * //gets first controller
	 * $(".special").controller() //-> foo
	 * 
	 * //gets foo controller via data
	 * $(".special").data("controllers")["FooController"] //-> foo
	 * @codeend
	 * 
	 * ## Calling methods on Controllers
	 * 
	 * Once you have a reference to an element, you can call methods on it.  However, Controller has
	 * a few shortcuts:
	 * 
	 * @codestart
	 * //creates foo controller
	 * $(".special").foo({name: "value"})
	 * 
	 * //calls FooController.prototype.update
	 * $(".special").foo({name: "value2"})
	 * 
	 * //calls FooController.prototype.bar
	 * $(".special").foo("bar","something I want to pass")
	 * @codeend
	 */
	$.Class.extend("jQuery.Controller",
	/** 
	 * @Static
	 */
	{
		/**
		 * Does 3 things:
		 * <ol>
		 *     <li>Creates a jQuery helper for this controller.</li>
		 *     <li>Calculates and caches which functions listen for events.</li>
		 *     <li> and attaches this element to the documentElement if onDocument is true.</li>
		 * </ol>   
		 * <h3>jQuery Helper Naming Examples</h3>
		 * @codestart
		 * "TaskController" -> $().task_controller()
		 * "Controllers.Task" -> $().controllers_task()
		 * @codeend
		 */
		init: function() {
			// if you didn't provide a name, or are controller, don't do anything
			if (!this.shortName || this.fullName == "jQuery.Controller" ) {
				return;
			}
			// cache the underscored names
			this._fullName = underscoreAndRemoveController(this.fullName);
			this._shortName = underscoreAndRemoveController(this.shortName);

			var controller = this,
				pluginname = this._fullName,
				funcName, forLint;

			// create jQuery plugin
			if (!$.fn[pluginname] ) {
				$.fn[pluginname] = function( options ) {

					var args = $.makeArray(arguments),
						//if the arg is a method on this controller
						isMethod = typeof options == "string" && $.isFunction(controller.prototype[options]),
						meth = args[0];
					this.each(function() {
						//check if created
						var controllers = $.data(this, "controllers"),
							//plugin is actually the controller instance
							plugin = controllers && controllers[pluginname];

						if ( plugin ) {
							if ( isMethod ) {
								// call a method on the controller with the remaining args
								plugin[meth].apply(plugin, args.slice(1));
							} else {
								// call the plugin's update method
								plugin.update.apply(plugin, args);
							}

						} else {
							//create a new controller instance
							controller.newInstance.apply(controller, [this].concat(args));
						}
					});
					//always return the element
					return this;
				};
			}

			// make sure listensTo is an array
			
			// calculate and cache actions
			this.actions = {};

			for ( funcName in this.prototype ) {
				if (!$.isFunction(this.prototype[funcName]) ) {
					continue;
				}
				if ( this._isAction(funcName) ) {
					this.actions[funcName] = this._getAction(funcName);
				}
			}

			/**
			 * @attribute onDocument
			 * Set to true if you want to automatically attach this element to the documentElement.
			 */
			if ( this.onDocument ) {
				forLint = new controller(document.documentElement);
			}
		},
		hookup: function( el ) {
			return new this(el);
		},

		/**
		 * @hide
		 * @param {String} methodName a prototype function
		 * @return {Boolean} truthy if an action or not
		 */
		_isAction: function( methodName ) {
			if ( actionMatcher.test(methodName) ) {
				return true;
			} else {
				var cleanedEvent = methodName.replace(eventCleaner, "");
				return $.inArray(cleanedEvent, this.listensTo) > -1 || $.event.special[cleanedEvent] || $.Controller.processors[cleanedEvent];
			}

		},
		/**
		 * @hide
		 * @param {Object} methodName the method that will be bound
		 * @param {Object} [options] first param merged with class default options
		 * @return {Object} null or the processor and pre-split parts.  
		 * The processor is what does the binding/subscribing.
		 */
		_getAction: function( methodName, options ) {
			//if we don't have a controller instance, we'll break this guy up later
			parameterReplacer.lastIndex = 0;
			if (!options && parameterReplacer.test(methodName) ) {
				return null;
			}
			var convertedName = options ? $.String.sub(methodName, options) : methodName,
				parts = convertedName.match(breaker),
				event = parts[2],
				processor = this.processors[event] || basicProcessor;
			return {
				processor: processor,
				parts: parts
			};
		},
		/**
		 * @attribute processors
		 * A has of eventName: function pairs that Controller uses to hook 
		 */
		processors: {},
		/**
		 * @attribute listensTo
		 * A list of special events this controller listens too.  You only need to add event names that
		 * are whole words (ie have no special characters).
		 */
		listensTo: []
	},
	/** 
	 * @Prototype
	 */
	{
		/**
		 * Does three things:
		 * <ol>
		 *     <li>Matches and creates actions.</li>
		 *     <li>Set the controller's element.</li>
		 *     <li>Saves a reference to this controller in the element's data.</li>
		 * </ol>  
		 * @param {HTMLElement} element the element this instance operates on.
		 */
		setup: function( element, options ) {
			var funcName, ready, cls = this.Class;

			//want the raw element here
			element = element.jquery ? element[0] : element;

			//set element and className on element
			this.element = $(element).addClass(cls._fullName);

			//set in data
			($.data(element, "controllers") || $.data(element, "controllers", {}))[cls._fullName] = this;

			//adds bindings
			this._bindings = [];
			/**
			 * @attribute options
			 * Options is automatically merged from this.Class.OPTIONS and the 2nd argument
			 * passed to a controller.
			 */
			this.options = $.extend($.extend(true, {}, cls.defaults), options);

			//go through the cached list of actions and use the processor to bind
			for ( funcName in cls.actions ) {
				ready = cls.actions[funcName] || cls._getAction(funcName, this.options);

				this._bindings.push(
				ready.processor(element, ready.parts[2], ready.parts[1], this.callback(funcName), this));
			}


			/**
			 * @attribute called
			 * String name of current function being called on controller instance.  This is 
			 * used for picking the right view in render.
			 * @hide
			 */
			this.called = "init";

			//setup to be destroyed ... don't bind b/c we don't want to remove it
			//this.element.bind('destroyed', this.callback('destroy'))
			var destroyCB = shifter(this.callback("destroy"));
			this.element.bind("destroyed", destroyCB);
			this._bindings.push(function( el ) {
				destroyCB.removed = true;
				$(element).unbind("destroyed", destroyCB);
			});

			/**
			 * @attribute element
			 * The controller instance's delegated element.  This is set by [jQuery.Controller.prototype.init init].
			 * It is a jQuery wrapped element.
			 * @codestart
			 * ".something click" : function() {
			 *    this.element.css("color","red")
			 * }
			 * @codeend
			 */
			return this.element;
		},
		/**
		 * Bind attaches event handlers that will be removed when the controller is removed.  
		 * This is a good way to attach to an element not in the controller's element.
		 * <br/>
		 * <h3>Examples:</h3>
		 * @codestart
		 * init: function() {
		 *    // calls somethingClicked(el,ev)
		 *    this.bind('click','somethingClicked') 
		 * 
		 *    // calls function when the window is clicked
		 *    this.bind(window, 'click', function(ev){
		 *      //do something
		 *    })
		 * },
		 * somethingClicked: function( el, ev ) {
		 *   
		 * }
		 * @codeend
		 * @param {HTMLElement|jQuery.fn} [element=this.element] element the element to be bound
		 * @param {String} eventName The event to listen for.
		 * @param {Function|String} func A callback function or the String name of a controller function.  If a controller
		 * function name is given, the controller function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		bind: function( el, eventName, func ) {
			if ( typeof el == 'string' ) {
				func = eventName;
				eventName = el;
				el = this.element;
			}
			return this._binder(el, eventName, func);
		},
		_binder: function( el, eventName, func, selector ) {
			if ( typeof func == 'string' ) {
				func = shifter(this.callback(func));
			}
			this._bindings.push(binder(el, eventName, func, selector));
			return this._bindings.length;
		},
		/**
		 * Delegate will delegate on an elememt and will be undelegated when the controller is removed.
		 * This is a good way to delegate on elements not in a controller's element.<br/>
		 * <h3>Example:</h3>
		 * @codestart
		 * // calls function when the any 'a.foo' is clicked.
		 * this.delegate(document.documentElement,'a.foo', 'click', function(ev){
		 *   //do something
		 * })
		 * @codeend
		 * @param {HTMLElement|jQuery.fn} [element=this.element] element
		 * @param {String} selector the css selector
		 * @param {String} eventName 
		 * @param {Function|String} func A callback function or the String name of a controller function.  If a controller
		 * function name is given, the controller function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		delegate: function( element, selector, eventName, func ) {
			if ( typeof element == 'string' ) {
				func = eventName;
				eventName = selector;
				selector = element;
				element = this.element;
			}
			return this._binder(element, eventName, func, selector);
		},
		/**
		 * Called if an controller's jQuery helper is called on an element that already has a controller instance
		 * of the same type.  Extends this.options with the options passed in.  If you overwrite this, you might want to call
		 * this._super.
		 * <h3>Examples</h3>
		 * @codestart
		 * $.Controller.extend("Thing",{
		 * init: function( el, options ) {
		 *    alert('init')
		 * },
		 * update: function( options ) {
		 *    this._super(options);
		 *    alert('update')
		 * }
		 * });
		 * $('#myel').thing(); // alerts init
		 * $('#myel').thing(); // alerts update
		 * @codeend
		 * @param {Object} options
		 */
		update: function( options ) {
			$.extend(this.options, options);
		},
		/**
		 * Destroy unbinds and undelegates all actions on this controller, and prevents any memory leaks.  This is called automatically
		 * if the element is removed.
		 * 
		 */
		destroy: function( ev ) {
			if ( this._destroyed ) {
				throw this.Class.shortName + " controller instance has been deleted";
			}
			var self = this,
				fname = this.Class._fullName;
			this._destroyed = true;
			this.element.removeClass(fname);

			$.each(this._bindings, function( key, value ) {
				if ( $.isFunction(value) ) {
					value(self.element[0]);
				}
			});

			delete this._actions;


			var controllers = this.element.data("controllers");
			if ( controllers && controllers[fname] ) {
				delete controllers[fname];
			}
			$(this).triggerHandler("destroyed"); //in case we want to know if the controller is removed
			this.element = null;
		},
		/**
		 * Queries from the controller's element.
		 * @codestart
		 * ".destroy_all click" : function() {
		 *    this.find(".todos").remove();
		 * }
		 * @codeend
		 * @param {String} selector selection string
		 * @return {jQuery.fn} returns the matched elements
		 */
		find: function( selector ) {
			return this.element.find(selector);
		},
		//tells callback to set called on this.  I hate this.
		_set_called: true
	});


	//------------- PROCESSSORS -----------------------------
	//processors do the binding.  They return a function that
	//unbinds when called.
	//the basic processor that binds events
	basicProcessor = function( el, event, selector, cb, controller ) {
		var c = controller.Class;

		// document controllers use their name as an ID prefix.
		if ( c.onDocument && !/^Main(Controller)?$/.test(c.shortName) ) { //prepend underscore name if necessary
			selector = selector ? "#" + c._shortName + " " + selector : "#" + c._shortName;
		}
		return binder(el, event, shifter(cb), selector);
	};

	var processors = $.Controller.processors,

		//a window event only happens on the window
		windowEvent = function( el, event, selector, cb ) {
			return binder(window, event.replace(/window/, ""), shifter(cb));
		};

	//set commong events to be processed as a basicProcessor
	$.each("change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset windowresize resize windowscroll scroll select submit dblclick focusin focusout load unload ready hashchange mouseenter mouseleave".split(" "), function( i, v ) {
		processors[v] = basicProcessor;
	});
	$.each(["windowresize", "windowscroll", "load", "ready", "unload", "hashchange"], function( i, v ) {
		processors[v] = windowEvent;
	});
	//the ready processor happens on the document
	processors.ready = function( el, event, selector, cb ) {
		$(shifter(cb)); //cant really unbind
	};
	/**
	 *  @add jQuery.fn
	 */

	$.fn.mixin = function() {
		//create a bunch of controllers
		var controllers = $.makeArray(arguments),
			forLint;
		return this.each(function() {
			for ( var i = 0; i < controllers.length; i++ ) {
				forLint = new controllers[i](this);
			}

		});
	};
	//used to determine if a controller instance is one of controllers
	//controllers can be strings or classes
	var isAControllerOf = function( instance, controllers ) {
		for ( var i = 0; i < controllers.length; i++ ) {
			if ( typeof controllers[i] == 'string' ? instance.Class._shortName == controllers[i] : instance instanceof controllers[i] ) {
				return true;
			}
		}
		return false;
	};

	/**
	 * @function controllers
	 * Gets all controllers in the jQuery element.
	 * @return {Array} an array of controller instances.
	 */
	$.fn.controllers = function() {
		var controllerNames = $.makeArray(arguments),
			instances = [],
			controllers;
		//check if arguments
		this.each(function() {
			controllers = $.data(this, "controllers");
			if (!controllers ) {
				return;
			}
			for ( var cname in controllers ) {
				var c = controllers[cname];
				if (!controllerNames.length || isAControllerOf(c, controllerNames) ) {
					instances.push(c);
				}
			}
		});
		return instances;
	};
	/**
	 * @function controller
	 * Gets a controller in the jQuery element.  With no arguments, returns the first one found.
	 * @param {Object} controller (optional) if exists, the first controller instance with this class type will be returned.
	 * @return {jQuery.Controller} the first controller.
	 */
	$.fn.controller = function( controller ) {
		return this.controllers.apply(this, arguments)[0];
	};

})(jQuery)