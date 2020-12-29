/*can-validate-build*/
'use strict';
var canValidate = require('./can-validate.js');
var validate = require('./map/validate/validate.js');
var validateJsShim = require('./shims/validatejs.js');
module.exports = {
    'can-validate': canValidate,
    'map': { validate: validate },
    'shims': { 'validatejs.shim': validateJsShim }
};
//# sourceMappingURL=can-validate-build.js.map