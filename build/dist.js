load("can/build/underscore.js");
var _ = this._;

load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {
	// Use with ./js can/build/dist.js <outputfolder> <version> <library1> <library2>
	var libs = {
		"jquery" : {
			exclude : ["jquery"],
			shim : {
				'jquery' : 'jQuery'
			}
		},
		"zepto" : {}
//		"mootools" : {}
//		"dojo" : {
//			wrapInner : [
//				'\ndefine("can/dojo", ["dojo/query", "dojo/NodeList-dom", "dojo/NodeList-traverse"], function(){' + '' +
//					'\n\nreturn can;\n});\n'
//			]
//		},
//		"yui" : {
//			wrapInner : [
//				'\nYUI().add("can", function(Y) {\ncan.Y = Y;\n' +
//					'}, "0.0.1", {\n' +
//					'requires: ["node", "io-base", "querystring", "event-focus", "array-extras"],' +
//					'\n optional: ["selector-css2", "selector-css3"]\n});\n'
//			]
//		}
	}

	var version = _args[1] || 'edge';
	var outFolder = (_args[0] || 'can/dist/') + version + '/';
	var libraries = _args[2] ? _args.slice(2) : _.keys(libs);

	steal.File(outFolder).mkdirs();

	_.each(libraries, function (lib) {
		var options = libs[lib],
			outFile = outFolder + "/can." + lib + "-" + version + ".js",
			code;

		console.log('Building ' + lib + ' ' + version + ' to ' + outFile);
		steal.build.pluginify("can/build/make/" + lib + ".js", _.extend({
			out : outFile,
			// global : "can = {}",
			// namespace : "can",
			// onefunc : true,
			exports : { 'can/util/can.js' : 'can' },
			compress : false,
			skipCallbacks : true
		}, options));

		// Replace version
		code = readFile(outFile);
		code = code.replace(/\#\{VERSION\}/gim, version);
		steal.File(outFile).save(code);
	});

	/*
	steal.build.pluginify("can/util/can-all.js", {
		out : "can/dist/edge/can.jquery.all.js",
		exports : { 'can/util/can.js' : 'can' },
		compress : false,
		skipCallbacks : true,
		exclude : "jquery",
		shim : { 'jquery' : 'jQuery' }
	});
	*/
});
