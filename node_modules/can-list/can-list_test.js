var List = require('can-list');
var QUnit = require('steal-qunit');
var Observation = require('can-observation');
var Map = require('can-map');
var canReflect = require('can-reflect');
var canSymbol = require('can-symbol');

QUnit.module('can-list');

QUnit.test('list attr changes length', function(assert) {
	var l = new List([
		0,
		1,
		2
	]);
	l.attr(3, 3);
	assert.equal(l.length, 4);
});
QUnit.test('removeAttr on list', function(assert) {
	var l = new List([0, 1, 2]);
	l.removeAttr(1);
	assert.equal(l.attr('length'), 2);
	assert.deepEqual(l.attr(), [0, 2]);
});
QUnit.test('list splice', function(assert) {
	var l = new List([
		0,
		1,
		2,
		3
	]),
		first = true;
	l.bind('change', function (ev, attr, how, newVals, oldVals) {
		assert.equal(attr, '1');
		if (first) {
			assert.equal(how, 'remove', 'removing items');
			assert.equal(newVals, undefined, 'no new Vals');
		} else {
			assert.deepEqual(newVals, [
				'a',
				'b'
			], 'got the right newVals');
			assert.equal(how, 'add', 'adding items');
		}
		first = false;
	});
	l.splice(1, 2, 'a', 'b');
	assert.deepEqual(l.serialize(), [
		0,
		'a',
		'b',
		3
	], 'serialized');
});
QUnit.test('list pop', function(assert) {
	var l = new List([
		0,
		1,
		2,
		3
	]);
	l.bind('change', function (ev, attr, how, newVals, oldVals) {
		assert.equal(attr, '3');
		assert.equal(how, 'remove');
		assert.equal(newVals, undefined);
		assert.deepEqual(oldVals, [3]);
	});
	l.pop();
	assert.deepEqual(l.serialize(), [
		0,
		1,
		2
	]);
});
QUnit.test('remove nested property in item of array map', function(assert) {
	var state = new List([{
		nested: true
	}]);
	state.bind('change', function (ev, attr, how, newVal, old) {
		assert.equal(attr, '0.nested');
		assert.equal(how, 'remove');
		assert.deepEqual(old, true);
	});
	state.removeAttr('0.nested');
	assert.equal(undefined, state.attr('0.nested'));
});
QUnit.test('pop unbinds', function(assert) {
	var l = new List([{
		foo: 'bar'
	}]);
	var o = l.attr(0),
		count = 0;
	l.bind('change', function (ev, attr, how, newVal, oldVal) {
		count++;
		if (count === 1) {
			assert.equal(attr, '0.foo', 'count is set');
		} else if (count === 2) {
			assert.equal(how, 'remove');
			assert.equal(attr, '0');
		} else {
			assert.ok(false, 'called too many times');
		}
	});

	assert.equal(o.attr('foo'), 'bar', "read foo property");
	o.attr('foo', 'car');
	l.pop();
	o.attr('foo', 'bad');
});
QUnit.test('splice unbinds', function(assert) {
	var l = new List([{
		foo: 'bar'
	}]);
	var o = l.attr(0),
		count = 0;
	l.bind('change', function (ev, attr, how, newVal, oldVal) {
		count++;
		if (count === 1) {
			assert.equal(attr, '0.foo', 'count is set');
		} else if (count === 2) {
			assert.equal(how, 'remove');
			assert.equal(attr, '0');
		} else {
			assert.ok(false, 'called too many times');
		}
	});
	assert.equal(o.attr('foo'), 'bar');
	o.attr('foo', 'car');
	l.splice(0, 1);
	o.attr('foo', 'bad');
});
QUnit.test('always gets right attr even after moving array items', function(assert) {
	var l = new List([{
		foo: 'bar'
	}]);
	var o = l.attr(0);
	l.unshift('A new Value');
	l.bind('change', function (ev, attr, how) {
		assert.equal(attr, '1.foo');
	});
	o.attr('foo', 'led you');
});

QUnit.test('Array accessor methods', function(assert) {
	assert.expect(11);
	var l = new List([
		'a',
		'b',
		'c'
	]),
		sliced = l.slice(2),
		joined = l.join(' | '),
		concatenated = l.concat([
			2,
			1
		], new List([0]));
	assert.ok(sliced instanceof List, 'Slice is an Observable list');
	assert.equal(sliced.length, 1, 'Sliced off two elements');
	assert.equal(sliced[0], 'c', 'Single element as expected');
	assert.equal(joined, 'a | b | c', 'Joined list properly');
	assert.ok(concatenated instanceof List, 'Concatenated is an Observable list');
	assert.deepEqual(concatenated.serialize(), [
		'a',
		'b',
		'c',
		2,
		1,
		0
	], 'List concatenated properly');
	l.forEach(function (letter, index) {
		assert.ok(true, 'Iteration');
		if (index === 0) {
			assert.equal(letter, 'a', 'First letter right');
		}
		if (index === 2) {
			assert.equal(letter, 'c', 'Last letter right');
		}
	});
});

QUnit.test('Concatenated list items Equal original', function(assert) {
	var l = new List([
		{ firstProp: "Some data" },
		{ secondProp: "Next data" }
	]),
	concatenated = l.concat([
		{ hello: "World" },
		{ foo: "Bar" }
	]);

	assert.ok(l[0] === concatenated[0], "They are Equal");
	assert.ok(l[1] === concatenated[1], "They are Equal");

});

QUnit.test('Lists with maps concatenate properly', function(assert) {
	var Person = Map.extend();
	var People = List.extend({
		Map: Person
	},{});
	var Genius = Person.extend();
	var Animal = Map.extend();

	var me = new Person({ name: "John" });
	var animal = new Animal({ name: "Tak" });
	var genius = new Genius({ name: "Einstein" });
	var hero = { name: "Ghandi" };

	var people = new People([]);
	var specialPeople = new People([
		genius,
		hero
	]);

	people = people.concat([me, animal, specialPeople], specialPeople, [1, 2], 3);

	assert.ok(people.attr('length') === 8, "List length is right");
	assert.ok(people[0] === me, "Map in list === vars created before concat");
	assert.ok(people[1] instanceof Person, "Animal got serialized to Person");
});

QUnit.test('splice removes items in IE (#562)', function(assert) {
	var l = new List(['a']);
	l.splice(0, 1);
	assert.ok(!l.attr(0), 'all props are removed');
});

QUnit.test('reverse triggers add/remove events (#851)', function(assert) {
	assert.expect(6);
	var l = new List([1,2,3]);

	l.bind('change', function() {
		assert.ok(true, 'change should be called');
	});
	l.bind('set', function() { assert.ok(false, 'set should not be called'); });
	l.bind('add', function() { assert.ok(true, 'add called'); });
	l.bind('remove', function() { assert.ok(true, 'remove called'); });
	l.bind('length', function() { assert.ok(true, 'length should be called'); });

	l.reverse();
});

QUnit.test('filter', function(assert) {
	var l = new List([{id: 1, name: "John"}, {id: 2, name: "Mary"}]);

	var filtered = l.filter(function(item){
		return item.name === "Mary";
	});

	assert.notEqual(filtered._cid, l._cid, "not same object");
	assert.equal(filtered.length, 1, "one item");
	assert.equal(filtered[0].name, "Mary", "filter works");
});


QUnit.test('removing expandos on lists', function(assert) {
	var list = new List(["a","b"]);

	list.removeAttr("foo");

	assert.equal(list.length, 2);
});

QUnit.test('No Add Events if List Splice adds the same items that it is removing. (#1277, #1399)', function(assert) {
	var list = new List(["a","b"]);

	list.bind('add', function() {
		assert.ok(false, 'Add callback should not be called.');
	});

	list.bind('remove', function() {
		assert.ok(false, 'Remove callback should not be called.');
	});

  var result = list.splice(0, 2, "a", "b");

  assert.deepEqual(result, ["a", "b"]);
});

QUnit.test("add event always returns an array as the value (#998)", function(assert) {
	var list = new List([]),
		msg;
	list.bind("add", function(ev, newElements, index) {
		assert.deepEqual(newElements, [4], msg);
	});
	msg = "works on push";
	list.push(4);
	list.pop();
	msg = "works on attr()";
	list.attr(0, 4);
	list.pop();
	msg = "works on replace()";
	list.replace([4]);
});

QUnit.test("Setting with .attr() out of bounds of length triggers add event with leading undefineds", function(assert) {
	var list = new List([1]);
	list.bind("add", function(ev, newElements, index) {
		assert.deepEqual(newElements, [undefined, undefined, 4],
				  "Leading undefineds are included");
		assert.equal(index, 1, "Index takes into account the leading undefineds from a .attr()");
	});
	list.attr(3, 4);
});

QUnit.test("No events should fire if removals happened on empty arrays", function(assert) {
	var list = new List([]),
		msg;
	list.bind("remove", function(ev, removed, index) {
		assert.ok(false, msg);
	});
	msg = "works on pop";
	list.pop();
	msg = "works on shift";
	list.shift();
	assert.ok(true, "No events were fired.");
});

QUnit.test('setting an index out of bounds does not create an array', function(assert) {
	assert.expect(1);
	var l = new List();

	l.attr('1', 'foo');
	assert.equal(l.attr('1'), 'foo');
});

QUnit.test('splice with similar but less items works (#1606)', function(assert) {
	var list = new List([ 'aa', 'bb', 'cc']);

	list.splice(0, list.length, 'aa', 'cc', 'dd');
	assert.deepEqual(list.attr(), ['aa', 'cc', 'dd']);

	list.splice(0, list.length, 'aa', 'cc');
	assert.deepEqual(list.attr(), ['aa', 'cc']);
});

QUnit.test('filter returns same list type (#1744)', function(assert) {
	var ParentList = List.extend();
	var ChildList = ParentList.extend();

	var children = new ChildList([1,2,3]);

	assert.ok(children.filter(function() {}) instanceof ChildList);
});

QUnit.test('reverse returns the same list instance (#1744)', function(assert) {
	var ParentList = List.extend();
	var ChildList = ParentList.extend();

	var children = new ChildList([1,2,3]);
	assert.ok(children.reverse() === children);
});


QUnit.test("slice and join are observable by a compute (#1884)", function(assert) {
	assert.expect(2);

	var list = new List([1,2,3]);

	var sliced = new Observation(function(){
		return list.slice(0,1);
	});
	canReflect.onValue(sliced, function(newVal){
		assert.deepEqual(newVal.attr(), [2], "got a new List");
	});

	var joined = new Observation(function(){
		return list.join(",");
	});
	canReflect.onValue(joined, function(newVal){
		assert.equal(newVal, "2,3", "joined is observable");
	});


	list.shift();


});


QUnit.test("list is always updated with the last promise passed to replace (#2136)", function(assert) {

	var list = new List();

	var done = assert.async();

	list.replace( new Promise( function( resolve ) {
		setTimeout( function(){
			resolve([ "A" ]);

			setTimeout(function(){
				assert.equal(list.attr(0), "B", "list set to last promise's value");
				done();
			},10);

		}, 20 );
	}));

	list.replace( new Promise( function( resolve ) {
		setTimeout( function(){
			resolve([ "B" ]);
		}, 10 );
	}));
});

QUnit.test('forEach callback', function(assert) {
	var list = new List([]),
		counter = 0;
	list.attr(9, 'foo');

	list.forEach(function (element, index, list) {
		counter++;
	});
	assert.equal(counter, 1, 'Should not be invoked for uninitialized attr keys');
});

QUnit.test('filter with context', function(assert) {
	var l = new List([{id: 1}]);
	var context = {};
	var contextWasCorrect = false;

	l.filter(function(){
		contextWasCorrect = (this === context);
		return true;
	}, context);

	assert.equal(contextWasCorrect, true, "context was correctly passed");
});

QUnit.test('map with context', function(assert) {
	var l = new List([{id: 1}]);
	var context = {};
	var contextWasCorrect = false;

	l.map(function(){
		contextWasCorrect = (this === context);
		return true;
	}, context);

	assert.equal(contextWasCorrect, true, "context was correctly passed");
});

QUnit.test("works with can-reflect", function(assert) {
	assert.expect(11);
	var a = new Map({ foo: 4 });
	var b = new List([ "foo", "bar" ]);

	assert.equal( canReflect.getKeyValue(b, "0"), "foo", "unbound value");

	var handler = function(newValue){
		assert.equal(newValue, "quux", "observed new value");
	};
	assert.ok(!canReflect.isValueLike(b), "isValueLike is false");
	assert.ok(canReflect.isMapLike(b), "isMapLike is true");
	assert.ok(canReflect.isListLike(b), "isListLike is false");

	assert.ok( !canReflect.keyHasDependencies(b, "length"), "keyHasDependencies -- false");

	b._computedAttrs["length"] = {  // jshint ignore:line
		compute: new Observation(function() {
			return a.attr("foo");
		}, null)
	};
	b._computedAttrs["length"].compute.start();  // jshint ignore:line
	assert.ok( canReflect.keyHasDependencies(b, "length"), "keyHasDependencies -- true");

	canReflect.onKeysAdded(b, handler);
	canReflect.onKeysRemoved(b, handler);
	var handlers = b[canSymbol.for("can.meta")].handlers;


	assert.ok(handlers.get(["add"]).length, "add handler added");
	assert.ok(handlers.get(["remove"]).length, "remove handler added");

	b.push("quux");

	assert.equal( canReflect.getKeyValue(b, "length"), "4", "bound value");
	// sanity checks to ensure that handler doesn't get called again.
	b.pop();

});

QUnit.test("can-reflect setKeyValue", function(assert) {
	var a = new Map({ "a": "b" });

	canReflect.setKeyValue(a, "a", "c");
	assert.equal(a.attr("a"), "c", "setKeyValue");
});

QUnit.test("can-reflect getKeyDependencies", function(assert) {
	var a = new Map({ foo: 4 });
	var b = new List([ "foo", "bar" ]);


	assert.ok(!canReflect.getKeyDependencies(b, "length"), "No dependencies before binding");

	b._computedAttrs.length = {
		compute: new Observation(function() {
			return a.attr("foo");
		}, null)
	};
	b._computedAttrs.length.compute.start();

	assert.ok(canReflect.getKeyDependencies(b, "length"), "dependencies exist");
	assert.ok(canReflect.getKeyDependencies(b, "length").valueDependencies.has(b._computedAttrs.length.compute), "dependencies returned");

});

QUnit.test("registered symbols", function(assert) {
	var a = new Map({ "a": "a" });

	assert.ok(a[canSymbol.for("can.isMapLike")], "can.isMapLike");
	assert.equal(a[canSymbol.for("can.getKeyValue")]("a"), "a", "can.getKeyValue");
	a[canSymbol.for("can.setKeyValue")]("a", "b");
	assert.equal(a.attr("a"), "b", "can.setKeyValue");

	function handler(val) {
		assert.equal(val, "c", "can.onKeyValue");
	}

	a[canSymbol.for("can.onKeyValue")]("a", handler);
	a.attr("a", "c");

	a[canSymbol.for("can.offKeyValue")]("a", handler);
	a.attr("a", "d"); // doesn't trigger handler
});

QUnit.test("onPatches", function(assert) {
	var list = new List([ "a", "b" ]);
	var PATCHES = [
		[ { deleteCount: 2, index: 0, type: "splice" } ],
		[ { index: 0, insert: ["A", "B"], deleteCount: 0, type: "splice" } ]
	];

	var handlerCalls = 0;
	var handler = function (patches) {
		assert.deepEqual(patches, PATCHES[handlerCalls], "patches looked right for " + handlerCalls);
		handlerCalls++;
	};

	list[canSymbol.for("can.onPatches")](handler, "notify");

	list.replace(["A", "B"]);

	list[canSymbol.for("can.offPatches")](handler, "notify");

	list.replace(["1", "2"]);
});


QUnit.test("can.onInstancePatches basics", function(assert) {
    var People = List.extend({});

    var calls = [];
    function handler(obj, patches) {
        calls.push([obj, patches]);
    }

    People[canSymbol.for("can.onInstancePatches")](handler);

    var list = new People([1,2]);
    list.push(3);
    list.attr("count", 8);
    People[canSymbol.for("can.offInstancePatches")](handler);
    list.push(4);
    list.attr("count", 7);

    assert.deepEqual(calls,[
        [list,  [{type: "splice", index: 2, deleteCount: 0, insert: [3]} ] ],
        [list, [{type: "set",    key: "count", value: 8} ] ]
    ]);
});

QUnit.test("can.onInstanceBoundChange basics", function(assert) {

    var People = List.extend({});

    var calls = [];
    function handler(obj, patches) {
        calls.push([obj, patches]);
    }

    People[canSymbol.for("can.onInstanceBoundChange")](handler);

    var people = new People([]);
    var bindHandler = function(){};
    canReflect.onKeyValue(people,"length", bindHandler);
	canReflect.offKeyValue(people,"length", bindHandler);

    People[canSymbol.for("can.offInstanceBoundChange")](handler);
	canReflect.onKeyValue(people,"length", bindHandler);
	canReflect.offKeyValue(people,"length", bindHandler);

    assert.deepEqual(calls,[
        [people,  true ],
        [people, false ]
    ]);
});

QUnit.test('list.sort a simple list', function(assert) {
	var myList = new List([
		"Marshall",
		"Austin",
		"Hyrum"
	]);

	myList.sort();

		assert.equal(myList.length, 3);
		assert.equal(myList[0], "Austin");
	assert.equal(myList[1], "Hyrum");
	assert.equal(myList[2], "Marshall", "Basic list was properly sorted.");
});

QUnit.test('list.sort a list of objects', function(assert) {
	var objList = new List([
		{ id: 1, name: "Marshall" },
		{ id: 2, name: "Austin" },
		{ id: 3, name: "Hyrum" }
	]);

	objList.sort(function(a, b) {
		if (a.name < b.name) {
			return -1;
		} else if (a.name > b.name) {
			return 1;
		} else {
			return 0;
		}
	});

	assert.equal(objList.length, 3);
	assert.equal(objList[0].name, "Austin");
	assert.equal(objList[1].name, "Hyrum");
	assert.equal(objList[2].name, "Marshall", "List of objects was properly sorted.");
});

QUnit.test('list.sort a list of objects without losing reference (#137)', function(assert) {
	var unSorted = new List([ { id: 3 }, { id: 2 }, { id: 1 } ]);
	var sorted = unSorted.slice(0).sort(function(a, b) {
		return a.id > b.id ? 1 : (a.id < b.id ? -1 : 0);
	});
	assert.equal(unSorted[0], sorted[2], 'items should be equal');
});

QUnit.test("list receives patch events", function(assert) {
	assert.expect(2);
	var list = new List([]);

	function handler(patches) {
		if(patches[0].index === 0 && patches[0].insert) {
			assert.ok(true);
		}
	}
	canReflect.onPatches(list, handler);

	list.push("foo");
	list.attr(0, "bar");
	canReflect.offPatches(list, handler);
});
