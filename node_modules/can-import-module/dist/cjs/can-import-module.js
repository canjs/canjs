/*can-import-module@1.1.0#can-import-module*/
'use strict';
var getGlobal = require('can-globals/global/global');
var namespace = require('can-namespace');
module.exports = namespace.import = function (moduleName, parentName) {
    return new Promise(function (resolve, reject) {
        try {
            var global = getGlobal();
            if (typeof global.System === 'object' && isFunction(global.System['import'])) {
                global.System['import'](moduleName, { name: parentName }).then(resolve, reject);
            } else if (global.define && global.define.amd) {
                global.require([moduleName], function (value) {
                    resolve(value);
                });
            } else if (global.require) {
                resolve(global.require(moduleName));
            } else {
                if (typeof stealRequire !== 'undefined') {
                    steal.import(moduleName, { name: parentName }).then(resolve, reject);
                } else {
                    resolve();
                }
            }
        } catch (err) {
            reject(err);
        }
    });
};
function isFunction(fn) {
    return typeof fn === 'function';
}