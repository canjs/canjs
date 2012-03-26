load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {

	var libs = {
		"jquery" : "jquery.1.7.1.js",
		"mootools" : "mootools-core-1.4.3.js",
		"zepto" : "zepto.0.8.js",
		"dojo" : "dojo.js",
		"yui" : "yui.js"
	}, lib, exclude;
	
	steal.File("can/standalone").mkdirs();

	for ( lib in libs ) {

		exclude = libs[ lib ];

		/** /
		steal.build.pluginify("can/util/make/" + lib + ".js",{
			out : "can/standalone/can." + lib + "-edge.min.js",
			global : "can = {}",
			onefunc : true,
			compress: true,
			skipCallbacks: true,
			exclude : "can/util/" + lib + "/" + exclude
		});
		/**/

		steal.build.pluginify("can/util/make/" + lib + ".js",{
			out : "can/standalone/can." + lib + "-edge.js",
			global : "can = {}",
			onefunc : true,
			compress: false,
			skipCallbacks: true,
			exclude : "can/util/" + lib + "/" + exclude
		});
	}

});
