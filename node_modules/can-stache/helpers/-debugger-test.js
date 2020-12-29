var unit = require('steal-qunit');
var canLog = require('can-log');
var debug = require('./-debugger');
var SimpleObservable = require("can-simple-observable");

var helper = debug.helper;
var resolveValue = debug.resolveValue;
var evaluateArgs = debug.evaluateArgs;

function mock (obj, methodName, newMethod) {
	var oldMethod = obj[methodName];
	obj[methodName] = newMethod;
	return function unmock () {
		obj[methodName] = oldMethod;
	};
}

var isDevelopment = false;
//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	isDevelopment = true;
}
//!steal-remove-end

unit.module('can-stache/helpers/-debugger');

if (isDevelopment) {
	unit.test('resolveValue should get compute values', function (assert) {
		var value = 'cake';
		var compute = new SimpleObservable(value);
		assert.equal(resolveValue(compute), value, 'computed value resolved');
	});

	unit.test('resolveValue should return a plain value', function (assert) {
		var value = 'cake';
		assert.equal(resolveValue(value), value, 'plain value resolved');
	});

	unit.test('evaluateArgs should throw on >2 arguments', function (assert) {
		assert.throws(function () {
			evaluateArgs(1,2,3);
		});
	});

	unit.test('evaluateArgs should compare two args', function (assert) {
		assert.equal(evaluateArgs(1, 1), true, 'true case');
		assert.equal(evaluateArgs(1, 2), false, 'false case');
		assert.equal(evaluateArgs(1, '1'), false, 'strict');
	});

	unit.test('evaluateArgs should cast one arg to a boolean', function (assert) {
		assert.equal(evaluateArgs(1), true, 'true case');
		assert.equal(evaluateArgs(0), false, 'false case');
		assert.equal(evaluateArgs('cake'), true, 'extra true case');
	});

	unit.test('evaluateArgs should always be true for no args', function (assert) {
		assert.equal(evaluateArgs(), true, 'should be true');
	});

	debug.__testing.allowDebugger = false;

	unit.test('helper logs help message', function (assert) {
		assert.expect(1);
		var unmock = mock(canLog, 'log', function (msg) {
			assert.equal(typeof msg, 'string', 'should log message');
		});

		helper();
		unmock();
	});

	unit.test('helper should not break if evaluate args mean false', function (assert) {
		assert.expect(0);
		var unmock = mock(canLog, 'log', function (msg) {
			assert.ok(false);
		});

		var options = {}; // helper options stache will provide

		helper(false, options);
		helper(false, true, options);
		helper(true, false, options);
		helper(true, 'true', options);
		unmock();
	});
} else {
	unit.test('helper warns when used in production', function (assert) {
		assert.expect(1);
		var unmock = mock(canLog, 'warn', function (msg) {
			assert.equal(typeof message, 'string', 'should log message');
		});

		helper();
		unmock();
	});
}
