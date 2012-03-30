can = {};
if (window.STEALDOJO){
	steal('can/util/dojo')
} else if( window.STEALMOO) {
	steal('can/util/mootools')
} else if(window.STEALYUI){
	steal('can/util/yui');
} else if(window.STEALZEPTO){
	steal('can/util/zepto');
} else {
	steal('can/util/jquery')
}



/**
@function can.trim
@parent can.util
Removes leading and trailing whitespace

    Can.trim( " foo " ) // -> "foo"

@param {String} str the string to trim
@return {String} the value of the string
 */
//
/**
@function can.makeArray
@parent can.util
Converts array like data into arrays.

    Can.makeArray({0 : "zero", 1: "one", length: 2})
       // -> ["zero","one"]
 */
//
/**
@function can.isArray
@parent can.util
Returns if the object is an Array

    can.isArray([]) //-> true
    can.isArray(false)

@param {Array} arr any JS object
@return {Boolean} true if an array
*/
//
/**
@function can.each
@parent can.util
Iterates through an array or object like
like [http://api.jquery.com/jQuery.each/ jQuery.each].

    can.each([{prop: "val1"}, {prop: "val2"}], function( index, value ) {
      // function called with
      //  index=0 value={prop: "val1"}
      //  index=1 value={prop: "val2"}
    })

@param {Object} arr any JS object or array
@return {Object} the function passed to can.each
*/
//
/**
@function can.extend
@parent can.util
Extends an object like
like [http://api.jquery.com/jQuery.extend/ jQuery.extend].

    var first = {},
        second = {a: "b"},
        thrid = {c: "d"};
    can.extend(first, second, third); //-> first
    first  //-> {a: "b",c : "d"}
    second //-> {a: "b"}
    thrid  //-> {c: "d"}
*/
//
/**
@function can.param
@parent can.util
Parameterizes an object into a query string
like [http://api.jquery.com/jQuery.param/ jQuery.param].

    can.param({a: "b", c: "d"}) //-> "a=b&c=d"
*/
//
/**
@function can.isEmptyObject
@parent can.util
Returns if an object is empty like
[http://api.jquery.com/jQuery.isEmptyObject/ jQuery.isEmptyObject].

    can.isEmptyObject({})      //-> true
    can.isEmptyObject({a:"b"}) //-> false

*/
//
/**
@function can.proxy
@parent can.util
Returns if an object is empty like
[http://api.jquery.com/jQuery.proxy/ jQuery.proxy].

     var func = can.proxy(function(one){
       return this.a + one
     }, {a: "b"}); 
     func("two") //-> "btwo" 

*/
//
/**
@function can.proxy
@parent can.util
Returns if an object is empty like
[http://api.jquery.com/jQuery.proxy/ jQuery.proxy].

     var func = can.proxy(function(one){
       return this.a + one
     }, {a: "b"}); 
     func("two") //-> "btwo" 

*/
//
/**
@function can.isFunction
@parent can.util
Returns if an object is a function like
[http://api.jquery.com/jQuery.isFunction/ jQuery.isFunction].

     can.isFunction({})           //-> false
     can.isFunction(function(){}) //-> true

*/
//
/**
@function can.bind
@parent can.bind

`can.bind(obj, eventName, handler)` binds a callback handler
on an object for a given event.  It works on:

  - HTML elements and the window
  - Nodelists of the underlying library
  - Objects
  - Objects with bind / unbind methods
  
The idea is that bind can be used on anything that produces events
and it will figure out the appropriate way to 
bind to it.  Typically, `can.bind` is only used internally to
CanJS; however, if you are making libraries or extensions, use
`can.bind` to listen to events independent of the underlying library.


__Binding to an object__

    var obj = {};
    can.bind(obj,"something", function(ev, arg1, arg){
    	arg1 // 1
    	arg2 // 2
    })
    can.trigger(obj,"something",[1,2])

__Binding to an HTMLElement__

    var el = document.getElementById('foo')
    can.bind(el, "click", function(ev){
    	this // el
    })

__Binding to a NodeList__

    can.bind( $("#foo") , "click", function(){
    	
    })

*/
//
/**
 * @function can.unbind
 * @parent can.util
 */
//
/**
@function can.delegate
@parent can.util
*/
//
/**
@function can.undelegate
@parent can.util
*/
//
/**
@function can.trigger
@parent can.util
*/
//
/**
@function can.ajax
@parent can.util

`can.ajax( settings )` is used to make an asynchronous HTTP (Ajax) request 
similar to [http://api.jquery.com/jQuery.ajax/ jQuery.ajax].

	can.ajax({
		url: 'ajax/farm/animals',
		success: function(animals) {
			can.$('.farm').html(animals);
		}
	});

*/
//
/**
@function can.$
@parent can.util

`can.$(selector|element|elements)` returns the the underlying
library's NodeList.  It can be passed
a css selector, a HTMLElement or an array of HTMLElements.

The following lists how the NodeList is created by each library:

 - __jQuery__ `jQuery( HTMLElement )`
 - __Zepto__ `Zepto( HTMLElement )`
 - __Dojo__ `new dojo.NodeList( HTMLElement )`
 - __Mootools__ `$$( HTMLElement )`
 - __YUI__ `Y.all(selector)` or `Y.NodeList`

*/
//
/**
@function can.buildFragment
@parent can.util

`can.buildFragment([html], nodes)` returns a document fragment for the HTML passed.

*/
//
/**
@function can.append
@parent can.util

`can.append( wrappedNodeList, html )` inserts content to the end of each wrapped node list item(s) passed.

	// Before
	<div id="demo" />
	
	can.append( can.$('#demo'), 'Demos are fun!' );
	
	// After
	<div id="demo">Demos are fun!</div>

*/
//
/**
@function can.remove
@parent can.util
*/
//
/**
@function can.data
@parent can.util

`can.data` enables the associatation of arbitrary data with DOM nodes and JavaScript objects.

### Setting Data

	can.data( can.$('#elm'), key, value )
	
- __wrappedNodeList__ node list to associate data to.
- __key__ string name of the association.
- __value__ tdata value; it can be any Javascript type including Array or Object.

### Accessing Data

	can.data( can.$('#elm'), key )
	
- __wrappedNodeList__ node list to retrieve association data from.
- __key__ string name of the association.

Due to the way browsers security restrictions with plugins and external code, 
the _data_ method cannot be used on <object> (unless it's a Flash plugin), <applet> or <embed> elements.

*/
//
/**
@function can.addClass
@parent can.util

`can.addClass( nodelist, className )` adds the specified class(es) to
nodelist's HTMLElements.  It does NOT replace any existing class(es)
already defined.

	// Before
	<div id="foo" class="monkey" />
	
    can.addClass(can.$("#foo"),"bar")

	// After
	<div id="foo" class="monkey bar" />
	
You can also pass multiple class(es) and it will add them to the existing
set also.

	// Before
	<div id="foo" class="monkey" />

	can.addClass(can.$("#foo"),"bar man")

	// After
	<div id="foo" class="monkey bar man" />
	
This works similarly to [http://api.jquery.com/addClass/ jQuery.fn.addClass].

*/
//
/**
@function can.when
@parent can.util
*/
//
/**
@class can.Deferred
@parent can.util
*/
