var replacer =  /\{([^\}]+)\}/g;
// Returns data from a url, given a fixtue URL. For example, given
// "todo/{id}" and "todo/5", it will return an object with an id property
// equal to 5.
module.exports = function dataFromUrl(fixtureUrl, url) {
	if(!fixtureUrl) {
		// if there's no url, it's a match
		return {};
	}

	var order = [],
		// Sanitizes fixture URL
		fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.')
			.replace('?', '\\?'),
		// Creates a regular expression out of the adjusted fixture URL and
		// runs it on the URL we passed in.
		res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
			order.push(part);
			return "([^\/]+)";
		}) + "$")
			.exec(url),
		data = {};

	// If there were no matches, return null;
	if (!res) {
		return null;
	}

	// Shift off the URL and just keep the data.
	res.shift();
	order.forEach( function (name) {
		// Add data from regular expression onto data object.
		data[name] = res.shift();
	});
	return data;
};
