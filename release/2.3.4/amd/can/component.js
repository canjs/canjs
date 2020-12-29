/*!
 * CanJS - 2.3.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 02 Dec 2015 22:49:52 GMT
 * Licensed MIT
 */

/*can@2.3.4#component/component*/
define([
    'can/util/library',
    'can/view/callbacks',
    'can/elements',
    'can/view/bindings',
    'can/control',
    'can/observe',
    'can/view/mustache',
    'can/util/view_model'
], function (can, viewCallbacks, elements, bindings) {
    var paramReplacer = /\{([^\}]+)\}/g;
    var Component = can.Component = can.Construct.extend({
            setup: function () {
                can.Construct.setup.apply(this, arguments);
                if (can.Component) {
                    var self = this, protoViewModel = this.prototype.scope || this.prototype.viewModel;
                    this.Control = ComponentControl.extend(this.prototype.events);
                    if (!protoViewModel || typeof protoViewModel === 'object' && !(protoViewModel instanceof can.Map)) {
                        this.Map = can.Map.extend(protoViewModel || {});
                    } else if (protoViewModel.prototype instanceof can.Map) {
                        this.Map = protoViewModel;
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
                var initialViewModelData = { '%root': componentTagData.scope.attr('%root') }, component = this, lexicalContent = (typeof this.leakScope === 'undefined' ? false : !this.leakScope) && !!this.template, viewModel, frag, teardownFunctions = [], callTeardownFunctions = function () {
                        for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                            teardownFunctions[i]();
                        }
                    }, $el = can.$(el), setupBindings = !can.data($el, 'preventDataBindings');
                can.each(this.constructor.attributeScopeMappings, function (val, prop) {
                    initialViewModelData[prop] = el.getAttribute(can.hyphenate(val));
                });
                if (setupBindings) {
                    teardownFunctions.push(bindings.behaviors.viewModel(el, componentTagData, function (initialViewModelData) {
                        var protoViewModel = component.scope || component.viewModel;
                        if (component.constructor.Map) {
                            viewModel = new component.constructor.Map(initialViewModelData);
                        } else if (protoViewModel instanceof can.Map) {
                            viewModel = protoViewModel;
                        } else if (can.isFunction(protoViewModel)) {
                            var scopeResult = protoViewModel.call(component, initialViewModelData, componentTagData.scope, el);
                            if (scopeResult instanceof can.Map) {
                                viewModel = scopeResult;
                            } else if (scopeResult.prototype instanceof can.Map) {
                                viewModel = new scopeResult(initialViewModelData);
                            } else {
                                viewModel = new (can.Map.extend(scopeResult))(initialViewModelData);
                            }
                        }
                        return viewModel;
                    }, initialViewModelData));
                }
                this.scope = this.viewModel = viewModel;
                can.data($el, 'scope', this.viewModel);
                can.data($el, 'viewModel', this.viewModel);
                can.data($el, 'preventDataBindings', true);
                var shadowScope;
                if (lexicalContent) {
                    shadowScope = can.view.Scope.refsScope().add(this.viewModel, { viewModel: true });
                } else {
                    shadowScope = (this.constructor.renderer ? componentTagData.scope.add(new can.view.Scope.Refs()) : componentTagData.scope).add(this.viewModel, { viewModel: true });
                }
                var options = { helpers: {} }, addHelper = function (name, fn) {
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
                    addHelper(prop, can.view.simpleHelper(val));
                });
                this._control = new this.constructor.Control(el, {
                    scope: this.viewModel,
                    viewModel: this.viewModel,
                    destroy: callTeardownFunctions
                });
                var nodeList = can.view.nodeLists.register([], undefined, componentTagData.parentNodeList || true, false);
                nodeList.expression = '<' + this.tag + '>';
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
                                    delegate = options.viewModel;
                                    return '';
                                }
                                key = key.replace(/^(scope|^viewModel)\./, '');
                                value = can.compute.read(options.viewModel, can.compute.read.reads(key), { isArgument: true }).value;
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