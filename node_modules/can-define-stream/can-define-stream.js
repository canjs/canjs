"use strict";
var define = require("can-define");
var assign = require("can-assign");
var canReflect = require("can-reflect");

module.exports = function(canStream) {
	return function(DefineMapType) {
		["toStream","toStreamFromProperty","toStreamFromEvent"] .forEach(function(name){
			DefineMapType.prototype[name] = function(){
				return canStream[name].apply(canStream, [this].concat( [].slice.call(arguments) ));
			};
		});

		DefineMapType.prototype.stream = DefineMapType.prototype.toStream;

		// figure out how to rebuild definitions.
		var definitions = DefineMapType.prototype._define.definitions,
			dataInitializers = DefineMapType.prototype._define.dataInitializers,
			computedInitializers = DefineMapType.prototype._define.computedInitializers;

		canReflect.eachKey(definitions, function(definition, property) {
			var streamDefinition = definition.stream;
			if(streamDefinition) {
				var newDefinition = assign({
					default: function() {
						return canStream.toCompute(streamDefinition, this);
					}
				}, define.types.compute);
				define.property(
					DefineMapType.prototype,
					property,
					newDefinition,
					dataInitializers,
					computedInitializers
				);
			}
		});
	};
};
