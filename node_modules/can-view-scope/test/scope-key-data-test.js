var Scope = require('can-view-scope');
var SimpleMap = require('can-simple-map');
var QUnit = require('steal-qunit');
var canSymbol = require("can-symbol");
var canReflect = require('can-reflect');
var SimpleObservable = require('can-simple-observable');
var Observation = require("can-observation");
var ObservationRecorder = require("can-observation-recorder");
var testHelpers = require('can-test-helpers');

QUnit.module('can-view-scope scope-key-data');

QUnit.test("able to scope-key-data this", function(assert) {
	var value = new SimpleObservable(1);
	var scope = new Scope(value);
	var thisObservable = scope.computeData("this");
	thisObservable.on(function(){});

	assert.equal( canReflect.getValue(thisObservable), 1);

	canReflect.setValue(thisObservable,2);
});


QUnit.test("ScopeKeyData's thisArg is observable", function(assert) {
	var doSomething = function(){
		return this.value;
	};
	var context = new SimpleMap({
		foo: {
			doSomething: doSomething,
			value: "A"
		}
	});
	var res = new Scope(context).computeData("this.foo@doSomething",{proxyMethods: false});

	// This is basically what CallExpression does:
	var obs = new Observation(function(){
		var func = canReflect.getValue(res);
		return func.call(res.thisArg);
	});

	canReflect.onValue(obs, function(value){
		assert.equal(value, "B");
	});

	context.set("foo",{
		doSomething: doSomething,
		value: "B"
	});
});

QUnit.test("reading ScopeKeyData will update underlying observable", function(assert) {
	var context = new SimpleMap({
		"prop" :"value"
	});

	var prop = new Scope(context).computeData("this.prop",{proxyMethods: false});

	canReflect.onValue(prop, function(){});

	context.on("prop", function(){

		assert.equal(canReflect.getValue(prop), "VALUE", "able to read fastPath value");
	},"notify");

	context.set("prop", "VALUE");


	var root = new SimpleObservable("value");
	var observation = new Observation(function(){
		return root.value;
	});

	context = {
		"prop" : observation
	};

	prop = new Scope(context).computeData("this.prop",{proxyMethods: false});

	canReflect.onValue(prop, function(){});


	canReflect.onValue(root, function(){

		assert.equal(canReflect.getValue(prop), "VALUE", "able to read deep, non-fast-path value");
	},"notify");

	root.value = "VALUE";
});


QUnit.test("able to read from primitives (#197)", function(assert) {
	var map = new SimpleMap({
		someProperty: "hello"
	});
	var scope = new Scope(map);
	var scopeKeyData = scope.computeData("someProperty@split");

	// the problem was adding a string as a mutated dependency
	canReflect.onValue(scopeKeyData, function(){});

	assert.ok(true,"does not error");
});

QUnit.test("initialValue should not emit ObservationRecords (#198)", function(assert) {
	var map = new SimpleMap({
		someProperty: "hello"
	});
	var scope = new Scope(map);
	var scopeKeyData = scope.computeData("someProperty");

	ObservationRecorder.start();
	assert.equal(scopeKeyData.initialValue, "hello");
	var records = ObservationRecorder.stop();
	assert.equal(records.valueDependencies.size, 0, "no value deps");
});

QUnit.test("Implements can.setElement", function(assert) {
	var observation = new Observation(function(){
		return "test";
	});
	var map = new SimpleMap({
		someProp: observation
	});
	var scope = new Scope(map);
	var scopeKeyData = scope.computeData("someProp");
	scopeKeyData[canSymbol.for("can.setElement")](document.createElement("div"));
	assert.ok(true, "ScopeKeyData has can.setElement");
});

testHelpers.dev.devOnlyTest("Warn when key is not found and log the value of the last property that can be read #206", function(assert) {
	var teardown = testHelpers.dev.willWarn(/Unable to find key "foo.length". Found "foo" with value: %o/, function(message, matched) {
		assert.ok(matched, "warning displayed");
	});
	
	var context = {
		foo: true
	};

	var scope = new Scope(context);

	var scopeKeyData = scope.computeData("foo.length", {
		warnOnMissingKey: true
	});

	scopeKeyData.read();
	teardown();
});

testHelpers.dev.devOnlyTest("Warn when key is not defined #206", function(assert) {
	var teardown = testHelpers.dev.willWarn('Unable to find key "foo.length".', function(message, matched) {
		assert.ok(matched, "warning is not displayed");
	});

	var scope = new Scope({});

	var scopeKeyData = scope.computeData("foo.length", {
		warnOnMissingKey: true
	});

	scopeKeyData.read();
	teardown();
});
