const QUnit = require("steal-qunit");
const { createConstructorFunction } = require("../src/mixins");

QUnit.module("can-observable-mixin - createConstructorFunction");

QUnit.test("basics", function(assert) {
	class Foo {
		static get bar() {
			return "bar";
		}
		static getIndex() {
			return 0;
		}
		static get [Symbol.species]() {
			return this;
		}
	}

	const FooConstructor = createConstructorFunction(Foo);

	assert.equal(FooConstructor.bar, "bar", "should keep static props");
	assert.ok(FooConstructor[Symbol.species], "should keep symbols");
	assert.equal(FooConstructor.getIndex(), 0, "should keep static methods");
});

QUnit.test("walks up the prototype chain", function(assert) {
	class Foo {
		static get bar() {
			return "bar";
		}
		static getIndex() {
			return 0;
		}
		static get [Symbol.species]() {
			return this;
		}
	}

	const Bar = Object.create(Foo);
	const BarConstructor = createConstructorFunction(Bar);

	assert.equal(BarConstructor.bar, "bar", "should keep static props");
	assert.ok(BarConstructor[Symbol.species], "should keep symbols");
	assert.equal(BarConstructor.getIndex(), 0, "should keep static methods");
});

QUnit.test("it should keep static getters", function(assert) {
	class Foo {
		static get foo() {
			return "foo";
		}
	}
	const Bar = Object.create(Foo);
	const BarConstructor = createConstructorFunction(Bar);
	assert.equal(
		BarConstructor.foo,
		"foo",
		"should keep the static foo getter"
	);
});

QUnit.test("it should keep property descriptors", function(assert) {
	class Foo {
		static get foo() {
			return "foo";
		}
	}
	const Bar = Object.create(Foo);
	const BarConstructor = createConstructorFunction(Bar);

	assert.deepEqual(
		Object.getOwnPropertyDescriptor(Foo, "foo"),
		Object.getOwnPropertyDescriptor(BarConstructor, "foo"),
		"should be the same descriptor"
	);
});

QUnit.test("can stop prototype chain walk at indicated object", function(
	assert
) {
	class Foo {
		static get foo() {
			return "bar";
		}
	}

	const Bar = Object.create(Foo);
	Bar.getIndex = () => 10;
	Bar[Symbol.for("can.new")] = () => true;

	const Baz = Object.create(Bar);
	const BazConstructor = createConstructorFunction(Baz, Foo);

	assert.equal(
		typeof BazConstructor.foo,
		"undefined",
		"should not walk up to Foo"
	);
	assert.ok(BazConstructor[Symbol.for("can.new")], "should keep symbols");
	assert.equal(BazConstructor.getIndex(), 10, "should keep static methods");
});

QUnit.test("Symbol.species should work on the constructor", function(assert) {
	class MyArray extends Array {
		static get [Symbol.species]() {
			return Array;
		}
	}

	const MyArrayConstructor = createConstructorFunction(MyArray);
	const array = new MyArrayConstructor();

	assert.ok(array instanceof Array);
});
