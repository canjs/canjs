/*!
 * CanJS - 2.2.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 13 Mar 2015 19:55:12 GMT
 * Licensed MIT
 */

/*can@2.2.0#util/bind/bind*/
define(['can/util/library'], function (can) {
    can.bindAndSetup = function () {
        can.addEvent.apply(this, arguments);
        if (!this._init) {
            if (!this._bindings) {
                this._bindings = 1;
                if (this._bindsetup) {
                    this._bindsetup();
                }
            } else {
                this._bindings++;
            }
        }
        return this;
    };
    can.unbindAndTeardown = function (ev, handler) {
        can.removeEvent.apply(this, arguments);
        if (this._bindings === null) {
            this._bindings = 0;
        } else {
            this._bindings--;
        }
        if (!this._bindings && this._bindteardown) {
            this._bindteardown();
        }
        return this;
    };
    return can;
});
