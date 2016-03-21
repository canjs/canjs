/**
 * TODO: fix this, and make a real non-jquery implementation of can.data
 * This module requires the nodelist to implement their own data, which of course
 * is not a great idea. this is a temprary measure to be fixed
 */

var makeArray = require('can/util/array/makeArray');

module.exports = function (wrapped) {
	return wrapped.data.apply(wrapped, makeArray(arguments).slice(1));
};
