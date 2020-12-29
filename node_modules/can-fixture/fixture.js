"use strict";
var core = require("./core");
var fixture = core.add;
var Store = require("./store");
require("./xhr");
var canReflect = require("can-reflect");
var canDev = require("can-log/dev/dev");
var ns = require("can-namespace");
// HELPERS START

var noop = function(){};

canReflect.assignMap(fixture, {
	rand: function randomize (arr, min, max) {
		if (typeof arr === 'number') {
			if (typeof min === 'number') {
				return arr + Math.floor(Math.random() * (min - arr+1));
			} else {
				return Math.floor(Math.random() * (arr+1));
			}

		}
		// clone the array because we will remove items from it.
		var choices = arr.slice(0);

		// get a random set
		if (min === undefined) {
			min = 1;
			max = choices.length;
		} else if(max === undefined){
			max = min;
		}
		// get a random selection of arr
		var result = [];

		// set max
		//random max
		var selectedCount = min + Math.round(randomize(max - min));
		for (var i = 0; i < selectedCount; i++) {
			var selectedIndex = randomize(choices.length - 1),
				selected = choices.splice(selectedIndex, 1)[0];
			result.push(selected);
		}
		return result;
	},
	xhr: function (xhr) {
		return canReflect.assignMap({}, {
			abort: noop,
			getAllResponseHeaders: function () {
				return "";
			},
			getResponseHeader: function () {
				return "";
			},
			open: noop,
			overrideMimeType: noop,
			readyState: 4,
			responseText: "",
			responseXML: null,
			send: noop,
			setRequestHeader: noop,
			status: 200,
			statusText: "OK"
		}, xhr);
	},
	store: Store.make,
	fixtures: core.fixtures
});

if(typeof window !== "undefined" && typeof require.resolve !== "function") {

	window.fixture = function(){
		canDev.warn("You are using the global fixture. Make sure you import can-fixture.");

		return fixture.apply(this, arguments);
	};	
}


module.exports = ns.fixture = fixture;
