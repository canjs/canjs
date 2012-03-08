steal('can/observe', function(){

var $Observe = can.Observe,
	each = can.each,
	getObject = can.String.getObject,
	extend = can.extend;
	
// adds attributes, serialize, convert
extend($Observe,{
	attributes : {},
	convert: {
		"date": function( str ) {
			var type = typeof str;
			if ( type === "string" ) {
				return isNaN(Date.parse(str)) ? null : Date.parse(str)
			} else if ( type === 'number' ) {
				return new Date(str)
			} else {
				return str
			}
		},
		"number": function( val ) {
			return parseFloat(val);
		},
		"boolean": function( val ) {
			return Boolean(val === "false" ? 0 : val);
		},
		"default": function( val, error, type ) {
			var construct = getObject(type),
				context = window,
				realType;
			// if type has a . we need to look it up
			if ( type.indexOf(".") >= 0 ) {
				// get everything before the last .
				realType = type.substring(0, type.lastIndexOf("."));
				// get the object before the last .
				context = getObject(realType);
			}
			return typeof construct == "function" ? construct.call(context, val) : val;
		}
	},
	serialize: {
		"default": function( val, type ) {
			return isObject(val) && val.serialize ? val.serialize() : val;
		},
		"date": function( val ) {
			return val && val.getTime()
		}
	}
});

var proto =  $Observe.prototype,
	oldSet = proto.__set,
	oldSetup = $Observe.setup;

proto.__set = function(prop, value, current, success, error){
	// check if there is a
	
	var Class = this.constructor,
		val, type, converter;
		
	if(Class.attributes){
		// the type of the attribute
		type = Class.attributes[prop];
		converter = Class.convert[type] || Class.convert['default'];
	}
		
	oldSet.call(this, prop, 
		// if we get null or there is no type set
		value === null || !type ? 
			// just use the value
			value : 
			// otherwise, pass to the converter
			converter.call(Class, value, function() {}, type), current, success, error  )
};

proto.serialize = function(){
	var where = {},
		Class = this.constructor,
		attrs = Class.attributes,
		serialize = Class.serialize;
	this.each(function( name, val ) {
		var type = attrs[name],
			converter= Class.serialize[type]
		// if the value is an object, and has a attrs or serialize function
		where[name] = val && typeof val.serialize == 'function' ?
		// call attrs or serialize to get the original data back
		val.serialize() :
		// otherwise if we have  a converter
		converter ? 
			// use the converter
			converter(val, type) : 
			// or return the val
			val
	})
	return where;
}

// overwrite setup to do this stuff
$Observe.setup = function(superClass, stat, proto){
	var self = this;
	oldSetup.call(self, superClass, stat, proto);
	
	each(["attributes", "validations"], function( i, name ) {
		if (!self[name] || superClass[name] === self[name] ) {
			self[name] = {};
		}
	});
	
	each(["convert", "serialize"], function( i, name ) {
		if ( superClass[name] != self[name] ) {
			self[name] = extend({}, superClass[name], self[name]);
		}
	});
};

//add missing converters and serializes

});