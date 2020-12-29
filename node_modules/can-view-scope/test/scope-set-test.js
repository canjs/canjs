var Scope = require('can-view-scope');

var QUnit = require('steal-qunit');
var testHelpers = require('can-test-helpers');
var SimpleMap = require('can-simple-map');
var SimpleObservable = require('can-simple-observable');

QUnit.module('can-view-scope set');

QUnit.test("computes are set as this and . and  ../", function(assert) {
	var value = new SimpleObservable(1);
	var scope = new Scope(value);
	scope.set("this",2);
	assert.equal(scope.get("this"), 2, "this read value");
	scope.set(".",3);
	assert.equal(scope.get("this"), 3, ". read value");

	scope = scope.add({});
	scope.set("..",4);
	assert.equal(scope.get(".."), 4, ".. read value");
});

QUnit.test("can set scope attributes with ../ (#2132)", function(assert) {

	var map = new SimpleMap();
	var scope = new Scope(map);
	var top = scope.add(new SimpleMap());

	top.set("../foo", "bar");

	assert.equal(map.attr("foo"), "bar");

});

QUnit.test("Scope attributes can be set (#1297, #1304)", function(assert) {
	var comp = new SimpleObservable('Test');
	var map = new SimpleMap({
		other: new SimpleMap({
			name: "Justin"
		})
	});
	var scope = new Scope({
		name: "Matthew",
		other: {
			person: {
				name: "David"
			},
			comp: comp
		}
	});

	scope.set("name", "Wilbur");
	assert.equal(scope.get("name"), "Wilbur", "set(key) updated");

	scope.set("other.person.name", "Dave");
	assert.equal(scope.get("other.person.name"), "Dave", "set(key.key.key) updated");

	scope.set("other.comp", "Changed");
	assert.equal(comp.get(), "Changed", "set(key.compute) updated");

	scope = new Scope(map);
	scope.set("other.name", "Brian");

	assert.equal(scope.get("other.name"), "Brian", "Value updated");
	assert.equal(map.attr("other").attr("name"), "Brian", "Name update in map");
});

QUnit.test("setting a key on a non observable context", function(assert) {
	var context = {colors: new SimpleMap()};

	var scope = new Scope(context);

	scope.set("colors", {prop: "bar"});

	assert.deepEqual(context.colors.attr(), {prop: "bar"}, "can updateDeep");
});


QUnit.test("filename and lineNumber can be read from anywhere in scope chain", function(assert) {
	var parent = new Scope({});
	var scope = parent.add({});

	parent.set("scope.filename", "my-cool-file.txt");
	parent.set("scope.lineNumber", "5");

	assert.equal(scope.peek("scope.filename"), "my-cool-file.txt", 'scope.peek("scope.filename")');
	assert.equal(scope.peek("scope.lineNumber"), "5", 'scope.peek("scope.lineNumber")');
});


testHelpers.dev.devOnlyTest("Setting a value to an attribute with an undefined parent errors (canjs/can-stache-bindings#298)", function (assert){
	var teardown = testHelpers.dev.willError(/Attempting to set a value at (.+) where (.+) is undefined./);

	var scope = new Scope({});
	scope.set("../person.name", "Christopher");

	assert.equal(teardown(), 1, "saw errors");
});
