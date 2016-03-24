function isArray(arr) {
	if (Array.isArray) {
		return Array.isArray(arr);
	}
	return Object.prototype.toString.call(arr) === "[object Array]";
}

module.exports = isArray;
