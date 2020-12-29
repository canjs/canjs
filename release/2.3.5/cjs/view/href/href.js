/*!
 * CanJS - 2.3.5
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 03 Dec 2015 23:34:11 GMT
 * Licensed MIT
 */

/*can@2.3.5#view/href/href*/
var can = require('../../util/util.js');
var expression = require('../stache/expression.js');
require('../callbacks/callbacks.js');
require('../scope/scope.js');
var removeCurly = function (value) {
    if (value[0] === '{' && value[value.length - 1] === '}') {
        return value.substr(1, value.length - 2);
    }
    return value;
};
can.view.attr('can-href', function (el, attrData) {
    var attrInfo = expression.parse('tmp(' + removeCurly(el.getAttribute('can-href')) + ')', { baseMethodType: 'Call' });
    var getHash = attrInfo.hash(attrData.scope, null);
    var routeHref = can.compute(function () {
            return can.route.url(getHash());
        });
    el.setAttribute('href', routeHref());
    var handler = function (ev, newVal) {
        el.setAttribute('href', newVal);
    };
    routeHref.bind('change', handler);
    can.bind.call(el, 'removed', function () {
        routeHref.unbind('change', handler);
    });
});