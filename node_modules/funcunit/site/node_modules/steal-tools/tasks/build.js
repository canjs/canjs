var build = require("../index").build;

module.exports = function(grunt){

	grunt.registerMultiTask("steal-build", "Build a steal project into bundles.", function(){
		var done = this.async();
		var options = this.options();

		var system = options.system;
		var buildOptions = options.buildOptions;

		// Run the build with the provided options
		var promise = build(system, buildOptions);
		if(promise.then) {
			var success = function(){
				grunt.log.writeln("Build was successful.");
				done();
			};

			var error = function(error) {
				grunt.log.writeln("Build has failed. ", error);
				done(error);
			};

			promise.then(success, error);
		}
	});

};
