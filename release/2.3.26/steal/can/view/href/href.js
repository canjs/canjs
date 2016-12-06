/*!
 * CanJS - 2.3.26
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 18 Aug 2016 00:56:47 GMT
 * Licensed MIT
 */

/*can@2.3.26#view/href/href*/
steal('can/util', 'can/view/stache/expression.js', 'can/view/callbacks', 'can/view/scope', function (can, expression) {
    var removeCurly = function (value) {
        if (value[0] === '{' && value[value.length - 1] === '}') {
            return value.substr(1, value.length - 2);
        }
        return value;
    };
    can.view.attr('can-href', function (el, attrData) {
        var attrInfo = expression.parse('tmp(' + removeCurly(el.getAttribute('can-href')) + ')', { baseMethodType: 'Call' });
        var getHash = attrInfo.argExprs[0].value(attrData.scope, null);
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
});