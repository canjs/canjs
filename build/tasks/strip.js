var path = require('path');

// A grunt task that strips multiline comments
module.exports = function (grunt) {
	grunt.registerMultiTask('strip', 'Remove multiline comments from files', function () {
		var options = grunt.config.process(['strip', this.target]);
		grunt.file.expandFiles(this.file.src).forEach(function (file) {
			var outFile = options.out ? path.join(options.out, path.basename(file)) : file;
			// TODO use Grunt internals
			grunt.log.writeln('Stripping ' + file + ' of all multiline comments, writing result to ' + outFile);

			// Put new index.html into production mode
			var code = grunt.file.read(file);

			// Remove multiline comments
			code = code.replace(/\/\*([\s\S]*?)\*\//gim, "");

			// Remove double semicolons from steal pluginify
			code = code.replace(/;[\s]*;/gim, ";");
			code = code.replace(/(\/\/.*)\n[\s]*;/gi, "$1");

			// Only single new lines
			code = code.replace(/(\n){3,}/gim, "\n\n");

			grunt.file.write(outFile, code);
		});
	});
}
