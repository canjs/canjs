/*!
 * CanJS - 2.3.11
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 21 Jan 2016 23:41:15 GMT
 * Licensed MIT
 */

/*can@2.3.11#compute/proto_compute*/
define([
    'can/util/library',
    'can/util/bind',
    'can/read',
    'can/get_value_and_bind',
    'can/util/batch'
], function (can, bind, read, ObservedInfo) {
    can.Compute = function (getterSetter, context, eventName, bindOnce) {
        can.cid(this, 'compute');
        var args = [];
        for (var i = 0, arglen = arguments.length; i < arglen; i++) {
            args[i] = arguments[i];
        }
        var contextType = typeof args[1];
        if (typeof args[0] === 'function') {
            this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
        } else if (args[1]) {
            if (contextType === 'string') {
                this._setupProperty(args[0], args[1], args[2]);
            } else if (contextType === 'function') {
                this._setupSetter(args[0], args[1], args[2]);
            } else {
                if (args[1] && args[1].fn) {
                    this._setupAsyncCompute(args[0], args[1]);
                } else {
                    this._setupSettings(args[0], args[1]);
                }
            }
        } else {
            this._setupSimpleValue(args[0]);
        }
        this._args = args;
        this.isComputed = true;
    };
    can.simpleExtend(can.Compute.prototype, {
        _setupGetterSetterFn: function (getterSetter, context, eventName) {
            this._set = context ? can.proxy(getterSetter, context) : getterSetter;
            this._get = context ? can.proxy(getterSetter, context) : getterSetter;
            this._canObserve = eventName === false ? false : true;
            var handlers = setupComputeHandlers(this, getterSetter, context || this);
            this._on = handlers.on;
            this._off = handlers.off;
        },
        _setupProperty: function (target, propertyName, eventName) {
            var isObserve = can.isMapLike(target), self = this, handler;
            if (isObserve) {
                handler = function (ev, newVal, oldVal) {
                    self.updater(newVal, oldVal, ev.batchNum);
                };
                this.hasDependencies = true;
                this._get = function () {
                    return target.attr(propertyName);
                };
                this._set = function (val) {
                    target.attr(propertyName, val);
                };
            } else {
                handler = function () {
                    self.updater(self._get(), self.value);
                };
                this._get = function () {
                    return can.getObject(propertyName, [target]);
                };
                this._set = function (value) {
                    var properties = propertyName.split('.'), leafPropertyName = properties.pop(), targetProperty = can.getObject(properties.join('.'), [target]);
                    targetProperty[leafPropertyName] = value;
                };
            }
            this._on = function (update) {
                can.bind.call(target, eventName || propertyName, handler);
                this.value = this._get();
            };
            this._off = function () {
                return can.unbind.call(target, eventName || propertyName, handler);
            };
        },
        _setupSetter: function (initialValue, setter, eventName) {
            this.value = initialValue;
            this._set = setter;
            can.simpleExtend(this, eventName);
        },
        _setupSettings: function (initialValue, settings) {
            this.value = initialValue;
            this._set = settings.set || this._set;
            this._get = settings.get || this._get;
            if (!settings.__selfUpdater) {
                var self = this, oldUpdater = this.updater;
                this.updater = function () {
                    oldUpdater.call(self, self._get(), self.value);
                };
            }
            this._on = settings.on ? settings.on : this._on;
            this._off = settings.off ? settings.off : this._off;
        },
        _setupAsyncCompute: function (initialValue, settings) {
            var self = this;
            this.value = initialValue;
            this._setUpdates = true;
            this.lastSetValue = new can.Compute(initialValue);
            this._set = function (newVal) {
                if (newVal === self.lastSetValue.get()) {
                    return this.value;
                }
                return self.lastSetValue.set(newVal);
            };
            this._get = function () {
                return getter.call(settings.context, self.lastSetValue.get());
            };
            var getter = settings.fn, bindings;
            if (getter.length === 0) {
                bindings = setupComputeHandlers(this, getter, settings.context);
            } else if (getter.length === 1) {
                bindings = setupComputeHandlers(this, function () {
                    return getter.call(settings.context, self.lastSetValue.get());
                }, settings);
            } else {
                var oldUpdater = this.updater, setValue = function (newVal) {
                        oldUpdater.call(self, newVal, self.value);
                    };
                this.updater = function (newVal) {
                    oldUpdater.call(self, newVal, self.value);
                };
                bindings = setupComputeHandlers(this, function () {
                    var res = getter.call(settings.context, self.lastSetValue.get(), setValue);
                    return res !== undefined ? res : this.value;
                }, this);
            }
            this._on = bindings.on;
            this._off = bindings.off;
        },
        _setupSimpleValue: function (initialValue) {
            this.value = initialValue;
        },
        _bindsetup: can.__notObserve(function () {
            this.bound = true;
            this._on(this.updater);
        }),
        _bindteardown: function () {
            this._off(this.updater);
            this.bound = false;
        },
        bind: can.bindAndSetup,
        unbind: can.unbindAndTeardown,
        clone: function (context) {
            if (context && typeof this._args[0] === 'function') {
                this._args[1] = context;
            } else if (context) {
                this._args[2] = context;
            }
            return new can.Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
        },
        _on: can.k,
        _off: can.k,
        get: function () {
            if (can.__isRecordingObserves() && this._canObserve !== false) {
                can.__observe(this, 'change');
                if (!this.bound) {
                    can.Compute.temporarilyBind(this);
                }
            }
            if (this.bound) {
                return this.value;
            } else {
                return this._get();
            }
        },
        _get: function () {
            return this.value;
        },
        set: function (newVal) {
            var old = this.value;
            var setVal = this._set(newVal, old);
            if (this._setUpdates) {
                return this.value;
            }
            if (this.hasDependencies) {
                return this._get();
            }
            if (setVal === undefined) {
                this.value = this._get();
            } else {
                this.value = setVal;
            }
            updateOnChange(this, this.value, old);
            return this.value;
        },
        _set: function (newVal) {
            return this.value = newVal;
        },
        updater: function (newVal, oldVal, batchNum) {
            this.value = newVal;
            updateOnChange(this, newVal, oldVal, batchNum);
        },
        toFunction: function () {
            return can.proxy(this._computeFn, this);
        },
        _computeFn: function (newVal) {
            if (arguments.length) {
                return this.set(newVal);
            }
            return this.get();
        }
    });
    var updateOnChange = function (compute, newValue, oldValue, batchNum) {
        var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
        if (valueChanged) {
            can.batch.trigger(compute, {
                type: 'change',
                batchNum: batchNum
            }, [
                newValue,
                oldValue
            ]);
        }
    };
    var setupComputeHandlers = function (compute, func, context) {
        var readInfo = new ObservedInfo(func, context, compute);
        return {
            on: function () {
                readInfo.getValueAndBind();
                compute.value = readInfo.value;
                compute.hasDependencies = !can.isEmptyObject(readInfo.newObserved);
            },
            off: function () {
                readInfo.teardown();
            }
        };
    };
    can.Compute.temporarilyBind = function (compute) {
        var computeInstance = compute.computeInstance || compute;
        computeInstance.bind('change', can.k);
        if (!computes) {
            computes = [];
            setTimeout(unbindComputes, 10);
        }
        computes.push(computeInstance);
    };
    var computes, unbindComputes = function () {
            for (var i = 0, len = computes.length; i < len; i++) {
                computes[i].unbind('change', can.k);
            }
            computes = null;
        };
    can.Compute.async = function (initialValue, asyncComputer, context) {
        return new can.Compute(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    can.Compute.truthy = function (compute) {
        return new can.Compute(function () {
            var res = compute.get();
            if (typeof res === 'function') {
                res = res.get();
            }
            return !!res;
        });
    };
    can.Compute.read = read;
    can.Compute.set = read.write;
    return can.Compute;
});