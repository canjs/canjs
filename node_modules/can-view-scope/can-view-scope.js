"use strict";
// # can-view-scope.js
//
// This provides the ability to lookup values across a higherarchy of objects.  This is similar to
// how closures work in JavaScript.
//
// This is done with the `Scope` type. It works by having a `_context` reference to
// an object whose properties can be searched for values.  It also has a `_parent` reference
// to the next Scope in which to check.  In this way, `Scope` is used to form a tree-like
// structure.  Leaves and Nodes in the tree only point to their parent.
var stacheKey = require('can-stache-key');
var ObservationRecorder = require("can-observation-recorder");
var TemplateContext = require('./template-context');
var makeComputeData = require('./compute_data');
var assign = require('can-assign');
var namespace = require('can-namespace');
var canReflect = require("can-reflect");
var canLog = require('can-log/dev/dev');
var defineLazyValue = require('can-define-lazy-value');
var stacheHelpers = require('can-stache-helpers');
var LetContext = require('./let-context');


// ## Helpers

function canHaveProperties(obj){
	return obj != null;
}
function returnFalse(){
	return false;
}

// ## Scope
// Represents a node in the scope tree.
function Scope(context, parent, meta) {
	// The object that will be looked on for values.
	// If the type of context is TemplateContext, there will be special rules for it.
	this._context = context;
	// The next Scope object whose context should be looked on for values.
	this._parent = parent;
	// If this is a special context, it can be labeled here.
	// Options are:
	// - `viewModel` - This is a viewModel. This is mostly used by can-component to make `scope.vm` work.
	// - `notContext` - This can't be looked within using `./` and `../`. It will be skipped.
	//   This is for virtual contexts like those used by `%index`. This is very much like
	//   `variable`.  Most things should switch to `variable` in the future.
	// - `special` - This can't be looked within using `./` and `../`. It will be skipped.
	//   This is for reading properties on the scope {{scope.index}}. It's different from variable
	//   because it's never lookup up like {{key}}.
	// - `variable` - This is used to define a variable (as opposed to "normal" context). These
	//   will also be skipped when using `./` and `../`.
	this._meta = meta || {};

	// A cache that can be used to store computes used to look up within this scope.
	// For example if someone creates a compute to lookup `name`, another compute does not
	// need to be created.
	this.__cache = {};
}

var parentContextSearch = /(\.\.\/)|(\.\/)|(this[\.@])/g;

// ## Static Methods
// The following methods are exposed mostly for testing purposes.
assign(Scope, {
	// ### Scope.read
	// Scope.read was moved to can-stache-key.read
	// can-stache-key.read reads properties from a parent. A much more complex version of getObject.
	read: stacheKey.read,
	TemplateContext: TemplateContext,
	// ### keyInfo(key)
	// Returns an object that details what the `key` means with the following:
	// ```js
	// {
	//   remainingKey, // what would be read on a context (or this)
	//   isScope, // if the scope itself is being read
	//   inScope, // if a key on the scope is being read
	//   parentContextWalkCount, // how many ../
	//   isContextBased // if a "normal" context is explicitly being read
	// }
	// ```
	keyInfo: function(attr){

		if (attr === "./") {
			attr = "this";
		}

		var info = {remainingKey: attr};

		// handle scope stuff first
		info.isScope = attr === "scope";
		if(info.isScope) {
			return info;
		}
		var firstSix = attr.substr(0, 6);
		info.isInScope =
			firstSix === "scope." ||
			firstSix === "scope@";
		if(info.isInScope) {
			info.remainingKey = attr.substr(6);
			return info;
		} else if(firstSix === "scope/") {
			info.walkScope = true;
			info.remainingKey = attr.substr(6);
			return info;
		} else if(attr.substr(0, 7) === "@scope/") {
			info.walkScope = true;
			info.remainingKey = attr.substr(7);
			return info;
		}

		info.parentContextWalkCount = 0;
		// Searches for `../` and other context specifiers
		info.remainingKey = attr.replace(parentContextSearch, function(token, parentContext, dotSlash, thisContext, index){
			info.isContextBased = true;
			if(parentContext !== undefined) {
				info.parentContextWalkCount++;
			}
			return "";
		});
		// ../..
		if(info.remainingKey === "..") {
			info.parentContextWalkCount++;
			info.remainingKey = "this";
		}
		else if(info.remainingKey === "." || info.remainingKey === "") {
			info.remainingKey = "this";
		}

		if(info.remainingKey === "this") {
			info.isContextBased = true;
		}
		return info;
	},
	// ### isTemplateContextOrCanNotHaveProperties
	// Returns `true` if a template context or a `null` or `undefined`
	// context.
	isTemplateContextOrCanNotHaveProperties: function(currentScope){
		var currentContext = currentScope._context;
		if(currentContext instanceof TemplateContext) {
			return true;
		} else if( !canHaveProperties(currentContext) ) {
			return true;
		}
		return false;
	},
	// ### shouldSkipIfSpecial
	// Return `true` if special.
	shouldSkipIfSpecial: function(currentScope){
		var isSpecialContext = currentScope._meta.special === true;
		if (isSpecialContext === true) {
			return true;
		}
		if( Scope.isTemplateContextOrCanNotHaveProperties(currentScope) ) {
			return true;
		}
		return false;
	},
	// ### shouldSkipEverythingButSpecial
	// Return `true` if not special.
	shouldSkipEverythingButSpecial: function(currentScope){
		var isSpecialContext = currentScope._meta.special === true;
		if (isSpecialContext === false) {
			return true;
		}
		if( Scope.isTemplateContextOrCanNotHaveProperties(currentScope) ) {
			return true;
		}
		return false;
	},
	// ### makeShouldExitOnSecondNormalContext
	// This will keep checking until we hit a second "normal" context.
	makeShouldExitOnSecondNormalContext: function(){
		var foundNormalContext = false;
		return function shouldExitOnSecondNormalContext(currentScope){
			var isNormalContext = !currentScope.isSpecial();
			var shouldExit = isNormalContext && foundNormalContext;
			// leaks some state
			if(isNormalContext) {
				foundNormalContext = true;
			}
			return shouldExit;
		};
	},
	// ### makeShouldExitAfterFirstNormalContext
	// This will not check anything after the first normal context.
	makeShouldExitAfterFirstNormalContext: function(){
		var foundNormalContext = false;
		return function shouldExitAfterFirstNormalContext(currentScope){
			if(foundNormalContext) {
				return true;
			}
			var isNormalContext = !currentScope.isSpecial();
			// leaks some state
			if(isNormalContext) {
				foundNormalContext = true;
			}
			return false;
		};
	},
	// ### makeShouldSkipSpecialContexts
	// Skips `parentContextWalkCount` contexts. This is used to
	// walk past scopes when `../` is used.
	makeShouldSkipSpecialContexts: function(parentContextWalkCount){
		var walkCount = parentContextWalkCount || 0;
		return function shouldSkipSpecialContexts(currentScope){
			// after walking past the correct number of contexts,
			// should not skip notContext scopes
			// so that ../foo can be used to read from a notContext scope
			if (walkCount < 0 && currentScope._meta.notContext) {
				return false;
			}

			if(currentScope.isSpecial()) {
				return true;
			}
			walkCount--;

			if(walkCount < 0) {
				return false;
			}
			return true;
		};
	}
});

// ## Prototype methods
assign(Scope.prototype, {

	// ### scope.add
	// Creates a new scope and sets the current scope to be the parent.
	// ```
	// var scope = new can.view.Scope([
	//   {name:"Chris"},
	//   {name: "Justin"}
	// ]).add({name: "Brian"});
	// scope.attr("name") //-> "Brian"
	// ```
	add: function(context, meta) {
		if (context !== this._context) {
			return new this.constructor(context, this, meta);
		} else {
			return this;
		}
	},

	// ### scope.find
	// This is the equivalent of Can 3's scope walking.
	find: function(attr, options) {

		var keyReads = stacheKey.reads(attr);
		var howToRead = {
			shouldExit: returnFalse,
			shouldSkip: Scope.shouldSkipIfSpecial,
			shouldLookForHelper: true,
			read: stacheKey.read
		};
		var result = this._walk(keyReads, options, howToRead);

		return result.value;

	},
	// ### scope.readFromSpecialContext
	readFromSpecialContext: function(key) {
		return this._walk(
			[{key: key, at: false }],
			{ special: true },
			{
				shouldExit: returnFalse,
				shouldSkip: Scope.shouldSkipEverythingButSpecial,
				shouldLookForHelper: false,
				read: stacheKey.read
			}
		);
	},

	// ### scope.readFromTemplateContext
	readFromTemplateContext: function(key, readOptions) {
		var keyReads = stacheKey.reads(key);
		return stacheKey.read(this.templateContext, keyReads, readOptions);
	},

	// ### Scope.prototype.read
	// Reads from the scope chain and returns the first non-`undefined` value.
	// `read` deals mostly with setting up "context based" keys to start reading
	// from the right scope. Once the right scope is located, `_walk` is called.
	/**
	 * @hide
	 * @param {can.stache.key} attr A dot-separated path. Use `"\."` if you have a property name that includes a dot.
	 * @param {can.view.Scope.readOptions} options that configure how this gets read.
	 * @return {{}}
	 *   @option {Object} parent the value's immediate parent
	 *   @option {can.Map|can.compute} rootObserve the first observable to read from.
	 *   @option {Array<String>} reads An array of properties that can be used to read from the rootObserve to get the value.
	 *   @option {*} value the found value
	 */
	read: function(attr, options) {
		options = options || {};
		return this.readKeyInfo(Scope.keyInfo(attr), options || {});
	},
	readKeyInfo: function(keyInfo, options){

		// Identify context based keys. Context based keys try to
		// specify a particular context a key should be within.
		var readValue,
			keyReads,
			howToRead = {
				read: options.read || stacheKey.read
			};

		// 1.A. Handle reading the scope itself
		if (keyInfo.isScope) {
			return { value: this };
		}
		// 1.B. Handle reading something on the scope
		else if (keyInfo.isInScope) {
			keyReads = stacheKey.reads(keyInfo.remainingKey);
			// check for a value on Scope.prototype
			readValue = stacheKey.read(this, keyReads, options);

			// otherwise, check the templateContext
			if (typeof readValue.value === 'undefined' && !readValue.parentHasKey) {
				readValue = this.readFromTemplateContext(keyInfo.remainingKey, options);
			}

			return assign(readValue, {
				thisArg: keyReads.length > 0 ? readValue.parent : undefined
			});
		}
		// 1.C. Handle context-based reads. They should skip over special stuff.
		// this.key, ../.., .././foo
		else if (keyInfo.isContextBased) {
			// TODO: REMOVE
			// options && options.special === true && console.warn("SPECIAL!!!!");

			if(keyInfo.remainingKey !== "this") {
				keyReads = stacheKey.reads(keyInfo.remainingKey);
			} else {
				keyReads = [];
			}
			howToRead.shouldExit = Scope.makeShouldExitOnSecondNormalContext();
			howToRead.shouldSkip = Scope.makeShouldSkipSpecialContexts(keyInfo.parentContextWalkCount);
			howToRead.shouldLookForHelper = true;

			return this._walk(keyReads, options, howToRead);
		}
		// 1.D. Handle scope walking with scope/key
		else if(keyInfo.walkScope) {
			howToRead.shouldExit = returnFalse;
			howToRead.shouldSkip = Scope.shouldSkipIfSpecial;
			howToRead.shouldLookForHelper = true;
			keyReads = stacheKey.reads(keyInfo.remainingKey);

			return this._walk(keyReads, options, howToRead);
		}
		// 1.E. Handle reading without context clues
		// {{foo}}
		else {
			keyReads = stacheKey.reads(keyInfo.remainingKey);

			var isSpecialRead = options && options.special === true;
			// TODO: remove
			// options && options.special === true && console.warn("SPECIAL!!!!");

			howToRead.shouldExit = Scope.makeShouldExitOnSecondNormalContext();
			howToRead.shouldSkip = isSpecialRead ? Scope.shouldSkipEverythingButSpecial : Scope.shouldSkipIfSpecial;
			howToRead.shouldLookForHelper = isSpecialRead ? false : true;

			return this._walk(keyReads, options, howToRead);
		}
	},


	// ### scope._walk
	// This is used to walk up the scope chain.
	_walk: function(keyReads, options, howToRead) {
		// The current scope and context we are trying to find "keyReads" within.
		var currentScope = this,
			currentContext,

			// If no value can be found, this is a list of of every observed
			// object and property name to observe.
			undefinedObserves = [],

			// Tracks the first found observe.
			currentObserve,
			// Tracks the reads to get the value from `currentObserve`.
			currentReads,

			// Tracks the most likely observable to use as a setter.
			setObserveDepth = -1,
			currentSetReads,
			currentSetObserve,

			readOptions = assign({
				/* Store found observable, incase we want to set it as the rootObserve. */
				foundObservable: function(observe, nameIndex) {
					currentObserve = observe;
					currentReads = keyReads.slice(nameIndex);
				},
				earlyExit: function(parentValue, nameIndex) {
					var isVariableScope = currentScope._meta.variable === true,
						updateSetObservable = false;
					if(isVariableScope === true && nameIndex === 0) {
						// we MUST have pre-defined the key in a variable scope
						updateSetObservable = canReflect.hasKey( parentValue, keyReads[nameIndex].key);
					} else {
						updateSetObservable =
							// Has more matches
							nameIndex > setObserveDepth ||
							// The same number of matches but it has the key
							nameIndex === setObserveDepth && (typeof parentValue === "object" && canReflect.hasOwnKey( parentValue, keyReads[nameIndex].key));
					}
					if ( updateSetObservable ) {
						currentSetObserve = currentObserve;
						currentSetReads = currentReads;
						setObserveDepth = nameIndex;
					}
				}
			}, options);



		var isRecording = ObservationRecorder.isRecording(),
			readAContext = false;

		// Goes through each scope context provided until it finds the key (attr). Once the key is found
		// then it's value is returned along with an observe, the current scope and reads.
		// While going through each scope context searching for the key, each observable found is returned and
		// saved so that either the observable the key is found in can be returned, or in the case the key is not
		// found in an observable the closest observable can be returned.
		while (currentScope) {

			if(howToRead.shouldSkip(currentScope) === true) {
				currentScope = currentScope._parent;
				continue;
			}
			if(howToRead.shouldExit(currentScope) === true) {
				break;
			}
			readAContext = true;

			currentContext = currentScope._context;


			// Prevent computes from temporarily observing the reading of observables.
			var getObserves = ObservationRecorder.trap();

			var data = howToRead.read(currentContext, keyReads, readOptions);

			// Retrieve the observes that were read.
			var observes = getObserves();
			// If a **value was was found**, return value and location data.
			if (data.value !== undefined || data.parentHasKey) {

				if(!observes.length && isRecording) {
					// if we didn't actually observe anything
					// the reads and currentObserve don't mean anything
					// we just point to the current object so setting is fast
					currentObserve = data.parent;
					currentReads = keyReads.slice(keyReads.length - 1);
				} else {
					ObservationRecorder.addMany(observes);
				}

				return {
					scope: currentScope,
					rootObserve: currentObserve,
					value: data.value,
					reads: currentReads,
					thisArg: data.parent,
					parentHasKey: data.parentHasKey
				};
			}
			// Otherwise, save all observables that were read. If no value
			// is found, we will observe on all of them.
			else {
				undefinedObserves.push.apply(undefinedObserves, observes);
			}

			currentScope = currentScope._parent;
		}

		// The **value was not found** in the scope
		// if not looking for a "special" key, check in can-stache-helpers
		if (howToRead.shouldLookForHelper) {
			var helper = this.getHelperOrPartial(keyReads);

			if (helper && helper.value) {
				// Don't return parent so `.bind` is not used.
				return {value: helper.value};
			}
		}

		// The **value was not found**, return `undefined` for the value.
		// Make sure we listen to everything we checked for when the value becomes defined.
		// Once it becomes defined, we won't have to listen to so many things.
		ObservationRecorder.addMany(undefinedObserves);
		return {
			setRoot: currentSetObserve,
			reads: currentSetReads,
			value: undefined,
			noContextAvailable: !readAContext
		};
	},
	// ### scope.getDataForScopeSet
	// Returns an object with data needed by `.set` to figure out what to set,
	// and how.
	// {
	//   parent: what is being set
	//   key: try setting a key value
	//   how: "setValue" | "set" | "updateDeep" | "write" | "setKeyValue"
	// }
	// This works by changing how `readKeyInfo` will read individual scopes.
	// Specifically, with something like `{{foo.bar}}` it will read `{{foo}}` and
	// only check if a `bar` property exists.
	getDataForScopeSet: function getDataForScopeSet(key, options) {
		var keyInfo = Scope.keyInfo(key);
		var firstSearchedContext;

		// Overwrite the options to use this read.
		var opts = assign({
			// This read is used by `._walk` to read from the scope.
			// This will use `hasKey` on the last property instead of reading it.
			read: function(context, keys){

				// If nothing can be found with the keys we are looking for, save the
				// first possible match.  This is where we will write to.
				if(firstSearchedContext === undefined && !(context instanceof LetContext)) {
					firstSearchedContext = context;
				}
				// If we have multiple keys ...
				if(keys.length > 1) {
					// see if we can find the parent ...
					var parentKeys = keys.slice(0, keys.length-1);
					var parent = stacheKey.read(context, parentKeys, options).value;

					// If there is a parent, see if it has the last key
					if( parent != null && canReflect.hasKey(parent, keys[keys.length-1].key ) ) {
						return {
							parent: parent,
							parentHasKey: true,
							value: undefined
						};
					} else {
						return {};
					}
				}
				// If we have only one key, try to find a context with this key
				else if(keys.length === 1) {
					if( canReflect.hasKey(context, keys[0].key ) ) {
						return {
							parent: context,
							parentHasKey: true,
							value: undefined
						};
					} else {
						return {};
					}
				}
				// If we have no keys, we are reading `this`.
				else {
					return {
						value: context
					};
				}
			}
		},options);


		// Use the read above to figure out what we are probably writing to.
		var readData = this.readKeyInfo(keyInfo, opts);

		if(keyInfo.remainingKey === "this") {
			// If we are setting a context, then return that context
			return { parent: readData.value, how: "setValue" };
		}
		// Now we are trying to set a property on something.  Parent will
		// be the something we are setting a property on.
		var parent;

		var props = keyInfo.remainingKey.split(".");
		var propName = props.pop();

		// If we got a `thisArg`, that's the parent.
		if(readData.thisArg) {
			parent = readData.thisArg;
		}
		// Otherwise, we didn't find anything, use the first searched context.
		// TODO: there is likely a bug here when trying to set foo.bar where nothing in the scope
		// has a foo.
		else if(firstSearchedContext) {
			parent = firstSearchedContext;
		}

		if (parent === undefined) {
			return {
				error: "Attempting to set a value at " +
					key + " where the context is undefined."
			};
		}
		// Now we need to figure out how we would update this value.  The following does that.
		if(!canReflect.isObservableLike(parent) && canReflect.isObservableLike(parent[propName])) {
			if(canReflect.isMapLike(parent[propName])) {
				return {
					parent: parent,
					key: propName,
					how: "updateDeep",
					warn: "can-view-scope: Merging data into \"" +
						propName + "\" because its parent is non-observable"
				};
			}
			else if(canReflect.isValueLike(parent[propName])){
				return { parent: parent, key: propName, how: "setValue" };
			} else {
				return { parent: parent, how: "write", key: propName, passOptions: true };
			}
		} else {
			return { parent: parent, how: "write", key: propName, passOptions: true };
		}
	},

	// ### scope.getHelper
	// read a helper from the templateContext or global helpers list
	getHelper: function(keyReads) {
		console.warn(".getHelper is deprecated, use .getHelperOrPartial");
		return this.getHelperOrPartial(keyReads);
	},
	getHelperOrPartial: function(keyReads) {
		// try every template context
		var scope = this, context, helper;
		while (scope) {
			context = scope._context;
			if (context instanceof TemplateContext) {
				helper = stacheKey.read(context.helpers, keyReads, { proxyMethods: false });
				if(helper.value !== undefined) {
					return helper;
				}
				helper = stacheKey.read(context.partials, keyReads, { proxyMethods: false });
				if(helper.value !== undefined) {
					return helper;
				}
			}
			scope = scope._parent;
		}

		return stacheKey.read(stacheHelpers, keyReads, { proxyMethods: false });
	},

	// ### scope.get
	// Gets a value from the scope without being observable.
	get: function(key, options) {

		options = assign({
			isArgument: true
		}, options);

		var res = this.read(key, options);
		return res.value;
	},
	peek: ObservationRecorder.ignore(function(key, options) {
		return this.get(key, options);
	}),
	// TODO: Remove in 6.0
	peak: ObservationRecorder.ignore(function(key, options) {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			canLog.warn('peak is deprecated, please use peek instead');
		}
		//!steal-remove-end
		return this.peek(key, options);
	}),
	// ### scope.getScope
	// Returns the first scope that passes the `tester` function.
	getScope: function(tester) {
		var scope = this;
		while (scope) {
			if (tester(scope)) {
				return scope;
			}
			scope = scope._parent;
		}
	},
	// ### scope.getContext
	// Returns the first context whose scope passes the `tester` function.
	getContext: function(tester) {
		var res = this.getScope(tester);
		return res && res._context;
	},
	// ### scope.getTemplateContext
	// Returns the template context scope
	// This function isn't named right.
	getTemplateContext: function() {
		var lastScope;

		// find the first reference scope
		var templateContext = this.getScope(function(scope) {
			lastScope = scope;
			return scope._context instanceof TemplateContext;
		});

		// if there is no reference scope, add one as the root
		if(!templateContext) {
			templateContext = new Scope(new TemplateContext());

			// add templateContext to root of the scope chain so it
			// can be found using `getScope` next time it is looked up
			lastScope._parent = templateContext;
		}
		return templateContext;
	},
	addTemplateContext: function(){
		return this.add(new TemplateContext());
	},
	addLetContext: function(values){
		return this.add(new LetContext(values || {}), {variable: true});
	},
	// ### scope.getRoot
	// Returns the top most context that is not a references scope.
	// Used by `.read` to provide `%root`.
	getRoot: function() {
		var cur = this,
			child = this;

		while (cur._parent) {
			child = cur;
			cur = cur._parent;
		}

		if (cur._context instanceof TemplateContext) {
			cur = child;
		}
		return cur._context;
	},

	// first viewModel scope
	getViewModel: function() {
		var vmScope = this.getScope(function(scope) {
			return scope._meta.viewModel;
		});

		return vmScope && vmScope._context;
	},

	// _top_ viewModel scope
	getTop: function() {
		var top;

		this.getScope(function(scope) {
			if (scope._meta.viewModel) {
				top = scope;
			}

			// walk entire scope tree
			return false;
		});

		return top && top._context;
	},

	// ### scope.getPathsForKey
	// Finds all paths that will return a value for a specific key
	// NOTE: this is for development purposes only and is removed in production
	getPathsForKey: function getPathsForKey(key) {
		//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
			var paths = {};

			var getKeyDefinition = function(obj, key) {
				if (!obj || typeof obj !== "object") {
					return {};
				}

				var keyExistsOnObj = key in obj;
				var objHasKey = canReflect.hasKey(obj, key);

				return {
					isDefined: keyExistsOnObj || objHasKey,
					isFunction: keyExistsOnObj && typeof obj[key] === "function"
				};
			};

			// scope.foo@bar -> bar
			var reads = stacheKey.reads(key);
			var keyParts = reads.map(function(read) {
				return read.key;
			});
			var scopeIndex = keyParts.indexOf("scope");

			if (scopeIndex > -1) {
				keyParts.splice(scopeIndex, 2);
			}
			var normalizedKey = keyParts.join(".");

			// check scope.vm.<key>
			var vm = this.getViewModel();
			var vmKeyDefinition = getKeyDefinition(vm, normalizedKey);

			if (vmKeyDefinition.isDefined) {
				paths["scope.vm." + normalizedKey + (vmKeyDefinition.isFunction ? "()" : "")] = vm;
			}

			// check scope.top.<key>
			var top = this.getTop();
			var topKeyDefinition = getKeyDefinition(top, normalizedKey);

			if (topKeyDefinition.isDefined) {
				paths["scope.top." + normalizedKey + (topKeyDefinition.isFunction ? "()" : "")] = top;
			}

			// find specific paths (like ../key)
			var cur = "";

			this.getScope(function(scope) {
				// `notContext` and `special` contexts can't be read using `../`
				var canBeRead = !scope.isSpecial();

				if (canBeRead) {
					var contextKeyDefinition = getKeyDefinition(scope._context, normalizedKey);
					if (contextKeyDefinition.isDefined) {
						paths[cur + normalizedKey + (contextKeyDefinition.isFunction ? "()" : "")] = scope._context;
					}

					cur += "../";
				}

				// walk entire scope tree
				return false;
			});

			return paths;
		}
		//!steal-remove-end
	},

	// ### scope.hasKey
	// returns whether or not this scope has the key
	hasKey: function hasKey(key) {
		var reads = stacheKey.reads(key);
		var readValue;

		if (reads[0].key === "scope") {
			// read properties like `scope.vm.foo` directly from the scope
			readValue = stacheKey.read(this, reads.slice(1), key);
		} else {
			// read normal properties from the scope's context
			readValue = stacheKey.read(this._context, reads, key);
		}

		return readValue.foundLastParent && readValue.parentHasKey;
	},

	set: function(key, value, options) {
		options = options || {};

		var data = this.getDataForScopeSet(key, options);
		var parent = data.parent;

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (data.error) {
				return canLog.error(data.error);
			}
		}
		//!steal-remove-end

		if (data.warn) {
			canLog.warn(data.warn);
		}

		switch (data.how) {
			case "set":
				parent.set(data.key, value, data.passOptions ? options : undefined);
				break;

			case "write":
				stacheKey.write(parent, data.key, value, options);
				break;

			case "setValue":
				canReflect.setValue("key" in data ? parent[data.key] : parent, value);
				break;

			case "setKeyValue":
				canReflect.setKeyValue(parent, data.key, value);
				break;

			case "updateDeep":
				canReflect.updateDeep(parent[data.key], value);
				break;
		}
	},

	// ### scope.attr
	// Gets or sets a value in the scope without being observable.
	attr: ObservationRecorder.ignore(function(key, value, options) {
		canLog.warn("can-view-scope::attr is deprecated, please use peek, get or set");

		options = assign({
			isArgument: true
		}, options);

		// Allow setting a value on the context
		if (arguments.length === 2) {
			return this.set(key, value, options);

		} else {
			return this.get(key, options);
		}
	}),

	// ### scope.computeData
	// Finds the first location of the key in the scope and then provides a get-set compute that represents the key's value
	// and other information about where the value was found.
	computeData: function(key, options) {
		return makeComputeData(this, key, options);
	},

	// ### scope.compute
	// Provides a get-set compute that represents a key's value.
	compute: function(key, options) {
		return this.computeData(key, options)
			.compute;
	},
	// ### scope.cloneFromRef
	//
	// This takes a scope and essentially copies its chain from
	// right before the last TemplateContext. And it does not include the ref.
	// this is a helper function to provide lexical semantics for refs.
	// This will not be needed for leakScope: false.
	cloneFromRef: function() {
		var scopes = [];
		var scope = this,
			context,
			parent;
		while (scope) {
			context = scope._context;
			if (context instanceof TemplateContext) {
				parent = scope._parent;
				break;
			}
			scopes.unshift(scope);
			scope = scope._parent;
		}
		if (parent) {
			scopes.forEach(function(scope) {
				// For performance, re-use _meta, don't copy it.
				parent = parent.add(scope._context, scope._meta);
			});
			return parent;
		} else {
			return this;
		}
	},
	isSpecial: function(){
		return this._meta.notContext || this._meta.special || (this._context instanceof TemplateContext) || this._meta.variable;
	}
});
// Legacy name for _walk.
Scope.prototype._read = Scope.prototype._walk;

canReflect.assignSymbols(Scope.prototype, {
	"can.hasKey": Scope.prototype.hasKey
});

var templateContextPrimitives = [
	"filename", "lineNumber"
];

// create getters/setters for primitives on the templateContext
// scope.filename -> scope.readFromTemplateContext("filename")
templateContextPrimitives.forEach(function(key) {
	Object.defineProperty(Scope.prototype, key, {
		get: function() {
			return this.readFromTemplateContext(key).value;
		},
		set: function(val) {
			this.templateContext[key] = val;
		}
	});
});

defineLazyValue(Scope.prototype, 'templateContext', function() {
	return this.getTemplateContext()._context;
});

defineLazyValue(Scope.prototype, 'root', function() {
	canLog.warn('`scope.root` is deprecated. Use either `scope.top`: https://canjs.com/doc/can-stache/keys/scope.html#scope_top or `scope.vm`: https://canjs.com/doc/can-stache/keys/scope.html#scope_vm instead.');
	return this.getRoot();
});

defineLazyValue(Scope.prototype, 'vm', function() {
	return this.getViewModel();
});

defineLazyValue(Scope.prototype, 'top', function() {
	return this.getTop();
});

defineLazyValue(Scope.prototype, 'helpers', function() {
	return stacheHelpers;
});

var specialKeywords = [
	'index', 'key', 'element',
	'event', 'viewModel','arguments',
	'helperOptions', 'args'
];

// create getters for "special" keys
// scope.index -> scope.readFromSpecialContext("index")
specialKeywords.forEach(function(key) {
	Object.defineProperty(Scope.prototype, key, {
		get: function() {
			return this.readFromSpecialContext(key).value;
		}
	});
});


//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	Scope.prototype.log = function() {
		var scope = this;
	    var indent = "";
		var contextType = "";
		while(scope) {
			contextType = scope._meta.notContext ? " (notContext)" :
				scope._meta.special ? " (special)" : "";
			console.log(indent, canReflect.getName(scope._context) + contextType, scope._context);
	        scope = scope._parent;
	        indent += " ";
	    }
	};
}
//!steal-remove-end


namespace.view = namespace.view || {};
module.exports = namespace.view.Scope = Scope;
