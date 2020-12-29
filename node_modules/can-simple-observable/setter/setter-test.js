var QUnit = require('steal-qunit');
var SetterObservable = require('./setter');
var SimpleObservable = require('../can-simple-observable');
var canReflect = require('can-reflect');
var Observation = require("can-observation");
var canSymbol = require("can-symbol");

QUnit.module('can-simple-observable/setter');

QUnit.test('basics', function(assert){
    var value = new SimpleObservable(2);

    var obs = new SetterObservable(function(){
        return value.get();
    }, function(newVal){
        value.set(newVal);
    });

    // Unbound and unobserved behavior
    assert.equal(canReflect.getValue(obs), 2, 'getValue unbound');

    canReflect.setValue(obs,3);
    assert.equal(canReflect.getValue(value), 3, 'value set');
    assert.equal(canReflect.getValue(obs), 3, 'getValue unbound');
});

QUnit.test('basics with .value', function(assert){
    var value = new SimpleObservable(2);

    var obs = new SetterObservable(function(){
        return value.value;
    }, function(newVal){
        value.value = (newVal);
    });

    // Unbound and unobserved behavior
    assert.equal(obs.value, 2, 'getValue unbound');

    obs.value = 3;
    assert.equal(value.value, 3, 'value set');
    assert.equal(obs.value, 3, 'getValue unbound');
});

QUnit.test("get and set Priority", function(assert){
    var value = new SimpleObservable(2);

    var obs = new SetterObservable(function(){
        return value.get();
    }, function(newVal){
        value.set(newVal);
    });

    canReflect.setPriority(obs, 5);
    assert.equal(canReflect.getPriority(obs), 5, "set priority");
});

if(System.env.indexOf("production") < 0) {
    QUnit.test("log observable changes", function(assert) {
    	var done = assert.async();
    	var value = new SimpleObservable(2);

    	var obs = new SetterObservable(function() {
    		return value.get();
    	}, function(newVal){
    		value.set(newVal);
    	});

    	// turn on logging
    	obs.log();

    	// override _log to spy on arguments
    	var changes = [];
    	obs._log = function(previous, current) {
    		changes.push({ current: current, previous: previous });
    	};

    	canReflect.onValue(obs, function() {}); // needs to be bound
    	canReflect.setValue(obs, 3);
    	canReflect.setValue(obs, 4);

    	assert.expect(1);
    	setTimeout(function() {
    		assert.deepEqual(
    			changes,
    			[{current: 3, previous: 2}, {current: 4, previous: 3}],
    			"should print out current/previous values"
    		);
    		done();
    	});
    });
}

QUnit.test("getValueDependencies", function(assert) {
	var value = new SimpleObservable(2);

	var obs = new SetterObservable(function() {
		return value.get();
	}, function(newVal) {
		value.set(newVal);
	});

	// unbound
	assert.equal(
		typeof canReflect.getValueDependencies(obs),
		"undefined",
		"should be undefined when observable is unbound"
	);

	// bound
	canReflect.onValue(obs, function() {});
	assert.deepEqual(
		canReflect.getValueDependencies(obs).valueDependencies,
		new Set([value])
	);
});

QUnit.test("has setElement Symbol", function(assert) {
	var setElementSymbol = canSymbol.for("can.setElement");
	var setterObservable = new SetterObservable();
	var obs = new Observation();
	var el = {};
	obs[setElementSymbol] = function(passedEl) {
		assert.ok(true, "underlying observation's setElement Symbol is called");
		assert.equal(passedEl, el, "observation's setElement is passed element");
	};

	setterObservable.observation = obs;

	setterObservable[setElementSymbol](el);
});
