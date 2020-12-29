var QUnit = require('steal-qunit');
var makeValidator = require('can-validate-validatejs');

var constraints = {
	age: {
		numericality: {
			message: 'should be a number'
		}
	},
	name: {
		presence: {
			message: 'cannot be blank'
		}
	}
};

var invalidPerson = {
	name: '',
	age: 'hello'
};

var validPerson = {
	name: 'Juan',
	age: 35
};

QUnit.module('can-validate-validatejs');

QUnit.test('makeValidator sets errors',function(assert){
	var validateAge = makeValidator(constraints.age);
	var errors = validateAge(invalidPerson.age);
	var expectedErrors = [constraints.age.numericality.message];
	assert.deepEqual(errors, expectedErrors, 'returns expected errors object');
});

QUnit.test('makeValidator validates',function(assert){
	var validateAge = makeValidator(constraints.age);
	var errors = validateAge(validPerson.age);
	assert.notOk(errors, 'value is valid, so no errors return');
});

QUnit.test('makeValidator.many sets errors',function(assert){
	var validatePerson = makeValidator.many(constraints);
	var errors = validatePerson(invalidPerson);
	var expectedErrors = [
		{
			message: constraints.age.numericality.message,
			related: ['age']
		}, {
			message: constraints.name.presence.message,
			related: ['name']
		}
	];
	assert.deepEqual(errors, expectedErrors, 'Many errors are set');
});

QUnit.test('makeValidator.many validates',function(assert){
	var validatePerson = makeValidator.many(constraints);
	var errors = validatePerson(validPerson);
	assert.notOk(errors, 'values are valid, so no errors return');
});
