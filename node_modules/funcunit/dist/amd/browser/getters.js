/*funcunit@3.6.3#browser/getters*/
define('funcunit/browser/getters', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    FuncUnit.funcs = {
        'size': 0,
        'attr': 1,
        'hasClass': 1,
        'html': 0,
        'text': 0,
        'val': 0,
        'css': 1,
        'prop': 1,
        'offset': 0,
        'position': 0,
        'scrollTop': 0,
        'scrollLeft': 0,
        'height': 0,
        'width': 0,
        'innerHeight': 0,
        'innerWidth': 0,
        'outerHeight': 0,
        'outerWidth': 0
    };
    FuncUnit.makeFunc = function (fname, argIndex) {
        var orig = FuncUnit.fn[fname];
        FuncUnit.prototype[fname] = function () {
            var args = FuncUnit.makeArray(arguments), isWait = args.length > argIndex, success, self = this;
            args.unshift(this.selector, this.frame, fname);
            if (isWait) {
                var tester = args[argIndex + 3], timeout = args[argIndex + 4], success = args[argIndex + 5], message = args[argIndex + 6], testVal = tester, errorMessage = 'waiting for ' + fname + ' on ' + this.selector, frame = this.frame, logMessage = 'Checking ' + fname + ' on \'' + this.selector + '\'', ret;
                if (typeof tester == 'object' && !(tester instanceof RegExp)) {
                    timeout = tester.timeout;
                    success = tester.success;
                    message = tester.message;
                    if (tester.errorMessage) {
                        errorMessage = tester.errorMessage;
                    }
                    if (typeof tester.logMessage !== 'undefined') {
                        logMessage = tester.logMessage;
                    }
                    tester = tester.condition;
                }
                if (typeof timeout == 'function') {
                    message = success;
                    success = timeout;
                    timeout = undefined;
                }
                if (typeof timeout == 'string') {
                    message = timeout;
                    timeout = undefined;
                    success = undefined;
                }
                if (typeof message !== 'string') {
                    message = undefined;
                }
                args.splice(argIndex + 3, args.length - argIndex - 3);
                if (typeof tester != 'function') {
                    errorMessage += ' !== ' + testVal;
                    tester = function (val) {
                        return FuncUnit.unit.equiv(val, testVal) || testVal instanceof RegExp && testVal.test(val);
                    };
                }
                if (message) {
                    errorMessage = message;
                }
                FuncUnit.repeat({
                    method: function (print) {
                        if (this.bind.prevObject && this.bind.prevTraverser) {
                            var prev = this.bind;
                            this.bind = this.bind.prevObject[this.bind.prevTraverser](this.bind.prevTraverserSelector);
                            this.bind.prevTraverser = prev.prevTraverser;
                            this.bind.prevTraverserSelector = prev.prevTraverserSelector;
                        } else {
                            this.bind = F(this.selector, {
                                frame: frame,
                                forceSync: true
                            });
                        }
                        if (logMessage) {
                            print(logMessage);
                        }
                        var methodArgs = [];
                        if (argIndex > 0) {
                            methodArgs.push(args[3]);
                        }
                        FuncUnit._ignoreGetterError = true;
                        ret = this.bind[fname].apply(this.bind, methodArgs);
                        FuncUnit._ignoreGetterError = false;
                        var passed = tester.call(this.bind, ret);
                        if (this.bind.length === 0 && fname !== 'size') {
                            passed = false;
                        }
                        if (passed) {
                            if (!FuncUnit.documentLoaded()) {
                                passed = false;
                            } else {
                                FuncUnit.checkForNewDocument();
                            }
                        }
                        return passed;
                    },
                    success: function () {
                        if (message) {
                            FuncUnit.unit.assertOK(true, message);
                        }
                        success && success.apply(this, arguments);
                    },
                    error: function () {
                        var msg = errorMessage;
                        if (ret) {
                            msg += ', actual value: ' + ret;
                        }
                        FuncUnit.unit.assertOK(false, msg);
                    },
                    timeout: timeout,
                    bind: this,
                    type: 'wait'
                });
                return this;
            } else {
                if (!FuncUnit._ignoreGetterError && !FuncUnit._incallback && FuncUnit._haveAsyncQueries()) {
                    console && console.error('You can\'t run getters after actions and waits. Please put your getters in a callback or at the beginning of the test.');
                }
                var methodArgs = [];
                if (argIndex > 0) {
                    methodArgs.push(args[3]);
                }
                return orig.apply(this, methodArgs);
            }
        };
    };
    for (var prop in FuncUnit.funcs) {
        FuncUnit.makeFunc(prop, FuncUnit.funcs[prop]);
    }
    module.exports = FuncUnit;
});