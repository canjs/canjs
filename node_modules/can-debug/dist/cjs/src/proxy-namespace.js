/*can-debug@2.0.6#src/proxy-namespace*/
define('can-debug/src/proxy-namespace', function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var warned = false;
        module.exports = function proxyNamespace(namespace) {
            return new Proxy(namespace, {
                get: function get(target, name) {
                    if (!warned) {
                        console.warn('Warning: use of \'can\' global should be for debugging purposes only.');
                        warned = true;
                    }
                    return target[name];
                }
            });
        };
    }(function () {
        return this;
    }(), require, exports, module));
});