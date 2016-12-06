/*!
 * CanJS - 2.3.14
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 06 Feb 2016 00:01:32 GMT
 * Licensed MIT
 */

/*can@2.3.14#util/view_model/view_model*/
var can = require('../util.js');
var $ = can.$;
if ($.fn) {
    $.fn.scope = $.fn.viewModel = function () {
        return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
    };
}