// load('can/util/make.js')

load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {
    //check if args

	steal.build.pluginify("can/util/mvc.js",{
		out : "can/util/can.jquery.js",
		exclude : "can/util/jquery/jquery.1.7.1.js",
		global : "can = {}",
		onefunc : true,
		compress: true
	});

});