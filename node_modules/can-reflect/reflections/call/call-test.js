var QUnit = require('steal-qunit');
var canSymbol = require('can-symbol');
var callReflections = require("./call");
var getSetReflections = require("../get-set/get-set");

QUnit.module('can-reflect: function reflections');

QUnit.test("call", function(assert) {
	var obj = {};
	var ret = callReflections.call(function(arg1, arg2){
		assert.equal(this, obj, "this");
		assert.equal(arg1, 1, "arg1");
		assert.equal(arg2, 2, "arg2");
		return 3;
	}, obj, 1,2);

	assert.equal(ret, 3, "return value");

	var func = {};
	getSetReflections.setKeyValue(func,canSymbol.for("can.apply"),function(context, args){
		assert.equal(this, func, "this");
		assert.equal(context, obj, "context");
		assert.equal(args[0], 1, "arg1");
		assert.equal(args[1], 2, "arg2");
		return 3;
	});

	ret = callReflections.call(func, obj, 1,2);
	assert.equal(ret, 3, "return value");
});

QUnit.test("apply", function(assert) {
	var obj = {};
	var ret = callReflections.apply(function(arg1, arg2){
		assert.equal(this, obj, "this");
		assert.equal(arg1, 1, "arg1");
		assert.equal(arg2, 2, "arg2");
		return 3;
	}, obj, [1,2]);

	assert.equal(ret, 3, "return value");


	var func = {};
	getSetReflections.setKeyValue(func,canSymbol.for("can.apply"),function(context, args){
		assert.equal(this, func, "this");
		assert.equal(context, obj, "context");
		assert.equal(args[0], 1, "arg1");
		assert.equal(args[1], 2, "arg2");
		return 3;
	});

	ret = callReflections.apply(func, obj,[1,2]);
	assert.equal(ret, 3, "return value");
});

QUnit.test("new", function(assert) {
	var Constructor = function(arg1, arg2){
		assert.ok(this instanceof Constructor, "this");
		assert.equal(arg1, 1, "arg1");
		assert.equal(arg2, 2, "arg2");
		return 3;
	};
	var instance = callReflections["new"](Constructor, 1,2);
	assert.ok(instance instanceof Constructor, "this");

	var Func = {};
	getSetReflections.setKeyValue(Func,canSymbol.for("can.new"),function(arg1, arg2){
		assert.equal(this, Func, "this");
		assert.equal(arg1, 1, "arg1");
		assert.equal(arg2, 2, "arg2");
		return 3;
	});

	var ret = callReflections.new(Func,1,2);
	assert.equal(ret, 3, "return value");
});
