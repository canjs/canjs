/*funcunit@3.6.3#browser/queue*/
define('funcunit/browser/queue', [
    'require',
    'exports',
    'module',
    'funcunit/browser/core'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        var FuncUnit = require('funcunit/browser/core');
        FuncUnit._incallback = false;
        var currentPosition = 0, startedQueue = false;
        FuncUnit.speed = 0;
        FuncUnit.timeout = 10000;
        FuncUnit._queue = [];
        FuncUnit._needSyncQuery = function () {
            if (FuncUnit._queue.length === 1) {
                if (FuncUnit._queue[0].type === 'query') {
                    FuncUnit._queue = [];
                    return true;
                }
            }
            if (FuncUnit._queue.length === 0) {
                return true;
            }
            return false;
        };
        FuncUnit._lastQueuedItem = function () {
            if (!FuncUnit._queue.length) {
                return null;
            }
            return FuncUnit._queue[FuncUnit._queue.length - 1];
        };
        FuncUnit._haveAsyncQueries = function () {
            for (var i = 0; i < FuncUnit._queue.length; i++) {
                if (FuncUnit._queue[i].type === 'action' || FuncUnit._queue[i].type === 'wait')
                    return true;
            }
            return false;
        };
        FuncUnit.add = function (handler, error, context) {
            if (handler instanceof Function) {
                if (typeof error === 'object') {
                    context = error;
                    delete error;
                }
                error = error && error.toString() || 'Custom method has failed.';
                var cb = handler;
                handler = {
                    method: function (success, error) {
                        success();
                    },
                    success: cb,
                    error: error,
                    bind: context
                };
            }
            if (FuncUnit._incallback) {
                FuncUnit._queue.splice(currentPosition, 0, handler);
                currentPosition++;
            } else {
                FuncUnit._queue.push(handler);
            }
            if (FuncUnit._queue.length == 1 && !FuncUnit._incallback) {
                FuncUnit.unit.pauseTest();
                setTimeout(FuncUnit._done, 13);
            }
        };
        var currentEl;
        FuncUnit._done = function (el, selector) {
            var next, timer, speed = FuncUnit.speed || 0;
            if (FuncUnit.speed === 'slow') {
                speed = 500;
            }
            if (FuncUnit._queue.length > 0) {
                next = FuncUnit._queue.shift();
                currentPosition = 0;
                setTimeout(function () {
                    timer = setTimeout(function () {
                        next.stop && next.stop();
                        if (typeof next.error === 'function') {
                            next.error();
                        } else {
                            FuncUnit.unit.assertOK(false, next.error);
                        }
                        FuncUnit._done();
                    }, (next.timeout || FuncUnit.timeout) + speed);
                    if (el && el.jquery) {
                        currentEl = el;
                    }
                    if (currentEl) {
                        next.bind = currentEl;
                    }
                    next.selector = selector;
                    next.method(function (el) {
                        if (el && el.jquery) {
                            next.bind = el;
                        }
                        clearTimeout(timer);
                        FuncUnit._incallback = true;
                        if (next.success) {
                            next.success.apply(next.bind, arguments);
                        }
                        FuncUnit._incallback = false;
                        FuncUnit._done(next.bind, next.selector);
                    }, function (message) {
                        clearTimeout(timer);
                        FuncUnit.unit.assertOK(false, message);
                        FuncUnit._done();
                    });
                }, speed);
            } else {
                FuncUnit.unit.resumeTest();
            }
        };
        module.exports = FuncUnit;
    }(function () {
        return this;
    }(), require, exports, module));
});