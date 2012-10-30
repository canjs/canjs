module.exports = function (grunt) {

	var outPaths = {
		edge : '<%= meta.out %>/edge/*.js',
		latest : '<%= meta.out %>/<%= pkg.version %>/*.js'
	};

	grunt.initConfig({
		pkg : '<json:package.json>',
		meta : {
			out : "dist/",
			buildFile : "can/build/dist.js",
			codestyle : {
				indentSize : 1,
				indentChar : "\t"
			},
			banner : '/*! <%= pkg.title || pkg.name %> - <%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		beautifier : {
			all : {
				options : '<config:meta.codestyle>'
			}
		},
		beautify : {
			all : [
				'construct/**/*.js',
				'control/**/*.js',
				'model/**/*.js',
				'observe/**/*.js',
				'route/**/*.js',
				'test/**/*.js',
				'util/**/*.js'
			]
		},
		build : {
			edge : {
				buildFile : '<config:meta.buildFile>',
				out : 'can/<%= meta.out %>'
			},
			latest : {
				buildFile : '<config:meta.buildFile>',
				version : '<%= pkg.version %>',
				out : 'can/<%= meta.out %>'
			}
		},
		strip : outPaths,
		docco : outPaths,
		closureCompiler : {
			// compilation_level: 'ADVANCED_OPTIMIZATIONS',
			// language_in: 'ECMASCRIPT5_STRICT'
		},
		minify : outPaths
	});

	grunt.loadNpmTasks('grunt-beautify');
	grunt.loadTasks("./build/tasks");

	grunt.registerTask("edge", "build:edge strip:edge minify:edge");
	grunt.registerTask("latest", "build:latest strip:latest minify:edge")
};
