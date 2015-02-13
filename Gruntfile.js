/*global __dirname */
var path = require('path');

module.exports = function (grunt) {
	
	var _ = grunt.util._;
	var builderJSON = grunt.file.readJSON('builder.json');
	var pkg = grunt.file.readJSON('package.json');
	var banner = _.template(builderJSON.banner, {
		pkg: pkg,
		ids: [ 'CanJS default build' ],
		url: pkg.homepage
	});
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
		simplemocha: {
			builders: {
				src: ["test/builders/steal-tools/test.js","test/builders/browserify/test.js"]
			}
		},
		stealPluginify: require("./build/config_stealPluginify")(),
		meta: {
			defaults: require("./build/config_meta_defaults")(),
			modules: require("./build/config_meta_modules")
		},
		testee: {
			options: {
				timeout: 10000,
				// On Travis we want less output
				reporter: 'Dot'
			},
			steal: [
				'test/*.html',
				'!test/demos_and_tests.html',
				'!test/performance-loading.html',
				'!test/index.html'
			],
			amd: [ 'test/amd/*.html', '!test/amd/dojo.html' ],
			compatibility: [ 'test/compatibility/*.html' ],
			dev: [ 'test/dev/*.html' ],
			dist: [ 'test/dist/*.html' ],
			individuals: [
				'component/test.html',
				'compute/test.html',
				'construct/test.html',
				'construct/proxy/test.html',
				'construct/super/test.html',
				'control/test.html',
				'map/test.html',
				'map/lazy/test.html',
				'map/define/test.html',
				'map/attributes/test.html',
				'map/backup/test.html',
				'map/list/test.html',
				'map/setter/test.html',
				'map/sort/test.html',
				'map/validations/test.html',
				'model/test.html',
				'observe/test.html',
				'list/promise/test.html',
				'route/test.html',
				'route/pushstate/test.html',
				'view/test.html',
				'view/ejs/test.html',
				'view/mustache/test.html',
				'util/fixture/test.html'
			]
		}
	});
	grunt.registerTask('browserify-package', function(){
		var browser = {};
		require('./build/config_meta_modules').forEach(function(mod){
			browser[mod.moduleName.replace("can/","./")] = mod.moduleName.replace("can/","./dist/cjs/");
		});
		
		var cloned = _.clone(pkg, true);
		cloned.browser = browser;
		grunt.file.write("package.json", JSON.stringify(cloned, null, "\t"));
	});
	
	grunt.loadNpmTasks('grunt-contrib-connect');
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
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('testee');

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
		'string-replace:version'
	]);
	
	grunt.registerTask('test', ['jshint', 'build', 'testify', 'simplemocha', 'testee']);
	grunt.registerTask('test:compatibility', ['build', 'testify', 'testee:compatibility']);
	grunt.registerTask('test:steal', ['testee:steal']);
	grunt.registerTask('test:amd', ['build:amd', 'testify', 'testee:amd']);
};
