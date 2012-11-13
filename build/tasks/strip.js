var path = require('path');

// A grunt task that strips multiline comments
module.exports = function (grunt) {
	grunt.registerMultiTask('strip', 'Remove multiline comments from files', function () {
		var _ = grunt.utils._;
		var options = grunt.config.process(['strip', this.target]);
		var defaults = _.extend({
			exclude : [/\.min\./]
		}, grunt.config('strip')._options);
		grunt.file.expandFiles(this.file.src).forEach(function (file) {
			for(var i = 0; i < defaults.exclude.length; i++) {
				if(defaults.exclude[i].test(file)) {
					return;
				}
			}
			var outFile = options.out ? path.join(options.out, path.basename(file)) : file;
			// TODO use Grunt internals
			grunt.log.writeln('Stripping ' + file + ' of all multiline and empty inline comments');

			// Put new index.html into production mode
			var code = grunt.file.read(file);

			// Remove multiline comments
			code = code.replace(/\/\*([\s\S]*?)\*\//gim, "")
				.replace(/\/\/(\s*)\n/gim, "");

			// Remove double semicolons from steal pluginify
			code = code.replace(/;[\s]*;/gim, ";");
			code = code.replace(/(\/\/.*)\n[\s]*;/gi, "$1");

			// Only single new lines
			code = code.replace(/(\n){3,}/gim, "\n\n");

			grunt.file.write(outFile, code);
		});
	});
}
