var steal = require('@steal');
var QUnit = require('steal-qunit');
var SettableObservable = require('./settable');
var SimpleObservable = require('../can-simple-observable');
var canReflect = require('can-reflect');
var Observation = require("can-observation");


var ObservationRecorder = require("can-observation-recorder");

QUnit.module('can-simple-observable/settable');

var onlyDevTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

QUnit.test('basics', function(assert) {

    var value = new SimpleObservable(2);


    var obs = new SettableObservable(function(lastSet){
        return lastSet * value.get();
    }, null, 1);

    // Unbound and unobserved behavior
    assert.equal(canReflect.getValue(obs), 2, 'getValue unbound');



    var changes = 0;
    var handler = function(newValue) {
        changes++;
        if(changes === 1) {
            assert.equal(newValue, 4, 'set observable');
            obs.set(3);
        } else if(changes === 2){
            assert.equal(newValue, 6, 'set observable in handler');
            value.set(3);
        } else {
            assert.equal(newValue, 9, 'set source');
        }
    };
    canReflect.onValue(obs, handler);
    canReflect.setValue(obs, 2);

    assert.equal( canReflect.getValue(obs), 9, "after bound");
    canReflect.offValue(obs, handler);
    canReflect.setValue(obs, 5);
    assert.equal( canReflect.getValue(obs), 15, "after unbound");

});

QUnit.test('basics with .value', function(assert) {

    var value = new SimpleObservable(2);


    var obs = new SettableObservable(function(lastSet){
        return lastSet * value.value;
    }, null, 1);

    // Unbound and unobserved behavior
    assert.equal(obs.value, 2, 'getValue unbound');



    var changes = 0;
    var handler = function(newValue) {
        changes++;
        if(changes === 1) {
            assert.equal(newValue, 4, 'set observable');
            obs.value = (3);
        } else if(changes === 2){
            assert.equal(newValue, 6, 'set observable in handler');
            value.value = (3);
        } else {
            assert.equal(newValue, 9, 'set source');
        }
    };
    canReflect.onValue(obs, handler);
    obs.value =  2;

    assert.equal( obs.value, 9, "after bound");
    canReflect.offValue(obs, handler);
    obs.value = 5;
    assert.equal( obs.value, 15, "after unbound");

});

QUnit.test("get and set Priority", function(assert) {
    var value = new SimpleObservable(2);


    var obs = new SettableObservable(function(lastSet){
        return lastSet * value.get();
    }, null, 1);

    canReflect.setPriority(obs, 5);


    assert.equal(canReflect.getPriority(obs), 5, "set priority");
});

onlyDevTest("log observable changes", function(assert) {
	var done = assert.async();

	var obs = new SettableObservable(function(lastSet) {
		return lastSet * 5;
	}, null, 1);

	// turn on logging
	obs.log();

	// override internal _log to spy on arguments
	var changes = [];
	obs._log = function(previous, current) {
		changes.push({ current: current,  previous: previous });
	};

	canReflect.onValue(obs, function() {}); // needs to be bound
	canReflect.setValue(obs, 2);
	canReflect.setValue(obs, 3);

	assert.expect(1);
	setTimeout(function() {
		assert.deepEqual(
			changes,
			[{current: 10, previous: 5}, {current: 15, previous: 10}],
			"should print out current/previous values"
		);
		done();
	});
});

QUnit.test("getValueDependencies", function(assert) {
	var value = new SimpleObservable(2);

	var obs = new SettableObservable(function(lastSet) {
		return lastSet * value.get();
	}, null, 1);

	// unbound
	assert.equal(
		typeof canReflect.getValueDependencies(obs),
		"undefined",
		"returns undefined when the observable is unbound"
	);

	// bound
	canReflect.onValue(obs, function() {});
	assert.deepEqual(
		canReflect.getValueDependencies(obs).valueDependencies,
		new Set([obs.lastSetValue, value]),
		"should return the internal observation dependencies"
	);
});

QUnit.test("setting an observable with an internal observable", function(assert) {
	var value = new SimpleObservable(2);

	var obs = new SettableObservable(function(lastSet) {
		return lastSet.get();
	}, null, value);

	canReflect.onValue(obs, function() {});

	canReflect.setValue(obs, 5);
	assert.equal(value.get(), 5, "should set the internal observable value");
	assert.equal(canReflect.getValue(obs), 5, "should derive value correctly");
});

QUnit.test("setting an observable to Settable observable works", function(assert) {
	var one = new SimpleObservable(1);
	var two = new SimpleObservable(2);

	var obs = new SettableObservable(
		function fn(lastSet) {
			return lastSet instanceof SimpleObservable ? lastSet.get() : lastSet;
		},
		null, // context
		one   // initial value
	);

	canReflect.onValue(obs, function() {});
	canReflect.setValue(obs, "one");
	assert.equal(one.get(), "one", "should set the internal observable value");

	// set an observable to the SettableObservable
	// instance that is holding an observable already
	canReflect.setValue(obs, two);
	assert.equal(
		canReflect.getValue(obs),
		2,
		"should replace the internal observable with 'two'"
	);
});

QUnit.test("proactive binding doesn't last past binding (can-stache#486)", function(assert) {
    var value = new SimpleObservable(2);

    var readCount = 0;
    var obs = new SettableObservable(function(lastSet){
        readCount++;
        return lastSet * value.get();
    }, null, 1);

    var outer = new Observation(function(){
        return obs.get();
    });

    function handler(){}

    outer.on(handler);

    outer.off(handler);

    value.set(3);

    assert.equal(readCount, 1, "internal observation only updated once");

});
