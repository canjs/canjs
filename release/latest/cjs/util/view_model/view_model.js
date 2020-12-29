/*!
 * CanJS - 2.3.31
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 19 Jul 2017 18:58:09 GMT
 * Licensed MIT
 */

/*can@2.3.31#util/view_model/view_model*/
var can = require('../util.js');
var $ = can.$;
if ($.fn) {
    $.fn.scope = $.fn.viewModel = function () {
        return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
    };
}