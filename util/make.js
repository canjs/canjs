// load('can/util/make.js')

load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {
    //check if args

	steal.build.pluginify("can/util/make/jquery.js",{
		out : "can/util/can.jquery.js",
		exclude : "can/util/jquery/jquery.1.7.1.js",
		global : "can = {}",
		onefunc : true,
		compress: true
	});
	
	steal.build.pluginify("can/util/make/zepto.js",{
		out : "can/util/can.zepto.js",
		exclude : "can/util/zepto/zepto.0.8.js",
		global : "can = {};",
		onefunc : true,
		compress: true
	});
	
	steal.build.pluginify("can/util/make/dojo.js",{
		out : "can/util/can.dojo.js",
		exclude : "https://ajax.googleapis.com/ajax/libs/dojo/1.7.1/dojo/dojo.js.uncompressed.js",
		global : "can = {};",
		onefunc : true,
		compress: true
	});
	
	steal.build.pluginify("can/util/make/mootools.js",{
		out : "can/util/can.mootools.js",
		exclude : "can/util/mootools/mootools-core-1.4.3.js",
		global : "can = {};",
		onefunc : true,
		compress: true
	});
	
	steal.build.pluginify("can/util/make/yui.js",{
		out : "can/util/can.yui.js",
		exclude : "can/util/yui/yui.js",
		global : "can = {};",
		onefunc : true,
		compress: true
	});

});