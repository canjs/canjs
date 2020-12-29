"use strict";
var canLog = require('can-log');
function noop () {}
var resolveValue = noop;
var evaluateArgs = noop;
var __testing = {};

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	var canReflect = require('can-reflect');

	var canSymbol = require('can-symbol');

	__testing = {
		allowDebugger: true
	};

	resolveValue = function (value) {
		if (value && value[canSymbol.for("can.getValue")]) {
			return canReflect.getValue(value);
		}
		return value;
	};

	evaluateArgs = function (left, right) {
		switch (arguments.length) {
			case 0: return true;
			case 1: return !!resolveValue(left);
			case 2: return resolveValue(left) === resolveValue(right);
			default:
				canLog.log([
					'Usage:',
					'  {{debugger}}: break any time this helper is evaluated',
					'  {{debugger condition}}: break when `condition` is truthy',
					'  {{debugger left right}}: break when `left` === `right`'
				].join('\n'));
				throw new Error('{{debugger}} must have less than three arguments');
		}
	};
}
//!steal-remove-end

function debuggerHelper (left, right) {
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		var shouldBreak = evaluateArgs.apply(null, Array.prototype.slice.call(arguments, 0, -1));
		if (!shouldBreak) {
			return;
		}

		var options = arguments[arguments.length - 1],
			scope = options && options.scope;
		var get = function (path) {
			return scope.get(path);
		};
		// This makes sure `get`, `options` and `scope` are available
		debuggerHelper._lastGet = get;

		canLog.log('Use `get(<path>)` to debug this template');

		var allowDebugger = __testing.allowDebugger;
		// forgotten debugger
		// jshint -W087
		if (allowDebugger) {
			debugger;
			return;
		}
		// jshint +W087
	}
	//!steal-remove-end

	canLog.warn('Forgotten {{debugger}} helper');
}
debuggerHelper.requiresOptionsArgument = true;

module.exports = {
	helper: debuggerHelper,
	evaluateArgs: evaluateArgs,
	resolveValue: resolveValue,

	// used only for testing purposes
	__testing: __testing
};
