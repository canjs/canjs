/*!
 * CanJS - 2.3.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Sat, 12 Dec 2015 01:07:53 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.20#simple-dom/extend*/
steal('', function () {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports['default'] = function (a, b) {
        for (var p in b) {
            a[p] = b[p];
        }
        return a;
    };
    ;
    module.exports = exports['default'];
});