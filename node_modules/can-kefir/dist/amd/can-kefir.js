/*can-kefir@1.1.3#can-kefir*/
define([
    'require',
    'exports',
    'module',
    'kefir',
    'can-symbol',
    'can-reflect',
    'can-event-queue/map',
    'can-observation-recorder'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var Kefir = require('kefir');
        var canSymbol = require('can-symbol');
        var canReflect = require('can-reflect');
        var mapEventsMixin = require('can-event-queue/map');
        var ObservationRecorder = require('can-observation-recorder');
        var metaSymbol = canSymbol.for('can.meta');
        var onKeyValueSymbol = canSymbol.for('can.onKeyValue');
        var offKeyValueSymbol = canSymbol.for('can.offKeyValue');
        var keyNames = {
            value: {
                on: 'onValue',
                off: 'offValue',
                handler: 'onValueHandler',
                handlers: 'onValueHandlers'
            },
            error: {
                on: 'onError',
                off: 'offError',
                handler: 'onErrorHandler',
                handlers: 'onErrorHandlers'
            }
        };
        function ensureMeta(obj) {
            var meta = obj[metaSymbol];
            if (!meta) {
                meta = {};
                canReflect.setKeyValue(obj, metaSymbol, meta);
            }
            return meta;
        }
        function getCurrentValue(stream, key) {
            if (stream._currentEvent && stream._currentEvent.type === key) {
                return stream._currentEvent.value;
            } else {
                var names = keyNames[key];
                if (!names) {
                    return stream[key];
                }
                var VALUE, valueHandler = function (value) {
                        VALUE = value;
                    };
                stream[names.on](valueHandler);
                stream[names.off](valueHandler);
                return VALUE;
            }
        }
        if (Kefir) {
            if (Object.isExtensible && !Object.isExtensible(Kefir)) {
                Kefir = Kefir.Kefir;
            }
            Kefir.Observable.prototype._eventSetup = function eventSetup() {
                var stream = this;
                var meta = ensureMeta(stream);
                meta.bound = true;
                meta.onValueHandler = function onValueHandler(newValue) {
                    var oldValue = meta.value;
                    meta.value = newValue;
                    if (newValue !== oldValue) {
                        mapEventsMixin.dispatch.call(stream, { type: 'value' }, [
                            newValue,
                            oldValue
                        ]);
                    }
                };
                meta.onErrorHandler = function onErrorHandler(error) {
                    var prevError = meta.error;
                    meta.error = error;
                    mapEventsMixin.dispatch.call(stream, { type: 'error' }, [
                        error,
                        prevError
                    ]);
                };
                stream.onValue(meta.onValueHandler);
                stream.onError(meta.onErrorHandler);
            };
            Kefir.Observable.prototype._eventTeardown = function eventTeardown() {
                var stream = this;
                var meta = ensureMeta(stream);
                meta.bound = false;
                stream.offValue(meta.onValueHandler);
                stream.offError(meta.onErrorHandler);
            };
            canReflect.assignSymbols(Kefir.Observable.prototype, {
                'can.onKeyValue': function onKeyValue() {
                    return mapEventsMixin[onKeyValueSymbol].apply(this, arguments);
                },
                'can.offKeyValue': function () {
                    return mapEventsMixin[offKeyValueSymbol].apply(this, arguments);
                },
                'can.getKeyValue': function (key) {
                    var stream = this;
                    var meta = ensureMeta(stream);
                    if (!keyNames[key]) {
                        return stream[key];
                    }
                    ObservationRecorder.add(stream, key);
                    if (meta.bound) {
                        return meta[key];
                    } else {
                        var currentValue = getCurrentValue(stream, key);
                        meta[key] = currentValue;
                        return currentValue;
                    }
                },
                'can.getValueDependencies': function getValueDependencies() {
                    var sources;
                    var stream = this;
                    if (stream._source != null) {
                        sources = [stream._source];
                    } else if (stream._sources != null) {
                        sources = stream._sources;
                    }
                    if (sources != null) {
                        return { valueDependencies: new Set(sources) };
                    }
                }
            });
            Kefir.emitterProperty = function () {
                var emitter;
                var setLastValue = false;
                var lastValue, lastError;
                var stream = Kefir.stream(function (EMITTER) {
                    emitter = EMITTER;
                    if (setLastValue) {
                        emitter.value(lastValue);
                    }
                    return function () {
                        emitter = undefined;
                    };
                });
                var property = stream.toProperty(function () {
                    return lastValue;
                });
                property.emitter = {
                    value: function (newValue) {
                        if (emitter) {
                            return emitter.emit(newValue);
                        } else {
                            setLastValue = true;
                            lastValue = newValue;
                        }
                    },
                    error: function (error) {
                        if (emitter) {
                            return emitter.error(error);
                        } else {
                            lastError = error;
                        }
                    }
                };
                property.emitter.emit = property.emitter.value;
                canReflect.assignSymbols(property, {
                    'can.setKeyValue': function setKeyValue(key, value) {
                        this.emitter[key](value);
                    },
                    'can.hasKey': function hasKey(key) {
                        return key in this.emitter;
                    }
                });
                return property;
            };
        }
        module.exports = Kefir;
    }(function () {
        return this;
    }(), require, exports, module));
});