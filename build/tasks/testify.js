// var path = require("path");
// var jsDir = path.join( __dirname, "../..");
var ejs = require('ejs');

module.exports = function(grunt) {
	grunt.registerMultiTask('testify', 'Generates test runners for CanJS', function() {
		var done = this.async(),
		template = grunt.file.read(__dirname + '/../templates/__configuration__.html.ejs'),
		_ = grunt.util._,

		modules = [],
		tests = [];

		for(var module in this.data.modules) {
			modules.push(module);

			var name = module.substr(module.lastIndexOf('/') + 1);
			if(!this.data.modules[module].skipTest) {
				tests.push(module + '/' + name + '_test.js');
			}
		}

		for(var c in this.data.configurations) {
			var config = this.data.configurations[c];

			_.extend(config.steal, {
				root: '../..'
			});

			if(c === 'jquery') {
				_.extend(config.steal.map['*'], {
					'jquery/jquery.js': 'can/lib/jquery.1.9.1.js'
				});

				_.extend(config.steal, {
					'shim': {
						'jquery': {
							'exports': 'jQuery'
						}
					}
				});
			}

			var lib = ejs.render(template, {
				configuration: config,
				modules: modules,
				tests: tests,
				root: '..'
			});

			grunt.file.write('test/' + c + '.html', lib);
		};

		done();
	});
};