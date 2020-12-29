// # can-route.js
// Manage browser history and client state by synchronizing
// the window.location.hash with an observable.

"use strict";
var Bind = require("can-bind");
var queues = require("can-queues");
var Observation = require("can-observation");
var type = require("can-type");

var namespace = require("can-namespace");
var devLog = require("can-log/dev/dev");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var makeCompute = require("can-simple-observable/make-compute/make-compute");
var RouteData = require("./src/routedata");
var stringCoercingMapDecorator = require("./src/string-coercion").stringCoercingMapDecorator;

var registerRoute = require("./src/register");
var urlHelpers = require("./src/url-helpers");
var routeParam = require("./src/param");
var routeDeparam = require("./src/deparam");
var bindingProxy = require("./src/binding-proxy");
var Hashchange = require("can-route-hash");

var isWebWorker =  require("can-globals/is-web-worker/is-web-worker");
var isBrowserWindow =  require("can-globals/is-browser-window/is-browser-window");

// ## hashchangeObservable
// `hashchangeObservable` is an instance of `Hashchange`, instances of
// `Hashchange` are two-way bound to `window.location.hash` once the
// instances have a listener.
var hashchangeObservable = new Hashchange();
bindingProxy.bindings.hashchange = hashchangeObservable;
bindingProxy.defaultBinding = "hashchange";
bindingProxy.urlDataObservable.value = hashchangeObservable;


// ## canRoute
function canRoute(url, defaults) {
	//!steal-remove-start
	if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
		devLog.warn("Call route.register(url,defaults) instead of calling route(url, defaults)");
	}
	//!steal-remove-end
	registerRoute.register(url, defaults);
	return canRoute;
}


// ## Helper Functions
// A ~~throttled~~ debounced function called multiple times will only fire once the
// timer runs down. Each call resets the timer.
var timer;
// A dummy events object used to dispatch url change events on.
var currentRuleObservable = new Observation(function canRoute_matchedRoute() {
	var url = bindingProxy.call("can.getValue");
	return canRoute.rule(url);
});

// ### updateUrl
// If the `route.data` changes, update the hash.
// Using `.serialize()` retrieves the raw data contained in the `observable`.
// This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
// This might be able to use batchNum and avoid this.
function updateUrl(serializedData) {
	// collect attributes that are changing
	clearTimeout(timer);
	timer = setTimeout(function () {
		// indicate that the hash is set to look like the data
		var serialized = canReflect.serialize( canRoute.data ),
			currentRouteName = currentRuleObservable.get(),
			route = routeParam.getMatchedRoute(serialized, currentRouteName),
			path = routeParam.paramFromRoute(route, serialized);

		bindingProxy.call("can.setValue", path);
		var onStartComplete = canRoute._onStartComplete;
		if (onStartComplete) {
			canRoute._onStartComplete = undefined;
			onStartComplete();
		}
	}, 10);
}

// ### updateRouteData
// Deparameterizes the portion of the hash of interest and assign the
// values to the `route.data` removing existing values no longer in the hash.
// updateRouteData is called typically by hashchange which fires asynchronously
// So it’s possible that someone started changing the data before the
// hashchange event fired.  For this reason, it will not set the route data
// if the data is changing or the hash already matches the hash that was set.
function updateRouteData() {
	var hash = bindingProxy.call("can.getValue");
	// if the hash data is currently changing, or
	// the hash is what we set it to anyway, do NOT change the hash

	queues.batch.start();

	var state = canRoute.deparam(hash);
	delete state.route;
	canReflect.update(canRoute.data,state);
	queues.batch.stop();

}


/**
 * @static
 */
Object.defineProperty(canRoute, "routes", {
	/**
	 * @property {Object} routes
	 * @hide
	 *
	 * A list of routes recognized by the router indixed by the url used to add it.
	 * Each route is an object with these members:
	 *
	 *  - test - A regular expression that will match the route when variable values
	 *    are present; i.e. for {page}/{type} the `RegExp` is /([\w\.]*)/([\w\.]*)/ which
	 *    will match for any value of {page} and {type} (word chars or period).
	 *
	 *  - route - The original URL, same as the index for this entry in routes.
	 *
	 *  - names - An array of all the variable names in this route
	 *
	 *  - defaults - Default values provided for the variables or an empty object.
	 *
	 *  - length - The number of parts in the URL separated by '/'.
	 */
 	get: function() {
 		return registerRoute.routes;
 	},
	set: function(newVal) {
		return registerRoute.routes = newVal;
	}
});

// ## canRoute.defaultBinding
Object.defineProperty(canRoute, "defaultBinding", {
 	get: function() {
		return bindingProxy.defaultBinding;
	},
	set: function(newVal) {
		bindingProxy.defaultBinding = newVal;
		var observable = bindingProxy.bindings[bindingProxy.defaultBinding];
		if (observable) {
			bindingProxy.urlDataObservable.value = observable;
		}
	}
});

// ## canRoute.urlData
Object.defineProperty(canRoute, "urlData", {
 	get: function() {
		return bindingProxy.urlDataObservable.value;
	},
	set: function(newVal) {
		canRoute._teardown();
		bindingProxy.urlDataObservable.value = newVal;
	}
});

canReflect.assignMap(canRoute, {
	// ## canRoute.param
	param: routeParam,
	// ## canRoute.deparam
	deparam: routeDeparam,
	// ## canRoute.map
	map: function(data) {
		//!steal-remove-start
		if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
			devLog.warn("Set route.data directly instead of calling route.map");
		}
		//!steal-remove-end
		canRoute.data = data;
	},

	// ## canRoute.start
	start: function (val) {
		if (canRoute.data instanceof RouteData) {
			var routeData = canRoute.data;
			var definePropertyWithDefault = function(defaults, name) {
				var defaultValue = defaults[name];
				var propertyType = defaultValue != null ? type.maybeConvert(defaultValue.constructor) : type.maybeConvert(String);
				canReflect.defineInstanceKey(routeData.constructor, name, {
					type: propertyType
				});
			};

			canReflect.eachKey(canRoute.routes, function(route) {
				canReflect.eachIndex(route.names, function (name) {
					definePropertyWithDefault(route.defaults, name);
				});

				canReflect.eachKey(route.defaults, function(value, key) {
					definePropertyWithDefault(route.defaults, key);
				});
			});
		}

		if (val !== true) {
			canRoute._setup();
			if (isBrowserWindow() || isWebWorker()) {
				// We can't use updateRouteData because we want to merge the route data
				// into .data
				var hash = bindingProxy.call("can.getValue");
				queues.batch.start();
				// get teh data
				var state = canRoute.deparam(hash);
				delete state.route;

				canReflect.assign(canRoute.data,state);
				queues.batch.stop();
				updateUrl();
			}
		}
		
		return canRoute;
	},
	// ## canRoute.url
	url: urlHelpers.url,
	link: urlHelpers.link,
	isCurrent: urlHelpers.isCurrent,
	bindings: bindingProxy.bindings,

	// ready calls setup
	// setup binds and listens to data changes
	// bind listens to whatever you should be listening to
	// data changes tries to set the path

	// we need to be able to
	// easily kick off calling updateRouteData
	// 	teardown whatever is there
	//  turn on a particular binding

	// called when the route is ready
	_setup: function () {
		if (!canRoute._canBinding) {

			var bindingOptions = {

				// The parent is the hashchange observable
				parent: bindingProxy.urlDataObservable.value,
				setParent: updateUrl,

				// The child is route.data
				child: canRoute.serializedObservation,
				setChild: updateRouteData,

				// On init, we do not want the child set to the parent’s value; this is
				// handled by start() for reasons mentioned there.
				onInitDoNotUpdateChild: true,

				// Cycles are allowed because updateUrl is async; if another change
				// happens during its setTimeout, then without cycles the change would
				// be ignored :( TODO: Can this be removed if updateUrl stops using
				// setTimeout in a major version?
				cycles: 1,

				// Listen for changes in the notify queue
				queue: "notify"

			};

			// For debugging: the names that will be assigned to the updateChild and
			// updateParent functions within can-bind
			//!steal-remove-start
			if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
				bindingOptions.updateChildName = "can-route.updateRouteData";
				bindingOptions.updateParentName = "can-route.updateUrl";
			}
			//!steal-remove-end

			// Create a new binding with can-bind
			canRoute._canBinding = new Bind(bindingOptions);

			// …and turn it on!
			canRoute._canBinding.start();

		}
	},
	_teardown: function () {
		if (canRoute._canBinding) {
			canRoute._canBinding.stop();
			canRoute._canBinding = null;
		}
		clearTimeout(timer);
	},

	stop: function() {
		this._teardown();
		return canRoute;
	},

	currentRule: makeCompute( currentRuleObservable ),
	register: registerRoute.register,
	rule: function(url) {
		var rule = routeDeparam.getRule(url);
		if (rule) {
			return rule.route;
		}
	}
});

// The functions in the following list applied to `canRoute` (e.g. `canRoute.attr('...')`) will
// instead act on the `canRoute.data` observe.

var bindToCanRouteData = function (name, args) {
	if (!canRoute.data[name]) {
		return canRoute.data.addEventListener.apply(canRoute.data, args);
	}
	return canRoute.data[name].apply(canRoute.data, args);
};

["addEventListener","removeEventListener","bind", "unbind", "on", "off"].forEach(function(name) {
	// exposing all internal eventQueue evt’s to canRoute
	canRoute[name] = function(eventName, handler) {
		if (eventName === "__url") {
			return bindingProxy.call("can.onValue", handler );
		}
		return bindToCanRouteData(name, arguments);
	};
});

["delegate", "undelegate", "removeAttr", "compute", "_get", "___get", "each"].forEach(function (name) {
	canRoute[name] = function () {
		// `delegate` and `undelegate` require
		// the `can/map/delegate` plugin
		return bindToCanRouteData(name, arguments);
	};
});


var routeData,
	serializedObservation,
	serializedCompute;

function setRouteData(data) {
	routeData = data;
	return routeData;
}

Object.defineProperty(canRoute, "serializedObservation", {
	get: function() {
		if (!serializedObservation) {
			serializedObservation = new Observation(function canRoute_data_serialized() {
				return canReflect.serialize( canRoute.data );
			});
		}
		return serializedObservation;
	}
});
Object.defineProperty(canRoute, "serializedCompute", {
	get: function() {
		if (!serializedCompute) {
			serializedCompute = makeCompute(canRoute.serializedObservation);
		}
		return serializedCompute;
	}
});

var viewModelSymbol = canSymbol.for("can.viewModel");
Object.defineProperty(canRoute, "data", {
	get: function() {
		if (routeData) {
			return routeData;
		} else {
			return setRouteData(new RouteData());
		}
	},
	set: function(data) {
		if ( canReflect.isConstructorLike(data) ) {
			data = new data();
		}
		if (data && data[viewModelSymbol] !== undefined) {
			data = data[viewModelSymbol];
		}
		// if it’s a map, we make it always set strings for backwards compat
		if ( "attr" in data ) {
			setRouteData( stringCoercingMapDecorator(data) );
		} else {
			setRouteData(data);
		}
	}
});

canRoute.attr = function(prop, value) {
	console.warn("can-route: can-route.attr is deprecated. Use methods on can-route.data instead.");
	if ("attr" in canRoute.data) {
		return canRoute.data.attr.apply(canRoute.data, arguments);
	} else {
		if (arguments.length > 1) {
			canReflect.setKeyValue(canRoute.data, prop, value);
			return canRoute.data;
		} else if (typeof prop === "object") {
			canReflect.assignDeep(canRoute.data,prop);
			return canRoute.data;
		} else if (arguments.length === 1) {
			return canReflect.getKeyValue(canRoute.data, prop);
		} else {
			return canReflect.unwrap(canRoute.data);
		}
	}
};


canReflect.setKeyValue(canRoute, canSymbol.for("can.isFunctionLike"), false);

// LEGACY
canRoute.matched = canRoute.currentRule;
canRoute.current = canRoute.isCurrent;

module.exports = namespace.route = canRoute;
