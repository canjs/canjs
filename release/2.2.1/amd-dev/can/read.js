/*!
 * CanJS - 2.2.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Tue, 24 Mar 2015 22:13:03 GMT
 * Licensed MIT
 */

/*can@2.2.1#compute/read*/
define(['can/util/library'], function (can) {
    var read = function (parent, reads, options) {
        options = options || {};
        var state = { foundObservable: false };
        var cur = readValue(parent, 0, reads, options, state), type, prev, foundObs, readLength = reads.length, i = 0;
        while (i < readLength) {
            prev = cur;
            for (var r = 0, readersLength = read.propertyReaders.length; r < readersLength; r++) {
                var reader = read.propertyReaders[r];
                if (reader.test(cur)) {
                    cur = reader.read(cur, reads[i], i, options, state);
                    break;
                }
            }
            i = i + 1;
            cur = readValue(cur, i, reads, options, state);
            type = typeof cur;
            if (i < reads.length && (cur === null || type !== 'function' && type !== 'object')) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1, cur);
                }
                return {
                    value: undefined,
                    parent: prev
                };
            }
        }
        if (typeof cur === 'function' && !(can.Construct && cur.prototype instanceof can.Construct) && !(can.route && cur === can.route)) {
            if (options.isArgument) {
                if (!cur.isComputed && options.proxyMethods !== false) {
                    cur = can.proxy(cur, prev);
                }
            } else {
                if (cur.isComputed && !foundObs && options.foundObservable) {
                    options.foundObservable(cur, i);
                }
                cur = cur.call(prev);
            }
        }
        if (cur === undefined) {
            if (options.earlyExit) {
                options.earlyExit(prev, i - 1);
            }
        }
        return {
            value: cur,
            parent: prev
        };
    };
    var readValue = function (value, index, reads, options, state) {
        for (var i = 0, len = read.valueReaders.length; i < len; i++) {
            if (read.valueReaders[i].test(value, index, reads, options)) {
                value = read.valueReaders[i].read(value, index, reads, options, state);
            }
        }
        return value;
    };
    read.valueReaders = [
        {
            test: function (value, i, reads, options) {
                return value && value.isComputed && (!options.isArgument && i < reads.length);
            },
            read: function (value, i, reads, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, i);
                    state.foundObservable = true;
                }
                return value instanceof can.Compute ? value.get() : value();
            }
        },
        {
            test: function (value, i, reads, options) {
                var type = typeof value;
                return i < reads.length && type === 'function' && options.executeAnonymousFunctions && !(can.Construct && value.prototype instanceof can.Construct);
            },
            read: function (value) {
                return value();
            }
        }
    ];
    read.propertyReaders = [
        {
            test: can.isMapLike,
            read: function (value, prop, index, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, index);
                    state.foundObservable = true;
                }
                if (typeof value[prop] === 'function' && value.constructor.prototype[prop] === value[prop]) {
                    if (options.returnObserveMethods) {
                        return value[prop];
                    } else if (prop === 'constructor' && value instanceof can.Construct || value[prop].prototype instanceof can.Construct) {
                        return value[prop];
                    } else {
                        return value[prop].apply(value, options.args || []);
                    }
                } else {
                    return value.attr(prop);
                }
            }
        },
        {
            test: function (value) {
                return can.isPromise(value);
            },
            read: function (value, prop, index, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, index);
                    state.foundObservable = true;
                }
                var observeData = value.__observeData;
                if (!value.__observeData) {
                    observeData = value.__observeData = {
                        isPending: true,
                        state: 'pending',
                        isResolved: false,
                        isRejected: false
                    };
                    can.simpleExtend(observeData, can.event);
                    value.then(function (value) {
                        observeData.isPending = false;
                        observeData.isResolved = true;
                        observeData.value = value;
                        observeData.state = 'resolved';
                        observeData.dispatch('state', [
                            'resolved',
                            'pending'
                        ]);
                    }, function (reason) {
                        observeData.isPending = false;
                        observeData.isRejected = true;
                        observeData.reason = reason;
                        observeData.state = 'rejected';
                        observeData.dispatch('state', [
                            'rejected',
                            'pending'
                        ]);
                    });
                }
                can.__reading(observeData, 'state');
                return observeData[prop];
            }
        },
        {
            test: function () {
                return true;
            },
            read: function (value, prop) {
                if (value == null) {
                    return undefined;
                } else {
                    return value[prop];
                }
            }
        }
    ];
    return read;
});
