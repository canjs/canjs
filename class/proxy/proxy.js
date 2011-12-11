steal('jquery/class/class_core.js',function($){
var isFunction = $.isFunction,
	isArray = $.isArray,
	makeArray = $.makeArray,
/**
 * @function proxy
 * Returns a callback function for a function on this Class.
 * Proxy ensures that 'this' is set appropriately.  
 * @codestart
 * $.Class("MyClass",{
 *     getData: function() {
 *         this.showing = null;
 *         $.get("data.json",this.proxy('gotData'),'json')
 *     },
 *     gotData: function( data ) {
 *         this.showing = data;
 *     }
 * },{});
 * MyClass.showData();
 * @codeend
 * <h2>Currying Arguments</h2>
 * Additional arguments to proxy will fill in arguments on the returning function.
 * @codestart
 * $.Class("MyClass",{
 *    getData: function( <b>callback</b> ) {
 *      $.get("data.json",this.proxy('process',<b>callback</b>),'json');
 *    },
 *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
 *        jsonData.processed = true;
 *        callback(jsonData);
 *    }
 * },{});
 * MyClass.getData(showDataFunc)
 * @codeend
 * <h2>Nesting Functions</h2>
 * Proxy can take an array of functions to call as 
 * the first argument.  When the returned callback function
 * is called each function in the array is passed the return value of the prior function.  This is often used
 * to eliminate currying initial arguments.
 * @codestart
 * $.Class("MyClass",{
 *    getData: function( callback ) {
 *      //calls process, then callback with value from process
 *      $.get("data.json",this.proxy(['process2',callback]),'json') 
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
			
			//@steal-remove-start
			for( var i =0; i< funcs.length;i++ ) {
				if(typeof funcs[i] == "string" && !isFunction(this[funcs[i]])){
					throw ("class.js "+( this.fullName || this.Class.fullName)+" does not have a "+funcs[i]+"method!");
				}
			}
			//@steal-remove-end
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
	$.Class.proxy = $.Class.prototype.proxy = proxy;
	
	
	
	/**
	 * @function proxy
	 * Returns a method that sets 'this' to the current instance.  This does the same thing as 
	 * and is described better in [jQuery.Class.static.proxy].
	 * The only difference is this proxy works
	 * on a instance instead of a class.
	 * @param {String|Array} fname If a string, it represents the function to be called.  
	 * If it is an array, it will call each function in order and pass the return value of the prior function to the
	 * next function.
	 * @return {Function} the callback function
	 */



});