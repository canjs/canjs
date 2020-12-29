/*!
 * CanJS - 2.3.28
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 08 Dec 2016 20:53:50 GMT
 * Licensed MIT
 */

/*can@2.3.28#compute/read*/
var can = require('../util/util.js');
var read = function (parent, reads, options) {
    options = options || {};
    var state = { foundObservable: false };
    var cur = readValue(parent, 0, reads, options, state), type, prev, readLength = reads.length, i = 0;
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
        cur = readValue(cur, i, reads, options, state, prev);
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
var isAt = function (index, reads) {
    var prevRead = reads[index - 1];
    return prevRead && prevRead.at;
};
var readValue = function (value, index, reads, options, state, prev) {
    var usedValueReader;
    do {
        usedValueReader = false;
        for (var i = 0, len = read.valueReaders.length; i < len; i++) {
            if (read.valueReaders[i].test(value, index, reads, options)) {
                value = read.valueReaders[i].read(value, index, reads, options, state, prev);
            }
        }
    } while (usedValueReader);
    return value;
};
read.valueReaders = [
    {
        name: 'compute',
        test: function (value, i, reads, options) {
            return value && value.isComputed && !isAt(i, reads);
        },
        read: function (value, i, reads, options, state) {
            if (options.readCompute === false && i === reads.length) {
                return value;
            }
            if (!state.foundObservable && options.foundObservable) {
                options.foundObservable(value, i);
                state.foundObservable = true;
            }
            return value instanceof can.Compute ? value.get() : value();
        }
    },
    {
        name: 'function',
        test: function (value, i, reads, options) {
            var type = typeof value;
            return type === 'function' && !value.isComputed && !(can.Construct && value.prototype instanceof can.Construct) && !(can.route && value === can.route);
        },
        read: function (value, i, reads, options, state, prev) {
            if (isAt(i, reads)) {
                return i === reads.length ? can.proxy(value, prev) : value;
            } else if (options.callMethodsOnObservables && can.isMapLike(prev)) {
                return value.apply(prev, options.args || []);
            } else if (options.isArgument && i === reads.length) {
                return options.proxyMethods !== false ? can.proxy(value, prev) : value;
            }
            return value.apply(prev, options.args || []);
        }
    }
];
read.propertyReaders = [
    {
        name: 'map',
        test: can.isMapLike,
        read: function (value, prop, index, options, state) {
            if (!state.foundObservable && options.foundObservable) {
                options.foundObservable(value, index);
                state.foundObservable = true;
            }
            var res = value.attr(prop.key);
            if (res !== undefined) {
                return res;
            } else {
                return value[prop.key];
            }
        }
    },
    {
        name: 'promise',
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
                    isRejected: false,
                    value: undefined,
                    reason: undefined
                };
                can.cid(observeData);
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
            can.__observe(observeData, 'state');
            return prop.key in observeData ? observeData[prop.key] : value[prop.key];
        }
    },
    {
        name: 'object',
        test: function () {
            return true;
        },
        read: function (value, prop) {
            if (value == null) {
                return undefined;
            } else {
                if (prop.key in value) {
                    return value[prop.key];
                } else if (prop.at && specialRead[prop.key] && '@' + prop.key in value) {
                    prop.at = false;
                    return value['@' + prop.key];
                }
            }
        }
    }
];
var specialRead = {
    index: true,
    key: true,
    event: true,
    element: true,
    viewModel: true
};
read.write = function (parent, key, value, options) {
    options = options || {};
    if (can.isMapLike(parent)) {
        if (!options.isArgument && parent._data && parent._data[key] && parent._data[key].isComputed) {
            return parent._data[key](value);
        } else {
            return parent.attr(key, value);
        }
    }
    if (parent[key] && parent[key].isComputed) {
        return parent[key](value);
    }
    if (typeof parent === 'object') {
        parent[key] = value;
    }
};
read.reads = function (key) {
    var keys = [];
    var last = 0;
    var at = false;
    if (key.charAt(0) === '@') {
        last = 1;
        at = true;
    }
    var keyToAdd = '';
    for (var i = last; i < key.length; i++) {
        var character = key.charAt(i);
        if (character === '.' || character === '@') {
            if (key.charAt(i - 1) !== '\\') {
                keys.push({
                    key: keyToAdd,
                    at: at
                });
                at = character === '@';
                keyToAdd = '';
            } else {
                keyToAdd = keyToAdd.substr(0, keyToAdd.length - 1) + '.';
            }
        } else {
            keyToAdd += character;
        }
    }
    keys.push({
        key: keyToAdd,
        at: at
    });
    return keys;
};
module.exports = read;