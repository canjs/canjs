var canKey = require("can-key");
var canKeyUtils = require("can-key/utils");
var canReflect = require("can-reflect");
var Observation = require("can-observation");

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	var canReflectDependencies = require("can-reflect-dependencies");
}
//!steal-remove-end

module.exports = function keyObservable(root, keyPath) {
	var keyPathParts = canKeyUtils.parts(keyPath);
	var lastIndex = keyPathParts.length - 1;

	// Some variables used to build the dependency/mutation graph
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		var lastKey;// This stores the last part of the keyPath, e.g. “key” in “outer.inner.key”
		var lastParent;// This stores the object that the last key is on, e.g. “outer.inner” in outer: {inner: {"key": "value"}}
	}
	//!steal-remove-end

	var observation = new Observation(function() {
		var value;

		// This needs to be walked every time because the objects along the key path might change
		canKey.walk(root, keyPathParts, function(keyData, i) {
			if (i === lastIndex) {
				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					// observation is mutating keyData.parent
					if (lastParent && (keyData.key !== lastKey || keyData.parent !== lastParent)) {
						canReflectDependencies.deleteMutatedBy(lastParent, lastKey, observation);
					}
					lastKey = keyData.key;
					lastParent = keyData.parent;
					canReflectDependencies.addMutatedBy(lastParent, lastKey, observation);
				}
				//!steal-remove-end

				value = keyData.value;
			}
		});

		return value;
	});

	// Function for setting the value
	var valueSetter = function(newVal) {
		canKey.set(root, keyPathParts, newVal);
	};

	// The `value` property getter & setter
	Object.defineProperty(observation, "value", {
		get: observation.get,
		set: valueSetter
	});

	var symbolsToAssign = {
		"can.setValue": valueSetter
	};

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {

		// Debug name
		symbolsToAssign["can.getName"] = function getName() {
			var objectName = canReflect.getName(root);
			return "keyObservable<" + objectName + "." + keyPath + ">";
		};

		// Register what this observable changes
		symbolsToAssign["can.getWhatIChange"] = function getWhatIChange() {
			var m = new Map();
			var s = new Set();
			s.add(lastKey);
			m.set(lastParent, s);
			return {
				mutate: {
					keyDependencies: m
				}
			};
		};
	}
	//!steal-remove-end

	return canReflect.assignSymbols(observation, symbolsToAssign);
}
