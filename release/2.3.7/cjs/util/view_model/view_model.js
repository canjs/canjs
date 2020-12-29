/*!
 * CanJS - 2.3.7
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 16 Dec 2015 03:10:33 GMT
 * Licensed MIT
 */

/*can@2.3.7#util/view_model/view_model*/
var can = require('../util.js');
var $ = can.$;
if ($.fn) {
    $.fn.scope = $.fn.viewModel = function () {
        return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
    };
}