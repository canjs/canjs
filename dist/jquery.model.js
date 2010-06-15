// jquery/class/class.js

(function($){


	// if we are initializing a new class
var initializing = false, 
	
	// tests if we can get super in .toString()
	fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,
  	
	// overwrites an object with methods, sets up _super
	inheritProps = function(newProps, oldProps, addTo){
		addTo = addTo || newProps
		for(var name in newProps) {
		  // Check if we're overwriting an existing function
		  addTo[name] = typeof newProps[name] == "function" &&
			typeof oldProps[name] == "function" && fnTest.test(newProps[name]) ?
			(function(name, fn){
			  return function() {
				var tmp = this._super, ret;
			   
				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = oldProps[name];
			   
				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				ret = fn.apply(this, arguments);       
				this._super = tmp;
				return ret;
			  };
			})(name, newProps[name]) :
			newProps[name];
		}
	};


/**
* @constructor jQuery.Class
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
*   init: function(name){
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
*   eat : function( smallChildren ){
*     this.health += smallChildren;
*   },
*   fight : function(){
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
*   eat : function(smallChildren){
*     this._super(smallChildren / 2);
*   },
*   fight : function(){
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
*     staticMethod : function(){ return 1;}
* },{})
* 
* First.extend("Second",{
*     staticMethod : function(){ return this._super()+1;}
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
*   setup: function(){} //static setup
*   init: function(){} //static constructor
* },
* {
*   setup: function(){} //prototype setup
*   init: function(){} //prototype constructor
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
*   setup : function(el, options){
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
* as their preceding setup function.  The following
* 
* </p>
*
* 
* <p>The prototype constructor is called whenever a new instance of the class is created.
* </p>
* <h2>Demo</h2>
* @demo jquery/class/class.html
* 
* @init Creating a new instance of an object that has extended jQuery.Class 
*     calls the init prototype function and returns a new instance of the class.
* 
*/

jQuery.Class = function(){ 
	if(arguments.length) this.extend.apply(this, arguments)
};

/* @Static*/
$.extend($.Class,{
	/**
	* @function callback
	* Returns a callback function for a function on this Class.
	* The callback function ensures that 'this' is set appropriately.  
	* @codestart
	* $.Class.extend("MyClass",{
	*     getData : function(){
	*         this.showing = null;
	*         $.get("data.json",this.callback('gotData'),'json')
	*     },
	*     gotData : function(data){
	*         this.showing = data;
	*     }
	* },{});
	* MyClass.showData();
	* @codeend
	* <h2>Currying Arguments</h2>
	* Additional arguments to callback will fill in arguments on the returning function.
	* @codestart
	* $.Class.extend("MyClass",{
	*    getData : function(<b>callback</b>){
	*      $.get("data.json",this.callback('process',<b>callback</b>),'json');
	*    },
	*    process : function(<b>callback</b>, jsonData){ //callback is added as first argument
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
	*    getData : function(callback){
	*      //calls process, then callback with value from process
	*      $.get("data.json",this.callback(['process2',callback]),'json') 
	*    },
	*    process2 : function(type,jsonData){
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
	callback: function(funcs){
			
		//args that should be curried
		var args = jQuery.makeArray(arguments), 
			self;
			
		funcs = args.shift();
		
		if( !jQuery.isArray(funcs) ) {
			funcs = [funcs];
		}
	
		self = this;
		return function(){
			var cur = args.concat(jQuery.makeArray(arguments)), 
				isString, 
				length = funcs.length,
				f =0, 
				func;
			
			for(; f < length; f++ ) {
				if( !funcs[f] ) {
					continue;
				}
				func = funcs[f];
				isString = typeof func == "string";
				if( isString && self._set_called ) {
					self.called = func;
				}
				cur = ( isString ? self[func] : func ).apply(self, cur || []);
				if( f < length- 1 ){
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
	getObject: function(objectName, current){
		var current = current || window,
			parts = objectName  ? objectName.split(/\./) :[],
			i=0;
		for(; i < parts.length; i++){
			current = current[parts[i]] || ( current[parts[i]] = {} )
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
	 */
	newInstance: function(){
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
	setup: function(oldClass, fullName){
		this.defaults = $.extend(true, {}, oldClass.defaults, this.defaults);
		return arguments;
	},
	rawInstance: function(){
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
	extend: function(fullName, klass, proto) {
		// figure out what was passed
		if(typeof fullName != 'string'){
			proto = klass;
			klass = fullName;
			fullName = null;
		}
		if(!proto){
			proto = klass;
			klass = null;
		}
		
		proto = proto || {};
		var _super_class = this,
			_super = this.prototype,
			name,
			shortName, 
			namespace,
			prototype;
			
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
			if(initializing) return;
			
			if(this.constructor !== Class && arguments.length){  //we are being called w/o new
				return this.extend.apply(this, arguments)
			} else {												//we are being called w/ new
				return this.Class.newInstance.apply(this.Class,arguments)
			}
		}
		// Copy old stuff onto class
		for(name in this){
			if(this.hasOwnProperty(name) && 
				$.inArray(name,['prototype','defaults','getObject']) == -1){
				Class[name] = this[name];
			}
		}
		
		// do static inheritence
		inheritProps(klass, this, Class);
		
		// do namespace stuff
		if (fullName) {
			
			var parts = fullName.split(/\./),
				shortName =  parts.pop();
				current = $.Class.getObject(parts.join('.')),
				namespace = current;

			
			
			current[shortName] = Class;
		}
		
		//set things that can't be overwritten
		$.extend(Class,{
			prototype: prototype,
			namespace: namespace,
			shortName: shortName,
			constructor: Class,
			fullName: fullName
		});
		
		//make sure our prototype looks nice
		Class.prototype.Class = Class.prototype.constructor =Class;


		/**
		 * @attribute fullName 
		 * The full name of the class, including namespace, provided for introspection purposes.
		 * @codestart
		 * $.Class.extend("MyOrg.MyClass",{},{})
		 * MyOrg.MyClass.shortName //-> 'MyClass'
		 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
		 * @codeend
		 */

		var args = Class.setup.apply(Class, [_super_class].concat( $.makeArray(arguments) ));
	
		if(Class.init) {
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
		 *    setup: function(val){
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
		 *    init: function(val){
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

// jquery/lang/lang.js

(function($){

	


// Several of the methods in this plugin use code adapated from Prototype
//  Prototype JavaScript framework, version 1.6.0.1
//  (c) 2005-2007 Sam Stephenson

jQuery.String = {};
jQuery.String.strip = function(string){
	return string.replace(/^\s+/, '').replace(/\s+$/, '');
};


jQuery.Function = {};
jQuery.Function.params = function(func){
	var ps = func.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(",");
	if( ps.length == 1 && !ps[0]) return [];
	for(var i = 0; i < ps.length; i++) ps[i] = jQuery.String.strip(ps[i]);
	return ps;
};

/**
 * @class jQuery.Native
 */
jQuery.Native ={};
jQuery.Native.
/**
 * 
 * @param {Object} class_name
 * @param {Object} source
 */
extend = function(class_name, source){
	if(!jQuery[class_name]) jQuery[class_name] = {};
	var dest = jQuery[class_name];
	for (var property in source){
		dest[property] = source[property];
	}
};


/* 
 * @class jQuery.String
 * When not in no-conflict mode, JMVC adds the following helpers to string
 */
jQuery.Native.extend('String', 
/* @Static*/
{
    /*
     * Capitalizes a string
     * @param {String} s the string to be lowercased.
     * @return {String} a string with the first character capitalized, and everything else lowercased
     */
	capitalize : function(s, cache) {
		return s.charAt(0).toUpperCase()+s.substr(1);
	},
    /**
     * Returns if a string has another string inside it.
     * @param {String} string String that is being scanned
     * @param {String} pattern String that we are looking for
     * @return {Boolean} true if the string has pattern, false if otherwise
     */
	include : function(s, pattern){
		return s.indexOf(pattern) > -1;
	},
    /**
     * Returns if string ends with another string
     * @param {String} s String that is being scanned
     * @param {String} pattern What the string might end with
     * @return {Boolean} true if the string ends wtih pattern, false if otherwise
     */
	endsWith : function(s, pattern) {
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
	camelize: function(s){
		var parts = s.split(/_|-/);
		parts[0] = parts[0].charAt(0).toLowerCase()+parts[0].substr(1);
		for(var i = 1; i < parts.length; i++)
			parts[i] = jQuery.String.capitalize(parts[i]);
		return parts.join('');
	},
    /**
     * Like camelize, but the first part is also capitalized
     * @param {String} s
     * @return {String}
     */
	classize: function(s){
		var parts = s.split(/_|-/);
		for(var i = 0; i < parts.length; i++)
			parts[i] = jQuery.String.capitalize(parts[i]);
		return parts.join('');
	},
    /**
     * Like [jQuery.Native.String.static.classize|classize], but a space separates each 'word'
     * @codestart
     * jQuery.String.niceName("one_two") //-> "One Two"
     * @codeend
     * @param {String} s
     * @return {String}
     */
	niceName: function(s){
		var parts = s.split(/_|-/);
		for(var i = 0; i < parts.length; i++)
			parts[i] = jQuery.String.capitalize(parts[i]);
		return parts.join(' ');
	},
    /*
     * @function strip
     * @param {String} s returns a string with leading and trailing whitespace removed.
     */
	strip : jQuery.String.strip,
    regexps : {
        colons : /::/,
        words: /([A-Z]+)([A-Z][a-z])/g,
        lowerUpper : /([a-z\d])([A-Z])/g,
        dash : /([a-z\d])([A-Z])/g
    },
    underscore : function(s){
        var regs = jQuery.String.regexps;
        return s.replace(regs.colons, '/').
                 replace(regs.words,'$1_$2').
                 replace(regs.lowerUpper,'$1_$2').
                 replace(regs.dash,'_').toLowerCase()
    }
});

//Date Helpers, probably should be moved into its own class

/* 
 * @class jQuery.Array
 * When not in no-conflict mode, JMVC adds the following helpers to array
 */
jQuery.Native.extend('Array',
/* @static*/
{ 
	/**
	 * Searchs an array for item.  Returns if item is in it.
	 * @param {Object} array
	 * @param {Object} item an item that is matched with ==
	 * @return {Boolean}
	 */
    include: function(a, item){
		for(var i=0; i< a.length; i++){
			if(a[i] == item) return true;
		}
		return false;
	}
});



/* 
 * @class jQuery.Function
 * When not in no-conflict mode, JMVC adds the following helpers to function
 */
jQuery.Native.extend('Function', 
/* @static*/
{
	/**
	 * Binds a function to another object.  The object the function is binding
	 * to is the second argument.  Additional params are added to the callback function.
	 * @codestart
	 * //basic example
	 * var callback1 = jQuery.Function.bind(function(){alert(this.library)}, {library: "include"});
	 * //shows with prepended args
	 * var callback2 = jQuery.Function.bind(
	 *     function(version, os){
	 *         alert(this.library+", "+version+", "+os);
	 *     },
	 *     {library: "include"},
	 *     "1.5")
	 * @codeend
	 * @param {Function} f The function that is being bound.
	 * @param {Object} obj The object you want to bind to.
	 * @return {Function} the wrapping function.
	 */
    bind: function(f, obj) {
	  var args = jQuery.makeArray(arguments);
	  args.shift();args.shift();
	  var __method = f, object = arguments[1];
	  return function() {
	    return __method.apply(object, args.concat(jQuery.makeArray(arguments) )  );
	  }
	},
	params: jQuery.Function.params
});




})(jQuery);

// steal/openajax/openajax.js

(function($){

// prevent re-definition of the OpenAjax object
if(!window["OpenAjax"]){
	/**
	 * @class OpenAjax
	 * Use OpenAjax.hub to publish and subscribe to messages.
	 */
    OpenAjax = new function(){
		var t = true;
		var f = false;
		var g = window;
		var ooh = "org.openajax.hub.";

		var h = {};
		this.hub = h;
		h.implementer = "http://openajax.org";
		h.implVersion = "1.0";
		h.specVersion = "1.0";
		h.implExtraData = {};
		var libs = {};
		h.libraries = libs;

		h.registerLibrary = function(prefix, nsURL, version, extra){
			libs[prefix] = {
				prefix: prefix,
				namespaceURI: nsURL,
				version: version,
				extraData: extra 
			};
			this.publish(ooh+"registerLibrary", libs[prefix]);
		}
		h.unregisterLibrary = function(prefix){
			this.publish(ooh+"unregisterLibrary", libs[prefix]);
			delete libs[prefix];
		}

		h._subscriptions = { c:{}, s:[] };
		h._cleanup = [];
		h._subIndex = 0;
		h._pubDepth = 0;

		h.subscribe = function(name, callback, scope, subscriberData, filter)			
		{
			if(!scope){
				scope = window;
			}
			var handle = name + "." + this._subIndex;
			var sub = { scope: scope, cb: callback, fcb: filter, data: subscriberData, sid: this._subIndex++, hdl: handle };
			var path = name.split(".");
	 		this._subscribe(this._subscriptions, path, 0, sub);
			return handle;
		}

		h.publish = function(name, message)		
		{
			var path = name.split(".");
			this._pubDepth++;
			this._publish(this._subscriptions, path, 0, name, message);
			this._pubDepth--;
			if((this._cleanup.length > 0) && (this._pubDepth == 0)) {
				for(var i = 0; i < this._cleanup.length; i++) 
					this.unsubscribe(this._cleanup[i].hdl);
				delete(this._cleanup);
				this._cleanup = [];
			}
		}

		h.unsubscribe = function(sub) 
		{
			var path = sub.split(".");
			var sid = path.pop();
			this._unsubscribe(this._subscriptions, path, 0, sid);
		}
		
		h._subscribe = function(tree, path, index, sub) 
		{
			var token = path[index];
			if(index == path.length) 	
				tree.s.push(sub);
			else { 
				if(typeof tree.c == "undefined")
					 tree.c = {};
				if(typeof tree.c[token] == "undefined") {
					tree.c[token] = { c: {}, s: [] }; 
					this._subscribe(tree.c[token], path, index + 1, sub);
				}
				else 
					this._subscribe( tree.c[token], path, index + 1, sub);
			}
		}

		h._publish = function(tree, path, index, name, msg, pcb, pcid) {
			if(typeof tree != "undefined") {
				var node;
				if(index == path.length) {
					node = tree;
				} else {
					this._publish(tree.c[path[index]], path, index + 1, name, msg, pcb, pcid);
					this._publish(tree.c["*"], path, index + 1, name, msg, pcb, pcid);			
					node = tree.c["**"];
				}
				if(typeof node != "undefined") {
					var callbacks = node.s;
					var max = callbacks.length;
					for(var i = 0; i < max; i++) {
						if(callbacks[i].cb) {
							var sc = callbacks[i].scope;
							var cb = callbacks[i].cb;
							var fcb = callbacks[i].fcb;
							var d = callbacks[i].data;
							var sid = callbacks[i].sid;
							var scid = callbacks[i].cid;
							if(typeof cb == "string"){
								// get a function object
								cb = sc[cb];
							}
							if(typeof fcb == "string"){
								// get a function object
								fcb = sc[fcb];
							}
							if((!fcb) || (fcb.call(sc, name, msg, d))) {
							  if((!pcb) || (pcb(name, msg, pcid, scid))) {
								  cb.call(sc, name, msg, d, sid);
							  }
							}
						}
					}
				}
			}
		}
			
		h._unsubscribe = function(tree, path, index, sid) {
			if(typeof tree != "undefined") {
				if(index < path.length) {
					var childNode = tree.c[path[index]];
					this._unsubscribe(childNode, path, index + 1, sid);
					if(childNode.s.length == 0) {
						for(var x in childNode.c) 
					 		return;		
						delete tree.c[path[index]];	
					}
					return;
				}
				else {
					var callbacks = tree.s;
					var max = callbacks.length;
					for(var i = 0; i < max; i++) 
						if(sid == callbacks[i].sid) {
							if(this._pubDepth > 0) {
								callbacks[i].cb = null;	
								this._cleanup.push(callbacks[i]);						
							}
							else
								callbacks.splice(i, 1);
							return; 	
						}
				}
			}
		}
		// The following function is provided for automatic testing purposes.
		// It is not expected to be deployed in run-time OpenAjax Hub implementations.
		h.reinit = function()
		{
			for (var lib in OpenAjax.hub.libraries) {
				delete OpenAjax.hub.libraries[lib];
			}
			OpenAjax.hub.registerLibrary("OpenAjax", "http://openajax.org/hub", "1.0", {});

			delete OpenAjax._subscriptions;
			OpenAjax._subscriptions = {c:{},s:[]};
			delete OpenAjax._cleanup;
			OpenAjax._cleanup = [];
			OpenAjax._subIndex = 0;
			OpenAjax._pubDepth = 0;
		}
	};
	// Register the OpenAjax Hub itself as a library.
	OpenAjax.hub.registerLibrary("OpenAjax", "http://openajax.org/hub", "1.0", {});

}
OpenAjax.hub.registerLibrary("JavaScriptMVC", "http://JavaScriptMVC.com", "1.5", {});

})(jQuery);

// jquery/model/model.js

(function($){

//a cache for attribute capitalization ... slowest part of inti.
var capitalize = $.String.capitalize;

/**
 * @tag core
 * Models wrap an application's data layer.  In large applications, a model is critical for:
 * <ul>
 * 	<li>Abstracting service dependencies inside the model, making it so
 *      Controllers + Views don't care where data comes from.</li>
 *  <li>Providing helper functions that make manipulating and abstracting raw service data much easier.</li>
 * </ul>
 * This is done in two ways:
 * <ul>
 *     <li>Requesting data from and <span class='highlight'>interacting with services</span></li>
 *     <li><span class='highlight'>Wraping service data</span> with a domain-specific representation</li>
 * </ul>
 * 
 * <h2>Using Models</h2>
 * 
 * The [jQuery.Model] class provides basic functionality you need to organize your application's data layer.
 * First, let's consider doing Ajax <b>without</b> a model.  In our imaginary app, you:
 * <ul>
 *   <li>retrieve a list of tasks</li>
 *   <li>display the number of days remaining for each task</li>
 *   <li>mark tasks as complete after users click them</li>
 * </ul>
 * Let's see how that might look without a model:
@codestart
$.Controller.extend("TasksController",{onDocument: true},
{
  load : function(){
    $.get('/tasks.json', this.callback('gotTasks'), 'json')
  },
*  /* 
*   * assume json is an array like [{name: "trash", due_date: 1247111409283}, ...]
*   *|
  gotTasks : function(json){ 
    for(var i =0; i < json.length; i++){
      var taskJson = json[i];
      //calculate time remaining
      var time_remaining = new Date() - new Date(taskJson.due_date);
      //append some html
      this.element.append("&lt;div class='task' taskid='"+taskJson.id+"'>"+
	                     "&lt;label>"+taskJson.name+"&lt;/label>"+
	                     "Due Date = "+time_remaining+"&lt;/div>")
	}
  },
  click : function(el){
    $.post('/task_complete',{id: el.attr('taskid')}, function(){
      el.remove();
    })
  }
})
@codeend
This code might seem fine for right now, but what if:
<ul>
	<li>The service changes?</li>
	<li>You want to use the remaining time for other uses?</li>
	<li>Multiple elements have the same data?</li>
</ul>
The solution is of course a strong model layer.  Lets look at what a
a good model does for a controller before we learn how to make one.  I've highlighted
some of the key functionality we need to build:
@codestart
$.Controller.extend("TasksController",{onDocument: true},
{
	load : function(){
	  <b>Task.findAll</b>({},this.callback('list'))
	},
	list : function(tasks){
	  this.render({data: {tasks: tasks}});
	},
	click : function(el){
        <b>el.models</b>()[0].<b>complete</b>(function(){
          el.remove();
      });
	}
})
@codeend
In views/tasks/list.ejs
@codestart html
&lt;% for(var i =0; i &lt; tasks.length; i++){ %>
&lt;div class='task &lt;%= tasks[i].<b>identity</b>() %>'>
   &lt;label>&lt;%= tasks[i].name %>&lt;/label>
   &lt;%= tasks[i].<b>timeRemaining</b>() %>
&lt;/div>
&lt;% } %>
@codeend

Isn't that better!  Granted, some of the improvement comes because we used a view, but we've
also made our controller completely understandable.  Now lets take a look at the model:
@codestart
$.Model.extend("Task",
{
    findAll : function(params,success){
        $.get("/tasks.json", params, this.callback(["wrapMany",success]),"json");
    }
},
{
    timeRemaining : function(){
        return new Date() - new Date(this.due_date)
    },
    complete : function(success){
        $.get("/task_complete", {id: this.id }, success,"json");
    }
})
@codeend
There, much better!  Now you have a single place where you can organize Ajax functionality and
wrap the data that it returned.  Lets go through each bolded item in the controller and view.<br/>

<h3>Task.findAll</h3>
The findAll function requests data from "/tasks.json".  When the data is returned, it it is run through
the "wrapMany" function before being passed to the success callback.<br/>
If you don't understand how the callback works, you might want to check out 
[jQuery.Model.static.wrapMany wrapMany] and [jQuery.Class.static.callback callback].
<h3>el.models</h3>
[jQuery.fn.models models] is a jQuery helper that returns model instances.  It uses
the jQuery's elements' shortNames to find matching model instances.  For example:
@codestart html
&lt;div class='task task_5'> ... &lt;/div>
@codeend
It knows to return a task with id = 5.
<h3>complete</h3>
This should be pretty obvious.
<h3>identity</h3>
[jQuery.Model.prototype.identity Identity] returns a unique identifier that [jQuery.fn.models] can use
to retrieve your model instance.
<h3>timeRemaining</h3>
timeRemaining is a good example of wrapping your model's raw data with more useful functionality.
<h2>Validations</h2>
You can validate your model's attributes with another plugin.  See [validation].
 */


jQuery.Class.extend("jQuery.Model",
/* @Static*/
{
	storeType: null,
	setup: function(){
		this.validations = [];
		this.attributes= {};  //list of all attributes ever given to this model
        this.defaultAttributes= this.defaultAttributes || {};   //list of attributes and values you want right away
        this.associations = {};
        if(this.fullName.substr(0,7) == "jQuery." ) return;
        this.underscoredName =  jQuery.String.underscore(this.fullName.replace(/\./g,"_"))
        jQuery.Model.models[this.underscoredName] = this;
		if(this.storeType)
			this.store = new this.storeType(this);
	},
	init : function(){},
    /**
     * Used to create an existing object from attributes
     * @param {Object} attributes
     * @return {Model} an instance of the model
     */
    wrap : function(attributes){
        
		if(!attributes) return null;
        if(attributes.attributes) 
			attributes = attributes.attributes; //in case rails 2.0
		if(this.singularName && attributes[this.singularName])
			attributes = attributes[this.singularName];
        var inst = new this(attributes);

		return inst;
    },
    /**
     * Creates many instances
     * @param {Array} instancesRawData an array of raw name - value pairs.
     * @return {Array} an array of instances of the model
     */
    wrapMany : function(instances){
        if(!instances) return null;
        var res = [], raw = instances, isArray = $.isArray(instances), length, i=0;
		res._use_call = true; //so we don't call next function with all of these
        if(!isArray)
			raw = instances.data;
		length = raw.length;
		for(; i < length; i++){
			res.push( this.wrap(raw[i]) ); 
		}
		if (!isArray) { //push other stuff onto array
			for (var prop in instances) {
				if (instances.hasOwnProperty(prop) && prop !== 'data') 
					res[prop] = instances[prop];
			}
		}
		return res;
    },
    /**
     * The name of the id field.  Defaults to 'id'.  Change this if it is something different.
     */
    id : 'id', //if null, maybe treat as an array?
    /**
     * Adds an attribute to the list of attributes for this class.
     * @hide
     * @param {String} property
     * @param {String} type
     */
    addAttr : function(property, type){
        if(this.associations[property])
			return;
		if(! this.attributes[property])
            this.attributes[property] = type;
        if(! this.defaultAttributes[property])
            this.defaultAttributes[property] = null;
    },
    models : {},
    /**
     * Publishes to open ajax hub.  Always adds the shortName.event
     * @param {Object} event
     * @param {Object} data
     */
    publish : function(event, data){
        
		OpenAjax.hub.publish(   jQuery.String.underscore(this.shortName) + "."+event, data);
    },
    /**
     * Guesses at the type of an object.  This is useful when you want to know more than just typeof.
     * @param {Object} object the object you want to test.
     * @return {String} one of string, object, date, array, boolean, number, function
     */
   	guessType : function(object){
	    if(typeof object != 'string'){
	        if(object == null) return typeof object;
	        if( object.constructor == Date ) return 'date';
	        if(object.constructor == Array) return 'array';
	        return typeof object;
	    }
		if(object == "") return 'string';
	    //check if true or false
	    if(object == 'true' || object == 'false') return 'boolean';
	    if(!isNaN(object)) return 'number'
	    return typeof object;
	},
    /**
     * Implement this function!
     * Create is called by save to create a new instance.  If you want to be able to call save on an instance
     * you have to implement create.
     */
    create : function(attributes, success, error){
        throw "Implement Create"
    },
    /**
     * Implement this function!
     * Update is called by save to update an instance.  If you want to be able to call save on an instance
     * you have to implement update.
     */
    update : function(id, attributes, success, error){
        throw "JMVC--! You Must Implement "+this.fullName+"'s \"update\" Function !--"
    },
    /**
     * Implement this function!
     * Destroy is called by destroy to remove an instance.  If you want to be able to call destroy on an instance
     * you have to implement update.
     * @param {String|Number} id the id of the instance you want destroyed
     */
    destroy : function(id, success, error){
        throw "JMVC--! You Must Implement "+this.fullName+"'s \"destroy\" Function !--"
    },
	/**
	 * Turns a string into a date
	 * @param {String} str a string representation of a date
	 * @return {Date} a date
	 */
	_parseDate : function(str){
        if(typeof str == "string"){
            return Date.parse(str) == NaN ? null : Date.parse(str)
        }else
            return str

	}
},
/* @Prototype*/
{   
    /**
     * Creates, but does not save a new instance of this class
     * @param {Object} attributes a hash of attributes
     */
    init : function(attributes){
        //this._properties = [];
        this.attrs(this.Class.defaultAttributes || {});
        this.attrs(attributes);
        /**
         * @attribute errors
         * A hash of errors for this model instance.
         */
        this.errors = {};
    },
    /**
     * Sets the attributes on this instance and calls save.
     * @param {Object} attrs the model's attributes
     * @param {Function} success
     * @param {Function} error
     */
    update : function(attrs, success, error)
    {
        this.attrs(attrs);
        return this.save(success, error); //on success, we should 
    },
    valid : function() {
        for(var attr in this.errors)
            if(this.errors.hasOwnProperty(attr))
                return false;
        return true;
    },
   /**
    * Validates this model instance (usually called by [jQuery.Model.prototype.save|save])
    */
    validate : function(){
        this.errors = {};
        var self = this;
        if(this.Class.validations)
            jQuery.each(this.Class.validations, function(i, func) { func.call(self) });
    },
    /**
     * Gets or sets an attribute on the model.
     * @param {String} attribute the attribute you want to set or get
     * @param {String_Number_Boolean} [opt1] value the value you want to set.
     */
    attr : function(attribute, value) {
        var cap = capitalize(attribute),
			get = "get"+cap;
        if(value !== undefined)
            this._setProperty(attribute, value, cap);
		return this[get]? this[get]() : this[attribute];
    },
    /**
     * Checks if there is a set_<i>property</i> value.  If it returns true, lets it handle; otherwise
     * saves it.
     * @hide
     * @param {Object} property
     * @param {Object} value
     */
    _setProperty : function(property, value, capitalized) {
		var funcName = "set"+capitalized;
        if(this[funcName] && ! (value = this[funcName](value)) ) return;
		
        //add to cache, this should probably check that the id isn't changing.  If it does, should update the cache
        var old = this[property], type = this.Class.attributes[property];
		if(!type){
			type =  this.Class.guessType(value);
			this.Class.addAttr(property, type  );
		}
		if (value == null) 
			this[property] = null;
		else {
			switch (type) {
				case "date":
					this[property] = this.Class._parseDate(value);
					break;
				case "number":
					this[property] = parseFloat(value);
					break;
				case "boolean":
					this[property] = Boolean(value);
					break;
				default:
					this[property] = value
			}
		}
        
        if(property == this.Class.id && this[property] && this.Class.store){
			if(this.Class.store){
				if(!old){
                	this.Class.store.create(this);
	            }else if(old != this[property]){
	                this.Class.store.destroy(old);
	                this.Class.store.create(this);
	            }
			}
            
        }
        //if (!(MVC.Array.steal(this._properties,property))) this._properties.push(property);  
        
       
    },
    /**
     * Gets or sets a list of attributes
     * @param {Object} [opt2] attributes if present, the list of attributes to send
     * @return {Object} the curent attributes of the model
     */
    attrs : function(attributes) {
        var key;
		if(!attributes){
            attributes = {};
            var cas = this.Class.attributes;
            for(key in cas){
                if(cas.hasOwnProperty(key) ) attributes[key] = this.attr(key);
            }
        }else{
            var idName = this.Class.id;
			for(key in attributes){ 
    			if(attributes.hasOwnProperty(key) && key != idName) 
    				this.attr(key, attributes[key]);
    		}
			if(idName in attributes){
				this.attr(idName, attributes[idName]);
			}
            
        }
        return attributes;
    },
    /**
     * Returns if the instance is a new object
     */
    isNew : function(){ return this[this.Class.id] == null; },
    /**
     * Saves the instance
     * @param {Function} [opt3] callbacks onComplete function or object of callbacks
     */
    save: function(success,error){
        var result;
        this.validate();
        if(!this.valid()) return false;
        result = this.isNew() ? 
            this.Class.create(this.attrs(), this.callback(['created', success]), error) : 
            this.Class.update(this[this.Class.id], this.attrs(), this.callback(['updated', success]), error);

        //this.is_new_record = this.Class.new_record_func;
        return true;
    },
	/**
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
    created : function(attrs){
        this.attrs(attrs)
        this.publish("created", this)
        return [this].concat($.makeArray(arguments));
    },
    updated : function(attrs){
        this.attrs(attrs)
		this.publish("updated", this)
        return [this].concat($.makeArray(arguments));
    },
    /**
     * Destroys the instance
     * @param {Function} [opt4] callback or object of callbacks
     */
    destroy : function(success, error){
        this.Class.destroy(this[this.Class.id], this.callback(["destroyed",success]), error);
    },
	/**
	 * Called after an instance is destroyed.  Publishes
	 * "shortName.destroyed"
	 */
    destroyed : function(){
        if(this.Class.store) this.Class.store.destroy(this[this.Class.id]);
        this.publish("destroyed",this)
        return [this];
    },
    _resetAttrs : function(attributes) {
        this._clear();
    },
    _clear : function() {
        var cas = this.Class.defaultAttributes;
        for(var attr in cas){
            if(cas.hasOwnProperty(attr) ) this[attr] = null;
        }
    },
    /**
     * Returns a unique identifier for the model instance.  For example:
     * @codestart
     * new Todo({id: 5}).identity() //-> 'todo_5'
     * @codeend
     * Typically this is used in an element's shortName property so you can find all elements
     * for a model with [jQuery.Model.prototype.elements elements].
     * @return {String}
     */
    identity : function(){
        return jQuery.String.underscore(this.Class.fullName.replace(/\./g,"_"))+'_'+(this.Class.escapeIdentity ? encodeURIComponent(this[this.Class.id]) : this[this.Class.id]);
    },
	/**
	 * Returns elements that represent this model instance.  For this to work, your element's should
	 * us the [jQuery.Model.prototype.identity identity] function in their class name.  Example:
	 * @codestart html
	 * <div class='todo <%= todo.identity() %>'> ... </div>
	 * @codeend
	 * This function should only rarely be used.  It breaks the architecture.
	 * @param {String|jQuery|element} context - 
	 */
    elements : function(context){
	  	return typeof context == "string" ? jQuery(context+" ."+this.identity()) : 
		 jQuery("."+this.identity(), context);
    },
    /**
     * Publishes to open ajax hub
     * @param {String} event
     * @param {Object} [opt6] data if missing, uses the instance in {data: this}
     */
    publish : function(event, data){
        this.Class.publish(event, data|| this);
    },
	hookup : function(el){
		var shortName = $.String.underscore(this.Class.shortName),
			$el = $(el).addClass(shortName).addClass(this.identity()),
			models  = $.data(el, "models") || $.data(el, "models", {});
		models[shortName] = this;
	}
});



/**
 *  @add jQuery.fn
 */
// break
/**
 * @function models
 * @param {jQuery.Model} model if present only returns models of the provided type.
 * @return {Array} returns an array of model instances that are represented by the contained elements.
 */
jQuery.fn.models = function(type){
  	//get it from the data
	
	var ret = []
    this.each(function(){
		var models = $.data(this,"models") || {};
		for(var name in models){
			//check type
			ret.push(models[name])
		}
    });
    return jQuery.unique( ret );
}
jQuery.fn.model = function(){
    return this.models.apply(this,arguments)[0];
}

})(jQuery);

