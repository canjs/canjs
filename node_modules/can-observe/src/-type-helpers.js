"use strict";
var queues = require("can-queues");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var canMeta = canSymbol.for("can.meta");
var typeDefinitionsSymbol = canSymbol.for("can.typeDefinitions");

var helpers = module.exports = {
	ensureDefinition: function(prototype) {
		var typeDefs = prototype[typeDefinitionsSymbol];
		if (!typeDefs) {
			var parent = prototype[typeDefinitionsSymbol];
			typeDefs = prototype[typeDefinitionsSymbol] = Object.create(parent || null);
		}

		return typeDefs;
	},
	addMethodsAndSymbols: function(Type) {
		canReflect.assignSymbols(Type, {
			"can.defineInstanceKey": function(prop, value) {
				helpers.ensureDefinition(this.prototype)[prop] = value;
			},
			"can.dispatchInstanceBoundChange": function(obj, isBound) {
				var meta = this[canMeta];
				if (meta) {
					var lifecycleHandlers = meta.lifecycleHandlers;
					if (lifecycleHandlers) {
						queues.enqueueByQueue(lifecycleHandlers.getNode([]), this, [obj, isBound]);
					}
				}
			},
		});
	},
	shouldRecordObservationOnAllKeysExceptFunctionsOnProto: function(keyInfo, meta){
		return meta.preventSideEffects === 0 && !keyInfo.isAccessor && (
			// it's on us
			(// it's on our proto, but not a function
            (keyInfo.targetHasOwnKey ) ||
			// it's "missing", and we are not sealed
			(!keyInfo.protoHasKey && !Object.isSealed(meta.target)) || keyInfo.protoHasKey && (typeof targetValue !== "function"))
		);
	},
};
