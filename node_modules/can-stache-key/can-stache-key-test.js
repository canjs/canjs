var observeReader = require("can-stache-key");
var QUnit = require('steal-qunit');
var Observation = require('can-observation');
var eventQueue = require('can-event-queue/map/map');
var SimpleObservable = require("can-simple-observable");
var testHelpers = require('can-test-helpers');
var ObservationRecorder = require("can-observation-recorder");

var SimpleMap = require("can-simple-map");
var canReflect = require("can-reflect");

QUnit.module('can-stache-key',{

});

QUnit.test("can read a promise (#179)", function(assert) {
	var done = assert.async();
	var data = {
		promise: new Promise(function(resolve){
			setTimeout(function(){
				resolve("Something");
			},2);
		})
	};
	var calls = 0;
	var c = new Observation(function(){
		return observeReader.read(data,observeReader.reads("promise.value")).value;
	});
	canReflect.onValue(c, function(newVal, oldVal){
		calls++;
		assert.equal(calls, 1, "only one call");
		assert.equal(newVal, "Something", "new value");
		assert.equal(oldVal, undefined, "oldVal");
		done();
	});



});

QUnit.test("can.Compute.read can read a promise-like (#82)", function(assert) {
	var done = assert.async();
	var data = {
		promiseLike: {
			then: function(resolve) {
				setTimeout(function(){
					resolve("Something");
				}, 2);
			}
		}
	};
	var calls = 0;
	var c = new Observation(function(){
		return observeReader.read(data,observeReader.reads("promiseLike.value")).value;
	});
	canReflect.onValue(c, function(newVal, oldVal){
		calls++;
		assert.equal(calls, 1, "only one call");
		assert.equal(newVal, "Something", "new value");
		assert.equal(oldVal, undefined, "oldVal");
		done();
	});


});

QUnit.test('can.compute.reads', function(assert) {
	assert.deepEqual( observeReader.reads("@foo"),
		[{key: "foo", at: true}]);

	assert.deepEqual( observeReader.reads("@foo.bar"),
		[{key: "foo", at: true}, {key: "bar", at: false}]);

	assert.deepEqual( observeReader.reads("@foo\\.bar"),
		[{key: "foo.bar", at: true}]);

	assert.deepEqual( observeReader.reads("foo.bar@zed"),
		[{key: "foo", at: false},{key: "bar", at: false},{key: "zed", at: true}]);

});

QUnit.test('able to read things like can-define', function(assert) {
	assert.expect(3);
	var obj = eventQueue({});
	var prop = "PROP";
	Object.defineProperty(obj, "prop",{
		get: function(){
			ObservationRecorder.add(obj,"prop");
			return prop;
		},
		set: function(val){
			var old = prop;
			prop = val;
			this.dispatch("prop", prop, old);
		}
	});
	var data = {
		obj: obj
	};

	var c = new Observation(function(){
		var value = observeReader.read(data,observeReader.reads("obj.prop"),{
			foundObservable: function(obs, index){
				assert.equal(obs, obj, "got an observable");
				assert.equal(index,1, "got the right index");
			}
		}).value;
		assert.equal(value, "PROP");
	});
	canReflect.onValue(c, function(){});
});

QUnit.test("foundObservable called with observable object (#7)", function(assert) {
	var map = new SimpleMap({
		isSaving: function(){
			ObservationRecorder.add(this, "_saving");
		},
		addEventListener: function(){}
	});

	// must use an observation to make sure things are listening.
	var c = new Observation(function(){
		observeReader.read(map,observeReader.reads("isSaving"),{
			foundObservable: function(obs){
				assert.equal(obs, map);
			},
			callMethodsOnObservables: true
		});
	});
	canReflect.onValue(c, function(){});
});

QUnit.test("can read from strings", function(assert) {
	var context = " hi there ";
	var result =  observeReader.read(context,observeReader.reads("trim"),{});
	assert.equal(
		result.value(context),
		context.trim(context),
		'trim method works'
	);
});

QUnit.test("read / write to SimpleMap", function(assert) {
	var map = new SimpleMap();
	var c = new Observation(function(){
		var data = observeReader.read(map,observeReader.reads("value"),{
			foundObservable: function(obs){
				assert.equal(obs, map, "got map");
			}
		});
		return data.value;
	});
	canReflect.onValue(c, function(newVal){
		assert.equal(newVal, 1, "got updated");
	});
	observeReader.write(map,"value",1);
});

QUnit.test("write deep in SimpleMap", function(assert) {
	var map = new SimpleMap();
	observeReader.write(map,"foo", new SimpleMap());
	observeReader.write(map,"foo.bar", 1);

	assert.equal(map.get("foo").get("bar"), 1, "value set");
});

QUnit.test("write to compute in object", function(assert) {
	var value = 2;
	var computeObject = {};
	canReflect.assignSymbols(computeObject, {
		"can.getValue": function(){
			return value;
		},
		"can.setValue": function(newVal){
			value = newVal;
		}
	});

	var obj = {compute: computeObject};

	observeReader.write(obj,"compute", 3);

	assert.equal(value, 3, "value set");
});

QUnit.test("write to a map in a compute", function(assert) {

	var map = new SimpleMap({complete: true});
	var computeObject = {};

	canReflect.assignSymbols(computeObject, {
		"can.getValue": function(){
			return map;
		},
		"can.setValue": function(newVal){
			map = newVal;
		}
	});

	observeReader.write(computeObject, "complete", false);

	assert.equal(map.attr("complete"), false, "value set");
});

QUnit.test("reads can be passed a number (can-stache#207)", function(assert) {
	var reads = observeReader.reads(0);
	assert.deepEqual(reads, [{key: "0", at: false}], "number converted to string");

});

QUnit.test("can read primitive numbers (#88)", function(assert) {
	var reads = observeReader.reads("num@toFixed");
	var toFixed = observeReader.read({
		num: 5
	}, reads, {}).value;

	assert.equal(typeof toFixed, "function", "got to fixed");

});

QUnit.test("it returns null when promise getter is null #2", function(assert) {
	var nullPromise = observeReader.read(null, observeReader.reads('value'));
	assert.equal(typeof nullPromise,"object");
});

QUnit.test("set onto observable objects and values", function(assert) {
	var map = new SimpleMap();
	observeReader.write({map: map},"map", {a: "b"});

	assert.equal(map.get("a"), "b", "merged");

	var simple = new SimpleObservable();
	observeReader.write({simple: simple},"simple", 1);
	assert.equal(simple.get(), 1);
});

testHelpers.dev.devOnlyTest("functions are not called by read()", function (assert) {
	var func = function() {
		assert.ok(false, "method called");
	};
	var data = { func: func };
	var reads = observeReader.reads("func");

	observeReader.read(data, reads);

	assert.ok(true);
});

testHelpers.dev.devOnlyTest("a warning is given for `callMethodsOnObservables: true`", function (assert) {
	var teardown = testHelpers.dev.willWarn("can-stache-key: read() called with `callMethodsOnObservables: true`.");
	var func = function() {
		assert.ok(true, "method called");
	};
	var data = new SimpleMap({ func: func });
	var reads = observeReader.reads("func");

	observeReader.read(data, reads, {
		callMethodsOnObservables: true
	});

	assert.equal(teardown(), 1, "warning displayed");
});

QUnit.test("writing to a null observable is ignored", function(assert) {
	observeReader.write({},"foo.bar", "value");
	observeReader.write(null,"bar", "value");
	observeReader.write(null,"foo.bar", "value");
	assert.ok(true, "all passed without error");
});

QUnit.test("parentHasKey and foundLastParent (#31)", function(assert) {
	var hasKeys = function(obj, keys) {
		canReflect.assignSymbols(obj, {
			"can.hasKey": function(key) {
				return keys.indexOf(key) > -1;
			}
		});
	};

	var def = { ghi: undefined };
	hasKeys(def, [ "ghi" ]);

	var abc = { def: def };
	hasKeys(abc, [ "def" ]);

	var parent = { abc: abc };
	hasKeys(parent, [ "abc" ]);

	var testCases = {
		"abc.def.ghi": { parent: def, value: undefined, parentHasKey: true, foundLastParent: true },
		"abc.def.jkl": { parent: def, value: undefined, parentHasKey: false, foundLastParent: true },
		"abc.ghi.ghi": { parent: abc, value: undefined, parentHasKey: false, foundLastParent: false },
		"def.ghi.jkl": { parent: parent, value: undefined, parentHasKey: false, foundLastParent: false }
	};

	var reads, actual, expected;
	for (var key in testCases) {
		reads = observeReader.reads(key);
		actual = observeReader.read(parent, reads);
		expected = testCases[key];

		assert.equal(actual.value, expected.value, key + ".value");
		assert.equal(actual.parent, expected.parent, key + ".parent");
		assert.equal(actual.parentHasKey, expected.parentHasKey, key + ".parentHasKey");
		assert.equal(actual.foundLastParent, expected.foundLastParent, key + ".foundLastParent");
	}
});

QUnit.test("objHasKeyAtIndex doesn't handle non-object types correctly (#33)", function(assert) {
	var result = observeReader.read(47, observeReader.reads("toFixed"));
	assert.equal(typeof result.value, 'function');
	assert.equal(result.parent, 47);
	assert.equal(result.parentHasKey, true);
});

QUnit.test("write to an object", function(assert) {
	var obj = {};
	observeReader.write(obj,"value",1);
	assert.deepEqual(obj,{value: 1});
	obj = {value: null};
	observeReader.write(obj,"value",1);
	assert.deepEqual(obj,{value: 1});
});

QUnit.test(".then won't call bindings #49", function(assert){
	var promiseIsh = {};
	Object.defineProperty(promiseIsh,"then",{
		get: function(){
			ObservationRecorder.add(this, "then");
		}
	});
	ObservationRecorder.start();
	observeReader.read(promiseIsh, observeReader.reads("prop"));
	var recordings = ObservationRecorder.stop();

	assert.equal( recordings.keyDependencies.size, 0, "no key recordings");
});
