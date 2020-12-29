define([
    'exports',
    'basics/amdmodule'
], function (exports, _basicsAmdmodule) {
    'use strict';
    exports.__esModule = true;
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _amdMod = _interopRequireDefault(_basicsAmdmodule);
    exports['default'] = {
        amdModule: _amdMod['default'],
        name: 'es6Module'
    };
    var __useDefault = true;
    exports.__useDefault = __useDefault;
});