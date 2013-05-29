module.exports = function (grunt) {

	var _ = grunt.util._;
	var shellOpts = {
		stdout: true,
		failOnError: true
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		builderJSON: grunt.file.readJSON('builder.json'),
		meta: {
			out: "dist/",
			beautifier: {
				options: {
					indentSize: 1,
					indentChar: "\t"
				},
				exclude: [/\.min\./, /qunit\.js/]
			}
		},
		testify: {
			libs: {
				template: 'test/templates/__configuration__.html.ejs',
				builder: '<%= builderJSON %>',
				root: '../',
				out: 'test/',
				transform: {
					options: function (config) {
						this.steal.map = (this.steal && this.steal.map) || {};
						this.steal.map['*'] = this.steal.map['*'] || {};
						this.steal.map['*']['can/'] = '';
						return this;
					}
				}
			},
			dist: {
				template: 'test/templates/__configuration__-dist.html.ejs',
				builder: '<%= builderJSON %>',
				root: '../../',
				out: 'test/dist/',
				transform: {
					'module': function (definition, name) {
						if (!definition.isDefault) {
							return definition.name.toLowerCase();
						}
						return null;
					},

					'test': function (definition, key) {
						var name = key.substr(key.lastIndexOf('/') + 1);
						var path = key.replace('can/', '') + '/';
						return path + name + '_test.js';
					},

					'options': function (config) {
						return {
							dist: 'can.' + config
						}
					}
				}
			},
			amd: {
				template: 'test/templates/__configuration__-amd.html.ejs',
				builder: '<%= builderJSON %>',
				root: '../..',
				out: 'test/amd/'
			}
		},
		builder: {
			options: {
				url: 'http://canjs.com',
				pluginify: {
					ignore: [ /\/lib\//, /util\/dojo-(.*?).js/ ]
				},
				pkg: "<%= pkg %>",
				builder: "<%= builderJSON %>",
				steal: {
					map: {
						'*': {
							'can/': ''
						}
					},
					root: __dirname
				}
			},
			dist: {
				options: {
					prefix: 'can.'
				},
				files: {
					'dist/': '.'
				}
			}
		},
		docco: {
			dist: {
				src: ['dist/*.js'],
				options: {
					output: 'dist/docs'
				}
			}
		},
		changelog: {
			log: {
				repo: 'canjs',
				user: 'bitovi',
				milestone: 7,
				version: '<%= pkg.version %>'
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			}
		},
		qunit: {
			all: {
				options: {
					urls: [
						'http://localhost:8000/test/dist/dojo.html',
						'http://localhost:8000/test/dist/jquery.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/dist/mootools.html',
						'http://localhost:8000/test/dist/yui.html',

						'http://localhost:8000/test/dojo.html',
						'http://localhost:8000/test/jquery.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/mootools.html',
						'http://localhost:8000/test/yui.html'
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('bitovi-tools');

	grunt.registerTask('build', ['builder', 'testify', 'docco']);
	grunt.registerTask('test', ['connect', 'builder', 'testify', 'qunit']);
};
