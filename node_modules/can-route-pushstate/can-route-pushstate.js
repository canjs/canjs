// # can-route-pushstate.js

// Plugin for `route` which uses browser `history.pushState` support
// to update window's pathname in addition to `hash`.

// On a high-level, `can-route-pushstate` creates an observable type, 
// `PushstateObservable`, that changes when `history.pushState` is called.
// It does this by:
//  - Intercepting `click` events on anchor elements ('<a>') when the
//    `.href` matches a routing rule.
//  - Decorating `replaceState` and `pushState` to dispatch observable
//    event handlers when called.
//  - Listen to `popstate` events and dispatch obserevable event handlers.

// `PushstateObservable` inherits from `SimpleObservable`, most of
// `PushstateObservable`'s "observable" logic comes from `SimpleObservable`.

/*jshint maxdepth:6, scripturl:true*/
"use strict";
var route = require("can-route");
var bindingProxy = require("can-route/src/binding-proxy");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var SimpleObservable = require("can-simple-observable");
var ObservationRecorder = require("can-observation-recorder");

var isNode = require("can-globals/is-node/is-node");
var LOCATION = require("can-globals/location/location");
var getDocument = require("can-globals/document/document");
var getGlobal = require("can-globals/global/global");

var domEvents = require("can-dom-events");

var diffObject = require("can-diff/map/map");

// ## methodsToOverwrite
// Method names on `history` that will be overwritten
// during teardown these are reset to their original functions.
var methodsToOverwrite = ["pushState", "replaceState"],
	// This symbol is used in dispatchHandlers.
	dispatchSymbol = canSymbol.for("can.dispatch");

// ## Helpers
// The following are helper functions useful to `can-route-pushstate`'s main methods.

// ### cleanRoot
// Start of `location.pathname` is the root. 
// Returns the root minus the domain.
function cleanRoot() {
	var location = LOCATION(),
		domain = location.protocol + "//" + location.host,
		// pulls root from route.urlData
		root = bindingProxy.call("root"),
		index = root.indexOf(domain);

	if (index === 0) {
		return root.substr(domain.length);
	}
	return root;
}

// ### getCurrentUrl
// Gets the current url after the root.
// `root` is defined in the PushstateObservable constructor.
function getCurrentUrl() {
	var root = cleanRoot(),
		location = LOCATION(),
		loc = (location.pathname + location.search),
		index = loc.indexOf(root);

	return loc.substr(index + root.length);
}

// ## PushstateObservable
function PushstateObservable() {
	// Keys passed into `replaceStateOnce` will be stored in `replaceStateOnceKeys`.
	this.replaceStateOnceKeys = [];
	// Keys passed into `replaceStateOn` will be stored in `replaceStateKeys`.
	this.replaceStateKeys = [];
	this.dispatchHandlers = this.dispatchHandlers.bind(this);
	this.anchorClickHandler = function(event) {
		var shouldCallPushState = PushstateObservable.prototype.shouldCallPushState.call(this, this, event);
		if (shouldCallPushState) {
			PushstateObservable.prototype.anchorClickHandler.call(this, this, event);
		}
	};

	// ### `keepHash`
	// Currently is neither a feature that's documented,
	// nor is it toggled. [Issue #133](https://github.com/canjs/can-route-pushstate/issues/133)
	// is the discourse on it's removal.
	this.keepHash = true;
}

PushstateObservable.prototype = Object.create(SimpleObservable.prototype);
PushstateObservable.constructor = PushstateObservable;
canReflect.assign(PushstateObservable.prototype, {

	// ### root
	// Start of `location.pathname` is the root.
	// (Can be configured via `route.urlData.root`)
	// The default is `"#!"` set in can-route-hash.
	root: "/",

	// ### matchSlashes
	// The default is `false` set in can-route-hash.
	// Don't greedily match slashes in routing rules.
	matchSlashes: false,

	// ### paramsMatcher
	// Matches things like:
	//  - ?foo=bar
	//  - ?foo=bar&framework=canjs
	//  - ?foo=&bar=
	paramsMatcher: /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/,

	// ### querySeparator
	// Used in `can-route` for building regular expressions to match routes, or
	// return url substrings of routes.
	querySeparator: "?",

	// ### dispatchHandlers
	// Updates `this._value` to the current url and 
	// dispatches event handlers that are on the object.
	// `dispatchHandlers` is called if `pushState` or `replaceState`
	// are called, it is also an event handler on `'popstate'`.
	dispatchHandlers: function() {
		var old = this._value;
		this._value = getCurrentUrl();

		if (old !== this._value) {
			// PushstateObservable inherits from `SimpleObservable` which
			// is using the `can-event-queue/value/value` mixin, and is called
			// using the `can.dispatch` symbol.
			this[dispatchSymbol](this._value, old);
		}
	},

	// ### shouldCallPushState
	// Checks if a route is matched, if one is, returns true
	shouldCallPushState: function(node, event) {
		if (!(event.isDefaultPrevented ? event.isDefaultPrevented() : event.defaultPrevented === true)) {
			// If href has some JavaScript in it, let it run.
			if (node.href === "javascript://") {
				return;
			}

			// Do not pushstate if target is for blank window.
			if (node.target === "_blank") {
				return;
			}

			// Do not pushstate if meta key was pressed, mimicking standard browser behavior.
			if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
				return;
			}

			// linksHost is a Fix for IE showing blank host, but blank host means current host.
			var linksHost = node.host || window.location.host;

			// If link is within the same domain and descendant of `root`.
			if (window.location.host === linksHost) {
				var root = cleanRoot(),
					pathname,
					href,
					nodePathWithSearch;

				if (node instanceof HTMLAnchorElement) {
					pathname = node.pathname;
					href = node.href;
					nodePathWithSearch = pathname + node.search;
				} else if (node.namespaceURI === "http://www.w3.org/1999/xlink") {
					pathname = href = node.getAttributeNS("http://www.w3.org/1999/xlink", "href");
					nodePathWithSearch = href;
				}

				// If the link is within the `root`.
				if (pathname !== undefined && pathname.indexOf(root) === 0) {
					var url = nodePathWithSearch.substr(root.length);

					// If a matching route exists.
					if (route.rule(url) !== undefined) {
						// Makes it possible to have a link with a hash.
						// Calling .pushState will dispatch events, causing
						// `can-route` to update its data, and then try to set back
						// the url without the hash.  We need to retain that.
						if (href.indexOf("#") >= 0) {
							this.keepHash = true;
						}

						// We do not want to call preventDefault() if the link is to the
						// same page and just a different hash; see can-route-pushstate#75.
						var windowPathWithSearch = window.location.pathname + window.location.search;
						var shouldCallPreventDefault = nodePathWithSearch !== windowPathWithSearch || node.hash === window.location.hash;

						// Test if you can preventDefault.
						if (shouldCallPreventDefault && event.preventDefault) {
							event.preventDefault();
						}
						return true;
					}
					return false;
				}
			}
		}
	},

	// ### anchorClickHandler
	// Handler function for `click` events.
	anchorClickHandler: function(node, event) {
		var href = node.href ? node.href : node.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		// Update `window.location`.
		window.history.pushState(null, null, href);
	},

	// ### onBound
	// Initalizes this._value.
	// Sets up event listeners to capture `click` events on `<a>` elements.
	// Overwrites the history api methods `.pushState` and `.replaceState`.
	onBound: function() {
		// if running in Node.js, don't setup.
		if (isNode()) {
			return;
		}

		var document = getDocument(),
			window = getGlobal();

		this._value = getCurrentUrl();

		// Intercept routable links.
		domEvents.addDelegateListener(document.documentElement, "click", "a", this.anchorClickHandler);
		var originalMethods = this.originalMethods = {};
		var dispatchHandlers = this.dispatchHandlers;

		// Rewrites original `pushState`/`replaceState` methods on `history`
		// and keeps pointer to original methods.
		canReflect.eachKey(methodsToOverwrite, function(method) {
			this.originalMethods[method] = window.history[method];
			window.history[method] = function(state, title, url) {

				// Avoid doubled history states (with pushState).
				var absolute = url.indexOf("http") === 0;
				var location = LOCATION();
				var searchHash = location.search + location.hash;

				// If url differs from current call original history method and update `route` state.
				if ((!absolute && url !== location.pathname + searchHash) ||
					(absolute && url !== location.href + searchHash)) {
					originalMethods[method].apply(window.history, arguments);
					dispatchHandlers();
				}
			};
		}, this);

		// Bind dispatchHandlers to the `popstate` event, so they will fire
		// when `history.back()` or `history.forward()` methods are called.
		domEvents.addEventListener(window, "popstate", this.dispatchHandlers);
	},

	// ### onUnbound
	// removes the event listerns for capturing routable links.
	// Sets `.pushState` and `.replacState` to their original methods.
	onUnbound: function() {
		// If running in Node.js, don't teardown.
		if(isNode()) {
			return;
		}

		var document = getDocument(),
			window = getGlobal();

		domEvents.removeDelegateListener(document.documentElement, "click", "a", this.anchorClickHandler);

		// Reset the changed `window.history` methods to their original values.
		canReflect.eachKey(methodsToOverwrite, function(method) {
			window.history[method] = this.originalMethods[method];
		}, this);

		domEvents.removeEventListener(window, "popstate", this.dispatchHandlers);
	},

	// ### get
	// Allows `PushstateObservable` to be observable by can-observations,
	// and returns the current url.
	get: function get() {
		ObservationRecorder.add(this);
		return getCurrentUrl();
	},

	// ### set
	// Calls either pushState or replaceState on the difference
	// in properties between `oldProps` and `newProps`.
	set: function(path) {
		var newProps = route.deparam(path),
			oldProps = route.deparam(getCurrentUrl()),
			method = "pushState",
			changed = {};

		// Adds window.location.hash to path if it's not already in path.
		if (this.keepHash && path.indexOf("#") === -1 && window.location.hash) {
			path += window.location.hash;
		}

		// The old state and new state are diffed 
		// to figure out which keys are changing.
		diffObject(oldProps, newProps)
			.forEach(function(patch) {
				// `patch.key` refers to the mutated property name on `newProps`.
				return changed[patch.key] = true;
			});

		// If any of the changed properties are in `replaceStateKeys` or 
		// `replaceStateOnceKeys` change the method to `'replaceState'`.
		if (this.replaceStateKeys.length) {
			this.replaceStateKeys.forEach(function(replaceKey) {
				if (changed[replaceKey]) {
					method = "replaceState";
				}
			});
		}
		
		if (this.replaceStateOnceKeys.length) {
			this.replaceStateOnceKeys
				.forEach(function(replaceOnceKey, index, thisArray) {
					if (changed[replaceOnceKey]) {
						method = "replaceState";
						// Remove so we don't attempt to replace 
						// the state on this key again.
						thisArray.splice(index, 1);
					}
				});
		}
		window.history[method](null, null, bindingProxy.call("root") + path);
	},

	// ### replaceStateOn
	// Adds given arguments to `this.replaceStateKeys`.
	replaceStateOn: function() {
		canReflect.addValues(this.replaceStateKeys, canReflect.toArray(arguments));
	},

	// ### replaceStateOnce
	// Adds given arguments to `this.replaceStateOnceKeys`.
	// Keys in `this.replaceStateOnceKeys` will be removed
	// from the array the first time a changed route contains that key.
	replaceStateOnce: function() {
		canReflect.addValues(this.replaceStateOnceKeys, canReflect.toArray(arguments));
	},

	// ### replaceStateOff
	// Removes given arguments from both `this.replaceStateKeys` and
	// `this.replaceOnceKeys`.
	replaceStateOff: function() {
		canReflect.removeValues(this.replaceStateKeys, canReflect.toArray(arguments));
		canReflect.removeValues(this.replaceStateOnceKeys, canReflect.toArray(arguments));
	}
});

canReflect.assignSymbols(PushstateObservable.prototype, {
	"can.getValue": PushstateObservable.prototype.get,
	"can.setValue": PushstateObservable.prototype.set,
});

module.exports = PushstateObservable;
