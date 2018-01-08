/*object-assign@4.1.1#index*/
define('object-assign@4.1.1#index', function (require, exports, module) {
    'use strict';
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
        if (val === null || val === undefined) {
            throw new TypeError('Object.assign cannot be called with null or undefined');
        }
        return Object(val);
    }
    function shouldUseNative() {
        try {
            if (!Object.assign) {
                return false;
            }
            var test1 = new String('abc');
            test1[5] = 'de';
            if (Object.getOwnPropertyNames(test1)[0] === '5') {
                return false;
            }
            var test2 = {};
            for (var i = 0; i < 10; i++) {
                test2['_' + String.fromCharCode(i)] = i;
            }
            var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
                return test2[n];
            });
            if (order2.join('') !== '0123456789') {
                return false;
            }
            var test3 = {};
            'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
                test3[letter] = letter;
            });
            if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    }
    module.exports = shouldUseNative() ? Object.assign : function (target, source) {
        var from;
        var to = toObject(target);
        var symbols;
        for (var s = 1; s < arguments.length; s++) {
            from = Object(arguments[s]);
            for (var key in from) {
                if (hasOwnProperty.call(from, key)) {
                    to[key] = from[key];
                }
            }
            if (getOwnPropertySymbols) {
                symbols = getOwnPropertySymbols(from);
                for (var i = 0; i < symbols.length; i++) {
                    if (propIsEnumerable.call(from, symbols[i])) {
                        to[symbols[i]] = from[symbols[i]];
                    }
                }
            }
        }
        return to;
    };
});
/*fbjs@0.8.16#lib/emptyObject*/
define('fbjs@0.8.16#lib/emptyObject', function (require, exports, module) {
    'use strict';
    var emptyObject = {};
    if (process.env.NODE_ENV !== 'production') {
        Object.freeze(emptyObject);
    }
    module.exports = emptyObject;
});
/*fbjs@0.8.16#lib/emptyFunction*/
define('fbjs@0.8.16#lib/emptyFunction', function (require, exports, module) {
    'use strict';
    function makeEmptyFunction(arg) {
        return function () {
            return arg;
        };
    }
    var emptyFunction = function emptyFunction() {
    };
    emptyFunction.thatReturns = makeEmptyFunction;
    emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
    emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
    emptyFunction.thatReturnsNull = makeEmptyFunction(null);
    emptyFunction.thatReturnsThis = function () {
        return this;
    };
    emptyFunction.thatReturnsArgument = function (arg) {
        return arg;
    };
    module.exports = emptyFunction;
});
/*react@16.2.0#cjs/react.production.min*/
define('react@16.2.0#cjs/react.production.min', [
    'require',
    'exports',
    'module',
    'object-assign',
    'fbjs/lib/emptyObject',
    'fbjs/lib/emptyFunction'
], function (require, exports, module) {
    'use strict';
    var m = require('object-assign'), n = require('fbjs/lib/emptyObject'), p = require('fbjs/lib/emptyFunction'), q = 'function' === typeof Symbol && Symbol['for'], r = q ? Symbol['for']('react.element') : 60103, t = q ? Symbol['for']('react.call') : 60104, u = q ? Symbol['for']('react.return') : 60105, v = q ? Symbol['for']('react.portal') : 60106, w = q ? Symbol['for']('react.fragment') : 60107, x = 'function' === typeof Symbol && Symbol.iterator;
    function y(a) {
        for (var b = arguments.length - 1, e = 'Minified React error #' + a + '; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=' + a, c = 0; c < b; c++)
            e += '&args[]=' + encodeURIComponent(arguments[c + 1]);
        b = Error(e + ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.');
        b.name = 'Invariant Violation';
        b.framesToPop = 1;
        throw b;
    }
    var z = {
        isMounted: function () {
            return !1;
        },
        enqueueForceUpdate: function () {
        },
        enqueueReplaceState: function () {
        },
        enqueueSetState: function () {
        }
    };
    function A(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = n;
        this.updater = e || z;
    }
    A.prototype.isReactComponent = {};
    A.prototype.setState = function (a, b) {
        'object' !== typeof a && 'function' !== typeof a && null != a ? y('85') : void 0;
        this.updater.enqueueSetState(this, a, b, 'setState');
    };
    A.prototype.forceUpdate = function (a) {
        this.updater.enqueueForceUpdate(this, a, 'forceUpdate');
    };
    function B(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = n;
        this.updater = e || z;
    }
    function C() {
    }
    C.prototype = A.prototype;
    var D = B.prototype = new C();
    D.constructor = B;
    m(D, A.prototype);
    D.isPureReactComponent = !0;
    function E(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = n;
        this.updater = e || z;
    }
    var F = E.prototype = new C();
    F.constructor = E;
    m(F, A.prototype);
    F.unstable_isAsyncReactComponent = !0;
    F.render = function () {
        return this.props.children;
    };
    var G = { current: null }, H = Object.prototype.hasOwnProperty, I = {
            key: !0,
            ref: !0,
            __self: !0,
            __source: !0
        };
    function J(a, b, e) {
        var c, d = {}, g = null, k = null;
        if (null != b)
            for (c in void 0 !== b.ref && (k = b.ref), void 0 !== b.key && (g = '' + b.key), b)
                H.call(b, c) && !I.hasOwnProperty(c) && (d[c] = b[c]);
        var f = arguments.length - 2;
        if (1 === f)
            d.children = e;
        else if (1 < f) {
            for (var h = Array(f), l = 0; l < f; l++)
                h[l] = arguments[l + 2];
            d.children = h;
        }
        if (a && a.defaultProps)
            for (c in f = a.defaultProps, f)
                void 0 === d[c] && (d[c] = f[c]);
        return {
            $$typeof: r,
            type: a,
            key: g,
            ref: k,
            props: d,
            _owner: G.current
        };
    }
    function K(a) {
        return 'object' === typeof a && null !== a && a.$$typeof === r;
    }
    function escape(a) {
        var b = {
            '=': '=0',
            ':': '=2'
        };
        return '$' + ('' + a).replace(/[=:]/g, function (a) {
            return b[a];
        });
    }
    var L = /\/+/g, M = [];
    function N(a, b, e, c) {
        if (M.length) {
            var d = M.pop();
            d.result = a;
            d.keyPrefix = b;
            d.func = e;
            d.context = c;
            d.count = 0;
            return d;
        }
        return {
            result: a,
            keyPrefix: b,
            func: e,
            context: c,
            count: 0
        };
    }
    function O(a) {
        a.result = null;
        a.keyPrefix = null;
        a.func = null;
        a.context = null;
        a.count = 0;
        10 > M.length && M.push(a);
    }
    function P(a, b, e, c) {
        var d = typeof a;
        if ('undefined' === d || 'boolean' === d)
            a = null;
        var g = !1;
        if (null === a)
            g = !0;
        else
            switch (d) {
            case 'string':
            case 'number':
                g = !0;
                break;
            case 'object':
                switch (a.$$typeof) {
                case r:
                case t:
                case u:
                case v:
                    g = !0;
                }
            }
        if (g)
            return e(c, a, '' === b ? '.' + Q(a, 0) : b), 1;
        g = 0;
        b = '' === b ? '.' : b + ':';
        if (Array.isArray(a))
            for (var k = 0; k < a.length; k++) {
                d = a[k];
                var f = b + Q(d, k);
                g += P(d, f, e, c);
            }
        else if (null === a || 'undefined' === typeof a ? f = null : (f = x && a[x] || a['@@iterator'], f = 'function' === typeof f ? f : null), 'function' === typeof f)
            for (a = f.call(a), k = 0; !(d = a.next()).done;)
                d = d.value, f = b + Q(d, k++), g += P(d, f, e, c);
        else
            'object' === d && (e = '' + a, y('31', '[object Object]' === e ? 'object with keys {' + Object.keys(a).join(', ') + '}' : e, ''));
        return g;
    }
    function Q(a, b) {
        return 'object' === typeof a && null !== a && null != a.key ? escape(a.key) : b.toString(36);
    }
    function R(a, b) {
        a.func.call(a.context, b, a.count++);
    }
    function S(a, b, e) {
        var c = a.result, d = a.keyPrefix;
        a = a.func.call(a.context, b, a.count++);
        Array.isArray(a) ? T(a, c, e, p.thatReturnsArgument) : null != a && (K(a) && (b = d + (!a.key || b && b.key === a.key ? '' : ('' + a.key).replace(L, '$&/') + '/') + e, a = {
            $$typeof: r,
            type: a.type,
            key: b,
            ref: a.ref,
            props: a.props,
            _owner: a._owner
        }), c.push(a));
    }
    function T(a, b, e, c, d) {
        var g = '';
        null != e && (g = ('' + e).replace(L, '$&/') + '/');
        b = N(b, g, c, d);
        null == a || P(a, '', S, b);
        O(b);
    }
    var U = {
            Children: {
                map: function (a, b, e) {
                    if (null == a)
                        return a;
                    var c = [];
                    T(a, c, null, b, e);
                    return c;
                },
                forEach: function (a, b, e) {
                    if (null == a)
                        return a;
                    b = N(null, null, b, e);
                    null == a || P(a, '', R, b);
                    O(b);
                },
                count: function (a) {
                    return null == a ? 0 : P(a, '', p.thatReturnsNull, null);
                },
                toArray: function (a) {
                    var b = [];
                    T(a, b, null, p.thatReturnsArgument);
                    return b;
                },
                only: function (a) {
                    K(a) ? void 0 : y('143');
                    return a;
                }
            },
            Component: A,
            PureComponent: B,
            unstable_AsyncComponent: E,
            Fragment: w,
            createElement: J,
            cloneElement: function (a, b, e) {
                var c = m({}, a.props), d = a.key, g = a.ref, k = a._owner;
                if (null != b) {
                    void 0 !== b.ref && (g = b.ref, k = G.current);
                    void 0 !== b.key && (d = '' + b.key);
                    if (a.type && a.type.defaultProps)
                        var f = a.type.defaultProps;
                    for (h in b)
                        H.call(b, h) && !I.hasOwnProperty(h) && (c[h] = void 0 === b[h] && void 0 !== f ? f[h] : b[h]);
                }
                var h = arguments.length - 2;
                if (1 === h)
                    c.children = e;
                else if (1 < h) {
                    f = Array(h);
                    for (var l = 0; l < h; l++)
                        f[l] = arguments[l + 2];
                    c.children = f;
                }
                return {
                    $$typeof: r,
                    type: a.type,
                    key: d,
                    ref: g,
                    props: c,
                    _owner: k
                };
            },
            createFactory: function (a) {
                var b = J.bind(null, a);
                b.type = a;
                return b;
            },
            isValidElement: K,
            version: '16.2.0',
            __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
                ReactCurrentOwner: G,
                assign: m
            }
        }, V = Object.freeze({ default: U }), W = V && U || V;
    module.exports = W['default'] ? W['default'] : W;
});
/*fbjs@0.8.16#lib/invariant*/
define('fbjs@0.8.16#lib/invariant', function (require, exports, module) {
    'use strict';
    var validateFormat = function validateFormat(format) {
    };
    if (process.env.NODE_ENV !== 'production') {
        validateFormat = function validateFormat(format) {
            if (format === undefined) {
                throw new Error('invariant requires an error message argument');
            }
        };
    }
    function invariant(condition, format, a, b, c, d, e, f) {
        validateFormat(format);
        if (!condition) {
            var error;
            if (format === undefined) {
                error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
            } else {
                var args = [
                    a,
                    b,
                    c,
                    d,
                    e,
                    f
                ];
                var argIndex = 0;
                error = new Error(format.replace(/%s/g, function () {
                    return args[argIndex++];
                }));
                error.name = 'Invariant Violation';
            }
            error.framesToPop = 1;
            throw error;
        }
    }
    module.exports = invariant;
});
/*fbjs@0.8.16#lib/warning*/
define('fbjs@0.8.16#lib/warning', [
    'require',
    'exports',
    'module',
    './emptyFunction'
], function (require, exports, module) {
    'use strict';
    var emptyFunction = require('./emptyFunction');
    var warning = emptyFunction;
    if (process.env.NODE_ENV !== 'production') {
        var printWarning = function printWarning(format) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }
            var argIndex = 0;
            var message = 'Warning: ' + format.replace(/%s/g, function () {
                return args[argIndex++];
            });
            if (typeof console !== 'undefined') {
                console.error(message);
            }
            try {
                throw new Error(message);
            } catch (x) {
            }
        };
        warning = function warning(condition, format) {
            if (format === undefined) {
                throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
            }
            if (format.indexOf('Failed Composite propType: ') === 0) {
                return;
            }
            if (!condition) {
                for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                    args[_key2 - 2] = arguments[_key2];
                }
                printWarning.apply(undefined, [format].concat(args));
            }
        };
    }
    module.exports = warning;
});
/*prop-types@15.6.0#lib/ReactPropTypesSecret*/
define('prop-types@15.6.0#lib/ReactPropTypesSecret', function (require, exports, module) {
    'use strict';
    var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
    module.exports = ReactPropTypesSecret;
});
/*prop-types@15.6.0#checkPropTypes*/
define('prop-types@15.6.0#checkPropTypes', [
    'require',
    'exports',
    'module',
    'fbjs/lib/invariant',
    'fbjs/lib/warning',
    './lib/ReactPropTypesSecret'
], function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV !== 'production') {
        var invariant = require('fbjs/lib/invariant');
        var warning = require('fbjs/lib/warning');
        var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
        var loggedTypeFailures = {};
    }
    function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
        if (process.env.NODE_ENV !== 'production') {
            for (var typeSpecName in typeSpecs) {
                if (typeSpecs.hasOwnProperty(typeSpecName)) {
                    var error;
                    try {
                        invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
                        error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
                    } catch (ex) {
                        error = ex;
                    }
                    warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
                    if (error instanceof Error && !(error.message in loggedTypeFailures)) {
                        loggedTypeFailures[error.message] = true;
                        var stack = getStack ? getStack() : '';
                        warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
                    }
                }
            }
        }
    }
    module.exports = checkPropTypes;
});
/*react@16.2.0#cjs/react.development*/
define('react@16.2.0#cjs/react.development', [
    'require',
    'exports',
    'module',
    'object-assign',
    'fbjs/lib/emptyObject',
    'fbjs/lib/invariant',
    'fbjs/lib/warning',
    'fbjs/lib/emptyFunction',
    'prop-types/checkPropTypes'
], function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV !== 'production') {
        (function () {
            'use strict';
            var _assign = require('object-assign');
            var emptyObject = require('fbjs/lib/emptyObject');
            var invariant = require('fbjs/lib/invariant');
            var warning = require('fbjs/lib/warning');
            var emptyFunction = require('fbjs/lib/emptyFunction');
            var checkPropTypes = require('prop-types/checkPropTypes');
            var ReactVersion = '16.2.0';
            var hasSymbol = typeof Symbol === 'function' && Symbol['for'];
            var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 60103;
            var REACT_CALL_TYPE = hasSymbol ? Symbol['for']('react.call') : 60104;
            var REACT_RETURN_TYPE = hasSymbol ? Symbol['for']('react.return') : 60105;
            var REACT_PORTAL_TYPE = hasSymbol ? Symbol['for']('react.portal') : 60106;
            var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol['for']('react.fragment') : 60107;
            var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
            var FAUX_ITERATOR_SYMBOL = '@@iterator';
            function getIteratorFn(maybeIterable) {
                if (maybeIterable === null || typeof maybeIterable === 'undefined') {
                    return null;
                }
                var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
                if (typeof maybeIterator === 'function') {
                    return maybeIterator;
                }
                return null;
            }
            var lowPriorityWarning = function () {
            };
            {
                var printWarning = function (format) {
                    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                    }
                    var argIndex = 0;
                    var message = 'Warning: ' + format.replace(/%s/g, function () {
                        return args[argIndex++];
                    });
                    if (typeof console !== 'undefined') {
                        console.warn(message);
                    }
                    try {
                        throw new Error(message);
                    } catch (x) {
                    }
                };
                lowPriorityWarning = function (condition, format) {
                    if (format === undefined) {
                        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
                    }
                    if (!condition) {
                        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                            args[_key2 - 2] = arguments[_key2];
                        }
                        printWarning.apply(undefined, [format].concat(args));
                    }
                };
            }
            var lowPriorityWarning$1 = lowPriorityWarning;
            var didWarnStateUpdateForUnmountedComponent = {};
            function warnNoop(publicInstance, callerName) {
                {
                    var constructor = publicInstance.constructor;
                    var componentName = constructor && (constructor.displayName || constructor.name) || 'ReactClass';
                    var warningKey = componentName + '.' + callerName;
                    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
                        return;
                    }
                    warning(false, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op.\n\nPlease check the code for the %s component.', callerName, callerName, componentName);
                    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
                }
            }
            var ReactNoopUpdateQueue = {
                isMounted: function (publicInstance) {
                    return false;
                },
                enqueueForceUpdate: function (publicInstance, callback, callerName) {
                    warnNoop(publicInstance, 'forceUpdate');
                },
                enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
                    warnNoop(publicInstance, 'replaceState');
                },
                enqueueSetState: function (publicInstance, partialState, callback, callerName) {
                    warnNoop(publicInstance, 'setState');
                }
            };
            function Component(props, context, updater) {
                this.props = props;
                this.context = context;
                this.refs = emptyObject;
                this.updater = updater || ReactNoopUpdateQueue;
            }
            Component.prototype.isReactComponent = {};
            Component.prototype.setState = function (partialState, callback) {
                !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : void 0;
                this.updater.enqueueSetState(this, partialState, callback, 'setState');
            };
            Component.prototype.forceUpdate = function (callback) {
                this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
            };
            {
                var deprecatedAPIs = {
                    isMounted: [
                        'isMounted',
                        'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'
                    ],
                    replaceState: [
                        'replaceState',
                        'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).'
                    ]
                };
                var defineDeprecationWarning = function (methodName, info) {
                    Object.defineProperty(Component.prototype, methodName, {
                        get: function () {
                            lowPriorityWarning$1(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);
                            return undefined;
                        }
                    });
                };
                for (var fnName in deprecatedAPIs) {
                    if (deprecatedAPIs.hasOwnProperty(fnName)) {
                        defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
                    }
                }
            }
            function PureComponent(props, context, updater) {
                this.props = props;
                this.context = context;
                this.refs = emptyObject;
                this.updater = updater || ReactNoopUpdateQueue;
            }
            function ComponentDummy() {
            }
            ComponentDummy.prototype = Component.prototype;
            var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
            pureComponentPrototype.constructor = PureComponent;
            _assign(pureComponentPrototype, Component.prototype);
            pureComponentPrototype.isPureReactComponent = true;
            function AsyncComponent(props, context, updater) {
                this.props = props;
                this.context = context;
                this.refs = emptyObject;
                this.updater = updater || ReactNoopUpdateQueue;
            }
            var asyncComponentPrototype = AsyncComponent.prototype = new ComponentDummy();
            asyncComponentPrototype.constructor = AsyncComponent;
            _assign(asyncComponentPrototype, Component.prototype);
            asyncComponentPrototype.unstable_isAsyncReactComponent = true;
            asyncComponentPrototype.render = function () {
                return this.props.children;
            };
            var ReactCurrentOwner = { current: null };
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var RESERVED_PROPS = {
                key: true,
                ref: true,
                __self: true,
                __source: true
            };
            var specialPropKeyWarningShown;
            var specialPropRefWarningShown;
            function hasValidRef(config) {
                {
                    if (hasOwnProperty.call(config, 'ref')) {
                        var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
                        if (getter && getter.isReactWarning) {
                            return false;
                        }
                    }
                }
                return config.ref !== undefined;
            }
            function hasValidKey(config) {
                {
                    if (hasOwnProperty.call(config, 'key')) {
                        var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
                        if (getter && getter.isReactWarning) {
                            return false;
                        }
                    }
                }
                return config.key !== undefined;
            }
            function defineKeyPropWarningGetter(props, displayName) {
                var warnAboutAccessingKey = function () {
                    if (!specialPropKeyWarningShown) {
                        specialPropKeyWarningShown = true;
                        warning(false, '%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
                    }
                };
                warnAboutAccessingKey.isReactWarning = true;
                Object.defineProperty(props, 'key', {
                    get: warnAboutAccessingKey,
                    configurable: true
                });
            }
            function defineRefPropWarningGetter(props, displayName) {
                var warnAboutAccessingRef = function () {
                    if (!specialPropRefWarningShown) {
                        specialPropRefWarningShown = true;
                        warning(false, '%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
                    }
                };
                warnAboutAccessingRef.isReactWarning = true;
                Object.defineProperty(props, 'ref', {
                    get: warnAboutAccessingRef,
                    configurable: true
                });
            }
            var ReactElement = function (type, key, ref, self, source, owner, props) {
                var element = {
                    $$typeof: REACT_ELEMENT_TYPE,
                    type: type,
                    key: key,
                    ref: ref,
                    props: props,
                    _owner: owner
                };
                {
                    element._store = {};
                    Object.defineProperty(element._store, 'validated', {
                        configurable: false,
                        enumerable: false,
                        writable: true,
                        value: false
                    });
                    Object.defineProperty(element, '_self', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: self
                    });
                    Object.defineProperty(element, '_source', {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: source
                    });
                    if (Object.freeze) {
                        Object.freeze(element.props);
                        Object.freeze(element);
                    }
                }
                return element;
            };
            function createElement(type, config, children) {
                var propName;
                var props = {};
                var key = null;
                var ref = null;
                var self = null;
                var source = null;
                if (config != null) {
                    if (hasValidRef(config)) {
                        ref = config.ref;
                    }
                    if (hasValidKey(config)) {
                        key = '' + config.key;
                    }
                    self = config.__self === undefined ? null : config.__self;
                    source = config.__source === undefined ? null : config.__source;
                    for (propName in config) {
                        if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                            props[propName] = config[propName];
                        }
                    }
                }
                var childrenLength = arguments.length - 2;
                if (childrenLength === 1) {
                    props.children = children;
                } else if (childrenLength > 1) {
                    var childArray = Array(childrenLength);
                    for (var i = 0; i < childrenLength; i++) {
                        childArray[i] = arguments[i + 2];
                    }
                    {
                        if (Object.freeze) {
                            Object.freeze(childArray);
                        }
                    }
                    props.children = childArray;
                }
                if (type && type.defaultProps) {
                    var defaultProps = type.defaultProps;
                    for (propName in defaultProps) {
                        if (props[propName] === undefined) {
                            props[propName] = defaultProps[propName];
                        }
                    }
                }
                {
                    if (key || ref) {
                        if (typeof props.$$typeof === 'undefined' || props.$$typeof !== REACT_ELEMENT_TYPE) {
                            var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
                            if (key) {
                                defineKeyPropWarningGetter(props, displayName);
                            }
                            if (ref) {
                                defineRefPropWarningGetter(props, displayName);
                            }
                        }
                    }
                }
                return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
            }
            function cloneAndReplaceKey(oldElement, newKey) {
                var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
                return newElement;
            }
            function cloneElement(element, config, children) {
                var propName;
                var props = _assign({}, element.props);
                var key = element.key;
                var ref = element.ref;
                var self = element._self;
                var source = element._source;
                var owner = element._owner;
                if (config != null) {
                    if (hasValidRef(config)) {
                        ref = config.ref;
                        owner = ReactCurrentOwner.current;
                    }
                    if (hasValidKey(config)) {
                        key = '' + config.key;
                    }
                    var defaultProps;
                    if (element.type && element.type.defaultProps) {
                        defaultProps = element.type.defaultProps;
                    }
                    for (propName in config) {
                        if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                            if (config[propName] === undefined && defaultProps !== undefined) {
                                props[propName] = defaultProps[propName];
                            } else {
                                props[propName] = config[propName];
                            }
                        }
                    }
                }
                var childrenLength = arguments.length - 2;
                if (childrenLength === 1) {
                    props.children = children;
                } else if (childrenLength > 1) {
                    var childArray = Array(childrenLength);
                    for (var i = 0; i < childrenLength; i++) {
                        childArray[i] = arguments[i + 2];
                    }
                    props.children = childArray;
                }
                return ReactElement(element.type, key, ref, self, source, owner, props);
            }
            function isValidElement(object) {
                return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
            }
            var ReactDebugCurrentFrame = {};
            {
                ReactDebugCurrentFrame.getCurrentStack = null;
                ReactDebugCurrentFrame.getStackAddendum = function () {
                    var impl = ReactDebugCurrentFrame.getCurrentStack;
                    if (impl) {
                        return impl();
                    }
                    return null;
                };
            }
            var SEPARATOR = '.';
            var SUBSEPARATOR = ':';
            function escape(key) {
                var escapeRegex = /[=:]/g;
                var escaperLookup = {
                    '=': '=0',
                    ':': '=2'
                };
                var escapedString = ('' + key).replace(escapeRegex, function (match) {
                    return escaperLookup[match];
                });
                return '$' + escapedString;
            }
            var didWarnAboutMaps = false;
            var userProvidedKeyEscapeRegex = /\/+/g;
            function escapeUserProvidedKey(text) {
                return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
            }
            var POOL_SIZE = 10;
            var traverseContextPool = [];
            function getPooledTraverseContext(mapResult, keyPrefix, mapFunction, mapContext) {
                if (traverseContextPool.length) {
                    var traverseContext = traverseContextPool.pop();
                    traverseContext.result = mapResult;
                    traverseContext.keyPrefix = keyPrefix;
                    traverseContext.func = mapFunction;
                    traverseContext.context = mapContext;
                    traverseContext.count = 0;
                    return traverseContext;
                } else {
                    return {
                        result: mapResult,
                        keyPrefix: keyPrefix,
                        func: mapFunction,
                        context: mapContext,
                        count: 0
                    };
                }
            }
            function releaseTraverseContext(traverseContext) {
                traverseContext.result = null;
                traverseContext.keyPrefix = null;
                traverseContext.func = null;
                traverseContext.context = null;
                traverseContext.count = 0;
                if (traverseContextPool.length < POOL_SIZE) {
                    traverseContextPool.push(traverseContext);
                }
            }
            function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
                var type = typeof children;
                if (type === 'undefined' || type === 'boolean') {
                    children = null;
                }
                var invokeCallback = false;
                if (children === null) {
                    invokeCallback = true;
                } else {
                    switch (type) {
                    case 'string':
                    case 'number':
                        invokeCallback = true;
                        break;
                    case 'object':
                        switch (children.$$typeof) {
                        case REACT_ELEMENT_TYPE:
                        case REACT_CALL_TYPE:
                        case REACT_RETURN_TYPE:
                        case REACT_PORTAL_TYPE:
                            invokeCallback = true;
                        }
                    }
                }
                if (invokeCallback) {
                    callback(traverseContext, children, nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
                    return 1;
                }
                var child;
                var nextName;
                var subtreeCount = 0;
                var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
                if (Array.isArray(children)) {
                    for (var i = 0; i < children.length; i++) {
                        child = children[i];
                        nextName = nextNamePrefix + getComponentKey(child, i);
                        subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
                    }
                } else {
                    var iteratorFn = getIteratorFn(children);
                    if (typeof iteratorFn === 'function') {
                        {
                            if (iteratorFn === children.entries) {
                                warning(didWarnAboutMaps, 'Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.%s', ReactDebugCurrentFrame.getStackAddendum());
                                didWarnAboutMaps = true;
                            }
                        }
                        var iterator = iteratorFn.call(children);
                        var step;
                        var ii = 0;
                        while (!(step = iterator.next()).done) {
                            child = step.value;
                            nextName = nextNamePrefix + getComponentKey(child, ii++);
                            subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
                        }
                    } else if (type === 'object') {
                        var addendum = '';
                        {
                            addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + ReactDebugCurrentFrame.getStackAddendum();
                        }
                        var childrenString = '' + children;
                        invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum);
                    }
                }
                return subtreeCount;
            }
            function traverseAllChildren(children, callback, traverseContext) {
                if (children == null) {
                    return 0;
                }
                return traverseAllChildrenImpl(children, '', callback, traverseContext);
            }
            function getComponentKey(component, index) {
                if (typeof component === 'object' && component !== null && component.key != null) {
                    return escape(component.key);
                }
                return index.toString(36);
            }
            function forEachSingleChild(bookKeeping, child, name) {
                var func = bookKeeping.func, context = bookKeeping.context;
                func.call(context, child, bookKeeping.count++);
            }
            function forEachChildren(children, forEachFunc, forEachContext) {
                if (children == null) {
                    return children;
                }
                var traverseContext = getPooledTraverseContext(null, null, forEachFunc, forEachContext);
                traverseAllChildren(children, forEachSingleChild, traverseContext);
                releaseTraverseContext(traverseContext);
            }
            function mapSingleChildIntoContext(bookKeeping, child, childKey) {
                var result = bookKeeping.result, keyPrefix = bookKeeping.keyPrefix, func = bookKeeping.func, context = bookKeeping.context;
                var mappedChild = func.call(context, child, bookKeeping.count++);
                if (Array.isArray(mappedChild)) {
                    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
                } else if (mappedChild != null) {
                    if (isValidElement(mappedChild)) {
                        mappedChild = cloneAndReplaceKey(mappedChild, keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
                    }
                    result.push(mappedChild);
                }
            }
            function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
                var escapedPrefix = '';
                if (prefix != null) {
                    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
                }
                var traverseContext = getPooledTraverseContext(array, escapedPrefix, func, context);
                traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
                releaseTraverseContext(traverseContext);
            }
            function mapChildren(children, func, context) {
                if (children == null) {
                    return children;
                }
                var result = [];
                mapIntoWithKeyPrefixInternal(children, result, null, func, context);
                return result;
            }
            function countChildren(children, context) {
                return traverseAllChildren(children, emptyFunction.thatReturnsNull, null);
            }
            function toArray(children) {
                var result = [];
                mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
                return result;
            }
            function onlyChild(children) {
                !isValidElement(children) ? invariant(false, 'React.Children.only expected to receive a single React element child.') : void 0;
                return children;
            }
            var describeComponentFrame = function (name, source, ownerName) {
                return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
            };
            function getComponentName(fiber) {
                var type = fiber.type;
                if (typeof type === 'string') {
                    return type;
                }
                if (typeof type === 'function') {
                    return type.displayName || type.name;
                }
                return null;
            }
            {
                var currentlyValidatingElement = null;
                var propTypesMisspellWarningShown = false;
                var getDisplayName = function (element) {
                    if (element == null) {
                        return '#empty';
                    } else if (typeof element === 'string' || typeof element === 'number') {
                        return '#text';
                    } else if (typeof element.type === 'string') {
                        return element.type;
                    } else if (element.type === REACT_FRAGMENT_TYPE) {
                        return 'React.Fragment';
                    } else {
                        return element.type.displayName || element.type.name || 'Unknown';
                    }
                };
                var getStackAddendum = function () {
                    var stack = '';
                    if (currentlyValidatingElement) {
                        var name = getDisplayName(currentlyValidatingElement);
                        var owner = currentlyValidatingElement._owner;
                        stack += describeComponentFrame(name, currentlyValidatingElement._source, owner && getComponentName(owner));
                    }
                    stack += ReactDebugCurrentFrame.getStackAddendum() || '';
                    return stack;
                };
                var VALID_FRAGMENT_PROPS = new Map([
                    [
                        'children',
                        true
                    ],
                    [
                        'key',
                        true
                    ]
                ]);
            }
            function getDeclarationErrorAddendum() {
                if (ReactCurrentOwner.current) {
                    var name = getComponentName(ReactCurrentOwner.current);
                    if (name) {
                        return '\n\nCheck the render method of `' + name + '`.';
                    }
                }
                return '';
            }
            function getSourceInfoErrorAddendum(elementProps) {
                if (elementProps !== null && elementProps !== undefined && elementProps.__source !== undefined) {
                    var source = elementProps.__source;
                    var fileName = source.fileName.replace(/^.*[\\\/]/, '');
                    var lineNumber = source.lineNumber;
                    return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
                }
                return '';
            }
            var ownerHasKeyUseWarning = {};
            function getCurrentComponentErrorInfo(parentType) {
                var info = getDeclarationErrorAddendum();
                if (!info) {
                    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
                    if (parentName) {
                        info = '\n\nCheck the top-level render call using <' + parentName + '>.';
                    }
                }
                return info;
            }
            function validateExplicitKey(element, parentType) {
                if (!element._store || element._store.validated || element.key != null) {
                    return;
                }
                element._store.validated = true;
                var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
                if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
                    return;
                }
                ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
                var childOwner = '';
                if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
                    childOwner = ' It was passed a child from ' + getComponentName(element._owner) + '.';
                }
                currentlyValidatingElement = element;
                {
                    warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.%s', currentComponentErrorInfo, childOwner, getStackAddendum());
                }
                currentlyValidatingElement = null;
            }
            function validateChildKeys(node, parentType) {
                if (typeof node !== 'object') {
                    return;
                }
                if (Array.isArray(node)) {
                    for (var i = 0; i < node.length; i++) {
                        var child = node[i];
                        if (isValidElement(child)) {
                            validateExplicitKey(child, parentType);
                        }
                    }
                } else if (isValidElement(node)) {
                    if (node._store) {
                        node._store.validated = true;
                    }
                } else if (node) {
                    var iteratorFn = getIteratorFn(node);
                    if (typeof iteratorFn === 'function') {
                        if (iteratorFn !== node.entries) {
                            var iterator = iteratorFn.call(node);
                            var step;
                            while (!(step = iterator.next()).done) {
                                if (isValidElement(step.value)) {
                                    validateExplicitKey(step.value, parentType);
                                }
                            }
                        }
                    }
                }
            }
            function validatePropTypes(element) {
                var componentClass = element.type;
                if (typeof componentClass !== 'function') {
                    return;
                }
                var name = componentClass.displayName || componentClass.name;
                var propTypes = componentClass.propTypes;
                if (propTypes) {
                    currentlyValidatingElement = element;
                    checkPropTypes(propTypes, element.props, 'prop', name, getStackAddendum);
                    currentlyValidatingElement = null;
                } else if (componentClass.PropTypes !== undefined && !propTypesMisspellWarningShown) {
                    propTypesMisspellWarningShown = true;
                    warning(false, 'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
                }
                if (typeof componentClass.getDefaultProps === 'function') {
                    warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
                }
            }
            function validateFragmentProps(fragment) {
                currentlyValidatingElement = fragment;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;
                try {
                    for (var _iterator = Object.keys(fragment.props)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var key = _step.value;
                        if (!VALID_FRAGMENT_PROPS.has(key)) {
                            warning(false, 'Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.%s', key, getStackAddendum());
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                if (fragment.ref !== null) {
                    warning(false, 'Invalid attribute `ref` supplied to `React.Fragment`.%s', getStackAddendum());
                }
                currentlyValidatingElement = null;
            }
            function createElementWithValidation(type, props, children) {
                var validType = typeof type === 'string' || typeof type === 'function' || typeof type === 'symbol' || typeof type === 'number';
                if (!validType) {
                    var info = '';
                    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
                        info += ' You likely forgot to export your component from the file ' + 'it\'s defined in, or you might have mixed up default and named imports.';
                    }
                    var sourceInfo = getSourceInfoErrorAddendum(props);
                    if (sourceInfo) {
                        info += sourceInfo;
                    } else {
                        info += getDeclarationErrorAddendum();
                    }
                    info += getStackAddendum() || '';
                    warning(false, 'React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', type == null ? type : typeof type, info);
                }
                var element = createElement.apply(this, arguments);
                if (element == null) {
                    return element;
                }
                if (validType) {
                    for (var i = 2; i < arguments.length; i++) {
                        validateChildKeys(arguments[i], type);
                    }
                }
                if (typeof type === 'symbol' && type === REACT_FRAGMENT_TYPE) {
                    validateFragmentProps(element);
                } else {
                    validatePropTypes(element);
                }
                return element;
            }
            function createFactoryWithValidation(type) {
                var validatedFactory = createElementWithValidation.bind(null, type);
                validatedFactory.type = type;
                {
                    Object.defineProperty(validatedFactory, 'type', {
                        enumerable: false,
                        get: function () {
                            lowPriorityWarning$1(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');
                            Object.defineProperty(this, 'type', { value: type });
                            return type;
                        }
                    });
                }
                return validatedFactory;
            }
            function cloneElementWithValidation(element, props, children) {
                var newElement = cloneElement.apply(this, arguments);
                for (var i = 2; i < arguments.length; i++) {
                    validateChildKeys(arguments[i], newElement.type);
                }
                validatePropTypes(newElement);
                return newElement;
            }
            var React = {
                Children: {
                    map: mapChildren,
                    forEach: forEachChildren,
                    count: countChildren,
                    toArray: toArray,
                    only: onlyChild
                },
                Component: Component,
                PureComponent: PureComponent,
                unstable_AsyncComponent: AsyncComponent,
                Fragment: REACT_FRAGMENT_TYPE,
                createElement: createElementWithValidation,
                cloneElement: cloneElementWithValidation,
                createFactory: createFactoryWithValidation,
                isValidElement: isValidElement,
                version: ReactVersion,
                __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
                    ReactCurrentOwner: ReactCurrentOwner,
                    assign: _assign
                }
            };
            {
                _assign(React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, {
                    ReactDebugCurrentFrame: ReactDebugCurrentFrame,
                    ReactComponentTreeHook: {}
                });
            }
            var React$2 = Object.freeze({ default: React });
            var React$3 = React$2 && React || React$2;
            var react = React$3['default'] ? React$3['default'] : React$3;
            module.exports = react;
        }());
    }
});
/*react@16.2.0#index*/
define('react@16.2.0#index', [
    'require',
    'exports',
    'module',
    './cjs/react.production.min.js',
    './cjs/react.development.js'
], function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV === 'production') {
        module.exports = require('./cjs/react.production.min.js');
    } else {
        module.exports = require('./cjs/react.development.js');
    }
});
/*fbjs@0.8.16#lib/ExecutionEnvironment*/
define('fbjs@0.8.16#lib/ExecutionEnvironment', function (require, exports, module) {
    'use strict';
    var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
    var ExecutionEnvironment = {
        canUseDOM: canUseDOM,
        canUseWorkers: typeof Worker !== 'undefined',
        canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),
        canUseViewport: canUseDOM && !!window.screen,
        isInWorker: !canUseDOM
    };
    module.exports = ExecutionEnvironment;
});
/*fbjs@0.8.16#lib/EventListener*/
define('fbjs@0.8.16#lib/EventListener', [
    'require',
    'exports',
    'module',
    './emptyFunction'
], function (require, exports, module) {
    'use strict';
    var emptyFunction = require('./emptyFunction');
    var EventListener = {
        listen: function listen(target, eventType, callback) {
            if (target.addEventListener) {
                target.addEventListener(eventType, callback, false);
                return {
                    remove: function remove() {
                        target.removeEventListener(eventType, callback, false);
                    }
                };
            } else if (target.attachEvent) {
                target.attachEvent('on' + eventType, callback);
                return {
                    remove: function remove() {
                        target.detachEvent('on' + eventType, callback);
                    }
                };
            }
        },
        capture: function capture(target, eventType, callback) {
            if (target.addEventListener) {
                target.addEventListener(eventType, callback, true);
                return {
                    remove: function remove() {
                        target.removeEventListener(eventType, callback, true);
                    }
                };
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    console.error('Attempted to listen to events during the capture phase on a ' + 'browser that does not support the capture phase. Your application ' + 'will not receive some events.');
                }
                return { remove: emptyFunction };
            }
        },
        registerDefault: function registerDefault() {
        }
    };
    module.exports = EventListener;
});
/*fbjs@0.8.16#lib/getActiveElement*/
define('fbjs@0.8.16#lib/getActiveElement', function (require, exports, module) {
    'use strict';
    function getActiveElement(doc) {
        doc = doc || (typeof document !== 'undefined' ? document : undefined);
        if (typeof doc === 'undefined') {
            return null;
        }
        try {
            return doc.activeElement || doc.body;
        } catch (e) {
            return doc.body;
        }
    }
    module.exports = getActiveElement;
});
/*fbjs@0.8.16#lib/shallowEqual*/
define('fbjs@0.8.16#lib/shallowEqual', function (require, exports, module) {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function is(x, y) {
        if (x === y) {
            return x !== 0 || y !== 0 || 1 / x === 1 / y;
        } else {
            return x !== x && y !== y;
        }
    }
    function shallowEqual(objA, objB) {
        if (is(objA, objB)) {
            return true;
        }
        if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
            return false;
        }
        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);
        if (keysA.length !== keysB.length) {
            return false;
        }
        for (var i = 0; i < keysA.length; i++) {
            if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
                return false;
            }
        }
        return true;
    }
    module.exports = shallowEqual;
});
/*fbjs@0.8.16#lib/isNode*/
define('fbjs@0.8.16#lib/isNode', function (require, exports, module) {
    'use strict';
    function isNode(object) {
        var doc = object ? object.ownerDocument || object : document;
        var defaultView = doc.defaultView || window;
        return !!(object && (typeof defaultView.Node === 'function' ? object instanceof defaultView.Node : typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string'));
    }
    module.exports = isNode;
});
/*fbjs@0.8.16#lib/isTextNode*/
define('fbjs@0.8.16#lib/isTextNode', [
    'require',
    'exports',
    'module',
    './isNode'
], function (require, exports, module) {
    'use strict';
    var isNode = require('./isNode');
    function isTextNode(object) {
        return isNode(object) && object.nodeType == 3;
    }
    module.exports = isTextNode;
});
/*fbjs@0.8.16#lib/containsNode*/
define('fbjs@0.8.16#lib/containsNode', [
    'require',
    'exports',
    'module',
    './isTextNode'
], function (require, exports, module) {
    'use strict';
    var isTextNode = require('./isTextNode');
    function containsNode(outerNode, innerNode) {
        if (!outerNode || !innerNode) {
            return false;
        } else if (outerNode === innerNode) {
            return true;
        } else if (isTextNode(outerNode)) {
            return false;
        } else if (isTextNode(innerNode)) {
            return containsNode(outerNode, innerNode.parentNode);
        } else if ('contains' in outerNode) {
            return outerNode.contains(innerNode);
        } else if (outerNode.compareDocumentPosition) {
            return !!(outerNode.compareDocumentPosition(innerNode) & 16);
        } else {
            return false;
        }
    }
    module.exports = containsNode;
});
/*fbjs@0.8.16#lib/focusNode*/
define('fbjs@0.8.16#lib/focusNode', function (require, exports, module) {
    'use strict';
    function focusNode(node) {
        try {
            node.focus();
        } catch (e) {
        }
    }
    module.exports = focusNode;
});
/*react-dom@16.2.0#cjs/react-dom.production.min*/
define('react-dom@16.2.0#cjs/react-dom.production.min', [
    'require',
    'exports',
    'module',
    'react',
    'fbjs/lib/ExecutionEnvironment',
    'object-assign',
    'fbjs/lib/emptyFunction',
    'fbjs/lib/EventListener',
    'fbjs/lib/getActiveElement',
    'fbjs/lib/shallowEqual',
    'fbjs/lib/containsNode',
    'fbjs/lib/focusNode',
    'fbjs/lib/emptyObject'
], function (require, exports, module) {
    'use strict';
    var aa = require('react'), l = require('fbjs/lib/ExecutionEnvironment'), B = require('object-assign'), C = require('fbjs/lib/emptyFunction'), ba = require('fbjs/lib/EventListener'), da = require('fbjs/lib/getActiveElement'), ea = require('fbjs/lib/shallowEqual'), fa = require('fbjs/lib/containsNode'), ia = require('fbjs/lib/focusNode'), D = require('fbjs/lib/emptyObject');
    function E(a) {
        for (var b = arguments.length - 1, c = 'Minified React error #' + a + '; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=' + a, d = 0; d < b; d++)
            c += '&args[]=' + encodeURIComponent(arguments[d + 1]);
        b = Error(c + ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.');
        b.name = 'Invariant Violation';
        b.framesToPop = 1;
        throw b;
    }
    aa ? void 0 : E('227');
    var oa = {
        children: !0,
        dangerouslySetInnerHTML: !0,
        defaultValue: !0,
        defaultChecked: !0,
        innerHTML: !0,
        suppressContentEditableWarning: !0,
        suppressHydrationWarning: !0,
        style: !0
    };
    function pa(a, b) {
        return (a & b) === b;
    }
    var ta = {
            MUST_USE_PROPERTY: 1,
            HAS_BOOLEAN_VALUE: 4,
            HAS_NUMERIC_VALUE: 8,
            HAS_POSITIVE_NUMERIC_VALUE: 24,
            HAS_OVERLOADED_BOOLEAN_VALUE: 32,
            HAS_STRING_BOOLEAN_VALUE: 64,
            injectDOMPropertyConfig: function (a) {
                var b = ta, c = a.Properties || {}, d = a.DOMAttributeNamespaces || {}, e = a.DOMAttributeNames || {};
                a = a.DOMMutationMethods || {};
                for (var f in c) {
                    ua.hasOwnProperty(f) ? E('48', f) : void 0;
                    var g = f.toLowerCase(), h = c[f];
                    g = {
                        attributeName: g,
                        attributeNamespace: null,
                        propertyName: f,
                        mutationMethod: null,
                        mustUseProperty: pa(h, b.MUST_USE_PROPERTY),
                        hasBooleanValue: pa(h, b.HAS_BOOLEAN_VALUE),
                        hasNumericValue: pa(h, b.HAS_NUMERIC_VALUE),
                        hasPositiveNumericValue: pa(h, b.HAS_POSITIVE_NUMERIC_VALUE),
                        hasOverloadedBooleanValue: pa(h, b.HAS_OVERLOADED_BOOLEAN_VALUE),
                        hasStringBooleanValue: pa(h, b.HAS_STRING_BOOLEAN_VALUE)
                    };
                    1 >= g.hasBooleanValue + g.hasNumericValue + g.hasOverloadedBooleanValue ? void 0 : E('50', f);
                    e.hasOwnProperty(f) && (g.attributeName = e[f]);
                    d.hasOwnProperty(f) && (g.attributeNamespace = d[f]);
                    a.hasOwnProperty(f) && (g.mutationMethod = a[f]);
                    ua[f] = g;
                }
            }
        }, ua = {};
    function va(a, b) {
        if (oa.hasOwnProperty(a) || 2 < a.length && ('o' === a[0] || 'O' === a[0]) && ('n' === a[1] || 'N' === a[1]))
            return !1;
        if (null === b)
            return !0;
        switch (typeof b) {
        case 'boolean':
            return oa.hasOwnProperty(a) ? a = !0 : (b = wa(a)) ? a = b.hasBooleanValue || b.hasStringBooleanValue || b.hasOverloadedBooleanValue : (a = a.toLowerCase().slice(0, 5), a = 'data-' === a || 'aria-' === a), a;
        case 'undefined':
        case 'number':
        case 'string':
        case 'object':
            return !0;
        default:
            return !1;
        }
    }
    function wa(a) {
        return ua.hasOwnProperty(a) ? ua[a] : null;
    }
    var xa = ta, ya = xa.MUST_USE_PROPERTY, K = xa.HAS_BOOLEAN_VALUE, za = xa.HAS_NUMERIC_VALUE, Aa = xa.HAS_POSITIVE_NUMERIC_VALUE, Ba = xa.HAS_OVERLOADED_BOOLEAN_VALUE, Ca = xa.HAS_STRING_BOOLEAN_VALUE, Da = {
            Properties: {
                allowFullScreen: K,
                async: K,
                autoFocus: K,
                autoPlay: K,
                capture: Ba,
                checked: ya | K,
                cols: Aa,
                contentEditable: Ca,
                controls: K,
                'default': K,
                defer: K,
                disabled: K,
                download: Ba,
                draggable: Ca,
                formNoValidate: K,
                hidden: K,
                loop: K,
                multiple: ya | K,
                muted: ya | K,
                noValidate: K,
                open: K,
                playsInline: K,
                readOnly: K,
                required: K,
                reversed: K,
                rows: Aa,
                rowSpan: za,
                scoped: K,
                seamless: K,
                selected: ya | K,
                size: Aa,
                start: za,
                span: Aa,
                spellCheck: Ca,
                style: 0,
                tabIndex: 0,
                itemScope: K,
                acceptCharset: 0,
                className: 0,
                htmlFor: 0,
                httpEquiv: 0,
                value: Ca
            },
            DOMAttributeNames: {
                acceptCharset: 'accept-charset',
                className: 'class',
                htmlFor: 'for',
                httpEquiv: 'http-equiv'
            },
            DOMMutationMethods: {
                value: function (a, b) {
                    if (null == b)
                        return a.removeAttribute('value');
                    'number' !== a.type || !1 === a.hasAttribute('value') ? a.setAttribute('value', '' + b) : a.validity && !a.validity.badInput && a.ownerDocument.activeElement !== a && a.setAttribute('value', '' + b);
                }
            }
        }, Ea = xa.HAS_STRING_BOOLEAN_VALUE, M = {
            xlink: 'http://www.w3.org/1999/xlink',
            xml: 'http://www.w3.org/XML/1998/namespace'
        }, Ga = {
            Properties: {
                autoReverse: Ea,
                externalResourcesRequired: Ea,
                preserveAlpha: Ea
            },
            DOMAttributeNames: {
                autoReverse: 'autoReverse',
                externalResourcesRequired: 'externalResourcesRequired',
                preserveAlpha: 'preserveAlpha'
            },
            DOMAttributeNamespaces: {
                xlinkActuate: M.xlink,
                xlinkArcrole: M.xlink,
                xlinkHref: M.xlink,
                xlinkRole: M.xlink,
                xlinkShow: M.xlink,
                xlinkTitle: M.xlink,
                xlinkType: M.xlink,
                xmlBase: M.xml,
                xmlLang: M.xml,
                xmlSpace: M.xml
            }
        }, Ha = /[\-\:]([a-z])/g;
    function Ia(a) {
        return a[1].toUpperCase();
    }
    'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode x-height xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xmlns:xlink xml:lang xml:space'.split(' ').forEach(function (a) {
        var b = a.replace(Ha, Ia);
        Ga.Properties[b] = 0;
        Ga.DOMAttributeNames[b] = a;
    });
    xa.injectDOMPropertyConfig(Da);
    xa.injectDOMPropertyConfig(Ga);
    var P = {
        _caughtError: null,
        _hasCaughtError: !1,
        _rethrowError: null,
        _hasRethrowError: !1,
        injection: {
            injectErrorUtils: function (a) {
                'function' !== typeof a.invokeGuardedCallback ? E('197') : void 0;
                Ja = a.invokeGuardedCallback;
            }
        },
        invokeGuardedCallback: function (a, b, c, d, e, f, g, h, k) {
            Ja.apply(P, arguments);
        },
        invokeGuardedCallbackAndCatchFirstError: function (a, b, c, d, e, f, g, h, k) {
            P.invokeGuardedCallback.apply(this, arguments);
            if (P.hasCaughtError()) {
                var q = P.clearCaughtError();
                P._hasRethrowError || (P._hasRethrowError = !0, P._rethrowError = q);
            }
        },
        rethrowCaughtError: function () {
            return Ka.apply(P, arguments);
        },
        hasCaughtError: function () {
            return P._hasCaughtError;
        },
        clearCaughtError: function () {
            if (P._hasCaughtError) {
                var a = P._caughtError;
                P._caughtError = null;
                P._hasCaughtError = !1;
                return a;
            }
            E('198');
        }
    };
    function Ja(a, b, c, d, e, f, g, h, k) {
        P._hasCaughtError = !1;
        P._caughtError = null;
        var q = Array.prototype.slice.call(arguments, 3);
        try {
            b.apply(c, q);
        } catch (v) {
            P._caughtError = v, P._hasCaughtError = !0;
        }
    }
    function Ka() {
        if (P._hasRethrowError) {
            var a = P._rethrowError;
            P._rethrowError = null;
            P._hasRethrowError = !1;
            throw a;
        }
    }
    var La = null, Ma = {};
    function Na() {
        if (La)
            for (var a in Ma) {
                var b = Ma[a], c = La.indexOf(a);
                -1 < c ? void 0 : E('96', a);
                if (!Oa[c]) {
                    b.extractEvents ? void 0 : E('97', a);
                    Oa[c] = b;
                    c = b.eventTypes;
                    for (var d in c) {
                        var e = void 0;
                        var f = c[d], g = b, h = d;
                        Pa.hasOwnProperty(h) ? E('99', h) : void 0;
                        Pa[h] = f;
                        var k = f.phasedRegistrationNames;
                        if (k) {
                            for (e in k)
                                k.hasOwnProperty(e) && Qa(k[e], g, h);
                            e = !0;
                        } else
                            f.registrationName ? (Qa(f.registrationName, g, h), e = !0) : e = !1;
                        e ? void 0 : E('98', d, a);
                    }
                }
            }
    }
    function Qa(a, b, c) {
        Ra[a] ? E('100', a) : void 0;
        Ra[a] = b;
        Sa[a] = b.eventTypes[c].dependencies;
    }
    var Oa = [], Pa = {}, Ra = {}, Sa = {};
    function Ta(a) {
        La ? E('101') : void 0;
        La = Array.prototype.slice.call(a);
        Na();
    }
    function Ua(a) {
        var b = !1, c;
        for (c in a)
            if (a.hasOwnProperty(c)) {
                var d = a[c];
                Ma.hasOwnProperty(c) && Ma[c] === d || (Ma[c] ? E('102', c) : void 0, Ma[c] = d, b = !0);
            }
        b && Na();
    }
    var Va = Object.freeze({
            plugins: Oa,
            eventNameDispatchConfigs: Pa,
            registrationNameModules: Ra,
            registrationNameDependencies: Sa,
            possibleRegistrationNames: null,
            injectEventPluginOrder: Ta,
            injectEventPluginsByName: Ua
        }), Wa = null, Xa = null, Ya = null;
    function Za(a, b, c, d) {
        b = a.type || 'unknown-event';
        a.currentTarget = Ya(d);
        P.invokeGuardedCallbackAndCatchFirstError(b, c, void 0, a);
        a.currentTarget = null;
    }
    function $a(a, b) {
        null == b ? E('30') : void 0;
        if (null == a)
            return b;
        if (Array.isArray(a)) {
            if (Array.isArray(b))
                return a.push.apply(a, b), a;
            a.push(b);
            return a;
        }
        return Array.isArray(b) ? [a].concat(b) : [
            a,
            b
        ];
    }
    function ab(a, b, c) {
        Array.isArray(a) ? a.forEach(b, c) : a && b.call(c, a);
    }
    var bb = null;
    function cb(a, b) {
        if (a) {
            var c = a._dispatchListeners, d = a._dispatchInstances;
            if (Array.isArray(c))
                for (var e = 0; e < c.length && !a.isPropagationStopped(); e++)
                    Za(a, b, c[e], d[e]);
            else
                c && Za(a, b, c, d);
            a._dispatchListeners = null;
            a._dispatchInstances = null;
            a.isPersistent() || a.constructor.release(a);
        }
    }
    function db(a) {
        return cb(a, !0);
    }
    function gb(a) {
        return cb(a, !1);
    }
    var hb = {
        injectEventPluginOrder: Ta,
        injectEventPluginsByName: Ua
    };
    function ib(a, b) {
        var c = a.stateNode;
        if (!c)
            return null;
        var d = Wa(c);
        if (!d)
            return null;
        c = d[b];
        a:
            switch (b) {
            case 'onClick':
            case 'onClickCapture':
            case 'onDoubleClick':
            case 'onDoubleClickCapture':
            case 'onMouseDown':
            case 'onMouseDownCapture':
            case 'onMouseMove':
            case 'onMouseMoveCapture':
            case 'onMouseUp':
            case 'onMouseUpCapture':
                (d = !d.disabled) || (a = a.type, d = !('button' === a || 'input' === a || 'select' === a || 'textarea' === a));
                a = !d;
                break a;
            default:
                a = !1;
            }
        if (a)
            return null;
        c && 'function' !== typeof c ? E('231', b, typeof c) : void 0;
        return c;
    }
    function jb(a, b, c, d) {
        for (var e, f = 0; f < Oa.length; f++) {
            var g = Oa[f];
            g && (g = g.extractEvents(a, b, c, d)) && (e = $a(e, g));
        }
        return e;
    }
    function kb(a) {
        a && (bb = $a(bb, a));
    }
    function lb(a) {
        var b = bb;
        bb = null;
        b && (a ? ab(b, db) : ab(b, gb), bb ? E('95') : void 0, P.rethrowCaughtError());
    }
    var mb = Object.freeze({
            injection: hb,
            getListener: ib,
            extractEvents: jb,
            enqueueEvents: kb,
            processEventQueue: lb
        }), nb = Math.random().toString(36).slice(2), Q = '__reactInternalInstance$' + nb, ob = '__reactEventHandlers$' + nb;
    function pb(a) {
        if (a[Q])
            return a[Q];
        for (var b = []; !a[Q];)
            if (b.push(a), a.parentNode)
                a = a.parentNode;
            else
                return null;
        var c = void 0, d = a[Q];
        if (5 === d.tag || 6 === d.tag)
            return d;
        for (; a && (d = a[Q]); a = b.pop())
            c = d;
        return c;
    }
    function qb(a) {
        if (5 === a.tag || 6 === a.tag)
            return a.stateNode;
        E('33');
    }
    function rb(a) {
        return a[ob] || null;
    }
    var sb = Object.freeze({
        precacheFiberNode: function (a, b) {
            b[Q] = a;
        },
        getClosestInstanceFromNode: pb,
        getInstanceFromNode: function (a) {
            a = a[Q];
            return !a || 5 !== a.tag && 6 !== a.tag ? null : a;
        },
        getNodeFromInstance: qb,
        getFiberCurrentPropsFromNode: rb,
        updateFiberProps: function (a, b) {
            a[ob] = b;
        }
    });
    function tb(a) {
        do
            a = a['return'];
        while (a && 5 !== a.tag);
        return a ? a : null;
    }
    function ub(a, b, c) {
        for (var d = []; a;)
            d.push(a), a = tb(a);
        for (a = d.length; 0 < a--;)
            b(d[a], 'captured', c);
        for (a = 0; a < d.length; a++)
            b(d[a], 'bubbled', c);
    }
    function vb(a, b, c) {
        if (b = ib(a, c.dispatchConfig.phasedRegistrationNames[b]))
            c._dispatchListeners = $a(c._dispatchListeners, b), c._dispatchInstances = $a(c._dispatchInstances, a);
    }
    function wb(a) {
        a && a.dispatchConfig.phasedRegistrationNames && ub(a._targetInst, vb, a);
    }
    function xb(a) {
        if (a && a.dispatchConfig.phasedRegistrationNames) {
            var b = a._targetInst;
            b = b ? tb(b) : null;
            ub(b, vb, a);
        }
    }
    function yb(a, b, c) {
        a && c && c.dispatchConfig.registrationName && (b = ib(a, c.dispatchConfig.registrationName)) && (c._dispatchListeners = $a(c._dispatchListeners, b), c._dispatchInstances = $a(c._dispatchInstances, a));
    }
    function zb(a) {
        a && a.dispatchConfig.registrationName && yb(a._targetInst, null, a);
    }
    function Ab(a) {
        ab(a, wb);
    }
    function Bb(a, b, c, d) {
        if (c && d)
            a: {
                var e = c;
                for (var f = d, g = 0, h = e; h; h = tb(h))
                    g++;
                h = 0;
                for (var k = f; k; k = tb(k))
                    h++;
                for (; 0 < g - h;)
                    e = tb(e), g--;
                for (; 0 < h - g;)
                    f = tb(f), h--;
                for (; g--;) {
                    if (e === f || e === f.alternate)
                        break a;
                    e = tb(e);
                    f = tb(f);
                }
                e = null;
            }
        else
            e = null;
        f = e;
        for (e = []; c && c !== f;) {
            g = c.alternate;
            if (null !== g && g === f)
                break;
            e.push(c);
            c = tb(c);
        }
        for (c = []; d && d !== f;) {
            g = d.alternate;
            if (null !== g && g === f)
                break;
            c.push(d);
            d = tb(d);
        }
        for (d = 0; d < e.length; d++)
            yb(e[d], 'bubbled', a);
        for (a = c.length; 0 < a--;)
            yb(c[a], 'captured', b);
    }
    var Cb = Object.freeze({
            accumulateTwoPhaseDispatches: Ab,
            accumulateTwoPhaseDispatchesSkipTarget: function (a) {
                ab(a, xb);
            },
            accumulateEnterLeaveDispatches: Bb,
            accumulateDirectDispatches: function (a) {
                ab(a, zb);
            }
        }), Db = null;
    function Eb() {
        !Db && l.canUseDOM && (Db = 'textContent' in document.documentElement ? 'textContent' : 'innerText');
        return Db;
    }
    var S = {
        _root: null,
        _startText: null,
        _fallbackText: null
    };
    function Fb() {
        if (S._fallbackText)
            return S._fallbackText;
        var a, b = S._startText, c = b.length, d, e = Gb(), f = e.length;
        for (a = 0; a < c && b[a] === e[a]; a++);
        var g = c - a;
        for (d = 1; d <= g && b[c - d] === e[f - d]; d++);
        S._fallbackText = e.slice(a, 1 < d ? 1 - d : void 0);
        return S._fallbackText;
    }
    function Gb() {
        return 'value' in S._root ? S._root.value : S._root[Eb()];
    }
    var Hb = 'dispatchConfig _targetInst nativeEvent isDefaultPrevented isPropagationStopped _dispatchListeners _dispatchInstances'.split(' '), Ib = {
            type: null,
            target: null,
            currentTarget: C.thatReturnsNull,
            eventPhase: null,
            bubbles: null,
            cancelable: null,
            timeStamp: function (a) {
                return a.timeStamp || Date.now();
            },
            defaultPrevented: null,
            isTrusted: null
        };
    function T(a, b, c, d) {
        this.dispatchConfig = a;
        this._targetInst = b;
        this.nativeEvent = c;
        a = this.constructor.Interface;
        for (var e in a)
            a.hasOwnProperty(e) && ((b = a[e]) ? this[e] = b(c) : 'target' === e ? this.target = d : this[e] = c[e]);
        this.isDefaultPrevented = (null != c.defaultPrevented ? c.defaultPrevented : !1 === c.returnValue) ? C.thatReturnsTrue : C.thatReturnsFalse;
        this.isPropagationStopped = C.thatReturnsFalse;
        return this;
    }
    B(T.prototype, {
        preventDefault: function () {
            this.defaultPrevented = !0;
            var a = this.nativeEvent;
            a && (a.preventDefault ? a.preventDefault() : 'unknown' !== typeof a.returnValue && (a.returnValue = !1), this.isDefaultPrevented = C.thatReturnsTrue);
        },
        stopPropagation: function () {
            var a = this.nativeEvent;
            a && (a.stopPropagation ? a.stopPropagation() : 'unknown' !== typeof a.cancelBubble && (a.cancelBubble = !0), this.isPropagationStopped = C.thatReturnsTrue);
        },
        persist: function () {
            this.isPersistent = C.thatReturnsTrue;
        },
        isPersistent: C.thatReturnsFalse,
        destructor: function () {
            var a = this.constructor.Interface, b;
            for (b in a)
                this[b] = null;
            for (a = 0; a < Hb.length; a++)
                this[Hb[a]] = null;
        }
    });
    T.Interface = Ib;
    T.augmentClass = function (a, b) {
        function c() {
        }
        c.prototype = this.prototype;
        var d = new c();
        B(d, a.prototype);
        a.prototype = d;
        a.prototype.constructor = a;
        a.Interface = B({}, this.Interface, b);
        a.augmentClass = this.augmentClass;
        Jb(a);
    };
    Jb(T);
    function Kb(a, b, c, d) {
        if (this.eventPool.length) {
            var e = this.eventPool.pop();
            this.call(e, a, b, c, d);
            return e;
        }
        return new this(a, b, c, d);
    }
    function Lb(a) {
        a instanceof this ? void 0 : E('223');
        a.destructor();
        10 > this.eventPool.length && this.eventPool.push(a);
    }
    function Jb(a) {
        a.eventPool = [];
        a.getPooled = Kb;
        a.release = Lb;
    }
    function Mb(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    T.augmentClass(Mb, { data: null });
    function Nb(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    T.augmentClass(Nb, { data: null });
    var Pb = [
            9,
            13,
            27,
            32
        ], Vb = l.canUseDOM && 'CompositionEvent' in window, Wb = null;
    l.canUseDOM && 'documentMode' in document && (Wb = document.documentMode);
    var Xb;
    if (Xb = l.canUseDOM && 'TextEvent' in window && !Wb) {
        var Yb = window.opera;
        Xb = !('object' === typeof Yb && 'function' === typeof Yb.version && 12 >= parseInt(Yb.version(), 10));
    }
    var Zb = Xb, $b = l.canUseDOM && (!Vb || Wb && 8 < Wb && 11 >= Wb), ac = String.fromCharCode(32), bc = {
            beforeInput: {
                phasedRegistrationNames: {
                    bubbled: 'onBeforeInput',
                    captured: 'onBeforeInputCapture'
                },
                dependencies: [
                    'topCompositionEnd',
                    'topKeyPress',
                    'topTextInput',
                    'topPaste'
                ]
            },
            compositionEnd: {
                phasedRegistrationNames: {
                    bubbled: 'onCompositionEnd',
                    captured: 'onCompositionEndCapture'
                },
                dependencies: 'topBlur topCompositionEnd topKeyDown topKeyPress topKeyUp topMouseDown'.split(' ')
            },
            compositionStart: {
                phasedRegistrationNames: {
                    bubbled: 'onCompositionStart',
                    captured: 'onCompositionStartCapture'
                },
                dependencies: 'topBlur topCompositionStart topKeyDown topKeyPress topKeyUp topMouseDown'.split(' ')
            },
            compositionUpdate: {
                phasedRegistrationNames: {
                    bubbled: 'onCompositionUpdate',
                    captured: 'onCompositionUpdateCapture'
                },
                dependencies: 'topBlur topCompositionUpdate topKeyDown topKeyPress topKeyUp topMouseDown'.split(' ')
            }
        }, cc = !1;
    function dc(a, b) {
        switch (a) {
        case 'topKeyUp':
            return -1 !== Pb.indexOf(b.keyCode);
        case 'topKeyDown':
            return 229 !== b.keyCode;
        case 'topKeyPress':
        case 'topMouseDown':
        case 'topBlur':
            return !0;
        default:
            return !1;
        }
    }
    function ec(a) {
        a = a.detail;
        return 'object' === typeof a && 'data' in a ? a.data : null;
    }
    var fc = !1;
    function gc(a, b) {
        switch (a) {
        case 'topCompositionEnd':
            return ec(b);
        case 'topKeyPress':
            if (32 !== b.which)
                return null;
            cc = !0;
            return ac;
        case 'topTextInput':
            return a = b.data, a === ac && cc ? null : a;
        default:
            return null;
        }
    }
    function hc(a, b) {
        if (fc)
            return 'topCompositionEnd' === a || !Vb && dc(a, b) ? (a = Fb(), S._root = null, S._startText = null, S._fallbackText = null, fc = !1, a) : null;
        switch (a) {
        case 'topPaste':
            return null;
        case 'topKeyPress':
            if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
                if (b.char && 1 < b.char.length)
                    return b.char;
                if (b.which)
                    return String.fromCharCode(b.which);
            }
            return null;
        case 'topCompositionEnd':
            return $b ? null : b.data;
        default:
            return null;
        }
    }
    var ic = {
            eventTypes: bc,
            extractEvents: function (a, b, c, d) {
                var e;
                if (Vb)
                    b: {
                        switch (a) {
                        case 'topCompositionStart':
                            var f = bc.compositionStart;
                            break b;
                        case 'topCompositionEnd':
                            f = bc.compositionEnd;
                            break b;
                        case 'topCompositionUpdate':
                            f = bc.compositionUpdate;
                            break b;
                        }
                        f = void 0;
                    }
                else
                    fc ? dc(a, c) && (f = bc.compositionEnd) : 'topKeyDown' === a && 229 === c.keyCode && (f = bc.compositionStart);
                f ? ($b && (fc || f !== bc.compositionStart ? f === bc.compositionEnd && fc && (e = Fb()) : (S._root = d, S._startText = Gb(), fc = !0)), f = Mb.getPooled(f, b, c, d), e ? f.data = e : (e = ec(c), null !== e && (f.data = e)), Ab(f), e = f) : e = null;
                (a = Zb ? gc(a, c) : hc(a, c)) ? (b = Nb.getPooled(bc.beforeInput, b, c, d), b.data = a, Ab(b)) : b = null;
                return [
                    e,
                    b
                ];
            }
        }, jc = null, kc = null, lc = null;
    function mc(a) {
        if (a = Xa(a)) {
            jc && 'function' === typeof jc.restoreControlledState ? void 0 : E('194');
            var b = Wa(a.stateNode);
            jc.restoreControlledState(a.stateNode, a.type, b);
        }
    }
    var nc = {
        injectFiberControlledHostComponent: function (a) {
            jc = a;
        }
    };
    function oc(a) {
        kc ? lc ? lc.push(a) : lc = [a] : kc = a;
    }
    function pc() {
        if (kc) {
            var a = kc, b = lc;
            lc = kc = null;
            mc(a);
            if (b)
                for (a = 0; a < b.length; a++)
                    mc(b[a]);
        }
    }
    var qc = Object.freeze({
        injection: nc,
        enqueueStateRestore: oc,
        restoreStateIfNeeded: pc
    });
    function rc(a, b) {
        return a(b);
    }
    var sc = !1;
    function tc(a, b) {
        if (sc)
            return rc(a, b);
        sc = !0;
        try {
            return rc(a, b);
        } finally {
            sc = !1, pc();
        }
    }
    var uc = {
        color: !0,
        date: !0,
        datetime: !0,
        'datetime-local': !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };
    function vc(a) {
        var b = a && a.nodeName && a.nodeName.toLowerCase();
        return 'input' === b ? !!uc[a.type] : 'textarea' === b ? !0 : !1;
    }
    function wc(a) {
        a = a.target || a.srcElement || window;
        a.correspondingUseElement && (a = a.correspondingUseElement);
        return 3 === a.nodeType ? a.parentNode : a;
    }
    var xc;
    l.canUseDOM && (xc = document.implementation && document.implementation.hasFeature && !0 !== document.implementation.hasFeature('', ''));
    function yc(a, b) {
        if (!l.canUseDOM || b && !('addEventListener' in document))
            return !1;
        b = 'on' + a;
        var c = b in document;
        c || (c = document.createElement('div'), c.setAttribute(b, 'return;'), c = 'function' === typeof c[b]);
        !c && xc && 'wheel' === a && (c = document.implementation.hasFeature('Events.wheel', '3.0'));
        return c;
    }
    function zc(a) {
        var b = a.type;
        return (a = a.nodeName) && 'input' === a.toLowerCase() && ('checkbox' === b || 'radio' === b);
    }
    function Ac(a) {
        var b = zc(a) ? 'checked' : 'value', c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = '' + a[b];
        if (!a.hasOwnProperty(b) && 'function' === typeof c.get && 'function' === typeof c.set)
            return Object.defineProperty(a, b, {
                enumerable: c.enumerable,
                configurable: !0,
                get: function () {
                    return c.get.call(this);
                },
                set: function (a) {
                    d = '' + a;
                    c.set.call(this, a);
                }
            }), {
                getValue: function () {
                    return d;
                },
                setValue: function (a) {
                    d = '' + a;
                },
                stopTracking: function () {
                    a._valueTracker = null;
                    delete a[b];
                }
            };
    }
    function Bc(a) {
        a._valueTracker || (a._valueTracker = Ac(a));
    }
    function Cc(a) {
        if (!a)
            return !1;
        var b = a._valueTracker;
        if (!b)
            return !0;
        var c = b.getValue();
        var d = '';
        a && (d = zc(a) ? a.checked ? 'true' : 'false' : a.value);
        a = d;
        return a !== c ? (b.setValue(a), !0) : !1;
    }
    var Dc = {
        change: {
            phasedRegistrationNames: {
                bubbled: 'onChange',
                captured: 'onChangeCapture'
            },
            dependencies: 'topBlur topChange topClick topFocus topInput topKeyDown topKeyUp topSelectionChange'.split(' ')
        }
    };
    function Ec(a, b, c) {
        a = T.getPooled(Dc.change, a, b, c);
        a.type = 'change';
        oc(c);
        Ab(a);
        return a;
    }
    var Fc = null, Gc = null;
    function Hc(a) {
        kb(a);
        lb(!1);
    }
    function Ic(a) {
        var b = qb(a);
        if (Cc(b))
            return a;
    }
    function Jc(a, b) {
        if ('topChange' === a)
            return b;
    }
    var Kc = !1;
    l.canUseDOM && (Kc = yc('input') && (!document.documentMode || 9 < document.documentMode));
    function Lc() {
        Fc && (Fc.detachEvent('onpropertychange', Mc), Gc = Fc = null);
    }
    function Mc(a) {
        'value' === a.propertyName && Ic(Gc) && (a = Ec(Gc, a, wc(a)), tc(Hc, a));
    }
    function Nc(a, b, c) {
        'topFocus' === a ? (Lc(), Fc = b, Gc = c, Fc.attachEvent('onpropertychange', Mc)) : 'topBlur' === a && Lc();
    }
    function Oc(a) {
        if ('topSelectionChange' === a || 'topKeyUp' === a || 'topKeyDown' === a)
            return Ic(Gc);
    }
    function Pc(a, b) {
        if ('topClick' === a)
            return Ic(b);
    }
    function $c(a, b) {
        if ('topInput' === a || 'topChange' === a)
            return Ic(b);
    }
    var ad = {
        eventTypes: Dc,
        _isInputEventSupported: Kc,
        extractEvents: function (a, b, c, d) {
            var e = b ? qb(b) : window, f = e.nodeName && e.nodeName.toLowerCase();
            if ('select' === f || 'input' === f && 'file' === e.type)
                var g = Jc;
            else if (vc(e))
                if (Kc)
                    g = $c;
                else {
                    g = Oc;
                    var h = Nc;
                }
            else
                f = e.nodeName, !f || 'input' !== f.toLowerCase() || 'checkbox' !== e.type && 'radio' !== e.type || (g = Pc);
            if (g && (g = g(a, b)))
                return Ec(g, c, d);
            h && h(a, e, b);
            'topBlur' === a && null != b && (a = b._wrapperState || e._wrapperState) && a.controlled && 'number' === e.type && (a = '' + e.value, e.getAttribute('value') !== a && e.setAttribute('value', a));
        }
    };
    function bd(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    T.augmentClass(bd, {
        view: null,
        detail: null
    });
    var cd = {
        Alt: 'altKey',
        Control: 'ctrlKey',
        Meta: 'metaKey',
        Shift: 'shiftKey'
    };
    function dd(a) {
        var b = this.nativeEvent;
        return b.getModifierState ? b.getModifierState(a) : (a = cd[a]) ? !!b[a] : !1;
    }
    function ed() {
        return dd;
    }
    function fd(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    bd.augmentClass(fd, {
        screenX: null,
        screenY: null,
        clientX: null,
        clientY: null,
        pageX: null,
        pageY: null,
        ctrlKey: null,
        shiftKey: null,
        altKey: null,
        metaKey: null,
        getModifierState: ed,
        button: null,
        buttons: null,
        relatedTarget: function (a) {
            return a.relatedTarget || (a.fromElement === a.srcElement ? a.toElement : a.fromElement);
        }
    });
    var gd = {
            mouseEnter: {
                registrationName: 'onMouseEnter',
                dependencies: [
                    'topMouseOut',
                    'topMouseOver'
                ]
            },
            mouseLeave: {
                registrationName: 'onMouseLeave',
                dependencies: [
                    'topMouseOut',
                    'topMouseOver'
                ]
            }
        }, hd = {
            eventTypes: gd,
            extractEvents: function (a, b, c, d) {
                if ('topMouseOver' === a && (c.relatedTarget || c.fromElement) || 'topMouseOut' !== a && 'topMouseOver' !== a)
                    return null;
                var e = d.window === d ? d : (e = d.ownerDocument) ? e.defaultView || e.parentWindow : window;
                'topMouseOut' === a ? (a = b, b = (b = c.relatedTarget || c.toElement) ? pb(b) : null) : a = null;
                if (a === b)
                    return null;
                var f = null == a ? e : qb(a);
                e = null == b ? e : qb(b);
                var g = fd.getPooled(gd.mouseLeave, a, c, d);
                g.type = 'mouseleave';
                g.target = f;
                g.relatedTarget = e;
                c = fd.getPooled(gd.mouseEnter, b, c, d);
                c.type = 'mouseenter';
                c.target = e;
                c.relatedTarget = f;
                Bb(g, c, a, b);
                return [
                    g,
                    c
                ];
            }
        }, id = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    function jd(a) {
        a = a.type;
        return 'string' === typeof a ? a : 'function' === typeof a ? a.displayName || a.name : null;
    }
    function kd(a) {
        var b = a;
        if (a.alternate)
            for (; b['return'];)
                b = b['return'];
        else {
            if (0 !== (b.effectTag & 2))
                return 1;
            for (; b['return'];)
                if (b = b['return'], 0 !== (b.effectTag & 2))
                    return 1;
        }
        return 3 === b.tag ? 2 : 3;
    }
    function ld(a) {
        return (a = a._reactInternalFiber) ? 2 === kd(a) : !1;
    }
    function md(a) {
        2 !== kd(a) ? E('188') : void 0;
    }
    function nd(a) {
        var b = a.alternate;
        if (!b)
            return b = kd(a), 3 === b ? E('188') : void 0, 1 === b ? null : a;
        for (var c = a, d = b;;) {
            var e = c['return'], f = e ? e.alternate : null;
            if (!e || !f)
                break;
            if (e.child === f.child) {
                for (var g = e.child; g;) {
                    if (g === c)
                        return md(e), a;
                    if (g === d)
                        return md(e), b;
                    g = g.sibling;
                }
                E('188');
            }
            if (c['return'] !== d['return'])
                c = e, d = f;
            else {
                g = !1;
                for (var h = e.child; h;) {
                    if (h === c) {
                        g = !0;
                        c = e;
                        d = f;
                        break;
                    }
                    if (h === d) {
                        g = !0;
                        d = e;
                        c = f;
                        break;
                    }
                    h = h.sibling;
                }
                if (!g) {
                    for (h = f.child; h;) {
                        if (h === c) {
                            g = !0;
                            c = f;
                            d = e;
                            break;
                        }
                        if (h === d) {
                            g = !0;
                            d = f;
                            c = e;
                            break;
                        }
                        h = h.sibling;
                    }
                    g ? void 0 : E('189');
                }
            }
            c.alternate !== d ? E('190') : void 0;
        }
        3 !== c.tag ? E('188') : void 0;
        return c.stateNode.current === c ? a : b;
    }
    function od(a) {
        a = nd(a);
        if (!a)
            return null;
        for (var b = a;;) {
            if (5 === b.tag || 6 === b.tag)
                return b;
            if (b.child)
                b.child['return'] = b, b = b.child;
            else {
                if (b === a)
                    break;
                for (; !b.sibling;) {
                    if (!b['return'] || b['return'] === a)
                        return null;
                    b = b['return'];
                }
                b.sibling['return'] = b['return'];
                b = b.sibling;
            }
        }
        return null;
    }
    function pd(a) {
        a = nd(a);
        if (!a)
            return null;
        for (var b = a;;) {
            if (5 === b.tag || 6 === b.tag)
                return b;
            if (b.child && 4 !== b.tag)
                b.child['return'] = b, b = b.child;
            else {
                if (b === a)
                    break;
                for (; !b.sibling;) {
                    if (!b['return'] || b['return'] === a)
                        return null;
                    b = b['return'];
                }
                b.sibling['return'] = b['return'];
                b = b.sibling;
            }
        }
        return null;
    }
    var qd = [];
    function rd(a) {
        var b = a.targetInst;
        do {
            if (!b) {
                a.ancestors.push(b);
                break;
            }
            var c;
            for (c = b; c['return'];)
                c = c['return'];
            c = 3 !== c.tag ? null : c.stateNode.containerInfo;
            if (!c)
                break;
            a.ancestors.push(b);
            b = pb(c);
        } while (b);
        for (c = 0; c < a.ancestors.length; c++)
            b = a.ancestors[c], sd(a.topLevelType, b, a.nativeEvent, wc(a.nativeEvent));
    }
    var td = !0, sd = void 0;
    function ud(a) {
        td = !!a;
    }
    function U(a, b, c) {
        return c ? ba.listen(c, b, vd.bind(null, a)) : null;
    }
    function wd(a, b, c) {
        return c ? ba.capture(c, b, vd.bind(null, a)) : null;
    }
    function vd(a, b) {
        if (td) {
            var c = wc(b);
            c = pb(c);
            null === c || 'number' !== typeof c.tag || 2 === kd(c) || (c = null);
            if (qd.length) {
                var d = qd.pop();
                d.topLevelType = a;
                d.nativeEvent = b;
                d.targetInst = c;
                a = d;
            } else
                a = {
                    topLevelType: a,
                    nativeEvent: b,
                    targetInst: c,
                    ancestors: []
                };
            try {
                tc(rd, a);
            } finally {
                a.topLevelType = null, a.nativeEvent = null, a.targetInst = null, a.ancestors.length = 0, 10 > qd.length && qd.push(a);
            }
        }
    }
    var xd = Object.freeze({
        get _enabled() {
            return td;
        },
        get _handleTopLevel() {
            return sd;
        },
        setHandleTopLevel: function (a) {
            sd = a;
        },
        setEnabled: ud,
        isEnabled: function () {
            return td;
        },
        trapBubbledEvent: U,
        trapCapturedEvent: wd,
        dispatchEvent: vd
    });
    function yd(a, b) {
        var c = {};
        c[a.toLowerCase()] = b.toLowerCase();
        c['Webkit' + a] = 'webkit' + b;
        c['Moz' + a] = 'moz' + b;
        c['ms' + a] = 'MS' + b;
        c['O' + a] = 'o' + b.toLowerCase();
        return c;
    }
    var zd = {
            animationend: yd('Animation', 'AnimationEnd'),
            animationiteration: yd('Animation', 'AnimationIteration'),
            animationstart: yd('Animation', 'AnimationStart'),
            transitionend: yd('Transition', 'TransitionEnd')
        }, Ad = {}, Bd = {};
    l.canUseDOM && (Bd = document.createElement('div').style, 'AnimationEvent' in window || (delete zd.animationend.animation, delete zd.animationiteration.animation, delete zd.animationstart.animation), 'TransitionEvent' in window || delete zd.transitionend.transition);
    function Cd(a) {
        if (Ad[a])
            return Ad[a];
        if (!zd[a])
            return a;
        var b = zd[a], c;
        for (c in b)
            if (b.hasOwnProperty(c) && c in Bd)
                return Ad[a] = b[c];
        return '';
    }
    var Dd = {
            topAbort: 'abort',
            topAnimationEnd: Cd('animationend') || 'animationend',
            topAnimationIteration: Cd('animationiteration') || 'animationiteration',
            topAnimationStart: Cd('animationstart') || 'animationstart',
            topBlur: 'blur',
            topCancel: 'cancel',
            topCanPlay: 'canplay',
            topCanPlayThrough: 'canplaythrough',
            topChange: 'change',
            topClick: 'click',
            topClose: 'close',
            topCompositionEnd: 'compositionend',
            topCompositionStart: 'compositionstart',
            topCompositionUpdate: 'compositionupdate',
            topContextMenu: 'contextmenu',
            topCopy: 'copy',
            topCut: 'cut',
            topDoubleClick: 'dblclick',
            topDrag: 'drag',
            topDragEnd: 'dragend',
            topDragEnter: 'dragenter',
            topDragExit: 'dragexit',
            topDragLeave: 'dragleave',
            topDragOver: 'dragover',
            topDragStart: 'dragstart',
            topDrop: 'drop',
            topDurationChange: 'durationchange',
            topEmptied: 'emptied',
            topEncrypted: 'encrypted',
            topEnded: 'ended',
            topError: 'error',
            topFocus: 'focus',
            topInput: 'input',
            topKeyDown: 'keydown',
            topKeyPress: 'keypress',
            topKeyUp: 'keyup',
            topLoadedData: 'loadeddata',
            topLoad: 'load',
            topLoadedMetadata: 'loadedmetadata',
            topLoadStart: 'loadstart',
            topMouseDown: 'mousedown',
            topMouseMove: 'mousemove',
            topMouseOut: 'mouseout',
            topMouseOver: 'mouseover',
            topMouseUp: 'mouseup',
            topPaste: 'paste',
            topPause: 'pause',
            topPlay: 'play',
            topPlaying: 'playing',
            topProgress: 'progress',
            topRateChange: 'ratechange',
            topScroll: 'scroll',
            topSeeked: 'seeked',
            topSeeking: 'seeking',
            topSelectionChange: 'selectionchange',
            topStalled: 'stalled',
            topSuspend: 'suspend',
            topTextInput: 'textInput',
            topTimeUpdate: 'timeupdate',
            topToggle: 'toggle',
            topTouchCancel: 'touchcancel',
            topTouchEnd: 'touchend',
            topTouchMove: 'touchmove',
            topTouchStart: 'touchstart',
            topTransitionEnd: Cd('transitionend') || 'transitionend',
            topVolumeChange: 'volumechange',
            topWaiting: 'waiting',
            topWheel: 'wheel'
        }, Ed = {}, Fd = 0, Gd = '_reactListenersID' + ('' + Math.random()).slice(2);
    function Hd(a) {
        Object.prototype.hasOwnProperty.call(a, Gd) || (a[Gd] = Fd++, Ed[a[Gd]] = {});
        return Ed[a[Gd]];
    }
    function Id(a) {
        for (; a && a.firstChild;)
            a = a.firstChild;
        return a;
    }
    function Jd(a, b) {
        var c = Id(a);
        a = 0;
        for (var d; c;) {
            if (3 === c.nodeType) {
                d = a + c.textContent.length;
                if (a <= b && d >= b)
                    return {
                        node: c,
                        offset: b - a
                    };
                a = d;
            }
            a: {
                for (; c;) {
                    if (c.nextSibling) {
                        c = c.nextSibling;
                        break a;
                    }
                    c = c.parentNode;
                }
                c = void 0;
            }
            c = Id(c);
        }
    }
    function Kd(a) {
        var b = a && a.nodeName && a.nodeName.toLowerCase();
        return b && ('input' === b && 'text' === a.type || 'textarea' === b || 'true' === a.contentEditable);
    }
    var Ld = l.canUseDOM && 'documentMode' in document && 11 >= document.documentMode, Md = {
            select: {
                phasedRegistrationNames: {
                    bubbled: 'onSelect',
                    captured: 'onSelectCapture'
                },
                dependencies: 'topBlur topContextMenu topFocus topKeyDown topKeyUp topMouseDown topMouseUp topSelectionChange'.split(' ')
            }
        }, Nd = null, Od = null, Pd = null, Qd = !1;
    function Rd(a, b) {
        if (Qd || null == Nd || Nd !== da())
            return null;
        var c = Nd;
        'selectionStart' in c && Kd(c) ? c = {
            start: c.selectionStart,
            end: c.selectionEnd
        } : window.getSelection ? (c = window.getSelection(), c = {
            anchorNode: c.anchorNode,
            anchorOffset: c.anchorOffset,
            focusNode: c.focusNode,
            focusOffset: c.focusOffset
        }) : c = void 0;
        return Pd && ea(Pd, c) ? null : (Pd = c, a = T.getPooled(Md.select, Od, a, b), a.type = 'select', a.target = Nd, Ab(a), a);
    }
    var Sd = {
        eventTypes: Md,
        extractEvents: function (a, b, c, d) {
            var e = d.window === d ? d.document : 9 === d.nodeType ? d : d.ownerDocument, f;
            if (!(f = !e)) {
                a: {
                    e = Hd(e);
                    f = Sa.onSelect;
                    for (var g = 0; g < f.length; g++) {
                        var h = f[g];
                        if (!e.hasOwnProperty(h) || !e[h]) {
                            e = !1;
                            break a;
                        }
                    }
                    e = !0;
                }
                f = !e;
            }
            if (f)
                return null;
            e = b ? qb(b) : window;
            switch (a) {
            case 'topFocus':
                if (vc(e) || 'true' === e.contentEditable)
                    Nd = e, Od = b, Pd = null;
                break;
            case 'topBlur':
                Pd = Od = Nd = null;
                break;
            case 'topMouseDown':
                Qd = !0;
                break;
            case 'topContextMenu':
            case 'topMouseUp':
                return Qd = !1, Rd(c, d);
            case 'topSelectionChange':
                if (Ld)
                    break;
            case 'topKeyDown':
            case 'topKeyUp':
                return Rd(c, d);
            }
            return null;
        }
    };
    function Td(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    T.augmentClass(Td, {
        animationName: null,
        elapsedTime: null,
        pseudoElement: null
    });
    function Ud(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    T.augmentClass(Ud, {
        clipboardData: function (a) {
            return 'clipboardData' in a ? a.clipboardData : window.clipboardData;
        }
    });
    function Vd(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    bd.augmentClass(Vd, { relatedTarget: null });
    function Wd(a) {
        var b = a.keyCode;
        'charCode' in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
        return 32 <= a || 13 === a ? a : 0;
    }
    var Xd = {
            Esc: 'Escape',
            Spacebar: ' ',
            Left: 'ArrowLeft',
            Up: 'ArrowUp',
            Right: 'ArrowRight',
            Down: 'ArrowDown',
            Del: 'Delete',
            Win: 'OS',
            Menu: 'ContextMenu',
            Apps: 'ContextMenu',
            Scroll: 'ScrollLock',
            MozPrintableKey: 'Unidentified'
        }, Yd = {
            8: 'Backspace',
            9: 'Tab',
            12: 'Clear',
            13: 'Enter',
            16: 'Shift',
            17: 'Control',
            18: 'Alt',
            19: 'Pause',
            20: 'CapsLock',
            27: 'Escape',
            32: ' ',
            33: 'PageUp',
            34: 'PageDown',
            35: 'End',
            36: 'Home',
            37: 'ArrowLeft',
            38: 'ArrowUp',
            39: 'ArrowRight',
            40: 'ArrowDown',
            45: 'Insert',
            46: 'Delete',
            112: 'F1',
            113: 'F2',
            114: 'F3',
            115: 'F4',
            116: 'F5',
            117: 'F6',
            118: 'F7',
            119: 'F8',
            120: 'F9',
            121: 'F10',
            122: 'F11',
            123: 'F12',
            144: 'NumLock',
            145: 'ScrollLock',
            224: 'Meta'
        };
    function Zd(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    bd.augmentClass(Zd, {
        key: function (a) {
            if (a.key) {
                var b = Xd[a.key] || a.key;
                if ('Unidentified' !== b)
                    return b;
            }
            return 'keypress' === a.type ? (a = Wd(a), 13 === a ? 'Enter' : String.fromCharCode(a)) : 'keydown' === a.type || 'keyup' === a.type ? Yd[a.keyCode] || 'Unidentified' : '';
        },
        location: null,
        ctrlKey: null,
        shiftKey: null,
        altKey: null,
        metaKey: null,
        repeat: null,
        locale: null,
        getModifierState: ed,
        charCode: function (a) {
            return 'keypress' === a.type ? Wd(a) : 0;
        },
        keyCode: function (a) {
            return 'keydown' === a.type || 'keyup' === a.type ? a.keyCode : 0;
        },
        which: function (a) {
            return 'keypress' === a.type ? Wd(a) : 'keydown' === a.type || 'keyup' === a.type ? a.keyCode : 0;
        }
    });
    function $d(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    fd.augmentClass($d, { dataTransfer: null });
    function ae(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    bd.augmentClass(ae, {
        touches: null,
        targetTouches: null,
        changedTouches: null,
        altKey: null,
        metaKey: null,
        ctrlKey: null,
        shiftKey: null,
        getModifierState: ed
    });
    function be(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    T.augmentClass(be, {
        propertyName: null,
        elapsedTime: null,
        pseudoElement: null
    });
    function ce(a, b, c, d) {
        return T.call(this, a, b, c, d);
    }
    fd.augmentClass(ce, {
        deltaX: function (a) {
            return 'deltaX' in a ? a.deltaX : 'wheelDeltaX' in a ? -a.wheelDeltaX : 0;
        },
        deltaY: function (a) {
            return 'deltaY' in a ? a.deltaY : 'wheelDeltaY' in a ? -a.wheelDeltaY : 'wheelDelta' in a ? -a.wheelDelta : 0;
        },
        deltaZ: null,
        deltaMode: null
    });
    var de = {}, ee = {};
    'abort animationEnd animationIteration animationStart blur cancel canPlay canPlayThrough click close contextMenu copy cut doubleClick drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error focus input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing progress rateChange reset scroll seeked seeking stalled submit suspend timeUpdate toggle touchCancel touchEnd touchMove touchStart transitionEnd volumeChange waiting wheel'.split(' ').forEach(function (a) {
        var b = a[0].toUpperCase() + a.slice(1), c = 'on' + b;
        b = 'top' + b;
        c = {
            phasedRegistrationNames: {
                bubbled: c,
                captured: c + 'Capture'
            },
            dependencies: [b]
        };
        de[a] = c;
        ee[b] = c;
    });
    var fe = {
        eventTypes: de,
        extractEvents: function (a, b, c, d) {
            var e = ee[a];
            if (!e)
                return null;
            switch (a) {
            case 'topKeyPress':
                if (0 === Wd(c))
                    return null;
            case 'topKeyDown':
            case 'topKeyUp':
                a = Zd;
                break;
            case 'topBlur':
            case 'topFocus':
                a = Vd;
                break;
            case 'topClick':
                if (2 === c.button)
                    return null;
            case 'topDoubleClick':
            case 'topMouseDown':
            case 'topMouseMove':
            case 'topMouseUp':
            case 'topMouseOut':
            case 'topMouseOver':
            case 'topContextMenu':
                a = fd;
                break;
            case 'topDrag':
            case 'topDragEnd':
            case 'topDragEnter':
            case 'topDragExit':
            case 'topDragLeave':
            case 'topDragOver':
            case 'topDragStart':
            case 'topDrop':
                a = $d;
                break;
            case 'topTouchCancel':
            case 'topTouchEnd':
            case 'topTouchMove':
            case 'topTouchStart':
                a = ae;
                break;
            case 'topAnimationEnd':
            case 'topAnimationIteration':
            case 'topAnimationStart':
                a = Td;
                break;
            case 'topTransitionEnd':
                a = be;
                break;
            case 'topScroll':
                a = bd;
                break;
            case 'topWheel':
                a = ce;
                break;
            case 'topCopy':
            case 'topCut':
            case 'topPaste':
                a = Ud;
                break;
            default:
                a = T;
            }
            b = a.getPooled(e, b, c, d);
            Ab(b);
            return b;
        }
    };
    sd = function (a, b, c, d) {
        a = jb(a, b, c, d);
        kb(a);
        lb(!1);
    };
    hb.injectEventPluginOrder('ResponderEventPlugin SimpleEventPlugin TapEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin'.split(' '));
    Wa = sb.getFiberCurrentPropsFromNode;
    Xa = sb.getInstanceFromNode;
    Ya = sb.getNodeFromInstance;
    hb.injectEventPluginsByName({
        SimpleEventPlugin: fe,
        EnterLeaveEventPlugin: hd,
        ChangeEventPlugin: ad,
        SelectEventPlugin: Sd,
        BeforeInputEventPlugin: ic
    });
    var ge = [], he = -1;
    function V(a) {
        0 > he || (a.current = ge[he], ge[he] = null, he--);
    }
    function W(a, b) {
        he++;
        ge[he] = a.current;
        a.current = b;
    }
    new Set();
    var ie = { current: D }, X = { current: !1 }, je = D;
    function ke(a) {
        return le(a) ? je : ie.current;
    }
    function me(a, b) {
        var c = a.type.contextTypes;
        if (!c)
            return D;
        var d = a.stateNode;
        if (d && d.__reactInternalMemoizedUnmaskedChildContext === b)
            return d.__reactInternalMemoizedMaskedChildContext;
        var e = {}, f;
        for (f in c)
            e[f] = b[f];
        d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
        return e;
    }
    function le(a) {
        return 2 === a.tag && null != a.type.childContextTypes;
    }
    function ne(a) {
        le(a) && (V(X, a), V(ie, a));
    }
    function oe(a, b, c) {
        null != ie.cursor ? E('168') : void 0;
        W(ie, b, a);
        W(X, c, a);
    }
    function pe(a, b) {
        var c = a.stateNode, d = a.type.childContextTypes;
        if ('function' !== typeof c.getChildContext)
            return b;
        c = c.getChildContext();
        for (var e in c)
            e in d ? void 0 : E('108', jd(a) || 'Unknown', e);
        return B({}, b, c);
    }
    function qe(a) {
        if (!le(a))
            return !1;
        var b = a.stateNode;
        b = b && b.__reactInternalMemoizedMergedChildContext || D;
        je = ie.current;
        W(ie, b, a);
        W(X, X.current, a);
        return !0;
    }
    function re(a, b) {
        var c = a.stateNode;
        c ? void 0 : E('169');
        if (b) {
            var d = pe(a, je);
            c.__reactInternalMemoizedMergedChildContext = d;
            V(X, a);
            V(ie, a);
            W(ie, d, a);
        } else
            V(X, a);
        W(X, b, a);
    }
    function Y(a, b, c) {
        this.tag = a;
        this.key = b;
        this.stateNode = this.type = null;
        this.sibling = this.child = this['return'] = null;
        this.index = 0;
        this.memoizedState = this.updateQueue = this.memoizedProps = this.pendingProps = this.ref = null;
        this.internalContextTag = c;
        this.effectTag = 0;
        this.lastEffect = this.firstEffect = this.nextEffect = null;
        this.expirationTime = 0;
        this.alternate = null;
    }
    function se(a, b, c) {
        var d = a.alternate;
        null === d ? (d = new Y(a.tag, a.key, a.internalContextTag), d.type = a.type, d.stateNode = a.stateNode, d.alternate = a, a.alternate = d) : (d.effectTag = 0, d.nextEffect = null, d.firstEffect = null, d.lastEffect = null);
        d.expirationTime = c;
        d.pendingProps = b;
        d.child = a.child;
        d.memoizedProps = a.memoizedProps;
        d.memoizedState = a.memoizedState;
        d.updateQueue = a.updateQueue;
        d.sibling = a.sibling;
        d.index = a.index;
        d.ref = a.ref;
        return d;
    }
    function te(a, b, c) {
        var d = void 0, e = a.type, f = a.key;
        'function' === typeof e ? (d = e.prototype && e.prototype.isReactComponent ? new Y(2, f, b) : new Y(0, f, b), d.type = e, d.pendingProps = a.props) : 'string' === typeof e ? (d = new Y(5, f, b), d.type = e, d.pendingProps = a.props) : 'object' === typeof e && null !== e && 'number' === typeof e.tag ? (d = e, d.pendingProps = a.props) : E('130', null == e ? e : typeof e, '');
        d.expirationTime = c;
        return d;
    }
    function ue(a, b, c, d) {
        b = new Y(10, d, b);
        b.pendingProps = a;
        b.expirationTime = c;
        return b;
    }
    function ve(a, b, c) {
        b = new Y(6, null, b);
        b.pendingProps = a;
        b.expirationTime = c;
        return b;
    }
    function we(a, b, c) {
        b = new Y(7, a.key, b);
        b.type = a.handler;
        b.pendingProps = a;
        b.expirationTime = c;
        return b;
    }
    function xe(a, b, c) {
        a = new Y(9, null, b);
        a.expirationTime = c;
        return a;
    }
    function ye(a, b, c) {
        b = new Y(4, a.key, b);
        b.pendingProps = a.children || [];
        b.expirationTime = c;
        b.stateNode = {
            containerInfo: a.containerInfo,
            pendingChildren: null,
            implementation: a.implementation
        };
        return b;
    }
    var ze = null, Ae = null;
    function Be(a) {
        return function (b) {
            try {
                return a(b);
            } catch (c) {
            }
        };
    }
    function Ce(a) {
        if ('undefined' === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__)
            return !1;
        var b = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (b.isDisabled || !b.supportsFiber)
            return !0;
        try {
            var c = b.inject(a);
            ze = Be(function (a) {
                return b.onCommitFiberRoot(c, a);
            });
            Ae = Be(function (a) {
                return b.onCommitFiberUnmount(c, a);
            });
        } catch (d) {
        }
        return !0;
    }
    function De(a) {
        'function' === typeof ze && ze(a);
    }
    function Ee(a) {
        'function' === typeof Ae && Ae(a);
    }
    function Fe(a) {
        return {
            baseState: a,
            expirationTime: 0,
            first: null,
            last: null,
            callbackList: null,
            hasForceUpdate: !1,
            isInitialized: !1
        };
    }
    function Ge(a, b) {
        null === a.last ? a.first = a.last = b : (a.last.next = b, a.last = b);
        if (0 === a.expirationTime || a.expirationTime > b.expirationTime)
            a.expirationTime = b.expirationTime;
    }
    function He(a, b) {
        var c = a.alternate, d = a.updateQueue;
        null === d && (d = a.updateQueue = Fe(null));
        null !== c ? (a = c.updateQueue, null === a && (a = c.updateQueue = Fe(null))) : a = null;
        a = a !== d ? a : null;
        null === a ? Ge(d, b) : null === d.last || null === a.last ? (Ge(d, b), Ge(a, b)) : (Ge(d, b), a.last = b);
    }
    function Ie(a, b, c, d) {
        a = a.partialState;
        return 'function' === typeof a ? a.call(b, c, d) : a;
    }
    function Je(a, b, c, d, e, f) {
        null !== a && a.updateQueue === c && (c = b.updateQueue = {
            baseState: c.baseState,
            expirationTime: c.expirationTime,
            first: c.first,
            last: c.last,
            isInitialized: c.isInitialized,
            callbackList: null,
            hasForceUpdate: !1
        });
        c.expirationTime = 0;
        c.isInitialized ? a = c.baseState : (a = c.baseState = b.memoizedState, c.isInitialized = !0);
        for (var g = !0, h = c.first, k = !1; null !== h;) {
            var q = h.expirationTime;
            if (q > f) {
                var v = c.expirationTime;
                if (0 === v || v > q)
                    c.expirationTime = q;
                k || (k = !0, c.baseState = a);
            } else {
                k || (c.first = h.next, null === c.first && (c.last = null));
                if (h.isReplace)
                    a = Ie(h, d, a, e), g = !0;
                else if (q = Ie(h, d, a, e))
                    a = g ? B({}, a, q) : B(a, q), g = !1;
                h.isForced && (c.hasForceUpdate = !0);
                null !== h.callback && (q = c.callbackList, null === q && (q = c.callbackList = []), q.push(h));
            }
            h = h.next;
        }
        null !== c.callbackList ? b.effectTag |= 32 : null !== c.first || c.hasForceUpdate || (b.updateQueue = null);
        k || (c.baseState = a);
        return a;
    }
    function Ke(a, b) {
        var c = a.callbackList;
        if (null !== c)
            for (a.callbackList = null, a = 0; a < c.length; a++) {
                var d = c[a], e = d.callback;
                d.callback = null;
                'function' !== typeof e ? E('191', e) : void 0;
                e.call(b);
            }
    }
    function Le(a, b, c, d) {
        function e(a, b) {
            b.updater = f;
            a.stateNode = b;
            b._reactInternalFiber = a;
        }
        var f = {
            isMounted: ld,
            enqueueSetState: function (c, d, e) {
                c = c._reactInternalFiber;
                e = void 0 === e ? null : e;
                var g = b(c);
                He(c, {
                    expirationTime: g,
                    partialState: d,
                    callback: e,
                    isReplace: !1,
                    isForced: !1,
                    nextCallback: null,
                    next: null
                });
                a(c, g);
            },
            enqueueReplaceState: function (c, d, e) {
                c = c._reactInternalFiber;
                e = void 0 === e ? null : e;
                var g = b(c);
                He(c, {
                    expirationTime: g,
                    partialState: d,
                    callback: e,
                    isReplace: !0,
                    isForced: !1,
                    nextCallback: null,
                    next: null
                });
                a(c, g);
            },
            enqueueForceUpdate: function (c, d) {
                c = c._reactInternalFiber;
                d = void 0 === d ? null : d;
                var e = b(c);
                He(c, {
                    expirationTime: e,
                    partialState: null,
                    callback: d,
                    isReplace: !1,
                    isForced: !0,
                    nextCallback: null,
                    next: null
                });
                a(c, e);
            }
        };
        return {
            adoptClassInstance: e,
            constructClassInstance: function (a, b) {
                var c = a.type, d = ke(a), f = 2 === a.tag && null != a.type.contextTypes, g = f ? me(a, d) : D;
                b = new c(b, g);
                e(a, b);
                f && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = d, a.__reactInternalMemoizedMaskedChildContext = g);
                return b;
            },
            mountClassInstance: function (a, b) {
                var c = a.alternate, d = a.stateNode, e = d.state || null, g = a.pendingProps;
                g ? void 0 : E('158');
                var h = ke(a);
                d.props = g;
                d.state = a.memoizedState = e;
                d.refs = D;
                d.context = me(a, h);
                null != a.type && null != a.type.prototype && !0 === a.type.prototype.unstable_isAsyncReactComponent && (a.internalContextTag |= 1);
                'function' === typeof d.componentWillMount && (e = d.state, d.componentWillMount(), e !== d.state && f.enqueueReplaceState(d, d.state, null), e = a.updateQueue, null !== e && (d.state = Je(c, a, e, d, g, b)));
                'function' === typeof d.componentDidMount && (a.effectTag |= 4);
            },
            updateClassInstance: function (a, b, e) {
                var g = b.stateNode;
                g.props = b.memoizedProps;
                g.state = b.memoizedState;
                var h = b.memoizedProps, k = b.pendingProps;
                k || (k = h, null == k ? E('159') : void 0);
                var u = g.context, z = ke(b);
                z = me(b, z);
                'function' !== typeof g.componentWillReceiveProps || h === k && u === z || (u = g.state, g.componentWillReceiveProps(k, z), g.state !== u && f.enqueueReplaceState(g, g.state, null));
                u = b.memoizedState;
                e = null !== b.updateQueue ? Je(a, b, b.updateQueue, g, k, e) : u;
                if (!(h !== k || u !== e || X.current || null !== b.updateQueue && b.updateQueue.hasForceUpdate))
                    return 'function' !== typeof g.componentDidUpdate || h === a.memoizedProps && u === a.memoizedState || (b.effectTag |= 4), !1;
                var G = k;
                if (null === h || null !== b.updateQueue && b.updateQueue.hasForceUpdate)
                    G = !0;
                else {
                    var I = b.stateNode, L = b.type;
                    G = 'function' === typeof I.shouldComponentUpdate ? I.shouldComponentUpdate(G, e, z) : L.prototype && L.prototype.isPureReactComponent ? !ea(h, G) || !ea(u, e) : !0;
                }
                G ? ('function' === typeof g.componentWillUpdate && g.componentWillUpdate(k, e, z), 'function' === typeof g.componentDidUpdate && (b.effectTag |= 4)) : ('function' !== typeof g.componentDidUpdate || h === a.memoizedProps && u === a.memoizedState || (b.effectTag |= 4), c(b, k), d(b, e));
                g.props = k;
                g.state = e;
                g.context = z;
                return G;
            }
        };
    }
    var Qe = 'function' === typeof Symbol && Symbol['for'], Re = Qe ? Symbol['for']('react.element') : 60103, Se = Qe ? Symbol['for']('react.call') : 60104, Te = Qe ? Symbol['for']('react.return') : 60105, Ue = Qe ? Symbol['for']('react.portal') : 60106, Ve = Qe ? Symbol['for']('react.fragment') : 60107, We = 'function' === typeof Symbol && Symbol.iterator;
    function Xe(a) {
        if (null === a || 'undefined' === typeof a)
            return null;
        a = We && a[We] || a['@@iterator'];
        return 'function' === typeof a ? a : null;
    }
    var Ye = Array.isArray;
    function Ze(a, b) {
        var c = b.ref;
        if (null !== c && 'function' !== typeof c) {
            if (b._owner) {
                b = b._owner;
                var d = void 0;
                b && (2 !== b.tag ? E('110') : void 0, d = b.stateNode);
                d ? void 0 : E('147', c);
                var e = '' + c;
                if (null !== a && null !== a.ref && a.ref._stringRef === e)
                    return a.ref;
                a = function (a) {
                    var b = d.refs === D ? d.refs = {} : d.refs;
                    null === a ? delete b[e] : b[e] = a;
                };
                a._stringRef = e;
                return a;
            }
            'string' !== typeof c ? E('148') : void 0;
            b._owner ? void 0 : E('149', c);
        }
        return c;
    }
    function $e(a, b) {
        'textarea' !== a.type && E('31', '[object Object]' === Object.prototype.toString.call(b) ? 'object with keys {' + Object.keys(b).join(', ') + '}' : b, '');
    }
    function af(a) {
        function b(b, c) {
            if (a) {
                var d = b.lastEffect;
                null !== d ? (d.nextEffect = c, b.lastEffect = c) : b.firstEffect = b.lastEffect = c;
                c.nextEffect = null;
                c.effectTag = 8;
            }
        }
        function c(c, d) {
            if (!a)
                return null;
            for (; null !== d;)
                b(c, d), d = d.sibling;
            return null;
        }
        function d(a, b) {
            for (a = new Map(); null !== b;)
                null !== b.key ? a.set(b.key, b) : a.set(b.index, b), b = b.sibling;
            return a;
        }
        function e(a, b, c) {
            a = se(a, b, c);
            a.index = 0;
            a.sibling = null;
            return a;
        }
        function f(b, c, d) {
            b.index = d;
            if (!a)
                return c;
            d = b.alternate;
            if (null !== d)
                return d = d.index, d < c ? (b.effectTag = 2, c) : d;
            b.effectTag = 2;
            return c;
        }
        function g(b) {
            a && null === b.alternate && (b.effectTag = 2);
            return b;
        }
        function h(a, b, c, d) {
            if (null === b || 6 !== b.tag)
                return b = ve(c, a.internalContextTag, d), b['return'] = a, b;
            b = e(b, c, d);
            b['return'] = a;
            return b;
        }
        function k(a, b, c, d) {
            if (null !== b && b.type === c.type)
                return d = e(b, c.props, d), d.ref = Ze(b, c), d['return'] = a, d;
            d = te(c, a.internalContextTag, d);
            d.ref = Ze(b, c);
            d['return'] = a;
            return d;
        }
        function q(a, b, c, d) {
            if (null === b || 7 !== b.tag)
                return b = we(c, a.internalContextTag, d), b['return'] = a, b;
            b = e(b, c, d);
            b['return'] = a;
            return b;
        }
        function v(a, b, c, d) {
            if (null === b || 9 !== b.tag)
                return b = xe(c, a.internalContextTag, d), b.type = c.value, b['return'] = a, b;
            b = e(b, null, d);
            b.type = c.value;
            b['return'] = a;
            return b;
        }
        function y(a, b, c, d) {
            if (null === b || 4 !== b.tag || b.stateNode.containerInfo !== c.containerInfo || b.stateNode.implementation !== c.implementation)
                return b = ye(c, a.internalContextTag, d), b['return'] = a, b;
            b = e(b, c.children || [], d);
            b['return'] = a;
            return b;
        }
        function u(a, b, c, d, f) {
            if (null === b || 10 !== b.tag)
                return b = ue(c, a.internalContextTag, d, f), b['return'] = a, b;
            b = e(b, c, d);
            b['return'] = a;
            return b;
        }
        function z(a, b, c) {
            if ('string' === typeof b || 'number' === typeof b)
                return b = ve('' + b, a.internalContextTag, c), b['return'] = a, b;
            if ('object' === typeof b && null !== b) {
                switch (b.$$typeof) {
                case Re:
                    if (b.type === Ve)
                        return b = ue(b.props.children, a.internalContextTag, c, b.key), b['return'] = a, b;
                    c = te(b, a.internalContextTag, c);
                    c.ref = Ze(null, b);
                    c['return'] = a;
                    return c;
                case Se:
                    return b = we(b, a.internalContextTag, c), b['return'] = a, b;
                case Te:
                    return c = xe(b, a.internalContextTag, c), c.type = b.value, c['return'] = a, c;
                case Ue:
                    return b = ye(b, a.internalContextTag, c), b['return'] = a, b;
                }
                if (Ye(b) || Xe(b))
                    return b = ue(b, a.internalContextTag, c, null), b['return'] = a, b;
                $e(a, b);
            }
            return null;
        }
        function G(a, b, c, d) {
            var e = null !== b ? b.key : null;
            if ('string' === typeof c || 'number' === typeof c)
                return null !== e ? null : h(a, b, '' + c, d);
            if ('object' === typeof c && null !== c) {
                switch (c.$$typeof) {
                case Re:
                    return c.key === e ? c.type === Ve ? u(a, b, c.props.children, d, e) : k(a, b, c, d) : null;
                case Se:
                    return c.key === e ? q(a, b, c, d) : null;
                case Te:
                    return null === e ? v(a, b, c, d) : null;
                case Ue:
                    return c.key === e ? y(a, b, c, d) : null;
                }
                if (Ye(c) || Xe(c))
                    return null !== e ? null : u(a, b, c, d, null);
                $e(a, c);
            }
            return null;
        }
        function I(a, b, c, d, e) {
            if ('string' === typeof d || 'number' === typeof d)
                return a = a.get(c) || null, h(b, a, '' + d, e);
            if ('object' === typeof d && null !== d) {
                switch (d.$$typeof) {
                case Re:
                    return a = a.get(null === d.key ? c : d.key) || null, d.type === Ve ? u(b, a, d.props.children, e, d.key) : k(b, a, d, e);
                case Se:
                    return a = a.get(null === d.key ? c : d.key) || null, q(b, a, d, e);
                case Te:
                    return a = a.get(c) || null, v(b, a, d, e);
                case Ue:
                    return a = a.get(null === d.key ? c : d.key) || null, y(b, a, d, e);
                }
                if (Ye(d) || Xe(d))
                    return a = a.get(c) || null, u(b, a, d, e, null);
                $e(b, d);
            }
            return null;
        }
        function L(e, g, m, A) {
            for (var h = null, r = null, n = g, w = g = 0, k = null; null !== n && w < m.length; w++) {
                n.index > w ? (k = n, n = null) : k = n.sibling;
                var x = G(e, n, m[w], A);
                if (null === x) {
                    null === n && (n = k);
                    break;
                }
                a && n && null === x.alternate && b(e, n);
                g = f(x, g, w);
                null === r ? h = x : r.sibling = x;
                r = x;
                n = k;
            }
            if (w === m.length)
                return c(e, n), h;
            if (null === n) {
                for (; w < m.length; w++)
                    if (n = z(e, m[w], A))
                        g = f(n, g, w), null === r ? h = n : r.sibling = n, r = n;
                return h;
            }
            for (n = d(e, n); w < m.length; w++)
                if (k = I(n, e, w, m[w], A)) {
                    if (a && null !== k.alternate)
                        n['delete'](null === k.key ? w : k.key);
                    g = f(k, g, w);
                    null === r ? h = k : r.sibling = k;
                    r = k;
                }
            a && n.forEach(function (a) {
                return b(e, a);
            });
            return h;
        }
        function N(e, g, m, A) {
            var h = Xe(m);
            'function' !== typeof h ? E('150') : void 0;
            m = h.call(m);
            null == m ? E('151') : void 0;
            for (var r = h = null, n = g, w = g = 0, k = null, x = m.next(); null !== n && !x.done; w++, x = m.next()) {
                n.index > w ? (k = n, n = null) : k = n.sibling;
                var J = G(e, n, x.value, A);
                if (null === J) {
                    n || (n = k);
                    break;
                }
                a && n && null === J.alternate && b(e, n);
                g = f(J, g, w);
                null === r ? h = J : r.sibling = J;
                r = J;
                n = k;
            }
            if (x.done)
                return c(e, n), h;
            if (null === n) {
                for (; !x.done; w++, x = m.next())
                    x = z(e, x.value, A), null !== x && (g = f(x, g, w), null === r ? h = x : r.sibling = x, r = x);
                return h;
            }
            for (n = d(e, n); !x.done; w++, x = m.next())
                if (x = I(n, e, w, x.value, A), null !== x) {
                    if (a && null !== x.alternate)
                        n['delete'](null === x.key ? w : x.key);
                    g = f(x, g, w);
                    null === r ? h = x : r.sibling = x;
                    r = x;
                }
            a && n.forEach(function (a) {
                return b(e, a);
            });
            return h;
        }
        return function (a, d, f, h) {
            'object' === typeof f && null !== f && f.type === Ve && null === f.key && (f = f.props.children);
            var m = 'object' === typeof f && null !== f;
            if (m)
                switch (f.$$typeof) {
                case Re:
                    a: {
                        var r = f.key;
                        for (m = d; null !== m;) {
                            if (m.key === r)
                                if (10 === m.tag ? f.type === Ve : m.type === f.type) {
                                    c(a, m.sibling);
                                    d = e(m, f.type === Ve ? f.props.children : f.props, h);
                                    d.ref = Ze(m, f);
                                    d['return'] = a;
                                    a = d;
                                    break a;
                                } else {
                                    c(a, m);
                                    break;
                                }
                            else
                                b(a, m);
                            m = m.sibling;
                        }
                        f.type === Ve ? (d = ue(f.props.children, a.internalContextTag, h, f.key), d['return'] = a, a = d) : (h = te(f, a.internalContextTag, h), h.ref = Ze(d, f), h['return'] = a, a = h);
                    }
                    return g(a);
                case Se:
                    a: {
                        for (m = f.key; null !== d;) {
                            if (d.key === m)
                                if (7 === d.tag) {
                                    c(a, d.sibling);
                                    d = e(d, f, h);
                                    d['return'] = a;
                                    a = d;
                                    break a;
                                } else {
                                    c(a, d);
                                    break;
                                }
                            else
                                b(a, d);
                            d = d.sibling;
                        }
                        d = we(f, a.internalContextTag, h);
                        d['return'] = a;
                        a = d;
                    }
                    return g(a);
                case Te:
                    a: {
                        if (null !== d)
                            if (9 === d.tag) {
                                c(a, d.sibling);
                                d = e(d, null, h);
                                d.type = f.value;
                                d['return'] = a;
                                a = d;
                                break a;
                            } else
                                c(a, d);
                        d = xe(f, a.internalContextTag, h);
                        d.type = f.value;
                        d['return'] = a;
                        a = d;
                    }
                    return g(a);
                case Ue:
                    a: {
                        for (m = f.key; null !== d;) {
                            if (d.key === m)
                                if (4 === d.tag && d.stateNode.containerInfo === f.containerInfo && d.stateNode.implementation === f.implementation) {
                                    c(a, d.sibling);
                                    d = e(d, f.children || [], h);
                                    d['return'] = a;
                                    a = d;
                                    break a;
                                } else {
                                    c(a, d);
                                    break;
                                }
                            else
                                b(a, d);
                            d = d.sibling;
                        }
                        d = ye(f, a.internalContextTag, h);
                        d['return'] = a;
                        a = d;
                    }
                    return g(a);
                }
            if ('string' === typeof f || 'number' === typeof f)
                return f = '' + f, null !== d && 6 === d.tag ? (c(a, d.sibling), d = e(d, f, h)) : (c(a, d), d = ve(f, a.internalContextTag, h)), d['return'] = a, a = d, g(a);
            if (Ye(f))
                return L(a, d, f, h);
            if (Xe(f))
                return N(a, d, f, h);
            m && $e(a, f);
            if ('undefined' === typeof f)
                switch (a.tag) {
                case 2:
                case 1:
                    h = a.type, E('152', h.displayName || h.name || 'Component');
                }
            return c(a, d);
        };
    }
    var bf = af(!0), cf = af(!1);
    function df(a, b, c, d, e) {
        function f(a, b, c) {
            var d = b.expirationTime;
            b.child = null === a ? cf(b, null, c, d) : bf(b, a.child, c, d);
        }
        function g(a, b) {
            var c = b.ref;
            null === c || a && a.ref === c || (b.effectTag |= 128);
        }
        function h(a, b, c, d) {
            g(a, b);
            if (!c)
                return d && re(b, !1), q(a, b);
            c = b.stateNode;
            id.current = b;
            var e = c.render();
            b.effectTag |= 1;
            f(a, b, e);
            b.memoizedState = c.state;
            b.memoizedProps = c.props;
            d && re(b, !0);
            return b.child;
        }
        function k(a) {
            var b = a.stateNode;
            b.pendingContext ? oe(a, b.pendingContext, b.pendingContext !== b.context) : b.context && oe(a, b.context, !1);
            I(a, b.containerInfo);
        }
        function q(a, b) {
            null !== a && b.child !== a.child ? E('153') : void 0;
            if (null !== b.child) {
                a = b.child;
                var c = se(a, a.pendingProps, a.expirationTime);
                b.child = c;
                for (c['return'] = b; null !== a.sibling;)
                    a = a.sibling, c = c.sibling = se(a, a.pendingProps, a.expirationTime), c['return'] = b;
                c.sibling = null;
            }
            return b.child;
        }
        function v(a, b) {
            switch (b.tag) {
            case 3:
                k(b);
                break;
            case 2:
                qe(b);
                break;
            case 4:
                I(b, b.stateNode.containerInfo);
            }
            return null;
        }
        var y = a.shouldSetTextContent, u = a.useSyncScheduling, z = a.shouldDeprioritizeSubtree, G = b.pushHostContext, I = b.pushHostContainer, L = c.enterHydrationState, N = c.resetHydrationState, J = c.tryToClaimNextHydratableInstance;
        a = Le(d, e, function (a, b) {
            a.memoizedProps = b;
        }, function (a, b) {
            a.memoizedState = b;
        });
        var w = a.adoptClassInstance, m = a.constructClassInstance, A = a.mountClassInstance, Ob = a.updateClassInstance;
        return {
            beginWork: function (a, b, c) {
                if (0 === b.expirationTime || b.expirationTime > c)
                    return v(a, b);
                switch (b.tag) {
                case 0:
                    null !== a ? E('155') : void 0;
                    var d = b.type, e = b.pendingProps, r = ke(b);
                    r = me(b, r);
                    d = d(e, r);
                    b.effectTag |= 1;
                    'object' === typeof d && null !== d && 'function' === typeof d.render ? (b.tag = 2, e = qe(b), w(b, d), A(b, c), b = h(a, b, !0, e)) : (b.tag = 1, f(a, b, d), b.memoizedProps = e, b = b.child);
                    return b;
                case 1:
                    a: {
                        e = b.type;
                        c = b.pendingProps;
                        d = b.memoizedProps;
                        if (X.current)
                            null === c && (c = d);
                        else if (null === c || d === c) {
                            b = q(a, b);
                            break a;
                        }
                        d = ke(b);
                        d = me(b, d);
                        e = e(c, d);
                        b.effectTag |= 1;
                        f(a, b, e);
                        b.memoizedProps = c;
                        b = b.child;
                    }
                    return b;
                case 2:
                    return e = qe(b), d = void 0, null === a ? b.stateNode ? E('153') : (m(b, b.pendingProps), A(b, c), d = !0) : d = Ob(a, b, c), h(a, b, d, e);
                case 3:
                    return k(b), e = b.updateQueue, null !== e ? (d = b.memoizedState, e = Je(a, b, e, null, null, c), d === e ? (N(), b = q(a, b)) : (d = e.element, r = b.stateNode, (null === a || null === a.child) && r.hydrate && L(b) ? (b.effectTag |= 2, b.child = cf(b, null, d, c)) : (N(), f(a, b, d)), b.memoizedState = e, b = b.child)) : (N(), b = q(a, b)), b;
                case 5:
                    G(b);
                    null === a && J(b);
                    e = b.type;
                    var n = b.memoizedProps;
                    d = b.pendingProps;
                    null === d && (d = n, null === d ? E('154') : void 0);
                    r = null !== a ? a.memoizedProps : null;
                    X.current || null !== d && n !== d ? (n = d.children, y(e, d) ? n = null : r && y(e, r) && (b.effectTag |= 16), g(a, b), 2147483647 !== c && !u && z(e, d) ? (b.expirationTime = 2147483647, b = null) : (f(a, b, n), b.memoizedProps = d, b = b.child)) : b = q(a, b);
                    return b;
                case 6:
                    return null === a && J(b), a = b.pendingProps, null === a && (a = b.memoizedProps), b.memoizedProps = a, null;
                case 8:
                    b.tag = 7;
                case 7:
                    e = b.pendingProps;
                    if (X.current)
                        null === e && (e = a && a.memoizedProps, null === e ? E('154') : void 0);
                    else if (null === e || b.memoizedProps === e)
                        e = b.memoizedProps;
                    d = e.children;
                    b.stateNode = null === a ? cf(b, b.stateNode, d, c) : bf(b, b.stateNode, d, c);
                    b.memoizedProps = e;
                    return b.stateNode;
                case 9:
                    return null;
                case 4:
                    a: {
                        I(b, b.stateNode.containerInfo);
                        e = b.pendingProps;
                        if (X.current)
                            null === e && (e = a && a.memoizedProps, null == e ? E('154') : void 0);
                        else if (null === e || b.memoizedProps === e) {
                            b = q(a, b);
                            break a;
                        }
                        null === a ? b.child = bf(b, null, e, c) : f(a, b, e);
                        b.memoizedProps = e;
                        b = b.child;
                    }
                    return b;
                case 10:
                    a: {
                        c = b.pendingProps;
                        if (X.current)
                            null === c && (c = b.memoizedProps);
                        else if (null === c || b.memoizedProps === c) {
                            b = q(a, b);
                            break a;
                        }
                        f(a, b, c);
                        b.memoizedProps = c;
                        b = b.child;
                    }
                    return b;
                default:
                    E('156');
                }
            },
            beginFailedWork: function (a, b, c) {
                switch (b.tag) {
                case 2:
                    qe(b);
                    break;
                case 3:
                    k(b);
                    break;
                default:
                    E('157');
                }
                b.effectTag |= 64;
                null === a ? b.child = null : b.child !== a.child && (b.child = a.child);
                if (0 === b.expirationTime || b.expirationTime > c)
                    return v(a, b);
                b.firstEffect = null;
                b.lastEffect = null;
                b.child = null === a ? cf(b, null, null, c) : bf(b, a.child, null, c);
                2 === b.tag && (a = b.stateNode, b.memoizedProps = a.props, b.memoizedState = a.state);
                return b.child;
            }
        };
    }
    function ef(a, b, c) {
        function d(a) {
            a.effectTag |= 4;
        }
        var e = a.createInstance, f = a.createTextInstance, g = a.appendInitialChild, h = a.finalizeInitialChildren, k = a.prepareUpdate, q = a.persistence, v = b.getRootHostContainer, y = b.popHostContext, u = b.getHostContext, z = b.popHostContainer, G = c.prepareToHydrateHostInstance, I = c.prepareToHydrateHostTextInstance, L = c.popHydrationState, N = void 0, J = void 0, w = void 0;
        a.mutation ? (N = function () {
        }, J = function (a, b, c) {
            (b.updateQueue = c) && d(b);
        }, w = function (a, b, c, e) {
            c !== e && d(b);
        }) : q ? E('235') : E('236');
        return {
            completeWork: function (a, b, c) {
                var m = b.pendingProps;
                if (null === m)
                    m = b.memoizedProps;
                else if (2147483647 !== b.expirationTime || 2147483647 === c)
                    b.pendingProps = null;
                switch (b.tag) {
                case 1:
                    return null;
                case 2:
                    return ne(b), null;
                case 3:
                    z(b);
                    V(X, b);
                    V(ie, b);
                    m = b.stateNode;
                    m.pendingContext && (m.context = m.pendingContext, m.pendingContext = null);
                    if (null === a || null === a.child)
                        L(b), b.effectTag &= -3;
                    N(b);
                    return null;
                case 5:
                    y(b);
                    c = v();
                    var A = b.type;
                    if (null !== a && null != b.stateNode) {
                        var p = a.memoizedProps, q = b.stateNode, x = u();
                        q = k(q, A, p, m, c, x);
                        J(a, b, q, A, p, m, c);
                        a.ref !== b.ref && (b.effectTag |= 128);
                    } else {
                        if (!m)
                            return null === b.stateNode ? E('166') : void 0, null;
                        a = u();
                        if (L(b))
                            G(b, c, a) && d(b);
                        else {
                            a = e(A, m, c, a, b);
                            a:
                                for (p = b.child; null !== p;) {
                                    if (5 === p.tag || 6 === p.tag)
                                        g(a, p.stateNode);
                                    else if (4 !== p.tag && null !== p.child) {
                                        p.child['return'] = p;
                                        p = p.child;
                                        continue;
                                    }
                                    if (p === b)
                                        break;
                                    for (; null === p.sibling;) {
                                        if (null === p['return'] || p['return'] === b)
                                            break a;
                                        p = p['return'];
                                    }
                                    p.sibling['return'] = p['return'];
                                    p = p.sibling;
                                }
                            h(a, A, m, c) && d(b);
                            b.stateNode = a;
                        }
                        null !== b.ref && (b.effectTag |= 128);
                    }
                    return null;
                case 6:
                    if (a && null != b.stateNode)
                        w(a, b, a.memoizedProps, m);
                    else {
                        if ('string' !== typeof m)
                            return null === b.stateNode ? E('166') : void 0, null;
                        a = v();
                        c = u();
                        L(b) ? I(b) && d(b) : b.stateNode = f(m, a, c, b);
                    }
                    return null;
                case 7:
                    (m = b.memoizedProps) ? void 0 : E('165');
                    b.tag = 8;
                    A = [];
                    a:
                        for ((p = b.stateNode) && (p['return'] = b); null !== p;) {
                            if (5 === p.tag || 6 === p.tag || 4 === p.tag)
                                E('247');
                            else if (9 === p.tag)
                                A.push(p.type);
                            else if (null !== p.child) {
                                p.child['return'] = p;
                                p = p.child;
                                continue;
                            }
                            for (; null === p.sibling;) {
                                if (null === p['return'] || p['return'] === b)
                                    break a;
                                p = p['return'];
                            }
                            p.sibling['return'] = p['return'];
                            p = p.sibling;
                        }
                    p = m.handler;
                    m = p(m.props, A);
                    b.child = bf(b, null !== a ? a.child : null, m, c);
                    return b.child;
                case 8:
                    return b.tag = 7, null;
                case 9:
                    return null;
                case 10:
                    return null;
                case 4:
                    return z(b), N(b), null;
                case 0:
                    E('167');
                default:
                    E('156');
                }
            }
        };
    }
    function ff(a, b) {
        function c(a) {
            var c = a.ref;
            if (null !== c)
                try {
                    c(null);
                } catch (A) {
                    b(a, A);
                }
        }
        function d(a) {
            'function' === typeof Ee && Ee(a);
            switch (a.tag) {
            case 2:
                c(a);
                var d = a.stateNode;
                if ('function' === typeof d.componentWillUnmount)
                    try {
                        d.props = a.memoizedProps, d.state = a.memoizedState, d.componentWillUnmount();
                    } catch (A) {
                        b(a, A);
                    }
                break;
            case 5:
                c(a);
                break;
            case 7:
                e(a.stateNode);
                break;
            case 4:
                k && g(a);
            }
        }
        function e(a) {
            for (var b = a;;)
                if (d(b), null === b.child || k && 4 === b.tag) {
                    if (b === a)
                        break;
                    for (; null === b.sibling;) {
                        if (null === b['return'] || b['return'] === a)
                            return;
                        b = b['return'];
                    }
                    b.sibling['return'] = b['return'];
                    b = b.sibling;
                } else
                    b.child['return'] = b, b = b.child;
        }
        function f(a) {
            return 5 === a.tag || 3 === a.tag || 4 === a.tag;
        }
        function g(a) {
            for (var b = a, c = !1, f = void 0, g = void 0;;) {
                if (!c) {
                    c = b['return'];
                    a:
                        for (;;) {
                            null === c ? E('160') : void 0;
                            switch (c.tag) {
                            case 5:
                                f = c.stateNode;
                                g = !1;
                                break a;
                            case 3:
                                f = c.stateNode.containerInfo;
                                g = !0;
                                break a;
                            case 4:
                                f = c.stateNode.containerInfo;
                                g = !0;
                                break a;
                            }
                            c = c['return'];
                        }
                    c = !0;
                }
                if (5 === b.tag || 6 === b.tag)
                    e(b), g ? J(f, b.stateNode) : N(f, b.stateNode);
                else if (4 === b.tag ? f = b.stateNode.containerInfo : d(b), null !== b.child) {
                    b.child['return'] = b;
                    b = b.child;
                    continue;
                }
                if (b === a)
                    break;
                for (; null === b.sibling;) {
                    if (null === b['return'] || b['return'] === a)
                        return;
                    b = b['return'];
                    4 === b.tag && (c = !1);
                }
                b.sibling['return'] = b['return'];
                b = b.sibling;
            }
        }
        var h = a.getPublicInstance, k = a.mutation;
        a = a.persistence;
        k || (a ? E('235') : E('236'));
        var q = k.commitMount, v = k.commitUpdate, y = k.resetTextContent, u = k.commitTextUpdate, z = k.appendChild, G = k.appendChildToContainer, I = k.insertBefore, L = k.insertInContainerBefore, N = k.removeChild, J = k.removeChildFromContainer;
        return {
            commitResetTextContent: function (a) {
                y(a.stateNode);
            },
            commitPlacement: function (a) {
                a: {
                    for (var b = a['return']; null !== b;) {
                        if (f(b)) {
                            var c = b;
                            break a;
                        }
                        b = b['return'];
                    }
                    E('160');
                    c = void 0;
                }
                var d = b = void 0;
                switch (c.tag) {
                case 5:
                    b = c.stateNode;
                    d = !1;
                    break;
                case 3:
                    b = c.stateNode.containerInfo;
                    d = !0;
                    break;
                case 4:
                    b = c.stateNode.containerInfo;
                    d = !0;
                    break;
                default:
                    E('161');
                }
                c.effectTag & 16 && (y(b), c.effectTag &= -17);
                a:
                    b:
                        for (c = a;;) {
                            for (; null === c.sibling;) {
                                if (null === c['return'] || f(c['return'])) {
                                    c = null;
                                    break a;
                                }
                                c = c['return'];
                            }
                            c.sibling['return'] = c['return'];
                            for (c = c.sibling; 5 !== c.tag && 6 !== c.tag;) {
                                if (c.effectTag & 2)
                                    continue b;
                                if (null === c.child || 4 === c.tag)
                                    continue b;
                                else
                                    c.child['return'] = c, c = c.child;
                            }
                            if (!(c.effectTag & 2)) {
                                c = c.stateNode;
                                break a;
                            }
                        }
                for (var e = a;;) {
                    if (5 === e.tag || 6 === e.tag)
                        c ? d ? L(b, e.stateNode, c) : I(b, e.stateNode, c) : d ? G(b, e.stateNode) : z(b, e.stateNode);
                    else if (4 !== e.tag && null !== e.child) {
                        e.child['return'] = e;
                        e = e.child;
                        continue;
                    }
                    if (e === a)
                        break;
                    for (; null === e.sibling;) {
                        if (null === e['return'] || e['return'] === a)
                            return;
                        e = e['return'];
                    }
                    e.sibling['return'] = e['return'];
                    e = e.sibling;
                }
            },
            commitDeletion: function (a) {
                g(a);
                a['return'] = null;
                a.child = null;
                a.alternate && (a.alternate.child = null, a.alternate['return'] = null);
            },
            commitWork: function (a, b) {
                switch (b.tag) {
                case 2:
                    break;
                case 5:
                    var c = b.stateNode;
                    if (null != c) {
                        var d = b.memoizedProps;
                        a = null !== a ? a.memoizedProps : d;
                        var e = b.type, f = b.updateQueue;
                        b.updateQueue = null;
                        null !== f && v(c, f, e, a, d, b);
                    }
                    break;
                case 6:
                    null === b.stateNode ? E('162') : void 0;
                    c = b.memoizedProps;
                    u(b.stateNode, null !== a ? a.memoizedProps : c, c);
                    break;
                case 3:
                    break;
                default:
                    E('163');
                }
            },
            commitLifeCycles: function (a, b) {
                switch (b.tag) {
                case 2:
                    var c = b.stateNode;
                    if (b.effectTag & 4)
                        if (null === a)
                            c.props = b.memoizedProps, c.state = b.memoizedState, c.componentDidMount();
                        else {
                            var d = a.memoizedProps;
                            a = a.memoizedState;
                            c.props = b.memoizedProps;
                            c.state = b.memoizedState;
                            c.componentDidUpdate(d, a);
                        }
                    b = b.updateQueue;
                    null !== b && Ke(b, c);
                    break;
                case 3:
                    c = b.updateQueue;
                    null !== c && Ke(c, null !== b.child ? b.child.stateNode : null);
                    break;
                case 5:
                    c = b.stateNode;
                    null === a && b.effectTag & 4 && q(c, b.type, b.memoizedProps, b);
                    break;
                case 6:
                    break;
                case 4:
                    break;
                default:
                    E('163');
                }
            },
            commitAttachRef: function (a) {
                var b = a.ref;
                if (null !== b) {
                    var c = a.stateNode;
                    switch (a.tag) {
                    case 5:
                        b(h(c));
                        break;
                    default:
                        b(c);
                    }
                }
            },
            commitDetachRef: function (a) {
                a = a.ref;
                null !== a && a(null);
            }
        };
    }
    var gf = {};
    function hf(a) {
        function b(a) {
            a === gf ? E('174') : void 0;
            return a;
        }
        var c = a.getChildHostContext, d = a.getRootHostContext, e = { current: gf }, f = { current: gf }, g = { current: gf };
        return {
            getHostContext: function () {
                return b(e.current);
            },
            getRootHostContainer: function () {
                return b(g.current);
            },
            popHostContainer: function (a) {
                V(e, a);
                V(f, a);
                V(g, a);
            },
            popHostContext: function (a) {
                f.current === a && (V(e, a), V(f, a));
            },
            pushHostContainer: function (a, b) {
                W(g, b, a);
                b = d(b);
                W(f, a, a);
                W(e, b, a);
            },
            pushHostContext: function (a) {
                var d = b(g.current), h = b(e.current);
                d = c(h, a.type, d);
                h !== d && (W(f, a, a), W(e, d, a));
            },
            resetHostContainer: function () {
                e.current = gf;
                g.current = gf;
            }
        };
    }
    function jf(a) {
        function b(a, b) {
            var c = new Y(5, null, 0);
            c.type = 'DELETED';
            c.stateNode = b;
            c['return'] = a;
            c.effectTag = 8;
            null !== a.lastEffect ? (a.lastEffect.nextEffect = c, a.lastEffect = c) : a.firstEffect = a.lastEffect = c;
        }
        function c(a, b) {
            switch (a.tag) {
            case 5:
                return b = f(b, a.type, a.pendingProps), null !== b ? (a.stateNode = b, !0) : !1;
            case 6:
                return b = g(b, a.pendingProps), null !== b ? (a.stateNode = b, !0) : !1;
            default:
                return !1;
            }
        }
        function d(a) {
            for (a = a['return']; null !== a && 5 !== a.tag && 3 !== a.tag;)
                a = a['return'];
            y = a;
        }
        var e = a.shouldSetTextContent;
        a = a.hydration;
        if (!a)
            return {
                enterHydrationState: function () {
                    return !1;
                },
                resetHydrationState: function () {
                },
                tryToClaimNextHydratableInstance: function () {
                },
                prepareToHydrateHostInstance: function () {
                    E('175');
                },
                prepareToHydrateHostTextInstance: function () {
                    E('176');
                },
                popHydrationState: function () {
                    return !1;
                }
            };
        var f = a.canHydrateInstance, g = a.canHydrateTextInstance, h = a.getNextHydratableSibling, k = a.getFirstHydratableChild, q = a.hydrateInstance, v = a.hydrateTextInstance, y = null, u = null, z = !1;
        return {
            enterHydrationState: function (a) {
                u = k(a.stateNode.containerInfo);
                y = a;
                return z = !0;
            },
            resetHydrationState: function () {
                u = y = null;
                z = !1;
            },
            tryToClaimNextHydratableInstance: function (a) {
                if (z) {
                    var d = u;
                    if (d) {
                        if (!c(a, d)) {
                            d = h(d);
                            if (!d || !c(a, d)) {
                                a.effectTag |= 2;
                                z = !1;
                                y = a;
                                return;
                            }
                            b(y, u);
                        }
                        y = a;
                        u = k(d);
                    } else
                        a.effectTag |= 2, z = !1, y = a;
                }
            },
            prepareToHydrateHostInstance: function (a, b, c) {
                b = q(a.stateNode, a.type, a.memoizedProps, b, c, a);
                a.updateQueue = b;
                return null !== b ? !0 : !1;
            },
            prepareToHydrateHostTextInstance: function (a) {
                return v(a.stateNode, a.memoizedProps, a);
            },
            popHydrationState: function (a) {
                if (a !== y)
                    return !1;
                if (!z)
                    return d(a), z = !0, !1;
                var c = a.type;
                if (5 !== a.tag || 'head' !== c && 'body' !== c && !e(c, a.memoizedProps))
                    for (c = u; c;)
                        b(a, c), c = h(c);
                d(a);
                u = y ? h(a.stateNode) : null;
                return !0;
            }
        };
    }
    function kf(a) {
        function b(a) {
            Qb = ja = !0;
            var b = a.stateNode;
            b.current === a ? E('177') : void 0;
            b.isReadyForCommit = !1;
            id.current = null;
            if (1 < a.effectTag)
                if (null !== a.lastEffect) {
                    a.lastEffect.nextEffect = a;
                    var c = a.firstEffect;
                } else
                    c = a;
            else
                c = a.firstEffect;
            yg();
            for (t = c; null !== t;) {
                var d = !1, e = void 0;
                try {
                    for (; null !== t;) {
                        var f = t.effectTag;
                        f & 16 && zg(t);
                        if (f & 128) {
                            var g = t.alternate;
                            null !== g && Ag(g);
                        }
                        switch (f & -242) {
                        case 2:
                            Ne(t);
                            t.effectTag &= -3;
                            break;
                        case 6:
                            Ne(t);
                            t.effectTag &= -3;
                            Oe(t.alternate, t);
                            break;
                        case 4:
                            Oe(t.alternate, t);
                            break;
                        case 8:
                            Sc = !0, Bg(t), Sc = !1;
                        }
                        t = t.nextEffect;
                    }
                } catch (Tc) {
                    d = !0, e = Tc;
                }
                d && (null === t ? E('178') : void 0, h(t, e), null !== t && (t = t.nextEffect));
            }
            Cg();
            b.current = a;
            for (t = c; null !== t;) {
                c = !1;
                d = void 0;
                try {
                    for (; null !== t;) {
                        var k = t.effectTag;
                        k & 36 && Dg(t.alternate, t);
                        k & 128 && Eg(t);
                        if (k & 64)
                            switch (e = t, f = void 0, null !== R && (f = R.get(e), R['delete'](e), null == f && null !== e.alternate && (e = e.alternate, f = R.get(e), R['delete'](e))), null == f ? E('184') : void 0, e.tag) {
                            case 2:
                                e.stateNode.componentDidCatch(f.error, { componentStack: f.componentStack });
                                break;
                            case 3:
                                null === ca && (ca = f.error);
                                break;
                            default:
                                E('157');
                            }
                        var Qc = t.nextEffect;
                        t.nextEffect = null;
                        t = Qc;
                    }
                } catch (Tc) {
                    c = !0, d = Tc;
                }
                c && (null === t ? E('178') : void 0, h(t, d), null !== t && (t = t.nextEffect));
            }
            ja = Qb = !1;
            'function' === typeof De && De(a.stateNode);
            ha && (ha.forEach(G), ha = null);
            null !== ca && (a = ca, ca = null, Ob(a));
            b = b.current.expirationTime;
            0 === b && (qa = R = null);
            return b;
        }
        function c(a) {
            for (;;) {
                var b = Fg(a.alternate, a, H), c = a['return'], d = a.sibling;
                var e = a;
                if (2147483647 === H || 2147483647 !== e.expirationTime) {
                    if (2 !== e.tag && 3 !== e.tag)
                        var f = 0;
                    else
                        f = e.updateQueue, f = null === f ? 0 : f.expirationTime;
                    for (var g = e.child; null !== g;)
                        0 !== g.expirationTime && (0 === f || f > g.expirationTime) && (f = g.expirationTime), g = g.sibling;
                    e.expirationTime = f;
                }
                if (null !== b)
                    return b;
                null !== c && (null === c.firstEffect && (c.firstEffect = a.firstEffect), null !== a.lastEffect && (null !== c.lastEffect && (c.lastEffect.nextEffect = a.firstEffect), c.lastEffect = a.lastEffect), 1 < a.effectTag && (null !== c.lastEffect ? c.lastEffect.nextEffect = a : c.firstEffect = a, c.lastEffect = a));
                if (null !== d)
                    return d;
                if (null !== c)
                    a = c;
                else {
                    a.stateNode.isReadyForCommit = !0;
                    break;
                }
            }
            return null;
        }
        function d(a) {
            var b = rg(a.alternate, a, H);
            null === b && (b = c(a));
            id.current = null;
            return b;
        }
        function e(a) {
            var b = Gg(a.alternate, a, H);
            null === b && (b = c(a));
            id.current = null;
            return b;
        }
        function f(a) {
            if (null !== R) {
                if (!(0 === H || H > a))
                    if (H <= Uc)
                        for (; null !== F;)
                            F = k(F) ? e(F) : d(F);
                    else
                        for (; null !== F && !A();)
                            F = k(F) ? e(F) : d(F);
            } else if (!(0 === H || H > a))
                if (H <= Uc)
                    for (; null !== F;)
                        F = d(F);
                else
                    for (; null !== F && !A();)
                        F = d(F);
        }
        function g(a, b) {
            ja ? E('243') : void 0;
            ja = !0;
            a.isReadyForCommit = !1;
            if (a !== ra || b !== H || null === F) {
                for (; -1 < he;)
                    ge[he] = null, he--;
                je = D;
                ie.current = D;
                X.current = !1;
                x();
                ra = a;
                H = b;
                F = se(ra.current, null, b);
            }
            var c = !1, d = null;
            try {
                f(b);
            } catch (Rc) {
                c = !0, d = Rc;
            }
            for (; c;) {
                if (eb) {
                    ca = d;
                    break;
                }
                var g = F;
                if (null === g)
                    eb = !0;
                else {
                    var k = h(g, d);
                    null === k ? E('183') : void 0;
                    if (!eb) {
                        try {
                            c = k;
                            d = b;
                            for (k = c; null !== g;) {
                                switch (g.tag) {
                                case 2:
                                    ne(g);
                                    break;
                                case 5:
                                    qg(g);
                                    break;
                                case 3:
                                    p(g);
                                    break;
                                case 4:
                                    p(g);
                                }
                                if (g === k || g.alternate === k)
                                    break;
                                g = g['return'];
                            }
                            F = e(c);
                            f(d);
                        } catch (Rc) {
                            c = !0;
                            d = Rc;
                            continue;
                        }
                        break;
                    }
                }
            }
            b = ca;
            eb = ja = !1;
            ca = null;
            null !== b && Ob(b);
            return a.isReadyForCommit ? a.current.alternate : null;
        }
        function h(a, b) {
            var c = id.current = null, d = !1, e = !1, f = null;
            if (3 === a.tag)
                c = a, q(a) && (eb = !0);
            else
                for (var g = a['return']; null !== g && null === c;) {
                    2 === g.tag ? 'function' === typeof g.stateNode.componentDidCatch && (d = !0, f = jd(g), c = g, e = !0) : 3 === g.tag && (c = g);
                    if (q(g)) {
                        if (Sc || null !== ha && (ha.has(g) || null !== g.alternate && ha.has(g.alternate)))
                            return null;
                        c = null;
                        e = !1;
                    }
                    g = g['return'];
                }
            if (null !== c) {
                null === qa && (qa = new Set());
                qa.add(c);
                var h = '';
                g = a;
                do {
                    a:
                        switch (g.tag) {
                        case 0:
                        case 1:
                        case 2:
                        case 5:
                            var k = g._debugOwner, Qc = g._debugSource;
                            var m = jd(g);
                            var n = null;
                            k && (n = jd(k));
                            k = Qc;
                            m = '\n    in ' + (m || 'Unknown') + (k ? ' (at ' + k.fileName.replace(/^.*[\\\/]/, '') + ':' + k.lineNumber + ')' : n ? ' (created by ' + n + ')' : '');
                            break a;
                        default:
                            m = '';
                        }
                    h += m;
                    g = g['return'];
                } while (g);
                g = h;
                a = jd(a);
                null === R && (R = new Map());
                b = {
                    componentName: a,
                    componentStack: g,
                    error: b,
                    errorBoundary: d ? c.stateNode : null,
                    errorBoundaryFound: d,
                    errorBoundaryName: f,
                    willRetry: e
                };
                R.set(c, b);
                try {
                    var p = b.error;
                    p && p.suppressReactErrorLogging || console.error(p);
                } catch (Vc) {
                    Vc && Vc.suppressReactErrorLogging || console.error(Vc);
                }
                Qb ? (null === ha && (ha = new Set()), ha.add(c)) : G(c);
                return c;
            }
            null === ca && (ca = b);
            return null;
        }
        function k(a) {
            return null !== R && (R.has(a) || null !== a.alternate && R.has(a.alternate));
        }
        function q(a) {
            return null !== qa && (qa.has(a) || null !== a.alternate && qa.has(a.alternate));
        }
        function v() {
            return 20 * (((I() + 100) / 20 | 0) + 1);
        }
        function y(a) {
            return 0 !== ka ? ka : ja ? Qb ? 1 : H : !Hg || a.internalContextTag & 1 ? v() : 1;
        }
        function u(a, b) {
            return z(a, b, !1);
        }
        function z(a, b) {
            for (; null !== a;) {
                if (0 === a.expirationTime || a.expirationTime > b)
                    a.expirationTime = b;
                null !== a.alternate && (0 === a.alternate.expirationTime || a.alternate.expirationTime > b) && (a.alternate.expirationTime = b);
                if (null === a['return'])
                    if (3 === a.tag) {
                        var c = a.stateNode;
                        !ja && c === ra && b < H && (F = ra = null, H = 0);
                        var d = c, e = b;
                        Rb > Ig && E('185');
                        if (null === d.nextScheduledRoot)
                            d.remainingExpirationTime = e, null === O ? (sa = O = d, d.nextScheduledRoot = d) : (O = O.nextScheduledRoot = d, O.nextScheduledRoot = sa);
                        else {
                            var f = d.remainingExpirationTime;
                            if (0 === f || e < f)
                                d.remainingExpirationTime = e;
                        }
                        Fa || (la ? Sb && (ma = d, na = 1, m(ma, na)) : 1 === e ? w(1, null) : L(e));
                        !ja && c === ra && b < H && (F = ra = null, H = 0);
                    } else
                        break;
                a = a['return'];
            }
        }
        function G(a) {
            z(a, 1, !0);
        }
        function I() {
            return Uc = ((Wc() - Pe) / 10 | 0) + 2;
        }
        function L(a) {
            if (0 !== Tb) {
                if (a > Tb)
                    return;
                Jg(Xc);
            }
            var b = Wc() - Pe;
            Tb = a;
            Xc = Kg(J, { timeout: 10 * (a - 2) - b });
        }
        function N() {
            var a = 0, b = null;
            if (null !== O)
                for (var c = O, d = sa; null !== d;) {
                    var e = d.remainingExpirationTime;
                    if (0 === e) {
                        null === c || null === O ? E('244') : void 0;
                        if (d === d.nextScheduledRoot) {
                            sa = O = d.nextScheduledRoot = null;
                            break;
                        } else if (d === sa)
                            sa = e = d.nextScheduledRoot, O.nextScheduledRoot = e, d.nextScheduledRoot = null;
                        else if (d === O) {
                            O = c;
                            O.nextScheduledRoot = sa;
                            d.nextScheduledRoot = null;
                            break;
                        } else
                            c.nextScheduledRoot = d.nextScheduledRoot, d.nextScheduledRoot = null;
                        d = c.nextScheduledRoot;
                    } else {
                        if (0 === a || e < a)
                            a = e, b = d;
                        if (d === O)
                            break;
                        c = d;
                        d = d.nextScheduledRoot;
                    }
                }
            c = ma;
            null !== c && c === b ? Rb++ : Rb = 0;
            ma = b;
            na = a;
        }
        function J(a) {
            w(0, a);
        }
        function w(a, b) {
            fb = b;
            for (N(); null !== ma && 0 !== na && (0 === a || na <= a) && !Yc;)
                m(ma, na), N();
            null !== fb && (Tb = 0, Xc = -1);
            0 !== na && L(na);
            fb = null;
            Yc = !1;
            Rb = 0;
            if (Ub)
                throw a = Zc, Zc = null, Ub = !1, a;
        }
        function m(a, c) {
            Fa ? E('245') : void 0;
            Fa = !0;
            if (c <= I()) {
                var d = a.finishedWork;
                null !== d ? (a.finishedWork = null, a.remainingExpirationTime = b(d)) : (a.finishedWork = null, d = g(a, c), null !== d && (a.remainingExpirationTime = b(d)));
            } else
                d = a.finishedWork, null !== d ? (a.finishedWork = null, a.remainingExpirationTime = b(d)) : (a.finishedWork = null, d = g(a, c), null !== d && (A() ? a.finishedWork = d : a.remainingExpirationTime = b(d)));
            Fa = !1;
        }
        function A() {
            return null === fb || fb.timeRemaining() > Lg ? !1 : Yc = !0;
        }
        function Ob(a) {
            null === ma ? E('246') : void 0;
            ma.remainingExpirationTime = 0;
            Ub || (Ub = !0, Zc = a);
        }
        var r = hf(a), n = jf(a), p = r.popHostContainer, qg = r.popHostContext, x = r.resetHostContainer, Me = df(a, r, n, u, y), rg = Me.beginWork, Gg = Me.beginFailedWork, Fg = ef(a, r, n).completeWork;
        r = ff(a, h);
        var zg = r.commitResetTextContent, Ne = r.commitPlacement, Bg = r.commitDeletion, Oe = r.commitWork, Dg = r.commitLifeCycles, Eg = r.commitAttachRef, Ag = r.commitDetachRef, Wc = a.now, Kg = a.scheduleDeferredCallback, Jg = a.cancelDeferredCallback, Hg = a.useSyncScheduling, yg = a.prepareForCommit, Cg = a.resetAfterCommit, Pe = Wc(), Uc = 2, ka = 0, ja = !1, F = null, ra = null, H = 0, t = null, R = null, qa = null, ha = null, ca = null, eb = !1, Qb = !1, Sc = !1, sa = null, O = null, Tb = 0, Xc = -1, Fa = !1, ma = null, na = 0, Yc = !1, Ub = !1, Zc = null, fb = null, la = !1, Sb = !1, Ig = 1000, Rb = 0, Lg = 1;
        return {
            computeAsyncExpiration: v,
            computeExpirationForFiber: y,
            scheduleWork: u,
            batchedUpdates: function (a, b) {
                var c = la;
                la = !0;
                try {
                    return a(b);
                } finally {
                    (la = c) || Fa || w(1, null);
                }
            },
            unbatchedUpdates: function (a) {
                if (la && !Sb) {
                    Sb = !0;
                    try {
                        return a();
                    } finally {
                        Sb = !1;
                    }
                }
                return a();
            },
            flushSync: function (a) {
                var b = la;
                la = !0;
                try {
                    a: {
                        var c = ka;
                        ka = 1;
                        try {
                            var d = a();
                            break a;
                        } finally {
                            ka = c;
                        }
                        d = void 0;
                    }
                    return d;
                } finally {
                    la = b, Fa ? E('187') : void 0, w(1, null);
                }
            },
            deferredUpdates: function (a) {
                var b = ka;
                ka = v();
                try {
                    return a();
                } finally {
                    ka = b;
                }
            }
        };
    }
    function lf(a) {
        function b(a) {
            a = od(a);
            return null === a ? null : a.stateNode;
        }
        var c = a.getPublicInstance;
        a = kf(a);
        var d = a.computeAsyncExpiration, e = a.computeExpirationForFiber, f = a.scheduleWork;
        return {
            createContainer: function (a, b) {
                var c = new Y(3, null, 0);
                a = {
                    current: c,
                    containerInfo: a,
                    pendingChildren: null,
                    remainingExpirationTime: 0,
                    isReadyForCommit: !1,
                    finishedWork: null,
                    context: null,
                    pendingContext: null,
                    hydrate: b,
                    nextScheduledRoot: null
                };
                return c.stateNode = a;
            },
            updateContainer: function (a, b, c, q) {
                var g = b.current;
                if (c) {
                    c = c._reactInternalFiber;
                    var h;
                    b: {
                        2 === kd(c) && 2 === c.tag ? void 0 : E('170');
                        for (h = c; 3 !== h.tag;) {
                            if (le(h)) {
                                h = h.stateNode.__reactInternalMemoizedMergedChildContext;
                                break b;
                            }
                            (h = h['return']) ? void 0 : E('171');
                        }
                        h = h.stateNode.context;
                    }
                    c = le(c) ? pe(c, h) : h;
                } else
                    c = D;
                null === b.context ? b.context = c : b.pendingContext = c;
                b = q;
                b = void 0 === b ? null : b;
                q = null != a && null != a.type && null != a.type.prototype && !0 === a.type.prototype.unstable_isAsyncReactComponent ? d() : e(g);
                He(g, {
                    expirationTime: q,
                    partialState: { element: a },
                    callback: b,
                    isReplace: !1,
                    isForced: !1,
                    nextCallback: null,
                    next: null
                });
                f(g, q);
            },
            batchedUpdates: a.batchedUpdates,
            unbatchedUpdates: a.unbatchedUpdates,
            deferredUpdates: a.deferredUpdates,
            flushSync: a.flushSync,
            getPublicRootInstance: function (a) {
                a = a.current;
                if (!a.child)
                    return null;
                switch (a.child.tag) {
                case 5:
                    return c(a.child.stateNode);
                default:
                    return a.child.stateNode;
                }
            },
            findHostInstance: b,
            findHostInstanceWithNoPortals: function (a) {
                a = pd(a);
                return null === a ? null : a.stateNode;
            },
            injectIntoDevTools: function (a) {
                var c = a.findFiberByHostInstance;
                return Ce(B({}, a, {
                    findHostInstanceByFiber: function (a) {
                        return b(a);
                    },
                    findFiberByHostInstance: function (a) {
                        return c ? c(a) : null;
                    }
                }));
            }
        };
    }
    var mf = Object.freeze({ default: lf }), nf = mf && lf || mf, of = nf['default'] ? nf['default'] : nf;
    function pf(a, b, c) {
        var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        return {
            $$typeof: Ue,
            key: null == d ? null : '' + d,
            children: a,
            containerInfo: b,
            implementation: c
        };
    }
    var qf = 'object' === typeof performance && 'function' === typeof performance.now, rf = void 0;
    rf = qf ? function () {
        return performance.now();
    } : function () {
        return Date.now();
    };
    var sf = void 0, tf = void 0;
    if (l.canUseDOM)
        if ('function' !== typeof requestIdleCallback || 'function' !== typeof cancelIdleCallback) {
            var uf = null, vf = !1, wf = -1, xf = !1, yf = 0, zf = 33, Af = 33, Bf;
            Bf = qf ? {
                didTimeout: !1,
                timeRemaining: function () {
                    var a = yf - performance.now();
                    return 0 < a ? a : 0;
                }
            } : {
                didTimeout: !1,
                timeRemaining: function () {
                    var a = yf - Date.now();
                    return 0 < a ? a : 0;
                }
            };
            var Cf = '__reactIdleCallback$' + Math.random().toString(36).slice(2);
            window.addEventListener('message', function (a) {
                if (a.source === window && a.data === Cf) {
                    vf = !1;
                    a = rf();
                    if (0 >= yf - a)
                        if (-1 !== wf && wf <= a)
                            Bf.didTimeout = !0;
                        else {
                            xf || (xf = !0, requestAnimationFrame(Df));
                            return;
                        }
                    else
                        Bf.didTimeout = !1;
                    wf = -1;
                    a = uf;
                    uf = null;
                    null !== a && a(Bf);
                }
            }, !1);
            var Df = function (a) {
                xf = !1;
                var b = a - yf + Af;
                b < Af && zf < Af ? (8 > b && (b = 8), Af = b < zf ? zf : b) : zf = b;
                yf = a + Af;
                vf || (vf = !0, window.postMessage(Cf, '*'));
            };
            sf = function (a, b) {
                uf = a;
                null != b && 'number' === typeof b.timeout && (wf = rf() + b.timeout);
                xf || (xf = !0, requestAnimationFrame(Df));
                return 0;
            };
            tf = function () {
                uf = null;
                vf = !1;
                wf = -1;
            };
        } else
            sf = window.requestIdleCallback, tf = window.cancelIdleCallback;
    else
        sf = function (a) {
            return setTimeout(function () {
                a({
                    timeRemaining: function () {
                        return Infinity;
                    }
                });
            });
        }, tf = function (a) {
            clearTimeout(a);
        };
    var Ef = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Ff = {}, Gf = {};
    function Hf(a) {
        if (Gf.hasOwnProperty(a))
            return !0;
        if (Ff.hasOwnProperty(a))
            return !1;
        if (Ef.test(a))
            return Gf[a] = !0;
        Ff[a] = !0;
        return !1;
    }
    function If(a, b, c) {
        var d = wa(b);
        if (d && va(b, c)) {
            var e = d.mutationMethod;
            e ? e(a, c) : null == c || d.hasBooleanValue && !c || d.hasNumericValue && isNaN(c) || d.hasPositiveNumericValue && 1 > c || d.hasOverloadedBooleanValue && !1 === c ? Jf(a, b) : d.mustUseProperty ? a[d.propertyName] = c : (b = d.attributeName, (e = d.attributeNamespace) ? a.setAttributeNS(e, b, '' + c) : d.hasBooleanValue || d.hasOverloadedBooleanValue && !0 === c ? a.setAttribute(b, '') : a.setAttribute(b, '' + c));
        } else
            Kf(a, b, va(b, c) ? c : null);
    }
    function Kf(a, b, c) {
        Hf(b) && (null == c ? a.removeAttribute(b) : a.setAttribute(b, '' + c));
    }
    function Jf(a, b) {
        var c = wa(b);
        c ? (b = c.mutationMethod) ? b(a, void 0) : c.mustUseProperty ? a[c.propertyName] = c.hasBooleanValue ? !1 : '' : a.removeAttribute(c.attributeName) : a.removeAttribute(b);
    }
    function Lf(a, b) {
        var c = b.value, d = b.checked;
        return B({
            type: void 0,
            step: void 0,
            min: void 0,
            max: void 0
        }, b, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: null != c ? c : a._wrapperState.initialValue,
            checked: null != d ? d : a._wrapperState.initialChecked
        });
    }
    function Mf(a, b) {
        var c = b.defaultValue;
        a._wrapperState = {
            initialChecked: null != b.checked ? b.checked : b.defaultChecked,
            initialValue: null != b.value ? b.value : c,
            controlled: 'checkbox' === b.type || 'radio' === b.type ? null != b.checked : null != b.value
        };
    }
    function Nf(a, b) {
        b = b.checked;
        null != b && If(a, 'checked', b);
    }
    function Of(a, b) {
        Nf(a, b);
        var c = b.value;
        if (null != c)
            if (0 === c && '' === a.value)
                a.value = '0';
            else if ('number' === b.type) {
                if (b = parseFloat(a.value) || 0, c != b || c == b && a.value != c)
                    a.value = '' + c;
            } else
                a.value !== '' + c && (a.value = '' + c);
        else
            null == b.value && null != b.defaultValue && a.defaultValue !== '' + b.defaultValue && (a.defaultValue = '' + b.defaultValue), null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
    }
    function Pf(a, b) {
        switch (b.type) {
        case 'submit':
        case 'reset':
            break;
        case 'color':
        case 'date':
        case 'datetime':
        case 'datetime-local':
        case 'month':
        case 'time':
        case 'week':
            a.value = '';
            a.value = a.defaultValue;
            break;
        default:
            a.value = a.value;
        }
        b = a.name;
        '' !== b && (a.name = '');
        a.defaultChecked = !a.defaultChecked;
        a.defaultChecked = !a.defaultChecked;
        '' !== b && (a.name = b);
    }
    function Qf(a) {
        var b = '';
        aa.Children.forEach(a, function (a) {
            null == a || 'string' !== typeof a && 'number' !== typeof a || (b += a);
        });
        return b;
    }
    function Rf(a, b) {
        a = B({ children: void 0 }, b);
        if (b = Qf(b.children))
            a.children = b;
        return a;
    }
    function Sf(a, b, c, d) {
        a = a.options;
        if (b) {
            b = {};
            for (var e = 0; e < c.length; e++)
                b['$' + c[e]] = !0;
            for (c = 0; c < a.length; c++)
                e = b.hasOwnProperty('$' + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = !0);
        } else {
            c = '' + c;
            b = null;
            for (e = 0; e < a.length; e++) {
                if (a[e].value === c) {
                    a[e].selected = !0;
                    d && (a[e].defaultSelected = !0);
                    return;
                }
                null !== b || a[e].disabled || (b = a[e]);
            }
            null !== b && (b.selected = !0);
        }
    }
    function Tf(a, b) {
        var c = b.value;
        a._wrapperState = {
            initialValue: null != c ? c : b.defaultValue,
            wasMultiple: !!b.multiple
        };
    }
    function Uf(a, b) {
        null != b.dangerouslySetInnerHTML ? E('91') : void 0;
        return B({}, b, {
            value: void 0,
            defaultValue: void 0,
            children: '' + a._wrapperState.initialValue
        });
    }
    function Vf(a, b) {
        var c = b.value;
        null == c && (c = b.defaultValue, b = b.children, null != b && (null != c ? E('92') : void 0, Array.isArray(b) && (1 >= b.length ? void 0 : E('93'), b = b[0]), c = '' + b), null == c && (c = ''));
        a._wrapperState = { initialValue: '' + c };
    }
    function Wf(a, b) {
        var c = b.value;
        null != c && (c = '' + c, c !== a.value && (a.value = c), null == b.defaultValue && (a.defaultValue = c));
        null != b.defaultValue && (a.defaultValue = b.defaultValue);
    }
    function Xf(a) {
        var b = a.textContent;
        b === a._wrapperState.initialValue && (a.value = b);
    }
    var Yf = {
        html: 'http://www.w3.org/1999/xhtml',
        mathml: 'http://www.w3.org/1998/Math/MathML',
        svg: 'http://www.w3.org/2000/svg'
    };
    function Zf(a) {
        switch (a) {
        case 'svg':
            return 'http://www.w3.org/2000/svg';
        case 'math':
            return 'http://www.w3.org/1998/Math/MathML';
        default:
            return 'http://www.w3.org/1999/xhtml';
        }
    }
    function $f(a, b) {
        return null == a || 'http://www.w3.org/1999/xhtml' === a ? Zf(b) : 'http://www.w3.org/2000/svg' === a && 'foreignObject' === b ? 'http://www.w3.org/1999/xhtml' : a;
    }
    var ag = void 0, bg = function (a) {
            return 'undefined' !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function (b, c, d, e) {
                MSApp.execUnsafeLocalFunction(function () {
                    return a(b, c, d, e);
                });
            } : a;
        }(function (a, b) {
            if (a.namespaceURI !== Yf.svg || 'innerHTML' in a)
                a.innerHTML = b;
            else {
                ag = ag || document.createElement('div');
                ag.innerHTML = '<svg>' + b + '</svg>';
                for (b = ag.firstChild; a.firstChild;)
                    a.removeChild(a.firstChild);
                for (; b.firstChild;)
                    a.appendChild(b.firstChild);
            }
        });
    function cg(a, b) {
        if (b) {
            var c = a.firstChild;
            if (c && c === a.lastChild && 3 === c.nodeType) {
                c.nodeValue = b;
                return;
            }
        }
        a.textContent = b;
    }
    var dg = {
            animationIterationCount: !0,
            borderImageOutset: !0,
            borderImageSlice: !0,
            borderImageWidth: !0,
            boxFlex: !0,
            boxFlexGroup: !0,
            boxOrdinalGroup: !0,
            columnCount: !0,
            columns: !0,
            flex: !0,
            flexGrow: !0,
            flexPositive: !0,
            flexShrink: !0,
            flexNegative: !0,
            flexOrder: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowSpan: !0,
            gridRowStart: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnSpan: !0,
            gridColumnStart: !0,
            fontWeight: !0,
            lineClamp: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            tabSize: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeDasharray: !0,
            strokeDashoffset: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
            strokeWidth: !0
        }, eg = [
            'Webkit',
            'ms',
            'Moz',
            'O'
        ];
    Object.keys(dg).forEach(function (a) {
        eg.forEach(function (b) {
            b = b + a.charAt(0).toUpperCase() + a.substring(1);
            dg[b] = dg[a];
        });
    });
    function fg(a, b) {
        a = a.style;
        for (var c in b)
            if (b.hasOwnProperty(c)) {
                var d = 0 === c.indexOf('--');
                var e = c;
                var f = b[c];
                e = null == f || 'boolean' === typeof f || '' === f ? '' : d || 'number' !== typeof f || 0 === f || dg.hasOwnProperty(e) && dg[e] ? ('' + f).trim() : f + 'px';
                'float' === c && (c = 'cssFloat');
                d ? a.setProperty(c, e) : a[c] = e;
            }
    }
    var gg = B({ menuitem: !0 }, {
        area: !0,
        base: !0,
        br: !0,
        col: !0,
        embed: !0,
        hr: !0,
        img: !0,
        input: !0,
        keygen: !0,
        link: !0,
        meta: !0,
        param: !0,
        source: !0,
        track: !0,
        wbr: !0
    });
    function hg(a, b, c) {
        b && (gg[a] && (null != b.children || null != b.dangerouslySetInnerHTML ? E('137', a, c()) : void 0), null != b.dangerouslySetInnerHTML && (null != b.children ? E('60') : void 0, 'object' === typeof b.dangerouslySetInnerHTML && '__html' in b.dangerouslySetInnerHTML ? void 0 : E('61')), null != b.style && 'object' !== typeof b.style ? E('62', c()) : void 0);
    }
    function ig(a, b) {
        if (-1 === a.indexOf('-'))
            return 'string' === typeof b.is;
        switch (a) {
        case 'annotation-xml':
        case 'color-profile':
        case 'font-face':
        case 'font-face-src':
        case 'font-face-uri':
        case 'font-face-format':
        case 'font-face-name':
        case 'missing-glyph':
            return !1;
        default:
            return !0;
        }
    }
    var jg = Yf.html, kg = C.thatReturns('');
    function lg(a, b) {
        a = 9 === a.nodeType || 11 === a.nodeType ? a : a.ownerDocument;
        var c = Hd(a);
        b = Sa[b];
        for (var d = 0; d < b.length; d++) {
            var e = b[d];
            c.hasOwnProperty(e) && c[e] || ('topScroll' === e ? wd('topScroll', 'scroll', a) : 'topFocus' === e || 'topBlur' === e ? (wd('topFocus', 'focus', a), wd('topBlur', 'blur', a), c.topBlur = !0, c.topFocus = !0) : 'topCancel' === e ? (yc('cancel', !0) && wd('topCancel', 'cancel', a), c.topCancel = !0) : 'topClose' === e ? (yc('close', !0) && wd('topClose', 'close', a), c.topClose = !0) : Dd.hasOwnProperty(e) && U(e, Dd[e], a), c[e] = !0);
        }
    }
    var mg = {
        topAbort: 'abort',
        topCanPlay: 'canplay',
        topCanPlayThrough: 'canplaythrough',
        topDurationChange: 'durationchange',
        topEmptied: 'emptied',
        topEncrypted: 'encrypted',
        topEnded: 'ended',
        topError: 'error',
        topLoadedData: 'loadeddata',
        topLoadedMetadata: 'loadedmetadata',
        topLoadStart: 'loadstart',
        topPause: 'pause',
        topPlay: 'play',
        topPlaying: 'playing',
        topProgress: 'progress',
        topRateChange: 'ratechange',
        topSeeked: 'seeked',
        topSeeking: 'seeking',
        topStalled: 'stalled',
        topSuspend: 'suspend',
        topTimeUpdate: 'timeupdate',
        topVolumeChange: 'volumechange',
        topWaiting: 'waiting'
    };
    function ng(a, b, c, d) {
        c = 9 === c.nodeType ? c : c.ownerDocument;
        d === jg && (d = Zf(a));
        d === jg ? 'script' === a ? (a = c.createElement('div'), a.innerHTML = '<script></script>', a = a.removeChild(a.firstChild)) : a = 'string' === typeof b.is ? c.createElement(a, { is: b.is }) : c.createElement(a) : a = c.createElementNS(d, a);
        return a;
    }
    function og(a, b) {
        return (9 === b.nodeType ? b : b.ownerDocument).createTextNode(a);
    }
    function pg(a, b, c, d) {
        var e = ig(b, c);
        switch (b) {
        case 'iframe':
        case 'object':
            U('topLoad', 'load', a);
            var f = c;
            break;
        case 'video':
        case 'audio':
            for (f in mg)
                mg.hasOwnProperty(f) && U(f, mg[f], a);
            f = c;
            break;
        case 'source':
            U('topError', 'error', a);
            f = c;
            break;
        case 'img':
        case 'image':
            U('topError', 'error', a);
            U('topLoad', 'load', a);
            f = c;
            break;
        case 'form':
            U('topReset', 'reset', a);
            U('topSubmit', 'submit', a);
            f = c;
            break;
        case 'details':
            U('topToggle', 'toggle', a);
            f = c;
            break;
        case 'input':
            Mf(a, c);
            f = Lf(a, c);
            U('topInvalid', 'invalid', a);
            lg(d, 'onChange');
            break;
        case 'option':
            f = Rf(a, c);
            break;
        case 'select':
            Tf(a, c);
            f = B({}, c, { value: void 0 });
            U('topInvalid', 'invalid', a);
            lg(d, 'onChange');
            break;
        case 'textarea':
            Vf(a, c);
            f = Uf(a, c);
            U('topInvalid', 'invalid', a);
            lg(d, 'onChange');
            break;
        default:
            f = c;
        }
        hg(b, f, kg);
        var g = f, h;
        for (h in g)
            if (g.hasOwnProperty(h)) {
                var k = g[h];
                'style' === h ? fg(a, k, kg) : 'dangerouslySetInnerHTML' === h ? (k = k ? k.__html : void 0, null != k && bg(a, k)) : 'children' === h ? 'string' === typeof k ? ('textarea' !== b || '' !== k) && cg(a, k) : 'number' === typeof k && cg(a, '' + k) : 'suppressContentEditableWarning' !== h && 'suppressHydrationWarning' !== h && 'autoFocus' !== h && (Ra.hasOwnProperty(h) ? null != k && lg(d, h) : e ? Kf(a, h, k) : null != k && If(a, h, k));
            }
        switch (b) {
        case 'input':
            Bc(a);
            Pf(a, c);
            break;
        case 'textarea':
            Bc(a);
            Xf(a, c);
            break;
        case 'option':
            null != c.value && a.setAttribute('value', c.value);
            break;
        case 'select':
            a.multiple = !!c.multiple;
            b = c.value;
            null != b ? Sf(a, !!c.multiple, b, !1) : null != c.defaultValue && Sf(a, !!c.multiple, c.defaultValue, !0);
            break;
        default:
            'function' === typeof f.onClick && (a.onclick = C);
        }
    }
    function sg(a, b, c, d, e) {
        var f = null;
        switch (b) {
        case 'input':
            c = Lf(a, c);
            d = Lf(a, d);
            f = [];
            break;
        case 'option':
            c = Rf(a, c);
            d = Rf(a, d);
            f = [];
            break;
        case 'select':
            c = B({}, c, { value: void 0 });
            d = B({}, d, { value: void 0 });
            f = [];
            break;
        case 'textarea':
            c = Uf(a, c);
            d = Uf(a, d);
            f = [];
            break;
        default:
            'function' !== typeof c.onClick && 'function' === typeof d.onClick && (a.onclick = C);
        }
        hg(b, d, kg);
        var g, h;
        a = null;
        for (g in c)
            if (!d.hasOwnProperty(g) && c.hasOwnProperty(g) && null != c[g])
                if ('style' === g)
                    for (h in b = c[g], b)
                        b.hasOwnProperty(h) && (a || (a = {}), a[h] = '');
                else
                    'dangerouslySetInnerHTML' !== g && 'children' !== g && 'suppressContentEditableWarning' !== g && 'suppressHydrationWarning' !== g && 'autoFocus' !== g && (Ra.hasOwnProperty(g) ? f || (f = []) : (f = f || []).push(g, null));
        for (g in d) {
            var k = d[g];
            b = null != c ? c[g] : void 0;
            if (d.hasOwnProperty(g) && k !== b && (null != k || null != b))
                if ('style' === g)
                    if (b) {
                        for (h in b)
                            !b.hasOwnProperty(h) || k && k.hasOwnProperty(h) || (a || (a = {}), a[h] = '');
                        for (h in k)
                            k.hasOwnProperty(h) && b[h] !== k[h] && (a || (a = {}), a[h] = k[h]);
                    } else
                        a || (f || (f = []), f.push(g, a)), a = k;
                else
                    'dangerouslySetInnerHTML' === g ? (k = k ? k.__html : void 0, b = b ? b.__html : void 0, null != k && b !== k && (f = f || []).push(g, '' + k)) : 'children' === g ? b === k || 'string' !== typeof k && 'number' !== typeof k || (f = f || []).push(g, '' + k) : 'suppressContentEditableWarning' !== g && 'suppressHydrationWarning' !== g && (Ra.hasOwnProperty(g) ? (null != k && lg(e, g), f || b === k || (f = [])) : (f = f || []).push(g, k));
        }
        a && (f = f || []).push('style', a);
        return f;
    }
    function tg(a, b, c, d, e) {
        'input' === c && 'radio' === e.type && null != e.name && Nf(a, e);
        ig(c, d);
        d = ig(c, e);
        for (var f = 0; f < b.length; f += 2) {
            var g = b[f], h = b[f + 1];
            'style' === g ? fg(a, h, kg) : 'dangerouslySetInnerHTML' === g ? bg(a, h) : 'children' === g ? cg(a, h) : d ? null != h ? Kf(a, g, h) : a.removeAttribute(g) : null != h ? If(a, g, h) : Jf(a, g);
        }
        switch (c) {
        case 'input':
            Of(a, e);
            break;
        case 'textarea':
            Wf(a, e);
            break;
        case 'select':
            a._wrapperState.initialValue = void 0, b = a._wrapperState.wasMultiple, a._wrapperState.wasMultiple = !!e.multiple, c = e.value, null != c ? Sf(a, !!e.multiple, c, !1) : b !== !!e.multiple && (null != e.defaultValue ? Sf(a, !!e.multiple, e.defaultValue, !0) : Sf(a, !!e.multiple, e.multiple ? [] : '', !1));
        }
    }
    function ug(a, b, c, d, e) {
        switch (b) {
        case 'iframe':
        case 'object':
            U('topLoad', 'load', a);
            break;
        case 'video':
        case 'audio':
            for (var f in mg)
                mg.hasOwnProperty(f) && U(f, mg[f], a);
            break;
        case 'source':
            U('topError', 'error', a);
            break;
        case 'img':
        case 'image':
            U('topError', 'error', a);
            U('topLoad', 'load', a);
            break;
        case 'form':
            U('topReset', 'reset', a);
            U('topSubmit', 'submit', a);
            break;
        case 'details':
            U('topToggle', 'toggle', a);
            break;
        case 'input':
            Mf(a, c);
            U('topInvalid', 'invalid', a);
            lg(e, 'onChange');
            break;
        case 'select':
            Tf(a, c);
            U('topInvalid', 'invalid', a);
            lg(e, 'onChange');
            break;
        case 'textarea':
            Vf(a, c), U('topInvalid', 'invalid', a), lg(e, 'onChange');
        }
        hg(b, c, kg);
        d = null;
        for (var g in c)
            c.hasOwnProperty(g) && (f = c[g], 'children' === g ? 'string' === typeof f ? a.textContent !== f && (d = [
                'children',
                f
            ]) : 'number' === typeof f && a.textContent !== '' + f && (d = [
                'children',
                '' + f
            ]) : Ra.hasOwnProperty(g) && null != f && lg(e, g));
        switch (b) {
        case 'input':
            Bc(a);
            Pf(a, c);
            break;
        case 'textarea':
            Bc(a);
            Xf(a, c);
            break;
        case 'select':
        case 'option':
            break;
        default:
            'function' === typeof c.onClick && (a.onclick = C);
        }
        return d;
    }
    function vg(a, b) {
        return a.nodeValue !== b;
    }
    var wg = Object.freeze({
        createElement: ng,
        createTextNode: og,
        setInitialProperties: pg,
        diffProperties: sg,
        updateProperties: tg,
        diffHydratedProperties: ug,
        diffHydratedText: vg,
        warnForUnmatchedText: function () {
        },
        warnForDeletedHydratableElement: function () {
        },
        warnForDeletedHydratableText: function () {
        },
        warnForInsertedHydratedElement: function () {
        },
        warnForInsertedHydratedText: function () {
        },
        restoreControlledState: function (a, b, c) {
            switch (b) {
            case 'input':
                Of(a, c);
                b = c.name;
                if ('radio' === c.type && null != b) {
                    for (c = a; c.parentNode;)
                        c = c.parentNode;
                    c = c.querySelectorAll('input[name=' + JSON.stringify('' + b) + '][type="radio"]');
                    for (b = 0; b < c.length; b++) {
                        var d = c[b];
                        if (d !== a && d.form === a.form) {
                            var e = rb(d);
                            e ? void 0 : E('90');
                            Cc(d);
                            Of(d, e);
                        }
                    }
                }
                break;
            case 'textarea':
                Wf(a, c);
                break;
            case 'select':
                b = c.value, null != b && Sf(a, !!c.multiple, b, !1);
            }
        }
    });
    nc.injectFiberControlledHostComponent(wg);
    var xg = null, Mg = null;
    function Ng(a) {
        return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || ' react-mount-point-unstable ' !== a.nodeValue));
    }
    function Og(a) {
        a = a ? 9 === a.nodeType ? a.documentElement : a.firstChild : null;
        return !(!a || 1 !== a.nodeType || !a.hasAttribute('data-reactroot'));
    }
    var Z = of({
        getRootHostContext: function (a) {
            var b = a.nodeType;
            switch (b) {
            case 9:
            case 11:
                a = (a = a.documentElement) ? a.namespaceURI : $f(null, '');
                break;
            default:
                b = 8 === b ? a.parentNode : a, a = b.namespaceURI || null, b = b.tagName, a = $f(a, b);
            }
            return a;
        },
        getChildHostContext: function (a, b) {
            return $f(a, b);
        },
        getPublicInstance: function (a) {
            return a;
        },
        prepareForCommit: function () {
            xg = td;
            var a = da();
            if (Kd(a)) {
                if ('selectionStart' in a)
                    var b = {
                        start: a.selectionStart,
                        end: a.selectionEnd
                    };
                else
                    a: {
                        var c = window.getSelection && window.getSelection();
                        if (c && 0 !== c.rangeCount) {
                            b = c.anchorNode;
                            var d = c.anchorOffset, e = c.focusNode;
                            c = c.focusOffset;
                            try {
                                b.nodeType, e.nodeType;
                            } catch (z) {
                                b = null;
                                break a;
                            }
                            var f = 0, g = -1, h = -1, k = 0, q = 0, v = a, y = null;
                            b:
                                for (;;) {
                                    for (var u;;) {
                                        v !== b || 0 !== d && 3 !== v.nodeType || (g = f + d);
                                        v !== e || 0 !== c && 3 !== v.nodeType || (h = f + c);
                                        3 === v.nodeType && (f += v.nodeValue.length);
                                        if (null === (u = v.firstChild))
                                            break;
                                        y = v;
                                        v = u;
                                    }
                                    for (;;) {
                                        if (v === a)
                                            break b;
                                        y === b && ++k === d && (g = f);
                                        y === e && ++q === c && (h = f);
                                        if (null !== (u = v.nextSibling))
                                            break;
                                        v = y;
                                        y = v.parentNode;
                                    }
                                    v = u;
                                }
                            b = -1 === g || -1 === h ? null : {
                                start: g,
                                end: h
                            };
                        } else
                            b = null;
                    }
                b = b || {
                    start: 0,
                    end: 0
                };
            } else
                b = null;
            Mg = {
                focusedElem: a,
                selectionRange: b
            };
            ud(!1);
        },
        resetAfterCommit: function () {
            var a = Mg, b = da(), c = a.focusedElem, d = a.selectionRange;
            if (b !== c && fa(document.documentElement, c)) {
                if (Kd(c))
                    if (b = d.start, a = d.end, void 0 === a && (a = b), 'selectionStart' in c)
                        c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
                    else if (window.getSelection) {
                        b = window.getSelection();
                        var e = c[Eb()].length;
                        a = Math.min(d.start, e);
                        d = void 0 === d.end ? a : Math.min(d.end, e);
                        !b.extend && a > d && (e = d, d = a, a = e);
                        e = Jd(c, a);
                        var f = Jd(c, d);
                        if (e && f && (1 !== b.rangeCount || b.anchorNode !== e.node || b.anchorOffset !== e.offset || b.focusNode !== f.node || b.focusOffset !== f.offset)) {
                            var g = document.createRange();
                            g.setStart(e.node, e.offset);
                            b.removeAllRanges();
                            a > d ? (b.addRange(g), b.extend(f.node, f.offset)) : (g.setEnd(f.node, f.offset), b.addRange(g));
                        }
                    }
                b = [];
                for (a = c; a = a.parentNode;)
                    1 === a.nodeType && b.push({
                        element: a,
                        left: a.scrollLeft,
                        top: a.scrollTop
                    });
                ia(c);
                for (c = 0; c < b.length; c++)
                    a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
            }
            Mg = null;
            ud(xg);
            xg = null;
        },
        createInstance: function (a, b, c, d, e) {
            a = ng(a, b, c, d);
            a[Q] = e;
            a[ob] = b;
            return a;
        },
        appendInitialChild: function (a, b) {
            a.appendChild(b);
        },
        finalizeInitialChildren: function (a, b, c, d) {
            pg(a, b, c, d);
            a: {
                switch (b) {
                case 'button':
                case 'input':
                case 'select':
                case 'textarea':
                    a = !!c.autoFocus;
                    break a;
                }
                a = !1;
            }
            return a;
        },
        prepareUpdate: function (a, b, c, d, e) {
            return sg(a, b, c, d, e);
        },
        shouldSetTextContent: function (a, b) {
            return 'textarea' === a || 'string' === typeof b.children || 'number' === typeof b.children || 'object' === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && 'string' === typeof b.dangerouslySetInnerHTML.__html;
        },
        shouldDeprioritizeSubtree: function (a, b) {
            return !!b.hidden;
        },
        createTextInstance: function (a, b, c, d) {
            a = og(a, b);
            a[Q] = d;
            return a;
        },
        now: rf,
        mutation: {
            commitMount: function (a) {
                a.focus();
            },
            commitUpdate: function (a, b, c, d, e) {
                a[ob] = e;
                tg(a, b, c, d, e);
            },
            resetTextContent: function (a) {
                a.textContent = '';
            },
            commitTextUpdate: function (a, b, c) {
                a.nodeValue = c;
            },
            appendChild: function (a, b) {
                a.appendChild(b);
            },
            appendChildToContainer: function (a, b) {
                8 === a.nodeType ? a.parentNode.insertBefore(b, a) : a.appendChild(b);
            },
            insertBefore: function (a, b, c) {
                a.insertBefore(b, c);
            },
            insertInContainerBefore: function (a, b, c) {
                8 === a.nodeType ? a.parentNode.insertBefore(b, c) : a.insertBefore(b, c);
            },
            removeChild: function (a, b) {
                a.removeChild(b);
            },
            removeChildFromContainer: function (a, b) {
                8 === a.nodeType ? a.parentNode.removeChild(b) : a.removeChild(b);
            }
        },
        hydration: {
            canHydrateInstance: function (a, b) {
                return 1 !== a.nodeType || b.toLowerCase() !== a.nodeName.toLowerCase() ? null : a;
            },
            canHydrateTextInstance: function (a, b) {
                return '' === b || 3 !== a.nodeType ? null : a;
            },
            getNextHydratableSibling: function (a) {
                for (a = a.nextSibling; a && 1 !== a.nodeType && 3 !== a.nodeType;)
                    a = a.nextSibling;
                return a;
            },
            getFirstHydratableChild: function (a) {
                for (a = a.firstChild; a && 1 !== a.nodeType && 3 !== a.nodeType;)
                    a = a.nextSibling;
                return a;
            },
            hydrateInstance: function (a, b, c, d, e, f) {
                a[Q] = f;
                a[ob] = c;
                return ug(a, b, c, e, d);
            },
            hydrateTextInstance: function (a, b, c) {
                a[Q] = c;
                return vg(a, b);
            },
            didNotMatchHydratedContainerTextInstance: function () {
            },
            didNotMatchHydratedTextInstance: function () {
            },
            didNotHydrateContainerInstance: function () {
            },
            didNotHydrateInstance: function () {
            },
            didNotFindHydratableContainerInstance: function () {
            },
            didNotFindHydratableContainerTextInstance: function () {
            },
            didNotFindHydratableInstance: function () {
            },
            didNotFindHydratableTextInstance: function () {
            }
        },
        scheduleDeferredCallback: sf,
        cancelDeferredCallback: tf,
        useSyncScheduling: !0
    });
    rc = Z.batchedUpdates;
    function Pg(a, b, c, d, e) {
        Ng(c) ? void 0 : E('200');
        var f = c._reactRootContainer;
        if (f)
            Z.updateContainer(b, f, a, e);
        else {
            d = d || Og(c);
            if (!d)
                for (f = void 0; f = c.lastChild;)
                    c.removeChild(f);
            var g = Z.createContainer(c, d);
            f = c._reactRootContainer = g;
            Z.unbatchedUpdates(function () {
                Z.updateContainer(b, g, a, e);
            });
        }
        return Z.getPublicRootInstance(f);
    }
    function Qg(a, b) {
        var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        Ng(b) ? void 0 : E('200');
        return pf(a, b, null, c);
    }
    function Rg(a, b) {
        this._reactRootContainer = Z.createContainer(a, b);
    }
    Rg.prototype.render = function (a, b) {
        Z.updateContainer(a, this._reactRootContainer, null, b);
    };
    Rg.prototype.unmount = function (a) {
        Z.updateContainer(null, this._reactRootContainer, null, a);
    };
    var Sg = {
        createPortal: Qg,
        findDOMNode: function (a) {
            if (null == a)
                return null;
            if (1 === a.nodeType)
                return a;
            var b = a._reactInternalFiber;
            if (b)
                return Z.findHostInstance(b);
            'function' === typeof a.render ? E('188') : E('213', Object.keys(a));
        },
        hydrate: function (a, b, c) {
            return Pg(null, a, b, !0, c);
        },
        render: function (a, b, c) {
            return Pg(null, a, b, !1, c);
        },
        unstable_renderSubtreeIntoContainer: function (a, b, c, d) {
            null == a || void 0 === a._reactInternalFiber ? E('38') : void 0;
            return Pg(a, b, c, !1, d);
        },
        unmountComponentAtNode: function (a) {
            Ng(a) ? void 0 : E('40');
            return a._reactRootContainer ? (Z.unbatchedUpdates(function () {
                Pg(null, null, a, !1, function () {
                    a._reactRootContainer = null;
                });
            }), !0) : !1;
        },
        unstable_createPortal: Qg,
        unstable_batchedUpdates: tc,
        unstable_deferredUpdates: Z.deferredUpdates,
        flushSync: Z.flushSync,
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
            EventPluginHub: mb,
            EventPluginRegistry: Va,
            EventPropagators: Cb,
            ReactControlledComponent: qc,
            ReactDOMComponentTree: sb,
            ReactDOMEventListener: xd
        }
    };
    Z.injectIntoDevTools({
        findFiberByHostInstance: pb,
        bundleType: 0,
        version: '16.2.0',
        rendererPackageName: 'react-dom'
    });
    var Tg = Object.freeze({ default: Sg }), Ug = Tg && Sg || Tg;
    module.exports = Ug['default'] ? Ug['default'] : Ug;
});
/*fbjs@0.8.16#lib/hyphenate*/
define('fbjs@0.8.16#lib/hyphenate', function (require, exports, module) {
    'use strict';
    var _uppercasePattern = /([A-Z])/g;
    function hyphenate(string) {
        return string.replace(_uppercasePattern, '-$1').toLowerCase();
    }
    module.exports = hyphenate;
});
/*fbjs@0.8.16#lib/hyphenateStyleName*/
define('fbjs@0.8.16#lib/hyphenateStyleName', [
    'require',
    'exports',
    'module',
    './hyphenate'
], function (require, exports, module) {
    'use strict';
    var hyphenate = require('./hyphenate');
    var msPattern = /^ms-/;
    function hyphenateStyleName(string) {
        return hyphenate(string).replace(msPattern, '-ms-');
    }
    module.exports = hyphenateStyleName;
});
/*fbjs@0.8.16#lib/camelize*/
define('fbjs@0.8.16#lib/camelize', function (require, exports, module) {
    'use strict';
    var _hyphenPattern = /-(.)/g;
    function camelize(string) {
        return string.replace(_hyphenPattern, function (_, character) {
            return character.toUpperCase();
        });
    }
    module.exports = camelize;
});
/*fbjs@0.8.16#lib/camelizeStyleName*/
define('fbjs@0.8.16#lib/camelizeStyleName', [
    'require',
    'exports',
    'module',
    './camelize'
], function (require, exports, module) {
    'use strict';
    var camelize = require('./camelize');
    var msPattern = /^-ms-/;
    function camelizeStyleName(string) {
        return camelize(string.replace(msPattern, 'ms-'));
    }
    module.exports = camelizeStyleName;
});
/*react-dom@16.2.0#cjs/react-dom.development*/
define('react-dom@16.2.0#cjs/react-dom.development', [
    'require',
    'exports',
    'module',
    'react',
    'fbjs/lib/invariant',
    'fbjs/lib/warning',
    'fbjs/lib/ExecutionEnvironment',
    'object-assign',
    'fbjs/lib/emptyFunction',
    'fbjs/lib/EventListener',
    'fbjs/lib/getActiveElement',
    'fbjs/lib/shallowEqual',
    'fbjs/lib/containsNode',
    'fbjs/lib/focusNode',
    'fbjs/lib/emptyObject',
    'prop-types/checkPropTypes',
    'fbjs/lib/hyphenateStyleName',
    'fbjs/lib/camelizeStyleName'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        if (process.env.NODE_ENV !== 'production') {
            (function () {
                'use strict';
                var React = require('react');
                var invariant = require('fbjs/lib/invariant');
                var warning = require('fbjs/lib/warning');
                var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
                var _assign = require('object-assign');
                var emptyFunction = require('fbjs/lib/emptyFunction');
                var EventListener = require('fbjs/lib/EventListener');
                var getActiveElement = require('fbjs/lib/getActiveElement');
                var shallowEqual = require('fbjs/lib/shallowEqual');
                var containsNode = require('fbjs/lib/containsNode');
                var focusNode = require('fbjs/lib/focusNode');
                var emptyObject = require('fbjs/lib/emptyObject');
                var checkPropTypes = require('prop-types/checkPropTypes');
                var hyphenateStyleName = require('fbjs/lib/hyphenateStyleName');
                var camelizeStyleName = require('fbjs/lib/camelizeStyleName');
                !React ? invariant(false, 'ReactDOM was loaded before React. Make sure you load the React package before loading ReactDOM.') : void 0;
                var RESERVED_PROPS = {
                    children: true,
                    dangerouslySetInnerHTML: true,
                    defaultValue: true,
                    defaultChecked: true,
                    innerHTML: true,
                    suppressContentEditableWarning: true,
                    suppressHydrationWarning: true,
                    style: true
                };
                function checkMask(value, bitmask) {
                    return (value & bitmask) === bitmask;
                }
                var DOMPropertyInjection = {
                    MUST_USE_PROPERTY: 1,
                    HAS_BOOLEAN_VALUE: 4,
                    HAS_NUMERIC_VALUE: 8,
                    HAS_POSITIVE_NUMERIC_VALUE: 16 | 8,
                    HAS_OVERLOADED_BOOLEAN_VALUE: 32,
                    HAS_STRING_BOOLEAN_VALUE: 64,
                    injectDOMPropertyConfig: function (domPropertyConfig) {
                        var Injection = DOMPropertyInjection;
                        var Properties = domPropertyConfig.Properties || {};
                        var DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
                        var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
                        var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};
                        for (var propName in Properties) {
                            !!properties.hasOwnProperty(propName) ? invariant(false, 'injectDOMPropertyConfig(...): You\'re trying to inject DOM property \'%s\' which has already been injected. You may be accidentally injecting the same DOM property config twice, or you may be injecting two configs that have conflicting property names.', propName) : void 0;
                            var lowerCased = propName.toLowerCase();
                            var propConfig = Properties[propName];
                            var propertyInfo = {
                                attributeName: lowerCased,
                                attributeNamespace: null,
                                propertyName: propName,
                                mutationMethod: null,
                                mustUseProperty: checkMask(propConfig, Injection.MUST_USE_PROPERTY),
                                hasBooleanValue: checkMask(propConfig, Injection.HAS_BOOLEAN_VALUE),
                                hasNumericValue: checkMask(propConfig, Injection.HAS_NUMERIC_VALUE),
                                hasPositiveNumericValue: checkMask(propConfig, Injection.HAS_POSITIVE_NUMERIC_VALUE),
                                hasOverloadedBooleanValue: checkMask(propConfig, Injection.HAS_OVERLOADED_BOOLEAN_VALUE),
                                hasStringBooleanValue: checkMask(propConfig, Injection.HAS_STRING_BOOLEAN_VALUE)
                            };
                            !(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1) ? invariant(false, 'DOMProperty: Value can be one of boolean, overloaded boolean, or numeric value, but not a combination: %s', propName) : void 0;
                            if (DOMAttributeNames.hasOwnProperty(propName)) {
                                var attributeName = DOMAttributeNames[propName];
                                propertyInfo.attributeName = attributeName;
                            }
                            if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
                                propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
                            }
                            if (DOMMutationMethods.hasOwnProperty(propName)) {
                                propertyInfo.mutationMethod = DOMMutationMethods[propName];
                            }
                            properties[propName] = propertyInfo;
                        }
                    }
                };
                var ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
                var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
                var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
                var properties = {};
                function shouldSetAttribute(name, value) {
                    if (isReservedProp(name)) {
                        return false;
                    }
                    if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
                        return false;
                    }
                    if (value === null) {
                        return true;
                    }
                    switch (typeof value) {
                    case 'boolean':
                        return shouldAttributeAcceptBooleanValue(name);
                    case 'undefined':
                    case 'number':
                    case 'string':
                    case 'object':
                        return true;
                    default:
                        return false;
                    }
                }
                function getPropertyInfo(name) {
                    return properties.hasOwnProperty(name) ? properties[name] : null;
                }
                function shouldAttributeAcceptBooleanValue(name) {
                    if (isReservedProp(name)) {
                        return true;
                    }
                    var propertyInfo = getPropertyInfo(name);
                    if (propertyInfo) {
                        return propertyInfo.hasBooleanValue || propertyInfo.hasStringBooleanValue || propertyInfo.hasOverloadedBooleanValue;
                    }
                    var prefix = name.toLowerCase().slice(0, 5);
                    return prefix === 'data-' || prefix === 'aria-';
                }
                function isReservedProp(name) {
                    return RESERVED_PROPS.hasOwnProperty(name);
                }
                var injection = DOMPropertyInjection;
                var MUST_USE_PROPERTY = injection.MUST_USE_PROPERTY;
                var HAS_BOOLEAN_VALUE = injection.HAS_BOOLEAN_VALUE;
                var HAS_NUMERIC_VALUE = injection.HAS_NUMERIC_VALUE;
                var HAS_POSITIVE_NUMERIC_VALUE = injection.HAS_POSITIVE_NUMERIC_VALUE;
                var HAS_OVERLOADED_BOOLEAN_VALUE = injection.HAS_OVERLOADED_BOOLEAN_VALUE;
                var HAS_STRING_BOOLEAN_VALUE = injection.HAS_STRING_BOOLEAN_VALUE;
                var HTMLDOMPropertyConfig = {
                    Properties: {
                        allowFullScreen: HAS_BOOLEAN_VALUE,
                        async: HAS_BOOLEAN_VALUE,
                        autoFocus: HAS_BOOLEAN_VALUE,
                        autoPlay: HAS_BOOLEAN_VALUE,
                        capture: HAS_OVERLOADED_BOOLEAN_VALUE,
                        checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
                        cols: HAS_POSITIVE_NUMERIC_VALUE,
                        contentEditable: HAS_STRING_BOOLEAN_VALUE,
                        controls: HAS_BOOLEAN_VALUE,
                        'default': HAS_BOOLEAN_VALUE,
                        defer: HAS_BOOLEAN_VALUE,
                        disabled: HAS_BOOLEAN_VALUE,
                        download: HAS_OVERLOADED_BOOLEAN_VALUE,
                        draggable: HAS_STRING_BOOLEAN_VALUE,
                        formNoValidate: HAS_BOOLEAN_VALUE,
                        hidden: HAS_BOOLEAN_VALUE,
                        loop: HAS_BOOLEAN_VALUE,
                        multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
                        muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
                        noValidate: HAS_BOOLEAN_VALUE,
                        open: HAS_BOOLEAN_VALUE,
                        playsInline: HAS_BOOLEAN_VALUE,
                        readOnly: HAS_BOOLEAN_VALUE,
                        required: HAS_BOOLEAN_VALUE,
                        reversed: HAS_BOOLEAN_VALUE,
                        rows: HAS_POSITIVE_NUMERIC_VALUE,
                        rowSpan: HAS_NUMERIC_VALUE,
                        scoped: HAS_BOOLEAN_VALUE,
                        seamless: HAS_BOOLEAN_VALUE,
                        selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
                        size: HAS_POSITIVE_NUMERIC_VALUE,
                        start: HAS_NUMERIC_VALUE,
                        span: HAS_POSITIVE_NUMERIC_VALUE,
                        spellCheck: HAS_STRING_BOOLEAN_VALUE,
                        style: 0,
                        tabIndex: 0,
                        itemScope: HAS_BOOLEAN_VALUE,
                        acceptCharset: 0,
                        className: 0,
                        htmlFor: 0,
                        httpEquiv: 0,
                        value: HAS_STRING_BOOLEAN_VALUE
                    },
                    DOMAttributeNames: {
                        acceptCharset: 'accept-charset',
                        className: 'class',
                        htmlFor: 'for',
                        httpEquiv: 'http-equiv'
                    },
                    DOMMutationMethods: {
                        value: function (node, value) {
                            if (value == null) {
                                return node.removeAttribute('value');
                            }
                            if (node.type !== 'number' || node.hasAttribute('value') === false) {
                                node.setAttribute('value', '' + value);
                            } else if (node.validity && !node.validity.badInput && node.ownerDocument.activeElement !== node) {
                                node.setAttribute('value', '' + value);
                            }
                        }
                    }
                };
                var HAS_STRING_BOOLEAN_VALUE$1 = injection.HAS_STRING_BOOLEAN_VALUE;
                var NS = {
                    xlink: 'http://www.w3.org/1999/xlink',
                    xml: 'http://www.w3.org/XML/1998/namespace'
                };
                var ATTRS = [
                    'accent-height',
                    'alignment-baseline',
                    'arabic-form',
                    'baseline-shift',
                    'cap-height',
                    'clip-path',
                    'clip-rule',
                    'color-interpolation',
                    'color-interpolation-filters',
                    'color-profile',
                    'color-rendering',
                    'dominant-baseline',
                    'enable-background',
                    'fill-opacity',
                    'fill-rule',
                    'flood-color',
                    'flood-opacity',
                    'font-family',
                    'font-size',
                    'font-size-adjust',
                    'font-stretch',
                    'font-style',
                    'font-variant',
                    'font-weight',
                    'glyph-name',
                    'glyph-orientation-horizontal',
                    'glyph-orientation-vertical',
                    'horiz-adv-x',
                    'horiz-origin-x',
                    'image-rendering',
                    'letter-spacing',
                    'lighting-color',
                    'marker-end',
                    'marker-mid',
                    'marker-start',
                    'overline-position',
                    'overline-thickness',
                    'paint-order',
                    'panose-1',
                    'pointer-events',
                    'rendering-intent',
                    'shape-rendering',
                    'stop-color',
                    'stop-opacity',
                    'strikethrough-position',
                    'strikethrough-thickness',
                    'stroke-dasharray',
                    'stroke-dashoffset',
                    'stroke-linecap',
                    'stroke-linejoin',
                    'stroke-miterlimit',
                    'stroke-opacity',
                    'stroke-width',
                    'text-anchor',
                    'text-decoration',
                    'text-rendering',
                    'underline-position',
                    'underline-thickness',
                    'unicode-bidi',
                    'unicode-range',
                    'units-per-em',
                    'v-alphabetic',
                    'v-hanging',
                    'v-ideographic',
                    'v-mathematical',
                    'vector-effect',
                    'vert-adv-y',
                    'vert-origin-x',
                    'vert-origin-y',
                    'word-spacing',
                    'writing-mode',
                    'x-height',
                    'xlink:actuate',
                    'xlink:arcrole',
                    'xlink:href',
                    'xlink:role',
                    'xlink:show',
                    'xlink:title',
                    'xlink:type',
                    'xml:base',
                    'xmlns:xlink',
                    'xml:lang',
                    'xml:space'
                ];
                var SVGDOMPropertyConfig = {
                    Properties: {
                        autoReverse: HAS_STRING_BOOLEAN_VALUE$1,
                        externalResourcesRequired: HAS_STRING_BOOLEAN_VALUE$1,
                        preserveAlpha: HAS_STRING_BOOLEAN_VALUE$1
                    },
                    DOMAttributeNames: {
                        autoReverse: 'autoReverse',
                        externalResourcesRequired: 'externalResourcesRequired',
                        preserveAlpha: 'preserveAlpha'
                    },
                    DOMAttributeNamespaces: {
                        xlinkActuate: NS.xlink,
                        xlinkArcrole: NS.xlink,
                        xlinkHref: NS.xlink,
                        xlinkRole: NS.xlink,
                        xlinkShow: NS.xlink,
                        xlinkTitle: NS.xlink,
                        xlinkType: NS.xlink,
                        xmlBase: NS.xml,
                        xmlLang: NS.xml,
                        xmlSpace: NS.xml
                    }
                };
                var CAMELIZE = /[\-\:]([a-z])/g;
                var capitalize = function (token) {
                    return token[1].toUpperCase();
                };
                ATTRS.forEach(function (original) {
                    var reactName = original.replace(CAMELIZE, capitalize);
                    SVGDOMPropertyConfig.Properties[reactName] = 0;
                    SVGDOMPropertyConfig.DOMAttributeNames[reactName] = original;
                });
                injection.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
                injection.injectDOMPropertyConfig(SVGDOMPropertyConfig);
                var ReactErrorUtils = {
                    _caughtError: null,
                    _hasCaughtError: false,
                    _rethrowError: null,
                    _hasRethrowError: false,
                    injection: {
                        injectErrorUtils: function (injectedErrorUtils) {
                            !(typeof injectedErrorUtils.invokeGuardedCallback === 'function') ? invariant(false, 'Injected invokeGuardedCallback() must be a function.') : void 0;
                            invokeGuardedCallback = injectedErrorUtils.invokeGuardedCallback;
                        }
                    },
                    invokeGuardedCallback: function (name, func, context, a, b, c, d, e, f) {
                        invokeGuardedCallback.apply(ReactErrorUtils, arguments);
                    },
                    invokeGuardedCallbackAndCatchFirstError: function (name, func, context, a, b, c, d, e, f) {
                        ReactErrorUtils.invokeGuardedCallback.apply(this, arguments);
                        if (ReactErrorUtils.hasCaughtError()) {
                            var error = ReactErrorUtils.clearCaughtError();
                            if (!ReactErrorUtils._hasRethrowError) {
                                ReactErrorUtils._hasRethrowError = true;
                                ReactErrorUtils._rethrowError = error;
                            }
                        }
                    },
                    rethrowCaughtError: function () {
                        return rethrowCaughtError.apply(ReactErrorUtils, arguments);
                    },
                    hasCaughtError: function () {
                        return ReactErrorUtils._hasCaughtError;
                    },
                    clearCaughtError: function () {
                        if (ReactErrorUtils._hasCaughtError) {
                            var error = ReactErrorUtils._caughtError;
                            ReactErrorUtils._caughtError = null;
                            ReactErrorUtils._hasCaughtError = false;
                            return error;
                        } else {
                            invariant(false, 'clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.');
                        }
                    }
                };
                var invokeGuardedCallback = function (name, func, context, a, b, c, d, e, f) {
                    ReactErrorUtils._hasCaughtError = false;
                    ReactErrorUtils._caughtError = null;
                    var funcArgs = Array.prototype.slice.call(arguments, 3);
                    try {
                        func.apply(context, funcArgs);
                    } catch (error) {
                        ReactErrorUtils._caughtError = error;
                        ReactErrorUtils._hasCaughtError = true;
                    }
                };
                {
                    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
                        var fakeNode = document.createElement('react');
                        var invokeGuardedCallbackDev = function (name, func, context, a, b, c, d, e, f) {
                            var didError = true;
                            var funcArgs = Array.prototype.slice.call(arguments, 3);
                            function callCallback() {
                                fakeNode.removeEventListener(evtType, callCallback, false);
                                func.apply(context, funcArgs);
                                didError = false;
                            }
                            var error = void 0;
                            var didSetError = false;
                            var isCrossOriginError = false;
                            function onError(event) {
                                error = event.error;
                                didSetError = true;
                                if (error === null && event.colno === 0 && event.lineno === 0) {
                                    isCrossOriginError = true;
                                }
                            }
                            var evtType = 'react-' + (name ? name : 'invokeguardedcallback');
                            window.addEventListener('error', onError);
                            fakeNode.addEventListener(evtType, callCallback, false);
                            var evt = document.createEvent('Event');
                            evt.initEvent(evtType, false, false);
                            fakeNode.dispatchEvent(evt);
                            if (didError) {
                                if (!didSetError) {
                                    error = new Error('An error was thrown inside one of your components, but React ' + 'doesn\'t know what it was. This is likely due to browser ' + 'flakiness. React does its best to preserve the "Pause on ' + 'exceptions" behavior of the DevTools, which requires some ' + 'DEV-mode only tricks. It\'s possible that these don\'t work in ' + 'your browser. Try triggering the error in production mode, ' + 'or switching to a modern browser. If you suspect that this is ' + 'actually an issue with React, please file an issue.');
                                } else if (isCrossOriginError) {
                                    error = new Error('A cross-origin error was thrown. React doesn\'t have access to ' + 'the actual error object in development. ' + 'See https://fb.me/react-crossorigin-error for more information.');
                                }
                                ReactErrorUtils._hasCaughtError = true;
                                ReactErrorUtils._caughtError = error;
                            } else {
                                ReactErrorUtils._hasCaughtError = false;
                                ReactErrorUtils._caughtError = null;
                            }
                            window.removeEventListener('error', onError);
                        };
                        invokeGuardedCallback = invokeGuardedCallbackDev;
                    }
                }
                var rethrowCaughtError = function () {
                    if (ReactErrorUtils._hasRethrowError) {
                        var error = ReactErrorUtils._rethrowError;
                        ReactErrorUtils._rethrowError = null;
                        ReactErrorUtils._hasRethrowError = false;
                        throw error;
                    }
                };
                var eventPluginOrder = null;
                var namesToPlugins = {};
                function recomputePluginOrdering() {
                    if (!eventPluginOrder) {
                        return;
                    }
                    for (var pluginName in namesToPlugins) {
                        var pluginModule = namesToPlugins[pluginName];
                        var pluginIndex = eventPluginOrder.indexOf(pluginName);
                        !(pluginIndex > -1) ? invariant(false, 'EventPluginRegistry: Cannot inject event plugins that do not exist in the plugin ordering, `%s`.', pluginName) : void 0;
                        if (plugins[pluginIndex]) {
                            continue;
                        }
                        !pluginModule.extractEvents ? invariant(false, 'EventPluginRegistry: Event plugins must implement an `extractEvents` method, but `%s` does not.', pluginName) : void 0;
                        plugins[pluginIndex] = pluginModule;
                        var publishedEvents = pluginModule.eventTypes;
                        for (var eventName in publishedEvents) {
                            !publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName) ? invariant(false, 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : void 0;
                        }
                    }
                }
                function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
                    !!eventNameDispatchConfigs.hasOwnProperty(eventName) ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same event name, `%s`.', eventName) : void 0;
                    eventNameDispatchConfigs[eventName] = dispatchConfig;
                    var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
                    if (phasedRegistrationNames) {
                        for (var phaseName in phasedRegistrationNames) {
                            if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
                                var phasedRegistrationName = phasedRegistrationNames[phaseName];
                                publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
                            }
                        }
                        return true;
                    } else if (dispatchConfig.registrationName) {
                        publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
                        return true;
                    }
                    return false;
                }
                function publishRegistrationName(registrationName, pluginModule, eventName) {
                    !!registrationNameModules[registrationName] ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same registration name, `%s`.', registrationName) : void 0;
                    registrationNameModules[registrationName] = pluginModule;
                    registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;
                    {
                        var lowerCasedName = registrationName.toLowerCase();
                        possibleRegistrationNames[lowerCasedName] = registrationName;
                        if (registrationName === 'onDoubleClick') {
                            possibleRegistrationNames.ondblclick = registrationName;
                        }
                    }
                }
                var plugins = [];
                var eventNameDispatchConfigs = {};
                var registrationNameModules = {};
                var registrationNameDependencies = {};
                var possibleRegistrationNames = {};
                function injectEventPluginOrder(injectedEventPluginOrder) {
                    !!eventPluginOrder ? invariant(false, 'EventPluginRegistry: Cannot inject event plugin ordering more than once. You are likely trying to load more than one copy of React.') : void 0;
                    eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
                    recomputePluginOrdering();
                }
                function injectEventPluginsByName(injectedNamesToPlugins) {
                    var isOrderingDirty = false;
                    for (var pluginName in injectedNamesToPlugins) {
                        if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
                            continue;
                        }
                        var pluginModule = injectedNamesToPlugins[pluginName];
                        if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
                            !!namesToPlugins[pluginName] ? invariant(false, 'EventPluginRegistry: Cannot inject two different event plugins using the same name, `%s`.', pluginName) : void 0;
                            namesToPlugins[pluginName] = pluginModule;
                            isOrderingDirty = true;
                        }
                    }
                    if (isOrderingDirty) {
                        recomputePluginOrdering();
                    }
                }
                var EventPluginRegistry = Object.freeze({
                    plugins: plugins,
                    eventNameDispatchConfigs: eventNameDispatchConfigs,
                    registrationNameModules: registrationNameModules,
                    registrationNameDependencies: registrationNameDependencies,
                    possibleRegistrationNames: possibleRegistrationNames,
                    injectEventPluginOrder: injectEventPluginOrder,
                    injectEventPluginsByName: injectEventPluginsByName
                });
                var getFiberCurrentPropsFromNode = null;
                var getInstanceFromNode = null;
                var getNodeFromInstance = null;
                var injection$2 = {
                    injectComponentTree: function (Injected) {
                        getFiberCurrentPropsFromNode = Injected.getFiberCurrentPropsFromNode;
                        getInstanceFromNode = Injected.getInstanceFromNode;
                        getNodeFromInstance = Injected.getNodeFromInstance;
                        {
                            warning(getNodeFromInstance && getInstanceFromNode, 'EventPluginUtils.injection.injectComponentTree(...): Injected ' + 'module is missing getNodeFromInstance or getInstanceFromNode.');
                        }
                    }
                };
                var validateEventDispatches;
                {
                    validateEventDispatches = function (event) {
                        var dispatchListeners = event._dispatchListeners;
                        var dispatchInstances = event._dispatchInstances;
                        var listenersIsArr = Array.isArray(dispatchListeners);
                        var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;
                        var instancesIsArr = Array.isArray(dispatchInstances);
                        var instancesLen = instancesIsArr ? dispatchInstances.length : dispatchInstances ? 1 : 0;
                        warning(instancesIsArr === listenersIsArr && instancesLen === listenersLen, 'EventPluginUtils: Invalid `event`.');
                    };
                }
                function executeDispatch(event, simulated, listener, inst) {
                    var type = event.type || 'unknown-event';
                    event.currentTarget = getNodeFromInstance(inst);
                    ReactErrorUtils.invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
                    event.currentTarget = null;
                }
                function executeDispatchesInOrder(event, simulated) {
                    var dispatchListeners = event._dispatchListeners;
                    var dispatchInstances = event._dispatchInstances;
                    {
                        validateEventDispatches(event);
                    }
                    if (Array.isArray(dispatchListeners)) {
                        for (var i = 0; i < dispatchListeners.length; i++) {
                            if (event.isPropagationStopped()) {
                                break;
                            }
                            executeDispatch(event, simulated, dispatchListeners[i], dispatchInstances[i]);
                        }
                    } else if (dispatchListeners) {
                        executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
                    }
                    event._dispatchListeners = null;
                    event._dispatchInstances = null;
                }
                function accumulateInto(current, next) {
                    !(next != null) ? invariant(false, 'accumulateInto(...): Accumulated items must not be null or undefined.') : void 0;
                    if (current == null) {
                        return next;
                    }
                    if (Array.isArray(current)) {
                        if (Array.isArray(next)) {
                            current.push.apply(current, next);
                            return current;
                        }
                        current.push(next);
                        return current;
                    }
                    if (Array.isArray(next)) {
                        return [current].concat(next);
                    }
                    return [
                        current,
                        next
                    ];
                }
                function forEachAccumulated(arr, cb, scope) {
                    if (Array.isArray(arr)) {
                        arr.forEach(cb, scope);
                    } else if (arr) {
                        cb.call(scope, arr);
                    }
                }
                var eventQueue = null;
                var executeDispatchesAndRelease = function (event, simulated) {
                    if (event) {
                        executeDispatchesInOrder(event, simulated);
                        if (!event.isPersistent()) {
                            event.constructor.release(event);
                        }
                    }
                };
                var executeDispatchesAndReleaseSimulated = function (e) {
                    return executeDispatchesAndRelease(e, true);
                };
                var executeDispatchesAndReleaseTopLevel = function (e) {
                    return executeDispatchesAndRelease(e, false);
                };
                function isInteractive(tag) {
                    return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
                }
                function shouldPreventMouseEvent(name, type, props) {
                    switch (name) {
                    case 'onClick':
                    case 'onClickCapture':
                    case 'onDoubleClick':
                    case 'onDoubleClickCapture':
                    case 'onMouseDown':
                    case 'onMouseDownCapture':
                    case 'onMouseMove':
                    case 'onMouseMoveCapture':
                    case 'onMouseUp':
                    case 'onMouseUpCapture':
                        return !!(props.disabled && isInteractive(type));
                    default:
                        return false;
                    }
                }
                var injection$1 = {
                    injectEventPluginOrder: injectEventPluginOrder,
                    injectEventPluginsByName: injectEventPluginsByName
                };
                function getListener(inst, registrationName) {
                    var listener;
                    var stateNode = inst.stateNode;
                    if (!stateNode) {
                        return null;
                    }
                    var props = getFiberCurrentPropsFromNode(stateNode);
                    if (!props) {
                        return null;
                    }
                    listener = props[registrationName];
                    if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
                        return null;
                    }
                    !(!listener || typeof listener === 'function') ? invariant(false, 'Expected `%s` listener to be a function, instead got a value of `%s` type.', registrationName, typeof listener) : void 0;
                    return listener;
                }
                function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                    var events;
                    for (var i = 0; i < plugins.length; i++) {
                        var possiblePlugin = plugins[i];
                        if (possiblePlugin) {
                            var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
                            if (extractedEvents) {
                                events = accumulateInto(events, extractedEvents);
                            }
                        }
                    }
                    return events;
                }
                function enqueueEvents(events) {
                    if (events) {
                        eventQueue = accumulateInto(eventQueue, events);
                    }
                }
                function processEventQueue(simulated) {
                    var processingEventQueue = eventQueue;
                    eventQueue = null;
                    if (!processingEventQueue) {
                        return;
                    }
                    if (simulated) {
                        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
                    } else {
                        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
                    }
                    !!eventQueue ? invariant(false, 'processEventQueue(): Additional events were enqueued while processing an event queue. Support for this has not yet been implemented.') : void 0;
                    ReactErrorUtils.rethrowCaughtError();
                }
                var EventPluginHub = Object.freeze({
                    injection: injection$1,
                    getListener: getListener,
                    extractEvents: extractEvents,
                    enqueueEvents: enqueueEvents,
                    processEventQueue: processEventQueue
                });
                var IndeterminateComponent = 0;
                var FunctionalComponent = 1;
                var ClassComponent = 2;
                var HostRoot = 3;
                var HostPortal = 4;
                var HostComponent = 5;
                var HostText = 6;
                var CallComponent = 7;
                var CallHandlerPhase = 8;
                var ReturnComponent = 9;
                var Fragment = 10;
                var randomKey = Math.random().toString(36).slice(2);
                var internalInstanceKey = '__reactInternalInstance$' + randomKey;
                var internalEventHandlersKey = '__reactEventHandlers$' + randomKey;
                function precacheFiberNode$1(hostInst, node) {
                    node[internalInstanceKey] = hostInst;
                }
                function getClosestInstanceFromNode(node) {
                    if (node[internalInstanceKey]) {
                        return node[internalInstanceKey];
                    }
                    var parents = [];
                    while (!node[internalInstanceKey]) {
                        parents.push(node);
                        if (node.parentNode) {
                            node = node.parentNode;
                        } else {
                            return null;
                        }
                    }
                    var closest = void 0;
                    var inst = node[internalInstanceKey];
                    if (inst.tag === HostComponent || inst.tag === HostText) {
                        return inst;
                    }
                    for (; node && (inst = node[internalInstanceKey]); node = parents.pop()) {
                        closest = inst;
                    }
                    return closest;
                }
                function getInstanceFromNode$1(node) {
                    var inst = node[internalInstanceKey];
                    if (inst) {
                        if (inst.tag === HostComponent || inst.tag === HostText) {
                            return inst;
                        } else {
                            return null;
                        }
                    }
                    return null;
                }
                function getNodeFromInstance$1(inst) {
                    if (inst.tag === HostComponent || inst.tag === HostText) {
                        return inst.stateNode;
                    }
                    invariant(false, 'getNodeFromInstance: Invalid argument.');
                }
                function getFiberCurrentPropsFromNode$1(node) {
                    return node[internalEventHandlersKey] || null;
                }
                function updateFiberProps$1(node, props) {
                    node[internalEventHandlersKey] = props;
                }
                var ReactDOMComponentTree = Object.freeze({
                    precacheFiberNode: precacheFiberNode$1,
                    getClosestInstanceFromNode: getClosestInstanceFromNode,
                    getInstanceFromNode: getInstanceFromNode$1,
                    getNodeFromInstance: getNodeFromInstance$1,
                    getFiberCurrentPropsFromNode: getFiberCurrentPropsFromNode$1,
                    updateFiberProps: updateFiberProps$1
                });
                function getParent(inst) {
                    do {
                        inst = inst['return'];
                    } while (inst && inst.tag !== HostComponent);
                    if (inst) {
                        return inst;
                    }
                    return null;
                }
                function getLowestCommonAncestor(instA, instB) {
                    var depthA = 0;
                    for (var tempA = instA; tempA; tempA = getParent(tempA)) {
                        depthA++;
                    }
                    var depthB = 0;
                    for (var tempB = instB; tempB; tempB = getParent(tempB)) {
                        depthB++;
                    }
                    while (depthA - depthB > 0) {
                        instA = getParent(instA);
                        depthA--;
                    }
                    while (depthB - depthA > 0) {
                        instB = getParent(instB);
                        depthB--;
                    }
                    var depth = depthA;
                    while (depth--) {
                        if (instA === instB || instA === instB.alternate) {
                            return instA;
                        }
                        instA = getParent(instA);
                        instB = getParent(instB);
                    }
                    return null;
                }
                function getParentInstance(inst) {
                    return getParent(inst);
                }
                function traverseTwoPhase(inst, fn, arg) {
                    var path = [];
                    while (inst) {
                        path.push(inst);
                        inst = getParent(inst);
                    }
                    var i;
                    for (i = path.length; i-- > 0;) {
                        fn(path[i], 'captured', arg);
                    }
                    for (i = 0; i < path.length; i++) {
                        fn(path[i], 'bubbled', arg);
                    }
                }
                function traverseEnterLeave(from, to, fn, argFrom, argTo) {
                    var common = from && to ? getLowestCommonAncestor(from, to) : null;
                    var pathFrom = [];
                    while (true) {
                        if (!from) {
                            break;
                        }
                        if (from === common) {
                            break;
                        }
                        var alternate = from.alternate;
                        if (alternate !== null && alternate === common) {
                            break;
                        }
                        pathFrom.push(from);
                        from = getParent(from);
                    }
                    var pathTo = [];
                    while (true) {
                        if (!to) {
                            break;
                        }
                        if (to === common) {
                            break;
                        }
                        var _alternate = to.alternate;
                        if (_alternate !== null && _alternate === common) {
                            break;
                        }
                        pathTo.push(to);
                        to = getParent(to);
                    }
                    for (var i = 0; i < pathFrom.length; i++) {
                        fn(pathFrom[i], 'bubbled', argFrom);
                    }
                    for (var _i = pathTo.length; _i-- > 0;) {
                        fn(pathTo[_i], 'captured', argTo);
                    }
                }
                function listenerAtPhase(inst, event, propagationPhase) {
                    var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
                    return getListener(inst, registrationName);
                }
                function accumulateDirectionalDispatches(inst, phase, event) {
                    {
                        warning(inst, 'Dispatching inst must not be null');
                    }
                    var listener = listenerAtPhase(inst, event, phase);
                    if (listener) {
                        event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
                        event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
                    }
                }
                function accumulateTwoPhaseDispatchesSingle(event) {
                    if (event && event.dispatchConfig.phasedRegistrationNames) {
                        traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
                    }
                }
                function accumulateTwoPhaseDispatchesSingleSkipTarget(event) {
                    if (event && event.dispatchConfig.phasedRegistrationNames) {
                        var targetInst = event._targetInst;
                        var parentInst = targetInst ? getParentInstance(targetInst) : null;
                        traverseTwoPhase(parentInst, accumulateDirectionalDispatches, event);
                    }
                }
                function accumulateDispatches(inst, ignoredDirection, event) {
                    if (inst && event && event.dispatchConfig.registrationName) {
                        var registrationName = event.dispatchConfig.registrationName;
                        var listener = getListener(inst, registrationName);
                        if (listener) {
                            event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
                            event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
                        }
                    }
                }
                function accumulateDirectDispatchesSingle(event) {
                    if (event && event.dispatchConfig.registrationName) {
                        accumulateDispatches(event._targetInst, null, event);
                    }
                }
                function accumulateTwoPhaseDispatches(events) {
                    forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
                }
                function accumulateTwoPhaseDispatchesSkipTarget(events) {
                    forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget);
                }
                function accumulateEnterLeaveDispatches(leave, enter, from, to) {
                    traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
                }
                function accumulateDirectDispatches(events) {
                    forEachAccumulated(events, accumulateDirectDispatchesSingle);
                }
                var EventPropagators = Object.freeze({
                    accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
                    accumulateTwoPhaseDispatchesSkipTarget: accumulateTwoPhaseDispatchesSkipTarget,
                    accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches,
                    accumulateDirectDispatches: accumulateDirectDispatches
                });
                var contentKey = null;
                function getTextContentAccessor() {
                    if (!contentKey && ExecutionEnvironment.canUseDOM) {
                        contentKey = 'textContent' in document.documentElement ? 'textContent' : 'innerText';
                    }
                    return contentKey;
                }
                var compositionState = {
                    _root: null,
                    _startText: null,
                    _fallbackText: null
                };
                function initialize(nativeEventTarget) {
                    compositionState._root = nativeEventTarget;
                    compositionState._startText = getText();
                    return true;
                }
                function reset() {
                    compositionState._root = null;
                    compositionState._startText = null;
                    compositionState._fallbackText = null;
                }
                function getData() {
                    if (compositionState._fallbackText) {
                        return compositionState._fallbackText;
                    }
                    var start;
                    var startValue = compositionState._startText;
                    var startLength = startValue.length;
                    var end;
                    var endValue = getText();
                    var endLength = endValue.length;
                    for (start = 0; start < startLength; start++) {
                        if (startValue[start] !== endValue[start]) {
                            break;
                        }
                    }
                    var minEnd = startLength - start;
                    for (end = 1; end <= minEnd; end++) {
                        if (startValue[startLength - end] !== endValue[endLength - end]) {
                            break;
                        }
                    }
                    var sliceTail = end > 1 ? 1 - end : undefined;
                    compositionState._fallbackText = endValue.slice(start, sliceTail);
                    return compositionState._fallbackText;
                }
                function getText() {
                    if ('value' in compositionState._root) {
                        return compositionState._root.value;
                    }
                    return compositionState._root[getTextContentAccessor()];
                }
                var didWarnForAddedNewProperty = false;
                var isProxySupported = typeof Proxy === 'function';
                var EVENT_POOL_SIZE = 10;
                var shouldBeReleasedProperties = [
                    'dispatchConfig',
                    '_targetInst',
                    'nativeEvent',
                    'isDefaultPrevented',
                    'isPropagationStopped',
                    '_dispatchListeners',
                    '_dispatchInstances'
                ];
                var EventInterface = {
                    type: null,
                    target: null,
                    currentTarget: emptyFunction.thatReturnsNull,
                    eventPhase: null,
                    bubbles: null,
                    cancelable: null,
                    timeStamp: function (event) {
                        return event.timeStamp || Date.now();
                    },
                    defaultPrevented: null,
                    isTrusted: null
                };
                function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
                    {
                        delete this.nativeEvent;
                        delete this.preventDefault;
                        delete this.stopPropagation;
                    }
                    this.dispatchConfig = dispatchConfig;
                    this._targetInst = targetInst;
                    this.nativeEvent = nativeEvent;
                    var Interface = this.constructor.Interface;
                    for (var propName in Interface) {
                        if (!Interface.hasOwnProperty(propName)) {
                            continue;
                        }
                        {
                            delete this[propName];
                        }
                        var normalize = Interface[propName];
                        if (normalize) {
                            this[propName] = normalize(nativeEvent);
                        } else {
                            if (propName === 'target') {
                                this.target = nativeEventTarget;
                            } else {
                                this[propName] = nativeEvent[propName];
                            }
                        }
                    }
                    var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
                    if (defaultPrevented) {
                        this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
                    } else {
                        this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
                    }
                    this.isPropagationStopped = emptyFunction.thatReturnsFalse;
                    return this;
                }
                _assign(SyntheticEvent.prototype, {
                    preventDefault: function () {
                        this.defaultPrevented = true;
                        var event = this.nativeEvent;
                        if (!event) {
                            return;
                        }
                        if (event.preventDefault) {
                            event.preventDefault();
                        } else if (typeof event.returnValue !== 'unknown') {
                            event.returnValue = false;
                        }
                        this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
                    },
                    stopPropagation: function () {
                        var event = this.nativeEvent;
                        if (!event) {
                            return;
                        }
                        if (event.stopPropagation) {
                            event.stopPropagation();
                        } else if (typeof event.cancelBubble !== 'unknown') {
                            event.cancelBubble = true;
                        }
                        this.isPropagationStopped = emptyFunction.thatReturnsTrue;
                    },
                    persist: function () {
                        this.isPersistent = emptyFunction.thatReturnsTrue;
                    },
                    isPersistent: emptyFunction.thatReturnsFalse,
                    destructor: function () {
                        var Interface = this.constructor.Interface;
                        for (var propName in Interface) {
                            {
                                Object.defineProperty(this, propName, getPooledWarningPropertyDefinition(propName, Interface[propName]));
                            }
                        }
                        for (var i = 0; i < shouldBeReleasedProperties.length; i++) {
                            this[shouldBeReleasedProperties[i]] = null;
                        }
                        {
                            Object.defineProperty(this, 'nativeEvent', getPooledWarningPropertyDefinition('nativeEvent', null));
                            Object.defineProperty(this, 'preventDefault', getPooledWarningPropertyDefinition('preventDefault', emptyFunction));
                            Object.defineProperty(this, 'stopPropagation', getPooledWarningPropertyDefinition('stopPropagation', emptyFunction));
                        }
                    }
                });
                SyntheticEvent.Interface = EventInterface;
                SyntheticEvent.augmentClass = function (Class, Interface) {
                    var Super = this;
                    var E = function () {
                    };
                    E.prototype = Super.prototype;
                    var prototype = new E();
                    _assign(prototype, Class.prototype);
                    Class.prototype = prototype;
                    Class.prototype.constructor = Class;
                    Class.Interface = _assign({}, Super.Interface, Interface);
                    Class.augmentClass = Super.augmentClass;
                    addEventPoolingTo(Class);
                };
                {
                    if (isProxySupported) {
                        SyntheticEvent = new Proxy(SyntheticEvent, {
                            construct: function (target, args) {
                                return this.apply(target, Object.create(target.prototype), args);
                            },
                            apply: function (constructor, that, args) {
                                return new Proxy(constructor.apply(that, args), {
                                    set: function (target, prop, value) {
                                        if (prop !== 'isPersistent' && !target.constructor.Interface.hasOwnProperty(prop) && shouldBeReleasedProperties.indexOf(prop) === -1) {
                                            warning(didWarnForAddedNewProperty || target.isPersistent(), 'This synthetic event is reused for performance reasons. If you\'re ' + 'seeing this, you\'re adding a new property in the synthetic event object. ' + 'The property is never released. See ' + 'https://fb.me/react-event-pooling for more information.');
                                            didWarnForAddedNewProperty = true;
                                        }
                                        target[prop] = value;
                                        return true;
                                    }
                                });
                            }
                        });
                    }
                }
                addEventPoolingTo(SyntheticEvent);
                function getPooledWarningPropertyDefinition(propName, getVal) {
                    var isFunction = typeof getVal === 'function';
                    return {
                        configurable: true,
                        set: set,
                        get: get
                    };
                    function set(val) {
                        var action = isFunction ? 'setting the method' : 'setting the property';
                        warn(action, 'This is effectively a no-op');
                        return val;
                    }
                    function get() {
                        var action = isFunction ? 'accessing the method' : 'accessing the property';
                        var result = isFunction ? 'This is a no-op function' : 'This is set to null';
                        warn(action, result);
                        return getVal;
                    }
                    function warn(action, result) {
                        var warningCondition = false;
                        warning(warningCondition, 'This synthetic event is reused for performance reasons. If you\'re seeing this, ' + 'you\'re %s `%s` on a released/nullified synthetic event. %s. ' + 'If you must keep the original synthetic event around, use event.persist(). ' + 'See https://fb.me/react-event-pooling for more information.', action, propName, result);
                    }
                }
                function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
                    var EventConstructor = this;
                    if (EventConstructor.eventPool.length) {
                        var instance = EventConstructor.eventPool.pop();
                        EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
                        return instance;
                    }
                    return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
                }
                function releasePooledEvent(event) {
                    var EventConstructor = this;
                    !(event instanceof EventConstructor) ? invariant(false, 'Trying to release an event instance  into a pool of a different type.') : void 0;
                    event.destructor();
                    if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
                        EventConstructor.eventPool.push(event);
                    }
                }
                function addEventPoolingTo(EventConstructor) {
                    EventConstructor.eventPool = [];
                    EventConstructor.getPooled = getPooledEvent;
                    EventConstructor.release = releasePooledEvent;
                }
                var SyntheticEvent$1 = SyntheticEvent;
                var CompositionEventInterface = { data: null };
                function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticEvent$1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticEvent$1.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);
                var InputEventInterface = { data: null };
                function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticEvent$1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticEvent$1.augmentClass(SyntheticInputEvent, InputEventInterface);
                var END_KEYCODES = [
                    9,
                    13,
                    27,
                    32
                ];
                var START_KEYCODE = 229;
                var canUseCompositionEvent = ExecutionEnvironment.canUseDOM && 'CompositionEvent' in window;
                var documentMode = null;
                if (ExecutionEnvironment.canUseDOM && 'documentMode' in document) {
                    documentMode = document.documentMode;
                }
                var canUseTextInputEvent = ExecutionEnvironment.canUseDOM && 'TextEvent' in window && !documentMode && !isPresto();
                var useFallbackCompositionData = ExecutionEnvironment.canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);
                function isPresto() {
                    var opera = window.opera;
                    return typeof opera === 'object' && typeof opera.version === 'function' && parseInt(opera.version(), 10) <= 12;
                }
                var SPACEBAR_CODE = 32;
                var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);
                var eventTypes = {
                    beforeInput: {
                        phasedRegistrationNames: {
                            bubbled: 'onBeforeInput',
                            captured: 'onBeforeInputCapture'
                        },
                        dependencies: [
                            'topCompositionEnd',
                            'topKeyPress',
                            'topTextInput',
                            'topPaste'
                        ]
                    },
                    compositionEnd: {
                        phasedRegistrationNames: {
                            bubbled: 'onCompositionEnd',
                            captured: 'onCompositionEndCapture'
                        },
                        dependencies: [
                            'topBlur',
                            'topCompositionEnd',
                            'topKeyDown',
                            'topKeyPress',
                            'topKeyUp',
                            'topMouseDown'
                        ]
                    },
                    compositionStart: {
                        phasedRegistrationNames: {
                            bubbled: 'onCompositionStart',
                            captured: 'onCompositionStartCapture'
                        },
                        dependencies: [
                            'topBlur',
                            'topCompositionStart',
                            'topKeyDown',
                            'topKeyPress',
                            'topKeyUp',
                            'topMouseDown'
                        ]
                    },
                    compositionUpdate: {
                        phasedRegistrationNames: {
                            bubbled: 'onCompositionUpdate',
                            captured: 'onCompositionUpdateCapture'
                        },
                        dependencies: [
                            'topBlur',
                            'topCompositionUpdate',
                            'topKeyDown',
                            'topKeyPress',
                            'topKeyUp',
                            'topMouseDown'
                        ]
                    }
                };
                var hasSpaceKeypress = false;
                function isKeypressCommand(nativeEvent) {
                    return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) && !(nativeEvent.ctrlKey && nativeEvent.altKey);
                }
                function getCompositionEventType(topLevelType) {
                    switch (topLevelType) {
                    case 'topCompositionStart':
                        return eventTypes.compositionStart;
                    case 'topCompositionEnd':
                        return eventTypes.compositionEnd;
                    case 'topCompositionUpdate':
                        return eventTypes.compositionUpdate;
                    }
                }
                function isFallbackCompositionStart(topLevelType, nativeEvent) {
                    return topLevelType === 'topKeyDown' && nativeEvent.keyCode === START_KEYCODE;
                }
                function isFallbackCompositionEnd(topLevelType, nativeEvent) {
                    switch (topLevelType) {
                    case 'topKeyUp':
                        return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
                    case 'topKeyDown':
                        return nativeEvent.keyCode !== START_KEYCODE;
                    case 'topKeyPress':
                    case 'topMouseDown':
                    case 'topBlur':
                        return true;
                    default:
                        return false;
                    }
                }
                function getDataFromCustomEvent(nativeEvent) {
                    var detail = nativeEvent.detail;
                    if (typeof detail === 'object' && 'data' in detail) {
                        return detail.data;
                    }
                    return null;
                }
                var isComposing = false;
                function extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                    var eventType;
                    var fallbackData;
                    if (canUseCompositionEvent) {
                        eventType = getCompositionEventType(topLevelType);
                    } else if (!isComposing) {
                        if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
                            eventType = eventTypes.compositionStart;
                        }
                    } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
                        eventType = eventTypes.compositionEnd;
                    }
                    if (!eventType) {
                        return null;
                    }
                    if (useFallbackCompositionData) {
                        if (!isComposing && eventType === eventTypes.compositionStart) {
                            isComposing = initialize(nativeEventTarget);
                        } else if (eventType === eventTypes.compositionEnd) {
                            if (isComposing) {
                                fallbackData = getData();
                            }
                        }
                    }
                    var event = SyntheticCompositionEvent.getPooled(eventType, targetInst, nativeEvent, nativeEventTarget);
                    if (fallbackData) {
                        event.data = fallbackData;
                    } else {
                        var customData = getDataFromCustomEvent(nativeEvent);
                        if (customData !== null) {
                            event.data = customData;
                        }
                    }
                    accumulateTwoPhaseDispatches(event);
                    return event;
                }
                function getNativeBeforeInputChars(topLevelType, nativeEvent) {
                    switch (topLevelType) {
                    case 'topCompositionEnd':
                        return getDataFromCustomEvent(nativeEvent);
                    case 'topKeyPress':
                        var which = nativeEvent.which;
                        if (which !== SPACEBAR_CODE) {
                            return null;
                        }
                        hasSpaceKeypress = true;
                        return SPACEBAR_CHAR;
                    case 'topTextInput':
                        var chars = nativeEvent.data;
                        if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
                            return null;
                        }
                        return chars;
                    default:
                        return null;
                    }
                }
                function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
                    if (isComposing) {
                        if (topLevelType === 'topCompositionEnd' || !canUseCompositionEvent && isFallbackCompositionEnd(topLevelType, nativeEvent)) {
                            var chars = getData();
                            reset();
                            isComposing = false;
                            return chars;
                        }
                        return null;
                    }
                    switch (topLevelType) {
                    case 'topPaste':
                        return null;
                    case 'topKeyPress':
                        if (!isKeypressCommand(nativeEvent)) {
                            if (nativeEvent.char && nativeEvent.char.length > 1) {
                                return nativeEvent.char;
                            } else if (nativeEvent.which) {
                                return String.fromCharCode(nativeEvent.which);
                            }
                        }
                        return null;
                    case 'topCompositionEnd':
                        return useFallbackCompositionData ? null : nativeEvent.data;
                    default:
                        return null;
                    }
                }
                function extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                    var chars;
                    if (canUseTextInputEvent) {
                        chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
                    } else {
                        chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
                    }
                    if (!chars) {
                        return null;
                    }
                    var event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, targetInst, nativeEvent, nativeEventTarget);
                    event.data = chars;
                    accumulateTwoPhaseDispatches(event);
                    return event;
                }
                var BeforeInputEventPlugin = {
                    eventTypes: eventTypes,
                    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                        return [
                            extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget),
                            extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget)
                        ];
                    }
                };
                var fiberHostComponent = null;
                var ReactControlledComponentInjection = {
                    injectFiberControlledHostComponent: function (hostComponentImpl) {
                        fiberHostComponent = hostComponentImpl;
                    }
                };
                var restoreTarget = null;
                var restoreQueue = null;
                function restoreStateOfTarget(target) {
                    var internalInstance = getInstanceFromNode(target);
                    if (!internalInstance) {
                        return;
                    }
                    !(fiberHostComponent && typeof fiberHostComponent.restoreControlledState === 'function') ? invariant(false, 'Fiber needs to be injected to handle a fiber target for controlled events. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                    var props = getFiberCurrentPropsFromNode(internalInstance.stateNode);
                    fiberHostComponent.restoreControlledState(internalInstance.stateNode, internalInstance.type, props);
                }
                var injection$3 = ReactControlledComponentInjection;
                function enqueueStateRestore(target) {
                    if (restoreTarget) {
                        if (restoreQueue) {
                            restoreQueue.push(target);
                        } else {
                            restoreQueue = [target];
                        }
                    } else {
                        restoreTarget = target;
                    }
                }
                function restoreStateIfNeeded() {
                    if (!restoreTarget) {
                        return;
                    }
                    var target = restoreTarget;
                    var queuedTargets = restoreQueue;
                    restoreTarget = null;
                    restoreQueue = null;
                    restoreStateOfTarget(target);
                    if (queuedTargets) {
                        for (var i = 0; i < queuedTargets.length; i++) {
                            restoreStateOfTarget(queuedTargets[i]);
                        }
                    }
                }
                var ReactControlledComponent = Object.freeze({
                    injection: injection$3,
                    enqueueStateRestore: enqueueStateRestore,
                    restoreStateIfNeeded: restoreStateIfNeeded
                });
                var fiberBatchedUpdates = function (fn, bookkeeping) {
                    return fn(bookkeeping);
                };
                var isNestingBatched = false;
                function batchedUpdates(fn, bookkeeping) {
                    if (isNestingBatched) {
                        return fiberBatchedUpdates(fn, bookkeeping);
                    }
                    isNestingBatched = true;
                    try {
                        return fiberBatchedUpdates(fn, bookkeeping);
                    } finally {
                        isNestingBatched = false;
                        restoreStateIfNeeded();
                    }
                }
                var ReactGenericBatchingInjection = {
                    injectFiberBatchedUpdates: function (_batchedUpdates) {
                        fiberBatchedUpdates = _batchedUpdates;
                    }
                };
                var injection$4 = ReactGenericBatchingInjection;
                var supportedInputTypes = {
                    color: true,
                    date: true,
                    datetime: true,
                    'datetime-local': true,
                    email: true,
                    month: true,
                    number: true,
                    password: true,
                    range: true,
                    search: true,
                    tel: true,
                    text: true,
                    time: true,
                    url: true,
                    week: true
                };
                function isTextInputElement(elem) {
                    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
                    if (nodeName === 'input') {
                        return !!supportedInputTypes[elem.type];
                    }
                    if (nodeName === 'textarea') {
                        return true;
                    }
                    return false;
                }
                var ELEMENT_NODE = 1;
                var TEXT_NODE = 3;
                var COMMENT_NODE = 8;
                var DOCUMENT_NODE = 9;
                var DOCUMENT_FRAGMENT_NODE = 11;
                function getEventTarget(nativeEvent) {
                    var target = nativeEvent.target || nativeEvent.srcElement || window;
                    if (target.correspondingUseElement) {
                        target = target.correspondingUseElement;
                    }
                    return target.nodeType === TEXT_NODE ? target.parentNode : target;
                }
                var useHasFeature;
                if (ExecutionEnvironment.canUseDOM) {
                    useHasFeature = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature('', '') !== true;
                }
                function isEventSupported(eventNameSuffix, capture) {
                    if (!ExecutionEnvironment.canUseDOM || capture && !('addEventListener' in document)) {
                        return false;
                    }
                    var eventName = 'on' + eventNameSuffix;
                    var isSupported = eventName in document;
                    if (!isSupported) {
                        var element = document.createElement('div');
                        element.setAttribute(eventName, 'return;');
                        isSupported = typeof element[eventName] === 'function';
                    }
                    if (!isSupported && useHasFeature && eventNameSuffix === 'wheel') {
                        isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
                    }
                    return isSupported;
                }
                function isCheckable(elem) {
                    var type = elem.type;
                    var nodeName = elem.nodeName;
                    return nodeName && nodeName.toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio');
                }
                function getTracker(node) {
                    return node._valueTracker;
                }
                function detachTracker(node) {
                    node._valueTracker = null;
                }
                function getValueFromNode(node) {
                    var value = '';
                    if (!node) {
                        return value;
                    }
                    if (isCheckable(node)) {
                        value = node.checked ? 'true' : 'false';
                    } else {
                        value = node.value;
                    }
                    return value;
                }
                function trackValueOnNode(node) {
                    var valueField = isCheckable(node) ? 'checked' : 'value';
                    var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
                    var currentValue = '' + node[valueField];
                    if (node.hasOwnProperty(valueField) || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') {
                        return;
                    }
                    Object.defineProperty(node, valueField, {
                        enumerable: descriptor.enumerable,
                        configurable: true,
                        get: function () {
                            return descriptor.get.call(this);
                        },
                        set: function (value) {
                            currentValue = '' + value;
                            descriptor.set.call(this, value);
                        }
                    });
                    var tracker = {
                        getValue: function () {
                            return currentValue;
                        },
                        setValue: function (value) {
                            currentValue = '' + value;
                        },
                        stopTracking: function () {
                            detachTracker(node);
                            delete node[valueField];
                        }
                    };
                    return tracker;
                }
                function track(node) {
                    if (getTracker(node)) {
                        return;
                    }
                    node._valueTracker = trackValueOnNode(node);
                }
                function updateValueIfChanged(node) {
                    if (!node) {
                        return false;
                    }
                    var tracker = getTracker(node);
                    if (!tracker) {
                        return true;
                    }
                    var lastValue = tracker.getValue();
                    var nextValue = getValueFromNode(node);
                    if (nextValue !== lastValue) {
                        tracker.setValue(nextValue);
                        return true;
                    }
                    return false;
                }
                var eventTypes$1 = {
                    change: {
                        phasedRegistrationNames: {
                            bubbled: 'onChange',
                            captured: 'onChangeCapture'
                        },
                        dependencies: [
                            'topBlur',
                            'topChange',
                            'topClick',
                            'topFocus',
                            'topInput',
                            'topKeyDown',
                            'topKeyUp',
                            'topSelectionChange'
                        ]
                    }
                };
                function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
                    var event = SyntheticEvent$1.getPooled(eventTypes$1.change, inst, nativeEvent, target);
                    event.type = 'change';
                    enqueueStateRestore(target);
                    accumulateTwoPhaseDispatches(event);
                    return event;
                }
                var activeElement = null;
                var activeElementInst = null;
                function shouldUseChangeEvent(elem) {
                    var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
                    return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
                }
                function manualDispatchChangeEvent(nativeEvent) {
                    var event = createAndAccumulateChangeEvent(activeElementInst, nativeEvent, getEventTarget(nativeEvent));
                    batchedUpdates(runEventInBatch, event);
                }
                function runEventInBatch(event) {
                    enqueueEvents(event);
                    processEventQueue(false);
                }
                function getInstIfValueChanged(targetInst) {
                    var targetNode = getNodeFromInstance$1(targetInst);
                    if (updateValueIfChanged(targetNode)) {
                        return targetInst;
                    }
                }
                function getTargetInstForChangeEvent(topLevelType, targetInst) {
                    if (topLevelType === 'topChange') {
                        return targetInst;
                    }
                }
                var isInputEventSupported = false;
                if (ExecutionEnvironment.canUseDOM) {
                    isInputEventSupported = isEventSupported('input') && (!document.documentMode || document.documentMode > 9);
                }
                function startWatchingForValueChange(target, targetInst) {
                    activeElement = target;
                    activeElementInst = targetInst;
                    activeElement.attachEvent('onpropertychange', handlePropertyChange);
                }
                function stopWatchingForValueChange() {
                    if (!activeElement) {
                        return;
                    }
                    activeElement.detachEvent('onpropertychange', handlePropertyChange);
                    activeElement = null;
                    activeElementInst = null;
                }
                function handlePropertyChange(nativeEvent) {
                    if (nativeEvent.propertyName !== 'value') {
                        return;
                    }
                    if (getInstIfValueChanged(activeElementInst)) {
                        manualDispatchChangeEvent(nativeEvent);
                    }
                }
                function handleEventsForInputEventPolyfill(topLevelType, target, targetInst) {
                    if (topLevelType === 'topFocus') {
                        stopWatchingForValueChange();
                        startWatchingForValueChange(target, targetInst);
                    } else if (topLevelType === 'topBlur') {
                        stopWatchingForValueChange();
                    }
                }
                function getTargetInstForInputEventPolyfill(topLevelType, targetInst) {
                    if (topLevelType === 'topSelectionChange' || topLevelType === 'topKeyUp' || topLevelType === 'topKeyDown') {
                        return getInstIfValueChanged(activeElementInst);
                    }
                }
                function shouldUseClickEvent(elem) {
                    var nodeName = elem.nodeName;
                    return nodeName && nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
                }
                function getTargetInstForClickEvent(topLevelType, targetInst) {
                    if (topLevelType === 'topClick') {
                        return getInstIfValueChanged(targetInst);
                    }
                }
                function getTargetInstForInputOrChangeEvent(topLevelType, targetInst) {
                    if (topLevelType === 'topInput' || topLevelType === 'topChange') {
                        return getInstIfValueChanged(targetInst);
                    }
                }
                function handleControlledInputBlur(inst, node) {
                    if (inst == null) {
                        return;
                    }
                    var state = inst._wrapperState || node._wrapperState;
                    if (!state || !state.controlled || node.type !== 'number') {
                        return;
                    }
                    var value = '' + node.value;
                    if (node.getAttribute('value') !== value) {
                        node.setAttribute('value', value);
                    }
                }
                var ChangeEventPlugin = {
                    eventTypes: eventTypes$1,
                    _isInputEventSupported: isInputEventSupported,
                    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                        var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;
                        var getTargetInstFunc, handleEventFunc;
                        if (shouldUseChangeEvent(targetNode)) {
                            getTargetInstFunc = getTargetInstForChangeEvent;
                        } else if (isTextInputElement(targetNode)) {
                            if (isInputEventSupported) {
                                getTargetInstFunc = getTargetInstForInputOrChangeEvent;
                            } else {
                                getTargetInstFunc = getTargetInstForInputEventPolyfill;
                                handleEventFunc = handleEventsForInputEventPolyfill;
                            }
                        } else if (shouldUseClickEvent(targetNode)) {
                            getTargetInstFunc = getTargetInstForClickEvent;
                        }
                        if (getTargetInstFunc) {
                            var inst = getTargetInstFunc(topLevelType, targetInst);
                            if (inst) {
                                var event = createAndAccumulateChangeEvent(inst, nativeEvent, nativeEventTarget);
                                return event;
                            }
                        }
                        if (handleEventFunc) {
                            handleEventFunc(topLevelType, targetNode, targetInst);
                        }
                        if (topLevelType === 'topBlur') {
                            handleControlledInputBlur(targetInst, targetNode);
                        }
                    }
                };
                var DOMEventPluginOrder = [
                    'ResponderEventPlugin',
                    'SimpleEventPlugin',
                    'TapEventPlugin',
                    'EnterLeaveEventPlugin',
                    'ChangeEventPlugin',
                    'SelectEventPlugin',
                    'BeforeInputEventPlugin'
                ];
                var UIEventInterface = {
                    view: null,
                    detail: null
                };
                function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticEvent$1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticEvent$1.augmentClass(SyntheticUIEvent, UIEventInterface);
                var modifierKeyToProp = {
                    Alt: 'altKey',
                    Control: 'ctrlKey',
                    Meta: 'metaKey',
                    Shift: 'shiftKey'
                };
                function modifierStateGetter(keyArg) {
                    var syntheticEvent = this;
                    var nativeEvent = syntheticEvent.nativeEvent;
                    if (nativeEvent.getModifierState) {
                        return nativeEvent.getModifierState(keyArg);
                    }
                    var keyProp = modifierKeyToProp[keyArg];
                    return keyProp ? !!nativeEvent[keyProp] : false;
                }
                function getEventModifierState(nativeEvent) {
                    return modifierStateGetter;
                }
                var MouseEventInterface = {
                    screenX: null,
                    screenY: null,
                    clientX: null,
                    clientY: null,
                    pageX: null,
                    pageY: null,
                    ctrlKey: null,
                    shiftKey: null,
                    altKey: null,
                    metaKey: null,
                    getModifierState: getEventModifierState,
                    button: null,
                    buttons: null,
                    relatedTarget: function (event) {
                        return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
                    }
                };
                function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);
                var eventTypes$2 = {
                    mouseEnter: {
                        registrationName: 'onMouseEnter',
                        dependencies: [
                            'topMouseOut',
                            'topMouseOver'
                        ]
                    },
                    mouseLeave: {
                        registrationName: 'onMouseLeave',
                        dependencies: [
                            'topMouseOut',
                            'topMouseOver'
                        ]
                    }
                };
                var EnterLeaveEventPlugin = {
                    eventTypes: eventTypes$2,
                    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                        if (topLevelType === 'topMouseOver' && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
                            return null;
                        }
                        if (topLevelType !== 'topMouseOut' && topLevelType !== 'topMouseOver') {
                            return null;
                        }
                        var win;
                        if (nativeEventTarget.window === nativeEventTarget) {
                            win = nativeEventTarget;
                        } else {
                            var doc = nativeEventTarget.ownerDocument;
                            if (doc) {
                                win = doc.defaultView || doc.parentWindow;
                            } else {
                                win = window;
                            }
                        }
                        var from;
                        var to;
                        if (topLevelType === 'topMouseOut') {
                            from = targetInst;
                            var related = nativeEvent.relatedTarget || nativeEvent.toElement;
                            to = related ? getClosestInstanceFromNode(related) : null;
                        } else {
                            from = null;
                            to = targetInst;
                        }
                        if (from === to) {
                            return null;
                        }
                        var fromNode = from == null ? win : getNodeFromInstance$1(from);
                        var toNode = to == null ? win : getNodeFromInstance$1(to);
                        var leave = SyntheticMouseEvent.getPooled(eventTypes$2.mouseLeave, from, nativeEvent, nativeEventTarget);
                        leave.type = 'mouseleave';
                        leave.target = fromNode;
                        leave.relatedTarget = toNode;
                        var enter = SyntheticMouseEvent.getPooled(eventTypes$2.mouseEnter, to, nativeEvent, nativeEventTarget);
                        enter.type = 'mouseenter';
                        enter.target = toNode;
                        enter.relatedTarget = fromNode;
                        accumulateEnterLeaveDispatches(leave, enter, from, to);
                        return [
                            leave,
                            enter
                        ];
                    }
                };
                function get(key) {
                    return key._reactInternalFiber;
                }
                function has(key) {
                    return key._reactInternalFiber !== undefined;
                }
                function set(key, value) {
                    key._reactInternalFiber = value;
                }
                var ReactInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
                var ReactCurrentOwner = ReactInternals.ReactCurrentOwner;
                var ReactDebugCurrentFrame = ReactInternals.ReactDebugCurrentFrame;
                function getComponentName(fiber) {
                    var type = fiber.type;
                    if (typeof type === 'string') {
                        return type;
                    }
                    if (typeof type === 'function') {
                        return type.displayName || type.name;
                    }
                    return null;
                }
                var NoEffect = 0;
                var PerformedWork = 1;
                var Placement = 2;
                var Update = 4;
                var PlacementAndUpdate = 6;
                var Deletion = 8;
                var ContentReset = 16;
                var Callback = 32;
                var Err = 64;
                var Ref = 128;
                var MOUNTING = 1;
                var MOUNTED = 2;
                var UNMOUNTED = 3;
                function isFiberMountedImpl(fiber) {
                    var node = fiber;
                    if (!fiber.alternate) {
                        if ((node.effectTag & Placement) !== NoEffect) {
                            return MOUNTING;
                        }
                        while (node['return']) {
                            node = node['return'];
                            if ((node.effectTag & Placement) !== NoEffect) {
                                return MOUNTING;
                            }
                        }
                    } else {
                        while (node['return']) {
                            node = node['return'];
                        }
                    }
                    if (node.tag === HostRoot) {
                        return MOUNTED;
                    }
                    return UNMOUNTED;
                }
                function isFiberMounted(fiber) {
                    return isFiberMountedImpl(fiber) === MOUNTED;
                }
                function isMounted(component) {
                    {
                        var owner = ReactCurrentOwner.current;
                        if (owner !== null && owner.tag === ClassComponent) {
                            var ownerFiber = owner;
                            var instance = ownerFiber.stateNode;
                            warning(instance._warnedAboutRefsInRender, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(ownerFiber) || 'A component');
                            instance._warnedAboutRefsInRender = true;
                        }
                    }
                    var fiber = get(component);
                    if (!fiber) {
                        return false;
                    }
                    return isFiberMountedImpl(fiber) === MOUNTED;
                }
                function assertIsMounted(fiber) {
                    !(isFiberMountedImpl(fiber) === MOUNTED) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
                }
                function findCurrentFiberUsingSlowPath(fiber) {
                    var alternate = fiber.alternate;
                    if (!alternate) {
                        var state = isFiberMountedImpl(fiber);
                        !(state !== UNMOUNTED) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
                        if (state === MOUNTING) {
                            return null;
                        }
                        return fiber;
                    }
                    var a = fiber;
                    var b = alternate;
                    while (true) {
                        var parentA = a['return'];
                        var parentB = parentA ? parentA.alternate : null;
                        if (!parentA || !parentB) {
                            break;
                        }
                        if (parentA.child === parentB.child) {
                            var child = parentA.child;
                            while (child) {
                                if (child === a) {
                                    assertIsMounted(parentA);
                                    return fiber;
                                }
                                if (child === b) {
                                    assertIsMounted(parentA);
                                    return alternate;
                                }
                                child = child.sibling;
                            }
                            invariant(false, 'Unable to find node on an unmounted component.');
                        }
                        if (a['return'] !== b['return']) {
                            a = parentA;
                            b = parentB;
                        } else {
                            var didFindChild = false;
                            var _child = parentA.child;
                            while (_child) {
                                if (_child === a) {
                                    didFindChild = true;
                                    a = parentA;
                                    b = parentB;
                                    break;
                                }
                                if (_child === b) {
                                    didFindChild = true;
                                    b = parentA;
                                    a = parentB;
                                    break;
                                }
                                _child = _child.sibling;
                            }
                            if (!didFindChild) {
                                _child = parentB.child;
                                while (_child) {
                                    if (_child === a) {
                                        didFindChild = true;
                                        a = parentB;
                                        b = parentA;
                                        break;
                                    }
                                    if (_child === b) {
                                        didFindChild = true;
                                        b = parentB;
                                        a = parentA;
                                        break;
                                    }
                                    _child = _child.sibling;
                                }
                                !didFindChild ? invariant(false, 'Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.') : void 0;
                            }
                        }
                        !(a.alternate === b) ? invariant(false, 'Return fibers should always be each others\' alternates. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                    }
                    !(a.tag === HostRoot) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
                    if (a.stateNode.current === a) {
                        return fiber;
                    }
                    return alternate;
                }
                function findCurrentHostFiber(parent) {
                    var currentParent = findCurrentFiberUsingSlowPath(parent);
                    if (!currentParent) {
                        return null;
                    }
                    var node = currentParent;
                    while (true) {
                        if (node.tag === HostComponent || node.tag === HostText) {
                            return node;
                        } else if (node.child) {
                            node.child['return'] = node;
                            node = node.child;
                            continue;
                        }
                        if (node === currentParent) {
                            return null;
                        }
                        while (!node.sibling) {
                            if (!node['return'] || node['return'] === currentParent) {
                                return null;
                            }
                            node = node['return'];
                        }
                        node.sibling['return'] = node['return'];
                        node = node.sibling;
                    }
                    return null;
                }
                function findCurrentHostFiberWithNoPortals(parent) {
                    var currentParent = findCurrentFiberUsingSlowPath(parent);
                    if (!currentParent) {
                        return null;
                    }
                    var node = currentParent;
                    while (true) {
                        if (node.tag === HostComponent || node.tag === HostText) {
                            return node;
                        } else if (node.child && node.tag !== HostPortal) {
                            node.child['return'] = node;
                            node = node.child;
                            continue;
                        }
                        if (node === currentParent) {
                            return null;
                        }
                        while (!node.sibling) {
                            if (!node['return'] || node['return'] === currentParent) {
                                return null;
                            }
                            node = node['return'];
                        }
                        node.sibling['return'] = node['return'];
                        node = node.sibling;
                    }
                    return null;
                }
                var CALLBACK_BOOKKEEPING_POOL_SIZE = 10;
                var callbackBookkeepingPool = [];
                function findRootContainerNode(inst) {
                    while (inst['return']) {
                        inst = inst['return'];
                    }
                    if (inst.tag !== HostRoot) {
                        return null;
                    }
                    return inst.stateNode.containerInfo;
                }
                function getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst) {
                    if (callbackBookkeepingPool.length) {
                        var instance = callbackBookkeepingPool.pop();
                        instance.topLevelType = topLevelType;
                        instance.nativeEvent = nativeEvent;
                        instance.targetInst = targetInst;
                        return instance;
                    }
                    return {
                        topLevelType: topLevelType,
                        nativeEvent: nativeEvent,
                        targetInst: targetInst,
                        ancestors: []
                    };
                }
                function releaseTopLevelCallbackBookKeeping(instance) {
                    instance.topLevelType = null;
                    instance.nativeEvent = null;
                    instance.targetInst = null;
                    instance.ancestors.length = 0;
                    if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
                        callbackBookkeepingPool.push(instance);
                    }
                }
                function handleTopLevelImpl(bookKeeping) {
                    var targetInst = bookKeeping.targetInst;
                    var ancestor = targetInst;
                    do {
                        if (!ancestor) {
                            bookKeeping.ancestors.push(ancestor);
                            break;
                        }
                        var root = findRootContainerNode(ancestor);
                        if (!root) {
                            break;
                        }
                        bookKeeping.ancestors.push(ancestor);
                        ancestor = getClosestInstanceFromNode(root);
                    } while (ancestor);
                    for (var i = 0; i < bookKeeping.ancestors.length; i++) {
                        targetInst = bookKeeping.ancestors[i];
                        _handleTopLevel(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
                    }
                }
                var _enabled = true;
                var _handleTopLevel = void 0;
                function setHandleTopLevel(handleTopLevel) {
                    _handleTopLevel = handleTopLevel;
                }
                function setEnabled(enabled) {
                    _enabled = !!enabled;
                }
                function isEnabled() {
                    return _enabled;
                }
                function trapBubbledEvent(topLevelType, handlerBaseName, element) {
                    if (!element) {
                        return null;
                    }
                    return EventListener.listen(element, handlerBaseName, dispatchEvent.bind(null, topLevelType));
                }
                function trapCapturedEvent(topLevelType, handlerBaseName, element) {
                    if (!element) {
                        return null;
                    }
                    return EventListener.capture(element, handlerBaseName, dispatchEvent.bind(null, topLevelType));
                }
                function dispatchEvent(topLevelType, nativeEvent) {
                    if (!_enabled) {
                        return;
                    }
                    var nativeEventTarget = getEventTarget(nativeEvent);
                    var targetInst = getClosestInstanceFromNode(nativeEventTarget);
                    if (targetInst !== null && typeof targetInst.tag === 'number' && !isFiberMounted(targetInst)) {
                        targetInst = null;
                    }
                    var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst);
                    try {
                        batchedUpdates(handleTopLevelImpl, bookKeeping);
                    } finally {
                        releaseTopLevelCallbackBookKeeping(bookKeeping);
                    }
                }
                var ReactDOMEventListener = Object.freeze({
                    get _enabled() {
                        return _enabled;
                    },
                    get _handleTopLevel() {
                        return _handleTopLevel;
                    },
                    setHandleTopLevel: setHandleTopLevel,
                    setEnabled: setEnabled,
                    isEnabled: isEnabled,
                    trapBubbledEvent: trapBubbledEvent,
                    trapCapturedEvent: trapCapturedEvent,
                    dispatchEvent: dispatchEvent
                });
                function makePrefixMap(styleProp, eventName) {
                    var prefixes = {};
                    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
                    prefixes['Webkit' + styleProp] = 'webkit' + eventName;
                    prefixes['Moz' + styleProp] = 'moz' + eventName;
                    prefixes['ms' + styleProp] = 'MS' + eventName;
                    prefixes['O' + styleProp] = 'o' + eventName.toLowerCase();
                    return prefixes;
                }
                var vendorPrefixes = {
                    animationend: makePrefixMap('Animation', 'AnimationEnd'),
                    animationiteration: makePrefixMap('Animation', 'AnimationIteration'),
                    animationstart: makePrefixMap('Animation', 'AnimationStart'),
                    transitionend: makePrefixMap('Transition', 'TransitionEnd')
                };
                var prefixedEventNames = {};
                var style = {};
                if (ExecutionEnvironment.canUseDOM) {
                    style = document.createElement('div').style;
                    if (!('AnimationEvent' in window)) {
                        delete vendorPrefixes.animationend.animation;
                        delete vendorPrefixes.animationiteration.animation;
                        delete vendorPrefixes.animationstart.animation;
                    }
                    if (!('TransitionEvent' in window)) {
                        delete vendorPrefixes.transitionend.transition;
                    }
                }
                function getVendorPrefixedEventName(eventName) {
                    if (prefixedEventNames[eventName]) {
                        return prefixedEventNames[eventName];
                    } else if (!vendorPrefixes[eventName]) {
                        return eventName;
                    }
                    var prefixMap = vendorPrefixes[eventName];
                    for (var styleProp in prefixMap) {
                        if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
                            return prefixedEventNames[eventName] = prefixMap[styleProp];
                        }
                    }
                    return '';
                }
                var topLevelTypes$1 = {
                    topAbort: 'abort',
                    topAnimationEnd: getVendorPrefixedEventName('animationend') || 'animationend',
                    topAnimationIteration: getVendorPrefixedEventName('animationiteration') || 'animationiteration',
                    topAnimationStart: getVendorPrefixedEventName('animationstart') || 'animationstart',
                    topBlur: 'blur',
                    topCancel: 'cancel',
                    topCanPlay: 'canplay',
                    topCanPlayThrough: 'canplaythrough',
                    topChange: 'change',
                    topClick: 'click',
                    topClose: 'close',
                    topCompositionEnd: 'compositionend',
                    topCompositionStart: 'compositionstart',
                    topCompositionUpdate: 'compositionupdate',
                    topContextMenu: 'contextmenu',
                    topCopy: 'copy',
                    topCut: 'cut',
                    topDoubleClick: 'dblclick',
                    topDrag: 'drag',
                    topDragEnd: 'dragend',
                    topDragEnter: 'dragenter',
                    topDragExit: 'dragexit',
                    topDragLeave: 'dragleave',
                    topDragOver: 'dragover',
                    topDragStart: 'dragstart',
                    topDrop: 'drop',
                    topDurationChange: 'durationchange',
                    topEmptied: 'emptied',
                    topEncrypted: 'encrypted',
                    topEnded: 'ended',
                    topError: 'error',
                    topFocus: 'focus',
                    topInput: 'input',
                    topKeyDown: 'keydown',
                    topKeyPress: 'keypress',
                    topKeyUp: 'keyup',
                    topLoadedData: 'loadeddata',
                    topLoad: 'load',
                    topLoadedMetadata: 'loadedmetadata',
                    topLoadStart: 'loadstart',
                    topMouseDown: 'mousedown',
                    topMouseMove: 'mousemove',
                    topMouseOut: 'mouseout',
                    topMouseOver: 'mouseover',
                    topMouseUp: 'mouseup',
                    topPaste: 'paste',
                    topPause: 'pause',
                    topPlay: 'play',
                    topPlaying: 'playing',
                    topProgress: 'progress',
                    topRateChange: 'ratechange',
                    topScroll: 'scroll',
                    topSeeked: 'seeked',
                    topSeeking: 'seeking',
                    topSelectionChange: 'selectionchange',
                    topStalled: 'stalled',
                    topSuspend: 'suspend',
                    topTextInput: 'textInput',
                    topTimeUpdate: 'timeupdate',
                    topToggle: 'toggle',
                    topTouchCancel: 'touchcancel',
                    topTouchEnd: 'touchend',
                    topTouchMove: 'touchmove',
                    topTouchStart: 'touchstart',
                    topTransitionEnd: getVendorPrefixedEventName('transitionend') || 'transitionend',
                    topVolumeChange: 'volumechange',
                    topWaiting: 'waiting',
                    topWheel: 'wheel'
                };
                var BrowserEventConstants = { topLevelTypes: topLevelTypes$1 };
                function runEventQueueInBatch(events) {
                    enqueueEvents(events);
                    processEventQueue(false);
                }
                function handleTopLevel(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                    var events = extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
                    runEventQueueInBatch(events);
                }
                var topLevelTypes = BrowserEventConstants.topLevelTypes;
                var alreadyListeningTo = {};
                var reactTopListenersCounter = 0;
                var topListenersIDKey = '_reactListenersID' + ('' + Math.random()).slice(2);
                function getListeningForDocument(mountAt) {
                    if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
                        mountAt[topListenersIDKey] = reactTopListenersCounter++;
                        alreadyListeningTo[mountAt[topListenersIDKey]] = {};
                    }
                    return alreadyListeningTo[mountAt[topListenersIDKey]];
                }
                function listenTo(registrationName, contentDocumentHandle) {
                    var mountAt = contentDocumentHandle;
                    var isListening = getListeningForDocument(mountAt);
                    var dependencies = registrationNameDependencies[registrationName];
                    for (var i = 0; i < dependencies.length; i++) {
                        var dependency = dependencies[i];
                        if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
                            if (dependency === 'topScroll') {
                                trapCapturedEvent('topScroll', 'scroll', mountAt);
                            } else if (dependency === 'topFocus' || dependency === 'topBlur') {
                                trapCapturedEvent('topFocus', 'focus', mountAt);
                                trapCapturedEvent('topBlur', 'blur', mountAt);
                                isListening.topBlur = true;
                                isListening.topFocus = true;
                            } else if (dependency === 'topCancel') {
                                if (isEventSupported('cancel', true)) {
                                    trapCapturedEvent('topCancel', 'cancel', mountAt);
                                }
                                isListening.topCancel = true;
                            } else if (dependency === 'topClose') {
                                if (isEventSupported('close', true)) {
                                    trapCapturedEvent('topClose', 'close', mountAt);
                                }
                                isListening.topClose = true;
                            } else if (topLevelTypes.hasOwnProperty(dependency)) {
                                trapBubbledEvent(dependency, topLevelTypes[dependency], mountAt);
                            }
                            isListening[dependency] = true;
                        }
                    }
                }
                function isListeningToAllDependencies(registrationName, mountAt) {
                    var isListening = getListeningForDocument(mountAt);
                    var dependencies = registrationNameDependencies[registrationName];
                    for (var i = 0; i < dependencies.length; i++) {
                        var dependency = dependencies[i];
                        if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
                            return false;
                        }
                    }
                    return true;
                }
                function getLeafNode(node) {
                    while (node && node.firstChild) {
                        node = node.firstChild;
                    }
                    return node;
                }
                function getSiblingNode(node) {
                    while (node) {
                        if (node.nextSibling) {
                            return node.nextSibling;
                        }
                        node = node.parentNode;
                    }
                }
                function getNodeForCharacterOffset(root, offset) {
                    var node = getLeafNode(root);
                    var nodeStart = 0;
                    var nodeEnd = 0;
                    while (node) {
                        if (node.nodeType === TEXT_NODE) {
                            nodeEnd = nodeStart + node.textContent.length;
                            if (nodeStart <= offset && nodeEnd >= offset) {
                                return {
                                    node: node,
                                    offset: offset - nodeStart
                                };
                            }
                            nodeStart = nodeEnd;
                        }
                        node = getLeafNode(getSiblingNode(node));
                    }
                }
                function getOffsets(outerNode) {
                    var selection = window.getSelection && window.getSelection();
                    if (!selection || selection.rangeCount === 0) {
                        return null;
                    }
                    var anchorNode = selection.anchorNode, anchorOffset = selection.anchorOffset, focusNode$$1 = selection.focusNode, focusOffset = selection.focusOffset;
                    try {
                        anchorNode.nodeType;
                        focusNode$$1.nodeType;
                    } catch (e) {
                        return null;
                    }
                    return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode$$1, focusOffset);
                }
                function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode$$1, focusOffset) {
                    var length = 0;
                    var start = -1;
                    var end = -1;
                    var indexWithinAnchor = 0;
                    var indexWithinFocus = 0;
                    var node = outerNode;
                    var parentNode = null;
                    outer:
                        while (true) {
                            var next = null;
                            while (true) {
                                if (node === anchorNode && (anchorOffset === 0 || node.nodeType === TEXT_NODE)) {
                                    start = length + anchorOffset;
                                }
                                if (node === focusNode$$1 && (focusOffset === 0 || node.nodeType === TEXT_NODE)) {
                                    end = length + focusOffset;
                                }
                                if (node.nodeType === TEXT_NODE) {
                                    length += node.nodeValue.length;
                                }
                                if ((next = node.firstChild) === null) {
                                    break;
                                }
                                parentNode = node;
                                node = next;
                            }
                            while (true) {
                                if (node === outerNode) {
                                    break outer;
                                }
                                if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
                                    start = length;
                                }
                                if (parentNode === focusNode$$1 && ++indexWithinFocus === focusOffset) {
                                    end = length;
                                }
                                if ((next = node.nextSibling) !== null) {
                                    break;
                                }
                                node = parentNode;
                                parentNode = node.parentNode;
                            }
                            node = next;
                        }
                    if (start === -1 || end === -1) {
                        return null;
                    }
                    return {
                        start: start,
                        end: end
                    };
                }
                function setOffsets(node, offsets) {
                    if (!window.getSelection) {
                        return;
                    }
                    var selection = window.getSelection();
                    var length = node[getTextContentAccessor()].length;
                    var start = Math.min(offsets.start, length);
                    var end = offsets.end === undefined ? start : Math.min(offsets.end, length);
                    if (!selection.extend && start > end) {
                        var temp = end;
                        end = start;
                        start = temp;
                    }
                    var startMarker = getNodeForCharacterOffset(node, start);
                    var endMarker = getNodeForCharacterOffset(node, end);
                    if (startMarker && endMarker) {
                        if (selection.rangeCount === 1 && selection.anchorNode === startMarker.node && selection.anchorOffset === startMarker.offset && selection.focusNode === endMarker.node && selection.focusOffset === endMarker.offset) {
                            return;
                        }
                        var range = document.createRange();
                        range.setStart(startMarker.node, startMarker.offset);
                        selection.removeAllRanges();
                        if (start > end) {
                            selection.addRange(range);
                            selection.extend(endMarker.node, endMarker.offset);
                        } else {
                            range.setEnd(endMarker.node, endMarker.offset);
                            selection.addRange(range);
                        }
                    }
                }
                function isInDocument(node) {
                    return containsNode(document.documentElement, node);
                }
                function hasSelectionCapabilities(elem) {
                    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
                    return nodeName && (nodeName === 'input' && elem.type === 'text' || nodeName === 'textarea' || elem.contentEditable === 'true');
                }
                function getSelectionInformation() {
                    var focusedElem = getActiveElement();
                    return {
                        focusedElem: focusedElem,
                        selectionRange: hasSelectionCapabilities(focusedElem) ? getSelection$1(focusedElem) : null
                    };
                }
                function restoreSelection(priorSelectionInformation) {
                    var curFocusedElem = getActiveElement();
                    var priorFocusedElem = priorSelectionInformation.focusedElem;
                    var priorSelectionRange = priorSelectionInformation.selectionRange;
                    if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
                        if (hasSelectionCapabilities(priorFocusedElem)) {
                            setSelection(priorFocusedElem, priorSelectionRange);
                        }
                        var ancestors = [];
                        var ancestor = priorFocusedElem;
                        while (ancestor = ancestor.parentNode) {
                            if (ancestor.nodeType === ELEMENT_NODE) {
                                ancestors.push({
                                    element: ancestor,
                                    left: ancestor.scrollLeft,
                                    top: ancestor.scrollTop
                                });
                            }
                        }
                        focusNode(priorFocusedElem);
                        for (var i = 0; i < ancestors.length; i++) {
                            var info = ancestors[i];
                            info.element.scrollLeft = info.left;
                            info.element.scrollTop = info.top;
                        }
                    }
                }
                function getSelection$1(input) {
                    var selection = void 0;
                    if ('selectionStart' in input) {
                        selection = {
                            start: input.selectionStart,
                            end: input.selectionEnd
                        };
                    } else {
                        selection = getOffsets(input);
                    }
                    return selection || {
                        start: 0,
                        end: 0
                    };
                }
                function setSelection(input, offsets) {
                    var start = offsets.start, end = offsets.end;
                    if (end === undefined) {
                        end = start;
                    }
                    if ('selectionStart' in input) {
                        input.selectionStart = start;
                        input.selectionEnd = Math.min(end, input.value.length);
                    } else {
                        setOffsets(input, offsets);
                    }
                }
                var skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && 'documentMode' in document && document.documentMode <= 11;
                var eventTypes$3 = {
                    select: {
                        phasedRegistrationNames: {
                            bubbled: 'onSelect',
                            captured: 'onSelectCapture'
                        },
                        dependencies: [
                            'topBlur',
                            'topContextMenu',
                            'topFocus',
                            'topKeyDown',
                            'topKeyUp',
                            'topMouseDown',
                            'topMouseUp',
                            'topSelectionChange'
                        ]
                    }
                };
                var activeElement$1 = null;
                var activeElementInst$1 = null;
                var lastSelection = null;
                var mouseDown = false;
                function getSelection(node) {
                    if ('selectionStart' in node && hasSelectionCapabilities(node)) {
                        return {
                            start: node.selectionStart,
                            end: node.selectionEnd
                        };
                    } else if (window.getSelection) {
                        var selection = window.getSelection();
                        return {
                            anchorNode: selection.anchorNode,
                            anchorOffset: selection.anchorOffset,
                            focusNode: selection.focusNode,
                            focusOffset: selection.focusOffset
                        };
                    }
                }
                function constructSelectEvent(nativeEvent, nativeEventTarget) {
                    if (mouseDown || activeElement$1 == null || activeElement$1 !== getActiveElement()) {
                        return null;
                    }
                    var currentSelection = getSelection(activeElement$1);
                    if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
                        lastSelection = currentSelection;
                        var syntheticEvent = SyntheticEvent$1.getPooled(eventTypes$3.select, activeElementInst$1, nativeEvent, nativeEventTarget);
                        syntheticEvent.type = 'select';
                        syntheticEvent.target = activeElement$1;
                        accumulateTwoPhaseDispatches(syntheticEvent);
                        return syntheticEvent;
                    }
                    return null;
                }
                var SelectEventPlugin = {
                    eventTypes: eventTypes$3,
                    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                        var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : nativeEventTarget.nodeType === DOCUMENT_NODE ? nativeEventTarget : nativeEventTarget.ownerDocument;
                        if (!doc || !isListeningToAllDependencies('onSelect', doc)) {
                            return null;
                        }
                        var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;
                        switch (topLevelType) {
                        case 'topFocus':
                            if (isTextInputElement(targetNode) || targetNode.contentEditable === 'true') {
                                activeElement$1 = targetNode;
                                activeElementInst$1 = targetInst;
                                lastSelection = null;
                            }
                            break;
                        case 'topBlur':
                            activeElement$1 = null;
                            activeElementInst$1 = null;
                            lastSelection = null;
                            break;
                        case 'topMouseDown':
                            mouseDown = true;
                            break;
                        case 'topContextMenu':
                        case 'topMouseUp':
                            mouseDown = false;
                            return constructSelectEvent(nativeEvent, nativeEventTarget);
                        case 'topSelectionChange':
                            if (skipSelectionChangeEvent) {
                                break;
                            }
                        case 'topKeyDown':
                        case 'topKeyUp':
                            return constructSelectEvent(nativeEvent, nativeEventTarget);
                        }
                        return null;
                    }
                };
                var AnimationEventInterface = {
                    animationName: null,
                    elapsedTime: null,
                    pseudoElement: null
                };
                function SyntheticAnimationEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticEvent$1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticEvent$1.augmentClass(SyntheticAnimationEvent, AnimationEventInterface);
                var ClipboardEventInterface = {
                    clipboardData: function (event) {
                        return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
                    }
                };
                function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticEvent$1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticEvent$1.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);
                var FocusEventInterface = { relatedTarget: null };
                function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);
                function getEventCharCode(nativeEvent) {
                    var charCode;
                    var keyCode = nativeEvent.keyCode;
                    if ('charCode' in nativeEvent) {
                        charCode = nativeEvent.charCode;
                        if (charCode === 0 && keyCode === 13) {
                            charCode = 13;
                        }
                    } else {
                        charCode = keyCode;
                    }
                    if (charCode >= 32 || charCode === 13) {
                        return charCode;
                    }
                    return 0;
                }
                var normalizeKey = {
                    Esc: 'Escape',
                    Spacebar: ' ',
                    Left: 'ArrowLeft',
                    Up: 'ArrowUp',
                    Right: 'ArrowRight',
                    Down: 'ArrowDown',
                    Del: 'Delete',
                    Win: 'OS',
                    Menu: 'ContextMenu',
                    Apps: 'ContextMenu',
                    Scroll: 'ScrollLock',
                    MozPrintableKey: 'Unidentified'
                };
                var translateToKey = {
                    '8': 'Backspace',
                    '9': 'Tab',
                    '12': 'Clear',
                    '13': 'Enter',
                    '16': 'Shift',
                    '17': 'Control',
                    '18': 'Alt',
                    '19': 'Pause',
                    '20': 'CapsLock',
                    '27': 'Escape',
                    '32': ' ',
                    '33': 'PageUp',
                    '34': 'PageDown',
                    '35': 'End',
                    '36': 'Home',
                    '37': 'ArrowLeft',
                    '38': 'ArrowUp',
                    '39': 'ArrowRight',
                    '40': 'ArrowDown',
                    '45': 'Insert',
                    '46': 'Delete',
                    '112': 'F1',
                    '113': 'F2',
                    '114': 'F3',
                    '115': 'F4',
                    '116': 'F5',
                    '117': 'F6',
                    '118': 'F7',
                    '119': 'F8',
                    '120': 'F9',
                    '121': 'F10',
                    '122': 'F11',
                    '123': 'F12',
                    '144': 'NumLock',
                    '145': 'ScrollLock',
                    '224': 'Meta'
                };
                function getEventKey(nativeEvent) {
                    if (nativeEvent.key) {
                        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
                        if (key !== 'Unidentified') {
                            return key;
                        }
                    }
                    if (nativeEvent.type === 'keypress') {
                        var charCode = getEventCharCode(nativeEvent);
                        return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
                    }
                    if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
                        return translateToKey[nativeEvent.keyCode] || 'Unidentified';
                    }
                    return '';
                }
                var KeyboardEventInterface = {
                    key: getEventKey,
                    location: null,
                    ctrlKey: null,
                    shiftKey: null,
                    altKey: null,
                    metaKey: null,
                    repeat: null,
                    locale: null,
                    getModifierState: getEventModifierState,
                    charCode: function (event) {
                        if (event.type === 'keypress') {
                            return getEventCharCode(event);
                        }
                        return 0;
                    },
                    keyCode: function (event) {
                        if (event.type === 'keydown' || event.type === 'keyup') {
                            return event.keyCode;
                        }
                        return 0;
                    },
                    which: function (event) {
                        if (event.type === 'keypress') {
                            return getEventCharCode(event);
                        }
                        if (event.type === 'keydown' || event.type === 'keyup') {
                            return event.keyCode;
                        }
                        return 0;
                    }
                };
                function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);
                var DragEventInterface = { dataTransfer: null };
                function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);
                var TouchEventInterface = {
                    touches: null,
                    targetTouches: null,
                    changedTouches: null,
                    altKey: null,
                    metaKey: null,
                    ctrlKey: null,
                    shiftKey: null,
                    getModifierState: getEventModifierState
                };
                function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);
                var TransitionEventInterface = {
                    propertyName: null,
                    elapsedTime: null,
                    pseudoElement: null
                };
                function SyntheticTransitionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticEvent$1.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticEvent$1.augmentClass(SyntheticTransitionEvent, TransitionEventInterface);
                var WheelEventInterface = {
                    deltaX: function (event) {
                        return 'deltaX' in event ? event.deltaX : 'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
                    },
                    deltaY: function (event) {
                        return 'deltaY' in event ? event.deltaY : 'wheelDeltaY' in event ? -event.wheelDeltaY : 'wheelDelta' in event ? -event.wheelDelta : 0;
                    },
                    deltaZ: null,
                    deltaMode: null
                };
                function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
                    return SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
                }
                SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);
                var eventTypes$4 = {};
                var topLevelEventsToDispatchConfig = {};
                [
                    'abort',
                    'animationEnd',
                    'animationIteration',
                    'animationStart',
                    'blur',
                    'cancel',
                    'canPlay',
                    'canPlayThrough',
                    'click',
                    'close',
                    'contextMenu',
                    'copy',
                    'cut',
                    'doubleClick',
                    'drag',
                    'dragEnd',
                    'dragEnter',
                    'dragExit',
                    'dragLeave',
                    'dragOver',
                    'dragStart',
                    'drop',
                    'durationChange',
                    'emptied',
                    'encrypted',
                    'ended',
                    'error',
                    'focus',
                    'input',
                    'invalid',
                    'keyDown',
                    'keyPress',
                    'keyUp',
                    'load',
                    'loadedData',
                    'loadedMetadata',
                    'loadStart',
                    'mouseDown',
                    'mouseMove',
                    'mouseOut',
                    'mouseOver',
                    'mouseUp',
                    'paste',
                    'pause',
                    'play',
                    'playing',
                    'progress',
                    'rateChange',
                    'reset',
                    'scroll',
                    'seeked',
                    'seeking',
                    'stalled',
                    'submit',
                    'suspend',
                    'timeUpdate',
                    'toggle',
                    'touchCancel',
                    'touchEnd',
                    'touchMove',
                    'touchStart',
                    'transitionEnd',
                    'volumeChange',
                    'waiting',
                    'wheel'
                ].forEach(function (event) {
                    var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
                    var onEvent = 'on' + capitalizedEvent;
                    var topEvent = 'top' + capitalizedEvent;
                    var type = {
                        phasedRegistrationNames: {
                            bubbled: onEvent,
                            captured: onEvent + 'Capture'
                        },
                        dependencies: [topEvent]
                    };
                    eventTypes$4[event] = type;
                    topLevelEventsToDispatchConfig[topEvent] = type;
                });
                var knownHTMLTopLevelTypes = [
                    'topAbort',
                    'topCancel',
                    'topCanPlay',
                    'topCanPlayThrough',
                    'topClose',
                    'topDurationChange',
                    'topEmptied',
                    'topEncrypted',
                    'topEnded',
                    'topError',
                    'topInput',
                    'topInvalid',
                    'topLoad',
                    'topLoadedData',
                    'topLoadedMetadata',
                    'topLoadStart',
                    'topPause',
                    'topPlay',
                    'topPlaying',
                    'topProgress',
                    'topRateChange',
                    'topReset',
                    'topSeeked',
                    'topSeeking',
                    'topStalled',
                    'topSubmit',
                    'topSuspend',
                    'topTimeUpdate',
                    'topToggle',
                    'topVolumeChange',
                    'topWaiting'
                ];
                var SimpleEventPlugin = {
                    eventTypes: eventTypes$4,
                    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
                        var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
                        if (!dispatchConfig) {
                            return null;
                        }
                        var EventConstructor;
                        switch (topLevelType) {
                        case 'topKeyPress':
                            if (getEventCharCode(nativeEvent) === 0) {
                                return null;
                            }
                        case 'topKeyDown':
                        case 'topKeyUp':
                            EventConstructor = SyntheticKeyboardEvent;
                            break;
                        case 'topBlur':
                        case 'topFocus':
                            EventConstructor = SyntheticFocusEvent;
                            break;
                        case 'topClick':
                            if (nativeEvent.button === 2) {
                                return null;
                            }
                        case 'topDoubleClick':
                        case 'topMouseDown':
                        case 'topMouseMove':
                        case 'topMouseUp':
                        case 'topMouseOut':
                        case 'topMouseOver':
                        case 'topContextMenu':
                            EventConstructor = SyntheticMouseEvent;
                            break;
                        case 'topDrag':
                        case 'topDragEnd':
                        case 'topDragEnter':
                        case 'topDragExit':
                        case 'topDragLeave':
                        case 'topDragOver':
                        case 'topDragStart':
                        case 'topDrop':
                            EventConstructor = SyntheticDragEvent;
                            break;
                        case 'topTouchCancel':
                        case 'topTouchEnd':
                        case 'topTouchMove':
                        case 'topTouchStart':
                            EventConstructor = SyntheticTouchEvent;
                            break;
                        case 'topAnimationEnd':
                        case 'topAnimationIteration':
                        case 'topAnimationStart':
                            EventConstructor = SyntheticAnimationEvent;
                            break;
                        case 'topTransitionEnd':
                            EventConstructor = SyntheticTransitionEvent;
                            break;
                        case 'topScroll':
                            EventConstructor = SyntheticUIEvent;
                            break;
                        case 'topWheel':
                            EventConstructor = SyntheticWheelEvent;
                            break;
                        case 'topCopy':
                        case 'topCut':
                        case 'topPaste':
                            EventConstructor = SyntheticClipboardEvent;
                            break;
                        default: {
                                if (knownHTMLTopLevelTypes.indexOf(topLevelType) === -1) {
                                    warning(false, 'SimpleEventPlugin: Unhandled event type, `%s`. This warning ' + 'is likely caused by a bug in React. Please file an issue.', topLevelType);
                                }
                            }
                            EventConstructor = SyntheticEvent$1;
                            break;
                        }
                        var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
                        accumulateTwoPhaseDispatches(event);
                        return event;
                    }
                };
                setHandleTopLevel(handleTopLevel);
                injection$1.injectEventPluginOrder(DOMEventPluginOrder);
                injection$2.injectComponentTree(ReactDOMComponentTree);
                injection$1.injectEventPluginsByName({
                    SimpleEventPlugin: SimpleEventPlugin,
                    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
                    ChangeEventPlugin: ChangeEventPlugin,
                    SelectEventPlugin: SelectEventPlugin,
                    BeforeInputEventPlugin: BeforeInputEventPlugin
                });
                var enableAsyncSubtreeAPI = true;
                var enableAsyncSchedulingByDefaultInReactDOM = false;
                var enableCreateRoot = false;
                var enableUserTimingAPI = true;
                var enableMutatingReconciler = true;
                var enableNoopReconciler = false;
                var enablePersistentReconciler = false;
                var debugRenderPhaseSideEffects = false;
                var valueStack = [];
                {
                    var fiberStack = [];
                }
                var index = -1;
                function createCursor(defaultValue) {
                    return { current: defaultValue };
                }
                function pop(cursor, fiber) {
                    if (index < 0) {
                        {
                            warning(false, 'Unexpected pop.');
                        }
                        return;
                    }
                    {
                        if (fiber !== fiberStack[index]) {
                            warning(false, 'Unexpected Fiber popped.');
                        }
                    }
                    cursor.current = valueStack[index];
                    valueStack[index] = null;
                    {
                        fiberStack[index] = null;
                    }
                    index--;
                }
                function push(cursor, value, fiber) {
                    index++;
                    valueStack[index] = cursor.current;
                    {
                        fiberStack[index] = fiber;
                    }
                    cursor.current = value;
                }
                function reset$1() {
                    while (index > -1) {
                        valueStack[index] = null;
                        {
                            fiberStack[index] = null;
                        }
                        index--;
                    }
                }
                var describeComponentFrame = function (name, source, ownerName) {
                    return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
                };
                function describeFiber(fiber) {
                    switch (fiber.tag) {
                    case IndeterminateComponent:
                    case FunctionalComponent:
                    case ClassComponent:
                    case HostComponent:
                        var owner = fiber._debugOwner;
                        var source = fiber._debugSource;
                        var name = getComponentName(fiber);
                        var ownerName = null;
                        if (owner) {
                            ownerName = getComponentName(owner);
                        }
                        return describeComponentFrame(name, source, ownerName);
                    default:
                        return '';
                    }
                }
                function getStackAddendumByWorkInProgressFiber(workInProgress) {
                    var info = '';
                    var node = workInProgress;
                    do {
                        info += describeFiber(node);
                        node = node['return'];
                    } while (node);
                    return info;
                }
                function getCurrentFiberOwnerName() {
                    {
                        var fiber = ReactDebugCurrentFiber.current;
                        if (fiber === null) {
                            return null;
                        }
                        var owner = fiber._debugOwner;
                        if (owner !== null && typeof owner !== 'undefined') {
                            return getComponentName(owner);
                        }
                    }
                    return null;
                }
                function getCurrentFiberStackAddendum() {
                    {
                        var fiber = ReactDebugCurrentFiber.current;
                        if (fiber === null) {
                            return null;
                        }
                        return getStackAddendumByWorkInProgressFiber(fiber);
                    }
                    return null;
                }
                function resetCurrentFiber() {
                    ReactDebugCurrentFrame.getCurrentStack = null;
                    ReactDebugCurrentFiber.current = null;
                    ReactDebugCurrentFiber.phase = null;
                }
                function setCurrentFiber(fiber) {
                    ReactDebugCurrentFrame.getCurrentStack = getCurrentFiberStackAddendum;
                    ReactDebugCurrentFiber.current = fiber;
                    ReactDebugCurrentFiber.phase = null;
                }
                function setCurrentPhase(phase) {
                    ReactDebugCurrentFiber.phase = phase;
                }
                var ReactDebugCurrentFiber = {
                    current: null,
                    phase: null,
                    resetCurrentFiber: resetCurrentFiber,
                    setCurrentFiber: setCurrentFiber,
                    setCurrentPhase: setCurrentPhase,
                    getCurrentFiberOwnerName: getCurrentFiberOwnerName,
                    getCurrentFiberStackAddendum: getCurrentFiberStackAddendum
                };
                var reactEmoji = '\u269B';
                var warningEmoji = '\u26D4';
                var supportsUserTiming = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';
                var currentFiber = null;
                var currentPhase = null;
                var currentPhaseFiber = null;
                var isCommitting = false;
                var hasScheduledUpdateInCurrentCommit = false;
                var hasScheduledUpdateInCurrentPhase = false;
                var commitCountInCurrentWorkLoop = 0;
                var effectCountInCurrentCommit = 0;
                var isWaitingForCallback = false;
                var labelsInCurrentCommit = new Set();
                var formatMarkName = function (markName) {
                    return reactEmoji + ' ' + markName;
                };
                var formatLabel = function (label, warning$$1) {
                    var prefix = warning$$1 ? warningEmoji + ' ' : reactEmoji + ' ';
                    var suffix = warning$$1 ? ' Warning: ' + warning$$1 : '';
                    return '' + prefix + label + suffix;
                };
                var beginMark = function (markName) {
                    performance.mark(formatMarkName(markName));
                };
                var clearMark = function (markName) {
                    performance.clearMarks(formatMarkName(markName));
                };
                var endMark = function (label, markName, warning$$1) {
                    var formattedMarkName = formatMarkName(markName);
                    var formattedLabel = formatLabel(label, warning$$1);
                    try {
                        performance.measure(formattedLabel, formattedMarkName);
                    } catch (err) {
                    }
                    performance.clearMarks(formattedMarkName);
                    performance.clearMeasures(formattedLabel);
                };
                var getFiberMarkName = function (label, debugID) {
                    return label + ' (#' + debugID + ')';
                };
                var getFiberLabel = function (componentName, isMounted, phase) {
                    if (phase === null) {
                        return componentName + ' [' + (isMounted ? 'update' : 'mount') + ']';
                    } else {
                        return componentName + '.' + phase;
                    }
                };
                var beginFiberMark = function (fiber, phase) {
                    var componentName = getComponentName(fiber) || 'Unknown';
                    var debugID = fiber._debugID;
                    var isMounted = fiber.alternate !== null;
                    var label = getFiberLabel(componentName, isMounted, phase);
                    if (isCommitting && labelsInCurrentCommit.has(label)) {
                        return false;
                    }
                    labelsInCurrentCommit.add(label);
                    var markName = getFiberMarkName(label, debugID);
                    beginMark(markName);
                    return true;
                };
                var clearFiberMark = function (fiber, phase) {
                    var componentName = getComponentName(fiber) || 'Unknown';
                    var debugID = fiber._debugID;
                    var isMounted = fiber.alternate !== null;
                    var label = getFiberLabel(componentName, isMounted, phase);
                    var markName = getFiberMarkName(label, debugID);
                    clearMark(markName);
                };
                var endFiberMark = function (fiber, phase, warning$$1) {
                    var componentName = getComponentName(fiber) || 'Unknown';
                    var debugID = fiber._debugID;
                    var isMounted = fiber.alternate !== null;
                    var label = getFiberLabel(componentName, isMounted, phase);
                    var markName = getFiberMarkName(label, debugID);
                    endMark(label, markName, warning$$1);
                };
                var shouldIgnoreFiber = function (fiber) {
                    switch (fiber.tag) {
                    case HostRoot:
                    case HostComponent:
                    case HostText:
                    case HostPortal:
                    case ReturnComponent:
                    case Fragment:
                        return true;
                    default:
                        return false;
                    }
                };
                var clearPendingPhaseMeasurement = function () {
                    if (currentPhase !== null && currentPhaseFiber !== null) {
                        clearFiberMark(currentPhaseFiber, currentPhase);
                    }
                    currentPhaseFiber = null;
                    currentPhase = null;
                    hasScheduledUpdateInCurrentPhase = false;
                };
                var pauseTimers = function () {
                    var fiber = currentFiber;
                    while (fiber) {
                        if (fiber._debugIsCurrentlyTiming) {
                            endFiberMark(fiber, null, null);
                        }
                        fiber = fiber['return'];
                    }
                };
                var resumeTimersRecursively = function (fiber) {
                    if (fiber['return'] !== null) {
                        resumeTimersRecursively(fiber['return']);
                    }
                    if (fiber._debugIsCurrentlyTiming) {
                        beginFiberMark(fiber, null);
                    }
                };
                var resumeTimers = function () {
                    if (currentFiber !== null) {
                        resumeTimersRecursively(currentFiber);
                    }
                };
                function recordEffect() {
                    if (enableUserTimingAPI) {
                        effectCountInCurrentCommit++;
                    }
                }
                function recordScheduleUpdate() {
                    if (enableUserTimingAPI) {
                        if (isCommitting) {
                            hasScheduledUpdateInCurrentCommit = true;
                        }
                        if (currentPhase !== null && currentPhase !== 'componentWillMount' && currentPhase !== 'componentWillReceiveProps') {
                            hasScheduledUpdateInCurrentPhase = true;
                        }
                    }
                }
                function startRequestCallbackTimer() {
                    if (enableUserTimingAPI) {
                        if (supportsUserTiming && !isWaitingForCallback) {
                            isWaitingForCallback = true;
                            beginMark('(Waiting for async callback...)');
                        }
                    }
                }
                function stopRequestCallbackTimer(didExpire) {
                    if (enableUserTimingAPI) {
                        if (supportsUserTiming) {
                            isWaitingForCallback = false;
                            var warning$$1 = didExpire ? 'React was blocked by main thread' : null;
                            endMark('(Waiting for async callback...)', '(Waiting for async callback...)', warning$$1);
                        }
                    }
                }
                function startWorkTimer(fiber) {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
                            return;
                        }
                        currentFiber = fiber;
                        if (!beginFiberMark(fiber, null)) {
                            return;
                        }
                        fiber._debugIsCurrentlyTiming = true;
                    }
                }
                function cancelWorkTimer(fiber) {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
                            return;
                        }
                        fiber._debugIsCurrentlyTiming = false;
                        clearFiberMark(fiber, null);
                    }
                }
                function stopWorkTimer(fiber) {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
                            return;
                        }
                        currentFiber = fiber['return'];
                        if (!fiber._debugIsCurrentlyTiming) {
                            return;
                        }
                        fiber._debugIsCurrentlyTiming = false;
                        endFiberMark(fiber, null, null);
                    }
                }
                function stopFailedWorkTimer(fiber) {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
                            return;
                        }
                        currentFiber = fiber['return'];
                        if (!fiber._debugIsCurrentlyTiming) {
                            return;
                        }
                        fiber._debugIsCurrentlyTiming = false;
                        var warning$$1 = 'An error was thrown inside this error boundary';
                        endFiberMark(fiber, null, warning$$1);
                    }
                }
                function startPhaseTimer(fiber, phase) {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        clearPendingPhaseMeasurement();
                        if (!beginFiberMark(fiber, phase)) {
                            return;
                        }
                        currentPhaseFiber = fiber;
                        currentPhase = phase;
                    }
                }
                function stopPhaseTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        if (currentPhase !== null && currentPhaseFiber !== null) {
                            var warning$$1 = hasScheduledUpdateInCurrentPhase ? 'Scheduled a cascading update' : null;
                            endFiberMark(currentPhaseFiber, currentPhase, warning$$1);
                        }
                        currentPhase = null;
                        currentPhaseFiber = null;
                    }
                }
                function startWorkLoopTimer(nextUnitOfWork) {
                    if (enableUserTimingAPI) {
                        currentFiber = nextUnitOfWork;
                        if (!supportsUserTiming) {
                            return;
                        }
                        commitCountInCurrentWorkLoop = 0;
                        beginMark('(React Tree Reconciliation)');
                        resumeTimers();
                    }
                }
                function stopWorkLoopTimer(interruptedBy) {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        var warning$$1 = null;
                        if (interruptedBy !== null) {
                            if (interruptedBy.tag === HostRoot) {
                                warning$$1 = 'A top-level update interrupted the previous render';
                            } else {
                                var componentName = getComponentName(interruptedBy) || 'Unknown';
                                warning$$1 = 'An update to ' + componentName + ' interrupted the previous render';
                            }
                        } else if (commitCountInCurrentWorkLoop > 1) {
                            warning$$1 = 'There were cascading updates';
                        }
                        commitCountInCurrentWorkLoop = 0;
                        pauseTimers();
                        endMark('(React Tree Reconciliation)', '(React Tree Reconciliation)', warning$$1);
                    }
                }
                function startCommitTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        isCommitting = true;
                        hasScheduledUpdateInCurrentCommit = false;
                        labelsInCurrentCommit.clear();
                        beginMark('(Committing Changes)');
                    }
                }
                function stopCommitTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        var warning$$1 = null;
                        if (hasScheduledUpdateInCurrentCommit) {
                            warning$$1 = 'Lifecycle hook scheduled a cascading update';
                        } else if (commitCountInCurrentWorkLoop > 0) {
                            warning$$1 = 'Caused by a cascading update in earlier commit';
                        }
                        hasScheduledUpdateInCurrentCommit = false;
                        commitCountInCurrentWorkLoop++;
                        isCommitting = false;
                        labelsInCurrentCommit.clear();
                        endMark('(Committing Changes)', '(Committing Changes)', warning$$1);
                    }
                }
                function startCommitHostEffectsTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        effectCountInCurrentCommit = 0;
                        beginMark('(Committing Host Effects)');
                    }
                }
                function stopCommitHostEffectsTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        var count = effectCountInCurrentCommit;
                        effectCountInCurrentCommit = 0;
                        endMark('(Committing Host Effects: ' + count + ' Total)', '(Committing Host Effects)', null);
                    }
                }
                function startCommitLifeCyclesTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        effectCountInCurrentCommit = 0;
                        beginMark('(Calling Lifecycle Methods)');
                    }
                }
                function stopCommitLifeCyclesTimer() {
                    if (enableUserTimingAPI) {
                        if (!supportsUserTiming) {
                            return;
                        }
                        var count = effectCountInCurrentCommit;
                        effectCountInCurrentCommit = 0;
                        endMark('(Calling Lifecycle Methods: ' + count + ' Total)', '(Calling Lifecycle Methods)', null);
                    }
                }
                {
                    var warnedAboutMissingGetChildContext = {};
                }
                var contextStackCursor = createCursor(emptyObject);
                var didPerformWorkStackCursor = createCursor(false);
                var previousContext = emptyObject;
                function getUnmaskedContext(workInProgress) {
                    var hasOwnContext = isContextProvider(workInProgress);
                    if (hasOwnContext) {
                        return previousContext;
                    }
                    return contextStackCursor.current;
                }
                function cacheContext(workInProgress, unmaskedContext, maskedContext) {
                    var instance = workInProgress.stateNode;
                    instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
                    instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
                }
                function getMaskedContext(workInProgress, unmaskedContext) {
                    var type = workInProgress.type;
                    var contextTypes = type.contextTypes;
                    if (!contextTypes) {
                        return emptyObject;
                    }
                    var instance = workInProgress.stateNode;
                    if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) {
                        return instance.__reactInternalMemoizedMaskedChildContext;
                    }
                    var context = {};
                    for (var key in contextTypes) {
                        context[key] = unmaskedContext[key];
                    }
                    {
                        var name = getComponentName(workInProgress) || 'Unknown';
                        checkPropTypes(contextTypes, context, 'context', name, ReactDebugCurrentFiber.getCurrentFiberStackAddendum);
                    }
                    if (instance) {
                        cacheContext(workInProgress, unmaskedContext, context);
                    }
                    return context;
                }
                function hasContextChanged() {
                    return didPerformWorkStackCursor.current;
                }
                function isContextConsumer(fiber) {
                    return fiber.tag === ClassComponent && fiber.type.contextTypes != null;
                }
                function isContextProvider(fiber) {
                    return fiber.tag === ClassComponent && fiber.type.childContextTypes != null;
                }
                function popContextProvider(fiber) {
                    if (!isContextProvider(fiber)) {
                        return;
                    }
                    pop(didPerformWorkStackCursor, fiber);
                    pop(contextStackCursor, fiber);
                }
                function popTopLevelContextObject(fiber) {
                    pop(didPerformWorkStackCursor, fiber);
                    pop(contextStackCursor, fiber);
                }
                function pushTopLevelContextObject(fiber, context, didChange) {
                    !(contextStackCursor.cursor == null) ? invariant(false, 'Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                    push(contextStackCursor, context, fiber);
                    push(didPerformWorkStackCursor, didChange, fiber);
                }
                function processChildContext(fiber, parentContext) {
                    var instance = fiber.stateNode;
                    var childContextTypes = fiber.type.childContextTypes;
                    if (typeof instance.getChildContext !== 'function') {
                        {
                            var componentName = getComponentName(fiber) || 'Unknown';
                            if (!warnedAboutMissingGetChildContext[componentName]) {
                                warnedAboutMissingGetChildContext[componentName] = true;
                                warning(false, '%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
                            }
                        }
                        return parentContext;
                    }
                    var childContext = void 0;
                    {
                        ReactDebugCurrentFiber.setCurrentPhase('getChildContext');
                    }
                    startPhaseTimer(fiber, 'getChildContext');
                    childContext = instance.getChildContext();
                    stopPhaseTimer();
                    {
                        ReactDebugCurrentFiber.setCurrentPhase(null);
                    }
                    for (var contextKey in childContext) {
                        !(contextKey in childContextTypes) ? invariant(false, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', getComponentName(fiber) || 'Unknown', contextKey) : void 0;
                    }
                    {
                        var name = getComponentName(fiber) || 'Unknown';
                        checkPropTypes(childContextTypes, childContext, 'child context', name, ReactDebugCurrentFiber.getCurrentFiberStackAddendum);
                    }
                    return _assign({}, parentContext, childContext);
                }
                function pushContextProvider(workInProgress) {
                    if (!isContextProvider(workInProgress)) {
                        return false;
                    }
                    var instance = workInProgress.stateNode;
                    var memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyObject;
                    previousContext = contextStackCursor.current;
                    push(contextStackCursor, memoizedMergedChildContext, workInProgress);
                    push(didPerformWorkStackCursor, didPerformWorkStackCursor.current, workInProgress);
                    return true;
                }
                function invalidateContextProvider(workInProgress, didChange) {
                    var instance = workInProgress.stateNode;
                    !instance ? invariant(false, 'Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                    if (didChange) {
                        var mergedContext = processChildContext(workInProgress, previousContext);
                        instance.__reactInternalMemoizedMergedChildContext = mergedContext;
                        pop(didPerformWorkStackCursor, workInProgress);
                        pop(contextStackCursor, workInProgress);
                        push(contextStackCursor, mergedContext, workInProgress);
                        push(didPerformWorkStackCursor, didChange, workInProgress);
                    } else {
                        pop(didPerformWorkStackCursor, workInProgress);
                        push(didPerformWorkStackCursor, didChange, workInProgress);
                    }
                }
                function resetContext() {
                    previousContext = emptyObject;
                    contextStackCursor.current = emptyObject;
                    didPerformWorkStackCursor.current = false;
                }
                function findCurrentUnmaskedContext(fiber) {
                    !(isFiberMounted(fiber) && fiber.tag === ClassComponent) ? invariant(false, 'Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                    var node = fiber;
                    while (node.tag !== HostRoot) {
                        if (isContextProvider(node)) {
                            return node.stateNode.__reactInternalMemoizedMergedChildContext;
                        }
                        var parent = node['return'];
                        !parent ? invariant(false, 'Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        node = parent;
                    }
                    return node.stateNode.context;
                }
                var NoWork = 0;
                var Sync = 1;
                var Never = 2147483647;
                var UNIT_SIZE = 10;
                var MAGIC_NUMBER_OFFSET = 2;
                function msToExpirationTime(ms) {
                    return (ms / UNIT_SIZE | 0) + MAGIC_NUMBER_OFFSET;
                }
                function expirationTimeToMs(expirationTime) {
                    return (expirationTime - MAGIC_NUMBER_OFFSET) * UNIT_SIZE;
                }
                function ceiling(num, precision) {
                    return ((num / precision | 0) + 1) * precision;
                }
                function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
                    return ceiling(currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE);
                }
                var NoContext = 0;
                var AsyncUpdates = 1;
                {
                    var hasBadMapPolyfill = false;
                    try {
                        var nonExtensibleObject = Object.preventExtensions({});
                    } catch (e) {
                        hasBadMapPolyfill = true;
                    }
                }
                {
                    var debugCounter = 1;
                }
                function FiberNode(tag, key, internalContextTag) {
                    this.tag = tag;
                    this.key = key;
                    this.type = null;
                    this.stateNode = null;
                    this['return'] = null;
                    this.child = null;
                    this.sibling = null;
                    this.index = 0;
                    this.ref = null;
                    this.pendingProps = null;
                    this.memoizedProps = null;
                    this.updateQueue = null;
                    this.memoizedState = null;
                    this.internalContextTag = internalContextTag;
                    this.effectTag = NoEffect;
                    this.nextEffect = null;
                    this.firstEffect = null;
                    this.lastEffect = null;
                    this.expirationTime = NoWork;
                    this.alternate = null;
                    {
                        this._debugID = debugCounter++;
                        this._debugSource = null;
                        this._debugOwner = null;
                        this._debugIsCurrentlyTiming = false;
                        if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
                            Object.preventExtensions(this);
                        }
                    }
                }
                var createFiber = function (tag, key, internalContextTag) {
                    return new FiberNode(tag, key, internalContextTag);
                };
                function shouldConstruct(Component) {
                    return !!(Component.prototype && Component.prototype.isReactComponent);
                }
                function createWorkInProgress(current, pendingProps, expirationTime) {
                    var workInProgress = current.alternate;
                    if (workInProgress === null) {
                        workInProgress = createFiber(current.tag, current.key, current.internalContextTag);
                        workInProgress.type = current.type;
                        workInProgress.stateNode = current.stateNode;
                        {
                            workInProgress._debugID = current._debugID;
                            workInProgress._debugSource = current._debugSource;
                            workInProgress._debugOwner = current._debugOwner;
                        }
                        workInProgress.alternate = current;
                        current.alternate = workInProgress;
                    } else {
                        workInProgress.effectTag = NoEffect;
                        workInProgress.nextEffect = null;
                        workInProgress.firstEffect = null;
                        workInProgress.lastEffect = null;
                    }
                    workInProgress.expirationTime = expirationTime;
                    workInProgress.pendingProps = pendingProps;
                    workInProgress.child = current.child;
                    workInProgress.memoizedProps = current.memoizedProps;
                    workInProgress.memoizedState = current.memoizedState;
                    workInProgress.updateQueue = current.updateQueue;
                    workInProgress.sibling = current.sibling;
                    workInProgress.index = current.index;
                    workInProgress.ref = current.ref;
                    return workInProgress;
                }
                function createHostRootFiber() {
                    var fiber = createFiber(HostRoot, null, NoContext);
                    return fiber;
                }
                function createFiberFromElement(element, internalContextTag, expirationTime) {
                    var owner = null;
                    {
                        owner = element._owner;
                    }
                    var fiber = void 0;
                    var type = element.type, key = element.key;
                    if (typeof type === 'function') {
                        fiber = shouldConstruct(type) ? createFiber(ClassComponent, key, internalContextTag) : createFiber(IndeterminateComponent, key, internalContextTag);
                        fiber.type = type;
                        fiber.pendingProps = element.props;
                    } else if (typeof type === 'string') {
                        fiber = createFiber(HostComponent, key, internalContextTag);
                        fiber.type = type;
                        fiber.pendingProps = element.props;
                    } else if (typeof type === 'object' && type !== null && typeof type.tag === 'number') {
                        fiber = type;
                        fiber.pendingProps = element.props;
                    } else {
                        var info = '';
                        {
                            if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
                                info += ' You likely forgot to export your component from the file ' + 'it\'s defined in, or you might have mixed up default and named imports.';
                            }
                            var ownerName = owner ? getComponentName(owner) : null;
                            if (ownerName) {
                                info += '\n\nCheck the render method of `' + ownerName + '`.';
                            }
                        }
                        invariant(false, 'Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s', type == null ? type : typeof type, info);
                    }
                    {
                        fiber._debugSource = element._source;
                        fiber._debugOwner = element._owner;
                    }
                    fiber.expirationTime = expirationTime;
                    return fiber;
                }
                function createFiberFromFragment(elements, internalContextTag, expirationTime, key) {
                    var fiber = createFiber(Fragment, key, internalContextTag);
                    fiber.pendingProps = elements;
                    fiber.expirationTime = expirationTime;
                    return fiber;
                }
                function createFiberFromText(content, internalContextTag, expirationTime) {
                    var fiber = createFiber(HostText, null, internalContextTag);
                    fiber.pendingProps = content;
                    fiber.expirationTime = expirationTime;
                    return fiber;
                }
                function createFiberFromHostInstanceForDeletion() {
                    var fiber = createFiber(HostComponent, null, NoContext);
                    fiber.type = 'DELETED';
                    return fiber;
                }
                function createFiberFromCall(call, internalContextTag, expirationTime) {
                    var fiber = createFiber(CallComponent, call.key, internalContextTag);
                    fiber.type = call.handler;
                    fiber.pendingProps = call;
                    fiber.expirationTime = expirationTime;
                    return fiber;
                }
                function createFiberFromReturn(returnNode, internalContextTag, expirationTime) {
                    var fiber = createFiber(ReturnComponent, null, internalContextTag);
                    fiber.expirationTime = expirationTime;
                    return fiber;
                }
                function createFiberFromPortal(portal, internalContextTag, expirationTime) {
                    var fiber = createFiber(HostPortal, portal.key, internalContextTag);
                    fiber.pendingProps = portal.children || [];
                    fiber.expirationTime = expirationTime;
                    fiber.stateNode = {
                        containerInfo: portal.containerInfo,
                        pendingChildren: null,
                        implementation: portal.implementation
                    };
                    return fiber;
                }
                function createFiberRoot(containerInfo, hydrate) {
                    var uninitializedFiber = createHostRootFiber();
                    var root = {
                        current: uninitializedFiber,
                        containerInfo: containerInfo,
                        pendingChildren: null,
                        remainingExpirationTime: NoWork,
                        isReadyForCommit: false,
                        finishedWork: null,
                        context: null,
                        pendingContext: null,
                        hydrate: hydrate,
                        nextScheduledRoot: null
                    };
                    uninitializedFiber.stateNode = root;
                    return root;
                }
                var onCommitFiberRoot = null;
                var onCommitFiberUnmount = null;
                var hasLoggedError = false;
                function catchErrors(fn) {
                    return function (arg) {
                        try {
                            return fn(arg);
                        } catch (err) {
                            if (true && !hasLoggedError) {
                                hasLoggedError = true;
                                warning(false, 'React DevTools encountered an error: %s', err);
                            }
                        }
                    };
                }
                function injectInternals(internals) {
                    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
                        return false;
                    }
                    var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
                    if (hook.isDisabled) {
                        return true;
                    }
                    if (!hook.supportsFiber) {
                        {
                            warning(false, 'The installed version of React DevTools is too old and will not work ' + 'with the current version of React. Please update React DevTools. ' + 'https://fb.me/react-devtools');
                        }
                        return true;
                    }
                    try {
                        var rendererID = hook.inject(internals);
                        onCommitFiberRoot = catchErrors(function (root) {
                            return hook.onCommitFiberRoot(rendererID, root);
                        });
                        onCommitFiberUnmount = catchErrors(function (fiber) {
                            return hook.onCommitFiberUnmount(rendererID, fiber);
                        });
                    } catch (err) {
                        {
                            warning(false, 'React DevTools encountered an error: %s.', err);
                        }
                    }
                    return true;
                }
                function onCommitRoot(root) {
                    if (typeof onCommitFiberRoot === 'function') {
                        onCommitFiberRoot(root);
                    }
                }
                function onCommitUnmount(fiber) {
                    if (typeof onCommitFiberUnmount === 'function') {
                        onCommitFiberUnmount(fiber);
                    }
                }
                {
                    var didWarnUpdateInsideUpdate = false;
                }
                function createUpdateQueue(baseState) {
                    var queue = {
                        baseState: baseState,
                        expirationTime: NoWork,
                        first: null,
                        last: null,
                        callbackList: null,
                        hasForceUpdate: false,
                        isInitialized: false
                    };
                    {
                        queue.isProcessing = false;
                    }
                    return queue;
                }
                function insertUpdateIntoQueue(queue, update) {
                    if (queue.last === null) {
                        queue.first = queue.last = update;
                    } else {
                        queue.last.next = update;
                        queue.last = update;
                    }
                    if (queue.expirationTime === NoWork || queue.expirationTime > update.expirationTime) {
                        queue.expirationTime = update.expirationTime;
                    }
                }
                function insertUpdateIntoFiber(fiber, update) {
                    var alternateFiber = fiber.alternate;
                    var queue1 = fiber.updateQueue;
                    if (queue1 === null) {
                        queue1 = fiber.updateQueue = createUpdateQueue(null);
                    }
                    var queue2 = void 0;
                    if (alternateFiber !== null) {
                        queue2 = alternateFiber.updateQueue;
                        if (queue2 === null) {
                            queue2 = alternateFiber.updateQueue = createUpdateQueue(null);
                        }
                    } else {
                        queue2 = null;
                    }
                    queue2 = queue2 !== queue1 ? queue2 : null;
                    {
                        if ((queue1.isProcessing || queue2 !== null && queue2.isProcessing) && !didWarnUpdateInsideUpdate) {
                            warning(false, 'An update (setState, replaceState, or forceUpdate) was scheduled ' + 'from inside an update function. Update functions should be pure, ' + 'with zero side-effects. Consider using componentDidUpdate or a ' + 'callback.');
                            didWarnUpdateInsideUpdate = true;
                        }
                    }
                    if (queue2 === null) {
                        insertUpdateIntoQueue(queue1, update);
                        return;
                    }
                    if (queue1.last === null || queue2.last === null) {
                        insertUpdateIntoQueue(queue1, update);
                        insertUpdateIntoQueue(queue2, update);
                        return;
                    }
                    insertUpdateIntoQueue(queue1, update);
                    queue2.last = update;
                }
                function getUpdateExpirationTime(fiber) {
                    if (fiber.tag !== ClassComponent && fiber.tag !== HostRoot) {
                        return NoWork;
                    }
                    var updateQueue = fiber.updateQueue;
                    if (updateQueue === null) {
                        return NoWork;
                    }
                    return updateQueue.expirationTime;
                }
                function getStateFromUpdate(update, instance, prevState, props) {
                    var partialState = update.partialState;
                    if (typeof partialState === 'function') {
                        var updateFn = partialState;
                        if (debugRenderPhaseSideEffects) {
                            updateFn.call(instance, prevState, props);
                        }
                        return updateFn.call(instance, prevState, props);
                    } else {
                        return partialState;
                    }
                }
                function processUpdateQueue(current, workInProgress, queue, instance, props, renderExpirationTime) {
                    if (current !== null && current.updateQueue === queue) {
                        var currentQueue = queue;
                        queue = workInProgress.updateQueue = {
                            baseState: currentQueue.baseState,
                            expirationTime: currentQueue.expirationTime,
                            first: currentQueue.first,
                            last: currentQueue.last,
                            isInitialized: currentQueue.isInitialized,
                            callbackList: null,
                            hasForceUpdate: false
                        };
                    }
                    {
                        queue.isProcessing = true;
                    }
                    queue.expirationTime = NoWork;
                    var state = void 0;
                    if (queue.isInitialized) {
                        state = queue.baseState;
                    } else {
                        state = queue.baseState = workInProgress.memoizedState;
                        queue.isInitialized = true;
                    }
                    var dontMutatePrevState = true;
                    var update = queue.first;
                    var didSkip = false;
                    while (update !== null) {
                        var updateExpirationTime = update.expirationTime;
                        if (updateExpirationTime > renderExpirationTime) {
                            var remainingExpirationTime = queue.expirationTime;
                            if (remainingExpirationTime === NoWork || remainingExpirationTime > updateExpirationTime) {
                                queue.expirationTime = updateExpirationTime;
                            }
                            if (!didSkip) {
                                didSkip = true;
                                queue.baseState = state;
                            }
                            update = update.next;
                            continue;
                        }
                        if (!didSkip) {
                            queue.first = update.next;
                            if (queue.first === null) {
                                queue.last = null;
                            }
                        }
                        var _partialState = void 0;
                        if (update.isReplace) {
                            state = getStateFromUpdate(update, instance, state, props);
                            dontMutatePrevState = true;
                        } else {
                            _partialState = getStateFromUpdate(update, instance, state, props);
                            if (_partialState) {
                                if (dontMutatePrevState) {
                                    state = _assign({}, state, _partialState);
                                } else {
                                    state = _assign(state, _partialState);
                                }
                                dontMutatePrevState = false;
                            }
                        }
                        if (update.isForced) {
                            queue.hasForceUpdate = true;
                        }
                        if (update.callback !== null) {
                            var _callbackList = queue.callbackList;
                            if (_callbackList === null) {
                                _callbackList = queue.callbackList = [];
                            }
                            _callbackList.push(update);
                        }
                        update = update.next;
                    }
                    if (queue.callbackList !== null) {
                        workInProgress.effectTag |= Callback;
                    } else if (queue.first === null && !queue.hasForceUpdate) {
                        workInProgress.updateQueue = null;
                    }
                    if (!didSkip) {
                        didSkip = true;
                        queue.baseState = state;
                    }
                    {
                        queue.isProcessing = false;
                    }
                    return state;
                }
                function commitCallbacks(queue, context) {
                    var callbackList = queue.callbackList;
                    if (callbackList === null) {
                        return;
                    }
                    queue.callbackList = null;
                    for (var i = 0; i < callbackList.length; i++) {
                        var update = callbackList[i];
                        var _callback = update.callback;
                        update.callback = null;
                        !(typeof _callback === 'function') ? invariant(false, 'Invalid argument passed as callback. Expected a function. Instead received: %s', _callback) : void 0;
                        _callback.call(context);
                    }
                }
                var fakeInternalInstance = {};
                var isArray = Array.isArray;
                {
                    var didWarnAboutStateAssignmentForComponent = {};
                    var warnOnInvalidCallback = function (callback, callerName) {
                        warning(callback === null || typeof callback === 'function', '%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
                    };
                    Object.defineProperty(fakeInternalInstance, '_processChildContext', {
                        enumerable: false,
                        value: function () {
                            invariant(false, '_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn\'t supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).');
                        }
                    });
                    Object.freeze(fakeInternalInstance);
                }
                var ReactFiberClassComponent = function (scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState) {
                    var updater = {
                        isMounted: isMounted,
                        enqueueSetState: function (instance, partialState, callback) {
                            var fiber = get(instance);
                            callback = callback === undefined ? null : callback;
                            {
                                warnOnInvalidCallback(callback, 'setState');
                            }
                            var expirationTime = computeExpirationForFiber(fiber);
                            var update = {
                                expirationTime: expirationTime,
                                partialState: partialState,
                                callback: callback,
                                isReplace: false,
                                isForced: false,
                                nextCallback: null,
                                next: null
                            };
                            insertUpdateIntoFiber(fiber, update);
                            scheduleWork(fiber, expirationTime);
                        },
                        enqueueReplaceState: function (instance, state, callback) {
                            var fiber = get(instance);
                            callback = callback === undefined ? null : callback;
                            {
                                warnOnInvalidCallback(callback, 'replaceState');
                            }
                            var expirationTime = computeExpirationForFiber(fiber);
                            var update = {
                                expirationTime: expirationTime,
                                partialState: state,
                                callback: callback,
                                isReplace: true,
                                isForced: false,
                                nextCallback: null,
                                next: null
                            };
                            insertUpdateIntoFiber(fiber, update);
                            scheduleWork(fiber, expirationTime);
                        },
                        enqueueForceUpdate: function (instance, callback) {
                            var fiber = get(instance);
                            callback = callback === undefined ? null : callback;
                            {
                                warnOnInvalidCallback(callback, 'forceUpdate');
                            }
                            var expirationTime = computeExpirationForFiber(fiber);
                            var update = {
                                expirationTime: expirationTime,
                                partialState: null,
                                callback: callback,
                                isReplace: false,
                                isForced: true,
                                nextCallback: null,
                                next: null
                            };
                            insertUpdateIntoFiber(fiber, update);
                            scheduleWork(fiber, expirationTime);
                        }
                    };
                    function checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext) {
                        if (oldProps === null || workInProgress.updateQueue !== null && workInProgress.updateQueue.hasForceUpdate) {
                            return true;
                        }
                        var instance = workInProgress.stateNode;
                        var type = workInProgress.type;
                        if (typeof instance.shouldComponentUpdate === 'function') {
                            startPhaseTimer(workInProgress, 'shouldComponentUpdate');
                            var shouldUpdate = instance.shouldComponentUpdate(newProps, newState, newContext);
                            stopPhaseTimer();
                            if (debugRenderPhaseSideEffects) {
                                instance.shouldComponentUpdate(newProps, newState, newContext);
                            }
                            {
                                warning(shouldUpdate !== undefined, '%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', getComponentName(workInProgress) || 'Unknown');
                            }
                            return shouldUpdate;
                        }
                        if (type.prototype && type.prototype.isPureReactComponent) {
                            return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState);
                        }
                        return true;
                    }
                    function checkClassInstance(workInProgress) {
                        var instance = workInProgress.stateNode;
                        var type = workInProgress.type;
                        {
                            var name = getComponentName(workInProgress);
                            var renderPresent = instance.render;
                            if (!renderPresent) {
                                if (type.prototype && typeof type.prototype.render === 'function') {
                                    warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: did you accidentally return an object from the constructor?', name);
                                } else {
                                    warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', name);
                                }
                            }
                            var noGetInitialStateOnES6 = !instance.getInitialState || instance.getInitialState.isReactClassApproved || instance.state;
                            warning(noGetInitialStateOnES6, 'getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name);
                            var noGetDefaultPropsOnES6 = !instance.getDefaultProps || instance.getDefaultProps.isReactClassApproved;
                            warning(noGetDefaultPropsOnES6, 'getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name);
                            var noInstancePropTypes = !instance.propTypes;
                            warning(noInstancePropTypes, 'propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', name);
                            var noInstanceContextTypes = !instance.contextTypes;
                            warning(noInstanceContextTypes, 'contextTypes was defined as an instance property on %s. Use a static ' + 'property to define contextTypes instead.', name);
                            var noComponentShouldUpdate = typeof instance.componentShouldUpdate !== 'function';
                            warning(noComponentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name);
                            if (type.prototype && type.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== 'undefined') {
                                warning(false, '%s has a method called shouldComponentUpdate(). ' + 'shouldComponentUpdate should not be used when extending React.PureComponent. ' + 'Please extend React.Component if shouldComponentUpdate is used.', getComponentName(workInProgress) || 'A pure component');
                            }
                            var noComponentDidUnmount = typeof instance.componentDidUnmount !== 'function';
                            warning(noComponentDidUnmount, '%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name);
                            var noComponentDidReceiveProps = typeof instance.componentDidReceiveProps !== 'function';
                            warning(noComponentDidReceiveProps, '%s has a method called ' + 'componentDidReceiveProps(). But there is no such lifecycle method. ' + 'If you meant to update the state in response to changing props, ' + 'use componentWillReceiveProps(). If you meant to fetch data or ' + 'run side-effects or mutations after React has updated the UI, use componentDidUpdate().', name);
                            var noComponentWillRecieveProps = typeof instance.componentWillRecieveProps !== 'function';
                            warning(noComponentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name);
                            var hasMutatedProps = instance.props !== workInProgress.pendingProps;
                            warning(instance.props === undefined || !hasMutatedProps, '%s(...): When calling super() in `%s`, make sure to pass ' + 'up the same props that your component\'s constructor was passed.', name, name);
                            var noInstanceDefaultProps = !instance.defaultProps;
                            warning(noInstanceDefaultProps, 'Setting defaultProps as an instance property on %s is not supported and will be ignored.' + ' Instead, define defaultProps as a static property on %s.', name, name);
                        }
                        var state = instance.state;
                        if (state && (typeof state !== 'object' || isArray(state))) {
                            warning(false, '%s.state: must be set to an object or null', getComponentName(workInProgress));
                        }
                        if (typeof instance.getChildContext === 'function') {
                            warning(typeof workInProgress.type.childContextTypes === 'object', '%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', getComponentName(workInProgress));
                        }
                    }
                    function resetInputPointers(workInProgress, instance) {
                        instance.props = workInProgress.memoizedProps;
                        instance.state = workInProgress.memoizedState;
                    }
                    function adoptClassInstance(workInProgress, instance) {
                        instance.updater = updater;
                        workInProgress.stateNode = instance;
                        set(instance, workInProgress);
                        {
                            instance._reactInternalInstance = fakeInternalInstance;
                        }
                    }
                    function constructClassInstance(workInProgress, props) {
                        var ctor = workInProgress.type;
                        var unmaskedContext = getUnmaskedContext(workInProgress);
                        var needsContext = isContextConsumer(workInProgress);
                        var context = needsContext ? getMaskedContext(workInProgress, unmaskedContext) : emptyObject;
                        var instance = new ctor(props, context);
                        adoptClassInstance(workInProgress, instance);
                        if (needsContext) {
                            cacheContext(workInProgress, unmaskedContext, context);
                        }
                        return instance;
                    }
                    function callComponentWillMount(workInProgress, instance) {
                        startPhaseTimer(workInProgress, 'componentWillMount');
                        var oldState = instance.state;
                        instance.componentWillMount();
                        stopPhaseTimer();
                        if (debugRenderPhaseSideEffects) {
                            instance.componentWillMount();
                        }
                        if (oldState !== instance.state) {
                            {
                                warning(false, '%s.componentWillMount(): Assigning directly to this.state is ' + 'deprecated (except inside a component\'s ' + 'constructor). Use setState instead.', getComponentName(workInProgress));
                            }
                            updater.enqueueReplaceState(instance, instance.state, null);
                        }
                    }
                    function callComponentWillReceiveProps(workInProgress, instance, newProps, newContext) {
                        startPhaseTimer(workInProgress, 'componentWillReceiveProps');
                        var oldState = instance.state;
                        instance.componentWillReceiveProps(newProps, newContext);
                        stopPhaseTimer();
                        if (debugRenderPhaseSideEffects) {
                            instance.componentWillReceiveProps(newProps, newContext);
                        }
                        if (instance.state !== oldState) {
                            {
                                var componentName = getComponentName(workInProgress) || 'Component';
                                if (!didWarnAboutStateAssignmentForComponent[componentName]) {
                                    warning(false, '%s.componentWillReceiveProps(): Assigning directly to ' + 'this.state is deprecated (except inside a component\'s ' + 'constructor). Use setState instead.', componentName);
                                    didWarnAboutStateAssignmentForComponent[componentName] = true;
                                }
                            }
                            updater.enqueueReplaceState(instance, instance.state, null);
                        }
                    }
                    function mountClassInstance(workInProgress, renderExpirationTime) {
                        var current = workInProgress.alternate;
                        {
                            checkClassInstance(workInProgress);
                        }
                        var instance = workInProgress.stateNode;
                        var state = instance.state || null;
                        var props = workInProgress.pendingProps;
                        !props ? invariant(false, 'There must be pending props for an initial mount. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        var unmaskedContext = getUnmaskedContext(workInProgress);
                        instance.props = props;
                        instance.state = workInProgress.memoizedState = state;
                        instance.refs = emptyObject;
                        instance.context = getMaskedContext(workInProgress, unmaskedContext);
                        if (enableAsyncSubtreeAPI && workInProgress.type != null && workInProgress.type.prototype != null && workInProgress.type.prototype.unstable_isAsyncReactComponent === true) {
                            workInProgress.internalContextTag |= AsyncUpdates;
                        }
                        if (typeof instance.componentWillMount === 'function') {
                            callComponentWillMount(workInProgress, instance);
                            var updateQueue = workInProgress.updateQueue;
                            if (updateQueue !== null) {
                                instance.state = processUpdateQueue(current, workInProgress, updateQueue, instance, props, renderExpirationTime);
                            }
                        }
                        if (typeof instance.componentDidMount === 'function') {
                            workInProgress.effectTag |= Update;
                        }
                    }
                    function updateClassInstance(current, workInProgress, renderExpirationTime) {
                        var instance = workInProgress.stateNode;
                        resetInputPointers(workInProgress, instance);
                        var oldProps = workInProgress.memoizedProps;
                        var newProps = workInProgress.pendingProps;
                        if (!newProps) {
                            newProps = oldProps;
                            !(newProps != null) ? invariant(false, 'There should always be pending or memoized props. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        }
                        var oldContext = instance.context;
                        var newUnmaskedContext = getUnmaskedContext(workInProgress);
                        var newContext = getMaskedContext(workInProgress, newUnmaskedContext);
                        if (typeof instance.componentWillReceiveProps === 'function' && (oldProps !== newProps || oldContext !== newContext)) {
                            callComponentWillReceiveProps(workInProgress, instance, newProps, newContext);
                        }
                        var oldState = workInProgress.memoizedState;
                        var newState = void 0;
                        if (workInProgress.updateQueue !== null) {
                            newState = processUpdateQueue(current, workInProgress, workInProgress.updateQueue, instance, newProps, renderExpirationTime);
                        } else {
                            newState = oldState;
                        }
                        if (oldProps === newProps && oldState === newState && !hasContextChanged() && !(workInProgress.updateQueue !== null && workInProgress.updateQueue.hasForceUpdate)) {
                            if (typeof instance.componentDidUpdate === 'function') {
                                if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
                                    workInProgress.effectTag |= Update;
                                }
                            }
                            return false;
                        }
                        var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);
                        if (shouldUpdate) {
                            if (typeof instance.componentWillUpdate === 'function') {
                                startPhaseTimer(workInProgress, 'componentWillUpdate');
                                instance.componentWillUpdate(newProps, newState, newContext);
                                stopPhaseTimer();
                                if (debugRenderPhaseSideEffects) {
                                    instance.componentWillUpdate(newProps, newState, newContext);
                                }
                            }
                            if (typeof instance.componentDidUpdate === 'function') {
                                workInProgress.effectTag |= Update;
                            }
                        } else {
                            if (typeof instance.componentDidUpdate === 'function') {
                                if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
                                    workInProgress.effectTag |= Update;
                                }
                            }
                            memoizeProps(workInProgress, newProps);
                            memoizeState(workInProgress, newState);
                        }
                        instance.props = newProps;
                        instance.state = newState;
                        instance.context = newContext;
                        return shouldUpdate;
                    }
                    return {
                        adoptClassInstance: adoptClassInstance,
                        constructClassInstance: constructClassInstance,
                        mountClassInstance: mountClassInstance,
                        updateClassInstance: updateClassInstance
                    };
                };
                var hasSymbol = typeof Symbol === 'function' && Symbol['for'];
                var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 60103;
                var REACT_CALL_TYPE = hasSymbol ? Symbol['for']('react.call') : 60104;
                var REACT_RETURN_TYPE = hasSymbol ? Symbol['for']('react.return') : 60105;
                var REACT_PORTAL_TYPE = hasSymbol ? Symbol['for']('react.portal') : 60106;
                var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol['for']('react.fragment') : 60107;
                var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
                var FAUX_ITERATOR_SYMBOL = '@@iterator';
                function getIteratorFn(maybeIterable) {
                    if (maybeIterable === null || typeof maybeIterable === 'undefined') {
                        return null;
                    }
                    var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
                    if (typeof maybeIterator === 'function') {
                        return maybeIterator;
                    }
                    return null;
                }
                var getCurrentFiberStackAddendum$1 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;
                {
                    var didWarnAboutMaps = false;
                    var ownerHasKeyUseWarning = {};
                    var ownerHasFunctionTypeWarning = {};
                    var warnForMissingKey = function (child) {
                        if (child === null || typeof child !== 'object') {
                            return;
                        }
                        if (!child._store || child._store.validated || child.key != null) {
                            return;
                        }
                        !(typeof child._store === 'object') ? invariant(false, 'React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        child._store.validated = true;
                        var currentComponentErrorInfo = 'Each child in an array or iterator should have a unique ' + '"key" prop. See https://fb.me/react-warning-keys for ' + 'more information.' + (getCurrentFiberStackAddendum$1() || '');
                        if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
                            return;
                        }
                        ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
                        warning(false, 'Each child in an array or iterator should have a unique ' + '"key" prop. See https://fb.me/react-warning-keys for ' + 'more information.%s', getCurrentFiberStackAddendum$1());
                    };
                }
                var isArray$1 = Array.isArray;
                function coerceRef(current, element) {
                    var mixedRef = element.ref;
                    if (mixedRef !== null && typeof mixedRef !== 'function') {
                        if (element._owner) {
                            var owner = element._owner;
                            var inst = void 0;
                            if (owner) {
                                var ownerFiber = owner;
                                !(ownerFiber.tag === ClassComponent) ? invariant(false, 'Stateless function components cannot have refs.') : void 0;
                                inst = ownerFiber.stateNode;
                            }
                            !inst ? invariant(false, 'Missing owner for string ref %s. This error is likely caused by a bug in React. Please file an issue.', mixedRef) : void 0;
                            var stringRef = '' + mixedRef;
                            if (current !== null && current.ref !== null && current.ref._stringRef === stringRef) {
                                return current.ref;
                            }
                            var ref = function (value) {
                                var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
                                if (value === null) {
                                    delete refs[stringRef];
                                } else {
                                    refs[stringRef] = value;
                                }
                            };
                            ref._stringRef = stringRef;
                            return ref;
                        } else {
                            !(typeof mixedRef === 'string') ? invariant(false, 'Expected ref to be a function or a string.') : void 0;
                            !element._owner ? invariant(false, 'Element ref was specified as a string (%s) but no owner was set. You may have multiple copies of React loaded. (details: https://fb.me/react-refs-must-have-owner).', mixedRef) : void 0;
                        }
                    }
                    return mixedRef;
                }
                function throwOnInvalidObjectType(returnFiber, newChild) {
                    if (returnFiber.type !== 'textarea') {
                        var addendum = '';
                        {
                            addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + (getCurrentFiberStackAddendum$1() || '');
                        }
                        invariant(false, 'Objects are not valid as a React child (found: %s).%s', Object.prototype.toString.call(newChild) === '[object Object]' ? 'object with keys {' + Object.keys(newChild).join(', ') + '}' : newChild, addendum);
                    }
                }
                function warnOnFunctionType() {
                    var currentComponentErrorInfo = 'Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.' + (getCurrentFiberStackAddendum$1() || '');
                    if (ownerHasFunctionTypeWarning[currentComponentErrorInfo]) {
                        return;
                    }
                    ownerHasFunctionTypeWarning[currentComponentErrorInfo] = true;
                    warning(false, 'Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.%s', getCurrentFiberStackAddendum$1() || '');
                }
                function ChildReconciler(shouldTrackSideEffects) {
                    function deleteChild(returnFiber, childToDelete) {
                        if (!shouldTrackSideEffects) {
                            return;
                        }
                        var last = returnFiber.lastEffect;
                        if (last !== null) {
                            last.nextEffect = childToDelete;
                            returnFiber.lastEffect = childToDelete;
                        } else {
                            returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
                        }
                        childToDelete.nextEffect = null;
                        childToDelete.effectTag = Deletion;
                    }
                    function deleteRemainingChildren(returnFiber, currentFirstChild) {
                        if (!shouldTrackSideEffects) {
                            return null;
                        }
                        var childToDelete = currentFirstChild;
                        while (childToDelete !== null) {
                            deleteChild(returnFiber, childToDelete);
                            childToDelete = childToDelete.sibling;
                        }
                        return null;
                    }
                    function mapRemainingChildren(returnFiber, currentFirstChild) {
                        var existingChildren = new Map();
                        var existingChild = currentFirstChild;
                        while (existingChild !== null) {
                            if (existingChild.key !== null) {
                                existingChildren.set(existingChild.key, existingChild);
                            } else {
                                existingChildren.set(existingChild.index, existingChild);
                            }
                            existingChild = existingChild.sibling;
                        }
                        return existingChildren;
                    }
                    function useFiber(fiber, pendingProps, expirationTime) {
                        var clone = createWorkInProgress(fiber, pendingProps, expirationTime);
                        clone.index = 0;
                        clone.sibling = null;
                        return clone;
                    }
                    function placeChild(newFiber, lastPlacedIndex, newIndex) {
                        newFiber.index = newIndex;
                        if (!shouldTrackSideEffects) {
                            return lastPlacedIndex;
                        }
                        var current = newFiber.alternate;
                        if (current !== null) {
                            var oldIndex = current.index;
                            if (oldIndex < lastPlacedIndex) {
                                newFiber.effectTag = Placement;
                                return lastPlacedIndex;
                            } else {
                                return oldIndex;
                            }
                        } else {
                            newFiber.effectTag = Placement;
                            return lastPlacedIndex;
                        }
                    }
                    function placeSingleChild(newFiber) {
                        if (shouldTrackSideEffects && newFiber.alternate === null) {
                            newFiber.effectTag = Placement;
                        }
                        return newFiber;
                    }
                    function updateTextNode(returnFiber, current, textContent, expirationTime) {
                        if (current === null || current.tag !== HostText) {
                            var created = createFiberFromText(textContent, returnFiber.internalContextTag, expirationTime);
                            created['return'] = returnFiber;
                            return created;
                        } else {
                            var existing = useFiber(current, textContent, expirationTime);
                            existing['return'] = returnFiber;
                            return existing;
                        }
                    }
                    function updateElement(returnFiber, current, element, expirationTime) {
                        if (current !== null && current.type === element.type) {
                            var existing = useFiber(current, element.props, expirationTime);
                            existing.ref = coerceRef(current, element);
                            existing['return'] = returnFiber;
                            {
                                existing._debugSource = element._source;
                                existing._debugOwner = element._owner;
                            }
                            return existing;
                        } else {
                            var created = createFiberFromElement(element, returnFiber.internalContextTag, expirationTime);
                            created.ref = coerceRef(current, element);
                            created['return'] = returnFiber;
                            return created;
                        }
                    }
                    function updateCall(returnFiber, current, call, expirationTime) {
                        if (current === null || current.tag !== CallComponent) {
                            var created = createFiberFromCall(call, returnFiber.internalContextTag, expirationTime);
                            created['return'] = returnFiber;
                            return created;
                        } else {
                            var existing = useFiber(current, call, expirationTime);
                            existing['return'] = returnFiber;
                            return existing;
                        }
                    }
                    function updateReturn(returnFiber, current, returnNode, expirationTime) {
                        if (current === null || current.tag !== ReturnComponent) {
                            var created = createFiberFromReturn(returnNode, returnFiber.internalContextTag, expirationTime);
                            created.type = returnNode.value;
                            created['return'] = returnFiber;
                            return created;
                        } else {
                            var existing = useFiber(current, null, expirationTime);
                            existing.type = returnNode.value;
                            existing['return'] = returnFiber;
                            return existing;
                        }
                    }
                    function updatePortal(returnFiber, current, portal, expirationTime) {
                        if (current === null || current.tag !== HostPortal || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
                            var created = createFiberFromPortal(portal, returnFiber.internalContextTag, expirationTime);
                            created['return'] = returnFiber;
                            return created;
                        } else {
                            var existing = useFiber(current, portal.children || [], expirationTime);
                            existing['return'] = returnFiber;
                            return existing;
                        }
                    }
                    function updateFragment(returnFiber, current, fragment, expirationTime, key) {
                        if (current === null || current.tag !== Fragment) {
                            var created = createFiberFromFragment(fragment, returnFiber.internalContextTag, expirationTime, key);
                            created['return'] = returnFiber;
                            return created;
                        } else {
                            var existing = useFiber(current, fragment, expirationTime);
                            existing['return'] = returnFiber;
                            return existing;
                        }
                    }
                    function createChild(returnFiber, newChild, expirationTime) {
                        if (typeof newChild === 'string' || typeof newChild === 'number') {
                            var created = createFiberFromText('' + newChild, returnFiber.internalContextTag, expirationTime);
                            created['return'] = returnFiber;
                            return created;
                        }
                        if (typeof newChild === 'object' && newChild !== null) {
                            switch (newChild.$$typeof) {
                            case REACT_ELEMENT_TYPE: {
                                    if (newChild.type === REACT_FRAGMENT_TYPE) {
                                        var _created = createFiberFromFragment(newChild.props.children, returnFiber.internalContextTag, expirationTime, newChild.key);
                                        _created['return'] = returnFiber;
                                        return _created;
                                    } else {
                                        var _created2 = createFiberFromElement(newChild, returnFiber.internalContextTag, expirationTime);
                                        _created2.ref = coerceRef(null, newChild);
                                        _created2['return'] = returnFiber;
                                        return _created2;
                                    }
                                }
                            case REACT_CALL_TYPE: {
                                    var _created3 = createFiberFromCall(newChild, returnFiber.internalContextTag, expirationTime);
                                    _created3['return'] = returnFiber;
                                    return _created3;
                                }
                            case REACT_RETURN_TYPE: {
                                    var _created4 = createFiberFromReturn(newChild, returnFiber.internalContextTag, expirationTime);
                                    _created4.type = newChild.value;
                                    _created4['return'] = returnFiber;
                                    return _created4;
                                }
                            case REACT_PORTAL_TYPE: {
                                    var _created5 = createFiberFromPortal(newChild, returnFiber.internalContextTag, expirationTime);
                                    _created5['return'] = returnFiber;
                                    return _created5;
                                }
                            }
                            if (isArray$1(newChild) || getIteratorFn(newChild)) {
                                var _created6 = createFiberFromFragment(newChild, returnFiber.internalContextTag, expirationTime, null);
                                _created6['return'] = returnFiber;
                                return _created6;
                            }
                            throwOnInvalidObjectType(returnFiber, newChild);
                        }
                        {
                            if (typeof newChild === 'function') {
                                warnOnFunctionType();
                            }
                        }
                        return null;
                    }
                    function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
                        var key = oldFiber !== null ? oldFiber.key : null;
                        if (typeof newChild === 'string' || typeof newChild === 'number') {
                            if (key !== null) {
                                return null;
                            }
                            return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime);
                        }
                        if (typeof newChild === 'object' && newChild !== null) {
                            switch (newChild.$$typeof) {
                            case REACT_ELEMENT_TYPE: {
                                    if (newChild.key === key) {
                                        if (newChild.type === REACT_FRAGMENT_TYPE) {
                                            return updateFragment(returnFiber, oldFiber, newChild.props.children, expirationTime, key);
                                        }
                                        return updateElement(returnFiber, oldFiber, newChild, expirationTime);
                                    } else {
                                        return null;
                                    }
                                }
                            case REACT_CALL_TYPE: {
                                    if (newChild.key === key) {
                                        return updateCall(returnFiber, oldFiber, newChild, expirationTime);
                                    } else {
                                        return null;
                                    }
                                }
                            case REACT_RETURN_TYPE: {
                                    if (key === null) {
                                        return updateReturn(returnFiber, oldFiber, newChild, expirationTime);
                                    } else {
                                        return null;
                                    }
                                }
                            case REACT_PORTAL_TYPE: {
                                    if (newChild.key === key) {
                                        return updatePortal(returnFiber, oldFiber, newChild, expirationTime);
                                    } else {
                                        return null;
                                    }
                                }
                            }
                            if (isArray$1(newChild) || getIteratorFn(newChild)) {
                                if (key !== null) {
                                    return null;
                                }
                                return updateFragment(returnFiber, oldFiber, newChild, expirationTime, null);
                            }
                            throwOnInvalidObjectType(returnFiber, newChild);
                        }
                        {
                            if (typeof newChild === 'function') {
                                warnOnFunctionType();
                            }
                        }
                        return null;
                    }
                    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
                        if (typeof newChild === 'string' || typeof newChild === 'number') {
                            var matchedFiber = existingChildren.get(newIdx) || null;
                            return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime);
                        }
                        if (typeof newChild === 'object' && newChild !== null) {
                            switch (newChild.$$typeof) {
                            case REACT_ELEMENT_TYPE: {
                                    var _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                                    if (newChild.type === REACT_FRAGMENT_TYPE) {
                                        return updateFragment(returnFiber, _matchedFiber, newChild.props.children, expirationTime, newChild.key);
                                    }
                                    return updateElement(returnFiber, _matchedFiber, newChild, expirationTime);
                                }
                            case REACT_CALL_TYPE: {
                                    var _matchedFiber2 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                                    return updateCall(returnFiber, _matchedFiber2, newChild, expirationTime);
                                }
                            case REACT_RETURN_TYPE: {
                                    var _matchedFiber3 = existingChildren.get(newIdx) || null;
                                    return updateReturn(returnFiber, _matchedFiber3, newChild, expirationTime);
                                }
                            case REACT_PORTAL_TYPE: {
                                    var _matchedFiber4 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                                    return updatePortal(returnFiber, _matchedFiber4, newChild, expirationTime);
                                }
                            }
                            if (isArray$1(newChild) || getIteratorFn(newChild)) {
                                var _matchedFiber5 = existingChildren.get(newIdx) || null;
                                return updateFragment(returnFiber, _matchedFiber5, newChild, expirationTime, null);
                            }
                            throwOnInvalidObjectType(returnFiber, newChild);
                        }
                        {
                            if (typeof newChild === 'function') {
                                warnOnFunctionType();
                            }
                        }
                        return null;
                    }
                    function warnOnInvalidKey(child, knownKeys) {
                        {
                            if (typeof child !== 'object' || child === null) {
                                return knownKeys;
                            }
                            switch (child.$$typeof) {
                            case REACT_ELEMENT_TYPE:
                            case REACT_CALL_TYPE:
                            case REACT_PORTAL_TYPE:
                                warnForMissingKey(child);
                                var key = child.key;
                                if (typeof key !== 'string') {
                                    break;
                                }
                                if (knownKeys === null) {
                                    knownKeys = new Set();
                                    knownKeys.add(key);
                                    break;
                                }
                                if (!knownKeys.has(key)) {
                                    knownKeys.add(key);
                                    break;
                                }
                                warning(false, 'Encountered two children with the same key, `%s`. ' + 'Keys should be unique so that components maintain their identity ' + 'across updates. Non-unique keys may cause children to be ' + 'duplicated and/or omitted \u2014 the behavior is unsupported and ' + 'could change in a future version.%s', key, getCurrentFiberStackAddendum$1());
                                break;
                            default:
                                break;
                            }
                        }
                        return knownKeys;
                    }
                    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
                        {
                            var knownKeys = null;
                            for (var i = 0; i < newChildren.length; i++) {
                                var child = newChildren[i];
                                knownKeys = warnOnInvalidKey(child, knownKeys);
                            }
                        }
                        var resultingFirstChild = null;
                        var previousNewFiber = null;
                        var oldFiber = currentFirstChild;
                        var lastPlacedIndex = 0;
                        var newIdx = 0;
                        var nextOldFiber = null;
                        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
                            if (oldFiber.index > newIdx) {
                                nextOldFiber = oldFiber;
                                oldFiber = null;
                            } else {
                                nextOldFiber = oldFiber.sibling;
                            }
                            var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
                            if (newFiber === null) {
                                if (oldFiber === null) {
                                    oldFiber = nextOldFiber;
                                }
                                break;
                            }
                            if (shouldTrackSideEffects) {
                                if (oldFiber && newFiber.alternate === null) {
                                    deleteChild(returnFiber, oldFiber);
                                }
                            }
                            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                            if (previousNewFiber === null) {
                                resultingFirstChild = newFiber;
                            } else {
                                previousNewFiber.sibling = newFiber;
                            }
                            previousNewFiber = newFiber;
                            oldFiber = nextOldFiber;
                        }
                        if (newIdx === newChildren.length) {
                            deleteRemainingChildren(returnFiber, oldFiber);
                            return resultingFirstChild;
                        }
                        if (oldFiber === null) {
                            for (; newIdx < newChildren.length; newIdx++) {
                                var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
                                if (!_newFiber) {
                                    continue;
                                }
                                lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);
                                if (previousNewFiber === null) {
                                    resultingFirstChild = _newFiber;
                                } else {
                                    previousNewFiber.sibling = _newFiber;
                                }
                                previousNewFiber = _newFiber;
                            }
                            return resultingFirstChild;
                        }
                        var existingChildren = mapRemainingChildren(returnFiber, oldFiber);
                        for (; newIdx < newChildren.length; newIdx++) {
                            var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);
                            if (_newFiber2) {
                                if (shouldTrackSideEffects) {
                                    if (_newFiber2.alternate !== null) {
                                        existingChildren['delete'](_newFiber2.key === null ? newIdx : _newFiber2.key);
                                    }
                                }
                                lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);
                                if (previousNewFiber === null) {
                                    resultingFirstChild = _newFiber2;
                                } else {
                                    previousNewFiber.sibling = _newFiber2;
                                }
                                previousNewFiber = _newFiber2;
                            }
                        }
                        if (shouldTrackSideEffects) {
                            existingChildren.forEach(function (child) {
                                return deleteChild(returnFiber, child);
                            });
                        }
                        return resultingFirstChild;
                    }
                    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, expirationTime) {
                        var iteratorFn = getIteratorFn(newChildrenIterable);
                        !(typeof iteratorFn === 'function') ? invariant(false, 'An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        {
                            if (typeof newChildrenIterable.entries === 'function') {
                                var possibleMap = newChildrenIterable;
                                if (possibleMap.entries === iteratorFn) {
                                    warning(didWarnAboutMaps, 'Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.%s', getCurrentFiberStackAddendum$1());
                                    didWarnAboutMaps = true;
                                }
                            }
                            var _newChildren = iteratorFn.call(newChildrenIterable);
                            if (_newChildren) {
                                var knownKeys = null;
                                var _step = _newChildren.next();
                                for (; !_step.done; _step = _newChildren.next()) {
                                    var child = _step.value;
                                    knownKeys = warnOnInvalidKey(child, knownKeys);
                                }
                            }
                        }
                        var newChildren = iteratorFn.call(newChildrenIterable);
                        !(newChildren != null) ? invariant(false, 'An iterable object provided no iterator.') : void 0;
                        var resultingFirstChild = null;
                        var previousNewFiber = null;
                        var oldFiber = currentFirstChild;
                        var lastPlacedIndex = 0;
                        var newIdx = 0;
                        var nextOldFiber = null;
                        var step = newChildren.next();
                        for (; oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
                            if (oldFiber.index > newIdx) {
                                nextOldFiber = oldFiber;
                                oldFiber = null;
                            } else {
                                nextOldFiber = oldFiber.sibling;
                            }
                            var newFiber = updateSlot(returnFiber, oldFiber, step.value, expirationTime);
                            if (newFiber === null) {
                                if (!oldFiber) {
                                    oldFiber = nextOldFiber;
                                }
                                break;
                            }
                            if (shouldTrackSideEffects) {
                                if (oldFiber && newFiber.alternate === null) {
                                    deleteChild(returnFiber, oldFiber);
                                }
                            }
                            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                            if (previousNewFiber === null) {
                                resultingFirstChild = newFiber;
                            } else {
                                previousNewFiber.sibling = newFiber;
                            }
                            previousNewFiber = newFiber;
                            oldFiber = nextOldFiber;
                        }
                        if (step.done) {
                            deleteRemainingChildren(returnFiber, oldFiber);
                            return resultingFirstChild;
                        }
                        if (oldFiber === null) {
                            for (; !step.done; newIdx++, step = newChildren.next()) {
                                var _newFiber3 = createChild(returnFiber, step.value, expirationTime);
                                if (_newFiber3 === null) {
                                    continue;
                                }
                                lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx);
                                if (previousNewFiber === null) {
                                    resultingFirstChild = _newFiber3;
                                } else {
                                    previousNewFiber.sibling = _newFiber3;
                                }
                                previousNewFiber = _newFiber3;
                            }
                            return resultingFirstChild;
                        }
                        var existingChildren = mapRemainingChildren(returnFiber, oldFiber);
                        for (; !step.done; newIdx++, step = newChildren.next()) {
                            var _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, expirationTime);
                            if (_newFiber4 !== null) {
                                if (shouldTrackSideEffects) {
                                    if (_newFiber4.alternate !== null) {
                                        existingChildren['delete'](_newFiber4.key === null ? newIdx : _newFiber4.key);
                                    }
                                }
                                lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx);
                                if (previousNewFiber === null) {
                                    resultingFirstChild = _newFiber4;
                                } else {
                                    previousNewFiber.sibling = _newFiber4;
                                }
                                previousNewFiber = _newFiber4;
                            }
                        }
                        if (shouldTrackSideEffects) {
                            existingChildren.forEach(function (child) {
                                return deleteChild(returnFiber, child);
                            });
                        }
                        return resultingFirstChild;
                    }
                    function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
                        if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
                            deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                            var existing = useFiber(currentFirstChild, textContent, expirationTime);
                            existing['return'] = returnFiber;
                            return existing;
                        }
                        deleteRemainingChildren(returnFiber, currentFirstChild);
                        var created = createFiberFromText(textContent, returnFiber.internalContextTag, expirationTime);
                        created['return'] = returnFiber;
                        return created;
                    }
                    function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
                        var key = element.key;
                        var child = currentFirstChild;
                        while (child !== null) {
                            if (child.key === key) {
                                if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.type === element.type) {
                                    deleteRemainingChildren(returnFiber, child.sibling);
                                    var existing = useFiber(child, element.type === REACT_FRAGMENT_TYPE ? element.props.children : element.props, expirationTime);
                                    existing.ref = coerceRef(child, element);
                                    existing['return'] = returnFiber;
                                    {
                                        existing._debugSource = element._source;
                                        existing._debugOwner = element._owner;
                                    }
                                    return existing;
                                } else {
                                    deleteRemainingChildren(returnFiber, child);
                                    break;
                                }
                            } else {
                                deleteChild(returnFiber, child);
                            }
                            child = child.sibling;
                        }
                        if (element.type === REACT_FRAGMENT_TYPE) {
                            var created = createFiberFromFragment(element.props.children, returnFiber.internalContextTag, expirationTime, element.key);
                            created['return'] = returnFiber;
                            return created;
                        } else {
                            var _created7 = createFiberFromElement(element, returnFiber.internalContextTag, expirationTime);
                            _created7.ref = coerceRef(currentFirstChild, element);
                            _created7['return'] = returnFiber;
                            return _created7;
                        }
                    }
                    function reconcileSingleCall(returnFiber, currentFirstChild, call, expirationTime) {
                        var key = call.key;
                        var child = currentFirstChild;
                        while (child !== null) {
                            if (child.key === key) {
                                if (child.tag === CallComponent) {
                                    deleteRemainingChildren(returnFiber, child.sibling);
                                    var existing = useFiber(child, call, expirationTime);
                                    existing['return'] = returnFiber;
                                    return existing;
                                } else {
                                    deleteRemainingChildren(returnFiber, child);
                                    break;
                                }
                            } else {
                                deleteChild(returnFiber, child);
                            }
                            child = child.sibling;
                        }
                        var created = createFiberFromCall(call, returnFiber.internalContextTag, expirationTime);
                        created['return'] = returnFiber;
                        return created;
                    }
                    function reconcileSingleReturn(returnFiber, currentFirstChild, returnNode, expirationTime) {
                        var child = currentFirstChild;
                        if (child !== null) {
                            if (child.tag === ReturnComponent) {
                                deleteRemainingChildren(returnFiber, child.sibling);
                                var existing = useFiber(child, null, expirationTime);
                                existing.type = returnNode.value;
                                existing['return'] = returnFiber;
                                return existing;
                            } else {
                                deleteRemainingChildren(returnFiber, child);
                            }
                        }
                        var created = createFiberFromReturn(returnNode, returnFiber.internalContextTag, expirationTime);
                        created.type = returnNode.value;
                        created['return'] = returnFiber;
                        return created;
                    }
                    function reconcileSinglePortal(returnFiber, currentFirstChild, portal, expirationTime) {
                        var key = portal.key;
                        var child = currentFirstChild;
                        while (child !== null) {
                            if (child.key === key) {
                                if (child.tag === HostPortal && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
                                    deleteRemainingChildren(returnFiber, child.sibling);
                                    var existing = useFiber(child, portal.children || [], expirationTime);
                                    existing['return'] = returnFiber;
                                    return existing;
                                } else {
                                    deleteRemainingChildren(returnFiber, child);
                                    break;
                                }
                            } else {
                                deleteChild(returnFiber, child);
                            }
                            child = child.sibling;
                        }
                        var created = createFiberFromPortal(portal, returnFiber.internalContextTag, expirationTime);
                        created['return'] = returnFiber;
                        return created;
                    }
                    function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
                        if (typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null) {
                            newChild = newChild.props.children;
                        }
                        var isObject = typeof newChild === 'object' && newChild !== null;
                        if (isObject) {
                            switch (newChild.$$typeof) {
                            case REACT_ELEMENT_TYPE:
                                return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));
                            case REACT_CALL_TYPE:
                                return placeSingleChild(reconcileSingleCall(returnFiber, currentFirstChild, newChild, expirationTime));
                            case REACT_RETURN_TYPE:
                                return placeSingleChild(reconcileSingleReturn(returnFiber, currentFirstChild, newChild, expirationTime));
                            case REACT_PORTAL_TYPE:
                                return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
                            }
                        }
                        if (typeof newChild === 'string' || typeof newChild === 'number') {
                            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, expirationTime));
                        }
                        if (isArray$1(newChild)) {
                            return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
                        }
                        if (getIteratorFn(newChild)) {
                            return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
                        }
                        if (isObject) {
                            throwOnInvalidObjectType(returnFiber, newChild);
                        }
                        {
                            if (typeof newChild === 'function') {
                                warnOnFunctionType();
                            }
                        }
                        if (typeof newChild === 'undefined') {
                            switch (returnFiber.tag) {
                            case ClassComponent: {
                                    {
                                        var instance = returnFiber.stateNode;
                                        if (instance.render._isMockFunction) {
                                            break;
                                        }
                                    }
                                }
                            case FunctionalComponent: {
                                    var Component = returnFiber.type;
                                    invariant(false, '%s(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.', Component.displayName || Component.name || 'Component');
                                }
                            }
                        }
                        return deleteRemainingChildren(returnFiber, currentFirstChild);
                    }
                    return reconcileChildFibers;
                }
                var reconcileChildFibers = ChildReconciler(true);
                var mountChildFibers = ChildReconciler(false);
                function cloneChildFibers(current, workInProgress) {
                    !(current === null || workInProgress.child === current.child) ? invariant(false, 'Resuming work not yet implemented.') : void 0;
                    if (workInProgress.child === null) {
                        return;
                    }
                    var currentChild = workInProgress.child;
                    var newChild = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
                    workInProgress.child = newChild;
                    newChild['return'] = workInProgress;
                    while (currentChild.sibling !== null) {
                        currentChild = currentChild.sibling;
                        newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
                        newChild['return'] = workInProgress;
                    }
                    newChild.sibling = null;
                }
                {
                    var warnedAboutStatelessRefs = {};
                }
                var ReactFiberBeginWork = function (config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber) {
                    var shouldSetTextContent = config.shouldSetTextContent, useSyncScheduling = config.useSyncScheduling, shouldDeprioritizeSubtree = config.shouldDeprioritizeSubtree;
                    var pushHostContext = hostContext.pushHostContext, pushHostContainer = hostContext.pushHostContainer;
                    var enterHydrationState = hydrationContext.enterHydrationState, resetHydrationState = hydrationContext.resetHydrationState, tryToClaimNextHydratableInstance = hydrationContext.tryToClaimNextHydratableInstance;
                    var _ReactFiberClassCompo = ReactFiberClassComponent(scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState), adoptClassInstance = _ReactFiberClassCompo.adoptClassInstance, constructClassInstance = _ReactFiberClassCompo.constructClassInstance, mountClassInstance = _ReactFiberClassCompo.mountClassInstance, updateClassInstance = _ReactFiberClassCompo.updateClassInstance;
                    function reconcileChildren(current, workInProgress, nextChildren) {
                        reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, workInProgress.expirationTime);
                    }
                    function reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, renderExpirationTime) {
                        if (current === null) {
                            workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
                        } else {
                            workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderExpirationTime);
                        }
                    }
                    function updateFragment(current, workInProgress) {
                        var nextChildren = workInProgress.pendingProps;
                        if (hasContextChanged()) {
                            if (nextChildren === null) {
                                nextChildren = workInProgress.memoizedProps;
                            }
                        } else if (nextChildren === null || workInProgress.memoizedProps === nextChildren) {
                            return bailoutOnAlreadyFinishedWork(current, workInProgress);
                        }
                        reconcileChildren(current, workInProgress, nextChildren);
                        memoizeProps(workInProgress, nextChildren);
                        return workInProgress.child;
                    }
                    function markRef(current, workInProgress) {
                        var ref = workInProgress.ref;
                        if (ref !== null && (!current || current.ref !== ref)) {
                            workInProgress.effectTag |= Ref;
                        }
                    }
                    function updateFunctionalComponent(current, workInProgress) {
                        var fn = workInProgress.type;
                        var nextProps = workInProgress.pendingProps;
                        var memoizedProps = workInProgress.memoizedProps;
                        if (hasContextChanged()) {
                            if (nextProps === null) {
                                nextProps = memoizedProps;
                            }
                        } else {
                            if (nextProps === null || memoizedProps === nextProps) {
                                return bailoutOnAlreadyFinishedWork(current, workInProgress);
                            }
                        }
                        var unmaskedContext = getUnmaskedContext(workInProgress);
                        var context = getMaskedContext(workInProgress, unmaskedContext);
                        var nextChildren;
                        {
                            ReactCurrentOwner.current = workInProgress;
                            ReactDebugCurrentFiber.setCurrentPhase('render');
                            nextChildren = fn(nextProps, context);
                            ReactDebugCurrentFiber.setCurrentPhase(null);
                        }
                        workInProgress.effectTag |= PerformedWork;
                        reconcileChildren(current, workInProgress, nextChildren);
                        memoizeProps(workInProgress, nextProps);
                        return workInProgress.child;
                    }
                    function updateClassComponent(current, workInProgress, renderExpirationTime) {
                        var hasContext = pushContextProvider(workInProgress);
                        var shouldUpdate = void 0;
                        if (current === null) {
                            if (!workInProgress.stateNode) {
                                constructClassInstance(workInProgress, workInProgress.pendingProps);
                                mountClassInstance(workInProgress, renderExpirationTime);
                                shouldUpdate = true;
                            } else {
                                invariant(false, 'Resuming work not yet implemented.');
                            }
                        } else {
                            shouldUpdate = updateClassInstance(current, workInProgress, renderExpirationTime);
                        }
                        return finishClassComponent(current, workInProgress, shouldUpdate, hasContext);
                    }
                    function finishClassComponent(current, workInProgress, shouldUpdate, hasContext) {
                        markRef(current, workInProgress);
                        if (!shouldUpdate) {
                            if (hasContext) {
                                invalidateContextProvider(workInProgress, false);
                            }
                            return bailoutOnAlreadyFinishedWork(current, workInProgress);
                        }
                        var instance = workInProgress.stateNode;
                        ReactCurrentOwner.current = workInProgress;
                        var nextChildren = void 0;
                        {
                            ReactDebugCurrentFiber.setCurrentPhase('render');
                            nextChildren = instance.render();
                            if (debugRenderPhaseSideEffects) {
                                instance.render();
                            }
                            ReactDebugCurrentFiber.setCurrentPhase(null);
                        }
                        workInProgress.effectTag |= PerformedWork;
                        reconcileChildren(current, workInProgress, nextChildren);
                        memoizeState(workInProgress, instance.state);
                        memoizeProps(workInProgress, instance.props);
                        if (hasContext) {
                            invalidateContextProvider(workInProgress, true);
                        }
                        return workInProgress.child;
                    }
                    function pushHostRootContext(workInProgress) {
                        var root = workInProgress.stateNode;
                        if (root.pendingContext) {
                            pushTopLevelContextObject(workInProgress, root.pendingContext, root.pendingContext !== root.context);
                        } else if (root.context) {
                            pushTopLevelContextObject(workInProgress, root.context, false);
                        }
                        pushHostContainer(workInProgress, root.containerInfo);
                    }
                    function updateHostRoot(current, workInProgress, renderExpirationTime) {
                        pushHostRootContext(workInProgress);
                        var updateQueue = workInProgress.updateQueue;
                        if (updateQueue !== null) {
                            var prevState = workInProgress.memoizedState;
                            var state = processUpdateQueue(current, workInProgress, updateQueue, null, null, renderExpirationTime);
                            if (prevState === state) {
                                resetHydrationState();
                                return bailoutOnAlreadyFinishedWork(current, workInProgress);
                            }
                            var element = state.element;
                            var root = workInProgress.stateNode;
                            if ((current === null || current.child === null) && root.hydrate && enterHydrationState(workInProgress)) {
                                workInProgress.effectTag |= Placement;
                                workInProgress.child = mountChildFibers(workInProgress, null, element, renderExpirationTime);
                            } else {
                                resetHydrationState();
                                reconcileChildren(current, workInProgress, element);
                            }
                            memoizeState(workInProgress, state);
                            return workInProgress.child;
                        }
                        resetHydrationState();
                        return bailoutOnAlreadyFinishedWork(current, workInProgress);
                    }
                    function updateHostComponent(current, workInProgress, renderExpirationTime) {
                        pushHostContext(workInProgress);
                        if (current === null) {
                            tryToClaimNextHydratableInstance(workInProgress);
                        }
                        var type = workInProgress.type;
                        var memoizedProps = workInProgress.memoizedProps;
                        var nextProps = workInProgress.pendingProps;
                        if (nextProps === null) {
                            nextProps = memoizedProps;
                            !(nextProps !== null) ? invariant(false, 'We should always have pending or current props. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        }
                        var prevProps = current !== null ? current.memoizedProps : null;
                        if (hasContextChanged()) {
                        } else if (nextProps === null || memoizedProps === nextProps) {
                            return bailoutOnAlreadyFinishedWork(current, workInProgress);
                        }
                        var nextChildren = nextProps.children;
                        var isDirectTextChild = shouldSetTextContent(type, nextProps);
                        if (isDirectTextChild) {
                            nextChildren = null;
                        } else if (prevProps && shouldSetTextContent(type, prevProps)) {
                            workInProgress.effectTag |= ContentReset;
                        }
                        markRef(current, workInProgress);
                        if (renderExpirationTime !== Never && !useSyncScheduling && shouldDeprioritizeSubtree(type, nextProps)) {
                            workInProgress.expirationTime = Never;
                            return null;
                        }
                        reconcileChildren(current, workInProgress, nextChildren);
                        memoizeProps(workInProgress, nextProps);
                        return workInProgress.child;
                    }
                    function updateHostText(current, workInProgress) {
                        if (current === null) {
                            tryToClaimNextHydratableInstance(workInProgress);
                        }
                        var nextProps = workInProgress.pendingProps;
                        if (nextProps === null) {
                            nextProps = workInProgress.memoizedProps;
                        }
                        memoizeProps(workInProgress, nextProps);
                        return null;
                    }
                    function mountIndeterminateComponent(current, workInProgress, renderExpirationTime) {
                        !(current === null) ? invariant(false, 'An indeterminate component should never have mounted. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        var fn = workInProgress.type;
                        var props = workInProgress.pendingProps;
                        var unmaskedContext = getUnmaskedContext(workInProgress);
                        var context = getMaskedContext(workInProgress, unmaskedContext);
                        var value;
                        {
                            if (fn.prototype && typeof fn.prototype.render === 'function') {
                                var componentName = getComponentName(workInProgress);
                                warning(false, 'The <%s /> component appears to have a render method, but doesn\'t extend React.Component. ' + 'This is likely to cause errors. Change %s to extend React.Component instead.', componentName, componentName);
                            }
                            ReactCurrentOwner.current = workInProgress;
                            value = fn(props, context);
                        }
                        workInProgress.effectTag |= PerformedWork;
                        if (typeof value === 'object' && value !== null && typeof value.render === 'function') {
                            workInProgress.tag = ClassComponent;
                            var hasContext = pushContextProvider(workInProgress);
                            adoptClassInstance(workInProgress, value);
                            mountClassInstance(workInProgress, renderExpirationTime);
                            return finishClassComponent(current, workInProgress, true, hasContext);
                        } else {
                            workInProgress.tag = FunctionalComponent;
                            {
                                var Component = workInProgress.type;
                                if (Component) {
                                    warning(!Component.childContextTypes, '%s(...): childContextTypes cannot be defined on a functional component.', Component.displayName || Component.name || 'Component');
                                }
                                if (workInProgress.ref !== null) {
                                    var info = '';
                                    var ownerName = ReactDebugCurrentFiber.getCurrentFiberOwnerName();
                                    if (ownerName) {
                                        info += '\n\nCheck the render method of `' + ownerName + '`.';
                                    }
                                    var warningKey = ownerName || workInProgress._debugID || '';
                                    var debugSource = workInProgress._debugSource;
                                    if (debugSource) {
                                        warningKey = debugSource.fileName + ':' + debugSource.lineNumber;
                                    }
                                    if (!warnedAboutStatelessRefs[warningKey]) {
                                        warnedAboutStatelessRefs[warningKey] = true;
                                        warning(false, 'Stateless function components cannot be given refs. ' + 'Attempts to access this ref will fail.%s%s', info, ReactDebugCurrentFiber.getCurrentFiberStackAddendum());
                                    }
                                }
                            }
                            reconcileChildren(current, workInProgress, value);
                            memoizeProps(workInProgress, props);
                            return workInProgress.child;
                        }
                    }
                    function updateCallComponent(current, workInProgress, renderExpirationTime) {
                        var nextCall = workInProgress.pendingProps;
                        if (hasContextChanged()) {
                            if (nextCall === null) {
                                nextCall = current && current.memoizedProps;
                                !(nextCall !== null) ? invariant(false, 'We should always have pending or current props. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                            }
                        } else if (nextCall === null || workInProgress.memoizedProps === nextCall) {
                            nextCall = workInProgress.memoizedProps;
                        }
                        var nextChildren = nextCall.children;
                        if (current === null) {
                            workInProgress.stateNode = mountChildFibers(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime);
                        } else {
                            workInProgress.stateNode = reconcileChildFibers(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime);
                        }
                        memoizeProps(workInProgress, nextCall);
                        return workInProgress.stateNode;
                    }
                    function updatePortalComponent(current, workInProgress, renderExpirationTime) {
                        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
                        var nextChildren = workInProgress.pendingProps;
                        if (hasContextChanged()) {
                            if (nextChildren === null) {
                                nextChildren = current && current.memoizedProps;
                                !(nextChildren != null) ? invariant(false, 'We should always have pending or current props. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                            }
                        } else if (nextChildren === null || workInProgress.memoizedProps === nextChildren) {
                            return bailoutOnAlreadyFinishedWork(current, workInProgress);
                        }
                        if (current === null) {
                            workInProgress.child = reconcileChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
                            memoizeProps(workInProgress, nextChildren);
                        } else {
                            reconcileChildren(current, workInProgress, nextChildren);
                            memoizeProps(workInProgress, nextChildren);
                        }
                        return workInProgress.child;
                    }
                    function bailoutOnAlreadyFinishedWork(current, workInProgress) {
                        cancelWorkTimer(workInProgress);
                        cloneChildFibers(current, workInProgress);
                        return workInProgress.child;
                    }
                    function bailoutOnLowPriority(current, workInProgress) {
                        cancelWorkTimer(workInProgress);
                        switch (workInProgress.tag) {
                        case HostRoot:
                            pushHostRootContext(workInProgress);
                            break;
                        case ClassComponent:
                            pushContextProvider(workInProgress);
                            break;
                        case HostPortal:
                            pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
                            break;
                        }
                        return null;
                    }
                    function memoizeProps(workInProgress, nextProps) {
                        workInProgress.memoizedProps = nextProps;
                    }
                    function memoizeState(workInProgress, nextState) {
                        workInProgress.memoizedState = nextState;
                    }
                    function beginWork(current, workInProgress, renderExpirationTime) {
                        if (workInProgress.expirationTime === NoWork || workInProgress.expirationTime > renderExpirationTime) {
                            return bailoutOnLowPriority(current, workInProgress);
                        }
                        switch (workInProgress.tag) {
                        case IndeterminateComponent:
                            return mountIndeterminateComponent(current, workInProgress, renderExpirationTime);
                        case FunctionalComponent:
                            return updateFunctionalComponent(current, workInProgress);
                        case ClassComponent:
                            return updateClassComponent(current, workInProgress, renderExpirationTime);
                        case HostRoot:
                            return updateHostRoot(current, workInProgress, renderExpirationTime);
                        case HostComponent:
                            return updateHostComponent(current, workInProgress, renderExpirationTime);
                        case HostText:
                            return updateHostText(current, workInProgress);
                        case CallHandlerPhase:
                            workInProgress.tag = CallComponent;
                        case CallComponent:
                            return updateCallComponent(current, workInProgress, renderExpirationTime);
                        case ReturnComponent:
                            return null;
                        case HostPortal:
                            return updatePortalComponent(current, workInProgress, renderExpirationTime);
                        case Fragment:
                            return updateFragment(current, workInProgress);
                        default:
                            invariant(false, 'Unknown unit of work tag. This error is likely caused by a bug in React. Please file an issue.');
                        }
                    }
                    function beginFailedWork(current, workInProgress, renderExpirationTime) {
                        switch (workInProgress.tag) {
                        case ClassComponent:
                            pushContextProvider(workInProgress);
                            break;
                        case HostRoot:
                            pushHostRootContext(workInProgress);
                            break;
                        default:
                            invariant(false, 'Invalid type of work. This error is likely caused by a bug in React. Please file an issue.');
                        }
                        workInProgress.effectTag |= Err;
                        if (current === null) {
                            workInProgress.child = null;
                        } else if (workInProgress.child !== current.child) {
                            workInProgress.child = current.child;
                        }
                        if (workInProgress.expirationTime === NoWork || workInProgress.expirationTime > renderExpirationTime) {
                            return bailoutOnLowPriority(current, workInProgress);
                        }
                        workInProgress.firstEffect = null;
                        workInProgress.lastEffect = null;
                        var nextChildren = null;
                        reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, renderExpirationTime);
                        if (workInProgress.tag === ClassComponent) {
                            var instance = workInProgress.stateNode;
                            workInProgress.memoizedProps = instance.props;
                            workInProgress.memoizedState = instance.state;
                        }
                        return workInProgress.child;
                    }
                    return {
                        beginWork: beginWork,
                        beginFailedWork: beginFailedWork
                    };
                };
                var ReactFiberCompleteWork = function (config, hostContext, hydrationContext) {
                    var createInstance = config.createInstance, createTextInstance = config.createTextInstance, appendInitialChild = config.appendInitialChild, finalizeInitialChildren = config.finalizeInitialChildren, prepareUpdate = config.prepareUpdate, mutation = config.mutation, persistence = config.persistence;
                    var getRootHostContainer = hostContext.getRootHostContainer, popHostContext = hostContext.popHostContext, getHostContext = hostContext.getHostContext, popHostContainer = hostContext.popHostContainer;
                    var prepareToHydrateHostInstance = hydrationContext.prepareToHydrateHostInstance, prepareToHydrateHostTextInstance = hydrationContext.prepareToHydrateHostTextInstance, popHydrationState = hydrationContext.popHydrationState;
                    function markUpdate(workInProgress) {
                        workInProgress.effectTag |= Update;
                    }
                    function markRef(workInProgress) {
                        workInProgress.effectTag |= Ref;
                    }
                    function appendAllReturns(returns, workInProgress) {
                        var node = workInProgress.stateNode;
                        if (node) {
                            node['return'] = workInProgress;
                        }
                        while (node !== null) {
                            if (node.tag === HostComponent || node.tag === HostText || node.tag === HostPortal) {
                                invariant(false, 'A call cannot have host component children.');
                            } else if (node.tag === ReturnComponent) {
                                returns.push(node.type);
                            } else if (node.child !== null) {
                                node.child['return'] = node;
                                node = node.child;
                                continue;
                            }
                            while (node.sibling === null) {
                                if (node['return'] === null || node['return'] === workInProgress) {
                                    return;
                                }
                                node = node['return'];
                            }
                            node.sibling['return'] = node['return'];
                            node = node.sibling;
                        }
                    }
                    function moveCallToHandlerPhase(current, workInProgress, renderExpirationTime) {
                        var call = workInProgress.memoizedProps;
                        !call ? invariant(false, 'Should be resolved by now. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        workInProgress.tag = CallHandlerPhase;
                        var returns = [];
                        appendAllReturns(returns, workInProgress);
                        var fn = call.handler;
                        var props = call.props;
                        var nextChildren = fn(props, returns);
                        var currentFirstChild = current !== null ? current.child : null;
                        workInProgress.child = reconcileChildFibers(workInProgress, currentFirstChild, nextChildren, renderExpirationTime);
                        return workInProgress.child;
                    }
                    function appendAllChildren(parent, workInProgress) {
                        var node = workInProgress.child;
                        while (node !== null) {
                            if (node.tag === HostComponent || node.tag === HostText) {
                                appendInitialChild(parent, node.stateNode);
                            } else if (node.tag === HostPortal) {
                            } else if (node.child !== null) {
                                node.child['return'] = node;
                                node = node.child;
                                continue;
                            }
                            if (node === workInProgress) {
                                return;
                            }
                            while (node.sibling === null) {
                                if (node['return'] === null || node['return'] === workInProgress) {
                                    return;
                                }
                                node = node['return'];
                            }
                            node.sibling['return'] = node['return'];
                            node = node.sibling;
                        }
                    }
                    var updateHostContainer = void 0;
                    var updateHostComponent = void 0;
                    var updateHostText = void 0;
                    if (mutation) {
                        if (enableMutatingReconciler) {
                            updateHostContainer = function (workInProgress) {
                            };
                            updateHostComponent = function (current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
                                workInProgress.updateQueue = updatePayload;
                                if (updatePayload) {
                                    markUpdate(workInProgress);
                                }
                            };
                            updateHostText = function (current, workInProgress, oldText, newText) {
                                if (oldText !== newText) {
                                    markUpdate(workInProgress);
                                }
                            };
                        } else {
                            invariant(false, 'Mutating reconciler is disabled.');
                        }
                    } else if (persistence) {
                        if (enablePersistentReconciler) {
                            var cloneInstance = persistence.cloneInstance, createContainerChildSet = persistence.createContainerChildSet, appendChildToContainerChildSet = persistence.appendChildToContainerChildSet, finalizeContainerChildren = persistence.finalizeContainerChildren;
                            var appendAllChildrenToContainer = function (containerChildSet, workInProgress) {
                                var node = workInProgress.child;
                                while (node !== null) {
                                    if (node.tag === HostComponent || node.tag === HostText) {
                                        appendChildToContainerChildSet(containerChildSet, node.stateNode);
                                    } else if (node.tag === HostPortal) {
                                    } else if (node.child !== null) {
                                        node.child['return'] = node;
                                        node = node.child;
                                        continue;
                                    }
                                    if (node === workInProgress) {
                                        return;
                                    }
                                    while (node.sibling === null) {
                                        if (node['return'] === null || node['return'] === workInProgress) {
                                            return;
                                        }
                                        node = node['return'];
                                    }
                                    node.sibling['return'] = node['return'];
                                    node = node.sibling;
                                }
                            };
                            updateHostContainer = function (workInProgress) {
                                var portalOrRoot = workInProgress.stateNode;
                                var childrenUnchanged = workInProgress.firstEffect === null;
                                if (childrenUnchanged) {
                                } else {
                                    var container = portalOrRoot.containerInfo;
                                    var newChildSet = createContainerChildSet(container);
                                    if (finalizeContainerChildren(container, newChildSet)) {
                                        markUpdate(workInProgress);
                                    }
                                    portalOrRoot.pendingChildren = newChildSet;
                                    appendAllChildrenToContainer(newChildSet, workInProgress);
                                    markUpdate(workInProgress);
                                }
                            };
                            updateHostComponent = function (current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
                                var childrenUnchanged = workInProgress.firstEffect === null;
                                var currentInstance = current.stateNode;
                                if (childrenUnchanged && updatePayload === null) {
                                    workInProgress.stateNode = currentInstance;
                                } else {
                                    var recyclableInstance = workInProgress.stateNode;
                                    var newInstance = cloneInstance(currentInstance, updatePayload, type, oldProps, newProps, workInProgress, childrenUnchanged, recyclableInstance);
                                    if (finalizeInitialChildren(newInstance, type, newProps, rootContainerInstance)) {
                                        markUpdate(workInProgress);
                                    }
                                    workInProgress.stateNode = newInstance;
                                    if (childrenUnchanged) {
                                        markUpdate(workInProgress);
                                    } else {
                                        appendAllChildren(newInstance, workInProgress);
                                    }
                                }
                            };
                            updateHostText = function (current, workInProgress, oldText, newText) {
                                if (oldText !== newText) {
                                    var rootContainerInstance = getRootHostContainer();
                                    var currentHostContext = getHostContext();
                                    workInProgress.stateNode = createTextInstance(newText, rootContainerInstance, currentHostContext, workInProgress);
                                    markUpdate(workInProgress);
                                }
                            };
                        } else {
                            invariant(false, 'Persistent reconciler is disabled.');
                        }
                    } else {
                        if (enableNoopReconciler) {
                            updateHostContainer = function (workInProgress) {
                            };
                            updateHostComponent = function (current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance) {
                            };
                            updateHostText = function (current, workInProgress, oldText, newText) {
                            };
                        } else {
                            invariant(false, 'Noop reconciler is disabled.');
                        }
                    }
                    function completeWork(current, workInProgress, renderExpirationTime) {
                        var newProps = workInProgress.pendingProps;
                        if (newProps === null) {
                            newProps = workInProgress.memoizedProps;
                        } else if (workInProgress.expirationTime !== Never || renderExpirationTime === Never) {
                            workInProgress.pendingProps = null;
                        }
                        switch (workInProgress.tag) {
                        case FunctionalComponent:
                            return null;
                        case ClassComponent: {
                                popContextProvider(workInProgress);
                                return null;
                            }
                        case HostRoot: {
                                popHostContainer(workInProgress);
                                popTopLevelContextObject(workInProgress);
                                var fiberRoot = workInProgress.stateNode;
                                if (fiberRoot.pendingContext) {
                                    fiberRoot.context = fiberRoot.pendingContext;
                                    fiberRoot.pendingContext = null;
                                }
                                if (current === null || current.child === null) {
                                    popHydrationState(workInProgress);
                                    workInProgress.effectTag &= ~Placement;
                                }
                                updateHostContainer(workInProgress);
                                return null;
                            }
                        case HostComponent: {
                                popHostContext(workInProgress);
                                var rootContainerInstance = getRootHostContainer();
                                var type = workInProgress.type;
                                if (current !== null && workInProgress.stateNode != null) {
                                    var oldProps = current.memoizedProps;
                                    var instance = workInProgress.stateNode;
                                    var currentHostContext = getHostContext();
                                    var updatePayload = prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);
                                    updateHostComponent(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance);
                                    if (current.ref !== workInProgress.ref) {
                                        markRef(workInProgress);
                                    }
                                } else {
                                    if (!newProps) {
                                        !(workInProgress.stateNode !== null) ? invariant(false, 'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                        return null;
                                    }
                                    var _currentHostContext = getHostContext();
                                    var wasHydrated = popHydrationState(workInProgress);
                                    if (wasHydrated) {
                                        if (prepareToHydrateHostInstance(workInProgress, rootContainerInstance, _currentHostContext)) {
                                            markUpdate(workInProgress);
                                        }
                                    } else {
                                        var _instance = createInstance(type, newProps, rootContainerInstance, _currentHostContext, workInProgress);
                                        appendAllChildren(_instance, workInProgress);
                                        if (finalizeInitialChildren(_instance, type, newProps, rootContainerInstance)) {
                                            markUpdate(workInProgress);
                                        }
                                        workInProgress.stateNode = _instance;
                                    }
                                    if (workInProgress.ref !== null) {
                                        markRef(workInProgress);
                                    }
                                }
                                return null;
                            }
                        case HostText: {
                                var newText = newProps;
                                if (current && workInProgress.stateNode != null) {
                                    var oldText = current.memoizedProps;
                                    updateHostText(current, workInProgress, oldText, newText);
                                } else {
                                    if (typeof newText !== 'string') {
                                        !(workInProgress.stateNode !== null) ? invariant(false, 'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                        return null;
                                    }
                                    var _rootContainerInstance = getRootHostContainer();
                                    var _currentHostContext2 = getHostContext();
                                    var _wasHydrated = popHydrationState(workInProgress);
                                    if (_wasHydrated) {
                                        if (prepareToHydrateHostTextInstance(workInProgress)) {
                                            markUpdate(workInProgress);
                                        }
                                    } else {
                                        workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext2, workInProgress);
                                    }
                                }
                                return null;
                            }
                        case CallComponent:
                            return moveCallToHandlerPhase(current, workInProgress, renderExpirationTime);
                        case CallHandlerPhase:
                            workInProgress.tag = CallComponent;
                            return null;
                        case ReturnComponent:
                            return null;
                        case Fragment:
                            return null;
                        case HostPortal:
                            popHostContainer(workInProgress);
                            updateHostContainer(workInProgress);
                            return null;
                        case IndeterminateComponent:
                            invariant(false, 'An indeterminate component should have become determinate before completing. This error is likely caused by a bug in React. Please file an issue.');
                        default:
                            invariant(false, 'Unknown unit of work tag. This error is likely caused by a bug in React. Please file an issue.');
                        }
                    }
                    return { completeWork: completeWork };
                };
                var invokeGuardedCallback$2 = ReactErrorUtils.invokeGuardedCallback;
                var hasCaughtError$1 = ReactErrorUtils.hasCaughtError;
                var clearCaughtError$1 = ReactErrorUtils.clearCaughtError;
                var ReactFiberCommitWork = function (config, captureError) {
                    var getPublicInstance = config.getPublicInstance, mutation = config.mutation, persistence = config.persistence;
                    var callComponentWillUnmountWithTimer = function (current, instance) {
                        startPhaseTimer(current, 'componentWillUnmount');
                        instance.props = current.memoizedProps;
                        instance.state = current.memoizedState;
                        instance.componentWillUnmount();
                        stopPhaseTimer();
                    };
                    function safelyCallComponentWillUnmount(current, instance) {
                        {
                            invokeGuardedCallback$2(null, callComponentWillUnmountWithTimer, null, current, instance);
                            if (hasCaughtError$1()) {
                                var unmountError = clearCaughtError$1();
                                captureError(current, unmountError);
                            }
                        }
                    }
                    function safelyDetachRef(current) {
                        var ref = current.ref;
                        if (ref !== null) {
                            {
                                invokeGuardedCallback$2(null, ref, null, null);
                                if (hasCaughtError$1()) {
                                    var refError = clearCaughtError$1();
                                    captureError(current, refError);
                                }
                            }
                        }
                    }
                    function commitLifeCycles(current, finishedWork) {
                        switch (finishedWork.tag) {
                        case ClassComponent: {
                                var instance = finishedWork.stateNode;
                                if (finishedWork.effectTag & Update) {
                                    if (current === null) {
                                        startPhaseTimer(finishedWork, 'componentDidMount');
                                        instance.props = finishedWork.memoizedProps;
                                        instance.state = finishedWork.memoizedState;
                                        instance.componentDidMount();
                                        stopPhaseTimer();
                                    } else {
                                        var prevProps = current.memoizedProps;
                                        var prevState = current.memoizedState;
                                        startPhaseTimer(finishedWork, 'componentDidUpdate');
                                        instance.props = finishedWork.memoizedProps;
                                        instance.state = finishedWork.memoizedState;
                                        instance.componentDidUpdate(prevProps, prevState);
                                        stopPhaseTimer();
                                    }
                                }
                                var updateQueue = finishedWork.updateQueue;
                                if (updateQueue !== null) {
                                    commitCallbacks(updateQueue, instance);
                                }
                                return;
                            }
                        case HostRoot: {
                                var _updateQueue = finishedWork.updateQueue;
                                if (_updateQueue !== null) {
                                    var _instance = finishedWork.child !== null ? finishedWork.child.stateNode : null;
                                    commitCallbacks(_updateQueue, _instance);
                                }
                                return;
                            }
                        case HostComponent: {
                                var _instance2 = finishedWork.stateNode;
                                if (current === null && finishedWork.effectTag & Update) {
                                    var type = finishedWork.type;
                                    var props = finishedWork.memoizedProps;
                                    commitMount(_instance2, type, props, finishedWork);
                                }
                                return;
                            }
                        case HostText: {
                                return;
                            }
                        case HostPortal: {
                                return;
                            }
                        default: {
                                invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
                            }
                        }
                    }
                    function commitAttachRef(finishedWork) {
                        var ref = finishedWork.ref;
                        if (ref !== null) {
                            var instance = finishedWork.stateNode;
                            switch (finishedWork.tag) {
                            case HostComponent:
                                ref(getPublicInstance(instance));
                                break;
                            default:
                                ref(instance);
                            }
                        }
                    }
                    function commitDetachRef(current) {
                        var currentRef = current.ref;
                        if (currentRef !== null) {
                            currentRef(null);
                        }
                    }
                    function commitUnmount(current) {
                        if (typeof onCommitUnmount === 'function') {
                            onCommitUnmount(current);
                        }
                        switch (current.tag) {
                        case ClassComponent: {
                                safelyDetachRef(current);
                                var instance = current.stateNode;
                                if (typeof instance.componentWillUnmount === 'function') {
                                    safelyCallComponentWillUnmount(current, instance);
                                }
                                return;
                            }
                        case HostComponent: {
                                safelyDetachRef(current);
                                return;
                            }
                        case CallComponent: {
                                commitNestedUnmounts(current.stateNode);
                                return;
                            }
                        case HostPortal: {
                                if (enableMutatingReconciler && mutation) {
                                    unmountHostComponents(current);
                                } else if (enablePersistentReconciler && persistence) {
                                    emptyPortalContainer(current);
                                }
                                return;
                            }
                        }
                    }
                    function commitNestedUnmounts(root) {
                        var node = root;
                        while (true) {
                            commitUnmount(node);
                            if (node.child !== null && (!mutation || node.tag !== HostPortal)) {
                                node.child['return'] = node;
                                node = node.child;
                                continue;
                            }
                            if (node === root) {
                                return;
                            }
                            while (node.sibling === null) {
                                if (node['return'] === null || node['return'] === root) {
                                    return;
                                }
                                node = node['return'];
                            }
                            node.sibling['return'] = node['return'];
                            node = node.sibling;
                        }
                    }
                    function detachFiber(current) {
                        current['return'] = null;
                        current.child = null;
                        if (current.alternate) {
                            current.alternate.child = null;
                            current.alternate['return'] = null;
                        }
                    }
                    if (!mutation) {
                        var commitContainer = void 0;
                        if (persistence) {
                            var replaceContainerChildren = persistence.replaceContainerChildren, createContainerChildSet = persistence.createContainerChildSet;
                            var emptyPortalContainer = function (current) {
                                var portal = current.stateNode;
                                var containerInfo = portal.containerInfo;
                                var emptyChildSet = createContainerChildSet(containerInfo);
                                replaceContainerChildren(containerInfo, emptyChildSet);
                            };
                            commitContainer = function (finishedWork) {
                                switch (finishedWork.tag) {
                                case ClassComponent: {
                                        return;
                                    }
                                case HostComponent: {
                                        return;
                                    }
                                case HostText: {
                                        return;
                                    }
                                case HostRoot:
                                case HostPortal: {
                                        var portalOrRoot = finishedWork.stateNode;
                                        var containerInfo = portalOrRoot.containerInfo, _pendingChildren = portalOrRoot.pendingChildren;
                                        replaceContainerChildren(containerInfo, _pendingChildren);
                                        return;
                                    }
                                default: {
                                        invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
                                    }
                                }
                            };
                        } else {
                            commitContainer = function (finishedWork) {
                            };
                        }
                        if (enablePersistentReconciler || enableNoopReconciler) {
                            return {
                                commitResetTextContent: function (finishedWork) {
                                },
                                commitPlacement: function (finishedWork) {
                                },
                                commitDeletion: function (current) {
                                    commitNestedUnmounts(current);
                                    detachFiber(current);
                                },
                                commitWork: function (current, finishedWork) {
                                    commitContainer(finishedWork);
                                },
                                commitLifeCycles: commitLifeCycles,
                                commitAttachRef: commitAttachRef,
                                commitDetachRef: commitDetachRef
                            };
                        } else if (persistence) {
                            invariant(false, 'Persistent reconciler is disabled.');
                        } else {
                            invariant(false, 'Noop reconciler is disabled.');
                        }
                    }
                    var commitMount = mutation.commitMount, commitUpdate = mutation.commitUpdate, resetTextContent = mutation.resetTextContent, commitTextUpdate = mutation.commitTextUpdate, appendChild = mutation.appendChild, appendChildToContainer = mutation.appendChildToContainer, insertBefore = mutation.insertBefore, insertInContainerBefore = mutation.insertInContainerBefore, removeChild = mutation.removeChild, removeChildFromContainer = mutation.removeChildFromContainer;
                    function getHostParentFiber(fiber) {
                        var parent = fiber['return'];
                        while (parent !== null) {
                            if (isHostParent(parent)) {
                                return parent;
                            }
                            parent = parent['return'];
                        }
                        invariant(false, 'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.');
                    }
                    function isHostParent(fiber) {
                        return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal;
                    }
                    function getHostSibling(fiber) {
                        var node = fiber;
                        siblings:
                            while (true) {
                                while (node.sibling === null) {
                                    if (node['return'] === null || isHostParent(node['return'])) {
                                        return null;
                                    }
                                    node = node['return'];
                                }
                                node.sibling['return'] = node['return'];
                                node = node.sibling;
                                while (node.tag !== HostComponent && node.tag !== HostText) {
                                    if (node.effectTag & Placement) {
                                        continue siblings;
                                    }
                                    if (node.child === null || node.tag === HostPortal) {
                                        continue siblings;
                                    } else {
                                        node.child['return'] = node;
                                        node = node.child;
                                    }
                                }
                                if (!(node.effectTag & Placement)) {
                                    return node.stateNode;
                                }
                            }
                    }
                    function commitPlacement(finishedWork) {
                        var parentFiber = getHostParentFiber(finishedWork);
                        var parent = void 0;
                        var isContainer = void 0;
                        switch (parentFiber.tag) {
                        case HostComponent:
                            parent = parentFiber.stateNode;
                            isContainer = false;
                            break;
                        case HostRoot:
                            parent = parentFiber.stateNode.containerInfo;
                            isContainer = true;
                            break;
                        case HostPortal:
                            parent = parentFiber.stateNode.containerInfo;
                            isContainer = true;
                            break;
                        default:
                            invariant(false, 'Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.');
                        }
                        if (parentFiber.effectTag & ContentReset) {
                            resetTextContent(parent);
                            parentFiber.effectTag &= ~ContentReset;
                        }
                        var before = getHostSibling(finishedWork);
                        var node = finishedWork;
                        while (true) {
                            if (node.tag === HostComponent || node.tag === HostText) {
                                if (before) {
                                    if (isContainer) {
                                        insertInContainerBefore(parent, node.stateNode, before);
                                    } else {
                                        insertBefore(parent, node.stateNode, before);
                                    }
                                } else {
                                    if (isContainer) {
                                        appendChildToContainer(parent, node.stateNode);
                                    } else {
                                        appendChild(parent, node.stateNode);
                                    }
                                }
                            } else if (node.tag === HostPortal) {
                            } else if (node.child !== null) {
                                node.child['return'] = node;
                                node = node.child;
                                continue;
                            }
                            if (node === finishedWork) {
                                return;
                            }
                            while (node.sibling === null) {
                                if (node['return'] === null || node['return'] === finishedWork) {
                                    return;
                                }
                                node = node['return'];
                            }
                            node.sibling['return'] = node['return'];
                            node = node.sibling;
                        }
                    }
                    function unmountHostComponents(current) {
                        var node = current;
                        var currentParentIsValid = false;
                        var currentParent = void 0;
                        var currentParentIsContainer = void 0;
                        while (true) {
                            if (!currentParentIsValid) {
                                var parent = node['return'];
                                findParent:
                                    while (true) {
                                        !(parent !== null) ? invariant(false, 'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                        switch (parent.tag) {
                                        case HostComponent:
                                            currentParent = parent.stateNode;
                                            currentParentIsContainer = false;
                                            break findParent;
                                        case HostRoot:
                                            currentParent = parent.stateNode.containerInfo;
                                            currentParentIsContainer = true;
                                            break findParent;
                                        case HostPortal:
                                            currentParent = parent.stateNode.containerInfo;
                                            currentParentIsContainer = true;
                                            break findParent;
                                        }
                                        parent = parent['return'];
                                    }
                                currentParentIsValid = true;
                            }
                            if (node.tag === HostComponent || node.tag === HostText) {
                                commitNestedUnmounts(node);
                                if (currentParentIsContainer) {
                                    removeChildFromContainer(currentParent, node.stateNode);
                                } else {
                                    removeChild(currentParent, node.stateNode);
                                }
                            } else if (node.tag === HostPortal) {
                                currentParent = node.stateNode.containerInfo;
                                if (node.child !== null) {
                                    node.child['return'] = node;
                                    node = node.child;
                                    continue;
                                }
                            } else {
                                commitUnmount(node);
                                if (node.child !== null) {
                                    node.child['return'] = node;
                                    node = node.child;
                                    continue;
                                }
                            }
                            if (node === current) {
                                return;
                            }
                            while (node.sibling === null) {
                                if (node['return'] === null || node['return'] === current) {
                                    return;
                                }
                                node = node['return'];
                                if (node.tag === HostPortal) {
                                    currentParentIsValid = false;
                                }
                            }
                            node.sibling['return'] = node['return'];
                            node = node.sibling;
                        }
                    }
                    function commitDeletion(current) {
                        unmountHostComponents(current);
                        detachFiber(current);
                    }
                    function commitWork(current, finishedWork) {
                        switch (finishedWork.tag) {
                        case ClassComponent: {
                                return;
                            }
                        case HostComponent: {
                                var instance = finishedWork.stateNode;
                                if (instance != null) {
                                    var newProps = finishedWork.memoizedProps;
                                    var oldProps = current !== null ? current.memoizedProps : newProps;
                                    var type = finishedWork.type;
                                    var updatePayload = finishedWork.updateQueue;
                                    finishedWork.updateQueue = null;
                                    if (updatePayload !== null) {
                                        commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
                                    }
                                }
                                return;
                            }
                        case HostText: {
                                !(finishedWork.stateNode !== null) ? invariant(false, 'This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                var textInstance = finishedWork.stateNode;
                                var newText = finishedWork.memoizedProps;
                                var oldText = current !== null ? current.memoizedProps : newText;
                                commitTextUpdate(textInstance, oldText, newText);
                                return;
                            }
                        case HostRoot: {
                                return;
                            }
                        default: {
                                invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
                            }
                        }
                    }
                    function commitResetTextContent(current) {
                        resetTextContent(current.stateNode);
                    }
                    if (enableMutatingReconciler) {
                        return {
                            commitResetTextContent: commitResetTextContent,
                            commitPlacement: commitPlacement,
                            commitDeletion: commitDeletion,
                            commitWork: commitWork,
                            commitLifeCycles: commitLifeCycles,
                            commitAttachRef: commitAttachRef,
                            commitDetachRef: commitDetachRef
                        };
                    } else {
                        invariant(false, 'Mutating reconciler is disabled.');
                    }
                };
                var NO_CONTEXT = {};
                var ReactFiberHostContext = function (config) {
                    var getChildHostContext = config.getChildHostContext, getRootHostContext = config.getRootHostContext;
                    var contextStackCursor = createCursor(NO_CONTEXT);
                    var contextFiberStackCursor = createCursor(NO_CONTEXT);
                    var rootInstanceStackCursor = createCursor(NO_CONTEXT);
                    function requiredContext(c) {
                        !(c !== NO_CONTEXT) ? invariant(false, 'Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        return c;
                    }
                    function getRootHostContainer() {
                        var rootInstance = requiredContext(rootInstanceStackCursor.current);
                        return rootInstance;
                    }
                    function pushHostContainer(fiber, nextRootInstance) {
                        push(rootInstanceStackCursor, nextRootInstance, fiber);
                        var nextRootContext = getRootHostContext(nextRootInstance);
                        push(contextFiberStackCursor, fiber, fiber);
                        push(contextStackCursor, nextRootContext, fiber);
                    }
                    function popHostContainer(fiber) {
                        pop(contextStackCursor, fiber);
                        pop(contextFiberStackCursor, fiber);
                        pop(rootInstanceStackCursor, fiber);
                    }
                    function getHostContext() {
                        var context = requiredContext(contextStackCursor.current);
                        return context;
                    }
                    function pushHostContext(fiber) {
                        var rootInstance = requiredContext(rootInstanceStackCursor.current);
                        var context = requiredContext(contextStackCursor.current);
                        var nextContext = getChildHostContext(context, fiber.type, rootInstance);
                        if (context === nextContext) {
                            return;
                        }
                        push(contextFiberStackCursor, fiber, fiber);
                        push(contextStackCursor, nextContext, fiber);
                    }
                    function popHostContext(fiber) {
                        if (contextFiberStackCursor.current !== fiber) {
                            return;
                        }
                        pop(contextStackCursor, fiber);
                        pop(contextFiberStackCursor, fiber);
                    }
                    function resetHostContainer() {
                        contextStackCursor.current = NO_CONTEXT;
                        rootInstanceStackCursor.current = NO_CONTEXT;
                    }
                    return {
                        getHostContext: getHostContext,
                        getRootHostContainer: getRootHostContainer,
                        popHostContainer: popHostContainer,
                        popHostContext: popHostContext,
                        pushHostContainer: pushHostContainer,
                        pushHostContext: pushHostContext,
                        resetHostContainer: resetHostContainer
                    };
                };
                var ReactFiberHydrationContext = function (config) {
                    var shouldSetTextContent = config.shouldSetTextContent, hydration = config.hydration;
                    if (!hydration) {
                        return {
                            enterHydrationState: function () {
                                return false;
                            },
                            resetHydrationState: function () {
                            },
                            tryToClaimNextHydratableInstance: function () {
                            },
                            prepareToHydrateHostInstance: function () {
                                invariant(false, 'Expected prepareToHydrateHostInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.');
                            },
                            prepareToHydrateHostTextInstance: function () {
                                invariant(false, 'Expected prepareToHydrateHostTextInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.');
                            },
                            popHydrationState: function (fiber) {
                                return false;
                            }
                        };
                    }
                    var canHydrateInstance = hydration.canHydrateInstance, canHydrateTextInstance = hydration.canHydrateTextInstance, getNextHydratableSibling = hydration.getNextHydratableSibling, getFirstHydratableChild = hydration.getFirstHydratableChild, hydrateInstance = hydration.hydrateInstance, hydrateTextInstance = hydration.hydrateTextInstance, didNotMatchHydratedContainerTextInstance = hydration.didNotMatchHydratedContainerTextInstance, didNotMatchHydratedTextInstance = hydration.didNotMatchHydratedTextInstance, didNotHydrateContainerInstance = hydration.didNotHydrateContainerInstance, didNotHydrateInstance = hydration.didNotHydrateInstance, didNotFindHydratableContainerInstance = hydration.didNotFindHydratableContainerInstance, didNotFindHydratableContainerTextInstance = hydration.didNotFindHydratableContainerTextInstance, didNotFindHydratableInstance = hydration.didNotFindHydratableInstance, didNotFindHydratableTextInstance = hydration.didNotFindHydratableTextInstance;
                    var hydrationParentFiber = null;
                    var nextHydratableInstance = null;
                    var isHydrating = false;
                    function enterHydrationState(fiber) {
                        var parentInstance = fiber.stateNode.containerInfo;
                        nextHydratableInstance = getFirstHydratableChild(parentInstance);
                        hydrationParentFiber = fiber;
                        isHydrating = true;
                        return true;
                    }
                    function deleteHydratableInstance(returnFiber, instance) {
                        {
                            switch (returnFiber.tag) {
                            case HostRoot:
                                didNotHydrateContainerInstance(returnFiber.stateNode.containerInfo, instance);
                                break;
                            case HostComponent:
                                didNotHydrateInstance(returnFiber.type, returnFiber.memoizedProps, returnFiber.stateNode, instance);
                                break;
                            }
                        }
                        var childToDelete = createFiberFromHostInstanceForDeletion();
                        childToDelete.stateNode = instance;
                        childToDelete['return'] = returnFiber;
                        childToDelete.effectTag = Deletion;
                        if (returnFiber.lastEffect !== null) {
                            returnFiber.lastEffect.nextEffect = childToDelete;
                            returnFiber.lastEffect = childToDelete;
                        } else {
                            returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
                        }
                    }
                    function insertNonHydratedInstance(returnFiber, fiber) {
                        fiber.effectTag |= Placement;
                        {
                            switch (returnFiber.tag) {
                            case HostRoot: {
                                    var parentContainer = returnFiber.stateNode.containerInfo;
                                    switch (fiber.tag) {
                                    case HostComponent:
                                        var type = fiber.type;
                                        var props = fiber.pendingProps;
                                        didNotFindHydratableContainerInstance(parentContainer, type, props);
                                        break;
                                    case HostText:
                                        var text = fiber.pendingProps;
                                        didNotFindHydratableContainerTextInstance(parentContainer, text);
                                        break;
                                    }
                                    break;
                                }
                            case HostComponent: {
                                    var parentType = returnFiber.type;
                                    var parentProps = returnFiber.memoizedProps;
                                    var parentInstance = returnFiber.stateNode;
                                    switch (fiber.tag) {
                                    case HostComponent:
                                        var _type = fiber.type;
                                        var _props = fiber.pendingProps;
                                        didNotFindHydratableInstance(parentType, parentProps, parentInstance, _type, _props);
                                        break;
                                    case HostText:
                                        var _text = fiber.pendingProps;
                                        didNotFindHydratableTextInstance(parentType, parentProps, parentInstance, _text);
                                        break;
                                    }
                                    break;
                                }
                            default:
                                return;
                            }
                        }
                    }
                    function tryHydrate(fiber, nextInstance) {
                        switch (fiber.tag) {
                        case HostComponent: {
                                var type = fiber.type;
                                var props = fiber.pendingProps;
                                var instance = canHydrateInstance(nextInstance, type, props);
                                if (instance !== null) {
                                    fiber.stateNode = instance;
                                    return true;
                                }
                                return false;
                            }
                        case HostText: {
                                var text = fiber.pendingProps;
                                var textInstance = canHydrateTextInstance(nextInstance, text);
                                if (textInstance !== null) {
                                    fiber.stateNode = textInstance;
                                    return true;
                                }
                                return false;
                            }
                        default:
                            return false;
                        }
                    }
                    function tryToClaimNextHydratableInstance(fiber) {
                        if (!isHydrating) {
                            return;
                        }
                        var nextInstance = nextHydratableInstance;
                        if (!nextInstance) {
                            insertNonHydratedInstance(hydrationParentFiber, fiber);
                            isHydrating = false;
                            hydrationParentFiber = fiber;
                            return;
                        }
                        if (!tryHydrate(fiber, nextInstance)) {
                            nextInstance = getNextHydratableSibling(nextInstance);
                            if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
                                insertNonHydratedInstance(hydrationParentFiber, fiber);
                                isHydrating = false;
                                hydrationParentFiber = fiber;
                                return;
                            }
                            deleteHydratableInstance(hydrationParentFiber, nextHydratableInstance);
                        }
                        hydrationParentFiber = fiber;
                        nextHydratableInstance = getFirstHydratableChild(nextInstance);
                    }
                    function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
                        var instance = fiber.stateNode;
                        var updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber);
                        fiber.updateQueue = updatePayload;
                        if (updatePayload !== null) {
                            return true;
                        }
                        return false;
                    }
                    function prepareToHydrateHostTextInstance(fiber) {
                        var textInstance = fiber.stateNode;
                        var textContent = fiber.memoizedProps;
                        var shouldUpdate = hydrateTextInstance(textInstance, textContent, fiber);
                        {
                            if (shouldUpdate) {
                                var returnFiber = hydrationParentFiber;
                                if (returnFiber !== null) {
                                    switch (returnFiber.tag) {
                                    case HostRoot: {
                                            var parentContainer = returnFiber.stateNode.containerInfo;
                                            didNotMatchHydratedContainerTextInstance(parentContainer, textInstance, textContent);
                                            break;
                                        }
                                    case HostComponent: {
                                            var parentType = returnFiber.type;
                                            var parentProps = returnFiber.memoizedProps;
                                            var parentInstance = returnFiber.stateNode;
                                            didNotMatchHydratedTextInstance(parentType, parentProps, parentInstance, textInstance, textContent);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        return shouldUpdate;
                    }
                    function popToNextHostParent(fiber) {
                        var parent = fiber['return'];
                        while (parent !== null && parent.tag !== HostComponent && parent.tag !== HostRoot) {
                            parent = parent['return'];
                        }
                        hydrationParentFiber = parent;
                    }
                    function popHydrationState(fiber) {
                        if (fiber !== hydrationParentFiber) {
                            return false;
                        }
                        if (!isHydrating) {
                            popToNextHostParent(fiber);
                            isHydrating = true;
                            return false;
                        }
                        var type = fiber.type;
                        if (fiber.tag !== HostComponent || type !== 'head' && type !== 'body' && !shouldSetTextContent(type, fiber.memoizedProps)) {
                            var nextInstance = nextHydratableInstance;
                            while (nextInstance) {
                                deleteHydratableInstance(fiber, nextInstance);
                                nextInstance = getNextHydratableSibling(nextInstance);
                            }
                        }
                        popToNextHostParent(fiber);
                        nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
                        return true;
                    }
                    function resetHydrationState() {
                        hydrationParentFiber = null;
                        nextHydratableInstance = null;
                        isHydrating = false;
                    }
                    return {
                        enterHydrationState: enterHydrationState,
                        resetHydrationState: resetHydrationState,
                        tryToClaimNextHydratableInstance: tryToClaimNextHydratableInstance,
                        prepareToHydrateHostInstance: prepareToHydrateHostInstance,
                        prepareToHydrateHostTextInstance: prepareToHydrateHostTextInstance,
                        popHydrationState: popHydrationState
                    };
                };
                var ReactFiberInstrumentation = { debugTool: null };
                var ReactFiberInstrumentation_1 = ReactFiberInstrumentation;
                var defaultShowDialog = function (capturedError) {
                    return true;
                };
                var showDialog = defaultShowDialog;
                function logCapturedError(capturedError) {
                    var logError = showDialog(capturedError);
                    if (logError === false) {
                        return;
                    }
                    var error = capturedError.error;
                    var suppressLogging = error && error.suppressReactErrorLogging;
                    if (suppressLogging) {
                        return;
                    }
                    {
                        var componentName = capturedError.componentName, componentStack = capturedError.componentStack, errorBoundaryName = capturedError.errorBoundaryName, errorBoundaryFound = capturedError.errorBoundaryFound, willRetry = capturedError.willRetry;
                        var componentNameMessage = componentName ? 'The above error occurred in the <' + componentName + '> component:' : 'The above error occurred in one of your React components:';
                        var errorBoundaryMessage = void 0;
                        if (errorBoundaryFound && errorBoundaryName) {
                            if (willRetry) {
                                errorBoundaryMessage = 'React will try to recreate this component tree from scratch ' + ('using the error boundary you provided, ' + errorBoundaryName + '.');
                            } else {
                                errorBoundaryMessage = 'This error was initially handled by the error boundary ' + errorBoundaryName + '.\n' + 'Recreating the tree from scratch failed so React will unmount the tree.';
                            }
                        } else {
                            errorBoundaryMessage = 'Consider adding an error boundary to your tree to customize error handling behavior.\n' + 'Visit https://fb.me/react-error-boundaries to learn more about error boundaries.';
                        }
                        var combinedMessage = '' + componentNameMessage + componentStack + '\n\n' + ('' + errorBoundaryMessage);
                        console.error(combinedMessage);
                    }
                }
                var invokeGuardedCallback$1 = ReactErrorUtils.invokeGuardedCallback;
                var hasCaughtError = ReactErrorUtils.hasCaughtError;
                var clearCaughtError = ReactErrorUtils.clearCaughtError;
                {
                    var didWarnAboutStateTransition = false;
                    var didWarnSetStateChildContext = false;
                    var didWarnStateUpdateForUnmountedComponent = {};
                    var warnAboutUpdateOnUnmounted = function (fiber) {
                        var componentName = getComponentName(fiber) || 'ReactClass';
                        if (didWarnStateUpdateForUnmountedComponent[componentName]) {
                            return;
                        }
                        warning(false, 'Can only update a mounted or mounting ' + 'component. This usually means you called setState, replaceState, ' + 'or forceUpdate on an unmounted component. This is a no-op.\n\nPlease ' + 'check the code for the %s component.', componentName);
                        didWarnStateUpdateForUnmountedComponent[componentName] = true;
                    };
                    var warnAboutInvalidUpdates = function (instance) {
                        switch (ReactDebugCurrentFiber.phase) {
                        case 'getChildContext':
                            if (didWarnSetStateChildContext) {
                                return;
                            }
                            warning(false, 'setState(...): Cannot call setState() inside getChildContext()');
                            didWarnSetStateChildContext = true;
                            break;
                        case 'render':
                            if (didWarnAboutStateTransition) {
                                return;
                            }
                            warning(false, 'Cannot update during an existing state transition (such as within ' + '`render` or another component\'s constructor). Render methods should ' + 'be a pure function of props and state; constructor side-effects are ' + 'an anti-pattern, but can be moved to `componentWillMount`.');
                            didWarnAboutStateTransition = true;
                            break;
                        }
                    };
                }
                var ReactFiberScheduler = function (config) {
                    var hostContext = ReactFiberHostContext(config);
                    var hydrationContext = ReactFiberHydrationContext(config);
                    var popHostContainer = hostContext.popHostContainer, popHostContext = hostContext.popHostContext, resetHostContainer = hostContext.resetHostContainer;
                    var _ReactFiberBeginWork = ReactFiberBeginWork(config, hostContext, hydrationContext, scheduleWork, computeExpirationForFiber), beginWork = _ReactFiberBeginWork.beginWork, beginFailedWork = _ReactFiberBeginWork.beginFailedWork;
                    var _ReactFiberCompleteWo = ReactFiberCompleteWork(config, hostContext, hydrationContext), completeWork = _ReactFiberCompleteWo.completeWork;
                    var _ReactFiberCommitWork = ReactFiberCommitWork(config, captureError), commitResetTextContent = _ReactFiberCommitWork.commitResetTextContent, commitPlacement = _ReactFiberCommitWork.commitPlacement, commitDeletion = _ReactFiberCommitWork.commitDeletion, commitWork = _ReactFiberCommitWork.commitWork, commitLifeCycles = _ReactFiberCommitWork.commitLifeCycles, commitAttachRef = _ReactFiberCommitWork.commitAttachRef, commitDetachRef = _ReactFiberCommitWork.commitDetachRef;
                    var now = config.now, scheduleDeferredCallback = config.scheduleDeferredCallback, cancelDeferredCallback = config.cancelDeferredCallback, useSyncScheduling = config.useSyncScheduling, prepareForCommit = config.prepareForCommit, resetAfterCommit = config.resetAfterCommit;
                    var startTime = now();
                    var mostRecentCurrentTime = msToExpirationTime(0);
                    var expirationContext = NoWork;
                    var isWorking = false;
                    var nextUnitOfWork = null;
                    var nextRoot = null;
                    var nextRenderExpirationTime = NoWork;
                    var nextEffect = null;
                    var capturedErrors = null;
                    var failedBoundaries = null;
                    var commitPhaseBoundaries = null;
                    var firstUncaughtError = null;
                    var didFatal = false;
                    var isCommitting = false;
                    var isUnmounting = false;
                    var interruptedBy = null;
                    function resetContextStack() {
                        reset$1();
                        resetContext();
                        resetHostContainer();
                    }
                    function commitAllHostEffects() {
                        while (nextEffect !== null) {
                            {
                                ReactDebugCurrentFiber.setCurrentFiber(nextEffect);
                            }
                            recordEffect();
                            var effectTag = nextEffect.effectTag;
                            if (effectTag & ContentReset) {
                                commitResetTextContent(nextEffect);
                            }
                            if (effectTag & Ref) {
                                var current = nextEffect.alternate;
                                if (current !== null) {
                                    commitDetachRef(current);
                                }
                            }
                            var primaryEffectTag = effectTag & ~(Callback | Err | ContentReset | Ref | PerformedWork);
                            switch (primaryEffectTag) {
                            case Placement: {
                                    commitPlacement(nextEffect);
                                    nextEffect.effectTag &= ~Placement;
                                    break;
                                }
                            case PlacementAndUpdate: {
                                    commitPlacement(nextEffect);
                                    nextEffect.effectTag &= ~Placement;
                                    var _current = nextEffect.alternate;
                                    commitWork(_current, nextEffect);
                                    break;
                                }
                            case Update: {
                                    var _current2 = nextEffect.alternate;
                                    commitWork(_current2, nextEffect);
                                    break;
                                }
                            case Deletion: {
                                    isUnmounting = true;
                                    commitDeletion(nextEffect);
                                    isUnmounting = false;
                                    break;
                                }
                            }
                            nextEffect = nextEffect.nextEffect;
                        }
                        {
                            ReactDebugCurrentFiber.resetCurrentFiber();
                        }
                    }
                    function commitAllLifeCycles() {
                        while (nextEffect !== null) {
                            var effectTag = nextEffect.effectTag;
                            if (effectTag & (Update | Callback)) {
                                recordEffect();
                                var current = nextEffect.alternate;
                                commitLifeCycles(current, nextEffect);
                            }
                            if (effectTag & Ref) {
                                recordEffect();
                                commitAttachRef(nextEffect);
                            }
                            if (effectTag & Err) {
                                recordEffect();
                                commitErrorHandling(nextEffect);
                            }
                            var next = nextEffect.nextEffect;
                            nextEffect.nextEffect = null;
                            nextEffect = next;
                        }
                    }
                    function commitRoot(finishedWork) {
                        isWorking = true;
                        isCommitting = true;
                        startCommitTimer();
                        var root = finishedWork.stateNode;
                        !(root.current !== finishedWork) ? invariant(false, 'Cannot commit the same tree as before. This is probably a bug related to the return field. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        root.isReadyForCommit = false;
                        ReactCurrentOwner.current = null;
                        var firstEffect = void 0;
                        if (finishedWork.effectTag > PerformedWork) {
                            if (finishedWork.lastEffect !== null) {
                                finishedWork.lastEffect.nextEffect = finishedWork;
                                firstEffect = finishedWork.firstEffect;
                            } else {
                                firstEffect = finishedWork;
                            }
                        } else {
                            firstEffect = finishedWork.firstEffect;
                        }
                        prepareForCommit();
                        nextEffect = firstEffect;
                        startCommitHostEffectsTimer();
                        while (nextEffect !== null) {
                            var didError = false;
                            var _error = void 0;
                            {
                                invokeGuardedCallback$1(null, commitAllHostEffects, null);
                                if (hasCaughtError()) {
                                    didError = true;
                                    _error = clearCaughtError();
                                }
                            }
                            if (didError) {
                                !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                captureError(nextEffect, _error);
                                if (nextEffect !== null) {
                                    nextEffect = nextEffect.nextEffect;
                                }
                            }
                        }
                        stopCommitHostEffectsTimer();
                        resetAfterCommit();
                        root.current = finishedWork;
                        nextEffect = firstEffect;
                        startCommitLifeCyclesTimer();
                        while (nextEffect !== null) {
                            var _didError = false;
                            var _error2 = void 0;
                            {
                                invokeGuardedCallback$1(null, commitAllLifeCycles, null);
                                if (hasCaughtError()) {
                                    _didError = true;
                                    _error2 = clearCaughtError();
                                }
                            }
                            if (_didError) {
                                !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                captureError(nextEffect, _error2);
                                if (nextEffect !== null) {
                                    nextEffect = nextEffect.nextEffect;
                                }
                            }
                        }
                        isCommitting = false;
                        isWorking = false;
                        stopCommitLifeCyclesTimer();
                        stopCommitTimer();
                        if (typeof onCommitRoot === 'function') {
                            onCommitRoot(finishedWork.stateNode);
                        }
                        if (true && ReactFiberInstrumentation_1.debugTool) {
                            ReactFiberInstrumentation_1.debugTool.onCommitWork(finishedWork);
                        }
                        if (commitPhaseBoundaries) {
                            commitPhaseBoundaries.forEach(scheduleErrorRecovery);
                            commitPhaseBoundaries = null;
                        }
                        if (firstUncaughtError !== null) {
                            var _error3 = firstUncaughtError;
                            firstUncaughtError = null;
                            onUncaughtError(_error3);
                        }
                        var remainingTime = root.current.expirationTime;
                        if (remainingTime === NoWork) {
                            capturedErrors = null;
                            failedBoundaries = null;
                        }
                        return remainingTime;
                    }
                    function resetExpirationTime(workInProgress, renderTime) {
                        if (renderTime !== Never && workInProgress.expirationTime === Never) {
                            return;
                        }
                        var newExpirationTime = getUpdateExpirationTime(workInProgress);
                        var child = workInProgress.child;
                        while (child !== null) {
                            if (child.expirationTime !== NoWork && (newExpirationTime === NoWork || newExpirationTime > child.expirationTime)) {
                                newExpirationTime = child.expirationTime;
                            }
                            child = child.sibling;
                        }
                        workInProgress.expirationTime = newExpirationTime;
                    }
                    function completeUnitOfWork(workInProgress) {
                        while (true) {
                            var current = workInProgress.alternate;
                            {
                                ReactDebugCurrentFiber.setCurrentFiber(workInProgress);
                            }
                            var next = completeWork(current, workInProgress, nextRenderExpirationTime);
                            {
                                ReactDebugCurrentFiber.resetCurrentFiber();
                            }
                            var returnFiber = workInProgress['return'];
                            var siblingFiber = workInProgress.sibling;
                            resetExpirationTime(workInProgress, nextRenderExpirationTime);
                            if (next !== null) {
                                stopWorkTimer(workInProgress);
                                if (true && ReactFiberInstrumentation_1.debugTool) {
                                    ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
                                }
                                return next;
                            }
                            if (returnFiber !== null) {
                                if (returnFiber.firstEffect === null) {
                                    returnFiber.firstEffect = workInProgress.firstEffect;
                                }
                                if (workInProgress.lastEffect !== null) {
                                    if (returnFiber.lastEffect !== null) {
                                        returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
                                    }
                                    returnFiber.lastEffect = workInProgress.lastEffect;
                                }
                                var effectTag = workInProgress.effectTag;
                                if (effectTag > PerformedWork) {
                                    if (returnFiber.lastEffect !== null) {
                                        returnFiber.lastEffect.nextEffect = workInProgress;
                                    } else {
                                        returnFiber.firstEffect = workInProgress;
                                    }
                                    returnFiber.lastEffect = workInProgress;
                                }
                            }
                            stopWorkTimer(workInProgress);
                            if (true && ReactFiberInstrumentation_1.debugTool) {
                                ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
                            }
                            if (siblingFiber !== null) {
                                return siblingFiber;
                            } else if (returnFiber !== null) {
                                workInProgress = returnFiber;
                                continue;
                            } else {
                                var root = workInProgress.stateNode;
                                root.isReadyForCommit = true;
                                return null;
                            }
                        }
                        return null;
                    }
                    function performUnitOfWork(workInProgress) {
                        var current = workInProgress.alternate;
                        startWorkTimer(workInProgress);
                        {
                            ReactDebugCurrentFiber.setCurrentFiber(workInProgress);
                        }
                        var next = beginWork(current, workInProgress, nextRenderExpirationTime);
                        {
                            ReactDebugCurrentFiber.resetCurrentFiber();
                        }
                        if (true && ReactFiberInstrumentation_1.debugTool) {
                            ReactFiberInstrumentation_1.debugTool.onBeginWork(workInProgress);
                        }
                        if (next === null) {
                            next = completeUnitOfWork(workInProgress);
                        }
                        ReactCurrentOwner.current = null;
                        return next;
                    }
                    function performFailedUnitOfWork(workInProgress) {
                        var current = workInProgress.alternate;
                        startWorkTimer(workInProgress);
                        {
                            ReactDebugCurrentFiber.setCurrentFiber(workInProgress);
                        }
                        var next = beginFailedWork(current, workInProgress, nextRenderExpirationTime);
                        {
                            ReactDebugCurrentFiber.resetCurrentFiber();
                        }
                        if (true && ReactFiberInstrumentation_1.debugTool) {
                            ReactFiberInstrumentation_1.debugTool.onBeginWork(workInProgress);
                        }
                        if (next === null) {
                            next = completeUnitOfWork(workInProgress);
                        }
                        ReactCurrentOwner.current = null;
                        return next;
                    }
                    function workLoop(expirationTime) {
                        if (capturedErrors !== null) {
                            slowWorkLoopThatChecksForFailedWork(expirationTime);
                            return;
                        }
                        if (nextRenderExpirationTime === NoWork || nextRenderExpirationTime > expirationTime) {
                            return;
                        }
                        if (nextRenderExpirationTime <= mostRecentCurrentTime) {
                            while (nextUnitOfWork !== null) {
                                nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
                            }
                        } else {
                            while (nextUnitOfWork !== null && !shouldYield()) {
                                nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
                            }
                        }
                    }
                    function slowWorkLoopThatChecksForFailedWork(expirationTime) {
                        if (nextRenderExpirationTime === NoWork || nextRenderExpirationTime > expirationTime) {
                            return;
                        }
                        if (nextRenderExpirationTime <= mostRecentCurrentTime) {
                            while (nextUnitOfWork !== null) {
                                if (hasCapturedError(nextUnitOfWork)) {
                                    nextUnitOfWork = performFailedUnitOfWork(nextUnitOfWork);
                                } else {
                                    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
                                }
                            }
                        } else {
                            while (nextUnitOfWork !== null && !shouldYield()) {
                                if (hasCapturedError(nextUnitOfWork)) {
                                    nextUnitOfWork = performFailedUnitOfWork(nextUnitOfWork);
                                } else {
                                    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
                                }
                            }
                        }
                    }
                    function renderRootCatchBlock(root, failedWork, boundary, expirationTime) {
                        unwindContexts(failedWork, boundary);
                        nextUnitOfWork = performFailedUnitOfWork(boundary);
                        workLoop(expirationTime);
                    }
                    function renderRoot(root, expirationTime) {
                        !!isWorking ? invariant(false, 'renderRoot was called recursively. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        isWorking = true;
                        root.isReadyForCommit = false;
                        if (root !== nextRoot || expirationTime !== nextRenderExpirationTime || nextUnitOfWork === null) {
                            resetContextStack();
                            nextRoot = root;
                            nextRenderExpirationTime = expirationTime;
                            nextUnitOfWork = createWorkInProgress(nextRoot.current, null, expirationTime);
                        }
                        startWorkLoopTimer(nextUnitOfWork);
                        var didError = false;
                        var error = null;
                        {
                            invokeGuardedCallback$1(null, workLoop, null, expirationTime);
                            if (hasCaughtError()) {
                                didError = true;
                                error = clearCaughtError();
                            }
                        }
                        while (didError) {
                            if (didFatal) {
                                firstUncaughtError = error;
                                break;
                            }
                            var failedWork = nextUnitOfWork;
                            if (failedWork === null) {
                                didFatal = true;
                                continue;
                            }
                            var boundary = captureError(failedWork, error);
                            !(boundary !== null) ? invariant(false, 'Should have found an error boundary. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                            if (didFatal) {
                                continue;
                            }
                            didError = false;
                            error = null;
                            {
                                invokeGuardedCallback$1(null, renderRootCatchBlock, null, root, failedWork, boundary, expirationTime);
                                if (hasCaughtError()) {
                                    didError = true;
                                    error = clearCaughtError();
                                    continue;
                                }
                            }
                            break;
                        }
                        var uncaughtError = firstUncaughtError;
                        stopWorkLoopTimer(interruptedBy);
                        interruptedBy = null;
                        isWorking = false;
                        didFatal = false;
                        firstUncaughtError = null;
                        if (uncaughtError !== null) {
                            onUncaughtError(uncaughtError);
                        }
                        return root.isReadyForCommit ? root.current.alternate : null;
                    }
                    function captureError(failedWork, error) {
                        ReactCurrentOwner.current = null;
                        {
                            ReactDebugCurrentFiber.resetCurrentFiber();
                        }
                        var boundary = null;
                        var errorBoundaryFound = false;
                        var willRetry = false;
                        var errorBoundaryName = null;
                        if (failedWork.tag === HostRoot) {
                            boundary = failedWork;
                            if (isFailedBoundary(failedWork)) {
                                didFatal = true;
                            }
                        } else {
                            var node = failedWork['return'];
                            while (node !== null && boundary === null) {
                                if (node.tag === ClassComponent) {
                                    var instance = node.stateNode;
                                    if (typeof instance.componentDidCatch === 'function') {
                                        errorBoundaryFound = true;
                                        errorBoundaryName = getComponentName(node);
                                        boundary = node;
                                        willRetry = true;
                                    }
                                } else if (node.tag === HostRoot) {
                                    boundary = node;
                                }
                                if (isFailedBoundary(node)) {
                                    if (isUnmounting) {
                                        return null;
                                    }
                                    if (commitPhaseBoundaries !== null && (commitPhaseBoundaries.has(node) || node.alternate !== null && commitPhaseBoundaries.has(node.alternate))) {
                                        return null;
                                    }
                                    boundary = null;
                                    willRetry = false;
                                }
                                node = node['return'];
                            }
                        }
                        if (boundary !== null) {
                            if (failedBoundaries === null) {
                                failedBoundaries = new Set();
                            }
                            failedBoundaries.add(boundary);
                            var _componentStack = getStackAddendumByWorkInProgressFiber(failedWork);
                            var _componentName = getComponentName(failedWork);
                            if (capturedErrors === null) {
                                capturedErrors = new Map();
                            }
                            var capturedError = {
                                componentName: _componentName,
                                componentStack: _componentStack,
                                error: error,
                                errorBoundary: errorBoundaryFound ? boundary.stateNode : null,
                                errorBoundaryFound: errorBoundaryFound,
                                errorBoundaryName: errorBoundaryName,
                                willRetry: willRetry
                            };
                            capturedErrors.set(boundary, capturedError);
                            try {
                                logCapturedError(capturedError);
                            } catch (e) {
                                var suppressLogging = e && e.suppressReactErrorLogging;
                                if (!suppressLogging) {
                                    console.error(e);
                                }
                            }
                            if (isCommitting) {
                                if (commitPhaseBoundaries === null) {
                                    commitPhaseBoundaries = new Set();
                                }
                                commitPhaseBoundaries.add(boundary);
                            } else {
                                scheduleErrorRecovery(boundary);
                            }
                            return boundary;
                        } else if (firstUncaughtError === null) {
                            firstUncaughtError = error;
                        }
                        return null;
                    }
                    function hasCapturedError(fiber) {
                        return capturedErrors !== null && (capturedErrors.has(fiber) || fiber.alternate !== null && capturedErrors.has(fiber.alternate));
                    }
                    function isFailedBoundary(fiber) {
                        return failedBoundaries !== null && (failedBoundaries.has(fiber) || fiber.alternate !== null && failedBoundaries.has(fiber.alternate));
                    }
                    function commitErrorHandling(effectfulFiber) {
                        var capturedError = void 0;
                        if (capturedErrors !== null) {
                            capturedError = capturedErrors.get(effectfulFiber);
                            capturedErrors['delete'](effectfulFiber);
                            if (capturedError == null) {
                                if (effectfulFiber.alternate !== null) {
                                    effectfulFiber = effectfulFiber.alternate;
                                    capturedError = capturedErrors.get(effectfulFiber);
                                    capturedErrors['delete'](effectfulFiber);
                                }
                            }
                        }
                        !(capturedError != null) ? invariant(false, 'No error for given unit of work. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        switch (effectfulFiber.tag) {
                        case ClassComponent:
                            var instance = effectfulFiber.stateNode;
                            var info = { componentStack: capturedError.componentStack };
                            instance.componentDidCatch(capturedError.error, info);
                            return;
                        case HostRoot:
                            if (firstUncaughtError === null) {
                                firstUncaughtError = capturedError.error;
                            }
                            return;
                        default:
                            invariant(false, 'Invalid type of work. This error is likely caused by a bug in React. Please file an issue.');
                        }
                    }
                    function unwindContexts(from, to) {
                        var node = from;
                        while (node !== null) {
                            switch (node.tag) {
                            case ClassComponent:
                                popContextProvider(node);
                                break;
                            case HostComponent:
                                popHostContext(node);
                                break;
                            case HostRoot:
                                popHostContainer(node);
                                break;
                            case HostPortal:
                                popHostContainer(node);
                                break;
                            }
                            if (node === to || node.alternate === to) {
                                stopFailedWorkTimer(node);
                                break;
                            } else {
                                stopWorkTimer(node);
                            }
                            node = node['return'];
                        }
                    }
                    function computeAsyncExpiration() {
                        var currentTime = recalculateCurrentTime();
                        var expirationMs = 1000;
                        var bucketSizeMs = 200;
                        return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
                    }
                    function computeExpirationForFiber(fiber) {
                        var expirationTime = void 0;
                        if (expirationContext !== NoWork) {
                            expirationTime = expirationContext;
                        } else if (isWorking) {
                            if (isCommitting) {
                                expirationTime = Sync;
                            } else {
                                expirationTime = nextRenderExpirationTime;
                            }
                        } else {
                            if (useSyncScheduling && !(fiber.internalContextTag & AsyncUpdates)) {
                                expirationTime = Sync;
                            } else {
                                expirationTime = computeAsyncExpiration();
                            }
                        }
                        return expirationTime;
                    }
                    function scheduleWork(fiber, expirationTime) {
                        return scheduleWorkImpl(fiber, expirationTime, false);
                    }
                    function checkRootNeedsClearing(root, fiber, expirationTime) {
                        if (!isWorking && root === nextRoot && expirationTime < nextRenderExpirationTime) {
                            if (nextUnitOfWork !== null) {
                                interruptedBy = fiber;
                            }
                            nextRoot = null;
                            nextUnitOfWork = null;
                            nextRenderExpirationTime = NoWork;
                        }
                    }
                    function scheduleWorkImpl(fiber, expirationTime, isErrorRecovery) {
                        recordScheduleUpdate();
                        {
                            if (!isErrorRecovery && fiber.tag === ClassComponent) {
                                var instance = fiber.stateNode;
                                warnAboutInvalidUpdates(instance);
                            }
                        }
                        var node = fiber;
                        while (node !== null) {
                            if (node.expirationTime === NoWork || node.expirationTime > expirationTime) {
                                node.expirationTime = expirationTime;
                            }
                            if (node.alternate !== null) {
                                if (node.alternate.expirationTime === NoWork || node.alternate.expirationTime > expirationTime) {
                                    node.alternate.expirationTime = expirationTime;
                                }
                            }
                            if (node['return'] === null) {
                                if (node.tag === HostRoot) {
                                    var root = node.stateNode;
                                    checkRootNeedsClearing(root, fiber, expirationTime);
                                    requestWork(root, expirationTime);
                                    checkRootNeedsClearing(root, fiber, expirationTime);
                                } else {
                                    {
                                        if (!isErrorRecovery && fiber.tag === ClassComponent) {
                                            warnAboutUpdateOnUnmounted(fiber);
                                        }
                                    }
                                    return;
                                }
                            }
                            node = node['return'];
                        }
                    }
                    function scheduleErrorRecovery(fiber) {
                        scheduleWorkImpl(fiber, Sync, true);
                    }
                    function recalculateCurrentTime() {
                        var ms = now() - startTime;
                        mostRecentCurrentTime = msToExpirationTime(ms);
                        return mostRecentCurrentTime;
                    }
                    function deferredUpdates(fn) {
                        var previousExpirationContext = expirationContext;
                        expirationContext = computeAsyncExpiration();
                        try {
                            return fn();
                        } finally {
                            expirationContext = previousExpirationContext;
                        }
                    }
                    function syncUpdates(fn) {
                        var previousExpirationContext = expirationContext;
                        expirationContext = Sync;
                        try {
                            return fn();
                        } finally {
                            expirationContext = previousExpirationContext;
                        }
                    }
                    var firstScheduledRoot = null;
                    var lastScheduledRoot = null;
                    var callbackExpirationTime = NoWork;
                    var callbackID = -1;
                    var isRendering = false;
                    var nextFlushedRoot = null;
                    var nextFlushedExpirationTime = NoWork;
                    var deadlineDidExpire = false;
                    var hasUnhandledError = false;
                    var unhandledError = null;
                    var deadline = null;
                    var isBatchingUpdates = false;
                    var isUnbatchingUpdates = false;
                    var NESTED_UPDATE_LIMIT = 1000;
                    var nestedUpdateCount = 0;
                    var timeHeuristicForUnitOfWork = 1;
                    function scheduleCallbackWithExpiration(expirationTime) {
                        if (callbackExpirationTime !== NoWork) {
                            if (expirationTime > callbackExpirationTime) {
                                return;
                            } else {
                                cancelDeferredCallback(callbackID);
                            }
                        } else {
                            startRequestCallbackTimer();
                        }
                        var currentMs = now() - startTime;
                        var expirationMs = expirationTimeToMs(expirationTime);
                        var timeout = expirationMs - currentMs;
                        callbackExpirationTime = expirationTime;
                        callbackID = scheduleDeferredCallback(performAsyncWork, { timeout: timeout });
                    }
                    function requestWork(root, expirationTime) {
                        if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
                            invariant(false, 'Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.');
                        }
                        if (root.nextScheduledRoot === null) {
                            root.remainingExpirationTime = expirationTime;
                            if (lastScheduledRoot === null) {
                                firstScheduledRoot = lastScheduledRoot = root;
                                root.nextScheduledRoot = root;
                            } else {
                                lastScheduledRoot.nextScheduledRoot = root;
                                lastScheduledRoot = root;
                                lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
                            }
                        } else {
                            var remainingExpirationTime = root.remainingExpirationTime;
                            if (remainingExpirationTime === NoWork || expirationTime < remainingExpirationTime) {
                                root.remainingExpirationTime = expirationTime;
                            }
                        }
                        if (isRendering) {
                            return;
                        }
                        if (isBatchingUpdates) {
                            if (isUnbatchingUpdates) {
                                nextFlushedRoot = root;
                                nextFlushedExpirationTime = Sync;
                                performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime);
                            }
                            return;
                        }
                        if (expirationTime === Sync) {
                            performWork(Sync, null);
                        } else {
                            scheduleCallbackWithExpiration(expirationTime);
                        }
                    }
                    function findHighestPriorityRoot() {
                        var highestPriorityWork = NoWork;
                        var highestPriorityRoot = null;
                        if (lastScheduledRoot !== null) {
                            var previousScheduledRoot = lastScheduledRoot;
                            var root = firstScheduledRoot;
                            while (root !== null) {
                                var remainingExpirationTime = root.remainingExpirationTime;
                                if (remainingExpirationTime === NoWork) {
                                    !(previousScheduledRoot !== null && lastScheduledRoot !== null) ? invariant(false, 'Should have a previous and last root. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                                    if (root === root.nextScheduledRoot) {
                                        root.nextScheduledRoot = null;
                                        firstScheduledRoot = lastScheduledRoot = null;
                                        break;
                                    } else if (root === firstScheduledRoot) {
                                        var next = root.nextScheduledRoot;
                                        firstScheduledRoot = next;
                                        lastScheduledRoot.nextScheduledRoot = next;
                                        root.nextScheduledRoot = null;
                                    } else if (root === lastScheduledRoot) {
                                        lastScheduledRoot = previousScheduledRoot;
                                        lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
                                        root.nextScheduledRoot = null;
                                        break;
                                    } else {
                                        previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
                                        root.nextScheduledRoot = null;
                                    }
                                    root = previousScheduledRoot.nextScheduledRoot;
                                } else {
                                    if (highestPriorityWork === NoWork || remainingExpirationTime < highestPriorityWork) {
                                        highestPriorityWork = remainingExpirationTime;
                                        highestPriorityRoot = root;
                                    }
                                    if (root === lastScheduledRoot) {
                                        break;
                                    }
                                    previousScheduledRoot = root;
                                    root = root.nextScheduledRoot;
                                }
                            }
                        }
                        var previousFlushedRoot = nextFlushedRoot;
                        if (previousFlushedRoot !== null && previousFlushedRoot === highestPriorityRoot) {
                            nestedUpdateCount++;
                        } else {
                            nestedUpdateCount = 0;
                        }
                        nextFlushedRoot = highestPriorityRoot;
                        nextFlushedExpirationTime = highestPriorityWork;
                    }
                    function performAsyncWork(dl) {
                        performWork(NoWork, dl);
                    }
                    function performWork(minExpirationTime, dl) {
                        deadline = dl;
                        findHighestPriorityRoot();
                        if (enableUserTimingAPI && deadline !== null) {
                            var didExpire = nextFlushedExpirationTime < recalculateCurrentTime();
                            stopRequestCallbackTimer(didExpire);
                        }
                        while (nextFlushedRoot !== null && nextFlushedExpirationTime !== NoWork && (minExpirationTime === NoWork || nextFlushedExpirationTime <= minExpirationTime) && !deadlineDidExpire) {
                            performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime);
                            findHighestPriorityRoot();
                        }
                        if (deadline !== null) {
                            callbackExpirationTime = NoWork;
                            callbackID = -1;
                        }
                        if (nextFlushedExpirationTime !== NoWork) {
                            scheduleCallbackWithExpiration(nextFlushedExpirationTime);
                        }
                        deadline = null;
                        deadlineDidExpire = false;
                        nestedUpdateCount = 0;
                        if (hasUnhandledError) {
                            var _error4 = unhandledError;
                            unhandledError = null;
                            hasUnhandledError = false;
                            throw _error4;
                        }
                    }
                    function performWorkOnRoot(root, expirationTime) {
                        !!isRendering ? invariant(false, 'performWorkOnRoot was called recursively. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        isRendering = true;
                        if (expirationTime <= recalculateCurrentTime()) {
                            var finishedWork = root.finishedWork;
                            if (finishedWork !== null) {
                                root.finishedWork = null;
                                root.remainingExpirationTime = commitRoot(finishedWork);
                            } else {
                                root.finishedWork = null;
                                finishedWork = renderRoot(root, expirationTime);
                                if (finishedWork !== null) {
                                    root.remainingExpirationTime = commitRoot(finishedWork);
                                }
                            }
                        } else {
                            var _finishedWork = root.finishedWork;
                            if (_finishedWork !== null) {
                                root.finishedWork = null;
                                root.remainingExpirationTime = commitRoot(_finishedWork);
                            } else {
                                root.finishedWork = null;
                                _finishedWork = renderRoot(root, expirationTime);
                                if (_finishedWork !== null) {
                                    if (!shouldYield()) {
                                        root.remainingExpirationTime = commitRoot(_finishedWork);
                                    } else {
                                        root.finishedWork = _finishedWork;
                                    }
                                }
                            }
                        }
                        isRendering = false;
                    }
                    function shouldYield() {
                        if (deadline === null) {
                            return false;
                        }
                        if (deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
                            return false;
                        }
                        deadlineDidExpire = true;
                        return true;
                    }
                    function onUncaughtError(error) {
                        !(nextFlushedRoot !== null) ? invariant(false, 'Should be working on a root. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                        nextFlushedRoot.remainingExpirationTime = NoWork;
                        if (!hasUnhandledError) {
                            hasUnhandledError = true;
                            unhandledError = error;
                        }
                    }
                    function batchedUpdates(fn, a) {
                        var previousIsBatchingUpdates = isBatchingUpdates;
                        isBatchingUpdates = true;
                        try {
                            return fn(a);
                        } finally {
                            isBatchingUpdates = previousIsBatchingUpdates;
                            if (!isBatchingUpdates && !isRendering) {
                                performWork(Sync, null);
                            }
                        }
                    }
                    function unbatchedUpdates(fn) {
                        if (isBatchingUpdates && !isUnbatchingUpdates) {
                            isUnbatchingUpdates = true;
                            try {
                                return fn();
                            } finally {
                                isUnbatchingUpdates = false;
                            }
                        }
                        return fn();
                    }
                    function flushSync(fn) {
                        var previousIsBatchingUpdates = isBatchingUpdates;
                        isBatchingUpdates = true;
                        try {
                            return syncUpdates(fn);
                        } finally {
                            isBatchingUpdates = previousIsBatchingUpdates;
                            !!isRendering ? invariant(false, 'flushSync was called from inside a lifecycle method. It cannot be called when React is already rendering.') : void 0;
                            performWork(Sync, null);
                        }
                    }
                    return {
                        computeAsyncExpiration: computeAsyncExpiration,
                        computeExpirationForFiber: computeExpirationForFiber,
                        scheduleWork: scheduleWork,
                        batchedUpdates: batchedUpdates,
                        unbatchedUpdates: unbatchedUpdates,
                        flushSync: flushSync,
                        deferredUpdates: deferredUpdates
                    };
                };
                {
                    var didWarnAboutNestedUpdates = false;
                }
                function getContextForSubtree(parentComponent) {
                    if (!parentComponent) {
                        return emptyObject;
                    }
                    var fiber = get(parentComponent);
                    var parentContext = findCurrentUnmaskedContext(fiber);
                    return isContextProvider(fiber) ? processChildContext(fiber, parentContext) : parentContext;
                }
                var ReactFiberReconciler$1 = function (config) {
                    var getPublicInstance = config.getPublicInstance;
                    var _ReactFiberScheduler = ReactFiberScheduler(config), computeAsyncExpiration = _ReactFiberScheduler.computeAsyncExpiration, computeExpirationForFiber = _ReactFiberScheduler.computeExpirationForFiber, scheduleWork = _ReactFiberScheduler.scheduleWork, batchedUpdates = _ReactFiberScheduler.batchedUpdates, unbatchedUpdates = _ReactFiberScheduler.unbatchedUpdates, flushSync = _ReactFiberScheduler.flushSync, deferredUpdates = _ReactFiberScheduler.deferredUpdates;
                    function scheduleTopLevelUpdate(current, element, callback) {
                        {
                            if (ReactDebugCurrentFiber.phase === 'render' && ReactDebugCurrentFiber.current !== null && !didWarnAboutNestedUpdates) {
                                didWarnAboutNestedUpdates = true;
                                warning(false, 'Render methods should be a pure function of props and state; ' + 'triggering nested component updates from render is not allowed. ' + 'If necessary, trigger nested updates in componentDidUpdate.\n\n' + 'Check the render method of %s.', getComponentName(ReactDebugCurrentFiber.current) || 'Unknown');
                            }
                        }
                        callback = callback === undefined ? null : callback;
                        {
                            warning(callback === null || typeof callback === 'function', 'render(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callback);
                        }
                        var expirationTime = void 0;
                        if (enableAsyncSubtreeAPI && element != null && element.type != null && element.type.prototype != null && element.type.prototype.unstable_isAsyncReactComponent === true) {
                            expirationTime = computeAsyncExpiration();
                        } else {
                            expirationTime = computeExpirationForFiber(current);
                        }
                        var update = {
                            expirationTime: expirationTime,
                            partialState: { element: element },
                            callback: callback,
                            isReplace: false,
                            isForced: false,
                            nextCallback: null,
                            next: null
                        };
                        insertUpdateIntoFiber(current, update);
                        scheduleWork(current, expirationTime);
                    }
                    function findHostInstance(fiber) {
                        var hostFiber = findCurrentHostFiber(fiber);
                        if (hostFiber === null) {
                            return null;
                        }
                        return hostFiber.stateNode;
                    }
                    return {
                        createContainer: function (containerInfo, hydrate) {
                            return createFiberRoot(containerInfo, hydrate);
                        },
                        updateContainer: function (element, container, parentComponent, callback) {
                            var current = container.current;
                            {
                                if (ReactFiberInstrumentation_1.debugTool) {
                                    if (current.alternate === null) {
                                        ReactFiberInstrumentation_1.debugTool.onMountContainer(container);
                                    } else if (element === null) {
                                        ReactFiberInstrumentation_1.debugTool.onUnmountContainer(container);
                                    } else {
                                        ReactFiberInstrumentation_1.debugTool.onUpdateContainer(container);
                                    }
                                }
                            }
                            var context = getContextForSubtree(parentComponent);
                            if (container.context === null) {
                                container.context = context;
                            } else {
                                container.pendingContext = context;
                            }
                            scheduleTopLevelUpdate(current, element, callback);
                        },
                        batchedUpdates: batchedUpdates,
                        unbatchedUpdates: unbatchedUpdates,
                        deferredUpdates: deferredUpdates,
                        flushSync: flushSync,
                        getPublicRootInstance: function (container) {
                            var containerFiber = container.current;
                            if (!containerFiber.child) {
                                return null;
                            }
                            switch (containerFiber.child.tag) {
                            case HostComponent:
                                return getPublicInstance(containerFiber.child.stateNode);
                            default:
                                return containerFiber.child.stateNode;
                            }
                        },
                        findHostInstance: findHostInstance,
                        findHostInstanceWithNoPortals: function (fiber) {
                            var hostFiber = findCurrentHostFiberWithNoPortals(fiber);
                            if (hostFiber === null) {
                                return null;
                            }
                            return hostFiber.stateNode;
                        },
                        injectIntoDevTools: function (devToolsConfig) {
                            var findFiberByHostInstance = devToolsConfig.findFiberByHostInstance;
                            return injectInternals(_assign({}, devToolsConfig, {
                                findHostInstanceByFiber: function (fiber) {
                                    return findHostInstance(fiber);
                                },
                                findFiberByHostInstance: function (instance) {
                                    if (!findFiberByHostInstance) {
                                        return null;
                                    }
                                    return findFiberByHostInstance(instance);
                                }
                            }));
                        }
                    };
                };
                var ReactFiberReconciler$2 = Object.freeze({ default: ReactFiberReconciler$1 });
                var ReactFiberReconciler$3 = ReactFiberReconciler$2 && ReactFiberReconciler$1 || ReactFiberReconciler$2;
                var reactReconciler = ReactFiberReconciler$3['default'] ? ReactFiberReconciler$3['default'] : ReactFiberReconciler$3;
                function createPortal$1(children, containerInfo, implementation) {
                    var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
                    return {
                        $$typeof: REACT_PORTAL_TYPE,
                        key: key == null ? null : '' + key,
                        children: children,
                        containerInfo: containerInfo,
                        implementation: implementation
                    };
                }
                var ReactVersion = '16.2.0';
                {
                    if (ExecutionEnvironment.canUseDOM && typeof requestAnimationFrame !== 'function') {
                        warning(false, 'React depends on requestAnimationFrame. Make sure that you load a ' + 'polyfill in older browsers. http://fb.me/react-polyfills');
                    }
                }
                var hasNativePerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';
                var now = void 0;
                if (hasNativePerformanceNow) {
                    now = function () {
                        return performance.now();
                    };
                } else {
                    now = function () {
                        return Date.now();
                    };
                }
                var rIC = void 0;
                var cIC = void 0;
                if (!ExecutionEnvironment.canUseDOM) {
                    rIC = function (frameCallback) {
                        return setTimeout(function () {
                            frameCallback({
                                timeRemaining: function () {
                                    return Infinity;
                                }
                            });
                        });
                    };
                    cIC = function (timeoutID) {
                        clearTimeout(timeoutID);
                    };
                } else if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
                    var scheduledRICCallback = null;
                    var isIdleScheduled = false;
                    var timeoutTime = -1;
                    var isAnimationFrameScheduled = false;
                    var frameDeadline = 0;
                    var previousFrameTime = 33;
                    var activeFrameTime = 33;
                    var frameDeadlineObject;
                    if (hasNativePerformanceNow) {
                        frameDeadlineObject = {
                            didTimeout: false,
                            timeRemaining: function () {
                                var remaining = frameDeadline - performance.now();
                                return remaining > 0 ? remaining : 0;
                            }
                        };
                    } else {
                        frameDeadlineObject = {
                            didTimeout: false,
                            timeRemaining: function () {
                                var remaining = frameDeadline - Date.now();
                                return remaining > 0 ? remaining : 0;
                            }
                        };
                    }
                    var messageKey = '__reactIdleCallback$' + Math.random().toString(36).slice(2);
                    var idleTick = function (event) {
                        if (event.source !== window || event.data !== messageKey) {
                            return;
                        }
                        isIdleScheduled = false;
                        var currentTime = now();
                        if (frameDeadline - currentTime <= 0) {
                            if (timeoutTime !== -1 && timeoutTime <= currentTime) {
                                frameDeadlineObject.didTimeout = true;
                            } else {
                                if (!isAnimationFrameScheduled) {
                                    isAnimationFrameScheduled = true;
                                    requestAnimationFrame(animationTick);
                                }
                                return;
                            }
                        } else {
                            frameDeadlineObject.didTimeout = false;
                        }
                        timeoutTime = -1;
                        var callback = scheduledRICCallback;
                        scheduledRICCallback = null;
                        if (callback !== null) {
                            callback(frameDeadlineObject);
                        }
                    };
                    window.addEventListener('message', idleTick, false);
                    var animationTick = function (rafTime) {
                        isAnimationFrameScheduled = false;
                        var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
                        if (nextFrameTime < activeFrameTime && previousFrameTime < activeFrameTime) {
                            if (nextFrameTime < 8) {
                                nextFrameTime = 8;
                            }
                            activeFrameTime = nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
                        } else {
                            previousFrameTime = nextFrameTime;
                        }
                        frameDeadline = rafTime + activeFrameTime;
                        if (!isIdleScheduled) {
                            isIdleScheduled = true;
                            window.postMessage(messageKey, '*');
                        }
                    };
                    rIC = function (callback, options) {
                        scheduledRICCallback = callback;
                        if (options != null && typeof options.timeout === 'number') {
                            timeoutTime = now() + options.timeout;
                        }
                        if (!isAnimationFrameScheduled) {
                            isAnimationFrameScheduled = true;
                            requestAnimationFrame(animationTick);
                        }
                        return 0;
                    };
                    cIC = function () {
                        scheduledRICCallback = null;
                        isIdleScheduled = false;
                        timeoutTime = -1;
                    };
                } else {
                    rIC = window.requestIdleCallback;
                    cIC = window.cancelIdleCallback;
                }
                var lowPriorityWarning = function () {
                };
                {
                    var printWarning = function (format) {
                        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                            args[_key - 1] = arguments[_key];
                        }
                        var argIndex = 0;
                        var message = 'Warning: ' + format.replace(/%s/g, function () {
                            return args[argIndex++];
                        });
                        if (typeof console !== 'undefined') {
                            console.warn(message);
                        }
                        try {
                            throw new Error(message);
                        } catch (x) {
                        }
                    };
                    lowPriorityWarning = function (condition, format) {
                        if (format === undefined) {
                            throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
                        }
                        if (!condition) {
                            for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                                args[_key2 - 2] = arguments[_key2];
                            }
                            printWarning.apply(undefined, [format].concat(args));
                        }
                    };
                }
                var lowPriorityWarning$1 = lowPriorityWarning;
                var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
                var illegalAttributeNameCache = {};
                var validatedAttributeNameCache = {};
                function isAttributeNameSafe(attributeName) {
                    if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
                        return true;
                    }
                    if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
                        return false;
                    }
                    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
                        validatedAttributeNameCache[attributeName] = true;
                        return true;
                    }
                    illegalAttributeNameCache[attributeName] = true;
                    {
                        warning(false, 'Invalid attribute name: `%s`', attributeName);
                    }
                    return false;
                }
                function shouldIgnoreValue(propertyInfo, value) {
                    return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
                }
                function getValueForProperty(node, name, expected) {
                    {
                        var propertyInfo = getPropertyInfo(name);
                        if (propertyInfo) {
                            var mutationMethod = propertyInfo.mutationMethod;
                            if (mutationMethod || propertyInfo.mustUseProperty) {
                                return node[propertyInfo.propertyName];
                            } else {
                                var attributeName = propertyInfo.attributeName;
                                var stringValue = null;
                                if (propertyInfo.hasOverloadedBooleanValue) {
                                    if (node.hasAttribute(attributeName)) {
                                        var value = node.getAttribute(attributeName);
                                        if (value === '') {
                                            return true;
                                        }
                                        if (shouldIgnoreValue(propertyInfo, expected)) {
                                            return value;
                                        }
                                        if (value === '' + expected) {
                                            return expected;
                                        }
                                        return value;
                                    }
                                } else if (node.hasAttribute(attributeName)) {
                                    if (shouldIgnoreValue(propertyInfo, expected)) {
                                        return node.getAttribute(attributeName);
                                    }
                                    if (propertyInfo.hasBooleanValue) {
                                        return expected;
                                    }
                                    stringValue = node.getAttribute(attributeName);
                                }
                                if (shouldIgnoreValue(propertyInfo, expected)) {
                                    return stringValue === null ? expected : stringValue;
                                } else if (stringValue === '' + expected) {
                                    return expected;
                                } else {
                                    return stringValue;
                                }
                            }
                        }
                    }
                }
                function getValueForAttribute(node, name, expected) {
                    {
                        if (!isAttributeNameSafe(name)) {
                            return;
                        }
                        if (!node.hasAttribute(name)) {
                            return expected === undefined ? undefined : null;
                        }
                        var value = node.getAttribute(name);
                        if (value === '' + expected) {
                            return expected;
                        }
                        return value;
                    }
                }
                function setValueForProperty(node, name, value) {
                    var propertyInfo = getPropertyInfo(name);
                    if (propertyInfo && shouldSetAttribute(name, value)) {
                        var mutationMethod = propertyInfo.mutationMethod;
                        if (mutationMethod) {
                            mutationMethod(node, value);
                        } else if (shouldIgnoreValue(propertyInfo, value)) {
                            deleteValueForProperty(node, name);
                            return;
                        } else if (propertyInfo.mustUseProperty) {
                            node[propertyInfo.propertyName] = value;
                        } else {
                            var attributeName = propertyInfo.attributeName;
                            var namespace = propertyInfo.attributeNamespace;
                            if (namespace) {
                                node.setAttributeNS(namespace, attributeName, '' + value);
                            } else if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
                                node.setAttribute(attributeName, '');
                            } else {
                                node.setAttribute(attributeName, '' + value);
                            }
                        }
                    } else {
                        setValueForAttribute(node, name, shouldSetAttribute(name, value) ? value : null);
                        return;
                    }
                    {
                    }
                }
                function setValueForAttribute(node, name, value) {
                    if (!isAttributeNameSafe(name)) {
                        return;
                    }
                    if (value == null) {
                        node.removeAttribute(name);
                    } else {
                        node.setAttribute(name, '' + value);
                    }
                    {
                    }
                }
                function deleteValueForAttribute(node, name) {
                    node.removeAttribute(name);
                }
                function deleteValueForProperty(node, name) {
                    var propertyInfo = getPropertyInfo(name);
                    if (propertyInfo) {
                        var mutationMethod = propertyInfo.mutationMethod;
                        if (mutationMethod) {
                            mutationMethod(node, undefined);
                        } else if (propertyInfo.mustUseProperty) {
                            var propName = propertyInfo.propertyName;
                            if (propertyInfo.hasBooleanValue) {
                                node[propName] = false;
                            } else {
                                node[propName] = '';
                            }
                        } else {
                            node.removeAttribute(propertyInfo.attributeName);
                        }
                    } else {
                        node.removeAttribute(name);
                    }
                }
                var ReactControlledValuePropTypes = { checkPropTypes: null };
                {
                    var hasReadOnlyValue = {
                        button: true,
                        checkbox: true,
                        image: true,
                        hidden: true,
                        radio: true,
                        reset: true,
                        submit: true
                    };
                    var propTypes = {
                        value: function (props, propName, componentName) {
                            if (!props[propName] || hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled) {
                                return null;
                            }
                            return new Error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
                        },
                        checked: function (props, propName, componentName) {
                            if (!props[propName] || props.onChange || props.readOnly || props.disabled) {
                                return null;
                            }
                            return new Error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
                        }
                    };
                    ReactControlledValuePropTypes.checkPropTypes = function (tagName, props, getStack) {
                        checkPropTypes(propTypes, props, 'prop', tagName, getStack);
                    };
                }
                var getCurrentFiberOwnerName$2 = ReactDebugCurrentFiber.getCurrentFiberOwnerName;
                var getCurrentFiberStackAddendum$3 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;
                var didWarnValueDefaultValue = false;
                var didWarnCheckedDefaultChecked = false;
                var didWarnControlledToUncontrolled = false;
                var didWarnUncontrolledToControlled = false;
                function isControlled(props) {
                    var usesChecked = props.type === 'checkbox' || props.type === 'radio';
                    return usesChecked ? props.checked != null : props.value != null;
                }
                function getHostProps(element, props) {
                    var node = element;
                    var value = props.value;
                    var checked = props.checked;
                    var hostProps = _assign({
                        type: undefined,
                        step: undefined,
                        min: undefined,
                        max: undefined
                    }, props, {
                        defaultChecked: undefined,
                        defaultValue: undefined,
                        value: value != null ? value : node._wrapperState.initialValue,
                        checked: checked != null ? checked : node._wrapperState.initialChecked
                    });
                    return hostProps;
                }
                function initWrapperState(element, props) {
                    {
                        ReactControlledValuePropTypes.checkPropTypes('input', props, getCurrentFiberStackAddendum$3);
                        if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnCheckedDefaultChecked) {
                            warning(false, '%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerName$2() || 'A component', props.type);
                            didWarnCheckedDefaultChecked = true;
                        }
                        if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
                            warning(false, '%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerName$2() || 'A component', props.type);
                            didWarnValueDefaultValue = true;
                        }
                    }
                    var defaultValue = props.defaultValue;
                    var node = element;
                    node._wrapperState = {
                        initialChecked: props.checked != null ? props.checked : props.defaultChecked,
                        initialValue: props.value != null ? props.value : defaultValue,
                        controlled: isControlled(props)
                    };
                }
                function updateChecked(element, props) {
                    var node = element;
                    var checked = props.checked;
                    if (checked != null) {
                        setValueForProperty(node, 'checked', checked);
                    }
                }
                function updateWrapper(element, props) {
                    var node = element;
                    {
                        var controlled = isControlled(props);
                        if (!node._wrapperState.controlled && controlled && !didWarnUncontrolledToControlled) {
                            warning(false, 'A component is changing an uncontrolled input of type %s to be controlled. ' + 'Input elements should not switch from uncontrolled to controlled (or vice versa). ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://fb.me/react-controlled-components%s', props.type, getCurrentFiberStackAddendum$3());
                            didWarnUncontrolledToControlled = true;
                        }
                        if (node._wrapperState.controlled && !controlled && !didWarnControlledToUncontrolled) {
                            warning(false, 'A component is changing a controlled input of type %s to be uncontrolled. ' + 'Input elements should not switch from controlled to uncontrolled (or vice versa). ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://fb.me/react-controlled-components%s', props.type, getCurrentFiberStackAddendum$3());
                            didWarnControlledToUncontrolled = true;
                        }
                    }
                    updateChecked(element, props);
                    var value = props.value;
                    if (value != null) {
                        if (value === 0 && node.value === '') {
                            node.value = '0';
                        } else if (props.type === 'number') {
                            var valueAsNumber = parseFloat(node.value) || 0;
                            if (value != valueAsNumber || value == valueAsNumber && node.value != value) {
                                node.value = '' + value;
                            }
                        } else if (node.value !== '' + value) {
                            node.value = '' + value;
                        }
                    } else {
                        if (props.value == null && props.defaultValue != null) {
                            if (node.defaultValue !== '' + props.defaultValue) {
                                node.defaultValue = '' + props.defaultValue;
                            }
                        }
                        if (props.checked == null && props.defaultChecked != null) {
                            node.defaultChecked = !!props.defaultChecked;
                        }
                    }
                }
                function postMountWrapper(element, props) {
                    var node = element;
                    switch (props.type) {
                    case 'submit':
                    case 'reset':
                        break;
                    case 'color':
                    case 'date':
                    case 'datetime':
                    case 'datetime-local':
                    case 'month':
                    case 'time':
                    case 'week':
                        node.value = '';
                        node.value = node.defaultValue;
                        break;
                    default:
                        node.value = node.value;
                        break;
                    }
                    var name = node.name;
                    if (name !== '') {
                        node.name = '';
                    }
                    node.defaultChecked = !node.defaultChecked;
                    node.defaultChecked = !node.defaultChecked;
                    if (name !== '') {
                        node.name = name;
                    }
                }
                function restoreControlledState$1(element, props) {
                    var node = element;
                    updateWrapper(node, props);
                    updateNamedCousins(node, props);
                }
                function updateNamedCousins(rootNode, props) {
                    var name = props.name;
                    if (props.type === 'radio' && name != null) {
                        var queryRoot = rootNode;
                        while (queryRoot.parentNode) {
                            queryRoot = queryRoot.parentNode;
                        }
                        var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');
                        for (var i = 0; i < group.length; i++) {
                            var otherNode = group[i];
                            if (otherNode === rootNode || otherNode.form !== rootNode.form) {
                                continue;
                            }
                            var otherProps = getFiberCurrentPropsFromNode$1(otherNode);
                            !otherProps ? invariant(false, 'ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.') : void 0;
                            updateValueIfChanged(otherNode);
                            updateWrapper(otherNode, otherProps);
                        }
                    }
                }
                function flattenChildren(children) {
                    var content = '';
                    React.Children.forEach(children, function (child) {
                        if (child == null) {
                            return;
                        }
                        if (typeof child === 'string' || typeof child === 'number') {
                            content += child;
                        }
                    });
                    return content;
                }
                function validateProps(element, props) {
                    {
                        warning(props.selected == null, 'Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.');
                    }
                }
                function postMountWrapper$1(element, props) {
                    if (props.value != null) {
                        element.setAttribute('value', props.value);
                    }
                }
                function getHostProps$1(element, props) {
                    var hostProps = _assign({ children: undefined }, props);
                    var content = flattenChildren(props.children);
                    if (content) {
                        hostProps.children = content;
                    }
                    return hostProps;
                }
                var getCurrentFiberOwnerName$3 = ReactDebugCurrentFiber.getCurrentFiberOwnerName;
                var getCurrentFiberStackAddendum$4 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;
                {
                    var didWarnValueDefaultValue$1 = false;
                }
                function getDeclarationErrorAddendum() {
                    var ownerName = getCurrentFiberOwnerName$3();
                    if (ownerName) {
                        return '\n\nCheck the render method of `' + ownerName + '`.';
                    }
                    return '';
                }
                var valuePropNames = [
                    'value',
                    'defaultValue'
                ];
                function checkSelectPropTypes(props) {
                    ReactControlledValuePropTypes.checkPropTypes('select', props, getCurrentFiberStackAddendum$4);
                    for (var i = 0; i < valuePropNames.length; i++) {
                        var propName = valuePropNames[i];
                        if (props[propName] == null) {
                            continue;
                        }
                        var isArray = Array.isArray(props[propName]);
                        if (props.multiple && !isArray) {
                            warning(false, 'The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum());
                        } else if (!props.multiple && isArray) {
                            warning(false, 'The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum());
                        }
                    }
                }
                function updateOptions(node, multiple, propValue, setDefaultSelected) {
                    var options = node.options;
                    if (multiple) {
                        var selectedValues = propValue;
                        var selectedValue = {};
                        for (var i = 0; i < selectedValues.length; i++) {
                            selectedValue['$' + selectedValues[i]] = true;
                        }
                        for (var _i = 0; _i < options.length; _i++) {
                            var selected = selectedValue.hasOwnProperty('$' + options[_i].value);
                            if (options[_i].selected !== selected) {
                                options[_i].selected = selected;
                            }
                            if (selected && setDefaultSelected) {
                                options[_i].defaultSelected = true;
                            }
                        }
                    } else {
                        var _selectedValue = '' + propValue;
                        var defaultSelected = null;
                        for (var _i2 = 0; _i2 < options.length; _i2++) {
                            if (options[_i2].value === _selectedValue) {
                                options[_i2].selected = true;
                                if (setDefaultSelected) {
                                    options[_i2].defaultSelected = true;
                                }
                                return;
                            }
                            if (defaultSelected === null && !options[_i2].disabled) {
                                defaultSelected = options[_i2];
                            }
                        }
                        if (defaultSelected !== null) {
                            defaultSelected.selected = true;
                        }
                    }
                }
                function getHostProps$2(element, props) {
                    return _assign({}, props, { value: undefined });
                }
                function initWrapperState$1(element, props) {
                    var node = element;
                    {
                        checkSelectPropTypes(props);
                    }
                    var value = props.value;
                    node._wrapperState = {
                        initialValue: value != null ? value : props.defaultValue,
                        wasMultiple: !!props.multiple
                    };
                    {
                        if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue$1) {
                            warning(false, 'Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components');
                            didWarnValueDefaultValue$1 = true;
                        }
                    }
                }
                function postMountWrapper$2(element, props) {
                    var node = element;
                    node.multiple = !!props.multiple;
                    var value = props.value;
                    if (value != null) {
                        updateOptions(node, !!props.multiple, value, false);
                    } else if (props.defaultValue != null) {
                        updateOptions(node, !!props.multiple, props.defaultValue, true);
                    }
                }
                function postUpdateWrapper(element, props) {
                    var node = element;
                    node._wrapperState.initialValue = undefined;
                    var wasMultiple = node._wrapperState.wasMultiple;
                    node._wrapperState.wasMultiple = !!props.multiple;
                    var value = props.value;
                    if (value != null) {
                        updateOptions(node, !!props.multiple, value, false);
                    } else if (wasMultiple !== !!props.multiple) {
                        if (props.defaultValue != null) {
                            updateOptions(node, !!props.multiple, props.defaultValue, true);
                        } else {
                            updateOptions(node, !!props.multiple, props.multiple ? [] : '', false);
                        }
                    }
                }
                function restoreControlledState$2(element, props) {
                    var node = element;
                    var value = props.value;
                    if (value != null) {
                        updateOptions(node, !!props.multiple, value, false);
                    }
                }
                var getCurrentFiberStackAddendum$5 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;
                var didWarnValDefaultVal = false;
                function getHostProps$3(element, props) {
                    var node = element;
                    !(props.dangerouslySetInnerHTML == null) ? invariant(false, '`dangerouslySetInnerHTML` does not make sense on <textarea>.') : void 0;
                    var hostProps = _assign({}, props, {
                        value: undefined,
                        defaultValue: undefined,
                        children: '' + node._wrapperState.initialValue
                    });
                    return hostProps;
                }
                function initWrapperState$2(element, props) {
                    var node = element;
                    {
                        ReactControlledValuePropTypes.checkPropTypes('textarea', props, getCurrentFiberStackAddendum$5);
                        if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValDefaultVal) {
                            warning(false, 'Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components');
                            didWarnValDefaultVal = true;
                        }
                    }
                    var initialValue = props.value;
                    if (initialValue == null) {
                        var defaultValue = props.defaultValue;
                        var children = props.children;
                        if (children != null) {
                            {
                                warning(false, 'Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
                            }
                            !(defaultValue == null) ? invariant(false, 'If you supply `defaultValue` on a <textarea>, do not pass children.') : void 0;
                            if (Array.isArray(children)) {
                                !(children.length <= 1) ? invariant(false, '<textarea> can only have at most one child.') : void 0;
                                children = children[0];
                            }
                            defaultValue = '' + children;
                        }
                        if (defaultValue == null) {
                            defaultValue = '';
                        }
                        initialValue = defaultValue;
                    }
                    node._wrapperState = { initialValue: '' + initialValue };
                }
                function updateWrapper$1(element, props) {
                    var node = element;
                    var value = props.value;
                    if (value != null) {
                        var newValue = '' + value;
                        if (newValue !== node.value) {
                            node.value = newValue;
                        }
                        if (props.defaultValue == null) {
                            node.defaultValue = newValue;
                        }
                    }
                    if (props.defaultValue != null) {
                        node.defaultValue = props.defaultValue;
                    }
                }
                function postMountWrapper$3(element, props) {
                    var node = element;
                    var textContent = node.textContent;
                    if (textContent === node._wrapperState.initialValue) {
                        node.value = textContent;
                    }
                }
                function restoreControlledState$3(element, props) {
                    updateWrapper$1(element, props);
                }
                var HTML_NAMESPACE$1 = 'http://www.w3.org/1999/xhtml';
                var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
                var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
                var Namespaces = {
                    html: HTML_NAMESPACE$1,
                    mathml: MATH_NAMESPACE,
                    svg: SVG_NAMESPACE
                };
                function getIntrinsicNamespace(type) {
                    switch (type) {
                    case 'svg':
                        return SVG_NAMESPACE;
                    case 'math':
                        return MATH_NAMESPACE;
                    default:
                        return HTML_NAMESPACE$1;
                    }
                }
                function getChildNamespace(parentNamespace, type) {
                    if (parentNamespace == null || parentNamespace === HTML_NAMESPACE$1) {
                        return getIntrinsicNamespace(type);
                    }
                    if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
                        return HTML_NAMESPACE$1;
                    }
                    return parentNamespace;
                }
                var createMicrosoftUnsafeLocalFunction = function (func) {
                    if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
                        return function (arg0, arg1, arg2, arg3) {
                            MSApp.execUnsafeLocalFunction(function () {
                                return func(arg0, arg1, arg2, arg3);
                            });
                        };
                    } else {
                        return func;
                    }
                };
                var reusableSVGContainer = void 0;
                var setInnerHTML = createMicrosoftUnsafeLocalFunction(function (node, html) {
                    if (node.namespaceURI === Namespaces.svg && !('innerHTML' in node)) {
                        reusableSVGContainer = reusableSVGContainer || document.createElement('div');
                        reusableSVGContainer.innerHTML = '<svg>' + html + '</svg>';
                        var svgNode = reusableSVGContainer.firstChild;
                        while (node.firstChild) {
                            node.removeChild(node.firstChild);
                        }
                        while (svgNode.firstChild) {
                            node.appendChild(svgNode.firstChild);
                        }
                    } else {
                        node.innerHTML = html;
                    }
                });
                var setTextContent = function (node, text) {
                    if (text) {
                        var firstChild = node.firstChild;
                        if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
                            firstChild.nodeValue = text;
                            return;
                        }
                    }
                    node.textContent = text;
                };
                var isUnitlessNumber = {
                    animationIterationCount: true,
                    borderImageOutset: true,
                    borderImageSlice: true,
                    borderImageWidth: true,
                    boxFlex: true,
                    boxFlexGroup: true,
                    boxOrdinalGroup: true,
                    columnCount: true,
                    columns: true,
                    flex: true,
                    flexGrow: true,
                    flexPositive: true,
                    flexShrink: true,
                    flexNegative: true,
                    flexOrder: true,
                    gridRow: true,
                    gridRowEnd: true,
                    gridRowSpan: true,
                    gridRowStart: true,
                    gridColumn: true,
                    gridColumnEnd: true,
                    gridColumnSpan: true,
                    gridColumnStart: true,
                    fontWeight: true,
                    lineClamp: true,
                    lineHeight: true,
                    opacity: true,
                    order: true,
                    orphans: true,
                    tabSize: true,
                    widows: true,
                    zIndex: true,
                    zoom: true,
                    fillOpacity: true,
                    floodOpacity: true,
                    stopOpacity: true,
                    strokeDasharray: true,
                    strokeDashoffset: true,
                    strokeMiterlimit: true,
                    strokeOpacity: true,
                    strokeWidth: true
                };
                function prefixKey(prefix, key) {
                    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
                }
                var prefixes = [
                    'Webkit',
                    'ms',
                    'Moz',
                    'O'
                ];
                Object.keys(isUnitlessNumber).forEach(function (prop) {
                    prefixes.forEach(function (prefix) {
                        isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
                    });
                });
                function dangerousStyleValue(name, value, isCustomProperty) {
                    var isEmpty = value == null || typeof value === 'boolean' || value === '';
                    if (isEmpty) {
                        return '';
                    }
                    if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
                        return value + 'px';
                    }
                    return ('' + value).trim();
                }
                var warnValidStyle = emptyFunction;
                {
                    var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
                    var badStyleValueWithSemicolonPattern = /;\s*$/;
                    var warnedStyleNames = {};
                    var warnedStyleValues = {};
                    var warnedForNaNValue = false;
                    var warnedForInfinityValue = false;
                    var warnHyphenatedStyleName = function (name, getStack) {
                        if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
                            return;
                        }
                        warnedStyleNames[name] = true;
                        warning(false, 'Unsupported style property %s. Did you mean %s?%s', name, camelizeStyleName(name), getStack());
                    };
                    var warnBadVendoredStyleName = function (name, getStack) {
                        if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
                            return;
                        }
                        warnedStyleNames[name] = true;
                        warning(false, 'Unsupported vendor-prefixed style property %s. Did you mean %s?%s', name, name.charAt(0).toUpperCase() + name.slice(1), getStack());
                    };
                    var warnStyleValueWithSemicolon = function (name, value, getStack) {
                        if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
                            return;
                        }
                        warnedStyleValues[value] = true;
                        warning(false, 'Style property values shouldn\'t contain a semicolon. ' + 'Try "%s: %s" instead.%s', name, value.replace(badStyleValueWithSemicolonPattern, ''), getStack());
                    };
                    var warnStyleValueIsNaN = function (name, value, getStack) {
                        if (warnedForNaNValue) {
                            return;
                        }
                        warnedForNaNValue = true;
                        warning(false, '`NaN` is an invalid value for the `%s` css style property.%s', name, getStack());
                    };
                    var warnStyleValueIsInfinity = function (name, value, getStack) {
                        if (warnedForInfinityValue) {
                            return;
                        }
                        warnedForInfinityValue = true;
                        warning(false, '`Infinity` is an invalid value for the `%s` css style property.%s', name, getStack());
                    };
                    warnValidStyle = function (name, value, getStack) {
                        if (name.indexOf('-') > -1) {
                            warnHyphenatedStyleName(name, getStack);
                        } else if (badVendoredStyleNamePattern.test(name)) {
                            warnBadVendoredStyleName(name, getStack);
                        } else if (badStyleValueWithSemicolonPattern.test(value)) {
                            warnStyleValueWithSemicolon(name, value, getStack);
                        }
                        if (typeof value === 'number') {
                            if (isNaN(value)) {
                                warnStyleValueIsNaN(name, value, getStack);
                            } else if (!isFinite(value)) {
                                warnStyleValueIsInfinity(name, value, getStack);
                            }
                        }
                    };
                }
                var warnValidStyle$1 = warnValidStyle;
                function createDangerousStringForStyles(styles) {
                    {
                        var serialized = '';
                        var delimiter = '';
                        for (var styleName in styles) {
                            if (!styles.hasOwnProperty(styleName)) {
                                continue;
                            }
                            var styleValue = styles[styleName];
                            if (styleValue != null) {
                                var isCustomProperty = styleName.indexOf('--') === 0;
                                serialized += delimiter + hyphenateStyleName(styleName) + ':';
                                serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);
                                delimiter = ';';
                            }
                        }
                        return serialized || null;
                    }
                }
                function setValueForStyles(node, styles, getStack) {
                    var style = node.style;
                    for (var styleName in styles) {
                        if (!styles.hasOwnProperty(styleName)) {
                            continue;
                        }
                        var isCustomProperty = styleName.indexOf('--') === 0;
                        {
                            if (!isCustomProperty) {
                                warnValidStyle$1(styleName, styles[styleName], getStack);
                            }
                        }
                        var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);
                        if (styleName === 'float') {
                            styleName = 'cssFloat';
                        }
                        if (isCustomProperty) {
                            style.setProperty(styleName, styleValue);
                        } else {
                            style[styleName] = styleValue;
                        }
                    }
                }
                var omittedCloseTags = {
                    area: true,
                    base: true,
                    br: true,
                    col: true,
                    embed: true,
                    hr: true,
                    img: true,
                    input: true,
                    keygen: true,
                    link: true,
                    meta: true,
                    param: true,
                    source: true,
                    track: true,
                    wbr: true
                };
                var voidElementTags = _assign({ menuitem: true }, omittedCloseTags);
                var HTML$1 = '__html';
                function assertValidProps(tag, props, getStack) {
                    if (!props) {
                        return;
                    }
                    if (voidElementTags[tag]) {
                        !(props.children == null && props.dangerouslySetInnerHTML == null) ? invariant(false, '%s is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.%s', tag, getStack()) : void 0;
                    }
                    if (props.dangerouslySetInnerHTML != null) {
                        !(props.children == null) ? invariant(false, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.') : void 0;
                        !(typeof props.dangerouslySetInnerHTML === 'object' && HTML$1 in props.dangerouslySetInnerHTML) ? invariant(false, '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.') : void 0;
                    }
                    {
                        warning(props.suppressContentEditableWarning || !props.contentEditable || props.children == null, 'A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.%s', getStack());
                    }
                    !(props.style == null || typeof props.style === 'object') ? invariant(false, 'The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + \'em\'}} when using JSX.%s', getStack()) : void 0;
                }
                function isCustomComponent(tagName, props) {
                    if (tagName.indexOf('-') === -1) {
                        return typeof props.is === 'string';
                    }
                    switch (tagName) {
                    case 'annotation-xml':
                    case 'color-profile':
                    case 'font-face':
                    case 'font-face-src':
                    case 'font-face-uri':
                    case 'font-face-format':
                    case 'font-face-name':
                    case 'missing-glyph':
                        return false;
                    default:
                        return true;
                    }
                }
                var ariaProperties = {
                    'aria-current': 0,
                    'aria-details': 0,
                    'aria-disabled': 0,
                    'aria-hidden': 0,
                    'aria-invalid': 0,
                    'aria-keyshortcuts': 0,
                    'aria-label': 0,
                    'aria-roledescription': 0,
                    'aria-autocomplete': 0,
                    'aria-checked': 0,
                    'aria-expanded': 0,
                    'aria-haspopup': 0,
                    'aria-level': 0,
                    'aria-modal': 0,
                    'aria-multiline': 0,
                    'aria-multiselectable': 0,
                    'aria-orientation': 0,
                    'aria-placeholder': 0,
                    'aria-pressed': 0,
                    'aria-readonly': 0,
                    'aria-required': 0,
                    'aria-selected': 0,
                    'aria-sort': 0,
                    'aria-valuemax': 0,
                    'aria-valuemin': 0,
                    'aria-valuenow': 0,
                    'aria-valuetext': 0,
                    'aria-atomic': 0,
                    'aria-busy': 0,
                    'aria-live': 0,
                    'aria-relevant': 0,
                    'aria-dropeffect': 0,
                    'aria-grabbed': 0,
                    'aria-activedescendant': 0,
                    'aria-colcount': 0,
                    'aria-colindex': 0,
                    'aria-colspan': 0,
                    'aria-controls': 0,
                    'aria-describedby': 0,
                    'aria-errormessage': 0,
                    'aria-flowto': 0,
                    'aria-labelledby': 0,
                    'aria-owns': 0,
                    'aria-posinset': 0,
                    'aria-rowcount': 0,
                    'aria-rowindex': 0,
                    'aria-rowspan': 0,
                    'aria-setsize': 0
                };
                var warnedProperties = {};
                var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
                var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
                var hasOwnProperty = Object.prototype.hasOwnProperty;
                function getStackAddendum() {
                    var stack = ReactDebugCurrentFrame.getStackAddendum();
                    return stack != null ? stack : '';
                }
                function validateProperty(tagName, name) {
                    if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
                        return true;
                    }
                    if (rARIACamel.test(name)) {
                        var ariaName = 'aria-' + name.slice(4).toLowerCase();
                        var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;
                        if (correctName == null) {
                            warning(false, 'Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.%s', name, getStackAddendum());
                            warnedProperties[name] = true;
                            return true;
                        }
                        if (name !== correctName) {
                            warning(false, 'Invalid ARIA attribute `%s`. Did you mean `%s`?%s', name, correctName, getStackAddendum());
                            warnedProperties[name] = true;
                            return true;
                        }
                    }
                    if (rARIA.test(name)) {
                        var lowerCasedName = name.toLowerCase();
                        var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;
                        if (standardName == null) {
                            warnedProperties[name] = true;
                            return false;
                        }
                        if (name !== standardName) {
                            warning(false, 'Unknown ARIA attribute `%s`. Did you mean `%s`?%s', name, standardName, getStackAddendum());
                            warnedProperties[name] = true;
                            return true;
                        }
                    }
                    return true;
                }
                function warnInvalidARIAProps(type, props) {
                    var invalidProps = [];
                    for (var key in props) {
                        var isValid = validateProperty(type, key);
                        if (!isValid) {
                            invalidProps.push(key);
                        }
                    }
                    var unknownPropString = invalidProps.map(function (prop) {
                        return '`' + prop + '`';
                    }).join(', ');
                    if (invalidProps.length === 1) {
                        warning(false, 'Invalid aria prop %s on <%s> tag. ' + 'For details, see https://fb.me/invalid-aria-prop%s', unknownPropString, type, getStackAddendum());
                    } else if (invalidProps.length > 1) {
                        warning(false, 'Invalid aria props %s on <%s> tag. ' + 'For details, see https://fb.me/invalid-aria-prop%s', unknownPropString, type, getStackAddendum());
                    }
                }
                function validateProperties(type, props) {
                    if (isCustomComponent(type, props)) {
                        return;
                    }
                    warnInvalidARIAProps(type, props);
                }
                var didWarnValueNull = false;
                function getStackAddendum$1() {
                    var stack = ReactDebugCurrentFrame.getStackAddendum();
                    return stack != null ? stack : '';
                }
                function validateProperties$1(type, props) {
                    if (type !== 'input' && type !== 'textarea' && type !== 'select') {
                        return;
                    }
                    if (props != null && props.value === null && !didWarnValueNull) {
                        didWarnValueNull = true;
                        if (type === 'select' && props.multiple) {
                            warning(false, '`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.%s', type, getStackAddendum$1());
                        } else {
                            warning(false, '`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.%s', type, getStackAddendum$1());
                        }
                    }
                }
                var possibleStandardNames = {
                    accept: 'accept',
                    acceptcharset: 'acceptCharset',
                    'accept-charset': 'acceptCharset',
                    accesskey: 'accessKey',
                    action: 'action',
                    allowfullscreen: 'allowFullScreen',
                    alt: 'alt',
                    as: 'as',
                    async: 'async',
                    autocapitalize: 'autoCapitalize',
                    autocomplete: 'autoComplete',
                    autocorrect: 'autoCorrect',
                    autofocus: 'autoFocus',
                    autoplay: 'autoPlay',
                    autosave: 'autoSave',
                    capture: 'capture',
                    cellpadding: 'cellPadding',
                    cellspacing: 'cellSpacing',
                    challenge: 'challenge',
                    charset: 'charSet',
                    checked: 'checked',
                    children: 'children',
                    cite: 'cite',
                    'class': 'className',
                    classid: 'classID',
                    classname: 'className',
                    cols: 'cols',
                    colspan: 'colSpan',
                    content: 'content',
                    contenteditable: 'contentEditable',
                    contextmenu: 'contextMenu',
                    controls: 'controls',
                    controlslist: 'controlsList',
                    coords: 'coords',
                    crossorigin: 'crossOrigin',
                    dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
                    data: 'data',
                    datetime: 'dateTime',
                    'default': 'default',
                    defaultchecked: 'defaultChecked',
                    defaultvalue: 'defaultValue',
                    defer: 'defer',
                    dir: 'dir',
                    disabled: 'disabled',
                    download: 'download',
                    draggable: 'draggable',
                    enctype: 'encType',
                    'for': 'htmlFor',
                    form: 'form',
                    formmethod: 'formMethod',
                    formaction: 'formAction',
                    formenctype: 'formEncType',
                    formnovalidate: 'formNoValidate',
                    formtarget: 'formTarget',
                    frameborder: 'frameBorder',
                    headers: 'headers',
                    height: 'height',
                    hidden: 'hidden',
                    high: 'high',
                    href: 'href',
                    hreflang: 'hrefLang',
                    htmlfor: 'htmlFor',
                    httpequiv: 'httpEquiv',
                    'http-equiv': 'httpEquiv',
                    icon: 'icon',
                    id: 'id',
                    innerhtml: 'innerHTML',
                    inputmode: 'inputMode',
                    integrity: 'integrity',
                    is: 'is',
                    itemid: 'itemID',
                    itemprop: 'itemProp',
                    itemref: 'itemRef',
                    itemscope: 'itemScope',
                    itemtype: 'itemType',
                    keyparams: 'keyParams',
                    keytype: 'keyType',
                    kind: 'kind',
                    label: 'label',
                    lang: 'lang',
                    list: 'list',
                    loop: 'loop',
                    low: 'low',
                    manifest: 'manifest',
                    marginwidth: 'marginWidth',
                    marginheight: 'marginHeight',
                    max: 'max',
                    maxlength: 'maxLength',
                    media: 'media',
                    mediagroup: 'mediaGroup',
                    method: 'method',
                    min: 'min',
                    minlength: 'minLength',
                    multiple: 'multiple',
                    muted: 'muted',
                    name: 'name',
                    nonce: 'nonce',
                    novalidate: 'noValidate',
                    open: 'open',
                    optimum: 'optimum',
                    pattern: 'pattern',
                    placeholder: 'placeholder',
                    playsinline: 'playsInline',
                    poster: 'poster',
                    preload: 'preload',
                    profile: 'profile',
                    radiogroup: 'radioGroup',
                    readonly: 'readOnly',
                    referrerpolicy: 'referrerPolicy',
                    rel: 'rel',
                    required: 'required',
                    reversed: 'reversed',
                    role: 'role',
                    rows: 'rows',
                    rowspan: 'rowSpan',
                    sandbox: 'sandbox',
                    scope: 'scope',
                    scoped: 'scoped',
                    scrolling: 'scrolling',
                    seamless: 'seamless',
                    selected: 'selected',
                    shape: 'shape',
                    size: 'size',
                    sizes: 'sizes',
                    span: 'span',
                    spellcheck: 'spellCheck',
                    src: 'src',
                    srcdoc: 'srcDoc',
                    srclang: 'srcLang',
                    srcset: 'srcSet',
                    start: 'start',
                    step: 'step',
                    style: 'style',
                    summary: 'summary',
                    tabindex: 'tabIndex',
                    target: 'target',
                    title: 'title',
                    type: 'type',
                    usemap: 'useMap',
                    value: 'value',
                    width: 'width',
                    wmode: 'wmode',
                    wrap: 'wrap',
                    about: 'about',
                    accentheight: 'accentHeight',
                    'accent-height': 'accentHeight',
                    accumulate: 'accumulate',
                    additive: 'additive',
                    alignmentbaseline: 'alignmentBaseline',
                    'alignment-baseline': 'alignmentBaseline',
                    allowreorder: 'allowReorder',
                    alphabetic: 'alphabetic',
                    amplitude: 'amplitude',
                    arabicform: 'arabicForm',
                    'arabic-form': 'arabicForm',
                    ascent: 'ascent',
                    attributename: 'attributeName',
                    attributetype: 'attributeType',
                    autoreverse: 'autoReverse',
                    azimuth: 'azimuth',
                    basefrequency: 'baseFrequency',
                    baselineshift: 'baselineShift',
                    'baseline-shift': 'baselineShift',
                    baseprofile: 'baseProfile',
                    bbox: 'bbox',
                    begin: 'begin',
                    bias: 'bias',
                    by: 'by',
                    calcmode: 'calcMode',
                    capheight: 'capHeight',
                    'cap-height': 'capHeight',
                    clip: 'clip',
                    clippath: 'clipPath',
                    'clip-path': 'clipPath',
                    clippathunits: 'clipPathUnits',
                    cliprule: 'clipRule',
                    'clip-rule': 'clipRule',
                    color: 'color',
                    colorinterpolation: 'colorInterpolation',
                    'color-interpolation': 'colorInterpolation',
                    colorinterpolationfilters: 'colorInterpolationFilters',
                    'color-interpolation-filters': 'colorInterpolationFilters',
                    colorprofile: 'colorProfile',
                    'color-profile': 'colorProfile',
                    colorrendering: 'colorRendering',
                    'color-rendering': 'colorRendering',
                    contentscripttype: 'contentScriptType',
                    contentstyletype: 'contentStyleType',
                    cursor: 'cursor',
                    cx: 'cx',
                    cy: 'cy',
                    d: 'd',
                    datatype: 'datatype',
                    decelerate: 'decelerate',
                    descent: 'descent',
                    diffuseconstant: 'diffuseConstant',
                    direction: 'direction',
                    display: 'display',
                    divisor: 'divisor',
                    dominantbaseline: 'dominantBaseline',
                    'dominant-baseline': 'dominantBaseline',
                    dur: 'dur',
                    dx: 'dx',
                    dy: 'dy',
                    edgemode: 'edgeMode',
                    elevation: 'elevation',
                    enablebackground: 'enableBackground',
                    'enable-background': 'enableBackground',
                    end: 'end',
                    exponent: 'exponent',
                    externalresourcesrequired: 'externalResourcesRequired',
                    fill: 'fill',
                    fillopacity: 'fillOpacity',
                    'fill-opacity': 'fillOpacity',
                    fillrule: 'fillRule',
                    'fill-rule': 'fillRule',
                    filter: 'filter',
                    filterres: 'filterRes',
                    filterunits: 'filterUnits',
                    floodopacity: 'floodOpacity',
                    'flood-opacity': 'floodOpacity',
                    floodcolor: 'floodColor',
                    'flood-color': 'floodColor',
                    focusable: 'focusable',
                    fontfamily: 'fontFamily',
                    'font-family': 'fontFamily',
                    fontsize: 'fontSize',
                    'font-size': 'fontSize',
                    fontsizeadjust: 'fontSizeAdjust',
                    'font-size-adjust': 'fontSizeAdjust',
                    fontstretch: 'fontStretch',
                    'font-stretch': 'fontStretch',
                    fontstyle: 'fontStyle',
                    'font-style': 'fontStyle',
                    fontvariant: 'fontVariant',
                    'font-variant': 'fontVariant',
                    fontweight: 'fontWeight',
                    'font-weight': 'fontWeight',
                    format: 'format',
                    from: 'from',
                    fx: 'fx',
                    fy: 'fy',
                    g1: 'g1',
                    g2: 'g2',
                    glyphname: 'glyphName',
                    'glyph-name': 'glyphName',
                    glyphorientationhorizontal: 'glyphOrientationHorizontal',
                    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
                    glyphorientationvertical: 'glyphOrientationVertical',
                    'glyph-orientation-vertical': 'glyphOrientationVertical',
                    glyphref: 'glyphRef',
                    gradienttransform: 'gradientTransform',
                    gradientunits: 'gradientUnits',
                    hanging: 'hanging',
                    horizadvx: 'horizAdvX',
                    'horiz-adv-x': 'horizAdvX',
                    horizoriginx: 'horizOriginX',
                    'horiz-origin-x': 'horizOriginX',
                    ideographic: 'ideographic',
                    imagerendering: 'imageRendering',
                    'image-rendering': 'imageRendering',
                    in2: 'in2',
                    'in': 'in',
                    inlist: 'inlist',
                    intercept: 'intercept',
                    k1: 'k1',
                    k2: 'k2',
                    k3: 'k3',
                    k4: 'k4',
                    k: 'k',
                    kernelmatrix: 'kernelMatrix',
                    kernelunitlength: 'kernelUnitLength',
                    kerning: 'kerning',
                    keypoints: 'keyPoints',
                    keysplines: 'keySplines',
                    keytimes: 'keyTimes',
                    lengthadjust: 'lengthAdjust',
                    letterspacing: 'letterSpacing',
                    'letter-spacing': 'letterSpacing',
                    lightingcolor: 'lightingColor',
                    'lighting-color': 'lightingColor',
                    limitingconeangle: 'limitingConeAngle',
                    local: 'local',
                    markerend: 'markerEnd',
                    'marker-end': 'markerEnd',
                    markerheight: 'markerHeight',
                    markermid: 'markerMid',
                    'marker-mid': 'markerMid',
                    markerstart: 'markerStart',
                    'marker-start': 'markerStart',
                    markerunits: 'markerUnits',
                    markerwidth: 'markerWidth',
                    mask: 'mask',
                    maskcontentunits: 'maskContentUnits',
                    maskunits: 'maskUnits',
                    mathematical: 'mathematical',
                    mode: 'mode',
                    numoctaves: 'numOctaves',
                    offset: 'offset',
                    opacity: 'opacity',
                    operator: 'operator',
                    order: 'order',
                    orient: 'orient',
                    orientation: 'orientation',
                    origin: 'origin',
                    overflow: 'overflow',
                    overlineposition: 'overlinePosition',
                    'overline-position': 'overlinePosition',
                    overlinethickness: 'overlineThickness',
                    'overline-thickness': 'overlineThickness',
                    paintorder: 'paintOrder',
                    'paint-order': 'paintOrder',
                    panose1: 'panose1',
                    'panose-1': 'panose1',
                    pathlength: 'pathLength',
                    patterncontentunits: 'patternContentUnits',
                    patterntransform: 'patternTransform',
                    patternunits: 'patternUnits',
                    pointerevents: 'pointerEvents',
                    'pointer-events': 'pointerEvents',
                    points: 'points',
                    pointsatx: 'pointsAtX',
                    pointsaty: 'pointsAtY',
                    pointsatz: 'pointsAtZ',
                    prefix: 'prefix',
                    preservealpha: 'preserveAlpha',
                    preserveaspectratio: 'preserveAspectRatio',
                    primitiveunits: 'primitiveUnits',
                    property: 'property',
                    r: 'r',
                    radius: 'radius',
                    refx: 'refX',
                    refy: 'refY',
                    renderingintent: 'renderingIntent',
                    'rendering-intent': 'renderingIntent',
                    repeatcount: 'repeatCount',
                    repeatdur: 'repeatDur',
                    requiredextensions: 'requiredExtensions',
                    requiredfeatures: 'requiredFeatures',
                    resource: 'resource',
                    restart: 'restart',
                    result: 'result',
                    results: 'results',
                    rotate: 'rotate',
                    rx: 'rx',
                    ry: 'ry',
                    scale: 'scale',
                    security: 'security',
                    seed: 'seed',
                    shaperendering: 'shapeRendering',
                    'shape-rendering': 'shapeRendering',
                    slope: 'slope',
                    spacing: 'spacing',
                    specularconstant: 'specularConstant',
                    specularexponent: 'specularExponent',
                    speed: 'speed',
                    spreadmethod: 'spreadMethod',
                    startoffset: 'startOffset',
                    stddeviation: 'stdDeviation',
                    stemh: 'stemh',
                    stemv: 'stemv',
                    stitchtiles: 'stitchTiles',
                    stopcolor: 'stopColor',
                    'stop-color': 'stopColor',
                    stopopacity: 'stopOpacity',
                    'stop-opacity': 'stopOpacity',
                    strikethroughposition: 'strikethroughPosition',
                    'strikethrough-position': 'strikethroughPosition',
                    strikethroughthickness: 'strikethroughThickness',
                    'strikethrough-thickness': 'strikethroughThickness',
                    string: 'string',
                    stroke: 'stroke',
                    strokedasharray: 'strokeDasharray',
                    'stroke-dasharray': 'strokeDasharray',
                    strokedashoffset: 'strokeDashoffset',
                    'stroke-dashoffset': 'strokeDashoffset',
                    strokelinecap: 'strokeLinecap',
                    'stroke-linecap': 'strokeLinecap',
                    strokelinejoin: 'strokeLinejoin',
                    'stroke-linejoin': 'strokeLinejoin',
                    strokemiterlimit: 'strokeMiterlimit',
                    'stroke-miterlimit': 'strokeMiterlimit',
                    strokewidth: 'strokeWidth',
                    'stroke-width': 'strokeWidth',
                    strokeopacity: 'strokeOpacity',
                    'stroke-opacity': 'strokeOpacity',
                    suppresscontenteditablewarning: 'suppressContentEditableWarning',
                    suppresshydrationwarning: 'suppressHydrationWarning',
                    surfacescale: 'surfaceScale',
                    systemlanguage: 'systemLanguage',
                    tablevalues: 'tableValues',
                    targetx: 'targetX',
                    targety: 'targetY',
                    textanchor: 'textAnchor',
                    'text-anchor': 'textAnchor',
                    textdecoration: 'textDecoration',
                    'text-decoration': 'textDecoration',
                    textlength: 'textLength',
                    textrendering: 'textRendering',
                    'text-rendering': 'textRendering',
                    to: 'to',
                    transform: 'transform',
                    'typeof': 'typeof',
                    u1: 'u1',
                    u2: 'u2',
                    underlineposition: 'underlinePosition',
                    'underline-position': 'underlinePosition',
                    underlinethickness: 'underlineThickness',
                    'underline-thickness': 'underlineThickness',
                    unicode: 'unicode',
                    unicodebidi: 'unicodeBidi',
                    'unicode-bidi': 'unicodeBidi',
                    unicoderange: 'unicodeRange',
                    'unicode-range': 'unicodeRange',
                    unitsperem: 'unitsPerEm',
                    'units-per-em': 'unitsPerEm',
                    unselectable: 'unselectable',
                    valphabetic: 'vAlphabetic',
                    'v-alphabetic': 'vAlphabetic',
                    values: 'values',
                    vectoreffect: 'vectorEffect',
                    'vector-effect': 'vectorEffect',
                    version: 'version',
                    vertadvy: 'vertAdvY',
                    'vert-adv-y': 'vertAdvY',
                    vertoriginx: 'vertOriginX',
                    'vert-origin-x': 'vertOriginX',
                    vertoriginy: 'vertOriginY',
                    'vert-origin-y': 'vertOriginY',
                    vhanging: 'vHanging',
                    'v-hanging': 'vHanging',
                    videographic: 'vIdeographic',
                    'v-ideographic': 'vIdeographic',
                    viewbox: 'viewBox',
                    viewtarget: 'viewTarget',
                    visibility: 'visibility',
                    vmathematical: 'vMathematical',
                    'v-mathematical': 'vMathematical',
                    vocab: 'vocab',
                    widths: 'widths',
                    wordspacing: 'wordSpacing',
                    'word-spacing': 'wordSpacing',
                    writingmode: 'writingMode',
                    'writing-mode': 'writingMode',
                    x1: 'x1',
                    x2: 'x2',
                    x: 'x',
                    xchannelselector: 'xChannelSelector',
                    xheight: 'xHeight',
                    'x-height': 'xHeight',
                    xlinkactuate: 'xlinkActuate',
                    'xlink:actuate': 'xlinkActuate',
                    xlinkarcrole: 'xlinkArcrole',
                    'xlink:arcrole': 'xlinkArcrole',
                    xlinkhref: 'xlinkHref',
                    'xlink:href': 'xlinkHref',
                    xlinkrole: 'xlinkRole',
                    'xlink:role': 'xlinkRole',
                    xlinkshow: 'xlinkShow',
                    'xlink:show': 'xlinkShow',
                    xlinktitle: 'xlinkTitle',
                    'xlink:title': 'xlinkTitle',
                    xlinktype: 'xlinkType',
                    'xlink:type': 'xlinkType',
                    xmlbase: 'xmlBase',
                    'xml:base': 'xmlBase',
                    xmllang: 'xmlLang',
                    'xml:lang': 'xmlLang',
                    xmlns: 'xmlns',
                    'xml:space': 'xmlSpace',
                    xmlnsxlink: 'xmlnsXlink',
                    'xmlns:xlink': 'xmlnsXlink',
                    xmlspace: 'xmlSpace',
                    y1: 'y1',
                    y2: 'y2',
                    y: 'y',
                    ychannelselector: 'yChannelSelector',
                    z: 'z',
                    zoomandpan: 'zoomAndPan'
                };
                function getStackAddendum$2() {
                    var stack = ReactDebugCurrentFrame.getStackAddendum();
                    return stack != null ? stack : '';
                }
                {
                    var warnedProperties$1 = {};
                    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
                    var EVENT_NAME_REGEX = /^on./;
                    var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
                    var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
                    var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');
                    var validateProperty$1 = function (tagName, name, value, canUseEventSystem) {
                        if (hasOwnProperty$1.call(warnedProperties$1, name) && warnedProperties$1[name]) {
                            return true;
                        }
                        var lowerCasedName = name.toLowerCase();
                        if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
                            warning(false, 'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (canUseEventSystem) {
                            if (registrationNameModules.hasOwnProperty(name)) {
                                return true;
                            }
                            var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;
                            if (registrationName != null) {
                                warning(false, 'Invalid event handler property `%s`. Did you mean `%s`?%s', name, registrationName, getStackAddendum$2());
                                warnedProperties$1[name] = true;
                                return true;
                            }
                            if (EVENT_NAME_REGEX.test(name)) {
                                warning(false, 'Unknown event handler property `%s`. It will be ignored.%s', name, getStackAddendum$2());
                                warnedProperties$1[name] = true;
                                return true;
                            }
                        } else if (EVENT_NAME_REGEX.test(name)) {
                            if (INVALID_EVENT_NAME_REGEX.test(name)) {
                                warning(false, 'Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.%s', name, getStackAddendum$2());
                            }
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
                            return true;
                        }
                        if (lowerCasedName === 'innerhtml') {
                            warning(false, 'Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (lowerCasedName === 'aria') {
                            warning(false, 'The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
                            warning(false, 'Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.%s', typeof value, getStackAddendum$2());
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (typeof value === 'number' && isNaN(value)) {
                            warning(false, 'Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.%s', name, getStackAddendum$2());
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        var isReserved = isReservedProp(name);
                        if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
                            var standardName = possibleStandardNames[lowerCasedName];
                            if (standardName !== name) {
                                warning(false, 'Invalid DOM property `%s`. Did you mean `%s`?%s', name, standardName, getStackAddendum$2());
                                warnedProperties$1[name] = true;
                                return true;
                            }
                        } else if (!isReserved && name !== lowerCasedName) {
                            warning(false, 'React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.%s', name, lowerCasedName, getStackAddendum$2());
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (typeof value === 'boolean' && !shouldAttributeAcceptBooleanValue(name)) {
                            if (value) {
                                warning(false, 'Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.%s', value, name, name, value, name, getStackAddendum$2());
                            } else {
                                warning(false, 'Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.%s', value, name, name, value, name, name, name, getStackAddendum$2());
                            }
                            warnedProperties$1[name] = true;
                            return true;
                        }
                        if (isReserved) {
                            return true;
                        }
                        if (!shouldSetAttribute(name, value)) {
                            warnedProperties$1[name] = true;
                            return false;
                        }
                        return true;
                    };
                }
                var warnUnknownProperties = function (type, props, canUseEventSystem) {
                    var unknownProps = [];
                    for (var key in props) {
                        var isValid = validateProperty$1(type, key, props[key], canUseEventSystem);
                        if (!isValid) {
                            unknownProps.push(key);
                        }
                    }
                    var unknownPropString = unknownProps.map(function (prop) {
                        return '`' + prop + '`';
                    }).join(', ');
                    if (unknownProps.length === 1) {
                        warning(false, 'Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://fb.me/react-attribute-behavior%s', unknownPropString, type, getStackAddendum$2());
                    } else if (unknownProps.length > 1) {
                        warning(false, 'Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://fb.me/react-attribute-behavior%s', unknownPropString, type, getStackAddendum$2());
                    }
                };
                function validateProperties$2(type, props, canUseEventSystem) {
                    if (isCustomComponent(type, props)) {
                        return;
                    }
                    warnUnknownProperties(type, props, canUseEventSystem);
                }
                var getCurrentFiberOwnerName$1 = ReactDebugCurrentFiber.getCurrentFiberOwnerName;
                var getCurrentFiberStackAddendum$2 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;
                var didWarnInvalidHydration = false;
                var didWarnShadyDOM = false;
                var DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
                var SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
                var SUPPRESS_HYDRATION_WARNING$1 = 'suppressHydrationWarning';
                var AUTOFOCUS = 'autoFocus';
                var CHILDREN = 'children';
                var STYLE = 'style';
                var HTML = '__html';
                var HTML_NAMESPACE = Namespaces.html;
                var getStack = emptyFunction.thatReturns('');
                {
                    getStack = getCurrentFiberStackAddendum$2;
                    var warnedUnknownTags = {
                        time: true,
                        dialog: true
                    };
                    var validatePropertiesInDevelopment = function (type, props) {
                        validateProperties(type, props);
                        validateProperties$1(type, props);
                        validateProperties$2(type, props, true);
                    };
                    var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
                    var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
                    var normalizeMarkupForTextOrAttribute = function (markup) {
                        var markupString = typeof markup === 'string' ? markup : '' + markup;
                        return markupString.replace(NORMALIZE_NEWLINES_REGEX, '\n').replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, '');
                    };
                    var warnForTextDifference = function (serverText, clientText) {
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        var normalizedClientText = normalizeMarkupForTextOrAttribute(clientText);
                        var normalizedServerText = normalizeMarkupForTextOrAttribute(serverText);
                        if (normalizedServerText === normalizedClientText) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        warning(false, 'Text content did not match. Server: "%s" Client: "%s"', normalizedServerText, normalizedClientText);
                    };
                    var warnForPropDifference = function (propName, serverValue, clientValue) {
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        var normalizedClientValue = normalizeMarkupForTextOrAttribute(clientValue);
                        var normalizedServerValue = normalizeMarkupForTextOrAttribute(serverValue);
                        if (normalizedServerValue === normalizedClientValue) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        warning(false, 'Prop `%s` did not match. Server: %s Client: %s', propName, JSON.stringify(normalizedServerValue), JSON.stringify(normalizedClientValue));
                    };
                    var warnForExtraAttributes = function (attributeNames) {
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        var names = [];
                        attributeNames.forEach(function (name) {
                            names.push(name);
                        });
                        warning(false, 'Extra attributes from the server: %s', names);
                    };
                    var warnForInvalidEventListener = function (registrationName, listener) {
                        if (listener === false) {
                            warning(false, 'Expected `%s` listener to be a function, instead got `false`.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.%s', registrationName, registrationName, registrationName, getCurrentFiberStackAddendum$2());
                        } else {
                            warning(false, 'Expected `%s` listener to be a function, instead got a value of `%s` type.%s', registrationName, typeof listener, getCurrentFiberStackAddendum$2());
                        }
                    };
                    var normalizeHTML = function (parent, html) {
                        var testElement = parent.namespaceURI === HTML_NAMESPACE ? parent.ownerDocument.createElement(parent.tagName) : parent.ownerDocument.createElementNS(parent.namespaceURI, parent.tagName);
                        testElement.innerHTML = html;
                        return testElement.innerHTML;
                    };
                }
                function ensureListeningTo(rootContainerElement, registrationName) {
                    var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE || rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
                    var doc = isDocumentOrFragment ? rootContainerElement : rootContainerElement.ownerDocument;
                    listenTo(registrationName, doc);
                }
                function getOwnerDocumentFromRootContainer(rootContainerElement) {
                    return rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
                }
                var mediaEvents = {
                    topAbort: 'abort',
                    topCanPlay: 'canplay',
                    topCanPlayThrough: 'canplaythrough',
                    topDurationChange: 'durationchange',
                    topEmptied: 'emptied',
                    topEncrypted: 'encrypted',
                    topEnded: 'ended',
                    topError: 'error',
                    topLoadedData: 'loadeddata',
                    topLoadedMetadata: 'loadedmetadata',
                    topLoadStart: 'loadstart',
                    topPause: 'pause',
                    topPlay: 'play',
                    topPlaying: 'playing',
                    topProgress: 'progress',
                    topRateChange: 'ratechange',
                    topSeeked: 'seeked',
                    topSeeking: 'seeking',
                    topStalled: 'stalled',
                    topSuspend: 'suspend',
                    topTimeUpdate: 'timeupdate',
                    topVolumeChange: 'volumechange',
                    topWaiting: 'waiting'
                };
                function trapClickOnNonInteractiveElement(node) {
                    node.onclick = emptyFunction;
                }
                function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
                    for (var propKey in nextProps) {
                        if (!nextProps.hasOwnProperty(propKey)) {
                            continue;
                        }
                        var nextProp = nextProps[propKey];
                        if (propKey === STYLE) {
                            {
                                if (nextProp) {
                                    Object.freeze(nextProp);
                                }
                            }
                            setValueForStyles(domElement, nextProp, getStack);
                        } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
                            var nextHtml = nextProp ? nextProp[HTML] : undefined;
                            if (nextHtml != null) {
                                setInnerHTML(domElement, nextHtml);
                            }
                        } else if (propKey === CHILDREN) {
                            if (typeof nextProp === 'string') {
                                var canSetTextContent = tag !== 'textarea' || nextProp !== '';
                                if (canSetTextContent) {
                                    setTextContent(domElement, nextProp);
                                }
                            } else if (typeof nextProp === 'number') {
                                setTextContent(domElement, '' + nextProp);
                            }
                        } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
                        } else if (propKey === AUTOFOCUS) {
                        } else if (registrationNameModules.hasOwnProperty(propKey)) {
                            if (nextProp != null) {
                                if (true && typeof nextProp !== 'function') {
                                    warnForInvalidEventListener(propKey, nextProp);
                                }
                                ensureListeningTo(rootContainerElement, propKey);
                            }
                        } else if (isCustomComponentTag) {
                            setValueForAttribute(domElement, propKey, nextProp);
                        } else if (nextProp != null) {
                            setValueForProperty(domElement, propKey, nextProp);
                        }
                    }
                }
                function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
                    for (var i = 0; i < updatePayload.length; i += 2) {
                        var propKey = updatePayload[i];
                        var propValue = updatePayload[i + 1];
                        if (propKey === STYLE) {
                            setValueForStyles(domElement, propValue, getStack);
                        } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
                            setInnerHTML(domElement, propValue);
                        } else if (propKey === CHILDREN) {
                            setTextContent(domElement, propValue);
                        } else if (isCustomComponentTag) {
                            if (propValue != null) {
                                setValueForAttribute(domElement, propKey, propValue);
                            } else {
                                deleteValueForAttribute(domElement, propKey);
                            }
                        } else if (propValue != null) {
                            setValueForProperty(domElement, propKey, propValue);
                        } else {
                            deleteValueForProperty(domElement, propKey);
                        }
                    }
                }
                function createElement$1(type, props, rootContainerElement, parentNamespace) {
                    var ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
                    var domElement;
                    var namespaceURI = parentNamespace;
                    if (namespaceURI === HTML_NAMESPACE) {
                        namespaceURI = getIntrinsicNamespace(type);
                    }
                    if (namespaceURI === HTML_NAMESPACE) {
                        {
                            var isCustomComponentTag = isCustomComponent(type, props);
                            warning(isCustomComponentTag || type === type.toLowerCase(), '<%s /> is using uppercase HTML. Always use lowercase HTML tags ' + 'in React.', type);
                        }
                        if (type === 'script') {
                            var div = ownerDocument.createElement('div');
                            div.innerHTML = '<script><' + '/script>';
                            var firstChild = div.firstChild;
                            domElement = div.removeChild(firstChild);
                        } else if (typeof props.is === 'string') {
                            domElement = ownerDocument.createElement(type, { is: props.is });
                        } else {
                            domElement = ownerDocument.createElement(type);
                        }
                    } else {
                        domElement = ownerDocument.createElementNS(namespaceURI, type);
                    }
                    {
                        if (namespaceURI === HTML_NAMESPACE) {
                            if (!isCustomComponentTag && Object.prototype.toString.call(domElement) === '[object HTMLUnknownElement]' && !Object.prototype.hasOwnProperty.call(warnedUnknownTags, type)) {
                                warnedUnknownTags[type] = true;
                                warning(false, 'The tag <%s> is unrecognized in this browser. ' + 'If you meant to render a React component, start its name with ' + 'an uppercase letter.', type);
                            }
                        }
                    }
                    return domElement;
                }
                function createTextNode$1(text, rootContainerElement) {
                    return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
                }
                function setInitialProperties$1(domElement, tag, rawProps, rootContainerElement) {
                    var isCustomComponentTag = isCustomComponent(tag, rawProps);
                    {
                        validatePropertiesInDevelopment(tag, rawProps);
                        if (isCustomComponentTag && !didWarnShadyDOM && domElement.shadyRoot) {
                            warning(false, '%s is using shady DOM. Using shady DOM with React can ' + 'cause things to break subtly.', getCurrentFiberOwnerName$1() || 'A component');
                            didWarnShadyDOM = true;
                        }
                    }
                    var props;
                    switch (tag) {
                    case 'iframe':
                    case 'object':
                        trapBubbledEvent('topLoad', 'load', domElement);
                        props = rawProps;
                        break;
                    case 'video':
                    case 'audio':
                        for (var event in mediaEvents) {
                            if (mediaEvents.hasOwnProperty(event)) {
                                trapBubbledEvent(event, mediaEvents[event], domElement);
                            }
                        }
                        props = rawProps;
                        break;
                    case 'source':
                        trapBubbledEvent('topError', 'error', domElement);
                        props = rawProps;
                        break;
                    case 'img':
                    case 'image':
                        trapBubbledEvent('topError', 'error', domElement);
                        trapBubbledEvent('topLoad', 'load', domElement);
                        props = rawProps;
                        break;
                    case 'form':
                        trapBubbledEvent('topReset', 'reset', domElement);
                        trapBubbledEvent('topSubmit', 'submit', domElement);
                        props = rawProps;
                        break;
                    case 'details':
                        trapBubbledEvent('topToggle', 'toggle', domElement);
                        props = rawProps;
                        break;
                    case 'input':
                        initWrapperState(domElement, rawProps);
                        props = getHostProps(domElement, rawProps);
                        trapBubbledEvent('topInvalid', 'invalid', domElement);
                        ensureListeningTo(rootContainerElement, 'onChange');
                        break;
                    case 'option':
                        validateProps(domElement, rawProps);
                        props = getHostProps$1(domElement, rawProps);
                        break;
                    case 'select':
                        initWrapperState$1(domElement, rawProps);
                        props = getHostProps$2(domElement, rawProps);
                        trapBubbledEvent('topInvalid', 'invalid', domElement);
                        ensureListeningTo(rootContainerElement, 'onChange');
                        break;
                    case 'textarea':
                        initWrapperState$2(domElement, rawProps);
                        props = getHostProps$3(domElement, rawProps);
                        trapBubbledEvent('topInvalid', 'invalid', domElement);
                        ensureListeningTo(rootContainerElement, 'onChange');
                        break;
                    default:
                        props = rawProps;
                    }
                    assertValidProps(tag, props, getStack);
                    setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);
                    switch (tag) {
                    case 'input':
                        track(domElement);
                        postMountWrapper(domElement, rawProps);
                        break;
                    case 'textarea':
                        track(domElement);
                        postMountWrapper$3(domElement, rawProps);
                        break;
                    case 'option':
                        postMountWrapper$1(domElement, rawProps);
                        break;
                    case 'select':
                        postMountWrapper$2(domElement, rawProps);
                        break;
                    default:
                        if (typeof props.onClick === 'function') {
                            trapClickOnNonInteractiveElement(domElement);
                        }
                        break;
                    }
                }
                function diffProperties$1(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
                    {
                        validatePropertiesInDevelopment(tag, nextRawProps);
                    }
                    var updatePayload = null;
                    var lastProps;
                    var nextProps;
                    switch (tag) {
                    case 'input':
                        lastProps = getHostProps(domElement, lastRawProps);
                        nextProps = getHostProps(domElement, nextRawProps);
                        updatePayload = [];
                        break;
                    case 'option':
                        lastProps = getHostProps$1(domElement, lastRawProps);
                        nextProps = getHostProps$1(domElement, nextRawProps);
                        updatePayload = [];
                        break;
                    case 'select':
                        lastProps = getHostProps$2(domElement, lastRawProps);
                        nextProps = getHostProps$2(domElement, nextRawProps);
                        updatePayload = [];
                        break;
                    case 'textarea':
                        lastProps = getHostProps$3(domElement, lastRawProps);
                        nextProps = getHostProps$3(domElement, nextRawProps);
                        updatePayload = [];
                        break;
                    default:
                        lastProps = lastRawProps;
                        nextProps = nextRawProps;
                        if (typeof lastProps.onClick !== 'function' && typeof nextProps.onClick === 'function') {
                            trapClickOnNonInteractiveElement(domElement);
                        }
                        break;
                    }
                    assertValidProps(tag, nextProps, getStack);
                    var propKey;
                    var styleName;
                    var styleUpdates = null;
                    for (propKey in lastProps) {
                        if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
                            continue;
                        }
                        if (propKey === STYLE) {
                            var lastStyle = lastProps[propKey];
                            for (styleName in lastStyle) {
                                if (lastStyle.hasOwnProperty(styleName)) {
                                    if (!styleUpdates) {
                                        styleUpdates = {};
                                    }
                                    styleUpdates[styleName] = '';
                                }
                            }
                        } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
                        } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
                        } else if (propKey === AUTOFOCUS) {
                        } else if (registrationNameModules.hasOwnProperty(propKey)) {
                            if (!updatePayload) {
                                updatePayload = [];
                            }
                        } else {
                            (updatePayload = updatePayload || []).push(propKey, null);
                        }
                    }
                    for (propKey in nextProps) {
                        var nextProp = nextProps[propKey];
                        var lastProp = lastProps != null ? lastProps[propKey] : undefined;
                        if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
                            continue;
                        }
                        if (propKey === STYLE) {
                            {
                                if (nextProp) {
                                    Object.freeze(nextProp);
                                }
                            }
                            if (lastProp) {
                                for (styleName in lastProp) {
                                    if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                                        if (!styleUpdates) {
                                            styleUpdates = {};
                                        }
                                        styleUpdates[styleName] = '';
                                    }
                                }
                                for (styleName in nextProp) {
                                    if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
                                        if (!styleUpdates) {
                                            styleUpdates = {};
                                        }
                                        styleUpdates[styleName] = nextProp[styleName];
                                    }
                                }
                            } else {
                                if (!styleUpdates) {
                                    if (!updatePayload) {
                                        updatePayload = [];
                                    }
                                    updatePayload.push(propKey, styleUpdates);
                                }
                                styleUpdates = nextProp;
                            }
                        } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
                            var nextHtml = nextProp ? nextProp[HTML] : undefined;
                            var lastHtml = lastProp ? lastProp[HTML] : undefined;
                            if (nextHtml != null) {
                                if (lastHtml !== nextHtml) {
                                    (updatePayload = updatePayload || []).push(propKey, '' + nextHtml);
                                }
                            } else {
                            }
                        } else if (propKey === CHILDREN) {
                            if (lastProp !== nextProp && (typeof nextProp === 'string' || typeof nextProp === 'number')) {
                                (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
                            }
                        } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
                        } else if (registrationNameModules.hasOwnProperty(propKey)) {
                            if (nextProp != null) {
                                if (true && typeof nextProp !== 'function') {
                                    warnForInvalidEventListener(propKey, nextProp);
                                }
                                ensureListeningTo(rootContainerElement, propKey);
                            }
                            if (!updatePayload && lastProp !== nextProp) {
                                updatePayload = [];
                            }
                        } else {
                            (updatePayload = updatePayload || []).push(propKey, nextProp);
                        }
                    }
                    if (styleUpdates) {
                        (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
                    }
                    return updatePayload;
                }
                function updateProperties$1(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
                    if (tag === 'input' && nextRawProps.type === 'radio' && nextRawProps.name != null) {
                        updateChecked(domElement, nextRawProps);
                    }
                    var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
                    var isCustomComponentTag = isCustomComponent(tag, nextRawProps);
                    updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);
                    switch (tag) {
                    case 'input':
                        updateWrapper(domElement, nextRawProps);
                        break;
                    case 'textarea':
                        updateWrapper$1(domElement, nextRawProps);
                        break;
                    case 'select':
                        postUpdateWrapper(domElement, nextRawProps);
                        break;
                    }
                }
                function diffHydratedProperties$1(domElement, tag, rawProps, parentNamespace, rootContainerElement) {
                    {
                        var suppressHydrationWarning = rawProps[SUPPRESS_HYDRATION_WARNING$1] === true;
                        var isCustomComponentTag = isCustomComponent(tag, rawProps);
                        validatePropertiesInDevelopment(tag, rawProps);
                        if (isCustomComponentTag && !didWarnShadyDOM && domElement.shadyRoot) {
                            warning(false, '%s is using shady DOM. Using shady DOM with React can ' + 'cause things to break subtly.', getCurrentFiberOwnerName$1() || 'A component');
                            didWarnShadyDOM = true;
                        }
                    }
                    switch (tag) {
                    case 'iframe':
                    case 'object':
                        trapBubbledEvent('topLoad', 'load', domElement);
                        break;
                    case 'video':
                    case 'audio':
                        for (var event in mediaEvents) {
                            if (mediaEvents.hasOwnProperty(event)) {
                                trapBubbledEvent(event, mediaEvents[event], domElement);
                            }
                        }
                        break;
                    case 'source':
                        trapBubbledEvent('topError', 'error', domElement);
                        break;
                    case 'img':
                    case 'image':
                        trapBubbledEvent('topError', 'error', domElement);
                        trapBubbledEvent('topLoad', 'load', domElement);
                        break;
                    case 'form':
                        trapBubbledEvent('topReset', 'reset', domElement);
                        trapBubbledEvent('topSubmit', 'submit', domElement);
                        break;
                    case 'details':
                        trapBubbledEvent('topToggle', 'toggle', domElement);
                        break;
                    case 'input':
                        initWrapperState(domElement, rawProps);
                        trapBubbledEvent('topInvalid', 'invalid', domElement);
                        ensureListeningTo(rootContainerElement, 'onChange');
                        break;
                    case 'option':
                        validateProps(domElement, rawProps);
                        break;
                    case 'select':
                        initWrapperState$1(domElement, rawProps);
                        trapBubbledEvent('topInvalid', 'invalid', domElement);
                        ensureListeningTo(rootContainerElement, 'onChange');
                        break;
                    case 'textarea':
                        initWrapperState$2(domElement, rawProps);
                        trapBubbledEvent('topInvalid', 'invalid', domElement);
                        ensureListeningTo(rootContainerElement, 'onChange');
                        break;
                    }
                    assertValidProps(tag, rawProps, getStack);
                    {
                        var extraAttributeNames = new Set();
                        var attributes = domElement.attributes;
                        for (var i = 0; i < attributes.length; i++) {
                            var name = attributes[i].name.toLowerCase();
                            switch (name) {
                            case 'data-reactroot':
                                break;
                            case 'value':
                                break;
                            case 'checked':
                                break;
                            case 'selected':
                                break;
                            default:
                                extraAttributeNames.add(attributes[i].name);
                            }
                        }
                    }
                    var updatePayload = null;
                    for (var propKey in rawProps) {
                        if (!rawProps.hasOwnProperty(propKey)) {
                            continue;
                        }
                        var nextProp = rawProps[propKey];
                        if (propKey === CHILDREN) {
                            if (typeof nextProp === 'string') {
                                if (domElement.textContent !== nextProp) {
                                    if (true && !suppressHydrationWarning) {
                                        warnForTextDifference(domElement.textContent, nextProp);
                                    }
                                    updatePayload = [
                                        CHILDREN,
                                        nextProp
                                    ];
                                }
                            } else if (typeof nextProp === 'number') {
                                if (domElement.textContent !== '' + nextProp) {
                                    if (true && !suppressHydrationWarning) {
                                        warnForTextDifference(domElement.textContent, nextProp);
                                    }
                                    updatePayload = [
                                        CHILDREN,
                                        '' + nextProp
                                    ];
                                }
                            }
                        } else if (registrationNameModules.hasOwnProperty(propKey)) {
                            if (nextProp != null) {
                                if (true && typeof nextProp !== 'function') {
                                    warnForInvalidEventListener(propKey, nextProp);
                                }
                                ensureListeningTo(rootContainerElement, propKey);
                            }
                        } else {
                            var serverValue;
                            var propertyInfo;
                            if (suppressHydrationWarning) {
                            } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1 || propKey === 'value' || propKey === 'checked' || propKey === 'selected') {
                            } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
                                var rawHtml = nextProp ? nextProp[HTML] || '' : '';
                                var serverHTML = domElement.innerHTML;
                                var expectedHTML = normalizeHTML(domElement, rawHtml);
                                if (expectedHTML !== serverHTML) {
                                    warnForPropDifference(propKey, serverHTML, expectedHTML);
                                }
                            } else if (propKey === STYLE) {
                                extraAttributeNames['delete'](propKey);
                                var expectedStyle = createDangerousStringForStyles(nextProp);
                                serverValue = domElement.getAttribute('style');
                                if (expectedStyle !== serverValue) {
                                    warnForPropDifference(propKey, serverValue, expectedStyle);
                                }
                            } else if (isCustomComponentTag) {
                                extraAttributeNames['delete'](propKey.toLowerCase());
                                serverValue = getValueForAttribute(domElement, propKey, nextProp);
                                if (nextProp !== serverValue) {
                                    warnForPropDifference(propKey, serverValue, nextProp);
                                }
                            } else if (shouldSetAttribute(propKey, nextProp)) {
                                if (propertyInfo = getPropertyInfo(propKey)) {
                                    extraAttributeNames['delete'](propertyInfo.attributeName);
                                    serverValue = getValueForProperty(domElement, propKey, nextProp);
                                } else {
                                    var ownNamespace = parentNamespace;
                                    if (ownNamespace === HTML_NAMESPACE) {
                                        ownNamespace = getIntrinsicNamespace(tag);
                                    }
                                    if (ownNamespace === HTML_NAMESPACE) {
                                        extraAttributeNames['delete'](propKey.toLowerCase());
                                    } else {
                                        extraAttributeNames['delete'](propKey);
                                    }
                                    serverValue = getValueForAttribute(domElement, propKey, nextProp);
                                }
                                if (nextProp !== serverValue) {
                                    warnForPropDifference(propKey, serverValue, nextProp);
                                }
                            }
                        }
                    }
                    {
                        if (extraAttributeNames.size > 0 && !suppressHydrationWarning) {
                            warnForExtraAttributes(extraAttributeNames);
                        }
                    }
                    switch (tag) {
                    case 'input':
                        track(domElement);
                        postMountWrapper(domElement, rawProps);
                        break;
                    case 'textarea':
                        track(domElement);
                        postMountWrapper$3(domElement, rawProps);
                        break;
                    case 'select':
                    case 'option':
                        break;
                    default:
                        if (typeof rawProps.onClick === 'function') {
                            trapClickOnNonInteractiveElement(domElement);
                        }
                        break;
                    }
                    return updatePayload;
                }
                function diffHydratedText$1(textNode, text) {
                    var isDifferent = textNode.nodeValue !== text;
                    return isDifferent;
                }
                function warnForUnmatchedText$1(textNode, text) {
                    {
                        warnForTextDifference(textNode.nodeValue, text);
                    }
                }
                function warnForDeletedHydratableElement$1(parentNode, child) {
                    {
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        warning(false, 'Did not expect server HTML to contain a <%s> in <%s>.', child.nodeName.toLowerCase(), parentNode.nodeName.toLowerCase());
                    }
                }
                function warnForDeletedHydratableText$1(parentNode, child) {
                    {
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        warning(false, 'Did not expect server HTML to contain the text node "%s" in <%s>.', child.nodeValue, parentNode.nodeName.toLowerCase());
                    }
                }
                function warnForInsertedHydratedElement$1(parentNode, tag, props) {
                    {
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        warning(false, 'Expected server HTML to contain a matching <%s> in <%s>.', tag, parentNode.nodeName.toLowerCase());
                    }
                }
                function warnForInsertedHydratedText$1(parentNode, text) {
                    {
                        if (text === '') {
                            return;
                        }
                        if (didWarnInvalidHydration) {
                            return;
                        }
                        didWarnInvalidHydration = true;
                        warning(false, 'Expected server HTML to contain a matching text node for "%s" in <%s>.', text, parentNode.nodeName.toLowerCase());
                    }
                }
                function restoreControlledState(domElement, tag, props) {
                    switch (tag) {
                    case 'input':
                        restoreControlledState$1(domElement, props);
                        return;
                    case 'textarea':
                        restoreControlledState$3(domElement, props);
                        return;
                    case 'select':
                        restoreControlledState$2(domElement, props);
                        return;
                    }
                }
                var ReactDOMFiberComponent = Object.freeze({
                    createElement: createElement$1,
                    createTextNode: createTextNode$1,
                    setInitialProperties: setInitialProperties$1,
                    diffProperties: diffProperties$1,
                    updateProperties: updateProperties$1,
                    diffHydratedProperties: diffHydratedProperties$1,
                    diffHydratedText: diffHydratedText$1,
                    warnForUnmatchedText: warnForUnmatchedText$1,
                    warnForDeletedHydratableElement: warnForDeletedHydratableElement$1,
                    warnForDeletedHydratableText: warnForDeletedHydratableText$1,
                    warnForInsertedHydratedElement: warnForInsertedHydratedElement$1,
                    warnForInsertedHydratedText: warnForInsertedHydratedText$1,
                    restoreControlledState: restoreControlledState
                });
                var getCurrentFiberStackAddendum$6 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;
                var validateDOMNesting = emptyFunction;
                {
                    var specialTags = [
                        'address',
                        'applet',
                        'area',
                        'article',
                        'aside',
                        'base',
                        'basefont',
                        'bgsound',
                        'blockquote',
                        'body',
                        'br',
                        'button',
                        'caption',
                        'center',
                        'col',
                        'colgroup',
                        'dd',
                        'details',
                        'dir',
                        'div',
                        'dl',
                        'dt',
                        'embed',
                        'fieldset',
                        'figcaption',
                        'figure',
                        'footer',
                        'form',
                        'frame',
                        'frameset',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'head',
                        'header',
                        'hgroup',
                        'hr',
                        'html',
                        'iframe',
                        'img',
                        'input',
                        'isindex',
                        'li',
                        'link',
                        'listing',
                        'main',
                        'marquee',
                        'menu',
                        'menuitem',
                        'meta',
                        'nav',
                        'noembed',
                        'noframes',
                        'noscript',
                        'object',
                        'ol',
                        'p',
                        'param',
                        'plaintext',
                        'pre',
                        'script',
                        'section',
                        'select',
                        'source',
                        'style',
                        'summary',
                        'table',
                        'tbody',
                        'td',
                        'template',
                        'textarea',
                        'tfoot',
                        'th',
                        'thead',
                        'title',
                        'tr',
                        'track',
                        'ul',
                        'wbr',
                        'xmp'
                    ];
                    var inScopeTags = [
                        'applet',
                        'caption',
                        'html',
                        'table',
                        'td',
                        'th',
                        'marquee',
                        'object',
                        'template',
                        'foreignObject',
                        'desc',
                        'title'
                    ];
                    var buttonScopeTags = inScopeTags.concat(['button']);
                    var impliedEndTags = [
                        'dd',
                        'dt',
                        'li',
                        'option',
                        'optgroup',
                        'p',
                        'rp',
                        'rt'
                    ];
                    var emptyAncestorInfo = {
                        current: null,
                        formTag: null,
                        aTagInScope: null,
                        buttonTagInScope: null,
                        nobrTagInScope: null,
                        pTagInButtonScope: null,
                        listItemTagAutoclosing: null,
                        dlItemTagAutoclosing: null
                    };
                    var updatedAncestorInfo$1 = function (oldInfo, tag, instance) {
                        var ancestorInfo = _assign({}, oldInfo || emptyAncestorInfo);
                        var info = {
                            tag: tag,
                            instance: instance
                        };
                        if (inScopeTags.indexOf(tag) !== -1) {
                            ancestorInfo.aTagInScope = null;
                            ancestorInfo.buttonTagInScope = null;
                            ancestorInfo.nobrTagInScope = null;
                        }
                        if (buttonScopeTags.indexOf(tag) !== -1) {
                            ancestorInfo.pTagInButtonScope = null;
                        }
                        if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
                            ancestorInfo.listItemTagAutoclosing = null;
                            ancestorInfo.dlItemTagAutoclosing = null;
                        }
                        ancestorInfo.current = info;
                        if (tag === 'form') {
                            ancestorInfo.formTag = info;
                        }
                        if (tag === 'a') {
                            ancestorInfo.aTagInScope = info;
                        }
                        if (tag === 'button') {
                            ancestorInfo.buttonTagInScope = info;
                        }
                        if (tag === 'nobr') {
                            ancestorInfo.nobrTagInScope = info;
                        }
                        if (tag === 'p') {
                            ancestorInfo.pTagInButtonScope = info;
                        }
                        if (tag === 'li') {
                            ancestorInfo.listItemTagAutoclosing = info;
                        }
                        if (tag === 'dd' || tag === 'dt') {
                            ancestorInfo.dlItemTagAutoclosing = info;
                        }
                        return ancestorInfo;
                    };
                    var isTagValidWithParent = function (tag, parentTag) {
                        switch (parentTag) {
                        case 'select':
                            return tag === 'option' || tag === 'optgroup' || tag === '#text';
                        case 'optgroup':
                            return tag === 'option' || tag === '#text';
                        case 'option':
                            return tag === '#text';
                        case 'tr':
                            return tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template';
                        case 'tbody':
                        case 'thead':
                        case 'tfoot':
                            return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';
                        case 'colgroup':
                            return tag === 'col' || tag === 'template';
                        case 'table':
                            return tag === 'caption' || tag === 'colgroup' || tag === 'tbody' || tag === 'tfoot' || tag === 'thead' || tag === 'style' || tag === 'script' || tag === 'template';
                        case 'head':
                            return tag === 'base' || tag === 'basefont' || tag === 'bgsound' || tag === 'link' || tag === 'meta' || tag === 'title' || tag === 'noscript' || tag === 'noframes' || tag === 'style' || tag === 'script' || tag === 'template';
                        case 'html':
                            return tag === 'head' || tag === 'body';
                        case '#document':
                            return tag === 'html';
                        }
                        switch (tag) {
                        case 'h1':
                        case 'h2':
                        case 'h3':
                        case 'h4':
                        case 'h5':
                        case 'h6':
                            return parentTag !== 'h1' && parentTag !== 'h2' && parentTag !== 'h3' && parentTag !== 'h4' && parentTag !== 'h5' && parentTag !== 'h6';
                        case 'rp':
                        case 'rt':
                            return impliedEndTags.indexOf(parentTag) === -1;
                        case 'body':
                        case 'caption':
                        case 'col':
                        case 'colgroup':
                        case 'frame':
                        case 'head':
                        case 'html':
                        case 'tbody':
                        case 'td':
                        case 'tfoot':
                        case 'th':
                        case 'thead':
                        case 'tr':
                            return parentTag == null;
                        }
                        return true;
                    };
                    var findInvalidAncestorForTag = function (tag, ancestorInfo) {
                        switch (tag) {
                        case 'address':
                        case 'article':
                        case 'aside':
                        case 'blockquote':
                        case 'center':
                        case 'details':
                        case 'dialog':
                        case 'dir':
                        case 'div':
                        case 'dl':
                        case 'fieldset':
                        case 'figcaption':
                        case 'figure':
                        case 'footer':
                        case 'header':
                        case 'hgroup':
                        case 'main':
                        case 'menu':
                        case 'nav':
                        case 'ol':
                        case 'p':
                        case 'section':
                        case 'summary':
                        case 'ul':
                        case 'pre':
                        case 'listing':
                        case 'table':
                        case 'hr':
                        case 'xmp':
                        case 'h1':
                        case 'h2':
                        case 'h3':
                        case 'h4':
                        case 'h5':
                        case 'h6':
                            return ancestorInfo.pTagInButtonScope;
                        case 'form':
                            return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;
                        case 'li':
                            return ancestorInfo.listItemTagAutoclosing;
                        case 'dd':
                        case 'dt':
                            return ancestorInfo.dlItemTagAutoclosing;
                        case 'button':
                            return ancestorInfo.buttonTagInScope;
                        case 'a':
                            return ancestorInfo.aTagInScope;
                        case 'nobr':
                            return ancestorInfo.nobrTagInScope;
                        }
                        return null;
                    };
                    var didWarn = {};
                    validateDOMNesting = function (childTag, childText, ancestorInfo) {
                        ancestorInfo = ancestorInfo || emptyAncestorInfo;
                        var parentInfo = ancestorInfo.current;
                        var parentTag = parentInfo && parentInfo.tag;
                        if (childText != null) {
                            warning(childTag == null, 'validateDOMNesting: when childText is passed, childTag should be null');
                            childTag = '#text';
                        }
                        var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
                        var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
                        var invalidParentOrAncestor = invalidParent || invalidAncestor;
                        if (!invalidParentOrAncestor) {
                            return;
                        }
                        var ancestorTag = invalidParentOrAncestor.tag;
                        var addendum = getCurrentFiberStackAddendum$6();
                        var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + addendum;
                        if (didWarn[warnKey]) {
                            return;
                        }
                        didWarn[warnKey] = true;
                        var tagDisplayName = childTag;
                        var whitespaceInfo = '';
                        if (childTag === '#text') {
                            if (/\S/.test(childText)) {
                                tagDisplayName = 'Text nodes';
                            } else {
                                tagDisplayName = 'Whitespace text nodes';
                                whitespaceInfo = ' Make sure you don\'t have any extra whitespace between tags on ' + 'each line of your source code.';
                            }
                        } else {
                            tagDisplayName = '<' + childTag + '>';
                        }
                        if (invalidParent) {
                            var info = '';
                            if (ancestorTag === 'table' && childTag === 'tr') {
                                info += ' Add a <tbody> to your code to match the DOM tree generated by ' + 'the browser.';
                            }
                            warning(false, 'validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s%s', tagDisplayName, ancestorTag, whitespaceInfo, info, addendum);
                        } else {
                            warning(false, 'validateDOMNesting(...): %s cannot appear as a descendant of ' + '<%s>.%s', tagDisplayName, ancestorTag, addendum);
                        }
                    };
                    validateDOMNesting.updatedAncestorInfo = updatedAncestorInfo$1;
                    validateDOMNesting.isTagValidInContext = function (tag, ancestorInfo) {
                        ancestorInfo = ancestorInfo || emptyAncestorInfo;
                        var parentInfo = ancestorInfo.current;
                        var parentTag = parentInfo && parentInfo.tag;
                        return isTagValidWithParent(tag, parentTag) && !findInvalidAncestorForTag(tag, ancestorInfo);
                    };
                }
                var validateDOMNesting$1 = validateDOMNesting;
                var createElement = createElement$1;
                var createTextNode = createTextNode$1;
                var setInitialProperties = setInitialProperties$1;
                var diffProperties = diffProperties$1;
                var updateProperties = updateProperties$1;
                var diffHydratedProperties = diffHydratedProperties$1;
                var diffHydratedText = diffHydratedText$1;
                var warnForUnmatchedText = warnForUnmatchedText$1;
                var warnForDeletedHydratableElement = warnForDeletedHydratableElement$1;
                var warnForDeletedHydratableText = warnForDeletedHydratableText$1;
                var warnForInsertedHydratedElement = warnForInsertedHydratedElement$1;
                var warnForInsertedHydratedText = warnForInsertedHydratedText$1;
                var updatedAncestorInfo = validateDOMNesting$1.updatedAncestorInfo;
                var precacheFiberNode = precacheFiberNode$1;
                var updateFiberProps = updateFiberProps$1;
                {
                    var SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning';
                    if (typeof Map !== 'function' || Map.prototype == null || typeof Map.prototype.forEach !== 'function' || typeof Set !== 'function' || Set.prototype == null || typeof Set.prototype.clear !== 'function' || typeof Set.prototype.forEach !== 'function') {
                        warning(false, 'React depends on Map and Set built-in types. Make sure that you load a ' + 'polyfill in older browsers. http://fb.me/react-polyfills');
                    }
                }
                injection$3.injectFiberControlledHostComponent(ReactDOMFiberComponent);
                var eventsEnabled = null;
                var selectionInformation = null;
                function isValidContainer(node) {
                    return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || node.nodeType === COMMENT_NODE && node.nodeValue === ' react-mount-point-unstable '));
                }
                function getReactRootElementInContainer(container) {
                    if (!container) {
                        return null;
                    }
                    if (container.nodeType === DOCUMENT_NODE) {
                        return container.documentElement;
                    } else {
                        return container.firstChild;
                    }
                }
                function shouldHydrateDueToLegacyHeuristic(container) {
                    var rootElement = getReactRootElementInContainer(container);
                    return !!(rootElement && rootElement.nodeType === ELEMENT_NODE && rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME));
                }
                function shouldAutoFocusHostComponent(type, props) {
                    switch (type) {
                    case 'button':
                    case 'input':
                    case 'select':
                    case 'textarea':
                        return !!props.autoFocus;
                    }
                    return false;
                }
                var DOMRenderer = reactReconciler({
                    getRootHostContext: function (rootContainerInstance) {
                        var type = void 0;
                        var namespace = void 0;
                        var nodeType = rootContainerInstance.nodeType;
                        switch (nodeType) {
                        case DOCUMENT_NODE:
                        case DOCUMENT_FRAGMENT_NODE: {
                                type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment';
                                var root = rootContainerInstance.documentElement;
                                namespace = root ? root.namespaceURI : getChildNamespace(null, '');
                                break;
                            }
                        default: {
                                var container = nodeType === COMMENT_NODE ? rootContainerInstance.parentNode : rootContainerInstance;
                                var ownNamespace = container.namespaceURI || null;
                                type = container.tagName;
                                namespace = getChildNamespace(ownNamespace, type);
                                break;
                            }
                        }
                        {
                            var validatedTag = type.toLowerCase();
                            var _ancestorInfo = updatedAncestorInfo(null, validatedTag, null);
                            return {
                                namespace: namespace,
                                ancestorInfo: _ancestorInfo
                            };
                        }
                        return namespace;
                    },
                    getChildHostContext: function (parentHostContext, type) {
                        {
                            var parentHostContextDev = parentHostContext;
                            var _namespace = getChildNamespace(parentHostContextDev.namespace, type);
                            var _ancestorInfo2 = updatedAncestorInfo(parentHostContextDev.ancestorInfo, type, null);
                            return {
                                namespace: _namespace,
                                ancestorInfo: _ancestorInfo2
                            };
                        }
                        var parentNamespace = parentHostContext;
                        return getChildNamespace(parentNamespace, type);
                    },
                    getPublicInstance: function (instance) {
                        return instance;
                    },
                    prepareForCommit: function () {
                        eventsEnabled = isEnabled();
                        selectionInformation = getSelectionInformation();
                        setEnabled(false);
                    },
                    resetAfterCommit: function () {
                        restoreSelection(selectionInformation);
                        selectionInformation = null;
                        setEnabled(eventsEnabled);
                        eventsEnabled = null;
                    },
                    createInstance: function (type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
                        var parentNamespace = void 0;
                        {
                            var hostContextDev = hostContext;
                            validateDOMNesting$1(type, null, hostContextDev.ancestorInfo);
                            if (typeof props.children === 'string' || typeof props.children === 'number') {
                                var string = '' + props.children;
                                var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type, null);
                                validateDOMNesting$1(null, string, ownAncestorInfo);
                            }
                            parentNamespace = hostContextDev.namespace;
                        }
                        var domElement = createElement(type, props, rootContainerInstance, parentNamespace);
                        precacheFiberNode(internalInstanceHandle, domElement);
                        updateFiberProps(domElement, props);
                        return domElement;
                    },
                    appendInitialChild: function (parentInstance, child) {
                        parentInstance.appendChild(child);
                    },
                    finalizeInitialChildren: function (domElement, type, props, rootContainerInstance) {
                        setInitialProperties(domElement, type, props, rootContainerInstance);
                        return shouldAutoFocusHostComponent(type, props);
                    },
                    prepareUpdate: function (domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
                        {
                            var hostContextDev = hostContext;
                            if (typeof newProps.children !== typeof oldProps.children && (typeof newProps.children === 'string' || typeof newProps.children === 'number')) {
                                var string = '' + newProps.children;
                                var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type, null);
                                validateDOMNesting$1(null, string, ownAncestorInfo);
                            }
                        }
                        return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance);
                    },
                    shouldSetTextContent: function (type, props) {
                        return type === 'textarea' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && typeof props.dangerouslySetInnerHTML.__html === 'string';
                    },
                    shouldDeprioritizeSubtree: function (type, props) {
                        return !!props.hidden;
                    },
                    createTextInstance: function (text, rootContainerInstance, hostContext, internalInstanceHandle) {
                        {
                            var hostContextDev = hostContext;
                            validateDOMNesting$1(null, text, hostContextDev.ancestorInfo);
                        }
                        var textNode = createTextNode(text, rootContainerInstance);
                        precacheFiberNode(internalInstanceHandle, textNode);
                        return textNode;
                    },
                    now: now,
                    mutation: {
                        commitMount: function (domElement, type, newProps, internalInstanceHandle) {
                            domElement.focus();
                        },
                        commitUpdate: function (domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
                            updateFiberProps(domElement, newProps);
                            updateProperties(domElement, updatePayload, type, oldProps, newProps);
                        },
                        resetTextContent: function (domElement) {
                            domElement.textContent = '';
                        },
                        commitTextUpdate: function (textInstance, oldText, newText) {
                            textInstance.nodeValue = newText;
                        },
                        appendChild: function (parentInstance, child) {
                            parentInstance.appendChild(child);
                        },
                        appendChildToContainer: function (container, child) {
                            if (container.nodeType === COMMENT_NODE) {
                                container.parentNode.insertBefore(child, container);
                            } else {
                                container.appendChild(child);
                            }
                        },
                        insertBefore: function (parentInstance, child, beforeChild) {
                            parentInstance.insertBefore(child, beforeChild);
                        },
                        insertInContainerBefore: function (container, child, beforeChild) {
                            if (container.nodeType === COMMENT_NODE) {
                                container.parentNode.insertBefore(child, beforeChild);
                            } else {
                                container.insertBefore(child, beforeChild);
                            }
                        },
                        removeChild: function (parentInstance, child) {
                            parentInstance.removeChild(child);
                        },
                        removeChildFromContainer: function (container, child) {
                            if (container.nodeType === COMMENT_NODE) {
                                container.parentNode.removeChild(child);
                            } else {
                                container.removeChild(child);
                            }
                        }
                    },
                    hydration: {
                        canHydrateInstance: function (instance, type, props) {
                            if (instance.nodeType !== ELEMENT_NODE || type.toLowerCase() !== instance.nodeName.toLowerCase()) {
                                return null;
                            }
                            return instance;
                        },
                        canHydrateTextInstance: function (instance, text) {
                            if (text === '' || instance.nodeType !== TEXT_NODE) {
                                return null;
                            }
                            return instance;
                        },
                        getNextHydratableSibling: function (instance) {
                            var node = instance.nextSibling;
                            while (node && node.nodeType !== ELEMENT_NODE && node.nodeType !== TEXT_NODE) {
                                node = node.nextSibling;
                            }
                            return node;
                        },
                        getFirstHydratableChild: function (parentInstance) {
                            var next = parentInstance.firstChild;
                            while (next && next.nodeType !== ELEMENT_NODE && next.nodeType !== TEXT_NODE) {
                                next = next.nextSibling;
                            }
                            return next;
                        },
                        hydrateInstance: function (instance, type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
                            precacheFiberNode(internalInstanceHandle, instance);
                            updateFiberProps(instance, props);
                            var parentNamespace = void 0;
                            {
                                var hostContextDev = hostContext;
                                parentNamespace = hostContextDev.namespace;
                            }
                            return diffHydratedProperties(instance, type, props, parentNamespace, rootContainerInstance);
                        },
                        hydrateTextInstance: function (textInstance, text, internalInstanceHandle) {
                            precacheFiberNode(internalInstanceHandle, textInstance);
                            return diffHydratedText(textInstance, text);
                        },
                        didNotMatchHydratedContainerTextInstance: function (parentContainer, textInstance, text) {
                            {
                                warnForUnmatchedText(textInstance, text);
                            }
                        },
                        didNotMatchHydratedTextInstance: function (parentType, parentProps, parentInstance, textInstance, text) {
                            if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
                                warnForUnmatchedText(textInstance, text);
                            }
                        },
                        didNotHydrateContainerInstance: function (parentContainer, instance) {
                            {
                                if (instance.nodeType === 1) {
                                    warnForDeletedHydratableElement(parentContainer, instance);
                                } else {
                                    warnForDeletedHydratableText(parentContainer, instance);
                                }
                            }
                        },
                        didNotHydrateInstance: function (parentType, parentProps, parentInstance, instance) {
                            if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
                                if (instance.nodeType === 1) {
                                    warnForDeletedHydratableElement(parentInstance, instance);
                                } else {
                                    warnForDeletedHydratableText(parentInstance, instance);
                                }
                            }
                        },
                        didNotFindHydratableContainerInstance: function (parentContainer, type, props) {
                            {
                                warnForInsertedHydratedElement(parentContainer, type, props);
                            }
                        },
                        didNotFindHydratableContainerTextInstance: function (parentContainer, text) {
                            {
                                warnForInsertedHydratedText(parentContainer, text);
                            }
                        },
                        didNotFindHydratableInstance: function (parentType, parentProps, parentInstance, type, props) {
                            if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
                                warnForInsertedHydratedElement(parentInstance, type, props);
                            }
                        },
                        didNotFindHydratableTextInstance: function (parentType, parentProps, parentInstance, text) {
                            if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
                                warnForInsertedHydratedText(parentInstance, text);
                            }
                        }
                    },
                    scheduleDeferredCallback: rIC,
                    cancelDeferredCallback: cIC,
                    useSyncScheduling: !enableAsyncSchedulingByDefaultInReactDOM
                });
                injection$4.injectFiberBatchedUpdates(DOMRenderer.batchedUpdates);
                var warnedAboutHydrateAPI = false;
                function renderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
                    !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;
                    {
                        if (container._reactRootContainer && container.nodeType !== COMMENT_NODE) {
                            var hostInstance = DOMRenderer.findHostInstanceWithNoPortals(container._reactRootContainer.current);
                            if (hostInstance) {
                                warning(hostInstance.parentNode === container, 'render(...): It looks like the React-rendered content of this ' + 'container was removed without using React. This is not ' + 'supported and will cause errors. Instead, call ' + 'ReactDOM.unmountComponentAtNode to empty a container.');
                            }
                        }
                        var isRootRenderedBySomeReact = !!container._reactRootContainer;
                        var rootEl = getReactRootElementInContainer(container);
                        var hasNonRootReactChild = !!(rootEl && getInstanceFromNode$1(rootEl));
                        warning(!hasNonRootReactChild || isRootRenderedBySomeReact, 'render(...): Replacing React-rendered children with a new root ' + 'component. If you intended to update the children of this node, ' + 'you should instead have the existing children update their state ' + 'and render the new components instead of calling ReactDOM.render.');
                        warning(container.nodeType !== ELEMENT_NODE || !container.tagName || container.tagName.toUpperCase() !== 'BODY', 'render(): Rendering components directly into document.body is ' + 'discouraged, since its children are often manipulated by third-party ' + 'scripts and browser extensions. This may lead to subtle ' + 'reconciliation issues. Try rendering into a container element created ' + 'for your app.');
                    }
                    var root = container._reactRootContainer;
                    if (!root) {
                        var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
                        if (!shouldHydrate) {
                            var warned = false;
                            var rootSibling = void 0;
                            while (rootSibling = container.lastChild) {
                                {
                                    if (!warned && rootSibling.nodeType === ELEMENT_NODE && rootSibling.hasAttribute(ROOT_ATTRIBUTE_NAME)) {
                                        warned = true;
                                        warning(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.');
                                    }
                                }
                                container.removeChild(rootSibling);
                            }
                        }
                        {
                            if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
                                warnedAboutHydrateAPI = true;
                                lowPriorityWarning$1(false, 'render(): Calling ReactDOM.render() to hydrate server-rendered markup ' + 'will stop working in React v17. Replace the ReactDOM.render() call ' + 'with ReactDOM.hydrate() if you want React to attach to the server HTML.');
                            }
                        }
                        var newRoot = DOMRenderer.createContainer(container, shouldHydrate);
                        root = container._reactRootContainer = newRoot;
                        DOMRenderer.unbatchedUpdates(function () {
                            DOMRenderer.updateContainer(children, newRoot, parentComponent, callback);
                        });
                    } else {
                        DOMRenderer.updateContainer(children, root, parentComponent, callback);
                    }
                    return DOMRenderer.getPublicRootInstance(root);
                }
                function createPortal(children, container) {
                    var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                    !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;
                    return createPortal$1(children, container, null, key);
                }
                function ReactRoot(container, hydrate) {
                    var root = DOMRenderer.createContainer(container, hydrate);
                    this._reactRootContainer = root;
                }
                ReactRoot.prototype.render = function (children, callback) {
                    var root = this._reactRootContainer;
                    DOMRenderer.updateContainer(children, root, null, callback);
                };
                ReactRoot.prototype.unmount = function (callback) {
                    var root = this._reactRootContainer;
                    DOMRenderer.updateContainer(null, root, null, callback);
                };
                var ReactDOM = {
                    createPortal: createPortal,
                    findDOMNode: function (componentOrElement) {
                        {
                            var owner = ReactCurrentOwner.current;
                            if (owner !== null) {
                                var warnedAboutRefsInRender = owner.stateNode._warnedAboutRefsInRender;
                                warning(warnedAboutRefsInRender, '%s is accessing findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(owner) || 'A component');
                                owner.stateNode._warnedAboutRefsInRender = true;
                            }
                        }
                        if (componentOrElement == null) {
                            return null;
                        }
                        if (componentOrElement.nodeType === ELEMENT_NODE) {
                            return componentOrElement;
                        }
                        var inst = get(componentOrElement);
                        if (inst) {
                            return DOMRenderer.findHostInstance(inst);
                        }
                        if (typeof componentOrElement.render === 'function') {
                            invariant(false, 'Unable to find node on an unmounted component.');
                        } else {
                            invariant(false, 'Element appears to be neither ReactComponent nor DOMNode. Keys: %s', Object.keys(componentOrElement));
                        }
                    },
                    hydrate: function (element, container, callback) {
                        return renderSubtreeIntoContainer(null, element, container, true, callback);
                    },
                    render: function (element, container, callback) {
                        return renderSubtreeIntoContainer(null, element, container, false, callback);
                    },
                    unstable_renderSubtreeIntoContainer: function (parentComponent, element, containerNode, callback) {
                        !(parentComponent != null && has(parentComponent)) ? invariant(false, 'parentComponent must be a valid React Component') : void 0;
                        return renderSubtreeIntoContainer(parentComponent, element, containerNode, false, callback);
                    },
                    unmountComponentAtNode: function (container) {
                        !isValidContainer(container) ? invariant(false, 'unmountComponentAtNode(...): Target container is not a DOM element.') : void 0;
                        if (container._reactRootContainer) {
                            {
                                var rootEl = getReactRootElementInContainer(container);
                                var renderedByDifferentReact = rootEl && !getInstanceFromNode$1(rootEl);
                                warning(!renderedByDifferentReact, 'unmountComponentAtNode(): The node you\'re attempting to unmount ' + 'was rendered by another copy of React.');
                            }
                            DOMRenderer.unbatchedUpdates(function () {
                                renderSubtreeIntoContainer(null, null, container, false, function () {
                                    container._reactRootContainer = null;
                                });
                            });
                            return true;
                        } else {
                            {
                                var _rootEl = getReactRootElementInContainer(container);
                                var hasNonRootReactChild = !!(_rootEl && getInstanceFromNode$1(_rootEl));
                                var isContainerReactRoot = container.nodeType === 1 && isValidContainer(container.parentNode) && !!container.parentNode._reactRootContainer;
                                warning(!hasNonRootReactChild, 'unmountComponentAtNode(): The node you\'re attempting to unmount ' + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.');
                            }
                            return false;
                        }
                    },
                    unstable_createPortal: createPortal,
                    unstable_batchedUpdates: batchedUpdates,
                    unstable_deferredUpdates: DOMRenderer.deferredUpdates,
                    flushSync: DOMRenderer.flushSync,
                    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
                        EventPluginHub: EventPluginHub,
                        EventPluginRegistry: EventPluginRegistry,
                        EventPropagators: EventPropagators,
                        ReactControlledComponent: ReactControlledComponent,
                        ReactDOMComponentTree: ReactDOMComponentTree,
                        ReactDOMEventListener: ReactDOMEventListener
                    }
                };
                if (enableCreateRoot) {
                    ReactDOM.createRoot = function createRoot(container, options) {
                        var hydrate = options != null && options.hydrate === true;
                        return new ReactRoot(container, hydrate);
                    };
                }
                var foundDevTools = DOMRenderer.injectIntoDevTools({
                    findFiberByHostInstance: getClosestInstanceFromNode,
                    bundleType: 1,
                    version: ReactVersion,
                    rendererPackageName: 'react-dom'
                });
                {
                    if (!foundDevTools && ExecutionEnvironment.canUseDOM && window.top === window.self) {
                        if (navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Edge') === -1 || navigator.userAgent.indexOf('Firefox') > -1) {
                            var protocol = window.location.protocol;
                            if (/^(https?|file):$/.test(protocol)) {
                                console.info('%cDownload the React DevTools ' + 'for a better development experience: ' + 'https://fb.me/react-devtools' + (protocol === 'file:' ? '\nYou might need to use a local HTTP server (instead of file://): ' + 'https://fb.me/react-devtools-faq' : ''), 'font-weight:bold');
                            }
                        }
                    }
                }
                var ReactDOM$2 = Object.freeze({ default: ReactDOM });
                var ReactDOM$3 = ReactDOM$2 && ReactDOM || ReactDOM$2;
                var reactDom = ReactDOM$3['default'] ? ReactDOM$3['default'] : ReactDOM$3;
                module.exports = reactDom;
            }());
        }
    }(function () {
        return this;
    }(), require, exports, module));
});
/*react-dom@16.2.0#index*/
define('react-dom@16.2.0#index', [
    'require',
    'exports',
    'module',
    './cjs/react-dom.production.min.js',
    './cjs/react-dom.development.js'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        function checkDCE() {
            if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function') {
                return;
            }
            if (process.env.NODE_ENV !== 'production') {
                throw new Error('^_^');
            }
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
            } catch (err) {
                console.error(err);
            }
        }
        if (process.env.NODE_ENV === 'production') {
            checkDCE();
            module.exports = require('./cjs/react-dom.production.min.js');
        } else {
            module.exports = require('./cjs/react-dom.development.js');
        }
    }(function () {
        return this;
    }(), require, exports, module));
});
/*react-dom@16.2.0#cjs/react-dom-test-utils.production.min*/
define('react-dom@16.2.0#cjs/react-dom-test-utils.production.min', [
    'require',
    'exports',
    'module',
    'object-assign',
    'react',
    'react-dom',
    'fbjs/lib/emptyFunction',
    'fbjs/lib/ExecutionEnvironment'
], function (require, exports, module) {
    'use strict';
    var f = require('object-assign'), h = require('react'), m = require('react-dom'), n = require('fbjs/lib/emptyFunction'), p = require('fbjs/lib/ExecutionEnvironment');
    function q(a) {
        for (var b = arguments.length - 1, c = 'Minified React error #' + a + '; visit http://facebook.github.io/react/docs/error-decoder.html?invariant=' + a, d = 0; d < b; d++)
            c += '&args[]=' + encodeURIComponent(arguments[d + 1]);
        b = Error(c + ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.');
        b.name = 'Invariant Violation';
        b.framesToPop = 1;
        throw b;
    }
    function r(a) {
        var b = a;
        if (a.alternate)
            for (; b['return'];)
                b = b['return'];
        else {
            if (0 !== (b.effectTag & 2))
                return 1;
            for (; b['return'];)
                if (b = b['return'], 0 !== (b.effectTag & 2))
                    return 1;
        }
        return 3 === b.tag ? 2 : 3;
    }
    function t(a) {
        2 !== r(a) ? q('188') : void 0;
    }
    function u(a) {
        var b = a.alternate;
        if (!b)
            return b = r(a), 3 === b ? q('188') : void 0, 1 === b ? null : a;
        for (var c = a, d = b;;) {
            var e = c['return'], l = e ? e.alternate : null;
            if (!e || !l)
                break;
            if (e.child === l.child) {
                for (var g = e.child; g;) {
                    if (g === c)
                        return t(e), a;
                    if (g === d)
                        return t(e), b;
                    g = g.sibling;
                }
                q('188');
            }
            if (c['return'] !== d['return'])
                c = e, d = l;
            else {
                g = !1;
                for (var k = e.child; k;) {
                    if (k === c) {
                        g = !0;
                        c = e;
                        d = l;
                        break;
                    }
                    if (k === d) {
                        g = !0;
                        d = e;
                        c = l;
                        break;
                    }
                    k = k.sibling;
                }
                if (!g) {
                    for (k = l.child; k;) {
                        if (k === c) {
                            g = !0;
                            c = l;
                            d = e;
                            break;
                        }
                        if (k === d) {
                            g = !0;
                            d = l;
                            c = e;
                            break;
                        }
                        k = k.sibling;
                    }
                    g ? void 0 : q('189');
                }
            }
            c.alternate !== d ? q('190') : void 0;
        }
        3 !== c.tag ? q('188') : void 0;
        return c.stateNode.current === c ? a : b;
    }
    var v = 'dispatchConfig _targetInst nativeEvent isDefaultPrevented isPropagationStopped _dispatchListeners _dispatchInstances'.split(' '), w = {
            type: null,
            target: null,
            currentTarget: n.thatReturnsNull,
            eventPhase: null,
            bubbles: null,
            cancelable: null,
            timeStamp: function (a) {
                return a.timeStamp || Date.now();
            },
            defaultPrevented: null,
            isTrusted: null
        };
    function x(a, b, c, d) {
        this.dispatchConfig = a;
        this._targetInst = b;
        this.nativeEvent = c;
        a = this.constructor.Interface;
        for (var e in a)
            a.hasOwnProperty(e) && ((b = a[e]) ? this[e] = b(c) : 'target' === e ? this.target = d : this[e] = c[e]);
        this.isDefaultPrevented = (null != c.defaultPrevented ? c.defaultPrevented : !1 === c.returnValue) ? n.thatReturnsTrue : n.thatReturnsFalse;
        this.isPropagationStopped = n.thatReturnsFalse;
        return this;
    }
    f(x.prototype, {
        preventDefault: function () {
            this.defaultPrevented = !0;
            var a = this.nativeEvent;
            a && (a.preventDefault ? a.preventDefault() : 'unknown' !== typeof a.returnValue && (a.returnValue = !1), this.isDefaultPrevented = n.thatReturnsTrue);
        },
        stopPropagation: function () {
            var a = this.nativeEvent;
            a && (a.stopPropagation ? a.stopPropagation() : 'unknown' !== typeof a.cancelBubble && (a.cancelBubble = !0), this.isPropagationStopped = n.thatReturnsTrue);
        },
        persist: function () {
            this.isPersistent = n.thatReturnsTrue;
        },
        isPersistent: n.thatReturnsFalse,
        destructor: function () {
            var a = this.constructor.Interface, b;
            for (b in a)
                this[b] = null;
            for (a = 0; a < v.length; a++)
                this[v[a]] = null;
        }
    });
    x.Interface = w;
    x.augmentClass = function (a, b) {
        function c() {
        }
        c.prototype = this.prototype;
        var d = new c();
        f(d, a.prototype);
        a.prototype = d;
        a.prototype.constructor = a;
        a.Interface = f({}, this.Interface, b);
        a.augmentClass = this.augmentClass;
        y(a);
    };
    y(x);
    function z(a, b, c, d) {
        if (this.eventPool.length) {
            var e = this.eventPool.pop();
            this.call(e, a, b, c, d);
            return e;
        }
        return new this(a, b, c, d);
    }
    function A(a) {
        a instanceof this ? void 0 : q('223');
        a.destructor();
        10 > this.eventPool.length && this.eventPool.push(a);
    }
    function y(a) {
        a.eventPool = [];
        a.getPooled = z;
        a.release = A;
    }
    function B(a, b) {
        var c = {};
        c[a.toLowerCase()] = b.toLowerCase();
        c['Webkit' + a] = 'webkit' + b;
        c['Moz' + a] = 'moz' + b;
        c['ms' + a] = 'MS' + b;
        c['O' + a] = 'o' + b.toLowerCase();
        return c;
    }
    var C = {
            animationend: B('Animation', 'AnimationEnd'),
            animationiteration: B('Animation', 'AnimationIteration'),
            animationstart: B('Animation', 'AnimationStart'),
            transitionend: B('Transition', 'TransitionEnd')
        }, D = {}, E = {};
    p.canUseDOM && (E = document.createElement('div').style, 'AnimationEvent' in window || (delete C.animationend.animation, delete C.animationiteration.animation, delete C.animationstart.animation), 'TransitionEvent' in window || delete C.transitionend.transition);
    function F(a) {
        if (D[a])
            return D[a];
        if (!C[a])
            return a;
        var b = C[a], c;
        for (c in b)
            if (b.hasOwnProperty(c) && c in E)
                return D[a] = b[c];
        return '';
    }
    var G = {
            topLevelTypes: {
                topAbort: 'abort',
                topAnimationEnd: F('animationend') || 'animationend',
                topAnimationIteration: F('animationiteration') || 'animationiteration',
                topAnimationStart: F('animationstart') || 'animationstart',
                topBlur: 'blur',
                topCancel: 'cancel',
                topCanPlay: 'canplay',
                topCanPlayThrough: 'canplaythrough',
                topChange: 'change',
                topClick: 'click',
                topClose: 'close',
                topCompositionEnd: 'compositionend',
                topCompositionStart: 'compositionstart',
                topCompositionUpdate: 'compositionupdate',
                topContextMenu: 'contextmenu',
                topCopy: 'copy',
                topCut: 'cut',
                topDoubleClick: 'dblclick',
                topDrag: 'drag',
                topDragEnd: 'dragend',
                topDragEnter: 'dragenter',
                topDragExit: 'dragexit',
                topDragLeave: 'dragleave',
                topDragOver: 'dragover',
                topDragStart: 'dragstart',
                topDrop: 'drop',
                topDurationChange: 'durationchange',
                topEmptied: 'emptied',
                topEncrypted: 'encrypted',
                topEnded: 'ended',
                topError: 'error',
                topFocus: 'focus',
                topInput: 'input',
                topKeyDown: 'keydown',
                topKeyPress: 'keypress',
                topKeyUp: 'keyup',
                topLoadedData: 'loadeddata',
                topLoad: 'load',
                topLoadedMetadata: 'loadedmetadata',
                topLoadStart: 'loadstart',
                topMouseDown: 'mousedown',
                topMouseMove: 'mousemove',
                topMouseOut: 'mouseout',
                topMouseOver: 'mouseover',
                topMouseUp: 'mouseup',
                topPaste: 'paste',
                topPause: 'pause',
                topPlay: 'play',
                topPlaying: 'playing',
                topProgress: 'progress',
                topRateChange: 'ratechange',
                topScroll: 'scroll',
                topSeeked: 'seeked',
                topSeeking: 'seeking',
                topSelectionChange: 'selectionchange',
                topStalled: 'stalled',
                topSuspend: 'suspend',
                topTextInput: 'textInput',
                topTimeUpdate: 'timeupdate',
                topToggle: 'toggle',
                topTouchCancel: 'touchcancel',
                topTouchEnd: 'touchend',
                topTouchMove: 'touchmove',
                topTouchStart: 'touchstart',
                topTransitionEnd: F('transitionend') || 'transitionend',
                topVolumeChange: 'volumechange',
                topWaiting: 'waiting',
                topWheel: 'wheel'
            }
        }, H = m.findDOMNode, I = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, J = I.EventPluginHub, K = I.EventPluginRegistry, L = I.EventPropagators, M = I.ReactControlledComponent, N = I.ReactDOMComponentTree, O = I.ReactDOMEventListener, P = G.topLevelTypes;
    function Q() {
    }
    function R(a, b) {
        if (!a)
            return [];
        a = u(a);
        if (!a)
            return [];
        for (var c = a, d = [];;) {
            if (5 === c.tag || 6 === c.tag || 2 === c.tag || 1 === c.tag) {
                var e = c.stateNode;
                b(e) && d.push(e);
            }
            if (c.child)
                c.child['return'] = c, c = c.child;
            else {
                if (c === a)
                    return d;
                for (; !c.sibling;) {
                    if (!c['return'] || c['return'] === a)
                        return d;
                    c = c['return'];
                }
                c.sibling['return'] = c['return'];
                c = c.sibling;
            }
        }
    }
    var S = {
        renderIntoDocument: function (a) {
            var b = document.createElement('div');
            return m.render(a, b);
        },
        isElement: function (a) {
            return h.isValidElement(a);
        },
        isElementOfType: function (a, b) {
            return h.isValidElement(a) && a.type === b;
        },
        isDOMComponent: function (a) {
            return !(!a || 1 !== a.nodeType || !a.tagName);
        },
        isDOMComponentElement: function (a) {
            return !!(a && h.isValidElement(a) && a.tagName);
        },
        isCompositeComponent: function (a) {
            return S.isDOMComponent(a) ? !1 : null != a && 'function' === typeof a.render && 'function' === typeof a.setState;
        },
        isCompositeComponentWithType: function (a, b) {
            return S.isCompositeComponent(a) ? a._reactInternalFiber.type === b : !1;
        },
        findAllInRenderedTree: function (a, b) {
            if (!a)
                return [];
            S.isCompositeComponent(a) ? void 0 : q('10');
            return R(a._reactInternalFiber, b);
        },
        scryRenderedDOMComponentsWithClass: function (a, b) {
            return S.findAllInRenderedTree(a, function (a) {
                if (S.isDOMComponent(a)) {
                    var c = a.className;
                    'string' !== typeof c && (c = a.getAttribute('class') || '');
                    var e = c.split(/\s+/);
                    Array.isArray(b) || (void 0 === b ? q('11') : void 0, b = b.split(/\s+/));
                    return b.every(function (a) {
                        return -1 !== e.indexOf(a);
                    });
                }
                return !1;
            });
        },
        findRenderedDOMComponentWithClass: function (a, b) {
            a = S.scryRenderedDOMComponentsWithClass(a, b);
            if (1 !== a.length)
                throw Error('Did not find exactly one match (found: ' + a.length + ') for class:' + b);
            return a[0];
        },
        scryRenderedDOMComponentsWithTag: function (a, b) {
            return S.findAllInRenderedTree(a, function (a) {
                return S.isDOMComponent(a) && a.tagName.toUpperCase() === b.toUpperCase();
            });
        },
        findRenderedDOMComponentWithTag: function (a, b) {
            a = S.scryRenderedDOMComponentsWithTag(a, b);
            if (1 !== a.length)
                throw Error('Did not find exactly one match (found: ' + a.length + ') for tag:' + b);
            return a[0];
        },
        scryRenderedComponentsWithType: function (a, b) {
            return S.findAllInRenderedTree(a, function (a) {
                return S.isCompositeComponentWithType(a, b);
            });
        },
        findRenderedComponentWithType: function (a, b) {
            a = S.scryRenderedComponentsWithType(a, b);
            if (1 !== a.length)
                throw Error('Did not find exactly one match (found: ' + a.length + ') for componentType:' + b);
            return a[0];
        },
        mockComponent: function (a, b) {
            b = b || a.mockTagName || 'div';
            a.prototype.render.mockImplementation(function () {
                return h.createElement(b, null, this.props.children);
            });
            return this;
        },
        simulateNativeEventOnNode: function (a, b, c) {
            c.target = b;
            O.dispatchEvent(a, c);
        },
        simulateNativeEventOnDOMComponent: function (a, b, c) {
            S.simulateNativeEventOnNode(a, H(b), c);
        },
        nativeTouchData: function (a, b) {
            return {
                touches: [{
                        pageX: a,
                        pageY: b
                    }]
            };
        },
        Simulate: null,
        SimulateNative: {}
    };
    function T(a) {
        return function (b, c) {
            h.isValidElement(b) ? q('228') : void 0;
            S.isCompositeComponent(b) ? q('229') : void 0;
            var d = K.eventNameDispatchConfigs[a], e = new Q();
            e.target = b;
            e.type = a.toLowerCase();
            var l = N.getInstanceFromNode(b), g = new x(d, l, e, b);
            g.persist();
            f(g, c);
            d.phasedRegistrationNames ? L.accumulateTwoPhaseDispatches(g) : L.accumulateDirectDispatches(g);
            m.unstable_batchedUpdates(function () {
                M.enqueueStateRestore(b);
                J.enqueueEvents(g);
                J.processEventQueue(!0);
            });
        };
    }
    function U() {
        S.Simulate = {};
        for (var a in K.eventNameDispatchConfigs)
            S.Simulate[a] = T(a);
    }
    var V = J.injection.injectEventPluginOrder;
    J.injection.injectEventPluginOrder = function () {
        V.apply(this, arguments);
        U();
    };
    var W = J.injection.injectEventPluginsByName;
    J.injection.injectEventPluginsByName = function () {
        W.apply(this, arguments);
        U();
    };
    U();
    function X(a) {
        return function (b, c) {
            var d = new Q(a);
            f(d, c);
            S.isDOMComponent(b) ? S.simulateNativeEventOnDOMComponent(a, b, d) : b.tagName && S.simulateNativeEventOnNode(a, b, d);
        };
    }
    Object.keys(P).forEach(function (a) {
        var b = 0 === a.indexOf('top') ? a.charAt(3).toLowerCase() + a.substr(4) : a;
        S.SimulateNative[b] = X(a);
    });
    var Y = Object.freeze({ default: S }), Z = Y && S || Y;
    module.exports = Z['default'] ? Z['default'] : Z;
});
/*react-dom@16.2.0#cjs/react-dom-test-utils.development*/
define('react-dom@16.2.0#cjs/react-dom-test-utils.development', [
    'require',
    'exports',
    'module',
    'object-assign',
    'react',
    'react-dom',
    'fbjs/lib/invariant',
    'fbjs/lib/warning',
    'fbjs/lib/emptyFunction',
    'fbjs/lib/ExecutionEnvironment'
], function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV !== 'production') {
        (function () {
            'use strict';
            var _assign = require('object-assign');
            var React = require('react');
            var ReactDOM = require('react-dom');
            var invariant = require('fbjs/lib/invariant');
            var warning = require('fbjs/lib/warning');
            var emptyFunction = require('fbjs/lib/emptyFunction');
            var ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');
            function get(key) {
                return key._reactInternalFiber;
            }
            var ReactInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
            var ReactCurrentOwner = ReactInternals.ReactCurrentOwner;
            var ReactDebugCurrentFrame = ReactInternals.ReactDebugCurrentFrame;
            var FunctionalComponent = 1;
            var ClassComponent = 2;
            var HostRoot = 3;
            var HostComponent = 5;
            var HostText = 6;
            var NoEffect = 0;
            var Placement = 2;
            var MOUNTING = 1;
            var MOUNTED = 2;
            var UNMOUNTED = 3;
            function isFiberMountedImpl(fiber) {
                var node = fiber;
                if (!fiber.alternate) {
                    if ((node.effectTag & Placement) !== NoEffect) {
                        return MOUNTING;
                    }
                    while (node['return']) {
                        node = node['return'];
                        if ((node.effectTag & Placement) !== NoEffect) {
                            return MOUNTING;
                        }
                    }
                } else {
                    while (node['return']) {
                        node = node['return'];
                    }
                }
                if (node.tag === HostRoot) {
                    return MOUNTED;
                }
                return UNMOUNTED;
            }
            function assertIsMounted(fiber) {
                !(isFiberMountedImpl(fiber) === MOUNTED) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
            }
            function findCurrentFiberUsingSlowPath(fiber) {
                var alternate = fiber.alternate;
                if (!alternate) {
                    var state = isFiberMountedImpl(fiber);
                    !(state !== UNMOUNTED) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
                    if (state === MOUNTING) {
                        return null;
                    }
                    return fiber;
                }
                var a = fiber;
                var b = alternate;
                while (true) {
                    var parentA = a['return'];
                    var parentB = parentA ? parentA.alternate : null;
                    if (!parentA || !parentB) {
                        break;
                    }
                    if (parentA.child === parentB.child) {
                        var child = parentA.child;
                        while (child) {
                            if (child === a) {
                                assertIsMounted(parentA);
                                return fiber;
                            }
                            if (child === b) {
                                assertIsMounted(parentA);
                                return alternate;
                            }
                            child = child.sibling;
                        }
                        invariant(false, 'Unable to find node on an unmounted component.');
                    }
                    if (a['return'] !== b['return']) {
                        a = parentA;
                        b = parentB;
                    } else {
                        var didFindChild = false;
                        var _child = parentA.child;
                        while (_child) {
                            if (_child === a) {
                                didFindChild = true;
                                a = parentA;
                                b = parentB;
                                break;
                            }
                            if (_child === b) {
                                didFindChild = true;
                                b = parentA;
                                a = parentB;
                                break;
                            }
                            _child = _child.sibling;
                        }
                        if (!didFindChild) {
                            _child = parentB.child;
                            while (_child) {
                                if (_child === a) {
                                    didFindChild = true;
                                    a = parentB;
                                    b = parentA;
                                    break;
                                }
                                if (_child === b) {
                                    didFindChild = true;
                                    b = parentB;
                                    a = parentA;
                                    break;
                                }
                                _child = _child.sibling;
                            }
                            !didFindChild ? invariant(false, 'Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.') : void 0;
                        }
                    }
                    !(a.alternate === b) ? invariant(false, 'Return fibers should always be each others\' alternates. This error is likely caused by a bug in React. Please file an issue.') : void 0;
                }
                !(a.tag === HostRoot) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
                if (a.stateNode.current === a) {
                    return fiber;
                }
                return alternate;
            }
            var didWarnForAddedNewProperty = false;
            var isProxySupported = typeof Proxy === 'function';
            var EVENT_POOL_SIZE = 10;
            var shouldBeReleasedProperties = [
                'dispatchConfig',
                '_targetInst',
                'nativeEvent',
                'isDefaultPrevented',
                'isPropagationStopped',
                '_dispatchListeners',
                '_dispatchInstances'
            ];
            var EventInterface = {
                type: null,
                target: null,
                currentTarget: emptyFunction.thatReturnsNull,
                eventPhase: null,
                bubbles: null,
                cancelable: null,
                timeStamp: function (event) {
                    return event.timeStamp || Date.now();
                },
                defaultPrevented: null,
                isTrusted: null
            };
            function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
                {
                    delete this.nativeEvent;
                    delete this.preventDefault;
                    delete this.stopPropagation;
                }
                this.dispatchConfig = dispatchConfig;
                this._targetInst = targetInst;
                this.nativeEvent = nativeEvent;
                var Interface = this.constructor.Interface;
                for (var propName in Interface) {
                    if (!Interface.hasOwnProperty(propName)) {
                        continue;
                    }
                    {
                        delete this[propName];
                    }
                    var normalize = Interface[propName];
                    if (normalize) {
                        this[propName] = normalize(nativeEvent);
                    } else {
                        if (propName === 'target') {
                            this.target = nativeEventTarget;
                        } else {
                            this[propName] = nativeEvent[propName];
                        }
                    }
                }
                var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
                if (defaultPrevented) {
                    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
                } else {
                    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
                }
                this.isPropagationStopped = emptyFunction.thatReturnsFalse;
                return this;
            }
            _assign(SyntheticEvent.prototype, {
                preventDefault: function () {
                    this.defaultPrevented = true;
                    var event = this.nativeEvent;
                    if (!event) {
                        return;
                    }
                    if (event.preventDefault) {
                        event.preventDefault();
                    } else if (typeof event.returnValue !== 'unknown') {
                        event.returnValue = false;
                    }
                    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
                },
                stopPropagation: function () {
                    var event = this.nativeEvent;
                    if (!event) {
                        return;
                    }
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    } else if (typeof event.cancelBubble !== 'unknown') {
                        event.cancelBubble = true;
                    }
                    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
                },
                persist: function () {
                    this.isPersistent = emptyFunction.thatReturnsTrue;
                },
                isPersistent: emptyFunction.thatReturnsFalse,
                destructor: function () {
                    var Interface = this.constructor.Interface;
                    for (var propName in Interface) {
                        {
                            Object.defineProperty(this, propName, getPooledWarningPropertyDefinition(propName, Interface[propName]));
                        }
                    }
                    for (var i = 0; i < shouldBeReleasedProperties.length; i++) {
                        this[shouldBeReleasedProperties[i]] = null;
                    }
                    {
                        Object.defineProperty(this, 'nativeEvent', getPooledWarningPropertyDefinition('nativeEvent', null));
                        Object.defineProperty(this, 'preventDefault', getPooledWarningPropertyDefinition('preventDefault', emptyFunction));
                        Object.defineProperty(this, 'stopPropagation', getPooledWarningPropertyDefinition('stopPropagation', emptyFunction));
                    }
                }
            });
            SyntheticEvent.Interface = EventInterface;
            SyntheticEvent.augmentClass = function (Class, Interface) {
                var Super = this;
                var E = function () {
                };
                E.prototype = Super.prototype;
                var prototype = new E();
                _assign(prototype, Class.prototype);
                Class.prototype = prototype;
                Class.prototype.constructor = Class;
                Class.Interface = _assign({}, Super.Interface, Interface);
                Class.augmentClass = Super.augmentClass;
                addEventPoolingTo(Class);
            };
            {
                if (isProxySupported) {
                    SyntheticEvent = new Proxy(SyntheticEvent, {
                        construct: function (target, args) {
                            return this.apply(target, Object.create(target.prototype), args);
                        },
                        apply: function (constructor, that, args) {
                            return new Proxy(constructor.apply(that, args), {
                                set: function (target, prop, value) {
                                    if (prop !== 'isPersistent' && !target.constructor.Interface.hasOwnProperty(prop) && shouldBeReleasedProperties.indexOf(prop) === -1) {
                                        warning(didWarnForAddedNewProperty || target.isPersistent(), 'This synthetic event is reused for performance reasons. If you\'re ' + 'seeing this, you\'re adding a new property in the synthetic event object. ' + 'The property is never released. See ' + 'https://fb.me/react-event-pooling for more information.');
                                        didWarnForAddedNewProperty = true;
                                    }
                                    target[prop] = value;
                                    return true;
                                }
                            });
                        }
                    });
                }
            }
            addEventPoolingTo(SyntheticEvent);
            function getPooledWarningPropertyDefinition(propName, getVal) {
                var isFunction = typeof getVal === 'function';
                return {
                    configurable: true,
                    set: set,
                    get: get
                };
                function set(val) {
                    var action = isFunction ? 'setting the method' : 'setting the property';
                    warn(action, 'This is effectively a no-op');
                    return val;
                }
                function get() {
                    var action = isFunction ? 'accessing the method' : 'accessing the property';
                    var result = isFunction ? 'This is a no-op function' : 'This is set to null';
                    warn(action, result);
                    return getVal;
                }
                function warn(action, result) {
                    var warningCondition = false;
                    warning(warningCondition, 'This synthetic event is reused for performance reasons. If you\'re seeing this, ' + 'you\'re %s `%s` on a released/nullified synthetic event. %s. ' + 'If you must keep the original synthetic event around, use event.persist(). ' + 'See https://fb.me/react-event-pooling for more information.', action, propName, result);
                }
            }
            function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
                var EventConstructor = this;
                if (EventConstructor.eventPool.length) {
                    var instance = EventConstructor.eventPool.pop();
                    EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
                    return instance;
                }
                return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
            }
            function releasePooledEvent(event) {
                var EventConstructor = this;
                !(event instanceof EventConstructor) ? invariant(false, 'Trying to release an event instance  into a pool of a different type.') : void 0;
                event.destructor();
                if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
                    EventConstructor.eventPool.push(event);
                }
            }
            function addEventPoolingTo(EventConstructor) {
                EventConstructor.eventPool = [];
                EventConstructor.getPooled = getPooledEvent;
                EventConstructor.release = releasePooledEvent;
            }
            var SyntheticEvent$1 = SyntheticEvent;
            function makePrefixMap(styleProp, eventName) {
                var prefixes = {};
                prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
                prefixes['Webkit' + styleProp] = 'webkit' + eventName;
                prefixes['Moz' + styleProp] = 'moz' + eventName;
                prefixes['ms' + styleProp] = 'MS' + eventName;
                prefixes['O' + styleProp] = 'o' + eventName.toLowerCase();
                return prefixes;
            }
            var vendorPrefixes = {
                animationend: makePrefixMap('Animation', 'AnimationEnd'),
                animationiteration: makePrefixMap('Animation', 'AnimationIteration'),
                animationstart: makePrefixMap('Animation', 'AnimationStart'),
                transitionend: makePrefixMap('Transition', 'TransitionEnd')
            };
            var prefixedEventNames = {};
            var style = {};
            if (ExecutionEnvironment.canUseDOM) {
                style = document.createElement('div').style;
                if (!('AnimationEvent' in window)) {
                    delete vendorPrefixes.animationend.animation;
                    delete vendorPrefixes.animationiteration.animation;
                    delete vendorPrefixes.animationstart.animation;
                }
                if (!('TransitionEvent' in window)) {
                    delete vendorPrefixes.transitionend.transition;
                }
            }
            function getVendorPrefixedEventName(eventName) {
                if (prefixedEventNames[eventName]) {
                    return prefixedEventNames[eventName];
                } else if (!vendorPrefixes[eventName]) {
                    return eventName;
                }
                var prefixMap = vendorPrefixes[eventName];
                for (var styleProp in prefixMap) {
                    if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
                        return prefixedEventNames[eventName] = prefixMap[styleProp];
                    }
                }
                return '';
            }
            var topLevelTypes$1 = {
                topAbort: 'abort',
                topAnimationEnd: getVendorPrefixedEventName('animationend') || 'animationend',
                topAnimationIteration: getVendorPrefixedEventName('animationiteration') || 'animationiteration',
                topAnimationStart: getVendorPrefixedEventName('animationstart') || 'animationstart',
                topBlur: 'blur',
                topCancel: 'cancel',
                topCanPlay: 'canplay',
                topCanPlayThrough: 'canplaythrough',
                topChange: 'change',
                topClick: 'click',
                topClose: 'close',
                topCompositionEnd: 'compositionend',
                topCompositionStart: 'compositionstart',
                topCompositionUpdate: 'compositionupdate',
                topContextMenu: 'contextmenu',
                topCopy: 'copy',
                topCut: 'cut',
                topDoubleClick: 'dblclick',
                topDrag: 'drag',
                topDragEnd: 'dragend',
                topDragEnter: 'dragenter',
                topDragExit: 'dragexit',
                topDragLeave: 'dragleave',
                topDragOver: 'dragover',
                topDragStart: 'dragstart',
                topDrop: 'drop',
                topDurationChange: 'durationchange',
                topEmptied: 'emptied',
                topEncrypted: 'encrypted',
                topEnded: 'ended',
                topError: 'error',
                topFocus: 'focus',
                topInput: 'input',
                topKeyDown: 'keydown',
                topKeyPress: 'keypress',
                topKeyUp: 'keyup',
                topLoadedData: 'loadeddata',
                topLoad: 'load',
                topLoadedMetadata: 'loadedmetadata',
                topLoadStart: 'loadstart',
                topMouseDown: 'mousedown',
                topMouseMove: 'mousemove',
                topMouseOut: 'mouseout',
                topMouseOver: 'mouseover',
                topMouseUp: 'mouseup',
                topPaste: 'paste',
                topPause: 'pause',
                topPlay: 'play',
                topPlaying: 'playing',
                topProgress: 'progress',
                topRateChange: 'ratechange',
                topScroll: 'scroll',
                topSeeked: 'seeked',
                topSeeking: 'seeking',
                topSelectionChange: 'selectionchange',
                topStalled: 'stalled',
                topSuspend: 'suspend',
                topTextInput: 'textInput',
                topTimeUpdate: 'timeupdate',
                topToggle: 'toggle',
                topTouchCancel: 'touchcancel',
                topTouchEnd: 'touchend',
                topTouchMove: 'touchmove',
                topTouchStart: 'touchstart',
                topTransitionEnd: getVendorPrefixedEventName('transitionend') || 'transitionend',
                topVolumeChange: 'volumechange',
                topWaiting: 'waiting',
                topWheel: 'wheel'
            };
            var BrowserEventConstants = { topLevelTypes: topLevelTypes$1 };
            var findDOMNode = ReactDOM.findDOMNode;
            var _ReactDOM$__SECRET_IN = ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
            var EventPluginHub = _ReactDOM$__SECRET_IN.EventPluginHub;
            var EventPluginRegistry = _ReactDOM$__SECRET_IN.EventPluginRegistry;
            var EventPropagators = _ReactDOM$__SECRET_IN.EventPropagators;
            var ReactControlledComponent = _ReactDOM$__SECRET_IN.ReactControlledComponent;
            var ReactDOMComponentTree = _ReactDOM$__SECRET_IN.ReactDOMComponentTree;
            var ReactDOMEventListener = _ReactDOM$__SECRET_IN.ReactDOMEventListener;
            var topLevelTypes = BrowserEventConstants.topLevelTypes;
            function Event(suffix) {
            }
            function findAllInRenderedFiberTreeInternal(fiber, test) {
                if (!fiber) {
                    return [];
                }
                var currentParent = findCurrentFiberUsingSlowPath(fiber);
                if (!currentParent) {
                    return [];
                }
                var node = currentParent;
                var ret = [];
                while (true) {
                    if (node.tag === HostComponent || node.tag === HostText || node.tag === ClassComponent || node.tag === FunctionalComponent) {
                        var publicInst = node.stateNode;
                        if (test(publicInst)) {
                            ret.push(publicInst);
                        }
                    }
                    if (node.child) {
                        node.child['return'] = node;
                        node = node.child;
                        continue;
                    }
                    if (node === currentParent) {
                        return ret;
                    }
                    while (!node.sibling) {
                        if (!node['return'] || node['return'] === currentParent) {
                            return ret;
                        }
                        node = node['return'];
                    }
                    node.sibling['return'] = node['return'];
                    node = node.sibling;
                }
            }
            var ReactTestUtils = {
                renderIntoDocument: function (element) {
                    var div = document.createElement('div');
                    return ReactDOM.render(element, div);
                },
                isElement: function (element) {
                    return React.isValidElement(element);
                },
                isElementOfType: function (inst, convenienceConstructor) {
                    return React.isValidElement(inst) && inst.type === convenienceConstructor;
                },
                isDOMComponent: function (inst) {
                    return !!(inst && inst.nodeType === 1 && inst.tagName);
                },
                isDOMComponentElement: function (inst) {
                    return !!(inst && React.isValidElement(inst) && !!inst.tagName);
                },
                isCompositeComponent: function (inst) {
                    if (ReactTestUtils.isDOMComponent(inst)) {
                        return false;
                    }
                    return inst != null && typeof inst.render === 'function' && typeof inst.setState === 'function';
                },
                isCompositeComponentWithType: function (inst, type) {
                    if (!ReactTestUtils.isCompositeComponent(inst)) {
                        return false;
                    }
                    var internalInstance = get(inst);
                    var constructor = internalInstance.type;
                    return constructor === type;
                },
                findAllInRenderedTree: function (inst, test) {
                    if (!inst) {
                        return [];
                    }
                    !ReactTestUtils.isCompositeComponent(inst) ? invariant(false, 'findAllInRenderedTree(...): instance must be a composite component') : void 0;
                    var internalInstance = get(inst);
                    return findAllInRenderedFiberTreeInternal(internalInstance, test);
                },
                scryRenderedDOMComponentsWithClass: function (root, classNames) {
                    return ReactTestUtils.findAllInRenderedTree(root, function (inst) {
                        if (ReactTestUtils.isDOMComponent(inst)) {
                            var className = inst.className;
                            if (typeof className !== 'string') {
                                className = inst.getAttribute('class') || '';
                            }
                            var classList = className.split(/\s+/);
                            if (!Array.isArray(classNames)) {
                                !(classNames !== undefined) ? invariant(false, 'TestUtils.scryRenderedDOMComponentsWithClass expects a className as a second argument.') : void 0;
                                classNames = classNames.split(/\s+/);
                            }
                            return classNames.every(function (name) {
                                return classList.indexOf(name) !== -1;
                            });
                        }
                        return false;
                    });
                },
                findRenderedDOMComponentWithClass: function (root, className) {
                    var all = ReactTestUtils.scryRenderedDOMComponentsWithClass(root, className);
                    if (all.length !== 1) {
                        throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for class:' + className);
                    }
                    return all[0];
                },
                scryRenderedDOMComponentsWithTag: function (root, tagName) {
                    return ReactTestUtils.findAllInRenderedTree(root, function (inst) {
                        return ReactTestUtils.isDOMComponent(inst) && inst.tagName.toUpperCase() === tagName.toUpperCase();
                    });
                },
                findRenderedDOMComponentWithTag: function (root, tagName) {
                    var all = ReactTestUtils.scryRenderedDOMComponentsWithTag(root, tagName);
                    if (all.length !== 1) {
                        throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for tag:' + tagName);
                    }
                    return all[0];
                },
                scryRenderedComponentsWithType: function (root, componentType) {
                    return ReactTestUtils.findAllInRenderedTree(root, function (inst) {
                        return ReactTestUtils.isCompositeComponentWithType(inst, componentType);
                    });
                },
                findRenderedComponentWithType: function (root, componentType) {
                    var all = ReactTestUtils.scryRenderedComponentsWithType(root, componentType);
                    if (all.length !== 1) {
                        throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for componentType:' + componentType);
                    }
                    return all[0];
                },
                mockComponent: function (module, mockTagName) {
                    mockTagName = mockTagName || module.mockTagName || 'div';
                    module.prototype.render.mockImplementation(function () {
                        return React.createElement(mockTagName, null, this.props.children);
                    });
                    return this;
                },
                simulateNativeEventOnNode: function (topLevelType, node, fakeNativeEvent) {
                    fakeNativeEvent.target = node;
                    ReactDOMEventListener.dispatchEvent(topLevelType, fakeNativeEvent);
                },
                simulateNativeEventOnDOMComponent: function (topLevelType, comp, fakeNativeEvent) {
                    ReactTestUtils.simulateNativeEventOnNode(topLevelType, findDOMNode(comp), fakeNativeEvent);
                },
                nativeTouchData: function (x, y) {
                    return {
                        touches: [{
                                pageX: x,
                                pageY: y
                            }]
                    };
                },
                Simulate: null,
                SimulateNative: {}
            };
            function makeSimulator(eventType) {
                return function (domNode, eventData) {
                    !!React.isValidElement(domNode) ? invariant(false, 'TestUtils.Simulate expected a DOM node as the first argument but received a React element. Pass the DOM node you wish to simulate the event on instead. Note that TestUtils.Simulate will not work if you are using shallow rendering.') : void 0;
                    !!ReactTestUtils.isCompositeComponent(domNode) ? invariant(false, 'TestUtils.Simulate expected a DOM node as the first argument but received a component instance. Pass the DOM node you wish to simulate the event on instead.') : void 0;
                    var dispatchConfig = EventPluginRegistry.eventNameDispatchConfigs[eventType];
                    var fakeNativeEvent = new Event();
                    fakeNativeEvent.target = domNode;
                    fakeNativeEvent.type = eventType.toLowerCase();
                    var targetInst = ReactDOMComponentTree.getInstanceFromNode(domNode);
                    var event = new SyntheticEvent$1(dispatchConfig, targetInst, fakeNativeEvent, domNode);
                    event.persist();
                    _assign(event, eventData);
                    if (dispatchConfig.phasedRegistrationNames) {
                        EventPropagators.accumulateTwoPhaseDispatches(event);
                    } else {
                        EventPropagators.accumulateDirectDispatches(event);
                    }
                    ReactDOM.unstable_batchedUpdates(function () {
                        ReactControlledComponent.enqueueStateRestore(domNode);
                        EventPluginHub.enqueueEvents(event);
                        EventPluginHub.processEventQueue(true);
                    });
                };
            }
            function buildSimulators() {
                ReactTestUtils.Simulate = {};
                var eventType;
                for (eventType in EventPluginRegistry.eventNameDispatchConfigs) {
                    ReactTestUtils.Simulate[eventType] = makeSimulator(eventType);
                }
            }
            var oldInjectEventPluginOrder = EventPluginHub.injection.injectEventPluginOrder;
            EventPluginHub.injection.injectEventPluginOrder = function () {
                oldInjectEventPluginOrder.apply(this, arguments);
                buildSimulators();
            };
            var oldInjectEventPlugins = EventPluginHub.injection.injectEventPluginsByName;
            EventPluginHub.injection.injectEventPluginsByName = function () {
                oldInjectEventPlugins.apply(this, arguments);
                buildSimulators();
            };
            buildSimulators();
            function makeNativeSimulator(eventType) {
                return function (domComponentOrNode, nativeEventData) {
                    var fakeNativeEvent = new Event(eventType);
                    _assign(fakeNativeEvent, nativeEventData);
                    if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
                        ReactTestUtils.simulateNativeEventOnDOMComponent(eventType, domComponentOrNode, fakeNativeEvent);
                    } else if (domComponentOrNode.tagName) {
                        ReactTestUtils.simulateNativeEventOnNode(eventType, domComponentOrNode, fakeNativeEvent);
                    }
                };
            }
            Object.keys(topLevelTypes).forEach(function (eventType) {
                var convenienceName = eventType.indexOf('top') === 0 ? eventType.charAt(3).toLowerCase() + eventType.substr(4) : eventType;
                ReactTestUtils.SimulateNative[convenienceName] = makeNativeSimulator(eventType);
            });
            var ReactTestUtils$2 = Object.freeze({ default: ReactTestUtils });
            var ReactTestUtils$3 = ReactTestUtils$2 && ReactTestUtils || ReactTestUtils$2;
            var testUtils = ReactTestUtils$3['default'] ? ReactTestUtils$3['default'] : ReactTestUtils$3;
            module.exports = testUtils;
        }());
    }
});
/*react-dom@16.2.0#test-utils*/
define('react-dom@16.2.0#test-utils', [
    'require',
    'exports',
    'module',
    './cjs/react-dom-test-utils.production.min.js',
    './cjs/react-dom-test-utils.development.js'
], function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV === 'production') {
        module.exports = require('./cjs/react-dom-test-utils.production.min.js');
    } else {
        module.exports = require('./cjs/react-dom-test-utils.development.js');
    }
});
/*react-view-model@1.0.0-pre.9#observer*/
define('react-view-model@1.0.0-pre.9#observer', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-observation-recorder',
    'can-observation/recorder-dependency-helpers',
    'can-observation',
    'can-queues'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    var ObservationRecorder = require('can-observation-recorder');
    var recorderHelpers = require('can-observation/recorder-dependency-helpers');
    var Observation = require('can-observation');
    var queues = require('can-queues');
    var ORDER = undefined;
    function Observer(onUpdate) {
        this.newDependencies = ObservationRecorder.makeDependenciesRecorder();
        this.oldDependencies = null;
        this.onUpdate = onUpdate;
        var self = this;
        this.onDependencyChange = function (newVal, oldVal) {
            self.dependencyChange(this, newVal, oldVal);
        };
    }
    var weLeftSomethingOnTheStack = false;
    Observer.prototype.startRecording = function () {
        if (weLeftSomethingOnTheStack) {
            var deps = ObservationRecorder.stop();
            if (!deps.reactViewModel) {
                throw new Error('One of these things is not like the others');
            }
        }
        this.oldDependencies = this.newDependencies;
        this.nextDependencies = ObservationRecorder.start();
        this.nextDependencies.reactViewModel = true;
        weLeftSomethingOnTheStack = true;
        if (this.order !== undefined) {
            ORDER = this.order;
        } else {
            if (ORDER !== undefined) {
                this.order = ++ORDER;
            } else {
                this.order = ORDER = 0;
            }
        }
    };
    Observer.prototype.stopRecording = function () {
        if (weLeftSomethingOnTheStack) {
            var deps = ObservationRecorder.stop();
            weLeftSomethingOnTheStack = false;
            if (!deps.reactViewModel) {
                throw new Error('One of these things is not like the others');
            }
        }
        this.newDependencies = this.nextDependencies;
        recorderHelpers.updateObservations(this);
    };
    Observer.prototype.dependencyChange = function () {
        queues.deriveQueue.enqueue(this.onUpdate, this, [], { priority: this.order });
    };
    Observer.prototype.teardown = function () {
        queues.deriveQueue.dequeue(this.onUpdate);
    };
    Observer.prototype.ignore = function (fn) {
        Observation.ignore(fn)();
    };
    module.exports = Observer;
});
/*react-view-model@1.0.0-pre.9#helpers/make-enumerable*/
define('react-view-model@1.0.0-pre.9#helpers/make-enumerable', [
    'require',
    'exports',
    'module',
    'can-util/js/each/each'
], function (require, exports, module) {
    var each = require('can-util/js/each/each');
    module.exports = function makeEnumerable(Type, recursive) {
        if (isEnumerable(Type)) {
            return;
        }
        if (recursive === undefined) {
            recursive = true;
        }
        var setup = Type.prototype.setup;
        Type.prototype.setup = function () {
            if (this._define) {
                var map = this;
                each(this._define.definitions, function (value, prop) {
                    var descriptor = Object.getOwnPropertyDescriptor(map.constructor.prototype, prop);
                    descriptor.enumerable = true;
                    Object.defineProperty(map, prop, descriptor);
                    if (recursive && value.Type) {
                        makeEnumerable(value.Type, recursive);
                    }
                });
                each(this._define.methods, function (method, prop) {
                    if (prop === 'constructor') {
                        return;
                    }
                    var descriptor = Object.getOwnPropertyDescriptor(map.constructor.prototype, prop);
                    descriptor.enumerable = true;
                    Object.defineProperty(map, prop, descriptor);
                });
            }
            return setup.apply(this, arguments);
        };
        Object.defineProperty(Type, '__isEnumerable', {
            enumerable: false,
            value: true
        });
    };
    function isEnumerable(Type) {
        return !!Type.__isEnumerable;
    }
    module.exports.isEnumerable = isEnumerable;
});
/*react-view-model@1.0.0-pre.9#helpers/autobind-methods*/
define('react-view-model@1.0.0-pre.9#helpers/autobind-methods', [
    'require',
    'exports',
    'module',
    'can-util/js/each/each',
    'can-define/map/map'
], function (require, exports, module) {
    var each = require('can-util/js/each/each');
    var DefineMap = require('can-define/map/map');
    var METHODS_TO_AUTOBIND_KEY = '_methodsToAutobind-react-view-models';
    module.exports = function autobindMethods(ViewModel) {
        if (ViewModel[METHODS_TO_AUTOBIND_KEY]) {
            return;
        }
        var setup = ViewModel.prototype.setup;
        var methods = getMethods(ViewModel.prototype, {});
        Object.defineProperty(ViewModel, METHODS_TO_AUTOBIND_KEY, {
            enumerable: false,
            value: methods
        });
        ViewModel.prototype.setup = function setUpWithAutobind() {
            for (var key in methods) {
                this[key] = methods[key].bind(this);
            }
            return setup.apply(this, arguments);
        };
    };
    function getMethods(proto, methods) {
        if (proto && proto !== Object.prototype && proto !== DefineMap.prototype) {
            each(proto._define.methods, function (property, key) {
                if (!(key in methods) && key !== 'constructor') {
                    methods[key] = property;
                }
            });
            return getMethods(Object.getPrototypeOf(proto), methods);
        }
        return methods;
    }
});
/*react-view-model@1.0.0-pre.9#component*/
define('react-view-model@1.0.0-pre.9#component', [
    'require',
    'exports',
    'module',
    'react',
    'can-reflect',
    'can-define/map/map',
    'can-util/js/assign/assign',
    './observer',
    './helpers/make-enumerable',
    './helpers/autobind-methods',
    'can-util/js/dev/dev',
    'can-namespace'
], function (require, exports, module) {
    var React = require('react');
    var canReflect = require('can-reflect');
    var DefineMap = require('can-define/map/map');
    var assign = require('can-util/js/assign/assign');
    var Observer = require('./observer');
    var makeEnumerable = require('./helpers/make-enumerable');
    var autobindMethods = require('./helpers/autobind-methods');
    var dev = require('can-util/js/dev/dev');
    var namespace = require('can-namespace');
    if (React) {
        var Component = function Component() {
            React.Component.call(this);
            if (this.constructor.ViewModel) {
                autobindMethods(this.constructor.ViewModel, true);
                makeEnumerable(this.constructor.ViewModel, true);
            }
            var observer = function () {
                if (typeof this._shouldComponentUpdate !== 'function' || this._shouldComponentUpdate()) {
                    this.forceUpdate();
                }
            }.bind(this);
            this._observer = new Observer(observer);
            if (typeof this.shouldComponentUpdate === 'function') {
                this._shouldComponentUpdate = this.shouldComponentUpdate;
            }
            this.shouldComponentUpdate = function () {
                return false;
            };
        };
        Component.prototype = Object.create(React.Component.prototype);
        Component.prototype.constructor = Component;
        assign(Component.prototype, {
            constructor: Component,
            componentWillReceiveProps: function (nextProps) {
                var props = {};
                for (var key in nextProps) {
                    if (!(key in this.props) || nextProps[key] !== this.props[key]) {
                        props[key] = nextProps[key];
                    }
                }
                this._observer.ignore(function () {
                    this.viewModel.assign(props);
                }.bind(this));
            },
            componentWillMount: function () {
                var ViewModel = this.constructor.ViewModel || DefineMap;
                this.viewModel = new ViewModel(this.props);
                this._observer.startRecording();
            },
            componentDidMount: function () {
                this._observer.stopRecording();
            },
            componentWillUpdate: function () {
                this._observer.startRecording();
            },
            componentDidUpdate: function () {
                this._observer.stopRecording();
            },
            componentWillUnmount: function () {
                this._observer.teardown();
                this.viewModel = null;
            }
        });
        module.exports = namespace.ReactViewModelComponent = Component;
    } else {
        module.exports = namespace.ReactViewModelComponent = function Component() {
            throw new Error('You must provide React before can.all.js');
        };
    }
});
/*react-view-model@1.0.0-pre.9#helpers/observable-promise*/
define('react-view-model@1.0.0-pre.9#helpers/observable-promise', [
    'exports',
    'can-define/map/map',
    'can-stache-key'
], function (exports, _map, _canStacheKey) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var _map2 = _interopRequireDefault(_map);
    var _canStacheKey2 = _interopRequireDefault(_canStacheKey);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _map2.default.extend('ObservablePromise', {
        init: function init(promise) {
            this.promise = promise;
        },
        promise: 'any',
        isPending: {
            get: function get() {
                return _canStacheKey2.default.read(this, _canStacheKey2.default.reads('promise.isPending')).value;
            }
        },
        isResolved: {
            get: function get() {
                return _canStacheKey2.default.read(this, _canStacheKey2.default.reads('promise.isResolved')).value;
            }
        },
        isRejected: {
            get: function get() {
                return _canStacheKey2.default.read(this, _canStacheKey2.default.reads('promise.isRejected')).value;
            }
        },
        reason: {
            get: function get() {
                return _canStacheKey2.default.read(this, _canStacheKey2.default.reads('promise.reason')).value;
            }
        },
        value: {
            get: function get() {
                return _canStacheKey2.default.read(this, _canStacheKey2.default.reads('promise.value')).value;
            }
        }
    });
});
/*react-view-model@1.0.0-pre.9#react-view-model*/
define('react-view-model@1.0.0-pre.9#react-view-model', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign',
    './component',
    'can-namespace',
    './helpers/observable-promise',
    './helpers/autobind-methods',
    './helpers/make-enumerable'
], function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var Component = require('./component');
    var namespace = require('can-namespace');
    var ObservablePromise = require('./helpers/observable-promise');
    var autobindMethods = require('./helpers/autobind-methods');
    var makeEnumerable = require('./helpers/make-enumerable');
    module.exports = namespace.reactViewModel = function reactViewModel(displayName, ViewModel, render) {
        if (arguments.length === 1) {
            render = arguments[0];
            ViewModel = null;
            displayName = null;
        }
        if (arguments.length === 2) {
            render = arguments[1];
            if (typeof arguments[0] === 'string') {
                displayName = arguments[0];
                ViewModel = null;
            } else {
                ViewModel = arguments[0];
                displayName = null;
            }
        }
        if (!displayName) {
            displayName = (render.displayName || render.name || 'ReactVMComponent') + 'Wrapper';
        }
        function App() {
            Component.call(this);
        }
        App.ViewModel = ViewModel;
        App.displayName = displayName;
        App.prototype = Object.create(Component.prototype);
        assign(App.prototype, {
            constructor: App,
            render: function () {
                return render(this.viewModel);
            }
        });
        try {
            Object.defineProperty(App, 'name', {
                writable: false,
                enumerable: false,
                configurable: true,
                value: displayName
            });
        } catch (e) {
        }
        return App;
    };
    module.exports.Component = Component;
    module.exports.ObservablePromise = ObservablePromise;
    module.exports.autobindMethods = autobindMethods;
    module.exports.makeEnumerable = makeEnumerable;
});
/*react-view-model@1.0.0-pre.9#test/utils*/
define('react-view-model@1.0.0-pre.9#test/utils', ['exports'], function (exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function getTextFromElement(node) {
        var txt = '';
        node = node.firstChild;
        while (node) {
            if (node.nodeType === 3) {
                txt += node.nodeValue;
            } else {
                txt += getTextFromElement(node);
            }
            node = node.nextSibling;
        }
        return txt;
    }
    var supportsFunctionName = function () {
        function foo() {
        }
        return foo.name === 'foo';
    }();
    exports.getTextFromElement = getTextFromElement;
    exports.supportsFunctionName = supportsFunctionName;
});
/*prop-types@15.6.0#factoryWithTypeCheckers*/
define('prop-types@15.6.0#factoryWithTypeCheckers', [
    'require',
    'exports',
    'module',
    'fbjs/lib/emptyFunction',
    'fbjs/lib/invariant',
    'fbjs/lib/warning',
    'object-assign',
    './lib/ReactPropTypesSecret',
    './checkPropTypes'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var emptyFunction = require('fbjs/lib/emptyFunction');
        var invariant = require('fbjs/lib/invariant');
        var warning = require('fbjs/lib/warning');
        var assign = require('object-assign');
        var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
        var checkPropTypes = require('./checkPropTypes');
        module.exports = function (isValidElement, throwOnDirectAccess) {
            var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
            var FAUX_ITERATOR_SYMBOL = '@@iterator';
            function getIteratorFn(maybeIterable) {
                var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
                if (typeof iteratorFn === 'function') {
                    return iteratorFn;
                }
            }
            var ANONYMOUS = '<<anonymous>>';
            var ReactPropTypes = {
                array: createPrimitiveTypeChecker('array'),
                bool: createPrimitiveTypeChecker('boolean'),
                func: createPrimitiveTypeChecker('function'),
                number: createPrimitiveTypeChecker('number'),
                object: createPrimitiveTypeChecker('object'),
                string: createPrimitiveTypeChecker('string'),
                symbol: createPrimitiveTypeChecker('symbol'),
                any: createAnyTypeChecker(),
                arrayOf: createArrayOfTypeChecker,
                element: createElementTypeChecker(),
                instanceOf: createInstanceTypeChecker,
                node: createNodeChecker(),
                objectOf: createObjectOfTypeChecker,
                oneOf: createEnumTypeChecker,
                oneOfType: createUnionTypeChecker,
                shape: createShapeTypeChecker,
                exact: createStrictShapeTypeChecker
            };
            function is(x, y) {
                if (x === y) {
                    return x !== 0 || 1 / x === 1 / y;
                } else {
                    return x !== x && y !== y;
                }
            }
            function PropTypeError(message) {
                this.message = message;
                this.stack = '';
            }
            PropTypeError.prototype = Error.prototype;
            function createChainableTypeChecker(validate) {
                if (process.env.NODE_ENV !== 'production') {
                    var manualPropTypeCallCache = {};
                    var manualPropTypeWarningCount = 0;
                }
                function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
                    componentName = componentName || ANONYMOUS;
                    propFullName = propFullName || propName;
                    if (secret !== ReactPropTypesSecret) {
                        if (throwOnDirectAccess) {
                            invariant(false, 'Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
                        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
                            var cacheKey = componentName + ':' + propName;
                            if (!manualPropTypeCallCache[cacheKey] && manualPropTypeWarningCount < 3) {
                                warning(false, 'You are manually calling a React.PropTypes validation ' + 'function for the `%s` prop on `%s`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.', propFullName, componentName);
                                manualPropTypeCallCache[cacheKey] = true;
                                manualPropTypeWarningCount++;
                            }
                        }
                    }
                    if (props[propName] == null) {
                        if (isRequired) {
                            if (props[propName] === null) {
                                return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
                            }
                            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
                        }
                        return null;
                    } else {
                        return validate(props, propName, componentName, location, propFullName);
                    }
                }
                var chainedCheckType = checkType.bind(null, false);
                chainedCheckType.isRequired = checkType.bind(null, true);
                return chainedCheckType;
            }
            function createPrimitiveTypeChecker(expectedType) {
                function validate(props, propName, componentName, location, propFullName, secret) {
                    var propValue = props[propName];
                    var propType = getPropType(propValue);
                    if (propType !== expectedType) {
                        var preciseType = getPreciseType(propValue);
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createAnyTypeChecker() {
                return createChainableTypeChecker(emptyFunction.thatReturnsNull);
            }
            function createArrayOfTypeChecker(typeChecker) {
                function validate(props, propName, componentName, location, propFullName) {
                    if (typeof typeChecker !== 'function') {
                        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
                    }
                    var propValue = props[propName];
                    if (!Array.isArray(propValue)) {
                        var propType = getPropType(propValue);
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
                    }
                    for (var i = 0; i < propValue.length; i++) {
                        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
                        if (error instanceof Error) {
                            return error;
                        }
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createElementTypeChecker() {
                function validate(props, propName, componentName, location, propFullName) {
                    var propValue = props[propName];
                    if (!isValidElement(propValue)) {
                        var propType = getPropType(propValue);
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createInstanceTypeChecker(expectedClass) {
                function validate(props, propName, componentName, location, propFullName) {
                    if (!(props[propName] instanceof expectedClass)) {
                        var expectedClassName = expectedClass.name || ANONYMOUS;
                        var actualClassName = getClassName(props[propName]);
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createEnumTypeChecker(expectedValues) {
                if (!Array.isArray(expectedValues)) {
                    process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
                    return emptyFunction.thatReturnsNull;
                }
                function validate(props, propName, componentName, location, propFullName) {
                    var propValue = props[propName];
                    for (var i = 0; i < expectedValues.length; i++) {
                        if (is(propValue, expectedValues[i])) {
                            return null;
                        }
                    }
                    var valuesString = JSON.stringify(expectedValues);
                    return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
                }
                return createChainableTypeChecker(validate);
            }
            function createObjectOfTypeChecker(typeChecker) {
                function validate(props, propName, componentName, location, propFullName) {
                    if (typeof typeChecker !== 'function') {
                        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
                    }
                    var propValue = props[propName];
                    var propType = getPropType(propValue);
                    if (propType !== 'object') {
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
                    }
                    for (var key in propValue) {
                        if (propValue.hasOwnProperty(key)) {
                            var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                            if (error instanceof Error) {
                                return error;
                            }
                        }
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createUnionTypeChecker(arrayOfTypeCheckers) {
                if (!Array.isArray(arrayOfTypeCheckers)) {
                    process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
                    return emptyFunction.thatReturnsNull;
                }
                for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
                    var checker = arrayOfTypeCheckers[i];
                    if (typeof checker !== 'function') {
                        warning(false, 'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received %s at index %s.', getPostfixForTypeWarning(checker), i);
                        return emptyFunction.thatReturnsNull;
                    }
                }
                function validate(props, propName, componentName, location, propFullName) {
                    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
                        var checker = arrayOfTypeCheckers[i];
                        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
                            return null;
                        }
                    }
                    return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
                }
                return createChainableTypeChecker(validate);
            }
            function createNodeChecker() {
                function validate(props, propName, componentName, location, propFullName) {
                    if (!isNode(props[propName])) {
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createShapeTypeChecker(shapeTypes) {
                function validate(props, propName, componentName, location, propFullName) {
                    var propValue = props[propName];
                    var propType = getPropType(propValue);
                    if (propType !== 'object') {
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
                    }
                    for (var key in shapeTypes) {
                        var checker = shapeTypes[key];
                        if (!checker) {
                            continue;
                        }
                        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                        if (error) {
                            return error;
                        }
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function createStrictShapeTypeChecker(shapeTypes) {
                function validate(props, propName, componentName, location, propFullName) {
                    var propValue = props[propName];
                    var propType = getPropType(propValue);
                    if (propType !== 'object') {
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
                    }
                    var allKeys = assign({}, props[propName], shapeTypes);
                    for (var key in allKeys) {
                        var checker = shapeTypes[key];
                        if (!checker) {
                            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
                        }
                        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
                        if (error) {
                            return error;
                        }
                    }
                    return null;
                }
                return createChainableTypeChecker(validate);
            }
            function isNode(propValue) {
                switch (typeof propValue) {
                case 'number':
                case 'string':
                case 'undefined':
                    return true;
                case 'boolean':
                    return !propValue;
                case 'object':
                    if (Array.isArray(propValue)) {
                        return propValue.every(isNode);
                    }
                    if (propValue === null || isValidElement(propValue)) {
                        return true;
                    }
                    var iteratorFn = getIteratorFn(propValue);
                    if (iteratorFn) {
                        var iterator = iteratorFn.call(propValue);
                        var step;
                        if (iteratorFn !== propValue.entries) {
                            while (!(step = iterator.next()).done) {
                                if (!isNode(step.value)) {
                                    return false;
                                }
                            }
                        } else {
                            while (!(step = iterator.next()).done) {
                                var entry = step.value;
                                if (entry) {
                                    if (!isNode(entry[1])) {
                                        return false;
                                    }
                                }
                            }
                        }
                    } else {
                        return false;
                    }
                    return true;
                default:
                    return false;
                }
            }
            function isSymbol(propType, propValue) {
                if (propType === 'symbol') {
                    return true;
                }
                if (propValue['@@toStringTag'] === 'Symbol') {
                    return true;
                }
                if (typeof Symbol === 'function' && propValue instanceof Symbol) {
                    return true;
                }
                return false;
            }
            function getPropType(propValue) {
                var propType = typeof propValue;
                if (Array.isArray(propValue)) {
                    return 'array';
                }
                if (propValue instanceof RegExp) {
                    return 'object';
                }
                if (isSymbol(propType, propValue)) {
                    return 'symbol';
                }
                return propType;
            }
            function getPreciseType(propValue) {
                if (typeof propValue === 'undefined' || propValue === null) {
                    return '' + propValue;
                }
                var propType = getPropType(propValue);
                if (propType === 'object') {
                    if (propValue instanceof Date) {
                        return 'date';
                    } else if (propValue instanceof RegExp) {
                        return 'regexp';
                    }
                }
                return propType;
            }
            function getPostfixForTypeWarning(value) {
                var type = getPreciseType(value);
                switch (type) {
                case 'array':
                case 'object':
                    return 'an ' + type;
                case 'boolean':
                case 'date':
                case 'regexp':
                    return 'a ' + type;
                default:
                    return type;
                }
            }
            function getClassName(propValue) {
                if (!propValue.constructor || !propValue.constructor.name) {
                    return ANONYMOUS;
                }
                return propValue.constructor.name;
            }
            ReactPropTypes.checkPropTypes = checkPropTypes;
            ReactPropTypes.PropTypes = ReactPropTypes;
            return ReactPropTypes;
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*prop-types@15.6.0#factoryWithThrowingShims*/
define('prop-types@15.6.0#factoryWithThrowingShims', [
    'require',
    'exports',
    'module',
    'fbjs/lib/emptyFunction',
    'fbjs/lib/invariant',
    './lib/ReactPropTypesSecret'
], function (require, exports, module) {
    'use strict';
    var emptyFunction = require('fbjs/lib/emptyFunction');
    var invariant = require('fbjs/lib/invariant');
    var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
    module.exports = function () {
        function shim(props, propName, componentName, location, propFullName, secret) {
            if (secret === ReactPropTypesSecret) {
                return;
            }
            invariant(false, 'Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
        }
        ;
        shim.isRequired = shim;
        function getShim() {
            return shim;
        }
        ;
        var ReactPropTypes = {
            array: shim,
            bool: shim,
            func: shim,
            number: shim,
            object: shim,
            string: shim,
            symbol: shim,
            any: shim,
            arrayOf: getShim,
            element: shim,
            instanceOf: getShim,
            node: shim,
            objectOf: getShim,
            oneOf: getShim,
            oneOfType: getShim,
            shape: getShim,
            exact: getShim
        };
        ReactPropTypes.checkPropTypes = emptyFunction;
        ReactPropTypes.PropTypes = ReactPropTypes;
        return ReactPropTypes;
    };
});
/*prop-types@15.6.0#index*/
define('prop-types@15.6.0#index', [
    'require',
    'exports',
    'module',
    './factoryWithTypeCheckers',
    './factoryWithThrowingShims'
], function (require, exports, module) {
    if (process.env.NODE_ENV !== 'production') {
        var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 60103;
        var isValidElement = function (object) {
            return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        };
        var throwOnDirectAccess = true;
        module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
    } else {
        module.exports = require('./factoryWithThrowingShims')();
    }
});
/*react-view-model@1.0.0-pre.9#test/defined-view-model*/
define('react-view-model@1.0.0-pre.9#test/defined-view-model', [
    'exports',
    'can-define/map/map',
    'can-define/list/list'
], function (exports, _map, _list) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var _map2 = _interopRequireDefault(_map);
    var _list2 = _interopRequireDefault(_list);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _map2.default.extend('DefinedViewModel', {
        childMap1: { Type: _map2.default.extend('ChildMap', {}) },
        childList1: { Type: _list2.default.extend('ChildList', {}) },
        childMap2: { Type: _map2.default },
        childList2: { Type: _list2.default },
        foo: {
            type: 'string',
            value: 'foo'
        },
        bar: 'string',
        foobar: {
            get: function get() {
                return this.foo + this.bar;
            }
        },
        zzz: {
            set: function set(newVal) {
                return newVal.toUpperCase();
            }
        },
        interceptedCallbackCalled: 'boolean',
        interceptedCallback: {
            type: 'function',
            get: function get(lastSetValue) {
                var _this = this;
                return function () {
                    _this.interceptedCallbackCalled = true;
                    if (lastSetValue) {
                        return lastSetValue.apply(undefined, arguments);
                    }
                };
            }
        }
    });
});
/*react-view-model@1.0.0-pre.9#test/test-define*/
define('react-view-model@1.0.0-pre.9#test/test-define', [
    'steal-qunit',
    'react',
    'prop-types',
    'react-dom/test-utils',
    'can-define/map/map',
    'can-define/list/list',
    'react-view-model',
    'react-view-model/component',
    './defined-view-model',
    './utils'
], function (_stealQunit, _react, _propTypes, _testUtils, _map, _list, _reactViewModel, _component, _definedViewModel, _utils) {
    'use strict';
    var _stealQunit2 = _interopRequireDefault(_stealQunit);
    var _react2 = _interopRequireDefault(_react);
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _testUtils2 = _interopRequireDefault(_testUtils);
    var _map2 = _interopRequireDefault(_map);
    var _list2 = _interopRequireDefault(_list);
    var _reactViewModel2 = _interopRequireDefault(_reactViewModel);
    var _component2 = _interopRequireDefault(_component);
    var _definedViewModel2 = _interopRequireDefault(_definedViewModel);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ('value' in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function (Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
        }
        return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
    }
    function _inherits(subClass, superClass) {
        if (typeof superClass !== 'function' && superClass !== null) {
            throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass)
            Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var ReactComponent = _react2.default.Component;
    _stealQunit2.default.module('react-view-model with DefineMap', function () {
        _stealQunit2.default.module('when extending Component', function () {
            _stealQunit2.default.test('should set viewModel to be instance of ViewModel', function (assert) {
                var TestComponent = function (_Component) {
                    _inherits(TestComponent, _Component);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.foobar);
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = _definedViewModel2.default;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, null));
                assert.ok(testInstance.viewModel instanceof _definedViewModel2.default);
            });
            _stealQunit2.default.test('should update whenever any observable property on the viewModel instance changes', function (assert) {
                var TestComponent = function (_Component2) {
                    _inherits(TestComponent, _Component2);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.foobar);
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = _definedViewModel2.default;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, {
                    bar: 'bar',
                    baz: 'bam'
                }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(divComponent.innerText, 'foobar');
                testInstance.viewModel.foo = 'MMM';
                assert.equal(divComponent.innerText, 'MMMbar');
            });
            _stealQunit2.default.test('should update whenever any observable property on the viewModel instance changes (nested)', function (assert) {
                var InnerComponent = function (_ReactComponent) {
                    _inherits(InnerComponent, _ReactComponent);
                    function InnerComponent() {
                        _classCallCheck(this, InnerComponent);
                        return _possibleConstructorReturn(this, (InnerComponent.__proto__ || Object.getPrototypeOf(InnerComponent)).apply(this, arguments));
                    }
                    _createClass(InnerComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.props.bar.bam.quux);
                            }
                        }]);
                    return InnerComponent;
                }(ReactComponent);
                InnerComponent.propTypes = { bar: _propTypes2.default.shape({ bam: _propTypes2.default.shape({ quux: _propTypes2.default.string.isRequired }).isRequired }).isRequired };
                var OutterComponent = function (_Component3) {
                    _inherits(OutterComponent, _Component3);
                    function OutterComponent() {
                        _classCallCheck(this, OutterComponent);
                        return _possibleConstructorReturn(this, (OutterComponent.__proto__ || Object.getPrototypeOf(OutterComponent)).apply(this, arguments));
                    }
                    _createClass(OutterComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement(InnerComponent, { bar: this.viewModel.foo.bar });
                            }
                        }]);
                    return OutterComponent;
                }(_component2.default);
                OutterComponent.ViewModel = _map2.default.extend('OutterComponentViewModel', { foo: _map2.default.extend('Foo', { bar: _map2.default.extend('Bar', { bam: _map2.default.extend('Bam', { quux: 'string' }) }) }) });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(OutterComponent, { foo: { bar: { bam: { quux: 'hello' } } } }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(divComponent.innerText, 'hello');
                testInstance.viewModel.foo.bar.bam.quux = 'world';
                assert.equal(divComponent.innerText, 'world');
            });
            _stealQunit2.default.test('should update the viewModel when new props are received', function (assert) {
                var TestComponent = function (_Component4) {
                    _inherits(TestComponent, _Component4);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.foo);
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = _definedViewModel2.default;
                var WrappingComponent = function (_ReactComponent2) {
                    _inherits(WrappingComponent, _ReactComponent2);
                    function WrappingComponent() {
                        _classCallCheck(this, WrappingComponent);
                        var _this6 = _possibleConstructorReturn(this, (WrappingComponent.__proto__ || Object.getPrototypeOf(WrappingComponent)).call(this));
                        _this6.state = { foo: 'Initial Prop Value' };
                        return _this6;
                    }
                    _createClass(WrappingComponent, [
                        {
                            key: 'changeState',
                            value: function changeState() {
                                this.setState({ foo: 'New Prop Value' });
                            }
                        },
                        {
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement(TestComponent, { foo: this.state.foo });
                            }
                        }
                    ]);
                    return WrappingComponent;
                }(ReactComponent);
                var wrappingInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(WrappingComponent, null));
                var testInstance = _testUtils2.default.scryRenderedComponentsWithType(wrappingInstance, TestComponent)[0];
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(testInstance.props.foo, 'Initial Prop Value');
                assert.equal(divComponent.innerText, 'Initial Prop Value');
                wrappingInstance.changeState();
                assert.equal(testInstance.props.foo, 'New Prop Value');
                assert.equal(divComponent.innerText, 'New Prop Value');
            });
            _stealQunit2.default.test('should not overwrite the viewModel with unchanged values when new props are received', function (assert) {
                var TestComponent = function (_Component5) {
                    _inherits(TestComponent, _Component5);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [
                        {
                            key: 'changeState',
                            value: function changeState() {
                                this.viewModel.bar = 'bar1';
                            }
                        },
                        {
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.foobar);
                            }
                        }
                    ]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = _definedViewModel2.default;
                var WrappingComponent = function (_ReactComponent3) {
                    _inherits(WrappingComponent, _ReactComponent3);
                    function WrappingComponent() {
                        _classCallCheck(this, WrappingComponent);
                        var _this8 = _possibleConstructorReturn(this, (WrappingComponent.__proto__ || Object.getPrototypeOf(WrappingComponent)).call(this));
                        _this8.state = { foo: 'foo' };
                        return _this8;
                    }
                    _createClass(WrappingComponent, [
                        {
                            key: 'changeState',
                            value: function changeState() {
                                this.setState({ foo: 'foo1' });
                            }
                        },
                        {
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement(TestComponent, {
                                    foo: this.state.foo,
                                    bar: 'bar'
                                });
                            }
                        }
                    ]);
                    return WrappingComponent;
                }(ReactComponent);
                var wrappingInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(WrappingComponent, null));
                var testInstance = _testUtils2.default.scryRenderedComponentsWithType(wrappingInstance, TestComponent)[0];
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(divComponent.innerText, 'foobar');
                testInstance.changeState();
                assert.equal(divComponent.innerText, 'foobar1');
                wrappingInstance.changeState();
                assert.equal(divComponent.innerText, 'foo1bar1');
            });
            _stealQunit2.default.test('should be able to have the viewModel transform props before passing to child component', function (assert) {
                var TestComponent = function (_Component6) {
                    _inherits(TestComponent, _Component6);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.zzz);
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = _definedViewModel2.default;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, { zzz: 'zzz' }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(testInstance.viewModel.zzz, 'ZZZ');
                assert.equal(divComponent.innerText, 'ZZZ');
            });
            _stealQunit2.default.test('should be able to call the viewModel.interceptedCallback function received from parent component', function (assert) {
                var TestComponent = function (_Component7) {
                    _inherits(TestComponent, _Component7);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.foobar);
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = _definedViewModel2.default;
                var expectedValue = [];
                var WrappingComponent = function (_ReactComponent4) {
                    _inherits(WrappingComponent, _ReactComponent4);
                    function WrappingComponent() {
                        _classCallCheck(this, WrappingComponent);
                        return _possibleConstructorReturn(this, (WrappingComponent.__proto__ || Object.getPrototypeOf(WrappingComponent)).apply(this, arguments));
                    }
                    _createClass(WrappingComponent, [
                        {
                            key: 'parentCallBack',
                            value: function parentCallBack() {
                                return expectedValue;
                            }
                        },
                        {
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement(TestComponent, { interceptedCallback: this.parentCallBack });
                            }
                        }
                    ]);
                    return WrappingComponent;
                }(ReactComponent);
                var wrappingInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(WrappingComponent, null));
                var testInstance = _testUtils2.default.scryRenderedComponentsWithType(wrappingInstance, TestComponent)[0];
                var actual = testInstance.viewModel.interceptedCallback();
                assert.equal(actual, expectedValue, 'Value returned from wrapping components callback successfully');
                assert.equal(testInstance.viewModel.interceptedCallbackCalled, true, 'ViewModels interceptedCallback was called');
                testInstance.viewModel.interceptedCallbackCalled = undefined;
            });
            _stealQunit2.default.test('should update parent before child', function (assert) {
                var expected = [
                    'parent',
                    'child1',
                    'child2',
                    'parent',
                    'child1',
                    'child2'
                ];
                var ChildComponent1 = function (_Component8) {
                    _inherits(ChildComponent1, _Component8);
                    function ChildComponent1() {
                        _classCallCheck(this, ChildComponent1);
                        return _possibleConstructorReturn(this, (ChildComponent1.__proto__ || Object.getPrototypeOf(ChildComponent1)).apply(this, arguments));
                    }
                    _createClass(ChildComponent1, [{
                            key: 'render',
                            value: function render() {
                                assert.equal('child1', expected.shift(), 'child1 renderer called in the right order');
                                return _react2.default.createElement('div', null, this.viewModel.value);
                            }
                        }]);
                    return ChildComponent1;
                }(_component2.default);
                ChildComponent1.ViewModel = _map2.default.extend('ChildVM', {
                    value: {
                        type: 'string',
                        value: 'foo'
                    }
                });
                var ChildComponent2 = function (_Component9) {
                    _inherits(ChildComponent2, _Component9);
                    function ChildComponent2() {
                        _classCallCheck(this, ChildComponent2);
                        return _possibleConstructorReturn(this, (ChildComponent2.__proto__ || Object.getPrototypeOf(ChildComponent2)).apply(this, arguments));
                    }
                    _createClass(ChildComponent2, [{
                            key: 'render',
                            value: function render() {
                                assert.equal('child2', expected.shift(), 'child2 renderer called in the right order');
                                return _react2.default.createElement('div', null, this.viewModel.value);
                            }
                        }]);
                    return ChildComponent2;
                }(_component2.default);
                ChildComponent2.ViewModel = _map2.default.extend('ChildVM', {
                    value: {
                        type: 'string',
                        value: 'foo'
                    }
                });
                var ParentComponent = function (_Component10) {
                    _inherits(ParentComponent, _Component10);
                    function ParentComponent() {
                        _classCallCheck(this, ParentComponent);
                        return _possibleConstructorReturn(this, (ParentComponent.__proto__ || Object.getPrototypeOf(ParentComponent)).apply(this, arguments));
                    }
                    _createClass(ParentComponent, [{
                            key: 'render',
                            value: function render() {
                                assert.equal('parent', expected.shift(), 'parent renderer called in the right order');
                                return _react2.default.createElement('div', null, _react2.default.createElement(ChildComponent1, { value: this.viewModel.value }), _react2.default.createElement(ChildComponent2, { value: this.viewModel.value }));
                            }
                        }]);
                    return ParentComponent;
                }(_component2.default);
                ParentComponent.ViewModel = _map2.default.extend('ParentVM', {
                    value: {
                        type: 'string',
                        value: 'bar'
                    }
                });
                var viewModel = _testUtils2.default.renderIntoDocument(_react2.default.createElement(ParentComponent, { value: 'foobar' })).viewModel;
                viewModel.value = 'change';
            });
        });
        _stealQunit2.default.module('when using reactViewModel with DefineMap', function () {
            _stealQunit2.default.test('should work with displayName, ViewModel, and render function', function (assert) {
                var ViewModel = _map2.default.extend('RenderableViewModel1', {
                    first: {
                        type: 'string',
                        value: 'Christopher'
                    },
                    last: 'string',
                    name: {
                        get: function get() {
                            return this.first + ' ' + this.last;
                        }
                    }
                });
                var Person = (0, _reactViewModel2.default)('Person', ViewModel, function (props) {
                    return _react2.default.createElement('div', null, props.name);
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, { last: 'Baker' }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.ok(Person.prototype instanceof _component2.default, 'returned component is an instance of Component');
                _utils.supportsFunctionName && assert.equal(Person.name, 'Person', 'returned component is properly named');
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Yetti Baker');
            });
            _stealQunit2.default.test('should work with ViewModel and render function', function (assert) {
                var ViewModel = _map2.default.extend('RenderableViewModel2', {
                    first: {
                        type: 'string',
                        value: 'Christopher'
                    },
                    last: 'string',
                    name: {
                        get: function get() {
                            return this.first + ' ' + this.last;
                        }
                    }
                });
                var Person = (0, _reactViewModel2.default)(ViewModel, function Person(props) {
                    return _react2.default.createElement('div', null, props.name);
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, { last: 'Baker' }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.ok(Person.prototype instanceof _component2.default, 'returned component is an instance of Component');
                _utils.supportsFunctionName && assert.equal(Person.name, 'PersonWrapper', 'returned component is properly named');
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Yetti Baker');
            });
            _stealQunit2.default.test('unmount works', function (assert) {
                var ParentVM = _map2.default.extend('ParentVM', {
                    showChild: {
                        type: 'boolean',
                        value: true
                    }
                });
                var ChildVM = _map2.default.extend('ChildVM', {});
                var ChildComponent = (0, _reactViewModel2.default)(ChildVM, function ChildComponent() {
                    return _react2.default.createElement('p', null, 'I AM CHILD');
                });
                var ParentComponent = (0, _reactViewModel2.default)(ParentVM, function ParentComponent(props) {
                    return _react2.default.createElement('div', null, props.showChild ? _react2.default.createElement(ChildComponent, null) : _react2.default.createElement('span', null));
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(ParentComponent, null));
                var pComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'p');
                testInstance.viewModel.showChild = false;
                try {
                    pComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'p');
                    assert.ok(!pComponent, 'there is no p anymore');
                } catch (e) {
                    assert.ok(true, 'was unable to find a `p` within DOM');
                }
                var spanComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'span');
                assert.ok(spanComponent, 'span inserted');
            });
        });
        _stealQunit2.default.module('when using reactViewModel with DefineList', function () {
            _stealQunit2.default.test('defineListInstance.map works', function (assert) {
                var ChildVM = _map2.default.extend('ChildVM', { title: { type: 'string' } });
                ChildVM.List = _list2.default.extend({ '#': ChildVM });
                var ParentVM = _map2.default.extend('ParentVM', {
                    children: {
                        Type: ChildVM.List,
                        value: [{ title: 'one' }]
                    }
                });
                var ParentComponent = (0, _reactViewModel2.default)(ParentVM, function ParentComponent(parentVm) {
                    return _react2.default.createElement('div', null, parentVm.children.map(function (item) {
                        return _react2.default.createElement('p', { key: item.title }, item.title);
                    }));
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(ParentComponent, null));
                var divElement = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.ok(divElement.getElementsByTagName.length, 'children inserted');
            });
        });
        _stealQunit2.default.module('when using React patterns', function () {
            _stealQunit2.default.test('should work with prop spread', function (assert) {
                var ViewModel = _map2.default.extend('ReactViewModel1', {
                    title: {
                        type: 'string',
                        value: 'Test Page'
                    },
                    href: {
                        get: function get() {
                            return '/' + this.title.toLowerCase().replace(/[^a-z]/g, '-').replace(/--+/g, '-');
                        }
                    }
                });
                var TestComponent = function (_Component11) {
                    _inherits(TestComponent, _Component11);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                var props = { target: '_blank' };
                                return _react2.default.createElement('a', _extends({}, this.viewModel, props));
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = ViewModel;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, null));
                var aComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'a');
                var props = {};
                for (var index = 0; index < aComponent.attributes.length; index++) {
                    var _aComponent$attribute = aComponent.attributes[index], name = _aComponent$attribute.name, value = _aComponent$attribute.value;
                    props[name] = value;
                }
                assert.equal(props.target, '_blank');
                assert.equal(props.title, 'Test Page');
                assert.equal(props.href, '/test-page');
            });
            _stealQunit2.default.test('should work with prop spread (nested)', function (assert) {
                var ViewModel = _map2.default.extend('ReactViewModel2', {
                    inner: _map2.default.extend('InnerReactViewModel2', {
                        title: {
                            type: 'string',
                            value: 'Test Page'
                        },
                        href: {
                            get: function get() {
                                return '/' + this.title.toLowerCase().replace(/[^a-z]/g, '-').replace(/--+/g, '-');
                            }
                        }
                    })
                });
                var TestComponent = function (_Component12) {
                    _inherits(TestComponent, _Component12);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                var props = { target: '_blank' };
                                return _react2.default.createElement('a', _extends({}, this.viewModel.inner, props));
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                TestComponent.ViewModel = ViewModel;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, { inner: {} }));
                var aComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'a');
                var props = {};
                for (var index = 0; index < aComponent.attributes.length; index++) {
                    var _aComponent$attribute2 = aComponent.attributes[index], name = _aComponent$attribute2.name, value = _aComponent$attribute2.value;
                    props[name] = value;
                }
                assert.equal(props.target, '_blank');
                assert.equal(props.title, 'Test Page');
                assert.equal(props.href, '/test-page');
            });
            _stealQunit2.default.test('should autobind viewModel methods to the viewModel (but not defined function values)', function (assert) {
                var vm = void 0;
                var BaseMap = _map2.default.extend('ReactViewModel3', {
                    unboundMethod: {
                        type: 'any',
                        value: function value() {
                            return function () {
                                assert.notEqual(this, vm, 'the context of defined functions are not bound');
                            };
                        }
                    },
                    method: function method() {
                        assert.equal(this, vm, 'the context of vm method calls are bound to the vm');
                    }
                });
                var ViewModel = BaseMap.extend('ReactViewModel4', {
                    someOtherMethod: function someOtherMethod() {
                        return this;
                    }
                });
                var Person = (0, _reactViewModel2.default)(ViewModel, function (vm) {
                    return _react2.default.createElement('div', {
                        onClick: vm.method,
                        onDoubleClick: vm.unboundMethod
                    }, 'Adam Barrett');
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, null));
                vm = testInstance.viewModel;
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                _testUtils2.default.Simulate.click(divComponent);
                _testUtils2.default.Simulate.doubleClick(divComponent);
            });
            _stealQunit2.default.test('the autobind methods feature should follow JS prototype rules, and bind only the lowest method in the proto chain', function (assert) {
                var BaseMap = _map2.default.extend('ReactViewModel5', {
                    method: function method() {
                        return 'NO BAD';
                    }
                });
                var ViewModel = BaseMap.extend({
                    method: function method() {
                        return 'GOOD!';
                    }
                });
                var Person = (0, _reactViewModel2.default)('AutobindCheck', ViewModel, function (vm) {
                    return _react2.default.createElement('div', null, vm.method());
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, null));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(divComponent.textContent, 'GOOD!', 'autobinding respects prototype rules');
            });
            _stealQunit2.default.test('should not autobind methods again, if 2 components are using the same ViewModel class', function (assert) {
                var ViewModel = _map2.default.extend('ReactViewModel6', {});
                var descriptor = Object.getOwnPropertyDescriptor(ViewModel.prototype, 'setup');
                ViewModel.prototype._xx_setup = descriptor.value;
                var setupSetCount = 0;
                Object.defineProperty(ViewModel.prototype, 'setup', {
                    enumerable: descriptor.enumerable,
                    get: function get() {
                        return this._xx_setup;
                    },
                    set: function set(setupFn) {
                        if (setupFn.name === 'setUpWithAutobind') {
                            setupSetCount++;
                        }
                        this._xx_setup = setupFn;
                    }
                });
                var Rule = (0, _reactViewModel2.default)('AutobindCheckHr1', ViewModel, function () {
                    return _react2.default.createElement('hr', null);
                });
                var HRule = (0, _reactViewModel2.default)('AutobindCheckHr2', ViewModel, function () {
                    return _react2.default.createElement('hr', null);
                });
                _testUtils2.default.renderIntoDocument(_react2.default.createElement('div', null, _react2.default.createElement(Rule, null), _react2.default.createElement(HRule, null)));
                _utils.supportsFunctionName ? assert.equal(setupSetCount, 1, 'the autobind setup modifier was only called once') : assert.ok(true);
            });
        });
    });
});
/*react-view-model@1.0.0-pre.9#test/test*/
define('react-view-model@1.0.0-pre.9#test/test', [
    'steal-qunit',
    'react',
    'react-dom/test-utils',
    'react-view-model',
    'react-view-model/component',
    './utils',
    './test-define'
], function (_stealQunit, _react, _testUtils, _reactViewModel, _component, _utils) {
    'use strict';
    var _stealQunit2 = _interopRequireDefault(_stealQunit);
    var _react2 = _interopRequireDefault(_react);
    var _testUtils2 = _interopRequireDefault(_testUtils);
    var _reactViewModel2 = _interopRequireDefault(_reactViewModel);
    var _component2 = _interopRequireDefault(_component);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ('value' in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function (Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
        }
        return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
    }
    function _inherits(subClass, superClass) {
        if (typeof superClass !== 'function' && superClass !== null) {
            throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass)
            Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    _stealQunit2.default.module('react-view-model', function () {
        _stealQunit2.default.module('when extending Component', function () {
            _stealQunit2.default.test('should work without a ViewModel', function (assert) {
                var TestComponent = function (_Component) {
                    _inherits(TestComponent, _Component);
                    function TestComponent() {
                        _classCallCheck(this, TestComponent);
                        return _possibleConstructorReturn(this, (TestComponent.__proto__ || Object.getPrototypeOf(TestComponent)).apply(this, arguments));
                    }
                    _createClass(TestComponent, [{
                            key: 'render',
                            value: function render() {
                                return _react2.default.createElement('div', null, this.viewModel.foobar);
                            }
                        }]);
                    return TestComponent;
                }(_component2.default);
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, { foobar: 'foobar' }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(divComponent.innerText, 'foobar');
            });
        });
        _stealQunit2.default.module('when using reactViewModel', function () {
            _stealQunit2.default.test('should change props on the correct child', function (assert) {
                var Child0 = (0, _reactViewModel2.default)('Child0', function (props) {
                    return _react2.default.createElement('div', null, props.val);
                });
                var Child1 = (0, _reactViewModel2.default)('Child1', function () {
                    return _react2.default.createElement('div', null, 'child1');
                });
                var Parent = (0, _reactViewModel2.default)('Parent', function () {
                    return _react2.default.createElement('div', null, _react2.default.createElement(Child0, { val: 'foo' }), _react2.default.createElement(Child1, null));
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Parent, null));
                var child0Instance = _testUtils2.default.findRenderedComponentWithType(testInstance, Child0);
                var child0Div = _testUtils2.default.findRenderedDOMComponentWithTag(child0Instance, 'div');
                child0Instance.viewModel.val = 'bar';
                assert.equal((0, _utils.getTextFromElement)(child0Div), 'bar');
            });
            _stealQunit2.default.test('should work with displayName and render function', function (assert) {
                var Person = (0, _reactViewModel2.default)('Person', function (props) {
                    return _react2.default.createElement('div', null, props.first, ' ', props.last);
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, {
                    first: 'Christopher',
                    last: 'Baker'
                }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.ok(Person.prototype instanceof _component2.default, 'returned component is an instance of Component');
                _utils.supportsFunctionName && assert.equal(Person.name, 'Person', 'returned component is properly named');
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Yetti Baker');
            });
            _stealQunit2.default.test('should work with render function', function (assert) {
                var Person = (0, _reactViewModel2.default)(function (props) {
                    return _react2.default.createElement('div', null, props.first, ' ', props.last);
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, {
                    first: 'Christopher',
                    last: 'Baker'
                }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.ok(Person.prototype instanceof _component2.default, 'returned component is an instance of Component');
                _utils.supportsFunctionName && assert.equal(Person.name, 'ReactVMComponentWrapper', 'returned component is properly named');
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal((0, _utils.getTextFromElement)(divComponent), 'Yetti Baker');
            });
            _stealQunit2.default.test('should change props on the correct children - deep tree', function (assert) {
                var render = function render(props) {
                    return _react2.default.createElement('span', null, props.value, props.children);
                };
                var Child0 = (0, _reactViewModel2.default)('Child0', render);
                var Child00 = (0, _reactViewModel2.default)('Child00', render);
                var Child000 = (0, _reactViewModel2.default)('Child000', render);
                var Child01 = (0, _reactViewModel2.default)('Child01', render);
                var Child1 = (0, _reactViewModel2.default)('Child1', render);
                var Child10 = (0, _reactViewModel2.default)('Child10', render);
                var Child100 = (0, _reactViewModel2.default)('Child100', render);
                var Child1000 = (0, _reactViewModel2.default)('Child1000', render);
                var Child11 = (0, _reactViewModel2.default)('Child11', render);
                var Parent = (0, _reactViewModel2.default)('Parent', function (props) {
                    return _react2.default.createElement('div', null, _react2.default.createElement(Child0, { value: '0' }, _react2.default.createElement(Child00, { value: '1' }, props.prop0, _react2.default.createElement(Child000, { value: '2' })), _react2.default.createElement(Child01, { value: '3' })), props.prop1, _react2.default.createElement(Child1, { value: '4' }, props.prop2, _react2.default.createElement(Child10, { value: '5' }, _react2.default.createElement(Child100, { value: '6' }, _react2.default.createElement(Child1000, { value: '7' }))), _react2.default.createElement(Child11, { value: '8' })));
                });
                var parentInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Parent, {
                    prop0: '!',
                    prop1: '@',
                    prop2: '#'
                }));
                var parentViewModel = parentInstance.viewModel;
                var parentDiv = _testUtils2.default.findRenderedDOMComponentWithTag(parentInstance, 'div');
                var child0ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child0).viewModel;
                var child00ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child00).viewModel;
                var child000ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child000).viewModel;
                var child01ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child01).viewModel;
                var child1ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child1).viewModel;
                var child10ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child10).viewModel;
                var child100ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child100).viewModel;
                var child1000ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child1000).viewModel;
                var child11ViewModel = _testUtils2.default.findRenderedComponentWithType(parentInstance, Child11).viewModel;
                assert.equal((0, _utils.getTextFromElement)(parentDiv), '01!23@4#5678', '01!23@4#5678');
                child0ViewModel.value = 'a';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'a1!23@4#5678', 'a1!23@4#5678');
                child00ViewModel.value = 'b';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!23@4#5678', 'ab!23@4#5678');
                child000ViewModel.value = 'c';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!c3@4#5678', 'ab!c3@4#5678');
                child01ViewModel.value = 'd';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!cd@4#5678', 'ab!cd@4#5678');
                child1ViewModel.value = 'e';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!cd@e#5678', 'ab!cd@e#5678');
                child10ViewModel.value = 'f';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!cd@e#f678', 'ab!cd@e#f678');
                child100ViewModel.value = 'g';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!cd@e#fg78', 'ab!cd@e#fg78');
                child1000ViewModel.value = 'h';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!cd@e#fgh8', 'ab!cd@e#fgh8');
                child11ViewModel.value = 'i';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'ab!cd@e#fghi', 'ab!cd@e#fghi');
                parentViewModel.prop0 = 'A';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'abAcd@e#fghi', 'abAcd@e#fghi');
                parentViewModel.prop1 = 'B';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'abAcdBe#fghi', 'abAcdBe#fghi');
                parentViewModel.prop2 = 'C';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'abAcdBeCfghi', 'abAcdBeCfghi');
            });
            _stealQunit2.default.test('should change a prop multiple times when you have nested children', function (assert) {
                var Child0 = (0, _reactViewModel2.default)('Child0', function (props) {
                    return _react2.default.createElement('span', null, props.children);
                });
                var Child1 = (0, _reactViewModel2.default)('Child1', function () {
                    return _react2.default.createElement('span', null, 'z');
                });
                var Parent = (0, _reactViewModel2.default)('Parent', function (props) {
                    return _react2.default.createElement('div', null, props.prop0, _react2.default.createElement(Child0, null, _react2.default.createElement(Child1, null)));
                });
                var parentInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Parent, { prop0: '0' }));
                var parentViewModel = parentInstance.viewModel;
                var parentDiv = _testUtils2.default.findRenderedDOMComponentWithTag(parentInstance, 'div');
                assert.equal((0, _utils.getTextFromElement)(parentDiv), '0z', '0z');
                parentViewModel.prop0 = 'a';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'az', 'az');
                parentViewModel.prop0 = 'b';
                assert.equal((0, _utils.getTextFromElement)(parentDiv), 'bz', 'bz');
            });
        });
    });
});