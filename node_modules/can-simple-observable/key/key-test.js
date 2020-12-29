var QUnit = require("steal-qunit");
var keyObservable = require("./key");
var canReflect = require("can-reflect");
var canReflectDeps = require("can-reflect-dependencies");
var SimpleMap = require("can-simple-map");

var onlyDevTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

var supportsFunctionNames = (function() {
	var fn = function() {};
	return !!fn.name;
 }());

QUnit.module("can-simple-observable/key");

QUnit.test("basics", function(assert) {
	var outer = {inner: {key: "hello"}};
	var observable = keyObservable(outer, "inner.key");

	// Unbound and unobserved behavior
	assert.equal(canReflect.getValue(observable), "hello", "getValue unbound");

	canReflect.setValue(observable, "aloha");
	assert.equal(canReflect.getValue(outer).inner.key, "aloha", "value set");
	assert.equal(canReflect.getValue(observable), "aloha", "getValue unbound");
});

QUnit.test("value property is a getter and setter", function(assert) {
	var outer = {inner: {key: "hello"}};
	var observable = keyObservable(outer, "inner.key");

	// Check getting the value
	assert.equal(observable.value, "hello", "value getter works");

	// Check setting the value
	observable.value = "aloha";
	assert.equal(canReflect.getValue(outer).inner.key, "aloha", "value setter sets other object");
	assert.equal(canReflect.getValue(observable), "aloha", "value getter works after set");
});

QUnit.test("get and set Priority", function(assert) {
	var outer = {inner: {key: "hello"}};
	var observable = keyObservable(outer, "inner.key");

	canReflect.setPriority(observable, 5);
	assert.equal(canReflect.getPriority(observable), 5, "set priority");
});

if (supportsFunctionNames) {
	onlyDevTest("observable has a helpful name", function(assert) {
		var outer = {inner: {key: "hello"}};
		var observable = keyObservable(outer, "inner.key");
		assert.equal(
			canReflect.getName(observable),
			"keyObservable<Object{}.inner.key>",
			"observable has the correct name"
		);
	});
}

onlyDevTest("dependency data", function(assert) {
	var outer = new SimpleMap({inner: new SimpleMap({key: "hello"})});
	var observable = keyObservable(outer, "inner.key");

	// The observable must be bound before it returns dependency data
	canReflect.onValue(observable, function() {});

	// Check the observable’s dependency data
	var observableDepData = canReflectDeps.getDependencyDataOf(observable);
	assert.deepEqual(
		observableDepData,
		{
			whatChangesMe: {
				derive: {
					keyDependencies: new Map([
						// the observable is changed by outer’s 'inner' property
						[outer, new Set(["inner"])],
						// the observable is changed by outer.inner’s 'key' property
						[outer.get("inner"), new Set(["key"])]
					])
				}
			},
			whatIChange: {
				mutate: {
					keyDependencies: new Map([
						// the observable changes outer.inner’s 'key' property
						[outer.get("inner"), new Set(["key"])]
					])
				}
			}
		},
		"the observable has the correct mutation dependencies"
	);

	// Check outer.inner’s dependency data
	var innerDepData = canReflectDeps.getDependencyDataOf(outer, "inner");
	assert.deepEqual(
		innerDepData,
		{
			whatIChange: {
				derive: {
					// outer.inner changes the observable
					valueDependencies: new Set([observable])
				}
			}
		},
		"outer.inner has the correct mutation dependencies"
	);

	// Check outer.inner.key’s dependency data
	var keyDepData = canReflectDeps.getDependencyDataOf(outer.get("inner"), "key");
	assert.deepEqual(
		keyDepData,
		{
			whatChangesMe: {
				mutate: {
					// outer.inner.key has zero mutate.keyDependencies
					keyDependencies: new Map(),
					// outer.inner.key is changed by the observable
					valueDependencies: new Set([observable])
				}
			},
			whatIChange: {
				derive: {
					// outer.inner.key changes the observable
					valueDependencies: new Set([observable])
				}
			}
		},
		"outer.inner.key has the correct mutation dependencies"
	);

});

QUnit.test("works when the keys change", function(assert) {
	var originalInner = new SimpleMap({key: "hello"});
	var outer = new SimpleMap({inner: originalInner});
	var observable = keyObservable(outer, "inner.key");

	// Test initial value
	assert.equal(canReflect.getValue(observable), "hello", "initial value is correct");

	// Change the value of a key along the path
	var newInner = new SimpleMap({key: "aloha"});
	outer.set("inner", newInner);

	// Check that the observable has the new value
	assert.equal(canReflect.getValue(observable), "aloha", "observable updated");
});

onlyDevTest("works when the keys change - dependency data", function(assert) {
	var originalInner = new SimpleMap({key: "hello"});
	var outer = new SimpleMap({inner: originalInner});
	var observable = keyObservable(outer, "inner.key");

	// The observable must be bound before it returns dependency data
	canReflect.onValue(observable, function() {});

	// Change the value of a key along the path
	var newInner = new SimpleMap({key: "aloha"});
	outer.set("inner", newInner);

	// Check the observable’s dependency data
	var observableDepData = canReflectDeps.getDependencyDataOf(observable);
	assert.deepEqual(
		observableDepData,
		{
			whatChangesMe: {
				derive: {
					keyDependencies: new Map([
						// the observable is changed by outer’s 'inner' property
						[outer, new Set(["inner"])],
						// the observable is changed by outer.inner’s 'key' property
						[newInner, new Set(["key"])]
					])
				}
			},
			whatIChange: {
				mutate: {
					keyDependencies: new Map([
						// the observable changes outer.inner’s 'key' property
						[newInner, new Set(["key"])]
					])
				}
			}
		},
		"the observable has the correct mutation dependencies"
	);

	// Check outer.inner’s dependency data
	var innerDepData = canReflectDeps.getDependencyDataOf(outer, "inner");
	assert.deepEqual(
		innerDepData,
		{
			whatIChange: {
				derive: {
					// outer.inner changes the observable
					valueDependencies: new Set([observable])
				}
			}
		},
		"outer.inner has the correct mutation dependencies"
	);

	// Check the original outer.inner.key’s dependency data
	var originalKeyDepData = canReflectDeps.getDependencyDataOf(originalInner, "key");
	assert.notOk(
		originalKeyDepData,
		"original outer.inner.key no longer has any dependencies"
	);

	// Check the new outer.inner.key’s dependency data
	var newKeyDepData = canReflectDeps.getDependencyDataOf(newInner, "key");
	assert.deepEqual(
		newKeyDepData,
		{
			whatChangesMe: {
				mutate: {
					// outer.inner.key has zero mutate.keyDependencies
					keyDependencies: new Map(),
					// outer.inner.key is changed by the observable
					valueDependencies: new Set([observable])
				}
			},
			whatIChange: {
				derive: {
					// outer.inner.key changes the observable
					valueDependencies: new Set([observable])
				}
			}
		},
		"new outer.inner.key has the correct mutation dependencies"
	);
});
