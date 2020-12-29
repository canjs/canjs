/*!
 * CanJS - 2.3.30
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 03 May 2017 15:32:43 GMT
 * Licensed MIT
 */

/*can@2.3.30#util/view_model/view_model*/
var can = require('../util.js');
var $ = can.$;
if ($.fn) {
    $.fn.scope = $.fn.viewModel = function () {
        return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
    };
}