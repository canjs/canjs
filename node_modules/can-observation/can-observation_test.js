// require("./can-observation-async-test");
var simple = require("./test/simple");
var simpleObservable = simple.observable;
var simpleCompute = simple.compute;
var reflectiveValue = simple.reflectiveValue;
var reflectiveObservable = simple.reflectiveObservable;

var ObservationRecorder = require("can-observation-recorder");
var Observation = require('can-observation');
var QUnit = require('steal-qunit');
var CID = require('can-cid');

var queues = require("can-queues");
var eventQueue = require("can-event-queue/map/map");

var steal = require("@steal");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var skipProductionTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

QUnit.module('can-observation',{
	beforeEach: function(assert) {}
});

QUnit.test("basics", function(assert) {
	var rootA = simpleObservable('a');
	var rootB = simpleObservable('b');

	var observation = new Observation(function(){
		return rootA.get() + rootB.get();
	});

	canReflect.onValue(observation, function(newVal){
		assert.equal(newVal, "Ab");
	});

	rootA.set("A");
});

QUnit.test('nested traps are reset onto parent traps', function(assert) {
	var obs1 = simpleObservable('a');
	var obs2 = simpleObservable('b');

	var oi = new Observation(function() {

		var getObserves1 = ObservationRecorder.trap();

		ObservationRecorder.add(obs1, "value");

		var getObserves2 = ObservationRecorder.trap();
		ObservationRecorder.add(obs2, "value");

		var observes2 = getObserves2();

		ObservationRecorder.addMany(observes2);

		var observes1 = getObserves1();

		assert.equal(observes1.length, 2, "two items");
		assert.equal(observes1[0][0], obs1);
		assert.equal(observes1[1][0], obs2);
	});
	//canReflect.onValue(oi, function(){})

	oi.onBound();
});


QUnit.test("Change propagation in a batch with late bindings (#2412)", function(assert) {

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
	});

	queues.batch.start();
	rootA.set('A');
	rootB.set('B');
	queues.batch.stop();

});

QUnit.test("deeply nested computes that are read that don't allow deeper primary depth computes to complete first", function(assert) {

	// This is to setup `grandChild` which will be forced
	// into reading `childA` which has a higher depth then itself, but isn't changing.
	// This makes sure that it will get a value for childA before
	// continuing on to deeper "primary depth" computes (things that are nested in stache).
	var rootA = simpleObservable('a');
	var rootB = simpleObservable('b');

	var childA = simpleCompute(function updateChildA() {
		return "childA"+rootA.get();
	},'childA');

	var grandChild = simpleCompute(function updateGrandChild() {
		if(rootB.get() === 'b') {
			return 'grandChild->b';
		}
		return childA();
	},'grandChild');

	// this should update last
	var deepThing = simpleCompute(function updateDeepThing(){
		return rootB.get();
	},"deepThing", 4);

	var order = [];

	childA.addEventListener("change", function childAChangeHandler(){});

	deepThing.addEventListener("change", function deepThingChangeHandler(ev){
		order.push("deepThing");
	});

	grandChild.addEventListener("change", function grandChildChangeHandler(ev, newVal){
		order.push("grandChild "+newVal);
	});


	queues.batch.start();
	rootB.set('B');
	queues.batch.stop();


	assert.deepEqual(order, ["grandChild childAa","deepThing"]);

});

QUnit.test("Reading a compute before the batch has completed", function(assert) {
	var c1 = simpleObservable(1),
		c2;
	c1.on("value", function(){
		assert.equal(c2(),4, "updated");
	});

	c2 = simpleCompute(function(){
		return c1.get() * c1.get();
	});

	c2.on("change", function(){});
	c1.set(2);
});

/*
test("a low primary depth reading a high primary depth compute", function(){
	var order = [];

	var rootB = simpleObservable('b');

	// this should update last
	var deepThing = simpleCompute(function(){
		return rootB.get();
	},"deepThing", 4);

	var grandChild = simpleCompute(function() {
		if(rootB.get() === 'b') {
			return 'grandChild->b';
		}
		return Observation.ignore(function(){
			return deepThing();
		})();

	},'grandChild');

	deepThing.addEventListener("change", function(ev){
		order.push("deepThing");
	});

	grandChild.addEventListener("change", function(ev, newVal){
		assert.equal(newVal, "B", "val is updated");
		order.push("grandChild");
	});



	canBatch.start();
	rootB.set('B');
	canBatch.stop();

	assert.deepEqual(order, ["grandChild","deepThing"]);
});*/


QUnit.test("canBatch.afterPreviousEvents in a compute", function(assert) {
	var root = simpleObservable('a');

	var baseCompute = simpleCompute(function(){
		return root.get();
	},'baseCompute');

	var compute = simpleCompute(function(){
		// this base compute read is here just to flush the event queue.
		// and create no place for `afterPreviousEvents` to do anything.
		baseCompute();

		// now when this gets added ... it's going to create its own
		// batch which will call `Observation.updateAndNotify`

		return root.get();
	},"afterPreviousCompute");

	compute.addEventListener("change", function(ev, newVal){
		assert.equal(newVal, "b");
	});

	root.set("b");
});

QUnit.test("prevent side compute reads (canjs/canjs#2151)", function(assert) {
	/*
	 computeThatGoesSideways
     - pushSidewaysCompute
	 - root

	 sideCompute
	 - root
	 - pushSidewaysCompute
	   - unchangingRoot
	 */
	var root = simpleObservable('a');
	var unchangingRoot = simpleObservable('X');
	// this gets emptied out again
	var order = [];

	// A compute that will flush the event queue.
	var pushSidewaysCompute = simpleCompute(function pushSidewaysComputeEval(){
		return unchangingRoot.get();
	},'baseCompute');

	// A compute that should evaluate after computeThatGoesSideways
	var sideCompute = simpleCompute(function sideComputeEval(){
		order.push('side compute');
		pushSidewaysCompute();
		return root.get();
	},'sideCompute');

	var dummyObject = canReflect.assign({}, eventQueue);
	dummyObject.on("dummyEvent", function dummyEvenHandler(){});

	var computeThatGoesSideways = simpleCompute(function computeThatGoesSidewaysHandler(){
		order.push('computeThatGoesSideways start');

		// Flush the event queue
		pushSidewaysCompute();

		// Dispatch a new event, which creates a new queue.
		// This should not cause `sideCompute` to re-run.
		dummyObject.dispatch("dummyEvent");

		order.push('computeThatGoesSideways finish');
		return root.get();
	},"computeThatGoesSideways");

	sideCompute.addEventListener("change", function sideComputeHandler(ev, newVal){});

	computeThatGoesSideways.addEventListener("change", function computeThatGoesSidewaysHandler(ev, newVal){});


	order = [];
	root.set("b");

	assert.deepEqual(order, ['side compute','computeThatGoesSideways start', 'computeThatGoesSideways finish']);
});


QUnit.test("calling a deep compute when only its child should have been updated (#19)", function(assert) {
	assert.expect(2);

	// the problem is that childCompute knows it needs to change
	// but we are reading grandChildCompute.
	var rootA = simpleObservable('a');
	var sideObservable = simpleObservable('x');

	var sideCompute = simpleCompute(function(){
		return sideObservable.get();
	});

	var childCompute = simpleCompute(function(){
		return "c-"+rootA.get();
	},'childCompute');
	childCompute.addEventListener("change", function(){});

	var grandChildCompute = simpleCompute(function(){
		return "gc-"+childCompute();
	});
	grandChildCompute.addEventListener("change", function(ev, newValue){
		assert.equal(newValue, "gc-c-B", "one change event");
	});

	sideCompute.addEventListener("change", function(){
		rootA.set("B");
		assert.equal( grandChildCompute(), "gc-c-B", "read new value");
	});

	sideObservable.set("X");


});



QUnit.test("onValue/offValue/getValue/isValueLike/hasValueDependencies work with can-reflect", function(assert) {
	assert.expect(8);
	var obs1 = canReflect.assign({prop1: 1}, eventQueue);
    CID(obs1);
    var obs2 = canReflect.assign({prop2: 2}, eventQueue);
    CID(obs2);

	var observation = new Observation(function observationEval() {
		ObservationRecorder.add(obs1, "prop1");
		ObservationRecorder.add(obs2, "prop2");
		return obs1.prop1 + obs2.prop2;
	});

	assert.ok(canReflect.isValueLike(observation), "it is value like!");

	assert.equal(canReflect.getValue(observation), 3, "get unbound");
	assert.equal(canReflect.valueHasDependencies(observation), undefined, "valueHasDependencies undef'd before start");

	// we shouldn't have to call start
	//observation.start();

	function handler(newValue){
		assert.equal(newValue, 30, "observed new value");
		canReflect.offValue(observation, handler);
	}

	canReflect.onValue(observation, handler);
	assert.equal(canReflect.getValue(observation), 3, "get bound first");
	assert.ok(canReflect.valueHasDependencies(observation),"valueHasDependencies true after start");
	queues.batch.start();
	obs1.prop1 = 10;
	obs2.prop2 = 20;
	obs1.dispatch("prop1");
	obs2.dispatch("prop2");
	queues.batch.stop();

	assert.equal(canReflect.getValue(observation), 30, "get bound second");
	assert.ok(!observation.bound, "observation stopped");
});

QUnit.test("should not throw if offValue is called without calling onValue" , function(assert) {
	var noop = function() {};
	var observation = new Observation(function() {
		return "Hello";
	});

	try {
		canReflect.offValue(observation, noop);
		assert.ok(true, "should not throw");
	} catch(e) {
		assert.ok(false, e);
	}
});

QUnit.test("getValueDependencies work with can-reflect", function(assert) {

	var obs1 = canReflect.assign({prop1: 1}, eventQueue);
    CID(obs1);
    var obs2 = function() {
			return 2;
    };
    obs2[canSymbol.for("can.onValue")] = function() {};
    obs2[canSymbol.for("can.offValue")] = function() {};
    // Ensure that obs2 is value-like
    obs2[canSymbol.for("can.getValue")] = function() {
			return this();
    };

	var observation = new Observation(function() {

		ObservationRecorder.add(obs1, "prop1");
		ObservationRecorder.add(obs2);
		return obs1.prop1 + obs2();
	});

	var deps = canReflect.getValueDependencies(observation);
	assert.equal(deps, undefined, "getValueDependencies undefined for unstarted observation");

	observation.onBound();
	deps = canReflect.getValueDependencies(observation);
	assert.ok(
		deps.keyDependencies.has(obs1),
		"getValueDependencies -- key deps"
	);
	assert.ok(
		deps.valueDependencies.has(obs2),
		"getValueDependencies -- value deps"
	);

});

QUnit.test("Observation can listen to value decorated with onValue and offValue", function(assert) {
	var v1 = reflectiveValue(1);
	var v2 = reflectiveValue(2);

	var o = new Observation(function(){
		return v1() + v2();
	});

	canReflect.onValue(o, function(){});

	assert.equal( canReflect.getValue(o), 3);

	queues.batch.start();
	v1(10);
	v2(20);
	queues.batch.stop();

	assert.equal( canReflect.getValue(o), 30);
});


QUnit.test("Observation can listen to observable decorated with onValue and offValue", function(assert) {
	var v1 = reflectiveObservable(1);
	var v2 = reflectiveObservable(2);

	var o = new Observation(function(){
		return v1.get() + v2.get();
	});

	canReflect.onValue(o, function(){});

	assert.equal( canReflect.getValue(o), 3);

	queues.batch.start();
	v1.set(10);
	v2.set(20);
	queues.batch.stop();

	assert.equal( canReflect.getValue(o), 30);
});

QUnit.test("Observation can itself be observable", function(assert) {
	var v1 = reflectiveObservable(1);
	var v2 = reflectiveObservable(2);

	var oA = new Observation(function(){
		return v1.get() + v2.get();
	});
	var oB = new Observation(function(){
		return oA.get() * 3;
	});

	canReflect.onValue(oB, function(){
		assert.ok(true, "this was fired in a batch");
	});


	assert.equal( canReflect.getValue(oB), 9);

	queues.batch.start();
	v1.set(10);
	v2.set(20);
	queues.batch.stop();

	assert.equal( canReflect.getValue(oB), 90);
	assert.ok(oA.bound, "bound on oA");
});

QUnit.test("should be able to bind, unbind, and re-bind to an observation", function(assert) {
	var observation = new Observation(function() {
		return "Hello";
	});

	var handler = function() {};

	canReflect.onValue(observation, handler);
	canReflect.offValue(observation, handler);
	canReflect.onValue(observation, handler);

	assert.ok(observation.bound, "observation is bound");
});

QUnit.test("no dependencies", function(assert) {
	var observation = new Observation(function() {
		return "Hello";
	});
	var handler = function() {};
	canReflect.onValue(observation, handler);

	assert.ok(canReflect.valueHasDependencies(observation) === false, "no dependencies");
});

QUnit.test("get and set priority", function(assert) {
	var observation = new Observation(function() {
		return "Hello";
	});
	canReflect.setPriority(observation, 3);


	assert.equal(canReflect.getPriority(observation), 3);
});

/*
QUnit.test("a bound observation with no dependencies will keep calling its function", function(){
	var val = "Hello";
	var observation = new Observation(function() {
		return val;
	});
	canReflect.onValue(observation,function(){});
	assert.equal(canReflect.getValue(observation), val);
	val = "HELLO";
	assert.equal(canReflect.getValue(observation), val);
});
*/

QUnit.test("log observable changes", function(assert) {
	var dev = require("can-log/dev/dev");
	var name = simpleObservable("John Doe");
	var fn = function() {};

	assert.expect(3);

	var log = dev.log;
	dev.log = function() {
		dev.log = log;
		// Functions in IE11 dont have name property
		// this test is ignored under IE11
		if (fn.name) {
			assert.equal(arguments[0], "Observation<>", "should use can.getName");
		} else {
			assert.expect(2);
		}
		assert.equal(arguments[2], '"Charles Babbage"', "should use current value");
		assert.equal(arguments[4], '"John Doe"', "should use previous value");
	};

	var observation = new Observation(function() {
		ObservationRecorder.add(name, "value");
		return name.get();
	});

	observation.log();
	observation.onBound();
	name.set("Charles Babbage");
});

QUnit.test("no handler and queue removes all dependencies", function(assert) {
	var name = simpleObservable("John Doe");
	var observation = new Observation(function() {
		ObservationRecorder.add(name, "value");
		return name.get();
	});

	canReflect.onValue(observation, function(){});
	canReflect.onValue(observation, function(){},"notify");

	assert.equal(observation.handlers.get([]).length, 2);

	canReflect.offValue(observation);

	assert.equal(observation.handlers.get([]).length, 0);
});

skipProductionTest("Observation decorates onDependencyChange handler", function(assert) {
	var rootA = simpleObservable("a");
	var rootB = simpleObservable("b");

	var observation = new Observation(function() {
		return rootA.get() + rootB.get();
	});

	var getChangesSymbol = canSymbol.for("can.getChangesDependencyRecord");
	var getChanges = observation.onDependencyChange[getChangesSymbol].bind(
		observation
	);

	assert.equal(typeof getChanges, "function", "symbol should be implemented");
	assert.deepEqual(
		getChanges(),
		{ valueDependencies: new Set([observation]) },
		"onDependencyChange changes the observation"
	);
});

QUnit.test("value property getter", function(assert) {
	var observation = new Observation(function() {
		return "Hello";
	});

	// Check getting the value
	assert.equal(observation.value, "Hello", "value returns");

});
