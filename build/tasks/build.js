var spawn = require("child_process").spawn,
	path = require("path"),
	jsDir = path.join( __dirname, "../../..");


module.exports = function( grunt ) {

	grunt.registerMultiTask('build', 'Builds CanJS.', function() {
		var done = this.async();
		var options = grunt.config.process(['build', this.target]);
		var args = [options.buildFile, options.out || 'dist/', options.version || 'edge'];
		var libraries = Array.isArray(options.libraries) ? options.libraries : [];

		args.push.apply(args, libraries);

		grunt.verbose.writeflags(options, 'Options');
		grunt.log.writeln('Running  ./js ' + args.toString());

		var build = spawn("./js", args, {
				cwd: jsDir
			});

		build.stdout.on("data", function( buf ) {
			grunt.log.write( "" + buf );
		});

		build.on("exit", function( code ) {
			done();
		});

		grunt.log.write("Building CanJS with Steal...\n");
	});

};
