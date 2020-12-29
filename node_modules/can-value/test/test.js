var QUnit = require("steal-qunit");
var canValue = require("../can-value");
var canReflect = require("can-reflect");
var canReflectDeps = require("can-reflect-dependencies");
var SimpleMap = require("can-simple-map");

var onlyDevTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

var supportsFunctionNames = (function() {
	var fn = function() {};
	return !!fn.name;
}());

QUnit.module('can-value');

QUnit.test("bind method works", function(assert) {
	var outer = new SimpleMap({inner: new SimpleMap({key: "hello"})});
	var observable = canValue.bind(outer, "inner.key");

	// Test getting the value
	assert.equal(canReflect.getValue(observable), "hello", "getting works");

	// Test setting the value
	canReflect.setValue(observable, "aloha");
	assert.equal(outer.get("inner").get('key'), "aloha", "setting works");
});

QUnit.test("from method works", function(assert) {
	var outer = {inner: {key: "hello"}};
	var observation = canValue.from(outer, "inner.key");

	// Test getting the value
	assert.equal(canReflect.getValue(observation), "hello", "getting works");

	// Setting the value shouldn’t work
	var errorThrown;
	try {
		canReflect.setValue(observation, "aloha");
	} catch (error) {
		errorThrown = error;
	}
	assert.ok(errorThrown instanceof Error, "setting doesn’t work");
});

if (supportsFunctionNames) {
	onlyDevTest("from method returns an observation with a helpful name", function(assert) {
		var outer = {inner: {key: "hello"}};
		var observation = canValue.from(outer, "inner.key");

		assert.equal(
				canReflect.getName(observation),
				"Observation<ValueFrom<Object{}.inner.key>>",
				"observation has the correct name"
		);
	});
}

onlyDevTest("from method observable has dependency data", function(assert) {
	var outer = new SimpleMap({inner: new SimpleMap({key: "hello"})});
	var observation = canValue.from(outer, "inner.key");

	// The observation returned by from() must be bound before it returns dependency data
	canReflect.onValue(observation, function() {});

	// Check the observation’s dependency data
	var observationDepData = canReflectDeps.getDependencyDataOf(observation);
	assert.deepEqual(
		observationDepData,
		{
			whatChangesMe: {
				derive: {
					keyDependencies: new Map([
						// the observation is changed by outer’s 'inner' property
						[outer, new Set(["inner"])],
						// the observation is changed by outer.inner’s 'key' property
						[outer.get("inner"), new Set(["key"])]
					])
				}
			}
		},
		"the observation has the correct mutation dependencies"
	);

	// Check outer.inner’s dependency data
	var innerDepData = canReflectDeps.getDependencyDataOf(outer, "inner");
	assert.deepEqual(
		innerDepData,
		{
			whatIChange: {
				derive: {
					// outer.inner changes the observation
					valueDependencies: new Set([observation])
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
			whatIChange: {
				derive: {
					// outer.inner.key changes the observation
					valueDependencies: new Set([observation])
				}
			}
		},
		"outer.inner.key has the correct mutation dependencies"
	);
});

QUnit.test("with method works", function(assert) {
	var observable = canValue.with(15);

	// Test getting the value
	assert.equal(canReflect.getValue(observable), 15, "getting works");

	// Test setting the value
	canReflect.setValue(observable, 22);
	assert.equal(canReflect.getValue(observable), 22, "setting works");
});

QUnit.test("returnedBy method works", function(assert) {
	var person = new SimpleMap({
		first: "Grace",
		last: "Murray"
	});
	var observable = canValue.returnedBy(function() {
		return person.get("first") + " " + person.get("last");
	});

	// Test getting the value
	assert.equal(canReflect.getValue(observable), "Grace Murray", "getting works");

	// Test setting the value
	person.set("last", "Hopper");
	assert.equal(canReflect.getValue(observable), "Grace Hopper", "setting works");
});

QUnit.test("returnedBy(getter(lastSet)) method works", function(assert) {
	var person = new SimpleMap({
		first: "Grace",
		last: "Murray"
	});
	var observable = canValue.returnedBy(function(lastSet) {
		return person.get("first") + lastSet + person.get("last");
	}, null, " ");

	// Test getting the value
	assert.equal(canReflect.getValue(observable), "Grace Murray", "getting works");

	// Test setting the value
	person.set("last", "Hopper");
	assert.equal(canReflect.getValue(observable), "Grace Hopper", "setting dep works");

	observable.value = " J ";

	assert.equal(observable.value, "Grace J Hopper", "setting works");

});

QUnit.test("to method works", function(assert) {
	var outer = {inner: {key: "hello"}};
	var setProp = canValue.to(outer, "inner.key");

	// Getting the value shouldn’t work; canReflect.getValue will return what you
	// passed to it if it can’t get the value
	assert.equal(canReflect.getValue(setProp), setProp, "getting the value doesn’t work");

	// Test setting the value
	canReflect.setValue(setProp, "aloha");
	assert.equal(outer.inner.key, "aloha", "setting works");
});

onlyDevTest("to method observable has dependency data", function(assert) {
	var outer = new SimpleMap({inner: new SimpleMap({key: "hello"})});
	var observable = canValue.to(outer, "inner.key");

	// The observation returned by to() must be bound before it returns dependency data
	canReflect.onValue(observable, function() {});

	// Check outer.inner’s dependency data
	var innerDepData = canReflectDeps.getDependencyDataOf(outer, "inner");
	assert.notOk(
		innerDepData,
		"outer.inner has no mutation dependencies"
	);

	// Check outer.inner.key’s dependency data
	var keyDepData = canReflectDeps.getDependencyDataOf(outer.get("inner"), "key");
	assert.deepEqual(
		keyDepData,
		{
			whatChangesMe: {
				mutate: {
					keyDependencies: new Map(),
					// outer.inner.key is changed by observable
					valueDependencies: new Set([observable])
				}
			}
		},
		"outer.inner.key has the correct mutation dependencies"
	);

	// Check observable’s dependency data
	var observableDepData = canReflectDeps.getDependencyDataOf(observable);
	assert.deepEqual(
		observableDepData,
		{
			whatIChange: {
				mutate: {
					keyDependencies: new Map([
						// observable changes outer.inner’s 'key' property
						[outer.get("inner"), new Set(["key"])]
					])
				}
			}
		},
		"observable has the correct mutation dependencies"
	);
});

QUnit.test("to method observable works when the keys change", function(assert) {
	var originalInner = new SimpleMap({key: "hello"});
	var outer = new SimpleMap({inner: originalInner});
	var observable = canValue.to(outer, "inner.key");

	// Change the value of a key along the path
	var newInner = new SimpleMap({key: "aloha"});
	outer.set("inner", newInner);

	// Test setting the value
	canReflect.setValue(observable, "ciao");
	assert.equal(newInner.get("key"), "ciao", "setting works after changing the inner object");
	assert.equal(originalInner.get("key"), "hello", "the original inner object is untouched");
});

onlyDevTest("to method observable works when the keys change - dependency data", function(assert) {
	var originalInner = new SimpleMap({key: "hello"});
	var outer = new SimpleMap({inner: originalInner});
	var observable = canValue.to(outer, "inner.key");

	// The observation returned by to() must be bound before it returns dependency data
	canReflect.onValue(observable, function() {});

	// Change the value of a key along the path
	var newInner = new SimpleMap({key: "aloha"});
	outer.set("inner", newInner);

	// Set the value
	canReflect.setValue(observable, "ciao");

	// Check outer.inner’s dependency data
	var innerDepData = canReflectDeps.getDependencyDataOf(outer, "inner");
	assert.notOk(
		innerDepData,
		"outer.inner has no mutation dependencies"
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
					keyDependencies: new Map(),
					// outer.inner.key is changed by observable
					valueDependencies: new Set([observable])
				}
			}
		},
		"outer.inner.key has the correct mutation dependencies"
	);

	// Check observable’s dependency data
	var observableDepData = canReflectDeps.getDependencyDataOf(observable);
	assert.deepEqual(
		observableDepData,
		{
			whatIChange: {
				mutate: {
					keyDependencies: new Map([
						// observable changes outer.inner’s 'key' property
						[newInner, new Set(["key"])]
					])
				}
			}
		},
		"observable has the correct mutation dependencies"
	);
});
