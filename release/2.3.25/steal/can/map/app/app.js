/*!
 * CanJS - 2.3.25
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 10 Aug 2016 19:17:58 GMT
 * Licensed MIT
 */

/*can@2.3.25#map/app/app*/
steal('can/util', 'can/map', 'can/compute', function (can) {
    function sortedSetJson(set) {
        if (set == null) {
            return set;
        } else {
            var sorted = {};
            var keys = [];
            for (var k in set) {
                keys.push(k);
            }
            keys.sort();
            can.each(keys, function (prop) {
                sorted[prop] = set[prop];
            });
            return JSON.stringify(sorted);
        }
    }
    can.AppMap = can.Map.extend({
        setup: function () {
            can.Map.prototype.setup.apply(this, arguments);
            this.__readyPromises = [];
            this.__pageData = {};
            if (typeof System !== 'undefined' && System.has('asset-register')) {
                var register = System.get('asset-register')['default'];
                var self = this;
                register('inline-cache', function () {
                    var script = document.createElement('script');
                    var text = document.createTextNode('\nINLINE_CACHE = ' + JSON.stringify(self.__pageData) + ';\n');
                    script.appendChild(text);
                    return script;
                });
            }
        },
        waitFor: function (promise) {
            this.__readyPromises.push(promise);
            return promise;
        },
        pageData: can.__notObserve(function (key, set, inst) {
            var appState = this;
            function store(data) {
                var keyData = appState.__pageData[key];
                if (!keyData) {
                    keyData = appState.__pageData[key] = {};
                }
                keyData[sortedSetJson(set)] = typeof data.serialize === 'function' ? data.serialize() : data;
            }
            if (can.isPromise(inst)) {
                this.waitFor(inst);
                inst.then(function (data) {
                    store(data);
                });
            } else {
                store(inst);
            }
            return inst;
        })
    });
    return can.AppMap;
});