steal.plugins('jquery','jquery/class','jquery/lang','steal/openajax').then(function(){
//a cache for attribute capitalization ... slowest part of inti.
var capitalize = $.String.capitalize;

/**
 * @tag core
 * Models wrap an application's data layer.  In large applications, a model is critical for:
 * <ul>
 * 	<li>Abstracting service dependencies inside the model, making it so
 *      Controllers + Views don't care where data comes from.</li>
 *  <li>Providing helper functions that make manipulating and abstracting raw service data much easier.</li>
 * </ul>
 * This is done in two ways:
 * <ul>
 *     <li>Requesting data from and <span class='highlight'>interacting with services</span></li>
 *     <li><span class='highlight'>Wraping service data</span> with a domain-specific representation</li>
 * </ul>
 * 
 * <h2>Using Models</h2>
 * 
 * The [jQuery.Model] class provides basic functionality you need to organize your application's data layer.
 * First, let's consider doing Ajax <b>without</b> a model.  In our imaginary app, you:
 * <ul>
 *   <li>retrieve a list of tasks</li>
 *   <li>display the number of days remaining for each task</li>
 *   <li>mark tasks as complete after users click them</li>
 * </ul>
 * Let's see how that might look without a model:
@codestart
$.Controller.extend("TasksController",{onDocument: true},
{
  load : function(){
    $.get('/tasks.json', this.callback('gotTasks'), 'json')
  },
*  /* 
*   * assume json is an array like [{name: "trash", due_date: 1247111409283}, ...]
*   *|
  gotTasks : function(json){ 
    for(var i =0; i < json.length; i++){
      var taskJson = json[i];
      //calculate time remaining
      var time_remaining = new Date() - new Date(taskJson.due_date);
      //append some html
      this.element.append("&lt;div class='task' taskid='"+taskJson.id+"'>"+
	                     "&lt;label>"+taskJson.name+"&lt;/label>"+
	                     "Due Date = "+time_remaining+"&lt;/div>")
	}
  },
  click : function(el){
    $.post('/task_complete',{id: el.attr('taskid')}, function(){
      el.remove();
    })
  }
})
@codeend
This code might seem fine for right now, but what if:
<ul>
	<li>The service changes?</li>
	<li>You want to use the remaining time for other uses?</li>
	<li>Multiple elements have the same data?</li>
</ul>
The solution is of course a strong model layer.  Lets look at what a
a good model does for a controller before we learn how to make one.  I've highlighted
some of the key functionality we need to build:
@codestart
$.Controller.extend("TasksController",{onDocument: true},
{
	load : function(){
	  <b>Task.findAll</b>({},this.callback('list'))
	},
	list : function(tasks){
	  this.render({data: {tasks: tasks}});
	},
	click : function(el){
        <b>el.models</b>()[0].<b>complete</b>(function(){
          el.remove();
      });
	}
})
@codeend
In views/tasks/list.ejs
@codestart html
&lt;% for(var i =0; i &lt; tasks.length; i++){ %>
&lt;div class='task &lt;%= tasks[i].<b>identity</b>() %>'>
   &lt;label>&lt;%= tasks[i].name %>&lt;/label>
   &lt;%= tasks[i].<b>timeRemaining</b>() %>
&lt;/div>
&lt;% } %>
@codeend

Isn't that better!  Granted, some of the improvement comes because we used a view, but we've
also made our controller completely understandable.  Now lets take a look at the model:
@codestart
$.Model.extend("Task",
{
    findAll : function(params,success){
        $.get("/tasks.json", params, this.callback(["wrapMany",success]),"json");
    }
},
{
    timeRemaining : function(){
        return new Date() - new Date(this.due_date)
    },
    complete : function(success){
        $.get("/task_complete", {id: this.id }, success,"json");
    }
})
@codeend
There, much better!  Now you have a single place where you can organize Ajax functionality and
wrap the data that it returned.  Lets go through each bolded item in the controller and view.<br/>

<h3>Task.findAll</h3>
The findAll function requests data from "/tasks.json".  When the data is returned, it it is run through
the "wrapMany" function before being passed to the success callback.<br/>
If you don't understand how the callback works, you might want to check out 
[jQuery.Model.static.wrapMany wrapMany] and [jQuery.Class.static.callback callback].
<h3>el.models</h3>
[jQuery.fn.models models] is a jQuery helper that returns model instances.  It uses
the jQuery's elements' shortNames to find matching model instances.  For example:
@codestart html
&lt;div class='task task_5'> ... &lt;/div>
@codeend
It knows to return a task with id = 5.
<h3>complete</h3>
This should be pretty obvious.
<h3>identity</h3>
[jQuery.Model.prototype.identity Identity] returns a unique identifier that [jQuery.fn.models] can use
to retrieve your model instance.
<h3>timeRemaining</h3>
timeRemaining is a good example of wrapping your model's raw data with more useful functionality.
<h2>Validations</h2>
You can validate your model's attributes with another plugin.  See [validation].
 */


jQuery.Class.extend("jQuery.Model",
/* @Static*/
{
	storeType: null,
	setup: function(){
		this.validations = [];
		this.attributes= {};  //list of all attributes ever given to this model
        this.defaultAttributes= this.defaultAttributes || {};   //list of attributes and values you want right away
        this.associations = {};
        if(this.fullName.substr(0,7) == "jQuery." ) return;
        this.underscoredName =  jQuery.String.underscore(this.fullName.replace(/\./g,"_"))
        jQuery.Model.models[this.underscoredName] = this;
		if(this.storeType)
			this.store = new this.storeType(this);
	},
	init : function(){},
    /**
     * Used to create an existing object from attributes
     * @param {Object} attributes
     * @return {Model} an instance of the model
     */
    wrap : function(attributes){
        
		if(!attributes) return null;
        if(attributes.attributes) 
			attributes = attributes.attributes; //in case rails 2.0
		if(this.singularName && attributes[this.singularName])
			attributes = attributes[this.singularName];
        var inst = new this(attributes);

		return inst;
    },
    /**
     * Creates many instances
     * @param {Array} instancesRawData an array of raw name - value pairs.
     * @return {Array} an array of instances of the model
     */
    wrapMany : function(instances){
        if(!instances) return null;
        var res = [], raw = instances, isArray = $.isArray(instances), length, i=0;
		res._use_call = true; //so we don't call next function with all of these
        if(!isArray)
			raw = instances.data;
		length = raw.length;
		for(; i < length; i++){
			res.push( this.wrap(raw[i]) ); 
		}
		if (!isArray) { //push other stuff onto array
			for (var prop in instances) {
				if (instances.hasOwnProperty(prop) && prop !== 'data') 
					res[prop] = instances[prop];
			}
		}
		return res;
    },
    /**
     * The name of the id field.  Defaults to 'id'.  Change this if it is something different.
     */
    id : 'id', //if null, maybe treat as an array?
    /**
     * Adds an attribute to the list of attributes for this class.
     * @hide
     * @param {String} property
     * @param {String} type
     */
    addAttr : function(property, type){
        if(this.associations[property])
			return;
		if(! this.attributes[property])
            this.attributes[property] = type;
        if(! this.defaultAttributes[property])
            this.defaultAttributes[property] = null;
    },
    models : {},
    /**
     * Publishes to open ajax hub.  Always adds the shortName.event
     * @param {Object} event
     * @param {Object} data
     */
    publish : function(event, data){
        //@steal-remove-start
        steal.dev.log("Model.js - publishing " + jQuery.String.underscore(this.shortName) + "." + event)
        //@steal-remove-end
		OpenAjax.hub.publish(   jQuery.String.underscore(this.shortName) + "."+event, data);
    },
    /**
     * Guesses at the type of an object.  This is useful when you want to know more than just typeof.
     * @param {Object} object the object you want to test.
     * @return {String} one of string, object, date, array, boolean, number, function
     */
   	guessType : function(object){
	    if(typeof object != 'string'){
	        if(object == null) return typeof object;
	        if( object.constructor == Date ) return 'date';
	        if(object.constructor == Array) return 'array';
	        return typeof object;
	    }
		if(object == "") return 'string';
	    //check if true or false
	    if(object == 'true' || object == 'false') return 'boolean';
	    if(!isNaN(object)) return 'number'
	    return typeof object;
	},
    /**
     * Implement this function!
     * Create is called by save to create a new instance.  If you want to be able to call save on an instance
     * you have to implement create.
     */
    create : function(attributes, success, error){
        throw "Implement Create"
    },
    /**
     * Implement this function!
     * Update is called by save to update an instance.  If you want to be able to call save on an instance
     * you have to implement update.
     */
    update : function(id, attributes, success, error){
        throw "JMVC--! You Must Implement "+this.fullName+"'s \"update\" Function !--"
    },
    /**
     * Implement this function!
     * Destroy is called by destroy to remove an instance.  If you want to be able to call destroy on an instance
     * you have to implement update.
     * @param {String|Number} id the id of the instance you want destroyed
     */
    destroy : function(id, success, error){
        throw "JMVC--! You Must Implement "+this.fullName+"'s \"destroy\" Function !--"
    },
	/**
	 * Turns a string into a date
	 * @param {String} str a string representation of a date
	 * @return {Date} a date
	 */
	_parseDate : function(str){
        if(typeof str == "string"){
            return Date.parse(str) == NaN ? null : Date.parse(str)
        }else
            return str

	}
},
/* @Prototype*/
{   
    /**
     * Creates, but does not save a new instance of this class
     * @param {Object} attributes a hash of attributes
     */
    init : function(attributes){
        //this._properties = [];
        this.attrs(this.Class.defaultAttributes || {});
        this.attrs(attributes);
        /**
         * @attribute errors
         * A hash of errors for this model instance.
         */
        this.errors = {};
    },
    /**
     * Sets the attributes on this instance and calls save.
     * @param {Object} attrs the model's attributes
     * @param {Function} success
     * @param {Function} error
     */
    update : function(attrs, success, error)
    {
        this.attrs(attrs);
        return this.save(success, error); //on success, we should 
    },
    valid : function() {
        for(var attr in this.errors)
            if(this.errors.hasOwnProperty(attr))
                return false;
        return true;
    },
   /**
    * Validates this model instance (usually called by [jQuery.Model.prototype.save|save])
    */
    validate : function(){
        this.errors = {};
        var self = this;
        if(this.Class.validations)
            jQuery.each(this.Class.validations, function(i, func) { func.call(self) });
    },
    /**
     * Gets or sets an attribute on the model.
     * @param {String} attribute the attribute you want to set or get
     * @param {String_Number_Boolean} [opt1] value the value you want to set.
     */
    attr : function(attribute, value) {
        var cap = capitalize(attribute),
			get = "get"+cap;
        if(value !== undefined)
            this._setProperty(attribute, value, cap);
		return this[get]? this[get]() : this[attribute];
    },
    /**
     * Checks if there is a set_<i>property</i> value.  If it returns true, lets it handle; otherwise
     * saves it.
     * @hide
     * @param {Object} property
     * @param {Object} value
     */
    _setProperty : function(property, value, capitalized) {
		var funcName = "set"+capitalized;
        if(this[funcName] && ! (value = this[funcName](value)) ) return;
		
        //add to cache, this should probably check that the id isn't changing.  If it does, should update the cache
        var old = this[property], type = this.Class.attributes[property];
		if(!type){
			type =  this.Class.guessType(value);
			this.Class.addAttr(property, type  );
		}
		if (value == null) 
			this[property] = null;
		else {
			switch (type) {
				case "date":
					this[property] = this.Class._parseDate(value);
					break;
				case "number":
					this[property] = parseFloat(value);
					break;
				case "boolean":
					this[property] = Boolean(value);
					break;
				default:
					this[property] = value
			}
		}
        
        if(property == this.Class.id && this[property] && this.Class.store){
			if(this.Class.store){
				if(!old){
                	this.Class.store.create(this);
	            }else if(old != this[property]){
	                this.Class.store.destroy(old);
	                this.Class.store.create(this);
	            }
			}
            
        }
        //if (!(MVC.Array.steal(this._properties,property))) this._properties.push(property);  
        
       
    },
    /**
     * Gets or sets a list of attributes
     * @param {Object} [opt2] attributes if present, the list of attributes to send
     * @return {Object} the curent attributes of the model
     */
    attrs : function(attributes) {
        var key;
		if(!attributes){
            attributes = {};
            var cas = this.Class.attributes;
            for(key in cas){
                if(cas.hasOwnProperty(key) ) attributes[key] = this.attr(key);
            }
        }else{
            var idName = this.Class.id;
			for(key in attributes){ 
    			if(attributes.hasOwnProperty(key) && key != idName) 
    				this.attr(key, attributes[key]);
    		}
			if(idName in attributes){
				this.attr(idName, attributes[idName]);
			}
            
        }
        return attributes;
    },
    /**
     * Returns if the instance is a new object
     */
    isNew : function(){ return this[this.Class.id] == null; },
    /**
     * Saves the instance
     * @param {Function} [opt3] callbacks onComplete function or object of callbacks
     */
    save: function(success,error){
        var result;
        this.validate();
        if(!this.valid()) return false;
        result = this.isNew() ? 
            this.Class.create(this.attrs(), this.callback(['created', success]), error) : 
            this.Class.update(this[this.Class.id], this.attrs(), this.callback(['updated', success]), error);

        //this.is_new_record = this.Class.new_record_func;
        return true;
    },
	/**
	 * Called by save after a new instance is created.  Publishes 'created'.
	 * @param {Object} attrs
	 */
    created : function(attrs){
        this.attrs(attrs)
        this.publish("created", this)
        return [this].concat($.makeArray(arguments));
    },
    updated : function(attrs){
        this.attrs(attrs)
		this.publish("updated", this)
        return [this].concat($.makeArray(arguments));
    },
    /**
     * Destroys the instance
     * @param {Function} [opt4] callback or object of callbacks
     */
    destroy : function(success, error){
        this.Class.destroy(this[this.Class.id], this.callback(["destroyed",success]), error);
    },
	/**
	 * Called after an instance is destroyed.  Publishes
	 * "shortName.destroyed"
	 */
    destroyed : function(){
        if(this.Class.store) this.Class.store.destroy(this[this.Class.id]);
        this.publish("destroyed",this)
        return [this];
    },
    _resetAttrs : function(attributes) {
        this._clear();
    },
    _clear : function() {
        var cas = this.Class.defaultAttributes;
        for(var attr in cas){
            if(cas.hasOwnProperty(attr) ) this[attr] = null;
        }
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
    identity : function(){
        return jQuery.String.underscore(this.Class.fullName.replace(/\./g,"_"))+'_'+(this.Class.escapeIdentity ? encodeURIComponent(this[this.Class.id]) : this[this.Class.id]);
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
    elements : function(context){
	  	return typeof context == "string" ? jQuery(context+" ."+this.identity()) : 
		 jQuery("."+this.identity(), context);
    },
    /**
     * Publishes to open ajax hub
     * @param {String} event
     * @param {Object} [opt6] data if missing, uses the instance in {data: this}
     */
    publish : function(event, data){
        this.Class.publish(event, data|| this);
    },
	hookup : function(el){
		var shortName = $.String.underscore(this.Class.shortName),
			$el = $(el).addClass(shortName).addClass(this.identity()),
			models  = $.data(el, "models") || $.data(el, "models", {});
		models[shortName] = this;
	}
});



/**
 *  @add jQuery.fn
 */
// break
/**
 * @function models
 * @param {jQuery.Model} model if present only returns models of the provided type.
 * @return {Array} returns an array of model instances that are represented by the contained elements.
 */
jQuery.fn.models = function(type){
  	//get it from the data
	
	var ret = []
    this.each(function(){
		var models = $.data(this,"models") || {};
		for(var name in models){
			//check type
			ret.push(models[name])
		}
    });
    return jQuery.unique( ret );
}
jQuery.fn.model = function(){
    return this.models.apply(this,arguments)[0];
}
});
