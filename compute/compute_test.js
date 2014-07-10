steal("can/compute", "can/test", "can/map", function () {
	module('can/compute');
	test('single value compute', function () {
		var num = can.compute(1);
		num.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 2, 'newVal');
			equal(oldVal, 1, 'oldVal');
		});
		num(2);
	});
	test('inner computes values are not bound to', function () {
		var num = can.compute(1),
			numBind = num.bind,
			numUnbind = num.unbind;
		var bindCount = 0;
		num.bind = function () {
			bindCount++;
			return numBind.apply(this, arguments);
		};
		num.unbind = function () {
			bindCount--;
			return numUnbind.apply(this, arguments);
		};
		var outer = can.compute(function () {
			var inner = can.compute(function () {
				return num() + 1;
			});
			return 2 * inner();
		});
		var handler = function () {};
		outer.bind('change', handler);
		// We do a timeout because we temporarily bind on num so that we can use its cached value.
		stop();
		setTimeout(function () {
			equal(bindCount, 1, 'compute only bound to once');
			start();
		}, 50);
	});
	test('can.compute.truthy', function () {
		var result = 0;
		var num = can.compute(3);
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
		num(2);
		num(1);
		num(0);
		num(-1);
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

	test("can.Construct derived classes should be considered objects, not functions (#450)", function() {
		var foostructor = can.Map({ text: "bar" }, {}),
			obj = {
				next_level: {
					thing: foostructor,
					text: "In the inner context"
				}
			},
			read;
		foostructor.self = foostructor;

		read = can.compute.read(obj, ["next_level","thing","self","text"]);
		equal(read.value, "bar", "static properties on a can.Construct-based function");

		read = can.compute.read(obj, ["next_level","thing","self"], { isArgument: true });
		ok(read.value === foostructor, "arguments shouldn't be executed");

		foostructor.self = function() { return foostructor; };
		read = can.compute.read(obj, ["next_level","thing","self","text"], { executeAnonymousFunctions: true });
		equal(read.value, "bar", "anonymous functions in the middle of a read should be executed if requested");
	});
	
	test("compute.async read without binding", function(){
		
		var source = can.compute(1);
		
		var async = can.compute.async([],function( curVal, setVal ){
			curVal.push(source());
			return curVal;
		});
		
		ok(async(), "calling async worked");
		
		
		
	});
	
	test("compute.async setting does not force a read", function(){
		expect(0);
		var source = can.compute(1);
		
		var async = can.compute.async([],function( curVal, setVal ){
			ok(false);
			curVal.push(source());
			return curVal;
		});
		
		async([]);
	});

	test("compute.read works with a Map wrapped in a compute", function() {
		var parent = can.compute(new can.Map({map: {first: "Justin" }}));
		var reads = ["map", "first"];

		var result = can.compute.read(parent, reads);
		equal(result.value, "Justin", "The correct value is found.");
	});
	
});
