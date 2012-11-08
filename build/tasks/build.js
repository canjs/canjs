var path = require("path");
var jsDir = path.join( __dirname, "../../..");

module.exports = function( grunt ) {
	grunt.registerMultiTask('build', 'Runs build files.', function() {
		var done = this.async();
		var target = this.target;
		var files = Array.isArray(this.file.src) ? this.file.src : [this.file.src];
		// TODO grunt.file.expandFiles(this.file.src);
		var series = files.map(function (file) {
			return function(callback) {
				var options = grunt.config.process(['build', target]);
				var args = [file, options.out || 'dist/', options.version || 'edge'];
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
					callback(error, result, code);
				});

				grunt.log.write("Building " + file + " with Steal...\n");
			}
		});
		grunt.utils.async.parallel(series, function(error, results) {
			grunt.log.writeln('Done building');
			done();
		})
	});
};
