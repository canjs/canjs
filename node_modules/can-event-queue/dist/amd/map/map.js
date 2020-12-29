/*can-event-queue@1.1.7#map/map*/
define([
    'require',
    'exports',
    'module',
    'can-log/dev',
    'can-queues',
    'can-reflect',
    'can-symbol',
    'can-key-tree',
    'can-dom-events',
    'can-dom-events/helpers/util',
    '../dependency-record/merge'
], function (require, exports, module) {
    'use strict';
    var canDev = require('can-log/dev');
    var queues = require('can-queues');
    var canReflect = require('can-reflect');
    var canSymbol = require('can-symbol');
    var KeyTree = require('can-key-tree');
    var domEvents = require('can-dom-events');
    var isDomEventTarget = require('can-dom-events/helpers/util').isDomEventTarget;
    var mergeDependencyRecords = require('../dependency-record/merge');
    var metaSymbol = canSymbol.for('can.meta'), dispatchBoundChangeSymbol = canSymbol.for('can.dispatchInstanceBoundChange'), dispatchInstanceOnPatchesSymbol = canSymbol.for('can.dispatchInstanceOnPatches'), onKeyValueSymbol = canSymbol.for('can.onKeyValue'), offKeyValueSymbol = canSymbol.for('can.offKeyValue'), onEventSymbol = canSymbol.for('can.onEvent'), offEventSymbol = canSymbol.for('can.offEvent'), onValueSymbol = canSymbol.for('can.onValue'), offValueSymbol = canSymbol.for('can.offValue'), inSetupSymbol = canSymbol.for('can.initializing');
    var legacyMapBindings;
    function addHandlers(obj, meta) {
        if (!meta.handlers) {
            meta.handlers = new KeyTree([
                Object,
                Object,
                Object,
                Array
            ], {
                onFirst: function () {
                    if (obj._eventSetup !== undefined) {
                        obj._eventSetup();
                    }
                    var constructor = obj.constructor;
                    if (constructor[dispatchBoundChangeSymbol] !== undefined && obj instanceof constructor) {
                        constructor[dispatchBoundChangeSymbol](obj, true);
                    }
                },
                onEmpty: function () {
                    if (obj._eventTeardown !== undefined) {
                        obj._eventTeardown();
                    }
                    var constructor = obj.constructor;
                    if (constructor[dispatchBoundChangeSymbol] !== undefined && obj instanceof constructor) {
                        constructor[dispatchBoundChangeSymbol](obj, false);
                    }
                }
            });
        }
        if (!meta.listenHandlers) {
            meta.listenHandlers = new KeyTree([
                Map,
                Map,
                Object,
                Array
            ]);
        }
    }
    var ensureMeta = function ensureMeta(obj) {
        var meta = obj[metaSymbol];
        if (!meta) {
            meta = {};
            canReflect.setKeyValue(obj, metaSymbol, meta);
        }
        addHandlers(obj, meta);
        return meta;
    };
    function stopListeningArgumentsToKeys(bindTarget, event, handler, queueName) {
        if (arguments.length && canReflect.isPrimitive(bindTarget)) {
            queueName = handler;
            handler = event;
            event = bindTarget;
            bindTarget = this.context;
        }
        if (typeof event === 'function') {
            queueName = handler;
            handler = event;
            event = undefined;
        }
        if (typeof handler === 'string') {
            queueName = handler;
            handler = undefined;
        }
        var keys = [];
        if (bindTarget) {
            keys.push(bindTarget);
            if (event || handler || queueName) {
                keys.push(event);
                if (queueName || handler) {
                    keys.push(queueName || this.defaultQueue);
                    if (handler) {
                        keys.push(handler);
                    }
                }
            }
        }
        return keys;
    }
    var props = {
        dispatch: function (event, args) {
            if (this.__inSetup !== true && this[inSetupSymbol] !== true) {
                if (typeof event === 'string') {
                    event = { type: event };
                }
                var meta = ensureMeta(this);
                var handlers = meta.handlers;
                var handlersByType = event.type !== undefined && handlers.getNode([event.type]);
                var dispatchConstructorPatches = event.patches && this.constructor[dispatchInstanceOnPatchesSymbol];
                var patchesNode = event.patches !== undefined && handlers.getNode([
                    'can.patches',
                    'onKeyValue'
                ]);
                var keysNode = event.keyChanged !== undefined && handlers.getNode([
                    'can.keys',
                    'onKeyValue'
                ]);
                var batch = dispatchConstructorPatches || handlersByType || patchesNode || keysNode;
                if (batch) {
                    queues.batch.start();
                }
                if (handlersByType) {
                    if (handlersByType.onKeyValue) {
                        queues.enqueueByQueue(handlersByType.onKeyValue, this, args, event.makeMeta, event.reasonLog);
                    }
                    if (handlersByType.event) {
                        event.batchNum = queues.batch.number();
                        var eventAndArgs = [event].concat(args);
                        queues.enqueueByQueue(handlersByType.event, this, eventAndArgs, event.makeMeta, event.reasonLog);
                    }
                }
                if (keysNode) {
                    queues.enqueueByQueue(keysNode, this, [event.keyChanged], event.makeMeta, event.reasonLog);
                }
                if (patchesNode) {
                    queues.enqueueByQueue(patchesNode, this, [event.patches], event.makeMeta, event.reasonLog);
                }
                if (dispatchConstructorPatches) {
                    this.constructor[dispatchInstanceOnPatchesSymbol](this, event.patches);
                }
                if (batch) {
                    queues.batch.stop();
                }
            }
            return event;
        },
        addEventListener: function (key, handler, queueName) {
            ensureMeta(this).handlers.add([
                key,
                'event',
                queueName || 'mutate',
                handler
            ]);
            return this;
        },
        removeEventListener: function (key, handler, queueName) {
            if (key === undefined) {
                var handlers = ensureMeta(this).handlers;
                var keyHandlers = handlers.getNode([]);
                Object.keys(keyHandlers).forEach(function (key) {
                    handlers.delete([
                        key,
                        'event'
                    ]);
                });
            } else if (!handler && !queueName) {
                ensureMeta(this).handlers.delete([
                    key,
                    'event'
                ]);
            } else if (!handler) {
                ensureMeta(this).handlers.delete([
                    key,
                    'event',
                    queueName || 'mutate'
                ]);
            } else {
                ensureMeta(this).handlers.delete([
                    key,
                    'event',
                    queueName || 'mutate',
                    handler
                ]);
            }
            return this;
        },
        one: function (event, handler) {
            var one = function () {
                legacyMapBindings.off.call(this, event, one);
                return handler.apply(this, arguments);
            };
            legacyMapBindings.on.call(this, event, one);
            return this;
        },
        listenTo: function (bindTarget, event, handler, queueName) {
            if (canReflect.isPrimitive(bindTarget)) {
                queueName = handler;
                handler = event;
                event = bindTarget;
                bindTarget = this;
            }
            if (typeof event === 'function') {
                queueName = handler;
                handler = event;
                event = undefined;
            }
            ensureMeta(this).listenHandlers.add([
                bindTarget,
                event,
                queueName || 'mutate',
                handler
            ]);
            legacyMapBindings.on.call(bindTarget, event, handler, queueName || 'mutate');
            return this;
        },
        stopListening: function () {
            var keys = stopListeningArgumentsToKeys.apply({
                context: this,
                defaultQueue: 'mutate'
            }, arguments);
            var listenHandlers = ensureMeta(this).listenHandlers;
            function deleteHandler(bindTarget, event, queue, handler) {
                legacyMapBindings.off.call(bindTarget, event, handler, queue);
            }
            listenHandlers.delete(keys, deleteHandler);
            return this;
        },
        on: function (eventName, handler, queue) {
            var listenWithDOM = isDomEventTarget(this);
            if (listenWithDOM) {
                if (typeof handler === 'string') {
                    domEvents.addDelegateListener(this, eventName, handler, queue);
                } else {
                    domEvents.addEventListener(this, eventName, handler, queue);
                }
            } else {
                if (this[onEventSymbol]) {
                    this[onEventSymbol](eventName, handler, queue);
                } else if ('addEventListener' in this) {
                    this.addEventListener(eventName, handler, queue);
                } else if (this[onKeyValueSymbol]) {
                    canReflect.onKeyValue(this, eventName, handler, queue);
                } else {
                    if (!eventName && this[onValueSymbol]) {
                        canReflect.onValue(this, handler, queue);
                    } else {
                        throw new Error('can-event-queue: Unable to bind ' + eventName);
                    }
                }
            }
            return this;
        },
        off: function (eventName, handler, queue) {
            var listenWithDOM = isDomEventTarget(this);
            if (listenWithDOM) {
                if (typeof handler === 'string') {
                    domEvents.removeDelegateListener(this, eventName, handler, queue);
                } else {
                    domEvents.removeEventListener(this, eventName, handler, queue);
                }
            } else {
                if (this[offEventSymbol]) {
                    this[offEventSymbol](eventName, handler, queue);
                } else if ('removeEventListener' in this) {
                    this.removeEventListener(eventName, handler, queue);
                } else if (this[offKeyValueSymbol]) {
                    canReflect.offKeyValue(this, eventName, handler, queue);
                } else {
                    if (!eventName && this[offValueSymbol]) {
                        canReflect.offValue(this, handler, queue);
                    } else {
                        throw new Error('can-event-queue: Unable to unbind ' + eventName);
                    }
                }
            }
            return this;
        }
    };
    var symbols = {
        'can.onKeyValue': function (key, handler, queueName) {
            ensureMeta(this).handlers.add([
                key,
                'onKeyValue',
                queueName || 'mutate',
                handler
            ]);
        },
        'can.offKeyValue': function (key, handler, queueName) {
            ensureMeta(this).handlers.delete([
                key,
                'onKeyValue',
                queueName || 'mutate',
                handler
            ]);
        },
        'can.isBound': function () {
            return !ensureMeta(this).handlers.isEmpty();
        },
        'can.getWhatIChange': function getWhatIChange(key) {
        },
        'can.onPatches': function (handler, queue) {
            var handlers = ensureMeta(this).handlers;
            handlers.add([
                'can.patches',
                'onKeyValue',
                queue || 'notify',
                handler
            ]);
        },
        'can.offPatches': function (handler, queue) {
            var handlers = ensureMeta(this).handlers;
            handlers.delete([
                'can.patches',
                'onKeyValue',
                queue || 'notify',
                handler
            ]);
        }
    };
    function defineNonEnumerable(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            enumerable: false,
            value: value
        });
    }
    legacyMapBindings = function (obj) {
        canReflect.assignMap(obj, props);
        return canReflect.assignSymbols(obj, symbols);
    };
    defineNonEnumerable(legacyMapBindings, 'addHandlers', addHandlers);
    defineNonEnumerable(legacyMapBindings, 'stopListeningArgumentsToKeys', stopListeningArgumentsToKeys);
    props.bind = props.addEventListener;
    props.unbind = props.removeEventListener;
    canReflect.assignMap(legacyMapBindings, props);
    canReflect.assignSymbols(legacyMapBindings, symbols);
    defineNonEnumerable(legacyMapBindings, 'start', function () {
        console.warn('use can-queues.batch.start()');
        queues.batch.start();
    });
    defineNonEnumerable(legacyMapBindings, 'stop', function () {
        console.warn('use can-queues.batch.stop()');
        queues.batch.stop();
    });
    defineNonEnumerable(legacyMapBindings, 'flush', function () {
        console.warn('use can-queues.flush()');
        queues.flush();
    });
    defineNonEnumerable(legacyMapBindings, 'afterPreviousEvents', function (handler) {
        console.warn('don\'t use afterPreviousEvents');
        queues.mutateQueue.enqueue(function afterPreviousEvents() {
            queues.mutateQueue.enqueue(handler);
        });
        queues.flush();
    });
    defineNonEnumerable(legacyMapBindings, 'after', function (handler) {
        console.warn('don\'t use after');
        queues.mutateQueue.enqueue(handler);
        queues.flush();
    });
    module.exports = legacyMapBindings;
});