/*!
 * CanJS - 2.2.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 13 Mar 2015 19:55:12 GMT
 * Licensed MIT
 */

/*can@2.2.0#util/can*/
define([], function () {
    var glbl = typeof window !== 'undefined' ? window : global;
    var can = {};
    if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
        glbl.can = can;
    }
    can.global = glbl;
    can.k = function () {
    };
    can.isDeferred = function (obj) {
        return obj && typeof obj.then === 'function' && typeof obj.pipe === 'function';
    };
    var cid = 0;
    can.cid = function (object, name) {
        if (!object._cid) {
            cid++;
            object._cid = (name || '') + cid;
        }
        return object._cid;
    };
    can.VERSION = '2.2.0';
    can.simpleExtend = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
    can.frag = function (item) {
        var frag;
        if (!item || typeof item === 'string') {
            frag = can.buildFragment(item == null ? '' : '' + item, document.body);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        } else if (item.nodeType === 11) {
            return item;
        } else if (typeof item.nodeType === 'number') {
            frag = document.createDocumentFragment();
            frag.appendChild(item);
            return frag;
        } else if (typeof item.length === 'number') {
            frag = document.createDocumentFragment();
            can.each(item, function (item) {
                frag.appendChild(can.frag(item));
            });
            return frag;
        } else {
            frag = can.buildFragment('' + item, document.body);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        }
    };
    can.scope = function (el, attr) {
        el = can.$(el);
        var scope = can.data(el, 'scope');
        if (!scope) {
            scope = can.Map ? new can.Map() : {};
            can.data(el, 'scope', scope);
        }
        if (attr) {
            return scope.attr(attr);
        } else {
            return scope;
        }
    };
    can['import'] = function (moduleName) {
        var deferred = new can.Deferred();
        if (typeof window.System === 'object') {
            window.System['import'](moduleName).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
        } else if (window.define && window.define.amd) {
            window.require([moduleName], function (value) {
                deferred.resolve(value);
            });
        } else if (window.steal) {
            steal.steal(moduleName, function (value) {
                deferred.resolve(value);
            });
        } else if (window.require) {
            deferred.resolve(window.require(moduleName));
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    };
    can.__reading = function () {
    };
    return can;
});
