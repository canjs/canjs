"use strict";
/* global require, window, global */
/* global setTimeout, clearTimeout, XMLHttpRequest */

// This overwrites the default XHR with a mock XHR object.
// The mock XHR object's `.send` method is able to
// call the fixture callbacks or create a real XHR request
// and then respond normally.
var fixtureCore = require("./core");
var deparam = require("can-deparam");
var canReflect = require("can-reflect");
var canLog = require('can-log');

// Save the real XHR object as XHR
var XHR = XMLHttpRequest,
// Get a global reference.
	GLOBAL = typeof global !== "undefined"? global : window;

// Figure out props and events on XHR object
// but start with some defaults
var props = [
	"type", "url", "async", "response", "responseText", "responseType",
	"responseXML", "responseURL", "status", "statusText", "readyState"
];
var events = ["abort", "error", "load", "loadend", "loadstart",  "progress", "readystatechange"];
(function(){
	var x = new XHR();
	for(var prop in x) {
		if(prop.indexOf("on") === 0) {
			if (events.indexOf(prop.substr(2)) === -1) {
				events.push(prop.substr(2));
			}
		} else if (props.indexOf(prop) === -1 && typeof x[prop] !== 'function') {
			props.push(prop);
		}
	}
})();
// DEFINE HELPERS

// Call all of an event for an XHR object
function callEvents(xhr, ev) {
	var evs = xhr.__events[ev] || [], fn;
	for(var i = 0, len = evs.length; i < len; i++) {
		fn = evs[i];
		fn.call(xhr);
	}
}

function defineNonEnumerable(obj, prop, value) {
	Object.defineProperty(obj, prop, {
		enumerable: false,
		configurable: true,
		writable: true,
		value: value
	});
}

GLOBAL.XMLHttpRequest = function() {
	var mockXHR = this;
	var realXHR = new XHR();

	// store real xhr on mockXHR
	defineNonEnumerable(this, "_xhr", realXHR);

	// create other properties needed by prototype functions
	defineNonEnumerable(this, "_requestHeaders", {});
	defineNonEnumerable(this, "__events", {});

	// wire up events to forward from real xhr to fake xhr
	events.forEach(function(eventName) {
		realXHR["on" + eventName] = function() {
			callEvents(mockXHR, eventName);
			if(mockXHR["on"+eventName]) {
				return mockXHR["on"+eventName].apply(mockXHR, arguments);
			}
		};
	});

	// The way code detects if the browser supports onload is to check
	// if a new XHR object has the onload property, so setting it to null
	// passes that check.
	this.onload = null;
};
GLOBAL.XMLHttpRequest._XHR = XHR;

// Methods on the mock XHR:
canReflect.assignMap(XMLHttpRequest.prototype,{
	setRequestHeader: function(name, value){
		this._requestHeaders[name] = value;
	},
	open: function(type, url, async){
		this.type = type;
		this.url = url;
		this.async = async === false ? false : true;
	},
	getAllResponseHeaders: function(){
		return this._xhr.getAllResponseHeaders.apply(this._xhr, arguments);
	},
	addEventListener: function(ev, fn){
		var evs = this.__events[ev] = this.__events[ev] || [];
		evs.push(fn);
	},
	removeEventListener: function(ev, fn){
		var evs = this.__events[ev] = this.__events[ev] || [];
		var idx = evs.indexOf(fn);
		if(idx >= 0) {
			evs.splice(idx, 1);
		}
	},
	setDisableHeaderCheck: function(val){
		this._disableHeaderCheck = !!val;
	},
	getResponseHeader: function(key){
		return this._xhr.getResponseHeader(key);
	},
	abort: function() {
		var xhr = this._xhr;

		// If we are aborting a delayed fixture we have to make the fake
		// steps that are expected for `abort` to
		if(this.timeoutId !== undefined) {
			clearTimeout(this.timeoutId);
			xhr.open(this.type, this.url, this.async === false ? false : true);
			xhr.send();
		}

		return xhr.abort();
	},
	// This needs to compile the information necessary to see if
	// there is a corresponding fixture.
	// If there isn't a fixture, this should create a real XHR object
	// linked to the mock XHR instance and make a data request.
	// If there is a fixture, depending on the type of fixture the following happens:
	// - dynamic fixtures - call the dynamic fixture, use the result to update the
	//   mock XHR object and trigger its callbacks.
	// - redirect fixtures - create a real XHR linked to the mock XHR for the new url.
	send: function(data) {
		// derive the XHR settings object from the XHR object
		var type = this.type.toLowerCase() || 'get';
		var xhrSettings = {
			url: this.url,
			data: data,
			headers: this._requestHeaders,
			type: type,
			method: type,
			async: this.async,
			xhr: this
		};
		// if get or delete, the url should not include the querystring.
		// the querystring should be the data.
		if(!xhrSettings.data && xhrSettings.type === "get" || xhrSettings.type === "delete") {
			xhrSettings.data = deparam( xhrSettings.url.split("?")[1] );
			xhrSettings.url = xhrSettings.url.split("?")[0];
		}

		// Try to convert the request body to POJOs.
		if(typeof xhrSettings.data === "string") {
			try {
				xhrSettings.data = JSON.parse(xhrSettings.data);
			} catch(e) {
				xhrSettings.data = deparam( xhrSettings.data );
			}
		}

		// See if the XHR settings match a fixture.
		var fixtureSettings = fixtureCore.get(xhrSettings);
		var mockXHR = this;

		// If a dynamic fixture is being used, we call the dynamic fixture function and then
		// copy the response back onto the `mockXHR` in the right places.
		if(fixtureSettings && typeof fixtureSettings.fixture === "function") {

			this.timeoutId = fixtureCore.callDynamicFixture(xhrSettings, fixtureSettings, function(status, body, headers, statusText){
				body = typeof body === "string" ? body :  JSON.stringify(body);

				// we are no longer using the real XHR
				// set it to an object so that props like readyState can be set
				mockXHR._xhr = {
					open: function(){},
					send: function() {},
					abort: function(){},
					getResponseHeader: function(){}
				};

				canReflect.assignMap(mockXHR, {
					readyState: 4,
					status: status
				});

				var success = (status >= 200 && status < 300 || status === 304);
				if ( success ) {
					canReflect.assignMap(mockXHR,{
						statusText: statusText || "OK",
						responseText: body
					});
				} else {
					canReflect.assignMap(mockXHR,{
						statusText: statusText || "error",
						responseText: body
					});
				}

				mockXHR.getAllResponseHeaders = function() {
					var ret = [];
					canReflect.eachKey(headers || {}, function(value, name) {
						Array.prototype.push.apply(ret, [name, ': ', value, '\r\n']);
					});
					return ret.join('');
				};

				if(mockXHR.onreadystatechange) {
					mockXHR.onreadystatechange({ target: mockXHR });
				}

				// fire progress events
				callEvents(mockXHR, "progress");
				if(mockXHR.onprogress) {
					mockXHR.onprogress();
				}

				callEvents(mockXHR, "load");
				if(mockXHR.onload) {
					mockXHR.onload();
				}

				callEvents(mockXHR, "loadend");
				if(mockXHR.onloadend) {
					mockXHR.onloadend();
				}
			});

			return;
		}
		// At this point there is either not a fixture or a redirect fixture.
		// Either way we are doing a request.
		var makeRequest = function() {
			mockXHR._xhr.open(mockXHR._xhr.type, mockXHR._xhr.url, mockXHR._xhr.async);
			if(mockXHR._requestHeaders) {
				Object.keys(mockXHR._requestHeaders).forEach(function(key) {
					mockXHR._xhr.setRequestHeader(key, mockXHR._requestHeaders[key]);
				});
			}
			return mockXHR._xhr.send(data);
		};

		if(fixtureSettings && typeof fixtureSettings.fixture === "number") {
			canLog.log("can-fixture: "+xhrSettings.url+" => delay " + fixtureSettings.fixture+"ms");
			this.timeoutId = setTimeout(makeRequest, fixtureSettings.fixture);
			return;
		}

		// if we do have a fixture, update the real XHR object.
		if(fixtureSettings) {
			canLog.log("can-fixture: "+xhrSettings.url+" => " + fixtureSettings.url);
			canReflect.assignMap(mockXHR, fixtureSettings);
		}

		// Make the request.
		return makeRequest();
	}
});

// when props of mockXHR are get/set, return the prop from the real XHR
props.forEach(function(prop) {
	Object.defineProperty(XMLHttpRequest.prototype, prop, {
		get: function(){
			return this._xhr[prop];
		},
		set: function(newVal){
			try {
				this._xhr[prop] = newVal;
			} catch(e) {}
		}
	});
});
