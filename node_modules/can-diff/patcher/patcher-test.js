var DefineList = require("can-define/list/list");
var QUnit = require('steal-qunit');
var canSymbol = require("can-symbol");
var Patcher = require("./patcher");
var SimpleObservable = require("can-simple-observable");
var canReflect = require("can-reflect");

QUnit.module("can-diff/patcher",{
	beforeEach: function(assert) {
		this.fixture = document.getElementById("qunit-fixture");
	}
});


QUnit.test('multiple lists can be updated at once', function(assert) {
	assert.expect(2);
	var list = new DefineList(["a","b"]);
	var p1 = new Patcher(list),
		p2 = new Patcher(list);

	p1[canSymbol.for("can.onPatches")](function(){
		assert.ok(true, "called p1");
	});
	p2[canSymbol.for("can.onPatches")](function(){
		assert.ok(true, "called p2");
	});

	list.push("c");
});

QUnit.test('undefined value won\'t error', function(assert) {
	assert.expect(1);
	var undfinedObservable = new SimpleObservable(undefined);
	var pu = new Patcher(undfinedObservable);

	pu[canSymbol.for("can.onPatches")](function(){
		assert.ok(true, "called pu");
	});

	undfinedObservable.set("a");
});

QUnit.test("unbinding unbinds from the list (#13)", function(assert) {
	// first with a list
	var ListType = DefineList.extend("ListType",{});
	var list = new ListType(["a","b"]);
	var p1 = new Patcher(list);

	var calls = [];
	canReflect.onInstanceBoundChange(ListType, function(instance, isBound){
		calls.push([instance, isBound]);
	});

	function handler(){}
	p1[canSymbol.for("can.onPatches")](handler);
	p1[canSymbol.for("can.offPatches")](handler);

	assert.deepEqual(calls, [[list, true], [list, false]], "bound and unbound");

	calls = [];
	var observable = new SimpleObservable(list);
	var p2 = new Patcher(observable);

	p2[canSymbol.for("can.onPatches")](handler);
	p2[canSymbol.for("can.offPatches")](handler);

	assert.deepEqual(calls, [[list, true], [list, false]], "bound and unbound within observable");
});
