var QUnit = require("steal-qunit");

var define = require("can-define");
var queues = require("can-queues");
var canSymbol = require("can-symbol");
var SimpleObservable = require("can-simple-observable");
var testHelpers = require("can-test-helpers");
var canReflect = require("can-reflect");
var ObservationRecorder = require("can-observation-recorder");

QUnit.module("can-define");

QUnit.test("basics on a prototype", function(assert) {
	assert.expect(5);

	var Person = function(first, last) {
		this.first = first;
		this.last = last;
	};
	define(Person.prototype, {
		first: "*",
		last: "*",
		fullName: {
			get: function() {
				return this.first + " " + this.last;
			}
		}
	});

	var p = new Person("Mohamed", "Cherif");

	p.bind("fullName", function(ev, newVal, oldVal) {
		assert.equal(oldVal, "Mohamed Cherif");
		assert.equal(newVal, "Justin Meyer");
	});

	assert.equal(p.fullName, "Mohamed Cherif", "fullName initialized right");

	p.bind("first", function(el, newVal, oldVal) {
		assert.equal(newVal, "Justin", "first new value");
		assert.equal(oldVal, "Mohamed", "first old value");
	});

	queues.batch.start();
	p.first = "Justin";
	p.last = "Meyer";
	queues.batch.stop();

});

QUnit.test('basics set', function(assert) {
	assert.expect(2);
	var Defined = function(prop) {
		this.prop = prop;
	};

	define(Defined.prototype, {
		prop: {
			set: function(newVal) {
				return "foo" + newVal;
			}
		}
	});

	var def = new Defined();
	def.prop = "bar";


	assert.equal(def.prop, "foobar", "setter works");

	var DefinedCB = function(prop) {
		this.prop = prop;
	};

	define(DefinedCB.prototype, {
		prop: {
			set: function(newVal, setter) {
				setter("foo" + newVal);
			}
		}
	});

	var defCallback = new DefinedCB();
	defCallback.prop = "bar";
	assert.equal(defCallback.prop, "foobar", "setter callback works");

});



QUnit.test("basic Type", function(assert) {
	var Foo = function(name) {
		this.name = name;
	};
	Foo.prototype.getName = function() {
		return this.name;
	};

	var Typer = function(foo) {
		this.foo = foo;
	};

	define(Typer.prototype, {
		foo: {
			Type: Foo
		}
	});

	var t = new Typer("Justin");
	assert.equal(t.foo.getName(), "Justin", "correctly created an instance");

	var brian = new Foo("brian");

	t.foo = brian;

	assert.equal(t.foo, brian, "same instances");

});

QUnit.test("type converters", function(assert) {

	var Typer = function(date, string, number, bool, htmlbool, leaveAlone) {
		this.date = date;
		this.string = string;
		this.number = number;
		this.bool = bool;
		this.htmlbool = htmlbool;
		this.leaveAlone = leaveAlone;
	};

	define(Typer.prototype, {
		date: {
			type: 'date'
		},
		string: {
			type: 'string'
		},
		number: {
			type: 'number'
		},
		bool: {
			type: 'boolean'
		},
		htmlbool: {
			type: 'htmlbool'
		},
		leaveAlone: {
			type: '*'
		},
	});

	var obj = {};

	var t = new Typer(
		1395896701516,
		5,
		'5',
		'false',
		"",
		obj
	);

	assert.ok(t.date instanceof Date, "converted to date");

	assert.equal(t.string, '5', "converted to string");

	assert.equal(t.number, 5, "converted to number");

	assert.equal(t.bool, false, "converted to boolean");

	assert.equal(t.htmlbool, true, "converted to htmlbool");

	assert.equal(t.leaveAlone, obj, "left as object");

	t.number = '15';

	assert.ok(t.number === 15, "converted to number");

});

QUnit.test("basics value", function(assert) {

	var Typer = function(prop) {
		if (prop !== undefined) {
			this.prop = prop;
		}
	};

	define(Typer.prototype, {
		prop: {
			default: 'foo'
		}
	});
	var t = new Typer();

	assert.equal(t.prop, "foo", "value is used as default value");

	var Typer2 = function(prop) {
		if (prop !== undefined) {
			this.prop = prop;
		}
	};

	define(Typer2.prototype, {
		prop: {
			default: function() {
				return [];
			},
			type: "*"
		}
	});

	var t1 = new Typer2(),
		t2 = new Typer2();

	assert.ok(t1.prop !== t2.prop, "different array instances");
	assert.ok(Array.isArray(t1.prop), "its an array");


});

QUnit.test("basics Value", function(assert) {

	var Typer = function(prop) {
		//this.prop = prop;
	};
	define(Typer.prototype, {

		prop: {
			Default: Array,
			type: "*"
		}

	});

	var t1 = new Typer(),
		t2 = new Typer();
	assert.ok(t1.prop !== t2.prop, "different array instances");
	assert.ok(Array.isArray(t1.prop), "its an array");


});

QUnit.test("setter with no arguments and returns undefined does the default behavior, the setter is for side effects only", function(assert) {
	var Typer = function(prop) {
		//this.prop = prop;
	};
	define(Typer.prototype, {

		prop: {
			set: function() {
				this.foo = "bar";
			}
		},
		foo: "*"

	});

	var t = new Typer();

	t.prop = false;

	assert.deepEqual({
		foo: t.foo,
		prop: t.prop
	}, {
		foo: "bar",
		prop: false
	}, "got the right props");

});

QUnit.test("type happens before the set", function(assert) {
	assert.expect(2);

	var Typer = function() {};
	define(Typer.prototype, {

		prop: {
			type: "number",
			set: function(newValue) {
				assert.equal(typeof newValue, "number", "got a number");
				return newValue + 1;
			}
		}

	});

	var map = new Typer();
	map.prop = "5";

	assert.equal(map.prop, 6, "number");
});


QUnit.test("getter and setter work", function(assert) {
	assert.expect(5);

	var Paginate = define.Constructor({
		limit: "*",
		offset: "*",
		page: {
			set: function(newVal) {
				this.offset = (parseInt(newVal) - 1) * this.limit;
			},
			get: function() {
				return Math.floor(this.offset / this.limit) + 1;
			}
		}
	});

	var p = new Paginate({
		limit: 10,
		offset: 20
	});

	assert.equal(p.page, 3, "page get right");

	p.bind("page", function(ev, newValue, oldValue) {
		assert.equal(newValue, 2, "got new value event");
		assert.equal(oldValue, 3, "got old value event");
	});

	p.page = 2;

	assert.equal(p.page, 2, "page set right");

	assert.equal(p.offset, 10, "page offset set");

});

QUnit.test("getter with initial value", function(assert) {

	var comp = new SimpleObservable(1);

	var Grabber = define.Constructor({
		vals: {
			type: "*",
			Default: Array,
			get: function(current, setVal) {
				if (setVal) {
					current.push(comp.get());
				}
				return current;
			}
		}
	});

	var g = new Grabber();
	// This assertion doesn't mean much.  It's mostly testing
	// that there were no errors.
	assert.equal(g.vals.length, 0, "zero items in array");

});

/*
test("value generator is not called if default passed", function () {
	var TestMap = define.Constructor({
		foo: {
			value: function () {
				throw '"foo"\'s value method should not be called.';
			}
		}
	});

	var tm = new TestMap({ foo: 'baz' });

	equal(tm.foo, 'baz');
});*/



QUnit.test('default behaviors with "*" work for attributes', function(assert) {
	assert.expect(6);
	var DefaultMap = define.Constructor({
		'*': {
			type: 'number',
			set: function(newVal) {
				assert.ok(true, 'set called');
				return newVal;
			}
		},
		someNumber: {
			default: '5'
		},
		number: {}
	});

	var map = new DefaultMap();

	assert.equal(map.someNumber, '5', 'default values are not type converted anymore');
	map.someNumber = '5';
	assert.equal(map.someNumber, 5, 'on a set, they should be type converted');

	map.number = '10'; // Custom set should be called
	assert.equal(map.number, 10, 'value of number should be converted to a number');

});


QUnit.test("nested define", function(assert) {
	var nailedIt = 'Nailed it';

	var Example = define.Constructor({
		name: {
			default: nailedIt
		}
	});

	var NestedMap = define.Constructor({
		isEnabled: {
			default: true
		},
		test: {
			Default: Example
		},
		examples: {
			type: {
				one: {
					Default: Example
				},
				two: {
					type: {
						deep: {
							Default: Example
						}
					},
					Default: Object
				}
			},
			Default: Object
		}
	});

	var nested = new NestedMap();

	// values are correct
	assert.equal(nested.test.name, nailedIt);
	assert.equal(nested.examples.one.name, nailedIt);
	assert.equal(nested.examples.two.deep.name, nailedIt);

	// objects are correctly instanced
	assert.ok(nested.test instanceof Example);
	assert.ok(nested.examples.one instanceof Example);
	assert.ok(nested.examples.two.deep instanceof Example);
});

QUnit.test('Can make an attr alias a compute (#1470)', function(assert) {
	assert.expect(9);
	var computeValue = new SimpleObservable(1);

	var GetMap = define.Constructor({
		value: {
			set: function(newValue, setVal, oldValue) {
				if (newValue instanceof SimpleObservable) {
					return newValue;
				}
				if (oldValue && (oldValue instanceof SimpleObservable)) {
					oldValue.set(newValue);
					return oldValue;
				}
				return newValue;
			},
			get: function(value) {
				return value instanceof SimpleObservable ? value.get() : value;
			}
		}
	});

	var getMap = new GetMap();

	getMap.value = computeValue;

	assert.equal(getMap.value, 1, "initial value read from compute");

	var bindCallbacks = 0;

	getMap.bind("value", function(ev, newVal, oldVal) {

		switch (bindCallbacks) {
			case 0:
				assert.equal(newVal, 2, "0 - bind called with new val");
				assert.equal(oldVal, 1, "0 - bind called with old val");
				break;
			case 1:
				assert.equal(newVal, 3, "1 - bind called with new val");
				assert.equal(oldVal, 2, "1 - bind called with old val");
				break;
			case 2:
				assert.equal(newVal, 4, "2 - bind called with new val");
				assert.equal(oldVal, 3, "2 - bind called with old val");
				break;
		}


		bindCallbacks++;
	});

	// Try updating the compute's value
	computeValue.set(2);

	// Try setting the value of the property
	getMap.value = 3;

	assert.equal(getMap.value, 3, "read value is 3");
	assert.equal(computeValue.get(), 3, "the compute value is 3");

	// Try setting to a new comptue
	var newComputeValue = new SimpleObservable(4);

	getMap.value = newComputeValue;

});




QUnit.test("One event on getters (#1585)", function(assert) {

	var Person = define.Constructor({
		name: "*",
		id: "number"
	});

	var AppState = define.Constructor({
		person: {
			get: function appState_person_get(lastSetValue, resolve) {
				if (lastSetValue) {
					return lastSetValue;
				} else if (this.personId) {
					resolve(new Person({
						name: "Jose",
						id: 5
					}));
				} else {
					return null;
				}
			},
			Type: Person
		},
		personId: "*"
	});

	var appState = new AppState();
	var personEvents = 0;
	appState.bind("person", function addPersonEvents(ev, person) {
		personEvents++;
	});

	assert.equal(appState.person, null, "no personId and no lastSetValue");

	appState.personId = 5;
	assert.equal(appState.person.name, "Jose", "a personId, providing Jose");
	assert.ok(appState.person instanceof Person, "got a person instance");

	appState.person = {
		name: "Julia"
	};
	assert.ok(appState.person instanceof Person, "got a person instance");

	assert.equal(personEvents, 2);
});

QUnit.test('Can read a defined property with a set/get method (#1648)', function(assert) {
	// Problem: "get" is not passed the correct "lastSetVal"
	// Problem: Cannot read the value of "foo"

	var Map = define.Constructor({
		foo: {
			default: '',
			set: function(setVal) {
				return setVal;
			},
			get: function(lastSetVal) {
				return lastSetVal;
			}
		}
	});

	var map = new Map();

	assert.equal(map.foo, '', 'Calling .foo returned the correct value');

	map.foo = 'baz';

	assert.equal(map.foo, 'baz', 'Calling .foo returned the correct value');
});


QUnit.test('Can bind to a defined property with a set/get method (#1648)', function(assert) {
	assert.expect(3);
	// Problem: "get" is not called before and after the "set"
	// Problem: Function bound to "foo" is not called
	// Problem: Cannot read the value of "foo"

	var Map = define.Constructor({
		foo: {
			default: '',
			set: function(setVal) {
				return setVal;
			},
			get: function(lastSetVal) {
				return lastSetVal;
			}
		}
	});

	var map = new Map();

	map.bind('foo', function() {
		assert.ok(true, 'Bound function is called');
	});

	assert.equal(map.foo, '', 'Calling .attr(\'foo\') returned the correct value');

	map.foo = 'baz';

	assert.equal(map.foo, 'baz', 'Calling .attr(\'foo\') returned the correct value');
});

QUnit.test("type converters handle null and undefined in expected ways (1693)", function(assert) {

	var Typer = define.Constructor({
		date: {
			type: 'date'
		},
		string: {
			type: 'string'
		},
		number: {
			type: 'number'
		},
		'boolean': {
			type: 'boolean'
		},
		htmlbool: {
			type: 'htmlbool'
		},
		leaveAlone: {
			type: '*'
		}
	});

	var t = new Typer({
		date: undefined,
		string: undefined,
		number: undefined,
		'boolean': undefined,
		htmlbool: undefined,
		leaveAlone: undefined
	});

	assert.equal(t.date, undefined, "converted to date");

	assert.equal(t.string, undefined, "converted to string");

	assert.equal(t.number, undefined, "converted to number");

	assert.equal(t.boolean, undefined, "converted to boolean"); //Updated for canjs#2316

	assert.equal(t.htmlbool, false, "converted to htmlbool");

	assert.equal(t.leaveAlone, undefined, "left as object");

	t = new Typer({
		date: null,
		string: null,
		number: null,
		'boolean': null,
		htmlbool: null,
		leaveAlone: null
	});

	assert.equal(t.date, null, "converted to date");

	assert.equal(t.string, null, "converted to string");

	assert.equal(t.number, null, "converted to number");

	assert.equal(t.boolean, null, "converted to boolean"); //Updated for canjs#2316

	assert.equal(t.htmlbool, false, "converted to htmlbool");

	assert.equal(t.leaveAlone, null, "left as object");

});

QUnit.test('Initial value does not call getter', function(assert) {
	assert.expect(0);

	var Map = define.Constructor({
		count: {
			get: function(lastVal) {
				assert.ok(false, 'Should not be called');
				return lastVal;
			}
		}
	});

	new Map({
		count: 100
	});
});

QUnit.test("getters produce change events", function(assert) {
	var Map = define.Constructor({
		count: {
			get: function(lastVal) {
				return lastVal;
			}
		}

	});

	var map = new Map();

	// map.bind("change", function(){
	//   ok(true, "change called");
	// });

	map.bind('count', function() {
		assert.ok(true, "change called");
	});

	map.count = 22;
});

QUnit.test("Asynchronous virtual properties cause extra recomputes (#1915)", function(assert) {

	var done = assert.async();

	var ran = false;

	var VM = define.Constructor({
		foo: {
			get: function(lastVal, setVal) {
				setTimeout(function() {
					if (setVal) {
						setVal(5);
					}
				}, 10);
			}
		},
		bar: {
			get: function() {
				var foo = this.foo;
				if (foo) {
					if (ran) {
						assert.ok(false, 'Getter ran twice');
					}
					ran = true;
					return foo * 2;
				}
			}
		}
	});

	var vm = new VM();
	vm.bind('bar', function() {});

	setTimeout(function() {
		assert.equal(vm.bar, 10);
		done();
	}, 200);

});



QUnit.test('Default values cannot be set (#8)', function(assert) {
	var Person = function() {};

	define(Person.prototype, {
		first: {
			type: 'string',
			default: 'Chris'
		},
		last: {
			type: 'string',
			default: 'Gomez'
		},
		fullName: {
			get: function() {
				return this.first + ' ' + this.last;
			}
		}
	});

	var p = new Person();

	assert.equal(p.fullName, 'Chris Gomez', 'Fullname is correct');
	p.first = 'Sara';
	assert.equal(p.fullName, 'Sara Gomez', 'Fullname is correct after update');
});


QUnit.test('default type is setable', function(assert) {
	var Person = function() {};

	define(Person.prototype, {
		'*': 'string',
		first: {
			default: 1
		},
		last: {
			default: 2
		}
	});

	var p = new Person();

	assert.ok(p.first === '1', typeof p.first);
	assert.ok(p.last === '2', typeof p.last);
});

QUnit.test("expandos are added in define.setup (#25)", function(assert) {
	var MyMap = define.Constructor({});

	var map = new MyMap({
		prop: 4
	});
	map.on("prop", function() {
		assert.ok(true, "prop event called");
	});
	map.prop = 5;
});



QUnit.test('Set property with type compute', function(assert) {
	var MyMap = define.Constructor({
		computeProp: {
			type: 'compute'
		}
	});

	var m = new MyMap();

	m.computeProp = new SimpleObservable(0);
	assert.equal(m.computeProp, 0, 'Property has correct value');

	m.computeProp = new SimpleObservable(1);
	assert.equal(m.computeProp, 1, 'Property has correct value');
});

QUnit.test('Compute type property can have a default value', function(assert) {
	var MyMap = define.Constructor({
		computeProp: {
			type: 'compute',
			default: function() {
				return 0;
			}
		}
	});

	var m = new MyMap();
	assert.equal(m.computeProp, 0, 'Property has correct value');

	m.computeProp = 1;
	assert.equal(m.computeProp, 1, 'Property has correct value');
});

QUnit.test('Compute type property with compute default value triggers change events when updated', function(assert) {
	var expected = 0;
	var c = new SimpleObservable(0);

	var MyMap = define.Constructor({
		computeProp: {
			type: 'compute',
			default: function() {
				return c;
			}
		}
	});

	var m = new MyMap();

	c.on(function(newVal) {
		assert.equal(newVal, expected, 'Compute fired change event');
	});

	m.on('computeProp', function(ev, newVal) {
		assert.equal(newVal, expected, 'Map fired change event');
	});

	expected = 1;
	m.computeProp = expected;

	expected = 2;
	c.set(expected);
});

QUnit.test('Compute type property can have a default value that is a compute', function(assert) {
	var c = new SimpleObservable(0);

	var MyMap = define.Constructor({
		computeProp: {
			type: 'compute',
			default: function() {
				return c;
			}
		}
	});

	var m = new MyMap();
	assert.equal(m.computeProp, 0, 'Property has correct value');

	c.set(1);
	assert.equal(m.computeProp, 1, 'Property has correct value');
});

QUnit.test('Extensions can modify definitions', function(assert) {
	var oldExtensions = define.extensions;

	define.behaviors.push('extended');

	define.extensions = function(objPrototype, prop, definition) {
		if (definition.extended) {
			return {
				default: 'extended'
			};
		}
	};

	var MyMap = define.Constructor({
		foo: {
			default: 'defined',
			extended: true,
		},
		bar: {
			default: 'defined'
		}
	});

	var map = new MyMap();

	assert.equal(map.foo, 'extended', 'Value was set via extension');
	assert.equal(map.bar, 'defined', 'Value was set via definition');

	define.extensions = oldExtensions;
});


QUnit.test("Properties are enumerable", function(assert) {
	assert.expect(1);

	function VM(foo) {
		this.foo = foo;
	}

	define(VM.prototype, {
		foo: "string"
	});

	var vm = new VM("bar");
	vm.baz = "qux";

	var copy = {};
	for(var key in vm) {
		copy[key] = vm[key];

	}
	assert.deepEqual(copy,{
		foo: "bar",
		baz: "qux"
	});

});

QUnit.test("Doesn't override canSymbol.iterator if already on the prototype", function(assert) {
	function MyMap() {}

	MyMap.prototype[canSymbol.iterator || canSymbol.for("iterator")] = function() {
		var i = 0;
		return {
			next: function() {
				if (i === 0) {
					i++;
					return {
						value: ["it", "worked"],
						done: false
					};
				}

				return {
					value: undefined,
					done: true
				};
			}
		};
	};

	define(MyMap.prototype, {
		foo: "string"
	});

	var map = new MyMap();
	map.foo = "bar";

	canReflect.eachIndex(map, function(value) {
		assert.deepEqual(value, ["it","worked"]);
	});
});

QUnit.test("nullish values are not converted for type or Type", function(assert) {

	var Foo = function() {};

	var MyMap = define.Constructor({
		map: {
			Type: Foo
		},
		notype: {}
	});

	var vm = new MyMap({
		map: {},
		notype: {}
	});

	// Sanity check
	assert.ok(vm.map instanceof Foo, "map is another type");
	assert.ok(vm.notype instanceof Object, "notype is an Object");

	vm.map = null;
	vm.notype = null;

	assert.equal(vm.map, null, "map is null");
	assert.equal(vm.map, null, "notype is null");
});


QUnit.test("shorthand getter (#56)", function(assert) {
	var Person = function(first, last) {
		this.first = first;
		this.last = last;
	};
	define(Person.prototype, {
		first: "*",
		last: "*",
		get fullName() {
			return this.first + " " + this.last;
		}
	});

	var p = new Person("Mohamed", "Cherif");

	p.on("fullName", function(ev, newVal, oldVal) {
		assert.equal(oldVal, "Mohamed Cherif");
		assert.equal(newVal, "Justin Meyer");
	});

	assert.equal(p.fullName, "Mohamed Cherif", "fullName initialized right");

	queues.batch.start();
	p.first = "Justin";
	p.last = "Meyer";
	queues.batch.stop();
});

QUnit.test("shorthand getter setter (#56)", function(assert) {
	var Person = function(first, last) {
		this.first = first;
		this.last = last;
	};
	define(Person.prototype, {
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

	var p = new Person("Mohamed", "Cherif");

	p.on("fullName", function(ev, newVal, oldVal) {
		assert.equal(oldVal, "Mohamed Cherif");
		assert.equal(newVal, "Justin Meyer");
	});

	assert.equal(p.fullName, "Mohamed Cherif", "fullName initialized right");

	p.fullName = "Justin Meyer";
});


QUnit.test("set and value work together (#87)", function(assert) {

	var Type = define.Constructor({
		prop: {
			default: 2,
			set: function(num){
				return num * num;
			}
		}
	});

	var instance = new Type();

	assert.equal(instance.prop, 4, "used setter");

});

QUnit.test("async setter is provided", function(assert) {
	assert.expect(5);
	var RESOLVE;

	var Type = define.Constructor({
		prop: {
			default: 2,
			set: function(num, resolve){
				resolve( num * num );
			}
		},
		prop2: {
			default: 3,
			set: function(num, resolve){
				RESOLVE = resolve;
			}
		}
	});

	var instance = new Type();

	assert.equal(instance.prop, 4, "used async setter");


	assert.equal(instance.prop2, undefined, "used async setter");

	instance.on("prop2", function(ev, newVal, oldVal){
		assert.equal(newVal, 9, "updated");
		assert.equal(oldVal, undefined, "updated");
	});
	RESOLVE(9);

	assert.equal(instance.prop2, 9, "used async setter updates after");

});

QUnit.test('setter with default value causes an infinite loop (#142)', function(assert) {
	var A = define.Constructor({
		val: {
			default: 'hello',
			set: function(val){
				if(this.val) {}
				return val;
			}
		}
	});

	var a = new A();
	assert.equal(a.val, 'hello', 'creating an instance should not cause an inifinte loop');
});

QUnit.test('defined properties are configurable', function(assert) {
	var A = define.Constructor({
		val: {
			get: function(){
				return "foo";
			}
		}
	});

	var dataInitializers = A.prototype._define.dataInitializers,
	computedInitializers = A.prototype._define.computedInitializers;

	var newDefinition = {
		get: function(){
			return "bar";
		}
	};

	define.property(A.prototype, "val", newDefinition, dataInitializers,
		computedInitializers);

	var a = new A();
	assert.equal(a.val, "bar", "It was redefined");
});

testHelpers.dev.devOnlyTest("warn on using a Constructor for small-t type definitions", function (assert) {
	assert.expect(1);

	var message = /can-define: the definition for [\w{}\.]+ uses a constructor for "type"\. Did you mean "Type"\?/;
	var finishErrorCheck = testHelpers.dev.willWarn(message);

	function Currency() {
		return this;
	}
	Currency.prototype = {
		symbol: "USD"
	};

	function VM() {}
	define(VM.prototype, {
		currency: {
			type: Currency, // should be `Type: Currency`
			default: function() {
				return new Currency({});
			}
		}
	});

	assert.equal(finishErrorCheck(), 1);

});

testHelpers.dev.devOnlyTest("warn with constructor for Value instead of Default (#340)", function (assert) {
	assert.expect(1);

	var message = /can-define: Change the 'Value' definition for [\w\.{}]+.currency to 'Default'./;
	var finishErrorCheck = testHelpers.dev.willWarn(message);

	function Currency() {
		return this;
	}
	Currency.prototype = {
		symbol: "USD"
	};

	function VM() {}
	define(VM.prototype, {
		currency: {
			Value: Currency
		}
	});
	assert.equal(finishErrorCheck(), 1);
});


QUnit.test("canReflect.onKeyValue (#363)", function(assert) {
	var Greeting = function( message ) {
		this.message = message;
	};

	define( Greeting.prototype, {
		message: { type: "string" }
	} );

	var greeting = new Greeting("Hello");

	canReflect.onKeyValue(greeting, "message", function(newVal, oldVal) {
		assert.equal(newVal, "bye");
		assert.equal(oldVal, "Hello");
	});

	greeting.message = "bye";
});

QUnit.test("value lastSet has default value (#397)", function(assert) {
	var Defaulted = function() {};

	define(Defaulted.prototype, {
		hasDefault: {
			default: 42,
			value: function hasDefaultValue(props) {
				assert.equal(props.lastSet.get(), 42, "props.lastSet works");
				props.resolve(props.lastSet.get());
			}
		}
	});
	var defaulted = new Defaulted();
	assert.equal(defaulted.hasDefault, 42,
		"hasDefault value.lastSet set default value");
});

QUnit.test("binding computed properties do not observation recordings (#406)", function(assert) {
	var Type = function() {};

	define(Type.prototype, {
		prop: {
			get: function(){
				return "foo";
			}
		}
	});

	var inst = new Type();

	ObservationRecorder.start();
	inst.on("prop", function(){});
	var records = ObservationRecorder.stop();
	assert.equal(records.valueDependencies.size, 0, "nothing recorded");
});

testHelpers.dev.devOnlyTest("warning when setting during a get", function(assert){
	var Type = function Type() {};

	var msg = /.* This can cause infinite loops and performance issues.*/;
	var teardownWarn = testHelpers.dev.willWarn(msg, function(text, match) {
		if(match) {
			assert.ok(true, "warning fired");
		}
	});

	define(Type.prototype, {
		prop: {
			get: function(){
				if(!this.prop2) {
					this.prop2 = "baz";
				}
				return "";
			}
		},
		prop2: "string"
	});

	var inst = new Type();

	inst.on("prop", function(){});
	inst.prop2 = "";
	assert.equal(teardownWarn(), 1, "warning correctly generated");
	teardownWarn = testHelpers.dev.willWarn(msg, function(text, match) {
		if(match) {
			assert.ok(false, "warning incorrectly fired");
		}
	});
	inst.prop2 = "quux";
	teardownWarn();
});

testHelpers.dev.devOnlyTest("warning when setting during a get (batched)", function(assert){
	var msg = /.* This can cause infinite loops and performance issues.*/;
	var Type = function Type() {};
	var teardownWarn = testHelpers.dev.willWarn(msg, function(text, match) {
		if(match) {
			assert.ok(true, "warning fired");
		}
	});

	define(Type.prototype, {
		prop: {
			get: function(){
				if(!this.prop2) {
					this.prop2 = "baz";
					return "";
				}
			}
		},
		prop2: "string"
	});

	var inst = new Type();

	queues.batch.start();
	inst.on("prop", function(){});
	inst.prop2 = "";
	queues.batch.stop();
	assert.equal(teardownWarn(), 1, "warning correctly generated");
	teardownWarn = testHelpers.dev.willWarn(msg, function(text, match) {
		if(match) {
			assert.ok(false, "warning incorrectly fired");
		}
	});
	queues.batch.start();
	inst.prop2 = "quux";
	queues.batch.stop();
	teardownWarn();
});

testHelpers.dev.devOnlyTest("warning when setting during a get (setter)", function(assert){
	var msg = /.* This can cause infinite loops and performance issues.*/;
	var Type = function Type() {};
	var teardownWarn = testHelpers.dev.willWarn(msg, function(text, match) {
		if(match) {
			assert.ok(true, "warning fired");
		}
	});

	var cell;
	define(Type.prototype, {
		prop: {
			get: function() {
				if(!this.prop2) {
					this.prop2 = "baz";
				}
				return cell;
			},
			set: function(val) {
				cell = val;
			}
		},
		prop2: "string"
	});

	var inst = new Type();

	inst.on("prop", function(){}); // generates a warning
	inst.prop2 = ""; // also generates a warning, as the bound getter will fire again
	assert.equal(teardownWarn(), 1, "warning correctly generated");
	teardownWarn = testHelpers.dev.willWarn(msg, function(text, match) {
		if(match) {
			assert.ok(false, "warning incorrectly fired");
		}
	});
	inst.prop2 = "quux";
	teardownWarn();
});

testHelpers.dev.devOnlyTest("warnings are given when type or default is ignored", function(assert) {
	var testCases = [
		{
			name: "zero-arg getter, no setter when property is set",
			definition: {
				get: function() { return "whatever"; }
			},
			warning: /Set value for property .* ignored/,
			setProp: true,
			expectedWarnings: 1
		},
		{
			name: "type with zero-arg getter, no setter",
			definition: {
				type: String,
				get: function() { return "whatever"; }
			},
			warning: /type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 1
		},
		{
			name: "Type with zero-arg getter, no setter",
			definition: {
				Type: {},
				get: function() { return "whatever"; }
			},
			warning: /Type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 1
		},
		{
			name: "only default type with zero-arg getter, no setter - should not warn",
			definition: {
				get: function() { return "whatever"; }
			},
			warning: /type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		},
		{
			name: "type with zero-arg getter, with setter - should not warn",
			definition: {
				type: String,
				get: function() { return "whatever"; },
				set: function (val) { return val; }
			},
			warning: /type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		},
		{
			name: "Type with zero-arg getter, with setter - should not warn",
			definition: {
				Type: {},
				get: function() { return "whatever"; },
				set: function (val) { return val; }
			},
			warning: /Type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		},
		{
			name: "default with zero-arg getter, no setter",
			definition: {
				default: "some thing",
				get: function() { return "whatever"; }
			},
			warning: /default value for property .* ignored/,
			setProp: false,
			expectedWarnings: 1
		},
		{
			name: "Default with zero-arg getter, no setter",
			definition: {
				Default: function () {},
				get: function() { return "whatever"; }
			},
			warning: /Default value for property .* ignored/,
			setProp: false,
			expectedWarnings: 1
		},
		{
			name: "default with zero-arg getter, with setter - should not warn",
			definition: {
				default: "some thing",
				get: function() { return "whatever"; },
				set: function (val) { return val; }
			},
			warning: /default value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		},
		{
			name: "Default with zero-arg getter, with setter - should not warn",
			definition: {
				Default: function () {},
				get: function() { return "whatever"; },
				set: function (val) { return val; }
			},
			warning: /Default value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		}
	];

	testCases.forEach(function(testCase) {
		var VM = function() {};
		var warnCount = testHelpers.dev.willWarn(testCase.warning);

		define(VM.prototype, {
			derivedProp: testCase.definition,
			"*": { // emulates can-define/map/map setting default type
				type: define.types.observable
			}
		});

		var vm = new VM();

		// read prop for 'lazy' setup
		canReflect.onKeyValue(vm, 'derivedProp', function() {});

		if (testCase.setProp) {
			vm.derivedProp = "smashed it!";
		}


		assert.equal(warnCount(), testCase.expectedWarnings, "got correct number of warnings for " + testCase.name);
	});
});
