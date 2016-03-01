// # can/component/component.js
//
// This implements the `can.Component` which allows you to create widgets
// that use a template, a view-model and custom tags.
//
// `can.Component` implements most of it's functionality in the `can.Component.setup`
// and the `can.Component.prototype.setup` functions.
//
// `can.Component.setup` prepares everything needed by the `can.Component.prototype.setup`
// to hookup the component.

steal("can/util", "can/view/callbacks","can/view/elements.js","can/view/bindings","can/control", "can/observe", "can/view/mustache", "can/util/view_model", function (can, viewCallbacks, elements, bindings) {
	// ## Helpers
	// Attribute names to ignore for setting viewModel values.
	var paramReplacer = /\{([^\}]+)\}/g;

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

				// When `can.Component.setup` function is ran for the first time, `can.Component` doesn't exist yet
				// which ensures that the following code is ran only in constructors that extend `can.Component`.
				if (can.Component) {
					var self = this,
						protoViewModel = this.prototype.scope || this.prototype.viewModel;

					// Define a control using the `events` prototype property.
					this.Control = ComponentControl.extend( this.prototype.events );

					// Look to convert `protoViewModel` to a Map constructor function.
					if (!protoViewModel || (typeof protoViewModel === "object" && ! (protoViewModel instanceof can.Map)  ) ) {
						// If protoViewModel is an object, use that object as the prototype of an extended
						// Map constructor function.
						// A new instance of that Map constructor function will be created and
						// set a the constructor instance's viewModel.
						this.Map = can.Map.extend(protoViewModel || {});
					}
					else if (protoViewModel.prototype instanceof can.Map) {
						// If viewModel is a can.Map constructor function, just use that.
						this.Map = protoViewModel;
					}

					// Look for default `@` values. If a `@` is found, these
					// attributes string values will be set and 2-way bound on the
					// component instance's viewModel.
					this.attributeScopeMappings = {};
					can.each(this.Map ? this.Map.defaults : {}, function (val, prop) {
						if (val === "@") {
							self.attributeScopeMappings[prop] = prop;
						}
					});

					// Convert the template into a renderer function.
					if (this.prototype.template) {
						// If `this.prototype.template` is a function create renderer from it by
						// wrapping it with the anonymous function that will pass it the arguments,
						// otherwise create the render from the string
						if (typeof this.prototype.template === "function") {
							var temp = this.prototype.template;
							this.renderer = function () {
								return can.view.frag(temp.apply(null, arguments));
							};
						} else {
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
			setup: function (el, componentTagData) {

				// Setup values passed to component
				var initialViewModelData = {},
					component = this,
					// If a template is not provided, we fall back to
					// dynamic scoping regardless of settings.
					lexicalContent = ((typeof this.leakScope === "undefined" ?
									   false :
									   !this.leakScope) &&
									  !!this.template),
					
				// the object added to the scope
					viewModel,
					frag,
				// an array of teardown stuff that should happen when the element is removed
					teardownFunctions = [],
					callTeardownFunctions = function(){
						for(var i = 0, len = teardownFunctions.length ; i < len; i++) {
							teardownFunctions[i]();
						}
					},
					$el = can.$(el),
					setupBindings = !can.data($el,"preventDataBindings");

				// ## Scope

				// Add viewModel prototype properties marked with an "@" to the `initialViewModelData` object
				can.each(this.constructor.attributeScopeMappings, function (val, prop) {
					initialViewModelData[prop] = el.getAttribute(can.hyphenate(val));
				});
				
				if(setupBindings) {
					teardownFunctions.push(bindings.behaviors.viewModel(el, componentTagData, function(initialViewModelData){
						
						// Make %root available on the viewModel.
						initialViewModelData["%root"] = componentTagData.scope.attr("%root");

						// Create the component's viewModel.
						var protoViewModel = component.scope || component.viewModel;
						if (component.constructor.Map) {
							// If `Map` property is set on the constructor use it to wrap the `initialViewModelData`
							viewModel = new component.constructor.Map(initialViewModelData);
						} else if (protoViewModel instanceof can.Map) {
							// If `component.viewModel` is instance of `can.Map` assign it to the `viewModel`
							viewModel = protoViewModel;
						} else if (can.isFunction(protoViewModel)) {
							// If `component.viewModel` is a function, call the function and
							var scopeResult = protoViewModel.call(component, initialViewModelData, componentTagData.scope, el);
		
							if (scopeResult instanceof can.Map) {
								// If the function returns a can.Map, use that as the viewModel
								viewModel = scopeResult;
							} else if (scopeResult.prototype instanceof can.Map) {
								// If `scopeResult` is of a `can.Map` type, use it to wrap the `initialViewModelData`
								viewModel = new scopeResult(initialViewModelData);
							} else {
								// Otherwise extend `can.Map` with the `scopeResult` and initialize it with the `initialViewModelData`
								viewModel = new(can.Map.extend(scopeResult))(initialViewModelData);
							}
						}

						var oldSerialize = viewModel.serialize;
						viewModel.serialize = function () {
							var result = oldSerialize.apply(this, arguments);
							delete result["%root"];
							return result;
						};
						
						return viewModel;
					}, initialViewModelData));
				}

				// Set `viewModel` to `this.viewModel` and set it to the element's `data` object as a `viewModel` property
				this.scope = this.viewModel = viewModel;
				can.data($el, "scope", this.viewModel);
				can.data($el, "viewModel", this.viewModel);
				can.data($el,"preventDataBindings", true);

				// Create a real Scope object out of the viewModel property
				// The scope used to render the component's template.
				// However, if there is no template, the "light" dom is rendered with this anyway.
				var shadowScope;
				if(lexicalContent) {
					shadowScope = can.view.Scope.refsScope().add(this.viewModel,{viewModel: true});
				} else {
					// if this component has a template,
					// render the template with it's own Refs scope
					// otherwise, just add this component's viewModel.
					shadowScope = ( this.constructor.renderer ?
						componentTagData.scope.add( new can.view.Scope.Refs() ) :
						componentTagData.scope  )
							.add(this.viewModel,{viewModel: true});
				}
				var options = {
						helpers: {}
					},
					addHelper = function(name, fn) {
						options.helpers[name] = function() {
							return fn.apply(viewModel, arguments);
						};
					};

				// ## Helpers

				// Setup helpers to callback with `this` as the component
				can.each(this.helpers || {}, function (val, prop) {
					if (can.isFunction(val)) {
						addHelper(prop, val);
					}
				});

				// Setup simple helpers
				can.each(this.simpleHelpers || {}, function(val, prop) {
					//!steal-remove-start
					if(options.helpers[prop]) {
						can.dev.warn('Component ' + component.tag +
						' already has a helper called ' + prop);
					}
					//!steal-remove-end

					// Convert the helper
					addHelper(prop, can.view.simpleHelper(val));
				});

				// ## `events` control

				// Create a control to listen to events
				this._control = new this.constructor.Control(el, {
					// Pass the viewModel to the control so we can listen to it's changes from the controller.
					scope: this.viewModel,
					viewModel: this.viewModel,
					destroy: callTeardownFunctions
				});

				// ## Rendering

				// Keep a nodeList so we can kill any directly nested nodeLists within this component
				var nodeList = can.view.nodeLists.register([], undefined, componentTagData.parentNodeList || true, false);
				nodeList.expression = "<"+this.tag+">";
				teardownFunctions.push(function(){
					can.view.nodeLists.unregister(nodeList);
				});

				// If this component has a template (that we've already converted to a renderer)
				if (this.constructor.renderer) {
					// If `options.tags` doesn't exist set it to an empty object.
					if (!options.tags) {
						options.tags = {};
					}

					// We need be alerted to when a <content> element is rendered so we can put the original contents of the widget in its place
					options.tags.content = function contentHookup(el, contentTagData) {
						// First check if there was content within the custom tag
						// otherwise, render what was within <content>, the default code.
						// `componentTagData.subtemplate` is the content inside this component
						var subtemplate = componentTagData.subtemplate || contentTagData.subtemplate,
							renderingLightContent = subtemplate === componentTagData.subtemplate;

						if (subtemplate) {

							// `contentTagData.options` is a viewModel of helpers where `<content>` was found, so
							// the right helpers should already be available.
							// However, `_tags.content` is going to point to this current content callback.  We need to
							// remove that so it will walk up the chain

							delete options.tags.content;

							// By default, light dom scoping is
							// dynamic. This means that any `{{foo}}`
							// bindings inside the "light dom" content of
							// the component will have access to the
							// internal viewModel. This can be overridden to be
							// lexical with the leakScope option.
							var lightTemplateData;
							if( renderingLightContent ) {
								if(lexicalContent) {
									// render with the same scope the component was found within.
									lightTemplateData = componentTagData;
								} else {
									// render with the component's viewModel mixed in, however
									// we still want the outer refs to be used, NOT the component's refs
									// <component> {{some value }} </component>
									// To fix this, we
									// walk down the scope to the component's ref, clone scopes from that point up
									// use that as the new scope.
									lightTemplateData = {
										scope: contentTagData.scope.cloneFromRef(),
										options: contentTagData.options
									};
								}

							} else {
								// we are rendering default content so this content should
								// use the same scope as the <content> tag was found within.
								lightTemplateData = contentTagData;
							}
							
							if(contentTagData.parentNodeList) {
								var frag = subtemplate( lightTemplateData.scope, lightTemplateData.options, contentTagData.parentNodeList );
								elements.replace([el], frag);
							} else {
								can.view.live.replace([el], subtemplate( lightTemplateData.scope, lightTemplateData.options ));
							}

							// Restore the content tag so it could potentially be used again (as in lists)
							options.tags.content = contentHookup;
						}
					};
					// Render the component's template
					frag = this.constructor.renderer(shadowScope, componentTagData.options.add(options), nodeList);
				} else {
					// Otherwise render the contents between the element
					if(componentTagData.templateType === "legacy") {
						frag = can.view.frag(componentTagData.subtemplate ? componentTagData.subtemplate(shadowScope, componentTagData.options.add(options)) : "");
					} else {
						// we need to be the parent ... or we need to
						frag = componentTagData.subtemplate ?
							componentTagData.subtemplate(shadowScope, componentTagData.options.add(options), nodeList) :
							document.createDocumentFragment();
					}

				}
				// Append the resulting document fragment to the element
				can.appendChild(el, frag, can.document);

				// update the nodeList with the new children so the mapping gets applied
				can.view.nodeLists.update(nodeList, can.childNodes(el));
			}
		});
	

	var ComponentControl = can.Control.extend({
			// Change lookup to first look in the viewModel.
			_lookup: function (options) {
				return [options.scope, options, window];
			},
			_action: function (methodName, options, controlInstance ) {
				var hasObjectLookup, readyCompute;

				paramReplacer.lastIndex = 0;

				hasObjectLookup = paramReplacer.test(methodName);

				// If we don't have options (a `control` instance), we'll run this
				// later.
				if( !controlInstance && hasObjectLookup) {
					return;
				} else if( !hasObjectLookup ) {
					return can.Control._action.apply(this, arguments);
				} else {
					// We have `hasObjectLookup` and `controlInstance`.

					readyCompute = can.compute(function(){
						var delegate;

						// Set the delegate target and get the name of the event we're listening to.
						var name = methodName.replace(paramReplacer, function(matched, key){
							var value;

							// If we are listening directly on the `viewModel` set it as a delegate target.
							if(key === "scope" || key === "viewModel") {
								delegate = options.viewModel;
								return "";
							}

							// Remove `viewModel.` from the start of the key and read the value from the `viewModel`.
							key = key.replace(/^(scope|^viewModel)\./,"");
							value = can.compute.read(options.viewModel, can.compute.read.reads(key), {
								// if we find a compute, we should bind on that and not read it
								readCompute: false
							}).value;

							// If `value` is undefined use `can.getObject` to get the value.
							if(value === undefined) {
								value = can.getObject(key);
							}

							// If `value` is a string we just return it, otherwise we set it as a delegate target.
							if(typeof value === "string") {
								return value;
							} else {
								delegate = value;
								return "";
							}

						});

						// Get the name of the `event` we're listening to.
						var parts = name.split(/\s+/g),
							event = parts.pop();

						// Return everything needed to handle the event we're listening to.
						return {
							processor: this.processors[event] || this.processors.click,
							parts: [name, parts.join(" "), event],
							delegate: delegate || undefined
						};

					}, this);

					// Create a handler function that we'll use to handle the `change` event on the `readyCompute`.
					var handler = function(ev, ready){
						// unbinds the old binding
						controlInstance._bindings.control[methodName](controlInstance.element);
						// binds the new
						controlInstance._bindings.control[methodName] = ready.processor(
							ready.delegate || controlInstance.element,
							ready.parts[2], ready.parts[1], methodName, controlInstance);
					};

					readyCompute.bind("change", handler);

					controlInstance._bindings.readyComputes[methodName] = {
						compute: readyCompute,
						handler: handler
					};

					return readyCompute();
				}
			}
		},
		// Extend `events` with a setup method that listens to changes in `viewModel` and
		// rebinds all templated event handlers.
		{
			setup: function (el, options) {
				this.scope = options.scope;
				this.viewModel = options.viewModel;
				return can.Control.prototype.setup.call(this, el, options);
			},
			off: function(){
				// If `this._bindings` exists we need to go through it's `readyComputes` and manually
				// unbind `change` event listeners set by the controller.
				if( this._bindings ) {
					can.each(this._bindings.readyComputes || {}, function (value) {
						value.compute.unbind("change", value.handler);
					});
				}
				// Call `can.Control.prototype.off` function on this instance to cleanup the bindings.
				can.Control.prototype.off.apply(this, arguments);
				this._bindings.readyComputes = {};
			},
			destroy: function() {
				can.Control.prototype.destroy.apply( this, arguments );
				if(typeof this.options.destroy === 'function') {
					this.options.destroy.apply(this, arguments);
				}
			}
		});

	/**
	 * @description Read and write a component element's viewModel.
	 *
	 * @function can.viewModel
	 * @parent can.util
	 * @signature `can.viewModel(el[, attr[, value]])`
	 * @param {HTMLElement|NodeList} el can.Component element to get viewModel of.
	 * @param {String} [attr] Attribute name to access.
	 * @param {*} [val] Value to write to the viewModel attribute.
	 *
	 * @return {*} If only one argument, returns the viewModel itself. If two
	 * arguments are given, returns the attribute value. If three arguments
	 * are given, returns the element itself after assigning the value (for
	 * chaining).
	 *
	 * @body
	 *
	 * `can.viewModel` can be used to directly access a [can.Component]'s
	 * viewModel. Depending on how it's called, it can be used to get the
	 * entire viewModel object, read a specific property from it, or write a
	 * property. The property read and write features can be seen as a
	 * shorthand for code such as `$("my-thing").viewModel().attr("foo", val);`
	 *
	 * If using jQuery, this function is accessible as a jQuery plugin,
	 * with one fewer argument to the call. For example,
	 * `$("my-element").viewModel("name", "Whatnot");`
	 *
	 */
	// Define the `can.viewModel` function that can be used to retrieve the
	// `viewModel` from the element


	var $ = can.$;

	// If `$` has an `fn` object create the
	// `scope` plugin that returns the scope object.
	if ($.fn) {
		$.fn.scope = $.fn.viewModel = function () {
			// Just use `can.scope` as the base for this function instead
			// of repeating ourselves.
			return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
		};
	}

	return Component;
});