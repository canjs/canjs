"use strict";
var QUnit = require("steal-qunit");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var Observation = require("can-observation");
var define = require("can-define");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var dev = require("can-log/dev/dev");
var canTestHelpers = require("can-test-helpers/lib/dev");

var assign = require("can-assign");

QUnit.module("can-define/list/list");

QUnit.test("List is an event emitter", function(assert) {
	var Base = DefineList.extend({});
	assert.ok(Base.on, 'Base has event methods.');
	var List = Base.extend({});
	assert.ok(List.on, 'List has event methods.');
});

QUnit.test("creating an instance", function(assert) {
	var list = new DefineList([ "a", "b", "c" ]);

	list.on("add", function(ev, newVals, index) {
		assert.deepEqual(newVals, [ "d" ]);
        assert.equal(index, 3);
    });

    list.push("d");
});

QUnit.test('list attr changes length', function(assert) {
	var l = new DefineList([
		0,
		1,
		2
	]);
	l.set(3, 3);
	assert.equal(l.length, 4);
});
QUnit.test('remove on pop', function(assert) {
	var l = new DefineList([ 0, 1, 2 ]);
    l.pop();

	assert.equal(l.length, 2);
	assert.deepEqual(l.get(), [ 0, 1 ]);
});
QUnit.test('list splice', function(assert) {
	var l = new DefineList([
		0,
		1,
		2,
		3
	]);

	l.on('add', function(ev, newVals, index) {
        assert.deepEqual(newVals, [
            'a',
            'b'
        ], 'got the right newVals');
        assert.equal(index, 1, 'adding items');
    });

	l.on('remove', function(ev, oldVals, index) {
        assert.deepEqual(oldVals, [
            1,
            2
        ], 'got the right oldVals');
        assert.equal(index, 1, 'no new Vals');
    });

	l.splice(1, 2, 'a', 'b');
	assert.deepEqual(l.get(), [
		0,
		'a',
		'b',
		3
	], 'serialized');
});


QUnit.test('Array accessor methods', function(assert) {
	assert.expect(11);
	var l = new DefineList([
		'a',
		'b',
		'c'
	]),
		sliced = l.slice(2),
		joined = l.join(' | '),
		concatenated = l.concat([
			2,
			1
		], new DefineList([ 0 ]));
	assert.ok(sliced instanceof DefineList, 'Slice is an Observable list');
	assert.equal(sliced.length, 1, 'Sliced off two elements');
	assert.equal(sliced[0], 'c', 'Single element as expected');
	assert.equal(joined, 'a | b | c', 'Joined list properly');
	assert.ok(concatenated instanceof DefineList, 'Concatenated is an Observable list');
	assert.deepEqual(concatenated.serialize(), [
		'a',
		'b',
		'c',
		2,
		1,
		0
	], 'DefineList concatenated properly');
	l.forEach(function(letter, index) {
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
	var l = new DefineList([
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
	var Person = DefineMap.extend();
	var People = DefineList.extend({
		'#': Person
	});
	var Genius = Person.extend();
	var Animal = DefineMap.extend();

	var me = new Person({ name: "John" });
	var animal = new Animal({ name: "Tak" });
	var genius = new Genius({ name: "Einstein" });
	var hero = { name: "Ghandi" };

	var people = new People([]);
	var specialPeople = new People([
		genius,
		hero
	]);

	people = people.concat([ me, animal, specialPeople ], specialPeople, [ 1, 2 ], 3);

	assert.ok(people.length === 8, "List length is right");
	assert.ok(people[0] === me, "Map in list === vars created before concat");
	assert.ok(people[1] instanceof Person, "Animal got serialized to Person");
});

QUnit.test('splice removes items in IE (#562)', function(assert) {
	var l = new DefineList([ 'a' ]);
	l.splice(0, 1);
	assert.ok(!l.get(0), 'all props are removed');
});


QUnit.test('reverse triggers add/remove events (#851)', function(assert) {
	assert.expect(4);
	var l = new DefineList([ 1, 2, 3 ]);

	l.on('add', function() {
		assert.ok(true, 'add called');
	});
	l.on('remove', function() {
		assert.ok(true, 'remove called');
	});
	l.on('length', function() {
		assert.ok(true, 'length should be called');
	});

	l.reverse();

	assert.deepEqual(l.get(), [ 3, 2, 1 ], "reversed");
});

QUnit.test('filter', function(assert) {
	var l = new DefineList([ { id: 1, name: "John" }, { id: 2, name: "Mary" } ]);

	var filtered = l.filter(function(item) {
		return item.name === "Mary";
	});

	assert.notDeepEqual(filtered, l, "not same object");

	assert.equal(filtered.length, 1, "one item");
	assert.equal(filtered[0].name, "Mary", "filter works");
});

QUnit.test('No Add Events if DefineList Splice adds the same items that it is removing. (#1277, #1399)', function(assert) {
	var list = new DefineList([ "a", "b" ]);

	list.bind('add', function() {
		assert.ok(false, 'Add callback should not be called.');
	});

	list.bind('remove', function() {
		assert.ok(false, 'Remove callback should not be called.');
	});

  var result = list.splice(0, 2, "a", "b");

	assert.deepEqual(result, [ "a", "b" ]);
});

QUnit.test("add event always returns an array as the value (#998)", function(assert) {
	var list = new DefineList([]),
		msg;
	list.bind("add", function(ev, newElements, index) {
		assert.deepEqual(newElements, [ 4 ], msg);
	});
	msg = "works on push";
	list.push(4);
	list.pop();
	msg = "works on attr()";
	list.set(0, 4);
	list.pop();
	msg = "works on replace()";
	list.replace([ 4 ]);
});

QUnit.test("Setting with .set() out of bounds of length triggers add event with leading undefineds", function(assert) {
	var list = new DefineList([ 1 ]);
	list.bind("add", function(ev, newElements, index) {
		assert.deepEqual(newElements, [ undefined, undefined, 4 ],
				  "Leading undefineds are included");
		assert.equal(index, 1, "Index takes into account the leading undefineds from a .set()");
	});
	list.set(3, 4);
});

QUnit.test("No events should fire if removals happened on empty arrays", function(assert) {
	var list = new DefineList([]),
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
	var l = new DefineList();

	l.set('1', 'foo');
	assert.equal(l.get('1'), 'foo');
});

QUnit.test('splice with similar but less items works (#1606)', function(assert) {
	var list = new DefineList([ 'aa', 'bb', 'cc' ]);

	list.splice(0, list.length, 'aa', 'cc', 'dd');
	assert.deepEqual(list.get(), [ 'aa', 'cc', 'dd' ]);

	list.splice(0, list.length, 'aa', 'cc');
	assert.deepEqual(list.get(), [ 'aa', 'cc' ]);
});

QUnit.test('filter returns same list type (#1744)', function(assert) {
	var ParentList = DefineList.extend();
	var ChildList = ParentList.extend();

	var children = new ChildList([ 1, 2, 3 ]);

	assert.ok(children.filter(function() {}) instanceof ChildList);
});

QUnit.test('reverse returns the same list instance (#1744)', function(assert) {
	var ParentList = DefineList.extend();
	var ChildList = ParentList.extend();

	var children = new ChildList([ 1, 2, 3 ]);
	assert.ok(children.reverse() === children);
});


QUnit.test("slice and join are observable by a compute (#1884)", function(assert) {
	assert.expect(2);

	var list = new DefineList([ 1, 2, 3 ]);

	var sliced = new Observation(function() {
		return list.slice(0, 1);
	});

	canReflect.onValue(sliced, function(newVal){
		assert.deepEqual(newVal.get(), [ 2 ], "got a new DefineList");
	});

	var joined = new Observation(function() {
		return list.join(",");
	});

	canReflect.onValue(joined, function(newVal){
		assert.equal(newVal, "2,3", "joined is observable");
	});


	list.shift();

});

QUnit.test('list.replace', function(assert) {
    var firstArray = [
		{ id: 1, name: "Marshall" },
		{ id: 2, name: "Austin" },
		{ id: 3, name: "Hyrum" }
    ];
    var myList = new DefineList(firstArray);
    var newArray = [
		{ id: 4, name: "Aubree" },
		{ id: 5, name: "Leah" },
		{ id: 6, name: 'Lily' }
    ];
    myList.replace(newArray);
    assert.equal(myList.length, 3);
    assert.equal(myList[0].name, "Aubree");
    assert.equal(myList[1].name, "Leah");
    assert.equal(myList[2].name, "Lily", "Can replace a List with an Array.");

    myList.replace(firstArray);
    assert.equal(myList.length, 3);
    assert.equal(myList[0].name, "Marshall");
    assert.equal(myList[1].name, "Austin");
    assert.equal(myList[2].name, "Hyrum", "Can replace a List with another List.");
});

QUnit.test('list.map', function(assert) {
	var myArray = [
		{ id: 1, name: "Marshall" },
		{ id: 2, name: "Austin" },
		{ id: 3, name: "Hyrum" }
    ];
    var myList = new DefineList(myArray);
    var newList = myList.map(function(person) {
        person.lastName = "Thompson";
        return person;
    });

    assert.equal(newList.length, 3);
    assert.equal(newList[0].name, "Marshall");
    assert.equal(newList[0].lastName, "Thompson");
    assert.equal(newList[1].name, "Austin");
    assert.equal(newList[1].lastName, "Thompson");
    assert.equal(newList[2].name, "Hyrum");
    assert.equal(newList[2].lastName, "Thompson");

    var ExtendedList = DefineList.extend({
		testMe: function() {
			return "It Worked!";
		}
	});
	var myExtendedList = new ExtendedList(myArray);
	var newExtendedList = myExtendedList.map(function(person) {
    person.lastName = "Thompson";
	    return person;
	});

	try {
		newExtendedList.testMe();
	} catch(err) {
		assert.ok(err.message.match(/testMe/), 'Does not return the same type of list.');
	}
});


QUnit.test('list.sort a simple list', function(assert) {
    var myList = new DefineList([
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
	var objList = new DefineList([
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
	var unSorted = new DefineList([ { id: 3 }, { id: 2 }, { id: 1 } ]);
	var sorted = unSorted.slice(0).sort(function(a, b) {
		return a.id > b.id ? 1 : (a.id < b.id ? -1 : 0);
	});
	assert.equal(unSorted[0], sorted[2], 'items should be equal');
});

QUnit.test("list defines", function(assert) {
	assert.expect(6);
	var Todo = function(props) {
        assign(this, props);
        //CID(this);
    };
	define(Todo.prototype, {
        completed: "boolean",
        destroyed: {
            default: false
        }
    });
	Todo.prototype.destroy = function() {
        this.destroyed = true;
    };

    var TodoList = DefineList.extend({

    	"*": Todo,
    	remaining: {
    		get: function() {
    			return this.filter({
    				completed: false
    			});
    		}
    	},
    	completed: {
    		get: function() {
    			return this.filter({
    				completed: true
    			});
    		}
    	},

    	destroyCompleted: function() {
    		this.completed.forEach(function(todo) {
    			todo.destroy();
    		});
    	},
    	setCompletedTo: function(value) {
    		this.forEach(function(todo) {
    			todo.completed = value;
    		});
    	}
    });

	var todos = new TodoList([ { completed: true }, { completed: false } ]);

    assert.ok(todos.item(0) instanceof Todo, "correct instance");
    assert.equal(todos.completed.length, 1, "only one todo");

	todos.on("completed", function(ev, newVal, oldVal) {
        assert.ok(newVal instanceof TodoList, "right type");
        assert.equal(newVal.length, 2, "all items");
        assert.ok(oldVal instanceof TodoList, "right type");
        assert.equal(oldVal.length, 1, "all items");
    });

    todos.setCompletedTo(true);

});

QUnit.test("extending the base supports overwriting _eventSetup", function(assert) {
    var L = DefineList.extend({});
	Object.getOwnPropertyDescriptor(DefineMap.prototype, "_eventSetup");
    L.prototype.arbitraryProp = true;
	assert.ok(true, "set arbitraryProp");
	L.prototype._eventSetup = function() {};
    assert.ok(true, "worked");
});

QUnit.test("setting expandos on a DefineList", function(assert) {
    var DL = DefineList.extend({
        count: "number"
    });

    var dl = new DL();
	dl.assign({ count: 5, skip: 2 });

	assert.equal(dl.get("count"), 5, "read with .get defined"); //-> 5
	assert.equal(dl.count, 5, "read with . defined");

	assert.equal(dl.get("skip"), 2, "read with .get expando");
	assert.equal(dl.skip, 2, "read with . expando");

	assert.equal(dl.get("limit"), undefined, "read with .get undefined");
});

QUnit.test("passing a DefineList to DefineList (#33)", function(assert) {
	var m = new DefineList([ {}, {} ]);

    var m2 = new DefineList(m);
    assert.deepEqual(m.get(), m2.get());
    assert.ok(m[0] === m2[0], "index the same");
    assert.ok(m[1] === m2[1], "index the same");

});

QUnit.test("reading and setting expandos", function(assert) {
    var list = new DefineList();
	var countObservation = new Observation(function() {
        return list.get("count");
	}, null, function(newValue) {
        assert.equal(newValue, 1000, "got new value");
    });
    countObservation.start();

	list.set("count", 1000);

	assert.equal(countObservation.value, 1000);


    var list2 = new DefineList();
	list2.on("count", function(ev, newVal) {
        assert.equal(newVal, 5);
    });
    list2.set("count", 5);
});

QUnit.test("extending DefineList constructor functions (#61)", function(assert) {
	var AList = DefineList.extend('AList', { aProp: {}, aMethod: function() {} });
	var BList = AList.extend('BList', { bProp: {}, bMethod: function() {} });
	var CList = BList.extend('CList', { cProp: {}, cMethod: function() {} });

	var list = new CList([ {}, {} ]);

	list.on("aProp", function(ev, newVal, oldVal) {
      assert.equal(newVal, "PROP");
      assert.equal(oldVal, undefined);
  });
	list.on("bProp", function(ev, newVal, oldVal) {
      assert.equal(newVal, "FOO");
      assert.equal(oldVal, undefined);
  });
	list.on("cProp", function(ev, newVal, oldVal) {
      assert.equal(newVal, "BAR");
      assert.equal(oldVal, undefined);
  });

  list.aProp = "PROP";
  list.bProp = 'FOO';
  list.cProp = 'BAR';

  assert.ok(list.aMethod);
  assert.ok(list.bMethod);
  assert.ok(list.cMethod);
});

QUnit.test("extending DefineList constructor functions more than once (#61)", function(assert) {
	var AList = DefineList.extend("AList", { aProp: {}, aMethod: function() {} });

	var BList = AList.extend("BList", { bProp: {}, bMethod: function() {} });

	var CList = AList.extend("CList", { cProp: {}, cMethod: function() {} });

	var list1 = new BList([ {}, {} ]);
	var list2 = new CList([ {}, {}, {} ]);

	list1.on("aProp", function(ev, newVal, oldVal) {
        assert.equal(newVal, "PROP", "aProp newVal on list1");
        assert.equal(oldVal, undefined);
    });
	list1.on("bProp", function(ev, newVal, oldVal) {
        assert.equal(newVal, "FOO", "bProp newVal on list1");
        assert.equal(oldVal, undefined);
    });

	list2.on("aProp", function(ev, newVal, oldVal) {
        assert.equal(newVal, "PROP", "aProp newVal on list2");
        assert.equal(oldVal, undefined);
    });
	list2.on("cProp", function(ev, newVal, oldVal) {
        assert.equal(newVal, "BAR", "cProp newVal on list2");
        assert.equal(oldVal, undefined);
    });

    list1.aProp = "PROP";
    list1.bProp = 'FOO';
    list2.aProp = "PROP";
    list2.cProp = 'BAR';
    assert.ok(list1.aMethod, "list1 aMethod");
    assert.ok(list1.bMethod);
    assert.ok(list2.aMethod);
    assert.ok(list2.cMethod, "list2 cMethod");
});

QUnit.test("extending DefineList constructor functions - value (#61)", function(assert) {
	var AList = DefineList.extend("AList", { aProp: { default: 1 } });

    var BList = AList.extend("BList", { });

	var CList = BList.extend("CList", { });

    var c = new CList([]);
	assert.equal(c.aProp, 1, "got initial value");
});

QUnit.test("'*' inheritance works (#61)", function(assert) {
    var Account = DefineMap.extend({
        name: "string",
        amount: "number",
      	slug: {
      		serialize: true,
      		get: function() {
      			return this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      		}
      	}
    });

    var BaseList = DefineList.extend({
        "*": Account
    });

    var ExtendedList = BaseList.extend({});

	var xl = new ExtendedList([ {} ]);

    assert.ok(xl[0] instanceof Account);

});

QUnit.test("shorthand getter setter (#56)", function(assert) {

    var People = DefineList.extend({
		first: "*",
		last: "*",
		get fullName() {
			return this.first + " " + this.last;
		},
		set fullName(newVal) {
			var parts = newVal.split(" ");
			this.first = parts[0];
			this.last = parts[1];
		}
	});

	var p = new People([]);
    p.fullName = "Mohamed Cherif";

	p.on("fullName", function(ev, newVal, oldVal) {
		assert.equal(oldVal, "Mohamed Cherif");
		assert.equal(newVal, "Justin Meyer");
	});

	assert.equal(p.fullName, "Mohamed Cherif", "fullName initialized right");

	p.fullName = "Justin Meyer";
});

QUnit.test("added and removed are called after items are added/removed (#14)", function(assert) {

	var Person = DefineMap.extend({
		id: "number",
		name: "string"
	});

	var addedFuncCalled, removedFuncCalled, theList;

	var People = DefineList.extend({
		"#": {
			added: function(items, index) {
				addedFuncCalled = true;
				assert.ok(items, "items added got passed to added");
				assert.ok(typeof index === 'number', "index of items was passed to added and is a number");
				assert.ok(items[0].name === 'John', "Name was correct");
				theList = this;
			},
			removed: function(items, index) {
				removedFuncCalled = true;
				assert.ok(items, "items added got passed to removed");
				assert.ok(typeof index === 'number', "index of items was passed to removed and is a number");
				theList = this;
			},
			Type: Person
		},
		outsideProp: {
			type: "boolean",
			default: true
		}
	});

	var people = new People([]);
	var me = new Person();
	me.name = "John";
	me.id = "1234";

	assert.ok(!addedFuncCalled, "added function has not been called yet");
	people.push(me);
	assert.ok(addedFuncCalled, "added function was called");
	assert.ok(theList.outsideProp === true && theList instanceof People,
		"the list was passed correctly as this to added");
	theList = null;
	assert.ok(!removedFuncCalled, "removed function has not been called yet");
	people.splice(people.indexOf(me), 1);
	assert.ok(removedFuncCalled, "removed function was called");
	assert.ok(theList.outsideProp === true && theList instanceof People,
		"the list was passed correctly as this to removed");
});

QUnit.test("* vs # (#78)", function(assert) {

    var MyList = DefineList.extend({
        "*": "number",
        "#": {
			added: function() {
                assert.ok(true, "called on init");
            },
			removed: function() {},
            type: "string"
        }
    });

	var list = new MyList([ 1, 2, 3 ]);

    assert.ok(list[0] === "1", "converted to string");
    list.set("prop", "4");
    assert.ok(list.prop === 4, "type converted");

});

QUnit.test("Array shorthand uses #", function(assert) {
    var MyMap = DefineMap.extend({
		"numbers": [ "number" ]
    });

	var map = new MyMap({ numbers: [ "1", "2" ] });
    assert.ok(map.numbers[0] === 1, "converted to number");

    map.numbers.set("prop", "4");
    assert.ok(map.numbers.prop === "4", "type left alone");
});

QUnit.test("replace-with-self lists are diffed properly (can-view-live#10)", function(assert) {
	var a = new DefineMap({ name: "A" });
	var b = new DefineMap({ name: "B" });
	var c = new DefineMap({ name: "C" });
	var d = new DefineMap({ name: "D" });
	assert.expect(4);

	var list1 = new DefineList([ a, b ]);
	list1.on("add", function(ev, newVals, where) {
		throw new Error("list1 should not add.");
	});
	list1.on("remove", function(ev, oldVals, where) {
		throw new Error("list1 should not remove.");
	});
	list1.replace([ a, b ]);

	var list2 = new DefineList([ a, b, c ]);
	list2.on("add", function(ev, newVals, where) {
		assert.equal(newVals.length, 1, "list2 added length");
		assert.equal(where, 2, "list2 added location");
	});
	list2.on("remove", function(ev, oldVals, where) {
		assert.equal(oldVals.length, 1, "list2 removed length");
		assert.equal(where, 2, "list2 removed location");
	});
	list2.replace([ a, b, d ]);
});

QUnit.test("set >= length - triggers length event (#152)", function(assert) {
	var l = new DefineList([ 1, 2, 3 ]);
	var batchNum = null;

	l.on("add", function(e) {
		assert.ok(true, "add called");

		if (batchNum === null) {
			batchNum = e.batchNum;
		}
		else {
			assert.equal(batchNum, e.batchNum, "batch numbers match");
		}
	});
	l.on("remove", function(e) {
		assert.ok(false, "remove called");

		if (batchNum === null) {
			batchNum = e.batchNum;
		}
		else {
			assert.equal(batchNum, e.batchNum, "batch numbers match");
		}
	});
	l.on("length", function(e) {
		assert.ok(true, "length called");

		if (batchNum === null) {
			batchNum = e.batchNum;
		}
		else {
			assert.equal(batchNum, e.batchNum, "batch numbers match");
		}
	});

	assert.expect(4);
	l.set(3, 5);

	assert.deepEqual(l.get(), [ 1, 2, 3, 5 ], "updated list");
});

QUnit.test("set < length - triggers length event (#150)", function(assert) {
	var l = new DefineList([ 1, 2, 3 ]);
	var batchNum = null;

	l.on("add", function(e) {
		assert.ok(true, "add called");

		if (batchNum === null) {
			batchNum = e.batchNum;
		}
		else {
			assert.equal(batchNum, e.batchNum, "batch numbers match");
		}
	});
	l.on("remove", function(e) {
		assert.ok(true, "remove called");

		if (batchNum === null) {
			batchNum = e.batchNum;
		}
		else {
			assert.equal(batchNum, e.batchNum, "batch numbers match");
		}
	});
	l.on("length", function(e) {
		assert.ok(true, "length called");

		if (batchNum === null) {
			batchNum = e.batchNum;
		}
		else {
			assert.equal(batchNum, e.batchNum, "batch numbers match");
		}
	});

	assert.expect(6);
	l.set(2, 4);

	assert.deepEqual(l.get(), [ 1, 2, 4 ], "updated list");
});

QUnit.test("set/splice are observable", function(assert) {
	var list = new DefineList([ 1, 2, 3, 4, 5 ]);

	var count = new Observation(function() {
		var count = 0;
		for (var i = 0; i < list.length; i++) {
			count += (list[i] % 2) ? 1 : 0;
		}
		return count;
	});

	canReflect.onValue(count, function(){
		assert.ok(true);
	});

	assert.expect(3);
	list.set(3, 5);
	list.set(2, 4);
	list.splice(1, 1, 1);
});

QUnit.test("setting length > current (#147)", function(assert) {
	var list = new DefineList([ 1, 2 ]);

	list.length = 5;

	assert.equal(list.length, 5);
	assert.equal(list.hasOwnProperty(0), true);
	assert.equal(list.hasOwnProperty(1), true);
	assert.equal(list.hasOwnProperty(2), true);
	assert.equal(list.hasOwnProperty(3), true);
	assert.equal(list.hasOwnProperty(4), true);
	assert.equal(list.hasOwnProperty(5), false);
});

QUnit.test("setting length < current (#147)", function(assert) {
	var list = new DefineList([ 1, 2, 3, 4, 5 ]);

	list.length = 3;

	assert.equal(list.length, 3);
	assert.equal(list.hasOwnProperty(0), true);
	assert.equal(list.hasOwnProperty(1), true);
	assert.equal(list.hasOwnProperty(2), true);
	assert.equal(list.hasOwnProperty(3), false);
	assert.equal(list.hasOwnProperty(4), false);
	assert.equal(list.hasOwnProperty(5), false);
});

QUnit.test('every', function(assert) {
	var l = new DefineList([ { id: 1, name: "Bob" }, { id: 2, name: "Bob" } ]);

	var allBobs = l.every(function(item) {
		return item.name === "Bob";
	});
	assert.ok(allBobs, "Every works in true case");
	var idOne = l.every(function(item) {
		return item.id === 1;
	});
	assert.ok(!idOne, "Every works in false case");

	allBobs = l.every({
		name : "Bob"
	});
	assert.ok(allBobs, "Every works in true case");
	idOne = l.every({
		name : "Bob",
		id : 1
	});
	assert.ok(!idOne, "Every works in false case");

});

QUnit.test('some', function(assert) {
	var l = new DefineList([ { id: 1, name: "Alice" }, { id: 2, name: "Bob" } ]);

	var allBobs = l.some(function(item) {
		return item.name === "Bob";
	});
	assert.ok(allBobs, "Some works in true case");
	var idOne = l.some(function(item) {
		return item.name === "Charlie";
	});
	assert.ok(!idOne, "Some works in false case");

	allBobs = l.some({
		name : "Bob"
	});
	assert.ok(allBobs, "Some works in true case");
	idOne = l.some({
		name : "Bob",
		id : 1
	});
	assert.ok(!idOne, "Some works in false case");

});

QUnit.test('lastIndexOf', function(assert) {
	var l = new DefineList([ { id: 1, name: "Alice" }, { id: 2, name: "Bob" } ]);

	var bobIdx = l.lastIndexOf(l[1]);
	assert.equal(bobIdx, 1, "lastIndexOf found object");
	var charlieIdx = l.lastIndexOf({ id : 3, name: "Charlie" });
	assert.equal(charlieIdx, -1, "lastIndexOf not found object");

	// make a new reference to [1] at [2]
	l.push(l[1]);

	bobIdx = l.lastIndexOf(l[1]);
	assert.equal(bobIdx, 2, "lastIndexOf found last index of duped object");

});

QUnit.test('reduce', function(assert) {
	var l = new DefineList([
		{ id: 1, name: "Alice", score: 10 },
		{ id: 2, name: "Bob", score: 20 }
	]);

	var totalScores = l.reduce(function(total, player) {
		return total + player.score;
	}, 0);

	assert.equal(totalScores, 30, "Reduce works over list");
});

QUnit.test('reduceRight', function(assert) {
	var l = new DefineList([
		{ id: 1, name: "Alice"},
		{ id: 2, name: "Bob"}
	]);

	var concatenatedNames = l.reduceRight(function(string, person) {
		return string + person.name;
	}, "");

	assert.equal(concatenatedNames, "BobAlice", "ReduceRight works over list");
});

/*
// TODO: bring these back with can-stache-key
test("compute(defineMap, 'property.names') works (#20)", function(){
	var map = new DefineMap();
	var c = compute(map, "foo.bar");
	c.on("change", function(ev, newVal){
		assert.equal(newVal, 2);
	});

	map.set("foo", new DefineMap());
	map.foo.set("bar", 2);

});

test("compute(DefineList, 0) works (#17)", function(assert){
	assert.expect(1);
	var list = new DefineList([1,2,3]);
	var c = compute(list, 0);
	c.on("change", function(ev, newVal){
		assert.equal(newVal, 5);
	});
	list.set(0, 5);
});


QUnit.test("can-reflect onValue", function(assert) {
	assert.expect(1);
	var list = new DefineList([1,2,3]);
	var first = compute(list, 0);
	canReflect.onValue(first, function(newVal) {
		assert.equal(newVal, 5);
	});
	list.set(0, 5);
});
*/

QUnit.test("can-reflect onKeyValue", function(assert) {
	assert.expect(3);
	var list = new DefineList([1,2,3]);
	var key = 1;
	canReflect.onKeyValue(list, key, function(newVal) {
		assert.equal(newVal, 5);
	});
	list.set(key, 5);

	canReflect.onKeyValue(list, 'length', function(newVal) {
		assert.equal(newVal, 4);
	});
	list.push(6);
});

QUnit.test("works with can-reflect", function(assert) {
	var a = new DefineMap({ foo: 4 });
	var b = new DefineList([ "foo", "bar" ]);
	var c;
	assert.equal( canReflect.getKeyValue(b, "0"), "foo", "unbound value");


	assert.ok(!canReflect.isValueLike(b), "isValueLike is false");
	assert.ok(canReflect.isObservableLike(b), "isObservableLike is true");
	assert.ok(canReflect.isMapLike(b), "isMapLike is true");
	assert.ok(canReflect.isListLike(b), "isListLike is false");

	assert.ok( !canReflect.keyHasDependencies(b, "length"), "keyHasDependencies -- false");

	define(c = Object.create(b), {
		length: {
			get: function() {
				return a.foo;
			}
		}
	});

	assert.ok(canReflect.getKeyDependencies(c, "length"), "dependencies exist");
	assert.ok(
		canReflect.getKeyDependencies(c, "length").valueDependencies.has(c._computed.length.compute),
		"dependencies returned"
	);

	/*
	canReflect.onKeysAdded(b, handler);
	canReflect.onKeysRemoved(b, handler);
	assert.ok(b.__bindEvents.add, "add handler added");
	assert.ok(b.__bindEvents.remove, "remove handler added");

	b.push("quux");
	c.push("quux");
	assert.equal( canReflect.getKeyValue(c, "length"), "4", "bound value");
	b.pop();*/

});

QUnit.test("can-reflect setKeyValue", function(assert) {
	var a = new DefineList([ "a", "b" ]);

	canReflect.setKeyValue(a, 1, "c");
	assert.equal(a[1], "c", "setKeyValue");
});

QUnit.test("can-reflect deleteKeyValue", function(assert) {
	var a = new DefineList([ "a", "b" ]);
	a.set("foo", "bar");

	canReflect.deleteKeyValue(a, 0);
	assert.equal(a[1], undefined, "last value is now undefined");
	assert.equal(a[0], "b", "last value is shifted down");

	canReflect.deleteKeyValue(a, "foo");
	assert.equal(a.foo, undefined, "value not included in serial");
	assert.ok(!("foo" in a.get()), "value not included in serial");
});

QUnit.test("can-reflect getKeyDependencies", function(assert) {
	var a = new DefineMap({ foo: 4 });
	var b = new DefineList([ "foo", "bar" ]);
	var c;

	assert.ok(!canReflect.getKeyDependencies(b, "length"), "No dependencies before binding");

	define(c = Object.create(b), {
		length: {
			get: function() {
				return a.foo;
			}
		}
	});

	assert.ok(canReflect.getKeyDependencies(c, "length"), "dependencies exist");
	assert.ok(canReflect.getKeyDependencies(c, "length").valueDependencies.has(c._computed.length.compute), "dependencies returned");

});

QUnit.test("assign property", function(assert) {
	var list = new DefineList(["A","B"]);
	list.assign({count: 0, skip: 2, arr: ['1', '2', '3']});
	assert.equal(list.get('count'), 0, 'Count set properly');

	list.assign({count: 1000, arr: ['first']});

	assert.deepEqual(list.get('arr'), new DefineList(['first']), 'Array is set properly');
	assert.equal(list.get('count'), 1000, 'Count set properly');
	assert.equal(list.get('skip'), 2, 'Skip is unchanged');
});


QUnit.test("update property", function(assert) {
	var list = new DefineList(["A","B"]);
	list.update({count: 0, skip: 2});
	assert.equal(list.get('count'), 0, 'Count set properly');

	list.update({count: 1000});

	assert.equal(list.get('count'), 1000, 'Count set properly');
	assert.equal(list.get('skip'), undefined, 'Skip is changed');
});

QUnit.test("assignDeep property", function(assert) {
	var list = new DefineList(["A","B"]);
	list.assignDeep({count: 0, skip: 2, foo: { bar: 'zed', tar: 'yap' }});

	assert.equal(list.get('count'), 0, 'Count set properly');

	list.assignDeep({count: 1000, foo: {bar: 'updated'}});
	assert.equal(list.get('count'), 1000, 'Count set properly');
	assert.equal(list.get('skip'), 2, 'Skip is unchanged');
	assert.propEqual(list.get('foo'), { bar: 'updated', tar: 'yap' }, 'Foo was updated properly');
});

QUnit.test("updateDeep property", function(assert) {
	var list = new DefineList(["A","B"]);
	list.updateDeep({count: 0, skip: 2, foo: { bar: 'zed', tar: 'yap' }});
	assert.equal(list.get('count'), 0, 'Count set properly');

	list.updateDeep({count: 1000});

	assert.equal(list.get('count'), 1000, 'Count set properly');
	assert.equal(list.get('skip'), undefined, 'Skip is set to undefined');
	assert.propEqual(list.get('foo'), undefined, 'Foo is set to undefined');
});

QUnit.test("registered symbols", function(assert) {
	var a = new DefineMap({ "a": "a" });

	assert.ok(a[canSymbol.for("can.isMapLike")], "can.isMapLike");
	assert.equal(a[canSymbol.for("can.getKeyValue")]("a"), "a", "can.getKeyValue");
	a[canSymbol.for("can.setKeyValue")]("a", "b");
	assert.equal(a.a, "b", "can.setKeyValue");

	function handler(val) {
		assert.equal(val, "c", "can.onKeyValue");
	}

	a[canSymbol.for("can.onKeyValue")]("a", handler);
	a.a = "c";

	a[canSymbol.for("can.offKeyValue")]("a", handler);
	a.a = "d"; // doesn't trigger handler
});

QUnit.test("cannot remove length", function(assert) {
	var list = new DefineList(["a"]);

	list.set("length", undefined);

	assert.equal(list.length, 1, "list length is unchanged");

});

QUnit.test("cannot set length to a non-number", function(assert) {
	var list = new DefineList(["a"]);

	list.set("length", null);
	assert.equal(list.length, 1, "list length is unchanged");

	list.set("length", "foo");
	assert.equal(list.length, 1, "list length is unchanged");

	list.set("length", {});
	assert.equal(list.length, 1, "list length is unchanged");
});

QUnit.test("_length is not enumerable", function(assert) {
	assert.ok(!Object.getOwnPropertyDescriptor(new DefineList(), "_length").enumerable, "_length is not enumerable");
});

QUnit.test("update with no indexed items sets length to 0", function(assert) {
	var list = new DefineList(["a"]);
	assert.equal(list.length, 1, "list length is correct before update");

	list.update({ foo: "bar" });

	assert.equal(list.length, 0, "list length is correct after update");
});

["length", "_length"].forEach(function(prop) {
	QUnit.test("setting " + prop + " does not overwrite definition", function(assert) {
		var list = new DefineList();

		list.get(prop);
		var proto = list, listDef, listDef2;
		while(!listDef && proto) {
			listDef = Object.getOwnPropertyDescriptor(proto, prop);
			proto = Object.getPrototypeOf(proto);
		}

		list.set(prop, 1);

		proto = list;
		while(!listDef2 && proto) {
			listDef2 = Object.getOwnPropertyDescriptor(proto, prop);
			proto = Object.getPrototypeOf(proto);
		}
		delete listDef2.value;
		delete listDef.value;

		assert.deepEqual(listDef2, listDef, "descriptor hasn't changed");
	});
});

QUnit.test("iterator can recover from bad _length", function(assert) {
	var list = new DefineList(["a"]);
	list.set("_length", null);
	assert.equal(list._length, null, "Bad value for _length");

	var iterator = list[canSymbol.iterator]();
	var iteration = iterator.next();
	assert.ok(iteration.done, "Didn't fail");
});


QUnit.test("onPatches", function(assert) {
	var list = new DefineList(["a","b"]);
	var PATCHES = [
		[ {deleteCount: 2, index: 0, type: "splice"} ],
		[ {index: 0, insert: ["A","B"], deleteCount: 0, type: "splice"} ]
	];
	var calledPatches = [];
	var handler = function patchesHandler(patches){
		calledPatches.push(patches);
	};
	list[canSymbol.for("can.onPatches")](handler,"notify");
	list.replace(["A","B"]);

	list[canSymbol.for("can.offPatches")](handler,"notify");

	list.replace(["1","2"]);
	assert.deepEqual(calledPatches, PATCHES);
});

canTestHelpers.devOnlyTest("can.getName symbol behavior", function(assert) {
	var getName = function(instance) {
		return instance[canSymbol.for("can.getName")]();
	};

	assert.ok(
		"DefineList[]", getName(new DefineList()),
		"should use DefineList constructor name by default"
	);

	var MyList = DefineList.extend("MyList", {});

	assert.ok(
		"MyList[]", getName(new MyList()),
		"should use custom list name when provided"
	);
});

QUnit.test("length event should include previous value", function(assert) {
	var done = assert.async();
	var list = new DefineList([]);
	var other = new DefineList(["a"]);

	var changes = [];
	list.on("length", function(_, current, previous) {
		changes.push({ current: current, previous: previous });
	});

	list.push("x");
	list.pop();
	list.push("y", "z");
	list.splice(2, 0, "x", "w");
	list.splice(0, 1);
	list.sort();
	list.replace(other);

	assert.expect(1);
	setTimeout(function() {
		assert.deepEqual(
			changes,
			[
				{ current: 1, previous: 0 },
				{ current: 0, previous: 1 },
				{ current: 2, previous: 0 },
				{ current: 4, previous: 2 },
				{ current: 3, previous: 4 },
				{ current: 3, previous: 3 },
				{ current: 1, previous: 3 }
			],
			"should include length before mutation"
		);
		done();
	});
});

canTestHelpers.devOnlyTest("log all events", function(assert) {
	var done = assert.async();
	var list = new DefineList(["a","b", "c"]);

	list.set("total", 100);
	list.log();

	var keys = [];
	var log = dev.log;
	dev.log = function() {
		keys.push(JSON.parse(arguments[2]));
	};

	list.push("x");
	list.pop();
	list.set("total", 50);

	assert.expect(1);
	setTimeout(function() {
		dev.log = log;
		assert.deepEqual(
			keys,
			["add", "length", "remove", "length", "total"],
			"should log 'add', 'remove', 'length' and 'propertyName' events"
		);
		done();
	});
});

canTestHelpers.devOnlyTest("log single events", function(assert) {
	var done = assert.async();
	var list = new DefineList(["a","b", "c"]);

	list.set("total", 100);
	list.log("length");

	var keys = [];
	var log = dev.log;
	dev.log = function() {
		keys.push(JSON.parse(arguments[2]));
	};

	list.push("x");
	list.pop();
	list.set("total", 50);

	assert.expect(1);
	setTimeout(function() {
		dev.log = log;
		assert.deepEqual(keys, ["length", "length"], "should log 'length' event");
		done();
	});
});

canTestHelpers.devOnlyTest("log multiple events", function(assert) {
	var done = assert.async();
	var list = new DefineList(["a","b", "c"]);

	list.set("total", 100);
	list.log("add");
	list.log("total");

	var keys = [];
	var log = dev.log;
	dev.log = function() {
		keys.push(JSON.parse(arguments[2]));
	};

	list.push("x");
	list.pop();
	list.set("total", 50);

	assert.expect(1);
	setTimeout(function() {
		dev.log = log;
		assert.deepEqual(keys, ["add", "total"], "should log add and total");
		done();
	});
});

QUnit.test("DefineList has defineInstanceKey symbol", function(assert) {
	var Type = DefineList.extend({});
	Type[canSymbol.for("can.defineInstanceKey")]("prop", {type: "number"});

	var t = new Type();
	t.prop = "5";
	assert.equal(t.prop, 5, "value set");
});

QUnit.test(".sort() produces patches (can-stache#498)", function(assert) {
	var list = new DefineList(["b","a"]);
	var PATCHES = [
		[ 	{index: 0, deleteCount: 2, type: "splice"}],
		[  {index: 0, insert: ["a","b"], deleteCount: 0, type: "splice"} ]
	];
	var calledPatches = [];
	var handler = function patchesHandler(patches){
		calledPatches.push(patches);
	};

	list[canSymbol.for("can.onPatches")](handler,"notify");
	list.sort();

	assert.deepEqual(calledPatches, PATCHES);
});

QUnit.test("canReflect.getSchema", function(assert) {
	var MyType = DefineMap.extend({
		id: {identity: true, type: "number"},
		name: "string"
	});
	var MyList = DefineList.extend({
		count: "number",
		"#": MyType
	});

	var schema = canReflect.getSchema(MyList);

	assert.equal(schema.values, MyType);
});

QUnit.test("Bound serialized lists update when they change length", function(assert) {
	assert.expect(1);
	var list = new DefineList(["eggs"]);
	var obs = new Observation(function(){
		return list.serialize();
	});

	function onChange(val) {
		assert.deepEqual(val, ["eggs", "toast"]);
	}

	canReflect.onValue(obs, onChange);
	list.push("toast");
	canReflect.offValue(obs, onChange);
});

if (typeof Array.prototype.includes === "function") {
	QUnit.test("'includes' method basics (#277)", function(assert) {
		assert.expect(6);

		var emptyList = new DefineList([]);
		assert.notOk(emptyList.includes(2));

		var list = new DefineList([1, 2, 3]);
		assert.ok(list.includes(2));
		assert.notOk(list.includes(4));
		assert.notOk(list.includes(3, 3));
		assert.ok(list.includes(3, -1));

		var nanList = new DefineList([1, 2, NaN]);
		assert.ok(nanList.includes(NaN));
	});

	QUnit.test("'fromIndex' is not >= to the array length", function(assert) {
		assert.expect(2);

		var list = new DefineList(["a", "b", "c"]);
		assert.notOk(list.includes("c", 3));
		assert.notOk(list.includes("c", 100));
	});

	QUnit.test("computed index is less than 0", function(assert) {
		assert.expect(4);

		var list = new DefineList(["a", "b", "c"]);
		assert.ok(list.includes("a", -100));
		assert.ok(list.includes("b", -100));
		assert.ok(list.includes("c", -100));
		assert.notOk(list.includes("a", -2));
	});

	QUnit.test("Bound 'includes' (#277)", function(assert) {
		assert.expect(1);
		var list = new DefineList();
		var obs = new Observation(function(){
			return list.includes("foo");
		});

		function onChange(val) {
			assert.ok(val);
		}

		canReflect.onValue(obs, onChange);
		list.push("foo");
		canReflect.offValue(obs, onChange);
	});
}

QUnit.test("Set __inSetup prop #421", function(assert) {
	var list = new DefineList([]);
	list.set("__inSetup", "nope");
	assert.equal(list.__inSetup, "nope");
});
