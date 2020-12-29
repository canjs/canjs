steal("can/compute", "can/test", "can/map", "steal-qunit", "./read_test", function () {
	QUnit.module('can/compute');
	test('single value compute', function () {
		var num = can.compute(1);
		num.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 2, 'newVal');
			equal(oldVal, 1, 'oldVal');
		});
		num(2);
	});
	test('inner computes values are not bound to', function () {
		var num = can.compute(1);
		var outer = can.compute(function() {
			var inner = can.compute(function() {
				return num() + 1;
			});
			return 2 * inner();
		});

		var handler = function () {};
		outer.bind('change', handler);
		// We do a timeout because we temporarily bind on num so that we can use its cached value.
		stop();
		setTimeout(function () {
			equal(num.computeInstance._bindings, 1, 'inner compute only bound once');
			equal(outer.computeInstance._bindings, 1, 'outer compute only bound once');
			start();
		}, 50);
	});

	test('can.compute.truthy', function () {
		var result = 0;
		var numValue;
		var num = can.compute(numValue = 3);
		var truthy = can.compute.truthy(num);
		var tester = can.compute(function () {
			if (truthy()) {
				return ++result;
			} else {
				return ++result;
			}
		});
		tester.bind('change', function (ev, newVal, oldVal) {
			if (num() === 0) {
				equal(newVal, 2, '2 is the new val');
			} else if (num() === -1) {
				equal(newVal, 3, '3 is the new val');
			} else {
				ok(false, 'change should not be called');
			}
		});
		equal(tester(), 1, 'on bind, we call tester once');
		num(numValue = 2);
		num(numValue = 1);
		num(numValue = 0);
		num(numValue = -1);
	});
	test('a binding compute does not double read', function () {
		var sourceAge = 30,
			timesComputeIsCalled = 0;
		var age = can.compute(function (newVal) {
			timesComputeIsCalled++;
			if (timesComputeIsCalled === 1) {
				ok(true, 'reading age to get value');
			} else if (timesComputeIsCalled === 2) {
				equal(newVal, 31, 'the second time should be an update');
			} else if (timesComputeIsCalled === 3) {
				ok(true, 'called after set to get the value');
			} else {
				ok(false, 'You\'ve called the callback ' + timesComputeIsCalled + ' times');
			}
			if (arguments.length) {
				sourceAge = newVal;
			} else {
				return sourceAge;
			}
		});
		var info = can.compute(function () {
			return 'I am ' + age();
		});
		var k = function () {};
		info.bind('change', k);
		equal(info(), 'I am 30');
		age(31);
		equal(info(), 'I am 31');
	});
	test('cloning a setter compute (#547)', function () {
		var name = can.compute('', function (newVal) {
			return this.txt + newVal;
		});
		var cloned = name.clone({
			txt: '.'
		});
		cloned('-');
		equal(cloned(), '.-');
	});

	test('compute updated method uses get and old value (#732)', function () {
		expect(9);
		var input = {
			value: 1
		};
		var value = can.compute('', {
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
		equal(value(), 1, 'original value');
		ok(!input.onchange, 'nothing bound');
		value(2);
		equal(value(), 2, 'updated value');
		equal(input.value, 2, 'updated input.value');



		value.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 3, 'newVal');
			equal(oldVal, 2, 'oldVal');
			value.unbind('change', this.Constructor);
		});
		ok(input.onchange, 'binding to onchange');


		input.value = 3;
		input.onchange({});

		ok(!input.onchange, 'removed binding');
		equal(value(), 3);
	});

	test("a compute updated by source changes within a batch is part of that batch", function(){

		var computeA = can.compute("a");
		var computeB = can.compute("b");

		var combined1 = can.compute(function(){

			return computeA()+" "+computeB();

		});

		var combined2 = can.compute(function(){

			return computeA()+" "+computeB();

		});

		var combo = can.compute(function(){
			return combined1()+" "+combined2();
		});

		var callbacks = 0;
		combo.bind("change", function(){
			if(callbacks === 0){
				ok(true, "called change once");
			} else {
				ok(false, "called change multiple times");
			}
			callbacks++;
		});

		can.batch.start();
		computeA("A");
		computeB("B");
		can.batch.stop();
	});

	test("compute.async can be like a normal getter", function(){
		var first = can.compute("Justin"),
			last = can.compute("Meyer"),
			fullName = can.compute.async("", function(){
				return first()+" "+last();
			});

		equal(fullName(), "Justin Meyer");
	});

	test("compute.async operate on single value", function(){

		var a = can.compute(1);
		var b = can.compute(2);

		var obj = can.compute.async({}, function( curVal ){
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

		deepEqual( obj(), {a: 1, b: 2}, "object has all properties" );

		a(0);

		deepEqual( obj(), {b: 2}, "removed a" );

		b(0);

		deepEqual( obj(), {}, "removed b" );

	});

	test("compute.async async changing value", function(){

		var a = can.compute(1);
		var b = can.compute(2);

		var async = can.compute.async(undefined,function( curVal, setVal ){

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
			{newVal: null, oldVal: "b", run: function(){ start(); }}
		],
			changeNum = 0;

		stop();


		async.bind("change", function(ev, newVal, oldVal){
			var data = changeArgs[changeNum++];
			equal( newVal, data.newVal, "newVal is correct" );
			equal( oldVal, data.oldVal, "oldVal is correct" );

			setTimeout(data.run, 10);

		});



	});

	test("compute.async read without binding", function(){

		var source = can.compute(1);

		var async = can.compute.async([],function( curVal, setVal ){
			curVal.push(source());
			return curVal;
		});

		ok(async(), "calling async worked");



	});


	// ========================================
	QUnit.module('can/Compute');

	test('single value compute', function () {
		expect(2);
		var num = new can.Compute(1);
		num.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 2, 'newVal');
			equal(oldVal, 1, 'oldVal');
		});
		num.set(2);
	});

	test('inner computes values are not bound to', function () {
		var num = new can.Compute(1),
			numBind = num.bind,
			numUnbind = num.unbind;
		var bindCount = 0;
		num.bind = function() {
			bindCount++;
			return numBind.apply(this, arguments);
		};
		num.unbind = function() {
			bindCount--;
			return numUnbind.apply(this, arguments);
		};
		var outer = new can.Compute(function() {
			var inner = new can.Compute(function() {
				return num.get() + 1;
			});
			return 2 * inner.get();
		});
		var handler = function() {};
		outer.bind('change', handler);
		// We do a timeout because we temporarily bind on num so that we can use its cached value.
		stop();
		setTimeout(function() {
			equal(bindCount, 1, 'compute only bound to once');
			start();
		}, 50);
	});

	test('can.Compute.truthy', function() {
		var result = 0;
		var num = new can.Compute(3);
		var truthy = can.Compute.truthy(num);
		var tester = new can.Compute(function() {
			if(truthy.get()) {
				return ++result;
			} else {
				return ++result;
			}
		});

		tester.bind('change', function(ev, newVal, oldVal) {
			if (num.get() === 0) {
				equal(newVal, 2, '2 is the new val');
			} else if (num.get() === -1) {
				equal(newVal, 3, '3 is the new val');
			} else {
				ok(false, 'change should not be called');
			}
		});
		equal(tester.get(), 1, 'on bind, we call tester once');
		num.set(2);
		num.set(1);
		num.set(0);
		num.set(-1);
	});

	test('a binding compute does not double read', function () {
		var sourceAge = 30,
			timesComputeIsCalled = 0;
		var age = new can.Compute(function (newVal) {
			timesComputeIsCalled++;
			if (timesComputeIsCalled === 1) {
				ok(true, 'reading age to get value');
			} else if (timesComputeIsCalled === 2) {
				equal(newVal, 31, 'the second time should be an update');
			} else if (timesComputeIsCalled === 3) {
				ok(true, 'called after set to get the value');
			} else {
				ok(false, 'You\'ve called the callback ' + timesComputeIsCalled + ' times');
			}
			if (arguments.length) {
				sourceAge = newVal;
			} else {
				return sourceAge;
			}
		});

		var info = new can.Compute(function () {
			return 'I am ' + age.get();
		});

		var k = function () {};
		info.bind('change', k);
		equal(info.get(), 'I am 30');
		age.set(31);
		equal(info.get(), 'I am 31');
	});

	test('cloning a setter compute (#547)', function () {
		var name = new can.Compute('', function(newVal) {
			return this.txt + newVal;
		});

		var cloned = name.clone({
			txt: '.'
		});

		cloned.set('-');
		equal(cloned.get(), '.-');
	});

	test('compute updated method uses get and old value (#732)', function () {
		expect(9);

		var input = {
			value: 1
		};

		var value = new can.Compute('', {
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

		equal(value.get(), 1, 'original value');
		ok(!input.onchange, 'nothing bound');
		value.set(2);
		equal(value.get(), 2, 'updated value');
		equal(input.value, 2, 'updated input.value');

		value.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 3, 'newVal');
			equal(oldVal, 2, 'oldVal');
			value.unbind('change', this.Constructor);
		});

		ok(input.onchange, 'binding to onchange');

		input.value = 3;
		input.onchange({});

		ok(!input.onchange, 'removed binding');
		equal(value.get(), 3);
	});

	test('a compute updated by source changes within a batch is part of that batch', function () {
		var computeA = new can.Compute('a');
		var computeB = new can.Compute('b');

		var combined1 = new can.Compute(function() {
			return computeA.get() + ' ' + computeB.get();
		});

		var combined2 = new can.Compute(function() {
			return computeA.get() + ' ' + computeB.get();
		});

		var combo = new can.Compute(function() {
			return combined1.get() + ' ' + combined2.get();
		});


		var callbacks = 0;
		combo.bind('change', function(){
			if(callbacks === 0){
				ok(true, 'called change once');
			} else {
				ok(false, 'called change multiple times');
			}
			callbacks++;
		});

		can.batch.start();
		computeA.set('A');
		computeB.set('B');
		can.batch.stop();
	});

	test('compute.async can be like a normal getter', function() {
		var first = new can.Compute('Justin'),
			last = new can.Compute('Meyer'),
			fullName = can.Compute.async('', function(){
				return first.get() + ' ' + last.get();
			});

		equal(fullName.get(), 'Justin Meyer');
	});

	test('compute.async operate on single value', function() {
		var a = new can.Compute(1);
		var b = new can.Compute(2);

		var obj = can.Compute.async({}, function(curVal) {
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
		deepEqual(obj.get(), {a: 1, b: 2}, 'object has all properties');

		a.set(0);
		deepEqual(obj.get(), {b: 2}, 'removed a');

		b.set(0);
		deepEqual(obj.get(), {}, 'removed b');
	});

	test('compute.async async changing value', function() {
		var a = new can.Compute(1);
		var b = new can.Compute(2);

		var async = can.Compute.async(undefined, function(curVal, setVal) {
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

		var changeArgs = [
			{newVal: 'a', oldVal: undefined, run: function() { a.set(0); } },
			{newVal: 'b', oldVal: 'a', run: function() { b.set(0); }},
			{newVal: null, oldVal: 'b', run: function() { start(); }}
		],
		changeNum = 0;

		stop();

		async.bind('change', function(ev, newVal, oldVal) {
			var data = changeArgs[changeNum++];
			equal( newVal, data.newVal, 'newVal is correct' );
			equal( oldVal, data.oldVal, 'oldVal is correct' );

			setTimeout(data.run, 10);
		});
	});

	test('compute.async read without binding', function() {
		var source = new can.Compute(1);

		var async = can.Compute.async([],function( curVal, setVal ) {
			curVal.push(source.get());
			return curVal;
		});

		ok(async.get(), 'calling async worked');
	});

	test('Compute.async set uses last set or initial value', function() {

		var add = new can.Compute(1);

		var fnCount = 0;

		var async = can.Compute.async(10,function( curVal ) {
			switch(fnCount++) {
				case 0:
					equal(curVal, 10);
					break;
				case 1:
					equal(curVal, 20);
					break;
				case 2:
					equal(curVal, 30, "on bind");
					break;
				case 3:
					equal(curVal, 30, "on bind");
					break;
			}
			return curVal+add.get();
		});

		equal(async.get(), 11, "initial value");

		async.set(20);

		async.bind("change", function(){});

		async.set(20);

		async.set(30);
	});



	test("setting compute.async with a observable dependency gets a new value and can re-compute", 4, function(){
		// this is needed for define with a set and get.
		var compute = can.compute(1);
		var add;

		var async = can.compute.async(1, function(curVal){
			add = curVal;
			return compute()+add;
		});


		equal( async(), 2, "can read unbound");

		async.bind("change", function(ev, newVal, oldVal){
			equal(newVal, 3, "change new val");
			equal(oldVal, 2, "change old val");
		});


		async(2);

		equal( async(), 3, "can read unbound");
	});

	test('compute.async getter has correct when length === 1', function(){
		var m = new can.Map();

		var getterCompute = can.compute.async(false, function (singleArg) {
			equal(this, m, 'getter has the right context');
		}, m);

		getterCompute.bind('change', can.noop);
	});

	test("bug with nested computes and batch ordering (#1519)", function(){

		var root = can.compute('a');

		var isA = can.compute(function(){
			return root() ==='a';
		});

		var isB = can.compute(function(){
			return root() === 'b';
		});

		var combined = can.compute(function(){
			var valA = isA(),
				valB = isB();

			return valA || valB;
		});

		equal(combined(), true);

		combined.bind('change', function(){ });



		can.batch.start();
		root('b');
		can.batch.stop();

		equal(combined(), true);
		//equal(other(), 2);
	});

	test('compute change handler context is set to the function not can.Compute', function() {
		var comp = can.compute(null);

		comp.bind('change', function() {
			equal(typeof this, 'function');
		});

		comp('test');
	});

	test('Calling .unbind() on un-bound compute does not throw an error', function () {
		var count =  can.compute(0);
		count.unbind('change');
		ok(true, 'No error was thrown');
	});


	test("dependent computes update in the right order (2093)", function() {

		var root = can.compute('a'),
			childB = can.compute(function() {
				return root();
			}),
			combine = can.compute(function() {
				return root() + childB();
			});

		combine.bind("change", function(ev, newVal) {
			equal(newVal, "bb", "concat changed");
		});
		root('b');
	});

	test("dependent computes update in the right order with a batch (#2093)", function() {

		// so the problem is that `child` then `combine` happens.
		// without a batch, child change fires before `combine`, firing `grandChild`, which
		// then triggers `combine`.


		// the goal should be for
		var root = can.compute('a'),
			child = can.compute(function() {
				return root();
			}),
			child2 = can.compute(function(){
				return root();
			}),
			grandChild = can.compute(function(){
				return child();
			}),
			combine = can.compute(function() {
				return child2()+grandChild();
			});

		/*console.log("root", root.computeInstance._cid,
			"child", child.computeInstance._cid,
			"grandChild", grandChild.computeInstance._cid,
			"combine", combine.computeInstance._cid);*/

		combine.bind("change", function(ev, newVal) {
			equal(newVal, "bb", "concat changed");
		});

		/*root.bind("change", function(ev, newVal){
			console.log("root change", ev.batchNum)
		});
		child.bind("change", function(ev, newVal){
			console.log("child change", ev.batchNum)
		});
		grandChild.bind("change", function(ev, newVal){
			console.log("grandChild change", ev.batchNum)
		});*/

		can.batch.start();
		root('b');
		can.batch.stop();
	});

	test("bug with nested computes and batch ordering (#1519)", function(){

		var root = can.compute('a');

		var isA = can.compute(function(){
			return root() ==='a';
		});

		var isB = can.compute(function(){
			return root() === 'b';
		});

		var combined = can.compute(function(){
			var valA = isA(),
				valB = isB();

			return valA || valB;
		});

		equal(combined(), true);

		combined.bind('change', function(){ });



		can.batch.start();
		root('b');
		can.batch.stop();

		equal(combined(), true);
		//equal(other(), 2);
	});

	test("binding, unbinding, and rebinding works after a timeout (#2095)", function(){
		var root = can.compute(1),
			derived = can.compute(function(){
				return root();
			});

		var change = function(){};
		derived.bind("change", change);
		derived.unbind("change", change);

		stop();
		setTimeout(function(){
			derived.bind("change", function(ev, newVal, oldVal){
				equal(newVal, 2, "updated");
				start();
			});
			root(2);
		},10);

	});

	test("can.__isRecording observes doesn't understand can.__notObserve (#2099)", function(){
		expect(0);
		var compute = can.compute(1);
		compute.computeInstance.bind = function() {
			ok(false);
		};

		var outer = can.compute(function(){
			can.__notObserve(function(){
				compute();
			})();
		});

		outer.bind("change", function(){});
	});

	test("handles missing update order items (#2121)",function(){
		var root1 = can.compute("root1"),
			child1 = can.compute(function(){
				return root1();
			}),
			root2 = can.compute("root2"),
			child2 = can.compute(function(){
				return root2();
			}),
			gc2 = can.compute(function(){
				return child2();
			}),
			res = can.compute(function(){
				return child1() + gc2();
			});

		res.bind("change", function(ev, newVal){
			equal(newVal, "ROOT1root2");
		});

		can.batch.start();
		root1("ROOT1");
		can.batch.stop();

	});

	test("compute should not fire event when NaN is set multiple times #2128", function() {
		var compute = can.compute(NaN);

		compute.bind("change", function() {
			ok(false, "change event should not be fired");
		});

		ok(isNaN(compute()));
		compute(NaN);
	});

	test("can.batch.afterPreviousEvents firing too late (#2198)", function(){


		var compute1 = can.compute("a"),
			compute2 = can.compute("b");

		var derived = can.compute(function() {
			return compute1().toUpperCase();
		});

		derived.bind("change", function() {
			var afterPrevious = false;

			compute2.bind("change", function() {
				ok(afterPrevious, "after previous should have fired so we would respond to this event");
			});

			can.batch.start();
			can.batch.stop();

			// we should get this callback before we are notified of the change
			can.batch.afterPreviousEvents(function() {
				afterPrevious = true;
			});

			compute2("c");
		});

		can.batch.start();
		compute1("x");
		can.batch.stop();
	});

	test("Change propagation in a batch with late bindings (#2412)", function(){
		var rootA = new can.Compute('a');
		var rootB = new can.Compute('b');

		var childA = new can.Compute(function() {
			return "childA"+rootA.get();
		});

		var grandChild = new can.Compute(function() {

			var b = rootB.get();
			if (b === "b") {
				return "grandChild->b";
			}

			var a = childA.get();
			return "grandChild->" + a;
		});


		childA.bind('change', function(ev, newVal, oldVal) {});

		grandChild.bind('change', function(ev, newVal, oldVal) {
			equal(newVal, "grandChild->childAA");
		});

		can.batch.start();
		rootA.set('A');
		rootB.set('B');
		can.batch.stop();

	});

	test("deeply nested computes that are read that don't allow deeper primary depth computes to complete first", function(){

		// This is to setup `grandChild` which will be forced
		// into reading `childA` which has a higher depth then itself, but isn't changing.
		// This makes sure that it will get a value for childA before
		// continuing on to deeper "primary depth" computes (things that are nested in stache).
		var rootA = new can.Compute('a');
		var rootB = new can.Compute('b');

		var childA = new can.Compute(function() {
			return "childA"+rootA.get();
		},'childA');

		var grandChild = new can.Compute(function() {
			if(rootB.get() === 'b') {
				return 'grandChild->b';
			}
			return childA.get();
		},'grandChild');

		// this should update last
		var deepThing = new can.Compute(function(){
			return rootB.get();
		},"deepThing", 4);

		deepThing.setPrimaryDepth(4);

		var order = [];

		childA.bind("change", function(){});

		deepThing.bind("change", function(){
			order.push("deepThing");
		});

		grandChild.bind("change", function(ev, newVal){
			order.push("grandChild "+newVal);
		});


		can.batch.start();
		rootB.set('B');
		can.batch.stop();


		QUnit.deepEqual(order, ["grandChild childAa","deepThing"]);

	});

});