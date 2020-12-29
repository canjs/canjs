"use strict";
var testType = typeof process !== 'undefined' && process.env.TEST;
var isMochaQUnitUI = testType === 'mocha';
var isQunit = testType === 'qunit';

if (isMochaQUnitUI) {
	// mocha-qunit-ui does not support async
	QUnit.assert.async = function () {
		var done = assert.async();
		return function done (error) {
			if (error) {
				return assert.ok(false, '' + error);
			}
			done();
		};
	};

	QUnit.test = test;
	module.exports =  QUnit;
} else if (isQunit) {
	module.exports = require('qunit');
} else {
	module.exports = require('steal-qunit');
}
