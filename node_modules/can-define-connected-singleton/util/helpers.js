var assign = function(obj) {
	var to = Object(obj);

	for (var i = 1, l = arguments.length; i < l ; i++) {
		var next = arguments[i];

		if (next != null) {
			for (var key in next) {
				if (Object.prototype.hasOwnProperty.call(next, key)) {
					to[key] = next[key];
				}
			}
		}
	}

	return to;
}


module.exports = {
	assign: assign
};
