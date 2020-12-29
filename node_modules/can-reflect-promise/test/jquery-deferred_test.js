var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var canReflectPromise = require("can-reflect-promise");
var $ = require("can-jquery");

QUnit.module("can-reflect-promise with jQuery.Deferred", {
	// $.Deferred isn't a prototype-enabled type, just an object
	//  that gets generated on demand, so no fancy setup is needed here.
});

QUnit.test("decorates promise", function(assert) {
	var d = $.Deferred();
	assert.ok(!d[canSymbol.for("can.getKeyValue")], "no decoration");

	canReflectPromise(d);
	assert.ok(d[canSymbol.for("can.getKeyValue")], "has decoration");
	assert.ok(d.hasOwnProperty(canSymbol.for("can.getKeyValue")), "decoration strictly on object");
	assert.ok(!Object.prototype[canSymbol.for("can.getKeyValue")], "decoration not on proto");

});

QUnit.test("has all necessary symbols", function(assert) {
	var d = new $.Deferred();
	canReflectPromise(d);
	assert.ok(d[canSymbol.for("can.getKeyValue")], "can.getKeyValue");
	assert.ok(d[canSymbol.for("can.getValue")], "can.getValue");
	assert.ok(d[canSymbol.for("can.onKeyValue")], "can.onKeyValue");
	assert.ok(d[canSymbol.for("can.offKeyValue")], "can.offKeyValue");
	assert.equal(d[canSymbol.for("can.isValueLike")], false, "can.isValueLike");

});

QUnit.test("getKeyValue for promise-specific values", function(assert) {
	assert.expect(8);
	var d = new $.Deferred();
	canReflectPromise(d);
	assert.equal(d[canSymbol.for("can.getKeyValue")]("isPending"), true, "isPending true in sync");
	assert.equal(d[canSymbol.for("can.getKeyValue")]("isResolved"), false, "isResolved false in sync");
	assert.equal(d[canSymbol.for("can.getKeyValue")]("value"), undefined, "no value in sync");
	assert.equal(d[canSymbol.for("can.getKeyValue")]("state"), "pending", "state pending in sync");
	var done = assert.async();

	d.resolve("a"); // in some jQuery versions, resolving is sync
	setTimeout(function() {
		assert.equal(d[canSymbol.for("can.getKeyValue")]("value"), "a", "value in async");
		assert.equal(d[canSymbol.for("can.getKeyValue")]("isPending"), false, "isPending false in async");
		assert.equal(d[canSymbol.for("can.getKeyValue")]("isResolved"), true, "isResolved true in async");
		assert.equal(d[canSymbol.for("can.getKeyValue")]("state"), "resolved", "state resolved in async");
		done();
	}, 10);
});

QUnit.test("onKeyValue for promise-specific values", function(assert) {
	assert.expect(3);
	var done = assert.async();
	var d = new $.Deferred();
	canReflectPromise(d);
	d[canSymbol.for("can.onKeyValue")]("value", function(newVal) {
		assert.equal(newVal, "a", "value updates on event");
	});
	d[canSymbol.for("can.onKeyValue")]("isResolved", function(newVal) {
		assert.equal(newVal, true, "isResolved updates on event");
	});
	d[canSymbol.for("can.onKeyValue")]("state", function(newVal) {
		assert.equal(newVal, "resolved", "state updates on event");
	});
	d.resolve("a");
	done();
});

QUnit.test("getKeyValue on $.Deferred().promise()", function(assert) {
	assert.expect(2);
	var d = new $.Deferred();
	canReflectPromise(d);
	assert.equal(d.promise()[canSymbol.for("can.getKeyValue")]("value"), undefined, "no value in sync");
	var done = assert.async();

	d.resolve("a"); // in some jQuery versions, resolving is sync
	setTimeout(function() {
		assert.equal(d.promise()[canSymbol.for("can.getKeyValue")]("value"), "a", "value in async");
		done();
	}, 10);
});
