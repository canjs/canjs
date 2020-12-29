var QUnit = require('steal-qunit');
var eventQueue = require("../map/map");
var canSymbol = require("can-symbol");
var addTypeEvents = require("./type");

QUnit.module('can-event-queue/type-events',{
	beforeEach: function() { },
	afterEach: function() { }
});

QUnit.test("Events when object is bound/unbound", function(assert) {
	assert.expect(1);
	var Type = function(){};
	eventQueue(Type.prototype);
	addTypeEvents( Type );

	var obj1 = new Type(),
		obj2 = new Type();

	var calls = [];
	var metaHandler = function(obj, newVal) {
		calls.push([obj, newVal]);
	};
	var handler = function() {};

	Type[canSymbol.for("can.onInstanceBoundChange")](metaHandler);

	obj1.on("first", handler);
	obj1.off("first", handler);
	obj2.on("second", handler);
	obj2.off("second", handler);

	// Sanity check.  Ensure that no more events fire after offBoundChange
	Type[canSymbol.for("can.offInstanceBoundChange")](metaHandler);
	obj1.on("first", handler);
	obj1.off("first", handler);

	assert.deepEqual(calls,[
		[obj1,true],
		[obj1,false],
		[obj2,true],
		[obj2,false]
	]);
});

QUnit.test("can.dispatchInstanceOnPatches", function(assert) {
	assert.expect(1);
	var Type = function(){};
	eventQueue(Type.prototype);
	addTypeEvents( Type );
    var calls = [];
    var handler = function(obj, patches){
    	calls.push([obj, patches]);
    };
    Type[canSymbol.for("can.onInstancePatches")](handler);


    var obj1 = new Type();
    Type[canSymbol.for("can.dispatchInstanceOnPatches")](obj1, [{type: "add",    key: "b", value: 1}]);
    Type[canSymbol.for("can.offInstancePatches")](handler);

	assert.deepEqual(calls,[
		[obj1, [{type: "add",    key: "b", value: 1}]]
	]);
});

QUnit.test("can.dispatchInstanceOnPatches with patches on event object", function(assert) {
	assert.expect(1);
	var Type = function(){};
	eventQueue(Type.prototype);
	addTypeEvents( Type );
    var calls = [];
    var handler = function(obj, patches){
    	calls.push([obj, patches]);
    };
    Type[canSymbol.for("can.onInstancePatches")](handler);


    var obj1 = new Type();
	obj1.dispatch({
		type: "b",
		patches: [{type: "add",    key: "b", value: 1}]
	});
    Type[canSymbol.for("can.offInstancePatches")](handler);
	obj1.dispatch({
		type: "b",
		patches: [{type: "add",    key: "b", value: 1}]
	});

	assert.deepEqual(calls,[
		[obj1, [{type: "add",    key: "b", value: 1}]]
	]);
});

QUnit.test("Stop dispatching instanceBound events when prototype is bound (#20)", function(assert) {
	var Type = function(){
		this.instanceObject = true;
	};
	Type.prototype.prototypeObject = true;
	addTypeEvents(Type);
	eventQueue(Type.prototype);
	var instances = [];
	Type[canSymbol.for("can.onInstanceBoundChange")](function(instance, bound){
		instances.push([instance, bound]);
	});

	var instance = new Type();
	function handler(){}

	instance.on("prop", handler);
	Type.prototype.on("other", handler);

	Type.prototype.off("other", handler);
	instance.off("prop", handler);

	assert.deepEqual(instances,[
		[instance, true],
		[instance, false]
	]);

});
