/*funcunit@3.6.3#browser/waits*/
define('funcunit/browser/waits', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    FuncUnit.wait = function (time, success) {
        if (typeof time == 'function') {
            success = time;
            time = undefined;
        }
        time = time != null ? time : 5000;
        FuncUnit.add({
            method: function (success, error) {
                setTimeout(success, time);
            },
            success: success,
            error: 'Couldn\'t wait!',
            timeout: time + 1000
        });
        return this;
    };
    FuncUnit.branch = function (check1, success1, check2, success2, timeout) {
        FuncUnit.repeat({
            method: function (print) {
                print('Running a branch statement');
                if (check1()) {
                    success1();
                    return true;
                }
                if (check2()) {
                    success2();
                    return true;
                }
            },
            error: 'no branch condition was ever true',
            timeout: timeout,
            type: 'branch'
        });
    };
    FuncUnit.repeat = function (options) {
        var interval, stopped = false, stop = function () {
                clearTimeout(interval);
                stopped = true;
            };
        FuncUnit.add({
            method: function (success, error) {
                options.bind = this.bind;
                options.selector = this.selector;
                var printed = false, print = function (msg) {
                        if (!printed) {
                            printed = true;
                        }
                    };
                interval = setTimeout(function () {
                    var result = null;
                    try {
                        result = options.method(print);
                    } catch (e) {
                    }
                    if (result) {
                        success(options.bind);
                    } else if (!stopped) {
                        interval = setTimeout(arguments.callee, 10);
                    }
                }, 10);
            },
            success: options.success,
            error: options.error,
            timeout: options.timeout,
            stop: stop,
            bind: options.bind,
            type: options.type
        });
    };
    FuncUnit.animationEnd = function () {
        F('body').wait(200).size(function () {
            return F.win.$(':animated').length === 0;
        });
    };
    FuncUnit.animationsDone = FuncUnit.animationEnd;
    $.extend(FuncUnit.prototype, {
        exists: function (timeout, success, message) {
            var logMessage = 'Waiting for \'' + this.selector + '\' to exist';
            if (timeout === false) {
                logMessage = false;
            }
            return this.size({
                condition: function (size) {
                    return size > 0;
                },
                timeout: timeout,
                success: success,
                message: message,
                errorMessage: 'Exist failed: element with selector \'' + this.selector + '\' not found',
                logMessage: logMessage
            });
        },
        missing: function (timeout, success, message) {
            return this.size(0, timeout, success, message);
        },
        visible: function (timeout, success, message) {
            var self = this, sel = this.selector, ret;
            return this.size(function (size) {
                return this.is(':visible') === true;
            }, timeout, success, message);
        },
        invisible: function (timeout, success, message) {
            var self = this, sel = this.selector, ret;
            return this.size(function (size) {
                return this.is(':visible') === false;
            }, timeout, success, message);
        },
        wait: function (checker, timeout, success, message) {
            if (typeof checker === 'number') {
                timeout = checker;
                FuncUnit.wait(timeout, success);
                return this;
            } else {
                return this.size(checker, timeout, success, message);
            }
        },
        then: function (success) {
            var self = this;
            FuncUnit.wait(0, function () {
                success.call(this, this);
            });
            return this;
        }
    });
    module.exports = FuncUnit;
});