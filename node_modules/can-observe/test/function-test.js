var QUnit = require("steal-qunit");
var observe = require("can-observe");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var Observation = require("can-observation");
var makeFunction = require("../src/-make-function");
var makeObject = require("../src/-make-object");

var observableSymbol = canSymbol.for("can.meta");
var computedPropertyDefinitionSymbol = canSymbol.for("can.computedPropertyDefinitions");
var observableStore = require("../src/-observable-store");
var helpers = require("../src/-helpers");


QUnit.module("can-observe with Functions");


QUnit.test("isBuiltInButNotArrayOrPlainObject", function(assert) {
	// Testing type constructors
	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject(Function), true, "Function");
	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject(Object), true, "Object");
	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject(Date), true, "Date");

	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject(function() {}), false, "function instance");

	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject({}), false, "new Object");
	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject([]), false, "new Array");
	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject(new Date()), true, "new Date");
	assert.equal(helpers.isBuiltInButNotArrayOrPlainObject(new RegExp()), true, "new RegExp");
});

QUnit.test("makeFunction basics", function(assert) {
	assert.expect(3);
	var OriginalPerson = function(first, last) {
		this.first = first;
		this.last = last;
		this.constructor.count++;
	};
	OriginalPerson.prototype.sayHi = function() {
		return this.first + this.last;
	};
	var observe = function(obj) {
		if (canReflect.isPrimitive(obj)) {
			return obj;
		}
		if (observableStore.proxies.has(obj)) {
			return obj;
		}
		if (helpers.isBuiltInButNotArrayOrPlainObject(obj)) {
			return obj;
		}
		var observable;
		if (obj && typeof obj === "object") {
			observable = makeObject.observable(obj, {
				observe: observe
			});
		} else if (typeof obj === "function") {
			observable = makeFunction.observable(obj, {
				observe: observe
			});
		} else {
			return obj;
		}
		observableStore.proxies.add(observable);
		observableStore.proxiedObjects.set(obj, observable);
		return observable;
	};
	var Person = observe(OriginalPerson);
	assert.equal(Person.prototype.constructor, Person, "Person is its own constructor");
	Person.count = 0;



	canReflect.onKeyValue(Person, "count", function(newVal) {
		assert.equal(newVal, 1, "static count");
	});

	var person = new Person("Justin", "Meyer");


	canReflect.onKeyValue(person, "first", function(newVal) {
		assert.equal(newVal, "Vyacheslav", "first changed");
	});

	person.first = "Vyacheslav";
});

QUnit.test("makeFunction basics, with property definitions", function(assert) {
	var observe = function(obj) {
		if (canReflect.isPrimitive(obj)) {
			return obj;
		}
		if (observableStore.proxies.has(obj)) {
			return obj;
		}
		if (helpers.isBuiltInButNotArrayOrPlainObject(obj)) {
			return obj;
		}
		var observable;
		if (obj && typeof obj === "object") {
			observable = makeObject.observable(obj, {
				observe: observe
			});
		} else if (typeof obj === "function") {
			observable = makeFunction.observable(obj, {
				observe: observe
			});
		} else {
			return obj;
		}
		observableStore.proxies.add(observable);
		observableStore.proxiedObjects.set(obj, observable);
		return observable;
	};

	var OriginalPerson = function(first, last) {
		this.first = first;
		this.last = last;
		this.constructor.count++;
	};

	OriginalPerson.prototype.sayHi = function() {
		return this.first + " " + this.last;
	};

	OriginalPerson[computedPropertyDefinitionSymbol] = Object.create(null);
	OriginalPerson[computedPropertyDefinitionSymbol].countText = function(instance) {
		return new Observation(function() {
			return this.count === 1 ? "1 person" : (this.count + " people");
		}, instance);
	};

	var Person = observe(OriginalPerson);
	assert.equal(Person.prototype.constructor, Person, "Person is its own constructor");
	Person.count = 0;

	assert.equal(Person.countText, "0 people", "count is 0");

	canReflect.onKeyValue(Person, "countText", function(newVal) {
		assert.equal(newVal, "1 person", "static count");
	});

	var person = new Person("Christopher", "Baker");
	assert.equal(Person.countText, "1 person", "count is 1");

	canReflect.onKeyValue(person, "first", function(newVal) {
		assert.equal(newVal, "Yetti", "first changed");
	});

	person.first = "Yetti";
});


QUnit.test("custom, non-array functions return proxied objects as well", function(assert) {
	var p = observe({
		foo: function() {
			return {};
		}
	});

	assert.ok(p.foo()[observableSymbol], "Proxied function returns proxy");
});


QUnit.test("basics with constructor functions", function(assert) {
	assert.expect(3);
	var OriginalPerson = function(first, last) {
		this.first = first;
		this.last = last;
		this.constructor.count++;
	};
	OriginalPerson.prototype.sayHi = function() {
		return this.first + this.last;
	};
	var Person = observe(OriginalPerson);
	assert.equal(Person.prototype.constructor, Person, "Person is its own constructor");
	Person.count = 0;



	canReflect.onKeyValue(Person, "count", function(newVal) {
		assert.equal(newVal, 1, "static count");
	});

	var person = new Person("Justin", "Meyer");


	canReflect.onKeyValue(person, "first", function(newVal) {
		assert.equal(newVal, "Vyacheslav", "first changed");
	});

	person.first = "Vyacheslav";
});

QUnit.test("Constructor functions that use instanceof", function(assert) {
	var Child;
	var Parent = function(){
		var isParent = (this instanceof Parent);
		assert.ok(isParent, "this is a Parent");

		var isChild = (this instanceof Child);
		assert.ok(isChild, "this is a Child");
	};

	Parent.prototype.fn = function() { return "works"; };

	Child = observe(Parent);
	var child = new Child();

	assert.equal(child.fn(), "works", "Able to walk up the prototype");
});

require("can-reflect-tests/observables/map-like/type/type")("simple map-like constructor", function() {
	return observe(function(props) {
		canReflect.assign(this, props || {});
	});
});



QUnit.test(".constructor of array subclass is itself", function(assert) {
	var MyArray = function(values) {
		this.push.apply(this, arguments);
	};
	MyArray.prototype = Object.create(Array.prototype);
	MyArray.prototype.constructor = MyArray;
	var ArrayType = observe(MyArray);

	assert.equal(ArrayType.prototype.constructor, ArrayType, "type");

	var arr = new MyArray();
	assert.equal(arr.constructor, ArrayType, "instance");
});


var classSupport = (function() {
	try {
		eval('"use strict"; class A{};');
		return true;
	} catch (e) {
		return false;
	}

})();

if (classSupport) {
	require("can-reflect-tests/observables/list-like/type/on-instance-patches")("class extends Array",
		function() {
			class MyArray extends Array {

			}
			return observe(MyArray);
		});

	QUnit.test("calling methods (that have no prototypes)", function(assert) {
		class AddBase {
			constructor() {
				this.count = 0;
			}
			add(){
				this.count++;
			}
		}
		var Add = observe(AddBase);
		var add = new Add();
		add.add();
		assert.equal(add.count,1, "count set");
	});
}


require("can-reflect-tests/observables/list-like/type/on-instance-patches")("Object.create(Array)", function() {

	var MyArray = function(values) {
		this.push.apply(this, arguments);
	};
	MyArray.prototype = Object.create(Array.prototype);
	MyArray.prototype.constructor = MyArray;

	return observe(MyArray);
});
