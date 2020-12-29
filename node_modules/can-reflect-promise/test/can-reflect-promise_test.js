var QUnit = require("steal-qunit");
var GLOBAL = require("can-globals/global/global");
var canSymbol = require("can-symbol");
var canReflectPromise = require("can-reflect-promise");
var ObservationRecorder = require("can-observation-recorder");
var testHelpers = require("can-test-helpers");

var nativePromise = GLOBAL().Promise;
var Promise;

QUnit.module("can-reflect-promise", {
	beforeEach: function(assert) {
		// Make a temporary Promise subclass per suite, so that we can test before vs. after decoration
		//  in an isolated fashion
		function tempPromise() {
			if("Reflect" in GLOBAL() && typeof GLOBAL().Reflect.construct === "function") {
				// Must use ES6 Reflect in some environments where Promise is implemented
				//  as a non-callable ES6 class.
				return GLOBAL().Reflect.construct(nativePromise, arguments, tempPromise);
			} else {
				// If no Reflect in platform, assume ES5 is good.
				nativePromise.apply(this, arguments);
				return this;
			}
		}

		["resolve", "reject"].forEach(function(key) {
			if(~nativePromise[key].toString().indexOf("[native code]")) {
				// This works fine for platform native promises that know to return "new this" when constructing
				tempPromise[key] = nativePromise[key];
			} else {
				// Steal's promises aren't that smart, though.
				tempPromise[key] = new Function("value", "return new this(function(resolve, reject) { " + key + "(value); });");
			}
		});

		var protoDefs = {};
		protoDefs[canSymbol.for("can.observeData")] = {
			value: null,
			writable: true,
			configurable: true
		};
		protoDefs[canSymbol.for("can.getKeyValue")] = {
			value: null,
			writable: true,
			configurable: true
		};

		tempPromise.prototype = Object.create(nativePromise.prototype, protoDefs);

		Promise = tempPromise;
	},
	afterEach: function(assert) {
		Promise = null;
	}
});

QUnit.test("decorates promise", function(assert) {
	assert.ok(!Promise.prototype[canSymbol.for("can.getKeyValue")], "no decoration");

	canReflectPromise(new Promise(function() {}));
	assert.ok(Promise.prototype[canSymbol.for("can.getKeyValue")], "has decoration");

});

QUnit.test("has all necessary symbols", function(assert) {
	var p = new Promise(function() {});
	canReflectPromise(p);
	assert.ok(p[canSymbol.for("can.getKeyValue")], "can.getKeyValue");
	assert.ok(p[canSymbol.for("can.getValue")], "can.getValue");
	assert.ok(p[canSymbol.for("can.onKeyValue")], "can.onKeyValue");
	assert.ok(p[canSymbol.for("can.offKeyValue")], "can.offKeyValue");
	assert.equal(p[canSymbol.for("can.isValueLike")], false, "can.isValueLike");

});

QUnit.test("getKeyValue for promise-specific values", function(assert) {
	assert.expect(8);
	var p = Promise.resolve("a");
	canReflectPromise(p);
	assert.equal(p[canSymbol.for("can.getKeyValue")]("isPending"), true, "isPending true in sync");
	assert.equal(p[canSymbol.for("can.getKeyValue")]("isResolved"), false, "isResolved false in sync");
	assert.equal(p[canSymbol.for("can.getKeyValue")]("value"), undefined, "no value in sync");
	assert.equal(p[canSymbol.for("can.getKeyValue")]("state"), "pending", "state pending in sync");
	var done = assert.async();

	setTimeout(function() {
		assert.equal(p[canSymbol.for("can.getKeyValue")]("value"), "a", "value in async");
		assert.equal(p[canSymbol.for("can.getKeyValue")]("isPending"), false, "isPending false in async");
		assert.equal(p[canSymbol.for("can.getKeyValue")]("isResolved"), true, "isResolved true in async");
		assert.equal(p[canSymbol.for("can.getKeyValue")]("state"), "resolved", "state resolved in async");
		done();
	}, 30);
});

QUnit.test("computable", function(assert) {
	assert.expect(4);
	var done = assert.async();
	var p = Promise.resolve("a");
	canReflectPromise(p);
	ObservationRecorder.start();
	p[canSymbol.for("can.getKeyValue")]("value")
	var deps = ObservationRecorder.stop();
	assert.ok(deps.keyDependencies.has(p), "has the key dep");

	p[canSymbol.for("can.onKeyValue")]("value", function(newVal) {
		assert.equal(newVal, "a", "value updates on event");
	});
	p[canSymbol.for("can.onKeyValue")]("isResolved", function(newVal) {
		assert.equal(newVal, true, "isResolved updates on event");
	});
	p[canSymbol.for("can.onKeyValue")]("state", function(newVal) {
		assert.equal(newVal, "resolved", "state updates on event");
	});
	done();
});

testHelpers.dev.devOnlyTest("promise readers throw errors (#70)", function (assert) {
	var teardown = testHelpers.dev.willError(/Rejected Reason/);

	var promise = Promise.reject("Rejected Reason");

	canReflectPromise(promise);

	// trigger initPromise
	promise[canSymbol.for("can.onKeyValue")]("value", function() {});

	var done = assert.async();
	promise.catch(function() {
		assert.equal(teardown(), 1, 'error thrown');
		done();
	});
});

QUnit.test("hasOwnKey for promise value (#25)", function(assert) {
	var p = new Promise(function() {});
	canReflectPromise(p);
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("isPending"), true, "isPending is a key");
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("isResolved"), true, "isResolved is a key");
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("isRejected"), true, "isRejected is a key");
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("value"), true, "value is a key");
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("state"), true, "state is a key");
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("reason"), true, "reason is a key");
	assert.equal(p[canSymbol.for("can.hasOwnKey")]("foo"), false, "foo is not a key");
})

