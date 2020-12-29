const ObservableArray = require("../src/can-observable-array");
const type = require('can-type');
const QUnit = require("steal-qunit");

QUnit.module('can-observable-array-class-fields');

QUnit.test("Class properties default value", function(assert) {
	const done = assert.async();

	class MyList extends ObservableArray {
		/* jshint ignore:start */
		prop = ['foo', 'bar'];
		/* jshint ignore:end */
	}

	const aList = new MyList();
	assert.deepEqual(aList.prop,  ['foo', 'bar'], 'Default value works');
	
	aList.on('prop', function(ev, newVal, oldVal) {
		assert.deepEqual(oldVal, ['foo', 'bar'], 'Old value is correct');
		assert.deepEqual(newVal, ['baz'], 'Value is updated');
		assert.ok(ev, 'Age is observable');
		done();
	});

 	aList.prop =  ['baz'];
});


QUnit.test('Throws on class field property named items', function (assert) {
	class MyList extends ObservableArray {
		/* jshint ignore:start */
		items = ['foo', 'bar'];
		/* jshint ignore:end */

		static get items() {
			return String;
		}
	}

	try {
		new MyList();
	} catch (error) {
		assert.ok(error, 'it throws');
		assert.equal(
			error.message, 
			'ObservableArray does not support a class field named items. Try using a different name or using static items',
			'Message is correct'
		);
	}

});

QUnit.test('set should work', function(assert) {
	class Foo extends ObservableArray{}
	const foo = new Foo();
	foo.set("count", 3);
	assert.equal(foo.count, 3);
});

QUnit.test('Class fields should not overwrite static props', function (assert) {
	const done = assert.async();
	assert.expect(5);

	class MyList extends ObservableArray{
		/* jshint ignore:start */
		greetings = 'Hello';
		/* jshint ignore:end */
		static get props() {
			return {
				greetings: 'Bonjour'
			};
		}
	}

	const aList = new MyList();

	assert.equal(aList.greetings, 'Hello', 'Default valus is correct');
	aList.on('greetings', function (ev, newVal, oldVal) {
		assert.equal(oldVal, 'Hello', 'Old value is correct');
		assert.equal(newVal, 'Hola', 'Value is updated');
		assert.ok(ev, 'The class field is observable');
		done();
	});

	aList.greetings = 'Hola';

	try {
		aList.greetings = {foo: 'bar'};
	} catch (error) {
		assert.ok(error, 'Error thrown on the wrong type');
	}
});

QUnit.test('propertyDefaults for class fields', function(assert) {
	class MyArray extends ObservableArray {
		/* jshint ignore:start */
		foo = 4;
		/* jshint ignore:end */

		static get propertyDefaults() {
			return type.maybeConvert(String);
		}

		static get props() {
			return {
				bar: 100
			};
		}
	}

	const anArray = new MyArray();
	assert.strictEqual(anArray.foo, '4');
	assert.strictEqual(anArray.bar, '100');

	anArray.on('foo', (ev, newVal, oldVal) => {
		assert.ok(ev, 'is obervable');
		assert.strictEqual(newVal, '90');
		assert.strictEqual(oldVal, '4');
	});

	anArray.on('bar', (ev, newVal, oldVal) => {
		assert.ok(ev, 'static props are still obervable');
		assert.strictEqual(newVal, '190');
		assert.strictEqual(oldVal, '100');
	});

	anArray.set('foo', 90);
	anArray.set('bar', 190);
});

QUnit.test('setting property on propertyDefaults', function(assert) {
	class MyArray extends ObservableArray {
		static get propertyDefaults () {
			return type.maybeConvert(String);
		}
	}

	const anArray = new MyArray();

	anArray.on('bar', (ev, newVal) => {
		assert.ok(ev, 'static props are still obervable');
		assert.strictEqual(newVal, '190');
	});

	anArray.set('bar', 190);
});