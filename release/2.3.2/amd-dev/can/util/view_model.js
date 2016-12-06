/*!
 * CanJS - 2.3.2
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 13 Nov 2015 23:57:31 GMT
 * Licensed MIT
 */

/*can@2.3.2#util/view_model/view_model*/
define(['can/util/library'], function (can) {
    var $ = can.$;
    if ($.fn) {
        $.fn.scope = $.fn.viewModel = function () {
            return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
        };
    }
});