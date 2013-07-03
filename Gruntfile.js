var path = require('path');
// Returns mappings for AMDify
var getAmdifyMap = function(baseName) {
	var amdifyMap = {};

	amdifyMap[baseName + 'util'] = 'can/util/library';
	amdifyMap[baseName] = 'can/';
	amdifyMap['can/can'] = 'can';

	return amdifyMap;
}

module.exports = function (grunt) {

	var _ = grunt.util._;
	var baseName = path.basename(__dirname) + '/';
	var builderJSON = grunt.file.readJSON('builder.json');
	var pkg = grunt.file.readJSON('package.json');
	var banner = _.template(builderJSON.banner, {
		pkg: pkg,
		ids: [ 'CanJS default build' ],
		url: pkg.homepage
	});

	grunt.initConfig({
		pkg: pkg,
		testify: {
			libs: {
				template: 'test/templates/__configuration__.html.ejs',
				builder: builderJSON,
				root: '../',
				out: 'test/',
				transform: {
					options: function () {
						this.steal.map = (this.steal && this.steal.map) || {};
						this.steal.map['*'] = this.steal.map['*'] || {};
						this.steal.map['*']['can/'] = '';
						return this;
					}
				}
			},
			dist: {
				template: 'test/templates/__configuration__-dist.html.ejs',
				builder: builderJSON,
				root: '../../',
				out: 'test/dist/',
				transform: {
					module: function (definition) {
						if (!definition.isDefault) {
							return definition.name.toLowerCase();
						}
						return null;
					},

					test: function (definition, key) {
						var name = key.substr(key.lastIndexOf('/') + 1);
						var path = key.replace('can/', '') + '/';
						return path + name + '_test.js';
					},

					options: function (config) {
						return {
							dist: 'can.' + config
						}
					}
				}
			},
			amd: {
				template: 'test/templates/__configuration__-amd.html.ejs',
				builder: builderJSON,
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
				pkg: pkg,
				builder: builderJSON,
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
					root: '../',
					map: {
						'*': {
							'can/': baseName
						}
					}
				},
				map: getAmdifyMap(baseName),
				banner: banner
			},
			all: {
				options: {
					ids: ['can'].concat(_.map(
						_.keys(builderJSON.configurations), function(name) {
							return 'can/util/' + name;
						}), _.keys(builderJSON.modules))
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
				version: pkg.version
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
			steal: {
				options: {
					urls: [
						'http://localhost:8000/test/dojo.html',
						'http://localhost:8000/test/jquery.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/mootools.html',
						'http://localhost:8000/test/yui.html'
					]
				}
			},
			dist: {
				options: {
					urls: [
						'http://localhost:8000/test/dist/dojo.html',
						'http://localhost:8000/test/dist/jquery.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/dist/mootools.html',
						'http://localhost:8000/test/dist/yui.html'
					]
				}
			},
			amd: {
				options: {
					urls: [
						// TODO AMD & DOJO 'http://localhost:8000/test/amd/dojo.html',
						'http://localhost:8000/test/amd/jquery.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/amd/mootools.html',
						'http://localhost:8000/test/amd/yui.html'
					]
				}
			}
		},
		uglify: {
			options: {
				banner: banner
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
		},
		'string-replace': {
			version: {
				options: {
					replacements: [
						{
							pattern: /@EDGE/gim, //version property
							replacement: pkg.version
						}
					]
				},
				files: [
					{
						src: 'dist/**/*.js',
						dest: './',
						cwd: './'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('bitovi-tools');

	grunt.registerTask('build', ['builder', 'amdify', 'uglify', 'docco']);
	grunt.registerTask('test', ['connect', 'builder', 'amdify', 'testify', 'qunit']);
	grunt.registerTask('default', ['build']);

	// TODO possibly use grunt-release
	grunt.registerTask('release', ['build', 'string-replace', 'test']);
};
