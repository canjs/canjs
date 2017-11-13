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