"use strict";
var getGlobal = require("can-globals/global/global");
var canSymbol = require("can-symbol");
var metaSymbol = canSymbol.for("can.meta");
var classTest = /^\s*class\s+/;

var helpers = {
	assignEverything: function(d, s) {
		Object.getOwnPropertyNames(s).concat(Object.getOwnPropertySymbols(s)).forEach(function(key) {
			Object.defineProperty(d, key, Object.getOwnPropertyDescriptor(s, key));
		});
		return d;
	},
	isBuiltInButNotArrayOrPlainObjectOrElement: function(obj) {
		if (obj instanceof getGlobal().Element) {
			return false;
		}
		return helpers.isBuiltInButNotArrayOrPlainObject(obj);
	},
	isBuiltInButNotArrayOrPlainObject: function(obj) {
		if (Array.isArray(obj)) {
			return false;
		}
		if (typeof obj === "function") {
			var fnCode = obj.toString();
			if (fnCode.indexOf("[native code]") > 0) {
				return true;
			} else {
				return false;
			}
		} else {
			var toString = Object.prototype.toString.call(obj);
			return toString !== '[object Object]' && toString.indexOf('[object ') !== -1;
		}

	},
	inheritsFromArray: function(obj) {
		var cur = obj;
		do {
			if (Array.isArray(cur)) {
				return true;
			}
			cur = Object.getPrototypeOf(cur);
		} while (cur);
		return false;
	},
	isClass: function(obj) {
		return typeof obj === 'function' && classTest.test(obj.toString());
	},
	supportsClass: (function() {
		try {
			eval('"use strict"; class A{};');
			return true;
		} catch (e) {
			return false;
		}
	})(),
	makeSimpleExtender: function(BaseType) {
		return function extend(name, staticProps, prototypeProps) {
		    var Type = function() {
		        var source = this;
				var instance = BaseType.apply(this, arguments);
		        if(source.init) {
		            // makes sure nothing can leak out
		            instance[metaSymbol].preventSideEffects++;
		            source.init.apply(instance, arguments);
		            instance[metaSymbol].preventSideEffects--;
		        }
		        return instance;
			};


			helpers.assignEverything(Type,BaseType);
			helpers.assignEverything(Type, staticProps || {});
			Type.extend = helpers.makeSimpleExtender(Type);
			Type.prototype = Object.create( BaseType.prototype );
			helpers.assignEverything(Type.prototype, prototypeProps || {});
			Type.prototype.constructor = Type;

			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				Object.defineProperty(Type, "name", {
					value: name
				});
			}
			//!steal-remove-end

			return Type;
		};
	},
	assignNonEnumerable: function(obj, key, value) {
		return Object.defineProperty(obj, key, {
		    enumerable: false,
		    writable: true,
		    configurable: true,
		    value: value
		});
	}
};


module.exports = helpers;
