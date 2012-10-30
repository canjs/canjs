module.exports = function (grunt) {

	grunt.initConfig({
		lint : {
			files : ['can.js', 'model/model.js']
		},
		beautify : {
			dist : [
				'construct/**/*.js',
				'control/**/*.js',
				'model/**/*.js',
				'observe/**/*.js',
				'route/**/*.js',
				'test/**/*.js',
				'util/**/*.js'
			]
		},
		beautifier : {
			dist : {
				options : {
					indentSize : 1,
					indentChar : '\t'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-beautify');

	grunt.registerTask("default", "beautify");

	// Load external tasks
	// grunt.loadTasks("./build/tasks");
};
