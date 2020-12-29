var QUnit = require("steal-qunit");
var DefineMap = require("can-define/map/map");
var define = require("can-define");
var Observation = require("can-observation");
var assign = require("can-assign");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var isPlainObject = canReflect.isPlainObject;
var canTestHelpers = require("can-test-helpers/lib/dev");
var DefineList = require("can-define/list/list");
var dev = require("can-log/dev/dev");
var ObservationRecorder = require("can-observation-recorder");
var MaybeString = require("can-data-types/maybe-string/maybe-string");

var sealWorks = (function() {
	try {
		var o = {};
		Object.seal(o);
		o.prop = true;
		return false;
	} catch(e) {
		return true;
	}
})();

QUnit.module("can-define/map/map");

QUnit.test("Map is an event emitter", function (assert) {
	var Base = DefineMap.extend({});
	assert.ok(Base.on, 'Base has event methods.');
	var Map = Base.extend({});
	assert.ok(Map.on, 'Map has event methods.');
});

QUnit.test("creating an instance", function(assert) {
	var map = new DefineMap({prop: "foo"});
	map.on("prop", function(ev, newVal, oldVal){
		assert.equal(newVal, "BAR");
		assert.equal(oldVal, "foo");
	});

	map.prop = "BAR";
});

QUnit.test("creating an instance with nested prop", function(assert) {

	var map = new DefineMap({name: {first: "Justin"}});

	map.name.on("first", function(ev, newVal, oldVal){
		assert.equal(newVal, "David");
		assert.equal(oldVal, "Justin");
	});

	map.name.first = "David";
});

QUnit.test("extending", function(assert) {
	var MyMap = DefineMap.extend({
		prop: {}
	});

	var map = new MyMap();
	map.on("prop", function(ev, newVal, oldVal){
		assert.equal(newVal, "BAR");
		assert.equal(oldVal, undefined);
	});

	map.prop = "BAR";
});

QUnit.test("loop only through defined serializable props", function(assert) {
	var MyMap = DefineMap.extend({
		propA: {},
		propB: {serialize: false},
		propC: {
			get: function(){
				return this.propA;
			}
		}
	});
	var inst = new MyMap({propA: 1, propB: 2});

	assert.deepEqual(Object.keys(inst.get()), ["propA"]);

});

QUnit.test("get and set can setup expandos", function(assert) {
	var map = new DefineMap();
	var oi = new Observation(function(){
		return map.get("foo");
	});
	canReflect.onValue(oi, function(newVal){
		assert.equal(newVal, "bar", "updated to bar");
		canReflect.offValue(oi);
	});

	map.set("foo","bar");

});

QUnit.test("default settings", function(assert) {
	var MyMap = DefineMap.extend({
		"*": "string",
		foo: {}
	});

	var m = new MyMap();
	m.set("foo",123);
	assert.ok(m.get("foo") === "123");

});

QUnit.test("default settings on unsealed", function(assert) {
	var MyMap = DefineMap.extend({
		seal: false
	},{
		"*": "string"
	});

	var m = new MyMap();
	m.set("foo",123);
	assert.ok(m.get("foo") === "123");

});

if (!System.isEnv('production')) {
	QUnit.test("extends sealed objects (#48)", function(assert) {
		var Map1 = DefineMap.extend({ seal: true }, {
			name: {
				get: function(curVal){
					return "computed " + curVal;
				}
			}
		});
		var Map2 = Map1.extend({ seal: false }, {});
		var Map3 = Map2.extend({ seal: true }, {});

		var map1 = new Map1({ name: "Justin" });
		try {
			map1.foo = "bar";
			if (map1.foo) {
				assert.ok(false, "map1 not sealed");
			} else {
				assert.ok(true, "map1 sealed - silent failure");
			}
		} catch(ex) {
			assert.ok(true, "map1 sealed");
		}
		assert.equal(map1.name, "computed Justin", "map1.name property is computed");

		var map2 = new Map2({ name: "Brian" });
		try {
			map2.foo = "bar";
			if (map2.foo) {
				assert.ok(true, "map2 not sealed");
			} else {
				assert.ok(false, "map2 sealed");
			}
		} catch (ex) {
			assert.ok(false, "map2 sealed");
		}
		assert.equal(map2.name, "computed Brian", "map2.name property is computed");

		var map3 = new Map3({ name: "Curtis" });
		try {
			map3.foo = "bar";
			if (map3.foo) {
				assert.ok(false, "map3 not sealed");
			} else {
				assert.ok(true, "map3 sealed");
			}
		} catch (ex) {
			assert.ok(true, "map3 sealed");
		}
		assert.equal(map3.name, "computed Curtis", "map3.name property is computed");
	});
}

QUnit.test("get with dynamically added properties", function(assert) {
	var map = new DefineMap();
	map.set("a",1);
	map.set("b",2);
	assert.deepEqual(map.get(), {a: 1, b: 2});
});

QUnit.test("set multiple props", function(assert) {
	var map = new DefineMap();
	map.assign({a: 0, b: 2});

	assert.deepEqual(map.get(), {a: 0, b: 2}, "added props");

	map.update({a: 2});

	assert.deepEqual(map.get(), {a: 2}, "removed b");

	map.assign({foo: {bar: "VALUE"}});

	assert.deepEqual(map.get(), {foo: {bar: "VALUE"}, a: 2}, "works nested");
});

QUnit.test("serialize responds to added props", function(assert) {
	var map = new DefineMap();
	var oi = new Observation(function(){
		return map.serialize();
	});
	
	canReflect.onValue(oi, function(newVal){
		assert.deepEqual(newVal, {a: 1, b: 2}, "updated right");
		canReflect.offValue(oi);
	});
	
	map.assign({a: 1, b: 2});
});

QUnit.test("initialize an undefined property", function(assert) {
	var MyMap = DefineMap.extend({seal: false},{});
	var instance = new MyMap({foo: "bar"});

	assert.equal(instance.foo, "bar");
});

QUnit.test("set an already initialized null property", function(assert) {
  var map = new DefineMap({ foo: null });
  map.assign({ foo: null });

  assert.equal(map.foo, null);
});

QUnit.test("creating a new key doesn't cause two changes", function(assert) {
	assert.expect(1);
	var map = new DefineMap();
	var oi = new Observation(function(){
		return map.serialize();
	});
	canReflect.onValue(oi, function(newVal){
		assert.deepEqual(newVal, {a: 1}, "updated right");
		canReflect.offValue(oi);
	});

	map.set("a", 1);
});

QUnit.test("setting nested object", function(assert) {
	var m = new DefineMap({});

	m.assign({foo: {}});
	m.assign({foo: {}});
	assert.deepEqual(m.get(), {foo: {}});
});

QUnit.test("passing a DefineMap to DefineMap (#33)", function(assert) {
	var MyMap = DefineMap.extend({foo: "observable"});
	var m = new MyMap({foo: {}, bar: {}});

	var m2 = new MyMap(m);
	assert.deepEqual(m.get(), m2.get());
	assert.ok(m.foo === m2.foo, "defined props the same");
	assert.ok(m.bar === m2.bar, "expando props the same");

});

QUnit.test("serialize: function works (#38)", function(assert) {
	var Something = DefineMap.extend({});

	var MyMap = DefineMap.extend({
		somethingRef: {
			type: function(val){
				return new Something({id: val});
			},
			serialize: function(val){
				return val.id;
			}
		},
		somethingElseRef: {
			type: function(val){
				return new Something({id: val});
			},
			serialize: false
		}
	});

	var myMap = new MyMap({somethingRef: 2, somethingElseRef: 3});

	assert.ok(myMap.somethingRef instanceof Something);
	assert.deepEqual( myMap.serialize(), {somethingRef: 2}, "serialize: function and serialize: false works");


	var MyMap2 = DefineMap.extend({
		"*": {
			serialize: function(value){
				return "" + value;
			}
		}
	});

	var myMap2 = new MyMap2({foo: 1, bar: 2});
	assert.deepEqual( myMap2.serialize(), {foo: "1", bar: "2"}, "serialize: function on default works");

});

QUnit.test("get will not create properties", function(assert) {
	var method = function(){};
	var MyMap = DefineMap.extend({
		method: method
	});
	var m = new MyMap();
	m.get("foo");

	assert.equal(m.get("method"), method);
});

QUnit.test("Properties are enumerable", function(assert) {
  assert.expect(4);

  var VM = DefineMap.extend({
	foo: "string"
  });
  var vm = new VM({ foo: "bar", baz: "qux" });

  var i = 0;
  canReflect.eachKey(vm, function(value, key){
	if(i === 0) {
	  assert.equal(key, "foo");
	  assert.equal(value, "bar");
	} else {
	  assert.equal(key, "baz");
	  assert.equal(value, "qux");
	}
	i++;
  });
});

QUnit.test("Getters are not enumerable", function(assert) {
  assert.expect(2);

  var MyMap = DefineMap.extend({
	foo: "string",
	baz: {
	  get: function(){
		return this.foo;
	  }
	}
  });

  var map = new MyMap({ foo: "bar" });

  canReflect.eachKey(map, function(value, key){
	assert.equal(key, "foo");
	assert.equal(value, "bar");
  });
});

QUnit.test("extending DefineMap constructor functions (#18)", function(assert) {
	var AType = DefineMap.extend("AType", { aProp: {}, aMethod: function(){} });

	var BType = AType.extend("BType", { bProp: {}, bMethod: function(){} });

	var CType = BType.extend("CType", { cProp: {}, cMethod: function(){} });

	var map = new CType();

	map.on("aProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "PROP");
		assert.equal(oldVal, undefined);
	});
	map.on("bProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "FOO");
		assert.equal(oldVal, undefined);
	});
	map.on("cProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "BAR");
		assert.equal(oldVal, undefined);
	});

	map.aProp = "PROP";
	map.bProp = 'FOO';
	map.cProp = 'BAR';
	assert.ok(map.aMethod);
	assert.ok(map.bMethod);
	assert.ok(map.cMethod);
});

QUnit.test("extending DefineMap constructor functions more than once (#18)", function(assert) {
	var AType = DefineMap.extend("AType", { aProp: {}, aMethod: function(){} });

	var BType = AType.extend("BType", { bProp: {}, bMethod: function(){} });

	var CType = AType.extend("CType", { cProp: {}, cMethod: function(){} });

	var map1 = new BType();
	var map2 = new CType();

	map1.on("aProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "PROP", "aProp newVal on map1");
		assert.equal(oldVal, undefined);
	});
	map1.on("bProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "FOO", "bProp newVal on map1");
		assert.equal(oldVal, undefined);
	});

	map2.on("aProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "PROP", "aProp newVal on map2");
		assert.equal(oldVal, undefined);
	});
	map2.on("cProp", function(ev, newVal, oldVal){
		assert.equal(newVal, "BAR", "cProp newVal on map2");
		assert.equal(oldVal, undefined);
	});

	map1.aProp = "PROP";
	map1.bProp = 'FOO';
	map2.aProp = "PROP";
	map2.cProp = 'BAR';
	assert.ok(map1.aMethod, "map1 aMethod");
	assert.ok(map1.bMethod);
	assert.ok(map2.aMethod);
	assert.ok(map2.cMethod, "map2 cMethod");
});

QUnit.test("extending DefineMap constructor functions - value (#18)", function(assert) {
	var AType = DefineMap.extend("AType", { aProp: {default: 1} });

	var BType = AType.extend("BType", { });

	var CType = BType.extend("CType",{ });

	var c = new CType();
	assert.equal( c.aProp , 1 ,"got initial value" );
});

QUnit.test("copying DefineMap excludes constructor", function(assert) {

	var AType = DefineMap.extend("AType", { aProp: {default: 1} });

	var a = new AType();

	var b = assign({}, a);

	assert.notEqual(a.constructor, b.constructor, "Constructor prop not copied");
	assert.equal(a.aProp, b.aProp, "Other values are unaffected");

});

QUnit.test("cloning from non-defined map excludes special keys on setup", function(assert) {
	var MyType = DefineMap.extend({

	});
	var a = new MyType({
		"foo": "bar"
	});

	var b = new DefineMap(a);

	assert.notEqual(a.constructor, b.constructor, "Constructor prop not copied");
	assert.notEqual(a._data, b._data, "_data prop not copied");
	assert.equal(a.foo, b.foo, "Other props copied");
});

QUnit.test("copying from .set() excludes special keys", function(assert) {

	var MyType = DefineMap.extend({});

	var a = new MyType({
		"foo": "bar",
		"existing": "newVal"
	});

	var b = new DefineMap({
		"existing": "oldVal"
	});
	b.assign(a);

	assert.notEqual(a.constructor, b.constructor, "Constructor prop not copied");
	assert.notEqual(a._data, b._data, "_data prop not copied");
	assert.equal(a.foo, b.foo, "NEw props copied");
});

QUnit.test("copying with assign() excludes special keys", function(assert) {

	var a = {
		_data: {},
		"foo": "bar",
		"existing": "neVal"
	};

	var b = new DefineMap({
		"existing": "oldVal"
	}, false);
	canReflect.assignMap(b, a);

	assert.notEqual(a._data, b._data, "_data prop not copied");
	assert.equal(a.foo, b.foo, "New props copied");
	assert.equal(a.existing, b.existing, "Existing props copied");

});

QUnit.test("shorthand getter setter (#56)", function(assert) {

	var Person = DefineMap.extend({
		first: "*",
		last: "*",
		get fullName() {
			return this.first + " " + this.last;
		},
		set fullName(newVal){
			var parts = newVal.split(" ");
			this.first = parts[0];
			this.last = parts[1];
		}
	});

	var p = new Person({first: "Mohamed", last: "Cherif"});

	p.on("fullName", function(ev, newVal, oldVal) {
		assert.equal(oldVal, "Mohamed Cherif");
		assert.equal(newVal, "Justin Meyer");
	});

	assert.equal(p.fullName, "Mohamed Cherif", "fullName initialized right");

	p.fullName = "Justin Meyer";
});

QUnit.test('compute props can be set to null or undefined (#2372)', function(assert) {
	var VM = DefineMap.extend({
		computeProp: {
			type: 'compute'
		}
	});

	var vmNull = new VM({computeProp: null});
	assert.equal(vmNull.get('computeProp'), null, 'computeProp is null, no error thrown');
	var vmUndef = new VM({computeProp: undefined});
	assert.equal(vmUndef.get('computeProp'), undefined, 'computeProp is undefined, no error thrown');
});

QUnit.test("Inheriting DefineMap .set doesn't work if prop is on base map (#74)", function(assert) {
	var Base = DefineMap.extend({
		baseProp: "string"
	});

	var Inheriting = Base.extend();

	var inherting = new Inheriting();

	inherting.set("baseProp", "value");


	assert.equal(inherting.baseProp,"value", "set prop");
});

if(sealWorks && System.env.indexOf('production') < 0) {
	QUnit.test("setting not defined property", function(assert) {
		var MyMap = DefineMap.extend({
			prop: {}
		});
		var mymap = new MyMap();

		try {
			mymap.notdefined = "value";
			assert.ok(false, "no error");
		} catch(e) {
			assert.ok(true, "error thrown");
		}
	});
}

QUnit.test(".extend errors when re-defining a property (#117)", function(assert) {

	var A = DefineMap.extend("A", {
		foo: {
			type: "string",
			default: "blah"
		}
	});


	A.extend("B", {
		foo: {
			type: "string",
			default: "flub"
		}
	});

	var C = DefineMap.extend("C", {
		foo: {
			get: function() {
				return "blah";
			}
		}
	});


	C.extend("D", {
		foo: {
			get: function() {
				return "flub";
			}
		}
	});
	assert.ok(true, "extended without errors");
});

QUnit.test(".value functions should not be observable", function(assert) {
	var outer = new DefineMap({
		bam: "baz"
	});

	var ItemsVM = DefineMap.extend({
		item: {
			default: function(){
				(function(){})(this.zed, outer.bam);
				return new DefineMap({ foo: "bar" });
			}
		},
		zed: "string"
	});

	var items = new ItemsVM();

	var count = 0;
	var itemsList = new Observation(function(){
		count++;
		return items.item;
	});

	canReflect.onValue(itemsList, function(){});

	items.item.foo = "changed";
	items.zed = "changed";

	assert.equal(count, 1);
});

QUnit.test(".value values are overwritten by props in DefineMap construction", function(assert) {
	var Foo = DefineMap.extend({
		bar: {
			default: "baz"
		}
	});

	var foo = new Foo({
		bar: "quux"
	});

	assert.equal(foo.bar, "quux", "Value set properly");
});

QUnit.test("can-reflect reflections work with DefineMap", function(assert) {
	var b = new DefineMap({ "foo": "bar" });
	var c = new (DefineMap.extend({
		"baz": {
			get: function() {
				return b.foo;
			}
		}
	}))({ "foo": "bar", thud: "baz" });

	assert.equal( canReflect.getKeyValue(b, "foo"), "bar", "unbound value");

	var handler = function(newValue){
		assert.equal(newValue, "quux", "observed new value");

		// Turn off the "foo" handler but "thud" should still be bound.
		canReflect.offKeyValue(c, "baz", handler);
	};
	assert.ok(!canReflect.isValueLike(c), "isValueLike is false");
	assert.ok(canReflect.isObservableLike(c), "isObservableLike is true");
	assert.ok(canReflect.isMapLike(c), "isMapLike is true");
	assert.ok(!canReflect.isListLike(c), "isListLike is false");

	assert.ok( !canReflect.keyHasDependencies(b, "foo"), "keyHasDependencies -- false");

	canReflect.onKeyValue(c, "baz", handler);
	// Do a second binding to check that you can unbind correctly.
	canReflect.onKeyValue(c, "thud", handler);
	assert.ok( canReflect.keyHasDependencies(c, "baz"), "keyHasDependencies -- true");

	b.foo = "quux";
	c.thud = "quux";

	assert.equal( canReflect.getKeyValue(c, "baz"), "quux", "bound value");
	// sanity checks to ensure that handler doesn't get called again.
	b.foo = "thud";
	c.baz = "jeek";

});

QUnit.test("can-reflect setKeyValue", function(assert) {
	var a = new DefineMap({ "a": "b" });

	canReflect.setKeyValue(a, "a", "c");
	assert.equal(a.a, "c", "setKeyValue");
});

QUnit.test("can-reflect deleteKeyValue", function(assert) {
	var a = new DefineMap({ "a": "b" });

	canReflect.deleteKeyValue(a, "a");
	assert.equal(a.a, undefined, "value is now undefined");
	assert.ok(!("a" in a.get()), "value not included in serial");
});

QUnit.test("can-reflect getKeyDependencies", function(assert) {
	var a = new DefineMap({ "a": "a" });
	var b = new (DefineMap.extend({
		"a": {
			get: function() {
				return a.a;
			}
		}
	}))();

	// DefineMaps bind automatically without events, so this is already running.
	assert.ok(canReflect.getKeyDependencies(b, "a"), "dependencies exist");
	assert.ok(!canReflect.getKeyDependencies(b, "b"), "no dependencies exist for unknown value");
	assert.ok(canReflect.getKeyDependencies(b, "a").valueDependencies.has(b._computed.a.compute), "dependencies returned");

});

QUnit.test("can-reflect assign", function(assert) {
	var aData = { "a": "b" };
	var bData = { "b": "c" };

	var a = new DefineMap(aData);
	var b = new DefineMap(bData);

	canReflect.assign( a,b);
	assert.deepEqual(a.get(), assign(aData, bData), "when called with an object, should merge into existing object");
});

QUnit.test("Does not attempt to redefine _data if already defined", function(assert) {
	var Bar = DefineMap.extend({seal: false}, {
		baz: { default: "thud" }
	});

	var baz = new Bar();

	define(baz, {
		quux: { default: "jeek" },
		plonk: {
			get: function() {
				return "waldo";
			}
		}
	}, baz._define);

	assert.equal(baz.quux, "jeek", "New definitions successful");
	assert.equal(baz.plonk, "waldo", "New computed definitions successful");
	assert.equal(baz.baz, "thud", "Old definitions still available");

});

if (!System.isEnv('production')) {
	QUnit.test("redefines still not allowed on sealed objects", function(assert) {
		assert.expect(6);
		var Bar = DefineMap.extend({seal: true}, {
			baz: { default: "thud" }
		});

		var baz = new Bar();

		try {
			define(baz, {
				quux: { default: "jeek" }
			}, baz._define);
		} catch(e) {
			assert.ok(/is not extensible/i.test(e.message), "Sealed object throws on data property defines");
			assert.ok(!Object.getOwnPropertyDescriptor(baz, "quux"), "nothing set on object");
			assert.ok(!Object.getOwnPropertyDescriptor(baz._data, "quux"), "nothing set on _data");
		}

		try {
			define(baz, {
				plonk: {
					get: function() {
						return "waldo";
					}
				}
			}, baz._define);
		} catch(e) {
			assert.ok(/is not extensible/i.test(e.message), "Sealed object throws on computed property defines");
			assert.ok(!Object.getOwnPropertyDescriptor(baz, "plonk"), "nothing set on object");
			assert.ok(!Object.getOwnPropertyDescriptor(baz._computed, "plonk"), "nothing set on _computed");
		}
	});
}

QUnit.test("Call .get() when a nested object has its own get method", function(assert) {
	var Bar = DefineMap.extend({
		request: "*"
	});

	var request = {
		prop: 22,
		get: function(){
			if(arguments.length === 0) {
				throw new Error("This function can't be called with 0 arguments");
			}
		}
	};

	var obj = new Bar({ request: request });
	var data = obj.get();

	assert.equal(data.request.prop, 22, "obj did get()");
});

QUnit.test("DefineMap short-hand Type (#221)", function(assert) {
	var Child = DefineMap.extend('child', {
		other: DefineMap
	});

	var c = new Child();
	c.other = {
		prop: 'hello'
	};

	assert.ok(c.other instanceof DefineMap, "is a DefineMap");

});

QUnit.test("non-Object constructor", function(assert) {
	var Constructor = DefineMap.extend();
	assert.ok(!isPlainObject(new DefineMap()), "instance of DefineMap is not a plain object");
	assert.ok(!isPlainObject(new Constructor()), "instance of extended DefineMap is not a plain object");
});

QUnit.test('Observation bound to getter using lastSetVal updates correctly (canjs#3541)', function(assert) {
	var MyMap = DefineMap.extend({
		foo: {
			get: function(lastSetVal) {
				if (lastSetVal) {
					return lastSetVal;
				}
			}
		}
	});
	var map = new MyMap();
	var oi = new Observation(function(){
		return map.get("foo");
	});
	canReflect.onValue(oi, function(newVal){
		assert.equal(newVal, "bar", "updated to bar");
	});

	map.set("foo","bar");

});

QUnit.test('Observation bound to async getter updates correctly (canjs#3541)', function(assert) {
	var MyMap = DefineMap.extend({
		foo: {
			get: function(lastSetVal, resolve) {
				if (lastSetVal) {
					return resolve(lastSetVal);
				}
			}
		}
	});
	var map = new MyMap();
	var oi = new Observation(function(){
		return map.get("foo");
	});
	canReflect.onValue(oi, function(newVal){
		assert.equal(newVal, "bar", "updated to bar");
	});

	map.set("foo","bar");

});

canTestHelpers.devOnlyTest("log all property changes", function(assert) {
	var done = assert.async();

	var Person = DefineMap.extend({
		first: "string",
		last: "string",
		children: {
			Type: DefineList
		},
		fullName: {
			get: function(){
				return this.first + " " + this.last;
			}
		}
	});

	var changed = [];
	var log = dev.log;
	dev.log = function() {
		// collect the property keys that were logged
		changed.push(JSON.parse(arguments[2]));
	};

	var p = new Person();
	p.log();

	// bind fullName to get events from the getter
	p.on("fullName", function() {});

	p.first = "Manuel";
	p.last = "Mujica";

	assert.expect(1);
	setTimeout(function() {
		dev.log = log;
		assert.deepEqual(
			changed,
			["first", "fullName", "last", "fullName"],
			"should log all property changes"
		);
		done();
	});
});

canTestHelpers.devOnlyTest("log single property changes", function(assert) {
	var done = assert.async();

	var Person = DefineMap.extend({
		first: "string",
		last: "string",
		age: "number"
	});

	var changed = [];
	var log = dev.log;
	dev.log = function() {
		// collect the property keys that were logged
		changed.push(JSON.parse(arguments[2]));
	};

	var p = new Person();
	p.log("first");

	p.first = "John";
	p.last = "Doe";
	p.age = 99;

	assert.expect(1);
	setTimeout(function() {
		dev.log = log;
		assert.deepEqual(changed, ["first"], "should log 'first' changes");
		done();
	});
});

canTestHelpers.devOnlyTest("log multiple property changes", function(assert) {
	var done = assert.async();

	var Person = DefineMap.extend({
		first: "string",
		last: "string",
		age: "number",
		company: "string"
	});

	var changed = [];
	var log = dev.log;
	dev.log = function() {
		// collect the property keys that were logged
		changed.push(JSON.parse(arguments[2]));
	};

	var p = new Person();
	p.log("first");
	p.log("age");

	p.first = "John";
	p.last = "Doe";
	p.company = "Bitovi";
	p.age = 99;

	assert.expect(1);
	setTimeout(function() {
		dev.log = log;
		assert.deepEqual(changed, ["first", "age"], "should log first and age");
		done();
	});
});

canTestHelpers.devOnlyTest("Setting a value with an object type generates a warning (#148)", function(assert) {
	assert.expect(1);

	var message = "can-define: The default value for DefineMap{}.options is set to an object. This will be shared by all instances of the DefineMap. Use a function that returns the object instead.";
	var finishErrorCheck = canTestHelpers.willWarn(message);

	//should issue a warning
	DefineMap.extend({
		options: {
			default: {}
		}
	});
	//should issue a warning
	DefineMap.extend({
		options: {
			default: []
		}
	});

	//should not issue a warning
	DefineMap.extend({
		options: {
			default: function(){}
		}
	});

	//should not issue a warning
	DefineMap.extend({
		options: {
			default: 2
		}
	});

	assert.equal(finishErrorCheck(), 2);
});

canTestHelpers.devOnlyTest("Setting a default value to a constructor type generates a warning", function(assert) {
	assert.expect(1);

	var message = "can-define: The \"default\" for DefineMap{}.options is set to a constructor. Did you mean \"Default\" instead?";
	var finishErrorCheck = canTestHelpers.willWarn(message);

	//should issue a warning
	DefineMap.extend({
		options: {
			default: DefineMap
		}
	});

	assert.equal(finishErrorCheck(), 1);
});

canTestHelpers.devOnlyTest("can.getName symbol behavior", function(assert) {
	var getName = function(instance) {
		return instance[canSymbol.for("can.getName")]();
	};

	assert.ok(
		"DefineMap{}", getName(new DefineMap()),
		"should use DefineMap constructor name by default"
	);

	var MyMap = DefineMap.extend("MyMap", {});

	assert.ok(
		"MyMap{}", getName(new MyMap()),
		"should use custom map name when provided"
	);
});

canTestHelpers.devOnlyTest("Error on not using a constructor or string on short-hand definitions (#278)", function(assert) {
	assert.expect(5);
	var message = /does not match a supported propDefinition. See: https:\/\/canjs.com\/doc\/can-define.types.propDefinition.html/i;

	var finishErrorCheck = canTestHelpers.willError(message, function(actual, match) {
		var rightProp = /prop0[15]/;
		assert.ok(rightProp.test(actual.split(" ")[0]));
		assert.ok(match);
	});

	DefineMap.extend('ShortName', {
		prop01: 0,
		prop02: function() {},
		prop03: 'string',
		prop04: DefineMap,
		prop05: "a string that is not a type",
		prop06: [],
		get prop07() {},
		set prop07(newVal) {},
		prop08: 'boolean'
	});

	assert.equal(finishErrorCheck(), 2);
});

QUnit.test('Improper shorthand properties are not set', function(assert) {
	var VM = DefineMap.extend({
		prop01: 0,
		prop02: function() {},
		prop03: 'some random string'
	});

	assert.equal(VM.prototype._define.methods.prop01, undefined);
	assert.equal(typeof VM.prototype._define.methods.prop02, 'function');
	assert.equal(VM.prototype._define.methods.prop03, undefined);
});

QUnit.test("onKeyValue sets up computed values", function(assert) {
	var fullNameCalls = [];
	var VM = DefineMap.extend({
		first: "string",
		last: "string",
		get fullName() {
			fullNameCalls.push(this.first + " "+ this.last);
			return this.first + " "+ this.last;
		}
	});

	var vm = new VM({first: "J", last: "M"});

	canReflect.onKeyValue(vm, "fullName", function(){});

	assert.deepEqual(fullNameCalls,["J M"]);

});

QUnit.test("async getters derived from other properties should have correct keyDependencies", function(assert) {

	var VM = DefineMap.extend({
		get source() {
			return 'source value';
		},

		derived: {
			get: function(last, resolve) {
				return resolve(this.source);
			}
		}
	});

	var vm = new VM();

	vm.on('derived', function(){});
	assert.ok(vm._computed.derived.compute.observation.newDependencies.keyDependencies.get(vm).has('source'), 'getter should depend on vm.source');
});

var sealDoesErrorWithPropertyName = (function () {
	'use strict';
	var o = Object.seal({});
	try {
		o.foo = "bar";
	} catch (error) {
		return error.message.indexOf('foo') !== -1;
	}
	return false;
})();

canTestHelpers.devOnlyTest("setting a property gives a nice error", function(assert){
	var VM = DefineMap.extend({});
	var vm = new VM();

	try {
		vm.set("fooxyz","bar");
	} catch (error) {
		if (sealDoesErrorWithPropertyName) {
			assert.ok(
				error.message.indexOf("fooxyz") !== -1,
				"Set property error with property name should be thrown"
			);
		} else {
			assert.ok(true, 'Set property error should be thrown');
		}
	}
});

canTestHelpers.devOnlyTest("can.hasKey and can.hasOwnKey (#303) (#412)", function(assert) {

	var hasKeySymbol = canSymbol.for("can.hasKey"),
		hasOwnKeySymbol = canSymbol.for("can.hasOwnKey");

	var Parent = DefineMap.extend({
		parentProp: "any",

		get parentDerivedProp() {
			if (this.parentProp) {
				return "parentDerived";
			}
		}
	});

	var VM = Parent.extend({
		prop: "any",

		get derivedProp() {
			if (this.prop) {
				return "derived";
			}
		}
	});

	var vm = new VM();

	// hasKey
	assert.equal(vm[hasKeySymbol]("prop"), true, "vm.hasKey('prop') true");
	assert.equal(vm[hasKeySymbol]("derivedProp"), true, "vm.hasKey('derivedProp') true");

	assert.equal(vm[hasKeySymbol]("parentProp"), true, "vm.hasKey('parentProp') true");
	assert.equal(vm[hasKeySymbol]("parentDerivedProp"), true, "vm.hasKey('parentDerivedProp') true");

	assert.equal(vm[hasKeySymbol]("anotherProp"), false, "vm.hasKey('anotherProp') false");

	// hasOwnKey
	assert.equal(vm[hasOwnKeySymbol]("prop"), true, "vm.hasOwnKey('prop') true");
	assert.equal(vm[hasOwnKeySymbol]("derivedProp"), true, "vm.hasOwnKey('derivedProp') true");

	assert.equal(vm[hasOwnKeySymbol]("parentProp"), false, "vm.hasOwnKey('parentProp') false");
	assert.equal(vm[hasOwnKeySymbol]("parentDerivedProp"), false, "vm.hasOwnKey('parentDerivedProp') false");

	assert.equal(vm[hasOwnKeySymbol]("anotherProp"), false, "vm.hasOwnKey('anotherProp') false");

	var map = new DefineMap({expandoKey: undefined});
	assert.equal(map[hasKeySymbol]("expandoKey"), true, "map.hasKey('expandoKey')  (#412)");
});

canTestHelpers.devOnlyTest("getOwnKeys, getOwnEnumerableKeys (#326)", function(assert) {
	var getOwnEnumerableKeysSymbol = canSymbol.for("can.getOwnEnumerableKeys"),
		getOwnKeysSymbol = canSymbol.for("can.getOwnKeys");

	var Parent = DefineMap.extend({
		parentProp: "any",

		get parentDerivedProp() {
			if (this.parentProp) {
				return "parentDerived";
			}
		},

		parentValueProp: {
			value: function(prop) {
				if (this.parentProp) {
					prop.resolve(this.parentProp);
				}

				prop.listenTo("parentProp", prop.resolve);
			}
		}
	});

	var VM = Parent.extend({
		prop: "any",

		get derivedProp() {
			if (this.prop) {
				return "derived";
			}
		},

		valueProp: {
			value: function(prop) {
				if (this.prop) {
					prop.resolve(this.prop);
				}

				prop.listenTo("prop", prop.resolve);
			}
		}
	});

	var vm = new VM();

	// getOwnEnumerableKeys
	assert.deepEqual( vm[getOwnEnumerableKeysSymbol](), [ "prop", "valueProp", "parentProp", "parentValueProp" ], "vm.getOwnEnumerableKeys()");

	// getOwnKeys
	assert.deepEqual( vm[getOwnKeysSymbol](), [ "prop", "valueProp", "parentProp", "parentValueProp", "derivedProp", "parentDerivedProp" ], "vm.getOwnKeys()");
});

QUnit.test("value as a string breaks", function(assert) {
	var MyMap = DefineMap.extend({
		prop: {value: "a string"}
	});
	var my = new MyMap();
	assert.equal(my.prop, "a string", "works");
});

QUnit.test("canReflect.getSchema", function(assert) {

	// For #401
	var StringIgnoreCase = canReflect.assignSymbols({},{
		"can.new": function(value){
			return value.toLowerCase();
		}
	});

	var MyType = DefineMap.extend({
		id: {identity: true, type: "number"},
		name: "string",
		foo: {serialize: false},
		lowerCase: StringIgnoreCase,
		text: MaybeString,

		maybeString_type: {type: MaybeString},
		maybeString_Type: {Type: MaybeString}
	});

	var schema = canReflect.getSchema(MyType);

	assert.deepEqual(schema.identity, ["id"], "right identity");
	assert.deepEqual(Object.keys(schema.keys), ["id","name","lowerCase","text","maybeString_type","maybeString_Type"], "right key names");

	assert.equal( canReflect.convert("1", schema.keys.id), 1, "converted to number");

	assert.equal( canReflect.convert(3, schema.keys.id), "3", "converted to number");

	assert.equal(schema.keys.name, MaybeString, " 'string' -> MaybeString");
	assert.equal(schema.keys.lowerCase, StringIgnoreCase, "StringIgnoreCase");
	assert.equal(schema.keys.text, MaybeString, "MaybeString");

	assert.equal(schema.keys.maybeString_type, MaybeString, "{type: MaybeString}");
	assert.equal(schema.keys.maybeString_Type, MaybeString, "{Type: MaybeString}");

});


QUnit.test("use can.new and can.serialize for conversion", function(assert) {
	var Status = canReflect.assignSymbols({},{
        "can.new": function(val){

            return val.toLowerCase();
        },
        "can.getSchema": function(){
            return {
                type: "Or",
                values: ["new","assigned","complete"]
            };
        },
		"can.serialize": function(){
			return this.toUpperCase();
		}
    });

    var Todo = DefineMap.extend("Todo",{
        status: Status
    });


	var todo = new Todo({status: "NEW"});
	assert.equal(todo.status, "new", "converted during set");

	assert.deepEqual(todo.serialize(),{status: "NEW"}, "serialized to upper case");

	var Todo2 = DefineMap.extend("Todo",{
		due: "date"
	});

	var date = new Date(2018,3,30);

	var todo2 = new Todo2({
		due: date.toString()
	});

	assert.ok(todo2.due instanceof Date, "converted to a date instance");

	var res = todo2.serialize();

	assert.deepEqual(res,{due: date}, "serialized to a date?");
});

QUnit.test("make sure stringOrObservable works", function(assert) {
	var Type = DefineMap.extend({
		val : "stringOrObservable"
	});

	var type  = new Type({val: "foo"});

	assert.equal(type.val, "foo", "works");
});

QUnit.test("primitive types work with val: Type", function(assert) {
	var UpperCase = {};
	UpperCase[canSymbol.for("can.new")] = function(val){
		return val.toUpperCase();
	};

	var Type = DefineMap.extend({
		val: UpperCase
	});

	var type = new Type({ val: "works" });
	assert.equal(type.val, "WORKS", "it worked");
});

QUnit.test("primitive types work with val: {Type: Type}", function(assert) {
	var UpperCase = {};
	UpperCase[canSymbol.for("can.new")] = function(val){
		return val.toUpperCase();
	};

	var Type = DefineMap.extend({
		val: {
			Type: UpperCase
		}
	});

	var type = new Type({ val: "works" });
	assert.equal(type.val, "WORKS", "it worked");
});

QUnit.test("primitive types work with val: {type: Type}", function(assert) {
	var UpperCase = {};
	UpperCase[canSymbol.for("can.new")] = function(val){
		return val.toUpperCase();
	};

	var Type = DefineMap.extend({
		val: {
			type: UpperCase
		}
	});

	var type = new Type({ val: "works" });
	assert.equal(type.val, "WORKS", "it worked");
});

QUnit.test("ownKeys works on basic DefineMaps", function(assert) {
	var map = new DefineMap({ first: "Jane", last: "Doe" });
	var keys = canReflect.getOwnKeys(map);

	assert.equal(keys.length, 2, "There are 2 keys");
});

QUnit.test("deleteKey works (#351)", function(assert) {

	var map = new DefineMap({foo: "bar"});

	assert.deepEqual( canReflect.getOwnKeys(map), ["foo"] );

	map.set("zed", "ted");

	assert.deepEqual( canReflect.getOwnKeys(map), ["foo","zed"] );

	map.deleteKey("zed");

	assert.deepEqual( canReflect.getOwnKeys(map), ["foo"] );

	map.deleteKey("foo");

	// We should keep the property descriptor
	// var pd = Object.getOwnPropertyDescriptor(map, "foo");
	// assert.ok(!pd, "no property descriptor");

	assert.deepEqual( canReflect.getOwnKeys(map), [] );

	map.set("foo", "bar");

	// With sealed
	map = new DefineMap({foo: "bar"}, true);

	map.deleteKey("foo");

	assert.equal(map.foo, undefined, "prop set to undefined");
});

QUnit.test("makes sure observation add is called (#393)", function(assert) {
	var map = new DefineMap({foo: "bar"});

	canReflect.deleteKeyValue(map, "foo");

	ObservationRecorder.start();
	(function(){ return map.foo; }());
	var result = ObservationRecorder.stop();
	assert.deepEqual(canReflect.toArray( result.keyDependencies.get(map) ), ["foo"], "toArray" );
});

QUnit.test("type called with `this` as the map (#349)", function(assert) {
	var Type = DefineMap.extend({
		foo: {
			type: function(){
				assert.equal(Type, this.constructor, "got the right this");
				return 5;
			},
			default: 4
		}
	});

	var map = new Type();
	assert.equal(map.foo, 5);
});

QUnit.test("expandos use default type (#383)", function(assert) {
	var AllNumbers = DefineMap.extend({
		"*": {type: "number"}
	});

	var someNumbers = new AllNumbers({
		version: "24"
	});
	assert.ok(someNumbers.version === 24, "is 24");
});

QUnit.test("do not enumerate anything other than key properties (#369)", function(assert) {
	// Internet Explorer doesn't correctly skip properties that are non-enumerable
	// on the current object, but enumerable on the prototype:
	var ancestor = { prop: true };
	var F = function() {};
	F.prototype = ancestor;
	var descendant = new F();
	Object.defineProperty(descendant, "prop", {
		writable: true,
		configurable: true,
		enumerable: false,
		value: true
	});

	var test = {};
	for (var k in descendant) {
		test[k] = descendant[k];
	}
	if (test.prop) {
		return assert.ok(test.prop, "Browser doesn't correctly skip shadowed enumerable properties");
	}


	var Type = DefineMap.extend({
		aProp: "string",
		aMethod: function(){}
	});

	var instance = new Type({aProp: "VALUE", anExpando: "VALUE"});

	var props = {};
	for (var prop in instance) {
		props[prop] = true;
	}
	assert.deepEqual(props,{
		aProp: true,
		anExpando: true,
		aMethod: true // TODO: this should be removed someday
	});
});

QUnit.test("Properties added via defineInstanceKey are observable", function(assert) {
	var Type = DefineMap.extend({});
	var map = new Type();

	var obs = new Observation(function(){
		return canReflect.serialize(map);
	});

	var count = 0;
	canReflect.onValue(obs, function(val) {
		count++;

		if(count === 2) {
			assert.deepEqual(val, {foo:"bar"}, "changed value");
		}
	});
	
	canReflect.defineInstanceKey(Type, "foo", {
		type: "string"
	});
	
	map.foo = "bar";
});

QUnit.test("Serialized computes do not prevent getters from working", function(assert) {
	var Type = DefineMap.extend("MyType", {
		page: "string",
		myPage: {
			get: function(last, resolve) {
				return this.page;
			}
		}
	});

	var first = new Type({ page: "one" });
	var firstObservation = new Observation(function() {
		return canReflect.serialize(first);
	});

	var boundTo = Function.prototype;
	canReflect.onValue(firstObservation, boundTo);

	var second = new Type({ page: "two" });

	assert.equal(second.myPage, "two", "Runs the getter correctly");
});

QUnit.test("setup should be called (#395)", function(assert) {
	var calls = [];
	var Base = DefineMap.extend("Base",{
		setup: function(attrs) {
			calls.push(this);
			return DefineMap.prototype.setup.apply(this, arguments);
		}
	});

	var Super = Base.extend("Super",{});

	var base = new Base();
	var supa = new Super();

	assert.deepEqual(calls,[base, supa], "setup called");
});

QUnit.test("Set new prop to undefined #408", function(assert) {
	var obj = new DefineMap({});
	var PATCHES = [
		[ { type: "add", key: "foo", value: undefined } ],
		[ { type: "set", key: "foo", value: "bar" } ]
	];
	var calledPatches = [];
	var handler = function(patches){
		calledPatches.push(patches);
	};
	obj[canSymbol.for("can.onPatches")](handler,"notify");
	obj.set("foo", undefined);
	obj.set("foo", "bar");
	assert.deepEqual(calledPatches, PATCHES);
});

QUnit.test("Set __inSetup prop #421", function(assert) {
	var map = new DefineMap({});
	map.set("__inSetup", "nope");
	assert.equal(map.__inSetup, "nope");
});

QUnit.test("'*' wildcard type definitions that use constructors works for expandos #425", function(assert) {
	var MyType = function MyType() {};
	MyType.prototype = {};

	var OtherType = DefineMap.extend({ seal : false }, {
		"*" : MyType
	});

	var map = new OtherType();
	map.set( "foo", {});
	var foo = map.get( "foo" );
	assert.ok(foo instanceof MyType);
});

QUnit.test("'*' wildcard type definitions that use DefineMap constructors works for expandos #425", function(assert) {
	var MyType = DefineMap.extend({});

	var OtherType = DefineMap.extend({ seal : false }, {
		"*" : MyType
	});

	var map = new OtherType();
	map.set( "foo", {});
	var foo = map.get( "foo" );
	assert.ok(foo instanceof MyType);
});

require("can-reflect-tests/observables/map-like/instance/on-event-get-set-delete-key")("DefineMap", function(){
    return new DefineMap();
});
