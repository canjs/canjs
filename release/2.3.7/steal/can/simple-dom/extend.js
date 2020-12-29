/*!
 * CanJS - 2.3.7
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 16 Dec 2015 03:10:33 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.23#simple-dom/extend*/
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