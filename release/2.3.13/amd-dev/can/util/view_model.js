/*!
 * CanJS - 2.3.13
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 01 Feb 2016 23:57:40 GMT
 * Licensed MIT
 */

/*can@2.3.13#util/view_model/view_model*/
define(['can/util/library'], function (can) {
    var $ = can.$;
    if ($.fn) {
        $.fn.scope = $.fn.viewModel = function () {
            return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
        };
    }
});