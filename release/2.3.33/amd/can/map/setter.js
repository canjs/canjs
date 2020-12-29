/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Mon, 02 Oct 2017 16:48:35 GMT
 * Licensed MIT
 */

/*can@2.3.32#map/setter/setter*/
define([
    'can/util/library',
    'can/map'
], function (can) {
    can.classize = function (s, join) {
        var parts = s.split(can.undHash), i = 0;
        for (; i < parts.length; i++) {
            parts[i] = can.capitalize(parts[i]);
        }
        return parts.join(join || '');
    };
    var classize = can.classize, proto = can.Map.prototype, old = proto.__set;
    proto.__set = function (prop, value, current, success, error) {
        var cap = classize(prop), setName = 'set' + cap, errorCallback = function (errors) {
                var stub = error && error.call(self, errors);
                if (stub !== false) {
                    can.trigger(self, 'error', [
                        prop,
                        errors
                    ], true);
                }
                return false;
            }, self = this;
        if (this[setName]) {
            can.batch.start();
            value = this[setName](value, function (value) {
                old.call(self, prop, value, current, success, errorCallback);
            }, errorCallback);
            if (value === undefined) {
                can.batch.stop();
                return;
            } else {
                old.call(self, prop, value, current, success, errorCallback);
                can.batch.stop();
                return this;
            }
        } else {
            old.call(self, prop, value, current, success, errorCallback);
        }
        return this;
    };
    return can.Map;
});