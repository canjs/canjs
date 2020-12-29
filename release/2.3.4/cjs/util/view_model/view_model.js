/*!
 * CanJS - 2.3.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 02 Dec 2015 22:49:52 GMT
 * Licensed MIT
 */

/*can@2.3.4#util/view_model/view_model*/
var can = require('../util.js');
var $ = can.$;
if ($.fn) {
    $.fn.scope = $.fn.viewModel = function () {
        return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
    };
}