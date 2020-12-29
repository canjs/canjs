/*global*/
define('global', [
    'require',
    'exports',
    'module',
    'funcunit'
], function (require, exports, module) {
    require('funcunit');
    var FuncUnit = window.FuncUnit || {};
    module.exports = FuncUnit;
});