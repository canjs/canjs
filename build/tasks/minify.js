var path = require('path');
var fs = require('fs');

module.exports = function( grunt ) {
	grunt.registerMultiTask("minify", "Minifies CanJS, then outputs filesize information", function() {
		var done = this.async();
		var minPostfix = '.min';
		var tasks = [];
		grunt.file.expandFiles(this.file.src).forEach(function (file) {
			if(new RegExp(minPostfix).test(file)) {
				console.log('Ignoring already minified file ' + file);
				return;
			}

			tasks.push(function(callback) {
				var minFile = path.join(path.dirname(file), path.basename(file, '.js') + minPostfix + '.js');
				var gzFile = minFile + '.gz';
				fs.stat(file, function(err, stats) {
					if(err) return callback(err);

					var originalSize = (stats.size / 1024).toFixed(2);
					console.log('Minifying ' + file + ' original size is ' + originalSize + 'Kb');
					grunt.utils.exec({
						cmd : 'closure',
						args : [file, '--js_output_file', minFile]
					}, function(error, result, code) {
						fs.stat(minFile, function(err, stats) {
							if(err) return callback(err);

							var minifiedSize = (stats.size / 1024).toFixed(2);
							var saved = 100 - Math.round((minifiedSize/originalSize) * 100);
							console.log('Created ' + minFile + ' minified size is ' +
								minifiedSize + 'Kb, saved ' + saved + '%')
							return callback(null, result);
						});
					});
				});
			});
		});

		console.log(tasks.length);

		grunt.utils.async.series(tasks, function(error, results) {
			console.log(results);
			done();
		});
	});
};
