// jquery/class/class.js

(function($){

  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,
      callback = function(f_names){
		//process args
		var args = jQuery.makeArray(arguments), f, self;
        f_names = args.shift();
		if(!jQuery.isArray(f_names)) 
			f_names = [f_names];
		
		self = this;
		return function(){
			var cur = args.concat(jQuery.makeArray(arguments)), isString, length = f_names.length;
			for(f =0; f < length; f++){
                if(!f_names[f]) 
					continue;
                isString = typeof f_names[f] == "string";
                if(isString && self._set_called) 
					self.called = f_names[f];
                cur = (isString ? self[f_names[f]] : f_names[f]).apply(self, cur);
				if(f < length- 1){
					if(!cur){
						cur = [];
					}else if( !jQuery.isArray(cur) || cur._use_call) {
						cur = [cur]
					}
				}
			}
			return cur;
        }
    },
	newInstance = function(){
        initializing = true;
        var inst = new this();
        initializing = false;
		if ( inst.setup )
            inst.setup.apply(inst, arguments);
        if ( inst.init )
            inst.init.apply(inst, arguments);
        return inst;
    },
    rawInstance = function(){
        initializing = true;
        var inst = new this();
        initializing = false;
        return inst;
    },
    /**
     * Copy and overwrite options from old class
     * @param {Object} oldClass
     * @param {Object} options
     */
	setup = function(oldClass, options){
		//clone current args and add
        var oldOptions = oldClass.OPTIONS || {};
        var newOptions = jQuery.extend(true, {}, oldOptions, this.defaults, options);
        //for each newOption, write on class:
        this.OPTIONS = newOptions;
        /*for(var name in newOptions){
            this[name] = newOptions[name]
        }*/
        /*var args = [];
		var current = this.args || [];
		for(var i =0; i  < current.length; i++){
			args[i] = current[i];
		}
		for(var i =0; i  < arguments.length; i++){
			args.push(arguments[i])
		}
		this.ARGS = args;*/
	},
	toString = function(){
		return this.className || Object.prototype.toString.call(this)
	},
	id = 1,
    getObject = function(objectName, current){
        var current = current || window,
            parts = objectName.split(/\./)
        for(var i =0; i < parts.length; i++){
            current = current[parts[i]] || ( current[parts[i]] = {} )
        }
		return current;
    };
  // The base Class implementation (does nothing)
  
  /**
   * @constructor jQuery.Class
   * @plugin jquery/class
   * @tag core
   * Class provides simulated inheritance in JavaScript. 
   * It is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class] 
   * Inheritance library.  Besides prototypal inheritance, it adds a few important features:
   * <ul>
   *     <li>Static inheritance</li>
   *     <li>Introspection</li>
   *     <li>Ad-Hoc Polymorphism</li>
   *     <li>Easy callback function creation</li>
   * </ul>
   * <h2>Definitions</h2>
   * Classes have <b>static</b> and <b>prototype</b> properties and
   * methods:
   * @codestart
   * //STATIC
   * MyClass.staticProperty  //shared property
   * 
   * //PROTOTYPE
   * myclass = new MyClass()
   * myclass.prototypeMethod() //instance method
   * @codeend
   * 
   * <h2>Examples</h2>
   * <h3>Basic example</h3>
   * Creates a class with a shortName (for introspection), static, and prototype members:
   * @codestart
   * jQuery.Class.extend('Monster',
   * /* @static *|
   * {
   *   count: 0
   * },
   * /* @prototype *|
   * {
   *   init : function(name){
   *     this.name = name;
   *     this.Class.count++
   *   }
   * })
   * hydra = new Monster('hydra')
   * dragon = new Monster('dragon')
   * hydra.name        // -> hydra
   * Monster.count     // -> 2
   * Monster.shortName // -> 'Monster'
   * @codeend
   * Notice that the prototype init function is called when a new instance of Monster is created.
   * <h3>Static property inheritance</h3>
   * Demonstrates inheriting a class property.
   * @codestart
   * jQuery.Class.extend("First",
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
   * <h3 id='introspection'>Introspection</h3>
   * Often, it's nice to create classes whose name helps determine functionality.  Ruby on
   * Rails's [http://api.rubyonrails.org/classes/ActiveRecord/Base.html|ActiveRecord] ORM class 
   * is a great example of this.  Unfortunately, JavaScript doesn't have a way of determining
   * an object's name, so the developer must provide a name.  Class fixes this by taking a String name for the class.
   * @codestart
   * $.Class.extend("MyOrg.MyClass",{},{})
   * MyOrg.MyClass.shortName //-> 'MyClass'
   * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
   * @codeend
   * <h3>Construtors</h3>
   * Class uses static and class initialization constructor functions.  
   * @codestart
   * $.Class.extend("MyClass",
   * {
   *   init: function(){} //static constructor
   * },
   * {
   *   init: function(){} //prototype constructor
   * })
   * @codeend
   * <p>The static constructor is called after
   * a class has been created.  
   * This is a good place to add introspection and similar class setup code.</p>
   * 
   * <p>The prototype constructor is called whenever a new instance of the class is created.
   * </p>
   * 
   * 
   * <h3 id='ad-hoc'>Ad-Hoc Polymorphism</h3>
   * <p>Ad-Hoc Polymorphism allows you to create parameterized, temporary 
   *    classes.  This is a technique commonly used in Static languages where
   *    you might create map of Strings to Integers like:
   * @codestart text
   * Hash&lt;string, int> hash = new Hash&lt;string, int>()
   * @codeend
   * With Class, Ad-Hoc Polymorphism is used to configure Classs.
   * Here's a simplistic example:
   * @codestart
   * $.Class.extend("Request",
   * {
   *    init : function(url){
   *       $.getScript(this.Class.OPTIONS.domain+"/"+url)  
   *    }
   * });
   * var JMVCRequestor = Request({domain: "http://javascriptmvc.com"})
   * new JMVCRequestor("jmvc.js");
   * @codeend
   * Ad-Hoc techniques are used a lot with Controller to customize and
   * combine widgets.
   * 
   * @init Creating a new instance of an object that has extended jQuery.Class 
   *     calls the init prototype function and returns a new instance of the class.
   * 
   */
  
  jQuery.Class = 
  /* @Static*/
      function(){ 
          if(arguments.length) this.extend.apply(this, arguments)
      };
      
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
  jQuery.Class.callback = callback;
  
  
  jQuery.Class.
  
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
  getObject = getObject;
  
  // Create a new Class that inherits from the current class.
  
  jQuery.Class.
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
     * @param {String} [className]  the classes name (used for classes w/ introspection)
     * @param {Object} [klass]  the new classes static/class functions
     * @param {Object} [proto]  the new classes prototype functions
     * @return {jQuery.Class} returns the new class
     */
    extend = function(className, types, klass, proto) {
    if(typeof className != 'string'){
        proto = klass;
        klass = types;
		types = className;
        className = null;
    }
	if(!$.isArray(types)){
        proto = klass;
        klass = types;
    }
    if(!proto){
        proto = klass;
        klass = null;
    }
    
    
    
    proto = proto || {};
    var _super_class = this;
    var _super = this.prototype;
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    // Copy the properties over onto the new prototype
    for (var name in proto) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof proto[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(proto[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, proto[name]) :
        proto[name];
    }
	
	//calculate class properties once:
	var staticProps = {
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
		newInstance : newInstance,
		rawInstance : rawInstance,
		extend : arguments.callee,
		setup : setup
	};
	
	//copy properties from current class to static
    for(var name in this){
        if(this.hasOwnProperty(name) && 
            name != 'prototype'&& 
            name != 'OPTIONS' &&
            name != 'defaults' &&
            name != 'getObject'){
            staticProps[name] = this[name];
        }
    }
	//do inheritence
	for (var name in klass) {
      staticProps[name] = typeof klass[name] == "function" &&
        typeof staticProps[name] == "function" && fnTest.test(klass[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super_class[name];
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
            return ret;
          };
        })(name, klass[name]) :
        klass[name];
	};
	var shortName, fullName, namespace;
	
	if (className) {
	  	var current = window
        var parts = className.split(/\./)
        for(var i =0; i < parts.length-1; i++){
            current = current[parts[i]] || ( current[parts[i]] = {} )
        }
		namespace = current;
		shortName = parts[parts.length - 1];
		fullName = className;
	}
	
	var makeClass;
	makeClass= function(options){
		// The dummy class constructor
		function Class() {
	      // All construction is actually done in the init method
	      if(initializing) return;
		  
		  if(this.constructor !== Class && arguments.length){  //we are being called w/o new
		  	  return makeClass.apply(null, arguments)
		  } else {												//we are being called w/ new
		  	 //this.id = (++id);
			 if(this.setup) this.setup.apply(this, arguments);
			 if(this.init)  this.init.apply(this, arguments);
		  }
	    }
		// A buffer class to protect 'Global' prototype functions.  
		// Add to this for one-off specific functionality
		function Buffer(){};
		Buffer.prototype = prototype;
		var buff = new Buffer();
		
		// Populate with prototype object ... however, I change it!!
	    Class.prototype = buff; //need another version of this ...
	    
		// Add static methods
		for(var name in staticProps){
	        if(staticProps.hasOwnProperty(name) && 
              name != 'prototype' && 
              name != 'constructor'){
	            Class[name] = staticProps[name];
	        }
	    }
		
		//Provide a reference to this class
	    Class.prototype.Class = Class; //only changing buff prototype
		Class.prototype.constructor = Class; //only buff prototype
	    // Enforce the constructor to be what we expect
	    Class.constructor = Class;
	    //Class.id = (++id);
		
		
        Class.namespace = namespace;
        Class.shortName = shortName
        /**
         * @attribute fullName 
         * The full name of the class, including namespace, provided for introspection purposes.
         * @codestart
         * $.Class.extend("MyOrg.MyClass",{},{})
         * MyOrg.MyClass.className //-> 'MyClass'
         * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
         * @codeend
         */
        Class.fullName = fullName;
		
		
		Class.setup.apply(Class, [_super_class].concat( $.makeArray(arguments) ));

	    if(Class.init) Class.init(Class);

		return Class;
	}
	

	var initClass = makeClass();
	if(current && shortName)
		current[shortName] = initClass;
    
    /* @Prototype*/
    
	
	
	
	
	return initClass;
    /* @function init
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
     * Access to the static properties of the instance's class.
     * @codestart
     * $.Class.extend("MyClass", {classProperty : true}, {});
     * var mc2 = new MyClass();
     * mc.Class.classProperty = true;
     * var mc2 = new mc.Class(); //creates a new MyClass
     * @codeend
     */
  };
  
  
  jQuery.Class.prototype = {
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
      callback : callback
  }
  

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
		if(jQuery.conflict){
			window[class_name][property] = source[property];
			if(typeof source[property] == 'function'){
				var names = jQuery.Function.params(source[property]);
    			if( names.length == 0) continue;
				//var first_arg = names[0];
				//if( first_arg.match(class_name.substr(0,1).toLowerCase()  ) || (first_arg == 'func' && class_name == 'Function' )  ){
					jQuery.Native.set_prototype(class_name, property, source[property]);
				//}
			}
		}
	}
};
jQuery.Native.set_prototype = function(class_name, property_name, func){
	if(!func) func = jQuery[class_name][property_name];
    window[class_name].prototype[property_name] = function(){
		var args = [this];
		for (var i = 0, length = arguments.length; i < length; i++) args.push(arguments[i]);
		return func.apply(this,args  );
	};
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
jQuery.Array.
    /**
     * Creates an array from another object.  Typically, this is used to give arguments array like properties.
     * @param {Object} iterable an array like object with a length property.
     * @return {Array}
     */
	from= function(iterable){
		 if (!iterable) return [];
		var results = [];
	    for (var i = 0, length = iterable.length; i < length; i++)
	      results.push(iterable[i]);
	    return results;
	}
jQuery.Array.
    /**
     * Returns if the object is an array
     * @param {Object} array a possible array object
     * @return {Boolean}
     */
    is = function(array){
        return Object.prototype.toString.call(a) === '[object Array]';
    }

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
	  var args = jQuery.Array.from(arguments);
	  args.shift();args.shift();
	  var __method = f, object = arguments[1];
	  return function() {
	    return __method.apply(object, args.concat(jQuery.Array.from(arguments) )  );
	  }
	},
	params: jQuery.Function.params
});
/* 
 * @class jQuery.Number
 * When not in no-conflict mode, JMVC adds the following helpers to number
 */
jQuery.Native.extend('Number', 
/* @static*/
{
    /**
     * Changes a number to a string, but includes preceeding zeros.
     * @param {Object} number the number to be converted
     * @param {Object} length the number of zeros
     * @param {Object} [optional] radix the numeric base (defaults to base 10);
     * @return {String} 
     */
    to_padded_string: function(n, len, radix) {
        var string = n.toString(radix || 10);
        var ret = '', needed = len - string.length;
        
        for(var i = 0 ; i < needed; i++) 
            ret += '0';
        return ret + string;
    }
})



})(jQuery);

// jquery/event/destroyed/destroyed.js

(function($){

	$.event.special["destroyed"] = {
		remove: function( handleObj){
			//call the handler
			if(handleObj.removed) return;
			var event = jQuery.Event( "destroyed" );
			event.preventDefault();
			event.stopPropagation(); 
			handleObj.removed = true;
			handleObj.handler.call( this, event )
			
		},
		setup : function(handleObj){
			
		}
	}

})(jQuery);

// jquery/controller/controller.js

(function($){

//helpers
var bind = function(el, ev, callback){
	var wrappedCallback;
	if(ev.indexOf(">") == 0){
		ev = ev.substr(1);
		wrappedCallback = function(event){
			if(event.target === el)
				callback.apply(this, arguments)
		}
	}
	$(el).bind(ev, wrappedCallback || callback)
	// if ev name has >, change the name and bind
	// in the wrapped callback, check that the element matches the actual element
	return function(){
		$(el).unbind(ev, wrappedCallback || callback);
		el = ev = callback = wrappedCallback = null;
	}
}
var delegate = function(el, selector, ev, callback){
	$(el).delegate(selector, ev, callback)
	return function(){
		$(el).undelegate(selector, ev, callback);
		el = ev = callback = selector = null;
	}
}
//wraps 'this' and makes it the first argument
var shifter = function(cb){ 
	return function(){
		return cb.apply(null, [$(this)].concat(Array.prototype.slice.call(arguments, 0)))
	}
}
/**
 * @tag core
 * @plugin jquery/controllers
 * Controllers organize event handlers using event delegation. 
 * If something happens in your application (a user click or a [jQuery.Model|Model] instance being updated), 
 * a controller should respond to it. 
 * <h3>Benefits</h3>
 * <ul>
 *     <li><p><i>Know your code.</i></p>
 *     		Group events and label your html in repeatable ways so it's easy to find your code.</li>
 *     <li><p><i>Controllers are inheritable.</i></p>
 *         Package, inherit, and reuse your widgets.</li>
 *     <li><p><i>Write less.</i></p>
 *         Controllers take care of setup / teardown automatically.</li>
 * </ul>
 * <h3>Example</h3>
 * @codestart
//Instead of:
$(function(){
  $('#tabs').click(someCallbackFunction1)
  $('#tabs .tab').click(someCallbackFunction2)
  $('#tabs .delete click').click(someCallbackFunction3)
});

//do this
$.Controller.extend('Tabs',{
  click: function(){...},
  '.tab click' : function(){...},
  '.delete click' : function(){...}
})
$('#tabs').tabs();
@codeend
 * <h2>Using Controllers</h2>
 * <p>A Controller is just a list of functions that get called back when the appropriate event happens.  
 * The name of the function provides a description of when the function should be called.  By naming your functions in the correct way,
 * Controller recognizes them as an <b>Action</b> and hook them up in the correct way.</p>
 * 
 * <p>The 'hook up' happens when you create a [jQuery.Controller.prototype.setup|new controller instance].</p>
 * 
 * <p>Lets look at a very basic example.  
 * Lets say you have a list of todos and a button you want to click to create more.
 * Your HTML might look like:</p>
@codestart html
&lt;div id='todos'>
	&lt;ol>
	  &lt;li class="todo">Laundry&lt;/li>
	  &lt;li class="todo">Dishes&lt;/li>
	  &lt;li class="todo">Walk Dog&lt;/li>
	&lt;/ol>
	&lt;a id="create_todo">Create&lt;/a>
&lt;/div>
@codeend
To add a mousover effect and create todos, your controller class might look like:
@codestart
$.Controller.extend('TodosController',{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  "#create_todo click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend
Now that you've created the controller class, you've got attach the event handlers on the '#todos' div by
creating [jQuery.Controller.prototype.init|a new controller instance].  There are 2 ways of doing this.
@codestart
//1. Create a new controller directly:
new TodosController($('#todos')[0]);
//2. Use jQuery function
$('#todos').todos_controller();
@codeend

As you've likely noticed, when the [jQuery.Controller.static.init|controller class is created], it creates helper
functions on [jQuery.fn]. The "#todos" element is known as the <b>delegated</b> element.

<h3>Action Types</h3>
<p>Controller uses actions to match function names and attach events.  
By default, Controller will match [jQuery.Controller.Action.Event|Event] and [jQuery.Controller.Action.Subscribe|Subscribe] actions. 
To match other actions, steal their plugins.</p>
<table>
	<tr>
		<th>Action</th><th>Events</th><th>Example</th><th>Description</th>
	</tr>
	<tbody  style="font-size: 11px;">
	<tr>
		<td>[jQuery.Controller.Action.Event Event]</td>
		<td>change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset 
			windowresize resize windowscroll scroll select submit dblclick focus blur load unload ready hashchange</td>
		<td>"a.destroy click"</td>
		<td>Matches standard DOM events</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Subscribe Subscribe]</td>
		<td>Any <a href="http://www.openajax.org/index.php">openajax</a> event</td>
		<td>"todos.*.create subscribe"</td>
		<td>Subscribes this action to OpenAjax hub.</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Drag Drag]</td>
		<td>draginit dragend dragmove</td>
		<td>".handle draginit"</td>
		<td>Matches events on a dragged object</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Drop Drop]</td>
		<td>dropover dropon dropout dropinit dropmove dropend</td>
		<td>".droparea dropon"</td>
		<td>Matches events on a droppable object</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Lasso Lasso]</td>
		<td>lassoinit lassoend lassomove</td>
		<td>"#lassoarea lassomove"</td>
		<td>Allows you to lasso elements.</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Selectable Selectable]</td>
		<td>selectover selected selectout selectinit selectmove selectend</td>
		<td>".selectable selected"</td>
		<td>Matches events on elements that can be selected by the lasso.</td>
	</tr>
	</tbody>
</table>

<h3>Callback Parameters</h3>
For most actions, the first two parameters are always:
<ul>
	<li>el - the jQuery wrapped element.</li>
	<li>ev - the jQuery wrapped DOM event.</li>
</ul>
@codestart
".something click" : function(el, ev){
   el.slideUp()
   ev.stopDelegation();  //stops this event from delegating to any other
						 // delegated events for this delegated element.
   ev.preventDefault();  //prevents the default action from happening.
   ev.stopPropagation(); //stops the event from going to other elements.
}
@codeend

If the action provides different parameters, they are in each action's documentation.


<h2>onDocument Controllers</h2>
<p>Sometimes, you want your controllers to delegate from the document or documentElement.  Typically this is
done in less complex applications where you know there will only be a single instance of the controller
on the page.</p>
<p>The advantage of onDocument Controllers is that they can be automatically attached to the document for you.</p>
To automatically attach to the document, add "onDocument: true" to your controller as follows:
@codestart
$.Controller.extend('TodosController',
{onDocument: true},
{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  "#create_todo click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend

 */
jQuery.Class.extend("jQuery.Controller",
/* @Static*/
{
	/**
	 * Does 2 things:
	 * <ol>
	 *     <li>Creates a jQuery helper for this controller</li>
	 *     <li> and attaches this element to the documentElement if onDocument is true</li>
	 * </ol>   
	 * <h3>jQuery Helper Naming Examples</h3>
	 * @codestart
	 * "TaskController" -> $().task_controller()
	 * "Controllers.Task" -> $().controllers_task()
	 * @codeend
	 */
	init : function(){
		if(!this.shortName  || this.fullName == "jQuery.Controller") return;
		this.underscoreFullName = $.String.underscore(this.fullName.replace(/\./g,'_').replace(/_?controllers?/i,""));
		this.underscoreShortName = $.String.underscore(this.shortName.replace(/\./g,'_').replace(/_?controllers?/i,""));
		this.underscoreControllerName = this.shortName.replace(/\./g,'_').replace(/_?controllers?/i,"");
		
		var val, act;
		//if(!this.modelName)
		//    this.modelName = jQuery.String.isSingular(this.underscoreName) ? this.underscoreName : jQuery.String.singularize(this.underscoreName)

		//if(steal.getPath().match(/(.*?)controllers/)){
		//    this._path = steal.getPath().match(/(.*?)controllers/)[1]+"controllers";
		//}else{
		//    this._path = steal.getPath()+"/"
		//}
		
		var controller = this;
		
		

		 
		 
		 var pluginname = this.underscoreFullName;
		 if(!jQuery.fn[pluginname]) {
			jQuery.fn[pluginname] = function(options){
				var args = $.makeArray(arguments), 
					isMethod = typeof options == "string" && typeof controller.prototype[options] == "function",
					meth = args[0],
					allCreated = true;;
				this.each(function(){
				//check if created
					var controllers = jQuery.data(this,"controllers"),
						plugin = controllers && controllers[pluginname];
					
					
					if(plugin){
						if(isMethod)
							plugin[meth].apply(plugin, args.slice(1))
						else if(plugin.update)
							plugin.update.apply(plugin, args)
					}else{
						allCreated = false;
						controller.newInstance.apply(controller, [this].concat(args))
					}
				})
				return this;
			}
			
		 }
		
		//calculate actions
		this.actions = {};
		var convertedName, act, parts, c = this, replacer = /\{([^\}]+)\}/g, b = c.breaker, funcName;
		for (funcName in this.prototype) {
			if(funcName == "constructor") continue;
			convertedName = funcName.replace(replacer, function(whole, inside){
				//convert inside to type
				return jQuery.Class.getObject(inside, c.OPTIONS).toString()
			})
			parts = convertedName.match( b)
			act = parts && ( c.processors[parts[2]] || ($.inArray(parts[2], c.listensTo ) > -1 && c.basicProcessor) || ( parts[1] && c.basicProcessor) );
			if(act){
				this.actions[funcName] = {action: act, parts: parts}
			}
		}
		
		/**
		 * @attribute onDocument
		 * Set to true if you want to automatically attach this element to the documentElement.
		 */
		if(this.onDocument)
			new this(document.documentElement);
		
		this.hookup = function(el){
			return new c(el);
		}
	},
	breaker : /^(?:(.*?)\s)?([\w\.\:>]+)$/,
	listensTo : []//

	//actions : [] //list of action types
},
/* @Prototype */
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
	setup: function(element, options){
		var funcName, convertedName, func, a, act, c = this.Class, b = c.breaker, cb;
		element = element.jquery ? element[0] : element;
		//needs to go through prototype, and attach events to this instance
		this.element = jQuery(element).addClass(this.Class.underscoreFullName );
		
		//$.data(element,this.Class.underscoreFullName, this)
		( jQuery.data(element,"controllers") || jQuery.data(element,"controllers",{}) )[this.Class.underscoreFullName] = this;
		
		this._bindings = [];
		for(funcName in c.actions){
			var ready = c.actions[funcName]
			cb = this.callback(funcName)
			this._bindings.push( ready.action(element, ready.parts[2], ready.parts[1], cb, this) )
		}
		 

		/**
		 * @attribute called
		 * String name of current function being called on controller instance.  This is 
		 * used for picking the right view in render.
		 * @hide
		 */
		this.called = "init";
		/**
		 * @attribute options
		 * Options is automatically merged from this.Class.OPTIONS and the 2nd argument
		 * passed to a controller.
		 */
		this.options = $.extend( $.extend(true,{}, this.Class.OPTIONS  ), options)
		//setup to be destroyed ... don't bind b/c we don't want to remove it
		this.element.bind('destroyed', this.callback('destroy'))
		//this.bind('destroyed', 'destroy')
		/**
		 * @attribute element
		 * The controller instance's delegated element.  This is set by [jQuery.Controller.prototype.init init].
		 * It is a jQuery wrapped element.
		 * @codestart
		 * ".something click" : function(){
		 *    this.element.css("color","red")
		 * }
		 * @codeend
		 */
		return this.element;
	},
	/**
	 * Bind attaches event handlers that will be released whent he widget is destroyed.
	 * <br/>
	 * Examples:
	 * @codestart
	 * // calls somethingClicked(el,ev)
	 * this.bind('click','somethingClicked') 
	 * 
	 * // calls function when the window si clicked
	 * this.bind(window, 'click', function(){
	 *   //do something
	 * })
	 * @codeend
	 * @param {HTMLElement} [el=this.element] 
	 * @param {String} eventName
	 * @param {Function_String} func A callback function or the name of a function on "this".
	 * @return {Integer} The id of the binding in this._bindings
	 */
	bind : function(el, eventName, func){
		if(typeof el == 'string'){
			func = eventName;
			eventName = el;
			el = this.element
		}
		if(typeof func == 'string'){
			func = shifter(this.callback(func))
		}
		this._bindings.push( bind(el, eventName, func ) )
		return this._bindings.length;
	},
	delegate : function(el, selector, eventName, func){
		if(typeof el == 'string'){
			func = eventName;
			eventName = selector;
			selector = el
			el = this.element
		}
		if(typeof func == 'string'){
			func = shifter(this.callback(func))
		}
		this._bindings.push( delegate(el,selector, eventName, func ) )
		return this._bindings.length;
	},
	update : function(options){
		$.extend(this.options, options)
	},
	/**
	 * Removes all actions on this instance.
	 */
	destroy: function(){
		if(this._destroyed) throw this.Class.shortName+" controller instance has already been deleted";
		this.element.removeClass(this.Class.underscoreFullName );
		var self = this;
		jQuery.each(this._bindings, function(key, value){
			if(typeof value == "function") value(self.element[0]);
		});
		
		delete this._actions;
		this._destroyed = true;
		//clear element

		var controllers = this.element.data("controllers");
		if(controllers && controllers[this.Class.underscoreFullName])
			delete controllers[this.Class.underscoreFullName];
		
		this.element = null;
	},
	/**
	 * Queries from the controller's delegated element.
	 * @codestart
	 * ".destroy_all click" : function(){
	 *    this.find(".todos").remove();
	 * }
	 * @codeend
	 * @param {String} selector selection string
	 */
	find: function(selector){
		return this.element.find(selector);
	},
	/**
	 * Publishes a message to OpenAjax.hub.
	 * @param {String} message Message name, ex: "Something.Happened".
	 * @param {Object} data The data sent.
	 */
	publish: function(){
		OpenAjax.hub.publish.apply(OpenAjax.hub, arguments);
	},
	//tells callback to set called on this.  I hate this.
	_set_called : true,
	init : function(){}
});


//lets add the processors :


jQuery.Controller.processors = {};
var basic = (jQuery.Controller.basicProcessor =function(el, event, selector, cb, controller){
	if(controller.onDocument && controller.shortName !== "Main"){ //prepend underscore name if necessary
		selector = selector ? controller.underscoreShortName +" "+selector : controller.underscoreShortName
	}
	if(selector){
		return delegate(el, selector, event, shifter(cb))
	}else{
		return bind(el, event, shifter(cb))
	}
})
jQuery.each(["change","click","contextmenu","dblclick","keydown","keyup","keypress","mousedown","mousemove","mouseout","mouseover","mouseup","reset","windowresize","resize","windowscroll","scroll","select","submit","dblclick","focusin","focusout","load","unload","ready","hashchange","mouseenter","mouseleave"], function(i ,v){
	jQuery.Controller.processors[v] = basic;
})
var windowEvent = function(el, event, selector, cb){
	var func = function(){ return cb.apply(null, [jQuery(this)].concat( Array.prototype.slice.call(arguments, 0) )) }
	jQuery(window).bind(event.replace(/window/,""), func);
	return function(){
	    jQuery(window).unbind(event.replace(/window/,""), func);
	}
}

jQuery.each(["windowresize","windowscroll","load"], function(i ,v){
	jQuery.Controller.processors[v] = windowEvent;
})


$.fn.mixin = function(){
	//create a bunch of controllers
	var controllers = $.makeArray(arguments);
	return this.each(function(){
		for(var i = 0 ; i < controllers.length; i++){
			new controllers[i](this)
		}
		
	})
}
jQuery.fn.controllers = function(){
    var controllerNames = jQuery.Array.from(arguments), 
	   instances = [], 
	   controllers, 
	   cname;
    //check if arguments
	this.each(function(){
		controllers= jQuery.data(this, "controllers")
		if(!controllers) return;
		for(var cname in controllers){
			instances.push(controllers[cname])
		}
	})
	return instances;
};
jQuery.fn.controller = function(){
	return this.controllers.apply(this, arguments)[0];
};


})(jQuery);

