/*!
 * CanJS - 2.3.17
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 19 Feb 2016 22:54:51 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0-pre.3#simple-dom/extend*/
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