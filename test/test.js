(function() {
	can.test = {
		fixture: function (path) {
			if (typeof steal !== 'undefined') {
				return steal.config('root').toString() + '/' + path;
			}
			if(typeof requirejs !== 'undefined') {
				return requirejs.s.contexts._.config.baseUrl + path;
			}
			return path;
		},
		path: function (path) {
			if (typeof steal !== 'undefined') {
				return steal.config('root').toString() + '/' + steal.id(path).toString();
			}
			if(typeof requirejs !== 'undefined') {
				return requirejs.s.contexts._.config.baseUrl + path;
			}
			return path;
		}
	}
})();
