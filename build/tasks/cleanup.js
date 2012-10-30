var walk = require('walk');

module.exports = function (grunt) {
	// ### TASKS
	grunt.registerTask('cleanup', 'Beautify JavaScript files.', function () {
		var config = grunt.config('cleanup'),
		// Walker options
			walker = walk.walk(config.files, { followLinks : false }),
			done = this.async();

		walker.on('file', function (root, stat, next) {
			// Add this file to the list of files
			var filename = root + '/' + stat.name;
			if (/\.js$|\.json$/.test(filename)) {
				console.log(filename)
			}
			next();
		});

		walker.on('end', function () {
			done();
		});
	});
}