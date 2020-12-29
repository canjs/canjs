var QUnit = require('steal-qunit');
var Compute = require('can-compute/proto-compute');

var queues = require('can-queues');
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");


QUnit.module('can/Compute');

QUnit.test('single value compute', function(assert) {
	assert.expect(2);
	var num = new Compute(1);
	num.bind('change', function (ev, newVal, oldVal) {
		assert.equal(newVal, 2, 'newVal');
		assert.equal(oldVal, 1, 'oldVal');
	});
	num.set(2);
});

QUnit.test('inner computes values are not bound to', function(assert) {
	var num = new Compute(1);
	var outer = new Compute(function() {
		var inner = new Compute(function() {
			return num.get() + 1;
		});
		return 2 * inner.get();
	});
	var handler = function() {};
	outer.bind('change', handler);
	// We do a timeout because we temporarily bind on num so that we can use its cached value.
	var done = assert.async();
	setTimeout(function() {
		var handlers = num[canSymbol.for("can.meta")].handlers;
		assert.equal(handlers.get([]).length, 1, 'compute only bound to once');
		done();
	}, 50);
});

QUnit.test('compute.truthy', function(assert) {
	var result = 0;
	var num = new Compute(3);
	var truthy = Compute.truthy(num);
	var tester = new Compute(function() {
		if(truthy.get()) {
			return ++result;
		} else {
			return ++result;
		}
	});

	tester.bind('change', function(ev, newVal, oldVal) {
		if (num.get() === 0) {
			assert.equal(newVal, 2, '2 is the new val');
		} else if (num.get() === -1) {
			assert.equal(newVal, 3, '3 is the new val');
		} else {
			assert.ok(false, 'change should not be called');
		}
	});
	assert.equal(tester.get(), 1, 'on bind, we call tester once');
	num.set(2);
	num.set(1);
	num.set(0);
	num.set(-1);
});

QUnit.test('a binding compute does not double read', function(assert) {
	var sourceAge = 30,
		timesComputeIsCalled = 0;
	var age = new Compute(function (newVal) {
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

	var info = new Compute(function () {
		return 'I am ' + age.get();
	});

	var k = function () {};
	info.bind('change', k);
	assert.equal(info.get(), 'I am 30');
	age.set(31);
	assert.equal(info.get(), 'I am 31');
});

QUnit.test('cloning a setter compute (#547)', function(assert) {
	var name = new Compute('', function(newVal) {
		return this.txt + newVal;
	});

	var cloned = name.clone({
		txt: '.'
	});

	cloned.set('-');
	assert.equal(cloned.get(), '.-');
});

QUnit.test('compute updated method uses get and old value (#732)', function(assert) {
	assert.expect(9);

	var input = {
		value: 1
	};

	var value = new Compute('', {
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

	assert.equal(value.get(), 1, 'original value');
	assert.ok(!input.onchange, 'nothing bound');
	value.set(2);
	assert.equal(value.get(), 2, 'updated value');
	assert.equal(input.value, 2, 'updated input.value');

	value.bind('change', function (ev, newVal, oldVal) {
		assert.equal(newVal, 3, 'newVal');
		assert.equal(oldVal, 2, 'oldVal');
		value.unbind('change', this.Constructor);
	});

	assert.ok(input.onchange, 'binding to onchange');

	input.value = 3;
	input.onchange({});

	assert.ok(!input.onchange, 'removed binding');
	assert.equal(value.get(), 3);
});

QUnit.test('a compute updated by source changes within a batch is part of that batch', function(assert) {
	var computeA = new Compute('a');
	var computeB = new Compute('b');

	var combined1 = new Compute(function() {
		return computeA.get() + ' ' + computeB.get();
	});

	var combined2 = new Compute(function() {
		return computeA.get() + ' ' + computeB.get();
	});

	var combo = new Compute(function() {
		return combined1.get() + ' ' + combined2.get();
	});


	var callbacks = 0;
	combo.bind('change', function(){
		if(callbacks === 0){
			assert.ok(true, 'called change once');
		} else {
			assert.ok(false, 'called change multiple times');
		}
		callbacks++;
	});

	queues.batch.start();
	computeA.set('A');
	computeB.set('B');
	queues.batch.stop();
});

QUnit.test('Compute.async can be like a normal getter', function(assert) {
	var first = new Compute('Justin'),
		last = new Compute('Meyer'),
		fullName = Compute.async('', function(){
			return first.get() + ' ' + last.get();
		});

	assert.equal(fullName.get(), 'Justin Meyer');
});

QUnit.test('Compute.async operate on single value', function(assert) {
	var a = new Compute(1);
	var b = new Compute(2);

	var obj = Compute.async({}, function(curVal) {
		if(a.get()) {
			curVal.a = a.get();
		} else {
			delete curVal.a;
		}

		if(b.get()) {
			curVal.b = b.get();
		} else {
			delete curVal.b;
		}

		return curVal;
	});

	obj.bind('change', function() {});
	assert.deepEqual(obj.get(), {a: 1, b: 2}, 'object has all properties');

	a.set(0);
	assert.deepEqual(obj.get(), {b: 2}, 'removed a');

	b.set(0);
	assert.deepEqual(obj.get(), {}, 'removed b');
});

QUnit.test('Compute.async async changing value', function(assert) {
	var a = new Compute(1);
	var b = new Compute(2);

	var async = Compute.async(undefined, function(curVal, setVal) {
		if(a.get()) {
			setTimeout(function() {
				setVal('a');
			}, 10);
		} else if(b.get()) {
			setTimeout(function() {
				setVal('b');
			}, 10);
		} else {
			return null;
		}
	});
	
	var done = assert.async();

	var changeArgs = [
		{newVal: 'a', oldVal: undefined, run: function() { a.set(0); } },
		{newVal: 'b', oldVal: 'a', run: function() { b.set(0); }},
		{newVal: null, oldVal: 'b', run: function() { done(); }}
	],
	changeNum = 0;


	async.bind('change', function(ev, newVal, oldVal) {
		var data = changeArgs[changeNum++];
		assert.equal( newVal, data.newVal, 'newVal is correct' );
		assert.equal( oldVal, data.oldVal, 'oldVal is correct' );

		setTimeout(data.run, 10);
	});
});

QUnit.test('Compute.async read without binding', function(assert) {
	var source = new Compute(1);

	var async = Compute.async([],function( curVal, setVal ) {
		curVal.push(source.get());
		return curVal;
	});

	assert.ok(async.get(), 'calling async worked');
});

QUnit.test('Compute.async set uses last set or initial value', function(assert) {

	var add = new Compute(1);

	var fnCount = 0;

	var async = Compute.async(10,function( curVal ) {
		switch(fnCount++) {
			case 0:
				assert.equal(curVal, 10);
				break;
			case 1:
				assert.equal(curVal, 20);
				break;
			case 2:
				assert.equal(curVal, 30, "on bind");
				break;
			case 3:
				assert.equal(curVal, 30, "on bind");
				break;
		}
		return curVal+add.get();
	});

	assert.equal(async.get(), 11, "initial value");

	async.set(20);

	async.bind("change", function(){});

	async.set(20);

	async.set(30);
});

QUnit.test("Change propagation in a batch with late bindings (#2412)", function(assert) {
	var rootA = new Compute('a');
	var rootB = new Compute('b');

	var childA = new Compute(function() {
	  return "childA"+rootA.get();
	});

	var grandChild = new Compute(function() {

	  var b = rootB.get();
	  if (b === "b") {
		return "grandChild->b";
	  }

	  var a = childA.get();
	  return "grandChild->"+a;
	});



	childA.bind('change', function(ev, newVal, oldVal) {});

	grandChild.bind('change', function(ev, newVal, oldVal) {
	  assert.equal(newVal, "grandChild->childAA");
	});


	queues.batch.start();
	rootA.set('A');
	rootB.set('B');
	queues.batch.stop();

});

if (Compute.prototype.trace) {
	QUnit.test("trace", function(assert) {
		var rootA = new Compute('a');
		var rootB = new Compute('b');

		var childA = new Compute(function() {
			return "childA"+rootA.get();
		});

		var fn = function() {
			var b = rootB.get();
			if (b === "b") {
				return "grandChild->b";
			}
			var a = childA.get();
			return "grandChild->"+a;
		};
		var grandChild = new Compute(fn);



		childA.bind('change', function(ev, newVal, oldVal) {});

		grandChild.bind('change', function(ev, newVal, oldVal) {
			assert.equal(newVal, "grandChild->childAA");
		});

		var out = grandChild.trace();
		assert.equal(out.definition, fn, "got the right function");
		assert.equal(out.computeValue, "grandChild->b");
		grandChild.log();
		queues.batch.start();
		rootA.set('A');
		rootB.set('B');
		queues.batch.stop();
		grandChild.log();

	});
}

QUnit.test("works with can-reflect", function(assert) {
	assert.expect(5);
	var c = new Compute(0);

	assert.equal( canReflect.getValue(c), 0, "unbound value");

	assert.ok(canReflect.isValueLike(c), "isValueLike is true");

	assert.ok( !canReflect.valueHasDependencies(c), "valueHasDependencies -- false");
	var d = new Compute(function() {
		return c.get();
	});
	d.on("change", function() {});
	assert.ok( canReflect.valueHasDependencies(d), "valueHasDependencies -- true");

	c.set(1);

	assert.equal( canReflect.getValue(d), 1, "bound value");
	c.set(2);

});

QUnit.test("can-reflect setValue", function(assert) {
	var a = new Compute("a");

	canReflect.setValue(a, "A");
	assert.equal(a.get(), "A", "compute");
});

QUnit.test("registered symbols", function(assert) {
	var a = new Compute("a");

	assert.ok(a[canSymbol.for("can.isValueLike")], "can.isValueLike");
	assert.equal(a[canSymbol.for("can.getValue")](), "a", "can.getValue");
	a[canSymbol.for("can.setValue")]("b");
	assert.equal(a.get(), "b", "can.setValue");

	function handler(val) {
		assert.equal(val, "c", "can.onValue");
	}

	a[canSymbol.for("can.onValue")](handler);
	a.set("c");

	a[canSymbol.for("can.offValue")](handler);
	a.set("d"); // doesn't trigger handler
});

QUnit.test("canReflect.onValue should get the previous value", function(assert) {
	var a = new Compute("a");
	var done = assert.async();

	canReflect.onValue(a, function(newVal, oldVal) {
		assert.equal(newVal, "b");
		assert.equal(oldVal, "a");
		done();
	});

	a.set("b");
});
