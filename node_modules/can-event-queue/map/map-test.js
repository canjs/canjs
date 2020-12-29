var QUnit = require('steal-qunit');
var eventQueue = require("./map");
var queues = require("can-queues");
var domEvents = require("can-dom-events");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");

var onlyDevTest = steal.isEnv("production") ? QUnit.skip : QUnit.test;

QUnit.module('can-event-queue/map',{
	beforeEach: function(assert) { },
	afterEach: function(assert) { }
});

QUnit.test("basics", function(assert) {
	var collecting;
	var secondFired = false;
	var obj = eventQueue({});

	obj.on("first", function(ev, arg1, arg2){

		assert.equal(arg1, 1, "first arg");
		assert.equal(arg2, 2, "second arg");

		assert.ok(!collecting, "not collecting b/c we're not in a batch yet");

		obj.dispatch("second");

		// collecting = canBatch.collecting();
		//assert.ok(collecting, "forced a batch");
		assert.equal(secondFired, false, "don't fire yet, put in next batch");

	});


	obj.on("second", function(ev){
		secondFired = true;
		assert.ok(ev.batchNum, "got a batch number");
	});


	queues.batch.start();
	obj.dispatch("first",[1,2]);
	queues.batch.stop();

});

QUnit.test("Everything is part of a batch", function(assert) {
	var obj = eventQueue({});

	obj.on("foo", function(ev){
		assert.ok(ev.batchNum); // There is a batch number
	});

	obj.dispatch("foo");
});

QUnit.test("flushing works (#18)", function(assert) {
	assert.expect(3);
	var firstFired, secondFired, thirdFired;
	var obj = eventQueue({});

	obj.on("first", function(){
		eventQueue.flush();
		assert.ok(firstFired, "first fired");
		assert.ok(secondFired, "second fired");
		assert.ok(thirdFired, "third fired");
	});
	obj.on("first", function(){
		firstFired = true;
	});
	obj.on("second", function(){
		secondFired = true;
	});
	obj.on("third", function(){
		thirdFired = true;
	});
	queues.batch.start();
	obj.dispatch("first");
	obj.dispatch("second");
	obj.dispatch("third");
	queues.batch.stop();

});

// The problem with the way atm is doing it ...
// the batch is ended ... but it doesn't pick up the next item in the queue and process it.
QUnit.test("flushing a future batch (#18)", function(assert) {
	assert.expect(3);
	var firstFired, secondFired, thirdFired;
	var obj = eventQueue({});

	obj.on("first", function(){
		queues.batch.start();
		obj.dispatch("second");
		obj.dispatch("third");
		queues.batch.stop();

		eventQueue.flush();
		assert.ok(firstFired, "first fired");
		assert.ok(secondFired, "second fired");
		assert.ok(thirdFired, "third fired");
	});
	obj.on("first", function(){
		firstFired = true;
	});
	obj.on("second", function(){
		secondFired = true;
	});
	obj.on("third", function(){
		thirdFired = true;
	});
	queues.batch.start();
	obj.dispatch("first");
	queues.batch.stop();

});

if(typeof document !== "undefined") {
	QUnit.test("can listen to DOM events",function(assert) {
		assert.expect(1);
		var el = document.createElement("div");
		document.querySelector('#qunit-fixture').appendChild(el);
		var handler = function(){
			assert.ok(true, "click dispatched");
		};
		eventQueue.on.call(el,"click", handler);
		domEvents.dispatch(el, "click");
		eventQueue.off.call(el,"click", handler);
		domEvents.dispatch(el, "click");
	});
}

QUnit.test("handler-less unbind", function(assert) {
	var obj = eventQueue({});

	obj.addEventListener("first", function(){});
	obj.addEventListener("first", function(){},"notify");

	var handlers = obj[canSymbol.for("can.meta")].handlers;
	assert.equal(handlers.get(["first"]).length, 2, "2 first handlers");
	obj.removeEventListener("first");
	assert.equal(handlers.get(["first"]).length, 0, "first handlers removed");
});
QUnit.test("key-less unbind", function(assert) {
	var obj = eventQueue({});

	obj.addEventListener("first", function(){});
	obj.addEventListener("first", function(){},"notify");
	obj.addEventListener("second", function(){});
	obj.addEventListener("second", function(){},"notify");

	canReflect.onKeyValue(obj,"first", function(){});
	canReflect.onKeyValue(obj,"first", function(){},"notify");
	canReflect.onKeyValue(obj,"second", function(){});
	canReflect.onKeyValue(obj,"second", function(){},"notify");

	var handlers = obj[canSymbol.for("can.meta")].handlers;
	assert.equal(handlers.get([]).length, 8, "2 first handlers");
	obj.removeEventListener();
	assert.equal(handlers.get([]).length, 4, "first handlers removed");
});

QUnit.test("@@can.isBound symbol", function(assert) {
	var obj = eventQueue({});
	var handler = function() {};

	assert.ok(!obj[canSymbol.for("can.isBound")](), "Object is not bound initially");

	obj.on("first", handler);
	assert.ok(obj[canSymbol.for("can.isBound")](), "Object is bound after adding listener");

	obj.off("first", handler);
	assert.ok(!obj[canSymbol.for("can.isBound")](), "Object is not bound after removing listener");
});




QUnit.test('listenTo and stopListening', function(assert) {
	assert.expect(9);
	var parent = eventQueue({});
	var child1 = eventQueue({});
	var child2 = eventQueue({});
	var change1WithId = 0;

	parent.listenTo(child1, 'change', function () {
		change1WithId++;
		if (change1WithId === 1) {
			assert.ok(true, 'child 1 handler with id called');
		} else {
			assert.ok(false, 'child 1 handler with id should only be called once');
		}
	});

	child1.bind('change', function () {
		assert.ok(true, 'child 1 handler without id called');
	});
	var foo1WidthId = 0;
	parent.listenTo(child1, 'foo', function () {
		foo1WidthId++;
		if (foo1WidthId === 1) {
			assert.ok(true, 'child 1 foo handler with id called');
		} else {
			assert.ok(false, 'child 1 foo handler should not be called twice');
		}
	});
	// child2 stuff
	(function () {
		var okToCall = true;
		parent.listenTo(child2, 'change', function () {
			assert.ok(okToCall, 'child 2 handler with id called');
			okToCall = false;
		});
	}());
	child2.bind('change', function () {
		assert.ok(true, 'child 2 handler without id called');
	});
	parent.listenTo(child2, 'foo', function () {
		assert.ok(true, 'child 2 foo handler with id called');
	});


	eventQueue.dispatch.call(child1, 'change');
	eventQueue.dispatch.call(child1, 'foo');
	eventQueue.dispatch.call(child2, 'change');
	eventQueue.dispatch.call(child2, 'foo');

	parent.stopListening(child1);
	parent.stopListening(child2, 'change');
	eventQueue.dispatch.call(child1, 'change');
	eventQueue.dispatch.call(child1, 'foo');
	eventQueue.dispatch.call(child2, 'change');
	eventQueue.dispatch.call(child2, 'foo');
});
QUnit.test('stopListening on something you\'ve never listened to ', function(assert) {
	var parent = eventQueue({});
	var child = eventQueue({});
	parent.listenTo({
		addEventListener: function(){}
	}, 'foo');
	parent.stopListening(child, 'change');
	assert.ok(true, 'did not error');
});

QUnit.test('One will listen to an event once, then unbind', function(assert) {
	var mixin = 0;

	// Mixin call
	var obj = eventQueue({});
	obj.one('mixin', function() {
		mixin++;
	});

	obj.dispatch('mixin');
	obj.dispatch('mixin');
	obj.dispatch('mixin');
	assert.equal(mixin, 1, 'one should only fire a handler once (mixin)');

});

onlyDevTest("getWhatIChange", function(assert) {
	var observable = eventQueue({});

	var getWhatIChange = observable[canSymbol.for("can.getWhatIChange")].bind(
		observable
	);

	assert.equal(
		typeof getWhatIChange(),
		"undefined",
		"should return undefined if handlers is empty"
	);

	var getChanges = function(value) {
		return function() {
			return { valueDependencies: new Set([value]) };
		};
	};

	var mutateHandler = function mutateHandler() {};
	var domUIHandler = function domUIHandler() {};
	var notifyHandler = function notifyHandler() {};

	// faux observables to set as being changed by the handlers in the queues
	var a = function a() {};
	var b = function b() {};

	var getChangesSymbol = canSymbol.for("can.getChangesDependencyRecord");
	mutateHandler[getChangesSymbol] = getChanges(a);
	domUIHandler[getChangesSymbol] = getChanges(b);
	notifyHandler[getChangesSymbol] = getChanges(a);

	// should take into account both legacy and onKeyValue handlers
	observable.addEventListener("first", mutateHandler);
	canReflect.onKeyValue(observable, "first", domUIHandler, "domUI");
	canReflect.onKeyValue(observable, "first", notifyHandler, "notify");

	var whatIChange = getWhatIChange("first");
	assert.deepEqual(
		whatIChange.mutate,
		{ valueDependencies: new Set([a, b]) },
		"domUI and mutate queues handlers deps should be included in .mutate"
	);
	assert.deepEqual(
		whatIChange.derive,
		{ valueDependencies: new Set([a]) },
		"notify queue handlers deps should be included in .derive"
	);
});

QUnit.test('One will listen to an event once, then unbind', function(assert) {
	assert.expect(0);
	var mixin = 0;

	// Mixin call
	var obj1 = eventQueue({}),
		obj2 = eventQueue({});

	obj1.listenTo(obj2,"foo", function(){
		assert.ok(false, "this handler should not be called");
	});

	obj1.stopListening();


	obj2.dispatch("foo");

});

QUnit.test("unbind undefined with stopListening and onValue", function(assert) {
	var HANDLER = function(){};
	var value = canReflect.assignSymbols({},{
		"can.onValue": function(handler){
			assert.equal(handler, HANDLER, "handler onValue")
		},
		"can.offValue": function(handler){
			assert.equal(handler, HANDLER, "handler offValue")
		}
	});

	var obj = eventQueue({});

	obj.listenTo(value, HANDLER);
	obj.stopListening();

});

QUnit.test("stopListeningArgumentsToKeys", function(assert) {
	var getKeys = eventQueue.stopListeningArgumentsToKeys;
	var obj = {};
	var that = {context: obj, defaultQueue: "mutate"};
	var obj2 = {};
	var handler = function(){};

	assert.deepEqual( getKeys.call(that), [], "obj.stopListening()");
	assert.deepEqual( getKeys.call(that, obj2), [obj2], "obj.stopListening(obj2)");

	assert.deepEqual( getKeys.call(that,"event"), [obj, "event"], "obj.stopListening('event')");
	assert.deepEqual( getKeys.call(that,"event", handler), [obj, "event", "mutate", handler], "obj.stopListening('event', handler)");
	assert.deepEqual( getKeys.call(that,"event", handler, "notify"), [obj, "event", "notify", handler], "obj.stopListening('event', handler,'notify')");

	assert.deepEqual( getKeys.call(that, obj2, handler), [obj2, undefined, "mutate", handler], "obj.stopListening(obj2, handler)");

	assert.deepEqual( getKeys.call(that, obj2, handler, "notify"), [obj2, undefined, "notify", handler], "obj.stopListening(obj2, handler, notify)");

	assert.deepEqual( getKeys.call(that, "event", "notify"), [obj, "event", "notify"], "obj.stopListening('event', 'notify')");



});

QUnit.test("listenTo and stopListening takes a queueName", function(assert) {
	var CALLS = [];
	var obj = eventQueue({});
	var handler = function(){
		CALLS.push("first");
	};
	var secondHandler = function(){
		CALLS.push("second");
	};

	obj.listenTo("first",handler,"notify");
	obj.dispatch("first");
	obj.stopListening("first", handler, "notify");
	obj.dispatch("first");

	assert.deepEqual(CALLS, ["first"], "event, handler, queue");
	CALLS = [];

	obj.listenTo("first",handler,"notify");
	obj.listenTo("first",secondHandler,"mutate");
	obj.dispatch("first");
	obj.stopListening("first");
	obj.dispatch("first");

	assert.deepEqual(CALLS, ["first","second"], "event");
	CALLS = [];

	obj.listenTo("first",handler,"notify");
	obj.listenTo("first",secondHandler,"mutate");
	obj.dispatch("first");
	obj.stopListening("first","notify");
	obj.dispatch("first");

	assert.deepEqual(CALLS, ["first","second","second"], "event, queue");
	CALLS = [];

});

QUnit.test("on goes onEvent, addEventListener, then onKeyValue", function(assert) {
	var called = [];
	var fullSet = canReflect.assignSymbols({
		addEventListener: function(){
			called.push("addEventListener");
		}
	},{
		"can.onEvent": function(){
			called.push("onEvent");
		},
		'can.onKeyValue': function(){
			called.push("onKeyValue");
		}
	})
	eventQueue.on.call(fullSet, "event", function(){});

	assert.deepEqual(called, ["onEvent"]);

	called = [];
	var addEvent = canReflect.assignSymbols({
		addEventListener: function(){
			called.push("addEventListener");
		}
	},{
		'can.onKeyValue': function(){
			called.push("onKeyValue");
		}
	})
	eventQueue.on.call(addEvent, "event", function(){});

	assert.deepEqual(called, ["addEventListener"]);
});
