require("can-stache-converters");
var compute = require("can-compute");
var domEvents = require("can-dom-events");
var stache = require("can-stache");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");

var QUnit = require("steal-qunit");

QUnit.module("can-stache-converters: equal");

QUnit.test("Basics works", function(assert) {
	var template = stache('<input type="radio" checked:bind="equal(~attending, \'yes\'" /><input type="radio" checked:bind="equal(~attending, \'no\'" />');
	var attending = compute("yes");

	var yes = template({ attending: attending }).firstChild,
		no = yes.nextSibling;

	assert.equal(yes.checked, true, "initially a yes");
	assert.equal(no.checked, false, "initially unchecked");

	attending("no");

	assert.equal(yes.checked, false, "now not checked");
	assert.equal(no.checked, true, "now checked");

	// User changing stuff
	yes.checked = true;
	domEvents.dispatch(yes, "change");

	assert.equal(attending(), "yes", "now it is yes");
	assert.equal(yes.checked, true, "yes is checked");
	assert.equal(no.checked, false, "no is unchecked");
});

QUnit.test("works without ~", function(assert) {
	var template = stache('<input type="radio" checked:bind="equal(attending, \'yes\'" /><input type="radio" checked:bind="equal(~attending, \'no\'" />');
	var attending = compute("yes");

	var yes = template({ attending: attending }).firstChild,
		no = yes.nextSibling;

	assert.equal(yes.checked, true, "initially a yes");
	assert.equal(no.checked, false, "initially unchecked");

	attending("no");

	assert.equal(yes.checked, false, "now not checked");
	assert.equal(no.checked, true, "now checked");

	// User changing stuff
	yes.checked = true;
	domEvents.dispatch(yes, "change");

	assert.equal(attending(), "yes", "now it is yes");
	assert.equal(yes.checked, true, "yes is checked");
	assert.equal(no.checked, false, "no is unchecked");
});

QUnit.test("Allows one-way binding when passed a non-compute as the first argument", function(assert) {
	var template = stache('<input type="radio" checked:bind="equal(attending, true)" />');
	var attending = compute(false);

	var input = template({ attending: attending }).firstChild;

	assert.equal(input.checked, false, 'initially false');

	attending(true);

	assert.equal(input.checked, true, 'can be changed to true');

	input.checked = false;

	assert.equal(attending(), true, 'does not change compute');
});

QUnit.test("Allow multiple expressions to be passed in", function(assert) {
	var template = stache('<input type="radio" checked:bind="equal(~foo, ~bar, true)" />');
	var foo = compute(true);
	var bar = compute(false);

	var input = template({
		foo: foo,
		bar: bar
	}).firstChild;

	assert.equal(input.checked, false, 'initially unchecked');

	bar(true);

	assert.equal(input.checked, true, 'now checked');

	foo(false);
	bar(false);

	assert.equal(input.checked, false, 'now unchecked');

	input.checked = true;
	domEvents.dispatch(input, "change");

	assert.equal(foo(), true, 'computed foo value is true');
	assert.equal(bar(), true, 'computed bar value is true');
});

QUnit.test("Allow multiple expressions to be passed in without ~", function(assert) {
	var template = stache('<input type="radio" checked:bind="equal(foo, bar, true)" />');
	var foo = compute(true);
	var bar = compute(false);

	var input = template({
		foo: foo,
		bar: bar
	}).firstChild;

	assert.equal(input.checked, false, 'initially unchecked');

	bar(true);

	assert.equal(input.checked, true, 'now checked');

	foo(false);
	bar(false);

	assert.equal(input.checked, false, 'now unchecked');

	input.checked = true;
	domEvents.dispatch(input, "change");

	assert.equal(foo(), true, 'computed foo value is true');
	assert.equal(bar(), true, 'computed bar value is true');
});

QUnit.test("Allow non static values", function(assert) {
	var template = stache('{{# each(foo) }}<input type="radio" checked:bind="equal(., ../bar.value)" />{{/ each}}');
	var foo = new DefineList([ 'foobar' ]);
	var bar = new DefineMap({value: 'zed'});

	var input = template({
		foo: foo,
		bar: bar
	}).querySelector('input');

	assert.equal(input.checked, false, 'initially unchecked');

	bar.value = 'foobar';

	assert.equal(input.checked, true, 'now checked');
});
