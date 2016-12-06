/*!
 * CanJS - 2.3.22
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 31 Mar 2016 17:02:19 GMT
 * Licensed MIT
 */

/*can@2.3.22#view/stache/utils*/
var can = require('../../util/util.js');
require('../scope/scope.js');
var Options = can.view.Options;
module.exports = {
    isArrayLike: function (obj) {
        return obj && obj.splice && typeof obj.length === 'number';
    },
    isObserveLike: function (obj) {
        return obj instanceof can.Map || obj && !!obj._get;
    },
    emptyHandler: function () {
    },
    jsonParse: function (str) {
        if (str[0] === '\'') {
            return str.substr(1, str.length - 2);
        } else if (str === 'undefined') {
            return undefined;
        } else if (can.global.JSON) {
            return JSON.parse(str);
        } else {
            return eval('(' + str + ')');
        }
    },
    mixins: {
        last: function () {
            return this.stack[this.stack.length - 1];
        },
        add: function (chars) {
            this.last().add(chars);
        },
        subSectionDepth: function () {
            return this.stack.length - 1;
        }
    },
    convertToScopes: function (helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer) {
        if (truthyRenderer) {
            helperOptions.fn = this.makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
        }
        if (falseyRenderer) {
            helperOptions.inverse = this.makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
        }
    },
    makeRendererConvertScopes: function (renderer, parentScope, parentOptions, nodeList) {
        var rendererWithScope = function (ctx, opts, parentNodeList) {
            return renderer(ctx || parentScope, opts, parentNodeList);
        };
        return can.__notObserve(function (newScope, newOptions, parentNodeList) {
            if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
                newScope = parentScope.add(newScope);
            }
            if (newOptions !== undefined && !(newOptions instanceof Options)) {
                newOptions = parentOptions.add(newOptions);
            }
            var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList || nodeList);
            return result;
        });
    },
    Options: Options
};