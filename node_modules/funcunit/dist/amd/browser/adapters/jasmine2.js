/*funcunit@3.6.3#browser/adapters/jasmine2*/
define('funcunit/browser/adapters/jasmine2', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core'
], function (require, exports, module) {
    var FuncUnit = require('funcunit/browser/core');
    module.exports = function () {
        FuncUnit.timeout = 4900;
        return {
            pauseTest: function () {
            },
            resumeTest: function () {
            },
            assertOK: function (assertion) {
                expect(assertion).toBeTruthy();
            },
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
    };
});