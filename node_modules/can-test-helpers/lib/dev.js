/**
 * @module {Object} can-test-helpers/dev dev
 * @parent can-test-helpers
 *
 * The `dev` utilities group contains functions to assist with testing with the [can-log/dev/dev can-log dev] module.
 * can-log's dev provides facilities for development that are switched off in production builds.
 */

var dev = require("can-log/dev/dev");
var canReflect = require("can-reflect");
var GLOBAL = require("can-global");

function makeExpectation(type) {
	var original;
	var expectedResults = [];

	function stubbed() {
		var message = canReflect.toArray(arguments).map(function(token) {
			// Case for error objects. If you send an error to the console,
			//  its "toString" gives you "Error: " plus the message, which
			//  is undesirable for trying to check its content against a known
			//  string
			if(typeof(token) !== "string" && token.message) {
				return token.message;
			} else {
				return token;
			}
		}).join(" ");

		expectedResults.forEach(function(expected) {
			var matched = typeof expected.source === "string" ? 
				message === expected.source :
				expected.source.test(message);

			if(matched) {
				expected.count++;
			}
			if(typeof expected.fn === "function") {
				expected.fn.call(null, message, matched);
			}
		});
	}

	return function(expected, fn) {
		var matchData = {
			source: expected,
			fn: fn,
			count: 0
		};
		expectedResults.push(matchData);

		if(!original) {
			original = dev[type];
			dev[type] = stubbed;
		}

		// Simple teardown
		return function() {
			expectedResults.splice(expectedResults.indexOf(matchData), 1);
			if(original && expectedResults.length < 1) {
				// restore when all teardown functions have been called.
				dev[type] = original;
				original = null;
			}
			return matchData.count;
		};
	};
}

module.exports = {
	/**
	 * @function can-test-helpers/lib/dev.willWarn willWarn
	 * @parent can-test-helpers/dev
	 * @description Requests that [can-log/dev/dev.warn canDev.warn] track and notify about matching warnings.
	 *
	 * @signature `dev.willWarn(expected, [fn])`
	 * @param {String|Regexp} expected The warning message to check for
	 * @param {Function(String, Boolean)} [fn] an optional callback to fire on every warning; each call has the actual warning
	 *  message and a Boolean indicating whether it was matched
	 * @return {Function} A function that tears down the warning check and returns the number of matched warnings when called.
	 *
	 * @body
	 *
	 * `willWarn()` takes either a String or a RegExp as its `expected` warning, and does a full, case-sensitive String 
	 * match in the case of a String, or a regex test in the case of a RegExp, for every warning logged through
	 * [can-log/dev/dev.warn].  In addition, if `fn` is provided, it is fired on _every_ warning with the content
	 * of the warning message and whether it matched `expected`.
	 *
	 * `willWarn()` returns a teardown function, which must be called at least once to disable the tracking of the matched
	 * warning.  when called, the teardown function returns the number of times `expected` was matched by a dev warning.
	 *
	 * ```
	 * var dev = require('can-log/dev/dev');
	 * var devHelpers = require('can-test-helpers/lib/dev');
	 * 
	 * var finishWarningCheck = devHelpers.willWarn("something evil", function(message, match) {
	 * 	 message; // -> "something evil"
	 * 	 match; // true
	 * });
	 *
	 * canDev.warn("something evil");
	 * 
	 * finishWarningCheck(); // -> 1
	 * 
	 * ```
	 */
	willWarn: makeExpectation("warn"),

	/**
	 * @function can-test-helpers/lib/dev.willError willError
	 * @parent can-test-helpers/dev
	 * @description Requests that [can-log/dev/dev.error canDev.error] track and notify about matching errors.
	 *
	 * @signature `dev.willError(expected, [fn])`
	 * @param {String|Regexp} expected The error message to check for
	 * @param {Function(String, Boolean)} [fn] an optional callback to fire on every error; each call has the actual error
	 *  message and a Boolean indicating whether it was matched
	 * @return {Function} A function that tears down the error check and returns the number of matched errors when called.
	 *
	 * @body
	 *
	 * `willError()` takes either a String or a RegExp as its `expected` error, and does a full, case-sensitive String 
	 * match in the case of a String, or a regex test in the case of a RegExp, for every error logged through
	 * [can-log/dev/dev.error].  In addition, if `fn` is provided, it is fired on _every_ error logged by dev.error
	 * with the content of the error message and whether it matched `expected`.
	 *
	 * `willError()` returns a teardown function, which must be called at least once to disable the tracking of the matched
	 * error.  when called, the teardown function returns the number of times `expected` was matched by a dev error.
	 *
	 * ```
	 * var dev = require('can-log/dev/dev');
	 * var devHelpers = require('can-test-helpers/lib/dev');
	 * 
	 * var finishErrorCheck = devHelpers.willError("something evil", function(message, match) {
	 * 	 message; // -> "something evil"
	 * 	 match; // true
	 * });
	 *
	 * canDev.error("something evil");
	 * 
	 * finishErrorCheck(); // -> 1
	 * 
	 * ```
	 */
	willError: makeExpectation("error"),

	/**
	 * @function can-test-helpers/lib/dev.devOnlyTest devOnlyTest
	 * @parent can-test-helpers/dev
	 * @description Defines a test that runs only in development mode.
	 *
	 * @signature `dev.devOnlyTest(...)`
	 *
	 * @param {Number} [waits] an optional number of async waits
	 * @param {String} name  the String identifier for the test in the test module
	 * @param {Function} fn  the function body of the test.
	 *
	 * 
	 * The parameter list above assumes that `test` on the global object is a QUnit test function. With `devOnlyTest`,
	 * the global test function will be run with the supplied parameters when the system environment is either
	 * unknown or not one of the production tests.  This is to help facilitate tests that rely on, e.g., canDev
	 * behavior that only exists in development builds.
	 *
	 * @body
	 * 
	 * ```
	 * dev.devOnlyTest("it works", function() {
	 *    QUnit.ok(true, "it works!");
	 * });
	 * ```
	 */
	devOnlyTest: function() {
		var global = GLOBAL();
		if(!global.System || !global.System.env || global.System.env.indexOf("production") < 0) {
			if (!global.test && global.QUnit) {
				global.test = global.QUnit.test;
			}
			global.test.apply(null, arguments);
		}
	}
};