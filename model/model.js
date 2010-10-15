/*global OpenAjax: true */

steal.plugins('jquery/class', 'jquery/lang').then(function() {
	//a cache for attribute capitalization ... slowest part of init.
	var underscore = $.String.underscore,
		classize = $.String.classize;

	/**
	 * @tag core
	 * @download jquery/dist/jquery.model.js
	 * @test jquery/model/qunit.html
	 * @plugin jquery/model
	 * 
	 * Models wrap an application's data layer.  In large applications, a model is critical for:
	 * 
	 *  - Encapsulating services so controllers + views don't care where data comes from.
	 *    
	 *  - Providing helper functions that make manipulating and abstracting raw service data easier.
	 * 
	 * This is done in two ways:
	 * 
	 *  - Requesting data from and interacting with services
	 *  
	 *  - Converting or wrapping raw service data into a more useful form.
	 * 
	 * 
	 * ## Basic Use
	 * 
	 * The [jQuery.Model] class provides a basic skeleton to organize pieces of your application's data layer.
	 * First, consider doing Ajax <b>without</b> a model.  In our imaginary app, you:
	 * 
	 *  - retrieve a list of tasks</li>
	 *  - display the number of days remaining for each task
	 *  - mark tasks as complete after users click them
	 * 
	 * Let's see how that might look without a model:
	 * 
	 * @codestart
	 * $.Controller.extend("MyApp.Controllers.Tasks",{onDocument: true},
	 * {
	 *   // get tasks when the page is ready 
	 *   ready: function() {
	 *     $.get('/tasks.json', this.callback('gotTasks'), 'json')
	 *   },
	 *  |* 
	 *   * assume json is an array like [{name: "trash", due_date: 1247111409283}, ...]
	 *   *|
	 *  gotTasks: function( json ) { 
	 *     for(var i =0; i < json.length; i++){
	 *       var taskJson = json[i];
	 *       
	 *       //calculate time remaining
	 *       var remaininTime = new Date() - new Date(taskJson.due_date);
	 *       
	 *       //append some html
	 *       $("#tasks").append("&lt;div class='task' taskid='"+taskJson.id+"'>"+
	 *                           "&lt;label>"+taskJson.name+"&lt;/label>"+
	 *                           "Due Date = "+remaininTime+"&lt;/div>")
	 *     }
	 *   },
	 *   // when a task is complete, get the id, make a request, remove it
	 *   ".task click" : function( el ) {
	 *     $.post('/task_complete',{id: el.attr('data-taskid')}, function(){
	 *       el.remove();
	 *     })
	 *   }
	 * })
	 * @codeend
	 * 
	 * This code might seem fine for right now, but what if:
	 * 
	 *  - The service changes?
	 *  - Other parts of the app want to calculate <code>remaininTime</code>?
	 *  - Other parts of the app want to get tasks?</li>
	 *  - The same task is represented multiple palces on the page?
	 * 
	 * The solution is of course a strong model layer.  Lets look at what a
	 * a good model does for a controller before we learn how to make one:
	 * 
	 * @codestart
	 * $.Controller.extend("MyApp.Controllers.Tasks",{onDocument: true},
	 * {
	 *   load: function() {
	 *     Task.findAll({},this.callback('list'))
	 *   },
	 *   list: function( tasks ) {
	 *     $("#tasks").html(this.view(tasks))
	 *   },
	 *   ".task click" : function( el ) {
	 *     el.models()[0].complete(function(){
	 *       el.remove();
	 *     });
	 *   }
	 * })
	 * @codeend
	 * 
	 * In views/tasks/list.ejs
	 * 
	 * @codestart html
	 * &lt;% for(var i =0; i &lt; tasks.length; i++){ %>
	 * &lt;div class='task &lt;%= tasks[i].<b>identity</b>() %>'>
	 *    &lt;label>&lt;%= tasks[i].name %>&lt;/label>
	 *    &lt;%= tasks[i].<b>timeRemaining</b>() %>
	 * &lt;/div>
	 * &lt;% } %>
	 * @codeend
	 * 
	 * Isn't that better!  Granted, some of the improvement comes because we used a view, but we've
	 * also made our controller completely understandable.  Now lets take a look at the model:
	 * 
	 * @codestart
	 * $.Model.extend("Task",
	 * {
	 *  findAll: function( params,success ) {
	 *   $.get("/tasks.json", params, this.callback(["wrapMany",success]),"json");
	 *  }
	 * },
	 * {
	 *  timeRemaining: function() {
	 *   return new Date() - new Date(this.due_date)
	 *  },
	 *  complete: function( success ) {
	 *   $.get("/task_complete", {id: this.id }, success,"json");
	 *  }
	 * })
	 * @codeend
	 * 
	 * There, much better!  Now you have a single place where you can organize Ajax functionality and
	 * wrap the data that it returned.  Lets go through each bolded item in the controller and view.<br/>
	 * 
	 * ### Task.findAll
	 * 
	 * The findAll function requests data from "/tasks.json".  When the data is returned, it it is run through
	 * the "wrapMany" function before being passed to the success callback.<br/>
	 * If you don't understand how the callback works, you might want to check out 
	 * [jQuery.Model.static.wrapMany wrapMany] and [jQuery.Class.static.callback callback].
	 * 
	 * ### el.models
	 * 
	 * [jQuery.fn.models models] is a jQuery helper that returns model instances.  It uses
	 * the jQuery's elements' shortNames to find matching model instances.  For example:
	 * 
	 * @codestart html
	 * &lt;div class='task task_5'> ... &lt;/div>
	 * @codeend
	 * 
	 * It knows to return a task with id = 5.
	 * 
	 * ### complete
	 * 
	 * This should be pretty obvious.
	 * 
	 * ### identity
	 * 
	 * [jQuery.Model.prototype.identity Identity] returns a unique identifier that [jQuery.fn.models] can use
	 * to retrieve your model instance.
	 * 
	 * ### timeRemaining
	 * 
	 * timeRemaining is a good example of wrapping your model's raw data with more useful functionality.
	 * ## Validations
	 * 
	 * You can validate your model's attributes with another plugin.  See [validation].
	 */


	jQuery.Class.extend("jQuery.Model",
	/** 
	 * @Static
	 */
	{
		setup: function( superClass ) {

			//we do not inherit attributes (or associations)
			if (!this.attributes || superClass.attributes === this.attributes ) {
				this.attributes = {};
			}

			if (!this.associations || superClass.associations === this.associations ) {
				this.associations = {};
			}
			if (!this.validations || superClass.validations === this.validations ) {
				this.validations = {};
			}

			//add missing converters
			if ( superClass.convert != this.convert ) {
				this.convert = $.extend(superClass.convert, this.convert);
			}


			this._fullName = underscore(this.fullName.replace(/\./g, "_"));

			if ( this.fullName.substr(0, 7) == "jQuery." ) {
				return;
			}

			//add this to the collection of models
			jQuery.Model.models[this._fullName] = this;

			if ( this.listType ) {
				this.list = new this.listType([]);
			}

		},
		/**
		 * @attribute attributes
		 * Attributes contains a list of properties and their types
		 * for this model.  You can use this in conjunction with 
		 * [jQuery.Model.static.convert] to provide automatic 
		 * [jquery.model.typeconversion type conversion].  
		 * 
		 * The following converts dueDates to JavaScript dates:
		 * 
		 * @codestart
		 * $.Model.extend("Contact",{
		 *   attributes : { 
		 *     birthday : 'date'
		 *   },
		 *   convert : {
		 *     date : function(raw){
		 *       if(typeof raw == 'string'){
		 *         var matches = raw.match(/(\d+)-(\d+)-(\d+)/)
		 *         return new Date( matches[1], 
		 *                  (+matches[2])-1, 
		 *                 matches[3] )
		 *       }else if(raw instanceof Date){
		 *           return raw;
		 *       }
		 *     }
		 *   }
		 * },{})
		 * @codeend
		 */
		attributes: {},
		/**
		 * @attribute defaults
		 * An object of default values to be set on all instances.  This 
		 * is useful if you want some value to be present when new instances are created.
		 * 
		 * @codestart
		 * $.Model.extend("Recipe",{
		 *   defaults : {
		 *     createdAt : new Date();
		 *   }
		 * },{})
		 * 
		 * var recipe = new Recipe();
		 * 
		 * recipe.createdAt //-> date
		 * 
		 * @codeend
		 */
		defaults: {},
		/**
		 * Wrap is used to create a new instance from data returned from the server.
		 * It is very similar to doing <code> new Model(attributes) </code> 
		 * except that wrap will check if the data passed has an
		 * 
		 * - attributes,
		 * - data, or
		 * - <i>singularName</i>
		 * 
		 * property.  If it does, it will use that objects attributes.
		 * 
		 * Wrap is really a convience method for servers that don't return just attributes.
		 * 
		 * @param {Object} attributes
		 * @return {Model} an instance of the model
		 */
		wrap: function( attributes ) {
			if (!attributes ) {
				return null;
			}
			return new this(
			// checks for properties in an object (like rails 2.0 gives);
			attributes[this.singularName] || attributes.data || attributes.attributes || attributes);
		},
		/**
		 * Takes raw data from the server, and returns an array of model instances.
		 * Each item in the raw array becomes an instance of a model class.
		 * 
		 * @codestart
		 * $.Model.extend("Recipe",{
		 *   helper : function(){
		 *     return i*i;
		 *   }
		 * })
		 * 
		 * var recipes = Recipe.wrapMany([{id: 1},{id: 2}])
		 * recipes[0].helper() //-> 1
		 * @codeend
		 * 
		 * If an array is not passed to wrapMany, it will look in the object's .data
		 * property.  
		 * 
		 * For example:
		 * 
		 * @codestart
		 * var recipes = Recipe.wrapMany({data: [{id: 1},{id: 2}]})
		 * recipes[0].helper() //-> 1
		 * @codeend
		 * 
		 * @param {Array} instancesRawData an array of raw name - value pairs.
		 * @return {Array} a JavaScript array of instances or a [jQuery.Model.List list] of instances
		 *  if the model list plugin has been included.
		 */
		wrapMany: function( instancesRawData ) {
			if (!instancesRawData ) {
				return null;
			}
			var listType = this.List || $.Model.List || Array,
				res = new listType(),
				arr = $.isArray(instancesRawData),
				raw = arr ? instancesRawData : instancesRawData.data,
				length = raw.length,
				i = 0;

			res._use_call = true; //so we don't call next function with all of these
			for (; i < length; i++ ) {
				res.push(this.wrap(raw[i]));
			}
			if (!arr ) { //push other stuff onto array
				for ( var prop in instancesRawData ) {
					if ( prop !== 'data' ) {
						res[prop] = instancesRawData[prop];
					}

				}
			}
			return res;
		},
		/**
		 * The name of the id field.  Defaults to 'id'. Change this if it is something different.
		 * 
		 * For example, it's common in .NET to use Id.  Your model might look like:
		 * 
		 * @codestart
		 * $.Model.extend("Friends",{
		 *   id: "Id"
		 * },{});
		 * @codeend
		 */
		id: 'id',
		//if null, maybe treat as an array?
		/**
		 * Adds an attribute to the list of attributes for this class.
		 * @hide
		 * @param {String} property
		 * @param {String} type
		 */
		addAttr: function( property, type ) {
			var stub;

			if ( this.associations[property] ) {
				return;
			}
			stub = this.attributes[property] || (this.attributes[property] = type);
			return type;
		},
		// a collection of all models
		models: {},
		/**
		 * If OpenAjax is available,
		 * publishes to OpenAjax.hub.  Always adds the shortName.event.
		 * 
		 * @codestart
		 * // publishes contact.completed
		 * Namespace.Contact.publish("completed",contact);
		 * @codeend
		 * 
		 * @param {String} event The event name to publish
		 * @param {Object} data The data to publish
		 */
		publish: function( event, data ) {
			//@steal-remove-start
			steal.dev.log("Model.js - publishing " + underscore(this.shortName) + "." + event);
			//@steal-remove-end
			if ( window.OpenAjax ) {
				OpenAjax.hub.publish(underscore(this.shortName) + "." + event, data);
			}

		},
		/**
		 * @hide
		 * Guesses the type of an object.  This is what sets the type if not provided in 
		 * [jQuery.Model.static.attributes].
		 * @param {Object} object the object you want to test.
		 * @return {String} one of string, object, date, array, boolean, number, function
		 */
		guessType: function( object ) {
			if ( typeof object != 'string' ) {
				if ( object === null ) {
					return typeof object;
				}
				if ( object.constructor == Date ) {
					return 'date';
				}
				if ( $.isArray(object) ) {
					return 'array';
				}
				return typeof object;
			}
			if ( object === "" ) {
				return 'string';
			}
			//check if true or false
			if ( object == 'true' || object == 'false' ) {
				return 'boolean';
			}
			if (!isNaN(object) && isFinite(+object) ) {
				return 'number';
			}
			return typeof object;
		},
		/**
		 * @attribute convert
		 * @type Object
		 * An object of name-function pairs that are used to convert attributes.
		 * Check out [jQuery.Model.static.attributes] or 
		 * [jquery.model.typeconversion type conversion]
		 * for examples.
		 */
		convert: {
			"date": function( str ) {
				return typeof str === "string" ? (isNaN(Date.parse(str)) ? null : Date.parse(str)) : str;
			},
			"number": function( val ) {
				return parseFloat(val);
			},
			"boolean": function( val ) {
				return Boolean(val);
			}
		},
		/**
		 * Implement this function!
		 * Create is called by save to create a new instance.  If you want to be able to call save on an instance
		 * you have to implement create.
		 */
		create: function( attrs, success, error ) {
			throw "Model: Implement Create";
		},
		/**
		 * Implement this function!
		 * Update is called by save to update an instance.  If you want to be able to call save on an instance
		 * you have to implement update.
		 */
		update: function( id, attrs, success, error ) {
			throw "Model: Implement " + this.fullName + "'s \"update\"!";
		},
		/**
		 * Implement this function!
		 * Destroy is called by destroy to remove an instance.  If you want to be able to call destroy on an instance
		 * you have to implement update.
		 * @param {String|Number} id the id of the instance you want destroyed
		 */
		destroy: function( id, success, error ) {
			throw "Model: Implement " + this.fullName + "'s \"destroy\"!";
		},
		/**
		 * Implement this function!
		 * @param {Object} params
		 * @param {Function} success
		 * @param {Function} error
		 */
		findAll: function( params, success, error ) {

		},
		/**
		 * Implement this function!
		 * @param {Object} params
		 * @param {Function} success
		 * @param {Function} error
		 */
		findOne: function( params, success, error ) {

		}
	},
	/**
	 * @Prototype
	 */
	{
		/**
		 * Setup is called when a new model instance is created.
		 * It adds default attributes, then whatever attributes
		 * are passed to the class.
		 * Setup should never be called directly.
		 * 
		 * @codestart
		 * $.Model.extend("Recipe")
		 * var recipe = new Recipe({foo: "bar"});
		 * recipe.foo //-> "bar"
		 * recipe.attr("foo") //-> "bar"
		 * @codeend
		 * 
		 * @param {Object} attributes a hash of attributes
		 */
		setup: function( attributes ) {
			var stub;

			// so we know not to fire events
			this._initializing = true;

			stub = this.Class.defaults && this.attrs(this.Class.defaults);

			this.attrs(attributes);
			delete this._initializing;
		},
		/**
		 * Sets the attributes on this instance and calls save.
		 * The instance needs to have an id.  It will use
		 * the instance class's [jQuery.Model.static.update update]
		 * method.
		 * 
		 * @codestart
		 * recipe.update({name: "chicken"}, success, error);
		 * @codeend
		 * 
		 * If OpenAjax.hub is available, the model will also
		 * publish a "<i>modelName</i>.updated" message with
		 * the updated instance.
		 * 
		 * @param {Object} attrs the model's attributes
		 * @param {Function} success called if a successful update
		 * @param {Function} error called if there's an error
		 */
		update: function( attrs, success, error ) {
			this.attrs(attrs);
			return this.save(success, error); //on success, we should 
		},
		/**
		 * Runs the validations on this model.  You can
		 * also pass it an array of attributes to run only those attributes.
		 * It returns nothing if there are no errors, or an object
		 * of errors by attribute.
		 * 
		 * To use validations, it's suggested you use the 
		 * model/validations plugin.
		 * 
		 * @codestart
		 * $.Model.extend("Task",{
		 *   init : function(){
		 *     this.validatePresenceOf("dueDate")
		 *   }
		 * },{});
		 * 
		 * var task = new Task(),
		 *     errors = task.errors()
		 * 
		 * errors.dueDate[0] //-> "can't be empty"
		 * @codeend
		 */
		errors: function( attrs ) {
			if ( attrs ) {
				attrs = $.isArray(attrs) ? attrs : $.makeArray(arguments);
			}
			var errors = {},
				self = this,
				addErrors = function( attr, funcs ) {
					$.each(funcs, function( i, func ) {
						var res = func.call(self);
						if ( res ) {
							if (!errors.hasOwnProperty(attr) ) {
								errors[attr] = [];
							}

							errors[attr].push(res);
						}

					});
				};

			$.each(attrs || this.Class.validations || {}, function( attr, funcs ) {
				if ( typeof attr == 'number' ) {
					attr = funcs;
					funcs = self.Class.validations[attr];
				}
				addErrors(attr, funcs || []);
			});

			for ( var attr in errors ) {
				if ( errors.hasOwnProperty(attr) ) {
					return errors;
				}
			}
			return null;
		},
		/**
		 * Gets or sets an attribute on the model using setters and 
		 * getters if available.
		 * 
		 * @codestart
		 * $.Model.extend("Recipe")
		 * var recipe = new Recipe();
		 * recipe.attr("foo","bar")
		 * recipe.foo //-> "bar"
		 * recipe.attr("foo") //-> "bar"
		 * @codeend
		 * 
		 * ## Setters
		 * 
		 * If you add a set<i>AttributeName</i> method on your model,
		 * it will be used to set the value.  The set method is called
		 * with the value and is expected to return the converted value.
		 * 
		 * @codestart
		 * $.Model.extend("Recipe",{
		 *   setCreatedAt : function(raw){
		 *     return Date.parse(raw)
		 *   }
		 * })
		 * var recipe = new Recipe();
		 * recipe.attr("createdAt","Dec 25, 1995")
		 * recipe.createAt //-> Date
		 * @codeend
		 * 
		 * ## Asynchronous Setters
		 * 
		 * Sometimes, you want to perform an ajax request when 
		 * you set a property.  You can do this with setters too.
		 * 
		 * To do this, your setter should return undefined and
		 * call success with the converted value.  For example:
		 * 
		 * @codestart
		 * $.Model.extend("Recipe",{
		 *   setTitle : function(title, success, error){
		 *     $.post(
		 *       "recipe/update/"+this.id+"/title",
		 *       title,
		 *       function(){
		 *         success(title);
		 *       },
		 *       "json")
		 *   }
		 * })
		 * 
		 * recipe.attr("title","fish")
		 * @codeend
		 * 
		 * ## Events
		 * 
		 * When you use attr, it can also trigger events.  This is
		 * covered in [jQuery.Model.prototype.bind].
		 * 
		 * @param {String} attribute the attribute you want to set or get
		 * @param {String|Number|Boolean} [value] value the value you want to set.
		 * @param {Function} [success] an optional success callback.  
		 *    This gets called if the attribute was successful.
		 * @param {Function} [error] an optional success callback.  
		 *    The error function is called with validation errors.
		 */
		attr: function( attribute, value, success, error ) {
			var cap = classize(attribute),
				get = "get" + cap;
			if ( value !== undefined ) {
				this._setProperty(attribute, value, success, error, cap);
				return this;
			}
			return this[get] ? this[get]() : this[attribute];
		},
		/**
		 * Binds to events on this model instance.  Typically 
		 * you'll bind to an attribute name.  Handler will be called
		 * every time the attribute value changes.  For example:
		 * 
		 * @codestart
		 * $.Model.extend("School")
		 * var school = new School();
		 * school.bind("address", function(ev, address){
		 *   alert('address changed to '+address);
		 * })
		 * school.attr("address","1124 Park St");
		 * @codeend
		 * 
		 * You can also bind to attribute errors.
		 * 
		 * @codestart
		 * $.Model.extend("School",{
		 *   setName : function(name, success, error){
		 *     if(!name){
		 *        error("no name");
		 *     }
		 *     return error;
		 *   }
		 * })
		 * var school = new School();
		 * school.bind("error.name", function(ev, mess){
		 *    mess // -> "no name";
		 * })
		 * school.attr("name","");
		 * @codeend
		 * 
		 * You can also bind to created, updated, and destroyed events.
		 * 
		 * @param {String} eventType the name of the event.
		 * @param {Function} handler a function to call back when an event happens on this model.
		 * @return {model} the model instance for chaining
		 */
		bind: function( eventType, handler ) {
			var wrapped = $(this);
			wrapped.bind.apply(wrapped, arguments);
			return this;
		},
		/**
		 * Unbinds an event handler from this instance.
		 * Read [jQuery.Model.prototype.bind] for 
		 * more information.
		 * @param {String} eventType
		 * @param {Function} handler
		 */
		unbind: function( eventType, handler ) {
			var wrapped = $(this);
			wrapped.unbind.apply(wrapped, arguments);
			return this;
		},
		/**
		 * Checks if there is a set_<i>property</i> value.  If it returns true, lets it handle; otherwise
		 * saves it.
		 * @hide
		 * @param {Object} property
		 * @param {Object} value
		 */
		_setProperty: function( property, value, success, error, capitalized ) {
			// the potential setter name
			var setName = "set" + capitalized,
				//the old value
				old = this[property],
				self = this,
				errorCallback = function( errors ) {
					var stub;
					stub = error && error.call(self, errors);
					$(self).triggerHandler("error." + property, errors);
				};

			// if the setter returns nothing, do not set
			// we might want to indicate if this was set ok
			if ( this[setName] && (value = this[setName](value, this.callback('_updateProperty', property, value, old, success, errorCallback), errorCallback)) === undefined ) {
				return;
			}
			this._updateProperty(property, value, old, success, errorCallback);
		},
		/**
		 * Triggers events when a property has been updated
		 * @hide
		 * @param {Object} property
		 * @param {Object} value
		 * @param {Object} old
		 * @param {Object} success
		 */
		_updateProperty: function( property, value, old, success, errorCallback ) {
			var Class = this.Class,
				val, type = Class.attributes[property] || Class.addAttr(property, Class.guessType(value)),
				//the converter
				converter = Class.convert[type],
				errors = null,
				stub;

			val = this[property] = (value === null ? //if the value is null or undefined
			null : // it should be null
			(converter ? converter.call(Class, value) : //convert it to something useful
			value)); //just return it
			//validate (only if not initializing, this is for performance)
			if (!this._initializing ) {
				errors = this.errors(property);
			}

			if ( errors ) {
				errorCallback(errors);
			} else {
				if ( old !== val && !this._initializing ) {
					$(this).triggerHandler(property, val);
				}
				stub = success && success(this);

			}

			//if this class has a global list, add / remove from the list.
			if ( property == Class.id && val !== null && Class.list ) {
				// if we didn't have an old id, add ourselves
				if (!old ) {
					Class.list.push(this);
				} else if ( old != val ) {
					// if our id has changed ... well this should be ok
					Class.list.remove(old);
					Class.list.push(this);
				}
			}

		},
		/**
		 * Gets or sets a list of attributes. 
		 * Each attribute is set with [jQuery.Model.prototype.attr attr].
		 * 
		 * @codestart
		 * recipe.attrs({
		 *   name: "ice water",
		 *   instructions : "put water in a glass"
		 * })
		 * @codeend
		 * 
		 * @param {Object} [attributes]  if present, the list of attributes to send
		 * @return {Object} the current attributes of the model
		 */
		attrs: function( attributes ) {
			var key;
			if (!attributes ) {
				attributes = {};
				for ( key in this.Class.attributes ) {
					if ( this.Class.attributes.hasOwnProperty(key) ) {
						attributes[key] = this.attr(key);
					}
				}
			} else {
				var idName = this.Class.id;
				//always set the id last
				for ( key in attributes ) {
					if ( key != idName ) {
						this.attr(key, attributes[key]);
					}
				}
				if ( idName in attributes ) {
					this.attr(idName, attributes[idName]);
				}

			}
			return attributes;
		},
		/**
		 * Returns if the instance is a new object
		 */
		isNew: function() {
			return (this[this.Class.id] === undefined); //if null or undefined
		},
		/**
		 * Saves the instance if there are no errors.  
		 * If the instance is new, [jQuery.Model.static.create] is
		 * called; otherwise, [jQuery.Model.static.update] is
		 * called.
		 * 
		 * @codestart
		 * recipe.save(success, error);
		 * @codeend
		 * 
		 * If OpenAjax.hub is available, after a successful create or update, 
		 * "<i>modelName</i>.created" or "<i>modelName</i>.updated" is published.
		 * 
		 * @param {Function} [success] called if a successful save.
		 * @param {Function} [error] called if the save was not successful.
		 */
		save: function( success, error ) {
			var stub;

			if ( this.errors() ) {
				//needs to send errors
				return false;
			}
			stub = this.isNew() ? this.Class.create(this.attrs(), this.callback(['created', success]), error) : this.Class.update(this[this.Class.id], this.attrs(), this.callback(['updated', success]), error);

			//this.is_new_record = this.Class.new_record_func;
			return true;
		},

		/**
		 * Destroys the instance by calling 
		 * [jQuery.Model.static.destroy] with the id of the instance.
		 * 
		 * @codestart
		 * recipe.destroy(success, error);
		 * @codeend
		 * 
		 * If OpenAjax.hub is available, after a successful
		 * destroy "<i>modelName</i>.destroyed" is published
		 * with the model instance.
		 * 
		 * @param {Function} [success] called if a successful destroy
		 * @param {Function} [error] called if an unsuccessful destroy
		 */
		destroy: function( success, error ) {
			this.Class.destroy(this[this.Class.id], this.callback(["destroyed", success]), error);
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
		identity: function() {
			var id = this[this.Class.id];
			return this.Class._fullName + '_' + (this.Class.escapeIdentity ? encodeURIComponent(id) : id);
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
		elements: function( context ) {
			return $("." + this.identity(), context);
		},
		/**
		 * Publishes to open ajax hub
		 * @param {String} event
		 * @param {Object} [opt6] data if missing, uses the instance in {data: this}
		 */
		publish: function( event, data ) {
			this.Class.publish(event, data || this);
		},
		hookup: function( el ) {
			var shortName = underscore(this.Class.shortName),
				models = $.data(el, "models") || $.data(el, "models", {});
			$(el).addClass(shortName + " " + this.identity());
			models[shortName] = this;
		}
	});

	$.each([
	/**
	 * @function created
	 * @hide
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
	"created",
	/**
	 * @function updated
	 * @hide
	 * Called by save after an instance is updated.  Publishes 'updated'.
	 * @param {Object} attrs
	 */
	"updated",
	/**
	 * @function destroyed
	 * @hide
	 * Called after an instance is destroyed.  Publishes
	 * "shortName.destroyed"
	 */
	"destroyed"], function( i, funcName ) {
		$.Model.prototype[funcName] = function( attrs ) {
			var stub;

			if ( funcName === 'destroyed' && this.Class.list ) {
				this.Class.list.remove(this[this.Class.id]);
			}
			$(this).triggerHandler(funcName);
			stub = attrs && typeof attrs == 'object' && this.attrs(attrs.attrs ? attrs.attrs() : attrs);
			this.publish(funcName, this);
			return [this].concat($.makeArray(arguments));
		};
	});

	/**
	 *  @add jQuery.fn
	 */
	// break
	/**
	 * @function models
	 * Returns a list of models.  If the models are of the same
	 * type, and have a [jQuery.Model.List], it will return 
	 * the models wrapped with the list.
	 * 
	 * @codestart
	 * $(".recipes").models() //-> [recipe, ...]
	 * @codeend
	 * 
	 * @param {jQuery.Class} [type] if present only returns models of the provided type.
	 * @return {Array|jQuery.Model.List} returns an array of model instances that are represented by the contained elements.
	 */
	$.fn.models = function( type ) {
		//get it from the data
		var collection = [],
			kind, ret, retType;
		this.each(function() {
			$.each($.data(this, "models") || {}, function( name, instance ) {
				//either null or the list type shared by all classes
				kind = kind === undefined ? instance.Class.List || null : (instance.Class.List === kind ? kind : null);
				collection.push(instance);
			});
		});

		retType = kind || $.Model.List || Array;
		ret = new retType();

		ret.push.apply(ret, $.unique(collection));
		return ret;
	};
	/**
	 * @function model
	 * 
	 * Returns the first model instance found from [jQuery.fn.models].
	 * 
	 * @param {Object} type
	 */
	$.fn.model = function( type ) {
		if ( type && type instanceof $.Model ) {
			type.hookup(this[0]);
			return this;
		} else {
			return this.models.apply(this, arguments)[0];
		}

	};
});