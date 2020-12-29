"use strict";
var Observation = require('can-observation');
var observeReader = require('can-stache-key');
var assign = require('can-assign');

var canReflect = require('can-reflect');
var canSymbol = require('can-symbol');
var ObservationRecorder = require('can-observation-recorder');
var makeComputeLike = require("./make-compute-like");
var canReflectDeps = require('can-reflect-dependencies');
var valueEventBindings = require("can-event-queue/value/value");
var stacheHelpers = require('can-stache-helpers');
var SimpleObservable = require("can-simple-observable");
var dev = require("can-log/dev/dev");

var dispatchSymbol = canSymbol.for("can.dispatch");
var setElementSymbol = canSymbol.for("can.setElement");

// The goal of this is to create a high-performance compute that represents a key value from can.view.Scope.
// If the key value is something like {{name}} and the context is a can.Map, a faster
// binding path will be used where new rebindings don't need to be looked for with every change of
// the observable property.
// However, if the property changes to a compute, then the slower `can.compute.read` method of
// observing values will be used.

// ideally, we would know the order things were read.  If the last thing read
// was something we can observe, and the value of it matched the value of the observation,
// and the key matched the key of the observation
// it's a fair bet that we can just listen to that last object.
// If the `this` is not that object ... freak out.  Though `this` is not necessarily part of it.  can-observation could make
// this work.


var getFastPathRoot = ObservationRecorder.ignore(function(computeData){
	if( computeData.reads &&
				// a single property read
				computeData.reads.length === 1 ) {
		var root = computeData.root;
		if( root && root[canSymbol.for("can.getValue")] ) {
			root = canReflect.getValue(root);
		}
		// on a map
		return root && canReflect.isObservableLike(root) && canReflect.isMapLike(root) &&
			// that isn't calling a function
			typeof root[computeData.reads[0].key] !== "function" && root;
	}
	return;
});

var isEventObject = function(obj){
	return obj && typeof obj.batchNum === "number" && typeof obj.type === "string";
};

function getMutated(scopeKeyData){
	// The _thisArg is the value before the last `.`. For example if the key was `foo.bar.zed`,
	// _thisArg would be the value at foo.bar.
	// This should be improved as `foo.bar` might not be observable.
	var value = ObservationRecorder.peekValue(scopeKeyData._thisArg);

	// Something like `string@split` would provide a primitive which can't be a mutated subject
	return !canReflect.isPrimitive(value) ? value : scopeKeyData.root;
}

function callMutateWithRightArgs(method, mutated, reads, mutator){
	if(reads.length) {
		method.call(canReflectDeps,mutated, reads[ reads.length - 1 ].key ,mutator);
	} else {
		method.call(canReflectDeps,mutated ,mutator);
	}
}




var warnOnUndefinedProperty;
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	warnOnUndefinedProperty = function(options) {
		if ( options.key !== "debugger" && !options.parentHasKey) {
			var filename = options.scope.peek('scope.filename');
			var lineNumber = options.scope.peek('scope.lineNumber');

			var reads = observeReader.reads(options.key);
			var firstKey = reads[0].key;
			var key = reads.map(function(read) {
				return read.key + (read.at ? "()" : "");
			}).join(".");
			var pathsForKey = options.scope.getPathsForKey(firstKey);
			var paths = Object.keys( pathsForKey );
			var firstKeyValue = options.scope.get(firstKey);

			var includeSuggestions = paths.length && (paths.indexOf(firstKey) < 0);

			var warning = [
				(filename ? filename + ':' : '') +
					(lineNumber ? lineNumber + ': ' : '') +
					'Unable to find key "' + key + '".'
			];

			if (includeSuggestions) {
				warning[0] = warning[0] + ' Did you mean' + (paths.length > 1 ? ' one of these' : '') + '?\n';
				paths.forEach(function(path) {
					warning.push('\t"' + path + '" which will read from');
					warning.push(pathsForKey[path]);
					warning.push("\n");
				});
			} else if (firstKeyValue) {
				warning[0] = warning[0] + ' Found "' + firstKey + '" with value: %o\n';
			}

			if (firstKeyValue) {
				dev.warn.apply(dev, [warning.join("\n"), firstKeyValue]);
			} else {
				dev.warn.apply(dev,
					warning
				);
			}

		}
	};
}
//!steal-remove-end

// could we make this an observation first ... and have a getter for the compute?

// This is a fast-path enabled Observation wrapper use many places in can-stache.
// The goal of this is to:
//
// 1.  Make something that can be passed to can-view-live directly, hopefully
//     avoiding creating expensive computes.  Instead we will only be creating
//     `ScopeKeyData` which are thin wrappers.
var ScopeKeyData = function(scope, key, options){

	this.startingScope = scope;
	this.key = key;
	this.read = this.read.bind(this);
	this.dispatch = this.dispatch.bind(this);

	// special case debugger helper so that it is called with helperOtions
	// when you do {{debugger}} as it already is with {{debugger()}}
	if (key === "debugger") {
		// prevent "Unable to find key" warning
		this.startingScope = { _context: stacheHelpers };

		this.read = function() {
			var helperOptions = { scope: scope };
			var debuggerHelper = stacheHelpers["debugger"];
			return debuggerHelper(helperOptions);
		};
	}

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		Object.defineProperty(this.read, "name", {
			value: canReflect.getName(this) + ".read",
		});
		Object.defineProperty(this.dispatch, "name", {
			value: canReflect.getName(this) + ".dispatch",
		});
	}
	//!steal-remove-end

	var observation = this.observation = new Observation(this.read, this);
	this.options = assign({ observation: this.observation }, options);

	// things added later
	this.fastPath = undefined;
	this.root = undefined;
	this.reads = undefined;
	this.setRoot = undefined;
	// This is read by call expressions so it needs to be observable
	this._thisArg = new SimpleObservable();
	this.parentHasKey = undefined;
	var valueDependencies = new Set();
	valueDependencies.add(observation);
	this.dependencies = {valueDependencies: valueDependencies};

	// This is basically what .get() should give, but it
	// isn't used to figure out the last value.
	this._latestValue = undefined;
};

valueEventBindings(ScopeKeyData.prototype);

function fastOnBoundSet_Value() {
	this._value = this.newVal;
}

function fastOnBoundSetValue() {
	this.value = this.newVal;
}

assign(ScopeKeyData.prototype, {
	constructor: ScopeKeyData,
	dispatch: function dispatch(newVal){
		var old = this.value;
		this._latestValue = this.value = newVal;
		// call the base implementation in can-event-queue
		this[dispatchSymbol].call(this, this.value, old);
	},
	onBound: function onBound(){
		this.bound = true;
		canReflect.onValue(this.observation, this.dispatch, "notify");
		// TODO: we should check this sometime in the background.
		var fastPathRoot = getFastPathRoot(this);
		if( fastPathRoot ) {
			// rewrite the observation to call its event handlers
			this.toFastPath(fastPathRoot);
		}
		this._latestValue = this.value = ObservationRecorder.peekValue(this.observation);
	},
	onUnbound: function onUnbound() {
		this.bound = false;
		canReflect.offValue(this.observation, this.dispatch, "notify");
		this.toSlowPath();
	},
	set: function(newVal){
		var root = this.root || this.setRoot;
		if(root) {
			if(this.reads.length) {
				observeReader.write(root, this.reads, newVal, this.options);
			} else {
				canReflect.setValue(root,newVal);
			}
		} else {
			this.startingScope.set(this.key, newVal, this.options);
		}
	},
	get: function() {
		if (ObservationRecorder.isRecording()) {
			ObservationRecorder.add(this);
			if (!this.bound) {
				Observation.temporarilyBind(this);
			}
		}

		if (this.bound === true && this.fastPath === true) {
			return this._latestValue;
		} else {
			return ObservationRecorder.peekValue(this.observation);
		}
	},
	toFastPath: function(fastPathRoot){
		var self = this,
			observation = this.observation;

		this.fastPath = true;

		// there won't be an event in the future ...
		observation.dependencyChange = function(target, newVal){
			if(isEventObject(newVal)) {
				throw "no event objects!";
			}
			// but I think we will be able to get at it b/c there should only be one
			// dependency we are binding to ...
			if(target === fastPathRoot && typeof newVal !== "function") {
				self._latestValue = newVal;
				this.newVal = newVal;
			} else {
				// restore
				self.toSlowPath();
			}

			return Observation.prototype.dependencyChange.apply(this, arguments);
		};

		if (observation.hasOwnProperty("_value")) {// can-observation 4.1+
			observation.onBound = fastOnBoundSet_Value;
		} else {// can-observation < 4.1
			observation.onBound = fastOnBoundSetValue;
		}
	},
	toSlowPath: function(){
		this.observation.dependencyChange = Observation.prototype.dependencyChange;
		this.observation.onBound = Observation.prototype.onBound;
		this.fastPath = false;
	},
	read: function(){
		var data;

		if (this.root) {
			// if we've figured out a root observable, start reading from there
			data = observeReader.read(this.root, this.reads, this.options);

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				// remove old dependency
				if(this.reads.length) {
					callMutateWithRightArgs(canReflectDeps.deleteMutatedBy, getMutated(this), this.reads,this);
				}

			}
			//!steal-remove-end

			// update thisArg and add new dependency
			this.thisArg = data.parent;

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				var valueDeps = new Set();
				valueDeps.add(this);
				callMutateWithRightArgs(canReflectDeps.addMutatedBy, data.parent || this.root, this.reads,{
					valueDependencies: valueDeps
				});
			}
			//!steal-remove-end

			return data.value;
		}
		// If the key has not already been located in a observable then we need to search the scope for the
		// key.  Once we find the key then we need to return it's value and if it is found in an observable
		// then we need to store the observable so the next time this compute is called it can grab the value
		// directly from the observable.
		data = this.startingScope.read(this.key, this.options);


		this.scope = data.scope;
		this.reads = data.reads;
		this.root = data.rootObserve;
		this.setRoot = data.setRoot;
		this.thisArg = data.thisArg;
		this.parentHasKey = data.parentHasKey;

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (data.rootObserve) {
				var rootValueDeps = new Set();
				rootValueDeps.add(this);
				callMutateWithRightArgs(canReflectDeps.addMutatedBy, getMutated(this), data.reads,{
					valueDependencies: rootValueDeps
				});
			}
			if(data.value === undefined && this.options.warnOnMissingKey === true) {
				warnOnUndefinedProperty({
					scope: this.startingScope,
					key: this.key,
					parentHasKey: data.parentHasKey
				});
			}
		}
		//!steal-remove-end

		return data.value;
	},
	hasDependencies: function(){
		// ScopeKeyData is unique in that when these things are read, it will temporarily bind
		// to make sure the right value is returned. This is for can-stache.
		// Helpers warns about a missing helper.
		if (!this.bound) {
			Observation.temporarilyBind(this);
		}
		return canReflect.valueHasDependencies( this.observation );
	}
});

Object.defineProperty(ScopeKeyData.prototype, "thisArg", {
	get: function(){
		return this._thisArg.get();
	},
	set: function(newVal) {
		this._thisArg.set(newVal);
	}
});

var scopeKeyDataPrototype = {
	"can.getValue": ScopeKeyData.prototype.get,
	"can.setValue": ScopeKeyData.prototype.set,
	"can.valueHasDependencies": ScopeKeyData.prototype.hasDependencies,
	"can.getValueDependencies": function() {
		return this.dependencies;
	},
	"can.getPriority": function(){
		return canReflect.getPriority( this.observation );
	},
	"can.setPriority": function(newPriority){
		canReflect.setPriority( this.observation, newPriority );
	},
	"can.setElement": function(element) {
		this.observation[setElementSymbol](element);
	}
};

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	scopeKeyDataPrototype["can.getName"] = function() {
		return canReflect.getName(this.constructor) + "{{" + this.key + "}}";
	};
}
//!steal-remove-end
canReflect.assignSymbols(ScopeKeyData.prototype, scopeKeyDataPrototype);

// Creates a compute-like for legacy reasons ...
Object.defineProperty(ScopeKeyData.prototype, "compute", {
	get: function(){
		var compute = makeComputeLike(this);

		Object.defineProperty(this, "compute", {
			value: compute,
			writable: false,
			configurable: false
		});
		return compute;
	},
	configurable: true
});

Object.defineProperty(ScopeKeyData.prototype, "initialValue", {
	get: function(){
		if (!this.bound) {
			Observation.temporarilyBind(this);
		}
		return ObservationRecorder.peekValue(this);
	},
	set: function(){
		throw new Error("initialValue should not be set");
	},
	configurable: true
});

module.exports = ScopeKeyData;
