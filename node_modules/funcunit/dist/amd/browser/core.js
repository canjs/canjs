/*funcunit@3.6.3#browser/core*/
define('funcunit/browser/core', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/init'
], function (require, exports, module) {
    var jQuery = require('funcunit/browser/jquery');
    var oldFuncUnit = require('funcunit/browser/init');
    var FuncUnit = oldFuncUnit.jQuery.sub();
    var origFuncUnit = FuncUnit;
    FuncUnit = function (selector, frame) {
        var frame, forceSync, isSyncOnly = false;
        if (frame && frame.forceSync) {
            forceSync = frame.forceSync;
        }
        if (frame && typeof frame.frame !== 'undefined') {
            frame = frame.frame;
        }
        isSyncOnly = typeof forceSync === 'boolean' ? forceSync : isSyncOnly;
        if (typeof selector == 'function') {
            return FuncUnit.wait(0, selector);
        }
        this.selector = selector;
        if (isSyncOnly === true) {
            var collection = performSyncQuery(selector, frame);
            return collection;
        } else {
            performAsyncQuery(selector, frame, this);
            var collection = performSyncQuery(selector, frame);
            return collection;
        }
    };
    var getContext = function (context) {
            if (typeof context === 'number' || typeof context === 'string') {
                var sel = typeof context === 'number' ? 'iframe:eq(' + context + ')' : 'iframe[name=\'' + context + '\']', frames = new origFuncUnit.fn.init(sel, FuncUnit.win.document.documentElement, true);
                var frame = (frames.length ? frames.get(0).contentWindow : FuncUnit.win).document.documentElement;
            } else {
                frame = FuncUnit.win.document.documentElement;
            }
            return frame;
        }, performAsyncQuery = function (selector, frame, self) {
            FuncUnit.add({
                method: function (success, error) {
                    this.frame = frame;
                    if (FuncUnit.win) {
                        frame = getContext(frame);
                    }
                    this.selector = selector;
                    this.bind = new origFuncUnit.fn.init(selector, frame, true);
                    success();
                    return this;
                },
                error: 'selector failed: ' + selector,
                type: 'query'
            });
        }, performSyncQuery = function (selector, frame) {
            var origFrame = frame;
            if (FuncUnit.win) {
                frame = getContext(frame);
            }
            var obj = new origFuncUnit.fn.init(selector, frame, true);
            obj.frame = origFrame;
            return obj;
        };
    oldFuncUnit.jQuery.extend(FuncUnit, oldFuncUnit, origFuncUnit);
    FuncUnit.prototype = origFuncUnit.prototype;
    module.exports = FuncUnit;
});