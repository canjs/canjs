steal.plugins('jquery/class','jquery/lang','jquery/event/destroyed').then(function($){
//helpers that return a function that will unbind themselves
var bind = function( el, ev, callback ){
	var wrappedCallback;
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
//wraps 'this' and makes it the first argument
shifter = function(cb){ 
	return function(){
		return cb.apply(null, [$(this)].concat(Array.prototype.slice.call(arguments, 0)));
	}
},
dotsReg = /\./g,
controllersReg = /_?controllers?/i
underscoreAndRemoveController = function(className){
	return $.String.underscore(className.replace(dotsReg,'_').replace(controllersReg,""));
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
		if(!this.shortName  || this.fullName == "jQuery.Controller") return;
		this.underscoreFullName = underscoreAndRemoveController(this.fullName);
		this.underscoreShortName = underscoreAndRemoveController(this.shortName);
		
		var val, 
			processor,
			controller = this,
			pluginname = this.underscoreFullName;
		
		//create jQuery plugin
		if(!jQuery.fn[pluginname]) {
			jQuery.fn[pluginname] = function(options){
				var args = $.makeArray(arguments), 
					isMethod = typeof options == "string" && typeof controller.prototype[options] == "function",
					meth = args[0];
				this.each(function(){
					//check if created
					var controllers = jQuery.data(this,"controllers"),
						plugin = controllers && controllers[pluginname];
					
					
					if( plugin ) {
						if( isMethod ) {
							plugin[meth].apply(plugin, args.slice(1))
						}
						else if( plugin.update ) {
							plugin.update.apply(plugin, args) //call the plugin's update method
						}
					}else{
						controller.newInstance.apply(controller, [this].concat(args))
					}
				})
				return this;
			}
		}
		
		//calculate and cache actions
		this.actions = {};
		var convertedName, 
			parts, 
			c = this, 
			replacer = /\{([^\}]+)\}/g, 
			b = c.breaker, 
			funcName;
		for( funcName in this.prototype ) {
			if( funcName == "constructor" ) { continue; }
			convertedName = funcName.replace(replacer, function(whole, inside){
				//convert inside to type
				return jQuery.Class.getObject(inside, c.OPTIONS).toString(); //gets the value in options
			})
			parts = convertedName.match( b) //parts of the action string
			//get processor if it responds to event type
			processor = parts && 
					(	c.processors[parts[2]] || //if the 2nd part is a processor, use that processor
						($.inArray(parts[2], c.listensTo ) > -1 && c.basicProcessor) ||  //if it is in listens to, use basic processor
					( parts[1] && c.basicProcessor) );
			if(processor){
				this.actions[funcName] = {action: processor, parts: parts}
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
		var funcName, 
			convertedName, 
			func, 
			a, 
			act, 
			c = this.Class, 
			b = c.breaker, 
			cb;
		element = element.jquery ? element[0] : element;
		
		//set element and className on element
		this.element = jQuery(element).addClass(this.Class.underscoreFullName );
		
		//set in data
		( jQuery.data(element,"controllers") || jQuery.data(element,"controllers",{}) )[this.Class.underscoreFullName] = this;
		
		//adds bindings
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
		//this.element.bind('destroyed', this.callback('destroy'))
		this.bind('destroyed', 'destroy')
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
	destroy: function(){
		if( this._destroyed ) {
			throw this.Class.shortName+" controller instance has already been deleted";
		}
		this.element.removeClass(this.Class.underscoreFullName );
		var self = this;
		jQuery.each(this._bindings, function(key, value){
			if(typeof value == "function") value(self.element[0]);
		});
		
		delete this._actions;
		this._destroyed = true;

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


//processors respond to an event
jQuery.Controller.processors = {};
var basic = (jQuery.Controller.basicProcessor = function( el, event, selector, cb, controller ) {
	var c = controller.Class;
	if(c.onDocument && (c.shortName !== "Main"|| c.shortName !== "MainController")){ //prepend underscore name if necessary
		selector = selector ? c.underscoreShortName +" "+selector : c.underscoreShortName
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
/**
 * Gets all controllers in the jQuery element.
 * @return {Array} an array of controller instances.
 */
jQuery.fn.controllers = function(){
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
			if(!controllerNames.length || jQuery.inArray(c.Class.underscoreShortName, controllerNames) > -1)
				instances.push(c);
		}
	})
	return instances;
};
/**
 * Gets all controllers in the jQuery element.
 * @return {jQuery.Controller} the first controller.
 */
jQuery.fn.controller = function(){
	return this.controllers.apply(this, arguments)[0];
};

})
