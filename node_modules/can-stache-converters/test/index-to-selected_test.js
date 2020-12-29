require("can-stache-converters");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var domEvents = require("can-dom-events");
var stache = require("can-stache");
var canReflect = require("can-reflect");

var QUnit = require("steal-qunit");

QUnit.module("index-to-selected");

QUnit.test("chooses select option by the index from a list", function(assert) {
	var template = stache('<select value:bind="index-to-selected(~person, people)"><option value="none"></option>{{#each people}}<option value="{{scope.index}}">{{name}}</option>{{/each}}</select>');

	var map = new DefineMap({
		person: "Anne",
		people: [
			"Matthew",
			"Anne",
			"Wilbur"
		]
	});

	var select = template(map).firstChild;

	// Initial value
	assert.equal(select.value, 1, "initially set to the first value");

	// Select a different thing.
	select.value = 2;
	domEvents.dispatch(select, "change");

	assert.equal(map.person, "Wilbur", "now it is me");

	// Change the selected the other way.
	map.person = map.people.item(0);

	assert.equal(select.value, 0, "set back");

	// Can be set to other stuff too
	select.value = "none";
	domEvents.dispatch(select, "change");

	assert.equal(map.person, undefined, "now undefined because not in the list");
});

QUnit.test("chooses select option by the index from a list without ~", function(assert) {
	var template = stache('<select value:bind="index-to-selected(person, people)"><option value="none"></option>{{#each people}}<option value="{{scope.index}}">{{name}}</option>{{/each}}</select>');

	var map = new DefineMap({
		person: "Anne",
		people: [
			"Matthew",
			"Anne",
			"Wilbur"
		]
	});

	var select = template(map).firstChild;

	// Initial value
	assert.equal(select.value, 1, "initially set to the first value");

	// Select a different thing.
	select.value = 2;
	domEvents.dispatch(select, "change");

	assert.equal(map.person, "Wilbur", "now it is me");

	// Change the selected the other way.
	map.person = map.people.item(0);

	assert.equal(select.value, 0, "set back");

	// Can be set to other stuff too
	select.value = "none";
	domEvents.dispatch(select, "change");

	assert.equal(map.person, undefined, "now undefined because not in the list");
});
