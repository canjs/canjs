/*funcunit@3.6.3#browser/actions*/
define('funcunit/browser/actions', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core',
    'syn/syn'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    var syn = window.syn = require('syn/syn');
    var clicks = [
            'click',
            'dblclick',
            'rightClick'
        ], makeClick = function (name) {
            FuncUnit.prototype[name] = function (options, success) {
                this._addExists();
                if (typeof options == 'function') {
                    success = options;
                    options = {};
                }
                var selector = this.selector;
                FuncUnit.add({
                    method: function (success, error) {
                        options = options || {};
                        syn('_' + name, this.bind[0], options, success);
                    },
                    success: success,
                    error: 'Could not ' + name + ' \'' + this.selector + '\'',
                    bind: this,
                    type: 'action'
                });
                return this;
            };
        };
    for (var i = 0; i < clicks.length; i++) {
        makeClick(clicks[i]);
    }
    $.extend(FuncUnit.prototype, {
        _addExists: function () {
            this.exists(false);
        },
        type: function (text, success) {
            this._addExists();
            this.click();
            var selector = this.selector;
            if (text === '') {
                text = '[ctrl]a[ctrl-up]\b';
            }
            FuncUnit.add({
                method: function (success, error) {
                    syn('_type', this.bind[0], text, success);
                },
                success: success,
                error: 'Could not type ' + text + ' into ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        sendKeys: function (keys, success) {
            this._addExists();
            var selector = this.selector;
            if (keys === '') {
                keys = '[ctrl]a[ctrl-up]\b';
            }
            FuncUnit.add({
                method: function (success, error) {
                    syn('_type', this.bind[0], keys, success);
                },
                success: success,
                error: 'Could not send the keys ' + keys + ' into ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        trigger: function (evName, success) {
            this._addExists();
            FuncUnit.add({
                method: function (success, error) {
                    if (!FuncUnit.win.jQuery) {
                        throw 'Can not trigger custom event, no jQuery found on target page.';
                    }
                    FuncUnit.win.jQuery(this.bind.selector).trigger(evName);
                    success();
                },
                success: success,
                error: 'Could not trigger ' + evName,
                bind: this,
                type: 'action'
            });
            return this;
        },
        drag: function (options, success) {
            this._addExists();
            if (typeof options == 'string') {
                options = { to: options };
            }
            options.from = this.selector;
            var selector = this.selector;
            FuncUnit.add({
                method: function (success, error) {
                    syn('_drag', this.bind[0], options, success);
                },
                success: success,
                error: 'Could not drag ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        move: function (options, success) {
            this._addExists();
            if (typeof options == 'string') {
                options = { to: options };
            }
            options.from = this.selector;
            var selector = this.selector;
            FuncUnit.add({
                method: function (success, error) {
                    syn('_move', this.bind[0], options, success);
                },
                success: success,
                error: 'Could not move ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        },
        scroll: function (direction, amount, success) {
            this._addExists();
            var selector = this.selector, direction;
            if (direction == 'left' || direction == 'right') {
                direction = 'Left';
            } else if (direction == 'top' || direction == 'bottom') {
                direction = 'Top';
            }
            FuncUnit.add({
                method: function (success, error) {
                    this.bind.each(function (i, el) {
                        this['scroll' + direction] = amount;
                    });
                    success();
                },
                success: success,
                error: 'Could not scroll ' + this.selector,
                bind: this,
                type: 'action'
            });
            return this;
        }
    });
    module.exports = FuncUnit;
});