steal('jquery/class').then(function(){

var isArray =  $.isArray,
	isObject = function(obj){
		return typeof obj === 'object' && obj !== null && obj;
	},
	makeArray = $.makeArray,
	each = $.each,
	hookup = function(val, prop, parent){
		
		if(isArray(val)){
			 val = new $.Observe.List( val )
		} else {
			 val = new $.Observe( val )
		}
		
		//listen to all changes and send upwards
		val.bind("change"+parent._namespace, function(ev, attr, how, val, old ) {
			// trigger the type on this ...
			var args = $.makeArray(arguments),
				ev= args.shift();
			args[0] = prop+ (args[0] != "*" ? "."+args[0] : ""); // change the attr
			$([parent]).trigger(ev, args);
		});
		
		return val;
	},
	id = 0,
	collecting = null,
	collect = function(){
		if(!collecting){
			collecting = [];
			return true;
		}
	},
	send = function(item, event, args){
		var THIS = $([item]);
		if(!collecting){
			return THIS.trigger(event, args)
		} else {
			collecting.push({t: THIS, ev: event, args: args})
		}
	},
	sendCollection = function(){
		var len = collecting.length,
			items = collecting.slice(0),
			cur;
		collecting = null;
		for(var i =0; i < len; i++){
			cur = items[i];
			$(cur.t).trigger(cur.ev, cur.args)
		}
		
	},
	// which object to put it in
	serialize = function(observe, how, where){
		observe.each(function(name, val){
			where[name] = isObject(val) && 
				typeof val[how] == 'function' ?  val[how]() : val 
		})
		return where;
	};
	

// add - property added
// remove - property removed
// set - property value changed
/**
 * @class jQuery.Observe
 * @parent jquerymx.lang
 * @test jquery/lang/observe/qunit.html
 * 
 * Observe provides observable behavior on 
 * JavaScript Objects and Arrays. 
 * 
 * ## Use
 * 
 * Create a new Observe with the data you want to observe:
 * 
 *     var data = { 
 *       addresses : [
 *         {
 *           city: 'Chicago',
 *           state: 'IL'
 *         },
 *         {
 *           city: 'Boston',
 *           state : 'MA'
 *         }
 *         ],
 *       name : "Justin Meyer"
 *     },
 *     o = new $.Observe(data);
 *     
 * _o_ now represents an observable copy of _data_.  You
 * can read the property values of _o_ with
 * `observe.attr( name )` like:
 * 
 *     // read name
 *     o.attr('name') //-> Justin Meyer
 *     
 * And set property names of _o_ with 
 * `observe.attr( name, value )` like:
 * 
 *     // update name
 *     o.attr('name', "Brian Moschel") //-> o
 * 
 * Observe handles nested data.  Nested Objects and
 * Arrays are converted to $.Observe and 
 * $.Observe.Lists.  This lets you read nested properties 
 * and use $.Observe methods on them.  The following 
 * updates the second address (Boston) to 'New York':
 * 
 *     o.attr('addresses.1').attrs({
 *       city: 'New York',
 *       state: 'NY'
 *     })
 * 
 * When a property value is changed, it creates events
 * that you can listen to.  There are two ways to listen
 * for events:
 * 
 *   - [jQuery.Observe.prototype.bind bind] - listen for any type of change
 *   - [jQuery.Observe.prototype.delegate delegate] - listen to a specific type of change
 *     
 * With `bind( "change" , handler( ev, attr, how, newVal, oldVal ) )`, you can listen
 * to any change that happens within the 
 * observe. The handler gets called with the property name that was
 * changed, how it was changed ['add','remove','set'], the new value
 * and the old value.
 * 
 *     o.bind('change', function( ev, attr, how, nevVal, oldVal ) {
 *     
 *     })
 * 
 * `delegate( attr, event, handler(ev, newVal, oldVal ) )` lets you listen
 * to a specific even on a specific attribute. 
 * 
 *     // listen for name changes
 *     o.delegate("name","set", function(){
 *     
 *     })
 *     
 * `attrs()` can be used to get all properties back from the observe:
 * 
 *     o.attrs() // -> 
 *     { 
 *       addresses : [
 *         {
 *           city: 'Chicago',
 *           state: 'IL'
 *         },
 *         {
 *           city: 'New York',
 *           state : 'MA'
 *         }
 *       ],
 *       name : "Brian Moschel"
 *     }
 * 
 * @param {Object} obj a JavaScript Object that will be 
 * converted to an observable
 */
$.Class('jQuery.Observe',
/**
 * @prototype
 */
{
	init : function(obj){
		this._namespace = ".observe"+(++id);
		var self = this;
		for(var prop in obj){
			if(obj.hasOwnProperty(prop)){
				var val = obj[prop]
				if(isObject(val)){
					obj[prop] = hookup(val, prop, this)
				} else {
					//obj[prop] = val;
				}
			}
		}
		
		this._data = obj || {};
	},
	/**
	 * Get or set an attribute on the observe.
	 * 
	 *     o = new $.Observe({});
	 *     
	 *     // sets a user property
	 *     o.attr('user',{name: 'hank'});
	 *     
	 *     // read the user's name
	 *     o.attr('user.name') //-> 'hank'
	 * 
	 * 
	 * @param {String} attr the attribute to read
	 * @param {Object} [val] if provided, sets the value.
	 * @return {Object} the observable or the attribute property
	 */
	attr : function(attr, val){
		if(val === undefined){
			return this._get(attr)
		} else {
			
			// might set "properties.brand.0.foo".  Need to get 0 object, and trigger change
			this._set(attr, val);
			return this;
		}
	},
	each : function(){
		return each.apply(null, [this._data].concat(makeArray(arguments)) )
	},
	/**
	 * Removes a property
	 * 
	 *     o =  new $.Observe({foo: 'bar'});
	 *     o.removeAttr('foo'); //-> 'bar'
	 * 
	 * @param {String} attr
	 * @return {Object} the value being removed 
	 */
	removeAttr : function(attr){
		var parts = isArray(attr) ? attr : attr.split("."),
			prop = parts.shift()
			current = this._data[ prop ];
		
		if(parts.length){
			return current.removeAttr(parts)
		} else {
			
			delete this._data[prop];
			// add this .. 
			send(this, "change", [prop, "remove", current]);
			return current;
		}
	},
	_get : function(attr){
		var parts = isArray(attr) ? attr : attr.split("."),
			current = this._data[ parts.shift() ];
		if(parts.length){
			return current ? current._get(parts) : undefined
		} else {
			return current;
		}
	},
	_set : function(attr, value){
		var parts = isArray(attr) ? attr : (""+attr).split("."),
			prop = parts.shift() ,
			current = this._data[ prop ];
		
		// if we have an object and remaining parts, that object should get it
		if(isObject(current) && parts.length){
			current._set(parts, value)
		} else if(!parts.length){
			//we are setting
			
			// todo: check if value is object and transform
			
			
			if(value !== current){
				
				var changeType = this._data.hasOwnProperty(prop) ? "set" : "add";

				this._data[prop] = isObject(value) ? hookup(value, prop, this) : value;
				
				send(this,"change",[prop, changeType, value, current]);
				
				if(current && current.unbind){
					current.unbind("change"+this._namespace)
				}
			}
			
		} else {
			throw "jQuery.Observe: set a property on an object that does not exist"
		}		
	},
	/**
	 * Listen to changes in this observe.
	 * 
	 *     o = new $.Observe({name : "Payal"});
	 *     o.bind('change', function(ev, attr, how, newVal, oldVal){
	 *       // ev    -> {type: 'change'}
	 *       // attr  -> "name"
	 *       // how   -> "add"
	 *       // newVal-> "Justin"
	 *       // oldVal-> undefined 
	 *     })
	 *     
	 *     o.attr('name', 'Justin')
	 * 
	 * @param {String} eventType the event name.  Currently,
	 * only 'change' events are supported. For more fine 
	 * grained control, explore [jQuery.Observe.prototype.delegate].
	 * 
	 * @param {Function} handler(event, attr, how, newVal, oldVal) A 
	 * callback function where
	 * 
	 *   - event - the event
	 *   - attr - the name of the attribute changed
	 *   - how - how the attribute was changed (add, set, remove)
	 *   - newVal - the new value of the attribute
	 *   - oldVal - the old value of the attribute
	 * 
	 * @return {$.Observe} the observe
	 */
	bind : function(eventType, handler){
		$.fn.bind.apply($([this]),arguments);
		return this;
	},
	/**
	 * Unbinds a listener.
	 */
	unbind : function(eventType, handler){
		$.fn.unbind.apply($([this]),arguments);
		return this;
	},
	/**
	 * get the raw data of this observable
	 */
	serialize : function(){
		return serialize(this, 'serialize',{});
	},
	/**
	 * Set multiple properties on the observable
	 * @param {Object} props
	 * @param {Boolean} remove true if you should remove properties that are not in props
	 */
	attrs : function(props, remove){
		if(props === undefined) {
			return serialize(this,'attrs',{})
		}
		
		props = $.extend(true, {}, props);
		var prop,
			collectingStarted = collect();
			
		for(prop in this._data){
			var curVal = this._data[prop],
				newVal = props[prop];
			
			// if we are merging ...
			if(newVal === undefined){
				remove && this.removeAttr(prop);
				continue;
			}
			if(isObject(curVal) && isObject(newVal) ){
				curVal.attrs(newVal, remove)
			} else if( curVal != newVal ){
				this._set(prop, newVal)
			} else {
				
			}
			delete props[prop];
		}
		// add remaining props
		for (var prop in props) {
			newVal = props[prop];
			this._set(prop, newVal)
		}
		if(collectingStarted){
			sendCollection();
		}
	}
});
// Helpers for list

/**
 * @class jQuery.Observe.List
 * @inherits jQuery.Observe
 * @parent jQuery.Observe
 * 
 * An observable list.  You can listen to when items are push, popped,
 * spliced, shifted, and unshifted on this array.
 * 
 * 
 */
var list = jQuery.Observe('jQuery.Observe.List', 
/**
 * @prototype
 */
{
	init : function(instances){
		this.length = 0;
		this._namespace = ".list"+(++id);
        this.push.apply(this, makeArray(instances || [] ) );
		this._data = this;
	},
	serialize : function(){
		return serialize(this, 'serialize',[]);
	},
	each : function(){
		return each.apply(null, [this].concat(makeArray(arguments)) )
	},
	/**
	 * Remove items or add items from a specific point in the list.
	 * 
	 * ### Example
	 * 
	 * The following creates a list of numbers and replaces 2 and 3 with
	 * "a", and "b".
	 * 
     *     var l = new $.Observe.List([0,1,2,3]);
	 *     
	 *     l.bind('change', function( ev, attr, how, newVals, oldVals, where ) { ... })
	 *     
	 *     l.splice(1,2, "a", "b"); // results in [0,"a","b",3]
	 *     
	 * This creates 2 change events.  The first event is the removal of 
	 * numbers one and two where it's callback values will be:
	 * 
	 *   - attr - "*" - to indicate that multiple values have been changed at once
	 *   - how - "remove"
	 *   - newVals - undefined
	 *   - oldVals - [1,2] -the array of removed values
	 *   - where - 1 - the location of where these items where removed
	 * 
	 * The second change event is the addition of the "a", and "b" values where 
	 * the callback values will be:
	 * 
	 *   - attr - "*" - to indicate that multiple values have been changed at once
	 *   - how - "added"
	 *   - newVals - ["a","b"]
	 *   - oldVals - [1, 2] - the array of removed values
	 *   - where - 1 - the location of where these items where added
	 * 
	 * @param {Number} index where to start removing or adding items
	 * @param {Object} count the number of items to remove
	 * @param {Object} [added] an object to add to 
	 */
	splice : function(index, count){
		var args = makeArray(arguments);

		for(var i=0; i < args.length; i++){
			var val = args[i];
			if(isObject(val)){
				args[i] = hookup(val, index+i, this)
			} 
		}
		if(count === undefined){
			count = args[1] = this.length - index;
		}
		var removed = [].splice.apply(this, args);
		if(count > 0){
			send(this, "change",["*","remove",undefined, removed, index]);
		}
		if(args.length > 2){
			send(this, "change",["*","add",args.slice(2), removed, index]);
		}
		return removed;
	},
	/**
	 * Updates an array with a new array.  It is able to handle
	 * removes in the middle of the array.
	 * @param {Object} props
	 * @param {Object} remove
	 */
	attrs : function(props, remove){
		if( props === undefined ){
			return serialize(this, 'attrs',[]);
		}
		
		// copy
		props = props.slice(0);
		
		var len = Math.min(props.length, this.length),
			collectingStarted = collect();
		for(var prop =0; prop < len; prop++) {
			var curVal =  this[prop],
				newVal = props[prop];
			
			if(isObject(curVal) && isObject(newVal) ){
				curVal.attrs(newVal, remove)
			} else if( curVal != newVal ){
				this._set(prop, newVal)
			} else {
				
			}
		}
		if(props.length > this.length){
			// add in the remaining props
			this.push(props.slice(this.length))
		} else if(props.length < this.length && remove){
			this.splice(props.length)
		}
		//remove those props didn't get too
		if(collectingStarted){
			sendCollection()
		}
	}
}),


// create push and pop:
	getArgs = function(args){
		if(args[0] && ( $.isArray(args[0])  )   ){
			return args[0]
		}
		else{
			return makeArray(args)
		}
	},
	push = [].push,
	pop = [].pop;
	
	$.each({
		/**
		 * @function push
		 * Add items to the end of the list.
		 * 
		 *     var l = new $.Observe.List([]);
		 *     
		 *     l.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used 
		 *         how,       // "add"
		 *         newVals,   // an array of new values pushed
		 *         oldVals,   // undefined
		 *         where      // the location where these items where added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     l.push('0','1','2');
		 * 
		 * @return {Number} the number of items in the array
		 */
		push : "length",
		/**
		 * @function unshift
		 * Add items to the start of the list.  This is very similar to
		 * [jQuery.Observe.prototype.push].
		 */
	 	unshift : 0
	}, 
	function(name, where){
	 	list.prototype[name] = function(){
			var args = getArgs(arguments),
				self = this,
				len = where ? this.length : 0;
			
			for(var i=0; i < args.length; i++){
				var val = args[i];
				if(isObject(val)){
					args[i] = hookup(val, i, this)
				} 
			}
			var res = [][name].apply( this, args )
			//do this first so we could prevent?
	
			send(this, "change", ["*","add",args, undefined, len] )
			
			return res;
		}
	 });
	
$.each({
		/**
		 * @function pop
		 * 
		 * Removes an item from the end of the list.
		 * 
		 *     var l = new $.Observe.List([0,1,2]);
		 *     
		 *     l.bind('change', function( 
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used 
		 *         how,       // "remove"
		 *         newVals,   // undefined
		 *         oldVals,   // 2
		 *         where      // the location where these items where added
		 *         ) {
		 *     
		 *     })
		 *     
		 *     l.pop();
		 * 
		 * @return {Object} the element at the end of the list
		 */
		pop : "length",
		/**
		 * @function shift
		 * Removes an item from the start of the list.  This is very similar to
		 * [jQuery.Observe.prototype.pop].
		 * 
		 * @return {Object} the element at the start of the list
		 */
	 	shift : 0
	}, 
	function(name, where){
	 	list.prototype[name] = function(){
			var args = getArgs(arguments),
				self = this,
				len = where && this.length ? this.length - 1 : 0;
			
			var res = [][name].apply( this, args )
			//do this first so we could prevent?
	
			send(this, "change", ["*","remove", undefined, [res], len] )
			
			return res;
		}
	 });

});

