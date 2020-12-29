var DefineList = require("can-define/list/list");
var QUnit = require('steal-qunit');
var canSymbol = require("can-symbol");
var Patcher = require("../lib/patcher");
var SimpleObservable = require("can-simple-observable");

QUnit.module("can-view-live patcher",{
	beforeEach: function() {
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
