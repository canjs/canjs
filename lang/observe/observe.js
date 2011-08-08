steal('jquery/class').then(function(){

var isArray =  $.isArray,
	isObject = function(obj){
		return typeof obj === 'object' && obj !== null && obj;
	},
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
	getArgs = function(args){
		if(args[0] && ( $.isArray(args[0])  )   ){
			return args[0]
		}
		else{
			return $.makeArray(args)
		}
	},
	push = [].push,
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
			cur;
		for(var i =0; i < len; i++){
			cur = collecting[i];
			$(cur.t).trigger(cur.ev, cur.args)
		}
		collecting = null
	};
	

// add - property added
// remove - property removed
// set - property value changed
/**
 * @class jQuery.Observe
 * 
 * Provides observable behavior on JSON-like data structures.
 * 
 *     new $.Observe({ 
 *       addresses : [
 *         {
 *           city: 'Chicago',
 *           state: 'IL'
 *         },
 *         {
 *           city: 'Boston',
 *           state : 'MA'
 *         }
 *         ]
 *     });
 * 
 * Observable lets you list to events when an observable changes.
 * 
 * @param {Object} obj a JavaScript Object that will be 
 * converted to an observable
 */
$.Class('jQuery.Observe',{
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
		
		this._data = obj;
	},
	attr : function(attr, val){
		if(val === undefined){
			return this._get(attr)
		} else {
			
			// might set "properties.brand.0.foo".  Need to get 0 object, and trigger change
			this._set(attr, val);
			return this;
		}
	},
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
	bind : function(){
		$.fn.bind.apply($([this]),arguments);
		return this;
	},
	unbind : function(){
		$.fn.unbind.apply($([this]),arguments);
		return this;
	},
	serialize : function(){
		var obj = {}, val;
		for(var prop in this._data){
			val = this._data[prop];
			obj[prop] =  isObject(val) ?  val.serialize() : val ;
		}
		return obj;
	},
	attrs : function(props, remove){
		// copy
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
})

jQuery.Observe('jQuery.Observe.List', {
	init : function(instances){
		this.length = 0;
		this._namespace = ".list"+(++id);
        this.push.apply(this, $.makeArray(instances || [] ) );
		this._data = this;
	},
	push: function(){
		var args = getArgs(arguments),
			self = this;
		
		for(var i=0; i < args.length; i++){
			var val = args[i];
			if(isObject(val)){
				args[i] = hookup(val, i, this)
			} 
		}
		var res = push.apply( this, args )
		//do this first so we could prevent?

		send(this, "change", ["*","add",args] )
		
		return res;
	},
	serialize : function(){
		var arr = [];
		for(var i =0; i < this.length; i++){
			arr.push( isObject(this[i]) ?  this[i].serialize() : this[i] );
		}
		return arr;
	},
	splice : function(index, count){
		var args = $.makeArray(arguments);

		for(var i=0; i < args.length; i++){
			var val = args[i];
			if(isObject(val)){
				args[i] = hookup(val, index+i, this)
			} 
		}
		if(count === undefined){
			args[1] = this.length - index;
		}
		var removed = [].splice.apply(this, args);
		if(count > 0){
			send(this, "change",["*","remove",removed]);
		}
		if(args.length > 2){
			send(this, "change",["*","remove",args.slice(2)]);
		}
		return removed;
	},
	attrs : function(props, remove){
		// copy
		var props = props.slice(0),
			len = Math.min(props.length, this.length),
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
})

});



// add - property added
// remove - property removed
// set - property value changed
// 