/**
 * Grunt Docco task.
 * Copyright (c) 2012 David Souther
 * Licensed under the MIT license.
 *
 * @see https://github.com/DavidSouther/grunt-docco
 */
var docco = require('docco');


// ### TASKS
grunt.registerMultiTask('docco', 'Docco processor.', function() {
	var options, tmp;

	tmp = grunt.config(['docco', this.target, 'options']);
	if (typeof tmp === 'object') {
		grunt.verbose.writeln('Using "' + this.target + '" Docco options.');
		options = tmp;
	} else {
		grunt.verbose.writeln('Using master Docco options.');
		options = grunt.config('jshint.options');
	}
	grunt.verbose.writeflags(options, 'Options');

	var done = this.async();
	var src = grunt.file.expandFiles(this.file.src);

	docco.document(src, options, function(err, result, code){
		grunt.log.writeln("Doccoed [" + src.join(", ") + "]; " + err ? err : "(No errors)" + "\n" + result + " " + code);
		done();
	});
});