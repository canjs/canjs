module.exports = function (grunt) {

	var _ = grunt.util._;
	var shellOpts = {
		stdout: true,
		failOnError: true
	};

	grunt.initConfig({
		info: grunt.file.readJSON('package.json'),
		builder: grunt.file.readJSON('builder.json'),
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
				builder: '<%= builder %>',
				root: '../',
				out: 'test/',
				transform: {
					options: function(config) {
						this.steal.map = (this.steal && this.steal.map) || {};
						this.steal.map['*'] = this.steal.map['*'] || {};
						this.steal.map['*']['can/'] = '';
						return this;
					}
				}
			},
			dist: {
				template: 'test/templates/__configuration__-dist.html.ejs',
				builder: '<%= builder %>',
				root: '../..',
				out: 'test/build/',
				transform: {
					'module': function(definition, name) {
						if(!definition.isDefault) {
							return name.replace(/\//g, '.');
						}
						return null;
					},

					'test': function(definition, key) {
						var name = key.substr(key.lastIndexOf('/') + 1);
						var path = key.replace('can/', '') + '/';
						return path + name + '_test.js';
					},

					'options': function(config) {
						return {
							dist: 'can.' + config
						}
					}
				}
			},
			amd: {
				template: 'test/templates/__configuration__-amd.html.ejs',
				builder: '<%= builder %>',
				root: '../..',
				out: 'test/amd/'
			}
		},
		beautifier: {
			codebase: '<%= meta.beautifier %>',
			dist: '<%= meta.beautifier %>'
		},
		beautify: {
			codebase: [
				'construct/**/*.js',
				'control/**/*.js',
				'model/**/*.js',
				'observe/**/*.js',
				'route/**/*.js',
				'test/**/*.js',
				'util/**/*.js'
			],
			dist: '<%= meta.out %>/**/*.js'
		},
		build: {
			edge: {
				src: "can/build/build.js",
				out: 'can/<%= meta.out %>'
			},
			edgePlugins: {
				src: "can/build/plugins.js",
				out: 'can/<%= meta.out %>'
			},
			latest: {
				src: "can/build/build.js",
				version: '<%= info.version %>',
				out: 'can/<%= meta.out %>'
			},
			latestPlugins: {
				src: "can/build/plugins.js",
				version: '<%= info.version %>',
				out: 'can/<%= meta.out %>'
			}
		},
		shell: {
			bundleLatest: {
				command: 'cd <%= meta.out %> && zip -r can.js.<%= info.version %>.zip <%= info.version %>/',
				options: shellOpts
			},

			getGhPages: {
				command: 'git clone -b gh-pages <%= info.repository.url %> build/gh-pages',
				options: shellOpts
			},

			copyLatest: {
				command: 'rm -rf build/gh-pages/release/<%= info.version %> && ' +
					'cp -R <%= meta.out %>/<%= info.version %> build/gh-pages/release/<%= info.version %> && ' +
					'cp <%= meta.out %>/can.js.<%= info.version %>.zip build/gh-pages/downloads &&' +
					'rm -rf build/gh-pages/release/latest && ' +
					'cp -R <%= meta.out %>/<%= info.version %> build/gh-pages/release/latest',
				options: shellOpts
			},

			copyEdge: {
				command: 'rm -rf build/gh-pages/release/edge && ' +
					'cp -R <%= meta.out %>/edge build/gh-pages/release/edge',
				options: shellOpts
			},

			updateGhPages: {
				command: 'cd build/gh-pages && git add . --all && ' +
					'git commit -m "Updating release (latest: <%= info.version %>)" && ' +
					'git push origin',
				options: shellOpts
			},
			cleanup: {
				command: 'rm -rf build/gh-pages',
				options: shellOpts
			}
		},
		docco: {
			edge: {
				files: '<%= meta.out %>/edge/**/*.js',
				docco: {
					output: '<%= meta.out %>/edge/docs'
				}
			},
			latest: {
				files: '<%= meta.out %>/<%= info.version %>/**/*.js',
				docco: {
					output: '<%= meta.out %>/<%= info.version %>/docs'
				}
			},
			options: {
				exclude: [/\.min\./, /amd\//, /qunit\.js/]
			}
		},
		'string-replace': {
			latest: {
				files: [
					{
						src: '<%= meta.out %>/<%= info.version %>/**/*.js',
						dest: './',
						cwd: './',
						filter: function (filepath) {
							return !/\.min/.test(filepath);
						}
					}
				]
			},
			edge: {
				files: [
					{
						src: '<%= meta.out %>/edge/**/*.js',
						dest: './',
						cwd: './',
						filter: function (filepath) {
							return !/\.min/.test(filepath);
						}
					}
				]
			},
			options: {
				replacements: [
					{
						pattern: /\/\*([\s\S]*?)\*\//gim, // multiline comments
						replacement: ''
					},
					{
						pattern: /\/\/(\s*)\n/gim,
						replacement: ''
					},
					{
						pattern: /;[\s]*;/gim, // double ;;
						replacement: ';'
					},
					{
						pattern: /(\/\/.*)\n[\s]*;/gi,
						replacement: '$1'
					},
					{
						pattern: /(\n){3,}/gim, //single new lines
						replacement: '\n\n'
					}
				]
			}
		},
		bannerize: {
			latest: {
				files: '<%= meta.out %>/<%= info.version %>/**/*.js',
				banner: '<%= meta.banner %>'
			},
			edge: {
				files: '<%= meta.out %>/edge/**/*.js',
				banner: '<%= meta.banner %>'
			}
		},
		changelog: {
			log: {
				repo: 'canjs',
				user: 'bitovi',
				milestone: 6,
				version: '<%= info.version %>'
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
						'http://localhost:8000/test/dojo.html',
						'http://localhost:8000/test/jquery.html',
						// 'http://localhost:8000/can/test/zepto.html',
						'http://localhost:8000/test/mootools.html',
						'http://localhost:8000/test/yui.html'
					]
				}
			}
		}
	});

	grunt.loadTasks("../build/tasks");

	grunt.loadNpmTasks('testify');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('test', ['connect', 'qunit']);

	grunt.registerTask('edge', ['build:edge', 'build:edgePlugins', 'string-replace:edge', 'beautify:dist', 'bannerize:edge', 'docco:edge']);
	grunt.registerTask('latest', ['build:latest', 'build:latestPlugins', 'string-replace:latest', 'beautify:dist', 'bannerize:latest', 'docco:latest']);
	grunt.registerTask('ghpages', ['shell:cleanup', 'shell:getGhPages', 'shell:copyLatest', 'shell:updateGhPages', 'shell:cleanup']);
	grunt.registerTask('deploy', ['latest', 'shell:bundleLatest', 'ghpages']);

};
