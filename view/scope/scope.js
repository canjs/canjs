// # can/view/scope/scope.js
//
// This allows you to define a lookup context and parent contexts that a key's value can be retrieved from.
// If no parent scope is provided, only the scope's context will be explored for values.

steal(
	'can/util',
	'can/view/scope/compute_data.js',
	'can/construct',
	'can/map',
	'can/list',
	'can/view',
	'can/compute', function (can, makeComputeData) {


		/**
		 * @add can.view.Scope
		 */
		var Scope = can.Construct.extend(

			/**
			 * @static
			 */
			{
				// ## Scope.read
				// Scope.read was moved to can.compute.read
				// can.compute.read reads properties from a parent.  A much more complex version of getObject.
				read: can.compute.read,
				Refs: can.Map.extend({shortName: "ReferenceMap"},{}),
				Break: function(){},
				refsScope: function(){
					return new can.view.Scope( new this.Refs() );
				}
			},
			/**
			 * @prototype
			 */
			{
				init: function (context, parent, meta) {
					this._context = context;
					this._parent = parent;
					this.__cache = {};
					this._meta = meta || {};
				},
				get: can.__notObserve(function (key, options) {
					
					options = can.simpleExtend({
						isArgument: true
					}, options);
					
					var res = this.read(key, options);
					return res.value;
				}),
				// ## Scope.prototype.attr
				// Reads a value from the current context or parent contexts.
				attr: can.__notObserve(function (key, value, options) {
					// Reads for whatever called before attr.  It's possible
					// that this.read clears them.  We want to restore them.
					options = can.simpleExtend({
						isArgument: true
					}, options);

					// Allow setting a value on the context
					if(arguments.length === 2) {
						var lastIndex = key.lastIndexOf('.'),
							// Either get the paren of a key or the current context object with `.`
							readKey = lastIndex !== -1 ? key.substring(0, lastIndex) : '.',
							obj = this.read(readKey, options).value;

						if(lastIndex !== -1) {
							// Get the last part of the key which is what we want to set
							key = key.substring(lastIndex + 1, key.length);
						}

						can.compute.set(obj, key, value, options);
					} else {
						return this.get(key, options);
					}
					
				}),

				// ## Scope.prototype.add
				// Creates a new scope and sets the current scope to be the parent.
				// ```
				// var scope = new can.view.Scope([{name:"Chris"}, {name: "Justin"}]).add({name: "Brian"});
				// scope.attr("name") //-> "Brian"
				// ```
				add: function (context, meta) {
					if (context !== this._context) {
						return new this.constructor(context, this, meta);
					} else {
						return this;
					}
				},

				// ## Scope.prototype.computeData
				// Finds the first location of the key in the scope and then provides a get-set compute that represents the key's value
				// and other information about where the value was found.
				computeData: function (key, options) {
					return makeComputeData(this, key, options);
				},

				// ## Scope.prototype.compute
				// Provides a get-set compute that represents a key's value.
				compute: function (key, options) {
					return this.computeData(key, options)
						.compute;
				},
				getRefs: function(){
					return this.getScope(function(scope){
						return scope._context  instanceof Scope.Refs;
					});
				},
				getViewModel: function(){
					return this.getContext(function(scope){
						return scope._meta.viewModel;
					});
				},
				getContext: function(tester){
					var res = this.getScope(tester);
					return res && res._context;
				},
				getScope: function(tester){
					var scope = this;
					while (scope) {
						if(tester(scope)) {
							return scope;
						}
						scope = scope._parent;
					}
				},
				getRoot: function(){
					var cur = this,
						child = this;
						
					while(cur._parent) {
						child = cur;
						cur = cur._parent;
					}

					if(cur._context instanceof Scope.Refs) {
						cur = child;
					}
					return cur._context;
				},
				// this takes a scope and essentially copies its chain from
				// right before the last Refs.  And it does not include the ref.
				// this is a helper function to provide lexical semantics for refs.
				// This will not be needed for leakScope: false.
				cloneFromRef: function(){
					var contexts = [];
					var scope = this,
						context,
						parent;
					while (scope) {
						context = scope._context;
						if(context instanceof Scope.Refs) {
							parent = scope._parent;
							break;
						}
						contexts.push(context);
						scope = scope._parent;
					}
					if(parent) {
						can.each(contexts, function(context){
							parent = parent.add(context);
						});
						return parent;
					} else {
						return this;
					}
				},
				// ## Scope.prototype.read
				// Finds the first isntance of a key in the available scopes and returns the keys value along with the the observable the key
				// was found in, readsData and the current scope.
				/**
				 * @hide
				 * @param {can.mustache.key} attr A dot seperated path.  Use `"\."` if you have a property name that includes a dot.
				 * @param {can.view.Scope.readOptions} options that configure how this gets read.
				 * @return {{}}
				 * @option {Object} parent the value's immediate parent
				 * @option {can.Map|can.compute} rootObserve the first observable to read from.
				 * @option {Array<String>} reads An array of properties that can be used to read from the rootObserve to get the value.
				 * @option {*} value the found value
				 */
				read: function (attr, options) {
					// skip protected
					if(this._meta.protected) {
						return this._parent.read(attr, options);
					}
					var isInCurrentContext = attr.substr(0, 2) === './',
						isInParentContext = attr.substr(0, 3) === "../",
						isCurrentContext = attr === "." || attr === "this",
						isParentContext = attr === "..",
						isContextBased = isInCurrentContext ||
							isInParentContext ||
							isCurrentContext ||
							isParentContext;
							
					// notContent items can be read, but are skipped if you are doing .. sorta stuff.
					if(isContextBased && this._meta.notContext) {
						return this._parent.read(attr, options);
					}
					
					// check if we should only look within current scope
					var stopLookup;
					if(isInCurrentContext) {
						// set flag to halt lookup from walking up scope
						stopLookup = true;
						// stop lookup from checking parent scopes
						attr = attr.substr(2);
					}
					// check if we should be running this on a parent.
					else if (isInParentContext) {
						return this._parent.read(attr.substr(3), options);
					}
					else if ( isCurrentContext ) {
						return {
							value: this._context
						};
					}
					else if ( isParentContext ) {
						return {
							value: this._parent._context
						};
					} else if(attr === "%root") {
						return { value: this.getRoot() };
					}

					// Array of names from splitting attr string into names.  ```"a.b\.c.d\\.e" //-> ['a', 'b', 'c', 'd.e']```
					var names = can.compute.read.reads(attr),
					// The current context (a scope is just data and a parent scope).
						context,
					// The current scope.
						scope = names[0].key.charAt(0) === "*" ? this.getRefs() : this,

					// If no value can be found, this is a list of of every observed
					// object and property name to observe.
						undefinedObserves = [],
					// Tracks the first found observe.
						currentObserve,
					// Tracks the reads to get the value for a scope.
						currentReads,

						// Tracks the most likely observable to use as a setter.
						setObserveDepth = -1,
						currentSetReads,
						currentSetObserve,
					// Only search one reference scope for a variable.
						searchedRefsScope = false,
						refInstance,
						readOptions = can.simpleExtend({
							/* Store found observable, incase we want to set it as the rootObserve. */
							foundObservable: function (observe, nameIndex) {
								currentObserve = observe;
								currentReads = names.slice(nameIndex);
							},
							earlyExit: function (parentValue, nameIndex) {
								if (nameIndex > setObserveDepth) {
									currentSetObserve = currentObserve;
									currentSetReads = currentReads;
									setObserveDepth = nameIndex;
								}
							}
						}, options);

					// Goes through each scope context provided until it finds the key (attr).  Once the key is found
					// then it's value is returned along with an observe, the current scope and reads.
					// While going through each scope context searching for the key, each observable found is returned and
					// saved so that either the observable the key is found in can be returned, or in the case the key is not
					// found in an observable the closest observable can be returned.

					while (scope) {
						context = scope._context;
						refInstance = context instanceof Scope.Refs;

						
						
						if ( context !== null &&
							// if its a primitive type, keep looking up the scope, since there won't be any properties
							(typeof context === "object" || typeof context === "function") &&
							!( searchedRefsScope && refInstance ) &&
							// If the scope is protected skip
							! scope._meta.protected
							) {

							if(refInstance) {
								searchedRefsScope = true;
							}
							var getObserves = can.__trapObserves();
							
							var data = can.compute.read(context, names, readOptions);
							
							var observes = getObserves();
							// **Key was found**, return value and location data
							if (data.value !== undefined) {
								can.__observes(observes);
								return {
									scope: scope,
									rootObserve: currentObserve,
									value: data.value,
									reads: currentReads
								};
							} else {
								// save all old readings before we try the next scope
								undefinedObserves.push.apply(undefinedObserves, observes);
							}
						}

						if(!stopLookup) {
							// Move up to the next scope.
							scope = scope._parent;
						} else {
							scope = null;
						}
					}

					// **Key was not found**, return undefined for the value.
					// Make sure we listen to everything we checked for when the value becomes defined.
					// Once it becomes defined, we won't have to listen to so many things.
					can.__observes(undefinedObserves);
					return {
						setRoot: currentSetObserve,
						reads: currentSetReads,
						value: undefined
					};

				}
			});

		can.view.Scope = Scope;
		return Scope;
	});
