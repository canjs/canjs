var Bind = require("../can-bind");
var canReflect = require("can-reflect");
var QUnit = require("steal-qunit");
var SettableObservable = require("can-simple-observable/settable/settable");
var SimpleObservable = require("can-simple-observable");

QUnit.module("can-bind initialization");

QUnit.test("undefined child and defined parent with setter", function(assert) {
	var child = new SimpleObservable(undefined);
	var parentSetterWasCalled = false;
	var parent = new SimpleObservable(15);
	canReflect.assignSymbols(parent, {
		"can.setValue": function() {
			parentSetterWasCalled = true;
		}
	});

	var binding = new Bind({
		child: child,
		parent: parent
	});

	// When the binding is turned on, the child is set to the parent’s value
	// because the child is undefined and the parent is a defined value. This
	// shouldn’t result in updateParent(15) being called.
	binding.start();
	assert.equal(parentSetterWasCalled, false, "parent setter was not called");

	// Turn off the listeners
	binding.stop();
});

QUnit.test("undefined parent and null child with setter", function(assert) {
	var parent = new SimpleObservable(undefined);

	// This value will always set itself to an empty string if it’s set to a falsey value
	var child = new SettableObservable(function(newValue) {
		return newValue || "";
	}, null, null);

	var binding = new Bind({
		child: child,
		cycles: 0,
		parent: parent,
		sticky: "childSticksToParent"
	});

	// When the binding is turned on, the parent should be set to the child’s value
	// because the parent is undefined and the child is a defined value (null).
	// Then, because this is a two-way binding, the updateChild(null) will be
	// called and the child’s setter above will set the child’s actual value to an
	// empty string.
	binding.start();

	// Check the expected values
	assert.equal(
		canReflect.getValue(child),
		"",
		"child value is correct"
	);

	// Turn off the listeners
	binding.stop();
});

function initializationTest(options, assert) {

	// Create the binding
	var child = new SimpleObservable(options.startingChild);
	var parent = new SimpleObservable(options.startingParent);
	var binding = new Bind({
		child: child,
		childToParent: options.childToParent,
		onInitDoNotUpdateChild: options.onInitDoNotUpdateChild,
		onInitDoNotUpdateParent: options.onInitDoNotUpdateParent,
		onInitSetUndefinedParentIfChildIsDefined: options.onInitSetUndefinedParentIfChildIsDefined,
		parent: parent,
		parentToChild: options.parentToChild
	});

	// Turn on the listeners
	binding.start();

	// Check the expected values
	assert.equal(
		canReflect.getValue(child),
		options.expectedChild,
		"child value is correct"
	);
	assert.equal(
		canReflect.getValue(parent),
		options.expectedParent,
		"parent value is correct"
	);

	// Turn off the listeners
	binding.stop();
}

QUnit.test("child=1  <->  parent=2  =>  child=2  parent=2", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: 2,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 2,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=1  <->  parent=undefined  =>  child=1  parent=1", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: undefined,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: 1
	}, assert);
});

QUnit.test("child=undefined  <->  parent=2  =>  child=2  parent=2", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: 2,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 2,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=undefined  <->  parent=undefined  =>  child=undefined  parent=undefined", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: undefined,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=3  <->  parent=3  =>  child=3  parent=3", function(assert) {
	initializationTest({
		startingChild: 3,
		startingParent: 3,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 3,
		expectedParent: 3
	}, assert);
});

QUnit.test("child=1  ->  parent=2  =>  child=1  parent=1", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: 2,
		childToParent: true,
		parentToChild: false,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: 1
	}, assert);
});

QUnit.test("child=1  ->  parent=undefined  =>  child=1  parent=1", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: undefined,
		childToParent: true,
		parentToChild: false,
		onInitDoNotUpdateChild: false,
		onInitDoNotUpdateParent: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: 1
	}, assert);
});

QUnit.test("child=1  ->  parent=undefined  =>  child=1  parent=undefined", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: undefined,
		childToParent: true,
		parentToChild: false,
		onInitDoNotUpdateChild: false,
		onInitDoNotUpdateParent: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=undefined  ->  parent=2  =>  child=undefined  parent=undefined", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: 2,
		childToParent: true,
		parentToChild: false,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=undefined  ->  parent=undefined  =>  child=undefined  parent=undefined", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: undefined,
		childToParent: true,
		parentToChild: false,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=3  ->  parent=3  =>  child=3  parent=3", function(assert) {
	initializationTest({
		startingChild: 3,
		startingParent: 3,
		childToParent: true,
		parentToChild: false,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 3,
		expectedParent: 3
	}, assert);
});

QUnit.test("child=1  <-  parent=2  =>  child=2  parent=2", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: 2,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 2,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=1  <-  parent=undefined  =>  child=undefined  parent=undefined", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: undefined,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=undefined  <-  parent=2  =>  child=2  parent=2", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: 2,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 2,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=undefined  <-  parent=undefined  =>  child=undefined  parent=undefined", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: undefined,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=3  <-  parent=3  =>  child=3  parent=3", function(assert) {
	initializationTest({
		startingChild: 3,
		startingParent: 3,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 3,
		expectedParent: 3
	}, assert);
});

QUnit.test("child=1  <-> parent=2  =>  child=1  parent=2  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: 2,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=1  <-> parent=undefined  =>  child=1  parent=1  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: undefined,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: 1
	}, assert);
});

QUnit.test("child=undefined  <-> parent=2  =>  child=undefined  parent=2  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: 2,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=undefined  <-> parent=undefined  =>  child=undefined  parent=undefined  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: undefined,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=3  <-> parent=3  =>  child=3  parent=3  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: 3,
		startingParent: 3,
		childToParent: true,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 3,
		expectedParent: 3
	}, assert);
});

QUnit.test("child=1  <-  parent=2  =>  child=1  parent=2  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: 2,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=1  <-  parent=undefined  =>  child=1  parent=undefined  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: 1,
		startingParent: undefined,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 1,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=undefined  <-  parent=2  =>  child=undefined  parent=2  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: 2,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: 2
	}, assert);
});

QUnit.test("child=undefined  <-  parent=undefined  =>  child=undefined  parent=undefined  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: undefined,
		startingParent: undefined,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: undefined,
		expectedParent: undefined
	}, assert);
});

QUnit.test("child=3  <-  parent=3  =>  child=3  parent=3  [onInitDoNotUpdateChild=true]", function(assert) {
	initializationTest({
		startingChild: 3,
		startingParent: 3,
		childToParent: false,
		parentToChild: true,
		onInitDoNotUpdateChild: true,
		onInitSetUndefinedParentIfChildIsDefined: true,
		expectedChild: 3,
		expectedParent: 3
	}, assert);
});

QUnit.test("parent and child properties", function(assert) {
	var child = new SimpleObservable(undefined);
	var parentSetterWasCalled = false;
	var parent = new SimpleObservable(15);
	canReflect.assignSymbols(parent, {
		"can.setValue": function() {
			parentSetterWasCalled = true;
		}
	});

	var binding = new Bind({
		child: child,
		parent: parent
	});

	assert.equal(binding.child, child, "child");
	assert.equal(binding.parent, parent, "child");
});
