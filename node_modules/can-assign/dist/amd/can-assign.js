/*can-assign@1.3.2#can-assign*/
define('can-assign', [
    'require',
    'exports',
    'module',
    'can-namespace'
], function (require, exports, module) {
    var namespace = require('can-namespace');
    module.exports = namespace.assign = function (d, s) {
        for (var prop in s) {
            var desc = Object.getOwnPropertyDescriptor(d, prop);
            if (!desc || desc.writable !== false) {
                d[prop] = s[prop];
            }
        }
        return d;
    };
});