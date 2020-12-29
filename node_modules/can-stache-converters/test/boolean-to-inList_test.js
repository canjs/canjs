require("can-stache-converters");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");
var domEvents = require("can-dom-events");
var canReflect = require("can-reflect");

var QUnit = require("steal-qunit");

QUnit.module("boolean-to-inList", {
	beforeEach: function(assert) {
		this.fixture = document.getElementById('qunit-fixture');
	}
});

QUnit.test("Works with checkboxes", function(assert) {
	var template = stache("<input type='checkbox' checked:bind='boolean-to-inList(item, list)' />");
	var map = new DefineMap({
		item: 2,
		list: new DefineList([ 1, 2, 3 ])
	});

	var frag = template(map);
	var input = frag.firstChild;

	assert.ok(input.checked, "it is initially checked");
	assert.equal(map.list.indexOf(2), 1, "two is in the list");

	input.checked = false;
	domEvents.dispatch(input, "change");

	assert.equal(map.list.indexOf(2), -1, "No longer in the list");

	map.item = 3;
	assert.ok(input.checked, "3 is in the list");

	// Add something to the list
	map.item = 5;
	assert.ok(!input.checked, "5 is not in the list");

	map.list.push(5);
	assert.ok(input.checked, "Now 5 is in the list");

	map.item = 6;
	input.checked = true;
	domEvents.dispatch(input, "change");

	assert.equal(map.list.indexOf(6), 3, "pushed into the list");
});

QUnit.test("If there is no list, treated as false", function(assert) {
	var template = stache("<input type='checkbox' checked:bind='boolean-to-inList(item, list)' />");
	var map = new DefineMap({
		item: 2,
		list: undefined
	});
	var frag = template(map);
	var input = frag.firstChild;

	assert.ok(!input.checked, "not checked because there is no list");

	input.checked = true;
	domEvents.dispatch(input, "change");

	assert.ok(true, "no errors thrown");
});

QUnit.test("works with radio buttons", function(assert) {
	var template = stache("<form><input type='radio' name='name' value='Matthew' checked:bind='boolean-to-inList(\"Matthew\", names)' /><input type='radio' name='name' value='Wilbur' checked:bind='boolean-to-inList(\"Wilbur\", names)' /></form>");
	var map = new DefineMap({
		names: ['Wilbur']
	});

	var frag = template(map);
	var radioOne = frag.firstChild.firstChild;
	var radioTwo = radioOne.nextSibling;

	this.fixture.appendChild(frag);

	// Initial state
	assert.equal(radioOne.checked, false, "Matthew not checked");
	assert.equal(radioTwo.checked, true, "Wilbur is checked");

	radioOne.checked = true;
	domEvents.dispatch(radioOne, "change");

	assert.equal(radioOne.checked, true, "Matthew is checked");
	assert.equal(radioTwo.checked, false, "Wilbur is not checked");
});
