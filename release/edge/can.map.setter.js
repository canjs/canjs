/*!
 * CanJS - 2.1.2-pre
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Thu, 12 Jun 2014 22:19:11 GMT
 * Licensed MIT
 * Includes: can/map/setter
 * Download from: http://canjs.com
 */
(function(undefined) {

    // ## map/setter/setter.js
    var __m1 = (function(can) {

        can.classize = function(s, join) {
            // this can be moved out ..
            // used for getter setter
            var parts = s.split(can.undHash),
                i = 0;
            for (; i < parts.length; i++) {
                parts[i] = can.capitalize(parts[i]);
            }
            return parts.join(join || '');
        };
        var classize = can.classize,
            proto = can.Map.prototype,
            old = proto.__set;
        proto.__set = function(prop, value, current, success, error) {


            // check if there's a setter
            var cap = classize(prop),
                setName = 'set' + cap,
                errorCallback = function(errors) {


                    var stub = error && error.call(self, errors);
                    // if 'validations' is on the page it will trigger
                    // the error itself and we dont want to trigger
                    // the event twice. :)
                    if (stub !== false) {
                        can.trigger(self, 'error', [
                                prop,
                                errors
                            ], true);
                    }
                    return false;
                }, self = this;



            // if we have a setter
            if (this[setName]) {
                // call the setter, if returned value is undefined,
                // this means the setter is async so we
                // do not call update property and return right away
                can.batch.start();

                value = this[setName](value, function(value) {
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
    })(window.can, undefined);

})();