(function () {
	// taking from HTML5 Shiv v3.6.2 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
	var supportsUnknownElements = false;

	(function () {
		try {
			var a = document.createElement('a');
			a.innerHTML = '<xyz></xyz>';

			supportsUnknownElements = a.childNodes.length == 1 || (function () {
				// assign a false positive if unable to shiv
				(document.createElement)('a');
				var frag = document.createDocumentFragment();
				return (
					typeof frag.cloneNode == 'undefined' ||
						typeof frag.createDocumentFragment == 'undefined' ||
						typeof frag.createElement == 'undefined'
					);
			}());
		} catch (e) {
			// assign a false positive if detection fails => unable to shiv
			supportsUnknownElements = true;
		}
	}())


	steal.config({
		map: {
			"*": {
				"jquery/jquery.js": "jquery",
				"can/util/util.js": "can/util/jquery/jquery.js"
			}
		},
		paths: {
			"jquery": "bower_components/jquery/jquery.js",
			"mootools/mootools.js": "lib/mootools-core-1.4.5.js",
			"dojo/dojo.js": "util/dojo/dojo-1.8.1.js",
			"yui/yui.js": "lib/yui-3.7.3.js",
			"zepto/zepto.js": "lib/zepto.1.0.js",
			"can/": "",
			"jquerypp/": "http://jquerypp.com/release/1.0.1/steal/"
		},
		shim: {
			jquery: {
				exports: "jQuery",
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			},
			"zepto/zepto.js": {
				"exports": "Zepto"
			}
		},
		ext: {
			ejs: "view/ejs/ejs.js",
			mustache: "view/mustache/mustache.js"
		},
		root: steal.config('root').join('../')
	});
})();
