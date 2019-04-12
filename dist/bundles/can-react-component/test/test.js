/*can-react-component@0.1.11#can-react-component*/
define('can-react-component@0.1.11#can-react-component', [
    'require',
    'exports',
    'module',
    'react',
    'can-view-scope',
    'can-assign',
    'can-namespace'
], function (require, exports, module) {
    var React = require('react');
    var Scope = require('can-view-scope');
    var assign = require('can-assign');
    var namespace = require('can-namespace');
    module.exports = namespace.reactComponent = function canReactComponent(displayName, CanComponent) {
        if (arguments.length === 1) {
            CanComponent = arguments[0];
            displayName = (CanComponent.shortName || 'CanComponent') + 'Wrapper';
        }
        function Wrapper() {
            React.Component.call(this);
            this.canComponent = null;
            this.createComponent = this.createComponent.bind(this);
        }
        Wrapper.displayName = displayName;
        Wrapper.prototype = Object.create(React.Component.prototype);
        assign(Wrapper.prototype, {
            constructor: Wrapper,
            createComponent: function (el) {
                if (this.canComponent) {
                    this.canComponent = null;
                }
                if (el) {
                    this.canComponent = new CanComponent(el, {
                        subtemplate: null,
                        templateType: 'react',
                        parentNodeList: undefined,
                        options: Scope.refsScope().add({}),
                        scope: new Scope.Options({}),
                        setupBindings: function (el, makeViewModel, initialViewModelData) {
                            assign(initialViewModelData, this.props);
                            makeViewModel(initialViewModelData);
                        }.bind(this)
                    });
                }
            },
            componentWillUpdate: function (props) {
                this.canComponent.viewModel.assign(props);
            },
            render: function () {
                return React.createElement(CanComponent.prototype.tag, { ref: this.createComponent });
            }
        });
        Object.defineProperty(Wrapper.prototype, 'viewModel', {
            enumerable: false,
            configurable: true,
            get: function () {
                return this.canComponent && this.canComponent.viewModel;
            }
        });
        try {
            Object.defineProperty(Wrapper, 'name', {
                writable: false,
                enumerable: false,
                configurable: true,
                value: displayName
            });
        } catch (e) {
        }
        return Wrapper;
    };
});
/*can-react-component@0.1.11#test/test*/
define('can-react-component@0.1.11#test/test', [
    'steal-qunit',
    'react',
    'react-dom/test-utils',
    'can-define/map/map',
    'can-component',
    'can-stache',
    'can-react-component'
], function (_stealQunit, _react, _testUtils, _map, _canComponent, _canStache, _canReactComponent) {
    'use strict';
    var _stealQunit2 = _interopRequireDefault(_stealQunit);
    var _react2 = _interopRequireDefault(_react);
    var _testUtils2 = _interopRequireDefault(_testUtils);
    var _map2 = _interopRequireDefault(_map);
    var _canComponent2 = _interopRequireDefault(_canComponent);
    var _canStache2 = _interopRequireDefault(_canStache);
    var _canReactComponent2 = _interopRequireDefault(_canReactComponent);
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
    var Component = _react2.default.Component;
    function getTextFromFrag(node) {
        var txt = '';
        node = node.firstChild;
        while (node) {
            if (node.nodeType === 3) {
                txt += node.nodeValue;
            } else {
                txt += getTextFromFrag(node);
            }
            node = node.nextSibling;
        }
        return txt;
    }
    _stealQunit2.default.module('can-react-component', function () {
        _stealQunit2.default.test('should be able to consume components', function (assert) {
            var ViewModel = _map2.default.extend('ViewModel', {
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
            var ConsumedComponent = (0, _canReactComponent2.default)('ConsumedComponent', _canComponent2.default.extend('ConsumedComponent', {
                tag: 'consumed-component1',
                ViewModel: ViewModel,
                view: (0, _canStache2.default)('<div class=\'inner\'>{{name}}</div>')
            }));
            var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(ConsumedComponent, { last: 'Baker' }));
            var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'consumed-component1');
            assert.equal(testInstance.constructor.name, 'ConsumedComponent');
            assert.equal(getTextFromFrag(divComponent), 'Christopher Baker');
            testInstance.viewModel.first = 'Yetti';
            assert.equal(getTextFromFrag(divComponent), 'Yetti Baker');
        });
        _stealQunit2.default.test('should work without a displayName', function (assert) {
            var ViewModel = _map2.default.extend('ViewModel', {
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
            var ConsumedComponent = (0, _canReactComponent2.default)(_canComponent2.default.extend('ConsumedComponent', {
                tag: 'consumed-component2',
                ViewModel: ViewModel,
                view: (0, _canStache2.default)('<div class=\'inner\'>{{name}}</div>')
            }));
            var testInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(ConsumedComponent, { last: 'Baker' }));
            var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(testInstance, 'consumed-component2');
            assert.equal(testInstance.constructor.name, 'ConsumedComponentWrapper');
            assert.equal(getTextFromFrag(divComponent), 'Christopher Baker');
        });
        _stealQunit2.default.test('should update the component when new props are received', function (assert) {
            var ViewModel = _map2.default.extend('ViewModel', {
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
            var ConsumedComponent = (0, _canReactComponent2.default)(_canComponent2.default.extend('ConsumedComponent', {
                tag: 'consumed-component3',
                ViewModel: ViewModel,
                view: (0, _canStache2.default)('<div class=\'inner\'>{{name}}</div>')
            }));
            var WrappingComponent = function (_Component) {
                _inherits(WrappingComponent, _Component);
                function WrappingComponent() {
                    _classCallCheck(this, WrappingComponent);
                    var _this = _possibleConstructorReturn(this, (WrappingComponent.__proto__ || Object.getPrototypeOf(WrappingComponent)).call(this));
                    _this.state = {
                        first: 'Christopher',
                        last: 'Baker'
                    };
                    return _this;
                }
                _createClass(WrappingComponent, [
                    {
                        key: 'changeState',
                        value: function changeState() {
                            this.setState({ first: 'Yetti' });
                        }
                    },
                    {
                        key: 'render',
                        value: function render() {
                            return _react2.default.createElement(ConsumedComponent, {
                                first: this.state.first,
                                last: this.state.last
                            });
                        }
                    }
                ]);
                return WrappingComponent;
            }(Component);
            var wrappingInstance = _testUtils2.default.renderIntoDocument(_react2.default.createElement(WrappingComponent, null));
            var divComponent = _testUtils2.default.findRenderedDOMComponentWithTag(wrappingInstance, 'consumed-component3');
            assert.equal(getTextFromFrag(divComponent), 'Christopher Baker');
            wrappingInstance.changeState();
            assert.equal(getTextFromFrag(divComponent), 'Yetti Baker');
        });
    });
});