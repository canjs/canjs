require("can-stache-converters");
var DefineMap = require("can-define/map/map");
var domEvents = require("can-dom-events");
var stache = require("can-stache");

var QUnit = require("steal-qunit");

QUnit.module("selected-to-index");

QUnit.test("sets index by the value from a list", function(assert) {
	var template = stache('<input value:bind="selected-to-index(~index, people)" />');

	var map = new DefineMap({
		index: "1",
		people: [
			"Matthew",
			"Anne",
			"Wilbur"
		]
	});

	var input = template(map).firstChild;

	// Initial value
	assert.equal(input.value, "Anne", "initially set to the first value");

	// Select a different thing.
	input.value = "Wilbur";
	domEvents.dispatch(input, "change");

	assert.equal(map.index, "2", "now it is me");

	// Change the selected the other way.
	map.index = "0";

	assert.equal(input.value, "Matthew", "set back");

	// Can be set to other stuff too
	input.value = "none";
	domEvents.dispatch(input, "change");

	assert.equal(map.index, -1, "now -1 because not in the list");
});


QUnit.test("sets index by the value from a list without ~", function(assert) {
	var template = stache('<input value:bind="selected-to-index(index, people)" />');

	var map = new DefineMap({
		index: "1",
		people: [
			"Matthew",
			"Anne",
			"Wilbur"
		]
	});

	var input = template(map).firstChild;

	// Initial value
	assert.equal(input.value, "Anne", "initially set to the first value");

	// Select a different thing.
	input.value = "Wilbur";
	domEvents.dispatch(input, "change");

	assert.equal(map.index, "2", "now it is me");

	// Change the selected the other way.
	map.index = "0";

	assert.equal(input.value, "Matthew", "set back");

	// Can be set to other stuff too
	input.value = "none";
	domEvents.dispatch(input, "change");

	assert.equal(map.index, -1, "now -1 because not in the list");
});
