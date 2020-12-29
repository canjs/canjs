/*!
 * CanJS - 2.3.7
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 16 Dec 2015 03:10:33 GMT
 * Licensed MIT
 */

/*can@2.3.7#view/stache/mustache_helpers*/
var can = require('../../util/util.js');
var utils = require('./utils.js');
var live = require('../live/live.js');
live = live || can.view.live;
var resolve = function (value) {
    if (utils.isObserveLike(value) && utils.isArrayLike(value) && value.attr('length')) {
        return value;
    } else if (can.isFunction(value)) {
        return value();
    } else {
        return value;
    }
};
var resolveHash = function (hash) {
    var params = {};
    for (var prop in hash) {
        var value = hash[prop];
        if (value && value.isComputed) {
            params[prop] = value();
        } else {
            params[prop] = value;
        }
    }
    return params;
};
var looksLikeOptions = function (options) {
    return options && typeof options.fn === 'function' && typeof options.inverse === 'function';
};
var helpers = {
        'each': function (items, options) {
            var resolved = resolve(items), result = [], keys, key, i;
            if (resolved instanceof can.List) {
                return function (el) {
                    var nodeList = [el];
                    nodeList.expression = 'live.list';
                    can.view.nodeLists.register(nodeList, null, options.nodeList, true);
                    can.view.nodeLists.update(options.nodeList, [el]);
                    var cb = function (item, index, parentNodeList) {
                        return options.fn(options.scope.add({
                            '%index': index,
                            '@index': index
                        }, { notContext: true }).add(item), options.options, parentNodeList);
                    };
                    live.list(el, items, cb, options.context, el.parentNode, nodeList, function (list, parentNodeList) {
                        return options.inverse(options.scope.add(list), options.options, parentNodeList);
                    });
                };
            }
            var expr = resolved;
            if (!!expr && utils.isArrayLike(expr)) {
                for (i = 0; i < expr.length; i++) {
                    result.push(options.fn(options.scope.add({
                        '%index': i,
                        '@index': i
                    }, { notContext: true }).add(expr[i])));
                }
            } else if (utils.isObserveLike(expr)) {
                keys = can.Map.keys(expr);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    result.push(options.fn(options.scope.add({
                        '%key': key,
                        '@key': key
                    }, { notContext: true }).add(expr[key])));
                }
            } else if (expr instanceof Object) {
                for (key in expr) {
                    result.push(options.fn(options.scope.add({
                        '%key': key,
                        '@key': key
                    }, { notContext: true }).add(expr[key])));
                }
            }
            return result;
        },
        '@index': function (offset, options) {
            if (!options) {
                options = offset;
                offset = 0;
            }
            var index = options.scope.attr('@index');
            return '' + ((can.isFunction(index) ? index() : index) + offset);
        },
        'if': function (expr, options) {
            var value;
            if (can.isFunction(expr)) {
                value = can.compute.truthy(expr)();
            } else {
                value = !!resolve(expr);
            }
            if (value) {
                return options.fn(options.scope || this);
            } else {
                return options.inverse(options.scope || this);
            }
        },
        'is': function () {
            var lastValue, curValue, options = arguments[arguments.length - 1];
            if (arguments.length - 2 <= 0) {
                return options.inverse();
            }
            var args = arguments;
            var callFn = can.compute(function () {
                    for (var i = 0; i < args.length - 1; i++) {
                        curValue = resolve(args[i]);
                        curValue = can.isFunction(curValue) ? curValue() : curValue;
                        if (i > 0) {
                            if (curValue !== lastValue) {
                                return false;
                            }
                        }
                        lastValue = curValue;
                    }
                    return true;
                });
            return callFn() ? options.fn() : options.inverse();
        },
        'eq': function () {
            return helpers.is.apply(this, arguments);
        },
        'unless': function (expr, options) {
            return helpers['if'].apply(this, [
                expr,
                can.extend({}, options, {
                    fn: options.inverse,
                    inverse: options.fn
                })
            ]);
        },
        'with': function (expr, options) {
            var ctx = expr;
            expr = resolve(expr);
            if (!!expr) {
                return options.fn(ctx);
            }
        },
        'log': function (expr, options) {
            if (typeof console !== 'undefined' && console.log) {
                if (!options) {
                    console.log(expr.context);
                } else {
                    console.log(expr, options.context);
                }
            }
        },
        'data': function (attr) {
            var data = arguments.length === 2 ? this : arguments[1];
            return function (el) {
                can.data(can.$(el), attr, data || this.context);
            };
        },
        'switch': function (expression, options) {
            resolve(expression);
            var found = false;
            var newOptions = options.helpers.add({
                    'case': function (value, options) {
                        if (!found && resolve(expression) === resolve(value)) {
                            found = true;
                            return options.fn(options.scope || this);
                        }
                    },
                    'default': function (options) {
                        if (!found) {
                            return options.fn(options.scope || this);
                        }
                    }
                });
            return options.fn(options.scope, newOptions);
        },
        'joinBase': function (firstExpr) {
            var args = [].slice.call(arguments);
            var options = args.pop();
            var moduleReference = can.map(args, function (expr) {
                    var value = resolve(expr);
                    return can.isFunction(value) ? value() : value;
                }).join('');
            var templateModule = options.helpers.attr('helpers.module');
            var parentAddress = templateModule ? templateModule.uri : undefined;
            var isRelative = moduleReference[0] === '.';
            if (isRelative && parentAddress) {
                return can.joinURIs(parentAddress, moduleReference);
            } else {
                var baseURL = can.baseURL || typeof System !== 'undefined' && (System.renderingLoader && System.renderingLoader.baseURL || System.baseURL) || location.pathname;
                if (moduleReference[0] !== '/' && baseURL[baseURL.length - 1] !== '/') {
                    baseURL += '/';
                }
                return can.joinURIs(baseURL, moduleReference);
            }
        },
        routeUrl: function (params, merge) {
            if (!params) {
                params = {};
            }
            if (typeof params.fn === 'function' && typeof params.inverse === 'function') {
                params = resolveHash(params.hash);
            }
            return can.route.url(params, typeof merge === 'boolean' ? merge : undefined);
        },
        routeCurrent: function (params) {
            var last = can.last(arguments), isOptions = last && looksLikeOptions(last);
            if (last && isOptions && !(last.exprData instanceof can.expression.Call)) {
                if (can.route.current(resolveHash(params.hash || {}))) {
                    return params.fn();
                } else {
                    return params.inverse();
                }
            } else {
                return can.route.current(looksLikeOptions(params) ? {} : params || {});
            }
        }
    };
helpers.routeCurrent.callAsMethod = true;
helpers.eachOf = helpers.each;
var registerHelper = function (name, callback) {
    helpers[name] = callback;
};
module.exports = {
    registerHelper: registerHelper,
    registerSimpleHelper: function (name, callback) {
        registerHelper(name, can.view.simpleHelper(callback));
    },
    getHelper: function (name, options) {
        var helper = options && options.get('helpers.' + name, { proxyMethods: false });
        if (!helper) {
            helper = helpers[name];
        }
        if (helper) {
            return { fn: helper };
        }
    }
};