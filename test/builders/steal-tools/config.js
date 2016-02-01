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
			"jquery": "../../../node_modules/jquery/dist/jquery.js",
			"can/*": "../../../*.js"
		},
		ext: {
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
