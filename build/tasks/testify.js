// var path = require("path");
// var jsDir = path.join( __dirname, "../..");
var ejs = require('ejs');

module.exports = function(grunt) {
	grunt.registerMultiTask('testify', 'Generates test runners for CanJS', function() {
		var done = this.async(),
		template = grunt.file.read(__dirname + '/../templates/__configuration__.html.ejs'),

		modules = [],
		tests = [];

		for(var module in this.data.modules) {
			modules.push(module);

			var name = module.substr(module.lastIndexOf('/') + 1);
			tests.push(module + '/' + name + '_test.js');
		}

		var lib = ejs.render(template, {
			configuration: this.data.configurations['jquery'],
			modules: modules,
			tests: tests,
			root: '..'
		});

		grunt.file.write('test/jquery.html', lib);

		done();
		// var lib = ejs.render(template, {
		// 	configuration: {
		// 		name: 'jQuery',
		// 		steal: {
		// 			"map": {
		// 				"*": {
		// 					"can/util/util.js": "can/util/jquery/jquery.js"
		// 				}
		// 			}
		// 		}
		// 	},
		// 	modules: ['can/construct'],
		// 	tests: ['can/construct/construct_test.js']
		// });
	});
};