steal.plugins('jquery/class', 'jquery/lang', 'jquery/event/destroyed').then(function( $ ) {

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
			//@steal-remove-start
			if (!$.isArray(this.listensTo) ) {
				throw "listensTo is not an array in " + this.fullName;
			}
			//@steal-remove-end
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
			var convertedName = options ? methodName.replace(parameterReplacer, function( whole, inside ) {
				//convert inside to type
				return $.Class.getObject(inside, options).toString(); //gets the value in options
			}) : methodName,
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

});