var path = require('path');
var fs = require('fs');

module.exports = function( grunt ) {
	grunt.registerMultiTask("minify", "Minifies CanJS, then outputs filesize information", function() {
		var done = this.async();
		var tasks = grunt.file.expandFiles(this.file.src).map(function (file) {
			console.log(file);
			return function(callback) {
				var minFile = path.join(path.dirname(file), path.basename(file, '.js') + '.min.js');
				var gzFile = minFile + '.gz';
				fs.stat(file, function(err, stats) {
					if(err) return callback(err);

					var originalSize = (stats.size / 1024).toFixed(2);
					console.log('Minifying ' + file + ' original size is ' + originalSize + 'Kb');
					grunt.utils.exec({
						cmd : 'closure',
						args : [file, '--js_output_file', minFile]
					}, function(error, result, code) {
						callback(null, result);
					})
				});
			}
		});

		grunt.utils.async.parallel(tasks, function(error, results) {
			console.dir(arguments);
			done();
		});
	});
};
