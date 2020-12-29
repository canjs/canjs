var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var SimpleObservable = require("can-simple-observable");
var canReflectDeps = require("./can-reflect-dependencies");

QUnit.module("can-reflect-dependencies: one to one");

var makeKeyDependencies = function makeKeyDependencies(key, value) {
	var keyDependencies = new Map();
	keyDependencies.set(key, new Set(value));
	return keyDependencies;
};

QUnit.test("value - value dependency", function(assert) {
	var one = new SimpleObservable("one");
	var two = new SimpleObservable("two");

	// canReflect.onValue(two, _ => one.set('three'));
	canReflectDeps.addMutatedBy(one, two);

	assert.deepEqual(canReflectDeps.getDependencyDataOf(one).whatChangesMe, {
		mutate: {
			valueDependencies: new Set([two])
		}
	});

	canReflectDeps.deleteMutatedBy(one, two);
	assert.equal(typeof canReflectDeps.getDependencyDataOf(one), "undefined");
});

QUnit.test("value - key dependency", function(assert) {
	var value = new SimpleObservable("one");
	var map = new SimpleMap({ foo: "foo" });

	var keyDependencies = makeKeyDependencies(map, ["foo"]);
	var mutator = { keyDependencies: keyDependencies };

	// map.on('foo', _ => value.set('two'));
	canReflectDeps.addMutatedBy(value, mutator);

	var res = canReflectDeps.getDependencyDataOf(value).whatChangesMe;
	assert.deepEqual(res.mutate.keyDependencies, keyDependencies);

	canReflectDeps.deleteMutatedBy(value, mutator);
	assert.equal(typeof canReflectDeps.getDependencyDataOf(value), "undefined");
});

QUnit.test("key - value dependency", function(assert) {
	var one = new SimpleObservable("one");
	var map = new SimpleMap({ foo: "foo" });

	// canReflect.onValue(value, _ => map.foo = 'bar');
	canReflectDeps.addMutatedBy(map, "foo", one);

	assert.equal(
		typeof canReflectDeps.getDependencyDataOf(map),
		"undefined",
		"has no value dependencies"
	);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(map, "foo")
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([one])
	);

	canReflectDeps.deleteMutatedBy(map, "foo", one);
	assert.equal(
		typeof canReflectDeps.getDependencyDataOf(map, "foo"),
		"undefined"
	);
});

QUnit.module("can-reflect-dependencies: one to many");

QUnit.test("value - key & value dependencies", function(assert) {
	var value = new SimpleObservable("value");

	var map = new SimpleMap({ foo: "foo" });
	var one = new SimpleObservable("one");

	var keyDependencies = makeKeyDependencies(map, ["foo"]);
	var valueDependencies = new Set();
	valueDependencies.add(one);
	var mutator = {
		keyDependencies: keyDependencies,
		valueDependencies: valueDependencies
	};

	// canReflect.onValue(one, _ => value.set('qux'))
	// canReflect.onKeyValue(map, 'foo', _ => value.set('bar'))
	canReflectDeps.addMutatedBy(value, mutator);

	var res = canReflectDeps.getDependencyDataOf(value).whatChangesMe;
	var expected = new Set();
	expected.add(one);
	assert.deepEqual(res.mutate.valueDependencies, expected);
	assert.deepEqual(res.mutate.keyDependencies, keyDependencies);

	canReflectDeps.deleteMutatedBy(value, mutator);
	assert.equal(typeof canReflectDeps.getDependencyDataOf(value), "undefined");
});

QUnit.test("key - key & value dependencies", function(assert) {
	var map = new SimpleMap({ foo: "foo" });

	var one = new SimpleObservable("one");
	var map2 = new SimpleMap({ bar: "bar" });

	var keyDependencies = makeKeyDependencies(map2, ["bar"]);
	var mutator = {
		keyDependencies: keyDependencies,
		valueDependencies: new Set([one])
	};

	// canReflect.onValue(one, _ => map.foo = 'baz')
	// canReflect.onKeyValue(map2, 'bar', _ => map.foo = 'qux')
	canReflectDeps.addMutatedBy(map, "foo", mutator);

	var expectedKeyMap = new Map();
	expectedKeyMap.set(map2, new Set(["bar"]));

	var res = canReflectDeps.getDependencyDataOf(map, "foo").whatChangesMe;
	assert.deepEqual(res.mutate.valueDependencies, new Set([one]));
	assert.deepEqual(res.mutate.keyDependencies, expectedKeyMap);

	canReflectDeps.deleteMutatedBy(map, "foo", mutator);
	assert.equal(
		typeof canReflectDeps.getDependencyDataOf(map, "foo"),
		"undefined"
	);
});

QUnit.test("key - two value dependencies (#15)", function(assert) {
	var source = new SimpleMap({
		key: "keyValue"
	});
	var one = new SimpleObservable("one");
	var two = new SimpleObservable("two");

	// canReflect.onValue(one, _ => source.set('key', 'three'));
	canReflectDeps.addMutatedBy(source, "key", one);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(source, "key")
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([ one ]),
		"key -> Set([ one ])"
	);

	// canReflect.onValue(two, _ => source.set('key', 'four'));
	canReflectDeps.addMutatedBy(source, "key", two);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(source, "key")
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([ one, two ]),
		"key -> Set([ one, two ])"
	);

	canReflectDeps.deleteMutatedBy(source, "key", one);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(source, "key")
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([ two ]),
		"key -> Set([ two ])"
	);

	canReflectDeps.deleteMutatedBy(source, "key", two);
	assert.equal(typeof canReflectDeps.getDependencyDataOf(source), "undefined");
});
