var Scope = require('can-view-scope');
var observeReader = require('can-stache-key');
var TemplateContext = require('../template-context');
var canSymbol = require("can-symbol");

var QUnit = require('steal-qunit');
var canReflect = require("can-reflect");
var Observation = require('can-observation');
var testHelpers = require('can-test-helpers');
var SimpleMap = require('can-simple-map');
var SimpleObservable = require('can-simple-observable');
var ObservationRecorder = require('can-observation-recorder');
var canReflectDeps = require('can-reflect-dependencies');
var canStacheHelpers = require('can-stache-helpers');

QUnit.module('can/view/scope');

QUnit.test("basics",function(assert) {
	var address =  new SimpleMap({zip: 60647});
	var person = new SimpleMap({name: "Justin", address: address});
	var items = new SimpleMap({ people: person, count: 1000 });

	var itemsScope = new Scope(items),
		personScope = new Scope(person, itemsScope),
		zipScope = new Scope( address, personScope );

	var nameInfo;
	var c = new Observation(function(){
		nameInfo = zipScope.read('../name');
	});
	canReflect.onValue(c, function(){});

	assert.deepEqual(nameInfo.reads, [{key: "name", at: false}], "reads");
	assert.equal(nameInfo.scope, personScope, "scope");
	assert.equal(nameInfo.value,"Justin", "value");
	assert.equal(nameInfo.rootObserve, person, "rootObserve");

});

QUnit.test('Scope.prototype.computeData', function(assert) {
	var map = new SimpleMap();
	var base = new Scope(map);
	var computeData = base.computeData('age');

	assert.equal(computeData.observation, computeData.options.observation, 'ScopeKeyData should have a backing observation stored on its `options`');

	var age = computeData.compute;
	assert.equal(age(), undefined, 'age is not set');
	age.bind('change', function (ev, newVal, oldVal) {
		assert.equal(newVal, 31, 'newVal is provided correctly');
		assert.equal(oldVal, undefined, 'oldVal is undefined');
	});
	age(31);
	assert.equal(map.attr('age'), 31, 'maps age is set correctly');
});
QUnit.test('backtrack path (#163)', function(assert) {
	var row = new SimpleMap({
		first: 'Justin'
	}),
		col = {
			format: 'str'
		},
		base = new Scope(row),
		cur = base.add(col);
	assert.equal(cur.peek('.'), col, 'got col');
	assert.equal(cur.peek('..'), row, 'got row');
	assert.equal(cur.peek('../first'), 'Justin', 'got row');
});

QUnit.test('nested properties with compute', function(assert) {
	var me = new SimpleMap({
		name: new SimpleMap({
			first: 'Justin'
		})
	});
	var cur = new Scope(me);
	var compute = cur.computeData('name.first')
		.compute;
	var changes = 0;
	var handler =  function (ev, newVal, oldVal) {
		if (changes === 0) {
			assert.equal(oldVal, 'Justin');
			assert.equal(newVal, 'Brian');
		} else if (changes === 1) {
			assert.equal(oldVal, 'Brian');
			assert.equal(newVal, undefined);
		} else if (changes === 2) {
			assert.equal(oldVal, undefined);
			assert.equal(newVal, 'Payal');
		} else if (changes === 3) {
			assert.equal(oldVal, 'Payal');
			assert.equal(newVal, 'Curtis');
		}
		changes++;
	};

	compute.bind('change',handler);
	assert.equal(compute(), 'Justin', 'read value after bind');

	me.attr('name').attr('first', 'Brian');
	me.attr('name',undefined);
	me.attr('name', {
		first: 'Payal'
	});
	me.attr('name', new SimpleMap({
		first: 'Curtis'
	}));

	compute.unbind('change',handler);
});
QUnit.test('function at the end', function(assert) {
	var compute = new Scope({
		me: {
			info: function () {
				return 'Justin';
			}
		}
	})
		.computeData('me.info')
		.compute;
	assert.equal(compute()(), 'Justin');
	var fn = function () {
		return this.name;
	};
	var compute2 = new Scope({
		me: {
			info: fn,
			name: 'Hank'
		}
	})
		.computeData('me.info', {
			isArgument: true,
			args: []
		})
		.compute;
	assert.equal(compute2()(), 'Hank');
});
QUnit.test('binds to the right scope only', function(assert) {
	var baseMap = new SimpleMap({
		me: new SimpleMap({
			name: new SimpleMap({
				first: 'Justin'
			})
		})
	});
	var base = new Scope(baseMap);
	var topMap = new SimpleMap({
		me: new SimpleMap({
			name: new SimpleMap({})
		})
	});
	var scope = base.add(topMap);
	var compute = scope.computeData('../me.name.first')
		.compute;
	compute.bind('change', function (ev, newVal, oldVal) {
		assert.equal(oldVal, 'Justin');
		assert.equal(newVal, 'Brian');
	});
	assert.equal(compute(), 'Justin');
	// this should do nothing
	topMap.attr('me').attr('name').attr('first', 'Payal');
	baseMap.attr('me').attr('name').attr('first', 'Brian');
});
QUnit.test('Scope read returnObserveMethods=true', function(assert) {
	var MapConstruct = SimpleMap.extend({
		foo: function (arg) {
			assert.equal(this, data.map, 'correct this');
			assert.equal(arg, true, 'correct arg');
		}
	});
	var data = {
		map: new MapConstruct()
	};
	var res = Scope.read(data, observeReader.reads('map.foo'), {
		isArgument: true
	});
	res.value(true);
});
QUnit.test('rooted observable is able to update correctly', function(assert) {
	var baseMap = new SimpleMap({
		name: new SimpleMap({
			first: 'Justin'
		})
	});
	var scope = new Scope(baseMap);
	var compute = scope.computeData('name.first')
		.compute;
	assert.equal(compute(), 'Justin');
	baseMap.attr('name', new SimpleMap({
		first: 'Brian'
	}));
	assert.equal(compute(), 'Brian');
});
QUnit.test('computeData reading an object with a compute', function(assert) {
	var age = new SimpleObservable(21);

	var scope = new Scope({
		person: {
			age: age
		}
	});

	var computeData = scope.computeData('person.age');
	var value = computeData.compute();

	assert.equal(value, 21, 'correct value');

	computeData.compute(31);
	assert.equal(age.get(), 31, 'age updated');
});
QUnit.test('computeData with initial empty compute (#638)', function(assert) {
	assert.expect(2);
	var c = new SimpleObservable();
	var scope = new Scope({
		compute: c
	});
	var computeData = scope.computeData('compute');
	assert.equal(computeData.compute(), undefined);
	computeData.compute.bind('change', function (ev, newVal) {
		assert.equal(newVal, 'compute value');
	});
	c.set('compute value');
});

QUnit.test('Can read static properties on constructors (#634)', function(assert) {
	var Foo = SimpleMap.extend( {
		static_prop: 'baz'
	}, {
		proto_prop: 'thud'
	});
	var data = new Foo({
		own_prop: 'quux'
	}),
		scope = new Scope(data);
	assert.equal(scope.computeData('constructor.static_prop')
		.compute(), 'baz', 'static prop');
});

QUnit.test("Can read static properties on constructors (#634)", function(assert) {
	var Foo = SimpleMap.extend({
		static_prop: "baz"
	}, {
		proto_prop: "thud"
	});
	var data = new Foo({
		own_prop: "quux"
	}),
		scope = new Scope(data);

	assert.equal(scope.computeData("constructor.static_prop")
		.compute(), "baz", "static prop");
});

QUnit.test('Scope lookup restricted to current scope with ./ (#874)', function(assert) {
	var current;
	var scope = new Scope(
			new SimpleMap({value: "A Value"})
		).add(
			current = new SimpleMap({})
		);

	var compute = scope.computeData('./value').compute;

	assert.equal(compute(), undefined, "no initial value");


	compute.bind("change", function(ev, newVal){
		assert.equal(newVal, "B Value", "changed");
	});

	compute("B Value");
	assert.equal(current.attr("value"), "B Value", "updated");

});

QUnit.test('reading properties on undefined (#1314)', function(assert) {

	var scope = new Scope(undefined);

	var compute = scope.compute("property");

	assert.equal(compute(), undefined, "got back undefined");

});






QUnit.test("computeData.compute get/sets computes in maps", function(assert) {
	var cmpt = new SimpleObservable(4);
	var map = new SimpleMap();
	map.attr("computer", cmpt);

	var scope = new Scope(map);
	var computeData = scope.computeData("computer",{});

	assert.equal( computeData.compute(), 4, "got the value");

	computeData.compute(5);
	assert.equal(cmpt.get(), 5, "updated compute value");
	assert.equal( computeData.compute(), 5, "the compute has the right value");
});

QUnit.test("computesData can find update when initially undefined parent scope becomes defined (#579)", function(assert) {
	assert.expect(2);

	var map = new SimpleMap();
	var scope = new Scope(map);
	var top = scope.add(new SimpleMap());

	var computeData = top.computeData("../value",{});

	assert.equal( computeData.compute(), undefined, "initially undefined");

	computeData.compute.bind("change", function(ev, newVal){
		assert.equal(newVal, "first");
	});

	map.attr("value","first");


});



QUnit.test("can read parent context with ../ (#2244)", function(assert) {
	var map = new SimpleMap();
	var scope = new Scope(map);
	var top = scope.add(new SimpleMap());

	assert.equal( top.peek("../"), map, "looked up value correctly");

});

QUnit.test("trying to read constructor from refs scope is ok", function(assert) {
	var map = new TemplateContext();
	var construct = new Observation(function(){
		return map.constructor;
	});
	canReflect.onValue(construct, function() {});
	assert.equal(canReflect.getValue(construct), TemplateContext);
});

QUnit.test("reading from a string in a nested scope doesn't throw an error (#22)",function(assert) {
	var foo = new SimpleObservable('foo');
	var bar = new SimpleObservable('bar');
	var scope = new Scope(foo);
	var localScope = scope.add(bar);

	assert.equal(localScope.read('foo').value, undefined);
});

QUnit.test("Optimize for compute().observableProperty (#29)", function(assert) {
	var map = new SimpleMap({value: "a"});
	var wrap = new SimpleObservable(map);

	var scope = new Scope(wrap);
	var scopeKeyData = scope.computeData("value");
	var scopeCompute = scopeKeyData.compute;

	var changeNumber = 0;
	scopeCompute.on("change", function(ev, newVal, oldVal){
		if(changeNumber === 1) {
			assert.equal(newVal, "b");
			assert.equal(oldVal, "a");
			assert.ok(scopeKeyData.fastPath, "still fast path");
			changeNumber++;
			wrap.set(new SimpleMap({value: "c"}));
		} else if(changeNumber === 2) {
			assert.equal(newVal, "c", "got new value");
			assert.equal(oldVal, "b", "got old value");
			assert.notOk(scopeKeyData.fastPath, "still fast path");
		}

	});

	assert.ok(scopeKeyData.fastPath, "fast path");

	changeNumber++;
	map.attr("value", "b");
});

QUnit.test("a compute can observe the ScopeKeyData", function(assert) {
	assert.expect(3);

	var map = new SimpleMap({value: "a", other: "b"});
	var wrap = new SimpleObservable(map);

	var scope = new Scope(wrap);
	var scopeKeyData = scope.computeData("value");

	var oldOnValue = scopeKeyData[canSymbol.for("can.onValue")];

	// this is called twice ... once for the "temporarilyBind",
	// another for when the compute is actually binding.
	// It might be possible to avoid temporarilyBind by giving what the handler should be
	scopeKeyData[canSymbol.for("can.onValue")] = function(){
		assert.ok(true, "bound on the scopeKeyData");
		return oldOnValue.apply(this, arguments);
	};

	var c = new Observation(function(){
		return scopeKeyData.get() + map.attr("other");
	});

	canReflect.onValue( c, function(newValue){
		assert.equal(newValue,"Ab", "observation changed");
	});

	map.attr("value","A");

});

QUnit.test("unbinding clears all event bindings", function(assert) {
    var ready = assert.async();
    var map = new SimpleMap({value: "a", other: "b"});
    var wrap = new SimpleObservable(map);

    var scope = new Scope(wrap);
    var scopeKeyData = scope.computeData("value");

    var c = new Observation(function(){
		return scopeKeyData.get() + map.attr("other");
	});

    var handlers = function(newValue){
		assert.equal(newValue,"Ab");
	};
    canReflect.onValue(c, handlers);

    canReflect.offValue(c, handlers);

    setTimeout(function () {
		var handlers = map[canSymbol.for("can.meta")].handlers.get([]);
		assert.equal(handlers.length, 0, "there are no bindings");
		ready();
	}, 30);
});

QUnit.test("computes are read as this and . and  ../", function(assert) {
	var value = new SimpleObservable(1);
	var scope = new Scope(value);
	assert.equal(scope.get("this"), 1, "this read value");
	assert.equal(scope.get("."), 1, ". read value");
	scope = scope.add({});

	assert.equal(scope.get(".."), 1, ".. read value");
});

QUnit.test("maps are set with this.foo and ./foo", function(assert) {
	var map = new SimpleObservable(new SimpleMap({value: 1}));
	var scope = new Scope(map);
	scope.set("this.value",2);
	assert.equal(scope.get("this.value"), 2, "this read value");
	scope.set("./value",3);
	assert.equal(scope.get("./value"), 3, ". read value");
});

testHelpers.dev.devOnlyTest("computeData dependencies", function(assert) {
	var map = new SimpleMap({value: "a"});
	var scope = new Scope(map);
	var computeData = scope.computeData("value");
	var c = new Observation(function() {
		return computeData.get();
	});

	canReflect.onValue(c, function(){});

	var dependencies = canReflect.getValueDependencies(c);
	assert.ok(dependencies.valueDependencies.has(computeData), "compute has computeData");
	assert.equal(dependencies.valueDependencies.size, 1, "compute only has computeData");

	//  map.value
	//   ^    |
	//   |    v
	//   |  computeData internal observation
	//   |    |
	//   |    v
	//  computeData
	var mapValueDependencies = canReflectDeps.getDependencyDataOf(map, "value");
	assert.ok(
		mapValueDependencies
			.whatIChange
			.derive
			.valueDependencies
			.has(computeData.observation),
		"map.value -> computeData internal observation"
	);

	assert.ok(
		mapValueDependencies
			.whatChangesMe
			.mutate
			.valueDependencies
			.has(computeData),
		"computeData -> map.value"
	);

	var computeDataDependencies = canReflect.getValueDependencies(computeData);
	assert.ok(
		computeDataDependencies
			.valueDependencies
			.has(computeData.observation),
		"computeData internal observation -> computeData"
	);
});

testHelpers.dev.devOnlyTest("computeData dependencies for nested properties", function(assert) {
	var justin = new SimpleMap({ name: "justin" });
	var matthew = new SimpleMap({ name: "matthew" });
	var map = new SimpleMap({
		person: justin
	});
	var scope = new Scope(map);
	var computeData = scope.computeData("person.name");
	var obs = new Observation(function() {
		return computeData.get();
	});

	canReflect.onValue(obs, function(){});

	var observationDependencies = canReflect.getValueDependencies(obs);
	assert.ok(observationDependencies.valueDependencies.has(computeData), "compute has computeData");
	assert.equal(observationDependencies.valueDependencies.size, 1, "compute only has computeData");

	//     map.person -------
	//                      |
	//                      |
	//     person.name      |
	//      ^    |          |
	//      |    v          v
	//      |  computeData internal observation
	//      |    |
	//      |    v
	//     computeData
	var mapPersonDependencies = canReflectDeps.getDependencyDataOf(map, "person");

	assert.ok(
		mapPersonDependencies
			.whatIChange
			.derive
			.valueDependencies
			.has(computeData.observation),
		"map.person -> computeData internal observation"
	);

	var justinNameDependencies = canReflectDeps.getDependencyDataOf(justin, "name");

	assert.ok(
		justinNameDependencies
			.whatIChange
			.derive
			.valueDependencies
			.has(computeData.observation),
		"person.name -> computeData internal observation"
	);

	assert.ok(
		justinNameDependencies
			.whatChangesMe
			.mutate
			.valueDependencies
			.has(computeData),
		"computeData -> person.name"
	);

	var computeDataDependencies = canReflect.getValueDependencies(computeData);

	assert.ok(
		computeDataDependencies
			.valueDependencies
			.has(computeData.observation),
		"computeData internal observation -> computeData"
	);

	// change map.person and make sure dependencies update
	map.set("person", matthew);

	justinNameDependencies = canReflectDeps.getDependencyDataOf(justin, "name");
	var matthewNameDependencies = canReflectDeps.getDependencyDataOf(matthew, "name");

	assert.notOk(
		justinNameDependencies,
		"old person.name dependencies are removed"
	);

	assert.ok(
		matthewNameDependencies
			.whatIChange
			.derive
			.valueDependencies
			.has(computeData.observation),
		"person.name -> computeData internal observation changed"
	);

	assert.ok(
		matthewNameDependencies
			.whatChangesMe
			.mutate
			.valueDependencies
			.has(computeData),
		"computeData -> person.name changed"
	);
});

QUnit.test("scopeKeyData offValue resets dependencyChange/start", function(assert) {
	var map = new SimpleMap({value: "a", other: "b"});
	var wrap = new SimpleObservable(map);

	var scope = new Scope(wrap);
	var scopeKeyData = scope.computeData("value");

	var handler = function() {};
	canReflect.onValue(scopeKeyData, handler);
	canReflect.offValue(scopeKeyData, handler);

	assert.equal(scopeKeyData.observation.dependencyChange, Observation.prototype.dependencyChange, 'dependencyChange should be restored');
	assert.equal(scopeKeyData.observation.start, Observation.prototype.start, 'start should be restored');
});

QUnit.test("Rendering a template with a custom scope (#55)", function(assert) {
	var scope = new Scope({});

	assert.equal(scope.get('name'), undefined, "No name");
	scope.set('name', 'John');
	assert.equal(scope.get('name'), 'John', "Got the name");
	scope = scope.add({name: 'Justin'});
	assert.equal(scope.get('name'), 'Justin', "Got the top scope name");
});

QUnit.test("./ scope lookup should read current scope", function(assert) {
	var parent = new SimpleMap();
	var map = new SimpleMap();
	var scope = new Scope(parent).add(map);
	assert.equal(scope.get("./"), map);
});

QUnit.test("getTemplateContext() gives a scope with the templateContext", function(assert) {
	var map = new SimpleMap();
	var scope = new Scope(map);

	var templateContext = scope.getTemplateContext();

	assert.ok(templateContext instanceof Scope, 'templateContext is a Scope');
	assert.ok(templateContext._context instanceof TemplateContext, 'templateContext context is a TemplateContext object');
});

QUnit.test("scope can be used to read from the templateContext", function(assert) {
	var map = new SimpleMap();
	var scope = new Scope(map);

	assert.deepEqual(scope.peek("scope"), scope, "scope");

	scope.set("scope.vars.name", "Kevin");
	assert.equal(scope.peek("scope.vars.name"), "Kevin", "scope.vars.name === Kevin");

	var ageFn = function() { return "30"; };
	scope.set("scope.vars.age", ageFn);
	assert.equal(scope.peek("scope.vars.age")(), "30", "scope.vars.age === 30");
});

QUnit.test("scope.index reads from special scopes", function(assert) {

	// When this is run in the main CanJS test suite, can-stache adds an index helper,
	// so delete its helper so it doesn’t conflict with this test
	var originalIndexHelper = canStacheHelpers.index;
	delete canStacheHelpers.index;

	var map1 = new SimpleMap({ index: 1 });
	var map2 = new SimpleMap({ index: 3 });
	var scope = new Scope(map1);

	assert.equal(scope.peek('scope.index'), undefined,
		'scope.index returns undefined if no special context exists');

	scope = scope.add({ index: 2 }, { special: true })
		.add(map2)
		.add({ index: 0 }, { special: true });

	assert.equal(scope.peek('scope.index'), 0, 'scope.index is read correctly');

	assert.equal(scope._parent.peek('scope.index'), 2, 'scope.index is only read from special contexts');

	// Restore can-stache’s index helper
	canStacheHelpers.index = originalIndexHelper;

});

QUnit.test("scope.index should not return a global helper", function(assert) {
	var mockGlobalHelper = function() {
		assert.ok(false, 'global helper should not be called');
	};
	var originalIndexHelper = canStacheHelpers.index;
	canStacheHelpers.index = mockGlobalHelper;

	var scope = new Scope({});

	assert.equal(scope.peek('scope.index'), undefined,
		'scope.index returns undefined if no special context exists');

	canStacheHelpers.index = originalIndexHelper;
});

QUnit.test("scope.key reads from special scopes", function(assert) {
	var map1 = new SimpleMap({ key: "one" });
	var map2 = new SimpleMap({ key: 3 });
	var scope = new Scope(map1)
		.add({ key: "two" }, { special: true })
		.add(map2)
		.add({ key: "four" }, { special: true });

	assert.equal(scope.peek('scope.key'), "four", 'scope.key is read correctly');

	assert.equal(scope._parent.peek('scope.key'), "two", 'scope.key is only read from special contexts');
});

QUnit.test("variables starting with 'scope' should not be read from templateContext (#104)", function(assert) {
	var map = new SimpleMap({ scope1: "this is scope1" });
	var scope = new Scope(map);

	assert.deepEqual(scope.peek("scope1"), "this is scope1", "scope1");
});

QUnit.test("nested properties can be read from templateContext.vars", function(assert) {
	var foo = new SimpleMap({ bar: "baz" });

	var map = new SimpleMap();
	var scope = new Scope(map);

	assert.ok(!scope.peek("scope.vars.foo.bar"), "vars.foo.bar === undefined");

	scope.set("scope.vars.foo", foo);
	assert.equal(scope.peek("scope.vars.foo.bar"), "baz", "vars.foo.bar === baz");

	scope.set("scope.vars.foo.bar", "quz");
	assert.equal(scope.peek("scope.vars.foo.bar"), "quz", "vars.foo.bar === quz");
});


QUnit.test("nested properties can be read from scope.root", function(assert) {
	var root = new SimpleMap({ bar: "baz" });
	var map = new SimpleMap({ bar: "abc" });

	var scope = new Scope(root)
		.add(map);

	assert.equal(scope.peek("scope.root.bar"), "baz", "root.bar === baz");
});

QUnit.test("special scopes are skipped if options.special !== true", function(assert) {
	var map1 = new SimpleMap({});
	var scope = new Scope(map1)
		.add({ foo: "two" }, { special: true })
		.add({});

	assert.equal(scope.peek('foo', { special: true }), "two", "foo is read from special scope");
});

QUnit.test("special scopes are skipped when using ../.", function(assert) {
	var obj = { foo: "one" };
	var scope = new Scope(obj)
		.add({ foo: "two" }, { special: true })
		.add({});

	assert.equal(scope.peek('../.'), obj);
	assert.equal(scope.peek('.././foo'), "one");
});

QUnit.test("special scopes are skipped when using .", function(assert) {
	var map = new SimpleMap({ foo: "one" });
	var scope = new Scope(map)
		.add({ foo: "two" }, { special: true });

	assert.equal(scope.peek('.'), map);
});

QUnit.test("this works everywhere (#45)", function(assert) {
	var obj = {foo: "bar"};
	var scope = new Scope(obj);
	// this.foo works
	assert.equal(scope.get("this.foo"),"bar");
});

QUnit.test("'this' and %context give the context", function(assert) {
	assert.expect(1);
	var vm;
	var MyMap = SimpleMap.extend({
		doSomething: function(){
			assert.equal(this, vm, "event callback called on context");
		}
	});

	vm = new MyMap();

	var compute = new Scope(vm).computeData('this.doSomething', {isArgument: true, args: []}).compute;

	compute()();

});

QUnit.test("that .set with ../ is able to skip notContext scopes (#43)", function(assert) {
	var instance = new SimpleMap({prop: 0});
	var notContextContext = {NAME: "NOT CONTEXT"};
	var top = {NAME: "TOP"};
	var scope = new Scope(instance).add(notContextContext,{notContext: true}).add(top);


	scope.set("../prop",1);

	assert.equal( instance.attr("prop"), 1);
});


QUnit.test("undefined props should be a scope hit (#20)", function(assert) {

	var MyType = SimpleMap.extend("MyType",{
		init: function(){
			this.value = undefined;
		}
	});
	var EmptyType = SimpleMap.extend("EmptyType",{});

	var instance = new MyType();

	var scope = new Scope(instance).add(new EmptyType());

	var c1 = scope.computeData("../value").compute;
	c1.on("change", function(){});
	c1("BAR");

	assert.equal(instance.attr("value"), "BAR");

	var instance2 = new MyType();
	var scope2 = new Scope(instance2).add(new SimpleObservable());

	var c2 = scope2.computeData("../value").compute;

	c2.on("change", function(){});
	c2("BAR");

	assert.equal(instance2.attr("value"), "BAR");

});

QUnit.test("ScopeKeyData can.valueHasDependencies", function(assert) {
	var map = new SimpleMap({age: 21});
	var base = new Scope(map);
	var age = base.computeData('age');

	// The following 2 lines were commented out ... we auto-bind ScopeKeyData
	//assert.equal(canReflect.valueHasDependencies(age), undefined, "undefined");
	//canReflect.onValue(age, function(){});

	assert.equal(canReflect.valueHasDependencies(age), true, "undefined");
});

QUnit.test("get and set Priority", function(assert) {
	var map = new SimpleMap({age: 21});
	var base = new Scope(map);
	var age = base.computeData('age');

	canReflect.setPriority(age, 5);


	assert.equal(canReflect.getPriority(age), 5, "set priority");

	var compute = age.compute;

	assert.equal(canReflect.getPriority(compute), 5, "set priority");

});

QUnit.test("fast path checking does not leak ObservationRecord.adds", function(assert) {
	// reading values in setup can cause problems ... these will
	// leak to outer scope
	var map = new SimpleMap({age: 21});
	// make getter behave like can-define
	Object.defineProperty(map,"age",{
		get: function(){
			return this.attr("age");
		},
		set: function(newVal){
			this.attr("age",newVal);
		}
	});

	var base = new Scope(map);
	var age = base.computeData('age');

	ObservationRecorder.start();
	age.get();
	var dependencies = ObservationRecorder.stop();

	assert.equal(dependencies.keyDependencies.size, 0, "no key dependencies");
	assert.equal(dependencies.valueDependencies.size, 1, "only sees age");
	assert.ok(dependencies.valueDependencies.has(age), "only sees age");
});

QUnit.test("{{scope.set(...)}} works", function(assert) {
	var map = new SimpleMap({ foo: 'bar' });
	var scope = new Scope(map);

	var set = scope.peek('scope@set');

	set('foo', 'baz');
	assert.equal(map.get('foo'), 'baz', 'map.foo updated using scope.set');
});

QUnit.test("can read a method from scope.viewModel", function(assert) {
	var viewModel = new SimpleMap({
		method: function() {
			return 'method return value';
		}
	});
	var scope = new Scope({})
		.add({ viewModel: viewModel }, { special: true });

	var method = scope.peek('scope.viewModel@method');

	assert.equal(method(), 'method return value');
});

QUnit.test("can read a value from scope.element", function(assert) {
	var element = {
		value: 'element value'
	};
	var scope = new Scope({})
		.add({ element: element }, { special: true });

	var value = scope.peek('scope.element.value');

	assert.equal(value, 'element value');
});

QUnit.test("scope.find can be used to find a value in the first scope it exists", function(assert) {
	var a = new SimpleMap({ a: "a" });
	var b = new SimpleMap({ b: "b" });
	var c = new SimpleMap({ c: "c" });

	var scope = new Scope(c)
		.add(b)
		.add(a);

	assert.equal(scope.find("a"), "a", "a");
	assert.equal(scope.find("b"), "b", "b");
	assert.equal(scope.find("c"), "c", "c");
});

QUnit.test("scope.find accepts readOptions", function(assert) {
	var a = new SimpleMap({ a: "a" });
	a.func = function() {
		return this;
	};

	var b = new SimpleMap({ b: "b" });
	var c = new SimpleMap({ c: "c" });

	var scope = new Scope(c)
		.add(b)
		.add(a);

	var aDotFunc = scope.find("func");

	assert.equal(aDotFunc(), a, "a.func() got correct context");

	aDotFunc = scope.find("func", { proxyMethods: false });

	assert.notEqual(aDotFunc(), a, "non-proxied a.func() got correct context");
});

QUnit.test("scope.read should not walk up normal scopes by default", function(assert) {
	var a = new SimpleMap({ a: "a" });
	var b = new SimpleMap({ b: "b" });
	var c = new SimpleMap({ c: "c" });

	var scope = new Scope(c)
		.add(b)
		.add(a);

	assert.equal(scope.read("a").value, "a", "a");
	assert.equal(scope.read("b").value, undefined, "b");
	assert.equal(scope.read("c").value, undefined, "c");
});

QUnit.test("scope.read should walk over special scopes", function(assert) {
	var map = new SimpleMap({ a: "a", b: "b", c: "c" });

	var scope = new Scope(map)
		.add({ d: "d" }, { special: true });

	assert.equal(scope.read("a").value, "a", "a");
	assert.equal(scope.read("b").value, "b", "b");
	assert.equal(scope.read("c").value, "c", "c");
});

QUnit.test("scope.read should skip special contexts and read from notContext scope higher in the chain", function(assert) {
	var scope = new Scope({ a: "a" })
		.add({ b: "b" }, { notContext: true })
		.add({ c: "c" }, { special: true })
		.add({ d: "d" }, { notContext: true })
		.add({ e: "e" });

	assert.equal(scope.read("a").value, undefined, "a not read from normal parent context");
	assert.equal(scope.read("b").value, "b", "b read correctly from notContext parent context");
	assert.equal(scope.read("c").value, undefined, "c not read from special context");
	assert.equal(scope.read("d").value, "d", "d read correctly from notContext parent context");
	assert.equal(scope.read("e").value, "e", "e read correctly");

	scope = scope.add({ f: "f" }, { notContext : true })
		.add({ g: "g" }, { special : true })
		.add({ h: "h" }, { notContext : true })
		.add({ i: "i" });

	assert.equal(scope.read("e").value, undefined, "e not read from normal parent context");
	assert.equal(scope.read("f").value, "f", "f read correctly from notContext parent context");
	assert.equal(scope.read("g").value, undefined, "g not read from special context");
	assert.equal(scope.read("h").value, "h", "h read correctly from notContext parent context");
	assert.equal(scope.read("i").value, "i", "i read correctly");

	assert.equal(scope.read("../a").value, undefined, "../a not read from normal parent context above normal parent context");
	assert.equal(scope.read("../b").value, "b", "../b read correctly from notContext parent context above normal parent context");
	assert.equal(scope.read("../c").value, undefined, "../c not read from special context above normal parent context");
	assert.equal(scope.read("../d").value, "d", "../d read correctly from notContext parent context above normal parent context");
	assert.equal(scope.read("../e").value, "e", "../e read correctly above normal parent context");
});

QUnit.test("reading using ../ when there is no parent returns undefined", function(assert) {
	var scope = new Scope({});

	try {
		assert.equal(scope.read('../foo').value, undefined, 'returns undefined');
	} catch(e) {
		assert.ok(false, 'error occured: ' + e);
	}
});

QUnit.test("read checks templateContext helpers then global helpers after checking the scope", function(assert) {
	var map = {
		scopeFunction: function() {
			return 'scopeFunction';
		}
	};

	var helperFunction = function() {
		return 'helperFunction';
	};

	var localHelperFunction = function() {
		return 'localHelperFunction';
	};

	var globalHelperCalledLocalHelperFunction = function() {
		return 'global helper function called "localHelperFunction"';
	};

	var scope = new Scope(map);

	// register global helper function
	canStacheHelpers.helperFunction = helperFunction;

	// register "local" helper in templateContext
	canReflect.setKeyValue(scope.templateContext.helpers, "localHelperFunction", localHelperFunction);

	// register global helper function that collides with templateContext function
	canStacheHelpers.localHelperFunction = globalHelperCalledLocalHelperFunction;

	var readScopeFunction = scope.read('scopeFunction').value;
	assert.deepEqual(readScopeFunction(), 'scopeFunction', 'scopeFunction');

	var readLocalHelperFunction = scope.read('localHelperFunction').value;
	assert.deepEqual(readLocalHelperFunction(), 'localHelperFunction', 'localHelperFunction');

	var readHelperFunction = scope.read('helperFunction').value;
	assert.deepEqual(readHelperFunction(), 'helperFunction', 'helperFunction');

	// clean up
	delete canStacheHelpers.helperFunction;
	delete canStacheHelpers.localHelperFunction;
	canReflect.setKeyValue(scope.templateContext.helpers, "localHelperFunction", undefined);
});

QUnit.test("read can handle objects stored on helpers", function(assert) {
	var scope = new Scope();

	var fakeConsole = {
		log: function() {
			return "fakeConsole.log";
		},
		warn: function() {
			return "fakeConsole.warn";
		}
	};
	canStacheHelpers.console = fakeConsole;

	var readConsoleLog = scope.read('console.log').value;
	assert.deepEqual(readConsoleLog(), 'fakeConsole.log', 'fakeConsole.log');

	var readConsoleWarn = scope.read('console.warn').value;
	assert.deepEqual(readConsoleWarn(), 'fakeConsole.warn', 'fakeConsole.warn');

	delete canStacheHelpers.console;
});

QUnit.test("scope.helpers can be used to read a helper that conflicts with a property in the scope", function(assert) {
	var map = {
		myIf: function() {
			return 'map.myIf';
		}
	};

	var myIf = function() {
		return 'global.myIf';
	};

	var scope = new Scope(map);

	// register helper function that conflicts with scope function
	canStacheHelpers.myIf = myIf;

	var localIf = scope.read('myIf').value;
	assert.deepEqual(localIf(), 'map.myIf', 'scope function');

	var globalIf = scope.read('scope.helpers.myIf').value;
	assert.deepEqual(globalIf(), 'global.myIf', 'global function');

	// clean up
	delete canStacheHelpers.myIf;
});

QUnit.test("functions have correct `thisArg` so they can be called even with `proxyMethods: false`", function(assert) {
	var parent = {
		name: function() {
			return 'parent';
		}
	};

	var child = {
		name: function() {
			return 'child';
		}
	};

	var func = function() {};

	var childData = { child: child, func: func };
	var parentData = { parent: parent, func: func };

	var scope = new Scope(parentData)
		.add(childData);

	var childName = scope.read("child.name", { proxyMethods: false });

	assert.equal(childName.value, child.name, "childName.value === child.name");
	assert.equal(childName.thisArg, child, "childName.thisArg === child");

	var childNameCompute = scope.computeData('child.name', { proxyMethods: false });
	Observation.temporarilyBind(childNameCompute);

	assert.equal(childNameCompute.initialValue, child.name, "childNameCompute.inititalValue === child.name");
	assert.equal(childNameCompute.thisArg, child, "childNameCompute.thisArg === child");

	var rootFunc = scope.read('func', { proxyMethods: false });

	assert.equal(rootFunc.value, func, "rootFunc.value === func");
	assert.equal(rootFunc.thisArg, childData, "rootFunc.thisArg === childData");

	var myHelper = function() {};
	canReflect.setKeyValue(scope.templateContext.helpers, "myHelper", myHelper);

	var helper = scope.read("myHelper", { proxyMethods: false });

	assert.equal(helper.value, myHelper, "helper.value === func");
	assert.equal(helper.thisArg, undefined, "helper.thisArg === undefined");

	var parentName = scope.read("../parent.name", { proxyMethods: false });

	assert.equal(parentName.value, parent.name, "parentName.value === parent.name");
	assert.equal(parentName.thisArg, parent, "parentName.thisArg === parent");

	var parentFunc = scope.read('../func', { proxyMethods: false });

	assert.equal(parentFunc.value, func, "parentFunc.value === func");
	assert.equal(parentFunc.thisArg, parentData, "rootFunc.thisArg === parentData");
});

QUnit.test("debugger is a reserved scope key for calling debugger helper", function(assert) {
	var scope = new Scope({ name: "Kevin" });

	var debuggerHelper = function(options) {
		return options.scope.read("name").value;
	};
	canStacheHelpers["debugger"] = debuggerHelper;

	var debuggerScopeKey = scope.compute("debugger");
	assert.equal(canReflect.getValue(debuggerScopeKey), "Kevin", "debugger called with correct helper options");

	delete canStacheHelpers["debugger"];
});

QUnit.test("scope.vm and scope.top", function(assert) {
	var scope = new Scope({ name: "foo" })
		.add({ name: "Kevin" }, { viewModel: true }) // top
		.add({ name: "bar" }) // intermediate
		.add({ name: "Ryan" }, { viewModel: true }) // vm
		.add({ name: "baz" });

	assert.equal(scope.read("scope.vm.name").value, "Ryan", "scope.first can be used to read from the _first_ context with viewModel: true");
	assert.equal(scope.read("scope.top.name").value, "Kevin", "scope.top can be used to read from the _top_ context with viewModel: true");
});

testHelpers.dev.devOnlyTest("scope.root deprecation warning", function (assert) {
	var teardown = testHelpers.dev.willWarn(/`scope.root` is deprecated/);

	var scope = new Scope({ foo: "bar" });
	scope.read("scope.root");

	assert.equal(teardown(), 1, "deprecation warning displayed");
});

testHelpers.dev.devOnlyTest("scope.getPathsForKey", function (assert) {
	var top = {};
	top[canSymbol.for("can.hasKey")] = function(key) {
		return key === "name";
	};

	var vm = { name: "Ryan" };
	var nonVm = { name: "Bianca" };
	var notContext = { index: 0 };
	var special = { myIndex: 0 };

	var scope = new Scope(top, null, { viewModel: true })
		.add(notContext, { notContext: true })
		.add(vm, { viewModel: true })
		.add(special, { special: true })
		.add(true)
		.add(nonVm);

	var paths = scope.getPathsForKey("name");

	assert.deepEqual(paths, {
		"scope.vm.name": vm,
		"scope.top.name": top,
		"name": nonVm,
		"../../name": vm,
		"../../../name": top
	});
});

testHelpers.dev.devOnlyTest("scope.getPathsForKey works for functions", function (assert) {
	var top = { name: function() { return "Christopher"; } };
	var vm = { name: function() { return "Ryan"; } };
	var nonVm = { name: function() { return "Bianca"; } };
	var notContext = { index: 0 };
	var special = { myIndex: 0 };

	var scope = new Scope(top, null, { viewModel: true })
		.add(notContext, { notContext: true })
		.add(vm, { viewModel: true })
		.add(special, { special: true })
		.add(true)
		.add(nonVm);

	var paths = scope.getPathsForKey("name");

	assert.deepEqual(paths, {
		"scope.vm.name()": vm,
		"scope.top.name()": top,
		"name()": nonVm,
		"../../name()": vm,
		"../../../name()": top
	});
});

QUnit.test("scope.hasKey", function(assert) {
	var top = { foo: "bar" };
	var vm = { bar: "baz" };
	var nonVm = {};

	nonVm[canSymbol.for("can.hasKey")] = function(key) {
		return key === "baz";
	};

	var scope = new Scope(top, null, { viewModel: true })
		.add(vm, { viewModel: true })
		.add(nonVm);

	assert.equal(canReflect.hasKey(scope, "scope.top.foo"), true, "hasKey scope.top.foo === true");
	assert.equal(canReflect.hasKey(scope, "scope.top.bar"), false, "hasKey scope.top.bar === false");

	assert.equal(canReflect.hasKey(scope, "scope.vm.bar"), true, "hasKey scope.vm.bar === true");
	assert.equal(canReflect.hasKey(scope, "scope.vm.baz"), false, "hasKey scope.vm.baz === false");

	assert.equal(canReflect.hasKey(scope, "baz"), true, "hasKey baz === true");
	assert.equal(canReflect.hasKey(scope, "foo"), false, "hasKey foo === false");
});

QUnit.test("read returns correct `parentHasKey` value", function(assert) {
	var vm = {};
	canReflect.assignSymbols(vm, {
		"can.hasKey": function(key) {
			return key === "foo";
		}
	});

	var scope = new Scope(vm);

	assert.ok(scope.read("foo").parentHasKey, "parent has key 'foo'");
	assert.notOk(scope.read("bar").parentHasKey, "parent does not have key 'bar'");
});

QUnit.test("computeData returns correct `parentHasKey` value", function(assert) {
	var vm = {};
	canReflect.assignSymbols(vm, {
		"can.hasKey": function(key) {
			return key === "foo";
		}
	});

	var scope = new Scope(vm);

	var fooCompute = scope.computeData("foo");
	var barCompute = scope.computeData("bar");

	// force a read
	fooCompute.read();
	barCompute.read();

	assert.ok(fooCompute.parentHasKey, "parent has key 'foo'");
	assert.notOk(barCompute.parentHasKey, "parent does not have key 'bar'");
});

QUnit.test("can get helpers from parent TemplateContext", function(assert) {
	var scope = new Scope(
		new Scope.TemplateContext({helpers: {foo: function(){}}})
	).add(
		new Scope.TemplateContext()
	).add( {});
	assert.ok( scope.get("foo"), "got helper");
});

QUnit.test("do not error when reading a missing parent context (#183)", function(assert) {
	var scope = new Scope(
		new Scope.TemplateContext({})
	).add({}, {});

	var results = scope.read("../key",{});

	assert.ok(results.noContextAvailable, "no error");
});

QUnit.test("cloneFromRef clones meta", function(assert) {
	var scope = new Scope({}).add(new Scope.TemplateContext({})).addLetContext({tempProp: undefined});
	var copyScope = scope.cloneFromRef();

	assert.deepEqual( copyScope._meta, {variable: true});
});

QUnit.test("scope/key walks the scope", function(assert) {
	var scope = new Scope({
		foo: "bar",
		baz: function() { return "quz"; }
	}).add({}).add({});

	var value = scope.peek("scope/foo");
	assert.equal(value, "bar");
	value = scope.peek("@scope/baz");
	assert.equal(value(), "quz");
});

QUnit.test("able to read partials", function(assert) {
	var myPartial = function(){};

	var scope = new Scope(new Scope.TemplateContext({
		partials: {myPartial: myPartial}
	})).add({});

	var result = scope.get("myPartial");

	assert.equal(result, myPartial, "read the value");
});

QUnit.test("properties can shadow functions on can-event-queue/map when there is a LetContext", function(assert) {
	var scope = new Scope({
		one: "the one property"
	})
	.addLetContext();

	assert.equal(scope.get("one"), "the one property", "read the value");
});

require("./variable-scope-test");
require("./scope-set-test");
require("./scope-key-data-test");
