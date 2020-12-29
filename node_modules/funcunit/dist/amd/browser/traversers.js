/*funcunit@3.6.3#browser/traversers*/
define('funcunit/browser/traversers', [
    'require',
    'exports',
    'module',
    'funcunit/browser/jquery',
    'funcunit/browser/core'
], function (require, exports, module) {
    var $ = require('funcunit/browser/jquery');
    var FuncUnit = require('funcunit/browser/core');
    var traversers = [
            'closest',
            'next',
            'prev',
            'siblings',
            'last',
            'first',
            'find'
        ], makeTraverser = function (name) {
            var orig = FuncUnit.prototype[name];
            FuncUnit.prototype[name] = function (selector) {
                var args = arguments;
                if (FuncUnit.win && this[0] && this[0].parentNode && this[0].parentNode.nodeType !== 9) {
                    FuncUnit.add({
                        method: function (success, error) {
                            var newBind = orig.apply(this.bind, args);
                            newBind.prevTraverser = name;
                            newBind.prevTraverserSelector = selector;
                            success(newBind);
                        },
                        error: 'Could not traverse: ' + name + ' ' + selector,
                        bind: this
                    });
                }
                return orig.apply(this, arguments);
            };
        };
    for (var i = 0; i < traversers.length; i++) {
        makeTraverser(traversers[i]);
    }
    module.exports = FuncUnit;
});