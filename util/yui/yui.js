/*
	YUI modules: http://yuilibrary.com/yui/configurator/
		node
		io-base
		querystring
		event-focus
		array-extras
*/

(function() {

	var yuilibs = ['yui-base/yui-base-min.js',
		'oop/oop-min.js',
		'event-custom-base/event-custom-base-min.js',
		'features/features-min.js',
		'dom-core/dom-core-min.js',
		'dom-base/dom-base-min.js',
		'selector-native/selector-native-min.js',
		'selector/selector-min.js',
		'node-core/node-core-min.js',
		'node-base/node-base-min.js',
		'event-base/event-base-min.js',
		'event-delegate/event-delegate-min.js',
		'node-event-delegate/node-event-delegate-min.js',
		'pluginhost-base/pluginhost-base-min.js',
		'pluginhost-config/pluginhost-config-min.js',
		'node-pluginhost/node-pluginhost-min.js',
		'dom-style/dom-style-min.js',
		'dom-screen/dom-screen-min.js',
		'node-screen/node-screen-min.js',
		'node-style/node-style-min.js',
		'querystring-stringify-simple/querystring-stringify-simple-min.js',
		'io-base/io-base-min.js',
		'array-extras/array-extras-min.js',
		'querystring-parse/querystring-parse-min.js',
		'querystring-stringify/querystring-stringify-min.js',
		'event-custom-complex/event-custom-complex-min.js',
		'event-synthetic/event-synthetic-min.js',
		'event-focus/event-focus-min.js']

	var url = "http://yui.yahooapis.com/combo?3.4.1/build/" + yuilibs.join("&3.4.1/build/")


	steal({
		src: url,
		type: "js",
		_skip: true
	}, "../event.js").then(

	function() {

		// yui.js
		// ---------
		// _YUI node list._
		
		// `can.Y` is set as part of the build process.
		// `YUI().use('*')` is called for when `YUI` is statically loaded (like when running tests).
		var Y = can.Y = can.Y || YUI().use('*');

		// Map string helpers.
		can.trim = function( s ) {
			return Y.Lang.trim(s);
		}

		// Map array helpers.
		can.makeArray = function( arr ) {
			return Y.Array(arr);
		};
		can.isArray = Y.Lang.isArray;
		can.inArray = function( item, arr ) {
			return Y.Array.indexOf(arr, item);
		};
	
		can.map = function( arr, fn ) {
			return Y.Array.map(can.makeArray(arr || []), fn);
		};
	
		can.each = function( elements, callback ) {
			var i, key;
			if ( typeof elements.length == 'number' && elements.pop ) for ( i = 0; i < elements.length; i++ ) {
				if ( callback(i, elements[i]) === false ) return elements;
			}
			else for ( key in elements ) {
				if ( callback(key, elements[key]) === false ) return elements;
			}
			return elements;
		};

		// Map object helpers.
		can.extend = function( first ) {
			var deep = first === true ? 1 : 0,
				target = arguments[deep],
				i = deep + 1,
				arg;
			for (; arg = arguments[i]; i++ ) {
				Y.mix(target, arg, true, null, null, !! deep);
			}
			return target;
		}
		can.param = function( object ) {
			return Y.QueryString.stringify(object)
		}
		can.isEmptyObject = function( object ) {
			return Y.Object.isEmpty(object);
		}

		// Map function helpers.
		can.proxy = function( func, context ) {
			return Y.bind.apply(Y, arguments);
		}
		can.isFunction = function( f ) {
			return Y.Lang.isFunction(f);
		}

		// Element -- get the wrapped helper.
		var prepareNodeList = function(nodelist) {
			nodelist.each(function(node, i) {
				nodelist[i] = node.getDOMNode();
			});
			nodelist.length = nodelist.size();
			return nodelist;
		}
		can.$ = function( selector ) {
			if (selector === window) {
				return window;
			} else if (selector instanceof Y.NodeList) {
				return prepareNodeList(selector);
			} else if (typeof selector === "object" && !can.isArray(selector) && typeof selector.nodeType === "undefined" && !selector.getDOMNode) {
				return selector;
			} else {
				return prepareNodeList(Y.all(selector));
			}
		}
		can.get = function( wrapped, index ) {
			return wrapped._nodes[index];
		}
		can.buildFragment = function( frags, nodes ) {
			var owner = nodes.length && nodes[0].ownerDocument,
				frag = Y.Node.create(frags[0], owner);
			frag = (frag && frag.getDOMNode()) || document.createDocumentFragment();
			if ( frag.nodeType !== 11 ) {
				var tmp = document.createDocumentFragment();
				tmp.appendChild(frag)
				frag = tmp;
			}
			return { fragment: frag }
		}
		can.append = function( wrapped, html ) {
			wrapped.each(function( node ) {
				if ( typeof html === 'string' ) {
					html = can.buildFragment([html], []).fragment
				}
				node.append(html)
			});
		}
		can.addClass = function(wrapped, className){
			return wrapped.addClass(className);
		}
		can.data = function( wrapped, key, value ) {
			if ( value === undefined ) {

				return wrapped.item(0).getData(key)
			} else {
				return wrapped.item(0).setData(key, value)
			}
		}
		can.remove = function( wrapped ) {
			return wrapped.remove() && wrapped.destroy();
		}
		// Destroyed method.
		can._yNodeDestroy = can._yNodeDestroy || Y.Node.prototype.destroy;
		Y.Node.prototype.destroy = function() {
			can.trigger(this, "destroyed", [], false)
			can._yNodeDestroy.apply(this, arguments)
		}
		// Let `nodelist` know about the new destroy...
		Y.NodeList.addMethod("destroy", Y.Node.prototype.destroy);
	
		// Ajax
		var optionsMap = {
			type: "method",
			success: undefined,
			error: undefined
		}
		var updateDeferred = function( request, d ) {
			// `YUI` only returns a request if it is asynchronous.
			if (request && request.io) {
				var xhr = request.io;
				for ( var prop in xhr ) {
					if ( typeof d[prop] == 'function' ) {
						d[prop] = function() {
							xhr[prop].apply(xhr, arguments)
						}
					} else {
						d[prop] = prop[xhr]
					}
				}
			}
		}
		can.ajax = function( options ) {
			var d = can.Deferred(),
				requestOptions = can.extend({}, options);

			for ( var option in optionsMap ) {
				if ( requestOptions[option] !== undefined ) {
					requestOptions[optionsMap[option]] = requestOptions[option];
					delete requestOptions[option]
				}
			}
			requestOptions.sync = !options.async;

			var success = options.success,
				error = options.error;

			requestOptions.on = {
				success: function( transactionid, response ) {
					var data = response.responseText;
					if ( options.dataType === 'json' ) {
						data = eval("(" + data + ")")
					}
					updateDeferred(request, d);
					d.resolve(data, "success", request);
					success && success(data, "success", request);
				},
				failure: function( transactionid, response ) {
					updateDeferred(request, d);
					d.reject(request, "error");
					error && error(request, "error");
				}
			};
		
			var request = Y.io(requestOptions.url, requestOptions);
			updateDeferred(request, d);
			return d;

		}

		// Events - The `id` of the `function` to be bound, used as an expando on the `function`
		// so we can lookup it's `remove` object.
		var id = 0,
			// Takes a node list, goes through each node
			// and adds events data that has a map of events to 
			// `callbackId` to `remove` object.  It looks like
			// `{click: {5: {remove: fn}}}`. 
			addBinding = function( nodelist, selector, ev, cb ) {
        if (nodelist instanceof Y.NodeList || !nodelist.on || nodelist.getDOMNode) {
            nodelist.each(function (node) {
                var node = can.$(node);
                var events = can.data(node, "events"), eventName = ev + ":" + selector;
                if (!events) {
                    can.data(node, "events", events = {});
                }
                if (!events[eventName]) {
                    events[eventName] = {};
                }
                if (cb.__bindingsIds === undefined) {
                    cb.__bindingsIds = id++;
                }
                events[eventName][cb.__bindingsIds] = selector ? node.item(0).delegate(ev, cb, selector) : node.item(0).on(ev, cb);
            });
        } else {
            var obj = nodelist,
							events = obj.__canEvents = obj.__canEvents || {};
            if (!events[ev]) {
                events[ev] = {};
            }
            if (cb.__bindingsIds === undefined) {
                cb.__bindingsIds = id++;
            }
            events[ev][cb.__bindingsIds] = obj.on(ev, cb);
        }
			},
			// Removes a binding on a `nodelist` by finding
			// the remove object within the object's data.
			removeBinding = function( nodelist, selector, ev, cb ) {
				if (nodelist instanceof Y.NodeList || !nodelist.on || nodelist.getDOMNode) {
					nodelist.each(function (node) {
						var node = can.$(node), events = can.data(node, "events"), eventName = ev + ":" + selector, handlers = events[eventName], handler = handlers[cb.__bindingsIds];
						handler.detach();
						delete handlers[cb.__bindingsIds];
						if (can.isEmptyObject(handlers)) {
							delete events[ev];
						}
						if (can.isEmptyObject(events)) {
						}
					});
				} else {
					var obj = nodelist,
						events = obj.__canEvents || {},
						handlers = events[ev],
						handler = handlers[cb.__bindingsIds];
					handler.detach();
					delete handlers[cb.__bindingsIds];
					if (can.isEmptyObject(handlers)) {
						delete events[ev];
					}
					if (can.isEmptyObject(events)) {
					}
				}
			}
			can.bind = function( ev, cb ) {
				// If we can bind to it...
				if ( this.bind && this.bind !== can.bind ) {
					this.bind(ev, cb)
				} else if ( this.on || this.nodeType ) {
					addBinding(can.$(this), undefined, ev, cb)
				} else if ( this.addEvent ) {
					this.addEvent(ev, cb)
				} else {
					// Make it bind-able...
					can.addEvent.call(this, ev, cb)
				}
				return this;
			}
			can.unbind = function( ev, cb ) {
				// If we can bind to it...
				if ( this.unbind && this.unbind !== can.unbind ) {
					this.unbind(ev, cb)
				}

				else if ( this.on || this.nodeType ) {
					removeBinding(can.$(this), undefined, ev, cb);
				} else {
					// Make it bind-able...
					can.removeEvent.call(this, ev, cb)
				}
				return this;
			}
			can.trigger = function( item, event, args, bubble ) {
				if ( item instanceof Y.NodeList ) {
					item = item.item(0);
				}
        if ( item.getDOMNode ) {
            item = item.getDOMNode();
        }

				if ( item.nodeName ) {
					item = Y.Node(item);
					if ( bubble === false ) {
						// Force stop propagation by listening to `on` and then 
						// immediately disconnecting
						item.once(event, function( ev ) {
							ev.preventDefault()
						})
					} 
					realTrigger(item.getDOMNode(), event,{})
				} else {
					if ( typeof event === 'string' ) {
						event = {
							type: event
						}
					}
					event.target = event.target || item
					event.data = args
					can.dispatch.call(item, event)
				}
			};
		// Allow `dom` `destroyed` events.
		Y.mix(Y.Node.DOM_EVENTS, {
			destroyed: true
		});

		can.delegate = function( selector, ev, cb ) {
			if ( this.on || this.nodeType ) {
				addBinding(can.$(this), selector, ev, cb)
			} else if ( this.delegate ) {
				this.delegate(selector, ev, cb)
			}
			return this;
		}
		can.undelegate = function( selector, ev, cb ) {
			if ( this.on || this.nodeType ) {
				removeBinding(can.$(this), selector, ev, cb);
			} else if ( this.undelegate ) {
				this.undelegate(selector, ev, cb)
			}
			return this;
		}

		// `realTrigger` taken from `dojo`.
		var leaveRe = /mouse(enter|leave)/,
			_fix = function(_, p){
			return "mouse" + (p == "enter" ? "over" : "out");
			},
		realTrigger = document.createEvent ?
		function( n, e, a ) {
			// The sane branch.
			var ev = document.createEvent("HTMLEvents");
			e = e.replace(leaveRe, _fix);
			ev.initEvent(e, true, true);
			a && can.extend(ev, a);
			n.dispatchEvent(ev);
		} : function( n, e, a ) {
			// The *janktastic* branch.
			var ev = "on" + e,
				stop = false,
				lc = e.toLowerCase(),
				node = n;
			try {
				// FIXME: is this worth it? for mixed-case native event support:? Opera ends up in the
				// `createEvent` path above, and also fails on _some_ native-named events.
				//		if ( lc !== e && d.indexOf( d.NodeList.events, lc ) >= 0 ) {
				//			// if the event is one of those listed in our NodeList list
				//			// in lowercase form but is mixed case, throw to avoid
				//			// fireEvent. /me sighs. http://gist.github.com/315318
				//			throw("janktastic");
				//		}
				n.fireEvent(ev);
			} catch (er) {
				// A lame duck to work with. We're probably a "custom event".
				var evdata = can.extend({
					type: e,
					target: n,
					faux: true,
					// HACK: [needs] added support for `customStopper` to _base/event.js
					// some tests will fail until `del._stopPropagation` has support.
					_stopper: function() {
						stop = this.cancelBubble;
					}
				}, a);
				can.isFunction(n[ev]) && n[ev](evdata);
				// Handle bubbling of custom events, unless the event was stopped.
				while (!stop && n !== document && n.parentNode ) {
					n = n.parentNode;
					can.isFunction(n[ev]) && n[ev](evdata);
				}
			}
		}

	}).then("../deferred.js")

})();
