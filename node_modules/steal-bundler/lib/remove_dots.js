var includes = function includes(string, search) {
	return string.indexOf(search) !== -1;
};

/**
 * Remove dots from a relative path
 * @param {String} pth - The path to be stripped out of dots
 * @return {String} The path without the dots
 */
module.exports = function removeDots(pth) {
	var sep = includes(pth, "/") ? "/" : "\\";

	return pth
		.split(sep)
		.filter(function(p) {
			return p !== "." && p !== "..";
		})
		.join(sep);
};
