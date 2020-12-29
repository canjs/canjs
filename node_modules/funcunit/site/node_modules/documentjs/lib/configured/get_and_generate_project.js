var _ = require("lodash"),
	getProject = require("./get_project");

var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	readFile = Q.denodeify(fs.readFile),
	generate = require("../generate/generate");


/**
 * @function documentjs.configured.getAndGenerateProject
 * @parent documentjs.configured.methods
 * 
 * Gets a resource with a version name and copys it to a location, and documents it.
 * 
 * @param {{}} project
 * 
 * @option {String} path
 * 
 * @param {Object} parent
 */
module.exports = function(project, parent){
	
	// get version and put it in place
	return getProject(project, path.dirname(project.path ) ).then(function(){
		
		// get the config file
		return require("./generate_project")(project, parent);
	});
};

