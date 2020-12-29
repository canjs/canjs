/*funcunit*/
define('funcunit', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core',
    'funcunit/browser/adapters/adapters',
    'funcunit/browser/open',
    'funcunit/browser/actions',
    'funcunit/browser/getters',
    'funcunit/browser/traversers',
    'funcunit/browser/queue',
    'funcunit/browser/waits'
], function (require, exports, module) {
    var FuncUnit = require('funcunit/browser/core');
    require('funcunit/browser/adapters/adapters');
    require('funcunit/browser/open');
    require('funcunit/browser/actions');
    require('funcunit/browser/getters');
    require('funcunit/browser/traversers');
    require('funcunit/browser/queue');
    require('funcunit/browser/waits');
    window.FuncUnit = window.S = window.F = FuncUnit;
    module.exports = FuncUnit;
});