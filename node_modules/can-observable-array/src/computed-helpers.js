const canReflect = require("can-reflect");
const mapBindings = require("can-event-queue/map/map");

var canMeta = Symbol.for("can.meta");
const computedPropertyDefinitionSymbol = Symbol.for("can.computedPropertyDefinitions");
const onKeyValueSymbol = Symbol.for("can.onKeyValue");
const offKeyValueSymbol = Symbol.for("can.offKeyValue");

// ## ComputedObjectObservationData
// Instances of this are created to wrap the observation.
// The `.bind` and `.unbind` methods should be called when the
// instance's prop is bound or unbound.
function ComputedObjectObservationData(instance, prop, observation){
	this.instance = instance;
    this.prop = prop;
    this.observation = observation;
	this.forward = this.forward.bind(this);
}

ComputedObjectObservationData.prototype.bind = function(){
    this.bindingCount++;
    if(this.bindingCount === 1) {
        this.observation.on(this.forward, "notify");
    }
};

ComputedObjectObservationData.prototype.unbind = function(){
    this.bindingCount--;
    if(this.bindingCount === 0) {
        this.observation.off(this.forward, "notify");
    }
};

ComputedObjectObservationData.prototype.forward = function(newValue, oldValue){
	mapBindings.dispatch.call(this.instance, {
		type: this.prop,
		key: this.prop,
		target: this.instance,
		value: newValue,
		oldValue: oldValue

		// patches: [{
		// 	key: this.prop,
		// 	type: "set",
		// 	value: newValue
		// }]
		// keyChanged: undefined
	}, [newValue, oldValue]);
};

ComputedObjectObservationData.prototype.bindingCount = 0;

function findComputed(instance, key) {
	var meta = instance[canMeta];
	var target = meta.target;

	var computedPropertyDefinitions = target[computedPropertyDefinitionSymbol];
	if (computedPropertyDefinitions === undefined) {
		return;
	}
	var computedPropertyDefinition = computedPropertyDefinitions[key];
	if (computedPropertyDefinition === undefined) {
		return;
	}

	if (meta.computedKeys[key] === undefined) {
		meta.computedKeys[key] = new ComputedObjectObservationData(
			instance, key,
			computedPropertyDefinition(instance, key)
		);
	}

	return meta.computedKeys[key];
}

const computedHelpers = {
	bind: function(instance, key) {
		let computedObj = findComputed(instance, key);
		if (computedObj === undefined) {
			return;
		}

		computedObj.bind();
	},
	addKeyDependencies: function(proxyKeys) {
		let onKeyValue = proxyKeys[onKeyValueSymbol];
		let offKeyValue = proxyKeys[offKeyValueSymbol];

		canReflect.assignSymbols(proxyKeys, {
			"can.onKeyValue": function(key) {
				computedHelpers.bind(this, key);
				return onKeyValue.apply(this, arguments);
			},
			"can.offKeyValue": function(key) {
				computedHelpers.unbind(this, key);
				return offKeyValue.apply(this, arguments);
			},
			"can.getKeyDependencies": function(key) {
				var computedObj = findComputed(this, key);
				if (computedObj === undefined) {
					return;
				}

				return {
					valueDependencies: new Set([ computedObj.observation ])
				};
			},
		});
	}
};

module.exports = computedHelpers;
