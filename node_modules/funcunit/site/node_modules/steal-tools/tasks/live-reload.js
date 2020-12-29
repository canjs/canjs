var liveReload = require("../lib/stream/live");

module.exports = function(grunt){

	grunt.registerMultiTask("steal-live-reload", "Start live-reload server.", function(){
		var options = this.options();

		var system = options.system;
		var liveReloadOptions = options.liveReloadOptions || {};

		liveReload(system, liveReloadOptions);
	});

};
