

"use strict";

var canReflect = require("can-reflect");
var KeyTree = require("can-key-tree");
var canSymbol = require("can-symbol");
var diff = require('../list/list');
var queues = require("can-queues");
var canSymbol = require("can-symbol");

var onValueSymbol = canSymbol.for("can.onValue"),
	offValueSymbol = canSymbol.for("can.offValue");
var onPatchesSymbol = canSymbol.for("can.onPatches");
var offPatchesSymbol = canSymbol.for("can.offPatches");

// Patcher takes a observable that might wrap a list type.
// When the observable changes, it will diff, and emit patches,
// and if the list emits patches, it will emit those too.
// It is expected that only `domUI` handlers are registered.
/*
var observable = new SimpleObservable( new DefineList([ "a", "b", "c" ]) )
var patcher = new Patcher(observable)
canReflect.onPatches( patcher,function(patches){
  console.log(patches) // a patch removing c, then a
})
var newList = new DefineList(["a","b"]);
observable.set(newList);
newList.unshift("X");
[
    {type: "splice", index: 2, deleteCount: 1}
]
var patches2 = [
    {type: "splice", index: 0, deleteCount: 0, inserted: ["X"]}
]
 */
var Patcher = function(observableOrList, priority) {
	// stores listeners for this patcher
	this.handlers = new KeyTree([Object, Array], {
		// call setup when the first handler is bound
		onFirst: this.setup.bind(this),
		// call teardown when the last handler is removed
		onEmpty: this.teardown.bind(this)
	});

	// save this value observable or patch emitter (list)
	this.observableOrList = observableOrList;
	// if we were passed an observable value that we need to read its array for changes
	this.isObservableValue = canReflect.isValueLike(this.observableOrList) || canReflect.isObservableLike(this.observableOrList);
	if(this.isObservableValue) {
	    this.priority = canReflect.getPriority(observableOrList);
	} else {
	    this.priority = priority || 0;
	}
	this.onList = this.onList.bind(this);
	this.onPatchesNotify = this.onPatchesNotify.bind(this);
	// needs to be unique so the derive queue doesn't only add one.
	this.onPatchesDerive = this.onPatchesDerive.bind(this);

	// stores patches that have happened between notification and
	// when we queue the  `onPatches` handlers in the `domUI` queue
	this.patches = [];


	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		Object.defineProperty(this.onList, "name", {
			value: "live.list new list::"+canReflect.getName(observableOrList),
		});
		Object.defineProperty(this.onPatchesNotify, "name", {
			value: "live.list notify::"+canReflect.getName(observableOrList),
		});
		Object.defineProperty(this.onPatchesDerive, "name", {
			value: "live.list derive::"+canReflect.getName(observableOrList),
		});
	}
	//!steal-remove-end
};


Patcher.prototype = {
	constructor: Patcher,
	setup: function() {
		if (this.observableOrList[onValueSymbol]) {
			// if we have an observable value, listen to when it changes to get a
			// new list.
			canReflect.onValue(this.observableOrList, this.onList, "notify");
			// listen on the current value (which shoudl be a list) if there is one
			this.setupList(canReflect.getValue(this.observableOrList));
		} else {
			this.setupList(this.observableOrList);
		}
	},
	teardown: function() {
		if (this.observableOrList[offValueSymbol]) {
			canReflect.offValue(this.observableOrList, this.onList, "notify");
		}
		if (this.currentList && this.currentList[offPatchesSymbol]) {
			this.currentList[offPatchesSymbol](this.onPatchesNotify, "notify");
		}
	},
	// listen to the list for patches
	setupList: function(list) {
		this.currentList = list;
		if (list && list[onPatchesSymbol]) {
			// If observable, set up bindings on list changes
			list[onPatchesSymbol](this.onPatchesNotify, "notify");
		}
	},
	// when the list changes, teardown the old list bindings
	// and setup the new list
	onList: function onList(newList) {
		var current = this.currentList || [];
		newList = newList || [];
		if (current[offPatchesSymbol]) {
			current[offPatchesSymbol](this.onPatchesNotify, "notify");
		}
		var patches = diff(current, newList);
		this.currentList = newList;
		this.onPatchesNotify(patches);
		if (newList[onPatchesSymbol]) {
			// If observable, set up bindings on list changes
			newList[onPatchesSymbol](this.onPatchesNotify, "notify");
		}
	},
	// This is when we get notified of patches on the underlying list.
	// Save the patches and queue up a `derive` task that will
	// call `domUI` updates.
	onPatchesNotify: function onPatchesNotify(patches) {
		// we are going to collect all patches
		this.patches.push.apply(this.patches, patches);
		// TODO: share priority
		queues.deriveQueue.enqueue(this.onPatchesDerive, this, [], {
			priority: this.priority
		});
	},
	// Let handlers (which should only be registered in `domUI`) know about patches
	// that they can apply.
	onPatchesDerive: function onPatchesDerive() {
		var patches = this.patches;
		this.patches = [];
		queues.enqueueByQueue(this.handlers.getNode([]), this.currentList, [patches, this.currentList], null,["Apply patches", patches]);
	}
};

canReflect.assignSymbols(Patcher.prototype, {
	"can.onPatches": function(handler, queue) {
		this.handlers.add([queue || "mutate", handler]);
	},
	"can.offPatches": function(handler, queue) {
		this.handlers.delete([queue || "mutate", handler]);
	}
});

module.exports = Patcher;
