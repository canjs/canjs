/*funcunit@3.6.3#browser/adapters/adapters*/
define('funcunit/browser/adapters/adapters', [
    'require',
    'exports',
    'module',
    'funcunit/browser/adapters/jasmine',
    'funcunit/browser/adapters/jasmine2',
    'funcunit/browser/adapters/qunit',
    'funcunit/browser/adapters/qunit2',
    'funcunit/browser/adapters/mocha',
    'funcunit/browser/core'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var jasmineAdapter = require('funcunit/browser/adapters/jasmine');
        var jasmine2Adapter = require('funcunit/browser/adapters/jasmine2');
        var qunitAdapter = require('funcunit/browser/adapters/qunit');
        var qunit2Adapter = require('funcunit/browser/adapters/qunit2');
        var mochaAdapter = require('funcunit/browser/adapters/mocha');
        var FuncUnit = require('funcunit/browser/core');
        var noop = function () {
        };
        var defaultAdapter = {
            pauseTest: noop,
            resumeTest: noop,
            assertOK: noop,
            equiv: function (expected, actual) {
                return expected == actual;
            }
        };
        FuncUnit.unit = defaultAdapter;
        FuncUnit.attach = function (runner) {
            var unit;
            if (isQUnit(runner)) {
                unit = qunitAdapter(runner);
            } else if (isQUnit2(runner)) {
                unit = qunit2Adapter(runner);
            } else if (isMocha(runner)) {
                unit = mochaAdapter(runner);
            } else if (isJasmine(runner)) {
                unit = jasmineAdapter(runner);
            } else if (isJasmine2(runner)) {
                unit = jasmine2Adapter(runner);
            } else {
                unit = defaultAdapter;
            }
            FuncUnit.unit = unit;
        };
        function isQUnit(runner) {
            return !!(window.QUnit && runner === window.QUnit && (!runner.version || runner.version.startsWith('1.')));
        }
        function isQUnit2(runner) {
            return !!(window.QUnit && runner === window.QUnit && runner.version && runner.version.startsWith('2.'));
        }
        function isMocha(runner) {
            return !!(runner.setup && runner.globals && runner.reporter);
        }
        function isJasmine(runner) {
            return !!(runner.getEnv && typeof window.waitsFor === 'function');
        }
        function isJasmine2(runner) {
            return !!(runner.getEnv && typeof runner.clock === 'function' && !window.waitsFor);
        }
        FuncUnit.detach = function () {
            FuncUnit.unit = defaultAdapter;
        };
    }(function () {
        return this;
    }(), require, exports, module));
});