module.exports = function (grunt) {

	var outPaths = {
		edge : '<%= meta.out %>/edge/**/*.js',
		latest : '<%= meta.out %>/<%= pkg.version %>/**/*.js'
	};

	grunt.initConfig({
		pkg : '<json:package.json>',
		meta : {
			out : "dist/",
			beautifier : {
				options : {
					indentSize : 1,
					indentChar : "\t"
				}
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
		docco : {
			edge : '<%= meta.out %>/edge/**/*!(.min).js',
			latest : '<%= meta.out %>/<%= pkg.version %>/**/*!(.min).js'
		},
		strip : outPaths,
		minify : outPaths
	});

	grunt.loadNpmTasks('grunt-beautify');
	grunt.loadTasks("./build/tasks");

	grunt.registerTask("edge", "build:edge build:edgePlugins strip:edge beautify:dist docco:edge");
	grunt.registerTask("latest", "build:latest build:latestPlugins strip:latest beautify:dist docco:latest")
};
