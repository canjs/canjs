require("./proto-compute_test");
var compute = require('can-compute');
var QUnit = require('steal-qunit');
var ObservationRecorder = require("can-observation-recorder");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var eventQueue = require("can-event-queue/map/map");
var queues = require("can-queues");
var domEvents = require("can-dom-events");

var metaSymbol = canSymbol.for("can.meta");
var domDispatch = domEvents.dispatch;

QUnit.module('can/compute');
QUnit.test('single value compute', function(assert) {
	var num = compute(1);
	num.on('change', function (ev, newVal, oldVal) {
		assert.equal(newVal, 2, 'newVal');
		assert.equal(oldVal, 1, 'oldVal');
	});
	num(2);
});
QUnit.test('inner computes values are not bound to', function(assert) {
	var num = compute(1);
	var outer = compute(function() {
		var inner = compute(function() {
			return num() + 1;
		});
		return 2 * inner();
	});

	var handler = function () {};
	outer.on('change', handler);
	// We do a timeout because we temporarily bind on num so that we can use its cached value.
	var done = assert.async();
	setTimeout(function () {

		assert.equal(num.computeInstance[metaSymbol].handlers.get([]).length, 1, 'inner compute only bound once');
		assert.equal(outer.computeInstance[metaSymbol].handlers.get([]).length, 1, 'outer compute only bound once');
		done();
	}, 50);
});

QUnit.test('compute.truthy', function(assert) {
	var result = 0;
	var numValue;
	var num = compute(numValue = 3);
	var truthy = compute.truthy(num);
	var tester = compute(function () {
		if (truthy()) {
			return ++result;
		} else {
			return ++result;
		}
	});
	tester.addEventListener('change', function (ev, newVal, oldVal) {
		if (num() === 0) {
			assert.equal(newVal, 2, '2 is the new val');
		} else if (num() === -1) {
			assert.equal(newVal, 3, '3 is the new val');
		} else {
			assert.ok(false, 'change should not be called');
		}
	});
	assert.equal(tester(), 1, 'on bind, we call tester once');
	num(numValue = 2);
	num(numValue = 1);
	num(numValue = 0);
	num(numValue = -1);
});
QUnit.test('a binding compute does not double read', function(assert) {
	var sourceAge = 30,
		timesComputeIsCalled = 0;
	var age = compute(function (newVal) {
		timesComputeIsCalled++;
		if (timesComputeIsCalled === 1) {
			assert.ok(true, 'reading age to get value');
		} else if (timesComputeIsCalled === 2) {
			assert.equal(newVal, 31, 'the second time should be an update');
		} else if (timesComputeIsCalled === 3) {
			assert.ok(true, 'called after set to get the value');
		} else {
			assert.ok(false, 'You\'ve called the callback ' + timesComputeIsCalled + ' times');
		}
		if (arguments.length) {
			sourceAge = newVal;
		} else {
			return sourceAge;
		}
	});
	var info = compute(function () {
		return 'I am ' + age();
	});
	var k = function () {};
	info.bind('change', k);
	assert.equal(info(), 'I am 30');
	age(31);
	assert.equal(info(), 'I am 31');
});
QUnit.test('cloning a setter compute (#547)', function(assert) {
	var name = compute('', function (newVal) {
		return this.txt + newVal;
	});
	var cloned = name.clone({
		txt: '.'
	});
	cloned('-');
	assert.equal(cloned(), '.-');
});

QUnit.test('compute updated method uses get and old value (#732)', function(assert) {
	assert.expect(9);
	var input = {
		value: 1
	};
	var value = compute('', {
		get: function () {
			return input.value;
		},
		set: function (newVal) {
			input.value = newVal;
		},
		on: function (update) {
			input.onchange = update;
		},
		off: function () {
			delete input.onchange;
		}
	});
	assert.equal(value(), 1, 'original value');
	assert.ok(!input.onchange, 'nothing bound');
	value(2);
	assert.equal(value(), 2, 'updated value');
	assert.equal(input.value, 2, 'updated input.value');


	function handler(ev, newVal, oldVal) {
		assert.equal(newVal, 3, 'newVal');
		assert.equal(oldVal, 2, 'oldVal');
		value.unbind('change',handler);
	}
	value.bind('change', handler);
	assert.ok(input.onchange, 'binding to onchange');


	input.value = 3;
	input.onchange({});

	assert.ok(!input.onchange, 'removed binding');
	assert.equal(value(), 3);
});

QUnit.test("a compute updated by source changes within a batch is part of that batch", function(assert) {

	var computeA = compute("a");
	var computeB = compute("b");

	var combined1 = compute(function combined1(){

		return computeA()+" "+computeB();

	});

	var combined2 = compute(function combined2(){

		return computeA()+" "+computeB();

	});

	var combo = compute(function combo(){
		return combined1()+" "+combined2();
	});

	var callbacks = 0;
	combo.bind("change", function(){
		if(callbacks === 0){
			assert.ok(true, "called change once");
		} else {
			assert.ok(false, "called change multiple times");
		}
		callbacks++;
	});

	queues.batch.start();
	computeA("A");
	computeB("B");
	queues.batch.stop();
});

QUnit.test("compute.async can be like a normal getter", function(assert) {
	var first = compute("Justin"),
		last = compute("Meyer"),
		fullName = compute.async("", function(){
			return first()+" "+last();
		});

	assert.equal(fullName(), "Justin Meyer");
});

QUnit.test("compute.async operate on single value", function(assert) {

	var a = compute(1);
	var b = compute(2);

	var obj = compute.async({}, function( curVal ){
		if(a()) {
			curVal.a = a();
		} else {
			delete curVal.a;
		}
		if(b()) {
			curVal.b = b();
		} else {
			delete curVal.b;
		}
		return curVal;
	});

	obj.bind("change", function(){});

	assert.deepEqual( obj(), {a: 1, b: 2}, "object has all properties" );

	a(0);

	assert.deepEqual( obj(), {b: 2}, "removed a" );

	b(0);

	assert.deepEqual( obj(), {}, "removed b" );

});

QUnit.test("compute.async async changing value", function(assert) {
	
	var a = compute(1);
	var b = compute(2);
	var done;
	
	var async = compute.async(undefined,function( curVal, setVal ){
		
		if(a()) {
			setTimeout(function(){
				setVal("a");
			},10);
		} else if(b()) {
			setTimeout(function(){
				setVal("b");
			},10);
		} else {
			return null;
		}
	});
	
	var changeArgs = [
		{newVal: "a", oldVal: undefined, run: function(){ a(0); } },
		{newVal: "b", oldVal: "a", run: function(){ b(0); }},
		{newVal: null, oldVal: "b", run: function(){ done(); }}
	],
	changeNum = 0;
	
	done = assert.async();


	async.bind("change", function(ev, newVal, oldVal){
		var data = changeArgs[changeNum++];
		assert.equal( newVal, data.newVal, "newVal is correct" );
		assert.equal( oldVal, data.oldVal, "oldVal is correct" );

		setTimeout(data.run, 10);
	});



});

QUnit.test("compute.async read without binding", function(assert) {

	var source = compute(1);

	var async = compute.async([],function( curVal, setVal ){
		curVal.push(source());
		return curVal;
	});

	assert.ok(async(), "calling async worked");



});

QUnit.test("bug with nested computes and batch ordering (#1519)", function(assert) {

	var root = compute('a');

	var isA = compute(function(){
		return root() ==='a';
	});

	var isB = compute(function(){
		return root() === 'b';
	});

	var combined = compute(function(){
		var valA = isA(),
			valB = isB();

		return valA || valB;
	});

	assert.equal(combined(), true);

	combined.bind('change', function(){ });



	queues.batch.start();
	root('b');
	queues.batch.stop();

	assert.equal(combined(), true);
	//equal(other(), 2);
});

QUnit.test('compute change handler context is set to the function not compute', function(assert) {
	var comp = compute(null);

	comp.bind('change', function() {
		assert.equal(typeof this, 'function');
	});

	comp('test');
});

QUnit.test('Calling .unbind() on un-bound compute does not throw an error', function(assert) {
	var count =  compute(0);
	count.unbind('change');
	assert.ok(true, 'No error was thrown');
});


QUnit.test("dependent computes update in the right order (2093)", function(assert) {

	var root = compute('a'),
		childB = compute(function() {
			return root();
		}),
		combine = compute(function() {
			return root() + childB();
		});

	combine.bind("change", function(ev, newVal) {
		assert.equal(newVal, "bb", "concat changed");
	});
	root('b');
});

QUnit.test("dependent computes update in the right order with a batch (#2093)", function(assert) {

	// so the problem is that `child` then `combine` happens.
	// without a batch, child change fires before `combine`, firing `grandChild`, which
	// then triggers `combine`.


	// the goal should be for
	var root = compute('a'),
		child = compute(function() {
			return root();
		}),
		child2 = compute(function(){
			return root();
		}),
		grandChild = compute(function(){
			return child();
		}),
		combine = compute(function() {
			return child2()+grandChild();
		});

	/*canLog.log("root", root.computeInstance._cid,
		"child", child.computeInstance._cid,
		"grandChild", grandChild.computeInstance._cid,
		"combine", combine.computeInstance._cid);*/

	combine.bind("change", function(ev, newVal) {
		assert.equal(newVal, "bb", "concat changed");
	});

	/*root.bind("change", function(ev, newVal){
		canLog.log("root change", ev.batchNum)
	});
	child.bind("change", function(ev, newVal){
		canLog.log("child change", ev.batchNum)
	});
	grandChild.bind("change", function(ev, newVal){
		canLog.log("grandChild change", ev.batchNum)
	});*/

	queues.batch.start();
	root('b');
	queues.batch.stop();
});

QUnit.test("bug with nested computes and batch ordering (#1519)", function(assert) {

	var root = compute('a');

	var isA = compute(function(){
		return root() ==='a';
	});

	var isB = compute(function(){
		return root() === 'b';
	});

	var combined = compute(function(){
		var valA = isA(),
			valB = isB();

		return valA || valB;
	});

	assert.equal(combined(), true);

	combined.bind('change', function(){ });



	queues.batch.start();
	root('b');
	queues.batch.stop();

	assert.equal(combined(), true);
	//equal(other(), 2);
});

QUnit.test("binding, unbinding, and rebinding works after a timeout (#2095)", function(assert) {
	var root = compute(1),
		derived = compute(function(){
			return root();
		});

	var change = function(){};
	derived.bind("change", change);
	derived.unbind("change", change);

	var done = assert.async();
	setTimeout(function(){
		derived.bind("change", function(ev, newVal, oldVal){
			assert.equal(newVal, 2, "updated");
			done();
		});
		root(2);
	},10);

});

QUnit.test("ObservationRecorder.isRecording observes doesn't understand ObservationRecorder.ignore (#2099)", function(assert) {
	assert.expect(0);
	var c = compute(1);
	c.computeInstance.bind = function() {
		assert.ok(false);
	};

	var outer = compute(function(){
		ObservationRecorder.ignore(function(){
			c();
		})();
	});

	outer.bind("change", function(){});
});

QUnit.test("handles missing update order items (#2121)",function(assert) {
	var root1 = compute("root1"),
		child1 = compute(function(){
			return root1();
		}),
		root2 = compute("root2"),
		child2 = compute(function(){
			return root2();
		}),
		gc2 = compute(function(){
			return child2();
		}),
		res = compute(function(){
			return child1() + gc2();
		});

	res.bind("change", function(ev, newVal){
		assert.equal(newVal, "ROOT1root2");
	});

	queues.batch.start();
	root1("ROOT1");
	queues.batch.stop();

});

QUnit.test("compute should not fire event when NaN is set multiple times #2128", function(assert) {
	var c = compute(NaN);

	compute.bind("change", function() {
		assert.ok(false, "change event should not be fired");
	});

	assert.ok(isNaN(c()));
	c(NaN);
});

QUnit.test("eventQueue.afterPreviousEvents firing too late (#2198)", function(assert) {


	var compute1 = compute("a"),
		compute2 = compute("b");

	var derived = compute(function() {
		return compute1().toUpperCase();
	});

	derived.bind("change", function() {
		var afterPrevious = false;

		compute2.bind("change", function() {
			assert.ok(afterPrevious, "after previous should have fired so we would respond to this event");
		});

		queues.batch.start();
		queues.batch.stop();

		// we should get this callback before we are notified of the change
		eventQueue.afterPreviousEvents(function() {
			afterPrevious = true;
		});

		compute2("c");
	});

	queues.batch.start();
	compute1("x");
	queues.batch.stop();
});

QUnit.test("Async getter causes infinite loop (#28)", function(assert) {
	var changeCount = 0;
	var idCompute = compute(1);
	var done = assert.async();

	var comp = compute.async(undefined, function(last, resolve) {
		var id = idCompute();

		setTimeout(function(){
			resolve(changeCount + '|' + id);
		},1);

		resolve(changeCount + '|' + id);
	}, null);

	comp.bind('change', function(ev, newVal) {
		changeCount++;
		comp();
	});

	setTimeout(function(){
		idCompute(2);
	}, 50);

	var checkChangeCount = function(){
		if(changeCount === 4) {
			assert.equal(changeCount, 4);
			done();
		} else {
			setTimeout(checkChangeCount, 10);
		}
	};
	checkChangeCount();
});

QUnit.test("Listening to input change", function(assert) {
	var input = document.createElement("input");
	var comp = compute(input, "value", "input");

	comp.on("change", function(){
		assert.ok(true, "it changed");
	});

	input.value = 'foo';
	domDispatch(input, "input");
});

QUnit.test("Setting an input to change", function(assert) {
	var input = document.createElement("input");
	var comp = compute(input, "value", "input");

	comp("foo");
	assert.ok(input.value === "foo");
});

QUnit.test("compute.truthy with functions (canjs/can-stache#172)", function(assert) {
	var func = compute(function() {
		return function() {
			assert.ok(false, "should not be run");
		};
	});

	var truthy = compute.truthy(func);

	assert.equal(truthy(), true);
});

QUnit.test("works with can-reflect", function(assert) {
	assert.expect(5);
	var c = compute(0);

	assert.equal( canReflect.getValue(c), 0, "unbound value");

	var handler = function(newValue){
		assert.equal(newValue, 1, "observed new value");

		canReflect.offValue(c, handler);

	};
	assert.ok(canReflect.isValueLike(c), "isValueLike is true");

	canReflect.onValue(c, handler);
	assert.equal( canReflect.valueHasDependencies(c), undefined, "valueHasDependencies");

	c(1);

	assert.equal( canReflect.getValue(c), 1, "bound value");
	c(2);

});

QUnit.test("can-reflect valueHasDependencies", function(assert) {
	var a = compute("a");
	var b = compute("b");

	var c = compute(function(){
		return a() +  b();
	});

	c.on("change", function(){});

	assert.ok( canReflect.valueHasDependencies(c), "valueHasDependencies");


});

QUnit.test("registered symbols", function(assert) {
	var a = compute("a");

	assert.ok(a[canSymbol.for("can.isValueLike")], "can.isValueLike");
	assert.equal(a[canSymbol.for("can.getValue")](), "a", "can.getValue");
	a[canSymbol.for("can.setValue")]("b");
	assert.equal(a(), "b", "can.setValue");

	function handler(val) {
		assert.equal(val, "c", "can.onValue");
	}

	a[canSymbol.for("can.onValue")](handler);
	a("c");

	a[canSymbol.for("can.offValue")](handler);
	a("d"); // doesn't trigger handler
});

QUnit.test("can-reflect setValue", function(assert) {
	var a = compute("a");

	canReflect.setValue(a, "A");
	assert.equal(a(), "A", "compute");
});

QUnit.test("Calling .unbind() with no arguments should tear down all event handlers", function(assert) {
	var count = compute(0);
	count.on('change', function() {
		console.log('Count changed');
	});
	var handlers = count.computeInstance[canSymbol.for("can.meta")].handlers;

	assert.equal(handlers.get(["change"]).length, 1, "Change event added");

	count.unbind();
	assert.equal(handlers.get(["change"]).length, 0, "All events for compute removed");
});

QUnit.test(".off() unbinds a given handler", function(assert) {
	var handler = function(){};
	var c = compute('foo');

	c.on('change', handler);

	var handlers = c.computeInstance[canSymbol.for("can.meta")].handlers;

	assert.equal(handlers.get(['change']).length, 1, 'handler added');

	c.off('change', handler);

	assert.equal(handlers.get(['change']).length, 0, 'hander removed');
});
