var Bind = require("../can-bind");
var canReflect = require("can-reflect");
var canReflectDeps = require("can-reflect-dependencies");
var canTestHelpers = require("can-test-helpers");
var helpers = require("./helpers");
var Observation = require("can-observation");
var QUnit = require("steal-qunit");
var SettableObservable = require("can-simple-observable/settable/settable");
var SimpleMap = require("can-simple-map");
var SimpleObservable = require("can-simple-observable");
var queues = require("can-queues");

QUnit.module("can-bind core",helpers.moduleHooks);

QUnit.test("one-way binding to child", function(assert) {
	var parentValue = new SimpleObservable(0);
	var parent = new Observation(function() {
		return parentValue.get();
	});
	var child = new SimpleObservable(0);
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// Turn on the listeners
	binding.start();

	// Set the parent’s value and expect the child to update
	parentValue.set(15);
	assert.equal(canReflect.getValue(child), 15, "child updates");

	// Set the child observable’s value and the parent should not update
	child.set(22);
	assert.equal(canReflect.getValue(parent), 15, "parent does not update");

	// Turn off the listeners
	binding.stop();

	// Setting the parent’s value should no longer update the child
	parentValue.set(45);
	assert.equal(canReflect.getValue(child), 22, "parent listener correctly turned off");
});

canTestHelpers.dev.devOnlyTest("one-way binding to child - dependency data", function(assert) {
	var parentValue = new SimpleObservable(0);
	var parent = new Observation(function() {
		return parentValue.get();
	});
	var child = new SimpleObservable(0);
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// Turn on the listeners
	binding.start();

	// Child dependency/mutation data
	var childDepData = canReflectDeps.getDependencyDataOf(child);
	var valueDependencies = new Set();
	valueDependencies.add(parent);
	assert.deepEqual(
		childDepData,
		{
			whatChangesMe: {
				mutate: {
					valueDependencies: valueDependencies
				}
			}
		},
		"child observable has the correct mutation dependencies"
	);

	// Parent dependency/mutation data
	var parentDepData = canReflectDeps.getDependencyDataOf(parent);
	assert.deepEqual(
		parentDepData,
		{
			whatChangesMe: {
				derive: {
					valueDependencies: new Set([parentValue])
				}
			},
			whatIChange: {
				mutate: {
					valueDependencies: new Set([child])
				}
			}
		},
		"parent observable has the correct mutation dependencies"
	);

	// Turn off the listeners
	binding.stop();

	// Child dependency/mutation data
	childDepData = canReflectDeps.getDependencyDataOf(child);
	assert.equal(
		childDepData,
		undefined,
		"child observable has no mutation dependencies after stop()"
	);

	// Parent dependency/mutation data
	parentDepData = canReflectDeps.getDependencyDataOf(parent);
	assert.equal(
		parentDepData,
		undefined,
		"parent observable has no mutation dependencies after stop()"
	);
});

QUnit.test("one-way binding to parent", function(assert) {
	var parent = new SimpleObservable(0);
	var childValue = new SimpleObservable(0);
	var child = new Observation(function() {
		return childValue.get();
	});
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// Turn on the listeners
	binding.start();

	// Set the parent observable’s value and the child should not update
	parent.set(15);
	assert.equal(canReflect.getValue(child), 0, "child does not update");

	// Set the child’s value and expect the parent to update
	childValue.set(22);
	assert.equal(canReflect.getValue(parent), 22, "parent updates");

	// Turn off the listeners
	binding.stop();

	// Setting the child’s value should no longer update the parent
	childValue.set(58);
	assert.equal(canReflect.getValue(parent), 22, "child listener correctly turned off");
});

canTestHelpers.dev.devOnlyTest("one-way binding to parent - dependency data", function(assert) {
	var parent = new SimpleObservable(0);
	var childValue = new SimpleObservable(0);
	var child = new Observation(function() {
		return childValue.get();
	});
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// Turn on the listeners
	binding.start();

	// Child dependency/mutation data
	var childDepData = canReflectDeps.getDependencyDataOf(child);
	assert.deepEqual(
		childDepData,
		{
			whatChangesMe: {
				derive: {
					valueDependencies: new Set([childValue])
				}
			},
			whatIChange: {
				mutate: {
					valueDependencies: new Set([parent])
				}
			}
		},
		"child observable has the correct mutation dependencies"
	);

	// Parent dependency/mutation data
	var parentDepData = canReflectDeps.getDependencyDataOf(parent);
	assert.deepEqual(
		parentDepData,
		{
			whatChangesMe: {
				mutate: {
					valueDependencies: new Set([child])
				}
			}
		},
		"parent observable has the correct mutation dependencies"
	);

	// Turn off the listeners
	binding.stop();

	// Child dependency/mutation data
	childDepData = canReflectDeps.getDependencyDataOf(child);
	assert.equal(
		childDepData,
		undefined,
		"child observable has no mutation dependencies after stop()"
	);

	// Parent dependency/mutation data
	parentDepData = canReflectDeps.getDependencyDataOf(parent);
	assert.equal(
		parentDepData,
		undefined,
		"parent observable has no mutation dependencies after stop()"
	);
});

QUnit.test("basic two-way binding", function(assert) {
	var parent = new SimpleObservable(0);
	var child = new SimpleObservable(0);
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// Turn on the listeners
	binding.start();

	// Set the parent observable’s value and expect the child to update
	parent.set(15);
	assert.equal(canReflect.getValue(child), 15, "child updates");

	// Set the child observable’s value and expect the parent to update
	child.set(22);
	assert.equal(canReflect.getValue(parent), 22, "parent updates");

	// Stopping the binding should remove all listeners
	assert.equal(child.handlers.get([]).length, 1, "1 child listener before calling stop()");
	assert.equal(parent.handlers.get([]).length, 1, "1 parent listener before calling stop()");
	binding.stop();
	assert.equal(child.handlers.get([]).length, 0, "0 child listeners after calling stop()");
	assert.equal(parent.handlers.get([]).length, 0, "0 parent listeners after calling stop()");

	// Setting the parent observable’s value should no longer update the child
	parent.set(45);
	assert.equal(canReflect.getValue(child), 22, "parent listener correctly turned off");

	// Setting the child observable’s value should no longer update the parent
	child.set(58);
	assert.equal(canReflect.getValue(parent), 45, "child listener correctly turned off");
});

canTestHelpers.dev.devOnlyTest("basic two-way binding - dependency data", function(assert) {
	var parent = new SimpleObservable(0);
	var child = new SimpleObservable(0);
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// Turn on the listeners
	binding.start();

	// Child dependency/mutation data
	var childDepData = canReflectDeps.getDependencyDataOf(child);
	assert.deepEqual(
		childDepData,
		{
			whatChangesMe: {
				mutate: {
					valueDependencies: new Set([parent])
				}
			},
			whatIChange: {
				mutate: {
					valueDependencies: new Set([parent])
				}
			}
		},
		"child observable has the correct mutation dependencies"
	);

	// Parent dependency/mutation data
	var parentDepData = canReflectDeps.getDependencyDataOf(parent);
	assert.deepEqual(
		parentDepData,
		{
			whatChangesMe: {
				mutate: {
					valueDependencies: new Set([child])
				}
			},
			whatIChange: {
				mutate: {
					valueDependencies: new Set([child])
				}
			}
		},
		"parent observable has the correct mutation dependencies"
	);

	// Turn off the listeners
	binding.stop();

	// Child dependency/mutation data
	childDepData = canReflectDeps.getDependencyDataOf(child);
	assert.equal(
		childDepData,
		undefined,
		"child observable has no mutation dependencies after stop()"
	);

	// Parent dependency/mutation data
	parentDepData = canReflectDeps.getDependencyDataOf(parent);
	assert.equal(
		parentDepData,
		undefined,
		"parent observable has no mutation dependencies after stop()"
	);
});

canTestHelpers.dev.devOnlyTest("updateChildName and updateParentName options", function(assert) {
	var parent = new SimpleObservable(0);
	var child = new SimpleObservable(0);
	var binding = new Bind({
		child: child,
		parent: parent,
		updateChildName: "custom child name",
		updateParentName: "custom parent name"
	});

	assert.equal(binding._updateChild.name, "custom child name", "child name is correct");
	assert.equal(binding._updateParent.name, "custom parent name", "parent name is correct");
});

QUnit.test("two-way binding with both values undefined", function(assert) {
	var child = new SimpleObservable(undefined);
	var parent = new SimpleObservable(undefined);
	var setChildWasCalled = false;

	var binding = new Bind({
		child: child,
		parent: parent,
		setChild: function() {
			setChildWasCalled = true;
		}
	});

	// Turn on the listeners
	binding.start();

	// Set the child observable’s value and both should update
	assert.equal(setChildWasCalled, true, "setChild was called");

	// Turn off the listeners
	binding.stop();
});

QUnit.test("two-way binding updates are ignored after calling stop()", function(assert) {
	var child = new SimpleObservable(15);
	var parent = new SimpleObservable(15);
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// When the parent changes, turn the binding off
	var turnOffBinding = function() {
		binding.stop();
	};
	canReflect.onValue(parent, turnOffBinding, "domUI");

	// Turn on the listeners
	binding.start();

	// Set the parent observable’s value; first, the onValue callback above will
	// be called, turning off the binding. Anything listening to the parent’s
	// value will still be called, including can-bind, which will then ignore the
	// new value and not set the child because the binding has been turned off.
	parent.set(undefined);
	assert.equal(canReflect.getValue(child), 15, "child stays the same");
	assert.equal(canReflect.getValue(parent), undefined, "parent stays the same");

	// Turn off the listener
	canReflect.offValue(parent, turnOffBinding, "domUI");
});

QUnit.test("parentValue property", function(assert) {
	var parent = new SimpleObservable(15);
	var child = new SimpleObservable(22);
	var binding = new Bind({
		child: child,
		parent: parent,
		priority: 15
	});

	assert.equal(binding.parentValue, 15, "can get parentValue");
});

QUnit.test("priority option", function(assert) {
	var parent = new SettableObservable(helpers.incrementByOne, null, 0);
	var child = new SettableObservable(helpers.incrementByOne, null, 0);

	new Bind({
		child: child,
		parent: parent,
		priority: 15
	});

	assert.equal(canReflect.getPriority(child), 15, "child priority set");
	assert.equal(canReflect.getPriority(parent), 15, "parent priority set");
});

// This test is similar to what’s needed for can-route
QUnit.test("setChild and setParent options", function(assert) {
	var parent = new SimpleObservable(undefined);
	var map = new SimpleMap({
		prop: "value"
	});
	var child = new Observation(function() {
		return map.serialize();
	});
	var binding = new Bind({
		child: child,
		parent: parent,
		setChild: function(newValue) {
			var split = newValue.split("=");
			var objectValue = {};
			objectValue[split[0]] = split[1];
			map.set(objectValue);
		},
		setParent: function(newValue) {
			parent.set("prop=" + newValue.prop);
		}
	});

	// Turn on the listeners
	binding.start();

	// Set the parent’s value and expect the child to update
	parent.set("prop=15");
	assert.deepEqual(
		canReflect.getValue(child),
		{prop: "15"},
		"child updates"
	);

	// Set the child observable’s value and the parent should update
	map.set({
		prop: 22
	});
	assert.equal(canReflect.getValue(parent), "prop=22", "parent updates");

	// Turn off the listeners
	binding.stop();

	// Setting the parent’s value should no longer update the child
	parent.set("prop=45");
	assert.deepEqual(
		canReflect.getValue(child),
		{prop: 22},
		"parent listener correctly turned off"
	);
});

QUnit.test("use onEmit if observable has Symbol('can.onEmit')", function (assert) {
	var child = new SimpleObservable(5);
	var parent = new SimpleObservable(1);
	var childOffEmitCalled = false;
	var childOnEmitCalled = false;
	var setParentWasCalled = false;
	var childEmitFn = null;

	canReflect.assignSymbols(child, {
		"can.onEmit": function (updateFn) {
			childOnEmitCalled = true;
			childEmitFn = updateFn;
		},
		"can.offEmit": function () {
			childOffEmitCalled = true;
		},
		"can.onValue": null
	});

	var binding = new Bind({
		child: child,
		parent: parent,
		onInitDoNotUpdateParent: true,
		childToParent: true,
		parentToChild: false,
		setParent: function(newValue) {
			setParentWasCalled = true;
			parent.set(newValue);
		}
	});

	// When the binding is turned on, the parent's value should not be set
	binding.start();

	assert.equal(canReflect.getValue(parent), 1, "has correct initial value");

	// Emit a changed value
	childEmitFn(5);

	assert.equal(canReflect.getValue(parent), 5, "has emitted value");
	assert.equal(childOnEmitCalled, true, "onEmit was fired");
	assert.equal(setParentWasCalled, true, "parent was updated");

	// Turn off the listeners
	binding.stop();

	assert.equal(childOffEmitCalled, true, "offEmit was fired");
});

if(queues.domQueue) {
	QUnit.test("able to queue changes in dom queue", function(assert){
		var child = new SimpleObservable(5);
		var parent = new SimpleObservable(1);

		var element = document.createElement("div");


		var binding = new Bind({
			child: child,
			parent: parent,
			element: element,
			queue: "dom"
		});

		binding.start();

		assert.equal(child.value, 1, "updated child");
	});
}
