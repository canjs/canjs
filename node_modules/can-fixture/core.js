"use strict";
// Adds
var sub = require("can-key/sub/sub");
var canReflect = require("can-reflect");
var matches = require("./matches");
var canLog = require("can-log");
var canDev = require("can-log/dev/dev");
var dataFromUrl = require("./data-from-url");

require("./store");

var fixtures = [];
exports.fixtures = fixtures;

function isStoreLike (fixture) {
	return fixture && (fixture.getData || fixture.getListData);
}

var methodMapping = {
	item: {
		'GET': 'getData',
		'PUT': 'updateData',
		'DELETE': 'destroyData',
	},
	list: {
		'GET': 'getListData',
		'POST': 'createData'
	}
};

function getMethodAndPath (route) {
	// Match URL if it has GET, POST, PUT, DELETE or PATCH.
	var matches = route.match(/(GET|POST|PUT|DELETE|PATCH) (.+)/i);
	if (!matches) {
		return [undefined, route];
	}
	var method = matches[1];
	var path = matches[2];
	return [method, path];
}

function inferIdProp (url) {
	var wrappedInBraces = /\{(.*)\}/;
	var matches = url.match(wrappedInBraces);
	var isUniqueMatch = matches && matches.length === 2;
	if (isUniqueMatch) {
		return matches[1];
	}
}

function getItemAndListUrls (url, idProp) {
	idProp = idProp || inferIdProp(url);
	if (!idProp) {
		return [undefined, url];
	}
	var itemRegex = new RegExp('\\/\\{' + idProp+"\\}.*" );
	var rootIsItemUrl = itemRegex.test(url);
	var listUrl = rootIsItemUrl ? url.replace(itemRegex, "") : url;
	var itemUrl = rootIsItemUrl ? url : (url.trim() + "/{" + idProp + "}");
	return [itemUrl, listUrl];
}

function addStoreFixture (root, store) {
	var settings = {};
	var typeAndUrl = getMethodAndPath(root);
	var type = typeAndUrl[0];
	var url = typeAndUrl[1];

	var itemAndListUrls = getItemAndListUrls(url, store.idProp);
	var itemUrl = itemAndListUrls[0];
	var listUrl = itemAndListUrls[1];

	if (type) {
		var warning = [
			'fixture("' + root + '", fixture) must use a store method, not a store directly.',
		];
		if (itemUrl) {
			var itemAction = methodMapping.item[type];
			if (itemAction) {
				settings[type + ' ' + itemUrl] = store[itemAction];
				var itemWarning = 'Replace with fixture("' + type + ' ' + itemUrl + '", fixture.' + itemAction + ') for items.';
				warning.push(itemWarning);
			}
		}
		var listAction = methodMapping.list[type];
		if (listAction) {
			settings[type + ' ' + listUrl] = store[listAction];
			var listWarning = 'Replace with fixture("' + type + ' ' + listUrl + '", fixture.' + listAction + ') for lists.';
			warning.push(listWarning);
		}
		var message = warning.join(' ');
		canDev.warn(message);
	} else {
		var itemMapping = methodMapping.item;
		for (var itemMethod in itemMapping) {
			var storeItemMethod = itemMapping[itemMethod];
			settings[itemMethod + ' ' + itemUrl] = store[storeItemMethod];
		}
		var listMapping = methodMapping.list;
		for (var listMethod in listMapping) {
			var storeListMethod = listMapping[listMethod];
			settings[listMethod + ' ' + listUrl] = store[storeListMethod];
		}
	}

	return settings;
}

function getSettingsFromString (route) {
	var typeAndUrl = getMethodAndPath(route);
	var type = typeAndUrl[0];
	var url = typeAndUrl[1];
	if (type) {
		return {
			type: type,
			url: url
		};
	}
	return {
		url: url
	};
}

// Check if the same fixture was previously added, if so, we remove it
// from our array of fixture overwrites.
function upsertFixture (fixtureList, settings, fixture) {
	var index = exports.index(settings, true);
	var oldFixture;
	if (index > -1) {
		oldFixture = fixtures.splice(index, 1);
	}
	if (fixture == null) {
		return oldFixture;
	}
	if(typeof fixture === "object") {
		var data = fixture;
		fixture = function(){
			return data;
		};
	}
	settings.fixture = fixture;
	fixtures.unshift(settings);
	return oldFixture;
}

// Adds a fixture to the list of fixtures.
exports.add = function (settings, fixture) {
	// If a fixture isn't provided, we assume that settings is
	// an array of fixtures, and we should iterate over it, and set up
	// the new fixtures.
	if (fixture === undefined) {
		var oldFixtures = [];
		if(Array.isArray(settings)) {
			canReflect.eachIndex(settings, function(ajaxSettings){
				var fixture = ajaxSettings.fixture;
				ajaxSettings = canReflect.assignMap({}, ajaxSettings);
				delete ajaxSettings.fixture;
				return exports.add(ajaxSettings, fixture);
			});
		} else {
			canReflect.eachKey(settings, function (fixture, url) {
				oldFixtures = oldFixtures.concat(exports.add(url, fixture));
			});
			return oldFixtures;
		}
	}

	// When a fixture is passed a store like:
	// `fixture("/things/{id}", store)`
	if (isStoreLike(fixture)) {
		settings = addStoreFixture(settings, fixture);
		return exports.add(settings);
	}

	if (typeof settings === 'string') {
		settings = getSettingsFromString(settings);
	}
	return upsertFixture(fixtures, settings, fixture);
};

var $fixture = exports.add;
$fixture.on = true;
$fixture.delay =10;

function FixtureResponse(fixture, response){
	this.statusCode= response[0];
	this.responseBody= response[1];
	this.headers= response[2];
	this.statusText= response[3];
	this.fixture= fixture;
}

// Calls a dynamic fixture and calls `cb` with the response data.
exports.callDynamicFixture = function(xhrSettings, fixtureSettings, cb){
	// this is for legacy.  In the future, people should get it from fixtureSettings probably.
	xhrSettings.data = fixtureSettings.data;

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		var json = JSON.stringify(xhrSettings.data);
		canLog.log("" + xhrSettings.type.toUpperCase() + " " + xhrSettings.url+" "+json.substr(0,50)+" -> handler(req,res)");
	}
	//!steal-remove-end

	var response = function(){
		var res = exports.extractResponse.apply(xhrSettings, arguments);
		//!steal-remove-start
		canLog.log("can-fixture: " + xhrSettings.type.toUpperCase() + " " + xhrSettings.url+" ",xhrSettings.data," => ",new FixtureResponse(fixtureSettings.fixture,res));
		//!steal-remove-end
		return cb.apply(this, res);
	};
	var callFixture = function () {
		// fall the fixture
		var result = fixtureSettings.fixture(xhrSettings, response, xhrSettings.headers, fixtureSettings);

		if (canReflect.isPromise(result)) {
			// If we have a promise, wait for it to resolve
			result.then(function (result) {
				if (result !== undefined) {
					// Resolve with fixture results
					response(200, result );
				}
			});
		} else {
			if (result !== undefined) {
				// Resolve with fixture results
				response(200, result );
			}
		}
	};

	if(!xhrSettings.async) {
		callFixture();
		return null;
	} else {
		return setTimeout(callFixture, $fixture.delay);
	}
};

exports.index = function (settings, exact) {
	for (var i = 0; i < fixtures.length; i++) {
		if (matches.matches(settings, fixtures[i], exact)) {
			return i;
		}
	}
	return -1;
};
exports.get = function(xhrSettings) {
	if ( !$fixture.on ) {
		return;
	}
	// First try an exact match
	var index = exports.index(xhrSettings, true);

	// If that doesn't work, try a looser match.
	if(index === -1) {
		index = exports.index(xhrSettings, false);
	}

	var fixtureSettings = index >=0 ? canReflect.assignMap({},fixtures[index]) : undefined;
	if(fixtureSettings) {
		var url = fixtureSettings.fixture,
			data = dataFromUrl(fixtureSettings.url, xhrSettings.url);
		if(typeof fixtureSettings.fixture === "string") {
			// check that we might have a replacement

			// here we could read data from first url and translate into next
			if (data) {
				// Template static fixture URLs
				url = sub(url, data);
			}

			// Override the AJAX settings, changing the URL to the fixture file,
			// removing the data, and changing the type to GET.
			fixtureSettings.url = url;
			fixtureSettings.data = null;
			fixtureSettings.type = "GET";
			if (!fixtureSettings.error) {
				// If no error handling is provided, we provide one and throw an
				// error.
				fixtureSettings.error = function (xhr, error, message) {
					throw "fixtures.js Error " + error + " " + message;
				};
			}

		} else if (canReflect.isPlainObject(xhrSettings.data) || xhrSettings.data == null) {
			var xhrData = canReflect.assignMap({}, xhrSettings.data || {});
			fixtureSettings.data = canReflect.assignMap(xhrData, data);

		} else {
			fixtureSettings.data = xhrSettings.data;
		}
	}

	return fixtureSettings;
};

exports.matches = matches;




// A helper function that takes what's called with response
// and moves some common args around to make it easier to call
exports.extractResponse = function (status, response, headers, statusText) {
	// if we get response(RESPONSE, HEADERS)
	if (typeof status !== "number") {
		headers = response;
		response = status;
		status = 200;
	}
	// if we get response(200, RESPONSE, STATUS_TEXT)
	if (typeof headers === "string") {
		statusText = headers;
		headers = {};
	}
	return [status, response, headers, statusText];
};
