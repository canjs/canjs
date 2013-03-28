var ejs = require('ejs');

module.exports = function(grunt) {
	var _ = grunt.util._;

	grunt.registerMultiTask('testify', 'Generates test runners for CanJS', function() {
		var done = this.async(),
		template = grunt.file.read(this.data.template),
		transform = this.data.transform,
		modules = this.data.builder.modules,
		configurations = this.data.builder.configurations;

		var keys = [],
		tests = [];

		if(transform && transform.modules) {
			modules = transform.modules(modules);
		};

		for(var m in modules) {
			keys.push(m);
		}

		for(var c in configurations) {
			var config = configurations[c],

			options = {
				configuration: config,
				modules: keys,
				tests: tests,
				root: this.data.root
			};

			_.extend(config.steal, {
				root: '../..'
			});

			if(transform && transform.options) {
				_.extend(options, transform.options.call(config, c));
			}

			var lib = ejs.render(template, options);

			grunt.log.writeln('Generating ' + this.data.out + c + '.html');
			grunt.file.write(this.data.out + c + '.html', lib);
		}

		done();
	});
};