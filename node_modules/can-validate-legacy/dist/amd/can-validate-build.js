/*can-validate-build*/
define([
    'require',
    'exports',
    'module',
    './can-validate',
    './map/validate/validate',
    './shims/validatejs'
], function (require, exports, module) {
    'use strict';
    var canValidate = require('./can-validate');
    var validate = require('./map/validate/validate');
    var validateJsShim = require('./shims/validatejs');
    module.exports = {
        'can-validate': canValidate,
        'map': { validate: validate },
        'shims': { 'validatejs.shim': validateJsShim }
    };
});
//# sourceMappingURL=can-validate-build.js.map