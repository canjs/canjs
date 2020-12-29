/*!
 * CanJS - 2.3.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 23 Oct 2015 20:30:08 GMT
 * Licensed MIT
 */

/*can@2.3.0#component/component*/
steal('can/util', 'can/view/callbacks', 'can/view/elements.js', 'can/view/bindings', 'can/control', 'can/observe', 'can/view/mustache', 'can/util/view_model', function (can, viewCallbacks, elements, bindings) {
    var ignoreAttributesRegExp = /^(dataViewId|class|id|\[[\w\.-]+\]|#[\w\.-])$/i, paramReplacer = /\{([^\}]+)\}/g;
    var Component = can.Component = can.Construct.extend({
            setup: function () {
                can.Construct.setup.apply(this, arguments);
                if (can.Component) {
                    var self = this, scope = this.prototype.scope || this.prototype.viewModel;
                    this.Control = ComponentControl.extend(this.prototype.events);
                    if (!scope || typeof scope === 'object' && !(scope instanceof can.Map)) {
                        this.Map = can.Map.extend(scope || {});
                    } else if (scope.prototype instanceof can.Map) {
                        this.Map = scope;
                    }
                    this.attributeScopeMappings = {};
                    can.each(this.Map ? this.Map.defaults : {}, function (val, prop) {
                        if (val === '@') {
                            self.attributeScopeMappings[prop] = prop;
                        }
                    });
                    if (this.prototype.template) {
                        if (typeof this.prototype.template === 'function') {
                            var temp = this.prototype.template;
                            this.renderer = function () {
                                return can.view.frag(temp.apply(null, arguments));
                            };
                        } else {
                            this.renderer = can.view.mustache(this.prototype.template);
                        }
                    }
                    can.view.tag(this.prototype.tag, function (el, options) {
                        new self(el, options);
                    });
                }
            }
        }, {
            setup: function (el, componentTagData) {
                var initialScopeData = { '%root': componentTagData.scope.attr('%root') }, component = this, lexicalContent = (typeof this.leakScope === 'undefined' ? false : !this.leakScope) && !!this.template, bindingsData = {}, scope = this.scope || this.viewModel, viewModelPropertyUpdates = {}, viewModel, frag, teardownFunctions = [], callTeardownFunctions = function () {
                        for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                            teardownFunctions[i]();
                        }
                    }, $el = can.$(el);
                can.each(this.constructor.attributeScopeMappings, function (val, prop) {
                    initialScopeData[prop] = el.getAttribute(can.hyphenate(val));
                });
                can.each(can.makeArray(el.attributes), function (node, index) {
                    var nodeName = node.name, name = can.camelize(nodeName.toLowerCase()), value = node.value;
                    if (ignoreAttributesRegExp.test(name) && value[0] === '{' && value[value.length - 1] === '}') {
                        can.dev.warn('can/component: looks like you\'re trying to pass ' + name + ' as an attribute into a component, ' + 'but it is not a supported attribute');
                    }
                    var isDataBindings = bindings.dataBindingsRegExp.test(nodeName);
                    if (component.constructor.attributeScopeMappings[name] || ignoreAttributesRegExp.test(name) || viewCallbacks.attr(nodeName) && !isDataBindings) {
                        return;
                    }
                    if (value[0] === '{' && value[value.length - 1] === '}') {
                        value = value.substr(1, value.length - 2);
                    } else if (!isDataBindings) {
                        if (componentTagData.templateType !== 'legacy') {
                            initialScopeData[name] = value;
                            return;
                        }
                    }
                    var bindingData = bindings.attributeNameInfo(nodeName);
                    bindingData.propName = can.camelize(bindingData.propName);
                    bindingsData[bindingData.propName] = bindingData;
                    var compute = bindings.getParentCompute(el, componentTagData.scope, value, {});
                    if (compute && compute.isComputed) {
                        if (bindingData.parentToChild) {
                            bindings.bindParentToChild(el, compute, function (newValue) {
                                viewModel.attr(bindingData.propName, newValue);
                            }, viewModelPropertyUpdates, bindingData.propName);
                            var initialValue = compute();
                            if (initialValue !== undefined) {
                                initialScopeData[bindingData.propName] = initialValue;
                            }
                        }
                        bindingsData[bindingData.propName].parentCompute = compute;
                    } else {
                        initialScopeData[bindingData.propName] = compute;
                    }
                });
                if (this.constructor.Map) {
                    viewModel = new this.constructor.Map(initialScopeData);
                } else if (scope instanceof can.Map) {
                    viewModel = scope;
                } else if (can.isFunction(scope)) {
                    var scopeResult = scope.call(this, initialScopeData, componentTagData.scope, el);
                    if (scopeResult instanceof can.Map) {
                        viewModel = scopeResult;
                    } else if (scopeResult.prototype instanceof can.Map) {
                        viewModel = new scopeResult(initialScopeData);
                    } else {
                        viewModel = new (can.Map.extend(scopeResult))(initialScopeData);
                    }
                }
                var handlers = {};
                can.each(bindingsData, function (bindingData, prop) {
                    if (bindingData.childToParent) {
                        handlers[prop] = function (ev, newVal) {
                            if (!viewModelPropertyUpdates[prop]) {
                                bindingData.parentCompute(newVal);
                            }
                        };
                        viewModel.bind(prop, handlers[prop]);
                        if (bindingData.parentCompute) {
                            bindings.initializeValues(bindingData, prop === '.' ? viewModel : viewModel.attr(prop), bindingData.parentCompute, function () {
                            }, function (ev, newVal) {
                                bindingData.parentCompute(newVal);
                            });
                        }
                    }
                });
                if (!can.isEmptyObject(this.constructor.attributeScopeMappings) || componentTagData.templateType !== 'legacy') {
                    can.bind.call(el, 'attributes', function (ev) {
                        var camelized = can.camelize(ev.attributeName);
                        if (!bindingsData[camelized] && !ignoreAttributesRegExp.test(camelized)) {
                            viewModel.attr(camelized, el.getAttribute(ev.attributeName));
                        }
                    });
                }
                this.scope = this.viewModel = viewModel;
                can.data($el, 'scope', this.scope);
                can.data($el, 'viewModel', this.scope);
                can.data($el, 'preventDataBindings', true);
                var shadowScope = (lexicalContent ? can.view.Scope.refsScope() : componentTagData.scope.add(new can.view.Scope.Refs())).add(this.scope, { viewModel: true }), options = { helpers: {} }, addHelper = function (name, fn) {
                        options.helpers[name] = function () {
                            return fn.apply(viewModel, arguments);
                        };
                    };
                can.each(this.helpers || {}, function (val, prop) {
                    if (can.isFunction(val)) {
                        addHelper(prop, val);
                    }
                });
                can.each(this.simpleHelpers || {}, function (val, prop) {
                    if (options.helpers[prop]) {
                        can.dev.warn('Component ' + component.tag + ' already has a helper called ' + prop);
                    }
                    addHelper(prop, can.view.simpleHelper(val));
                });
                teardownFunctions.push(function () {
                    can.each(handlers, function (handler, prop) {
                        viewModel.unbind(prop, handlers[prop]);
                    });
                });
                this._control = new this.constructor.Control(el, {
                    scope: this.scope,
                    viewModel: this.scope,
                    destroy: callTeardownFunctions
                });
                var nodeList = can.view.nodeLists.register([], undefined, true);
                teardownFunctions.push(function () {
                    can.view.nodeLists.unregister(nodeList);
                });
                if (this.constructor.renderer) {
                    if (!options.tags) {
                        options.tags = {};
                    }
                    options.tags.content = function contentHookup(el, contentTagData) {
                        var subtemplate = componentTagData.subtemplate || contentTagData.subtemplate, renderingLightContent = subtemplate === componentTagData.subtemplate;
                        if (subtemplate) {
                            delete options.tags.content;
                            var lightTemplateData;
                            if (renderingLightContent) {
                                if (lexicalContent) {
                                    lightTemplateData = componentTagData;
                                } else {
                                    lightTemplateData = {
                                        scope: contentTagData.scope.cloneFromRef(),
                                        options: contentTagData.options
                                    };
                                }
                            } else {
                                lightTemplateData = contentTagData;
                            }
                            lightTemplateData.scope = lightTemplateData.scope.add(viewModel, {
                                'protected': true,
                                viewModel: true
                            });
                            if (contentTagData.parentNodeList) {
                                var frag = subtemplate(lightTemplateData.scope, lightTemplateData.options, contentTagData.parentNodeList);
                                elements.replace([el], frag);
                            } else {
                                can.view.live.replace([el], subtemplate(lightTemplateData.scope, lightTemplateData.options));
                            }
                            options.tags.content = contentHookup;
                        }
                    };
                    frag = this.constructor.renderer(shadowScope, componentTagData.options.add(options), nodeList);
                } else {
                    if (componentTagData.templateType === 'legacy') {
                        frag = can.view.frag(componentTagData.subtemplate ? componentTagData.subtemplate(shadowScope, componentTagData.options.add(options)) : '');
                    } else {
                        frag = componentTagData.subtemplate ? componentTagData.subtemplate(shadowScope, componentTagData.options.add(options), nodeList) : document.createDocumentFragment();
                    }
                }
                can.appendChild(el, frag, can.document);
                can.view.nodeLists.update(nodeList, can.childNodes(el));
            }
        });
    var ComponentControl = can.Control.extend({
            _lookup: function (options) {
                return [
                    options.scope,
                    options,
                    window
                ];
            },
            _action: function (methodName, options, controlInstance) {
                var hasObjectLookup, readyCompute;
                paramReplacer.lastIndex = 0;
                hasObjectLookup = paramReplacer.test(methodName);
                if (!controlInstance && hasObjectLookup) {
                    return;
                } else if (!hasObjectLookup) {
                    return can.Control._action.apply(this, arguments);
                } else {
                    readyCompute = can.compute(function () {
                        var delegate;
                        var name = methodName.replace(paramReplacer, function (matched, key) {
                                var value;
                                if (key === 'scope' || key === 'viewModel') {
                                    delegate = options.scope;
                                    return '';
                                }
                                key = key.replace(/^(scope|^viewModel)\./, '');
                                value = can.compute.read(options.scope, can.compute.read.reads(key), { isArgument: true }).value;
                                if (value === undefined) {
                                    value = can.getObject(key);
                                }
                                if (typeof value === 'string') {
                                    return value;
                                } else {
                                    delegate = value;
                                    return '';
                                }
                            });
                        var parts = name.split(/\s+/g), event = parts.pop();
                        return {
                            processor: this.processors[event] || this.processors.click,
                            parts: [
                                name,
                                parts.join(' '),
                                event
                            ],
                            delegate: delegate || undefined
                        };
                    }, this);
                    var handler = function (ev, ready) {
                        controlInstance._bindings.control[methodName](controlInstance.element);
                        controlInstance._bindings.control[methodName] = ready.processor(ready.delegate || controlInstance.element, ready.parts[2], ready.parts[1], methodName, controlInstance);
                    };
                    readyCompute.bind('change', handler);
                    controlInstance._bindings.readyComputes[methodName] = {
                        compute: readyCompute,
                        handler: handler
                    };
                    return readyCompute();
                }
            }
        }, {
            setup: function (el, options) {
                this.scope = options.scope;
                this.viewModel = options.viewModel;
                return can.Control.prototype.setup.call(this, el, options);
            },
            off: function () {
                if (this._bindings) {
                    can.each(this._bindings.readyComputes || {}, function (value) {
                        value.compute.unbind('change', value.handler);
                    });
                }
                can.Control.prototype.off.apply(this, arguments);
                this._bindings.readyComputes = {};
            },
            destroy: function () {
                can.Control.prototype.destroy.apply(this, arguments);
                if (typeof this.options.destroy === 'function') {
                    this.options.destroy.apply(this, arguments);
                }
            }
        });
    var $ = can.$;
    if ($.fn) {
        $.fn.scope = $.fn.viewModel = function () {
            return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
        };
    }
    return Component;
});