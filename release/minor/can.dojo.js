/*!
 * CanJS - 2.1.0-pre
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Tue, 08 Apr 2014 17:31:42 GMT
 * Licensed MIT
 * Includes: can/component,can/construct,can/map,can/list,can/observe,can/compute,can/model,can/view,can/control,can/route,can/control/route,can/view/mustache,can/view/bindings,can/view/live,can/view/scope,can/util/string,can/util/attr
 * Download from: http://canjs.com
 */
(function(undefined) {

    // ## util/can.js
    var __m3 = (function() {

        var can = window.can || {};
        if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
            window.can = can;
        }

        // An empty function useful for where you need a dummy callback.
        can.k = function() {};

        can.isDeferred = function(obj) {
            var isFunction = this.isFunction;
            // Returns `true` if something looks like a deferred.
            return obj && isFunction(obj.then) && isFunction(obj.pipe);
        };

        var cid = 0;
        can.cid = function(object, name) {
            if (!object._cid) {
                cid++;
                object._cid = (name || '') + cid;
            }
            return object._cid;
        };
        can.VERSION = '2.1.0-pre';

        can.simpleExtend = function(d, s) {
            for (var prop in s) {
                d[prop] = s[prop];
            }
            return d;
        };

        can.frag = function(item) {
            var frag;
            if (!item || typeof item === "string") {
                frag = can.buildFragment(item == null ? "" : "" + item, document.body);
                // If we have an empty frag...
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(''));
                }
                return frag;
            } else if (item.nodeType === 11) {
                return item;
            } else if (typeof item.nodeType === "number") {
                frag = document.createDocumentFragment();
                frag.appendChild(item);
                return frag;
            } else if (typeof item.length === "number") {
                frag = document.createDocumentFragment();
                can.each(item, function(item) {
                    frag.appendChild(can.frag(item));
                });
                return frag;
            } else {
                frag = can.buildFragment("" + item, document.body);
                // If we have an empty frag...
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(''));
                }
                return frag;
            }
        };

        // this is here in case can.compute hasn't loaded
        can.__reading = function() {};

        return can;
    })();

    // ## util/attr/attr.js
    var __m4 = (function(can) {

        // # can/util/attr
        // Contains helpers for dealing with element attributes.

        var setImmediate = window.setImmediate || function(cb) {
                return setTimeout(cb, 0);
            },
            attr = {
                // Keep a reference to MutationObserver because we need to trigger
                // events for browsers that do not support it.
                MutationObserver: window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,


                map: {
                    "class": "className",
                    "value": "value",
                    "innerText": "innerText",
                    "textContent": "textContent",
                    "checked": true,
                    "disabled": true,
                    "readonly": true,
                    "required": true,
                    // setter function for the src attribute
                    src: function(el, val) {
                        if (val == null || val === "") {
                            el.removeAttribute("src");
                            return null;
                        } else {
                            el.setAttribute("src", val);
                            return val;
                        }
                    },
                    // setter function for a style attribute
                    style: function(el, val) {
                        return el.style.cssText = val || "";
                    }
                },
                // Elements whos default value we should set
                defaultValue: ["input", "textarea"],
                // ## attr.set
                // Set the value an attribute on an element
                set: function(el, attrName, val) {
                    var oldValue;
                    if (!attr.MutationObserver) {
                        // Get the current value
                        oldValue = attr.get(el, attrName);
                    }

                    var tagName = el.nodeName.toString()
                        .toLowerCase(),
                        prop = attr.map[attrName],
                        newValue;
                    // if this is a special property call the setter
                    if (typeof prop === "function") {
                        newValue = prop(el, val);
                    } else if (prop === true) {
                        newValue = el[attrName] = true;

                        if (attrName === "checked" && el.type === "radio") {
                            if (can.inArray(tagName, attr.defaultValue) >= 0) {
                                el.defaultChecked = true;
                            }
                        }

                    } else if (prop) {
                        // set the value as true / false
                        newValue = el[prop] = val;
                        if (prop === "value" && can.inArray(tagName, attr.defaultValue) >= 0) {
                            el.defaultValue = val;
                        }
                    } else {
                        el.setAttribute(attrName, val);
                        newValue = val;
                    }
                    if (!attr.MutationObserver && newValue !== oldValue) {
                        attr.trigger(el, attrName, oldValue);
                    }
                },
                // ## attr.trigger
                // Trigger an "attributes" event on an element
                trigger: function(el, attrName, oldValue) {
                    // Only trigger if someone has bound
                    if (can.data(can.$(el), "canHasAttributesBindings")) {
                        // Queue up a function to be called
                        return setImmediate(function() {
                            can.trigger(el, {
                                    type: "attributes",
                                    attributeName: attrName,
                                    target: el,
                                    oldValue: oldValue,
                                    bubbles: false
                                }, []);
                        });
                    }
                },
                // ## attr.get
                // Gets the value of an attribute.
                get: function(el, attrName) {
                    // Default to a blank string for IE7/8
                    // Try to get the attribute from the element before
                    // using `getAttribute`
                    return (attr.map[attrName] && el[attr.map[attrName]] ?
                        el[attr.map[attrName]] :
                        el.getAttribute(attrName));
                },
                // ## attr.remove
                // Removes the attribute.
                remove: function(el, attrName) {
                    var oldValue;
                    if (!attr.MutationObserver) {
                        oldValue = attr.get(el, attrName);
                    }

                    var setter = attr.map[attrName];
                    // A special type of attribute, call the function
                    if (typeof setter === "function") {
                        setter(el, undefined);
                    }
                    if (setter === true) {
                        el[attrName] = false;
                    } else if (typeof setter === "string") {
                        el[setter] = "";
                    } else {
                        el.removeAttribute(attrName);
                    }
                    if (!attr.MutationObserver && oldValue != null) {
                        // Trigger that the attribute has changed
                        attr.trigger(el, attrName, oldValue);
                    }

                },
                // ## attr.has
                has: (function() {
                    // Use hasAttribute if the browser supports it,
                    // otherwise check that the attribute's value is not null
                    var el = document.createElement('div');
                    if (el.hasAttribute) {
                        return function(el, name) {
                            return el.hasAttribute(name);
                        };
                    } else {
                        return function(el, name) {
                            return el.getAttribute(name) !== null;
                        };
                    }
                })()
            };

        return attr;

    })(__m3);

    // ## util/event.js
    var __m6 = (function(can) {
        // event.js
        // ---------
        // _Basic event wrapper._
        can.addEvent = function(event, fn) {
            var allEvents = this.__bindEvents || (this.__bindEvents = {}),
                eventList = allEvents[event] || (allEvents[event] = []);
            eventList.push({
                    handler: fn,
                    name: event
                });
            return this;
        };
        // can.listenTo works without knowing how bind works
        // the API was heavily influenced by BackboneJS: 
        // http://backbonejs.org/
        can.listenTo = function(other, event, handler) {
            var idedEvents = this.__listenToEvents;
            if (!idedEvents) {
                idedEvents = this.__listenToEvents = {};
            }
            var otherId = can.cid(other);
            var othersEvents = idedEvents[otherId];
            if (!othersEvents) {
                othersEvents = idedEvents[otherId] = {
                    obj: other,
                    events: {}
                };
            }
            var eventsEvents = othersEvents.events[event];
            if (!eventsEvents) {
                eventsEvents = othersEvents.events[event] = [];
            }
            eventsEvents.push(handler);
            can.bind.call(other, event, handler);
        };
        can.stopListening = function(other, event, handler) {
            var idedEvents = this.__listenToEvents,
                iterIdedEvents = idedEvents,
                i = 0;
            if (!idedEvents) {
                return this;
            }
            if (other) {
                var othercid = can.cid(other);
                (iterIdedEvents = {})[othercid] = idedEvents[othercid];
                // you might be trying to listen to something that is not there
                if (!idedEvents[othercid]) {
                    return this;
                }
            }
            for (var cid in iterIdedEvents) {
                var othersEvents = iterIdedEvents[cid],
                    eventsEvents;
                other = idedEvents[cid].obj;
                if (!event) {
                    eventsEvents = othersEvents.events;
                } else {
                    (eventsEvents = {})[event] = othersEvents.events[event];
                }
                for (var eventName in eventsEvents) {
                    var handlers = eventsEvents[eventName] || [];
                    i = 0;
                    while (i < handlers.length) {
                        if (handler && handler === handlers[i] || !handler) {
                            can.unbind.call(other, eventName, handlers[i]);
                            handlers.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                    // no more handlers?
                    if (!handlers.length) {
                        delete othersEvents.events[eventName];
                    }
                }
                if (can.isEmptyObject(othersEvents.events)) {
                    delete idedEvents[cid];
                }
            }
            return this;
        };
        can.removeEvent = function(event, fn) {
            if (!this.__bindEvents) {
                return this;
            }
            var events = this.__bindEvents[event] || [],
                i = 0,
                ev, isFunction = typeof fn === 'function';
            while (i < events.length) {
                ev = events[i];
                if (isFunction && ev.handler === fn || !isFunction && ev.cid === fn) {
                    events.splice(i, 1);
                } else {
                    i++;
                }
            }
            return this;
        };
        can.dispatch = function(event, args) {
            var events = this.__bindEvents;
            if (!events) {
                return;
            }
            if (typeof event === 'string') {
                event = {
                    type: event
                };
            }
            var eventName = event.type,
                handlers = (events[eventName] || []).slice(0);

            args = [event].concat(args || []);
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].handler.apply(this, args);
            }
        };
        return can;
    })(__m3);

    // ## util/fragment.js
    var __m7 = (function(can) {
        // fragment.js
        // ---------
        // _DOM Fragment support._
        var fragmentRE = /^\s*<(\w+)[^>]*>/,
            fragment = function(html, name) {
                if (name === undefined) {
                    name = fragmentRE.test(html) && RegExp.$1;
                }
                if (html && can.isFunction(html.replace)) {
                    // Fix "XHTML"-style tags in all browsers
                    html = html.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, '<$1></$2>');
                }
                var container = document.createElement('div'),
                    temp = document.createElement('div');
                // IE's parser will strip any `<tr><td>` tags when `innerHTML`
                // is called on a `tbody`. To get around this, we construct a 
                // valid table with a `tbody` that has the `innerHTML` we want. 
                // Then the container is the `firstChild` of the `tbody`.
                // [source](http://www.ericvasilik.com/2006/07/code-karma.html).
                if (name === 'tbody' || name === 'tfoot' || name === 'thead') {
                    temp.innerHTML = '<table>' + html + '</table>';
                    container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
                } else if (name === 'tr') {
                    temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                    container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
                } else if (name === 'td' || name === 'th') {
                    temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
                    container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild.firstChild;
                } else if (name === 'option') {
                    temp.innerHTML = '<select>' + html + '</select>';
                    container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
                } else {
                    container.innerHTML = '' + html;
                }
                // IE8 barfs if you pass slice a `childNodes` object, so make a copy.
                var tmp = {}, children = container.childNodes;
                tmp.length = children.length;
                for (var i = 0; i < children.length; i++) {
                    tmp[i] = children[i];
                }
                return [].slice.call(tmp);
            };
        can.buildFragment = function(html, nodes) {
            var parts = fragment(html),
                frag = document.createDocumentFragment();
            can.each(parts, function(part) {
                frag.appendChild(part);
            });
            return frag;
        };
        return can;
    })(__m3);

    // ## util/array/each.js
    var __m8 = (function(can) {

        // The following is from jQuery
        var isArrayLike = function(obj) {
            var length = obj.length;
            return typeof arr !== "function" &&
            (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);
        };

        can.each = function(elements, callback, context) {
            var i = 0,
                key;
            if (elements) {
                if (isArrayLike(elements)) {
                    if (elements.attr) {
                        elements.attr('length');
                    }
                    for (key = elements.length; i < key; i++) {
                        if (callback.call(context || elements[i], elements[i], i, elements) === false) {
                            break;
                        }
                    }
                } else if (elements.hasOwnProperty) {
                    if (can.Map && elements instanceof can.Map) {
                        if (can.__reading) {
                            can.__reading(elements, '__keys');
                        }
                        elements = elements.__get();
                    }
                    for (key in elements) {
                        if (elements.hasOwnProperty(key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                            break;
                        }
                    }
                }
            }
            return elements;
        };
        return can;
    })(__m3);

    // ## util/object/isplain/isplain.js
    var __m9 = (function(can) {
        var core_hasOwn = Object.prototype.hasOwnProperty,
            isWindow = function(obj) {
                // In IE8 window.window !== window.window, so we allow == here.

                return obj !== null && obj == obj.window;
            }, isPlainObject = function(obj) {
                // Must be an Object.
                // Because of IE, we also have to check the presence of the constructor property.
                // Make sure that DOM nodes and window objects don't pass through, as well
                if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
                    return false;
                }
                try {
                    // Not own constructor property must be Object
                    if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                        return false;
                    }
                } catch (e) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return false;
                }
                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.
                var key;
                for (key in obj) {}
                return key === undefined || core_hasOwn.call(obj, key);
            };
        can.isPlainObject = isPlainObject;
        return can;
    })(__m3);

    // ## util/deferred.js
    var __m10 = (function(can) {
        // deferred.js
        // ---------
        // _Lightweight, jQuery style deferreds._
        // extend is usually provided by the wrapper but to avoid steal.then calls
        // we define a simple extend here as well
        var extend = function(target, src) {
            for (var key in src) {
                if (src.hasOwnProperty(key)) {
                    target[key] = src[key];
                }
            }
        }, Deferred = function(func) {
                if (!(this instanceof Deferred)) {
                    return new Deferred();
                }
                this._doneFuncs = [];
                this._failFuncs = [];
                this._resultArgs = null;
                this._status = '';
                // Check for option `function` -- call it with this as context and as first
                // parameter, as specified in jQuery API.
                if (func) {
                    func.call(this, this);
                }
            };
        can.Deferred = Deferred;
        can.when = Deferred.when = function() {
            var args = can.makeArray(arguments);
            if (args.length < 2) {
                var obj = args[0];
                if (obj && (can.isFunction(obj.isResolved) && can.isFunction(obj.isRejected))) {
                    return obj;
                } else {
                    return Deferred()
                        .resolve(obj);
                }
            } else {
                var df = Deferred(),
                    done = 0,
                    // Resolve params -- params of each resolve, we need to track them down 
                    // to be able to pass them in the correct order if the master 
                    // needs to be resolved.
                    rp = [];
                can.each(args, function(arg, j) {
                    arg.done(function() {
                        rp[j] = arguments.length < 2 ? arguments[0] : arguments;
                        if (++done === args.length) {
                            df.resolve.apply(df, rp);
                        }
                    })
                        .fail(function() {
                            df.reject(arguments.length === 1 ? arguments[0] : arguments);
                        });
                });
                return df;
            }
        };
        var resolveFunc = function(type, _status) {
            return function(context) {
                var args = this._resultArgs = arguments.length > 1 ? arguments[1] : [];
                return this.exec(context, this[type], args, _status);
            };
        }, doneFunc = function doneFunc(type, _status) {
                return function() {
                    var self = this;
                    // In Safari, the properties of the `arguments` object are not enumerable, 
                    // so we have to convert arguments to an `Array` that allows `can.each` to loop over them.
                    can.each(Array.prototype.slice.call(arguments), function(v, i, args) {
                        if (!v) {
                            return;
                        }
                        if (v.constructor === Array) {
                            doneFunc.apply(self, v);
                        } else {
                            // Immediately call the `function` if the deferred has been resolved.
                            if (self._status === _status) {
                                v.apply(self, self._resultArgs || []);
                            }
                            self[type].push(v);
                        }
                    });
                    return this;
                };
            };
        extend(Deferred.prototype, {
                pipe: function(done, fail) {
                    var d = can.Deferred();
                    this.done(function() {
                        d.resolve(done.apply(this, arguments));
                    });
                    this.fail(function() {
                        if (fail) {
                            d.reject(fail.apply(this, arguments));
                        } else {
                            d.reject.apply(d, arguments);
                        }
                    });
                    return d;
                },
                resolveWith: resolveFunc('_doneFuncs', 'rs'),
                rejectWith: resolveFunc('_failFuncs', 'rj'),
                done: doneFunc('_doneFuncs', 'rs'),
                fail: doneFunc('_failFuncs', 'rj'),
                always: function() {
                    var args = can.makeArray(arguments);
                    if (args.length && args[0]) {
                        this.done(args[0])
                            .fail(args[0]);
                    }
                    return this;
                },
                then: function() {
                    var args = can.makeArray(arguments);
                    // Fail `function`(s)
                    if (args.length > 1 && args[1]) {
                        this.fail(args[1]);
                    }
                    // Done `function`(s)
                    if (args.length && args[0]) {
                        this.done(args[0]);
                    }
                    return this;
                },
                state: function() {
                    switch (this._status) {
                        case 'rs':
                            return 'resolved';
                        case 'rj':
                            return 'rejected';
                        default:
                            return 'pending';
                    }
                },
                isResolved: function() {
                    return this._status === 'rs';
                },
                isRejected: function() {
                    return this._status === 'rj';
                },
                reject: function() {
                    return this.rejectWith(this, arguments);
                },
                resolve: function() {
                    return this.resolveWith(this, arguments);
                },
                exec: function(context, dst, args, st) {
                    if (this._status !== '') {
                        return this;
                    }
                    this._status = st;
                    can.each(dst, function(d) {
                        if (typeof d.apply === 'function') {
                            d.apply(context, args);
                        }
                    });
                    return this;
                }
            });
        return can;
    })(__m3);

    // ## util/hashchange.js
    var __m11 = (function(can) {
        // This is a workaround for libraries that don't natively listen to the window hashchange event
        (function() {
            var addEvent = function(el, ev, fn) {
                if (el.addEventListener) {
                    el.addEventListener(ev, fn, false);
                } else if (el.attachEvent) {
                    el.attachEvent('on' + ev, fn);
                } else {
                    el['on' + ev] = fn;
                }
            }, onHashchange = function() {
                    can.trigger(window, 'hashchange');
                };
            addEvent(window, 'hashchange', onHashchange);
        }());
    })(__m3);

    // ## util/inserted/inserted.js
    var __m12 = (function(can) {
        // Given a list of elements, check if they are in the dom, if they 
        // are in the dom, trigger inserted on them.
        can.inserted = function(elems) {
            // prevent mutations from changing the looping
            elems = can.makeArray(elems);
            var inDocument = false,
                // Not all browsers implement document.contains (Android)
                doc = can.$(document.contains ? document : document.body),
                children;
            for (var i = 0, elem;
                (elem = elems[i]) !== undefined; i++) {
                if (!inDocument) {
                    if (elem.getElementsByTagName) {
                        if (can.has(doc, elem)
                            .length) {
                            inDocument = true;
                        } else {
                            return;
                        }
                    } else {
                        continue;
                    }
                }

                if (inDocument && elem.getElementsByTagName) {
                    children = can.makeArray(elem.getElementsByTagName("*"));
                    can.trigger(elem, "inserted", [], false);
                    for (var j = 0, child;
                        (child = children[j]) !== undefined; j++) {
                        // Trigger the destroyed event
                        can.trigger(child, "inserted", [], false);
                    }
                }
            }
        };

        can.appendChild = function(el, child) {
            var children;
            if (child.nodeType === 11) {
                children = can.makeArray(child.childNodes);
            } else {
                children = [child];
            }
            el.appendChild(child);
            can.inserted(children);
        };
        can.insertBefore = function(el, child, ref) {
            var children;
            if (child.nodeType === 11) {
                children = can.makeArray(child.childNodes);
            } else {
                children = [child];
            }
            el.insertBefore(child, ref);
            can.inserted(children);
        };

    })(__m3);

    // ## util/dojo/dojo.js
    var __m2 = (function(can, attr) {
        define('plugd/trigger', ['dojo'], function(dojo) {
            var d = dojo;
            var isfn = d.isFunction;
            var leaveRe = /mouse(enter|leave)/;
            var _fix = function(_, p) {
                return 'mouse' + (p === 'enter' ? 'over' : 'out');
            };
            var mix = d._mixin;
            // the guts of the node triggering logic:
            // the function accepts node (not string|node), "on"-less event name,
            // and an object of args to mix into the event. 
            var realTrigger;

            if (d.doc.createEvent) {
                realTrigger = function(n, e, a) {
                    // the sane branch
                    var ev = d.doc.createEvent('HTMLEvents');
                    e = e.replace(leaveRe, _fix);
                    // removed / inserted events should not bubble
                    ev.initEvent(e, e === 'removed' || e === 'inserted' ? false : true, true);
                    if (a) {
                        mix(ev, a);
                    }
                    n.dispatchEvent(ev);
                };
            } else {
                realTrigger = function(n, e, a) {
                    // the janktastic branch
                    var ev = 'on' + e,
                        stop = false;
                    try {
                        // FIXME: is this worth it? for mixed-case native event support:? Opera ends up in the
                        //	createEvent path above, and also fails on _some_ native-named events.
                        //					if(lc !== e && d.indexOf(d.NodeList.events, lc) >= 0){
                        //						// if the event is one of those listed in our NodeList list
                        //						// in lowercase form but is mixed case, throw to avoid
                        //						// fireEvent. /me sighs. http://gist.github.com/315318
                        //						throw("janktastic");
                        //					}
                        var evObj = document.createEventObject();
                        if (e === "inserted" || e === "removed") {
                            evObj.cancelBubble = true;
                        }
                        mix(evObj, a);
                        n.fireEvent(ev, evObj);
                    } catch (er) {
                        // a lame duck to work with. we're probably a 'custom event'
                        var evdata = mix({
                                type: e,
                                target: n,
                                faux: true,
                                // HACK: [needs] added support for customStopper to _base/event.js
                                // some tests will fail until del._stopPropagation has support.
                                _stopper: function() {
                                    stop = this.cancelBubble;
                                }
                            }, a);
                        if (isfn(n[ev])) {
                            n[ev](evdata);
                        }
                        if (e === "inserted" || e === "removed") {
                            return;
                        }
                        // handle bubbling of custom events, unless the event was stopped.
                        while (!stop && n !== d.doc && n.parentNode) {
                            n = n.parentNode;
                            if (isfn(n[ev])) {
                                n[ev](evdata);
                            }
                        }
                    }
                };
            }
            d._trigger = function(node, event, extraArgs) {
                if (typeof event !== 'string') {
                    extraArgs = event;
                    event = extraArgs.type;
                    delete extraArgs.type;
                }
                // summary:
                //		Helper for `dojo.trigger`, which handles the DOM cases. We should never
                //		be here without a domNode reference and a string eventname.
                var n = d.byId(node),
                    ev = event && event.slice(0, 2) === 'on' ? event.slice(2) : event;
                realTrigger(n, ev, extraArgs);
            };
            d.trigger = function(obj, event, extraArgs) {
                // summary: 
                //		Trigger some event. It can be either a Dom Event, Custom Event, 
                //		or direct function call. 
                // description:
                //		Trigger some event. It can be either a Dom Event, Custom Event, 
                //		or direct function call. NOTE: This function does not trigger
                //		default behavior, only triggers bound event listeneres. eg:
                //		one cannot trigger("anchorNode", "onclick") and expect the browser
                //		to follow the href="" attribute naturally.
                // obj: String|DomNode|Object|Function
                //		An ID, or DomNode reference, from which to trigger the event.
                //		If an Object, fire the `event` in the scope of this object,
                //		similar to calling dojo.hitch(obj, event)(). The return value
                //		in this case is returned from `dojo.trigger`
                // event: String|Function
                //		The name of the event to trigger. can be any DOM level 2 event
                //		and can be in either form: "onclick" or "click" for instance.
                //		In the object-firing case, this method can be a function or
                //		a string version of a member function, just like `dojo.hitch`.
                // extraArgs: Object?
                //		An object to mix into the `event` object passed to any bound 
                //		listeners. Be careful not to override important members, like
                //		`type`, or `preventDefault`. It will likely error.
                //		Additionally, extraArgs is moot in the object-triggering case,
                //		as all arguments beyond the `event` are curried onto the triggered
                //		function.
                // example: 
                //	|	dojo.connect(node, "onclick", function(e){  });
                //	|	// later:
                //	|	dojo.trigger(node, "onclick");
                // example:
                //	|	// or from within dojo.query: (requires dojo.NodeList)
                //	|	dojo.query("a").onclick(function(){}).trigger("onclick");
                // example:
                //	|	// fire obj.method() in scope of obj
                //	|	dojo.trigger(obj, "method");
                // example:
                //	|	// fire an anonymous function:
                //	|	dojo.trigger(d.global, function(){  });
                // example: 
                //	|	// fire and anonymous function in the scope of obj
                //	|	dojo.trigger(obj, function(){ this == obj; });
                // example:
                //	|	// with a connected function like:
                //	|	dojo.connect(dojo.doc, "onclick", function(e){
                //	|		if(e && e.manuallydone){
                //	|			console.log("this was a triggered onclick, not natural");
                //	|		}
                //	|	});
                //	|	// fire onclick, passing in a custom bit of info
                //	|	dojo.trigger("someId", "onclick", { manuallydone:true });
                // returns: Anything
                //		Will not return anything in the Dom event case, but will return whatever
                //		return value is received from the triggered event. 
                return isfn(obj) || isfn(event) || isfn(obj[event]) ? d.hitch.apply(d, arguments)() : d._trigger.apply(d, arguments);
            };
            d.NodeList.prototype.trigger = d.NodeList._adaptAsForEach(d._trigger);
            // if the node.js module is available, extend trigger into that.
            if (d._Node && !d._Node.prototype.trigger) {
                d.extend(d._Node, {
                        trigger: function(ev, data) {
                            // summary:
                            //		Fire some some event originating from this node.
                            //		Only available if both the `dojo.trigger` and `dojo.node` plugin 
                            //		are enabled. Allows chaining as all `dojo._Node` methods do.
                            // ev: String
                            //		Some string event name to fire. eg: "onclick", "submit"
                            // data: Object
                            //		Just like `extraArgs` for `dojo.trigger`, additional data
                            //		to mix into the event object.
                            // example:
                            //	|	// fire onlick orginiating from a node with id="someAnchorId"
                            //	|	dojo.node("someAnchorId").trigger("click");
                            d._trigger(this, ev, data);
                            return this; // dojo._Node
                        }
                    });
            }
            return d.trigger;
        });
        // dojo.js
        // ---------
        // _dojo node list._
        // These are pre-loaded by `steal` -> no callback.
        require([
                'dojo',
                'dojo/query',
                'plugd/trigger',
                'dojo/NodeList-dom'
            ]);
        // Map string helpers.
        can.trim = function(s) {
            return s && dojo.trim(s);
        };
        // Map array helpers.
        can.makeArray = function(arr) {
            var array = [];
            dojo.forEach(arr, function(item) {
                array.push(item);
            });
            return array;
        };
        can.isArray = dojo.isArray;
        can.inArray = function(item, arr, from) {
            return dojo.indexOf(arr, item, from);
        };
        can.map = function(arr, fn) {
            return dojo.map(can.makeArray(arr || []), fn);
        };
        // Map object helpers.
        can.extend = function(first) {
            if (first === true) {
                var args = can.makeArray(arguments);
                args.shift();
                return dojo.mixin.apply(dojo, args);
            }
            return dojo.mixin.apply(dojo, arguments);
        };
        can.isEmptyObject = function(object) {
            var prop;
            for (prop in object) {
                break;
            }
            return prop === undefined;
        };
        // Use a version of param similar to jQuery's param that
        // handles nested data instead of dojo.objectToQuery which doesn't
        can.param = function(object) {
            var pairs = [],
                add = function(key, value) {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                };
            for (var name in object) {
                can.buildParam(name, object[name], add);
            }
            return pairs.join('&')
                .replace(/%20/g, '+');
        };
        can.buildParam = function(prefix, obj, add) {
            if (can.isArray(obj)) {
                for (var i = 0, l = obj.length; i < l; ++i) {
                    add(prefix + '[]', obj[i]);
                }
            } else if (dojo.isObject(obj)) {
                for (var name in obj) {
                    can.buildParam(prefix + '[' + name + ']', obj[name], add);
                }
            } else {
                add(prefix, obj);
            }
        };
        // Map function helpers.
        can.proxy = function(func, context) {
            return dojo.hitch(context, func);
        };
        can.isFunction = function(f) {
            return dojo.isFunction(f);
        };

        // The id of the `function` to be bound, used as an expando on the `function`
        // so we can lookup it's `remove` object.
        var dojoId = 0,
            // Takes a node list, goes through each node
            // and adds events data that has a map of events to
            // callbackId to `remove` object.  It looks like
            // `{click: {5: {remove: fn}}}`.
            dojoAddBinding = function(nodelist, ev, cb) {
                nodelist.forEach(function(node) {
                    // Converting a raw select node to a node list
                    // returns a node list of its options due to a
                    // bug in Dojo 1.7.1, this is sovled by wrapping
                    // it in an array.
                    node = new dojo.NodeList(node.nodeName === 'SELECT' ? [node] : node);
                    var events = can.data(node, 'events');
                    if (!events) {
                        can.data(node, 'events', events = {});
                    }
                    if (!events[ev]) {
                        events[ev] = {};
                    }
                    if (cb.__bindingsIds === undefined) {
                        cb.__bindingsIds = dojoId++;
                    }
                    events[ev][cb.__bindingsIds] = node.on(ev, cb)[0];
                });
            },
            // Removes a binding on a `nodelist` by finding
            // the remove object within the object's data.
            dojoRemoveBinding = function(nodelist, ev, cb) {
                nodelist.forEach(function(node) {
                    var currentNode = new dojo.NodeList(node),
                        events = can.data(currentNode, 'events');
                    if (!events) {
                        return;
                    }
                    var handlers = events[ev];
                    if (!handlers) {
                        return;
                    }
                    var handler = handlers[cb.__bindingsIds];
                    dojo.disconnect(handler);
                    delete handlers[cb.__bindingsIds];
                    if (can.isEmptyObject(handlers)) {
                        delete events[ev];
                    }
                });
            };
        can.bind = function(ev, cb) {
            // If we can bind to it...
            if (this.bind && this.bind !== can.bind) {
                this.bind(ev, cb); // Otherwise it's an element or `nodeList`.
            } else if (this.on || this.nodeType) {
                // Converting a raw select node to a node list
                // returns a node list of its options due to a
                // bug in Dojo 1.7.1, this is sovled by wrapping
                // it in an array.
                dojoAddBinding(new dojo.NodeList(this.nodeName === 'SELECT' ? [this] : this), ev, cb);
            } else if (this.addEvent) {
                this.addEvent(ev, cb);
            } else {
                // Make it bind-able...
                can.addEvent.call(this, ev, cb);
            }
            return this;
        };
        can.unbind = function(ev, cb) {
            // If we can bind to it...
            if (this.unbind && this.unbind !== can.unbind) {
                this.unbind(ev, cb);
            } else if (this.on || this.nodeType) {
                dojoRemoveBinding(new dojo.NodeList(this), ev, cb);
            } else {
                // Make it bind-able...
                can.removeEvent.call(this, ev, cb);
            }
            return this;
        };
        // Alias on/off to bind/unbind respectively
        can.on = can.bind;
        can.off = can.unbind;
        can.trigger = function(item, event, args, bubble) {
            if (!(item instanceof dojo.NodeList) && (item.nodeName || item === window)) {
                item = can.$(item);
            }
            if (item.trigger) {
                if (bubble === false) {
                    if (!item[0] || item[0].nodeType === 3) {
                        return;
                    }
                    // Force stop propagation by
                    // listening to `on` and then immediately disconnecting.
                    var connect = item.on(event, function(ev) {
                        if (ev.stopPropagation) {
                            ev.stopPropagation();
                        }
                        ev.cancelBubble = true;
                        if (ev._stopper) {
                            ev._stopper();
                        }
                        dojo.disconnect(connect);
                    });
                    item.trigger(event, args);
                } else {
                    item.trigger(event, args);
                }
            } else {
                if (typeof event === 'string') {
                    event = {
                        type: event
                    };
                }
                event.target = event.target || item;
                can.dispatch.call(item, event, args);
            }
        };
        can.delegate = function(selector, ev, cb) {
            if (this.on || this.nodeType) {
                dojoAddBinding(new dojo.NodeList(this), selector + ':' + ev, cb);
            } else if (this.delegate) {
                this.delegate(selector, ev, cb);
            }
            return this;
        };
        can.undelegate = function(selector, ev, cb) {
            if (this.on || this.nodeType) {
                dojoRemoveBinding(new dojo.NodeList(this), selector + ':' + ev, cb);
            } else if (this.undelegate) {
                this.undelegate(selector, ev, cb);
            }
            return this;
        };

        var updateDeferred = function(xhr, d) {
            for (var prop in xhr) {
                if (typeof d[prop] === 'function') {
                    d[prop] = function() {
                        xhr[prop].apply(xhr, arguments);
                    };
                } else {
                    d[prop] = prop[xhr];
                }
            }
        };
        can.ajax = function(options) {
            var type = can.capitalize((options.type || 'get')
                .toLowerCase()),
                method = dojo['xhr' + type];
            var success = options.success,
                error = options.error,
                d = new can.Deferred();
            var def = method({
                    url: options.url,
                    handleAs: options.dataType,
                    sync: !options.async,
                    headers: options.headers,
                    content: options.data
                });
            def.then(function(data, ioargs) {
                updateDeferred(xhr, d);
                d.resolve(data, 'success', xhr);
                if (success) {
                    success(data, 'success', xhr);
                }
            }, function(data, ioargs) {
                updateDeferred(xhr, d);
                d.reject(xhr, 'error');
                error(xhr, 'error');
            });
            var xhr = def.ioArgs.xhr;
            updateDeferred(xhr, d);
            return d;
        };
        // Element - get the wrapped helper.
        can.$ = function(selector) {
            if (selector === window) {
                return window;
            }
            if (typeof selector === 'string') {
                return dojo.query(selector);
            } else {
                return new dojo.NodeList(selector && selector.nodeName ? [selector] : selector);
            }
        };
        can.append = function(wrapped, html) {
            return wrapped.forEach(function(node) {
                dojo.place(html, node);
            });
        };

        var data = {}, uuid = can.uuid = +new Date(),
            exp = can.expando = 'can' + uuid;

        function getData(node, name) {
            var id = node[exp],
                store = id && data[id];
            return name === undefined ? store || setData(node) : store && store[name];
        }

        function setData(node, name, value) {
            var id = node[exp] || (node[exp] = ++uuid),
                store = data[id] || (data[id] = {});
            if (name !== undefined) {
                store[name] = value;
            }
            return store;
        }

        var cleanData = function(elems) {
            var nodes = [];

            for (var i = 0, len = elems.length; i < len; i++) {
                if (elems[i].nodeType === 1) {
                    nodes.push(elems[i]);
                }
            }
            can.trigger(new dojo.NodeList(nodes), 'removed', [], false);
            i = 0;
            for (var elem;
                (elem = elems[i]) !== undefined; i++) {
                var id = elem[exp];
                delete data[id];
            }
        };
        can.data = function(wrapped, name, value) {
            return value === undefined ? wrapped.length === 0 ? undefined : getData(wrapped[0], name) : wrapped.forEach(function(node) {
                setData(node, name, value);
            });
        };
        can.cleanData = function(elem, prop) {
            var id = elem[exp];
            delete data[id][prop];
        };
        // Overwrite `dojo.destroy`, `dojo.empty` and `dojo.place`.
        dojo.empty = function(node) {
            for (var c; c = node.lastChild;) {
                // Intentional assignment.
                dojo.destroy(c);
            }
        };
        var destroy = dojo.destroy;
        dojo.destroy = function(node) {
            node = dojo.byId(node);
            // we must call clean data at one time
            var nodes = [node];
            if (node.getElementsByTagName) {
                nodes.concat(can.makeArray(node.getElementsByTagName('*')));
            }
            cleanData(nodes);
            return destroy.apply(dojo, arguments);
        };
        var place = dojo.place;
        dojo.place = function(node, refNode, position) {
            if (typeof node === 'string' && /^\s*</.test(node)) {
                node = can.buildFragment(node);
            }
            var elems;
            if (node.nodeType === 11) {
                elems = can.makeArray(node.childNodes);
            } else {
                elems = [node];
            }
            var ret = place.call(this, node, refNode, position);
            can.inserted(elems);
            return ret;
        };
        can.addClass = function(wrapped, className) {
            return wrapped.addClass(className);
        };
        // removes a NodeList ... but it doesn't seem like dojo's NodeList has a destroy method?
        can.remove = function(wrapped) {
            // We need to remove text nodes ourselves.
            var nodes = [];
            wrapped.forEach(function(node) {
                nodes.push(node);
                if (node.getElementsByTagName) {
                    nodes.push.apply(nodes, can.makeArray(node.getElementsByTagName('*')));
                }
            });
            cleanData(nodes);
            wrapped.forEach(destroy);
            return wrapped;
        };
        can.get = function(wrapped, index) {
            return wrapped[index];
        };
        can.has = function(wrapped, element) {
            if (dojo.isDescendant(element, wrapped[0])) {
                return wrapped;
            } else {
                return [];
            }
        };
        // Add pipe to `dojo.Deferred`.
        can.extend(dojo.Deferred.prototype, {
                pipe: function(done, fail) {
                    var d = new dojo.Deferred();
                    this.addCallback(function() {
                        d.resolve(done.apply(this, arguments));
                    });
                    this.addErrback(function() {
                        if (fail) {
                            d.reject(fail.apply(this, arguments));
                        } else {
                            d.reject.apply(d, arguments);
                        }
                    });
                    return d;
                }
            });
        can.attr = attr;
        delete attr.MutationObserver;

        var oldOn = dojo.NodeList.prototype.on;

        dojo.NodeList.prototype.on = function(event) {

            if (event === "attributes") {
                this.forEach(function(node) {
                    var el = can.$(node);
                    can.data(el, "canHasAttributesBindings", (can.data(el, "canHasAttributesBindings") || 0) + 1);
                });
            }
            var handles = oldOn.apply(this, arguments);

            if (event === "attributes") {
                var self = this;

                can.each(handles, function(handle, i) {
                    var oldRemove = handle.remove;
                    handle.remove = function() {
                        var el = can.$(self[i]),
                            cur = can.data(el, "canHasAttributesBindings") || 0;
                        if (cur <= 0) {
                            can.cleanData(self[i], "canHasAttributesBindings");
                        } else {
                            can.data(el, "canHasAttributesBindings", cur - 1);
                        }
                        return oldRemove.call(this, arguments);
                    };
                });
            }
            return handles;

        };

        var oldSetAttr = dojo.setAttr;
        dojo.setAttr = function(node, name, value) {
            var oldValue = dojo.getAttr(node, name);

            var res = oldSetAttr.apply(this, arguments);

            var newValue = dojo.getAttr(node, name);

            if (newValue !== oldValue) {
                can.attr.trigger(node, name, oldValue);
            }
            return res;
        };

        var oldRemoveAttr = dojo.removeAttr;

        dojo.removeAttr = function(node, name) {
            var oldValue = dojo.getAttr(node, name),
                res = oldRemoveAttr.apply(this, arguments);

            if (oldValue != null) {
                can.attr.trigger(node, name, oldValue);
            }
            return res;
        };

        return can;
    })(__m3, __m4, {}, __m6, __m7, __m8, __m9, __m10, __m11, __m12);

    // ## view/view.js
    var __m14 = (function(can) {
        // ## view.js
        // `can.view`  
        // _Templating abstraction._

        var isFunction = can.isFunction,
            makeArray = can.makeArray,
            // Used for hookup `id`s.
            hookupId = 1,
            // Makes a renderer function.
            makeRenderer = function(textRenderer) {
                var renderer = function() {
                    return $view.frag(textRenderer.apply(this, arguments));
                };
                renderer.render = function() {
                    return textRenderer.apply(textRenderer, arguments);
                };
                return renderer;
            },

            $view = can.view = can.template = function(view, data, helpers, callback) {
                // If helpers is a `function`, it is actually a callback.
                if (isFunction(helpers)) {
                    callback = helpers;
                    helpers = undefined;
                }
                var result;
                // Get the result, if a renderer function is passed in, then we just use that to render the data
                if (isFunction(view)) {
                    result = view(data, helpers, callback);
                } else {
                    result = $view.renderAs("fragment", view, data, helpers, callback);
                }

                return result;
            };

        can.extend($view, {
                // creates a frag and hooks it up all at once

                frag: function(result, parentNode) {
                    return $view.hookup($view.fragment(result), parentNode);
                },

                // simply creates a frag
                // this is used internally to create a frag
                // insert it
                // then hook it up
                fragment: function(result) {
                    var frag = can.buildFragment(result, document.body);
                    // If we have an empty frag...
                    if (!frag.childNodes.length) {
                        frag.appendChild(document.createTextNode(''));
                    }
                    return frag;
                },

                // Convert a path like string into something that's ok for an `element` ID.
                toId: function(src) {
                    return can.map(src.toString()
                        .split(/\/|\./g), function(part) {
                            // Dont include empty strings in toId functions
                            if (part) {
                                return part;
                            }
                        })
                        .join('_');
                },
                toStr: function(txt) {
                    return txt == null ? "" : "" + txt;
                },
                hookup: function(fragment, parentNode) {
                    var hookupEls = [],
                        id,
                        func;

                    // Get all `childNodes`.
                    can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function(node) {
                        if (node.nodeType === 1) {
                            hookupEls.push(node);
                            hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
                        }
                    });

                    // Filter by `data-view-id` attribute.
                    can.each(hookupEls, function(el) {
                        if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
                            func(el, parentNode, id);
                            delete $view.hookups[id];
                            el.removeAttribute('data-view-id');
                        }
                    });

                    return fragment;
                },


                // auj

                // heir

                hookups: {},


                hook: function(cb) {
                    $view.hookups[++hookupId] = cb;
                    return ' data-view-id=\'' + hookupId + '\'';
                },


                cached: {},

                cachedRenderers: {},


                cache: true,


                register: function(info) {
                    this.types['.' + info.suffix] = info;
                },

                types: {},


                ext: ".ejs",


                registerScript: function() {},


                preload: function() {},


                render: function(view, data, helpers, callback) {
                    return can.view.renderAs("string", view, data, helpers, callback);
                },
                renderTo: function(format, renderer, data, helpers) {
                    return (format === "string" && renderer.render ? renderer.render : renderer)(data, helpers);
                },
                renderAs: function(format, view, data, helpers, callback) {
                    // If helpers is a `function`, it is actually a callback.
                    if (isFunction(helpers)) {
                        callback = helpers;
                        helpers = undefined;
                    }

                    // See if we got passed any deferreds.
                    var deferreds = getDeferreds(data);
                    var reading, deferred, dataCopy, async, response;
                    if (deferreds.length) {
                        // Does data contain any deferreds?
                        // The deferred that resolves into the rendered content...
                        deferred = new can.Deferred();
                        dataCopy = can.extend({}, data);

                        // Add the view request to the list of deferreds.
                        deferreds.push(get(view, true));
                        // Wait for the view and all deferreds to finish...
                        can.when.apply(can, deferreds)
                            .then(function(resolved) {
                                // Get all the resolved deferreds.
                                var objs = makeArray(arguments),
                                    // Renderer is the last index of the data.
                                    renderer = objs.pop(),
                                    // The result of the template rendering with data.
                                    result;

                                // Make data look like the resolved deferreds.
                                if (can.isDeferred(data)) {
                                    dataCopy = usefulPart(resolved);
                                } else {
                                    // Go through each prop in data again and
                                    // replace the defferreds with what they resolved to.
                                    for (var prop in data) {
                                        if (can.isDeferred(data[prop])) {
                                            dataCopy[prop] = usefulPart(objs.shift());
                                        }
                                    }
                                }

                                // Get the rendered result.
                                result = can.view.renderTo(format, renderer, dataCopy, helpers);

                                // Resolve with the rendered view.
                                deferred.resolve(result, dataCopy);

                                // If there's a `callback`, call it back with the result.
                                if (callback) {
                                    callback(result, dataCopy);
                                }
                            }, function() {
                                deferred.reject.apply(deferred, arguments);
                            });
                        // Return the deferred...
                        return deferred;
                    } else {
                        // get is called async but in 
                        // ff will be async so we need to temporarily reset
                        reading = can.__clearReading();

                        // If there's a `callback` function
                        async = isFunction(callback);
                        // Get the `view` type
                        deferred = get(view, async);

                        if (reading) {
                            can.__setReading(reading);
                        }

                        // If we are `async`...
                        if (async) {
                            // Return the deferred
                            response = deferred;
                            // And fire callback with the rendered result.
                            deferred.then(function(renderer) {
                                callback(data ? can.view.renderTo(format, renderer, data, helpers) : renderer);
                            });
                        } else {
                            // if the deferred is resolved, call the cached renderer instead
                            // this is because it's possible, with recursive deferreds to
                            // need to render a view while its deferred is _resolving_.  A _resolving_ deferred
                            // is a deferred that was just resolved and is calling back it's success callbacks.
                            // If a new success handler is called while resoliving, it does not get fired by
                            // jQuery's deferred system.  So instead of adding a new callback
                            // we use the cached renderer.
                            // We also add __view_id on the deferred so we can look up it's cached renderer.
                            // In the future, we might simply store either a deferred or the cached result.
                            if (deferred.state() === 'resolved' && deferred.__view_id) {
                                var currentRenderer = $view.cachedRenderers[deferred.__view_id];
                                return data ? can.view.renderTo(format, currentRenderer, data, helpers) : currentRenderer;
                            } else {
                                // Otherwise, the deferred is complete, so
                                // set response to the result of the rendering.
                                deferred.then(function(renderer) {
                                    response = data ? can.view.renderTo(format, renderer, data, helpers) : renderer;
                                });
                            }
                        }

                        return response;
                    }
                },


                registerView: function(id, text, type, def) {
                    // Get the renderer function.
                    var info = (typeof type === "object" ? type : $view.types[type || $view.ext]),
                        renderer;
                    if (info.fragRenderer) {
                        renderer = info.fragRenderer(id, text);
                    } else {
                        renderer = makeRenderer(info.renderer(id, text));
                    }

                    def = def || new can.Deferred();

                    // Cache if we are caching.
                    if ($view.cache) {
                        $view.cached[id] = def;
                        def.__view_id = id;
                        $view.cachedRenderers[id] = renderer;
                    }

                    // Return the objects for the response's `dataTypes`
                    // (in this case view).
                    return def.resolve(renderer);
                }
            });

        // Makes sure there's a template, if not, have `steal` provide a warning.
        var checkText = function(text, url) {
            if (!text.length) {



                throw "can.view: No template or empty template:" + url;
            }
        },
            // `Returns a `view` renderer deferred.  
            // `url` - The url to the template.  
            // `async` - If the ajax request should be asynchronous.  
            // Returns a deferred.
            get = function(obj, async) {
                var url = typeof obj === 'string' ? obj : obj.url,
                    suffix = (obj.engine && '.' + obj.engine) || url.match(/\.[\w\d]+$/),
                    type,
                    // If we are reading a script element for the content of the template,
                    // `el` will be set to that script element.
                    el,
                    // A unique identifier for the view (used for caching).
                    // This is typically derived from the element id or
                    // the url for the template.
                    id;

                //If the url has a #, we assume we want to use an inline template
                //from a script element and not current page's HTML
                if (url.match(/^#/)) {
                    url = url.substr(1);
                }
                // If we have an inline template, derive the suffix from the `text/???` part.
                // This only supports `<script>` tags.
                if (el = document.getElementById(url)) {
                    suffix = '.' + el.type.match(/\/(x\-)?(.+)/)[2];
                }

                // If there is no suffix, add one.
                if (!suffix && !$view.cached[url]) {
                    url += suffix = $view.ext;
                }

                if (can.isArray(suffix)) {
                    suffix = suffix[0];
                }

                // Convert to a unique and valid id.
                id = $view.toId(url);

                // If an absolute path, use `steal`/`require` to get it.
                // You should only be using `//` if you are using an AMD loader like `steal` or `require` (not almond).
                if (url.match(/^\/\//)) {
                    url = url.substr(2);
                    url = !window.steal ?
                        url :
                        steal.config()
                        .root.mapJoin("" + steal.id(url));
                }

                // Localize for `require` (not almond)
                if (window.require) {
                    if (require.toUrl) {
                        url = require.toUrl(url);
                    }
                }

                // Set the template engine type.
                type = $view.types[suffix];

                // If it is cached, 
                if ($view.cached[id]) {
                    // Return the cached deferred renderer.
                    return $view.cached[id];

                    // Otherwise if we are getting this from a `<script>` element.
                } else if (el) {
                    // Resolve immediately with the element's `innerHTML`.
                    return $view.registerView(id, el.innerHTML, type);
                } else {
                    // Make an ajax request for text.
                    var d = new can.Deferred();
                    can.ajax({
                            async: async,
                            url: url,
                            dataType: 'text',
                            error: function(jqXHR) {
                                checkText('', url);
                                d.reject(jqXHR);
                            },
                            success: function(text) {
                                // Make sure we got some text back.
                                checkText(text, url);
                                $view.registerView(id, text, type, d);
                            }
                        });
                    return d;
                }
            },
            // Gets an `array` of deferreds from an `object`.
            // This only goes one level deep.
            getDeferreds = function(data) {
                var deferreds = [];

                // pull out deferreds
                if (can.isDeferred(data)) {
                    return [data];
                } else {
                    for (var prop in data) {
                        if (can.isDeferred(data[prop])) {
                            deferreds.push(data[prop]);
                        }
                    }
                }
                return deferreds;
            },
            // Gets the useful part of a resolved deferred.
            // This is for `model`s and `can.ajax` that resolve to an `array`.
            usefulPart = function(resolved) {
                return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved;
            };

        can.extend($view, {
                register: function(info) {
                    this.types['.' + info.suffix] = info;



                    can[info.suffix] = $view[info.suffix] = function(id, text) {
                        // If there is no text, assume id is the template text, so return a nameless renderer.
                        if (!text) {
                            // if the template has a fragRenderer already, just return that.
                            if (info.fragRenderer) {
                                return info.fragRenderer(null, id);
                            } else {
                                return makeRenderer(info.renderer(null, id));
                            }

                        }
                        if (info.fragRenderer) {
                            return $view.preload(id, info.fragRenderer(id, text));
                        } else {
                            return $view.preloadStringRenderer(id, info.renderer(id, text));
                        }

                    };

                },
                registerScript: function(type, id, src) {
                    return 'can.view.preloadStringRenderer(\'' + id + '\',' + $view.types['.' + type].script(id, src) + ');';
                },
                preloadStringRenderer: function(id, stringRenderer) {
                    return this.preload(id, makeRenderer(stringRenderer));
                },
                preload: function(id, renderer) {
                    var def = $view.cached[id] = new can.Deferred()
                        .resolve(function(data, helpers) {
                            return renderer.call(data, data, helpers);
                        });

                    // set cache references (otherwise preloaded recursive views won't recurse properly)
                    def.__view_id = id;
                    $view.cachedRenderers[id] = renderer;

                    return renderer;
                }

            });

        return can;
    })(__m2);

    // ## view/callbacks/callbacks.js
    var __m13 = (function(can) {

        var attr = can.view.attr = function(attributeName, attrHandler) {
            if (attrHandler) {
                if (typeof attributeName === "string") {
                    attributes[attributeName] = attrHandler;
                } else {
                    regExpAttributes.push({
                            match: attributeName,
                            handler: attrHandler
                        });
                }
            } else {
                var cb = attributes[attributeName];
                if (!cb) {

                    for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                        var attrMatcher = regExpAttributes[i];
                        if (attrMatcher.match.test(attributeName)) {
                            cb = attrMatcher.handler;
                            break;
                        }
                    }
                }
                return cb;
            }
        };

        var attributes = {},
            regExpAttributes = [],
            automaticCustomElementCharacters = /[-\:]/;

        var tag = can.view.tag = function(tagName, tagHandler) {
            if (tagHandler) {
                // if we have html5shive ... re-generate
                if (window.html5) {
                    window.html5.elements += " " + tagName;
                    window.html5.shivDocument();
                }

                tags[tagName.toLowerCase()] = tagHandler;
            } else {
                var cb = tags[tagName.toLowerCase()];
                if (!cb && automaticCustomElementCharacters.test(tagName)) {
                    // empty callback for things that look like special tags
                    cb = function() {};
                }
                return cb;
            }

        };
        var tags = {};

        can.view.callbacks = {
            _tags: tags,
            _attributes: attributes,
            _regExpAttributes: regExpAttributes,
            tag: tag,
            attr: attr,
            // handles calling back a tag callback
            tagHandler: function(el, tagName, tagData) {
                var helperTagCallback = tagData.options.read('tags.' + tagName, {
                        isArgument: true,
                        proxyMethods: false
                    })
                    .value,
                    tagCallback = helperTagCallback || tags[tagName];

                // If this was an element like <foo-bar> that doesn't have a component, just render its content
                var scope = tagData.scope,
                    res = tagCallback ? tagCallback(el, tagData) : scope;



                // If the tagCallback gave us something to render with, and there is content within that element
                // render it!
                if (res && tagData.subtemplate) {

                    if (scope !== res) {
                        scope = scope.add(res);
                    }
                    var result = tagData.subtemplate(scope, tagData.options);
                    var frag = typeof result === "string" ? can.view.frag(result) : result;
                    can.appendChild(el, frag);
                }
            }
        };
        return can.view.callbacks;
    })(__m2, __m14);

    // ## util/string/string.js
    var __m17 = (function(can) {
        // ##string.js
        // _Miscellaneous string utility functions._  
        // Several of the methods in this plugin use code adapated from Prototype
        // Prototype JavaScript framework, version 1.6.0.1.
        // © 2005-2007 Sam Stephenson
        var strUndHash = /_|-/,
            strColons = /\=\=/,
            strWords = /([A-Z]+)([A-Z][a-z])/g,
            strLowUp = /([a-z\d])([A-Z])/g,
            strDash = /([a-z\d])([A-Z])/g,
            strReplacer = /\{([^\}]+)\}/g,
            strQuote = /"/g,
            strSingleQuote = /'/g,
            strHyphenMatch = /-+(.)?/g,
            strCamelMatch = /[a-z][A-Z]/g,
            // Returns the `prop` property from `obj`.
            // If `add` is true and `prop` doesn't exist in `obj`, create it as an
            // empty object.
            getNext = function(obj, prop, add) {
                var result = obj[prop];
                if (result === undefined && add === true) {
                    result = obj[prop] = {};
                }
                return result;
            },
            // Returns `true` if the object can have properties (no `null`s).
            isContainer = function(current) {
                return /^f|^o/.test(typeof current);
            }, convertBadValues = function(content) {
                // Convert bad values into empty strings
                var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
                return '' + (isInvalid ? '' : content);
            };
        can.extend(can, {
                esc: function(content) {
                    return convertBadValues(content)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(strQuote, '&#34;')
                        .replace(strSingleQuote, '&#39;');
                },
                getObject: function(name, roots, add) {
                    // The parts of the name we are looking up
                    // `['App','Models','Recipe']`
                    var parts = name ? name.split('.') : [],
                        length = parts.length,
                        current, r = 0,
                        i, container, rootsLength;
                    // Make sure roots is an `array`.
                    roots = can.isArray(roots) ? roots : [roots || window];
                    rootsLength = roots.length;
                    if (!length) {
                        return roots[0];
                    }
                    // For each root, mark it as current.
                    for (r; r < rootsLength; r++) {
                        current = roots[r];
                        container = undefined;
                        // Walk current to the 2nd to last object or until there
                        // is not a container.
                        for (i = 0; i < length && isContainer(current); i++) {
                            container = current;
                            current = getNext(container, parts[i]);
                        }
                        // If we found property break cycle
                        if (container !== undefined && current !== undefined) {
                            break;
                        }
                    }
                    // Remove property from found container
                    if (add === false && current !== undefined) {
                        delete container[parts[i - 1]];
                    }
                    // When adding property add it to the first root
                    if (add === true && current === undefined) {
                        current = roots[0];
                        for (i = 0; i < length && isContainer(current); i++) {
                            current = getNext(current, parts[i], true);
                        }
                    }
                    return current;
                },
                capitalize: function(s, cache) {
                    // Used to make newId.
                    return s.charAt(0)
                        .toUpperCase() + s.slice(1);
                },
                camelize: function(str) {
                    return convertBadValues(str)
                        .replace(strHyphenMatch, function(match, chr) {
                            return chr ? chr.toUpperCase() : '';
                        });
                },
                hyphenate: function(str) {
                    return convertBadValues(str)
                        .replace(strCamelMatch, function(str, offset) {
                            return str.charAt(0) + '-' + str.charAt(1)
                                .toLowerCase();
                        });
                },
                underscore: function(s) {
                    return s.replace(strColons, '/')
                        .replace(strWords, '$1_$2')
                        .replace(strLowUp, '$1_$2')
                        .replace(strDash, '_')
                        .toLowerCase();
                },
                sub: function(str, data, remove) {
                    var obs = [];
                    str = str || '';
                    obs.push(str.replace(strReplacer, function(whole, inside) {
                                // Convert inside to type.
                                var ob = can.getObject(inside, data, remove === true ? false : undefined);
                                if (ob === undefined || ob === null) {
                                    obs = null;
                                    return '';
                                }
                                // If a container, push into objs (which will return objects found).
                                if (isContainer(ob) && obs) {
                                    obs.push(ob);
                                    return '';
                                }
                                return '' + ob;
                            }));
                    return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
                },
                replacer: strReplacer,
                undHash: strUndHash
            });
        return can;
    })(__m2);

    // ## construct/construct.js
    var __m16 = (function(can) {
        // ## construct.js
        // `can.Construct`  
        // _This is a modified version of
        // [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
        // It provides class level inheritance and callbacks._
        // A private flag used to initialize a new class instance without
        // initializing it's bindings.
        var initializing = 0;

        can.Construct = function() {
            if (arguments.length) {
                return can.Construct.extend.apply(can.Construct, arguments);
            }
        };

        can.extend(can.Construct, {

                constructorExtends: true,

                newInstance: function() {
                    // Get a raw instance object (`init` is not called).
                    var inst = this.instance(),
                        args;
                    // Call `setup` if there is a `setup`
                    if (inst.setup) {
                        args = inst.setup.apply(inst, arguments);
                    }
                    // Call `init` if there is an `init`  
                    // If `setup` returned `args`, use those as the arguments
                    if (inst.init) {
                        inst.init.apply(inst, args || arguments);
                    }
                    return inst;
                },
                // Overwrites an object with methods. Used in the `super` plugin.
                // `newProps` - New properties to add.
                // `oldProps` - Where the old properties might be (used with `super`).
                // `addTo` - What we are adding to.
                _inherit: function(newProps, oldProps, addTo) {
                    can.extend(addTo || newProps, newProps || {});
                },
                // used for overwriting a single property.
                // this should be used for patching other objects
                // the super plugin overwrites this
                _overwrite: function(what, oldProps, propName, val) {
                    what[propName] = val;
                },
                // Set `defaults` as the merger of the parent `defaults` and this
                // object's `defaults`. If you overwrite this method, make sure to
                // include option merging logic.

                setup: function(base, fullName) {
                    this.defaults = can.extend(true, {}, base.defaults, this.defaults);
                },
                // Create's a new `class` instance without initializing by setting the
                // `initializing` flag.
                instance: function() {
                    // Prevents running `init`.
                    initializing = 1;
                    var inst = new this();
                    // Allow running `init`.
                    initializing = 0;
                    return inst;
                },
                // Extends classes.

                extend: function(fullName, klass, proto) {
                    // Figure out what was passed and normalize it.
                    if (typeof fullName !== 'string') {
                        proto = klass;
                        klass = fullName;
                        fullName = null;
                    }
                    if (!proto) {
                        proto = klass;
                        klass = null;
                    }
                    proto = proto || {};
                    var _super_class = this,
                        _super = this.prototype,
                        parts, current, _fullName, _shortName, name, shortName, namespace, prototype;
                    // Instantiate a base class (but only create the instance,
                    // don't run the init constructor).
                    prototype = this.instance();
                    // Copy the properties over onto the new prototype.
                    can.Construct._inherit(proto, _super, prototype);
                    // The dummy class constructor.

                    function Constructor() {
                        // All construction is actually done in the init method.
                        if (!initializing) {
                            return this.constructor !== Constructor &&
                            // We are being called without `new` or we are extending.
                            arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) :
                            // We are being called with `new`.
                            Constructor.newInstance.apply(Constructor, arguments);
                        }
                    }
                    // Copy old stuff onto class (can probably be merged w/ inherit)
                    for (name in _super_class) {
                        if (_super_class.hasOwnProperty(name)) {
                            Constructor[name] = _super_class[name];
                        }
                    }
                    // Copy new static properties on class.
                    can.Construct._inherit(klass, _super_class, Constructor);
                    // Setup namespaces.
                    if (fullName) {

                        parts = fullName.split('.');
                        shortName = parts.pop();
                        current = can.getObject(parts.join('.'), window, true);
                        namespace = current;
                        _fullName = can.underscore(fullName.replace(/\./g, "_"));
                        _shortName = can.underscore(shortName);



                        current[shortName] = Constructor;
                    }
                    // Set things that shouldn't be overwritten.
                    can.extend(Constructor, {
                            constructor: Constructor,
                            prototype: prototype,

                            namespace: namespace,

                            _shortName: _shortName,

                            fullName: fullName,
                            _fullName: _fullName
                        });
                    // Dojo and YUI extend undefined
                    if (shortName !== undefined) {
                        Constructor.shortName = shortName;
                    }
                    // Make sure our prototype looks nice.
                    Constructor.prototype.constructor = Constructor;
                    // Call the class `setup` and `init`
                    var t = [_super_class].concat(can.makeArray(arguments)),
                        args = Constructor.setup.apply(Constructor, t);
                    if (Constructor.init) {
                        Constructor.init.apply(Constructor, args || t);
                    }

                    return Constructor;
                }
            });

        can.Construct.prototype.setup = function() {};

        can.Construct.prototype.init = function() {};
        return can.Construct;
    })(__m17);

    // ## control/control.js
    var __m15 = (function(can) {
        // ## control.js
        // `can.Control`  
        // _Controller_

        // Binds an element, returns a function that unbinds.
        var bind = function(el, ev, callback) {

            can.bind.call(el, ev, callback);

            return function() {
                can.unbind.call(el, ev, callback);
            };
        },
            isFunction = can.isFunction,
            extend = can.extend,
            each = can.each,
            slice = [].slice,
            paramReplacer = /\{([^\}]+)\}/g,
            special = can.getObject("$.event.special", [can]) || {},

            // Binds an element, returns a function that unbinds.
            delegate = function(el, selector, ev, callback) {
                can.delegate.call(el, selector, ev, callback);
                return function() {
                    can.undelegate.call(el, selector, ev, callback);
                };
            },

            // Calls bind or unbind depending if there is a selector.
            binder = function(el, ev, callback, selector) {
                return selector ?
                    delegate(el, can.trim(selector), ev, callback) :
                    bind(el, ev, callback);
            },

            basicProcessor;

        var Control = can.Control = can.Construct(

            {
                // Setup pre-processes which methods are event listeners.

                setup: function() {

                    // Allow contollers to inherit "defaults" from super-classes as it 
                    // done in `can.Construct`
                    can.Construct.setup.apply(this, arguments);

                    // If you didn't provide a name, or are `control`, don't do anything.
                    if (can.Control) {

                        // Cache the underscored names.
                        var control = this,
                            funcName;

                        // Calculate and cache actions.
                        control.actions = {};
                        for (funcName in control.prototype) {
                            if (control._isAction(funcName)) {
                                control.actions[funcName] = control._action(funcName);
                            }
                        }
                    }
                },
                // Moves `this` to the first argument, wraps it with `jQuery` if it's an element
                _shifter: function(context, name) {

                    var method = typeof name === "string" ? context[name] : name;

                    if (!isFunction(method)) {
                        method = context[method];
                    }

                    return function() {
                        context.called = name;
                        return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
                    };
                },

                // Return `true` if is an action.

                _isAction: function(methodName) {

                    var val = this.prototype[methodName],
                        type = typeof val;
                    // if not the constructor
                    return (methodName !== 'constructor') &&
                    // and is a function or links to a function
                    (type === "function" || (type === "string" && isFunction(this.prototype[val]))) &&
                    // and is in special, a processor, or has a funny character
                    !! (special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
                },
                // Takes a method name and the options passed to a control
                // and tries to return the data necessary to pass to a processor
                // (something that binds things).

                _action: function(methodName, options) {

                    // If we don't have options (a `control` instance), we'll run this 
                    // later.  
                    paramReplacer.lastIndex = 0;
                    if (options || !paramReplacer.test(methodName)) {
                        // If we have options, run sub to replace templates `{}` with a
                        // value from the options or the window
                        var convertedName = options ? can.sub(methodName, this._lookup(options)) : methodName;
                        if (!convertedName) {

                            return null;
                        }
                        // If a `{}` template resolves to an object, `convertedName` will be
                        // an array
                        var arr = can.isArray(convertedName),

                            // Get the name
                            name = arr ? convertedName[1] : convertedName,

                            // Grab the event off the end
                            parts = name.split(/\s+/g),
                            event = parts.pop();

                        return {
                            processor: processors[event] || basicProcessor,
                            parts: [name, parts.join(" "), event],
                            delegate: arr ? convertedName[0] : undefined
                        };
                    }
                },
                _lookup: function(options) {
                    return [options, window];
                },
                // An object of `{eventName : function}` pairs that Control uses to 
                // hook up events auto-magically.

                processors: {},
                // A object of name-value pairs that act as default values for a 
                // control instance
                defaults: {}

            }, {

                // Sets `this.element`, saves the control in `data, binds event
                // handlers.

                setup: function(element, options) {

                    var cls = this.constructor,
                        pluginname = cls.pluginName || cls._fullName,
                        arr;

                    // Want the raw element here.
                    this.element = can.$(element);

                    if (pluginname && pluginname !== 'can_control') {
                        // Set element and `className` on element.
                        this.element.addClass(pluginname);
                    }

                    // Set up the 'controls' data on the element
                    arr = can.data(this.element, 'controls');
                    if (!arr) {
                        // If it does not exist, initialize it to an empty array
                        arr = [];
                        can.data(this.element, 'controls', arr);
                    }
                    arr.push(this);

                    // Option merging.

                    this.options = extend({}, cls.defaults, options);

                    // Bind all event handlers.
                    this.on();

                    // Gets passed into `init`.

                    return [this.element, this.options];
                },

                on: function(el, selector, eventName, func) {
                    if (!el) {

                        // Adds bindings.
                        this.off();

                        // Go through the cached list of actions and use the processor 
                        // to bind
                        var cls = this.constructor,
                            bindings = this._bindings,
                            actions = cls.actions,
                            element = this.element,
                            destroyCB = can.Control._shifter(this, "destroy"),
                            funcName, ready;

                        for (funcName in actions) {
                            // Only push if we have the action and no option is `undefined`
                            if (actions.hasOwnProperty(funcName) &&
                                (ready = actions[funcName] || cls._action(funcName, this.options))) {
                                bindings.push(ready.processor(ready.delegate || element,
                                        ready.parts[2], ready.parts[1], funcName, this));
                            }
                        }

                        // Setup to be destroyed...  
                        // don't bind because we don't want to remove it.
                        can.bind.call(element, "removed", destroyCB);
                        bindings.push(function(el) {
                            can.unbind.call(el, "removed", destroyCB);
                        });
                        return bindings.length;
                    }

                    // if `el` is a string, use that as `selector` and re-set it to this control's element...
                    if (typeof el === 'string') {
                        func = eventName;
                        eventName = selector;
                        selector = el;
                        el = this.element;
                    }

                    // ...otherwise, set `selector` to null
                    if (func === undefined) {
                        func = eventName;
                        eventName = selector;
                        selector = null;
                    }

                    if (typeof func === 'string') {
                        func = can.Control._shifter(this, func);
                    }

                    this._bindings.push(binder(el, eventName, func, selector));

                    return this._bindings.length;
                },
                // Unbinds all event handlers on the controller.

                off: function() {
                    var el = this.element[0];
                    each(this._bindings || [], function(value) {
                        value(el);
                    });
                    // Adds bindings.
                    this._bindings = [];
                },
                // Prepares a `control` for garbage collection

                destroy: function() {
                    //Control already destroyed
                    if (this.element === null) {

                        return;
                    }
                    var Class = this.constructor,
                        pluginName = Class.pluginName || Class._fullName,
                        controls;

                    // Unbind bindings.
                    this.off();

                    if (pluginName && pluginName !== 'can_control') {
                        // Remove the `className`.
                        this.element.removeClass(pluginName);
                    }

                    // Remove from `data`.
                    controls = can.data(this.element, "controls");
                    controls.splice(can.inArray(this, controls), 1);

                    can.trigger(this, "destroyed"); // In case we want to know if the `control` is removed.

                    this.element = null;
                }
            });

        var processors = can.Control.processors;
        // Processors do the binding.
        // They return a function that unbinds when called.
        // The basic processor that binds events.
        basicProcessor = function(el, event, selector, methodName, control) {
            return binder(el, event, can.Control._shifter(control, methodName), selector);
        };

        // Set common events to be processed as a `basicProcessor`
        each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup",
                "keypress", "mousedown", "mousemove", "mouseout", "mouseover",
                "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
                "focusout", "mouseenter", "mouseleave",
                // #104 - Add touch events as default processors
                // TOOD feature detect?
                "touchstart", "touchmove", "touchcancel", "touchend", "touchleave"
            ], function(v) {
                processors[v] = basicProcessor;
            });

        return Control;
    })(__m2, __m16);

    // ## util/bind/bind.js
    var __m20 = (function(can) {

        // ## Bind helpers
        can.bindAndSetup = function() {
            // Add the event to this object
            can.addEvent.apply(this, arguments);
            // If not initializing, and the first binding
            // call bindsetup if the function exists.
            if (!this._init) {
                if (!this._bindings) {
                    this._bindings = 1;
                    // setup live-binding
                    if (this._bindsetup) {
                        this._bindsetup();
                    }
                } else {
                    this._bindings++;
                }
            }
            return this;
        };
        can.unbindAndTeardown = function(ev, handler) {
            // Remove the event handler
            can.removeEvent.apply(this, arguments);
            if (this._bindings === null) {
                this._bindings = 0;
            } else {
                this._bindings--;
            }
            // If there are no longer any bindings and
            // there is a bindteardown method, call it.
            if (!this._bindings && this._bindteardown) {
                this._bindteardown();
            }
            return this;
        };
        return can;
    })(__m2);

    // ## util/batch/batch.js
    var __m21 = (function(can) {
        // Which batch of events this is for -- might not want to send multiple
        // messages on the same batch.  This is mostly for event delegation.
        var batchNum = 1,
            // how many times has start been called without a stop
            transactions = 0,
            // an array of events within a transaction
            batchEvents = [],
            stopCallbacks = [];
        can.batch = {

            start: function(batchStopHandler) {
                transactions++;
                if (batchStopHandler) {
                    stopCallbacks.push(batchStopHandler);
                }
            },

            stop: function(force, callStart) {
                if (force) {
                    transactions = 0;
                } else {
                    transactions--;
                }
                if (transactions === 0) {
                    var items = batchEvents.slice(0),
                        callbacks = stopCallbacks.slice(0),
                        i, len;
                    batchEvents = [];
                    stopCallbacks = [];
                    batchNum++;
                    if (callStart) {
                        can.batch.start();
                    }
                    for (i = 0, len = items.length; i < len; i++) {
                        can.trigger.apply(can, items[i]);
                    }
                    for (i = 0, len = callbacks.length; i < callbacks.length; i++) {
                        callbacks[i]();
                    }
                }
            },

            trigger: function(item, event, args) {
                // Don't send events if initalizing.
                if (!item._init) {
                    if (transactions === 0) {
                        return can.trigger(item, event, args);
                    } else {
                        event = typeof event === 'string' ? {
                            type: event
                        } : event;
                        event.batchNum = batchNum;
                        batchEvents.push([
                                item,
                                event,
                                args
                            ]);
                    }
                }
            }
        };
    })(__m3);

    // ## map/map.js
    var __m19 = (function(can, bind) {
        // ## map.js  
        // `can.Map`  
        // _Provides the observable pattern for JavaScript Objects._  
        // Removes all listeners.
        var bindToChildAndBubbleToParent = function(child, prop, parent) {
            can.listenTo.call(parent, child, "change", function() {
                // `batchTrigger` the type on this...
                var args = can.makeArray(arguments),
                    ev = args.shift();
                args[0] = (prop === "*" ? [parent.indexOf(child), args[0]] : [prop, args[0]])
                    .join(".");

                // track objects dispatched on this map		
                ev.triggeredNS = ev.triggeredNS || {};

                // if it has already been dispatched exit
                if (ev.triggeredNS[parent._cid]) {
                    return;
                }

                ev.triggeredNS[parent._cid] = true;
                // send change event with modified attr to parent	
                can.trigger(parent, ev, args);
                // send modified attr event to parent
                //can.trigger(parent, args[0], args);
            });
        };
        var makeBindSetup = function(wildcard) {
            return function() {
                var parent = this;
                this._each(function(child, prop) {
                    if (child && child.bind) {
                        bindToChildAndBubbleToParent(child, wildcard || prop, parent);
                    }
                });
            };
        };
        // A map that temporarily houses a reference
        // to maps that have already been made for a plain ole JS object
        var madeMap = null;
        var teardownMap = function() {
            for (var cid in madeMap) {
                if (madeMap[cid].added) {
                    delete madeMap[cid].obj._cid;
                }
            }
            madeMap = null;
        };
        var getMapFromObject = function(obj) {
            return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
        };


        var Map = can.Map = can.Construct.extend({

                setup: function() {

                    can.Construct.setup.apply(this, arguments);

                    if (can.Map) {
                        if (!this.defaults) {
                            this.defaults = {};
                        }
                        // a list of the compute properties
                        this._computes = [];
                        for (var prop in this.prototype) {
                            if (typeof this.prototype[prop] !== "function") {
                                this.defaults[prop] = this.prototype[prop];
                            } else if (this.prototype[prop].isComputed) {
                                this._computes.push(prop);
                            }
                        }
                    }
                    // if we inerit from can.Map, but not can.List
                    if (can.List && !(this.prototype instanceof can.List)) {
                        this.List = Map.List({
                                Map: this
                            }, {});
                    }

                },
                _computes: [],
                // keep so it can be overwritten
                bind: can.bindAndSetup,
                on: can.bindAndSetup,
                unbind: can.unbindAndTeardown,
                off: can.unbindAndTeardown,
                id: "id",
                helpers: {
                    attrParts: function(attr, keepKey) {
                        if (keepKey) {
                            return [attr];
                        }
                        return can.isArray(attr) ? attr : ("" + attr)
                            .split(".");
                    },

                    addToMap: function(obj, instance) {
                        var teardown;
                        if (!madeMap) {
                            teardown = teardownMap;
                            madeMap = {};
                        }
                        // record if it has a Cid before we add one
                        var hasCid = obj._cid;
                        var cid = can.cid(obj);

                        // only update if there already isn't one
                        if (!madeMap[cid]) {

                            madeMap[cid] = {
                                obj: obj,
                                instance: instance,
                                added: !hasCid
                            };
                        }
                        return teardown;
                    },

                    canMakeObserve: function(obj) {
                        return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj) || (obj instanceof can.Map));
                    },
                    unhookup: function(items, parent) {
                        return can.each(items, function(item) {
                            if (item && item.unbind) {
                                can.stopListening.call(parent, item, "change");
                            }
                        });
                    },
                    // Listens to changes on `child` and "bubbles" the event up.
                    // `child` - The object to listen for changes on.
                    // `prop` - The property name is at on.
                    // `parent` - The parent object of prop.
                    // `ob` - (optional) The Map object constructor
                    // `list` - (optional) The observable list constructor
                    hookupBubble: function(child, prop, parent, Ob, List) {
                        Ob = Ob || Map;
                        List = List || can.List;
                        prop = typeof prop === 'function' ? prop() : prop;

                        // If it's an `array` make a list, otherwise a child.
                        if (child instanceof Map) {
                            // We have an `map` already...
                            // Make sure it is not listening to this already
                            // It's only listening if it has bindings already.
                            if (parent._bindings) {
                                Map.helpers.unhookup([child], parent);
                            }
                        } else if (can.isArray(child)) {
                            child = getMapFromObject(child) || new List(child);
                        } else {
                            child = getMapFromObject(child) || new Ob(child);
                        }

                        // only listen if something is listening to you
                        if (parent._bindings) {
                            // Listen to all changes and `batchTrigger` upwards.
                            bindToChildAndBubbleToParent(child, prop, parent);
                        }

                        return child;
                    },
                    // A helper used to serialize an `Map` or `Map.List`.
                    // `map` - The observable.
                    // `how` - To serialize with `attr` or `serialize`.
                    // `where` - To put properties, in an `{}` or `[]`.
                    serialize: function(map, how, where) {
                        // Go through each property.
                        map.each(function(val, name) {
                            // If the value is an `object`, and has an `attrs` or `serialize` function.
                            where[name] = Map.helpers.canMakeObserve(val) && can.isFunction(val[how]) ?
                            // Call `attrs` or `serialize` to get the original data back.
                            val[how]() :
                            // Otherwise return the value.
                            val;

                            can.__reading(map, name);
                        });

                        can.__reading(map, '__keys');

                        return where;
                    },
                    makeBindSetup: makeBindSetup
                },

                // starts collecting events
                // takes a callback for after they are updated
                // how could you hook into after ejs

                keys: function(map) {
                    var keys = [];
                    can.__reading(map, '__keys');
                    for (var keyName in map._data) {
                        keys.push(keyName);
                    }
                    return keys;
                }
            },

            {
                setup: function(obj) {
                    // `_data` is where we keep the properties.
                    this._data = {};

                    // The namespace this `object` uses to listen to events.
                    can.cid(this, ".map");
                    // Sets all `attrs`.
                    this._init = 1;
                    this._setupComputes();
                    var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);

                    var data = can.extend(can.extend(true, {}, this.constructor.defaults || {}), obj);
                    this.attr(data);

                    if (teardownMapping) {
                        teardownMapping();
                    }

                    this.bind('change', can.proxy(this._changes, this));

                    delete this._init;
                },

                _setupComputes: function() {
                    var computes = this.constructor._computes;
                    this._computedBindings = {};
                    for (var i = 0, len = computes.length, prop; i < len; i++) {
                        prop = computes[i];
                        this[prop] = this[prop].clone(this);
                        this._computedBindings[prop] = {
                            count: 0
                        };
                    }
                },
                _bindsetup: makeBindSetup(),
                _bindteardown: function() {
                    var self = this;
                    this._each(function(child) {
                        Map.helpers.unhookup([child], self);
                    });
                },
                _changes: function(ev, attr, how, newVal, oldVal) {
                    // when a change happens, forward the event
                    can.batch.trigger(this, {
                            type: attr,
                            batchNum: ev.batchNum
                        }, [newVal, oldVal]);
                },
                _triggerChange: function(attr, how, newVal, oldVal) {
                    can.batch.trigger(this, "change", can.makeArray(arguments));
                },
                // no live binding iterator
                _each: function(callback) {
                    var data = this.__get();
                    for (var prop in data) {
                        if (data.hasOwnProperty(prop)) {
                            callback(data[prop], prop);
                        }
                    }
                },

                attr: function(attr, val) {
                    // This is super obfuscated for space -- basically, we're checking
                    // if the type of the attribute is not a `number` or a `string`.
                    var type = typeof attr;
                    if (type !== "string" && type !== "number") {
                        return this._attrs(attr, val);
                    } else if (arguments.length === 1) { // If we are getting a value.
                        // Let people know we are reading.
                        can.__reading(this, attr);
                        return this._get(attr);
                    } else {
                        // Otherwise we are setting.
                        this._set(attr, val);
                        return this;
                    }
                },

                each: function() {
                    can.__reading(this, '__keys');
                    return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)));
                },

                removeAttr: function(attr) {
                    // Info if this is List or not
                    var isList = can.List && this instanceof can.List,
                        // Convert the `attr` into parts (if nested).
                        parts = can.Map.helpers.attrParts(attr),
                        // The actual property to remove.
                        prop = parts.shift(),
                        // The current value.
                        current = isList ? this[prop] : this._data[prop];

                    // If we have more parts, call `removeAttr` on that part.
                    if (parts.length && current) {
                        return current.removeAttr(parts);
                    } else {
                        if ( !! ~attr.indexOf('.')) {
                            prop = attr;
                        }
                        if (isList) {
                            this.splice(prop, 1);
                        } else if (prop in this._data) {
                            // Otherwise, `delete`.
                            delete this._data[prop];
                            // Create the event.
                            if (!(prop in this.constructor.prototype)) {
                                delete this[prop];
                            }
                            // Let others know the number of keys have changed
                            can.batch.trigger(this, "__keys");
                            this._triggerChange(prop, "remove", undefined, current);

                        }
                        return current;
                    }
                },
                // Reads a property from the `object`.
                _get: function(attr) {
                    var value;
                    if (typeof attr === 'string' && !! ~attr.indexOf('.')) {
                        value = this.__get(attr);
                        if (value !== undefined) {
                            return value;
                        }
                    }

                    // break up the attr (`"foo.bar"`) into `["foo","bar"]`
                    var parts = can.Map.helpers.attrParts(attr),
                        // get the value of the first attr name (`"foo"`)
                        current = this.__get(parts.shift());
                    // if there are other attributes to read
                    return parts.length ?
                    // and current has a value
                    current ?
                    // lookup the remaining attrs on current
                    current._get(parts) :
                    // or if there's no current, return undefined
                    undefined :
                    // if there are no more parts, return current
                    current;
                },
                // Reads a property directly if an `attr` is provided, otherwise
                // returns the "real" data object itself.
                __get: function(attr) {
                    if (attr) {
                        if (this[attr] && this[attr].isComputed && can.isFunction(this.constructor.prototype[attr])) {
                            return this[attr]();
                        } else {
                            return this._data[attr];
                        }
                    } else {
                        return this._data;
                    }
                },
                // Sets `attr` prop as value on this object where.
                // `attr` - Is a string of properties or an array  of property values.
                // `value` - The raw value to set.
                _set: function(attr, value, keepKey) {
                    // Convert `attr` to attr parts (if it isn't already).
                    var parts = can.Map.helpers.attrParts(attr, keepKey),
                        // The immediate prop we are setting.
                        prop = parts.shift(),
                        // The current value.
                        current = this.__get(prop);

                    // If we have an `object` and remaining parts.
                    if (parts.length && Map.helpers.canMakeObserve(current)) {
                        // That `object` should set it (this might need to call attr).
                        current._set(parts, value);
                    } else if (!parts.length) {
                        // We're in "real" set territory.
                        if (this.__convert) {
                            value = this.__convert(prop, value);
                        }
                        this.__set(prop, value, current);
                    } else {
                        throw "can.Map: Object does not exist";
                    }
                },
                __set: function(prop, value, current) {

                    // Otherwise, we are setting it on this `object`.
                    // TODO: Check if value is object and transform
                    // are we changing the value.
                    if (value !== current) {
                        // Check if we are adding this for the first time --
                        // if we are, we need to create an `add` event.
                        var changeType = this.__get()
                            .hasOwnProperty(prop) ? "set" : "add";

                        // Set the value on data.
                        this.___set(prop,

                            // If we are getting an object.
                            Map.helpers.canMakeObserve(value) ?

                            // Hook it up to send event.
                            Map.helpers.hookupBubble(value, prop, this) :
                            // Value is normal.
                            value);

                        if (changeType === "add") {
                            // If there is no current value, let others know that
                            // the the number of keys have changed

                            can.batch.trigger(this, "__keys", undefined);

                        }
                        // `batchTrigger` the change event.
                        this._triggerChange(prop, changeType, value, current);

                        //can.batch.trigger(this, prop, [value, current]);
                        // If we can stop listening to our old value, do it.
                        if (current) {
                            Map.helpers.unhookup([current], this);
                        }
                    }

                },
                // Directly sets a property on this `object`.
                ___set: function(prop, val) {

                    if (this[prop] && this[prop].isComputed && can.isFunction(this.constructor.prototype[prop])) {
                        this[prop](val);
                    }

                    this._data[prop] = val;
                    // Add property directly for easy writing.
                    // Check if its on the `prototype` so we don't overwrite methods like `attrs`.
                    if (!(can.isFunction(this.constructor.prototype[prop]))) {
                        this[prop] = val;
                    }
                },


                bind: function(eventName, handler) {
                    var computedBinding = this._computedBindings && this._computedBindings[eventName];
                    if (computedBinding) {
                        if (!computedBinding.count) {
                            computedBinding.count = 1;
                            var self = this;
                            computedBinding.handler = function(ev, newVal, oldVal) {
                                can.batch.trigger(self, {
                                        type: eventName,
                                        batchNum: ev.batchNum
                                    }, [newVal, oldVal]);
                            };
                            this[eventName].bind("change", computedBinding.handler);
                        } else {
                            computedBinding.count++;
                        }

                    }
                    return can.bindAndSetup.apply(this, arguments);

                },

                unbind: function(eventName, handler) {
                    var computedBinding = this._computedBindings && this._computedBindings[eventName];
                    if (computedBinding) {
                        if (computedBinding.count === 1) {
                            computedBinding.count = 0;
                            this[eventName].unbind("change", computedBinding.handler);
                            delete computedBinding.handler;
                        } else {
                            computedBinding.count++;
                        }

                    }
                    return can.unbindAndTeardown.apply(this, arguments);

                },

                serialize: function() {
                    return can.Map.helpers.serialize(this, 'serialize', {});
                },

                _attrs: function(props, remove) {
                    if (props === undefined) {
                        return Map.helpers.serialize(this, 'attr', {});
                    }

                    props = can.simpleExtend({}, props);
                    var prop,
                        self = this,
                        newVal;
                    can.batch.start();
                    this.each(function(curVal, prop) {
                        // you can not have a _cid property!
                        if (prop === "_cid") {
                            return;
                        }
                        newVal = props[prop];

                        // If we are merging...
                        if (newVal === undefined) {
                            if (remove) {
                                self.removeAttr(prop);
                            }
                            return;
                        }

                        if (self.__convert) {
                            newVal = self.__convert(prop, newVal);
                        }

                        // if we're dealing with models, want to call _set to let converter run
                        if (newVal instanceof can.Map) {
                            self.__set(prop, newVal, curVal);
                            // if its an object, let attr merge
                        } else if (Map.helpers.canMakeObserve(curVal) && Map.helpers.canMakeObserve(newVal) && curVal.attr) {
                            curVal.attr(newVal, remove);
                            // otherwise just set
                        } else if (curVal !== newVal) {
                            self.__set(prop, newVal, curVal);
                        }

                        delete props[prop];
                    });
                    // Add remaining props.
                    for (prop in props) {
                        if (prop !== "_cid") {
                            newVal = props[prop];
                            this._set(prop, newVal, true);
                        }

                    }
                    can.batch.stop();
                    return this;
                },


                compute: function(prop) {
                    if (can.isFunction(this.constructor.prototype[prop])) {
                        return can.compute(this[prop], this);
                    } else {
                        var reads = prop.split("."),
                            last = reads.length - 1,
                            options = {
                                args: []
                            };
                        return can.compute(function(newVal) {
                            if (arguments.length) {
                                can.compute.read(this, reads.slice(0, last))
                                    .value.attr(reads[last], newVal);
                            } else {
                                return can.compute.read(this, reads, options)
                                    .value;
                            }
                        }, this);
                    }

                }
            });

        Map.prototype.on = Map.prototype.bind;
        Map.prototype.off = Map.prototype.unbind;

        return Map;
    })(__m2, __m20, __m16, __m21);

    // ## list/list.js
    var __m22 = (function(can, Map) {

        // Helpers for `observable` lists.
        var splice = [].splice,
            // test if splice works correctly
            spliceRemovesProps = (function() {
                // IE's splice doesn't remove properties
                var obj = {
                    0: "a",
                    length: 1
                };
                splice.call(obj, 0, 1);
                return !obj[0];
            })();

        var list = Map(

            {

                Map: Map

            },

            {
                setup: function(instances, options) {
                    this.length = 0;
                    can.cid(this, ".map");
                    this._init = 1;
                    instances = instances || [];
                    var teardownMapping;

                    if (can.isDeferred(instances)) {
                        this.replace(instances);
                    } else {
                        teardownMapping = instances.length && can.Map.helpers.addToMap(instances, this);
                        this.push.apply(this, can.makeArray(instances || []));
                    }

                    if (teardownMapping) {
                        teardownMapping();
                    }

                    // this change needs to be ignored
                    this.bind('change', can.proxy(this._changes, this));
                    can.simpleExtend(this, options);
                    delete this._init;
                },
                _triggerChange: function(attr, how, newVal, oldVal) {

                    Map.prototype._triggerChange.apply(this, arguments);
                    // `batchTrigger` direct add and remove events...
                    if (!~attr.indexOf('.')) {

                        if (how === 'add') {
                            can.batch.trigger(this, how, [newVal, +attr]);
                            can.batch.trigger(this, 'length', [this.length]);
                        } else if (how === 'remove') {
                            can.batch.trigger(this, how, [oldVal, +attr]);
                            can.batch.trigger(this, 'length', [this.length]);
                        } else {
                            can.batch.trigger(this, how, [newVal, +attr]);
                        }

                    }

                },
                __get: function(attr) {
                    return attr ? this[attr] : this;
                },
                ___set: function(attr, val) {
                    this[attr] = val;
                    if (+attr >= this.length) {
                        this.length = (+attr + 1);
                    }
                },
                _each: function(callback) {
                    var data = this.__get();
                    for (var i = 0; i < data.length; i++) {
                        callback(data[i], i);
                    }
                },
                _bindsetup: Map.helpers.makeBindSetup("*"),
                // Returns the serialized form of this list.

                serialize: function() {
                    return Map.helpers.serialize(this, 'serialize', []);
                },

                splice: function(index, howMany) {
                    var args = can.makeArray(arguments),
                        i;

                    for (i = 2; i < args.length; i++) {
                        var val = args[i];
                        if (Map.helpers.canMakeObserve(val)) {
                            args[i] = Map.helpers.hookupBubble(val, "*", this, this.constructor.Map, this.constructor);
                        }
                    }
                    if (howMany === undefined) {
                        howMany = args[1] = this.length - index;
                    }
                    var removed = splice.apply(this, args);

                    if (!spliceRemovesProps) {
                        for (i = this.length; i < removed.length + this.length; i++) {
                            delete this[i];
                        }
                    }

                    can.batch.start();
                    if (howMany > 0) {
                        this._triggerChange("" + index, "remove", undefined, removed);
                        Map.helpers.unhookup(removed, this);
                    }
                    if (args.length > 2) {
                        this._triggerChange("" + index, "add", args.slice(2), removed);
                    }
                    can.batch.stop();
                    return removed;
                },

                _attrs: function(items, remove) {
                    if (items === undefined) {
                        return Map.helpers.serialize(this, 'attr', []);
                    }

                    // Create a copy.
                    items = can.makeArray(items);

                    can.batch.start();
                    this._updateAttrs(items, remove);
                    can.batch.stop();
                },

                _updateAttrs: function(items, remove) {
                    var len = Math.min(items.length, this.length);

                    for (var prop = 0; prop < len; prop++) {
                        var curVal = this[prop],
                            newVal = items[prop];

                        if (Map.helpers.canMakeObserve(curVal) && Map.helpers.canMakeObserve(newVal)) {
                            curVal.attr(newVal, remove);
                            //changed from a coercion to an explicit
                        } else if (curVal !== newVal) {
                            this._set(prop, newVal);
                        } else {

                        }
                    }
                    if (items.length > this.length) {
                        // Add in the remaining props.
                        this.push.apply(this, items.slice(this.length));
                    } else if (items.length < this.length && remove) {
                        this.splice(items.length);
                    }
                }
            }),

            // Converts to an `array` of arguments.
            getArgs = function(args) {
                return args[0] && can.isArray(args[0]) ?
                    args[0] :
                    can.makeArray(args);
            };
        // Create `push`, `pop`, `shift`, and `unshift`
        can.each({

                push: "length",

                unshift: 0
            },
            // Adds a method
            // `name` - The method name.
            // `where` - Where items in the `array` should be added.

            function(where, name) {
                var orig = [][name];
                list.prototype[name] = function() {
                    // Get the items being added.
                    var args = [],
                        // Where we are going to add items.
                        len = where ? this.length : 0,
                        i = arguments.length,
                        res, val;

                    // Go through and convert anything to an `map` that needs to be converted.
                    while (i--) {
                        val = arguments[i];
                        args[i] = Map.helpers.canMakeObserve(val) ?
                            Map.helpers.hookupBubble(val, "*", this, this.constructor.Map, this.constructor) :
                            val;
                    }

                    // Call the original method.
                    res = orig.apply(this, args);

                    if (!this.comparator || args.length) {

                        this._triggerChange("" + len, "add", args, undefined);
                    }

                    return res;
                };
            });

        can.each({

                pop: "length",

                shift: 0
            },
            // Creates a `remove` type method

            function(where, name) {
                list.prototype[name] = function() {

                    var args = getArgs(arguments),
                        len = where && this.length ? this.length - 1 : 0;

                    var res = [][name].apply(this, args);

                    // Create a change where the args are
                    // `len` - Where these items were removed.
                    // `remove` - Items removed.
                    // `undefined` - The new values (there are none).
                    // `res` - The old, removed values (should these be unbound).
                    this._triggerChange("" + len, "remove", undefined, [res]);

                    if (res && res.unbind) {
                        can.stopListening.call(this, res, "change");
                    }
                    return res;
                };
            });

        can.extend(list.prototype, {

                indexOf: function(item, fromIndex) {
                    this.attr('length');
                    return can.inArray(item, this, fromIndex);
                },


                join: function() {
                    return [].join.apply(this.attr(), arguments);
                },


                reverse: function() {
                    var list = can.makeArray([].reverse.call(this));
                    this.replace(list);
                },


                slice: function() {
                    var temp = Array.prototype.slice.apply(this, arguments);
                    return new this.constructor(temp);
                },


                concat: function() {
                    var args = [];
                    can.each(can.makeArray(arguments), function(arg, i) {
                        args[i] = arg instanceof can.List ? arg.serialize() : arg;
                    });
                    return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
                },


                forEach: function(cb, thisarg) {
                    return can.each(this, cb, thisarg || this);
                },


                replace: function(newList) {
                    if (can.isDeferred(newList)) {
                        newList.then(can.proxy(this.replace, this));
                    } else {
                        this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));
                    }

                    return this;
                }
            });
        can.List = Map.List = list;
        return can.List;
    })(__m2, __m19);

    // ## compute/compute.js
    var __m23 = (function(can, bind) {

        // # can.compute

        // ## Reading Helpers
        // The following methods are used to call a function and know which observable events 
        // to listen to for changes. This is done by having every observable 
        // method that reads a value "broadcast" the corresponding 
        // event by calling `can.__reading(obserable, event)`. 
        // ### Observed
        // An "Observed" is an Object of observable objects and events that
        // need to be listened to to know when to check a function for updates.
        // It looks like 
        //     { 
        //       "map1|first": {obs: map, event: "first"},
        //       "map1|last" : {obs: map, event: "last"}
        //     }
        // Each pair is mapped so no duplicates will be listed. 
        // ### State
        // `can.__read` can call a function that ends up calling `can.__read` again.  For example,
        // a compute can read another compute.
        // To make sure we know each compute's "Observed" values, maintain a stack of
        // each `__read` call's Observed valeus.
        var stack = [];

        // Calls a function given a context and returns
        // the return value of the function and the observable properties and events
        // that were read. Example: `{value: 100, observed: Observed}`
        can.__read = function(func, self) {

            // Add an object that `can.__read` will write to.
            stack.push({});

            var value = func.call(self);

            return {
                value: value,
                observed: stack.pop()
            };
        };

        // When an observable value is read, it should call `can.__reading` to 
        // indicate which object and event should be listened to.
        can.__reading = function(obj, event) {
            // Add the observe and attr that was read
            // to `observed`
            if (stack.length) {
                stack[stack.length - 1][obj._cid + '|' + event] = {
                    obj: obj,
                    event: event + ""
                };
            }

        };
        // Clears and returns the current observables.
        can.__clearReading = function() {
            if (stack.length) {
                var ret = stack[stack.length - 1];
                stack[stack.length - 1] = {};
                return ret;
            }
        };
        // Specifies reading values.
        can.__setReading = function(o) {
            if (stack.length) {
                stack[stack.length - 1] = o;
            }
        };

        // Calls a function, and using it's "Observed", sets up bindings to call
        // `onchanged` when those events are triggered.
        // - func - the function to call.
        // - context - the `this` of the function.
        // - oldObserved - An object that contains what has been bound to
        // - onchanged - what to call when any change has happened
        var getValueAndBind = function(func, context, oldObserved, onchanged) {
            // Call the function, get the value and the observeds.
            var info = can.__read(func, context),
                // What needs to beound to.
                newObserveSet = info.observed,
                // A flag that is used to figure out if we are already observing on an event.
                obEv,
                name;

            // Go through what needs to be observed.
            for (name in newObserveSet) {

                if (oldObserved[name]) {
                    // If name has already been observed, remove from
                    // `oldObserved` to prevent event from being unbound later.
                    delete oldObserved[name];
                } else {
                    // If this has not been observed, listen to it.
                    obEv = newObserveSet[name];
                    obEv.obj.bind(obEv.event, onchanged);
                }
            }

            // Iterate through oldObserved, looking for observe/attributes
            // that are no longer being bound and unbind them.
            for (name in oldObserved) {
                obEv = oldObserved[name];
                obEv.obj.unbind(obEv.event, onchanged);
            }

            return info;
        };

        var updateOnChange = function(compute, newValue, oldValue, batchNum) {
            //console.log("update",compute._cid, newValue, oldValue)
            if (newValue !== oldValue) {
                can.batch.trigger(compute, batchNum ? {
                        type: "change",
                        batchNum: batchNum
                    } : 'change', [
                        newValue,
                        oldValue
                    ]);
            }
        };

        var setupComputeHandlers = function(compute, func, context, setCachedValue) {

            var readInfo,
                onchanged,
                batchNum;

            return {
                on: function(updater) {
                    if (!onchanged) {
                        onchanged = function(ev) {
                            if (compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {
                                // store the old value
                                var oldValue = readInfo.value;

                                // get the new value
                                readInfo = getValueAndBind(func, context, readInfo.observed, onchanged);

                                updater(readInfo.value, oldValue, ev.batchNum);

                                batchNum = batchNum = ev.batchNum;
                            }
                        };
                    }

                    readInfo = getValueAndBind(func, context, {}, onchanged);

                    setCachedValue(readInfo.value);

                    compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
                },
                off: function(updater) {
                    for (var name in readInfo.observed) {
                        var ob = readInfo.observed[name];
                        ob.obj.unbind(ob.event, onchanged);
                    }
                }
            };
        };

        var isObserve = function(obj) {
            return obj instanceof can.Map || obj && obj.__get;
        },
            k = function() {};
        // if no one is listening ... we can not calculate every time
        can.compute = function(getterSetter, context, eventName) {

            if (getterSetter && getterSetter.isComputed) {
                return getterSetter;
            }
            // the computed object
            var computed,
                // The following functions are overwritten depending on how compute() is called
                // a method to setup listening
                on = k,
                // a method to teardown listening
                off = k,
                // the current cached value (only valid if bound = true)
                value,
                // how to read the value
                get = function() {
                    return value;
                },
                // sets the value
                set = function(newVal) {
                    value = newVal;
                },
                setCached = set,
                // save for clone
                args = can.makeArray(arguments),
                updater = function(newValue, oldValue, batchNum) {
                    setCached(newValue);
                    updateOnChange(computed, newValue, oldValue, batchNum);
                },
                // the form of the arguments
                form;
            computed = function(newVal) {
                // setting ...
                if (arguments.length) {
                    // save a reference to the old value
                    var old = value;
                    // setter may return a value if
                    // setter is for a value maintained exclusively by this compute
                    var setVal = set.call(context, newVal, old);
                    // if this has dependencies return the current value
                    if (computed.hasDependencies) {
                        return get.call(context);
                    }
                    if (setVal === undefined) {
                        // it's possible, like with the DOM, setting does not
                        // fire a change event, so we must read
                        value = get.call(context);
                    } else {
                        value = setVal;
                    }
                    // fire the change
                    updateOnChange(computed, value, old);
                    return value;
                } else {
                    // Another compute wants to bind to this compute
                    if (stack.length && computed.canReadForChangeEvent !== false) {

                        // Tell the compute to listen to change on this computed
                        can.__reading(computed, 'change');
                        // We are going to bind on this compute.
                        // If we are not bound, we should bind so that
                        // we don't have to re-read to get the value of this compute.
                        if (!computed.bound) {
                            can.compute.temporarilyBind(computed);
                        }
                    }
                    // if we are bound, use the cached value
                    if (computed.bound) {
                        return value;
                    } else {
                        return get.call(context);
                    }
                }
            };
            if (typeof getterSetter === 'function') {
                set = getterSetter;
                get = getterSetter;
                computed.canReadForChangeEvent = eventName === false ? false : true;

                var handlers = setupComputeHandlers(computed, getterSetter, context || this, setCached);
                on = handlers.on;
                off = handlers.off;

            } else if (context) {
                if (typeof context === 'string') {
                    // `can.compute(obj, "propertyName", [eventName])`
                    var propertyName = context,
                        isObserve = getterSetter instanceof can.Map;
                    if (isObserve) {
                        computed.hasDependencies = true;
                    }
                    get = function() {
                        if (isObserve) {
                            return getterSetter.attr(propertyName);
                        } else {
                            return getterSetter[propertyName];
                        }
                    };
                    set = function(newValue) {
                        if (isObserve) {
                            getterSetter.attr(propertyName, newValue);
                        } else {
                            getterSetter[propertyName] = newValue;
                        }
                    };
                    var handler;
                    on = function(update) {
                        handler = function() {
                            update(get(), value);
                        };
                        can.bind.call(getterSetter, eventName || propertyName, handler);
                        // use can.__read because
                        // we should not be indicating that some parent
                        // reads this property if it happens to be binding on it
                        value = can.__read(get)
                            .value;
                    };
                    off = function() {
                        can.unbind.call(getterSetter, eventName || propertyName, handler);
                    };
                } else {
                    // `can.compute(initialValue, setter)`
                    if (typeof context === 'function') {
                        value = getterSetter;
                        set = context;
                        context = eventName;
                        form = 'setter';
                    } else {
                        // `can.compute(initialValue,{get:, set:, on:, off:})`
                        value = getterSetter;
                        var options = context,
                            oldUpdater = updater;

                        updater = function() {
                            var newVal = get.call(context);
                            oldUpdater(newVal, value);
                        };
                        get = options.get || get;
                        set = options.set || set;
                        on = options.on || on;
                        off = options.off || off;
                    }
                }
            } else {
                // `can.compute(5)`
                value = getterSetter;
            }
            can.cid(computed, 'compute');
            return can.simpleExtend(computed, {

                    isComputed: true,
                    _bindsetup: function() {
                        this.bound = true;
                        // setup live-binding
                        // while binding, this does not count as a read
                        var oldReading = can.__clearReading();
                        on.call(this, updater);
                        can.__setReading(oldReading);
                    },
                    _bindteardown: function() {
                        off.call(this, updater);
                        this.bound = false;
                    },

                    bind: can.bindAndSetup,

                    unbind: can.unbindAndTeardown,
                    clone: function(context) {
                        if (context) {
                            if (form === 'setter') {
                                args[2] = context;
                            } else {
                                args[1] = context;
                            }
                        }
                        return can.compute.apply(can, args);
                    }
                });
        };
        // a list of temporarily bound computes
        var computes, unbindComputes = function() {
                for (var i = 0, len = computes.length; i < len; i++) {
                    computes[i].unbind('change', k);
                }
                computes = null;
            };
        // Binds computes for a moment to retain their value and prevent caching
        can.compute.temporarilyBind = function(compute) {
            compute.bind('change', k);
            if (!computes) {
                computes = [];
                setTimeout(unbindComputes, 10);
            }
            computes.push(compute);
        };

        can.compute.truthy = function(compute) {
            return can.compute(function() {
                var res = compute();
                if (typeof res === 'function') {
                    res = res();
                }
                return !!res;
            });
        };
        // {map: new can.Map({first: "Justin"})}, ["map","first"]
        can.compute.read = function(parent, reads, options) {
            options = options || {};
            // `cur` is the current value.
            var cur = parent,
                type,
                // `prev` is the object we are reading from.
                prev,
                // `foundObs` did we find an observable.
                foundObs;
            for (var i = 0, readLength = reads.length; i < readLength; i++) {
                // Update what we are reading from.
                prev = cur;
                // Read from the compute. We can't read a property yet.
                if (prev && prev.isComputed) {
                    if (options.foundObservable) {
                        options.foundObservable(prev, i);
                    }
                    prev = prev();
                }
                // Look to read a property from something.
                if (isObserve(prev)) {
                    if (!foundObs && options.foundObservable) {
                        options.foundObservable(prev, i);
                    }
                    foundObs = 1;
                    // is it a method on the prototype?
                    if (typeof prev[reads[i]] === 'function' && prev.constructor.prototype[reads[i]] === prev[reads[i]]) {
                        // call that method
                        if (options.returnObserveMethods) {
                            cur = cur[reads[i]];
                        } else if (reads[i] === 'constructor' && prev instanceof can.Construct) {
                            cur = prev[reads[i]];
                        } else {
                            cur = prev[reads[i]].apply(prev, options.args || []);
                        }
                    } else {
                        // use attr to get that value
                        cur = cur.attr(reads[i]);
                    }
                } else {
                    // just do the dot operator
                    cur = prev[reads[i]];
                }
                // If it's a compute, get the compute's value
                // unless we are at the end of the 
                if (cur && cur.isComputed && (!options.isArgument && i < readLength - 1)) {
                    if (!foundObs && options.foundObservable) {
                        options.foundObservable(prev, i + 1);
                    }
                    cur = cur();
                }
                type = typeof cur;
                // if there are properties left to read, and we don't have an object, early exit
                if (i < reads.length - 1 && (cur === null || type !== 'function' && type !== 'object')) {
                    if (options.earlyExit) {
                        options.earlyExit(prev, i, cur);
                    }
                    // return undefined so we know this isn't the right value
                    return {
                        value: undefined,
                        parent: prev
                    };
                }
            }
            // handle an ending function
            if (typeof cur === 'function') {
                if (options.isArgument) {
                    if (!cur.isComputed && options.proxyMethods !== false) {
                        cur = can.proxy(cur, prev);
                    }
                } else {
                    if (cur.isComputed && !foundObs && options.foundObservable) {
                        options.foundObservable(cur, i);
                    }
                    cur = cur.call(prev);
                }
            }
            // if we don't have a value, exit early.
            if (cur === undefined) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1);
                }
            }
            return {
                value: cur,
                parent: prev
            };
        };

        return can.compute;
    })(__m2, __m20, __m21);

    // ## observe/observe.js
    var __m18 = (function(can) {
        can.Observe = can.Map;
        can.Observe.startBatch = can.batch.start;
        can.Observe.stopBatch = can.batch.stop;
        can.Observe.triggerBatch = can.batch.trigger;
        return can;
    })(__m2, __m19, __m22, __m23);

    // ## view/scope/scope.js
    var __m25 = (function(can) {
        var escapeReg = /(\\)?\./g;
        var escapeDotReg = /\\\./g;
        var getNames = function(attr) {
            var names = [],
                last = 0;
            attr.replace(escapeReg, function(first, second, index) {
                if (!second) {
                    names.push(attr.slice(last, index)
                        .replace(escapeDotReg, '.'));
                    last = index + first.length;
                }
            });
            names.push(attr.slice(last)
                .replace(escapeDotReg, '.'));
            return names;
        };

        var Scope = can.Construct.extend(


            {
                // reads properties from a parent.  A much more complex version of getObject.

                read: can.compute.read
            },

            {
                init: function(context, parent) {
                    this._context = context;
                    this._parent = parent;
                    this.__cache = {};
                },

                attr: function(key) {
                    // reads for whatever called before attr.  It's possible
                    // that this.read clears them.  We want to restore them.
                    var previousReads = can.__clearReading(),
                        res = this.read(key, {
                                isArgument: true,
                                returnObserveMethods: true,
                                proxyMethods: false
                            })
                            .value;
                    can.__setReading(previousReads);
                    return res;
                },

                add: function(context) {
                    if (context !== this._context) {
                        return new this.constructor(context, this);
                    } else {
                        return this;
                    }
                },

                computeData: function(key, options) {
                    options = options || {
                        args: []
                    };
                    var self = this,
                        rootObserve,
                        rootReads,
                        // fastRead,
                        computeData = {
                            compute: can.compute(function(newVal) {
                                if (arguments.length) {
                                    // check that there's just a compute with nothing from it ...
                                    if (rootObserve.isComputed && !rootReads.length) {
                                        rootObserve(newVal);
                                    } else {
                                        var last = rootReads.length - 1;
                                        Scope.read(rootObserve, rootReads.slice(0, last))
                                            .value.attr(rootReads[last], newVal);
                                    }
                                } else {

                                    if (rootObserve) {
                                        return Scope.read(rootObserve, rootReads, options)
                                            .value;
                                    }
                                    // otherwise, go get the value
                                    var data = self.read(key, options);
                                    rootObserve = data.rootObserve;
                                    rootReads = data.reads;
                                    computeData.scope = data.scope;
                                    computeData.initialValue = data.value;

                                    return data.value;
                                }
                            })
                        };
                    return computeData;

                },

                compute: function(key, options) {
                    return this.computeData(key, options)
                        .compute;
                },

                read: function(attr, options) {
                    // check if we should only look within current scope
                    if (attr.substr(0, 2) === './') {
                        // set flag to halt lookup from walking up scope
                        this._stopLookup = true;
                        // stop lookup from checking parent scopes
                        return this.read(attr.substr(2), options);
                    }
                    // check if we should be running this on a parent.
                    else if (attr.substr(0, 3) === "../") {
                        return this._parent.read(attr.substr(3), options);
                    } else if (attr === "..") {
                        return {
                            value: this._parent._context
                        };
                    } else if (attr === "." || attr === "this") {
                        return {
                            value: this._context
                        };
                    }

                    // Split the name up.
                    var names = attr.indexOf('\\.') === -1 ?
                    // Reference doesn't contain escaped periods
                    attr.split('.')
                    // Reference contains escaped periods (`a.b\c.foo` == `a["b.c"].foo)
                    : getNames(attr),
                        // The current context (a scope is just data and a parent scope).
                        context,
                        // The current scope.
                        scope = this,
                        // While we are looking for a value, we track the most likely place this value will be found.  
                        // This is so if there is no me.name.first, we setup a listener on me.name.
                        // The most likely canidate is the one with the most "read matches" "lowest" in the
                        // context chain.
                        // By "read matches", we mean the most number of values along the key.
                        // By "lowest" in the context chain, we mean the closest to the current context.
                        // We track the starting position of the likely place with `defaultObserve`.
                        defaultObserve,
                        // Tracks how to read from the defaultObserve.
                        defaultReads = [],
                        // Tracks the highest found number of "read matches".
                        defaultPropertyDepth = -1,
                        // `scope.read` is designed to be called within a compute, but
                        // for performance reasons only listens to observables within one context.
                        // This is to say, if you have me.name in the current context, but me.name.first and
                        // we are looking for me.name.first, we don't setup bindings on me.name and me.name.first.
                        // To make this happen, we clear readings if they do not find a value.  But,
                        // if that path turns out to be the default read, we need to restore them.  This
                        // variable remembers those reads so they can be restored.
                        defaultComputeReadings,
                        // Tracks the default's scope.
                        defaultScope,
                        // Tracks the first found observe.
                        currentObserve,
                        // Tracks the reads to get the value for a scope.
                        currentReads;
                    // While there is a scope/context to look in.
                    while (scope) {
                        // get the context
                        context = scope._context;
                        if (context !== null) {
                            // Lets try this context
                            var data = Scope.read(context, names, can.simpleExtend({
                                        // Called when an observable is found.
                                        foundObservable: function(observe, nameIndex) {
                                            // Save the current observe.
                                            currentObserve = observe;
                                            currentReads = names.slice(nameIndex);
                                        },
                                        // Called when we were unable to find a value.
                                        earlyExit: function(parentValue, nameIndex) {
                                            // If this has more matching values,
                                            if (nameIndex > defaultPropertyDepth) {
                                                // save the state.
                                                defaultObserve = currentObserve;
                                                defaultReads = currentReads;
                                                defaultPropertyDepth = nameIndex;
                                                defaultScope = scope;
                                                // Clear and save readings so next attempt does not use these readings
                                                defaultComputeReadings = can.__clearReading();
                                            }
                                        }
                                    }, options));
                            // Found a matched reference.
                            if (data.value !== undefined) {
                                return {
                                    scope: scope,
                                    rootObserve: currentObserve,
                                    value: data.value,
                                    reads: currentReads
                                };
                            }
                        }
                        // Prevent prior readings.
                        can.__clearReading();

                        if (!this._stopLookup) {
                            // Move up to the next scope.
                            scope = scope._parent;
                        }

                        // a flag to set if we should stop walking up scope
                        this._stopLookup = false;
                    }

                    // If there was a likely observe.
                    if (defaultObserve) {
                        // Restore reading for previous compute
                        can.__setReading(defaultComputeReadings);
                        return {
                            scope: defaultScope,
                            rootObserve: defaultObserve,
                            reads: defaultReads,
                            value: undefined
                        };
                    } else {
                        // we found nothing and no observable
                        return {
                            names: names,
                            value: undefined
                        };
                    }
                }
            });
        can.view.Scope = Scope;
        return Scope;
    })(__m2, __m16, __m19, __m22, __m14, __m23);

    // ## view/elements.js
    var __m27 = (function(can) {


        var elements = {
            tagToContentPropMap: {
                option: 'textContent' in document.createElement('option') ? 'textContent' : 'innerText',
                textarea: 'value'
            },

            // 3.0 TODO: remove
            attrMap: can.attr.map,
            // matches the attrName of a regexp
            attrReg: /([^\s=]+)[\s]*=[\s]*/,
            // 3.0 TODO: remove
            defaultValue: can.attr.defaultValue,
            // a map of parent element to child elements

            tagMap: {
                '': 'span',
                table: 'tbody',
                tr: 'td',
                ol: 'li',
                ul: 'li',
                tbody: 'tr',
                thead: 'tr',
                tfoot: 'tr',
                select: 'option',
                optgroup: 'option'
            },
            // a tag's parent element
            reverseTagMap: {
                tr: 'tbody',
                option: 'select',
                td: 'tr',
                th: 'tr',
                li: 'ul'
            },
            // Used to determine the parentNode if el is directly within a documentFragment
            getParentNode: function(el, defaultParentNode) {
                return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
            },
            // 3.0 TODO: remove
            setAttr: can.attr.set,
            // 3.0 TODO: remove
            getAttr: can.attr.get,
            // 3.0 TODO: remove
            removeAttr: can.attr.remove,
            // Gets a "pretty" value for something
            contentText: function(text) {
                if (typeof text === 'string') {
                    return text;
                }
                // If has no value, return an empty string.
                if (!text && text !== 0) {
                    return '';
                }
                return '' + text;
            },

            after: function(oldElements, newFrag) {
                var last = oldElements[oldElements.length - 1];
                // Insert it in the `document` or `documentFragment`
                if (last.nextSibling) {
                    can.insertBefore(last.parentNode, newFrag, last.nextSibling);
                } else {
                    can.appendChild(last.parentNode, newFrag);
                }
            },

            replace: function(oldElements, newFrag) {
                elements.after(oldElements, newFrag);
                can.remove(can.$(oldElements));
            }
        };

        can.view.elements = elements;

        return elements;
    })(__m2, __m14);

    // ## view/scanner.js
    var __m26 = (function(can, elements, viewCallbacks) {


        var newLine = /(\r|\n)+/g,
            // Escapes characters starting with `\`.
            clean = function(content) {
                return content
                    .split('\\')
                    .join("\\\\")
                    .split("\n")
                    .join("\\n")
                    .split('"')
                    .join('\\"')
                    .split("\t")
                    .join("\\t");
            },
            // Returns a tagName to use as a temporary placeholder for live content
            // looks forward ... could be slow, but we only do it when necessary
            getTag = function(tagName, tokens, i) {
                // if a tagName is provided, use that
                if (tagName) {
                    return tagName;
                } else {
                    // otherwise go searching for the next two tokens like "<",TAG
                    while (i < tokens.length) {
                        if (tokens[i] === "<" && elements.reverseTagMap[tokens[i + 1]]) {
                            return elements.reverseTagMap[tokens[i + 1]];
                        }
                        i++;
                    }
                }
                return '';
            },
            bracketNum = function(content) {
                return (--content.split("{")
                    .length) - (--content.split("}")
                    .length);
            },
            myEval = function(script) {
                eval(script);
            },
            attrReg = /([^\s]+)[\s]*=[\s]*$/,
            // Commands for caching.
            startTxt = 'var ___v1ew = [];',
            finishTxt = "return ___v1ew.join('')",
            put_cmd = "___v1ew.push(\n",
            insert_cmd = put_cmd,
            // Global controls (used by other functions to know where we are).
            // Are we inside a tag?
            htmlTag = null,
            // Are we within a quote within a tag?
            quote = null,
            // What was the text before the current quote? (used to get the `attr` name)
            beforeQuote = null,
            // Whether a rescan is in progress
            rescan = null,
            getAttrName = function() {
                var matches = beforeQuote.match(attrReg);
                return matches && matches[1];
            },
            // Used to mark where the element is.
            status = function() {
                // `t` - `1`.
                // `h` - `0`.
                // `q` - String `beforeQuote`.
                return quote ? "'" + getAttrName() + "'" : (htmlTag ? 1 : 0);
            },
            // returns the top of a stack
            top = function(stack) {
                return stack[stack.length - 1];
            },
            Scanner;


        can.view.Scanner = Scanner = function(options) {
            // Set options on self
            can.extend(this, {

                    text: {},
                    tokens: []
                }, options);
            // make sure it's an empty string if it's not
            this.text.options = this.text.options || "";

            // Cache a token lookup
            this.tokenReg = [];
            this.tokenSimple = {
                "<": "<",
                ">": ">",
                '"': '"',
                "'": "'"
            };
            this.tokenComplex = [];
            this.tokenMap = {};
            for (var i = 0, token; token = this.tokens[i]; i++) {


                // Save complex mappings (custom regexp)
                if (token[2]) {
                    this.tokenReg.push(token[2]);
                    this.tokenComplex.push({
                            abbr: token[1],
                            re: new RegExp(token[2]),
                            rescan: token[3]
                        });
                }
                // Save simple mappings (string only, no regexp)
                else {
                    this.tokenReg.push(token[1]);
                    this.tokenSimple[token[1]] = token[0];
                }
                this.tokenMap[token[0]] = token[1];
            }

            // Cache the token registry.
            this.tokenReg = new RegExp("(" + this.tokenReg.slice(0)
                .concat(["<", ">", '"', "'"])
                .join("|") + ")", "g");
        };


        Scanner.prototype = {
            // a default that can be overwritten
            helpers: [],

            scan: function(source, name) {
                var tokens = [],
                    last = 0,
                    simple = this.tokenSimple,
                    complex = this.tokenComplex;

                source = source.replace(newLine, "\n");
                if (this.transform) {
                    source = this.transform(source);
                }
                source.replace(this.tokenReg, function(whole, part) {
                    // offset is the second to last argument
                    var offset = arguments[arguments.length - 2];

                    // if the next token starts after the last token ends
                    // push what's in between
                    if (offset > last) {
                        tokens.push(source.substring(last, offset));
                    }

                    // push the simple token (if there is one)
                    if (simple[whole]) {
                        tokens.push(whole);
                    }
                    // otherwise lookup complex tokens
                    else {
                        for (var i = 0, token; token = complex[i]; i++) {
                            if (token.re.test(whole)) {
                                tokens.push(token.abbr);
                                // Push a rescan function if one exists
                                if (token.rescan) {
                                    tokens.push(token.rescan(part));
                                }
                                break;
                            }
                        }
                    }

                    // update the position of the last part of the last token
                    last = offset + part.length;
                });

                // if there's something at the end, add it
                if (last < source.length) {
                    tokens.push(source.substr(last));
                }

                var content = '',
                    buff = [startTxt + (this.text.start || '')],
                    // Helper `function` for putting stuff in the view concat.
                    put = function(content, bonus) {
                        buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
                    },
                    // A stack used to keep track of how we should end a bracket
                    // `}`.
                    // Once we have a `<%= %>` with a `leftBracket`,
                    // we store how the file should end here (either `))` or `;`).
                    endStack = [],
                    // The last token, used to remember which tag we are in.
                    lastToken,
                    // The corresponding magic tag.
                    startTag = null,
                    // Was there a magic tag inside an html tag?
                    magicInTag = false,
                    // was there a special state
                    specialStates = {
                        attributeHookups: [],
                        // a stack of tagHookups
                        tagHookups: [],
                        //last tag hooked up
                        lastTagHookup: ''
                    },
                    // Helper `function` for removing tagHookups from the hookup stack
                    popTagHookup = function() {
                        // The length of tagHookups is the nested depth which can be used to uniquely identify custom tags of the same type
                        specialStates.lastTagHookup = specialStates.tagHookups.pop() + specialStates.tagHookups.length;
                    },
                    // The current tag name.
                    tagName = '',
                    // stack of tagNames
                    tagNames = [],
                    // Pop from tagNames?
                    popTagName = false,
                    // Declared here.
                    bracketCount,
                    // in a special attr like src= or style=
                    specialAttribute = false,

                    i = 0,
                    token,
                    tmap = this.tokenMap,
                    attrName;

                // Reinitialize the tag state goodness.
                htmlTag = quote = beforeQuote = null;
                for (;
                    (token = tokens[i++]) !== undefined;) {
                    if (startTag === null) {
                        switch (token) {
                            case tmap.left:
                            case tmap.escapeLeft:
                            case tmap.returnLeft:
                                magicInTag = htmlTag && 1;

                            case tmap.commentLeft:
                                // A new line -- just add whatever content within a clean.
                                // Reset everything.
                                startTag = token;
                                if (content.length) {
                                    put(content);
                                }
                                content = '';
                                break;
                            case tmap.escapeFull:
                                // This is a full line escape (a line that contains only whitespace and escaped logic)
                                // Break it up into escape left and right
                                magicInTag = htmlTag && 1;
                                rescan = 1;
                                startTag = tmap.escapeLeft;
                                if (content.length) {
                                    put(content);
                                }
                                rescan = tokens[i++];
                                content = rescan.content || rescan;
                                if (rescan.before) {
                                    put(rescan.before);
                                }
                                tokens.splice(i, 0, tmap.right);
                                break;
                            case tmap.commentFull:
                                // Ignore full line comments.
                                break;
                            case tmap.templateLeft:
                                content += tmap.left;
                                break;
                            case '<':
                                // Make sure we are not in a comment.
                                if (tokens[i].indexOf("!--") !== 0) {
                                    htmlTag = 1;
                                    magicInTag = 0;
                                }

                                content += token;

                                break;
                            case '>':
                                htmlTag = 0;
                                // content.substr(-1) doesn't work in IE7/8
                                var emptyElement = (content.substr(content.length - 1) === "/" || content.substr(content.length - 2) === "--"),
                                    attrs = "";
                                // if there was a magic tag
                                // or it's an element that has text content between its tags,
                                // but content is not other tags add a hookup
                                // TODO: we should only add `can.EJS.pending()` if there's a magic tag
                                // within the html tags.
                                if (specialStates.attributeHookups.length) {
                                    attrs = "attrs: ['" + specialStates.attributeHookups.join("','") + "'], ";
                                    specialStates.attributeHookups = [];
                                }
                                // this is the > of a special tag
                                // comparison to lastTagHookup makes sure the same custom tags can be nested
                                if ((tagName + specialStates.tagHookups.length) !== specialStates.lastTagHookup && tagName === top(specialStates.tagHookups)) {
                                    // If it's a self closing tag (like <content/>) make sure we put the / at the end.
                                    if (emptyElement) {
                                        content = content.substr(0, content.length - 1);
                                    }
                                    // Put the start of the end
                                    buff.push(put_cmd,
                                        '"', clean(content), '"',
                                        ",can.view.pending({tagName:'" + tagName + "'," + (attrs) + "scope: " + (this.text.scope || "this") + this.text.options);

                                    // if it's a self closing tag (like <content/>) close and end the tag
                                    if (emptyElement) {
                                        buff.push("}));");
                                        content = "/>";
                                        popTagHookup();
                                    }
                                    // if it's an empty tag	 
                                    else if (tokens[i] === "<" && tokens[i + 1] === "/" + tagName) {
                                        buff.push("}));");
                                        content = token;
                                        popTagHookup();
                                    } else {
                                        // it has content
                                        buff.push(",subtemplate: function(" + this.text.argNames + "){\n" + startTxt + (this.text.start || ''));
                                        content = '';
                                    }

                                } else if (magicInTag || (!popTagName && elements.tagToContentPropMap[tagNames[tagNames.length - 1]]) || attrs) {
                                    // make sure / of /> is on the right of pending
                                    var pendingPart = ",can.view.pending({" + attrs + "scope: " + (this.text.scope || "this") + this.text.options + "}),\"";
                                    if (emptyElement) {
                                        put(content.substr(0, content.length - 1), pendingPart + "/>\"");
                                    } else {
                                        put(content, pendingPart + ">\"");
                                    }
                                    content = '';
                                    magicInTag = 0;
                                } else {
                                    content += token;
                                }

                                // if it's a tag like <input/>
                                if (emptyElement || popTagName) {
                                    // remove the current tag in the stack
                                    tagNames.pop();
                                    // set the current tag to the previous parent
                                    tagName = tagNames[tagNames.length - 1];
                                    // Don't pop next time
                                    popTagName = false;
                                }
                                specialStates.attributeHookups = [];
                                break;
                            case "'":
                            case '"':
                                // If we are in an html tag, finding matching quotes.
                                if (htmlTag) {
                                    // We have a quote and it matches.
                                    if (quote && quote === token) {
                                        // We are exiting the quote.
                                        quote = null;
                                        // Otherwise we are creating a quote.
                                        // TODO: does this handle `\`?
                                        var attr = getAttrName();
                                        if (viewCallbacks.attr(attr)) {
                                            specialStates.attributeHookups.push(attr);
                                        }

                                        if (specialAttribute) {

                                            content += token;
                                            put(content);
                                            buff.push(finishTxt, "}));\n");
                                            content = "";
                                            specialAttribute = false;

                                            break;
                                        }

                                    } else if (quote === null) {
                                        quote = token;
                                        beforeQuote = lastToken;
                                        attrName = getAttrName();
                                        // TODO: check if there's magic!!!!
                                        if ((tagName === "img" && attrName === "src") || attrName === "style") {
                                            // put content that was before the attr name, but don't include the src=
                                            put(content.replace(attrReg, ""));
                                            content = "";

                                            specialAttribute = true;

                                            buff.push(insert_cmd, "can.view.txt(2,'" + getTag(tagName, tokens, i) + "'," + status() + ",this,function(){", startTxt);
                                            put(attrName + "=" + token);
                                            break;
                                        }

                                    }
                                }

                            default:
                                // Track the current tag
                                if (lastToken === '<') {

                                    tagName = token.substr(0, 3) === "!--" ?
                                        "!--" : token.split(/\s/)[0];

                                    var isClosingTag = false,
                                        cleanedTagName;

                                    if (tagName.indexOf("/") === 0) {
                                        isClosingTag = true;
                                        cleanedTagName = tagName.substr(1);
                                    }

                                    if (isClosingTag) { // </tag>

                                        // when we enter a new tag, pop the tag name stack
                                        if (top(tagNames) === cleanedTagName) {
                                            // set tagName to the last tagName
                                            // if there are no more tagNames, we'll rely on getTag.
                                            tagName = cleanedTagName;
                                            popTagName = true;
                                        }
                                        // if we are in a closing tag of a custom tag
                                        if (top(specialStates.tagHookups) === cleanedTagName) {

                                            // remove the last < from the content
                                            put(content.substr(0, content.length - 1));

                                            // finish the "section"
                                            buff.push(finishTxt + "}}) );");
                                            // the < belongs to the outside
                                            content = "><";
                                            popTagHookup();
                                        }

                                    } else {
                                        if (tagName.lastIndexOf("/") === tagName.length - 1) {
                                            tagName = tagName.substr(0, tagName.length - 1);

                                        }

                                        if (tagName !== "!--" && (viewCallbacks.tag(tagName))) {
                                            // if the content tag is inside something it doesn't belong ...
                                            if (tagName === "content" && elements.tagMap[top(tagNames)]) {
                                                // convert it to an element that will work
                                                token = token.replace("content", elements.tagMap[top(tagNames)]);
                                            }
                                            // we will hookup at the ending tag>
                                            specialStates.tagHookups.push(tagName);
                                        }

                                        tagNames.push(tagName);

                                    }

                                }
                                content += token;
                                break;
                        }
                    } else {
                        // We have a start tag.
                        switch (token) {
                            case tmap.right:
                            case tmap.returnRight:
                                switch (startTag) {
                                    case tmap.left:
                                        // Get the number of `{ minus }`
                                        bracketCount = bracketNum(content);

                                        // We are ending a block.
                                        if (bracketCount === 1) {
                                            // We are starting on. 
                                            buff.push(insert_cmd, 'can.view.txt(0,\'' + getTag(tagName, tokens, i) + '\',' + status() + ',this,function(){', startTxt, content);
                                            endStack.push({
                                                    before: "",
                                                    after: finishTxt + "}));\n"
                                                });
                                        } else {

                                            // How are we ending this statement?
                                            last = // If the stack has value and we are ending a block...
                                            endStack.length && bracketCount === -1 ? // Use the last item in the block stack.
                                            endStack.pop() : // Or use the default ending.
                                            {
                                                after: ";"
                                            };

                                            // If we are ending a returning block,
                                            // add the finish text which returns the result of the
                                            // block.
                                            if (last.before) {
                                                buff.push(last.before);
                                            }
                                            // Add the remaining content.
                                            buff.push(content, ";", last.after);
                                        }
                                        break;
                                    case tmap.escapeLeft:
                                    case tmap.returnLeft:
                                        // We have an extra `{` -> `block`.
                                        // Get the number of `{ minus }`.
                                        bracketCount = bracketNum(content);
                                        // If we have more `{`, it means there is a block.
                                        if (bracketCount) {
                                            // When we return to the same # of `{` vs `}` end with a `doubleParent`.
                                            endStack.push({
                                                    before: finishTxt,
                                                    after: "}));\n"
                                                });
                                        }

                                        var escaped = startTag === tmap.escapeLeft ? 1 : 0,
                                            commands = {
                                                insert: insert_cmd,
                                                tagName: getTag(tagName, tokens, i),
                                                status: status(),
                                                specialAttribute: specialAttribute
                                            };

                                        for (var ii = 0; ii < this.helpers.length; ii++) {
                                            // Match the helper based on helper
                                            // regex name value
                                            var helper = this.helpers[ii];
                                            if (helper.name.test(content)) {
                                                content = helper.fn(content, commands);

                                                // dont escape partials
                                                if (helper.name.source === /^>[\s]*\w*/.source) {
                                                    escaped = 0;
                                                }
                                                break;
                                            }
                                        }

                                        // Handle special cases
                                        if (typeof content === 'object') {

                                            if (content.startTxt && content.end && specialAttribute) {
                                                buff.push(insert_cmd, "can.view.toStr( ", content.content, '() ) );');

                                            } else {

                                                if (content.startTxt) {
                                                    buff.push(insert_cmd, "can.view.txt(\n" +
                                                        (typeof status() === "string" || (content.escaped != null ? content.escaped : escaped)) + ",\n'" + tagName + "',\n" + status() + ",\nthis,\n");
                                                } else if (content.startOnlyTxt) {
                                                    buff.push(insert_cmd, 'can.view.onlytxt(this,\n');
                                                }
                                                buff.push(content.content);
                                                if (content.end) {
                                                    buff.push('));');
                                                }

                                            }

                                        } else if (specialAttribute) {

                                            buff.push(insert_cmd, content, ');');

                                        } else {
                                            // If we have `<%== a(function(){ %>` then we want
                                            // `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.

                                            buff.push(insert_cmd, "can.view.txt(\n" + (typeof status() === "string" || escaped) +
                                                ",\n'" + tagName + "',\n" + status() + ",\nthis,\nfunction(){ " +
                                                (this.text.escape || '') +
                                                "return ", content,
                                                // If we have a block.
                                                bracketCount ?
                                                // Start with startTxt `"var _v1ew = [];"`.
                                                startTxt :
                                                // If not, add `doubleParent` to close push and text.
                                                "}));\n");



                                        }

                                        if (rescan && rescan.after && rescan.after.length) {
                                            put(rescan.after.length);
                                            rescan = null;
                                        }
                                        break;
                                }
                                startTag = null;
                                content = '';
                                break;
                            case tmap.templateLeft:
                                content += tmap.left;
                                break;
                            default:
                                content += token;
                                break;
                        }
                    }
                    lastToken = token;
                }

                // Put it together...
                if (content.length) {
                    // Should be `content.dump` in Ruby.
                    put(content);
                }
                buff.push(";");
                var template = buff.join(''),
                    out = {
                        out: (this.text.outStart || "") + template + " " + finishTxt + (this.text.outEnd || "")
                    };

                // Use `eval` instead of creating a function, because it is easier to debug.
                myEval.call(out, 'this.fn = (function(' + this.text.argNames + '){' + out.out + '});\r\n//# sourceURL=' + name + '.js');
                return out;
            }
        };

        // can.view.attr

        // This is called when there is a special tag
        can.view.pending = function(viewData) {
            // we need to call any live hookups
            // so get that and return the hook
            // a better system will always be called with the same stuff
            var hooks = can.view.getHooks();
            return can.view.hook(function(el) {
                can.each(hooks, function(fn) {
                    fn(el);
                });

                if (viewData.tagName) {
                    viewCallbacks.tagHandler(el, viewData.tagName, viewData);
                }

                can.each(viewData && viewData.attrs || [], function(attributeName) {
                    viewData.attributeName = attributeName;
                    var callback = viewCallbacks.attr(attributeName);
                    if (callback) {
                        callback(el, viewData);
                    }
                });

            });

        };

        can.view.tag("content", function(el, tagData) {
            return tagData.scope;
        });

        can.view.Scanner = Scanner;

        return Scanner;
    })(__m14, __m27, __m13);

    // ## view/node_lists/node_lists.js
    var __m30 = (function(can) {
        // In some browsers, text nodes can not take expando properties.
        // We test that here.
        var canExpando = true;
        try {
            document.createTextNode('')
                ._ = 0;
        } catch (ex) {
            canExpando = false;
        }
        // A mapping of element ids to nodeList id
        var nodeMap = {},
            // A mapping of ids to text nodes
            textNodeMap = {}, expando = 'ejs_' + Math.random(),
            _id = 0,
            id = function(node) {
                if (canExpando || node.nodeType !== 3) {
                    if (node[expando]) {
                        return node[expando];
                    } else {
                        ++_id;
                        return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
                    }
                } else {
                    for (var textNodeID in textNodeMap) {
                        if (textNodeMap[textNodeID] === node) {
                            return textNodeID;
                        }
                    }
                    ++_id;
                    textNodeMap['text_' + _id] = node;
                    return 'text_' + _id;
                }
            },
            splice = [].splice,
            push = [].push,
            itemsInChildListTree = function(list) {
                var count = 0;
                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i];
                    if (item.nodeType) {
                        count++;
                    } else {
                        count += itemsInChildListTree(item);
                    }
                }
                return count;
            };

        var nodeLists = {
            id: id,


            update: function(nodeList, newNodes) {
                // Unregister all childNodeLists.

                var oldNodes = nodeLists.unregisterChildren(nodeList);

                newNodes = can.makeArray(newNodes);

                var oldListLength = nodeList.length;

                // Replace oldNodeLists's contents'
                splice.apply(nodeList, [
                        0,
                        oldListLength
                    ].concat(newNodes));

                nodeLists.nestList(nodeList);

                return oldNodes;
            },
            nestList: function(list) {
                var index = 0;
                while (index < list.length) {
                    var node = list[index],
                        childNodeList = nodeMap[id(node)];
                    if (childNodeList) {

                        if (childNodeList !== list) {
                            // point this 
                            //childNodeList.
                            // point the next set of items to the nodeList that contains them
                            list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                        }

                    } else {
                        nodeMap[id(node)] = list;
                    }
                    index++;
                }
            },
            last: function(nodeList) {
                var last = nodeList[nodeList.length - 1];
                if (last.nodeType) {
                    return last;
                } else {
                    return nodeLists.last(last);
                }
            },
            first: function(nodeList) {
                var first = nodeList[0];
                if (first.nodeType) {
                    return first;
                } else {
                    return nodeLists.first(first);
                }
            },

            register: function(nodeList, unregistered, parent) {
                // add an id to the nodeList
                nodeList.unregistered = unregistered;

                nodeLists.nestList(nodeList);

                return nodeList;
            },
            unregisterChildren: function(nodeList) {
                var nodes = [];

                can.each(nodeList, function(node) {
                    if (node.nodeType) {
                        delete nodeMap[id(node)];
                        nodes.push(node);
                    } else {
                        push.apply(nodes, nodeLists.unregister(node));
                    }
                });
                return nodes;
            },
            // removes node in all parent nodes and unregisters all childNodes

            unregister: function(nodeList) {

                var nodes = nodeLists.unregisterChildren(nodeList);


                // this can unbind which will call itself
                if (nodeList.unregistered) {
                    var unregisteredCallback = nodeList.unregistered;
                    delete nodeList.unregistered;
                    unregisteredCallback();
                }

                return nodes;

            },
            nodeMap: nodeMap
        };

        can.view.nodeLists = nodeLists;

        return nodeLists;
    })(__m2, __m27);

    // ## view/parser/parser.js
    var __m31 = (function() {


        function makeMap(str) {
            var obj = {}, items = str.split(",");
            for (var i = 0; i < items.length; i++) {
                obj[items[i]] = true;
            }

            return obj;
        }

        var alphaNumericHU = "-A-Za-z0-9_",
            attributeNames = "[a-zA-Z_:][" + alphaNumericHU + ":.]+",
            spaceEQspace = "\\s*=\\s*",
            dblQuote2dblQuote = "\"((?:\\\\.|[^\"])*)\"",
            quote2quote = "'((?:\\\\.|[^'])*)'",
            attributeEqAndValue = "(?:" + spaceEQspace + "(?:" +
                "(?:\"[^\"]*\")|(?:'[^']*')|[^>\\s]+))?",
            matchStash = "\\{\\{[^\\}]*\\}\\}\\}?",
            stash = "\\{\\{([^\\}]*)\\}\\}\\}?",
            startTag = new RegExp("^<([" + alphaNumericHU + "]+)" +
                "(" +
                "(?:\\s*" +
                "(?:(?:" +
                "(?:" + attributeNames + ")?" +
                attributeEqAndValue + ")|" +
                "(?:" + matchStash + ")+)" +
                ")*" +
                ")\\s*(\\/?)>"),
            endTag = new RegExp("^<\\/([" + alphaNumericHU + "]+)[^>]*>"),
            attr = new RegExp("(?:" +
                "(?:(" + attributeNames + ")|" + stash + ")" +
                "(?:" + spaceEQspace +
                "(?:" +
                "(?:" + dblQuote2dblQuote + ")|(?:" + quote2quote + ")|([^>\\s]+)" +
                ")" +
                ")?)", "g"),
            mustache = new RegExp(stash, "g"),
            txtBreak = /<|\{\{/;

        // Empty Elements - HTML 5
        var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

        // Block Elements - HTML 5
        var block = makeMap("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

        // Inline Elements - HTML 5
        var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

        // Elements that you can, intentionally, leave open
        // (and which close themselves)
        var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

        // Attributes that have their values filled in disabled="disabled"
        var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

        // Special Elements (can contain anything)
        var special = makeMap("script,style");

        var HTMLParser = function(html, handler) {

            function parseStartTag(tag, tagName, rest, unary) {
                tagName = tagName.toLowerCase();

                if (block[tagName]) {
                    while (stack.last() && inline[stack.last()]) {
                        parseEndTag("", stack.last());
                    }
                }

                if (closeSelf[tagName] && stack.last() === tagName) {
                    parseEndTag("", tagName);
                }

                unary = empty[tagName] || !! unary;

                handler.start(tagName, unary);

                if (!unary) {
                    stack.push(tagName);
                }
                // find attribute or special
                HTMLParser.parseAttrs(rest, handler);

                handler.end(tagName, unary);

            }

            function parseEndTag(tag, tagName) {
                // If no tag name is provided, clean shop
                var pos;
                if (!tagName) {
                    pos = 0;
                }


                // Find the closest opened tag of the same type
                else {
                    for (pos = stack.length - 1; pos >= 0; pos--) {
                        if (stack[pos] === tagName) {
                            break;
                        }
                    }

                }


                if (pos >= 0) {
                    // Close all the open elements, up the stack
                    for (var i = stack.length - 1; i >= pos; i--) {
                        if (handler.close) {
                            handler.close(stack[i]);
                        }
                    }

                    // Remove the open elements from the stack
                    stack.length = pos;
                }
            }

            function parseMustache(mustache, inside) {
                if (handler.special) {
                    handler.special(inside);
                }
            }


            var index, chars, match, stack = [],
                last = html;
            stack.last = function() {
                return this[this.length - 1];
            };

            while (html) {
                chars = true;

                // Make sure we're not in a script or style element
                if (!stack.last() || !special[stack.last()]) {

                    // Comment
                    if (html.indexOf("<!--") === 0) {
                        index = html.indexOf("-->");

                        if (index >= 0) {
                            if (handler.comment) {
                                handler.comment(html.substring(4, index));
                            }
                            html = html.substring(index + 3);
                            chars = false;
                        }

                        // end tag
                    } else if (html.indexOf("</") === 0) {
                        match = html.match(endTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(endTag, parseEndTag);
                            chars = false;
                        }

                        // start tag
                    } else if (html.indexOf("<") === 0) {
                        match = html.match(startTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(startTag, parseStartTag);
                            chars = false;
                        }
                    } else if (html.indexOf("{{") === 0) {
                        match = html.match(mustache);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(mustache, parseMustache);
                        }
                    }

                    if (chars) {
                        index = html.search(txtBreak);

                        var text = index < 0 ? html : html.substring(0, index);
                        html = index < 0 ? "" : html.substring(index);

                        if (handler.chars && text) {
                            handler.chars(text);
                        }
                    }

                } else {
                    html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function(all, text) {
                        text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                        if (handler.chars) {
                            handler.chars(text);
                        }
                        return "";
                    });

                    parseEndTag("", stack.last());
                }

                if (html === last) {
                    throw "Parse Error: " + html;
                }

                last = html;
            }

            // Clean up any remaining tags
            parseEndTag();


            handler.done();
        };
        HTMLParser.parseAttrs = function(rest, handler) {


            (rest != null ? rest : "").replace(attr, function(text, name, special, dblQuote, singleQuote, val) {
                if (special) {
                    handler.special(special);

                }
                if (name || dblQuote || singleQuote || val) {
                    var value = arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                        arguments[5] ? arguments[5] :
                        fillAttrs[name.toLowerCase()] ? name : "";
                    handler.attrStart(name || "");

                    var last = mustache.lastIndex = 0,
                        res = mustache.exec(value),
                        chars;
                    while (res) {
                        chars = value.substring(
                            last,
                            mustache.lastIndex - res[0].length);
                        if (chars.length) {
                            handler.attrValue(chars);
                        }
                        handler.special(res[1]);
                        last = mustache.lastIndex;
                        res = mustache.exec(value);
                    }
                    chars = value.substr(
                        last,
                        value.length);
                    if (chars) {
                        handler.attrValue(chars);
                    }
                    handler.attrEnd(name || "");
                }


            });


        };

        can.view.parser = HTMLParser;

        return HTMLParser;

    })(__m14);

    // ## view/live/live.js
    var __m29 = (function(can, elements, view, nodeLists, parser) {

        elements = elements || can.view.elements;
        nodeLists = nodeLists || can.view.NodeLists;
        parser = parser || can.view.parser;

        // ## live.js
        // The live module provides live binding for computes
        // and can.List.
        // Currently, it's API is designed for `can/view/render`, but
        // it could easily be used for other purposes.
        // ### Helper methods
        // #### setup
        // `setup(HTMLElement, bind(data), unbind(data)) -> data`
        // Calls bind right away, but will call unbind
        // if the element is "destroyed" (removed from the DOM).
        var setup = function(el, bind, unbind) {
            // Removing an element can call teardown which
            // unregister the nodeList which calls teardown
            var tornDown = false,
                teardown = function() {
                    if (!tornDown) {
                        tornDown = true;
                        unbind(data);
                        can.unbind.call(el, 'removed', teardown);
                    }
                    return true;
                }, data = {
                    teardownCheck: function(parent) {
                        return parent ? false : teardown();
                    }
                };
            can.bind.call(el, 'removed', teardown);
            bind(data);
            return data;
        },
            // #### listen
            // Calls setup, but presets bind and unbind to
            // operate on a compute
            listen = function(el, compute, change) {
                return setup(el, function() {
                    compute.bind('change', change);
                }, function(data) {
                    compute.unbind('change', change);
                    if (data.nodeList) {
                        nodeLists.unregister(data.nodeList);
                    }
                });
            },
            // #### getAttributeParts
            // Breaks up a string like foo='bar' into ["foo","'bar'""]
            getAttributeParts = function(newVal) {
                var attrs = {},
                    attr;
                parser.parseAttrs(newVal, {
                        attrStart: function(name) {
                            attrs[name] = "";
                            attr = name;
                        },
                        attrValue: function(value) {
                            attrs[attr] += value;
                        },
                        attrEnd: function() {}
                    });
                return attrs;
            },
            splice = [].splice,
            isNode = function(obj) {
                return obj && obj.nodeType;
            },
            addTextNodeIfNoChildren = function(frag) {
                if (!frag.childNodes.length) {
                    frag.appendChild(document.createTextNode(""));
                }
            };

        var live = {

            list: function(el, compute, render, context, parentNode) {

                // A nodeList of all elements this live-list manages.
                // This is here so that if this live list is within another section
                // that section is able to remove the items in this list.
                var masterNodeList = [el],
                    // A mapping of items to their indicies'
                    indexMap = [],
                    // Called when items are added to the list.
                    add = function(ev, items, index) {
                        // Collect new html and mappings
                        var frag = document.createDocumentFragment(),
                            newNodeLists = [],
                            newIndicies = [];
                        // For each new item,
                        can.each(items, function(item, key) {
                            var itemIndex = can.compute(key + index),
                                // get its string content
                                itemHTML = render.call(context, item, itemIndex),
                                gotText = typeof itemHTML === "string",
                                // and convert it into elements.
                                itemFrag = can.frag(itemHTML);
                            // Add those elements to the mappings.

                            itemFrag = gotText ? can.view.hookup(itemFrag) : itemFrag;

                            var childNodes = can.makeArray(itemFrag.childNodes);



                            newNodeLists.push(nodeLists.register(childNodes));
                            // Hookup the fragment (which sets up child live-bindings) and
                            // add it to the collection of all added elements.
                            frag.appendChild(itemFrag);
                            // track indicies;
                            newIndicies.push(itemIndex);
                        });
                        // The position of elements is always after the initial text placeholder node
                        var masterListIndex = index + 1;


                        // Check if we are adding items at the end
                        if (!masterNodeList[masterListIndex]) {
                            elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                        } else {
                            // Add elements before the next index's first element.
                            var el = nodeLists.first(masterNodeList[masterListIndex]);
                            can.insertBefore(el.parentNode, frag, el);
                        }
                        splice.apply(masterNodeList, [
                                masterListIndex,
                                0
                            ].concat(newNodeLists));

                        // update indices after insert point
                        splice.apply(indexMap, [
                                index,
                                0
                            ].concat(newIndicies));

                        for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                            indexMap[i](i);
                        }
                    },
                    // Called when items are removed or when the bindings are torn down.
                    remove = function(ev, items, index, duringTeardown, fullTeardown) {
                        // If this is because an element was removed, we should
                        // check to make sure the live elements are still in the page.
                        // If we did this during a teardown, it would cause an infinite loop.
                        if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                            return;
                        }
                        var removedMappings = masterNodeList.splice(index + 1, items.length),
                            itemsToRemove = [];
                        can.each(removedMappings, function(nodeList) {

                            // Unregister to free up event bindings.
                            var nodesToRemove = nodeLists.unregister(nodeList);

                            // add items that we will remove all at once
                            [].push.apply(itemsToRemove, nodesToRemove);
                        });
                        // update indices after remove point
                        indexMap.splice(index, items.length);
                        for (var i = index, len = indexMap.length; i < len; i++) {
                            indexMap[i](i);
                        }
                        // don't remove elements during teardown.  Something else will probably be doing that.
                        if (!fullTeardown) {
                            can.remove(can.$(itemsToRemove));
                        }

                    },
                    // A text node placeholder
                    text = document.createTextNode(''),
                    // The current list.
                    list,
                    // Called when the list is replaced with a new list or the binding is torn-down.
                    teardownList = function(fullTeardown) {
                        // there might be no list right away, and the list might be a plain
                        // array
                        if (list && list.unbind) {
                            list.unbind('add', add)
                                .unbind('remove', remove);
                        }
                        // use remove to clean stuff up for us
                        remove({}, {
                                length: masterNodeList.length - 1
                            }, 0, true, fullTeardown);
                    },
                    // Called when the list is replaced or setup.
                    updateList = function(ev, newList, oldList) {
                        teardownList();
                        // make an empty list if the compute returns null or undefined
                        list = newList || [];
                        // list might be a plain array
                        if (list.bind) {
                            list.bind('add', add)
                                .bind('remove', remove);
                        }
                        add({}, list, 0);
                    };
                parentNode = elements.getParentNode(el, parentNode);
                // Setup binding and teardown to add and remove events
                var data = setup(parentNode, function() {
                    if (can.isFunction(compute)) {
                        compute.bind('change', updateList);
                    }
                }, function() {
                    if (can.isFunction(compute)) {
                        compute.unbind('change', updateList);
                    }
                    teardownList(true);
                });

                live.replace(masterNodeList, text, data.teardownCheck);
                // run the list setup
                updateList({}, can.isFunction(compute) ? compute() : compute);
            },

            html: function(el, compute, parentNode) {
                var data;
                parentNode = elements.getParentNode(el, parentNode);
                data = listen(parentNode, compute, function(ev, newVal, oldVal) {

                    // TODO: remove teardownCheck in 2.1
                    var attached = nodeLists.first(nodes).parentNode;
                    // update the nodes in the DOM with the new rendered value
                    if (attached) {
                        makeAndPut(newVal);
                    }
                    data.teardownCheck(nodeLists.first(nodes).parentNode);
                });

                var nodes = [el],
                    makeAndPut = function(val) {
                        var isString = !isNode(val),
                            frag = can.frag(val),
                            oldNodes = can.makeArray(nodes);

                        // Add a placeholder textNode if necessary.
                        addTextNodeIfNoChildren(frag);

                        if (isString) {
                            frag = can.view.hookup(frag, parentNode);
                        }
                        // We need to mark each node as belonging to the node list.
                        oldNodes = nodeLists.update(nodes, frag.childNodes);
                        elements.replace(oldNodes, frag);
                    };
                data.nodeList = nodes;

                // register the span so nodeLists knows the parentNodeList
                nodeLists.register(nodes, data.teardownCheck);
                makeAndPut(compute());
            },

            replace: function(nodes, val, teardown) {
                var oldNodes = nodes.slice(0),
                    frag = can.frag(val);
                nodeLists.register(nodes, teardown);


                if (typeof val === 'string') {
                    // if it was a string, check for hookups
                    frag = can.view.hookup(frag, nodes[0].parentNode);
                }
                // We need to mark each node as belonging to the node list.
                nodeLists.update(nodes, frag.childNodes);
                elements.replace(oldNodes, frag);
                return nodes;
            },

            text: function(el, compute, parentNode) {
                var parent = elements.getParentNode(el, parentNode);
                // setup listening right away so we don't have to re-calculate value
                var data = listen(parent, compute, function(ev, newVal, oldVal) {
                    // Sometimes this is 'unknown' in IE and will throw an exception if it is

                    if (typeof node.nodeValue !== 'unknown') {
                        node.nodeValue = can.view.toStr(newVal);
                    }

                    // TODO: remove in 2.1
                    data.teardownCheck(node.parentNode);
                }),
                    // The text node that will be updated
                    node = document.createTextNode(can.view.toStr(compute()));
                // Replace the placeholder with the live node and do the nodeLists thing.
                // Add that node to nodeList so we can remove it when the parent element is removed from the page
                data.nodeList = live.replace([el], node, data.teardownCheck);
            },
            setAttributes: function(el, newVal) {
                var attrs = getAttributeParts(newVal);
                for (var name in attrs) {
                    can.attr.set(el, name, attrs[name]);
                }
            },

            attributes: function(el, compute, currentValue) {
                var oldAttrs = {};

                var setAttrs = function(newVal) {
                    var newAttrs = getAttributeParts(newVal),
                        name;
                    for (name in newAttrs) {
                        var newValue = newAttrs[name],
                            oldValue = oldAttrs[name];
                        if (newValue !== oldValue) {
                            can.attr.set(el, name, newValue);
                        }
                        delete oldAttrs[name];
                    }
                    for (name in oldAttrs) {
                        elements.removeAttr(el, name);
                    }
                    oldAttrs = newAttrs;
                };
                listen(el, compute, function(ev, newVal) {
                    setAttrs(newVal);
                });
                // current value has been set
                if (arguments.length >= 3) {
                    oldAttrs = getAttributeParts(currentValue);
                } else {
                    setAttrs(compute());
                }
            },
            attributePlaceholder: '__!!__',
            attributeReplace: /__!!__/g,
            attribute: function(el, attributeName, compute) {
                listen(el, compute, function(ev, newVal) {
                    elements.setAttr(el, attributeName, hook.render());
                });
                var wrapped = can.$(el),
                    hooks;
                // Get the list of hookups or create one for this element.
                // Hooks is a map of attribute names to hookup `data`s.
                // Each hookup data has:
                // `render` - A `function` to render the value of the attribute.
                // `funcs` - A list of hookup `function`s on that attribute.
                // `batchNum` - The last event `batchNum`, used for performance.
                hooks = can.data(wrapped, 'hooks');
                if (!hooks) {
                    can.data(wrapped, 'hooks', hooks = {});
                }
                // Get the attribute value.
                var attr = elements.getAttr(el, attributeName),
                    // Split the attribute value by the template.
                    // Only split out the first __!!__ so if we have multiple hookups in the same attribute,
                    // they will be put in the right spot on first render
                    parts = attr.split(live.attributePlaceholder),
                    goodParts = [],
                    hook;
                goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
                // If we already had a hookup for this attribute...
                if (hooks[attributeName]) {
                    // Just add to that attribute's list of `function`s.
                    hooks[attributeName].computes.push(compute);
                } else {
                    // Create the hookup data.
                    hooks[attributeName] = {
                        render: function() {
                            var i = 0,
                                // attr doesn't have a value in IE
                                newAttr = attr ? attr.replace(live.attributeReplace, function() {
                                    return elements.contentText(hook.computes[i++]());
                                }) : elements.contentText(hook.computes[i++]());
                            return newAttr;
                        },
                        computes: [compute],
                        batchNum: undefined
                    };
                }
                // Save the hook for slightly faster performance.
                hook = hooks[attributeName];
                // Insert the value in parts.
                goodParts.splice(1, 0, compute());

                // Set the attribute.
                elements.setAttr(el, attributeName, goodParts.join(''));
            },
            specialAttribute: function(el, attributeName, compute) {
                listen(el, compute, function(ev, newVal) {
                    elements.setAttr(el, attributeName, getValue(newVal));
                });
                elements.setAttr(el, attributeName, getValue(compute()));
            },
            simpleAttribute: function(el, attributeName, compute) {
                listen(el, compute, function(ev, newVal) {
                    elements.setAttr(el, attributeName, newVal);
                });
                elements.setAttr(el, attributeName, compute());
            }
        };
        var newLine = /(\r|\n)+/g;
        var getValue = function(val) {
            var regexp = /^["'].*["']$/;
            val = val.replace(elements.attrReg, '')
                .replace(newLine, '');
            // check if starts and ends with " or '
            return regexp.test(val) ? val.substr(1, val.length - 2) : val;
        };
        can.view.live = live;

        return live;
    })(__m2, __m27, __m14, __m30, __m31);

    // ## view/render.js
    var __m28 = (function(can, elements, live) {


        var pendingHookups = [],
            tagChildren = function(tagName) {
                var newTag = elements.tagMap[tagName] || "span";
                if (newTag === "span") {
                    //innerHTML in IE doesn't honor leading whitespace after empty elements
                    return "@@!!@@";
                }
                return "<" + newTag + ">" + tagChildren(newTag) + "</" + newTag + ">";
            },
            contentText = function(input, tag) {

                // If it's a string, return.
                if (typeof input === 'string') {
                    return input;
                }
                // If has no value, return an empty string.
                if (!input && input !== 0) {
                    return '';
                }

                // If it's an object, and it has a hookup method.
                var hook = (input.hookup &&

                    // Make a function call the hookup method.

                    function(el, id) {
                        input.hookup.call(input, el, id);
                    }) ||

                // Or if it's a `function`, just use the input.
                (typeof input === 'function' && input);

                // Finally, if there is a `function` to hookup on some dom,
                // add it to pending hookups.
                if (hook) {
                    if (tag) {
                        return "<" + tag + " " + can.view.hook(hook) + "></" + tag + ">";
                    } else {
                        pendingHookups.push(hook);
                    }

                    return '';
                }

                // Finally, if all else is `false`, `toString()` it.
                return "" + input;
            },
            // Returns escaped/sanatized content for anything other than a live-binding
            contentEscape = function(txt, tag) {
                return (typeof txt === 'string' || typeof txt === 'number') ?
                    can.esc(txt) :
                    contentText(txt, tag);
            },
            // A flag to indicate if .txt was called within a live section within an element like the {{name}}
            // within `<div {{#person}}{{name}}{{/person}}/>`.
            withinTemplatedSectionWithinAnElement = false,
            emptyHandler = function() {};

        var lastHookups;

        can.extend(can.view, {
                live: live,
                // called in text to make a temporary 
                // can.view.lists function that can be called with
                // the list to iterate over and the template
                // used to produce the content within the list
                setupLists: function() {

                    var old = can.view.lists,
                        data;

                    can.view.lists = function(list, renderer) {
                        data = {
                            list: list,
                            renderer: renderer
                        };
                        return Math.random();
                    };
                    // sets back to the old data
                    return function() {
                        can.view.lists = old;
                        return data;
                    };
                },
                getHooks: function() {
                    var hooks = pendingHookups.slice(0);
                    lastHookups = hooks;
                    pendingHookups = [];
                    return hooks;
                },
                onlytxt: function(self, func) {
                    return contentEscape(func.call(self));
                },

                txt: function(escape, tagName, status, self, func) {
                    // the temporary tag needed for any live setup
                    var tag = (elements.tagMap[tagName] || "span"),
                        // should live-binding be setup
                        setupLiveBinding = false,
                        // the compute's value
                        value,
                        listData,
                        compute,
                        unbind = emptyHandler,
                        attributeName;

                    // Are we currently within a live section within an element like the {{name}}
                    // within `<div {{#person}}{{name}}{{/person}}/>`.
                    if (withinTemplatedSectionWithinAnElement) {
                        value = func.call(self);
                    } else {

                        // If this magic tag is within an attribute or an html element,
                        // set the flag to true so we avoid trying to live bind
                        // anything that func might be setup.
                        // TODO: the scanner should be able to set this up.
                        if (typeof status === "string" || status === 1) {
                            withinTemplatedSectionWithinAnElement = true;
                        }

                        // Sets up a listener so we know any can.view.lists called 
                        // when func is called
                        var listTeardown = can.view.setupLists();
                        unbind = function() {
                            compute.unbind("change", emptyHandler);
                        };
                        // Create a compute that calls func and looks for dependencies.
                        // By passing `false`, this compute can not be a dependency of other 
                        // computes.  This is because live-bits are nested, but 
                        // handle their own updating. For example:
                        //     {{#if items.length}}{{#items}}{{.}}{{/items}}{{/if}}
                        // We do not want `{{#if items.length}}` changing the DOM if
                        // `{{#items}}` text changes.
                        compute = can.compute(func, self, false);

                        // Bind to get and temporarily cache the value of the compute.
                        compute.bind("change", emptyHandler);

                        // Call the "wrapping" function and get the binding information
                        listData = listTeardown();

                        // Get the value of the compute
                        value = compute();

                        // Let people know we are no longer within an element.
                        withinTemplatedSectionWithinAnElement = false;

                        // If we should setup live-binding.
                        setupLiveBinding = compute.hasDependencies;
                    }

                    if (listData) {
                        unbind();
                        return "<" + tag + can.view.hook(function(el, parentNode) {
                            live.list(el, listData.list, listData.renderer, self, parentNode);
                        }) + "></" + tag + ">";
                    }

                    // If we had no observes just return the value returned by func.
                    if (!setupLiveBinding || typeof value === "function") {
                        unbind();
                        return ((withinTemplatedSectionWithinAnElement || escape === 2 || !escape) ?
                            contentText :
                            contentEscape)(value, status === 0 && tag);
                    }

                    // the property (instead of innerHTML elements) to adjust. For
                    // example options should use textContent
                    var contentProp = elements.tagToContentPropMap[tagName];

                    // The magic tag is outside or between tags.
                    if (status === 0 && !contentProp) {
                        // Return an element tag with a hookup in place of the content
                        return "<" + tag + can.view.hook(
                            // if value is an object, it's likely something returned by .safeString
                            escape && typeof value !== "object" ?
                            // If we are escaping, replace the parentNode with 
                            // a text node who's value is `func`'s return value.

                            function(el, parentNode) {
                                live.text(el, compute, parentNode);
                                unbind();
                            } :
                            // If we are not escaping, replace the parentNode with a
                            // documentFragment created as with `func`'s return value.

                            function(el, parentNode) {
                                live.html(el, compute, parentNode);
                                unbind();
                                //children have to be properly nested HTML for buildFragment to work properly
                            }) + ">" + tagChildren(tag) + "</" + tag + ">";
                        // In a tag, but not in an attribute
                    } else if (status === 1) {
                        // remember the old attr name
                        pendingHookups.push(function(el) {
                            live.attributes(el, compute, compute());
                            unbind();
                        });

                        return compute();
                    } else if (escape === 2) { // In a special attribute like src or style

                        attributeName = status;
                        pendingHookups.push(function(el) {
                            live.specialAttribute(el, attributeName, compute);
                            unbind();
                        });
                        return compute();
                    } else { // In an attribute...
                        attributeName = status === 0 ? contentProp : status;
                        // if the magic tag is inside the element, like `<option><% TAG %></option>`,
                        // we add this hookup to the last element (ex: `option`'s) hookups.
                        // Otherwise, the magic tag is in an attribute, just add to the current element's
                        // hookups.
                        (status === 0 ? lastHookups : pendingHookups)
                            .push(function(el) {
                                live.attribute(el, attributeName, compute);
                                unbind();
                            });
                        return live.attributePlaceholder;
                    }
                }
            });

        return can;
    })(__m14, __m27, __m29, __m17);

    // ## view/mustache/mustache.js
    var __m24 = (function(can) {

        // # mustache.js
        // `can.Mustache`: The Mustache templating engine.
        // See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
        // of the runtime render code design. The majority of the Mustache engine implementation 
        // occurs within the *Transformation* scanning helper.

        // ## Initialization
        // Define the view extension.
        can.view.ext = ".mustache";

        // ### Setup internal helper variables and functions.
        // An alias for the context variable used for tracking a stack of contexts.
        // This is also used for passing to helper functions to maintain proper context.
        var SCOPE = 'scope',
            // An alias for the variable used for the hash object that can be passed
            // to helpers via `options.hash`.
            HASH = '___h4sh',
            // An alias for the most used context stacking call.
            CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options}',
            // a context object used to incidate being special
            SPECIAL_CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options, special: true}',
            // argument names used to start the function (used by scanner and steal)
            ARG_NAMES = SCOPE + ",options",

            // matches arguments inside a {{ }}
            argumentsRegExp = /((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g,

            // matches a literal number, string, null or regexp
            literalNumberStringBooleanRegExp = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/,

            // returns an object literal that we can use to look up a value in the current scope
            makeLookupLiteral = function(type) {
                return '{get:"' + type.replace(/"/g, '\\"') + '"}';
            },
            // returns if the object is a lookup
            isLookup = function(obj) {
                return obj && typeof obj.get === "string";
            },


            isObserveLike = function(obj) {
                return obj instanceof can.Map || (obj && !! obj._get);
            },


            isArrayLike = function(obj) {
                return obj && obj.splice && typeof obj.length === 'number';
            },
            // used to make sure .fn and .inverse are always called with a Scope like object
            makeConvertToScopes = function(orignal, scope, options) {
                return function(updatedScope, updatedOptions) {
                    if (updatedScope !== undefined && !(updatedScope instanceof can.view.Scope)) {
                        updatedScope = scope.add(updatedScope);
                    }
                    if (updatedOptions !== undefined && !(updatedOptions instanceof can.view.Options)) {
                        updatedOptions = options.add(updatedOptions);
                    }
                    return orignal(updatedScope, updatedOptions || options);
                };
            };

        // ## Mustache

        var Mustache = function(options, helpers) {
            // Support calling Mustache without the constructor.
            // This returns a function that renders the template.
            if (this.constructor !== Mustache) {
                var mustache = new Mustache(options);
                return function(data, options) {
                    return mustache.render(data, options);
                };
            }

            // If we get a `function` directly, it probably is coming from
            // a `steal`-packaged view.
            if (typeof options === "function") {
                this.template = {
                    fn: options
                };
                return;
            }

            // Set options on self.
            can.extend(this, options);
            this.template = this.scanner.scan(this.text, this.name);
        };


        // Put Mustache on the `can` object.
        can.Mustache = window.Mustache = Mustache;


        Mustache.prototype.

        render = function(data, options) {
            if (!(data instanceof can.view.Scope)) {
                data = new can.view.Scope(data || {});
            }
            if (!(options instanceof can.view.Options)) {
                options = new can.view.Options(options || {});
            }
            options = options || {};

            return this.template.fn.call(data, data, options);
        };

        can.extend(Mustache.prototype, {
                // Share a singleton scanner for parsing templates.
                scanner: new can.view.Scanner({
                        // A hash of strings for the scanner to inject at certain points.
                        text: {
                            // This is the logic to inject at the beginning of a rendered template. 
                            // This includes initializing the `context` stack.
                            start: "", //"var "+SCOPE+"= this instanceof can.view.Scope? this : new can.view.Scope(this);\n",
                            scope: SCOPE,
                            options: ",options: options",
                            argNames: ARG_NAMES
                        },

                        // An ordered token registry for the scanner.
                        // This needs to be ordered by priority to prevent token parsing errors.
                        // Each token follows the following structure:
                        //		[
                        //			// Which key in the token map to match.
                        //			"tokenMapName",
                        //			// A simple token to match, like "{{".
                        //			"token",
                        //			// Optional. A complex (regexp) token to match that 
                        //			// overrides the simple token.
                        //			"[\\s\\t]*{{",
                        //			// Optional. A function that executes advanced 
                        //			// manipulation of the matched content. This is 
                        //			// rarely used.
                        //			function(content){   
                        //				return content;
                        //			}
                        //		]
                        tokens: [

                            // Return unescaped
                            ["returnLeft", "{{{", "{{[{&]"],
                            // Full line comments
                            ["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],

                            // Inline comments
                            ["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],

                            // Full line escapes
                            // This is used for detecting lines with only whitespace and an escaped tag
                            ["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)",
                                function(content) {
                                    return {
                                        before: /^\n.+?\n$/.test(content) ? '\n' : '',
                                        content: content.match(/\{\{(.+?)\}\}/)[1] || ''
                                    };
                                }
                            ],
                            // Return escaped
                            ["escapeLeft", "{{"],
                            // Close return unescaped
                            ["returnRight", "}}}"],
                            // Close tag
                            ["right", "}}"]
                        ],

                        // ## Scanning Helpers
                        // This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
                        //		{
                        //			// The content pattern to match in order to execute.
                        //			// Only the first matching helper is executed.
                        //			name: /pattern to match/,
                        //			// The function to transform the content with.
                        //			// @param {String} content   The content to transform.
                        //			// @param {Object} cmd       Scanner helper data.
                        //			//                           {
                        //			//                             insert: "insert command",
                        //			//                             tagName: "div",
                        //			//                             status: 0
                        //			//                           }
                        //			fn: function(content, cmd) {
                        //				return 'for text injection' || 
                        //					{ raw: 'to bypass text injection' };
                        //			}
                        //		}
                        helpers: [
                            // ### Partials
                            // Partials begin with a greater than sign, like {{> box}}.
                            // Partials are rendered at runtime (as opposed to compile time), 
                            // so recursive partials are possible. Just avoid infinite loops.
                            // For example, this template and partial:
                            // 		base.mustache:
                            // 			<h2>Names</h2>
                            // 			{{#names}}
                            // 				{{> user}}
                            // 			{{/names}}
                            // 		user.mustache:
                            // 			<strong>{{name}}</strong>
                            {
                                name: /^>[\s]*\w*/,
                                fn: function(content, cmd) {
                                    // Get the template name and call back into the render method,
                                    // passing the name and the current context.
                                    var templateName = can.trim(content.replace(/^>\s?/, ''))
                                        .replace(/["|']/g, "");
                                    return "can.Mustache.renderPartial('" + templateName + "'," + ARG_NAMES + ")";
                                }
                            },

                            // ### Data Hookup
                            // This will attach the data property of `this` to the element
                            // its found on using the first argument as the data attribute
                            // key.
                            // For example:
                            //		<li id="nameli" {{ data 'name' }}></li>
                            // then later you can access it like:
                            //		can.$('#nameli').data('name');

                            {
                                name: /^\s*data\s/,
                                fn: function(content, cmd) {
                                    var attr = content.match(/["|'](.*)["|']/)[1];
                                    // return a function which calls `can.data` on the element
                                    // with the attribute name with the current context.
                                    return "can.proxy(function(__){" +
                                    // "var context = this[this.length-1];" +
                                    // "context = context." + STACKED + " ? context[context.length-2] : context; console.warn(this, context);" +
                                    "can.data(can.$(__),'" + attr + "', this.attr('.')); }, " + SCOPE + ")";
                                }
                            }, {
                                name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                                fn: function(content) {
                                    var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                                        parts = content.match(quickFunc);

                                    //find 
                                    return "can.proxy(function(__){var " + parts[1] + "=can.$(__);with(" + SCOPE + ".attr('.')){" + parts[2] + "}}, this);";
                                }
                            },
                            // ### Transformation (default)
                            // This transforms all content to its interpolated equivalent,
                            // including calls to the corresponding helpers as applicable. 
                            // This outputs the render code for almost all cases.
                            // #### Definitions
                            // * `context` - This is the object that the current rendering context operates within. 
                            //		Each nested template adds a new `context` to the context stack.
                            // * `stack` - Mustache supports nested sections, 
                            //		each of which add their own context to a stack of contexts.
                            //		Whenever a token gets interpolated, it will check for a match against the 
                            //		last context in the stack, then iterate through the rest of the stack checking for matches.
                            //		The first match is the one that gets returned.
                            // * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
                            //		If this is a simple interpolation, only the interpolation lookup will be passed.
                            //		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
                            //		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
                            //		exists to support the runtime context nesting that Mustache supports.
                            // * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
                            // * `options` - An object containing methods for executing the inner contents of sections or helpers.  
                            //		`options.fn` - Contains the inner template logic for a truthy section.  
                            //		`options.inverse` - Contains the inner template logic for a falsey section.  
                            //		`options.hash` - Contains the merged hash object argument for custom helpers.
                            // #### Design
                            // This covers the design of the render code that the transformation helper generates.
                            // ##### Pseudocode
                            // A detailed explanation is provided in the following sections, but here is some brief pseudocode
                            // that gives a high level overview of what the generated render code does (with a template similar to  
                            // `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
                            // *Initialize the render code.*
                            // 		view = []
                            // 		context = []
                            // 		stack = fn { context.concat([this]) }
                            // *Render the root section.*
                            // 		view.push( "string" )
                            // 		view.push( can.view.txt(
                            // *Render the nested section with `can.Mustache.txt`.*
                            // 			txt( 
                            // *Add the current context to the stack.*
                            // 				stack(), 
                            // *Flag this for truthy section mode.*
                            // 				"#",
                            // *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
                            // 				get( "a", stack() ),
                            // *Include the nested section's inner logic.
                            // The stack argument is usually the parent section's copy of the stack, 
                            // but it can be an override context that was passed by a custom helper.
                            // Sections can nest `0..n` times -- **NESTCEPTION**.*
                            // 				{ fn: fn(stack) {
                            // *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
                            // 					view = []
                            // 					view.push( "string" )
                            // 					view.push(
                            // *Add the current context to the stack.*
                            // 						stack(),
                            // *Flag this as interpolation-only mode.*
                            // 						null,
                            // *Interpolate the `b.c.d.e.name` variable using the stack.*
                            // 						get( "b.c.d.e.name", stack() ),
                            // 					)
                            // 					view.push( "string" )
                            // *Return the result for the nested section.*
                            // 					return view.join()
                            // 				}}
                            // 			)
                            // 		))
                            // 		view.push( "string" )
                            // *Return the result for the root section, which includes all nested sections.*
                            // 		return view.join()
                            // ##### Initialization
                            // Each rendered template is started with the following initialization code:
                            // 		var ___v1ew = [];
                            // 		var ___c0nt3xt = [];
                            // 		___c0nt3xt.__sc0pe = true;
                            // 		var __sc0pe = function(context, self) {
                            // 			var s;
                            // 			if (arguments.length == 1 && context) {
                            // 				s = !context.__sc0pe ? [context] : context;
                            // 			} else {
                            // 				s = context && context.__sc0pe 
                            //					? context.concat([self]) 
                            //					: __sc0pe(context).concat([self]);
                            // 			}
                            // 			return (s.__sc0pe = true) && s;
                            // 		};
                            // The `___v1ew` is the the array used to serialize the view.
                            // The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
                            // The `__sc0pe` function is used to more easily update the context stack in certain situations.
                            // Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
                            // However, custom helpers will occasionally pass override contexts that need their own context stack.
                            // ##### Sections
                            // Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
                            // context in the resulting render code. The template itself is treated like a root section, with the 
                            // same execution logic as any others. Each section can have `0..n` nested sections within it.
                            // Here's an example of a template without any descendent sections.  
                            // Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
                            // Would output the following render code:
                            //		___v1ew.push("\"");
                            //		___v1ew.push(can.view.txt(1, '', 0, this, function() {
                            // 			return can.Mustache.txt(__sc0pe(___c0nt3xt, this), null, 
                            //				can.Mustache.get("a.b.c.d.e.name", 
                            //					__sc0pe(___c0nt3xt, this))
                            //			);
                            //		}));
                            //		___v1ew.push("\" == \"Phil\"");
                            // The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
                            // will be pushed onto the view via `can.view.txt` in order to support live binding.
                            // The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
                            // a context lookup with `can.Mustache.get`.
                            // `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
                            // This stack will grow larger as sections nest.
                            // The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
                            // or `null` if it is an interpolation instead of a section.
                            // The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
                            // context lookup and return the approriate string or object.
                            // Any additional arguments, if they exist, are used for passing arguments to custom helpers.
                            // For nested sections, the last argument is an `options` object that contains the nested section's logic.
                            // Here's an example of a template with a single nested section.  
                            // Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
                            // Would output the following render code:
                            //		___v1ew.push("\"");
                            // 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
                            // 			return can.Mustache.txt(__sc0pe(___c0nt3xt, this), "#", 
                            //				can.Mustache.get("a", __sc0pe(___c0nt3xt, this)), 
                            //					[{
                            // 					_: function() {
                            // 						return ___v1ew.join("");
                            // 					}
                            // 				}, {
                            // 					fn: function(___c0nt3xt) {
                            // 						var ___v1ew = [];
                            // 						___v1ew.push(can.view.txt(1, '', 0, this, 
                            //								function() {
                            //                                  return can.Mustache.txt(
                            // 									__sc0pe(___c0nt3xt, this), 
                            // 									null, 
                            // 									can.Mustache.get("b.c.d.e.name", 
                            // 										__sc0pe(___c0nt3xt, this))
                            // 								);
                            // 							}
                            // 						));
                            // 						return ___v1ew.join("");
                            // 					}
                            // 				}]
                            //			)
                            // 		}));
                            //		___v1ew.push("\" == \"Phil\"");
                            // This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
                            // These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
                            // The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
                            // or both, but there isn't any way to determine that at compilation time).
                            // Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
                            // This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
                            // aren't used, `___c0nt3xt` will be equivalent to the `__sc0pe(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
                            // works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
                            // ensure that live binding in nested sections works properly.
                            // All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
                            // #### Implementation
                            {
                                name: /^.*$/,
                                fn: function(content, cmd) {
                                    var mode = false,
                                        result = {
                                            content: "",
                                            startTxt: false,
                                            startOnlyTxt: false,
                                            end: false
                                        };

                                    // Trim the content so we don't have any trailing whitespace.
                                    content = can.trim(content);

                                    // Determine what the active mode is.
                                    // * `#` - Truthy section
                                    // * `^` - Falsey section
                                    // * `/` - Close the prior section
                                    // * `else` - Inverted section (only exists within a truthy/falsey section)
                                    if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
                                        mode = mode[0];
                                        switch (mode) {

                                            // Open a new section.
                                            case '#':

                                            case '^':
                                                if (cmd.specialAttribute) {
                                                    result.startOnlyTxt = true;
                                                    //result.push(cmd.insert + 'can.view.onlytxt(this,function(){ return ');
                                                } else {
                                                    result.startTxt = true;
                                                    // sections should never be escaped
                                                    result.escaped = 0;
                                                    //result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
                                                }
                                                break;
                                                // Close the prior section.

                                            case '/':
                                                result.end = true;
                                                result.content += 'return ___v1ew.join("");}}])';
                                                return result;
                                        }

                                        // Trim the mode off of the content.
                                        content = content.substring(1);
                                    }

                                    // `else` helpers are special and should be skipped since they don't 
                                    // have any logic aside from kicking off an `inverse` function.
                                    if (mode !== 'else') {
                                        var args = [],
                                            hashes = [],
                                            i = 0,
                                            m;

                                        // Start the content render block.
                                        result.content += 'can.Mustache.txt(\n' +
                                        (cmd.specialAttribute ? SPECIAL_CONTEXT_OBJ : CONTEXT_OBJ) +
                                            ',\n' + (mode ? '"' + mode + '"' : 'null') + ',';

                                        // Parse the helper arguments.
                                        // This needs uses this method instead of a split(/\s/) so that 
                                        // strings with spaces can be correctly parsed.
                                        (can.trim(content) + ' ')
                                            .replace(argumentsRegExp, function(whole, arg) {

                                                // Check for special helper arguments (string/number/boolean/hashes).
                                                if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
                                                    // Found a native type like string/number/boolean.
                                                    if (m[2]) {
                                                        args.push(m[0]);
                                                    }
                                                    // Found a hash object.
                                                    else {
                                                        // Addd to the hash object.

                                                        hashes.push(m[4] + ":" + (m[6] ? m[6] : makeLookupLiteral(m[5])));
                                                    }
                                                }
                                                // Otherwise output a normal interpolation reference.
                                                else {
                                                    args.push(makeLookupLiteral(arg));
                                                }
                                                i++;
                                            });

                                        result.content += args.join(",");
                                        if (hashes.length) {
                                            result.content += ",{" + HASH + ":{" + hashes.join(",") + "}}";
                                        }

                                    }

                                    // Create an option object for sections of code.
                                    if (mode && mode !== 'else') {
                                        result.content += ',[\n\n';
                                    }
                                    switch (mode) {
                                        // Truthy section
                                        case '^':
                                        case '#':
                                            result.content += ('{fn:function(' + ARG_NAMES + '){var ___v1ew = [];');
                                            break;
                                            // If/else section
                                            // Falsey section

                                        case 'else':
                                            result.content += 'return ___v1ew.join("");}},\n{inverse:function(' + ARG_NAMES + '){\nvar ___v1ew = [];';
                                            break;

                                            // Not a section, no mode
                                        default:
                                            result.content += (')');
                                            break;
                                    }

                                    if (!mode) {
                                        result.startTxt = true;
                                        result.end = true;
                                    }

                                    return result;
                                }
                            }
                        ]
                    })
            });

        // Add in default scanner helpers first.
        // We could probably do this differently if we didn't 'break' on every match.
        var helpers = can.view.Scanner.prototype.helpers;
        for (var i = 0; i < helpers.length; i++) {
            Mustache.prototype.scanner.helpers.unshift(helpers[i]);
        }


        Mustache.txt = function(scopeAndOptions, mode, name) {

            // here we are going to cache the lookup values so future calls are much faster
            var scope = scopeAndOptions.scope,
                options = scopeAndOptions.options,
                args = [],
                helperOptions = {
                    fn: function() {},
                    inverse: function() {}
                },
                hash,
                context = scope.attr("."),
                getHelper = true,
                helper;

            // convert lookup values to actual values in name, arguments, and hash
            for (var i = 3; i < arguments.length; i++) {
                var arg = arguments[i];
                if (mode && can.isArray(arg)) {
                    // merge into options
                    helperOptions = can.extend.apply(can, [helperOptions].concat(arg));
                } else if (arg && arg[HASH]) {
                    hash = arg[HASH];
                    // get values on hash
                    for (var prop in hash) {
                        if (isLookup(hash[prop])) {
                            hash[prop] = Mustache.get(hash[prop].get, scopeAndOptions);
                        }
                    }
                } else if (arg && isLookup(arg)) {
                    args.push(Mustache.get(arg.get, scopeAndOptions, false, true));
                } else {
                    args.push(arg);
                }
            }

            if (isLookup(name)) {
                var get = name.get;
                name = Mustache.get(name.get, scopeAndOptions, args.length, false);

                // Base whether or not we will get a helper on whether or not the original
                // name.get and Mustache.get resolve to the same thing. Saves us from running
                // into issues like {{text}} / {text: 'with'}
                getHelper = (get === name);
            }

            // overwrite fn and inverse to always convert to scopes
            helperOptions.fn = makeConvertToScopes(helperOptions.fn, scope, options);
            helperOptions.inverse = makeConvertToScopes(helperOptions.inverse, scope, options);

            // if mode is ^, swap fn and inverse
            if (mode === '^') {
                var tmp = helperOptions.fn;
                helperOptions.fn = helperOptions.inverse;
                helperOptions.inverse = tmp;
            }

            // Check for a registered helper or a helper-like function.
            if (helper = (getHelper && (typeof name === "string" && Mustache.getHelper(name, options)) || (can.isFunction(name) && !name.isComputed && {
                            fn: name
                        }))) {
                // Add additional data to be used by helper functions

                can.extend(helperOptions, {
                        context: context,
                        scope: scope,
                        contexts: scope,
                        hash: hash
                    });

                args.push(helperOptions);
                // Call the helper.
                return function() {
                    return helper.fn.apply(context, args) || '';
                };

            }

            return function() {
                //{{#foo.bar zed ted}}
                var value;
                if (can.isFunction(name) && name.isComputed) {
                    value = name();
                } else {
                    value = name;
                }
                // An array of arguments to check for truthyness when evaluating sections.
                var validArgs = args.length ? args : [value],
                    // Whether the arguments meet the condition of the section.
                    valid = true,
                    result = [],
                    i, argIsObserve, arg;
                // Validate the arguments based on the section mode.
                if (mode) {
                    for (i = 0; i < validArgs.length; i++) {
                        arg = validArgs[i];
                        argIsObserve = typeof arg !== 'undefined' && isObserveLike(arg);
                        // Array-like objects are falsey if their length = 0.
                        if (isArrayLike(arg)) {
                            // Use .attr to trigger binding on empty lists returned from function
                            if (mode === '#') {
                                valid = valid && !! (argIsObserve ? arg.attr('length') : arg.length);
                            } else if (mode === '^') {
                                valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
                            }
                        }
                        // Otherwise just check if it is truthy or not.
                        else {
                            valid = mode === '#' ? valid && !! arg : mode === '^' ? valid && !arg : valid;
                        }
                    }
                }

                // Otherwise interpolate like normal.
                if (valid) {

                    if (mode === "#") {
                        if (isArrayLike(value)) {
                            var isObserveList = isObserveLike(value);

                            // Add the reference to the list in the contexts.
                            for (i = 0; i < value.length; i++) {
                                result.push(helperOptions.fn(
                                        isObserveList ? value.attr('' + i) : value[i]));
                            }
                            return result.join('');
                        }
                        // Normal case.
                        else {
                            return helperOptions.fn(value || {}) || '';
                        }
                    } else if (mode === "^") {
                        return helperOptions.inverse(value || {}) || '';
                    } else {
                        return '' + (value != null ? value : '');
                    }
                }

                return '';
            };
        };


        Mustache.get = function(key, scopeAndOptions, isHelper, isArgument) {

            // Cache a reference to the current context and options, we will use them a bunch.
            var context = scopeAndOptions.scope.attr('.'),
                options = scopeAndOptions.options || {};

            // If key is called as a helper,
            if (isHelper) {
                // try to find a registered helper.
                if (Mustache.getHelper(key, options)) {
                    return key;
                }
                // Support helper-like functions as anonymous helpers.
                // Check if there is a method directly in the "top" context.
                if (scopeAndOptions.scope && can.isFunction(context[key])) {
                    return context[key];
                }

            }

            // Get a compute (and some helper data) that represents key's value in the current scope
            var computeData = scopeAndOptions.scope.computeData(key, {
                    isArgument: isArgument,
                    args: [context, scopeAndOptions.scope]
                }),
                compute = computeData.compute;

            // Bind on the compute to cache its value. We will unbind in a timeout later.
            can.compute.temporarilyBind(compute);

            // computeData gives us an initial value
            var initialValue = computeData.initialValue;

            // Use helper over the found value if the found value isn't in the current context
            if ((initialValue === undefined || computeData.scope !== scopeAndOptions.scope) && Mustache.getHelper(key, options)) {
                return key;
            }

            // If there are no dependencies, just return the value.
            if (!compute.hasDependencies) {
                return initialValue;
            } else {
                return compute;
            }
        };


        Mustache.resolve = function(value) {
            if (isObserveLike(value) && isArrayLike(value) && value.attr('length')) {
                return value;
            } else if (can.isFunction(value)) {
                return value();
            } else {
                return value;
            }
        };



        can.view.Options = can.view.Scope.extend({
                init: function(data, parent) {
                    if (!data.helpers && !data.partials && !data.tags) {
                        data = {
                            helpers: data
                        };
                    }
                    can.view.Scope.prototype.init.apply(this, arguments);
                }
            });

        // ## Helpers
        // Helpers are functions that can be called from within a template.
        // These helpers differ from the scanner helpers in that they execute
        // at runtime instead of during compilation.
        // Custom helpers can be added via `can.Mustache.registerHelper`,
        // but there are also some built-in helpers included by default.
        // Most of the built-in helpers are little more than aliases to actions 
        // that the base version of Mustache simply implies based on the 
        // passed in object.
        // Built-in helpers:
        // * `data` - `data` is a special helper that is implemented via scanning helpers. 
        //		It hooks up the active element to the active data object: `<div {{data "key"}} />`
        // * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
        // * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
        // * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
        // * `with` - Opens a context section: `{{#with var}} render {{/with}}`
        Mustache._helpers = {};

        Mustache.registerHelper = function(name, fn) {
            this._helpers[name] = {
                name: name,
                fn: fn
            };
        };


        Mustache.getHelper = function(name, options) {
            var helper = options.attr("helpers." + name);
            return helper ? {
                fn: helper
            } : this._helpers[name];
        };


        Mustache.render = function(partial, scope, options) {
            // TOOD: clean up the following
            // If there is a "partial" property and there is not
            // an already-cached partial, we use the value of the 
            // property to look up the partial

            // if this partial is not cached ...
            if (!can.view.cached[partial]) {
                // we don't want to bind to changes so clear and restore reading
                var reads = can.__clearReading();
                if (scope.attr('partial')) {
                    partial = scope.attr('partial');
                }
                can.__setReading(reads);
            }

            // Call into `can.view.render` passing the
            // partial and scope.
            return can.view.render(partial, scope);
        };


        Mustache.safeString = function(str) {
            return {
                toString: function() {
                    return str;
                }
            };
        };

        Mustache.renderPartial = function(partialName, scope, options) {
            var partial = options.attr("partials." + partialName);
            if (partial) {
                return partial.render ? partial.render(scope, options) :
                    partial(scope, options);
            } else {
                return can.Mustache.render(partialName, scope, options);
            }
        };

        // The built-in Mustache helpers.
        can.each({
                // Implements the `if` built-in helper.

                'if': function(expr, options) {
                    var value;
                    // if it's a function, wrap its value in a compute
                    // that will only change values from true to false
                    if (can.isFunction(expr)) {
                        value = can.compute.truthy(expr)();
                    } else {
                        value = !! Mustache.resolve(expr);
                    }

                    if (value) {
                        return options.fn(options.contexts || this);
                    } else {
                        return options.inverse(options.contexts || this);
                    }
                },
                // Implements the `unless` built-in helper.

                'unless': function(expr, options) {
                    if (!Mustache.resolve(expr)) {
                        return options.fn(options.contexts || this);
                    }
                },

                // Implements the `each` built-in helper.

                'each': function(expr, options) {
                    // Check if this is a list or a compute that resolves to a list, and setup
                    // the incremental live-binding 

                    // First, see what we are dealing with.  It's ok to read the compute
                    // because can.view.text is only temporarily binding to what is going on here.
                    // Calling can.view.lists prevents anything from listening on that compute.
                    var resolved = Mustache.resolve(expr),
                        result = [],
                        keys,
                        key,
                        i;

                    // When resolved === undefined, the property hasn't been defined yet
                    // Assume it is intended to be a list
                    if (can.view.lists && (resolved instanceof can.List || (expr && expr.isComputed && resolved === undefined))) {
                        return can.view.lists(expr, function(item, index) {
                            return options.fn(options.scope.add({
                                        "@index": index
                                    })
                                .add(item));
                        });
                    }
                    expr = resolved;

                    if ( !! expr && isArrayLike(expr)) {
                        for (i = 0; i < expr.length; i++) {
                            result.push(options.fn(options.scope.add({
                                            "@index": i
                                        })
                                    .add(expr[i])));
                        }
                        return result.join('');
                    } else if (isObserveLike(expr)) {
                        keys = can.Map.keys(expr);
                        // listen to keys changing so we can livebind lists of attributes.

                        for (i = 0; i < keys.length; i++) {
                            key = keys[i];
                            result.push(options.fn(options.scope.add({
                                            "@key": key
                                        })
                                    .add(expr[key])));
                        }
                        return result.join('');
                    } else if (expr instanceof Object) {
                        for (key in expr) {
                            result.push(options.fn(options.scope.add({
                                            "@key": key
                                        })
                                    .add(expr[key])));
                        }
                        return result.join('');

                    }
                },
                // Implements the `with` built-in helper.

                'with': function(expr, options) {
                    var ctx = expr;
                    expr = Mustache.resolve(expr);
                    if ( !! expr) {
                        return options.fn(ctx);
                    }
                },

                'log': function(expr, options) {
                    if (console !== undefined) {
                        if (!options) {
                            console.log(expr.context);
                        } else {
                            console.log(expr, options.context);
                        }
                    }
                }

            }, function(fn, name) {
                Mustache.registerHelper(name, fn);
            });

        // ## Registration
        // Registers Mustache with can.view.
        can.view.register({
                suffix: "mustache",

                contentType: "x-mustache-template",

                // Returns a `function` that renders the view.
                script: function(id, src) {
                    return "can.Mustache(function(" + ARG_NAMES + ") { " + new Mustache({
                            text: src,
                            name: id
                        })
                        .template.out + " })";
                },

                renderer: function(id, text) {
                    return Mustache({
                            text: text,
                            name: id
                        });
                }
            });

        return can;
    })(__m2, __m25, __m14, __m26, __m23, __m28);

    // ## view/bindings/bindings.js
    var __m32 = (function(can) {


        can.view.attr("can-value", function(el, data) {

            var attr = el.getAttribute("can-value"),
                value = data.scope.computeData(attr, {
                        args: []
                    })
                    .compute,
                trueValue,
                falseValue;

            if (el.nodeName.toLowerCase() === "input") {
                if (el.type === "checkbox") {
                    if (can.attr.has(el, "can-true-value")) {
                        trueValue = data.scope.compute(el.getAttribute("can-true-value"));
                    } else {
                        trueValue = can.compute(true);
                    }
                    if (can.attr.has(el, "can-false-value")) {
                        falseValue = data.scope.compute(el.getAttribute("can-false-value"));
                    } else {
                        falseValue = can.compute(false);
                    }
                }

                if (el.type === "checkbox" || el.type === "radio") {
                    new Checked(el, {
                            value: value,
                            trueValue: trueValue,
                            falseValue: falseValue
                        });
                    return;
                }
            }
            if (el.nodeName.toLowerCase() === "select" && el.multiple) {
                new Multiselect(el, {
                        value: value
                    });
                return;
            }
            new Value(el, {
                    value: value
                });
        });

        var special = {
            enter: function(data, el, original) {
                return {
                    event: "keyup",
                    handler: function(ev) {
                        if (ev.keyCode === 13) {
                            return original.call(this, ev);
                        }
                    }
                };
            }
        };


        can.view.attr(/can-[\w\.]+/, function(el, data) {

            var attributeName = data.attributeName,
                event = attributeName.substr("can-".length),
                handler = function(ev) {
                    var attr = el.getAttribute(attributeName),
                        scopeData = data.scope.read(attr, {
                                returnObserveMethods: true,
                                isArgument: true
                            });
                    return scopeData.value.call(scopeData.parent, data.scope._context, can.$(this), ev);
                };

            if (special[event]) {
                var specialData = special[event](data, el, handler);
                handler = specialData.handler;
                event = specialData.event;
            }
            can.bind.call(el, event, handler);
        });

        var Value = can.Control.extend({
                init: function() {
                    if (this.element[0].nodeName.toUpperCase() === "SELECT") {
                        // need to wait until end of turn ...
                        setTimeout(can.proxy(this.set, this), 1);
                    } else {
                        this.set();
                    }

                },
                "{value} change": "set",
                set: function() {
                    //this may happen in some edgecases, esp. with selects that are not in DOM after the timeout has fired
                    if (!this.element) {
                        return;
                    }
                    var val = this.options.value();
                    this.element[0].value = (typeof val === 'undefined' ? '' : val);
                },
                "change": function() {
                    //this may happen in some edgecases, esp. with selects that are not in DOM after the timeout has fired
                    if (!this.element) {
                        return;
                    }
                    this.options.value(this.element[0].value);
                }
            }),
            Checked = can.Control.extend({
                    init: function() {
                        this.isCheckebox = (this.element[0].type.toLowerCase() === "checkbox");
                        this.check();
                    },
                    "{value} change": "check",
                    "{trueValue} change": "check",
                    "{falseValue} change": "check",
                    check: function() {
                        if (this.isCheckebox) {
                            var value = this.options.value(),
                                trueValue = this.options.trueValue() || true;

                            this.element[0].checked = (value === trueValue);
                        } else {
                            var setOrRemove = this.options.value() === this.element[0].value ?
                                "set" : "remove";

                            can.attr[setOrRemove](this.element[0], 'checked', true);

                        }

                    },
                    "change": function() {

                        if (this.isCheckebox) {
                            this.options.value(this.element[0].checked ? this.options.trueValue() : this.options.falseValue());
                        } else {
                            if (this.element[0].checked) {
                                this.options.value(this.element[0].value);
                            }
                        }

                    }
                }),
            Multiselect = Value.extend({
                    init: function() {
                        this.delimiter = ";";
                        this.set();
                    },

                    set: function() {

                        var newVal = this.options.value();

                        if (typeof newVal === 'string') {
                            //when given a string, try to extract all the options from it
                            newVal = newVal.split(this.delimiter);
                            this.isString = true;
                        } else if (newVal) {
                            //when given something else, try to make it an array and deal with it
                            newVal = can.makeArray(newVal);
                        }

                        //jQuery.val is required here, which will break compatibility with other libs
                        var isSelected = {};
                        can.each(newVal, function(val) {
                            isSelected[val] = true;
                        });

                        can.each(this.element[0].childNodes, function(option) {
                            if (option.value) {
                                option.selected = !! isSelected[option.value];
                            }

                        });

                    },

                    get: function() {
                        var values = [],
                            children = this.element[0].childNodes;

                        can.each(children, function(child) {
                            if (child.selected && child.value) {
                                values.push(child.value);
                            }
                        });

                        return values;
                    },

                    'change': function() {
                        var value = this.get(),
                            currentValue = this.options.value();

                        if (this.isString || typeof currentValue === "string") {
                            this.isString = true;
                            this.options.value(value.join(this.delimiter));
                        } else if (currentValue instanceof can.List) {
                            currentValue.attr(value, true);
                        } else {
                            this.options.value(value);
                        }

                    }
                });

    })(__m2, __m24, __m15);

    // ## component/component.js
    var __m1 = (function(can, viewCallbacks) {
        // ## Helpers
        // Attribute names to ignore for setting scope values.
        var ignoreAttributesRegExp = /^(dataViewId|class|id)$/i;

        var Component = can.Component = can.Construct.extend(

            // ## Static


            {
                // ### setup
                // When a component is extended, this sets up the component's internal constructor
                // functions and templates for later fast initialization.
                setup: function() {
                    can.Construct.setup.apply(this, arguments);

                    // Run the following only in constructors that extend can.Component.
                    if (can.Component) {
                        var self = this;

                        // Define a control using the `events` prototype property.
                        this.Control = can.Control.extend({
                                // Change lookup to first look in the scope.
                                _lookup: function(options) {
                                    return [options.scope, options, window];
                                }
                            },
                            // Extend `events` with a setup method that listens to changes in `scope` and
                            // rebinds all templated event handlers.
                            can.extend({
                                    setup: function(el, options) {
                                        var res = can.Control.prototype.setup.call(this, el, options);
                                        this.scope = options.scope;
                                        var self = this;
                                        this.on(this.scope, "change", function updateScope() {
                                            self.on();
                                            self.on(self.scope, "change", updateScope);
                                        });
                                        return res;
                                    }
                                }, this.prototype.events));

                        // Look to convert `scope` to a Map constructor function.
                        if (!this.prototype.scope || typeof this.prototype.scope === "object") {
                            // If scope is an object, use that object as the prototype of an extended 
                            // Map constructor function.
                            // A new instance of that Map constructor function will be created and
                            // set a the constructor instance's scope.
                            this.Map = can.Map.extend(this.prototype.scope || {});
                        } else if (this.prototype.scope.prototype instanceof can.Map) {
                            // If scope is a can.Map constructor function, just use that.
                            this.Map = this.prototype.scope;
                        }

                        // Look for default `@` values. If a `@` is found, these
                        // attributes string values will be set and 2-way bound on the
                        // component instance's scope.
                        this.attributeScopeMappings = {};
                        can.each(this.Map ? this.Map.defaults : {}, function(val, prop) {
                            if (val === "@") {
                                self.attributeScopeMappings[prop] = prop;
                            }
                        });

                        // Convert the template into a renderer function.
                        if (this.prototype.template) {
                            if (typeof this.prototype.template === "function") {
                                var temp = this.prototype.template;
                                this.renderer = function() {
                                    return can.view.frag(temp.apply(null, arguments));
                                };
                            } else {
                                this.renderer = can.view.mustache(this.prototype.template);
                            }
                        }

                        // Register this component to be created when its `tag` is found.
                        can.view.tag(this.prototype.tag, function(el, options) {
                            new self(el, options);
                        });
                    }

                }
            }, {
                // ## Prototype

                // ### setup
                // When a new component instance is created, setup bindings, render the template, etc.
                setup: function(el, hookupOptions) {
                    // Setup values passed to component
                    var initalScopeData = {},
                        component = this,
                        twoWayBindings = {},
                        // what scope property is currently updating
                        scopePropertyUpdating,
                        // the object added to the scope
                        componentScope,
                        frag;

                    // scope prototype properties marked with an "@" are added here
                    can.each(this.constructor.attributeScopeMappings, function(val, prop) {
                        initalScopeData[prop] = el.getAttribute(can.hyphenate(val));
                    });

                    // get the value in the scope for each attribute
                    // the hookup should probably happen after?
                    can.each(can.makeArray(el.attributes), function(node, index) {

                        var name = can.camelize(node.nodeName.toLowerCase()),
                            value = node.value;
                        // ignore attributes already in ScopeMappings
                        if (component.constructor.attributeScopeMappings[name] || ignoreAttributesRegExp.test(name) || viewCallbacks.attr(node.nodeName)) {
                            return;
                        }

                        // Cross-bind the value in the scope to this 
                        // component's scope
                        var computeData = hookupOptions.scope.computeData(value, {
                                args: []
                            }),
                            compute = computeData.compute;

                        // bind on this, check it's value, if it has dependencies
                        var handler = function(ev, newVal) {
                            scopePropertyUpdating = name;
                            componentScope.attr(name, newVal);
                            scopePropertyUpdating = null;
                        };
                        // compute only returned if bindable

                        compute.bind("change", handler);

                        // set the value to be added to the scope
                        initalScopeData[name] = compute();

                        if (!compute.hasDependencies) {
                            compute.unbind("change", handler);
                        } else {
                            // make sure we unbind (there's faster ways of doing this)
                            can.bind.call(el, "removed", function() {
                                compute.unbind("change", handler);
                            });
                            // setup two-way binding
                            twoWayBindings[name] = computeData;
                        }

                    });

                    if (this.constructor.Map) {
                        componentScope = new this.constructor.Map(initalScopeData);
                    } else if (this.scope instanceof can.Map) {
                        componentScope = this.scope;
                    } else if (can.isFunction(this.scope)) {

                        var scopeResult = this.scope(initalScopeData, hookupOptions.scope, el);
                        // if the function returns a can.Map, use that as the scope
                        if (scopeResult instanceof can.Map) {
                            componentScope = scopeResult;
                        } else if (scopeResult.prototype instanceof can.Map) {
                            componentScope = new scopeResult(initalScopeData);
                        } else {
                            componentScope = new(can.Map.extend(scopeResult))(initalScopeData);
                        }

                    }
                    var handlers = {};
                    // setup reverse bindings
                    can.each(twoWayBindings, function(computeData, prop) {
                        handlers[prop] = function(ev, newVal) {
                            // check that this property is not being changed because
                            // it's source value just changed
                            if (scopePropertyUpdating !== prop) {
                                computeData.compute(newVal);
                            }
                        };
                        componentScope.bind(prop, handlers[prop]);
                    });
                    // teardown reverse bindings when element is removed
                    can.bind.call(el, "removed", function() {
                        can.each(handlers, function(handler, prop) {
                            componentScope.unbind(prop, handlers[prop]);
                        });
                    });
                    // setup attributes bindings
                    if (!can.isEmptyObject(this.constructor.attributeScopeMappings)) {

                        can.bind.call(el, "attributes", function(ev) {
                            var camelized = can.camelize(ev.attributeName);
                            if (component.constructor.attributeScopeMappings[camelized]) {
                                componentScope.attr(camelized, el.getAttribute(ev.attributeName));
                            }
                        });

                    }

                    this.scope = componentScope;
                    can.data(can.$(el), "scope", this.scope);

                    // create a real Scope object out of the scope property
                    var renderedScope = hookupOptions.scope.add(this.scope),

                        // setup helpers to callback with `this` as the component
                        options = {
                            helpers: {}
                        };

                    can.each(this.helpers || {}, function(val, prop) {
                        if (can.isFunction(val)) {
                            options.helpers[prop] = function() {
                                return val.apply(componentScope, arguments);
                            };
                        }
                    });

                    // create a control to listen to events
                    this._control = new this.constructor.Control(el, {
                            scope: this.scope
                        });

                    // if this component has a template (that we've already converted to a renderer)
                    if (this.constructor.renderer) {
                        // add content to tags
                        if (!options.tags) {
                            options.tags = {};
                        }

                        // we need be alerted to when a <content> element is rendered so we can put the original contents of the widget in its place
                        options.tags.content = function contentHookup(el, rendererOptions) {
                            // first check if there was content within the custom tag
                            // otherwise, render what was within <content>, the default code
                            var subtemplate = hookupOptions.subtemplate || rendererOptions.subtemplate;

                            if (subtemplate) {

                                // rendererOptions.options is a scope of helpers where `<content>` was found, so
                                // the right helpers should already be available.
                                // However, _tags.content is going to point to this current content callback.  We need to 
                                // remove that so it will walk up the chain

                                delete options.tags.content;

                                can.view.live.replace([el], subtemplate(
                                        // This is the context of where `<content>` was found
                                        // which will have the the component's context
                                        rendererOptions.scope,

                                        rendererOptions.options));

                                // restore the content tag so it could potentially be used again (as in lists)
                                options.tags.content = contentHookup;
                            }
                        };
                        // render the component's template
                        frag = this.constructor.renderer(renderedScope, hookupOptions.options.add(options));
                    } else {
                        // otherwise render the contents between the 
                        frag = can.view.frag(hookupOptions.subtemplate ? hookupOptions.subtemplate(renderedScope, hookupOptions.options.add(options)) : "");
                    }
                    can.appendChild(el, frag);
                }
            });

        if (window.$ && $.fn) {
            $.fn.scope = function(attr) {
                if (attr) {
                    return this.data("scope")
                        .attr(attr);
                } else {
                    return this.data("scope");
                }
            };
        }

        can.scope = function(el, attr) {
            el = can.$(el);
            if (attr) {
                return can.data(el, "scope")
                    .attr(attr);
            } else {
                return can.data(el, "scope");
            }
        };

        return Component;
    })(__m2, __m13, __m15, __m18, __m24, __m32);

    // ## model/model.js
    var __m33 = (function(can) {

        // ## model.js  
        // `can.Model`  
        // _A `can.Map` that connects to a RESTful interface._
        // Generic deferred piping function

        var pipe = function(def, model, func) {
            var d = new can.Deferred();
            def.then(function() {
                var args = can.makeArray(arguments),
                    success = true;

                try {
                    args[0] = func.apply(model, args);
                } catch (e) {
                    success = false;
                    d.rejectWith(d, [e].concat(args));
                }
                if (success) {
                    d.resolveWith(d, args);
                }
            }, function() {
                d.rejectWith(this, arguments);
            });

            if (typeof def.abort === 'function') {
                d.abort = function() {
                    return def.abort();
                };
            }

            return d;
        },
            modelNum = 0,
            getId = function(inst) {
                // Instead of using attr, use __get for performance.
                // Need to set reading
                can.__reading(inst, inst.constructor.id);
                return inst.__get(inst.constructor.id);
            },
            // Ajax `options` generator function
            ajax = function(ajaxOb, data, type, dataType, success, error) {

                var params = {};

                // If we get a string, handle it.
                if (typeof ajaxOb === 'string') {
                    // If there's a space, it's probably the type.
                    var parts = ajaxOb.split(/\s+/);
                    params.url = parts.pop();
                    if (parts.length) {
                        params.type = parts.pop();
                    }
                } else {
                    can.extend(params, ajaxOb);
                }

                // If we are a non-array object, copy to a new attrs.
                params.data = typeof data === "object" && !can.isArray(data) ?
                    can.extend(params.data || {}, data) : data;

                // Get the url with any templated values filled out.
                params.url = can.sub(params.url, params.data, true);

                return can.ajax(can.extend({
                            type: type || 'post',
                            dataType: dataType || 'json',
                            success: success,
                            error: error
                        }, params));
            },
            makeRequest = function(self, type, success, error, method) {
                var args;
                // if we pass an array as `self` it it means we are coming from
                // the queued request, and we're passing already serialized data
                // self's signature will be: [self, serializedData]
                if (can.isArray(self)) {
                    args = self[1];
                    self = self[0];
                } else {
                    args = self.serialize();
                }
                args = [args];
                var deferred,
                    // The model.
                    model = self.constructor,
                    jqXHR;

                // `update` and `destroy` need the `id`.
                if (type !== 'create') {
                    args.unshift(getId(self));
                }

                jqXHR = model[type].apply(model, args);

                deferred = jqXHR.pipe(function(data) {
                    self[method || type + "d"](data, jqXHR);
                    return self;
                });

                // Hook up `abort`
                if (jqXHR.abort) {
                    deferred.abort = function() {
                        jqXHR.abort();
                    };
                }

                deferred.then(success, error);
                return deferred;
            },

            initializers = {
                // makes a models function that looks up the data in a particular property
                models: function(prop) {
                    return function(instancesRawData, oldList) {
                        // until "end of turn", increment reqs counter so instances will be added to the store
                        can.Model._reqs++;
                        if (!instancesRawData) {
                            return;
                        }

                        if (instancesRawData instanceof this.List) {
                            return instancesRawData;
                        }

                        // Get the list type.
                        var self = this,
                            tmp = [],
                            Cls = self.List || ML,
                            res = oldList instanceof can.List ? oldList : new Cls(),
                            // Did we get an `array`?
                            arr = can.isArray(instancesRawData),

                            // Did we get a model list?
                            ml = instancesRawData instanceof ML,
                            // Get the raw `array` of objects.
                            raw = arr ?

                            // If an `array`, return the `array`.
                            instancesRawData :

                            // Otherwise if a model list.
                            (ml ?

                                // Get the raw objects from the list.
                                instancesRawData.serialize() :

                                // Get the object's data.
                                can.getObject(prop || "data", instancesRawData));

                        if (typeof raw === 'undefined') {
                            throw new Error('Could not get any raw data while converting using .models');
                        }



                        if (res.length) {
                            res.splice(0);
                        }

                        can.each(raw, function(rawPart) {
                            tmp.push(self.model(rawPart));
                        });

                        // We only want one change event so push everything at once
                        res.push.apply(res, tmp);

                        if (!arr) { // Push other stuff onto `array`.
                            can.each(instancesRawData, function(val, prop) {
                                if (prop !== 'data') {
                                    res.attr(prop, val);
                                }
                            });
                        }
                        // at "end of turn", clean up the store
                        setTimeout(can.proxy(this._clean, this), 1);
                        return res;
                    };
                },
                model: function(prop) {
                    return function(attributes) {
                        if (!attributes) {
                            return;
                        }
                        if (typeof attributes.serialize === 'function') {
                            attributes = attributes.serialize();
                        }
                        if (this.parseModel) {
                            attributes = this.parseModel.apply(this, arguments);
                        } else if (prop) {
                            attributes = can.getObject(prop || "data", attributes);
                        }

                        var id = attributes[this.id],
                            model = (id || id === 0) && this.store[id] ?
                                this.store[id].attr(attributes, this.removeAttr || false) : new this(attributes);

                        return model;
                    };
                }
            },

            // This object describes how to make an ajax request for each ajax method.  
            // The available properties are:
            //		`url` - The default url to use as indicated as a property on the model.
            //		`type` - The default http request type
            //		`data` - A method that takes the `arguments` and returns `data` used for ajax.

            parserMaker = function(prop) {
                return function(attributes) {
                    return prop ? can.getObject(prop || "data", attributes) : attributes;
                };
            },

            parsers = {

                parseModel: parserMaker,

                parseModels: parserMaker
            },

            // This object describes how to make an ajax request for each ajax method.  
            // The available properties are:
            //		`url` - The default url to use as indicated as a property on the model.
            //		`type` - The default http request type
            //		`data` - A method that takes the `arguments` and returns `data` used for ajax.
            ajaxMethods = {

                create: {
                    url: "_shortName",
                    type: "post"
                },

                update: {
                    data: function(id, attrs) {
                        attrs = attrs || {};
                        var identity = this.id;
                        if (attrs[identity] && attrs[identity] !== id) {
                            attrs["new" + can.capitalize(id)] = attrs[identity];
                            delete attrs[identity];
                        }
                        attrs[identity] = id;
                        return attrs;
                    },
                    type: "put"
                },

                destroy: {
                    type: 'delete',
                    data: function(id, attrs) {
                        attrs = attrs || {};
                        attrs.id = attrs[this.id] = id;
                        return attrs;
                    }
                },

                findAll: {
                    url: "_shortName"
                },

                findOne: {}
            },
            // Makes an ajax request `function` from a string.
            //		`ajaxMethod` - The `ajaxMethod` object defined above.
            //		`str` - The string the user provided. Ex: `findAll: "/recipes.json"`.
            ajaxMaker = function(ajaxMethod, str) {
                // Return a `function` that serves as the ajax method.
                return function(data) {
                    // If the ajax method has it's own way of getting `data`, use that.
                    data = ajaxMethod.data ?
                        ajaxMethod.data.apply(this, arguments) :
                    // Otherwise use the data passed in.
                    data;
                    // Return the ajax method with `data` and the `type` provided.
                    return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get");
                };
            };

        can.Model = can.Map.extend({
                fullName: "can.Model",
                _reqs: 0,

                setup: function(base, fullName, staticProps, protoProps) {
                    // align args, this should happen in can.Construct
                    if (fullName !== "string") {
                        protoProps = staticProps;
                        staticProps = fullName;
                    }
                    if (!protoProps) {
                        protoProps = staticProps;
                    }

                    // create store here if someone wants to use model without inheriting from it
                    this.store = {};
                    can.Map.setup.apply(this, arguments);
                    // Set default list as model list
                    if (!can.Model) {
                        return;
                    }

                    if (staticProps && staticProps.List) {
                        this.List = staticProps.List;
                        this.List.Map = this;
                    } else {
                        this.List = base.List.extend({
                                Map: this
                            }, {});
                    }

                    var self = this,
                        clean = can.proxy(this._clean, self);

                    // go through ajax methods and set them up
                    can.each(ajaxMethods, function(method, name) {
                        // if an ajax method is not a function, it's either
                        // a string url like findAll: "/recipes" or an
                        // ajax options object like {url: "/recipes"}
                        if (!can.isFunction(self[name])) {
                            // use ajaxMaker to convert that into a function
                            // that returns a deferred with the data
                            self[name] = ajaxMaker(method, self[name]);
                        }
                        // check if there's a make function like makeFindAll
                        // these take deferred function and can do special
                        // behavior with it (like look up data in a store)
                        if (self["make" + can.capitalize(name)]) {
                            // pass the deferred method to the make method to get back
                            // the "findAll" method.
                            var newMethod = self["make" + can.capitalize(name)](self[name]);
                            can.Construct._overwrite(self, base, name, function() {
                                // increment the numer of requests
                                can.Model._reqs++;
                                var def = newMethod.apply(this, arguments);
                                var then = def.then(clean, clean);
                                then.abort = def.abort;

                                // attach abort to our then and return it
                                return then;
                            });
                        }
                    });

                    can.each(initializers, function(makeInitializer, name) {
                        var parseName = "parse" + can.capitalize(name);
                        if (typeof self[name] === "string") {

                            can.Construct._overwrite(self, base, parseName, parsers[parseName](self[name]));

                            can.Construct._overwrite(self, base, name, makeInitializer(self[name]));
                        }
                        // if there was no prototype, or no .models and no .parseModel
                        else if (!protoProps || (!protoProps[name] && !protoProps[parseName])) {
                            // create a parseModel
                            can.Construct._overwrite(self, base, parseName, parsers[parseName]());
                        }
                    });
                    can.each(parsers, function(makeParser, name) {
                        // if parseModel is a string.
                        if (typeof self[name] === "string") {
                            can.Construct._overwrite(self, base, name, makeParser(self[name]));
                        }
                    });

                    if (self.fullName === "can.Model" || !self.fullName) {
                        self.fullName = "Model" + (++modelNum);
                    }
                    // Add ajax converters.
                    can.Model._reqs = 0;
                    this._url = this._shortName + "/{" + this.id + "}";
                },
                _ajax: ajaxMaker,
                _makeRequest: makeRequest,
                _clean: function() {
                    can.Model._reqs--;
                    if (!can.Model._reqs) {
                        for (var id in this.store) {
                            if (!this.store[id]._bindings) {
                                delete this.store[id];
                            }
                        }
                    }
                    return arguments[0];
                },

                models: initializers.models("data"),

                model: initializers.model()
            },


            {
                setup: function(attrs) {
                    // try to add things as early as possible to the store (#457)
                    // we add things to the store before any properties are even set
                    var id = attrs && attrs[this.constructor.id];
                    if (can.Model._reqs && id != null) {
                        this.constructor.store[id] = this;
                    }
                    can.Map.prototype.setup.apply(this, arguments);
                },

                isNew: function() {
                    var id = getId(this);
                    return !(id || id === 0); // If `null` or `undefined`
                },

                save: function(success, error) {
                    return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
                },

                destroy: function(success, error) {
                    if (this.isNew()) {
                        var self = this;
                        var def = can.Deferred();
                        def.then(success, error);
                        return def.done(function(data) {
                            self.destroyed(data);
                        })
                            .resolve(self);
                    }
                    return makeRequest(this, 'destroy', success, error, 'destroyed');
                },

                _bindsetup: function() {
                    this.constructor.store[this.__get(this.constructor.id)] = this;
                    return can.Map.prototype._bindsetup.apply(this, arguments);
                },

                _bindteardown: function() {
                    delete this.constructor.store[getId(this)];
                    return can.Map.prototype._bindteardown.apply(this, arguments);
                },
                // Change `id`.
                ___set: function(prop, val) {
                    can.Map.prototype.___set.call(this, prop, val);
                    // If we add an `id`, move it to the store.
                    if (prop === this.constructor.id && this._bindings) {
                        this.constructor.store[getId(this)] = this;
                    }
                }
            });

        // ## Handler Logic
        // The following setups how findAll, findOne, etc
        // are handled.

        // Makes a getter response handler.
        var makeGetterHandler = function(name) {
            var parseName = "parse" + can.capitalize(name);
            return function(data) {
                // If there's a parse-function, call that and use its data.
                if (this[parseName]) {
                    data = this[parseName].apply(this, arguments);
                }
                return this[name](data);
            };
        },
            // How these methods' responses are handled.
            createUpdateDestroyHandler = function(data) {
                if (this.parseModel) {
                    return this.parseModel.apply(this, arguments);
                } else {
                    return this.model(data);
                }
            };

        var responseHandlers = {

            makeFindAll: makeGetterHandler("models"),

            makeFindOne: makeGetterHandler("model"),
            makeCreate: createUpdateDestroyHandler,
            makeUpdate: createUpdateDestroyHandler
        };

        // Go through the response handlers and make the 
        // actual "make" methods.
        can.each(responseHandlers, function(method, name) {
            can.Model[name] = function(oldMethod) {
                return function() {
                    var args = can.makeArray(arguments),
                        oldArgs = can.isFunction(args[1]) ? args.splice(0, 1) : args.splice(0, 2),
                        def = pipe(oldMethod.apply(this, oldArgs), this, method);
                    def.then(args[0], args[1]);
                    return def;
                };
            };
        });

        can.each([

                "created",

                "updated",

                "destroyed"
            ], function(funcName) {
                can.Model.prototype[funcName] = function(attrs) {
                    var stub,
                        constructor = this.constructor;

                    // Update attributes if attributes have been passed
                    stub = attrs && typeof attrs === 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

                    // triggers change event that bubble's like
                    // handler( 'change','1.destroyed' ). This is used
                    // to remove items on destroyed from Model Lists.
                    // but there should be a better way.
                    can.trigger(this, "change", funcName);



                    // Call event on the instance's Class
                    can.trigger(constructor, funcName, this);
                };
            });

        // Model lists are just like `Map.List` except that when their items are 
        // destroyed, it automatically gets removed from the list.
        var ML = can.Model.List = can.List({
                setup: function(params) {
                    if (can.isPlainObject(params) && !can.isArray(params)) {
                        can.List.prototype.setup.apply(this);
                        this.replace(this.constructor.Map.findAll(params));
                    } else {
                        can.List.prototype.setup.apply(this, arguments);
                    }
                },
                _changes: function(ev, attr) {
                    can.List.prototype._changes.apply(this, arguments);
                    if (/\w+\.destroyed/.test(attr)) {
                        var index = this.indexOf(ev.target);
                        if (index !== -1) {
                            this.splice(index, 1);
                        }
                    }
                }
            });

        return can.Model;
    })(__m2, __m19, __m22);

    // ## util/string/deparam/deparam.js
    var __m35 = (function(can) {
        // ## deparam.js  
        // `can.deparam`  
        // _Takes a string of name value pairs and returns a Object literal that represents those params._
        var digitTest = /^\d+$/,
            keyBreaker = /([^\[\]]+)|(\[\])/g,
            paramTest = /([^?#]*)(#.*)?$/,
            prep = function(str) {
                return decodeURIComponent(str.replace(/\+/g, ' '));
            };
        can.extend(can, {
                deparam: function(params) {
                    var data = {}, pairs, lastPart;
                    if (params && paramTest.test(params)) {
                        pairs = params.split('&');
                        can.each(pairs, function(pair) {
                            var parts = pair.split('='),
                                key = prep(parts.shift()),
                                value = prep(parts.join('=')),
                                current = data;
                            if (key) {
                                parts = key.match(keyBreaker);
                                for (var j = 0, l = parts.length - 1; j < l; j++) {
                                    if (!current[parts[j]]) {
                                        // If what we are pointing to looks like an `array`
                                        current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] === '[]' ? [] : {};
                                    }
                                    current = current[parts[j]];
                                }
                                lastPart = parts.pop();
                                if (lastPart === '[]') {
                                    current.push(value);
                                } else {
                                    current[lastPart] = value;
                                }
                            }
                        });
                    }
                    return data;
                }
            });
        return can;
    })(__m2, __m17);

    // ## route/route.js
    var __m34 = (function(can) {

        // ## route.js
        // `can.route`
        // _Helps manage browser history (and client state) by synchronizing the
        // `window.location.hash` with a `can.Map`._
        // Helper methods used for matching routes.
        var
        // `RegExp` used to match route variables of the type ':name'.
        // Any word character or a period is matched.
        matcher = /\:([\w\.]+)/g,
            // Regular expression for identifying &amp;key=value lists.
            paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
            // Converts a JS Object into a list of parameters that can be
            // inserted into an html element tag.
            makeProps = function(props) {
                var tags = [];
                can.each(props, function(val, name) {
                    tags.push((name === 'className' ? 'class' : name) + '="' +
                        (name === "href" ? val : can.esc(val)) + '"');
                });
                return tags.join(" ");
            },
            // Checks if a route matches the data provided. If any route variable
            // is not present in the data, the route does not match. If all route
            // variables are present in the data, the number of matches is returned
            // to allow discerning between general and more specific routes.
            matchesData = function(route, data) {
                var count = 0,
                    i = 0,
                    defaults = {};
                // look at default values, if they match ...
                for (var name in route.defaults) {
                    if (route.defaults[name] === data[name]) {
                        // mark as matched
                        defaults[name] = 1;
                        count++;
                    }
                }
                for (; i < route.names.length; i++) {
                    if (!data.hasOwnProperty(route.names[i])) {
                        return -1;
                    }
                    if (!defaults[route.names[i]]) {
                        count++;
                    }

                }

                return count;
            },
            location = window.location,
            wrapQuote = function(str) {
                return (str + '')
                    .replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
            },
            each = can.each,
            extend = can.extend,
            // Helper for convert any object (or value) to stringified object (or value)
            stringify = function(obj) {
                // Object is array, plain object, Map or List
                if (obj && typeof obj === "object") {
                    // Get native object or array from Map or List
                    if (obj instanceof can.Map) {
                        obj = obj.attr();
                        // Clone object to prevent change original values
                    } else {
                        obj = can.isFunction(obj.slice) ? obj.slice() : can.extend({}, obj);
                    }
                    // Convert each object property or array item into stringified new
                    can.each(obj, function(val, prop) {
                        obj[prop] = stringify(val);
                    });
                    // Object supports toString function
                } else if (obj !== undefined && obj !== null && can.isFunction(obj.toString)) {
                    obj = obj.toString();
                }

                return obj;
            },
            removeBackslash = function(str) {
                return str.replace(/\\/g, "");
            },
            // A ~~throttled~~ debounced function called multiple times will only fire once the
            // timer runs down. Each call resets the timer.
            timer,
            // Intermediate storage for `can.route.data`.
            curParams,
            // The last hash caused by a data change
            lastHash,
            // Are data changes pending that haven't yet updated the hash
            changingData,
            // If the `can.route.data` changes, update the hash.
            // Using `.serialize()` retrieves the raw data contained in the `observable`.
            // This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
            // This might be able to use batchNum and avoid this.
            onRouteDataChange = function(ev, attr, how, newval) {
                // indicate that data is changing
                changingData = 1;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    // indicate that the hash is set to look like the data
                    changingData = 0;
                    var serialized = can.route.data.serialize(),
                        path = can.route.param(serialized, true);
                    can.route._call("setURL", path);

                    lastHash = path;
                }, 10);
            };

        can.route = function(url, defaults) {
            // if route ends with a / and url starts with a /, remove the leading / of the url
            var root = can.route._call("root");

            if (root.lastIndexOf("/") === root.length - 1 &&
                url.indexOf("/") === 0) {
                url = url.substr(1);
            }

            defaults = defaults || {};
            // Extract the variable names and replace with `RegExp` that will match
            // an atual URL with values.
            var names = [],
                res,
                test = "",
                lastIndex = matcher.lastIndex = 0,
                next,
                querySeparator = can.route._call("querySeparator");

            // res will be something like [":foo","foo"]
            while (res = matcher.exec(url)) {
                names.push(res[1]);
                test += removeBackslash(url.substring(lastIndex, matcher.lastIndex - res[0].length));
                next = "\\" + (removeBackslash(url.substr(matcher.lastIndex, 1)) || querySeparator);
                // a name without a default value HAS to have a value
                // a name that has a default value can be empty
                // The `\\` is for string-escaping giving single `\` for `RegExp` escaping.
                test += "([^" + next + "]" + (defaults[res[1]] ? "*" : "+") + ")";
                lastIndex = matcher.lastIndex;
            }
            test += url.substr(lastIndex)
                .replace("\\", "");
            // Add route in a form that can be easily figured out.
            can.route.routes[url] = {
                // A regular expression that will match the route when variable values
                // are present; i.e. for `:page/:type` the `RegExp` is `/([\w\.]*)/([\w\.]*)/` which
                // will match for any value of `:page` and `:type` (word chars or period).
                test: new RegExp("^" + test + "($|" + wrapQuote(querySeparator) + ")"),
                // The original URL, same as the index for this entry in routes.
                route: url,
                // An `array` of all the variable names in this route.
                names: names,
                // Default values provided for the variables.
                defaults: defaults,
                // The number of parts in the URL separated by `/`.
                length: url.split('/')
                    .length
            };
            return can.route;
        };


        extend(can.route, {


                param: function(data, _setRoute) {
                    // Check if the provided data keys match the names in any routes;
                    // Get the one with the most matches.
                    var route,
                        // Need to have at least 1 match.
                        matches = 0,
                        matchCount,
                        routeName = data.route,
                        propCount = 0;

                    delete data.route;

                    each(data, function() {
                        propCount++;
                    });
                    // Otherwise find route.
                    each(can.route.routes, function(temp, name) {
                        // best route is the first with all defaults matching

                        matchCount = matchesData(temp, data);
                        if (matchCount > matches) {
                            route = temp;
                            matches = matchCount;
                        }
                        if (matchCount >= propCount) {
                            return false;
                        }
                    });
                    // If we have a route name in our `can.route` data, and it's
                    // just as good as what currently matches, use that
                    if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data) === matches) {
                        route = can.route.routes[routeName];
                    }
                    // If this is match...
                    if (route) {
                        var cpy = extend({}, data),
                            // Create the url by replacing the var names with the provided data.
                            // If the default value is found an empty string is inserted.
                            res = route.route.replace(matcher, function(whole, name) {
                                delete cpy[name];
                                return data[name] === route.defaults[name] ? "" : encodeURIComponent(data[name]);
                            })
                                .replace("\\", ""),
                            after;
                        // Remove matching default values
                        each(route.defaults, function(val, name) {
                            if (cpy[name] === val) {
                                delete cpy[name];
                            }
                        });

                        // The remaining elements of data are added as
                        // `&amp;` separated parameters to the url.
                        after = can.param(cpy);
                        // if we are paraming for setting the hash
                        // we also want to make sure the route value is updated
                        if (_setRoute) {
                            can.route.attr('route', route.route);
                        }
                        return res + (after ? can.route._call("querySeparator") + after : "");
                    }
                    // If no route was found, there is no hash URL, only paramters.
                    return can.isEmptyObject(data) ? "" : can.route._call("querySeparator") + can.param(data);
                },

                deparam: function(url) {

                    // remove the url
                    var root = can.route._call("root");
                    if (root.lastIndexOf("/") === root.length - 1 &&
                        url.indexOf("/") === 0) {
                        url = url.substr(1);
                    }

                    // See if the url matches any routes by testing it against the `route.test` `RegExp`.
                    // By comparing the URL length the most specialized route that matches is used.
                    var route = {
                        length: -1
                    },
                        querySeparator = can.route._call("querySeparator"),
                        paramsMatcher = can.route._call("paramsMatcher");

                    each(can.route.routes, function(temp, name) {
                        if (temp.test.test(url) && temp.length > route.length) {
                            route = temp;
                        }
                    });
                    // If a route was matched.
                    if (route.length > -1) {

                        var // Since `RegExp` backreferences are used in `route.test` (parens)
                        // the parts will contain the full matched string and each variable (back-referenced) value.
                        parts = url.match(route.test),
                            // Start will contain the full matched string; parts contain the variable values.
                            start = parts.shift(),
                            // The remainder will be the `&amp;key=value` list at the end of the URL.
                            remainder = url.substr(start.length - (parts[parts.length - 1] === querySeparator ? 1 : 0)),
                            // If there is a remainder and it contains a `&amp;key=value` list deparam it.
                            obj = (remainder && paramsMatcher.test(remainder)) ? can.deparam(remainder.slice(1)) : {};

                        // Add the default values for this route.
                        obj = extend(true, {}, route.defaults, obj);
                        // Overwrite each of the default values in `obj` with those in
                        // parts if that part is not empty.
                        each(parts, function(part, i) {
                            if (part && part !== querySeparator) {
                                obj[route.names[i]] = decodeURIComponent(part);
                            }
                        });
                        obj.route = route.route;
                        return obj;
                    }
                    // If no route was matched, it is parsed as a `&amp;key=value` list.
                    if (url.charAt(0) !== querySeparator) {
                        url = querySeparator + url;
                    }
                    return paramsMatcher.test(url) ? can.deparam(url.slice(1)) : {};
                },

                data: new can.Map({}),

                routes: {},

                ready: function(val) {
                    if (val !== true) {
                        can.route._setup();
                        can.route.setState();
                    }
                    return can.route;
                },

                url: function(options, merge) {

                    if (merge) {
                        options = can.extend({}, can.route.deparam(can.route._call("matchingPartOfURL")), options);
                    }
                    return can.route._call("root") + can.route.param(options);
                },

                link: function(name, options, props, merge) {
                    return "<a " + makeProps(
                        extend({
                                href: can.route.url(options, merge)
                            }, props)) + ">" + name + "</a>";
                },

                current: function(options) {
                    return this._call("matchingPartOfURL") === can.route.param(options);
                },
                bindings: {
                    hashchange: {
                        paramsMatcher: paramsMatcher,
                        querySeparator: "&",
                        bind: function() {
                            can.bind.call(window, 'hashchange', setState);
                        },
                        unbind: function() {
                            can.unbind.call(window, 'hashchange', setState);
                        },
                        // Gets the part of the url we are determinging the route from.
                        // For hashbased routing, it's everything after the #, for
                        // pushState it's configurable
                        matchingPartOfURL: function() {
                            return location.href.split(/#!?/)[1] || "";
                        },
                        // gets called with the serialized can.route data after a route has changed
                        // returns what the url has been updated to (for matching purposes)
                        setURL: function(path) {
                            location.hash = "#!" + path;
                            return path;
                        },
                        root: "#!"
                    }
                },
                defaultBinding: "hashchange",
                currentBinding: null,
                // ready calls setup
                // setup binds and listens to data changes
                // bind listens to whatever you should be listening to
                // data changes tries to set the path

                // we need to be able to
                // easily kick off calling setState
                // 	teardown whatever is there
                //  turn on a particular binding

                // called when the route is ready
                _setup: function() {
                    if (!can.route.currentBinding) {
                        can.route._call("bind");
                        can.route.bind("change", onRouteDataChange);
                        can.route.currentBinding = can.route.defaultBinding;
                    }
                },
                _teardown: function() {
                    if (can.route.currentBinding) {
                        can.route._call("unbind");
                        can.route.unbind("change", onRouteDataChange);
                        can.route.currentBinding = null;
                    }
                    clearTimeout(timer);
                    changingData = 0;
                },
                // a helper to get stuff from the current or default bindings
                _call: function() {
                    var args = can.makeArray(arguments),
                        prop = args.shift(),
                        binding = can.route.bindings[can.route.currentBinding || can.route.defaultBinding],
                        method = binding[prop];
                    if (method.apply) {
                        return method.apply(binding, args);
                    } else {
                        return method;
                    }
                }
            });

        // The functions in the following list applied to `can.route` (e.g. `can.route.attr('...')`) will
        // instead act on the `can.route.data` observe.
        each(['bind', 'unbind', 'on', 'off', 'delegate', 'undelegate', 'removeAttr', 'compute', '_get', '__get'], function(name) {
            can.route[name] = function() {
                // `delegate` and `undelegate` require
                // the `can/map/delegate` plugin
                if (!can.route.data[name]) {
                    return;
                }

                return can.route.data[name].apply(can.route.data, arguments);
            };
        });

        // Because everything in hashbang is in fact a string this will automaticaly convert new values to string. Works with single value, or deep hashes.
        // Main motivation for this is to prevent double route event call for same value.
        // Example (the problem):
        // When you load page with hashbang like #!&some_number=2 and bind 'some_number' on routes.
        // It will fire event with adding of "2" (string) to 'some_number' property
        // But when you after this set can.route.attr({some_number: 2}) or can.route.attr('some_number', 2). it fires another event with change of 'some_number' from "2" (string) to 2 (integer)
        // This wont happen again with this normalization
        can.route.attr = function(attr, val) {
            var type = typeof attr,
                newArguments;

            // Reading
            if (val === undefined) {
                newArguments = arguments;
                // Sets object
            } else if (type !== "string" && type !== "number") {
                newArguments = [stringify(attr), val];
                // Sets key - value
            } else {
                newArguments = [attr, stringify(val)];
            }

            return can.route.data.attr.apply(can.route.data, newArguments);
        };

        var // Deparameterizes the portion of the hash of interest and assign the
        // values to the `can.route.data` removing existing values no longer in the hash.
        // setState is called typically by hashchange which fires asynchronously
        // So it's possible that someone started changing the data before the
        // hashchange event fired.  For this reason, it will not set the route data
        // if the data is changing or the hash already matches the hash that was set.
        setState = can.route.setState = function() {
            var hash = can.route._call("matchingPartOfURL");
            curParams = can.route.deparam(hash);

            // if the hash data is currently changing, or
            // the hash is what we set it to anyway, do NOT change the hash
            if (!changingData || hash !== lastHash) {
                can.route.attr(curParams, true);
            }
        };

        return can.route;
    })(__m2, __m19, __m22, __m35);

    // ## control/route/route.js
    var __m36 = (function(can) {

        // ## control/route.js
        // _Controller route integration._

        can.Control.processors.route = function(el, event, selector, funcName, controller) {
            selector = selector || "";
            if (!can.route.routes[selector]) {
                if (selector[0] === '/') {
                    selector = selector.substring(1);
                }
                can.route(selector);
            }
            var batchNum,
                check = function(ev, attr, how) {
                    if (can.route.attr('route') === (selector) &&
                        (ev.batchNum === undefined || ev.batchNum !== batchNum)) {

                        batchNum = ev.batchNum;

                        var d = can.route.attr();
                        delete d.route;
                        if (can.isFunction(controller[funcName])) {
                            controller[funcName](d);
                        } else {
                            controller[controller[funcName]](d);
                        }

                    }
                };
            can.route.bind('change', check);
            return function() {
                can.route.unbind('change', check);
            };
        };

        return can;
    })(__m2, __m34, __m15);

    window['can'] = __m3;
})();