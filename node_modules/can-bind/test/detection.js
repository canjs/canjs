var Bind = require("../can-bind");
var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var SimpleObservable = require("can-simple-observable");
var value = require("can-value");

QUnit.module("can-bind binding detection");

QUnit.test("child-to-parent without child setter", function(assert) {
	var parent = new SimpleObservable(undefined);
	var map = new SimpleMap({prop: "value"});
	var child = value.from(map, "prop");
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// This is a child -> parent binding because the child doesn’t have a setter
	assert.equal(binding._childToParent, true, "child -> parent detection");
	assert.equal(binding._parentToChild, false, "parent -> child detection");
});

QUnit.test("child-to-parent without parent getter", function(assert) {
	var child = new SimpleObservable(undefined);
	var map = new SimpleMap({prop: "value"});
	var parent = value.to(map, "prop");
	var binding = new Bind({
		child: child,
		parent: parent
	});

	// This is a child -> parent binding because the parent doesn’t have a getter
	assert.equal(binding._childToParent, true, "child -> parent detection");
	assert.equal(binding._parentToChild, false, "parent -> child detection");
});

QUnit.test("error thrown for no-way binding", function(assert) {
	var child = value.from(new SimpleMap({prop: "value"}), "prop");
	var parent = value.from(new SimpleMap({prop: "value"}), "prop");

	// An error is thrown because neither the child’s nor the parent’s value can be set
	assert.throws(
		function() {
			new Bind({
				child: child,
				parent: parent
			});
		},
		/binding/,
		"error thrown"
	);
});
