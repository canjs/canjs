/*!
 * CanJS - 2.3.18
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 03 Mar 2016 17:58:31 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0#simple-dom/extend*/
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