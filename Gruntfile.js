/*global __dirname */
var path = require('path');
// Returns mappings for AMDify
var getAmdifyMap = function (baseName) {
	var amdifyMap = {};

	amdifyMap[baseName + 'util'] = 'can/util/library';
	amdifyMap[baseName] = 'can/';
	amdifyMap['can/can'] = 'can';

	return amdifyMap;
};

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
	var amdIds = ['can'].concat(_.map(_.keys(builderJSON.configurations), function (name) {
		return 'can/util/' + name;
	}), _.keys(builderJSON.modules));
	var testifyDist = {
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
				var out = path + name + '_test.js';
				return out;
			},

			options: function (config) {
				return {
					dist: 'can.' + config
				};
			}
		}
	};

	grunt.registerTask('publish', 'Publish a a release (patch, minor, major).', function () {
		var type = this.args[0];

		if (['patch', 'minor', 'major'].indexOf(type) === -1) {
			throw new Error(type + ' is not a valid release version bump (patch, minor, major)');
		}

		grunt.task.run(['release:bump:' + type, 'changelog', 'shell:updateChangelog',
			'release:add:commit:push:tag:pushTags']);
	});

	grunt.initConfig({
		pkg: pkg,
		testify: {
			libs: {
				template: 'test/templates/__configuration__.html.ejs',
				builder: builderJSON,
				out: 'test/'
			},
			dist: testifyDist,
			dev: _.extend({}, testifyDist, {
				template: 'test/templates/__configuration__-dev.html.ejs',
				out: 'test/dev/'
			}),
			amd: {
				template: 'test/templates/__configuration__-amd.html.ejs',
				builder: builderJSON,
				root: '../..',
				out: 'test/amd/'
			},
			compatibility: {
				template: 'test/templates/__configuration__-compat.html.ejs',
				builder: builderJSON,
				root: '../../',
				out: 'test/compatibility/',
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
							pluginified: ['2.0.5'],
							dist: 'can.' + config
						};
					}
				}
			}
		},
		changelog: {
			options: {
				repo: 'canjs',
				user: 'bitovi',
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
			options: {
				timeout: 10000
			},
			steal: {
				options: {
					timeout: 10000,
					urls: [
						'http://localhost:8000/test/jquery.html',
						'http://localhost:8000/test/jquery-2.html',
						'http://localhost:8000/test/dojo.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/mootools.html',
						'http://localhost:8000/test/yui.html'
					]
				}
			},
			dist: {
				options: {
					timeout: 10000,
					urls: [
						'http://localhost:8000/test/dist/jquery.html',
						'http://localhost:8000/test/dist/jquery-2.html',
						'http://localhost:8000/test/dist/dojo.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/dist/mootools.html',
						'http://localhost:8000/test/dist/yui.html'
					]
				}
			},
			dev: {
				options: {
					urls: [
						'http://localhost:8000/test/dev/dojo.html',
						'http://localhost:8000/test/dev/jquery.html',
						'http://localhost:8000/test/dev/jquery-2.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/dev/mootools.html',
						'http://localhost:8000/test/dev/yui.html'
					]
				}
			},
			compatibility: {
				options: {
					timeout: 10000,
					urls: [
						'http://localhost:8000/test/compatibility/jquery.html',
						'http://localhost:8000/test/compatibility/jquery-2.html',
						'http://localhost:8000/test/compatibility/dojo.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/compatibility/mootools.html',
						'http://localhost:8000/test/compatibility/yui.html'
					]
				}
			},
			amd: {
				options: {
					timeout: 10000,
					urls: [
						// TODO AMD & DOJO 'http://localhost:8000/test/amd/dojo.html',
						'http://localhost:8000/test/amd/jquery.html',
						'http://localhost:8000/test/amd/jquery-2.html',
						//'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/amd/mootools.html',
						'http://localhost:8000/test/amd/yui.html'
					]
				}
			},
			individuals: {
				options: {
					timeout: 10000,
					urls: [
						'http://localhost:8000/component/test.html',
						'http://localhost:8000/compute/test.html',
						'http://localhost:8000/construct/test.html',
						'http://localhost:8000/construct/proxy/test.html',
						'http://localhost:8000/construct/super/test.html',
						'http://localhost:8000/control/test.html',
						'http://localhost:8000/map/test.html',
						'http://localhost:8000/map/lazy/test.html',
						// 'http://localhost:8000/map/define/test.html',
						'http://localhost:8000/map/attributes/test.html',
						'http://localhost:8000/map/backup/test.html',
						// 'http://localhost:8000/map/delegate/test.html',
						'http://localhost:8000/map/list/test.html',
						'http://localhost:8000/map/setter/test.html',
						'http://localhost:8000/map/sort/test.html',
						'http://localhost:8000/map/validations/test.html',
						'http://localhost:8000/model/test.html',
						'http://localhost:8000/observe/test.html',
						'http://localhost:8000/list/promise/test.html',
						// 'http://localhost:8000/route/test.html',
						'http://localhost:8000/route/pushstate/test.html',
						'http://localhost:8000/view/test.html',
						'http://localhost:8000/view/ejs/test.html',
						'http://localhost:8000/view/mustache/test.html',
						'http://localhost:8000/util/fixture/test.html'
					]
				}
			}
		},
		// Removes the dist folder
		clean: {
			build: ['dist/']
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
		},
		shell: {
			updateChangelog: {
				command: 'git add changelog.md && git commit -m "Updating changelog." && git push origin'
			}
		},
		release: {
			options: {
				tagName: 'v<%= version %>'
			}
		},
		publish: {},
		jshint: {
			options: {
				jshintrc: true
			},
			lib: [
				'component/**/*.js', 'compute/**/*.js', 'construct/**/*.js', 'control/**/*.js', 'list/**/*.js',
				'map/**/*.js', 'model/**/*.js', 'observe/**/*.js','route/**/*.js', 'util/**/*.js','view/**/*.js',
				'!util/dojo/dojo-1.8.1.js', '!util/dojo/nodelist-traverse.js'
			]
		},
		jsbeautifier: {
			files: '<%= jshint.lib %>',
			options: {
				config: ".jsbeautifyrc"
			}
		},
		docco: {
			options: {
				dst: 'docco/',
				layout : 'parallel',
				css : 'resources/docco.css'
			},
			docs: {
				files : [
					{
						src : [
							'component/**/*.js', 'compute/**/*.js', 'construct/**/*.js', 'control/**/*.js', 'list/**/*.js',
							'map/**/*.js', 'model/**/*.js', 'observe/**/*.js','route/**/*.js', 'util/**/*.js','view/**/*.js',
							'!util/dojo/dojo-1.8.1.js', '!util/dojo/nodelist-traverse.js','!**/*_test.js'
						],
						expand : true
					}
				]
			}
		},
		plato: {
			src : {
				options : {
					jshint : grunt.file.readJSON('.jshintrc'),
					title : "CanJS Source",
					exclude : /bower_components\|dist\|docs\|guides\|lib\|node_modules\|src\|examples\|dojo\-\|demos/
				},
				files: {
					'plato/src': '<%= docco.dev.src %>'
				}
			},
			tests : {
				options : {
					jshint : grunt.file.readJSON('.jshintrc'),
					title : "CanJS Tests",
					exclude : /node_modules/
				},
				files: {
					'plato/tests': '**/*_test.js'
				}
			}

		},
		stealPluginify: require("./build/config_stealPluginify")(),
		meta: {
			defaults: require("./build/config_meta_defaults")(),
			modules: require("./build/config_meta_modules")
		}
	});

	
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-release-steps');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('bitovi-tools');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.loadNpmTasks('grunt-docco2');
	grunt.loadNpmTasks('grunt-plato');
	grunt.loadNpmTasks('steal-tools');


	grunt.registerTask('default', ['build']);
	
	grunt.registerTask('build', ['clean:build', 'stealPluginify', 'string-replace:version']);
	grunt.registerTask('build:amd',[
		'clean:build',
		'stealPluginify:amd',
		'stealPluginify:amd-util-jquery',
		'stealPluginify:amd-util-dojo',
		'stealPluginify:amd-util-yui',
		'stealPluginify:amd-util-zepto',
		'stealPluginify:amd-util-mootools',
		'string-replace:version']);
	
	grunt.registerTask('test:compatibility', ['connect', 'build', 'testify', 'qunit:compatibility']);
	// <%= pkg.version %>
	grunt.registerTask('test', ['jshint', 'connect', 'build', 'testify', 'qunit']);
	
	grunt.registerTask('test:steal', ['connect', 'qunit:steal']);
	grunt.registerTask('test:amd', ['connect',  'build:amd','testify','qunit:amd']);
};
