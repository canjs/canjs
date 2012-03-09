load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {
	
	steal.File("can/standalone").mkdirs();

	steal.build.pluginify("can/util/make/jquery.js",{
		out : "can/standalone/can.jquery-edge.js",
		global : "can = {}",
		onefunc : true,
		compress: true,
		skipCallbacks: true,
		exclude : "can/util/jquery/jquery.1.7.1.js"
	});
	/** /
	
	steal.build.pluginify("can/util/make/mootools.js",{
		out : "can/dist/can.mootools-edge.js",
		global : "can = {}",
		onefunc : true,
		compress: true,
		skipCallbacks: true,
		skipCallbacks: true
	});
	
	steal.build.pluginify("can/util/make/zepto.js",{
		out : "can/dist/can.zepto-edge.js",
		global : "can = {}",
		onefunc : true,
		compress: true,
		skipCallbacks: true
	});
	
	steal.build.pluginify("can/util/make/dojo.js",{
		out : "can/dist/can.dojo-edge.js",
		global : "can = {}",
		onefunc : true,
		compress: true,
		skipCallbacks: true
	});
	
	steal.build.pluginify("can/util/make/yui.js",{
		out : "can/dist/can.yui-edge.js",
		global : "can = {}",
		onefunc : true,
		compress: true,
		skipCallbacks: true
	});
	/**/

});
