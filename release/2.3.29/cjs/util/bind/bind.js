/*!
 * CanJS - 2.3.29
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Tue, 21 Feb 2017 00:42:50 GMT
 * Licensed MIT
 */

/*can@2.3.29#util/bind/bind*/
var can = require('../util.js');
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
module.exports = can;