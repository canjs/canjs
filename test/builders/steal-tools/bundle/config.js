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
			"stache": "can/view/stache/system",
			"ejs": "can/view/ejs/system",
			"mustache" : "can/view/mustache/system"
		},
		paths: {
			"jquery": "../../../../lib/jquery.1.10.2.js",
			"can/*": "../../../../*.js"
		},
		meta: {
			jquery: {
				exports: "jQuery"
			}
		},
		ext: {
			ejs: "can/view/ejs/ejs",
			mustache: "can/view/mustache/mustache",
			stache: "can/view/stache/stache"
		},
		bundle: [ "components/one/one" ]
	});
	System.buildConfig = {
		map: {
			"jquery/jquery": "jquery",
			"can/util/util": "can/util/domless/domless",
			"stache": "can/view/stache/system"
		}
	};
})();
