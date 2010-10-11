steal.plugins('jquery/model').then(function($){

var add = function(data, inst){
		var id = inst.Class.id;
		data[inst[id]] = inst;
	},
	getArgs = function(args){
		if(args[0] !== undefined && args[0].length && typeof args[0] != 'string'){
			return args[0]
		}else{
			return $.makeArray(args)
		}
	}
/**
 * @parent jQuery.Model
 * @download jquery/dist/jquery.model.list.js
 * @test jquery/model/list/qunit.html
 * @plugin jquery/model/list
 * Model lists are useful for:
 * 
 *  - Adding helpers for multiple model instances.
 *  - Faster HTML inserts.
 *  - Storing and retrieving multiple instances.
 *  
 * ## List Helpers
 * 
 * It's pretty common to deal with multiple items at a time.
 * List helpers provide methods for multiple model instances.
 * 
 * For example, if we wanted to be able to destroy multiple
 * contacts, we could add a destroyAll method to a Contact
 * list:
 * 
 * @codestart
 * $.Model.List.extend("Contact.List",{
 *   destroyAll : function(){
 *     $.post("/destroy",
 *       this.map(function(contact){
 *         return contact.id
 *       }),
 *       this.callback('destroyed'),
 *       'json')
 *   },
 *   destroyed : function(){
 *     this.each(function(){
 *       this.destroyed();
 *     })
 *   }
 * });
 * @codeend
 * 
 * The following demo illustrates this.  Check
 * multiple Contacts and click "DESTROY ALL"
 * 
 * @demo jquery/model/list/list.html
 * 
 * ## Faster Inserts
 * 
 * The 'easy' way to add a model to an element is simply inserting
 * the model into the view like:
 * 
 * @codestart xml
 * &lt;div &lt;%= task %>> A task &lt;/div>
 * @codeend
 * 
 * And then you can use [jQuery.fn.models $('.task').models()].
 * 
 * This pattern is fast enough for 90% of all widgets.  But it
 * does require an extra query.  Lists help you avoid this.
 * 
 * The [jQuery.Model.List.get get] method takes elements and
 * uses their className to return matched instances in the list.
 * 
 * To use get, your elements need to have the instance's 
 * identity in their className.  So to setup a div to reprsent
 * a task, you would have the following in a view:
 * 
 * @codestart xml
 * &lt;div class='task &lt;%= task.identity() %>'> A task &lt;/div>
 * @codeend
 * 
 * Then, with your model list, you could use get to get a list of
 * tasks:
 * 
 * @codestart
 * taskList.get($('.task'))
 * @codeend
 * 
 * The following demonstrates how to use this technique:
 * 
 * @demo jquery/model/list/list-insert.html
 */
$.Class.extend("jQuery.Model.List",
/**
 * @Prototype
 */
{
    init: function( instances ) {
        this.length = 0;
		this._data = {};
        this.push.apply(this, $.makeArray(instances || [] ) );
    },
	/**
	 * Slice works just like an array's slice, except this
	 * returns another instance of this model list's class.
	 */
    slice: function() {
        return new this.Class( Array.prototype.slice.apply( this, arguments ) );
    },
	/**
	 * Returns a list of all instances who's property matches
	 * the given value.
	 * @param {String} property the property to match
	 * @param {Object} value the value the property must equal
	 */
    match: function( property, value ) {
        return  this.grep(function(inst){
            return inst[property] == value;
        });
    },
	/**
	 * Returns a model list of elements where callback returns true.
	 * @param {Function} callback the function to call back.  This
	 * function has the same call pattern as what jQuery.grep provides.
	 * @param {Object} args
	 */
    grep: function( callback, args ) {
        return new this.Class( $.grep( this, callback, args ) );
    },
	_makeData : function(){
		var data = this._data = {};
		this.each(function(i, inst){
			data[inst[inst.Class.id]] = inst;
		})
	},
	/**
	 * Gets a list of elements by ID or element.
	 */
	get: function() {
		if(!this.length){
			return new this.Class([]);
		}
		if(this._changed){
			this._makeData();
		}
		var list = [],
			underscored = this[0].Class._fullName,
			idName = this[0].Class.id,
			test = new RegExp(underscored+"_([^ ]+)"),
			matches,
			val,
			args = getArgs(arguments);
		
		for(var i =0; i < args.length; i++){
			if(args[i].nodeName && 
				(matches = args[i].className.match(test) )){
				val = this._data[matches[1]]
			}else{
				val =  this._data[typeof args[i] == 'string' ? args[i] : args[i][idName] ]
			}
			val && list.push(val)
		}
		return new this.Class(list)
	},
	/**
	 * Removes instances from this list by id or by an
	 * element.
	 * @param {Object} args
	 */
	remove: function( args ) {
		if(!this.length){
			return [];
		}
		var list = [],
			underscored = this[0].Class._fullName,
			idName = this[0].Class.id,
			test = new RegExp(underscored+"_([^ ]+)"),
			matches,
			val;
		args = getArgs(arguments)
		
		//for performance, we will go through each and splice it
		var i =0;
		while(i < this.length){
			//check 
			var inst = this[i],
				found = false
			for(var a =0; a< args.length; a++){
				var id = (args[a].nodeName && 
							(matches = args[a].className.match(test) ) &&
							matches[1]) || 
							( typeof args[a] == 'string' ? 
								args[a] :
								args[a][idName] );
				if(inst[idName] == id){
					list.push.apply(list, this.splice(i, 1) );
					args.splice(a,1);
					found = true;
					break;
				}
			}
			if(!found){
				i++;
			}
		}
		return new this.Class(list);
	},
	publish: function( name, data ) {
		OpenAjax.hub.publish(this.Class.shortName+"."+name, data)
	},
	/**
	 * Gets all the elements that represent this list.
	 * @param {Object} context
	 */
	elements: function( context ) {
		// TODO : this can probably be done with 1 query.
		var jq = $();
		this.each(function(){
			jq.add("."+this.identity(), context)
		})
		return jq;
	}
});

var modifiers = {
	/**
	 * @function push
	 * Pushs an instance onto the list
	 */
	push: [].push,
	/**
	 * @function pop
	 * Pops the last instance off the list
	 */
	pop: [].pop,
	/**
	 * @function shift
	 * Shifts the first instance off the list
	 */
	shift: [].shift,
	/**
	 * @function unshift
	 * Adds an instance to the start of the list.
	 */
	unshift: [].unshift,
	/**
	 * @function splice
	 * Splices items from the list
	 */
	splice: [].splice,
	/**
	 * @function sort
	 * sorts the list
	 */
	sort : [].sort
}

$.each(modifiers, function(name, func){
	$.Model.List.prototype[name] = function(){
		this._changed = true;
		return func.apply( this, arguments );
	}
})

$.each([
/**
 * @function each
 * Iterates through the list, calling callback on each item in the list.
 * @param {Function}  callback 
 */
'each',
/**
 * @function map
 * Iterates through the list, calling callback on each item in the list.
 * It returns an array of the items each call to callback returned.
 * @param {Function}  callback 
 */
'map'], function(i, name){
	$.Model.List.prototype[name] = function(callback, args){
		return $[name]( this, callback, args );
	}
})


})