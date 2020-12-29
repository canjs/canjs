"use strict";
var functionReflections = require("./reflections/call/call");
var getSet = require("./reflections/get-set/get-set");
var observe = require("./reflections/observe/observe");
var shape = require("./reflections/shape/shape");
var schema = require("./reflections/shape/schema/schema");
var type = require("./reflections/type/type");
var getName = require("./reflections/get-name/get-name");
var namespace = require("can-namespace");

var reflect = {};
[
	functionReflections,
	getSet,
	observe,
	shape,
	type,
	getName,
	schema
].forEach(function(reflections){
	for(var prop in reflections) {
		reflect[prop] = reflections[prop];
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if(typeof reflections[prop] === "function") {
				var propDescriptor = Object.getOwnPropertyDescriptor(reflections[prop], 'name');
				if (!propDescriptor || propDescriptor.writable && propDescriptor.configurable) {
					Object.defineProperty(reflections[prop],"name",{
						value: "canReflect."+prop
					});
				}
			}
		}
		//!steal-remove-end
	}
});

require("./types/map");
require("./types/set");

module.exports = namespace.Reflect = reflect;
