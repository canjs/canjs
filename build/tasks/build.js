var path = require("path");
var jsDir = path.join( __dirname, "../../..");

module.exports = function( grunt ) {
	grunt.registerMultiTask('build', 'Builds CanJS.', function() {
		var done = this.async();
		var options = grunt.config.process(['build', this.target]);
		var args = [options.buildFile, options.out || 'dist/', options.version || 'edge'];
		var libraries = Array.isArray(options.libraries) ? options.libraries : [];

		args.push.apply(args, libraries);

		grunt.verbose.writeflags(options, 'Options');
		grunt.log.writeln('Running  ./js ' + args.toString());

		grunt.utils.exec({
			cmd : "./js",
			args : args,
			opts : {
				cwd: jsDir
			}
		}, function(error, result, code) {
			done(error);
		});

		grunt.log.write("Building CanJS with Steal...\n");
	});
};
