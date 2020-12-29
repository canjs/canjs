"use strict";
// Attemps to guess where the id is in an AJAX call's URL and returns it.
module.exports = function (xhrSettings, fixtureSettings) {
	var id = xhrSettings.data.id;

	if (id === undefined && typeof xhrSettings.data === "number") {
		id = xhrSettings.data;
	}

	// Parses the URL looking for all digits
	if (id === undefined) {
		// Set id equal to the value
		xhrSettings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
			id = num;
		});
	}

	if (id === undefined) {
		// If that doesn't work Parses the URL looking for all words
		id = xhrSettings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
			// As long as num isn't the word "update", set id equal to the value
			if (num !== 'update') {
				id = num;
			}
		});
	}

	if (id === undefined) {
		// If id is still not set, a random number is guessed.
		id = Math.round(Math.random() * 1000);
	}

	return id;
};
