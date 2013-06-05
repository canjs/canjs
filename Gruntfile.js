module.exports = function (grunt) {

	var _ = grunt.util._;
	var builderJSON = grunt.file.readJSON('builder.json');
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		builderJSON: builderJSON,
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
		amdify: {
			options: {
				steal: {
					root: '../'
				},
				map: {
					'can/util': 'can/util/library'
				}
			},
			all: {
				options: {
					ids: ['can'].concat(_.keys(grunt.file.readJSON('builder.json').modules))
				},
				files: {
					'dist/amd/': '.'
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
		},
		uglify: {
			options: {
				banner: _.template(builderJSON.banner, {
					pkg: pkg,
					ids: [ 'CanJS default build' ],
					url: pkg.homepage
				})
			},
			all: {
				files: {
					'dist/can.jquery.min.js': 'dist/can.jquery.js',
					'dist/can.zepto.min.js': 'dist/can.zepto.js',
					'dist/can.mootools.min.js': 'dist/can.mootools.js',
					'dist/can.dojo.min.js': 'dist/can.dojo.js',
					'dist/can.yui.min.js': 'dist/can.yui.js'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('bitovi-tools');

	grunt.registerTask('build', ['builder', 'testify', 'amdify', 'uglify', 'docco']);
	grunt.registerTask('test', ['connect', 'builder', 'testify', 'qunit']);
};
