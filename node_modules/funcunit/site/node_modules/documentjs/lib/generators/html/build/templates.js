var fsx = require('../../../fs_extras');
var	Q = require('q');
var md5 = require('MD5');
var path = require('path');
var promiseLock = require("../../../promise_lock");
var queue = promiseLock(),
	buildHash = require("./build_hash");

/**
 * @function documentjs.generators.html.build.templates
 * @parent documentjs.generators.html.build.methods
 * 
 * Creates a folder with all the templates used to generate
 * the documentation.
 * 
 * @signature `.build.templates(options)`
 * 
 * Builds the _documentjs/site/templates_ folder with the following
 * steps:
 * 
 * 1. Copies _documentjs/site/default/templates_ to _documentjs/site/templates_.
 * 2. Copies `options.templates` to _documentjs/site/templates_.
 * 
 * @param {{}} options
 * 
 * Options used to configure the behavior of the templates.
 * 
 * @option {Boolean} [forceBuild=false] If set to `true`, rebuilds the 
 * static bundle even if it has already been built.
 * 
 * @option {String} [templates] The location of templates used to overwrite or
 * add to the default templates.
 * 
 * @return {Promise} A promise that resolves if the static dist was successfully created.
 * 
 */
module.exports = function(options){
	
	return queue(function(){
	
		var hash = buildHash(options);
		var target = path.join("site","templates",hash);
		var makeTemplates = function(){
			return fsx.mkdirs(target).then(function(){
				return fsx.copy( path.join("site","default","templates"),target).then(function(){
					if(options["templates"]){
						if(options.debug) {
							console.log("BUILD: Copying templates from "+options["templates"]);
						}
						
						return fsx.copyFrom(options["templates"],target);
					}
				});
			});
		};
		
		// if forceBuild, copy all templates over again
		if(options.forceBuild) {
			return makeTemplates();
		} else {
			return fsx.exists(target).then(function(exists){
				if(exists) {
					if(options.debug) {
						console.log("BUILD: Using cache",target);
					}
				} else {
					return makeTemplates();
				}
			});
		}
	});
	
};

