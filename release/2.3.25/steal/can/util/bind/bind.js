/*!
 * CanJS - 2.3.25
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 10 Aug 2016 19:17:58 GMT
 * Licensed MIT
 */

/*can@2.3.25#util/bind/bind*/
steal('can/util', function (can) {
    can.bindAndSetup = function () {
        can.addEvent.apply(this, arguments);
        if (!this.__inSetup) {
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
    can.unbindAndTeardown = function (event, handler) {
        if (!this.__bindEvents) {
            return this;
        }
        var handlers = this.__bindEvents[event] || [];
        var handlerCount = handlers.length;
        can.removeEvent.apply(this, arguments);
        if (this._bindings === null) {
            this._bindings = 0;
        } else {
            this._bindings = this._bindings - (handlerCount - handlers.length);
        }
        if (!this._bindings && this._bindteardown) {
            this._bindteardown();
        }
        return this;
    };
    return can;
});