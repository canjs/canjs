steal.plugins('jquery', 'jquery/class', 'jquery/lang', 'jquery/lang/openajax').then(function() {
	//a cache for attribute capitalization ... slowest part of inti.
	var underscore = $.String.underscore,
		classize = $.String.classize;

	/**
	 * @tag core
	 * Models wrap an application's data layer.  In large applications, a model is critical for:
	 * <ul>
	 * 	<li>Abstracting service dependencies inside the model, making it so
	 *      Controllers + Views don't care where data comes from.</li>
	 *  <li>Providing helper functions that make manipulating and abstracting raw service data easier.</li>
	 * </ul>
	 * This is done in two ways:
	 * <ul>
	 *     <li>Requesting data from and interacting with services</li>
	 *     <li>Converting or wrapping raw service data into a more useful form.</li>
	 * </ul>
	 * 
	 * <h2>Basic Use</h2>
	 * 
	 * The [jQuery.Model] class provides a basic skeleton to organize pieces of your application's data layer.
	 * First, consider doing Ajax <b>without</b> a model.  In our imaginary app, you:
	 * <ul>
	 *   <li>retrieve a list of tasks</li>
	 *   <li>display the number of days remaining for each task</li>
	 *   <li>mark tasks as complete after users click them</li>
	 * </ul>
	 * Let's see how that might look without a model:
	 * @codestart
	 * $.Controller.extend("MyApp.Controllers.Tasks",{onDocument: true},
	 * {
	 *   // get tasks when the page is ready 
	 *   ready: function() {
	 *     $.get('/tasks.json', this.callback('gotTasks'), 'json')
	 *   },
	 *  /* 
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
	 * This code might seem fine for right now, but what if:
	 * <ul>
	 * 	<li>The service changes?</li>
	 * 	<li>Other parts of the app want to calculate <code>remaininTime</code>?</li>
	 * 	<li>Other parts of the app want to get tasks?</li>
	 * 	<li>The same task is represented multiple palces on the page?</li>
	 * </ul>
	 * The solution is of course a strong model layer.  Lets look at what a
	 * a good model does for a controller before we learn how to make one:
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
	 * In views/tasks/list.ejs
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
	 * @codestart
	 * $.Model.extend("Task",
	 * {
	 * 	findAll: function( params,success ) {
	 * 		$.get("/tasks.json", params, this.callback(["wrapMany",success]),"json");
	 * 	}
	 * },
	 * {
	 * 	timeRemaining: function() {
	 * 		return new Date() - new Date(this.due_date)
	 * 	},
	 * 	complete: function( success ) {
	 * 		$.get("/task_complete", {id: this.id }, success,"json");
	 * 	}
	 * })
	 * @codeend
	 * There, much better!  Now you have a single place where you can organize Ajax functionality and
	 * wrap the data that it returned.  Lets go through each bolded item in the controller and view.<br/>
	 * 
	 * <h3>Task.findAll</h3>
	 * The findAll function requests data from "/tasks.json".  When the data is returned, it it is run through
	 * the "wrapMany" function before being passed to the success callback.<br/>
	 * If you don't understand how the callback works, you might want to check out 
	 * [jQuery.Model.static.wrapMany wrapMany] and [jQuery.Class.static.callback callback].
	 * <h3>el.models</h3>
	 * [jQuery.fn.models models] is a jQuery helper that returns model instances.  It uses
	 * the jQuery's elements' shortNames to find matching model instances.  For example:
	 * @codestart html
	 * &lt;div class='task task_5'> ... &lt;/div>
	 * @codeend
	 * It knows to return a task with id = 5.
	 * <h3>complete</h3>
	 * This should be pretty obvious.
	 * <h3>identity</h3>
	 * [jQuery.Model.prototype.identity Identity] returns a unique identifier that [jQuery.fn.models] can use
	 * to retrieve your model instance.
	 * <h3>timeRemaining</h3>
	 * timeRemaining is a good example of wrapping your model's raw data with more useful functionality.
	 * <h2>Validations</h2>
	 * You can validate your model's attributes with another plugin.  See [validation].
	 */


	jQuery.Class.extend("jQuery.Model",
	/** 
	 * @Static
	 */
	{
		setup: function(superClass) {
			// clear everything that shouldn't be reused
			this.validations = [];
			//we do not inherit attributes (or associations)
			if(!this.attributes || superClass.attributes === this.attributes){
				this.attributes = {};
			}
			
			if(!this.associations || superClass.associations === this.associations){
				this.associations = {};
			}
			
			//add missing converters
			if(superClass.convert != this.convert){
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
		 * @attribute defaults
		 * An object of default values to be set on all instances.
		 */
		defaults: {},
		/**
		 * Used to create an existing object from attributes
		 * @param {Object} attributes
		 * @return {Model} an instance of the model
		 */
		wrap: function( attributes ) {
			if (!attributes ) {
				return null;
			}
			return new this(
			// checks for properties in an object (like rails 2.0 gives);
			attributes[this.singularName] || attributes.attributes || attributes);
		},
		/**
		 * Creates many instances
		 * @param {Array} instancesRawData an array of raw name - value pairs.
		 * @return {Array} an array of instances of the model
		 */
		wrapMany: function( instances ) {
			if (!instances ) return null;
			var res = new(this.List || Array),
				arr = $.isArray(instances),
				raw = arr ? instances : instances.data,
				length = raw.length,
				i = 0;
			res._use_call = true; //so we don't call next function with all of these
			for (; i < length; i++ ) {
				res.push(this.wrap(raw[i]));
			}
			if (!arr ) { //push other stuff onto array
				for ( var prop in instances ) {
					if ( prop !== 'data' ) {
						res[prop] = instances[prop];
					}

				}
			}
			return res; //model list?
		},
		/**
		 * The name of the id field.  Defaults to 'id'.  Change this if it is something different.
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
			if ( this.associations[property] ) return;
			this.attributes[property] || (this.attributes[property] = type);
			return type
		},
		models: {},
		/**
		 * Publishes to open ajax hub.  Always adds the shortName.event
		 * @param {Object} event
		 * @param {Object} data
		 */
		publish: function( event, data ) {
			//@steal-remove-start
			steal.dev.log("Model.js - publishing " + underscore(this.shortName) + "." + event)
			//@steal-remove-end
			if ( window.OpenAjax ) {
				OpenAjax.hub.publish(underscore(this.shortName) + "." + event, data);
			}

		},
		/**
		 * Guesses at the type of an object.  This is useful when you want to know more than just typeof.
		 * @param {Object} object the object you want to test.
		 * @return {String} one of string, object, date, array, boolean, number, function
		 */
		guessType: function( object ) {
			if ( typeof object != 'string' ) {
				if ( object == null ) return typeof object;
				if ( object.constructor == Date ) return 'date';
				if ( $.isArray(object) ) return 'array';
				return typeof object;
			}
			if ( object == "" ) return 'string';
			//check if true or false
			if (object == 'true' || object == 'false') {
				return 'boolean';
			}
			if (!isNaN(object) && (+object) !== Infinity) {
				return 'number';
			}
			return typeof object;
		},
		/**
		 * An object of name-function pairs that are used to convert to the name type.
		 * @param {Object} val
		 */
		convert: {
			"date": function( str ) {
				return typeof str == "string" ? (Date.parse(str) == NaN ? null : Date.parse(str)) : str
			},
			"number": function( val ) {
				return parseFloat(val)
			},
			"boolean": function( val ) {
				return Boolean(val)
			}
		},
		findAll: function( params, success, error ) {},
		findOne: function( id, params, success, error ) {},
		/**
		 * Implement this function!
		 * Create is called by save to create a new instance.  If you want to be able to call save on an instance
		 * you have to implement create.
		 */
		create: function( attrs, success, error ) {
			throw "Model: Implement Create"
		},
		/**
		 * Implement this function!
		 * Update is called by save to update an instance.  If you want to be able to call save on an instance
		 * you have to implement update.
		 */
		update: function( id, attrs, success, error ) {
			throw "Model: Implement " + this.fullName + "'s \"update\"!"
		},
		/**
		 * Implement this function!
		 * Destroy is called by destroy to remove an instance.  If you want to be able to call destroy on an instance
		 * you have to implement update.
		 * @param {String|Number} id the id of the instance you want destroyed
		 */
		destroy: function( id, success, error ) {
			throw "Model: Implement " + this.fullName + "'s \"destroy\"!"
		}		
	},
	/**
	 * @Prototype
	 */
	{	
		/**
		 * Creates, but does not save a new instance of this class
		 * @param {Object} attributes a hash of attributes
		 */
		setup: function( attributes ) {
			// so we know not to fire events
			this._initializing = true;
			
			this.Class.defaults && this.attrs(this.Class.defaults);
			
			this.attrs(attributes);
			/**
			 * @attribute errors
			 * A hash of errors for this model instance.
			 */
			this.errors = {};
			delete this._initializing;
		},
		/**
		 * Sets the attributes on this instance and calls save.
		 * @param {Object} attrs the model's attributes
		 * @param {Function} success
		 * @param {Function} error
		 */
		update: function( attrs, success, error ) {
			this.attrs(attrs);
			return this.save(success, error); //on success, we should 
		},
		valid: function() {
			for ( var attr in this.errors )
			return false;
			return true;
		},
		/**
		 * Validates this model instance (usually called by [jQuery.Model.prototype.save|save])
		 */
		validate: function() {
			this.errors = {};
			var self = this;
			$.each(this.Class.validations || [], function( i, func ) {
				func.call(self)
			});
		},
		/**
		 * Gets or sets an attribute on the model.
		 * @param {String} attribute the attribute you want to set or get
		 * @param {String_Number_Boolean} [opt1] value the value you want to set.
		 */
		attr: function( attribute, value, success, error ) {
			var cap = classize(attribute),
				get = "get" + cap;
			if (value !== undefined) {
				this._setProperty(attribute, value, success, error, cap);
			}
			return this[get] ? this[get]() : this[attribute];
		},
		/**
		 * 
		 */
		bind : function(){
			var wrapped = $(this);
			wrapped.bind.apply(wrapped, arguments);
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
				old = this[property];

			// if the setter returns nothing, do not set
			// we might want to indicate if this was set ok
			if (this[setName] && 
				(value = this[setName](		value, 
											this.callback('_updateProperty',property, value, old, success), 
											error)) === undefined ) {
				return ;
			}
			this._updateProperty(property, value, old )
		},
		/**
		 * Triggers events when a property has been updated
		 * @hide
		 * @param {Object} property
		 * @param {Object} value
		 * @param {Object} old
		 * @param {Object} success
		 */
		_updateProperty : function(property, value, old, success){
			var Class = this.Class,
				val,
				old,
				type = Class.attributes[property] || Class.addAttr(property, Class.guessType(value)),
				//the converter
				converter = Class.convert[type];
				
			val = this[property] = 
				( value == null ?  //if the value is null or undefined
					null : 	      // it should be null
					(converter ? 
						converter.call(Class, value) : //convert it to something useful
						value) )					   //just return it

			//if this class has a global list, add / remove from the list.
			if ( property == Class.id && val != null && Class.list ) {
				// if we didn't have an old id, add ourselves
				if (!old ) {
					Class.list.push(this);
				} else if ( old != val ) {
					// if our id has changed ... well this should be ok
					Class.list.remove(old);
					Class.list.push(this);
				}
			}
			if(old !== val && !this._initializing){
				$(this).triggerHandler(property, val);
			}
			success && success(this)
		},
		/**
		 * Gets or sets a list of attributes
		 * @param {Object} [attributes]  if present, the list of attributes to send
		 * @return {Object} the curent attributes of the model
		 */
		attrs: function( attributes ) {
			var key;
			if (!attributes ) {
				attributes = {};
				for ( key in this.Class.attributes ) {
					attributes[key] = this.attr(key);
				}
			} else {
				var idName = this.Class.id;
				//always set the id last
				for ( key in attributes ) {
					if (key != idName) {
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
			return this[this.Class.id] == null; //if null or undefined
		},
		/**
		 * Saves the instance
		 * @param {Function} [opt3] callbacks onComplete function or object of callbacks
		 */
		save: function( success, error ) {
			this.validate();

			if (!this.valid() ) {
				return false;
			}
			this.isNew() ? this.Class.create(this.attrs(), this.callback(['created', success]), error) : this.Class.update(this[this.Class.id], this.attrs(), this.callback(['updated', success]), error);

			//this.is_new_record = this.Class.new_record_func;
			return true;
		},

		/**
		 * Destroys the instance
		 * @param {Function} [opt4] callback or object of callbacks
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
			var id = this[this.Class.id]
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
			$(el).addClass(shortName + " " + this.identity())
			models[shortName] = this;
		}
	});

	$.each([
	/**
	 * @function created
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
	"created",
	/**
	 * @function destroyed
	 * Called by save after an instance is updated.  Publishes 'updated'.
	 * @param {Object} attrs
	 */
	"updated",
	/**
	 * @function destroyed
	 * Called after an instance is destroyed.  Publishes
	 * "shortName.destroyed"
	 */
	"destroyed"], function( i, funcName ) {
		$.Model.prototype[funcName] = function( attrs ) {
			if ( funcName === 'destroyed' && this.Class.list ) {
				this.Class.list.remove(this[this.Class.id]);
			}
			$(this).triggerHandler(funcName)
			attrs && typeof attrs == 'object' && this.attrs(attrs.attrs ? attrs.attrs() : attrs);
			this.publish(funcName, this)
			return [this].concat($.makeArray(arguments));
		}
	})

	/**
	 *  @add jQuery.fn
	 */
	// break
	/**
	 * @function models
	 * @param {jQuery.Model} model if present only returns models of the provided type.
	 * @return {Array} returns an array of model instances that are represented by the contained elements.
	 */
	$.fn.models = function( type ) {
		//get it from the data
		var collection = [],
			kind, ret;
		this.each(function() {
			$.each($.data(this, "models") || {}, function( name, instance ) {
				//either null or the list type shared by all classes
				kind = kind === undefined ? instance.Class.List || null : (instance.Class.List === kind ? kind : null)
				collection.push(instance)
			})
		});
		ret = new(kind || $.Model.list || Array)()
		ret.push.apply(ret, $.unique(collection))
		return ret;
	}
	$.fn.model = function(type) {
		if(type && type instanceof $.Model){
			type.hookup(this[0]);
			return this;
		}else{
			return this.models.apply(this, arguments)[0];
		}
		
	}
});