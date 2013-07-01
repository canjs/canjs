steal('can/util', 'can/observe', function(can, Observe) {

can.each([ can.Observe, can.Model ], function(clss){
	// in some cases model might not be defined quite yet.
	if(clss === undefined){
		return;
	}
	var isObject = function( obj ) {
		return typeof obj === 'object' && obj !== null && obj;
	};
	
	can.extend(clss, {
		/**
		 * @property can.Observe.attributes.static.attributes attributes
		 * @parent can.Observe.attributes.static
		 *
		 * `can.Observe.attributes` is a property that contains key/value pair(s) of an attribute's name and its
		 * respective type for using in [can.Observe.attributes.static.convert convert] and [can.Observe.prototype.serialize serialize].
		 * 
		 *		var Contact = can.Observe({
		 *			attributes : {
		 *				birthday : 'date',
		 *				age: 'number',
		 *				name: 'string'
		 *			}
		 *		});
		 *
		 */
		attributes : {},
		
		/**
		 * @property can.Observe.attributes.static.convert convert
		 * @parent can.Observe.attributes.static
		 *
		 * You often want to convert from what the observe sends you to a form more useful to JavaScript. 
		 * For example, contacts might be returned from the server with dates that look like: "1982-10-20". 
		 * We can observe to convert it to something closer to `new Date(1982,10,20)`.
		 *
		 * Convert comes with the following types:
		 *
		 * - __date__ Converts to a JS date. Accepts integers or strings that work with Date.parse
		 * - __number__ An integer or number that can be passed to parseFloat
		 * - __boolean__ Converts "false" to false, and puts everything else through Boolean()
		 *
		 * The following sets the birthday attribute to "date" and provides a date conversion function:
		 *
		 *		var Contact = can.Observe({
		 *			attributes : {
		 *				birthday : 'date'
		 *			},
		 *			convert : {
		 *				date : function(raw){
		 *					if(typeof raw == 'string'){
		 *						//- Extracts dates formated 'YYYY-DD-MM'
		 *						var matches = raw.match(/(\d+)-(\d+)-(\d+)/);
		 *	
		 *						//- Parses to date object and returns
		 *						return new Date(matches[1], 
		 *								        (+matches[2])-1, 
		 *									    matches[3]);
		 *
		 *					}else if(raw instanceof Date){
		 *						return raw;
		 *					}
		 *				}
		 *			}
		 *		},{});
		 *
		 *		var contact = new Contact();
		 *
		 *		//- calls convert on attribute set
		 *		contact.attr('birthday', '4-26-2012') 
		 *
		 *		contact.attr('birthday'); //-> Date
		 * 
		 * If a property is set with an object as a value, the corresponding converter is called with the unmerged data (the raw object)
		 * as the first argument, and the old value (a can.Observe) as the second:
		 * 
		 * 		var MyObserve = can.Observe({
	     *			attributes: {
	     *   			nested: "nested"
	     *			},
	     *			convert: {
		 *				nested: function(data, oldVal) {
		 *					if(oldVal instanceof MyObserve) {
		 *						return oldVal.attr(data);
		 *					}
		 *					return new MyObserve(data);
		 *				}
	     *			}
		 *		},{});
		 *
		 * ## Differences From `attr`
		 * 
		 * The way that return values from convertors affect the value of an Observe's property is
		 * different from [can.Observe::attr attr]'s normal behavior. Specifically, when the 
		 * property's current value is an Observe or List, and an Observe or List is returned
		 * from a convertor, the effect will not be to merge the values into the current value as
		 * if the return value was fed straight into `attr`, but to replace the value with the
		 * new Observe or List completely. Because of this, any bindings you have on the previous
		 * observable object will break.
		 *
		 * If you would rather have the new Observe or List merged into the current value, call
		 * `attr` directly on the property instead of on the Observe:
		 * 
		 * @codestart
		 * var Contact = can.Observe({
		 *   attributes: {
		 *     info: 'info'
		 *   },
		 *   convert: {
		 *     'info': function(data, oldVal) {
		 *       return data;
		 * 	}
		 *   }
		 * }, {}));
		 * 
		 * var alice = new Contact({info: {name: 'Alice Liddell', email: 'alice@liddell.com'}});
		 * alice.attr(); // {name: 'Alice Liddell', 'email': 'alice@liddell.com'}
		 * alice.info._cid; // '.observe1'
		 * 
		 * alice.attr('info', {name: 'Allison Wonderland', phone: '888-888-8888'});
		 * alice.attr(); // {name: 'Allison Wonderland', 'phone': '888-888-8888'}
		 * alice.info._cid; // '.observe2'
		 * 
		 * alice.info.attr({email: 'alice@wonderland.com', phone: '000-000-0000'});
		 * alice.attr(); // {name: 'Allison Wonderland', email: 'alice@wonderland.com', 'phone': '000-000-0000'}
		 * alice.info._cid; // '.observe2'
		 * @codeend
		 *
		 * ## Assocations and Convert
		 *
		 * If you have assocations defined within your model(s), you can use convert to automatically
		 * call serialize on those models.
		 * 
		 * 		can.Model("Contact",{
		 * 			attributes : {
		 * 				tasks: "Task.models"
		 * 			}
		 * 		}, {});
		 *
		 * 		can.Model("Task",{
		 * 			attributes : {
		 * 				due : 'date'
		 * 			}
		 * 		},{});
		 *
		 * 		var contact = new Contact({
		 * 			tasks: [ new Task({
		 * 				due: new Date()
		 * 			}) ]
		 * 		});
		 * 
		 * 		contact.seralize(); 
		 * 		//-> { tasks: [ { due: 1333219754627 } ] }
		 * 
		 */
		convert: {
			"date": function( str ) {
				var type = typeof str;
				if ( type === "string" ) {
					str = Date.parse(str);
					return isNaN(str) ? null : new Date(str);
				} else if ( type === 'number' ) {
					return new Date(str)
				} else {
					return str
				}
			},
			"number": function( val ) {
				return parseFloat(val);
			},
			"boolean": function (val) {
				if(val === 'false' || val === '0' || !val) {
					return false;
				}
				return true;
			},
			"default": function( val, oldVal, error, type ) {
				var construct = can.getObject(type),
					context = window,
					realType;
				// if type has a . we need to look it up
				if ( type.indexOf(".") >= 0 ) {
					// get everything before the last .
					realType = type.substring(0, type.lastIndexOf("."));
					// get the object before the last .
					context = can.getObject(realType);
				}
				return typeof construct == "function" ? construct.call(context, val, oldVal) : val;
			}
		},
		/**
		 * @property can.Observe.attributes.static.serialize serialize
		 * @parent can.Observe.attributes.static
		 *
		 * `can.Observe.serialize` is an object of name-function pairs that are used to 
		 * serialize attributes.
		 *
		 * Similar to [can.Observe.convert], in that the keys of this object correspond to 
		 * the types specified in [can.Observe.attributes].
		 *
		 * By default every attribute will be passed through the 'default' serialization method 
		 * that will return the value if the property holds a primitive value (string, number, ...), 
		 * or it will call the "serialize" method if the property holds an object with the "serialize" method set.
		 *
		 * For example, to serialize all dates to ISO format:
		 *
		 * 		var Contact = can.Observe({
		 * 			attributes : {
		 * 				birthday : 'date'
		 * 			},
		 * 			serialize : {
		 * 				date : function(val, type){
		 * 					return new Date(val).toISOString();
		 * 				}
		 * 			}
		 * 		},{});
		 * 		
		 * 		var contact = new Contact({ 
		 * 			birthday: new Date("Oct 25, 1973") 
		 * 		}).serialize();
		 * 		//-> { "birthday" : "1973-10-25T05:00:00.000Z" }
		 *
		 */
		serialize: {
			"default": function( val, type ) {
				return isObject(val) && val.serialize ? val.serialize() : val;
			},
			"date": function( val ) {
				return val && val.getTime()
			}
		}
	});
	
	// overwrite setup to do this stuff
	var oldSetup = clss.setup;
	
	/**
	 * @hide
	 * @function can.Observe.setup
	 * @parent can.Observe.attributes
	 *
	 * `can.Observe.static.setup` overrides default `can.Observe` setup to provide
	 * functionality for attributes.
	 *
	 */
	clss.setup = function(superClass, stat, proto){
		var self = this;
		oldSetup.call(self, superClass, stat, proto);

		can.each(["attributes"], function( name ) {
			if (!self[name] || superClass[name] === self[name] ) {
				self[name] = {};
			}
		});

		can.each(["convert", "serialize"], function( name ) {
			if ( superClass[name] != self[name] ) {
				self[name] = can.extend({}, superClass[name], self[name]);
			}
		});
	};
});

var oldSetup = can.Observe.prototype.setup;

can.Observe.prototype.setup = function(obj) {

	var diff = {};

	oldSetup.call(this, obj);

	can.each( this.constructor.defaults, function( value, key ) {
		if ( ! this.hasOwnProperty( key )) {
			diff[key] = value;
		}
	}, this);

	this._init = 1;
	this.attr( diff );
	delete this._init;
};

/**
 * @hide
 * @function can.Observe.prototype.convert
 * @parent can.Observe.attributes
 */
can.Observe.prototype.__convert = function(prop, value){
	// check if there is a

	var Class = this.constructor,
		oldVal = this.attr(prop),
		type, converter;
		
	if(Class.attributes){
		// the type of the attribute
		type = Class.attributes[prop];
		converter = Class.convert[type] || Class.convert['default'];
	}
		
	return value === null || !type ? 
			// just use the value
			value : 
			// otherwise, pass to the converter
			converter.call(Class, value, oldVal, function() {}, type);
};

/**
 * @function can.Observe.prototype.attributes.serialize serialize
 * @parent can.Observe.attributes.prototype
 *
 * @description Serializes the observe's properties using 
 * the [can.Observe.attributes attribute plugin].
 *
 * @signature `observe.serialize([attrName])`
 * @param {String} [attrName] If passed, returns only a serialization of the named attribute.
 * @return {String} A serialization of this Observe.
 *
 * @body
 * You can set the serialization methods similar to the convert methods:
 *
 *		var Contact = can.Observe({
 *			attributes : { 
 *				birthday : 'date'
 *			},
 *			serialize : {
 *				date : function( val, type ){
 *					return val.getYear() + 
 *						"-" + (val.getMonth() + 1) + 
 *						"-" + val.getDate(); 
 *				}
 *			}
 *		},{})
 *
 *		var contact = new Contact();
 *		contact.attr('birthday', new Date());
 *		contact.serialize()
 *		//-> { birthday: 'YYYY-MM-DD' }
 *
 * You can also get and serialize an individual property by passing the attribute
 * name to the `serialize` function.  Building on the above demo, we can serialize
 * the `birthday` attribute only.
 *
 *		contact.serialize('birthday') //-> 'YYYY-MM-DD'
 */
can.Observe.prototype.serialize = function(attrName, stack) {
	var where = {},
		Class = this.constructor,
		attrs = {};

	stack = can.isArray(stack) ? stack : [];
	stack.push(this._cid);

	if(attrName !== undefined){
		attrs[attrName] = this[attrName];
	} else {
		attrs = this.__get();
	}

	can.each(attrs, function( val, name ) {
		var type, converter;

		// If this is an observe, check that it wasn't serialized earlier in the stack.
		if(val instanceof can.Observe && can.inArray(val._cid, stack) > -1) {
			// Since this object has already been serialized once,
			// just reference the id (or undefined if it doesn't exist).
			where[name] = val.attr('id');
		} 
		else {
			type = Class.attributes ? Class.attributes[name] : 0;
			converter = Class.serialize ? Class.serialize[type] : 0;

			// if the value is an object, and has a attrs or serialize function
			where[name] = val && typeof val.serialize == 'function' ?
			// call attrs or serialize to get the original data back
			val.serialize(undefined, stack) :
			// otherwise if we have  a converter
			converter ?
				// use the converter
				converter(val, type) :
				// or return the val
				val;
		}
	});

	return attrName != undefined ? where[attrName] : where;
};
return can.Observe;
});
