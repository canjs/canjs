var steal = require("@steal");
var QUnit = require("steal-qunit");
var valueEventBindings = require("./value");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var onlyDevTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

QUnit.module("can-event-queue/value", {
	beforeEach: function() {},
	afterEach: function() {}
});

QUnit.test("basics", function(assert) {
	var observable = valueEventBindings({});
	var values = [];

	canReflect.onValue(observable, function(newVal, oldVal) {
		values.push(["onValue", newVal, oldVal]);
	});

	observable.on(function(newVal, oldVal) {
		values.push(["on", newVal, oldVal]);
	}, "notify");

	observable[canSymbol.for("can.dispatch")](1, 2);

	assert.deepEqual(
		values,
		[["on", 1, 2], ["onValue", 1, 2]],
		"dispatched worked"
	);
});

QUnit.test("onBound and onUnbound called", function(assert) {
	assert.expect(2);
	var obj = valueEventBindings({
		onBound: function(){
			assert.ok(true,"setup called");
		},
		onUnbound: function(){
			assert.ok(true,"teardown called");
		}
	});
	var handler = function(){};

	obj.on(handler);
	obj.off(handler);
});

onlyDevTest("getWhatIChange", function(assert) {
	var getChangesSymbol = canSymbol.for("can.getChangesDependencyRecord");
	var observable = valueEventBindings({});

	var getWhatIChange = observable[canSymbol.for("can.getWhatIChange")].bind(
		observable
	);

	assert.equal(
		typeof getWhatIChange(),
		"undefined",
		"should return undefined if handlers is empty"
	);

	var getChanges = function(values) {
		return function() {
			return { valueDependencies: new Set(values) };
		};
	};

	var mutateHandler = function mutateHandler() {};
	var domQueueHandler = function domHandler() {};
	var domUIHandler = function domUIHandler() {};
	var notifyHandler = function notifyHandler() {};

	// faux observables to set as being changed by the handlers in the queues
	var a = function a() {};
	var b = function b() {};
	var c = function c() {};

	mutateHandler[getChangesSymbol] = getChanges([a]);
	domUIHandler[getChangesSymbol] = getChanges([b]);
	notifyHandler[getChangesSymbol] = getChanges([a]);
	domQueueHandler[getChangesSymbol] = getChanges([c]);
	domQueueHandler[canSymbol.for("can.element")] = document.createElement("div");

	observable.handlers.add(["mutate", mutateHandler]);
	observable.handlers.add(["domUI", domUIHandler]);
	observable.handlers.add(["notify", notifyHandler]);
	observable.handlers.add(["dom", domQueueHandler]);

	var whatIChange = getWhatIChange();
	assert.deepEqual(
		whatIChange.mutate,
		{ valueDependencies: new Set([a, b, c]) },
		"domUI and mutate queues handlers deps should be included in .mutate"
	);
	assert.deepEqual(
		whatIChange.derive,
		{ valueDependencies: new Set([a]) },
		"notify queue handlers deps should be included in .derive"
	);
});

QUnit.test("isBound is correct", function(assert) {
	assert.expect(2);
	var isBoundSymbol = canSymbol.for("can.isBound");

	var obj = valueEventBindings({});
	var handler = function(){};

	obj.on(handler);
	assert.equal(obj[isBoundSymbol](), true, "isBound true");

	obj.off(handler);
	assert.equal(obj[isBoundSymbol](), false, "isBound false");
});
