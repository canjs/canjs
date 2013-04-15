(function() {
	can.test = {
		fixture: function (path) {
			if (typeof steal !== 'undefined') {
				return '//' + steal.id(path).toString();
			}
			return path;
		},
		path: function (path) {
			if (typeof steal !== 'undefined') {
				return steal.config('root').toString() + '/' + steal.id(path).toString();
			}
			return path;
		}
	}
})();
