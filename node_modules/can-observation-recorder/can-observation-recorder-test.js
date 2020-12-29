var QUnit = require('steal-qunit');
var observationRecorder = require('./can-observation-recorder');
var canSymbol = require("can-symbol");

QUnit.module('can-observation-recorder');

QUnit.test('basics', function(assert) {
	var foo = {};
	var bar = {};
	observationRecorder.start();

	observationRecorder.add(foo, "event1");
	observationRecorder.add(bar);

	var dependencies = observationRecorder.stop();
	assert.ok(dependencies.keyDependencies.get(foo), "has foo in key deps");
	assert.ok(dependencies.keyDependencies.get(foo).has("event1"), "has foo event1 ");
	assert.ok(dependencies.valueDependencies.has(bar), "has foo in key deps");
});



QUnit.test('start returns the same deps as stop', function(assert) {
	var foo0 = {};

	var dependencies0Start, dependencies0Stop;

	dependencies0Start = observationRecorder.start();
	observationRecorder.add(foo0, "event0");
	dependencies0Stop = observationRecorder.stop();

	assert.ok(dependencies0Start.keyDependencies.get(foo0), "dependencies0 has foo0 in key deps");
	assert.equal(dependencies0Start, dependencies0Stop, "dependencies0Start is the same as dependencies0Stop");

});

QUnit.test("created adds a dependency to the childDependencies of the parent", function(assert) {
	var foo = function() {};

	observationRecorder.start();
	observationRecorder.created(foo);
	var dependencies = observationRecorder.stop();

	assert.ok(dependencies.childDependencies.has(foo), "dependencies has foo in the child deps");
});

QUnit.test("add peekValue", function(assert) {

	var obs = {};
	obs[canSymbol.for("can.getValue")] = function(){
		observationRecorder.add(this);
		return 3;
	};

	observationRecorder.start();
	assert.equal( observationRecorder.peekValue(obs), 3);
	var dependencies0Stop = observationRecorder.stop();
	assert.equal(dependencies0Stop.valueDependencies.size, 0);

	assert.equal( observationRecorder.peekValue(obs), 3, "read outside observable");
	assert.equal( observationRecorder.peekValue(0), 0, "read primitive");
	assert.equal( observationRecorder.peekValue(true), true, "read primitive");
});
