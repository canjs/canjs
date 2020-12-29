var configured = require("../lib/configured/configured"),
	only = require("../lib/cmd/only");

module.exports = function(grunt) {
	var _ = grunt.util._;
	/**
	 * @function DocumentJS.apis.generate.grunt grunt
	 * @parent DocumentJS.apis.command-line
	 * 
	 * Run the DocumentJS Grunt task.
	 * 
	 * @signature `grunt documentjs[:NAME[@PATH]]`
	 * 
	 * Calls the configured grunt task.  
	 * 
	 * If no name or path is given, all
	 * versions and sites will be generated. 
	 * 
	 * If no `documentjs` task is configured, the grunt task will read from 
	 * a local _documentjs.json_.
	 * 
	 * @param {String} [NAME] The name of a version or site that this generation will
	 * be limited too.
	 * 
	 * @param {String} [PATH] The path to the location of a local repository to stand-in for the
	 * version specified by `name`.
	 * 
	 * @body
	 * 
	 * ## Examples
	 * 
	 * Given a `Gruntfile.js` like:
	 * 
	 * ```
	 * module.exports = function(grunt){
	 *   grunt.loadNpmTasks('documentjs');
	 *   grunt.initConfig({
	 *     documentjs: {
	 *       versions: {
	 *         "1.0" : "...",
	 *         "1.1" : "...",
	 *         "2.0" : "..."
	 *       },
	 *       sites: {
	 *         "pages" : { ... }  
	 *       },
	 *       ...
	 *     }
	 *   });
	 * };
	 * ```
	 * 
	 * Generate all versions and sites like:
	 * 
	 *     > grunt documentjs
	 * 
	 * Generate the "pages" site like:
	 * 
	 *     > grunt documentjs:pages
	 * 
	 * Generate the 1.0 docs like:
	 * 
	 *     > grunt documentjs:1.0
	 * 
	 * Generate the 1.0 docs from a local project like:
	 * 
	 *     > grunt documentjs:1.0@../local
	 */
	grunt.registerTask('documentjs', 'Generates documentation', function() {
		var done = this.async();
		var options = {};
		if(arguments.length) {
			options.only = only([].slice.call(arguments));
		}
		var project = {
			path: process.cwd()
		},
			docConfig = grunt.config.getRaw(this.name);
			
		if(docConfig) {
			project.docConfig = docConfig;
		}
		configured.generateProject(project, undefined, options)
			.then(done,function(err){
				console.log(err);
				done(err);
			});
		
	});
};