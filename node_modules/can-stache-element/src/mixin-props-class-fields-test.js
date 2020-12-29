const QUnit = require("steal-qunit");
const mixinDefine = require("./mixin-props");

QUnit.module("can-stache-element - class fields");

QUnit.test('Class fields should be observable', function (assert) {
	const done = assert.async();
	assert.expect(4);

	class DefineElement extends mixinDefine(Object) {
		/* jshint ignore:start */
		greetings = 'Hello';
		/* jshint ignore:end */
	}
	
	const el = new DefineElement();

	el.initialize();
	
	assert.equal(el.greetings, 'Hello', 'Default value works');

	el.on('greetings', function(ev, newVal, oldVal) {
		assert.equal(oldVal, 'Hello', 'Old value is correct');
		assert.equal(newVal, 'Hola', 'Value is updated');
		assert.ok(ev, 'The class field is observable');
		done();
	});
			
	el.greetings = 'Hola';
});

QUnit.test('Class fields should not overwrite static props', function (assert) {
	const done = assert.async();
	assert.expect(5);

	class DefineElement extends mixinDefine(Object) {
		/* jshint ignore:start */
		greetings = 'Hello'; // jshint ignore:line
		/* jshint ignore:end */
		static get props() {
			return {
				greetings: 'Bonjour'
			};
		}
	}

	const el = new DefineElement();
	el.initialize();
	assert.equal(el.greetings, 'Hello');
	el.on('greetings', function (ev, newVal, oldVal) {
		assert.equal(oldVal, 'Hello', 'Old value is correct');
		assert.equal(newVal, 'Hola', 'Value is updated');
		assert.ok(ev, 'The class field is observable');
		done();
	});

	el.greetings = 'Hola';

	try {
		el.greetings = {foo: 'bar'};
	} catch (error) {
		assert.ok(error, 'Error thrown on the wrong type');
	}
});
