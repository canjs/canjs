var QUnit = require('steal-qunit');
var canSymbol = require('can-symbol');
var typeReflections = require("./type");
var getSetReflections = require("../get-set/get-set");
var testHelpers = require('../../can-reflect-test_helpers');
var clone = require('steal-clone');

QUnit.module('can-reflect: type reflections');

QUnit.test("isConstructorLike", function(assert) {
	var Constructor = function(){};
	Constructor.prototype.method = function(){};

	assert.ok(typeReflections.isConstructorLike(Constructor));
	assert.ok(!typeReflections.isConstructorLike(Constructor.prototype.method));

	var obj = {};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.new"), function(){});


	assert.ok(typeReflections.isConstructorLike(obj));

	assert.ok(!typeReflections.isConstructorLike({}));
});

QUnit.test("isFunctionLike", function(assert) {
	assert.ok(!typeReflections.isFunctionLike({}), 'object is not function like');
	assert.ok(typeReflections.isFunctionLike(function(){}), 'function is function like');

	var nonFunctionFunction = function() {};
	getSetReflections.setKeyValue(nonFunctionFunction, canSymbol.for("can.isFunctionLike"), false);
	assert.ok(!typeReflections.isFunctionLike(nonFunctionFunction), 'function with can.isFunctionLike set to false is not function like');

	var obj = {};
	var func = function() {};
	getSetReflections.setKeyValue(obj, canSymbol.for("can.new"), func);
	getSetReflections.setKeyValue(obj, canSymbol.for("can.apply"), func);
	assert.ok(typeReflections.isFunctionLike(obj), 'object with can.new and can.apply symbols is function like');

	getSetReflections.setKeyValue(obj, canSymbol.for("can.isFunctionLike"), false);
	assert.ok(!typeReflections.isFunctionLike(obj), 'object with can.new, can.apply, and can.isFunctionLike set to false is not function like');

	assert.equal(typeReflections.isFunctionLike(null), false, 'null is not a function');
	assert.equal(typeReflections.isFunctionLike(undefined), false, 'undefined is not a function');
});

QUnit.test("isIteratorLike", function(assert) {
	assert.ok(!typeReflections.isIteratorLike({}));
	assert.ok(typeReflections.isIteratorLike({next: function(){}}));
});

QUnit.test("isListLike", function(assert) {
	assert.ok(typeReflections.isListLike({0: 1, length: 1}));
	assert.ok(typeReflections.isListLike("yes"), "string");
	assert.ok(typeReflections.isListLike({
		length: 0
	}), "object with 0 length");
	var symboled = {};
	getSetReflections.setKeyValue(symboled, canSymbol.for("can.isListLike"), false);
	assert.ok(!typeReflections.isListLike(symboled), "!@@can.isListLike");
	getSetReflections.setKeyValue(symboled, canSymbol.for("can.isListLike"), true);
	assert.ok(typeReflections.isListLike(symboled), "@@can.isListLike");

	if(typeof document !== "undefined") {
		var ul = document.createElement("ul");
		ul.innerHTML = "<li/><li/>";
		assert.ok(typeReflections.isListLike(ul.childNodes), "nodeList");
	}
	if(testHelpers.setSupported) {
		assert.ok(typeReflections.isListLike(new Set()), "Set");
	}
});

QUnit.test("isMapLike", function(assert) {
	assert.ok(typeReflections.isMapLike({}), "Object");
	assert.ok(typeReflections.isMapLike([]), "Array");
	var symboled = {};
	getSetReflections.setKeyValue(symboled, canSymbol.for("can.isMapLike"), false);
	assert.ok(!typeReflections.isMapLike(symboled), "!@@can.isMapLike");
	getSetReflections.setKeyValue(symboled, canSymbol.for("can.isMapLike"), true);
	assert.ok(typeReflections.isMapLike(symboled), "@@can.isMapLike");

	assert.ok(!typeReflections.isMapLike("String"), "String");
});

QUnit.test("isMoreListLikeThanMapLike", function(assert) {
	assert.equal(typeReflections.isMoreListLikeThanMapLike({}), false, "Object");
	assert.equal(typeReflections.isMoreListLikeThanMapLike([]), true, "Array");
	assert.equal(typeReflections.isMoreListLikeThanMapLike(null), false, "null");
	assert.equal(typeReflections.isMoreListLikeThanMapLike(undefined), false, "undefined");

});

QUnit.test("isObservableLike", function(assert) {
	assert.ok(typeReflections.isObservableLike({}) === false, "Object");
	assert.ok(typeReflections.isObservableLike([]) === false, "Array");

	var obj = {};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.onValue"), function(){});
	assert.ok(typeReflections.isObservableLike(obj), "Object");
});

QUnit.test("isPrimitive", function(assert) {
	assert.ok(!typeReflections.isPrimitive({}), "Object");
	assert.ok(typeReflections.isPrimitive(null), "null");
	assert.ok(typeReflections.isPrimitive(1), "1");
});

QUnit.test("isBuiltIn", function(assert) {
	assert.ok(typeReflections.isBuiltIn(1), "Primitive");
	assert.ok(typeReflections.isBuiltIn({}), "Object");
	assert.ok(typeReflections.isBuiltIn([]), "Array");
	assert.ok(typeReflections.isBuiltIn(function() {}), "Function");
	assert.ok(typeReflections.isBuiltIn(new Date()), "Date");
	assert.ok(typeReflections.isBuiltIn(/[foo].[bar]/), "RegEx");
	if (document) {
		assert.ok(typeReflections.isBuiltIn(document.createElement('div')), "Elements");
	}
	var Foo = function() {};
	var customObj = new Foo();
	assert.ok(!typeReflections.isBuiltIn(customObj), "Custom Object");
	if (testHelpers.mapSupported) {
		var map = new Map();
		assert.ok(typeReflections.isBuiltIn(map), "Map");
	}
});

QUnit.test("isValueLike", function(assert) {
	assert.ok(!typeReflections.isValueLike({}), "Object");
	assert.ok(!typeReflections.isValueLike(function(){}), "Function");
	assert.ok(typeReflections.isValueLike("String"), "String");
	var obj = {};
	getSetReflections.setKeyValue(obj,canSymbol.for("can.getValue"), true);
	assert.ok(typeReflections.isValueLike(obj), "symboled");
	var symboled = {};
	getSetReflections.setKeyValue(symboled, canSymbol.for("can.isValueLike"), false);
	assert.ok(!typeReflections.isValueLike(symboled), "!@@can.isValueLike");
	getSetReflections.setKeyValue(symboled, canSymbol.for("can.isValueLike"), true);
	assert.ok(typeReflections.isValueLike(symboled), "@@can.isValueLike");

});

QUnit.test("isSymbolLike", function(assert) {
	if(typeof Symbol !== "undefined") {
		assert.ok(typeReflections.isSymbolLike(Symbol("a symbol")), "Native Symbol");
	}

	assert.ok(typeReflections.isSymbolLike(canSymbol("another Symbol")), "canSymbol Symbol");
});

QUnit.test("isSymbolLike with polyfill", function(assert) {
	var done = assert.async();
	var origSymbol = window.Symbol;
	function FakeSymbol(key) {
		return { key: key };
	}
	FakeSymbol.for = function() {};
	window.Symbol = FakeSymbol;

	var loader = clone({});

	loader.import("can-symbol")
		.then(function(canSymbol) {
			loader.import("can-reflect/reflections/type/type")
				.then(function(typeReflections) {
					if(typeof Symbol !== "undefined") {
						assert.ok(!typeReflections.isSymbolLike(Symbol("a polyfilled symbol")), "polyfilled Symbol not symbol-like");
					}

					assert.ok(typeReflections.isSymbolLike(canSymbol("a polyfilled canSymbol")), "canSymbol Symbol");

					// clean up
					window.Symbol = origSymbol;
					done();
				});
		});
});

QUnit.test("isPromise", function(assert) {
	assert.ok(!typeReflections.isPromise({}), "Object is not a promise");
	assert.ok(!typeReflections.isPromise({ catch: function(){}, then: function(){} }), "function with then and catch is not a Promise");
	assert.ok(typeReflections.isPromise( new Promise(function(){})), "a new Promise() is a Promise");
});

QUnit.test("isConstructor - non enumerable properties on the prototype chain (#18)", function(assert) {
	var Constructor = function(){

	};
	Object.defineProperty(Constructor.prototype, "prop", {
		enumerable: false,
		value: 1
	});

	assert.ok( typeReflections.isConstructorLike(Constructor), "decorated prototype means constructor");
});


QUnit.test("functions without prototypes (#20)", function(assert) {
	var method = (function(){}).bind({});

	assert.notOk( typeReflections.isConstructorLike(method), "not a constructor");
});

QUnit.test("functions with deep non enumerable properties - non default proto chains (#22)", function(assert) {
	var Base = function(){

	};
	Object.defineProperty(Base.prototype, "prop", {
		enumerable: false,
		value: 1
	});
	var Constructor = function(){};
	Constructor.prototype = new Base();
	Constructor.prototype.constructor = Constructor;

	assert.ok( typeReflections.isConstructorLike(Constructor), "decorated prototype means constructor");
});

QUnit.test("array -like type is MoreListLikeThanMapLike", function(assert) {
	var MyArray = function(values) {
		this.push.apply(this, values || []);
	};
	MyArray.prototype = Object.create(Array.prototype);
	MyArray.prototype.constructor = MyArray;
	var arr = new MyArray();
	assert.ok(typeReflections.isMoreListLikeThanMapLike(arr), "is array like");
});
