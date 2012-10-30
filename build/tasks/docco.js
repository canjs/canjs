/**
 * Grunt Docco task. Based on https://github.com/DavidSouther/grunt-docco
 */
var docco = require('docco');

module.exports = function(grunt) {
	grunt.registerMultiTask('docco', 'Docco processor.', function() {
		var options = grunt.config(['docco', this.target]);
		grunt.verbose.writeflags(options, 'Options');

		var done = this.async();
		var src = grunt.file.expandFiles(this.file.src);

		docco.document(src, options.docco || {}, function(err, result, code){
			grunt.log.writeln("Doccoed [" + src.join(", ") + "]; " + err ? err : "(No errors)" + "\n" + result + " " + code);
			done();
		});
	});
}