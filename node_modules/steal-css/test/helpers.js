var steal = require("@steal");
var helpers = require("steal-test-helpers")(steal);
var pkg = require("../package.json");

exports.clone = function(){
	var sName = "steal-css@" + pkg.version + "#css";
	var sSource = steal.loader.getModuleLoad(sName).source;

	return helpers.clone().withModule("steal-css", sSource);
};

exports.waitForCssRules = function(styleNode, callback) {
	if (typeof callback !== 'function') {
		throw new Error('No callback provided');
	}

	// Poll for confirmation that the styles have loaded
	var poller = setInterval(function() {
		var rulesLoaded = false;

		try {
			// Only populated when file is loaded
			styleNode.sheet.cssRules;

			// Set a flag that can be evaluated outside the try/catch
			// block without throwing an error; Otherwise errors in the
			// callback will be caught
			rulesLoaded = true;
		} catch (e){}

		if (rulesLoaded) {
			clearInterval(poller);
			callback();
		}
	}, 10);
};

exports.fakeBeingInNode = function() {
	process = {versions:{}};
	var ts = Object.prototype.toString;
	Object.prototype.toString = function(){
		if(this === process) {
			return "[object process]";
		}
		return ts.call(this);
	};

	return function(){
		var global = steal.loader.global;
		delete global.process;
		Object.prototype.toString = ts;
	};
};

exports.fakeBeingInZombie = function() {
	navigator.noUI = true;

	return function(){
		var global = steal.loader.global;
		delete global.navigator.noUI;
	};
};

/**
 * A promise based polling function
 * @param {Function} pred A predicate function
 * @param {number} timeout Number of ms before the promise is rejected
 * @param {number} interval Number of ms to execute the predicate
 * @return {Promise}
 */
exports.poll = function poll(pred, timeout, interval) {
	var pollInterval = interval || 100;
	var endTime = Number(new Date()) + (timeout || 3000);

	return new Promise(function(resolve, reject) {
		// If the condition is met, we're done!
		if (pred()) return resolve();

		var poller = setInterval(function() {
			if (pred()) {
				clearInterval(poller);
				resolve();
			}
			else if (Number(new Date()) >= endTime) {
				clearInterval(poller);
				reject(new Error("Timed out for " + pred));
			}
		}, pollInterval);
	});
};
