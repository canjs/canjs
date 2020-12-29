/*funcunit@3.6.3#browser/adapters/mocha*/
define('funcunit/browser/adapters/mocha', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core'
], function (require, exports, module) {
    var FuncUnit = require('funcunit/browser/core');
    var ok = function (expr, msg) {
        if (!expr)
            throw new Error(msg);
    };
    module.exports = function () {
        FuncUnit.timeout = 1900;
        return {
            pauseTest: function () {
            },
            resumeTest: function () {
            },
            assertOK: function (assertion, message) {
                ok(assertion, message);
            },
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
    };
});