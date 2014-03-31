steal("can/util", "can/view/callbacks","can/control", "can/observe", "can/view/mustache", "can/view/bindings", function (can, viewCallbacks) {
	// ## Helpers
	// Attribute names to ignore for setting scope values.
	var ignoreAttributesRegExp = /^(dataViewId|class|id)$/i;
	/**
	 * @add can.Component
	 */
	var Component = can.Component = can.Construct.extend(
		
		// ## Static
		/**
		 * @static
		 */
		
		{
			// ### setup
			// 
			// When a component is extended, this sets up the component's internal constructor
			// functions and templates for later fast initialization.
			setup: function () {
				can.Construct.setup.apply(this, arguments);

				// Run the following only in constructors that extend can.Component.
				if (can.Component) {
					var self = this;
					
					// Define a control using the `events` prototype property.
					this.Control = can.Control.extend({
						// Change lookup to first look in the scope.
						_lookup: function (options) {
							return [options.scope, options, window];
						}
					},
					// Extend `events` with a setup method that listens to changes in `scope` and
					// rebinds all templated event handlers.
					can.extend({
						setup: function (el, options) {
							// call `can.Control.prototype.setup` on the element
							var res = can.Control.prototype.setup.call(this, el, options);
							// set the scope to the one passed from the `options` object
							this.scope = options.scope;
							var self = this;
							// rebind events on the `scope` change
							this.on(this.scope, "change", function updateScope() {
								// rebind events
								self.on();
								// manually rebind this function after this change
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
					}
					else if (this.prototype.scope.prototype instanceof can.Map) {
						// If scope is a can.Map constructor function, just use that.
						this.Map = this.prototype.scope;
					}
					
					// Look for default `@` values. If a `@` is found, these
					// attributes string values will be set and 2-way bound on the
					// component instance's scope.
					this.attributeScopeMappings = {};
					can.each(this.Map ? this.Map.defaults : {}, function (val, prop) {
						if (val === "@") {
							self.attributeScopeMappings[prop] = prop;
						}
					});

					// Convert the template into a renderer function.
					if (this.prototype.template) {
						if (typeof this.prototype.template === "function") {
							var temp = this.prototype.template;
							// if `this.prototype.template` is a function create renderer from it by
							// wrapping it with the anonymous function that will pass it the arguments
							this.renderer = function () {
								return can.view.frag(temp.apply(null, arguments));
							};
						} else {
							// otherwise create the render from the string
							this.renderer = can.view.mustache(this.prototype.template);
						}
					}

					// Register this component to be created when its `tag` is found.
					can.view.tag(this.prototype.tag, function (el, options) {
						new self(el, options);
					});
				}

			}
		}, {
			// ## Prototype
			/**
			 * @prototype
			 */
			// ### setup
			// When a new component instance is created, setup bindings, render the template, etc.
			setup: function (el, hookupOptions) {
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
				can.each(this.constructor.attributeScopeMappings, function (val, prop) {
					initalScopeData[prop] = el.getAttribute(can.hyphenate(val));
				});

				// get the value in the scope for each attribute
				// the hookup should probably happen after?
				can.each(can.makeArray(el.attributes), function (node, index) {
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
					var handler = function (ev, newVal) {
						scopePropertyUpdating = name;
						componentScope.attr(name, newVal);
						scopePropertyUpdating = null;
					};

					// compute only returned if bindable
					compute.bind("change", handler);

					// set the value to be added to the scope
					initalScopeData[name] = compute();

					// we don't need to listen to the compute `change` if it doesn't have any dependencies
					if (!compute.hasDependencies) {
						compute.unbind("change", handler);
					} else {
						// make sure we unbind (there's faster ways of doing this)
						can.bind.call(el, "removed", function () {
							compute.unbind("change", handler);
						});
						// setup two-way binding
						twoWayBindings[name] = computeData;
					}

				});
				if (this.constructor.Map) {
					// if `Map` property is set on the constructor use it to wrap the `initialScopeData`
					componentScope = new this.constructor.Map(initalScopeData);
				} else if (this.scope instanceof can.Map) {
					// if `this.scope` is instance of `can.Map` assign it to the `componentScope`
					componentScope = this.scope;
				} else if (can.isFunction(this.scope)) {
					// if `this.scope` is a function, call the function and 
					var scopeResult = this.scope(initalScopeData, hookupOptions.scope, el);

					if (scopeResult instanceof can.Map) {
						// if the function returns a can.Map, use that as the scope
						componentScope = scopeResult;
					} else if (scopeResult.prototype instanceof can.Map) {
						// if `scopeResult` is of a `can.Map` type, use it to wrap the `initialScopeData`
						componentScope = new scopeResult(initalScopeData);
					} else {
						// otherwise extend `can.Map` with the `scopeResult` and initialize it with the `initialScopeData`
						componentScope = new(can.Map.extend(scopeResult))(initalScopeData);
					}

				}
				// object to hold the bind handlers so we can tear them down
				var handlers = {};
				// setup reverse bindings
				can.each(twoWayBindings, function (computeData, prop) {
					handlers[prop] = function (ev, newVal) {
						// check that this property is not being changed because
						// it's source value just changed
						if (scopePropertyUpdating !== prop) {
							computeData.compute(newVal);
						}
					};
					componentScope.bind(prop, handlers[prop]);
				});
				// teardown reverse bindings when element is removed
				can.bind.call(el, "removed", function () {
					can.each(handlers, function (handler, prop) {
						componentScope.unbind(prop, handlers[prop]);
					});
				});
				// setup attributes bindings
				if (!can.isEmptyObject(this.constructor.attributeScopeMappings)) {
					// bind on the `attributes` event and update the scope
					can.bind.call(el, "attributes", function (ev) {
						// convert attribute name from `attribute-name` to `attributeName` 
						var camelized = can.camelize(ev.attributeName);
						if (component.constructor.attributeScopeMappings[camelized]) {
							// if there is a mapping for this attribute, update the `componentScope` attribute
							componentScope.attr(camelized, el.getAttribute(ev.attributeName));
						}
					});

				}

				// set `componentScope` to `this.scope` and set it to the element's `data` object as a `scope` property
				this.scope = componentScope;
				can.data(can.$(el), "scope", this.scope);

				// create a real Scope object out of the scope property
				var renderedScope = hookupOptions.scope.add(this.scope),

					options = {
						helpers: {}
					};


				// setup helpers to callback with `this` as the component
				can.each(this.helpers || {}, function (val, prop) {
					if (can.isFunction(val)) {
						options.helpers[prop] = function () {
							return val.apply(componentScope, arguments);
						};
					}
				});

				// create a control to listen to events
				this._control = new this.constructor.Control(el, {
					// pass the scope to the control so we can listen to it's changes
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
				// append resulting fragment to the element
				can.appendChild(el, frag);
			}
		});

	// if there is a `$` object and it has the `fn` object then create the `scope` plugin that returns
	// the scope object
	if (window.$ && $.fn) {
		$.fn.scope = function (attr) {
			if (attr) {
				// if `attr` is passed to the `scope` plugin return the value of that attribute on the `scope` object
				return this.data("scope")
					.attr(attr);
			} else {
				// otherwise return the whole scope
				return this.data("scope");
			}
		};
	}

	// define `can.scope` function that can be used to retrieve the `scope` from the element
	can.scope = function (el, attr) {
		el = can.$(el);
		if (attr) {
			// if `attr` is passed to the `can.scope` function return the value of that attribute on the `scope` object
			return can.data(el, "scope")
				.attr(attr);
		} else {
			// otherwise return the whole scope
			return can.data(el, "scope");
		}
	};

	return Component;
});
