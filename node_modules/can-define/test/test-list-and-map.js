var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var canReflect = require("can-reflect");
var isPlainObject = canReflect.isPlainObject;
var Observation = require("can-observation");

var define = require("can-define");

var QUnit = require("steal-qunit");

QUnit.module("can-define: map and list combined");

QUnit.test("basics", function(assert) {
    var items = new DefineMap({ people: [{name: "Justin"},{name: "Brian"}], count: 1000 });

    assert.ok(items.people instanceof DefineList, "people is list");
    assert.ok(items.people.item(0) instanceof DefineMap, "1st object is Map");
    assert.ok(items.people.item(1) instanceof DefineMap, "2nd object is Map");
    assert.equal(items.people.item(1).name, "Brian", "2nd object's name is right");
    assert.equal(items.count, 1000, "count is number");
});

QUnit.test("basic type", function(assert) {

	assert.expect(6);

	var Typer = function(arrayWithAddedItem, listWithAddedItem) {
		this.arrayWithAddedItem = arrayWithAddedItem;
		this.listWithAddedItem = listWithAddedItem;
	};

	define(Typer.prototype, {
		arrayWithAddedItem: {
			type: function(value) {
				if (value && value.push) {
					value.push("item");
				}
				return value;
			}
		},
		listWithAddedItem: {
			type: function(value) {
				if (value && value.push) {
					value.push("item");
				}
				return value;
			},
			Type: DefineList
		}
	});




	var t = new Typer();
	assert.deepEqual(Object.keys(t), [], "no keys");

	var array = [];
	t.arrayWithAddedItem = array;

	assert.deepEqual(array, ["item"], "updated array");
	assert.equal(t.arrayWithAddedItem, array, "leave value as array");

	t.listWithAddedItem = [];

	assert.ok(t.listWithAddedItem instanceof DefineList, "convert to CanList");
	assert.equal(t.listWithAddedItem[0], "item", "has item in it");

    var observation = new Observation(function() {
		return t.listWithAddedItem.attr("length");
	});
    canReflect.onValue(observation, function(newVal) {
		assert.equal(newVal, 2, "got a length change");
	});

	t.listWithAddedItem.push("another item");

});

QUnit.test("serialize works", function(assert) {
    var Person = DefineMap.extend({
        first: "string",
        last: "string"
    });
    var People = DefineList.extend({
        "*": Person
    });

    var people = new People([{first: "j", last: "m"}]);
    assert.deepEqual(people.serialize(), [{first: "j", last: "m"}]);

});

QUnit.test("Extended Map with empty def converts to default Observables", function(assert) {
    var School = DefineMap.extend({
        students: {},
        teacher: {}
    });

    var school = new School();

    school.students = [{name: "J"}];
    school.teacher = {name: "M"};

    assert.ok(school.students instanceof DefineList, "converted to DefineList");
    assert.ok(school.teacher instanceof DefineMap, "converted to DefineMap");

});

QUnit.test("default 'observable' type prevents Type from working (#29)", function(assert) {
    var M = DefineMap.extend("M",{
        id: "number"
    });
    var L = DefineList.extend("L",{
        "*": M
    });

    var MyMap = DefineMap.extend({
        l: L
    });

    var m = new MyMap({
        l: [{id: 5}]
    });

    assert.ok( m.l[0] instanceof M, "is instance" );
    assert.equal(m.l[0].id, 5, "correct props");
});

QUnit.test("inline DefineList Type", function(assert) {
    var M = DefineMap.extend("M",{
        id: "number"
    });

    var MyMap = DefineMap.extend({
        l: {Type: [M]}
    });

    var m = new MyMap({
        l: [{id: 5}]
    });

    assert.ok( m.l[0] instanceof M, "is instance" );
    assert.equal(m.l[0].id, 5, "correct props");
});

QUnit.test("recursively `get`s (#31)", function(assert) {
    var M = DefineMap.extend("M",{
        id: "number"
    });

    var MyMap = DefineMap.extend({
        l: {Type: [M]}
    });

    var m = new MyMap({
        l: [{id: 5}]
    });

    var res = m.get();
    assert.ok( Array.isArray(res.l), "is a plain array");
    assert.ok( isPlainObject(res.l[0]), "plain object");
});

QUnit.test("DefineList trigger deprecation warning when set with Map.set (#93)", function(assert) {
	assert.expect(0);
	var map = new DefineMap({
		things: [{ foo: 'bar' }]
	});
	map.things.attr = function(){
		assert.ok(false, "attr should not be called");
	};

	map.assign({ things: [{ baz: 'luhrmann' }] });
});


QUnit.test("Value generator can read other properties", function(assert) {
	var Map = define.Constructor({
		letters: {
			default: "ABC"
		},
		numbers: {
			default: [1, 2, 3]
		},
		definedLetters: {
			default: 'DEF'
		},
		definedNumbers: {
			default: [4, 5, 6]
		},
		generatedLetters: {
			default: function() {
				return 'GHI';
			}
		},
		generatedNumbers: {
			default: function() {
				return new DefineList([7, 8, 9]);
			}
		},

		// Get prototype defaults
		firstLetter: {
			default: function() {
				return this.letters.substr(0, 1);
			}
		},
		firstNumber: {
			default: function() {
				return this.numbers[0];
			}
		},

		// Get defined simple `value` defaults
		middleLetter: {
			default: function() {
				return this.definedLetters.substr(1, 1);
			}
		},
		middleNumber: {
			default: function() {
				return this.definedNumbers[1];
			}
		},

		// Get defined `value` function defaults
		lastLetter: {
			default: function() {
				return this.generatedLetters.substr(2, 1);
			}
		},
		lastNumber: {
			default: function() {
				return this.generatedNumbers[2];
			}
		}
	});

	var map = new Map();
	var prefix = 'Was able to read dependent value from ';

	assert.equal(map.firstLetter, 'A',
		prefix + 'traditional can.Map style property definition');
	assert.equal(map.firstNumber, 1,
		prefix + 'traditional can.Map style property definition');

	assert.equal(map.middleLetter, 'E',
		prefix + 'define plugin style default property definition');
	assert.equal(map.middleNumber, 5,
		prefix + 'define plugin style default property definition');

	assert.equal(map.lastLetter, 'I',
		prefix + 'define plugin style generated default property definition');
	assert.equal(map.lastNumber, 9,
		prefix + 'define plugin style generated default property definition');
});

QUnit.test('value and get (#1521)', function(assert) {
	// problem here is that previously, can.Map would set `size:1` on
	// the map. This would effectively set the "lastSetValue".

	// in this new version, default values are not set.  They
	// are only present. later.
	// one option is that there's a "read-mode" for last-set.  Until it's
	// been set, it should get it's value from any default value?

	var MyMap = define.Constructor({
		data: {
			default: function() {
				return new DefineList(['test']);
			}
		},
		size: {
			default: 1,
			get: function(val) {
				var list = this.data;
				var length = list.attr('length');
				return val + length;
			}
		}
	});

	var map = new MyMap({});
	assert.equal(map.size, 2);
});

QUnit.test('Assign value on map', function(assert) {
	var MyConstruct = DefineMap.extend({
		list: DefineList,
		name: 'string'
	});

	var obj = new MyConstruct({
		list: ['data', 'data', 'data'],
		name: 'CanJS',
		foo: {
			bar: 'bar',
			zoo: 'say'
		}
	});


	obj.assign({
		list: ['another'],
		foo: {
			bar: 'zed'
		}
	});

	assert.equal(obj.list.length, 1, 'list length should be 1');
	assert.propEqual(obj.foo, { bar: 'zed' }, 'foo.bar is set correctly');
	assert.equal(obj.name, 'CanJS', 'name is unchanged');

});

QUnit.test('Update value on a map', function(assert) {
	var MyConstruct = DefineMap.extend({
		list: DefineList,
		name: 'string'
	});

	var obj = new MyConstruct({
		list: ['data', 'data', 'data'],
		name: 'CanJS',
		foo: {
			bar: 'bar'
		}
	});

	obj.update({
		list: ['another'],
		foo: {
			bar: 'zed'
		}
	});

	assert.equal(obj.list.length, 1, 'list length should be 1');
	assert.equal(obj.foo.bar, 'zed', 'foo.bar is set correctly');
	assert.equal(obj.name, undefined, 'name is removed');

});


QUnit.test('Deep assign a map', function(assert) {
	var MyConstruct = DefineMap.extend({
		list: DefineList,
		name: 'string'
	});

	var obj = new MyConstruct({
		list: ['data', 'data', 'data'],
		name: 'Test Name'
	});

	assert.equal(obj.list.length, 3, 'list length should be 3');


	obj.assignDeep({
		list: ['something']
	});

	assert.equal(obj.name, 'Test Name', 'Name property is still intact');
	assert.equal(obj.list[0], 'something', 'the first element in the list should be updated');

});


QUnit.test('Deep updating a map', function(assert) {
	var MyConstruct = DefineMap.extend({
		list: DefineList,
		name: 'string'
	});

	var obj = new MyConstruct({
		list: ['data', 'data', 'data'],
		name: 'Test Name'
	});

	assert.equal(obj.list.length, 3, 'list length should be 3');


	obj.updateDeep({
		list: ['something']
	});

	assert.equal(obj.name, undefined, 'Name property has been reset');
	assert.equal(obj.list[0], 'something', 'the first element of the list should be updated');

});

QUnit.test("assignDeep", function(assert) {
	var justin = new DefineMap({name: "Justin", age: 35}),
		payal = new DefineMap({name: "Payal", age: 35});

	var people = new DefineList([justin, payal]);

	people.assignDeep([
		{age: 36}
	]);

	assert.deepEqual(people.serialize(),  [
		{name: "Justin", age: 36},
		{name: "Payal", age: 35}
	], "assigned right");
});

QUnit.test("DefineMap fires 'set' event when a new property is added (#400)", function(assert) {
	var counter = 0;
	var vm = new DefineMap({});

	canReflect.onPatches(vm, function (patch) {
		if (counter === 0) {
			assert.equal(patch[0].type, 'add', 'dispatched add correctly');
		} else {
			assert.equal(patch[0].type, 'set', 'dispatched set correctly');
		}
		counter++;
	});

	vm.set("name", "Matt");
	vm.set("name", "Justin");
});
