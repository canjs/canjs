steal('can/util', function() {
	var viewCheck = /(\.mustache|\.stache|\.ejs|extensionless)$/;

	can.test = {
		fixture: function (path) {
			if (typeof steal !== 'undefined') {
				return steal.config('root').toString() + '/' + path;
			}

			if (window.require && require.toUrl && !viewCheck.test(path)) {
				return require.toUrl(path);
			}
			return path;
		},
		path: function (path) {
			if (typeof steal !== 'undefined') {
				return steal.joinURIs(steal.config("baseUrl"), path);
			}

			if (window.require && require.toUrl && !viewCheck.test(path)) {
				return require.toUrl(path);
			}
			return path;
		}
	}
});
