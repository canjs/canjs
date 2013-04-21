module.exports = function (grunt) {

	var _ = grunt.util._;
	var shellOpts = {
		stdout: true,
		failOnError: true
	};
	var fileFilter = function () {
		var excludes = _.toArray(arguments);
		return function (file) {
			return !_.some(excludes, function (exclude) {
				return exclude.test(file);
			});
		}
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			out: "dist/",
			beautifier: {
				options: {
					indentSize: 1,
					indentChar: "\t"
				},
				exclude: [/\.min\./, /qunit\.js/]
			},
			banner: '/*!\n* <%= pkg.title || pkg.name %> - <%= pkg.version %> ' +
				'(<%= grunt.template.today("yyyy-mm-dd") %>)\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
				'* Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n*/\n'
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
				version: '<%= pkg.version %>',
				out: 'can/<%= meta.out %>'
			},
			latestPlugins: {
				src: "can/build/plugins.js",
				version: '<%= pkg.version %>',
				out: 'can/<%= meta.out %>'
			}
		},
		shell: {
			bundleLatest: {
				command: 'cd <%= meta.out %> && zip -r can.js.<%= pkg.version %>.zip <%= pkg.version %>/',
				options: shellOpts
			},

			getGhPages: {
				command: 'git clone -b gh-pages <%= pkg.repository.url %> build/gh-pages',
				options: shellOpts
			},

			copyLatest: {
				command: 'rm -rf build/gh-pages/release/<%= pkg.version %> && ' +
					'cp -R <%= meta.out %>/<%= pkg.version %> build/gh-pages/release/<%= pkg.version %> && ' +
					'cp <%= meta.out %>/can.js.<%= pkg.version %>.zip build/gh-pages/downloads &&' +
					'rm -rf build/gh-pages/release/latest && ' +
					'cp -R <%= meta.out %>/<%= pkg.version %> build/gh-pages/release/latest',
				options: shellOpts
			},

			copyEdge: {
				command: 'rm -rf build/gh-pages/release/edge && ' +
					'cp -R <%= meta.out %>/edge build/gh-pages/release/edge',
				options: shellOpts
			},

			updateGhPages: {
				command: 'cd build/gh-pages && git add . --all && ' +
					'git commit -m "Updating release (latest: <%= pkg.version %>)" && ' +
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
				files: '<%= meta.out %>/<%= pkg.version %>/**/*.js',
				docco: {
					output: '<%= meta.out %>/<%= pkg.version %>/docs'
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
						src: '<%= meta.out %>/<%= pkg.version %>/**/*.js',
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
				files: '<%= meta.out %>/<%= pkg.version %>/**/*.js',
				banner: '<%= meta.banner %>'
			},
			edge: {
				files: '<%= meta.out %>/edge/**/*.js',
				banner: '<%= meta.banner %>'
			}
		},
		updateversion: {
			latest: {
				files: '<%= meta.out %>/<%= pkg.version %>/**/*.js',
				symbol: /@VERSION/g,
				version: '<%= pkg.version %>'
			},
			edge: {
				files: '<%= meta.out %>/edge/**/*.js',
				symbol: /@VERSION/g,
				version: '<%= pkg.version %> (edge)'
			}
		},
		changelog: {
			log: {
				repo: 'canjs',
				user: 'bitovi',
				milestone: 6,
				version: '<%= pkg.version %>'
			}
		}
	});

	grunt.loadTasks("../build/tasks");

	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('edge', ['build:edge', 'build:edgePlugins', 'string-replace:edge', 'beautify:dist', 'bannerize:edge', 'updateversion:edge', 'docco:edge']);
	grunt.registerTask('latest', ['build:latest', 'build:latestPlugins', 'string-replace:latest', 'beautify:dist', 'bannerize:latest', 'updateversion:latest', 'docco:latest']);
	grunt.registerTask('ghpages', ['shell:cleanup', 'shell:getGhPages', 'shell:copyLatest', 'shell:updateGhPages', 'shell:cleanup']);
	grunt.registerTask('deploy', ['latest', 'shell:bundleLatest', 'ghpages']);

};
