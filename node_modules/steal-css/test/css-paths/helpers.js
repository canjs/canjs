
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
