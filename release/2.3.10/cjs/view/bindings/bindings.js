/*!
 * CanJS - 2.3.10
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 15 Jan 2016 00:42:09 GMT
 * Licensed MIT
 */

/*can@2.3.10#view/bindings/bindings*/
var can = require('../../util/util.js');
var expression = require('../stache/expression.js');
var viewCallbacks = require('../callbacks/callbacks.js');
var live = require('../live/live.js');
require('../scope/scope.js');
require('../href/href.js');
var behaviors = {
    viewModel: function (el, tagData, makeViewModel, initialViewModelData) {
        initialViewModelData = initialViewModelData || {};
        var bindingsSemaphore = {}, viewModel, onCompleteBindings = [], onTeardowns = {}, bindingInfos = {}, attributeViewModelBindings = can.extend({}, initialViewModelData);
        can.each(can.makeArray(el.attributes), function (node) {
            var dataBinding = makeDataBinding(node, el, {
                templateType: tagData.templateType,
                scope: tagData.scope,
                semaphore: bindingsSemaphore,
                getViewModel: function () {
                    return viewModel;
                },
                attributeViewModelBindings: attributeViewModelBindings,
                alreadyUpdatedChild: true
            });
            if (dataBinding) {
                if (dataBinding.onCompleteBinding) {
                    if (dataBinding.bindingInfo.parentToChild && dataBinding.value !== undefined) {
                        initialViewModelData[cleanVMName(dataBinding.bindingInfo.childName)] = dataBinding.value;
                    }
                    onCompleteBindings.push(dataBinding.onCompleteBinding);
                }
                onTeardowns[node.name] = dataBinding.onTeardown;
            }
        });
        viewModel = makeViewModel(initialViewModelData);
        for (var i = 0, len = onCompleteBindings.length; i < len; i++) {
            onCompleteBindings[i]();
        }
        can.bind.call(el, 'attributes', function (ev) {
            var attrName = ev.attributeName, value = el.getAttribute(attrName);
            if (onTeardowns[attrName]) {
                onTeardowns[attrName]();
            }
            var parentBindingWasAttribute = bindingInfos[attrName] && bindingInfos[attrName].parent === 'attribute';
            if (value !== null || parentBindingWasAttribute) {
                var dataBinding = makeDataBinding({
                    name: attrName,
                    value: value
                }, el, {
                    templateType: tagData.templateType,
                    scope: tagData.scope,
                    semaphore: {},
                    getViewModel: function () {
                        return viewModel;
                    },
                    attributeViewModelBindings: attributeViewModelBindings,
                    initializeValues: true
                });
                if (dataBinding) {
                    if (dataBinding.onCompleteBinding) {
                        dataBinding.onCompleteBinding();
                    }
                    bindingInfos[attrName] = dataBinding.bindingInfo;
                    onTeardowns[attrName] = dataBinding.onTeardown;
                }
            }
        });
        return function () {
            for (var attrName in onTeardowns) {
                onTeardowns[attrName]();
            }
        };
    },
    data: function (el, attrData) {
        if (can.data(can.$(el), 'preventDataBindings')) {
            return;
        }
        var viewModel = can.viewModel(el), semaphore = {}, teardown;
        var dataBinding = makeDataBinding({
            name: attrData.attributeName,
            value: el.getAttribute(attrData.attributeName)
        }, el, {
            templateType: attrData.templateType,
            scope: attrData.scope,
            semaphore: semaphore,
            getViewModel: function () {
                return viewModel;
            }
        });
        if (dataBinding.onCompleteBinding) {
            dataBinding.onCompleteBinding();
        }
        teardown = dataBinding.onTeardown;
        can.one.call(el, 'removed', function () {
            teardown();
        });
        can.bind.call(el, 'attributes', function (ev) {
            var attrName = ev.attributeName, value = el.getAttribute(attrName);
            if (attrName === attrData.attributeName) {
                if (teardown) {
                    teardown();
                }
                if (value !== null) {
                    var dataBinding = makeDataBinding({
                        name: attrName,
                        value: value
                    }, el, {
                        templateType: attrData.templateType,
                        scope: attrData.scope,
                        semaphore: semaphore,
                        getViewModel: function () {
                            return viewModel;
                        },
                        initializeValues: true
                    });
                    if (dataBinding) {
                        if (dataBinding.onCompleteBinding) {
                            dataBinding.onCompleteBinding();
                        }
                        teardown = dataBinding.onTeardown;
                    }
                }
            }
        });
    },
    reference: function (el, attrData) {
        if (el.getAttribute(attrData.attributeName)) {
            console.warn('*reference attributes can only export the view model.');
        }
        var name = can.camelize(attrData.attributeName.substr(1).toLowerCase());
        var viewModel = can.viewModel(el);
        var refs = attrData.scope.getRefs();
        refs._context.attr('*' + name, viewModel);
    },
    event: function (el, data) {
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
    },
    value: function (el, data) {
        var propName = '$value', attrValue = can.trim(removeBrackets(el.getAttribute('can-value'))), getterSetter;
        if (el.nodeName.toLowerCase() === 'input' && (el.type === 'checkbox' || el.type === 'radio')) {
            var property = getComputeFrom.scope(el, data.scope, attrValue, {}, true);
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
        makeDataBinding({
            name: '{(' + propName + '})',
            value: attrValue
        }, el, {
            templateType: data.templateType,
            scope: data.scope,
            semaphore: {},
            initializeValues: true,
            legacyBindings: true,
            syncChildWithParent: true
        });
    }
};
can.view.attr(/^\{[^\}]+\}$/, behaviors.data);
can.view.attr(/\*[\w\.\-_]+/, behaviors.reference);
can.view.attr(/^\([\$?\w\.]+\)$/, behaviors.event);
can.view.attr(/can-[\w\.]+/, behaviors.event);
can.view.attr('can-value', behaviors.value);
var getComputeFrom = {
    scope: function (el, scope, scopeProp, bindingData, mustBeACompute, stickyCompute) {
        if (!scopeProp) {
            return can.compute();
        } else {
            if (mustBeACompute) {
                var parentExpression = expression.parse(scopeProp, { baseMethodType: 'Call' });
                return parentExpression.value(scope, new can.view.Options({}));
            } else {
                return function (newVal) {
                    scope.attr(cleanVMName(scopeProp), newVal);
                };
            }
        }
    },
    viewModel: function (el, scope, vmName, bindingData, mustBeACompute, stickyCompute) {
        var setName = cleanVMName(vmName);
        if (mustBeACompute) {
            return can.compute(function (newVal) {
                var viewModel = bindingData.getViewModel();
                if (arguments.length) {
                    viewModel.attr(setName, newVal);
                } else {
                    return vmName === '.' ? viewModel : can.compute.read(viewModel, can.compute.read.reads(vmName), {}).value;
                }
            });
        } else {
            return function (newVal) {
                bindingData.getViewModel().attr(setName, newVal);
            };
        }
    },
    attribute: function (el, scope, prop, bindingData, mustBeACompute, stickyCompute, event) {
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
        var hasChildren = el.nodeName.toLowerCase() === 'select', isMultiselectValue = prop === 'value' && hasChildren && el.multiple, isStringValue, lastSet, scheduledAsyncSet = false, timer, set = function (newVal) {
                if (hasChildren && !scheduledAsyncSet) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        set(newVal);
                    }, 1);
                }
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
                    if (!bindingData.legacyBindings && hasChildren && 'selectedIndex' in el && prop === 'value') {
                        can.attr.setSelectValue(el, newVal);
                    } else {
                        can.attr.setAttrOrProp(el, prop, newVal == null ? '' : newVal);
                    }
                }
                return newVal;
            }, get = function () {
                if (isMultiselectValue) {
                    var values = [], children = el.childNodes;
                    can.each(children, function (child) {
                        if (child.selected && child.value) {
                            values.push(child.value);
                        }
                    });
                    return isStringValue ? values.join(';') : values;
                } else if (hasChildren && 'selectedIndex' in el && el.selectedIndex === -1) {
                    return undefined;
                }
                return can.attr.get(el, prop);
            };
        if (hasChildren) {
            setTimeout(function () {
                scheduledAsyncSet = true;
            }, 1);
        }
        var observer;
        return can.compute(get(), {
            on: function (updater) {
                can.each(event, function (eventName) {
                    can.bind.call(el, eventName, updater);
                });
                if (hasChildren) {
                    var onMutation = function (mutations) {
                        if (stickyCompute) {
                            set(stickyCompute());
                        } else {
                            if (scheduledAsyncSet) {
                                updater();
                            }
                        }
                    };
                    if (can.attr.MutationObserver) {
                        observer = new can.attr.MutationObserver(onMutation);
                        observer.observe(el, {
                            childList: true,
                            subtree: true
                        });
                    } else {
                        can.data(can.$(el), 'canBindingCallback', { onMutation: onMutation });
                    }
                }
            },
            off: function (updater) {
                can.each(event, function (eventName) {
                    can.unbind.call(el, eventName, updater);
                });
                if (hasChildren) {
                    if (can.attr.MutationObserver) {
                        observer.disconnect();
                    } else {
                        can.data(can.$(el), 'canBindingCallback', null);
                    }
                }
            },
            get: get,
            set: set
        });
    }
};
var bind = {
    childToParent: function (el, parentCompute, childCompute, bindingsSemaphore, attrName, syncChild) {
        var parentUpdateIsFunction = typeof parentCompute === 'function';
        var updateParent = function (ev, newVal) {
            if (!bindingsSemaphore[attrName]) {
                if (parentUpdateIsFunction) {
                    parentCompute(newVal);
                    if (syncChild) {
                        if (parentCompute() !== childCompute()) {
                            bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                            childCompute(parentCompute());
                            can.batch.after(function () {
                                --bindingsSemaphore[attrName];
                            });
                        }
                    }
                } else if (parentCompute instanceof can.Map) {
                    parentCompute.attr(newVal, true);
                }
            }
        };
        if (childCompute && childCompute.isComputed) {
            childCompute.bind('change', updateParent);
        }
        return updateParent;
    },
    parentToChild: function (el, parentCompute, childUpdate, bindingsSemaphore, attrName) {
        var updateChild = function (ev, newValue) {
            bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
            childUpdate(newValue);
            can.batch.after(function () {
                --bindingsSemaphore[attrName];
            });
        };
        if (parentCompute && parentCompute.isComputed) {
            parentCompute.bind('change', updateChild);
        }
        return updateChild;
    }
};
var getBindingInfo = function (node, attributeViewModelBindings, templateType, tagName) {
    var attributeName = node.name, attributeValue = node.value || '';
    var matches = attributeName.match(bindingsRegExp);
    if (!matches) {
        var ignoreAttribute = ignoreAttributesRegExp.test(attributeName);
        var vmName = can.camelize(attributeName);
        if (ignoreAttribute || viewCallbacks.attr(attributeName)) {
            return;
        }
        var syntaxRight = attributeValue[0] === '{' && can.last(attributeValue) === '}';
        var isAttributeToChild = templateType === 'legacy' ? attributeViewModelBindings[vmName] : !syntaxRight;
        var scopeName = syntaxRight ? attributeValue.substr(1, attributeValue.length - 2) : attributeValue;
        if (isAttributeToChild) {
            return {
                bindingAttributeName: attributeName,
                parent: 'attribute',
                parentName: attributeName,
                child: 'viewModel',
                childName: vmName,
                parentToChild: true,
                childToParent: true
            };
        } else {
            return {
                bindingAttributeName: attributeName,
                parent: 'scope',
                parentName: scopeName,
                child: 'viewModel',
                childName: vmName,
                parentToChild: true,
                childToParent: true
            };
        }
    }
    var twoWay = !!matches[1], childToParent = twoWay || !!matches[2], parentToChild = twoWay || !childToParent;
    var childName = matches[3];
    var isDOM = childName.charAt(0) === '$';
    if (isDOM) {
        var bindingInfo = {
            parent: 'scope',
            child: 'attribute',
            childToParent: childToParent,
            parentToChild: parentToChild,
            bindingAttributeName: attributeName,
            childName: childName.substr(1),
            parentName: attributeValue,
            initializeValues: true
        };
        if (tagName === 'select' && !childToParent) {
            bindingInfo.stickyParentToChild = true;
        }
        return bindingInfo;
    } else {
        return {
            parent: 'scope',
            child: 'viewModel',
            childToParent: childToParent,
            parentToChild: parentToChild,
            bindingAttributeName: attributeName,
            childName: can.camelize(childName),
            parentName: attributeValue,
            initializeValues: true
        };
    }
};
var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/, ignoreAttributesRegExp = /^(data-view-id|class|id|\[[\w\.-]+\]|#[\w\.-])$/i;
var makeDataBinding = function (node, el, bindingData) {
    var bindingInfo = getBindingInfo(node, bindingData.attributeViewModelBindings, bindingData.templateType, el.nodeName.toLowerCase());
    if (!bindingInfo) {
        return;
    }
    bindingInfo.alreadyUpdatedChild = bindingData.alreadyUpdatedChild;
    if (bindingData.initializeValues) {
        bindingInfo.initializeValues = true;
    }
    var parentCompute = getComputeFrom[bindingInfo.parent](el, bindingData.scope, bindingInfo.parentName, bindingData, bindingInfo.parentToChild), childCompute = getComputeFrom[bindingInfo.child](el, bindingData.scope, bindingInfo.childName, bindingData, bindingInfo.childToParent, bindingInfo.stickyParentToChild && parentCompute), updateParent, updateChild, childLifecycle;
    if (bindingInfo.parentToChild) {
        updateChild = bind.parentToChild(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName);
    }
    var completeBinding = function () {
        if (bindingInfo.childToParent) {
            updateParent = bind.childToParent(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName, bindingData.syncChildWithParent);
        } else if (bindingInfo.stickyParentToChild) {
            childCompute.bind('change', childLifecycle = can.k);
        }
        if (bindingInfo.initializeValues) {
            initializeValues(bindingInfo, childCompute, parentCompute, updateChild, updateParent);
        }
    };
    var onTeardown = function () {
        unbindUpdate(parentCompute, updateChild);
        unbindUpdate(childCompute, updateParent);
        unbindUpdate(childCompute, childLifecycle);
    };
    if (bindingInfo.child === 'viewModel') {
        return {
            value: getValue(parentCompute),
            onCompleteBinding: completeBinding,
            bindingInfo: bindingInfo,
            onTeardown: onTeardown
        };
    } else {
        completeBinding();
        return {
            bindingInfo: bindingInfo,
            onTeardown: onTeardown
        };
    }
};
var initializeValues = function (bindingInfo, childCompute, parentCompute, updateChild, updateParent) {
    var doUpdateParent = false;
    if (bindingInfo.parentToChild && !bindingInfo.childToParent) {
    } else if (!bindingInfo.parentToChild && bindingInfo.childToParent) {
        doUpdateParent = true;
    } else if (getValue(childCompute) === undefined) {
    } else if (getValue(parentCompute) === undefined) {
        doUpdateParent = true;
    }
    if (doUpdateParent) {
        updateParent({}, getValue(childCompute));
    } else {
        if (!bindingInfo.alreadyUpdatedChild) {
            updateChild({}, getValue(parentCompute));
        }
    }
};
if (!can.attr.MutationObserver) {
    var updateSelectValue = function (el) {
        var bindingCallback = can.data(can.$(el), 'canBindingCallback');
        if (bindingCallback) {
            bindingCallback.onMutation(el);
        }
    };
    live.registerChildMutationCallback('select', updateSelectValue);
    live.registerChildMutationCallback('optgroup', function (el) {
        updateSelectValue(el.parentNode);
    });
}
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
    }, getValue = function (value) {
        return value && value.isComputed ? value() : value;
    }, unbindUpdate = function (compute, updateOther) {
        if (compute && compute.isComputed && typeof updateOther === 'function') {
            compute.unbind('change', updateOther);
        }
    }, cleanVMName = function (name) {
        return name.replace(/@/g, '');
    };
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
can.bindings = {
    behaviors: behaviors,
    getBindingInfo: getBindingInfo,
    special: special
};
module.exports = can.bindings;