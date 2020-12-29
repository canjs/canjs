QUnit = require('steal-qunit');
var Construct = require('can-construct');
var dev = require("can-log/dev/dev");

QUnit.module('can-construct', {
	beforeEach: function(assert) {
		var Animal = this.Animal = Construct.extend({
			count: 0,
			test: function () {
				return this.match ? true : false;
			}
		}, {
			init: function () {
				this.constructor.count++;
				this.eyes = false;
			}
		});
		var Dog = this.Dog = this.Animal.extend({
			match: /abc/
		}, {
			init: function () {
				Animal.prototype.init.apply(this, arguments);
			},
			talk: function () {
				return 'Woof';
			}
		});
		this.Ajax = this.Dog.extend({
			count: 0
		}, {
			init: function (hairs) {
				Dog.prototype.init.apply(this, arguments);
				this.hairs = hairs;
				this.setEyes();
			},
			setEyes: function () {
				this.eyes = true;
			}
		});
	}
});
QUnit.test('inherit', function(assert) {
	var Base = Construct({});
	assert.ok(new Base() instanceof Construct);
	var Inherit = Base({});
	assert.ok(new Inherit() instanceof Base);
});
QUnit.test('Creating', function(assert) {
	new this.Dog();
	var a1 = new this.Animal();
	new this.Animal();
	var ajax = new this.Ajax(1000);
	assert.equal(2, this.Animal.count, 'right number of animals');
	assert.equal(1, this.Dog.count, 'right number of animals');
	assert.ok(this.Dog.match, 'right number of animals');
	assert.ok(!this.Animal.match, 'right number of animals');
	assert.ok(this.Dog.test(), 'right number of animals');
	assert.ok(!this.Animal.test(), 'right number of animals');
	assert.equal(1, this.Ajax.count, 'right number of animals');
	assert.equal(2, this.Animal.count, 'right number of animals');
	assert.equal(true, ajax.eyes, 'right number of animals');
	assert.equal(1000, ajax.hairs, 'right number of animals');
	assert.ok(a1 instanceof this.Animal);
	assert.ok(a1 instanceof Construct);
});
QUnit.test('new instance', function(assert) {
	var d = this.Ajax.newInstance(6);
	assert.equal(6, d.hairs);
});
QUnit.test('namespaces', function(assert) {
	var fb = Construct.extend('Bar');

	assert.ok(!window.Bar, "not added to global namespace");

	if (Object.getOwnPropertyDescriptor) {
		assert.equal(fb.name, 'Bar', 'name is right');
	}
	assert.equal(fb.shortName, 'Bar', 'short name is right');
});
QUnit.test('setups', function(assert) {
	var order = 0,
		staticSetup, staticSetupArgs, staticInit, staticInitArgs, protoSetup, protoInitArgs, protoInit, staticProps = {
			setup: function () {
				staticSetup = ++order;
				staticSetupArgs = arguments;
				return ['something'];
			},
			init: function () {
				staticInit = ++order;
				staticInitArgs = arguments;
			}
		}, protoProps = {
			setup: function (name) {
				protoSetup = ++order;
				return ['Ford: ' + name];
			},
			init: function () {
				protoInit = ++order;
				protoInitArgs = arguments;
			}
		};
	var Car = Construct.extend('Car', staticProps, protoProps);
	new Car('geo');
	assert.equal(staticSetup, 1);
	assert.equal(staticInit, 2);
	assert.equal(protoSetup, 3);
	assert.equal(protoInit, 4);
	assert.deepEqual(Array.prototype.slice.call(staticInitArgs), ['something']);
	assert.deepEqual(Array.prototype.slice.call(protoInitArgs), ['Ford: geo']);
	assert.deepEqual(Array.prototype.slice.call(staticSetupArgs), [
		Construct,
		'Car',
		staticProps,
		protoProps
	], 'static construct');
	//now see if staticSetup gets called again ...
	Car.extend('Truck');
	assert.equal(staticSetup, 5, 'Static setup is called if overwriting');
});
QUnit.test('Creating without extend', function(assert) {
	var Bar = Construct('Bar', {
		ok: function () {
			assert.ok(true, 'ok called');
		}
	});
	new Bar()
		.ok();
	var Foo = Bar('Foo', {
		dude: function () {
			assert.ok(true, 'dude called');
		}
	});
	new Foo()
		.dude(true);
});

//!steal-remove-start
if (dev) {
	QUnit.test('console warning if extend is not used without new (#932)', function(assert) {

		var oldlog = dev.warn;
		dev.warn = function (text) {
			assert.ok(text, "got a message");
			dev.warn = oldlog;
		};
		var K1 = Construct({});
		K1({});
	});
}
//!steal-remove-end

QUnit.test("setup called with original arguments", function(assert) {
	var o2 = {};
	var o1 = {
		setup: function(base, arg1, arg2){
			assert.equal(o1, arg1, "first argument is correct");
			assert.equal(o2, arg2, "second argument is correct");
		}
	};

	Construct.extend(o1, o2);
});

QUnit.test("legacy namespace strings (A.B.C) accepted", function(assert) {

	var Type = Construct.extend("Foo.Bar.Baz");
	var expectedValue = ~steal.config("env").indexOf("production") ? "" : "Foo_Bar_Baz";

	assert.ok(new Type() instanceof Construct, "No unexpected behavior in the prototype chain");
	if (Function.prototype.name) {
		assert.equal(Type.name, expectedValue, "Name becomes underscored");
	}
});

QUnit.test("reserved words accepted", function(assert) {

	var Type = Construct.extend("const");
	var expectedValue = ~steal.config("env").indexOf("production") ? "" : "Const";

	assert.ok(new Type() instanceof Construct, "No unexpected behavior in the prototype chain");
	if (Function.prototype.name) {
		assert.equal(Type.name, expectedValue, "Name becomes capitalized");
	}
});


QUnit.test("basic injection attacks thwarted", function(assert) {

	var rootToken = typeof window === "undefined" ? "global" : "window";
	var rootObject = typeof window === "undefined" ? global : window;

	// check for injection
	var expando = "foo" + Math.random().toString(10).slice(2);
	var MalignantType;
	try {
		MalignantType = Construct.extend("(){};" + rootToken + "." + expando + "='bar';var f=function");
	} catch(e) { // ok if it fails
	} finally {
		assert.equal(rootObject[expando], undefined, "Injected code doesn't run");
	}
	delete rootObject[expando];
	try {
		MalignantType = Construct.extend("(){}," + rootToken + "." + expando + "='baz',function");
	} catch(e) {
	} finally {
		assert.equal(rootObject[expando], undefined, "Injected code doesn't run");
	}

});

QUnit.test("setters not invoked on extension (#28)", function(assert) {

	var extending = true;
	var Base = Construct.extend("Base",{
		set something(value){
			assert.ok(!extending, "called when not extending");
		},
		get something(){

		}
	});

	Base.extend("Extended",{
		something: "value"
	});
	extending = false;
	new Base().something = "foo";
});

QUnit.test("return alternative value simple", function(assert) {
	var Alternative = function(){};
	var Base = Construct.extend({
		setup: function(){
			return new Construct.ReturnValue( new Alternative() );
		}
	});
	assert.ok(new Base() instanceof Alternative, "Should create an instance of Alternative");
});

QUnit.test("return alternative value on setup (full case)", function(assert) {
	var Student = function(name, school){
		this.name = name;
		this.school = school;
		this.isStudent = true;
	};
	var Person = Construct.extend({
		setup: function(opts){
			if (opts.age >= 16){
				return new Construct.ReturnValue( new Student(opts.name, opts.school) );
			}
			opts.isStudent = false;
			return [opts];
		},
		init: function(params){
			this.age = params.age;
			this.name = params.name;
			this.isStudent = params.isStudent;
		}
	});
	assert.equal(new Person({age: 12}).isStudent, false, "Age 12 cannot be a student");
	assert.equal(new Person({age: 30}).isStudent, true, "Age 20 can be a student");
	assert.ok(new Person({age: 30}) instanceof Student, "Should return an instance of Student");
});

QUnit.test("extends defaults right", function(assert) {
	var BASE = Construct.extend({
		defaults: {
			foo: 'bar'
		}
	}, {});
	var INHERIT = BASE.extend({
		defaults: {
			newProp: 'newVal'
		}
	}, {});
	assert.ok(INHERIT.defaults.foo === 'bar', 'Class must inherit defaults from the parent class');
	assert.ok(INHERIT.defaults.newProp === 'newVal', 'Class must have own defaults');
});

QUnit.test("enumerability", function(assert) {
	var Parent = Construct.extend("Parent", {});

	var child = new Parent();
	child.foo = "bar";

	var props = {};
	for(var prop in child) {
		props[prop] = true;
	}

	assert.deepEqual(props, {
		foo: true
	}, "only has ownProps");
});

QUnit.test("Has default init, setup functions", function(assert) {
	var instance = new Construct();
	assert.equal(typeof instance.init, "function", "has init");
	assert.equal(typeof instance.setup, "function", "has setup");
});

QUnit.test("Extending should not update defaults nested objects", function(assert) {
	var Parent = Construct.extend({
		defaults: {
			obj: {
				foo: "Bar"
			}
		}
	},{});

	var Child = Parent.extend({
		defaults: {
			obj: {
				foo: "Baz"
			}
		}
	}, {});

	assert.equal(Parent.defaults.obj.foo, "Bar", "Base defaults are not changed");
	assert.equal(Child.defaults.obj.foo, "Baz", "Child defaults get defaults right");
});
