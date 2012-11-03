load("can/build/underscore.js");
load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function () {
	var arguments = _args;
	var plugins = {
		standAlone : {
			"construct/proxy/proxy" : "construct.proxy",
			"construct/super/super" : "construct.super",
			"control/plugin/plugin" : "control.plugin",
			"control/view/view" : "control.view",
			"observe/attributes/attributes" : "observe.attributes",
			"observe/delegate/delegate" : "observe.delegate",
			"observe/setter/setter" : "observe.setter",
			"observe/validations/validations" : "observe.validations",
			"view/modifiers/modifiers" : "view.modifiers"
		},
		can_util_object : {
			"observe/backup/backup" : "observe.backup",
			"util/fixture/fixture" : "fixture"

		}
	};

	each(plugins.standAlone, function (output, input) {

		var code;

		steal.build.pluginify("can/" + input + ".js", {
			out : "can/dist/edge/can." + output + ".js",
			//			global: "this.can",
			//			onefunc: true,
			compress : false,
			//			skipCallbacks: true,
			namespace : "can",
			standAlone : true
		});

	});

	// Build can.fixture and can.observe.backup seperately
	// They need can/util/object, so we can't use the standAlone option
	each(plugins.can_util_object, function (output, input) {

		steal.build.pluginify("can/" + input + ".js", {
			out : "can/dist/edge/can." + output + ".js",
			shim : { 'can/util' : 'can' },
			exclude : [
				'jquery',
				'can/util/preamble.js',
				'can/util/jquery/jquery.js',
				'can/util/array/each.js',
				'can/util/string/string.js',
				'can/construct/construct.js',
				'can/observe/observe.js'
			],
			compress : false,
			skipCallbacks : true,
			standAlone : false
		});

	});

	// Build can.fixture and can.observe.backup seperately
	// They need can/util/object, so we can't use the standAlone option
	each(plugins.can_util_object, function (output, input) {

		steal.build.pluginify("can/" + input + ".js", {
			out : "can/dist/edge/can." + output + ".js",
			global : "this.can",
			onefunc : true,
			exclude : [
				'can/util/jquery/jquery.1.8.2.js',
				'can/util/preamble.js',
				'can/util/jquery/jquery.js',
				'can/util/array/each.js',
				'can/util/string/string.js',
				'can/construct/construct.js',
				'can/observe/observe.js'
			],
			compress : false,
			skipCallbacks : true,
			namespace : "can",
			standAlone : false
		});


	});
});
