module.exports = function (grunt) {

	var _ = grunt.utils._;
	var excludes = [/\.min\./, /\/amd/, /qunit\.js/];
	var outFiles = {
		edge : '<%= meta.out %>/edge/**/*!(.min).js',
		latest : '<%= meta.out %>/<%= pkg.version %>/**/*.js',
		_options : {
			exclude : excludes
		}
	};

	grunt.initConfig({
		pkg : '<json:package.json>',
		meta : {
			out : "dist/",
			beautifier : {
				options : {
					indentSize : 1,
					indentChar : "\t"
				},
				exclude : [/\.min\./, /qunit\.js/]
			},
			banner : '/*! <%= pkg.title || pkg.name %> - <%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		beautifier : {
			codebase : '<config:meta.beautifier>',
			dist : '<config:meta.beautifier>'
		},
		beautify : {
			codebase : [
				'construct/**/*.js',
				'control/**/*.js',
				'model/**/*.js',
				'observe/**/*.js',
				'route/**/*.js',
				'test/**/*.js',
				'util/**/*.js'
			],
			dist : '<%= meta.out %>/**/*.js'
		},
		build : {
			edge : {
				src : "can/build/build.js",
				out : 'can/<%= meta.out %>'
			},
			edgePlugins : {
				src : "can/build/plugins.js",
				out : 'can/<%= meta.out %>'
			},
			latest : {
				src : "can/build/build.js",
				version : '<%= pkg.version %>',
				out : 'can/<%= meta.out %>'
			},
			latestPlugins : {
				src : "can/build/plugins.js",
				version : '<%= pkg.version %>',
				out : 'can/<%= meta.out %>'
			}
		},
		shell : {
			bundleLatest : {
				command : 'cd <%= meta.out %> && zip -r can.js.<%= pkg.version %>.zip <%= pkg.version %>/'
			},
			getGhPages : {
				command : 'git clone -b gh-pages <%= pkg.repository.url %> build/tmp'
			},
			copyLatest : {
				command : 'rm -rf build/tmp/release/<%= pkg.version %> && ' +
					'cp -R <%= meta.out %>/<%= pkg.version %> build/tmp/release/<%= pkg.version %> && ' +
					'rm -rf build/tmp/release/latest && ' +
					'cp -R <%= meta.out %>/<%= pkg.version %> build/tmp/release/latest'
			},
			updateGhPages : {
				command : 'cd build/tmp && git commit -a -m "Updating release" && git push origin'
			},
			cleanup : {
				command : 'rm -rf build/tmp'
			},
			_options : {
				stdout : true,
				failOnError : true
			}
		},
		docco : outFiles,
		strip : outFiles
	});

	grunt.loadTasks("./build/tasks");

	grunt.registerTask("edge", "build:edge build:edgePlugins strip:edge beautify:dist");
	grunt.registerTask("latest", "build:latest build:latestPlugins strip:latest beautify:dist docco:latest");
	grunt.registerTask("deploy", "shell:getGhPages shell:copyLatest shell:updateGhPages shell:cleanup");
};
