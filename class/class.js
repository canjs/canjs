//jQuery.Class 
// This is a modified version of John Resig's class
// It provides class level inheritence and callbacks.

steal.plugin("jquery").then(function($){

	//if we are initializing a new class
var initializing = false, 
	
	//tests if we can get super in .toString()
	fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,
  	

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
		this.defaults = $.extend(true, {},oldClass.defaults, this.defaults);
	},
	toString = function(){
		return this.className || Object.prototype.toString.call(this)
	},
	id = 1,
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
// The base Class implementation (does nothing)

/**
* @constructor jQuery.Class
* @plugin jquery/class
* @tag core
* @download dist/jquery/jquery.class.js
* Class provides simulated inheritance in JavaScript. 
* It is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class] 
* Inheritance library.  Besides prototypal inheritance, it adds a few important features:
* <ul>
*     <li>Static inheritance</li>
*     <li>Introspection</li>
*     <li>Easy callback function creation</li>
*     <li>Namespaces</li>
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
* <h2>Use</h2>
* <p>[jQuery.Controller] and [jQuery.Model] use $.Class to bridge the gap between
* jQuery's functional programming style and Object Oriented Programming. </p>
* <p>JavaScript's prototypal inheritence is extremely powerful, but limited
* in a few critical ways.  Class patches these problems but conforms to
* how constructor functions work in every way possible.
* </p>
* <p></p>
* 
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
				f =0, func;
			
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
			parts = objectName.split(/\./)
		for(var i =0; i < parts.length; i++){
			current = current[parts[i]] || ( current[parts[i]] = {} )
		}
		return current;
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
		var _super_class = this;
		var _super = this.prototype;
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		// Copy the properties over onto the new prototype
		inheritProps(proto, _super, prototype);
		
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
		for(var name in this){
			if(this.hasOwnProperty(name) && 
				name != 'prototype'&& 
				name != 'defaults' &&
				name != 'getObject'){
				Class[name] = this[name];
			}
		}
		$.extend(Class,{
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
		});

		
		
		//copy properties from current class to static
		
		
		//do static inheritence
		inheritProps(klass, this, Class)
		

		var shortName, 
			namespace;
		
		if (fullName) {
			var current = window
			var parts = fullName.split(/\./)
			for(var i =0; i < parts.length-1; i++){
				current = current[parts[i]] || ( current[parts[i]] = {} )
			}
			namespace = current;
			shortName = parts[parts.length - 1];
			
			//@steal-remove-start
			steal.dev.isHappyName(fullName)
			//@steal-remove-end
		}
		
		Class.prototype = prototype;
		//Provide a reference to this class
		Class.prototype.Class = Class; //only changing buff prototype
		Class.prototype.constructor = Class; //only buff prototype
		// Enforce the constructor to be what we expect
		Class.constructor = Class;
		
		Class.namespace = namespace;
		Class.shortName = shortName
		/**
		 * @attribute fullName 
		 * The full name of the class, including namespace, provided for introspection purposes.
		 * @codestart
		 * $.Class.extend("MyOrg.MyClass",{},{})
		 * MyOrg.MyClass.shortName //-> 'MyClass'
		 * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
		 * @codeend
		 */
		Class.fullName = fullName;
		
		
		Class.setup.apply(Class, [_super_class].concat( $.makeArray(arguments) ));
	
		if(Class.init) Class.init(Class);
		
		
		
		/* @Prototype*/
		
		
		if(shortName){
			current[shortName] = Class;
		}
		
		
		return Class;
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
	}

})





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
  callback : jQuery.Class.callback
}
  
})();
