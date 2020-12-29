var QUnit = require('steal-qunit');
var canSymbol = require('can-symbol');
var shapeReflections = require("./shape");
var getSetReflections = require("../get-set/get-set");
var testHelpers = require('../../can-reflect-test_helpers');
require("./schema/schema-test");

QUnit.module('can-reflect: shape reflections: own+enumerable');

function testModifiedMap(callback, symbolToMethod){
	symbolToMethod = symbolToMethod || {
		getOwnEnumerableKeys: "keys",
		hasOwnKey: "has",
		getKeyValue: "get"
	};

	if(testHelpers.mapSupported) {
		shapeReflections.eachKey(symbolToMethod, function(method, symbol){
			getSetReflections.setKeyValue(Map.prototype,canSymbol.for("can."+symbol),function(){
				return this[method].apply(this, arguments);
			});
		});

		callback();

		shapeReflections.eachKey(symbolToMethod, function(symbol){
			delete Map.prototype[canSymbol.for("can."+symbol)];
		});

	}
}


QUnit.test("getOwnEnumerableKeys (aka: keys)", function(assert) {

	assert.deepEqual( shapeReflections.keys( {foo: 1, bar: 2}), ["foo","bar"], "POJO" );

	assert.deepEqual( shapeReflections.keys( ["0", "1"] ), Object.keys([1,2]), "Array"  );

	// Can we decorate a Map
	testModifiedMap(function(){
		var map = new Map(),
			obj = {};
		map.set("foo",1);
		map.set(obj, 2);

		assert.deepEqual( shapeReflections.toArray(shapeReflections.keys(map)),
			["foo",{}], "Decorated Map with can.getOwnEnumerableKeys" );
	});

	// Can we do the long form w/o the fast path
	var proto = {};
	getSetReflections.setKeyValue(proto,canSymbol.for("can.getOwnKeys"),function(){
		return ["a","b","c"];
	});
	getSetReflections.setKeyValue(proto,canSymbol.for("can.getOwnKeyDescriptor"),function(key){
		return ({
			a: {enumerable: false},
			b: {enumerable: true },
			c: {enumerable: true }
		})[key];
	});


	var defineMapLike = Object.create(proto,{});

	assert.deepEqual( shapeReflections.toArray(shapeReflections.keys(defineMapLike)),
		["b","c"], "Decorated Object with can.getOwnKeys and can.getOwnKeyDescriptor");

	/*var map = new Map(),
		obj = {};
	map.set("foo",1);
	map.set(obj, 2);

	assert.deepEqual( shapeReflections.toArray(shapeReflections.keys(map)),
		["foo",{}], "un-decorated Map" );*/
});

QUnit.test("eachIndex", function(assert) {
	// Iterators work
	var Ctr = function(){};
	var arr = ["a", "b"];
	getSetReflections.setKeyValue(Ctr.prototype,canSymbol.iterator,function(){
		return {
			i: 0,
			next: function(){
				if(this.i === 1) {
					return { value: undefined, done: true };
				}
				this.i++;

				return { value: arr, done: false };
			}
		};
	});

	var obj = new Ctr();

	shapeReflections.eachIndex(obj, function(value, index){
		assert.equal(index, 0);
		assert.equal(value,arr);
	});

	shapeReflections.eachIndex(["a"], function(value, index){
		assert.equal(index, 0);
		assert.equal(value, "a");
	});

	function ArrayLike() {}
	ArrayLike.prototype = [];
	ArrayLike.prototype[canSymbol.iterator] = null;

	var noniterator = new ArrayLike();
	noniterator.push("a");
	shapeReflections.eachIndex(noniterator, function(value, index){
		assert.equal(index, 0);
		assert.equal(value,"a");
	});

});

QUnit.test("eachKey", function(assert) {
	var index;
	var answers, map;
	// Defined on something

	testModifiedMap(function(){
		var o1 = {}, o2 = {};
		map = new Map([[o1, "1"], [o2, 2]]);
		index = 0;
		answers = [[o1, "1"], [o2, 2]];
		shapeReflections.eachKey(map, function(value, key){
			var answer = answers[index++];
			assert.equal(value, answer[1], "map value");
			assert.equal(key, answer[0], "map key");
		});
	});

	var obj = {a: "1", b: "2"};
	index = 0;
	answers = [["a", "1"], ["b", "2"]];
	shapeReflections.eachKey(obj, function(value, key){
		var answer = answers[index++];
		assert.equal(value, answer[1], "object value");
		assert.equal(key, answer[0], "object key");
	});


	/*
	map = new Map([[o1, "1"], [o2, 2]]);
	index = 0;
	answers = [[o1, "1"], [o2, 2]];
	shapeReflections.eachKey(map, function(value, key){
		var answer = answers[index++];
		assert.equal(value, answer[1], "plain map value");
		assert.equal(key, answer[0], "plain map key");
	});*/
});

QUnit.test("each", function(assert) {
	shapeReflections.each({foo: "bar"}, function(value, key){
		assert.equal(key, "foo");
		assert.equal(value, "bar");
	});

	shapeReflections.each(["bar"], function(value, index){
		assert.equal(index, 0);
		assert.equal(value, "bar");
	});
});

QUnit.test("toArray", function(assert) {
	if(typeof document !== "undefined") {
		var ul = document.createElement("ul");
		ul.innerHTML = "<li/><li/>";
		var arr = shapeReflections.toArray(ul.childNodes);

		assert.equal(arr.length, 2, "childNodes");
		assert.equal(arr[0].nodeName.toLowerCase(), "li", "childNodes");
	}
});


QUnit.module('can-reflect: shape reflections: own');

QUnit.test("hasOwnKey", function(assert) {
	var map;
	// Defined on something

	testModifiedMap(function(){
		var o1 = {};
		map = new Map();
		map.set(o1, "1");
		assert.ok( shapeReflections.hasOwnKey(map, o1) , "Map" );
	});

	var obj = {foo: "bar"};

	assert.ok( shapeReflections.hasOwnKey(obj, "foo") , "obj" );
	assert.ok( !shapeReflections.hasOwnKey(obj, "bar") , "obj" );

});


QUnit.test("hasOwnKey on null derived object", function(assert) {
	var obj = Object.create(null);
	obj.foo = "bar";

	assert.ok( shapeReflections.hasOwnKey(obj, "foo") , "obj" );
	assert.ok( !shapeReflections.hasOwnKey(obj, "bar") , "obj" );

});


QUnit.test("getOwnKeys", function(assert) {
	var obj = Object.create(null,{
		foo: {value: "1", enumerable: true},
		bar: {value: "2", enumerable: false},
	});

	assert.deepEqual( shapeReflections.getOwnKeys(obj), ["foo","bar"] , "obj" );
});

QUnit.test("getOwnKeyDescriptor", function(assert) {
	var obj = {foo: "bar"};

	assert.deepEqual(
		shapeReflections.getOwnKeyDescriptor(obj,"foo"),
		Object.getOwnPropertyDescriptor(obj, "foo") , "POJO" );

	var obj2 = {};
	getSetReflections.setKeyValue(obj2,canSymbol.for("can.getOwnKeyDescriptor"),function(key){
		return ({foo:{enumerable: true, type: "thing"}})[key];
	});
	assert.deepEqual(
		shapeReflections.getOwnKeyDescriptor(obj2,"foo"),
		{enumerable: true, type: "thing"}, "w/ symbol" );
});

QUnit.test("unwrap basics", function(assert) {
	// tests something like
	//  compute(
	//    new Map({
	//      a: "A",
	//      list: new List([0,2])
	//    })
	//  )
	var list = {};

	getSetReflections.setKeyValue(list,canSymbol.iterator,function(){
		return {
			i: 0,
			next: function(){
				if(this.i === 3) {
					return { value: undefined, done: true };
				}
				this.i++;

				return { value: (this.i-1)*2, done: false };
			}
		};
	});
	getSetReflections.setKeyValue(list, canSymbol.for("can.isMoreListLikeThanMapLike"), true);

	var compute = {};
	getSetReflections.setKeyValue(compute,canSymbol.for("can.getValue"),function(){
		var map = {};

		getSetReflections.setKeyValue(map, canSymbol.for("can.getOwnEnumerableKeys"), function(){
			return ["a","b","c","list"];
		});

		getSetReflections.setKeyValue(map, canSymbol.for("can.getKeyValue"), function(key){
			return key === "list" ? list : key.toUpperCase();
		});
		return map;
	});
	var plain = shapeReflections.unwrap(compute);

	assert.deepEqual( plain, {
		a: "A",
		b: "B",
		c: "C",
		list: [0,2,4]
	});

});

QUnit.test("unwrap handles POJOs", function(assert) {
	var a = {foo: "bar"};
	var plain = shapeReflections.unwrap(a);
	assert.deepEqual( plain, a);
	assert.ok( a !== plain , "returns copy");

});


if(typeof Map !== "undefined") {

	QUnit.test("handles cycles", function(assert) {
		var a = {},
			b = {};

		a.b = b;
		b.a = a;

		var plain = shapeReflections.unwrap(a, Map);
		assert.equal(plain.b.a, plain, "cycle intact");
		assert.ok( a !== plain , "returns copy");
	});
}

QUnit.test("isBuiltIn is only called after decorators are checked in shouldSerialize", function(assert) {
	var arr = [];
	assert.ok(!shapeReflections.isSerialized(arr), "array is not isSerialized");
	assert.ok(!shapeReflections.isSerialized({}), "obj is not isSerialized");
	arr[canSymbol.for('can.setKeyValue')] = function() {};
	assert.ok(!shapeReflections.isSerialized(arr));

	if (testHelpers.setSupported) {
		var set = new Set([{}, {}, {}]);
		assert.ok(shapeReflections.isSerialized(set));
		set[canSymbol.for("can.setKeyValue")] = function() {};
		assert.ok(!shapeReflections.isSerialized(set));
	}
});

QUnit.test(".serialize handles recursion with .unwrap", function(assert) {



	// tests something like
	//  compute(
	//    new Map({
	//      a: "A",
	//      list: new List([0,2])
	//    })
	//  )
	var list = {};

	getSetReflections.setKeyValue(list,canSymbol.iterator,function(){
		return {
			i: 0,
			next: function(){
				if(this.i === 3) {
					return { value: undefined, done: true };
				}
				this.i++;

				return { value: (this.i-1)*2, done: false };
			}
		};
	});
	getSetReflections.setKeyValue(list, canSymbol.for("can.isMoreListLikeThanMapLike"), true);

	var compute = {};
	getSetReflections.setKeyValue(compute,canSymbol.for("can.getValue"),function(){
		var map = {};

		getSetReflections.setKeyValue(map, canSymbol.for("can.getOwnEnumerableKeys"), function(){
			return ["a","b","c","list"];
		});

		getSetReflections.setKeyValue(map, canSymbol.for("can.getKeyValue"), function(key){
			return key === "list" ? list : key.toUpperCase();
		});
		return map;
	});
	var plain = shapeReflections.unwrap(compute);

	assert.deepEqual( plain, {
		a: "A",
		b: "B",
		c: "C",
		list: [0,2,4]
	});

});

QUnit.test(".serialize with recursive data structures", function(assert) {
	var obj = {};
	obj.prop = obj;

	var s = shapeReflections.serialize(obj);
	assert.equal(s.prop, s, "Object points to itself");
});


QUnit.test("objects that serialize to strings should cache properly", function(assert) {
	function SimpleType(){}
	getSetReflections.setKeyValue(SimpleType.prototype, canSymbol.for("can.serialize"), function(){
		return "baz";
	});
	var obj = new SimpleType();
	var p = {
		foo: obj, bar: obj
	};
	assert.deepEqual(shapeReflections.serialize(p, window.Map), {foo:"baz", bar:"baz"});
});

QUnit.test("throw error when serializing circular reference", function(assert) {
	function SimpleType(){}
	var a = new SimpleType();
	var b = new SimpleType();
	a.b = b;
	b.a = a;
	getSetReflections.setKeyValue(a, canSymbol.for("can.serialize"), function(){
		return {
			b: shapeReflections.serialize(this.b)
		};
	});
	getSetReflections.setKeyValue(b, canSymbol.for("can.serialize"), function(){
		return {
			a: shapeReflections.serialize(this.a)
		};
	});

	try{
		shapeReflections.serialize(a, window.Map);
		assert.ok(false);
	}catch(e){
		assert.ok(true);
	}
});

QUnit.test("throw should not when serializing circular reference properly", function(assert) {
	function SimpleType(){}
	var a = new SimpleType();
	var b = new SimpleType();
	a.b = b;
	b.a = a;
	getSetReflections.setKeyValue(a, canSymbol.for("can.serialize"), function(proto){
		return proto.b = shapeReflections.serialize(this.b);
	});
	getSetReflections.setKeyValue(b, canSymbol.for("can.serialize"), function(proto){
		return proto.a = shapeReflections.serialize(this.a);
	});

	try{
		shapeReflections.serialize(a, window.Map);
		assert.ok(true);
	}catch(e){
		assert.ok(false);
	}
});

QUnit.test("Correctly serializes after throwing for circular reference", function(assert) {
	function SimpleType(){}
	var a = new SimpleType();
	var b = new SimpleType();
	a.b = b;
	b.a = a;
	getSetReflections.setKeyValue(a, canSymbol.for("can.serialize"), function(){
		return {
			b: shapeReflections.serialize(this.b)
		};
	});
	getSetReflections.setKeyValue(b, canSymbol.for("can.serialize"), function(){
		return {
			a: shapeReflections.serialize(this.a)
		};
	});

	try{
		shapeReflections.serialize(a, window.Map);
		assert.ok(false);
	}catch(e){
		assert.ok(true);

		a = [1,2];
		shapeReflections.serialize(a, window.Map);

		b = a;
		b.shift();
		var s = shapeReflections.serialize(b, window.Map);
		assert.equal(s.length, 1, "there is one item");
		assert.equal(s[0], 2, "correct item");
	}
});

QUnit.test("updateDeep basics", function(assert) {

	var obj = {
		name: "Justin",
		hobbies: [{id: 1, name: "js"},{id: 2, name: "foosball"}]
	};
	var hobbies = obj.hobbies;
	var js = obj.hobbies[0];

	shapeReflections.updateDeep(obj, {
		age: 34,
		hobbies: [{id: 1, name: "JS", fun: true}]
	});

	assert.deepEqual(obj, {
		age: 34,
		hobbies: [{id: 1, name: "JS", fun: true}]
	});
	assert.equal(obj.hobbies, hobbies, "merged hobbies");
	assert.equal(obj.hobbies[0], js, "merged js");


	shapeReflections.updateDeep(obj, {
		age: 34,
		hobbies: [{id: 1, name: "JS", fun: true},{id: 2, name: "foosball"}]
	});

	assert.deepEqual(obj, {
		age: 34,
		hobbies: [{id: 1, name: "JS", fun: true},{id: 2, name: "foosball"}]
	}, "added foosball");

	assert.equal(obj.hobbies, hobbies, "merged hobbies");
	assert.equal(obj.hobbies[0], js, "merged js");
});

QUnit.test("updateDeep", function(assert) {
	var a = [];
	shapeReflections.updateDeep(a, ["a","b"]);

	assert.deepEqual(a, ["a","b"]);
});

QUnit.test("can assign undefined values", function(assert) {
	var obj = shapeReflections.assignMap({}, {foo: undefined});
	assert.ok(obj.hasOwnProperty("foo"), "has an undefined foo");
});

QUnit.test("assignMap", function(assert) {
	var target = shapeReflections.assignSymbols({},{
		"can.setKeyValue": function(key, value){
			this[key] = value * 2;
		},
		"can.getKeyValue": function(key) {
			return this[key] !== undefined ? this[key] / 2 : undefined;
		}
	});
	target.a = 22;
	var source = shapeReflections.assignSymbols({},{
		"can.setKeyValue": function(key, value){
			this[key] = value * 3;
		},
		"can.getKeyValue": function(key) {
			return this[key] !== undefined ? this[key] / 3 : undefined;
		}
	});

	shapeReflections.assignMap(source,{
		a: 1,
		b: 2
	});

	assert.deepEqual(source,{
		a: 3,
		b: 6
	}, "set values on source");

	shapeReflections.assignMap(target, source);

	assert.deepEqual(target,{
		a: 2,
		b: 4
	}, "set values on target");
});

QUnit.test("getOwnEnumerableKeys with primitives", function(assert) {
	assert.deepEqual(shapeReflections.getOwnEnumerableKeys(1),[],"works with primitive");
});

if(typeof Symbol !== "undefined") {
	QUnit.test("assignSymbols can set Symbol.iterator", function(assert) {
		var fn = function(){ };
		var obj = shapeReflections.assignSymbols({},{
			"iterator": fn
		});
		assert.equal(obj[Symbol.iterator], fn, "works");
	});
}


QUnit.test("defineInstanceKey with symbol on prototype", function(assert) {
	var testKey = "foo";
	var testDef = { value: "bar" };

	function Foo() {}
	Foo.prototype[canSymbol.for("can.defineInstanceKey")] = function(key, definition) {
		assert.equal(key, testKey);
		assert.deepEqual(definition, testDef);
	};
	shapeReflections.defineInstanceKey(Foo, testKey, testDef);
});

QUnit.test("defineInstanceKey with no symbol on prototype", function(assert) {
	var testKey = "foo";
	var testDef = { value: "bar" };
	var def;

	function Foo() {}
	shapeReflections.defineInstanceKey(Foo, testKey, testDef);

	assert.ok(def = Object.getOwnPropertyDescriptor(Foo.prototype, testKey), "Has descriptor");
	assert.equal(def.value, testDef.value, "Value is correctly set");
	assert.equal(def.configurable, true, "value is configurable");
	assert.equal(def.writable, true, "value is writable");

});

QUnit.test("updateDeep recurses correctly (#73)", function(assert) {
	var source = {
		name: 'juan',
		hobbies: ['games', 'photography', 'building']
	},
		sourceArray = source.hobbies;
	shapeReflections.updateDeep(source, {hobbies: ['headdesk']});
	assert.deepEqual(source, {hobbies: ['headdesk']}, "source looks right");
	assert.equal(sourceArray, source.hobbies, "array updated");
});

QUnit.module('can-reflect: shape reflections: proto chain');

QUnit.test("hasKey", function(assert) {
	var objHasKey = {};
	Object.defineProperty(objHasKey, "_keys", {
		value: { foo: true }
	});
	getSetReflections.setKeyValue(objHasKey, canSymbol.for("can.hasKey"), function(key) {
		return key in this._keys;
	});
	assert.ok(shapeReflections.hasKey(objHasKey, "foo") , "returns true when hasKey Symbol returns true");
	assert.ok(!shapeReflections.hasKey(objHasKey, "bar") , "returns false when hasKey Symbol returns false");

	var objHasOwnKey = {};
	Object.defineProperty(objHasOwnKey, "_keys", {
		value: { foo: true }
	});
	getSetReflections.setKeyValue(objHasOwnKey, canSymbol.for("can.hasOwnKey"), function(key) {
		return key in this._keys;
	});
	assert.ok(shapeReflections.hasKey(objHasOwnKey, "foo") , "returns true when hasOwnKey Symbol returns true");
	assert.ok(!shapeReflections.hasKey(objHasOwnKey, "bar") , "returns false when hasOwnKey Symbol returns false");

	objHasOwnKey.bar = "baz";
	assert.ok(shapeReflections.hasKey(objHasOwnKey, "bar") , "returns true when hasOwnKey Symbol returns false but `in` returns true");

	assert.ok(shapeReflections.hasKey(55, "toFixed") , "works on primitives");
	assert.ok(shapeReflections.hasKey(true, "valueOf") , "works on primitives");
	assert.ok(shapeReflections.hasKey('foo', "length") , "works on primitives");
	assert.notOk(shapeReflections.hasKey(null, "length") , "works on null");
	assert.notOk(shapeReflections.hasKey(undefined, "length") , "works on undefined");
});

QUnit.test("serialize clones", function(assert) {
	var obj = {foo: {bar: "zed"}};

	var res = shapeReflections.serialize(obj);
	assert.deepEqual(res, obj, "look equal");
	assert.notOk(res === obj);
	assert.notOk(res.foo === obj.foo);
});

QUnit.test("serialize clones arrays", function(assert) {
	var obj = {foo: [{zed: "ted"}]};
	var obj2 = shapeReflections.serialize(obj);
	assert.deepEqual(obj2, obj, "deep equal");

	assert.notOk(obj === obj2, "ret not the same");
	assert.notOk(obj.foo === obj2.foo, "foo not the same");
	assert.notOk(obj.foo[0] === obj2.foo[0]);
});

QUnit.test(".size", function(assert) {
	assert.equal( shapeReflections.size([1]), 1, "array");
	assert.equal( shapeReflections.size([]), 0, "array");

	assert.equal( shapeReflections.size("a"), 1, "string");
	assert.equal( shapeReflections.size(""), 0, "array");

	assert.equal( shapeReflections.size({}), 0, "empty object");
	assert.equal( shapeReflections.size({foo:"bar"}), 1, "object");

	assert.equal( shapeReflections.size(null), 0, "null");
	assert.equal( shapeReflections.size(undefined), 0, "undefined");
});

QUnit.test("size works with out hasOwnProperty (#109)", function(assert) {
	var obj = Object.create(null);
	assert.equal( shapeReflections.size(obj), 0, "empty object");
	obj.foo = "bar";
	assert.equal( shapeReflections.size(obj), 1, "has value");
});

QUnit.test("each loops without needing `this`", function(assert) {
	var each = shapeReflections.each;

	each({}, function(){});
	assert.ok(true, "no error");
});

QUnit.test("assignDeepList", function(assert) {
	var justin = {name: "Justin", age: 35},
		payal = {name: "Payal", age: 35};

	var people = [justin, payal];
	shapeReflections.assignDeep(people, [
		{age: 36}
	]);

	assert.deepEqual(people,  [
		{name: "Justin", age: 36},
		{name: "Payal", age: 35}
	], "assigned right");
});

QUnit.test(".serialize works for observable built ins", function(assert) {
	var obj = document.createElement("div");
	obj[canSymbol.for("can.serialize")] = function() {
		return "serialized value";
	};

	// mark object as observable
	obj[canSymbol.for("can.onKeyValue")] = function() {};

	assert.deepEqual(shapeReflections.serialize(obj), "serialized value");
});


/*QUnit.test("getAllEnumerableKeys", function(){

});

QUnit.test("getAllKeys", function(){

});*/
