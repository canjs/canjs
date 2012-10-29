load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function() {
	var lib = 'jquery';
	steal.build.pluginify("can/util/make/" + lib + ".js", {
		out : "can/dist/edge/can." + lib + ".js",
		// global : "can = {}",
		// namespace : "can",
		// onefunc : true,
		exclude : "jquery",
		shim : {
			'jquery' : 'jQuery'
		},
		exports : { 'can/util/can.js' : 'can' },
		compress: false,
		skipCallbacks: true
	});
});