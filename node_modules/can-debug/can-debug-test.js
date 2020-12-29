var QUnit = require("steal-qunit");
var makeDebug = require("can-debug");
var DefineMap = require("can-define/map/map");
var testHelpers = require("can-test-helpers");
var clone = require("steal-clone");

var debug = makeDebug();

QUnit.module("can-debug");

QUnit.test("exports an object", function(assert) {
	assert.equal(typeof debug, "object", "should set global namespace");
	assert.equal(typeof debug.logWhatChangesMe, "function");
	assert.equal(typeof debug.logWhatChangesMe, "function");
});

QUnit.test("sets can global namespace", function(assert) {
	assert.equal(typeof window.can, "object", "should set global namespace");
});

QUnit.test("sets itself on the global namespace", function(assert) {
	assert.equal(typeof can.debug, "object", "should set itself");
});

QUnit.test("binds automatically #33", function(assert) {
	var Person = DefineMap.extend("Person", {
		first: "string",
		last: "string",
		fullName: {
			get: function() {
				return this.first + " " + this.last;
			}
		}
	});

	var me = new Person({ first: "Simon", last: "Diaz" });
	var data = debug.getWhatChangesMe(me, "fullName");

	assert.ok(data.derive.length, "should return dependencies");
});

QUnit.test("calls canReflect bind symbols safely", function(assert) {
	assert.ok(debug.getWhatChangesMe({}) === null, "should not throw");
});

testHelpers.dev.devOnlyTest("calls window.__CANJS_DEVTOOLS__.register if available", function(assert) {
	var done = assert.async();

	var fakeWindow = {
		__CANJS_DEVTOOLS__: {
			register: function(can) {
				assert.ok("Observation" in can, "can.Observation passed");
				assert.ok("Reflect" in can, "can.Reflect passed");
				assert.ok("Symbol" in can, "can.Symbol passed");
				assert.ok("getGraph" in can, "can.getGraph passed");
				assert.ok("formatGraph" in can, "can.formatGraph passed");
				assert.ok("mergeDeep" in can, "can.mergeDeep passed");
				assert.ok("queues" in can, "can.queues passed");
				done();
			}
		}
	};

	clone({
		"can-globals": {
			default: {
				getKeyValue: function(key) {
					if (key === "global") {
						return fakeWindow;
					}
				}
			}
		}
	})
	.import("can-debug")
	.then(function(debug) {
		debug();
	});
});

testHelpers.dev.devOnlyTest("calls window.__CANJS_DEVTOOLS__.register if __CANJS_DEVTOOLS__ is set later", function(assert) {
	var done = assert.async();
	var fakeWindow = {};
	var fakeDevtoolsGlobal = {
		register: function(can) {
			assert.ok("Observation" in can, "can.Observation passed");
			assert.ok("Reflect" in can, "can.Reflect passed");
			assert.ok("Symbol" in can, "can.Symbol passed");
			assert.ok("getGraph" in can, "can.getGraph passed");
			assert.ok("formatGraph" in can, "can.formatGraph passed");
			assert.ok("mergeDeep" in can, "can.mergeDeep passed");
			assert.ok("queues" in can, "can.queues passed");

			assert.equal(fakeWindow.__CANJS_DEVTOOLS__, fakeDevtoolsGlobal, "sets window.__CANJS_DEVTOOLS__");

			done();
		}
	};

	clone({
		"can-globals": {
			default: {
				getKeyValue: function(key) {
					if (key === "global") {
						return fakeWindow;
					}
				}
			}
		}
	})
	.import("can-debug")
	.then(function(debug) {
		debug();
	})
	.then(function() {
		fakeWindow.__CANJS_DEVTOOLS__ = fakeDevtoolsGlobal;
	});
});
