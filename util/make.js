// load('can/util/make.js')

load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {
	
	steal.File("can/dist").mkdirs();

	steal.build.pluginify("can/util/make/jquery.js",{
		out : "can/dist/can.jquery-edge.js",
		global : "can = {}",
		onefunc : true,
		compress: true,
		skipCallbacks: true
	});
	
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

});