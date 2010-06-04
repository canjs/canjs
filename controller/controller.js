steal.plugins('jquery/class','jquery/lang','jquery/event/destroyed').then(function($){

//helpers that return a function that will unbind themselves
var bind = function( el, ev, callback ){
	var wrappedCallback;
	//this is for events like >click.
	if(ev.indexOf(">") == 0){
		ev = ev.substr(1);
		wrappedCallback = function(event){
			if(event.target === el)
				callback.apply(this, arguments);
			else
				event.handled = null;
		}
	}
	$(el).bind(ev, wrappedCallback || callback);
	// if ev name has >, change the name and bind
	// in the wrapped callback, check that the element matches the actual element
	return function(){
		$(el).unbind(ev, wrappedCallback || callback);
		el = ev = callback = wrappedCallback = null;
	}
},

delegate = function(el, selector, ev, callback){
	$(el).delegate(selector, ev, callback);
	return function(){
		$(el).undelegate(selector, ev, callback);
		el = ev = callback = selector = null;
	}
},
//wraps 'this' with jquery and makes it the first argument
shifter = function(cb){ 
	return function(){
		return cb.apply(null, [$(this)].concat(Array.prototype.slice.call(arguments, 0)));
	}
},

dotsReg = /\./g,

controllersReg = /_?controllers?/ig,

//used to remove the controller from the name
underscoreAndRemoveController = function(className){
	return $.String.underscore(className.replace(dotsReg,'_').replace(controllersReg,""));
}
/**
 * @tag core
 * @plugin jquery/controller
 * @download jquery/dist/jquery.controller.js
 * 
 * <p><img src='jmvc/images/controller.png' class='component'/>Controllers organize event handlers using event delegation. 
 * If something happens in your application (a user click or a [jQuery.Model|Model] instance being updated), 
 * a controller should respond to it. </p>
 * 
 * <h2 class='spaced'>Benefits</h2>
 * <ul>
 *     <li><p><i>Know your code.</i></p>
 *     		Group events and label your html in repeatable ways so it's easy to find your code.</li>
 *     <li><p><i>Controllers are inheritable.</i></p>
 *         Package, inherit, and reuse your widgets.</li>
 *     <li><p><i>Write less.</i></p>
 *         Controllers take care of setup / teardown auto-magically.</li>
 * </ul>
 * <h2>Basic Example</h2>
Controllers organize jQuery code into resuable, inheritable, and extendable widgets.  So ...
@codestart
// instead of something like:
$(function(){
  $('#tabs').click(someCallbackFunction1)
  $('#tabs .tab').click(someCallbackFunction2)
  $('#tabs .delete click').click(someCallbackFunction3)
});

// do this
$.Controller.extend('Tabs',{
  click: function(){...},
  '.tab click' : function(){...},
  '.delete click' : function(){...}
})
$('#tabs').tabs();
// isn't that nice?
@codeend
<h2>Tabs Example</h2>
@demo jquery/controller/controller.html

 * <h2>Using Controllers</h2>
 * <p>A Controller is mostly a list of functions that get called back when specific events happen.  
 * A function's name provides a description of when the function should be called.  
 * By naming your functions like "<b>selector</b> <b>event</b>", 
 * Controller recognizes them as an <b>Action</b> and binds them appropriately.  
 * </p>
 * 
 * <p>The event binding happens when you create a [jQuery.Controller.prototype.setup|new controller instance].
 * </p>
 * 
 * <p>Lets look at a very basic example - 
 *  a list of todos and a button you want to click to create a new todo.
 * Your HTML might look like:</p>
@codestart html
&lt;div id='todos'>
	&lt;ol>
	  &lt;li class="todo">Laundry&lt;/li>
	  &lt;li class="todo">Dishes&lt;/li>
	  &lt;li class="todo">Walk Dog&lt;/li>
	&lt;/ol>
	&lt;a class="create">Create&lt;/a>
&lt;/div>
@codeend
To add a mousover effect and create todos, your controller might look like:
@codestart
$.Controller.extend('Todos',{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  ".create click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend
Now that you've created the controller class, you've must attach the event handlers on the '#todos' div by
creating [jQuery.Controller.prototype.init|a new controller instance].  There are 2 ways of doing this.
@codestart
//1. Create a new controller directly:
new Todos($('#todos'));
//2. Use jQuery function
$('#todos').todos();
@codeend

As you've likely noticed, when the [jQuery.Controller.static.init|controller class is created], it creates helper
functions on [jQuery.fn]. The "#todos" element is known as the <b>controller</b> element.

<h3>Event Handler Matching</h3>
With the exception of subscribe actions, controller uses jQuery.fn.bind or jQuery.fn.delegate to 
attach event handlers.  Controller uses the following rules to determine if a function name is
an event handler:

<ul>
	<li>Does the function name contain a selector?  Ex: <code>"a.foo click"</code></li>
	<li>Does the function name match an event in jQuery.event.special? Ex: <code>"mouseenter"</code></li>
	<li>Does the function name match a standard event name? Ex: <code>"click"</code></li>
	<li>Does the function name match a value in the controller's static listensTo array? Ex: <code>"activate"</code></li>
</ul>
In general, Controller will know automatically when to bind event handler functions except for one case 
- event names without selectors that are not in $.event.special.  But to correct for this, you
just need to add the function to the listensTo property.  Here's how:
@codestart
$.Controller.extend("MyShow",{
  listensTo: ["show"]
},{
  show : function(el, ev){
    el.show();
  }
})
$('.show').my_show().trigger("show");
@codeend


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


<h2>Document Controllers</h2>
<p>
Document Controllers delegate on the documentElement.  You don't have to attach an instance as this will be done
for you when the controller class is created.  Document Controllers, with the exception of MainControllers,
add an implicit '#CONTROLLERNAME' before every selector.
</p>
<p>To create a document controller, you just have to set the controller's [jQuery.Controller.static.onDocument static onDocument]
property to true.</p> 
@codestart
$.Controller.extend('TodosController',
{onDocument: true},
{
  ".todo mouseover" : function(el, ev){ //matches #todos .todo
      el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){ //matches #todos .todo
      el.css("backgroundColor","")
  },
  ".create click" : function(){        //matches #todos .create
      this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend
<p>DocumentControllers are typically used for page layout and functionality that is 
extremely unlikely to be repeated such as a SidebarController.  
Often, a Document Controller's <b>"ready"</b> event will be used to create
necessary Element Controllers.</p>
@codestart
$.Controller.extend('SidebarController',
{onDocument: true},
{
  <b>ready</b> : function(){
      $(".slider").slider_controller()
  },
  "a.tag click" : function(){..}
})
@codeend
<h3>MainControllers</h3>
<p>MainControllers are documentControllers that do not add '#CONTROLLERNAME' before every selector.  This controller
should only be used for page wide functionality and setup.</p>
@codestart
$.Controller.extend("MainController",{
  hasActiveElement : document.activeElement || false
},{
  focus : funtion(el){
     if(!this.Class.hasActiveElement)
         document.activeElement = el[0] //tracks active element
  }
})
@codeend
<h2>Controller Initialization</h2>
<p>It can be extremely useful to overwrite [jQuery.Controller.prototype.init Controller.prototype.init] with 
setup functionality for your widget. </p>
<p>In the following example, I create a controller that when created, will put a message as the content of the element:</p>
@codestart
$.Controller.extend("SpecialController",
{
  init : function(el, message){
     this.element.html(message)
  }
})
$(".special").special("Hello World")
@codeend
<h2>Removing Controllers</h2>
Controller removal is built into jQuery.  So to remove a controller, you just have to remove its element:
@codestart
$(".special_controller").remove()
$("#containsControllers").html("")
@codeend
<p>It's important to note that if you use raw DOM methods (<code>innerHTML, removeChild</code>), the controllers won't be destroyed.</p>
<p>If you just want to remove controller functionality, call destroy on the controller instance:</p>
@codestart
$(".special_controller").controller().destroy()
@codeend
<h2>Accessing Controllers</h2>
<p>Often you need to get a reference to a controller, there are a few ways of doing that.  For the 
following example, we assume there are 2 elements with <code>className="special"</code>.</p>
@codestart
//creates 2 foo controllers
$(".special").foo()

//creates 2 bar controllers
$(".special").bar()

//gets all controllers on all elements:
$(".special").controllers() //-> [foo, bar, foo, bar]

//gets only foo controllers
$(".special").controllers(FooController) //-> [foo, foo]

//gets all bar controllers
$(".special").controllers(BarController) //-> [bar, bar]

//gets first controller
$(".special").controller() //-> foo

//gets foo controller via data
$(".special").data("controllers")["FooController"] //-> foo
@codeend

<h2>Calling methods on Controllers</h2>
Once you have a reference to an element, you can call methods on it.  However, Controller has
a few shortcuts:
@codestart
//creates foo controller
$(".special").foo({name: "value"})

//calls FooController.prototype.update
$(".special").foo({name: "value2"})

//calls FooController.prototype.bar
$(".special").foo("bar","something I want to pass")
@codeend
 */
jQuery.Class.extend("jQuery.Controller",
/* @Static*/
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
	init : function(){
		// if you didn't provide a name, or are controller, don't do anything
		if( !this.shortName  || this.fullName == "jQuery.Controller" ){
			return;
		}
		//cache the underscored names
		this.underscoreFullName = underscoreAndRemoveController(this.fullName);
		this.underscoreShortName = underscoreAndRemoveController(this.shortName);
		
		var val, 
			processor,
			controller = this,
			pluginname = this.underscoreFullName,
			funcName;
		
		//create jQuery plugin
		if(!jQuery.fn[pluginname]) {
			jQuery.fn[pluginname] = function(options){
				
				var args = $.makeArray(arguments), 
					//if the arg is a method on this controller
					isMethod = typeof options == "string" && typeof controller.prototype[options] == "function",
					meth = args[0];
				this.each(function(){
					//check if created
					var controllers = jQuery.data(this,"controllers"),
						//plugin is actually the controller instance
						plugin = controllers && controllers[pluginname];
					
					if( plugin ) {
						if( isMethod ) {
							//call a method on the controller with the remaining args
							plugin[meth].apply(plugin, args.slice(1))
						}
						else if( plugin.update ) {
							//call the update function with all args
							plugin.update.apply(plugin, args) //call the plugin's update method
						}
					}else{
						//create a new controller instance
						controller.newInstance.apply(controller, [this].concat(args))
					}
				})
				//always return the element
				return this;
			}
		}
		//make sure listensTo isn't crazy
		if(!$.isArray(this.listensTo)){
			throw "listensTo is not an array in "+this.fullName
		}
		//calculate and cache actions
		this.actions = {};

		for( funcName in this.prototype ) {
			if( funcName == "constructor" || !$.isFunction(this.prototype[funcName]) ) { 
				continue; 
			}
			if(this._isAction(funcName)){
				this.actions[funcName] = this._getAction(funcName);
			}
		}
		
		/**
		 * @attribute onDocument
		 * Set to true if you want to automatically attach this element to the documentElement.
		 */
		if(this.onDocument)
			new this(document.documentElement);
	},
	hookup : function(el){
		return new this(el);
	},
	_actionMatcher : /[^\w]/,
	_eventCleaner : /^(>?default\.)|(>)/,
	_parameterReplacer : /\{([^\}]+)\}/g,
	/**
	 * @hide
	 * @params {String} methodName a prototype function
	 * @returns {Boolean} truthy if an action or not
	 */
	_isAction : function(methodName){
		if( this._actionMatcher.test(methodName) ){
			return true;
		}else{
			var cleanedEvent = methodName.replace(this._eventCleaner,"");
			return $.inArray( cleanedEvent, this.listensTo ) > -1 ||
				$.event.special[cleanedEvent]	|| jQuery.Controller.processors[cleanedEvent]
		}
			   
	},
	/**
	 * @hide
	 * @param {Object} methodName the method that will be bound
	 * @param {Object} [options] first param merged with class default options
	 * @return {Object} null or the processor and pre-split parts.  
	 * The processor is what does the binding/subscribing.
	 */
	_getAction : function(methodName, options){
		//if we don't have a controller instance, we'll break this guy up later
		if(!options && this._parameterReplacer.test(methodName)){
			return null;
		}
		var convertedName = options ? 
			methodName.replace(this._parameterReplacer, function(whole, inside){
				//convert inside to type
				return jQuery.Class.getObject(inside, options).toString(); //gets the value in options
			}) : methodName,
			parts = convertedName.match( this.breaker),
			event = parts[2],
			processor = this.processors[event] || this.basicProcessor;
			
		return {processor: processor, parts: parts};
	},
	breaker : /^(?:(.*?)\s)?([\w\.\:>]+)$/,
	/**
	 * @attribute processors
	 * A has of eventName : function pairs that Controller uses to hook 
	 */
	processors : {},
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
		var funcName, 
			cb;
		
		//want the raw element here
		element = element.jquery ? element[0] : element;
		
		//set element and className on element
		this.element = jQuery(element).addClass(this.Class.underscoreFullName );
		
		//set in data
		( jQuery.data(element,"controllers") || jQuery.data(element,"controllers",{}) )[this.Class.underscoreFullName] = this;
		
		//adds bindings
		this._bindings = [];
		/**
		 * @attribute options
		 * Options is automatically merged from this.Class.OPTIONS and the 2nd argument
		 * passed to a controller.
		 */
		this.options = $.extend( $.extend(true,{}, this.Class.OPTIONS  ), options);
		
		//go through the cached list of actions and use the processor to bind
		for(funcName in this.Class.actions){
			var ready = this.Class.actions[funcName]
			//if null, it's because it has a parameterized action.
			if(!ready){
				ready = this.Class._getAction(funcName, this.options)
			}
			this._bindings.push( 
				ready.processor(element, 
					ready.parts[2], 
					ready.parts[1], 
					this.callback(funcName), 
					this) 
				)
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
		var destroyCB = shifter(this.callback("destroy"))
		this.element.bind("destroyed", destroyCB);
		this._bindings.push( function(el){
			destroyCB.removed = true;
			$(element).unbind("destroyed", destroyCB);
			
		})
		
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
	 * Bind attaches event handlers that will be removed when the controller is removed.  
	 * This is a good way to attach to an element not in the controller's element.
	 * <br/>
	 * <h3>Examples:</h3>
	 * @codestart
	 * init : function(){
	 *    // calls somethingClicked(el,ev)
	 *    this.bind('click','somethingClicked') 
	 * 
	 *    // calls function when the window is clicked
	 *    this.bind(window, 'click', function(ev){
	 *      //do something
	 *    })
	 * },
	 * somethingClicked : function(el, ev){
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
	delegate : function(element, selector, eventName, func){
		if(typeof element == 'string'){
			func = eventName;
			eventName = selector;
			selector = element
			element = this.element
		}
		if(typeof func == 'string'){
			func = shifter(this.callback(func))
		}
		this._bindings.push( delegate(element,selector, eventName, func ) )
		return this._bindings.length;
	},
	/**
	 * Called if an controller's jQuery helper is called on an element that already has a controller instance
	 * of the same type.  Extends this.options with the options passed in.  If you overwrite this, you might want to call
	 * this._super.
	 * <h3>Examples</h3>
	 * @codestart
	 * $.Controller.extend("Thing",{
	 * init : function(el, options){
	 *    alert('init')
	 * },
	 * update : function(options){
	 *    this._super(options);
	 *    alert('update')
	 * }
	 * });
	 * $('#myel').thing(); // alerts init
	 * $('#myel').thing(); // alerts update
	 * @codeend
	 * @param {Object} options
	 */
	update : function(options){
		$.extend(this.options, options)
	},
	/**
	 * Destroy unbinds and undelegates all actions on this controller, and prevents any memory leaks.  This is called automatically
	 * if the element is removed.
	 * 
	 */
	destroy: function(ev){
		if( this._destroyed ) {
			throw this.Class.shortName+" controller instance has already been deleted";
		}
		this._destroyed = true;
		this.element.removeClass(this.Class.underscoreFullName );
		var self = this;
		jQuery.each(this._bindings, function(key, value){
			if(typeof value == "function") value(self.element[0]);
		});

		delete this._actions;


		var controllers = this.element.data("controllers");
		if(controllers && controllers[this.Class.underscoreFullName])
			delete controllers[this.Class.underscoreFullName];
		
		this.element = null;
	},
	/**
	 * Queries from the controller's element.
	 * @codestart
	 * ".destroy_all click" : function(){
	 *    this.find(".todos").remove();
	 * }
	 * @codeend
	 * @param {String} selector selection string
	 * @return {jQuery.fn} returns the matched elements
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
	/**
	 * This function does nothing.  It's here to provide an init for Class to call back.
	 */
	init : function(){}
});


//------------- PROCESSSORS -----------------------------
//processors do the binding.  They return a function that
//unbinds when called.


//the basic processor that binds events
jQuery.Controller.basicProcessor = function( el, event, selector, cb, controller ) {
	var c = controller.Class;
	
	// document controllers use their name as an ID prefix.
	if(c.onDocument && (c.shortName !== "Main"&& c.shortName !== "MainController")){ //prepend underscore name if necessary
		selector = selector ? "#"+c.underscoreShortName +" "+selector : "#"+c.underscoreShortName
	}
	
	if(selector){
		return delegate(el, selector, event, shifter(cb))
	}else{
		return bind(el, event, shifter(cb))
	}
}
//set commong events to be processed as a basicProcessor
jQuery.each(["change","click","contextmenu","dblclick","keydown","keyup","keypress","mousedown","mousemove","mouseout","mouseover","mouseup","reset","windowresize","resize","windowscroll","scroll","select","submit","dblclick","focusin","focusout","load","unload","ready","hashchange","mouseenter","mouseleave"], function(i ,v){
	jQuery.Controller.processors[v] = jQuery.Controller.basicProcessor ;
})
//a window event only happens on the window
var windowEvent = function( el, event, selector, cb ) {
	var func = shifter(cb);
	jQuery(window).bind(event.replace(/window/,""), func);
	return function(){
		jQuery(window).unbind(event.replace(/window/,""), func);
	}
}

jQuery.each(["windowresize","windowscroll","load","ready","unload","hashchange"], function(i ,v){
	jQuery.Controller.processors[v] = windowEvent;
})
//the ready processor happens on the document
jQuery.Controller.processors.ready = function( el, event, selector, cb){
	$(shifter(cb)); //cant really unbind
}
/**
 *  @add jQuery.fn
 */

$.fn.mixin = function(){
	//create a bunch of controllers
	var controllers = $.makeArray(arguments);
	return this.each(function(){
		for(var i = 0 ; i < controllers.length; i++){
			new controllers[i](this)
		}
		
	})
}
//used to determine if a controller instance is one of controllers
//controllers can be strings or classes
var isAControllerOf = function(instance, controllers){
	for(var i =0; i < controllers.length; i++){
		if(typeof controllers[i] == 'string' ? 
			instance.Class.underscoreShortName == controllers[i] :
			instance instanceof controllers[i]){
			return true;
		}
	}
	return false;
}
jQuery.fn.
/**
 * @function controllers
 * Gets all controllers in the jQuery element.
 * @return {Array} an array of controller instances.
 */
controllers = function(){
	var controllerNames = jQuery.makeArray(arguments), 
	   instances = [], 
	   controllers, 
	   cname;
	//check if arguments
	this.each(function(){
		controllers= jQuery.data(this, "controllers")
		if(!controllers) return;
		for(var cname in controllers){
			var c = controllers[cname];
			if(   !controllerNames.length || isAControllerOf(c, controllerNames))
				instances.push(c);
		}
	})
	return instances;
};
jQuery.fn.
/**
* @function controller
* Gets a controller in the jQuery element.  With no arguments, returns the first one found.
* @param {Object} controller (optional) if exists, the first controller instance with this class type will be returned.
* @return {jQuery.Controller} the first controller.
*/
controller = function (controller) {
    return this.controllers.apply(this, arguments)[0];
};

})
