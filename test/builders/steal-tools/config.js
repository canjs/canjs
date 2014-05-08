console.log("CONFIG RUN");

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
			supportsUnknownElements = false;
		}
	}());


	steal.config({
		map: {
			"jquery/jquery": "jquery",
			"can/util/util": "can/util/jquery/jquery",
			"stache": "can/view/stache/system"
		},
		paths: {
			"jquery": "../../../lib/jquery.1.10.2.js",
			"can/*": "../../../*.js"
		},
		meta: {
			jquery: {
				exports: "jQuery",
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv"]
			}
		},
		ext: {
			ejs: "view/ejs/ejs.js",
			mustache: "view/mustache/mustache.js",
			stache: "view/stache/stache.js"
		}
	});
	System.buildConfig = {
		map: {
			"jquery/jquery": "jquery",
			"can/util/util": "can/util/domless/domless",
			"stache": "can/view/stache/system"
		}
	};
})();
