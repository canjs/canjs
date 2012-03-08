steal('can/observe', function(){
	
var getId = function( inst ) {
	return inst[inst.constructor.id]
},
each = can.each,
// returns a collection of unique items
// this works on objects by adding a "__u Nique" property.
unique = function( items ) {
	var collect = [];
	// check unique property, if it isn't there, add to collect
	each(items, function( i, item ) {
		if (!item["__u Nique"] ) {
			collect.push(item);
			item["__u Nique"] = 1;
		}
	});
	// remove unique 
	return each(collect, function( i, item ) {
		delete item["__u Nique"];
	});
};

can.extend(can.Observe.prototype, {
	
	/**
	 * Returns a unique identifier for the observe instance.  For example:
	 *
	 * @codestart
	 * 		new Todo({id: 5}).identity() //-> 'todo_5'
	 * @codeend
	 *
	 * Typically this is used in an element's shortName property so you can find all elements
	 * for a observe with [can.observe.prototype.elements elements].
	 *
	 * @return {String}
	 */
	identity: function() {
		var id = getId(this),
			constructor = this.constructor;
			
		return (constructor._fullName + '_' + (constructor.escapeIdentity ? encodeURIComponent(id) : id)).replace(/ /g, '_');
	},
	
	/**
	 * Returns elements that represent this observe instance.  For this to work, your element's should
	 * us the [can.Observe.prototype.identity identity] function in their class name.  Example:
	 * 
	 *     <div class='todo <%= todo.identity() %>'> ... </div>
	 * 
	 * This also works if you hooked up the obvserve:
	 * 
	 *     <div <%= todo %>> ... </div>
	 *     
	 * Typically, you'll use this as a response to a Observe Event:
	 * 
	 *     "{Todo} destroyed": function(Todo, event, todo){
	 *       todo.elements(this.element).remove();
	 *     }
	 * 
	 * 
	 * @param {String|jQuery|element} context If provided, only elements inside this element
	 * that represent this obvserve will be returned.
	 * 
	 * @return {can} Returns a can wrapped nodelist of elements that have this obvserve instances
	 *  identity in their class name.
	 */
	elements: function( context ) {
		var id = this.identity();
		
		if( this.constructor.escapeIdentity ) {
			id = id.replace(/([ #;&,.+*~\'%:"!^$[\]()=>|\/])/g,'\\$1')
		}
		
		return can.$("." + id, context);
	},
	
	/**
	 * Hooks an element for the given obvserve instance.
	 * @param {el} element to attach
	 */
	hookup: function( el ) {
		var shortName = this.constructor._shortName,
			models = can.data(el, "models");
		
		if(!models){
			can.data(el, 'models', {});
			models = can.data(el, "models");
		}
			
		can.$(el).addClass(shortName + " " + this.identity());
		
		models[shortName] = this;
	}
});

	/**
	 *  @add can.prototype
	 */
	
	// break
	
	/**
	 * @function models
	 * Returns a list of obvserves.  If the obvserves are of the same
	 * type, and have a [jQuery.Observe.List], it will return 
	 * the obvserves wrapped with the list.
	 * 
	 * @codestart
	 * 		$(".recipes").models() //-> [recipe, ...]
	 * @codeend
	 * 
	 * @param {can.Construct} [type] if present only returns obvserves of the provided type.
	 * @return {Array|can.Observe.List} returns an array of obvserve instances that are represented by the contained elements.
	 */
	can.prototype.models = function( type ) {
		//get it from the data
		var collection = [],
			kind, ret, retType;
			
		this.each(function() {
			each(can.$(this).data("models") || {}, function( name, instance ) {
				//either null or the list type shared by all classes
				kind = kind === undefined ? instance.constructor.List || null : (instance.constructor.List === kind ? kind : null);
				collection.push(instance);
			});
		});

		ret = new(kind || can.Observe.List);
		ret.push.apply(ret, unique(collection));
		
		return ret;
	};
	
	/**
	 * @function model
	 * 
	 * Returns the first obvserve instance found from [can.prototype.obvserves] or
	 * sets the obvserve instance on an element.
	 * 
	 *     //gets an instance
	 *     ".edit click" : function(el) {
	 *       el.closest('.todo').model().destroy()
	 *     },
	 *     // sets an instance
	 *     list : function(items){
	 *        var el = this.element;
	 *        $.each(item, function(item){
	 *          $('<div/>').model(item)
	 *            .appendTo(el)
	 *        })
	 *     }
	 * 
	 * @param {Object} [type] The type of obvserve to return.  If a obvserve instance is provided
	 * it will add the obvserve to the element.
	 */
	can.prototype.model = function( type ) {
		if ( type && type instanceof can.Observe ) {
			type.hookup(this);
			return this;
		} else {
			return this.models.apply(this, arguments)[0];
		}
	};

});