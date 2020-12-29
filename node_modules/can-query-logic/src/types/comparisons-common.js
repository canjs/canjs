function isMemberThatUsesTestOnValues(value) {
	return this.constructor.test(this.values, value);
}

exports.isMemberThatUsesTestOnValues = isMemberThatUsesTestOnValues;
