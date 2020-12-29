
var Observation = require('can-observation');
var QUnit = require('steal-qunit');
var CID = require('can-cid');
var ObservationRecorder = require("can-observation-recorder");

var assign = require("can-util/js/assign/assign");
var canEvent = require('can-event');
var eventLifecycle = require("can-event/lifecycle/lifecycle");
require("can-event/batch/batch");
var eventAsync = require("can-event/async/async");

QUnit.module('can-observation async',{
	beforeEach: function(assert) {
		eventAsync.async();
	},
	afterEach: function(assert) {
		eventAsync.sync();
	}
});

// a simple observable and compute to test
// behaviors that require nesting of Observations
var simpleObservable = function(value){
	var obs = {
		get: function(){
			ObservationRecorder.add(this, "value");
			return this.value;
		},
		set: function(value){
			var old = this.value;
			this.value = value;
			canEvent.dispatch.call(this, "value",[value, old]);
		},
		value: value
	};
	assign(obs, canEvent);
	CID(obs);
	return obs;
};

var simpleCompute = function(getter, name, primaryDepth){
	var observation, fn;

	fn = function(){
		ObservationRecorder.add(fn,"change");
		return observation.get();
	};
	CID(fn, name);
	fn.updater = function(newVal, oldVal, batchNum){
		canEvent.dispatch.call(fn, {type: "change", batchNum: batchNum},[newVal, oldVal]);
	};
	fn._primaryDepth = primaryDepth || 0;

	observation = new Observation(getter, null, fn);

	fn.observation = observation;

	assign(fn, canEvent);
	fn.addEventListener = eventLifecycle.addAndSetup;
	fn.removeEventListener = eventLifecycle.removeAndTeardown;

	fn._eventSetup = function(){
		fn.bound = true;
		observation.start();
	};
	fn._eventTeardown = function(){
		fn.bound = false;
		observation.stop();
	};
	return fn;
};

QUnit.test('nested traps are reset onto parent traps', function(assert) {
    var obs1 = assign({}, canEvent);
    CID(obs1);
    var obs2 = assign({}, canEvent);
    CID(obs2);

	var oi = new Observation(function() {

		var getObserves1 = ObservationRecorder.trap();

		ObservationRecorder.add(obs1, "prop1");

		var getObserves2 = ObservationRecorder.trap();
		ObservationRecorder.add(obs2, "prop2");

		var observes2 = getObserves2();

		ObservationRecorder.addMany(observes2);

		var observes1 = getObserves1();

		assert.equal(observes1.length, 2, "two items");
		assert.equal(observes1[0].obj, obs1);
		assert.equal(observes1[1].obj, obs2);
	}, null, function() {

	});

	oi.start();
});


QUnit.test("Change propagation in a batch with late bindings (#2412)", function(assert) {
	var done = assert.async();

	var rootA = simpleObservable('a');
	var rootB = simpleObservable('b');

	var childA = simpleCompute(function() {
		return "childA"+rootA.get();
	},'childA');

	var grandChild = simpleCompute(function() {
		var b = rootB.get();
		if (b === "b") {
			return "grandChild->b";
		}

		var a = childA();
		return "grandChild->"+a;
	},'grandChild');

	childA.addEventListener('change', function(ev, newVal, oldVal) {});

	grandChild.addEventListener('change', function(ev, newVal, oldVal) {
		assert.equal(newVal, "grandChild->childAA", "got the right value");
		done();
	});

	rootA.set('A');
	rootB.set('B');

});

QUnit.test("deeply nested computes that are read that don't allow deeper primary depth computes to complete first", function(assert) {
    var ready1 = assert.async();
    var ready = assert.async();

    // This is to setup `grandChild` which will be forced
    // into reading `childA` which has a higher depth then itself, but isn't changing.
    // This makes sure that it will get a value for childA before
    // continuing on to deeper "primary depth" computes (things that are nested in stache).
    var rootA = simpleObservable('a');
    var rootB = simpleObservable('b');

    var childA = simpleCompute(function() {
		return "childA"+rootA.get();
	},'childA');

    var grandChild = simpleCompute(function() {
		if(rootB.get() === 'b') {
			return 'grandChild->b';
		}
		return childA();
	},'grandChild');

    // this should update last
    var deepThing = simpleCompute(function(){
		return rootB.get();
	},"deepThing", 4);

    var order = [];

    childA.addEventListener("change", function(){});

    deepThing.addEventListener("change", function(){
		order.push("deepThing");
		assert.deepEqual(order, ["grandChild childAa","deepThing"]);
		if(order.length === 2) {
			ready();
		}

	});

    grandChild.addEventListener("change", function(ev, newVal){
		order.push("grandChild "+newVal);
		if(order.length === 2) {
			assert.deepEqual(order, ["grandChild childAa","deepThing"]);
			ready1();
		}
	});

    rootB.set('B');
});

QUnit.test("can read values synchronously", function(assert) {
	var rootA = simpleObservable('a');
	var rootB = simpleObservable('b');

	var child = simpleCompute(function() {
		return rootA.get()+"-"+rootB.get();
	},'child');

	child.addEventListener("change", function(){});

	rootA.set("A");
	rootB.set('B');

	var val = child();

	assert.deepEqual(val, "A-B", "got the right value");

});
