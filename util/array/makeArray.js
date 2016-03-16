require('./each');

can.makeArray = function (arr) {
	var ret = [];
	can.each(arr, function (a, i) {
		ret[i] = a;
	});
	return ret;
};

module.exports = can;
