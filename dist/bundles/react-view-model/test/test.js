/*react-is@16.13.1#cjs/react-is.production.min*/
define('react-is@16.13.1#cjs/react-is.production.min', function (require, exports, module) {
    'use strict';
    var b = 'function' === typeof Symbol && Symbol.for, c = b ? Symbol.for('react.element') : 60103, d = b ? Symbol.for('react.portal') : 60106, e = b ? Symbol.for('react.fragment') : 60107, f = b ? Symbol.for('react.strict_mode') : 60108, g = b ? Symbol.for('react.profiler') : 60114, h = b ? Symbol.for('react.provider') : 60109, k = b ? Symbol.for('react.context') : 60110, l = b ? Symbol.for('react.async_mode') : 60111, m = b ? Symbol.for('react.concurrent_mode') : 60111, n = b ? Symbol.for('react.forward_ref') : 60112, p = b ? Symbol.for('react.suspense') : 60113, q = b ? Symbol.for('react.suspense_list') : 60120, r = b ? Symbol.for('react.memo') : 60115, t = b ? Symbol.for('react.lazy') : 60116, v = b ? Symbol.for('react.block') : 60121, w = b ? Symbol.for('react.fundamental') : 60117, x = b ? Symbol.for('react.responder') : 60118, y = b ? Symbol.for('react.scope') : 60119;
    function z(a) {
        if ('object' === typeof a && null !== a) {
            var u = a.$$typeof;
            switch (u) {
            case c:
                switch (a = a.type, a) {
                case l:
                case m:
                case e:
                case g:
                case f:
                case p:
                    return a;
                default:
                    switch (a = a && a.$$typeof, a) {
                    case k:
                    case n:
                    case t:
                    case r:
                    case h:
                        return a;
                    default:
                        return u;
                    }
                }
            case d:
                return u;
            }
        }
    }
    function A(a) {
        return z(a) === m;
    }
    exports.AsyncMode = l;
    exports.ConcurrentMode = m;
    exports.ContextConsumer = k;
    exports.ContextProvider = h;
    exports.Element = c;
    exports.ForwardRef = n;
    exports.Fragment = e;
    exports.Lazy = t;
    exports.Memo = r;
    exports.Portal = d;
    exports.Profiler = g;
    exports.StrictMode = f;
    exports.Suspense = p;
    exports.isAsyncMode = function (a) {
        return A(a) || z(a) === l;
    };
    exports.isConcurrentMode = A;
    exports.isContextConsumer = function (a) {
        return z(a) === k;
    };
    exports.isContextProvider = function (a) {
        return z(a) === h;
    };
    exports.isElement = function (a) {
        return 'object' === typeof a && null !== a && a.$$typeof === c;
    };
    exports.isForwardRef = function (a) {
        return z(a) === n;
    };
    exports.isFragment = function (a) {
        return z(a) === e;
    };
    exports.isLazy = function (a) {
        return z(a) === t;
    };
    exports.isMemo = function (a) {
        return z(a) === r;
    };
    exports.isPortal = function (a) {
        return z(a) === d;
    };
    exports.isProfiler = function (a) {
        return z(a) === g;
    };
    exports.isStrictMode = function (a) {
        return z(a) === f;
    };
    exports.isSuspense = function (a) {
        return z(a) === p;
    };
    exports.isValidElementType = function (a) {
        return 'string' === typeof a || 'function' === typeof a || a === e || a === m || a === g || a === f || a === p || a === q || 'object' === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r || a.$$typeof === h || a.$$typeof === k || a.$$typeof === n || a.$$typeof === w || a.$$typeof === x || a.$$typeof === y || a.$$typeof === v);
    };
    exports.typeOf = z;
});
/*react-is@16.13.1#cjs/react-is.development*/
define('react-is@16.13.1#cjs/react-is.development', function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV !== 'production') {
        (function () {
            'use strict';
            var hasSymbol = typeof Symbol === 'function' && Symbol.for;
            var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 60103;
            var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 60106;
            var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 60107;
            var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 60108;
            var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 60114;
            var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 60109;
            var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 60110;
            var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 60111;
            var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 60111;
            var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 60112;
            var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 60113;
            var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 60120;
            var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 60115;
            var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 60116;
            var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 60121;
            var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 60117;
            var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 60118;
            var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 60119;
            function isValidElementType(type) {
                return typeof type === 'string' || typeof type === 'function' || type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
            }
            function typeOf(object) {
                if (typeof object === 'object' && object !== null) {
                    var $$typeof = object.$$typeof;
                    switch ($$typeof) {
                    case REACT_ELEMENT_TYPE:
                        var type = object.type;
                        switch (type) {
                        case REACT_ASYNC_MODE_TYPE:
                        case REACT_CONCURRENT_MODE_TYPE:
                        case REACT_FRAGMENT_TYPE:
                        case REACT_PROFILER_TYPE:
                        case REACT_STRICT_MODE_TYPE:
                        case REACT_SUSPENSE_TYPE:
                            return type;
                        default:
                            var $$typeofType = type && type.$$typeof;
                            switch ($$typeofType) {
                            case REACT_CONTEXT_TYPE:
                            case REACT_FORWARD_REF_TYPE:
                            case REACT_LAZY_TYPE:
                            case REACT_MEMO_TYPE:
                            case REACT_PROVIDER_TYPE:
                                return $$typeofType;
                            default:
                                return $$typeof;
                            }
                        }
                    case REACT_PORTAL_TYPE:
                        return $$typeof;
                    }
                }
                return undefined;
            }
            var AsyncMode = REACT_ASYNC_MODE_TYPE;
            var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
            var ContextConsumer = REACT_CONTEXT_TYPE;
            var ContextProvider = REACT_PROVIDER_TYPE;
            var Element = REACT_ELEMENT_TYPE;
            var ForwardRef = REACT_FORWARD_REF_TYPE;
            var Fragment = REACT_FRAGMENT_TYPE;
            var Lazy = REACT_LAZY_TYPE;
            var Memo = REACT_MEMO_TYPE;
            var Portal = REACT_PORTAL_TYPE;
            var Profiler = REACT_PROFILER_TYPE;
            var StrictMode = REACT_STRICT_MODE_TYPE;
            var Suspense = REACT_SUSPENSE_TYPE;
            var hasWarnedAboutDeprecatedIsAsyncMode = false;
            function isAsyncMode(object) {
                {
                    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
                        hasWarnedAboutDeprecatedIsAsyncMode = true;
                        console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
                    }
                }
                return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
            }
            function isConcurrentMode(object) {
                return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
            }
            function isContextConsumer(object) {
                return typeOf(object) === REACT_CONTEXT_TYPE;
            }
            function isContextProvider(object) {
                return typeOf(object) === REACT_PROVIDER_TYPE;
            }
            function isElement(object) {
                return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
            }
            function isForwardRef(object) {
                return typeOf(object) === REACT_FORWARD_REF_TYPE;
            }
            function isFragment(object) {
                return typeOf(object) === REACT_FRAGMENT_TYPE;
            }
            function isLazy(object) {
                return typeOf(object) === REACT_LAZY_TYPE;
            }
            function isMemo(object) {
                return typeOf(object) === REACT_MEMO_TYPE;
            }
            function isPortal(object) {
                return typeOf(object) === REACT_PORTAL_TYPE;
            }
            function isProfiler(object) {
                return typeOf(object) === REACT_PROFILER_TYPE;
            }
            function isStrictMode(object) {
                return typeOf(object) === REACT_STRICT_MODE_TYPE;
            }
            function isSuspense(object) {
                return typeOf(object) === REACT_SUSPENSE_TYPE;
            }
            exports.AsyncMode = AsyncMode;
            exports.ConcurrentMode = ConcurrentMode;
            exports.ContextConsumer = ContextConsumer;
            exports.ContextProvider = ContextProvider;
            exports.Element = Element;
            exports.ForwardRef = ForwardRef;
            exports.Fragment = Fragment;
            exports.Lazy = Lazy;
            exports.Memo = Memo;
            exports.Portal = Portal;
            exports.Profiler = Profiler;
            exports.StrictMode = StrictMode;
            exports.Suspense = Suspense;
            exports.isAsyncMode = isAsyncMode;
            exports.isConcurrentMode = isConcurrentMode;
            exports.isContextConsumer = isContextConsumer;
            exports.isContextProvider = isContextProvider;
            exports.isElement = isElement;
            exports.isForwardRef = isForwardRef;
            exports.isFragment = isFragment;
            exports.isLazy = isLazy;
            exports.isMemo = isMemo;
            exports.isPortal = isPortal;
            exports.isProfiler = isProfiler;
            exports.isStrictMode = isStrictMode;
            exports.isSuspense = isSuspense;
            exports.isValidElementType = isValidElementType;
            exports.typeOf = typeOf;
        }());
    }
});
/*react-is@16.13.1#index*/
define('react-is@16.13.1#index', [
    'require',
    'exports',
    'module',
    './cjs/react-is.production.min.js',
    './cjs/react-is.development.js'
], function (require, exports, module) {
    'use strict';
    if (process.env.NODE_ENV === 'production') {
        module.exports = require('./cjs/react-is.production.min.js');
    } else {
        module.exports = require('./cjs/react-is.development.js');
    }
});
/*prop-types@15.7.2#factoryWithTypeCheckers*/
define('prop-types@15.7.2#factoryWithTypeCheckers', [
    'require',
    'exports',
    'module',
    'react-is',
    'object-assign',
    './lib/ReactPropTypesSecret',
    './checkPropTypes'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var ReactIs = require('react-is');
        var assign = require('object-assign');
        var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
        var checkPropTypes = require('./checkPropTypes');
        var has = Function.call.bind(Object.prototype.hasOwnProperty);
        var printWarning = function () {
        };
        if (process.env.NODE_ENV !== 'production') {
            printWarning = function (text) {
                var message = 'Warning: ' + text;
                if (typeof console !== 'undefined') {
                    console.error(message);
                }
                try {
                    throw new Error(message);
                } catch (x) {
                }
            };
        }
        function emptyFunctionThatReturnsNull() {
            return null;
        }
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
                elementType: createElementTypeTypeChecker(),
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
                            var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
                            err.name = 'Invariant Violation';
                            throw err;
                        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
                            var cacheKey = componentName + ':' + propName;
                            if (!manualPropTypeCallCache[cacheKey] && manualPropTypeWarningCount < 3) {
                                printWarning('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
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
                return createChainableTypeChecker(emptyFunctionThatReturnsNull);
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
            function createElementTypeTypeChecker() {
                function validate(props, propName, componentName, location, propFullName) {
                    var propValue = props[propName];
                    if (!ReactIs.isValidElementType(propValue)) {
                        var propType = getPropType(propValue);
                        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
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
                    if (process.env.NODE_ENV !== 'production') {
                        if (arguments.length > 1) {
                            printWarning('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
                        } else {
                            printWarning('Invalid argument supplied to oneOf, expected an array.');
                        }
                    }
                    return emptyFunctionThatReturnsNull;
                }
                function validate(props, propName, componentName, location, propFullName) {
                    var propValue = props[propName];
                    for (var i = 0; i < expectedValues.length; i++) {
                        if (is(propValue, expectedValues[i])) {
                            return null;
                        }
                    }
                    var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
                        var type = getPreciseType(value);
                        if (type === 'symbol') {
                            return String(value);
                        }
                        return value;
                    });
                    return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
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
                        if (has(propValue, key)) {
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
                    process.env.NODE_ENV !== 'production' ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
                    return emptyFunctionThatReturnsNull;
                }
                for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
                    var checker = arrayOfTypeCheckers[i];
                    if (typeof checker !== 'function') {
                        printWarning('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
                        return emptyFunctionThatReturnsNull;
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
                if (!propValue) {
                    return false;
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
            ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
            ReactPropTypes.PropTypes = ReactPropTypes;
            return ReactPropTypes;
        };
    }(function () {
        return this;
    }(), require, exports, module));
});
/*prop-types@15.7.2#factoryWithThrowingShims*/
define('prop-types@15.7.2#factoryWithThrowingShims', [
    'require',
    'exports',
    'module',
    './lib/ReactPropTypesSecret'
], function (require, exports, module) {
    'use strict';
    var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
    function emptyFunction() {
    }
    function emptyFunctionWithReset() {
    }
    emptyFunctionWithReset.resetWarningCache = emptyFunction;
    module.exports = function () {
        function shim(props, propName, componentName, location, propFullName, secret) {
            if (secret === ReactPropTypesSecret) {
                return;
            }
            var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
            err.name = 'Invariant Violation';
            throw err;
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
            elementType: shim,
            instanceOf: getShim,
            node: shim,
            objectOf: getShim,
            oneOf: getShim,
            oneOfType: getShim,
            shape: getShim,
            exact: getShim,
            checkPropTypes: emptyFunctionWithReset,
            resetWarningCache: emptyFunction
        };
        ReactPropTypes.PropTypes = ReactPropTypes;
        return ReactPropTypes;
    };
});
/*prop-types@15.7.2#index*/
define('prop-types@15.7.2#index', [
    'require',
    'exports',
    'module',
    'react-is',
    './factoryWithTypeCheckers',
    './factoryWithThrowingShims'
], function (require, exports, module) {
    if (process.env.NODE_ENV !== 'production') {
        var ReactIs = require('react-is');
        var throwOnDirectAccess = true;
        module.exports = require('./factoryWithTypeCheckers')(ReactIs.isElement, throwOnDirectAccess);
    } else {
        module.exports = require('./factoryWithThrowingShims')();
    }
});
/*react-view-model@0.5.11#observer*/
define('react-view-model@0.5.11#observer', [
    'require',
    'exports',
    'module',
    'can-observation',
    'can-util/js/assign/assign'
], function (require, exports, module) {
    var Observation = require('can-observation');
    var assign = require('can-util/js/assign/assign');
    function Observer() {
        var self = this;
        Observation.call(self, null, null, function () {
            return self.listener && self.listener();
        });
    }
    Observer.prototype = Object.create(Observation.prototype);
    Observer.prototype.constructor = Observer;
    assign(Observer.prototype, {
        start: function () {
            this.value = {};
        },
        startLisening: function (listener) {
            this.listener = listener || this.listener;
            this.bound = true;
            this.oldObserved = this.newObserved || {};
            this.ignore = 0;
            this.newObserved = {};
            Observation.observationStack.push(this);
        },
        stopListening: function () {
            if (Observation.observationStack[Observation.observationStack.length - 1] !== this) {
                var index = Observation.observationStack.indexOf(this);
                if (index === -1) {
                    throw new Error('Async observations stopped out of order.');
                }
                Observation.observationStack.splice(index, 1);
                Observation.observationStack.push(this);
            }
            Observation.observationStack.pop();
            this.updateBindings();
        }
    });
    module.exports = Observer;
});
/*react-view-model@0.5.11#helpers/make-enumerable*/
define('react-view-model@0.5.11#helpers/make-enumerable', [
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
/*react-view-model@0.5.11#helpers/autobind-methods*/
define('react-view-model@0.5.11#helpers/autobind-methods', [
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
/*react-view-model@0.5.11#component*/
define('react-view-model@0.5.11#component', [
    'require',
    'exports',
    'module',
    'react',
    'can-define/map/map',
    'can-util/js/assign/assign',
    './observer',
    './helpers/make-enumerable',
    './helpers/autobind-methods',
    'can-util/js/dev/dev',
    'can-namespace'
], function (require, exports, module) {
    var React = require('react');
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
            this._observer = new Observer();
            if (typeof this.shouldComponentUpdate === 'function') {
                this._shouldComponentUpdate = this.shouldComponentUpdate;
            }
            this.shouldComponentUpdate = function () {
                return false;
            };
        };
        Component.prototype = Object.create(React.Component.prototype);
        assign(Component.prototype, {
            constructor: Component,
            componentWillReceiveProps: function (nextProps) {
                var props = {};
                for (var key in nextProps) {
                    if (!(key in this.props) || nextProps[key] !== this.props[key]) {
                        props[key] = nextProps[key];
                    }
                }
                this.viewModel.assign(props);
            },
            componentWillMount: function () {
                var ViewModel = this.constructor.ViewModel || DefineMap;
                this.viewModel = new ViewModel(this.props);
                this._observer.startLisening(function () {
                    if (typeof this._shouldComponentUpdate !== 'function' || this._shouldComponentUpdate()) {
                        this.forceUpdate();
                    }
                }.bind(this));
            },
            componentDidMount: function () {
                this._observer.stopListening();
            },
            componentWillUpdate: function () {
                this._observer.startLisening();
            },
            componentDidUpdate: function () {
                this._observer.stopListening();
            },
            componentWillUnmount: function () {
                this._observer.stop();
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
/*react-view-model@0.5.11#helpers/observable-promise*/
define('react-view-model@0.5.11#helpers/observable-promise', [
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
/*react-view-model@0.5.11#react-view-model*/
define('react-view-model@0.5.11#react-view-model', [
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
/*react-view-model@0.5.11#test/test*/
define('react-view-model@0.5.11#test/test', [
    'steal-qunit',
    'react',
    'prop-types',
    'react-dom/test-utils',
    'can-define/map/map',
    'can-define/list/list',
    'react-view-model',
    'react-view-model/component'
], function (_stealQunit, _react, _propTypes, _testUtils, _map, _list, _reactViewModel, _component) {
    'use strict';
    var _stealQunit2 = _interopRequireDefault(_stealQunit);
    var _react2 = _interopRequireDefault(_react);
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _testUtils2 = _interopRequireDefault(_testUtils);
    var _map2 = _interopRequireDefault(_map);
    var _list2 = _interopRequireDefault(_list);
    var _reactViewModel2 = _interopRequireDefault(_reactViewModel);
    var _component2 = _interopRequireDefault(_component);
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
    _stealQunit2.default.module('react-view-model', function () {
        _stealQunit2.default.module('when extending Component', function () {
            var DefinedViewModel = _map2.default.extend('DefinedViewModel', {
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
            _stealQunit2.default.test('should set viewModel to be instance of ViewModel', function (assert) {
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
                TestComponent.ViewModel = DefinedViewModel;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, null));
                assert.ok(testInstance.viewModel instanceof DefinedViewModel);
            });
            _stealQunit2.default.test('should update whenever any observable property on the viewModel instance changes', function (assert) {
                var TestComponent = function (_Component3) {
                    _inherits(TestComponent, _Component3);
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
                TestComponent.ViewModel = DefinedViewModel;
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
                var OutterComponent = function (_Component4) {
                    _inherits(OutterComponent, _Component4);
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
                var TestComponent = function (_Component5) {
                    _inherits(TestComponent, _Component5);
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
                TestComponent.ViewModel = DefinedViewModel;
                var WrappingComponent = function (_ReactComponent2) {
                    _inherits(WrappingComponent, _ReactComponent2);
                    function WrappingComponent() {
                        _classCallCheck(this, WrappingComponent);
                        var _this8 = _possibleConstructorReturn(this, (WrappingComponent.__proto__ || Object.getPrototypeOf(WrappingComponent)).call(this));
                        _this8.state = { foo: 'Initial Prop Value' };
                        return _this8;
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
                var TestComponent = function (_Component6) {
                    _inherits(TestComponent, _Component6);
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
                TestComponent.ViewModel = DefinedViewModel;
                var WrappingComponent = function (_ReactComponent3) {
                    _inherits(WrappingComponent, _ReactComponent3);
                    function WrappingComponent() {
                        _classCallCheck(this, WrappingComponent);
                        var _this10 = _possibleConstructorReturn(this, (WrappingComponent.__proto__ || Object.getPrototypeOf(WrappingComponent)).call(this));
                        _this10.state = { foo: 'foo' };
                        return _this10;
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
                var TestComponent = function (_Component7) {
                    _inherits(TestComponent, _Component7);
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
                TestComponent.ViewModel = DefinedViewModel;
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(TestComponent, { zzz: 'zzz' }));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(testInstance.viewModel.zzz, 'ZZZ');
                assert.equal(divComponent.innerText, 'ZZZ');
            });
            _stealQunit2.default.test('should be able to call the viewModel.interceptedCallback function received from parent component', function (assert) {
                var TestComponent = function (_Component8) {
                    _inherits(TestComponent, _Component8);
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
                TestComponent.ViewModel = DefinedViewModel;
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
        });
        _stealQunit2.default.module('when using reactViewModel', function () {
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
                supportsFunctionName && assert.equal(Person.name, 'Person', 'returned component is properly named');
                assert.equal(getTextFromElement(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal(getTextFromElement(divComponent), 'Yetti Baker');
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
                supportsFunctionName && assert.equal(Person.name, 'Person', 'returned component is properly named');
                assert.equal(getTextFromElement(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal(getTextFromElement(divComponent), 'Yetti Baker');
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
                supportsFunctionName && assert.equal(Person.name, 'PersonWrapper', 'returned component is properly named');
                assert.equal(getTextFromElement(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal(getTextFromElement(divComponent), 'Yetti Baker');
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
                supportsFunctionName && assert.equal(Person.name, 'ReactVMComponentWrapper', 'returned component is properly named');
                assert.equal(getTextFromElement(divComponent), 'Christopher Baker');
                testInstance.viewModel.first = 'Yetti';
                assert.equal(getTextFromElement(divComponent), 'Yetti Baker');
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
                var TestComponent = function (_Component9) {
                    _inherits(TestComponent, _Component9);
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
                var TestComponent = function (_Component10) {
                    _inherits(TestComponent, _Component10);
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
                var Person = (0, _reactViewModel2.default)(ViewModel, function (vm) {
                    return _react2.default.createElement('div', null, vm.method());
                });
                var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(Person, null));
                var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'div');
                assert.equal(divComponent.textContent, 'GOOD!', 'autobinding respects prototype rules');
            });
            _stealQunit2.default.test('should not autobind methods again, if 2 components are using the same ViewModel class', function (assert) {
                var ViewModel = _map2.default.extend('ReactViewModel6', {});
                var descriptor = Object.getOwnPropertyDescriptor(ViewModel.prototype, 'setup');
                var setupSetCount = 0;
                ViewModel.prototype._xx_setup = descriptor.value;
                Object.defineProperty(ViewModel.prototype, 'setup', {
                    get: function get() {
                        return this._xx_setup;
                    },
                    set: function set(setupFn) {
                        if (setupFn.name === 'setUpWithAutobind') {
                            setupSetCount++;
                        }
                        this._xx_setup = setupFn;
                    },
                    enumerable: descriptor.enumerable
                });
                var Rule = (0, _reactViewModel2.default)(ViewModel, function () {
                    return _react2.default.createElement('hr', null);
                });
                var HRule = (0, _reactViewModel2.default)(ViewModel, function () {
                    return _react2.default.createElement('hr', null);
                });
                _testUtils2.default.renderIntoDocument(_react2.default.createElement('div', null, _react2.default.createElement(Rule, null), _react2.default.createElement(HRule, null)));
                supportsFunctionName ? assert.equal(setupSetCount, 1, 'the autobind setup modifier was only called once') : assert.ok(true);
            });
        });
    });
});