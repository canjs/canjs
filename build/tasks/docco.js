/**
 * Grunt Docco task. Based on https://github.com/DavidSouther/grunt-docco
 */
var docco = require('docco');

module.exports = function(grunt) {
	grunt.registerMultiTask('docco', 'Docco processor.', function() {
		var _ = grunt.utils._;
		var options = grunt.config(['docco', this.target]);
		var defaults = _.extend({
			exclude : [/\.min\./]
		}, grunt.config('strip')._options);
		grunt.verbose.writeflags(options, 'Options');
		var done = this.async();
		var src = grunt.file.expandFiles(this.file.src).filter(function(file) {
			for(var i = 0; i < defaults.exclude.length; i++) {
				if(defaults.exclude[i].test(file)) {
					return false;
				}
			}
			return true;
		});

		docco.document(src, options.docco || {}, function(err, result, code){
			grunt.log.writeln("Doccoed [" + src.join(", ") + "]; " + err ? err : "(No errors)" + "\n" + result + " " + code);
			done();
		});
	});
}