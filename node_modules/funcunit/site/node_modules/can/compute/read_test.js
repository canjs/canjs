steal("can/compute", "can/test", "can/map", "steal-qunit", function () {
	QUnit.module('can/compute/read');
	
	
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

		read = can.compute.read(obj, can.compute.read.reads("next_level.thing.self.text") );
		equal(read.value, "bar", "static properties on a can.Construct-based function");

		read = can.compute.read(obj, can.compute.read.reads("next_level.thing.self"), { isArgument: true });
		ok(read.value === foostructor, "arguments shouldn't be executed");

		foostructor.self = function() { return foostructor; };
		read = can.compute.read(obj, can.compute.read.reads("next_level.thing.self.text"), { });
		equal(read.value, "bar", "anonymous functions in the middle of a read should be executed if requested");
	});
	
	test("compute.read works with a Map wrapped in a compute", function() {
		var parent = can.compute(new can.Map({map: {first: "Justin" }}));

		var result = can.compute.read(parent, can.compute.read.reads("map.first"));
		equal(result.value, "Justin", "The correct value is found.");
	});

	test('compute.read works with a Map wrapped in a compute', function() {
		var parent = new can.Compute(new can.Map({map: {first: 'Justin' }}));

		var result = can.Compute.read(parent, can.compute.read.reads("map.first"));
		equal(result.value, 'Justin', 'The correct value is found.');
	});

	test("compute.read returns constructor functions instead of executing them (#1332)", function() {
		var Todo = can.Map.extend({});
		var parent = can.compute(new can.Map({map: { Test: Todo }}));

		var result = can.compute.read(parent, can.compute.read.reads("map.Test"));
		equal(result.value, Todo, 'Got the same Todo');
	});
	
	test("compute.set with different values", 4, function() {
		var comp = can.compute("David");
		var parent = {
			name: "David",
			comp: comp
		};
		var map = new can.Map({
			name: "David"
		});

		map.bind('change', function(ev, attr, how, value) {
			equal(value, "Brian", "Got change event on map");
		});
		
		can.compute.set(parent, "name", "Matthew");
		equal(parent.name, "Matthew", "Name set");

		can.compute.set(parent, "comp", "Justin");
		equal(comp(), "Justin", "Name updated");

		can.compute.set(map, "name", "Brian");
		equal(map.attr("name"), "Brian", "Name updated in map");
	});
	
	test("can.Compute.read can read a promise (#179)", function(){
		
		var def = new can.Deferred();
		var map = new can.Map();
		
		var c = can.compute(function(){
			return can.Compute.read({map: map},can.compute.read.reads("map.data.value")).value;
		});
		
		var calls = 0;
		c.bind("change", function(ev, newVal, oldVal){
			calls++;
			equal(calls, 1, "only one call");
			equal(newVal, "Something", "new value");
			equal(oldVal, undefined, "oldVal");
			start();
		});
		
		map.attr("data", def);
		
		setTimeout(function(){
			def.resolve("Something");
		},2);
		
		stop();
		
	});
	
	test('can.compute.reads', function(){
		deepEqual( can.compute.read.reads("@foo"),
			[{key: "foo", at: true}]);
			
		deepEqual( can.compute.read.reads("@foo.bar"),
			[{key: "foo", at: true}, {key: "bar", at: false}]);
			
		deepEqual( can.compute.read.reads("@foo\\.bar"),
			[{key: "foo.bar", at: true}]);
			
		deepEqual( can.compute.read.reads("foo.bar@zed"),
			[{key: "foo", at: false},{key: "bar", at: false},{key: "zed", at: true}]);
		
	});
	
	test("prototype computes work (#2098)", function(){
		var Map = can.Map.extend({
			plusOne: can.compute(function(){
				return this.attr("value")+1;
			})
		});
		var root = new Map({value: 2}),
			read;
		read = can.compute.read(root, can.compute.read.reads("plusOne") );
		equal(read.value, 3, "static properties on a can.Construct-based function");
	});
	
	test("expandos on can.Map can be read (#2199)", function(){
		var map = new can.Map({});
		var expandoMethod = function(){
			return this.expandoProp+"!";
		};
		map.expandoMethod = expandoMethod;
		map.expandoProp = "val";
		
		var read = can.compute.read(map, can.compute.read.reads("@expandoMethod") );
		equal(read.value(),"val!", "got expando method");
		
		read = can.compute.read(map, can.compute.read.reads("expandoProp") );
		equal(read.value,"val", "got expando prop");
	});
	
});