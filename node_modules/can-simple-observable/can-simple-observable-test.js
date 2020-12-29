var steal = require("@steal");
var QUnit = require('steal-qunit');
var canSymbol = require("can-symbol");
var SimpleObservable = require('can-simple-observable');
var canReflect = require('can-reflect');
var ObservationRecorder = require("can-observation-recorder");

var getChangesSymbol = canSymbol.for("can.getChangesDependencyRecord");
var skipProduction = steal.isEnv("production") ? QUnit.skip : QUnit.test;

QUnit.module('can-simple-observable');

QUnit.test('basics', function(assert) {
    assert.expect(5);
    var obs = new SimpleObservable('one');

    assert.equal(canReflect.getValue(obs), 'one', 'getValue');

    canReflect.setValue(obs, 'two');
    ObservationRecorder.start();
    assert.equal(canReflect.getValue(obs), 'two', 'setValue');
    var dependencies = ObservationRecorder.stop();
    assert.ok(dependencies.valueDependencies.has(obs), "was recorded");

    var handler = function(newValue) {
        assert.equal(newValue, 'three', 'onValue');
    };
    canReflect.onValue(obs, handler);
    canReflect.setValue(obs, 'three');

    canReflect.offValue(obs, handler);
    canReflect.setValue(obs, 'four');

    assert.equal(canReflect.getValue(obs), 'four', 'getValue after offValue');
});

QUnit.test('basics with .value', function(assert) {
    assert.expect(5);
    var obs = new SimpleObservable('one');
	
    assert.equal(obs.value, 'one', 'getValue');

    obs.value = 'two';
    ObservationRecorder.start();
    assert.equal(obs.value, 'two', 'setValue');
    var dependencies = ObservationRecorder.stop();
    assert.ok(dependencies.valueDependencies.has(obs), "was recorded");

    var handler = function(newValue) {
        assert.equal(newValue, 'three', 'onValue');
    };
    canReflect.onValue(obs, handler);
    obs.value = 'three';

    canReflect.offValue(obs, handler);
    obs.value = 'four';

    assert.equal(obs.value, 'four', 'getValue after offValue');
});

skipProduction("log observable changes", function(assert) {
	var done = assert.async();
	var obs = new SimpleObservable("one");

	// turn on debugging
	obs.log();

	assert.expect(2);
	obs._log = function(previous, current) {
		assert.equal(current, "two", "should get current value");
		assert.equal(previous, "one", "should get previous value");
		done();
	};

	canReflect.setValue(obs, "two");
});

skipProduction("getWhatIChange works", function(assert) {
	var one = new SimpleObservable("one");
	var two = new SimpleObservable("two");

	var handler = function handler() {
		two.set("three");
	};

	var dependencyRecord =  {
		valueDependencies: new Set([two])
	};

	// decorate the event handler so we know what it changes
	handler[getChangesSymbol] = function() {
		return dependencyRecord;
	};

	canReflect.onValue(one, handler);
	assert.deepEqual(
		canReflect.getWhatIChange(one).mutate,
		dependencyRecord
	);
});
