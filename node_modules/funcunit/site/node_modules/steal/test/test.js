module("steal via system import");

QUnit.config.testTimeout = 30000;

(function(){

	// Legacy IE doesn't support reserved keywords and Traceur uses them
	// so using this as an easy way to feature-detect browser support for
	// ES6 transpilers.
	var supportsES = (function(){
		try {
			eval("var foo = { typeof: 'typeof' };");
			return true;
		} catch(e) {
			return false;
		}
	})();

	var writeIframe = function(html){
		var iframe = document.createElement('iframe');
		window.removeMyself = function(){
			window.removeMyself = undefined;
			try {
				delete window.removeMyself;
			} catch(e) {}
			document.body.removeChild(iframe);
		};
		document.body.appendChild(iframe);
		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(html);
		iframe.contentWindow.document.close();
		return iframe;
	};
	var makePassQUnitHTML = function(){
		return "<script>\
			window.QUnit = window.parent.QUnit;\
			window.removeMyself = window.parent.removeMyself;\
			</script>";

	};
	var makeStealHTML = function(url, src, code){
		return "<!doctype html>\
			<html>\
				<head>" + makePassQUnitHTML() +"\n"+
					"<base href='"+url+"'/>"+
				"</head>\
				<body>\
					<script "+src+"></script>"+
					(code ? "<script>\n"+code+"</script>" :"") +
				"</body></html>";

	};
	var makeIframe = function(src){
		var iframe = document.createElement('iframe');
		window.removeMyself = function(){
			window.removeMyself = undefined;
			try {
				delete window.removeMyself;
			} catch(e) {}
			document.body.removeChild(iframe);
		};
		document.body.appendChild(iframe);
		iframe.src = src;
	};

	asyncTest('steal basics', function(){
		System['import']('tests/module').then(function(m){
			equal(m.name,"module.js", "module returned" );
			equal(m.bar.name, "bar", "module.js was not able to get bar");
			start();
		}, function(err){
			ok(false, "steal not loaded");
			start();
		});
	});

	asyncTest("steal's normalize", function(){
		System['import']('tests/mod/mod').then(function(m){
			equal(m.name,"mod", "mod returned" );
			equal(m.module.bar.name, "bar", "module.js was able to get bar");
			equal(m.widget(), "widget", "got a function");
			start();
		}, function(){
			ok(false, "steal not loaded");
			start();
		});
	});

	asyncTest("steal's normalize with a plugin", function(){
		System.instantiate({
			name: "foo",
			metadata: {format: "steal"},
			source: 'steal("foo/bar!foo/bar", function(){})'
		}).then(function(result){
			equal(result.deps[0], "foo/bar/bar!foo/bar", "normalize fixed part before !");
			start();
		});
	});

	asyncTest("steal's normalize with plugin only the bang", function(){
		System.instantiate({
			name: "foobar",
			metadata: {format: "steal"},
			source: 'steal("./rdfa.stache!", function(){})'
		}).then(function(result){
			System.normalize(result.deps[0], "foo","http://abc.com").then(function(result){
				equal(result, "rdfa.stache!stache", "normalize fixed part before !");
				start();
			});
		});
	});

	asyncTest("ignoring an import by mapping to @empty", function(){
		System.map["map-empty/other"] = "@empty";
		System["import"]("map-empty/main").then(function(m) {
			var empty = System.get("@empty");
			equal(m.other, empty, "Other is an empty module because it was mapped to empty in the config");
		}, function(){
			ok(false, "Loaded a module that should have been ignored");
		}).then(start);
	});

	asyncTest("steal.dev.assert", function() {
		System["import"]("ext/dev").then(function(dev){
			throws(
				function() {
					dev.assert(false);
				},
				/Expected/,
				"throws an error with default message"
			);
			throws(
				function() {
					dev.assert(false, "custom message");
				},
				/custom message/,
				"throws an error with custom message"
			);
			start();
		});
	});


	module("steal via html");

	if(supportsES) {
		asyncTest("basics", function(){
			makeIframe("basics/basics.html");
		});

		asyncTest("basics with steal.config backwards compatability", function(){
			makeIframe("basics/basics-steal-config.html");
		});


		asyncTest("basics with generated html", function(){
			writeIframe(makeStealHTML(
				"basics/basics.html",
				'src="../../steal.js?basics" data-config="../config.js"'));
		});

		asyncTest("default config path", function(){
			writeIframe(makeStealHTML(
				"basics/basics.html",
				'src="../steal.js?basics"'));
		});

		asyncTest("default config path", function(){
			writeIframe(makeStealHTML(
				"basics/basics.html",
				'src="../steal/steal.js?basics"'));
		});
	}

	asyncTest("inline", function(){
		makeIframe("basics/inline_basics.html");
	});
	asyncTest("inline main source", function(){
		makeIframe("basics/inline_main_source.html");
	});

	if(supportsES) {
		asyncTest("default bower_components config path", function(){
			writeIframe(makeStealHTML(
				"basics/basics.html",
				'src="../bower_components/steal/steal.js?basics"'));
		});

		asyncTest("default bower_components without config still works", function(){
			makeIframe("basics/noconfig.html");
		});
	}

	asyncTest("map works", function(){
		makeIframe("map/map.html");
	});

	if(supportsES) {
		asyncTest("read config", function(){
			writeIframe(makeStealHTML(
				"basics/basics.html",
				'src="../../steal.js?configed" data-config="../config.js"'));
		});
	}

	asyncTest("compat - production bundle works", function(){
		makeIframe("production/prod.html");
	});

	asyncTest("production bundle specifying main works", function(){
		makeIframe("production/prod-main.html");
	});

	asyncTest("steal.production.js doesn't require setting env", function(){
		makeIframe("production/prod-env.html");
	});

	asyncTest("steal.production.js logs errors", function(){
		makeIframe("production_err/prod.html");
	});

	asyncTest("loadBundles true with a different env loads the bundles", function(){
		makeIframe("load-bundles/prod.html");
	});

	asyncTest("automatic loading of css plugin", function(){
		makeIframe("plugins/site.html");
	});

	asyncTest("product bundle with css", function(){
		makeIframe("production/prod-bar.html");
	});

	asyncTest("Using path's * qualifier", function(){
		writeIframe(makeStealHTML(
			"basics/basics.html",
			'src="../steal.js?../paths" data-config="../paths/config.js"'));
	});

	// Less doesn't work in ie8
	if(supportsES) {
		asyncTest("automatic loading of less plugin", function(){
			makeIframe("dep_plugins/site.html");
		});

		asyncTest("url paths in less work", function(){
			makeIframe("less_paths/site.html");
		});

		asyncTest("ext extension", function(){
			makeIframe("extensions/site.html");
		});

		asyncTest("ext extension works without the bang", function(){
			makeIframe("extensions/site_no_bang.html");
		});
	}

	asyncTest("forward slash extension", function(){
		makeIframe("forward_slash/site.html");
	});

	asyncTest("a steal object in the page before steal.js is loaded will be used for configuration",function(){
		makeIframe("configed/steal_object.html");
	});

	asyncTest("compat - production bundle works", function(){
		makeIframe("prod-bundlesPath/prod.html");
	});

	asyncTest("System.instantiate preventing production css bundle", function(){
		makeIframe("production/prod-inst.html");
	});

	asyncTest("Multi mains", function(){
		makeIframe("multi-main/dev.html");
	});

	asyncTest("@loader is current loader", function(){
		makeIframe("current-loader/dev.html");
	});

	if(supportsES) {
		asyncTest("@loader is current loader with es6", function(){
			makeIframe("current-loader/dev-es6.html");
		});
	}

	asyncTest("@loader is current loader with steal syntax", function(){
		makeIframe("current-loader/dev-steal.html");
	});
	asyncTest("@steal is the current steal", function(){
		makeIframe("current-steal/dev.html");
	});

	/*
	asyncTest("Loads traceur-runtime automatically", function(){
		makeIframe("traceur_runtime/dev.html");
	});
	*/

	asyncTest("allow truthy script options (#298)", function(){
		makeIframe("basics/truthy_script_options.html");
	});

	if(supportsES) {
		asyncTest("using babel as transpiler works", function(){
			makeIframe("babel/site.html");
		});

		asyncTest("inline code", function(){
			makeIframe("basics/inline_code.html");
		});

		asyncTest("inline code works without line breaks", function(){
			makeIframe("basics/inline_code_no_break.html");
		});
	}

	asyncTest("warn in production when main is not set (#537)", function(){
		makeIframe("basics/no_main_warning.html");
	});

	asyncTest("can load a bundle with an amd module depending on a global", function(){
		makeIframe("prod_define/prod.html");
	});

	asyncTest("envs config works", function(){
		makeIframe("envs/envs.html");
	});

	asyncTest("envs config works with steal.production", function(){
		makeIframe("envs/prod/prod.html");
	});

	asyncTest("envs config is applied after a live-reload", function(){
		makeIframe("envs/envs-live.html");
	});

	asyncTest("script tag wins against global steal object", function(){
		makeIframe("script-tag_wins/index.html");
	});

	// Fixes bug with Chrome 68 injecting script tags from extensions before running sync Steal script
	asyncTest("attribute config is found when steal is not the last script element.", function(){
		var iframe = writeIframe(makeStealHTML(
			"basics/basics.html",
			'id="lastScript"'));
		var doc = iframe.contentWindow.document;
		var stealScript = doc.createElement('script');
		stealScript.src = "../../steal.js?basics";
		stealScript.setAttribute("data-config", "../config.js");
		doc.body.insertBefore(stealScript, doc.getElementById('lastScript'));
	});

	module("json extension");

	asyncTest("json extension", function(){
		makeIframe("json/dev.html");
	});

	module("npm");

	asyncTest("default-main", function(){
		makeIframe("npm/default-main.html");
	});

	asyncTest("alt-main", function(){
		makeIframe("npm/alt-main.html");
	});

	// This test uses jQuery 2.x
	if(supportsES) {
		asyncTest("production", function(){
			makeIframe("npm/prod.html");
		});
	}

	asyncTest("with bower", function(){
		makeIframe("npm/bower/index.html");
	});

	asyncTest("forward slash with npm", function(){
		makeIframe("npm-deep/dev.html");
	});

	asyncTest("meta config is deep", function(){
		makeIframe("meta-deep/index.html");
	});

	module("Bower extension");

	asyncTest("Basics work", function(){
		makeIframe("bower/site.html");
	});
	asyncTest("Doesn't overwrite paths", function(){
		makeIframe("bower/with_paths/site.html");
	});
	asyncTest("Works in place of @config", function(){
		makeIframe("bower/as_config/site.html");
	});

	asyncTest("Loads config automatically", function(){
		makeIframe("bower/default-config.html");
	});

	asyncTest("with npm", function(){
		makeIframe("bower/npm/index.html");
	});

	module("Web Workers");

	if(window.Worker) {
		asyncTest("basics works", function(){
			makeIframe("webworkers/dev.html");
		});

		asyncTest("env is properly set", function(){
			makeIframe("envs/worker/dev.html");
		});
	}

	module("Locate/Pkg Path Scheme extension");

	asyncTest("Basics work", function(){
		makeIframe("locate/site.html");
	});

	module("Contextual extension");

	asyncTest("Basics work", function(){
		makeIframe("contextual/test.html");
	});

	module("ext-steal-clone")

	asyncTest("basics work", function() {
		makeIframe("ext-steal-clone/basics/index.html");
	});

	asyncTest("does not share the module registry and extensions with cloned loader", function() {
		makeIframe("ext-steal-clone/config-separation/index.html");
	});

	asyncTest("caches source of parent modules to avoid duplicate downloads", function() {
		makeIframe("ext-steal-clone/fetch-cache/index.html");
	});

	asyncTest("works when overriding multiple modules", function() {
		makeIframe("ext-steal-clone/multiple-overrides/index.html");
	});

	asyncTest("works when using the npm extensions", function() {
		makeIframe("ext-steal-clone/npm-extension/index.html");
	});

	asyncTest("supports loading css, less files", function() {
		makeIframe("ext-steal-clone/other-extensions/index.html");
	});

	asyncTest("works when a parent of injected dependency has been imported", function() {
		makeIframe("ext-steal-clone/prior-import/index.html");
	});

	asyncTest("works when using relative imports", function() {
		makeIframe("ext-steal-clone/relative-import/index.html");
	});

	asyncTest("works when using relative overrides", function() {
		makeIframe("ext-steal-clone/relative-override/index.html");
	});

	asyncTest("what happens within a cloned loader should not leak", function(){
		makeIframe("ext-steal-clone/leak/index.html");
	});

	module("nw.js");

	asyncTest("it works", function(){
		makeIframe("nw/nw.html");
	});
})();
