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
	}());

	// Dojo specific hacks
	var dojoDefine;
	var oldInstantiate = System.instantiate;
	System.instantiate = function(load) {
		var loader = this;
		if(load.name === "dojo/dojo") {
			var oldExec = loader.__exec;

			loader.__exec = function(load) {
				var ret = oldExec.call(this, load);
				dojoDefine = loader.global.define;
				loader.__exec = oldExec;
				return ret;
			};
		}

		if(load.name === 'can/util/util') {
			return oldInstantiate.apply(this, arguments).then(function(instantiateObj) {
				var oldExecute = loader.defined[load.name].execute;

				loader.defined[load.name].execute = function() {
					var ourDefine = loader.global.define;
					loader.global.define = dojoDefine;
					var ret = oldExecute.apply(this, arguments);
					loader.global.define = ourDefine;
					load.metadata.execute = oldExecute;
					return ret;
				};
				return instantiateObj;
			});	
		}

		return oldInstantiate.apply(this, arguments);
	};

	steal.config({
		map: {
			"jquery/jquery": "jquery",
			"benchmark/benchmark": "benchmark"
		},
		paths: {
			"jquery": "lib/jquery.1.10.2.js",
			"mootools/mootools": "lib/mootools-core-1.4.5.js",
			"dojo/dojo": "util/dojo/dojo-1.8.1.js",
			"yui/yui": "lib/yui-3.7.3.js",
			"zepto/zepto": "bower_components/zepto/zepto.js",
			"can/*": "*.js",
			"jquerypp/": "http://jquerypp.com/release/1.0.1/steal/",
			"benchmark": "bower_components/benchmark/benchmark.js",
			"jqueryui/jqueryui.js" :"http://code.jquery.com/ui/1.10.4/jquery-ui.js",
			"steal/dev/dev.js": "lib/steal/dev/dev.js",
			"can/util/util": "util/jquery/jquery.js"
		},
		meta: {
			jquery: {
				exports: "jQuery",
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			},
			"jqueryui/jqueryui": {
				deps: ["jquery"]
			},
			"zepto/zepto.js": {
				"exports": "Zepto"
			},
			"mootools/mootools.js" : {
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			},
			"dojo/dojo.js": {
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			},
			"yui/yui.js": {
				deps: supportsUnknownElements ? undefined : ["can/lib/html5shiv.js"]
			}
		},
		ext: {
			ejs: "view/ejs/system",
			mustache: "view/mustache/system",
			stache: "view/stache/system"
		}
	});
})();
