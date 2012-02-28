// 1.28
steal('can/construct', 'can/util/destroyed.js', function( $ ) {
	// ------- HELPER FUNCTIONS  ------
	
	// Binds an element, returns a function that unbinds
	var bind = function( el, ev, callback ) {
		can.bind.call(el,ev, callback)
		//var binder = el.bind && el.unbind ? el : $(isFunction(el) ? [el] : el);

		//binder.bind(ev, callback);
		// if ev name has >, change the name and bind
		// in the wrapped callback, check that the element matches the actual element
		return function() {
			can.unbind.call(el, ev, callback);
		};
	},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
		special = ($.event && $.event.special) || {},
		// Binds an element, returns a function that unbinds
		delegate = function( el, selector, ev, callback ) {
			//var binder = el.delegate && el.undelegate ? el : $(isFunction(el) ? [el] : el)
			//binder.delegate(selector, ev, callback);
			can.delegate.call(el, selector, ev, callback)
			return function() {
				can.undelegate.call(el, selector, ev, callback);
			};
		},
		
		// calls bind or unbind depending if there is a selector
		binder = function( el, ev, callback, selector ) {
			return selector ? delegate(el, can.trim(selector), ev, callback) : bind(el, ev, callback);
		},
		
		// moves 'this' to the first argument, wraps it with jQuery if it's an element
		shifter = function shifter(context, name) {
			var method = typeof name == "string" ? context[name] : name;
			return function() {
				context.called = name;
    			return method.apply(context, [this.nodeName ? can.$(this) : this].concat( slice.call(arguments, 0) ) );
			};
		},
		// matches dots
		// checks if it looks like an action
		actionMatcher = /[^\w]/,
		// handles parameterized action names
		parameterReplacer = /\{([^\}]+)\}/g,
		breaker = /^(?:(.*?)\s)?([\w\.\:>]+)$/,
		basicProcessor;
	/**
	 * @class can.Control
	 * @parent index
	 * @plugin can/control
	 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/control/control.js
	 * @test jquery/control/qunit.html
	 * @inherits jQuery.Construct
	 * @description jQuery widget factory.
	 * 
	 * jQuery.Control helps create organized, memory-leak free, rapidly performing
	 * jQuery widgets.  Its extreme flexibility allows it to serve as both
	 * a traditional View and a traditional Control.  
	 * 
	 * This means it is used to
	 * create things like tabs, grids, and contextmenus as well as 
	 * organizing them into higher-order business rules.
	 * 
	 * Controls make your code deterministic, reusable, organized and can tear themselves 
	 * down auto-magically. Read about [http://jupiterjs.com/news/writing-the-perfect-jquery-plugin 
	 * the theory behind control] and 
	 * a [http://jupiterjs.com/news/organize-jquery-widgets-with-jquery-control walkthrough of its features]
	 * on Jupiter's blog. [mvc.control Get Started with jQueryMX] also has a great walkthrough.
	 * 
	 * Control inherits from [can.Construct can.Construct] and makes heavy use of 
	 * [http://api.jquery.com/delegate/ event delegation]. Make sure 
	 * you understand these concepts before using it.
	 * 
	 * ## Basic Example
	 * 
	 * Instead of
	 * 
	 * 
	 *     $(function(){
	 *       $('#tabs').click(someCallbackFunction1)
	 *       $('#tabs .tab').click(someCallbackFunction2)
	 *       $('#tabs .delete click').click(someCallbackFunction3)
	 *     });
	 * 
	 * do this
	 * 
	 *     can.Control('Tabs',{
	 *       click: function() {...},
	 *       '.tab click' : function() {...},
	 *       '.delete click' : function() {...}
	 *     })
	 *     $('#tabs').tabs();
	 * 
	 * 
	 * ## Tabs Example
	 * 
	 * @demo jquery/control/control.html
	 * 
	 * ## Using Control
	 * 
	 * Control helps you build and organize jQuery plugins.  It can be used
	 * to build simple widgets, like a slider, or organize multiple
	 * widgets into something greater.
	 * 
	 * To understand how to use Control, you need to understand 
	 * the typical lifecycle of a jQuery widget and how that maps to
	 * control's functionality:
	 * 
	 * ### A control class is created.
	 *       
	 *     can.Control("MyWidget",
	 *     {
	 *       defaults :  {
	 *         message : "Remove Me"
	 *       }
	 *     },
	 *     {
	 *       init : function(rawEl, rawOptions){ 
	 *         this.element.append(
	 *            "<div>"+this.options.message+"</div>"
	 *           );
	 *       },
	 *       "div click" : function(div, ev){ 
	 *         div.remove();
	 *       }  
	 *     }) 
	 *     
	 * This creates a <code>$.fn.my_widget</code> jQuery helper function
	 * that can be used to create a new control instance on an element. Find
	 * more information [jquery.control.plugin  here] about the plugin gets created 
	 * and the rules around its name.
	 *       
	 * ### An instance of control is created on an element
	 * 
	 *     $('.thing').my_widget(options) // calls new MyWidget(el, options)
	 * 
	 * This calls <code>new MyWidget(el, options)</code> on 
	 * each <code>'.thing'</code> element.  
	 *     
	 * When a new [can.Construct Class] instance is created, it calls the class's
	 * prototype setup and init methods. Control's [jQuery.Control.prototype.setup setup]
	 * method:
	 *     
	 *  - Sets [jQuery.Control.prototype.element this.element] and adds the control's name to element's className.
	 *  - Merges passed in options with defaults object and sets it as [jQuery.Control.prototype.options this.options]
	 *  - Saves a reference to the control in <code>$.data</code>.
	 *  - [jquery.control.listening Binds all event handler methods].
	 *   
	 * 
	 * ### The control responds to events
	 * 
	 * Typically, Control event handlers are automatically bound.  However, there are
	 * multiple ways to [jquery.control.listening listen to events] with a control.
	 * 
	 * Once an event does happen, the callback function is always called with 'this' 
	 * referencing the control instance.  This makes it easy to use helper functions and
	 * save state on the control.
	 * 
	 * 
	 * ### The widget is destroyed
	 * 
	 * If the element is removed from the page, the 
	 * control's [jQuery.Control.prototype.destroy] method is called.
	 * This is a great place to put any additional teardown functionality.
	 * 
	 * You can also teardown a control programatically like:
	 * 
	 *     $('.thing').my_widget('destroy');
	 * 
	 * ## Todos Example
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
	 * To add a mousover effect and create todos, your control might look like:
	 * 
	 *     can.Control('Todos',{
	 *       ".todo mouseover" : function( el, ev ) {
	 *         el.css("backgroundColor","red")
	 *       },
	 *       ".todo mouseout" : function( el, ev ) {
	 *         el.css("backgroundColor","")
	 *       },
	 *       ".create click" : function() {
	 *         this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
	 *       }
	 *     })
	 * 
	 * Now that you've created the control class, you've must attach the event handlers on the '#todos' div by
	 * creating [jQuery.Control.prototype.setup|a new control instance].  There are 2 ways of doing this.
	 * 
	 * @codestart
	 * //1. Create a new control directly:
	 * new Todos($('#todos'));
	 * //2. Use jQuery function
	 * $('#todos').todos();
	 * @codeend
	 * 
	 * ## Control Initialization
	 * 
	 * It can be extremely useful to add an init method with 
	 * setup functionality for your widget.
	 * 
	 * In the following example, I create a control that when created, will put a message as the content of the element:
	 * 
	 *     $.Control("SpecialControl",
	 *     {
	 *       init: function( el, message ) {
	 *         this.element.html(message)
	 *       }
	 *     })
	 *     $(".special").special("Hello World")
	 * 
	 * ## Removing Controls
	 * 
	 * Control removal is built into jQuery.  So to remove a control, you just have to remove its element:
	 * 
	 * @codestart
	 * $(".special_control").remove()
	 * $("#containsControls").html("")
	 * @codeend
	 * 
	 * It's important to note that if you use raw DOM methods (<code>innerHTML, removeChild</code>), the controls won't be destroyed.
	 * 
	 * If you just want to remove control functionality, call destroy on the control instance:
	 * 
	 * @codestart
	 * $(".special_control").control().destroy()
	 * @codeend
	 * 
	 * ## Accessing Controls
	 * 
	 * Often you need to get a reference to a control, there are a few ways of doing that.  For the 
	 * following example, we assume there are 2 elements with <code>className="special"</code>.
	 * 
	 * @codestart
	 * //creates 2 foo controls
	 * $(".special").foo()
	 * 
	 * //creates 2 bar controls
	 * $(".special").bar()
	 * 
	 * //gets all controls on all elements:
	 * $(".special").controls() //-> [foo, bar, foo, bar]
	 * 
	 * //gets only foo controls
	 * $(".special").controls(FooControl) //-> [foo, foo]
	 * 
	 * //gets all bar controls
	 * $(".special").controls(BarControl) //-> [bar, bar]
	 * 
	 * //gets first control
	 * $(".special").control() //-> foo
	 * 
	 * //gets foo control via data
	 * $(".special").data("controls")["FooControl"] //-> foo
	 * @codeend
	 * 
	 * ## Calling methods on Controls
	 * 
	 * Once you have a reference to an element, you can call methods on it.  However, Control has
	 * a few shortcuts:
	 * 
	 * @codestart
	 * //creates foo control
	 * $(".special").foo({name: "value"})
	 * 
	 * //calls FooControl.prototype.update
	 * $(".special").foo({name: "value2"})
	 * 
	 * //calls FooControl.prototype.bar
	 * $(".special").foo("bar","something I want to pass")
	 * @codeend
	 * 
	 * These methods let you call one control from another control.
	 * 
	 */
	can.Construct("can.Control",
	/** 
	 * @Static
	 */
	{
		/**
		 * Does 2 things:
		 * 
		 *   - Creates a jQuery helper for this control.</li>
		 *   - Calculates and caches which functions listen for events.</li>
		 *    
		 * ### jQuery Helper Naming Examples
		 * 
		 * 
		 *     "TaskControl" -> $().task_control()
		 *     "Controls.Task" -> $().controls_task()
		 * 
		 */
		setup: function() {
			// Allow contollers to inherit "defaults" from superclasses as it done in can.Construct
			can.Construct.setup.apply(this, arguments);

			// if you didn't provide a name, or are control, don't do anything
			if (this === can.Control ) {
				return;
			}
			// cache the underscored names
			var control = this,
				/**
				 * @hide
				 * @attribute pluginName
				 * Setting the <code>pluginName</code> property allows you
				 * to change the jQuery plugin helper name from its 
				 * default value.
				 * 
				 *     can.Control("Mxui.Layout.Fill",{
				 *       pluginName: "fillWith"
				 *     },{});
				 *     
				 *     $("#foo").fillWith();
				 */
				pluginName = this.pluginName || this._fullName,
				funcName;

			// create jQuery plugin
			if(pluginName !== 'can_control'){
				this.plugin(pluginName);
			} 
			
			// calculate and cache actions
			this.actions = {};

			for ( funcName in this.prototype ) {
				if (funcName == 'constructor' || !isFunction(this.prototype[funcName]) ) {
					continue;
				}
				if ( this._isAction(funcName) ) {
					this.actions[funcName] = this._action(funcName);
				}
			}
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
				return /*can.inArray(methodName, this.listensTo) > -1 ||*/ special[methodName] || processors[methodName];
			}

		},
		plugin : function(){},
		/**
		 * @hide
		 * Takes a method name and the options passed to a control
		 * and tries to return the data necessary to pass to a processor
		 * (something that binds things).
		 * 
		 * For performance reasons, this called twice.  First, it is called when 
		 * the Control class is created.  If the methodName is templated
		 * like : "{window} foo", it returns null.  If it is not templated
		 * it returns event binding data.
		 * 
		 * The resulting data is added to this.actions.
		 * 
		 * When a control instance is created, _action is called again, but only
		 * on templated actions.  
		 * 
		 * @param {Object} methodName the method that will be bound
		 * @param {Object} [options] first param merged with class default options
		 * @return {Object} null or the processor and pre-split parts.  
		 * The processor is what does the binding/subscribing.
		 */
		_action: function( methodName, options ) {
			// reset the test index
			parameterReplacer.lastIndex = 0;
			
			//if we don't have options (a control instance), we'll run this later
			if (!options && parameterReplacer.test(methodName) ) {
				return null;
			}
			// If we have options, run sub to replace templates "{}" with a value from the options
			// or the window
			var convertedName = options ? can.String.sub(methodName, [options, window]) : methodName,
				
				// If a "{}" resolves to an object, convertedName will be an array
				arr = can.isArray(convertedName),
				
				// get the parts of the function = [convertedName, delegatePart, eventPart]
				parts = (arr ? convertedName[1] : convertedName).match(breaker),
				event = parts[2],
				processor = processors[event] || basicProcessor;
			return {
				processor: processor,
				parts: parts,
				delegate : arr ? convertedName[0] : undefined
			};
		},
		/**
		 * @attribute processors
		 * An object of {eventName : function} pairs that Control uses to hook up events
		 * auto-magically.  A processor function looks like:
		 * 
		 *     jQuery.Control.processors.
		 *       myprocessor = function( el, event, selector, cb, control ) {
		 *          //el - the control's element
		 *          //event - the event (myprocessor)
		 *          //selector - the left of the selector
		 *          //cb - the function to call
		 *          //control - the binding control
		 *       };
		 * 
		 * This would bind anything like: "foo~3242 myprocessor".
		 * 
		 * The processor must return a function that when called, 
		 * unbinds the event handler.
		 * 
		 * Control already has processors for the following events:
		 * 
		 *   - change 
		 *   - click 
		 *   - contextmenu 
		 *   - dblclick 
		 *   - focusin
		 *   - focusout
		 *   - keydown 
		 *   - keyup 
		 *   - keypress 
		 *   - mousedown 
		 *   - mouseenter
		 *   - mouseleave
		 *   - mousemove 
		 *   - mouseout 
		 *   - mouseover 
		 *   - mouseup 
		 *   - reset 
		 *   - resize 
		 *   - scroll 
		 *   - select 
		 *   - submit  
		 * 
		 * Listen to events on the document or window 
		 * with templated event handlers:
		 * 
		 *
		 *     can.Control('Sized',{
		 *       "{window} resize" : function(){
		 *         this.element.width(this.element.parent().width() / 2);
		 *       }
		 *     });
		 *     
		 *     $('.foo').sized();
		 */
		processors: {},
		/**
		 * @attribute defaults
		 * A object of name-value pairs that act as default values for a control's 
		 * [can.Control::options this.options].
		 * 
		 *     Message = can.Control({
		 *       defaults : {
		 *         message : "Hello World"
		 *       }
		 *     },{
		 *       init : function(){
		 *         this.element.text(this.options.message);
		 *       }
		 *     })
		 *     
		 *     new Message("#el1"); //writes "Hello World"
		 *     new Message("#el12",{message: "hi"}); //writes hi
		 *     
		 * In [can.Control::setup] the options passed to the control
		 * are merged with defaults.  This is not a deep merge.
		 */
		defaults: {}
	},
	/** 
	 * @Prototype
	 */
	{
		/**
		 * Setup is where most of control's magic happens.  It does the following:
		 * 
		 * ### 1. Sets this.element
		 * 
		 * The first parameter passed to new Control(el, options) is expected to be 
		 * an element.  This gets converted to a jQuery wrapped element and set as
		 * [jQuery.Control.prototype.element this.element].
		 * 
		 * ### 2. Adds the control's name to the element's className.
		 * 
		 * Control adds it's plugin name to the element's className for easier 
		 * debugging.  For example, if your Control is named "Foo.Bar", it adds
		 * "foo_bar" to the className.
		 * 
		 * ### 3. Saves the control in $.data
		 * 
		 * A reference to the control instance is saved in $.data.  You can find 
		 * instances of "Foo.Bar" like: 
		 * 
		 *     $("#el").data("controls")['foo_bar'].
		 * 
		 * ### Binds event handlers
		 * 
		 * Setup does the event binding described in [jquery.control.listening Listening To Events].
		 * 
		 * @param {HTMLElement} element the element this instance operates on.
		 * @param {Object} [options] option values for the control.  These get added to
		 * this.options and merged with [jQuery.Control.static.defaults defaults].
		 * @return {Array} return an array if you wan to change what init is called with. By
		 * default it is called with the element and options passed to the control.
		 */
		setup: function( element, options ) {
			var funcName, ready, cls = this.constructor;

			//want the raw element here
			element = can.get(can.$(element),0);

			//set element and className on element
			var pluginname = cls.pluginName || cls._fullName;

			this.element = can.$(element)

			if(pluginname && pluginname !== 'can_control') {
				//set element and className on element
				this.element.addClass(pluginname);
			}
			
			//set in data
			var arr;
			(arr = can.data(this.element,"controls")) || can.data(this.element,"controls",arr = []);
			arr.push(this);

			
			/**
			 * @attribute options
			 * 
			 * Options are used to configure an control.  They are
			 * the 2nd argument
			 * passed to a control (or the first argument passed to the 
			 * [jquery.control.plugin control's jQuery plugin]).
			 * 
			 * For example:
			 * 
			 *     can.Control('Hello')
			 *     
			 *     var h1 = new Hello($('#content1'), {message: 'World'} );
			 *     equal( h1.options.message , "World" )
			 *     
			 *     var h2 = $('#content2').hello({message: 'There'})
			 *                            .control();
			 *     equal( h2.options.message , "There" )
			 * 
			 * Options are merged with [jQuery.Control.static.defaults defaults] in
			 * [jQuery.Control.prototype.setup setup].
			 * 
			 * For example:
			 * 
			 *     can.Control("Tabs", 
			 *     {
			 *        defaults : {
			 *          activeClass: "ui-active-state"
			 *        }
			 *     },
			 *     {
			 *        init : function(){
			 *          this.element.addClass(this.options.activeClass);
			 *        }
			 *     })
			 *     
			 *     $("#tabs1").tabs()                         // adds 'ui-active-state'
			 *     $("#tabs2").tabs({activeClass : 'active'}) // adds 'active'
			 *     
			 * Options are typically updated by calling 
			 * [jQuery.Control.prototype.update update];
			 *
			 */
			this.options = extend( extend(/*true,*/ {}, cls.defaults), options);

			


			// bind all event handlers
			this.on();

			/**
			 * @attribute element
			 * 
			 * The control instance's HTMLElement (or window) wrapped by the 
			 * util library for ease of use. It is set by the first
			 * parameter to `new can.Construct(element, options)` 
			 * in [can.Control::setup].  Control listens on `this.element`
			 * for events.
			 * 
			 * ### Quick Example
			 * 
			 * The following `HelloWorld` control sets the control`s text to "Hello World":
			 * 
			 *     HelloWorld = can.Control({
			 *       init : function(){
			 * 	       this.element.text('Hello World')
			 *       }
			 *     })
			 *     
			 *     // create the controller on the element
			 *     new HelloWorld(document.getElementById('#helloworld'))
			 * 
			 * 
			 * ## Wrapped NodeList
			 * 
			 * `this.element` is a wrapped NodeList of one HTMLELement (or window).  This
			 * is for convience in libraries like jQuery where all methods operate only on a
			 * NodeList.  To get the raw HTMLElement, write:
			 * 
			 *     this.element[0] //-> HTMLElement
			 * 
			 * The following details the NodeList used by each library with 
			 * an example of updating it's text:
			 * 
			 * __jQuery__ `jQuery( HTMLElement )`
			 * 
			 *     this.element.text("Hello World")
			 * 
			 * __Zepto__ `Zepto( HTMLElement )`
			 * 
			 *     this.element.text("Hello World")
			 * 
			 * __Dojo__ `new dojo.NodeList( HTMLElement )`
			 * 
			 *     // TODO
			 * 
			 * __Mootools__ `$$( HTMLElement )`
			 * 
			 *    this.element.empty().appendText("Hello World")
			 * 
			 * __YUI__ 
			 * 
			 *    // TODO
			 * 
			 * 
			 * ## Changing `this.element`
			 * 
			 * Sometimes you don't want what's passed to `new can.Control`
			 * to be this.element.  You can change this by overwriting
			 * setup or by unbinding, setting this.element, and rebinding.
			 * 
			 * ### Overwriting Setup
			 * 
			 * The following Combobox overwrites setup to wrap a
			 * select element with a div.  That div is used 
			 * as `this.element`. Notice how `destroy` sets back the
			 * original element.
			 * 
			 *     Combobox = can.Control({
			 *       setup : function(el, options){
			 *          this.oldElement = $(el);
			 *          var newEl = $('<div/>');
			 *          this.oldElement.wrap(newEl);
			 *          can.Controll.prototype.setup.call(this, newEl, options);
			 *       },
			 *       init : function(){
			 *          this.element //-> the div
			 *       },
			 *       ".option click" : function(){
			 *         // event handler bound on the div
			 *       },
			 *       destroy : function(){
			 *          var div = this.element; //save reference
			 *          can.Control.prototype.destroy.call(this);
			 *          div.replaceWith(this.oldElement);
			 *       }
			 *     })
			 * 
			 * ### unbining, setting, and rebinding.
			 * 
			 * You could also change this.element by calling
			 * [can.Control::off], setting this.element, and 
			 * then calling [can.Control::on] like:
			 * 
			 *     move : function(newElement) {
			 *        this.off();
			 *        this.element = $(newElement);
			 *        this.on();  
			 *     }
			 */
			return [this.element, this.options];
		},
		/**
		 * `this.on( [element, selector, eventName, handler] )` is used to rebind 
		 * all event handlers when [can.Control::options this.options] has changed.  It
		 * can also be used to bind or delegate from other elements or objects.
		 * 
		 * ## Rebinding
		 * 
		 * By using templated event handlers, a control can listen to objects outside
		 * `this.element`.  This is extremely common in MVC programming.  For example,
		 * the following control might listen to a task model's `completed` property and
		 * toggle a strike className like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed" : function(){
		 * 	       this.update();
		 *       },
		 *       update : function(){
		 *         if(this.options.task.completed){
		 * 	         this.element.addClass('strike')
		 * 	       } else {
		 *           this.element.removeClass('strike')
		 *         }
		 *       }
		 *     }) 
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({completed: 'true'}) 
		 *     })
		 * 
		 * To update the taskstriker's task, add a task method that updates
		 * this.options and calls rebind like:
		 * 
		 *     TaskStriker = can.Control({
		 *       "{task} completed" : function(){
		 * 	       this.update();
		 *       },
		 *       update : function(){
		 *         if(this.options.task.completed){
		 * 	         this.element.addClass('strike')
		 * 	       } else {
		 *           this.element.removeClass('strike')
		 *         }
		 *       },
		 *       task : function(newTask){
		 *         this.options.task = newTask;
		 *         this.on();
		 *         this.update();
		 *       }
		 *     });
		 * 
		 *     var taskstriker = new TaskStriker({ 
		 *       task: new Task({completed: true}) 
		 *     });
		 *     taskstriker.task( new TaskStriker({ 
		 *       task: new Task({completed: false}) 
		 *     }))
		 * 
		 * ## Adding new events
		 * 
		 * If events need to be bound to outside of the control and templated event handlers
		 * are not sufficent, you can call this.on to bind or delegate programatically:
		 * 
		 *     init: function() {
		 *        // calls somethingClicked(el,ev)
		 *        this.on('click','somethingClicked') 
		 *     
		 *        // calls function when the window is clicked
		 *        this.on(window, 'click', function(ev){
		 *          //do something
		 *        })
		 *     },
		 *     somethingClicked: function( el, ev ) {
		 *       
		 *     }
		 * 
		 * @param {HTMLElement|jQuery.fn|Object} [el=this.element] 
		 * The element to be bound.  If an eventName is provided,
		 * the control's element is used instead.
		 * @param {String} [selector] A css selector for event delegation.
		 * @param {String} [eventName] The event to listen for.
		 * @param {Function|String} [func] A callback function or the String name of a control function.  If a control
		 * function name is given, the control function is called back with the bound element and event as the first
		 * and second parameter.  Otherwise the function is called back like a normal bind.
		 * @return {Integer} The id of the binding in this._bindings
		 */
		on: function( el, selector, eventName, func ) {
			if( el === undefined ) {
				//adds bindings
				this.off();
				//go through the cached list of actions and use the processor to bind
				
				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element;
					
				for ( funcName in actions ) {
					if ( actions.hasOwnProperty(funcName) ) {
						ready = actions[funcName] || cls._action(funcName, this.options);
						bindings.push(
							ready.processor(ready.delegate || element, 
							                ready.parts[2], 
											ready.parts[1], 
											funcName, 
											this));
					}
				}
	
	
				//setup to be destroyed ... don't bind b/c we don't want to remove it
				var destroyCB = shifter(this,"destroy");
				can.bind.call(element,"destroyed", destroyCB);
				bindings.push(function( el ) {
					can.unbind.call(el,"destroyed", destroyCB);
				});
				return bindings.length;
			}
			if ( typeof el == 'string' ) {
				func = eventName;
				eventName = selector;
				selector = el;
				el = this.element;
			}
			
			if ( typeof func == 'string' ) {
				func = shifter(this,func);
			}
			this._bindings.push(binder(el, eventName, func, selector));
			return this._bindings.length;
		},
		/**
		 * @hide
		 * Unbinds all event handlers on the controller. You should never
		 * be calling this unless in use with [can.Control::on].
		 * 
		 * 
		 */
		off : function(){
			var el = can.get(this.element,0);
			each(this._bindings || [], function( key, value ) {
				value(el);
			});
			//adds bindings
			this._bindings = [];
		},
		/**
		 * @hide
		 * Update extends [jQuery.Control.prototype.options this.options] 
		 * with the `options` argument and rebinds all events.  It basically
		 * re-configures the control.
		 * 
		 * For example, the following control wraps a recipe form. When the form
		 * is submitted, it creates the recipe on the server.  When the recipe
		 * is `created`, it resets the form with a new instance.
		 * 
		 *     can.Control('Creator',{
		 *       "{recipe} created" : function(){
		 *         this.update({recipe : new Recipe()});
		 *         this.element[0].reset();
		 *         this.find("[type=submit]").val("Create Recipe")
		 *       },
		 *       "submit" : function(el, ev){
		 *         ev.preventDefault();
		 *         var recipe = this.options.recipe;
		 *         recipe.attrs( this.element.formParams() );
		 *         this.find("[type=submit]").val("Saving...")
		 *         recipe.save();
		 *       }
		 *     });
		 *     $('#createRecipes').creator({recipe : new Recipe()})
		 * 
		 * 
		 * @demo jquery/control/demo-update.html
		 * 
		 * Update is called if a control's [jquery.control.plugin jQuery helper] is 
		 * called on an element that already has a control instance
		 * of the same type. 
		 * 
		 * For example, a widget that listens for model updates
		 * and updates it's html would look like.  
		 * 
		 *     can.Control('Updater',{
		 *       // when the control is created, update the html
		 *       init : function(){
		 *         this.updateView();
		 *       },
		 *       
		 *       // update the html with a template
		 *       updateView : function(){
		 *         this.element.html( "content.ejs",
		 *                            this.options.model ); 
		 *       },
		 *       
		 *       // if the model is updated
		 *       "{model} updated" : function(){
		 *         this.updateView();
		 *       },
		 *       update : function(options){
		 *         // make sure you call super
		 *         this._super(options);
		 *          
		 *         this.updateView();
		 *       }
		 *     })
		 * 
		 *     // create the control
		 *     // this calls init
		 *     $('#item').updater({model: recipe1});
		 *     
		 *     // later, update that model
		 *     // this calls "{model} updated"
		 *     recipe1.update({name: "something new"});
		 *     
		 *     // later, update the control with a new recipe
		 *     // this calls update
		 *     $('#item').updater({model: recipe2});
		 *     
		 *     // later, update the new model
		 *     // this calls "{model} updated"
		 *     recipe2.update({name: "something newer"});
		 * 
		 * _NOTE:_ If you overwrite `update`, you probably need to call
		 * this._super.
		 * 
		 * ### Example
		 * 
		 *     can.Control("Thing",{
		 *       init: function( el, options ) {
		 *         alert( 'init:'+this.options.prop )
		 *       },
		 *       update: function( options ) {
		 *         this._super(options);
		 *         alert('update:'+this.options.prop)
		 *       }
		 *     });
		 *     $('#myel').thing({prop : 'val1'}); // alerts init:val1
		 *     $('#myel').thing({prop : 'val2'}); // alerts update:val2
		 * 
		 * @param {Object} options A list of options to merge with 
		 * [jQuery.Control.prototype.options this.options].  Often, this method
		 * is called by the [jquery.control.plugin jQuery helper function].
		 */
		update: function( options ) {
			extend(this.options, options);
			this.on();
		},
		/**
		 * `destroy` prepares a control for garbage collection and is a place to
		 * reset any changes the control has made.  
		 * 
		 * ## Automatic garbage collection
		 * 
		 * Destroy is called whenever a control's element is removed from the page using 
		 * the library's standard HTML modifier methods.  This means that you
		 * don't have to call destroy yourself and it 
		 * will be called automatically when appropriate.  
		 * 
		 * The following `Clicker` widget listens on the window for clicks and updates
		 * its element's innerHTML.  If we remove the element, the window's event handler
		 * is removed auto-magically:
		 *  
		 * 
		 *      Clickr = can.Control({
		 *       "{window} click" : function(){
		 * 	       this.element.html( this.count ? 
		 * 	                          this.count++ : this.count = 0)
		 *       }  
		 *     })
		 *     
		 *     // create a clicker on an element
		 *     new Clicker("#clickme");
		 * 
		 *     // remove the element
		 *     $('#clickme').remove();
		 * 
		 * 
		 * The methods you can use that will destroy controls automatically by library:
		 * 
		 * __jQuery and Zepto__
		 * 
		 *   - $.fn.remove
		 *   - $.fn.html
		 *   - $.fn.replaceWith
		 *   - $.fn.empty
		 * 
		 * __Dojo__
		 * 
		 *   - dojo.destroy
		 *   - dojo.empty
		 *   - dojo.place (with the replace option)
		 * 
		 * __Mootools__
		 * 
		 *   - Element.prototype.destroy
		 * 
		 * __YUI__
		 * 
		 *   - TODO!
		 * 
		 * 
		 * ## Teardown in Destroy
		 * 
		 * Sometimes, you want to reset a controlled element back to its
		 * original state when the control is destroyed.  Overwriting destroy
		 * lets you write teardown code of this manner.  __When overwriting
		 * destroy, make sure you call Control's base functionality__.
		 * 
		 * The following example changes an element's text when the control is
		 * created and sets it back when the control is removed:
		 * 
		 *     Changer = can.Control({
		 *       init : function(){
		 *         this.oldText = this.element.text();
		 *         this.element.text("Changed!!!")
		 *       },
		 *       destroy : function(){
		 *         this.element.text(this.oldText);
		 *         can.Control.prototype.destroy.call(this)
		 *     })
		 *     
		 *     // create a changer which changes #myel's text
		 *     var changer = new Changer('#myel')
		 * 
		 *     // destroy changer which will reset it
		 *     changer.destroy()
		 * 
		 * ## Base Functionality
		 * 
		 * Control prepares the control for garbage collection by:
		 * 
		 *   - unbinding all event handlers
		 *   - clearing references to this.element and this.options
		 *   - clearing the element's reference to the control
		 *   - removing it's [can.Control.pluginName] from the element's className
		 * 
		 */
		destroy: function() {
			var Class= this.constructor;

			var self = this,
				pluginName = Class.pluginName || Class._fullName,
				controls;
			
			// unbind bindings
			this.off();
			
			if(pluginName && pluginName !== 'can_control'){
				// remove the className
				this.element.removeClass(pluginName);
			}
			
			// remove from data
			var controls = can.data(this.element,"controls");
			controls.splice(can.inArray(this, controls),1);
			
			can.trigger( this, "destroyed"); //in case we want to know if the control is removed
			
			this.element = null;
		}
	});

	var processors = can.Control.processors,

	//------------- PROCESSSORS -----------------------------
	//processors do the binding.  They return a function that
	//unbinds when called.
	//the basic processor that binds events
	basicProcessor = function( el, event, selector, methodName, control ) {
		return binder(el, event, shifter(control, methodName), selector);
	};




	//set common events to be processed as a basicProcessor
	each("change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset resize scroll select submit focusin focusout mouseenter mouseleave".split(" "), function( i, v ) {
		processors[v] = basicProcessor;
	});
	

	

});