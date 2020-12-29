'use strict';

module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		simplemocha: {
			options: {
				timeout: 30000
			},
			app: {
				src: ['test/test.js']
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			lib: ['lib/**/*.js', 'tasks/**/*.js', 'Gruntfile.js']
		},
		release: {},
		"steal-build": {
			"test-webworker": {
				options: {
					system: {
						configMain: "@empty",
						main: "worker",
						baseUrl: __dirname + "/test/browser/webworker"
					},
					buildOptions: {
						bundleSteal: true,
						quiet: true
					}
				}
			}
		},
		testee: {
			tests: {
				options: {
					browsers: [ "firefox" ]
				},
				src: [ "test/browser/test.html" ]
			}
		}
	});

	grunt.registerTask('default', 'test');
	grunt.registerTask('test', [ 'jshint', 'simplemocha' ]);
	grunt.registerTask("test:browser", [ "steal-build", "testee" ]);

	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-release');
	grunt.loadNpmTasks('testee');
	grunt.loadTasks("tasks");
};
