var ejs = require('ejs');

module.exports = function(grunt) {
	var _ = grunt.util._;

	grunt.registerMultiTask('testify', 'Generates test runners for CanJS', function() {
		var done = this.async(),
		template = grunt.file.read(this.data.template),
		builder = this.data.builder;

		processors[this.target].call(this, done, builder, template);
	});

	var processors = {};

	processors.libs = function(done, builder, template) {
		var modules = [],
		tests = [];

		for(var module in builder.modules) {
			modules.push(module);

			var name = module.substr(module.lastIndexOf('/') + 1);
			if(!builder.modules[module].skipTest) {
				tests.push(module + '/' + name + '_test.js');
			}
		}

		for(var c in builder.configurations) {
			var config = builder.configurations[c];

			_.extend(config.steal, {
				root: '../..'
			});

			var lib = ejs.render(template, {
				configuration: config,
				modules: modules,
				tests: tests,
				root: this.data.root
			});

			grunt.log.writeln('Generating ' + this.data.out + c + '.html');
			grunt.file.write(this.data.out + c + '.html', lib);
		}

		done();
	};

	processors.dist = function(done, builder, template) {
		var plugins = [],
		tests = [];

		for(var module in builder.modules) {
			if(!builder.modules[module].isDefault) {
				plugins.push(module.replace(/\//g, '.'));
			}

			var name = module.substr(module.lastIndexOf('/') + 1);
			if(!builder.modules[module].skipTest) {
				tests.push(this.data.root + module.replace('can', '') + '/' + name + '_test.js');
			}
		}

		for(var c in builder.configurations) {
			var lib = ejs.render(template, {
				configuration: builder.configurations[c],
				dist: 'can.' + c,
				plugins: plugins,
				tests: tests,
				root: this.data.root,
			});

			grunt.log.writeln('Generating ' + this.data.out + c + '.html');
			grunt.file.write(this.data.out + c + '.html', lib);
		}

		done();
	};

	processors.amd = function(done, builder, template) {
		done();
	};
};