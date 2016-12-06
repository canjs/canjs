/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*can@2.3.1#view/bindings/bindings*/
define([
    'can/util/library',
    'can/view/expression',
    'can/view/callbacks',
    'can/control',
    'can/view/scope',
    'can/view/href'
], function (can, expression) {
    var isContentEditable = function () {
            var values = {
                    '': true,
                    'true': true,
                    'false': false
                };
            var editable = function (el) {
                if (!el || !el.getAttribute) {
                    return;
                }
                var attr = el.getAttribute('contenteditable');
                return values[attr];
            };
            return function (el) {
                var val = editable(el);
                if (typeof val === 'boolean') {
                    return val;
                } else {
                    return !!editable(el.parentNode);
                }
            };
        }(), removeBrackets = function (value, open, close) {
            open = open || '{';
            close = close || '}';
            if (value[0] === open && value[value.length - 1] === close) {
                return value.substr(1, value.length - 2);
            }
            return value;
        };
    can.view.attr('can-value', function (el, data) {
        var propName = '$value', attrValue = can.trim(removeBrackets(el.getAttribute('can-value'))), getterSetter;
        if (el.nodeName.toLowerCase() === 'input' && (el.type === 'checkbox' || el.type === 'radio')) {
            var property = getScopeCompute(el, data.scope, attrValue, {});
            if (el.type === 'checkbox') {
                var trueValue = can.attr.has(el, 'can-true-value') ? el.getAttribute('can-true-value') : true, falseValue = can.attr.has(el, 'can-false-value') ? el.getAttribute('can-false-value') : false;
                getterSetter = can.compute(function (newValue) {
                    if (arguments.length) {
                        property(newValue ? trueValue : falseValue);
                    } else {
                        return property() == trueValue;
                    }
                });
            } else if (el.type === 'radio') {
                getterSetter = can.compute(function (newValue) {
                    if (arguments.length) {
                        if (newValue) {
                            property(el.value);
                        }
                    } else {
                        return property() == el.value;
                    }
                });
            }
            propName = '$checked';
            attrValue = 'getterSetter';
            data.scope = new can.view.Scope({ getterSetter: getterSetter });
        } else if (isContentEditable(el)) {
            propName = '$innerHTML';
        }
        bindings(el, data, {
            attrValue: attrValue,
            propName: propName,
            childToParent: true,
            parentToChild: true,
            initializeValues: true,
            syncChildWithParent: true
        });
    });
    var special = {
            enter: function (data, el, original) {
                return {
                    event: 'keyup',
                    handler: function (ev) {
                        if (ev.keyCode === 13) {
                            return original.call(this, ev);
                        }
                    }
                };
            }
        };
    var handleEvent = function (el, data) {
        var attributeName = data.attributeName, legacyBinding = attributeName.indexOf('can-') === 0, event = attributeName.indexOf('can-') === 0 ? attributeName.substr('can-'.length) : removeBrackets(attributeName, '(', ')'), onBindElement = legacyBinding;
        if (event.charAt(0) === '$') {
            event = event.substr(1);
            onBindElement = true;
        }
        var handler = function (ev) {
            var attrVal = el.getAttribute(attributeName);
            if (!attrVal) {
                return;
            }
            var $el = can.$(el), viewModel = can.viewModel($el[0]);
            var expr = expression.parse(removeBrackets(attrVal), {
                    lookupRule: 'method',
                    methodRule: 'call'
                });
            if (!(expr instanceof expression.Call) && !(expr instanceof expression.Helper)) {
                var defaultArgs = can.map([
                        data.scope._context,
                        $el
                    ].concat(can.makeArray(arguments)), function (data) {
                        return new expression.Literal(data);
                    });
                expr = new expression.Call(expr, defaultArgs, {});
            }
            var scopeData = data.scope.read(expr.methodExpr.key, { isArgument: true });
            if (!scopeData.value) {
                scopeData = data.scope.read(expr.methodExpr.key, { isArgument: true });
                can.dev.warn('can/view/bindings: ' + attributeName + ' couldn\'t find method named ' + expr.methodExpr.key, {
                    element: el,
                    scope: data.scope
                });
                return null;
            }
            var localScope = data.scope.add({
                    '@element': $el,
                    '@event': ev,
                    '@viewModel': viewModel,
                    '@scope': data.scope,
                    '@context': data.scope._context,
                    '%element': this,
                    '$element': $el,
                    '%event': ev,
                    '%viewModel': viewModel,
                    '%scope': data.scope,
                    '%context': data.scope._context
                }, { notContext: true });
            var args = expr.args(localScope, null)(), hash = expr.hash(localScope, null)();
            if (!can.isEmptyObject(hash)) {
                args.push(hash);
            }
            return scopeData.value.apply(scopeData.parent, args);
        };
        if (special[event]) {
            var specialData = special[event](data, el, handler);
            handler = specialData.handler;
            event = specialData.event;
        }
        can.bind.call(onBindElement ? el : can.viewModel(el), event, handler);
        var attributesHandler = function (ev) {
            if (ev.attributeName === attributeName && !this.getAttribute(attributeName)) {
                can.unbind.call(onBindElement ? el : can.viewModel(el), event, handler);
                can.unbind.call(el, 'attributes', attributesHandler);
            }
        };
        can.bind.call(el, 'attributes', attributesHandler);
    };
    can.view.attr(/can-[\w\.]+/, handleEvent);
    can.view.attr(/^\([\$?\w\.]+\)$/, handleEvent);
    var elementCompute = function (el, prop, event) {
        if (!event) {
            if (prop === 'innerHTML') {
                event = [
                    'blur',
                    'change'
                ];
            } else {
                event = 'change';
            }
        }
        if (!can.isArray(event)) {
            event = [event];
        }
        var hasChildren = el.nodeName.toLowerCase() === 'select', isMultiselectValue = prop === 'value' && hasChildren && el.multiple, isStringValue, lastSet, set = function (newVal) {
                lastSet = newVal;
                if (isMultiselectValue) {
                    if (newVal && typeof newVal === 'string') {
                        newVal = newVal.split(';');
                        isStringValue = true;
                    } else if (newVal) {
                        newVal = can.makeArray(newVal);
                    } else {
                        newVal = [];
                    }
                    var isSelected = {};
                    can.each(newVal, function (val) {
                        isSelected[val] = true;
                    });
                    can.each(el.childNodes, function (option) {
                        if (option.value) {
                            option.selected = !!isSelected[option.value];
                        }
                    });
                } else {
                    can.attr.setAttrOrProp(el, prop, newVal == null ? '' : newVal);
                }
                return newVal;
            };
        if (hasChildren) {
            setTimeout(function () {
                set(lastSet);
            }, 1);
        }
        return can.compute(el[prop], {
            on: function (updater) {
                can.each(event, function (eventName) {
                    can.bind.call(el, eventName, updater);
                });
            },
            off: function (updater) {
                can.each(event, function (eventName) {
                    can.unbind.call(el, eventName, updater);
                });
            },
            get: function () {
                if (isMultiselectValue) {
                    var values = [], children = el.childNodes;
                    can.each(children, function (child) {
                        if (child.selected && child.value) {
                            values.push(child.value);
                        }
                    });
                    return isStringValue ? values.join(';') : values;
                }
                return can.attr.get(el, prop);
            },
            set: set
        });
    };
    var getValue = function (value) {
        return value && value.isComputed ? value() : value;
    };
    var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/;
    var attributeNameInfo = function (attributeName) {
        var matches = attributeName.match(bindingsRegExp);
        if (!matches) {
            return {
                childToParent: true,
                parentToChild: true,
                propName: attributeName
            };
        }
        var twoWay = !!matches[1], childToParent = twoWay || !!matches[2], parentToChild = twoWay || !childToParent;
        return {
            childToParent: childToParent,
            parentToChild: parentToChild,
            propName: matches[3]
        };
    };
    var getScopeCompute = function (el, scope, scopeProp, options) {
        var parentExpression = expression.parse(scopeProp, { baseMethodType: 'Call' });
        return parentExpression.value(scope, new can.view.Scope());
    };
    var getElementCompute = function (el, attributeName, options) {
        var attrName = can.camelize(options.propName || attributeName.substr(1)), firstChar = attrName.charAt(0), isDOM = firstChar === '$', childCompute;
        if (isDOM) {
            childCompute = elementCompute(el, attrName.substr(1));
        } else {
            var childExpression = expression.parse(attrName, { baseMethodType: 'Call' });
            var childContext = can.viewModel(el);
            var childScope = new can.view.Scope(childContext);
            childCompute = childExpression.value(childScope, new can.view.Scope(), {});
        }
        return childCompute;
    };
    var bindParentToChild = function (el, parentCompute, childUpdate, bindingsSemaphore, attrName) {
        var updateChild = function (ev, newValue) {
            bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
            childUpdate(newValue);
            can.batch.after(function () {
                --bindingsSemaphore[attrName];
            });
        };
        if (parentCompute && parentCompute.isComputed) {
            parentCompute.bind('change', updateChild);
            can.one.call(el, 'removed', function () {
                parentCompute.unbind('change', updateChild);
            });
        }
        return updateChild;
    };
    var bindChildToParent = function (el, parentUpdate, childCompute, bindingsSemaphore, attrName, syncChild) {
        var parentUpdateIsFunction = typeof parentUpdate === 'function';
        var updateScope = function (ev, newVal) {
            if (!bindingsSemaphore[attrName]) {
                if (parentUpdateIsFunction) {
                    parentUpdate(newVal);
                    if (syncChild) {
                        if (parentUpdate() !== childCompute()) {
                            bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                            childCompute(parentUpdate());
                            can.batch.after(function () {
                                --bindingsSemaphore[attrName];
                            });
                        }
                    }
                } else if (parentUpdate instanceof can.Map) {
                    parentUpdate.attr(newVal, true);
                }
            }
        };
        if (childCompute && childCompute.isComputed) {
            childCompute.bind('change', updateScope);
            can.one.call(el, 'removed', function () {
                childCompute.unbind('change', updateScope);
            });
        }
        return updateScope;
    };
    var bindings = function (el, attrData, options) {
        var attrName = attrData.attributeName;
        var parentCompute = getScopeCompute(el, attrData.scope, options.attrValue || el.getAttribute(attrName) || '.', options);
        var childCompute = getElementCompute(el, options.propName || attrName.replace(/^\{/, '').replace(/\}$/, ''), options);
        var bindingsSemaphore = {}, updateChild, updateScope;
        if (options.parentToChild) {
            updateChild = bindParentToChild(el, parentCompute, childCompute, bindingsSemaphore, attrName);
        }
        if (options.childToParent) {
            updateScope = bindChildToParent(el, parentCompute, childCompute, bindingsSemaphore, attrName, options.syncChildWithParent);
        }
        if (options.initializeValues) {
            initializeValues(options, childCompute, parentCompute, updateChild, updateScope);
        }
        return {
            parentCompute: parentCompute,
            childCompute: childCompute
        };
    };
    var initializeValues = function (options, childCompute, parentCompute, updateChild, updateScope) {
        if (options.parentToChild && !options.childToParent) {
            updateChild({}, getValue(parentCompute));
        } else if (!options.parentToChild && options.childToParent) {
            updateScope({}, getValue(childCompute));
        } else if (getValue(childCompute) === undefined) {
            updateChild({}, getValue(parentCompute));
        } else if (getValue(parentCompute) === undefined) {
            updateScope({}, getValue(childCompute));
        } else {
            updateChild({}, getValue(parentCompute));
        }
    };
    var dataBindingsRegExp = /^\{[^\}]+\}$/;
    can.view.attr(dataBindingsRegExp, function (el, attrData) {
        if (can.data(can.$(el), 'preventDataBindings')) {
            return;
        }
        var attrNameInfo = attributeNameInfo(attrData.attributeName);
        attrNameInfo.initializeValues = true;
        bindings(el, attrData, attrNameInfo);
    });
    can.view.attr(/\*[\w\.\-_]+/, function (el, attrData) {
        if (el.getAttribute(attrData.attributeName)) {
            console.warn('&reference attributes can only export the view model.');
        }
        var name = can.camelize(attrData.attributeName.substr(1).toLowerCase());
        var viewModel = can.viewModel(el);
        var refs = attrData.scope.getRefs();
        refs._context.attr('*' + name, viewModel);
    });
    return {
        getParentCompute: getScopeCompute,
        bindParentToChild: bindParentToChild,
        bindChildToParent: bindChildToParent,
        setupDataBinding: bindings,
        dataBindingsRegExp: dataBindingsRegExp,
        attributeNameInfo: attributeNameInfo,
        initializeValues: initializeValues
    };
});