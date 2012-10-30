module.exports = function (grunt) {

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
		stripcomments : {
			edge : {
				files : '<%= meta.out %>/edge/*.js'
			},
			latest : {
				files : '<%= meta.out %>/<%= pkg.version %>/*.js'
			}
		},
		docco : {
			edge : {
				files : '<%= meta.out %>/edge/*.js'
			},
			latest : {
				files : '<%= meta.out %>/<%= pkg.version %>/*.js'
			}
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
		}
	});

	grunt.loadNpmTasks('grunt-beautify');
	grunt.loadTasks("./build/tasks");

	grunt.registerTask("edge", "build:edge stripcomments:edge");
	grunt.registerTask("latest", "build:latest stripcomments:latest")
};
