var _ = require("lodash"),
	path = require("path"),
	fsx = require('../fs_extras'),
	getProjectName = require("./project_name"),
	slash = require("../slash");
/**
 * @function documentjs.configured.makeFinalDocConfig
 * @parent documentjs.configured.methods
 * 
 * @signature `.configured.makeFinalDocConfig(docConfig, project, parent, options)`
 * 
 * Cleans up the docConfig so all default values are added and the
 * versions and sites allowed by `options` are present.
 * 
 * @param {DocumentJS.docConfig} docConfig The docConfig that will be cleaned up.
 * 
 * @param {{}} project A [documentjs.configured.projectConfig] 
 * 
 *   @option {String} path The path of the project that contains this docConfig.
 *   
 *   @option {String} [simulatedPath]  Where the project appears to be installed if it is not being 
 *   copied to that location.  This is typically set autmatically when a command line
 *   overwrite is provided.
 * 
 * @param {{}} [parent] A [documentjs.configured.projectConfig] 
 * 
 *   @option {String} path The path of the parent project.
 * 
 *   @option {DocumentJS.docConfig} docConfig The project's docConfig.  It is used
 *   for its `.siteDefaults`.
 * 
 * @param {{}} options
 * 
 *   @option {Array<{name:String}>} [only] An array of the versions or sites that should
 *   be produced.
 * 
 *   @option {Boolean} [watch=false] If true, indicates that a filesystem watch will be setup
 *   and the documentation regenerated on changes.
 * 
 * @return {DocumentJS.docConfig} A cleaned copy of the first argument.
 */

var pathAdjustedProperties = ['templates','static','tags'];

module.exports = function finalizeDocConfig(docConfig, project, parent, options){
	// clean options
	options = options || {};
	
	// set defaults
	docConfig = _.extend({
		versionDest: "./<%= version %>/<%= name %>",
		defaultDest: "./<%= name %>",
		siteDefaults: {}
	}, docConfig);
	
	// allow a project to specify site behavior
	if(parent && parent.sites) {
		docConfig.sites = _.extend({}, parent.sites, docConfig.sites);
	}
	
	// adjust path values
	pathAdjustedProperties.forEach(function(prop){
		if(docConfig.siteDefaults[prop]) {
			docConfig.siteDefaults[prop] = fsx.smartJoin(project.path, docConfig.siteDefaults[prop]);
		}
	});
	
	// adjust sites by iterating through it and creating a new, more perfect, sites
	var sites = docConfig.sites || {};
	docConfig.sites = {};
	_.each(sites, function(siteConfig, name){

		// combine parent's siteDefaults, with current siteDefaults, and siteConfig
		siteConfig = _.extend({}, 
			parent && parent.docConfig.siteDefaults || {}, 
			docConfig.siteDefaults || {}, 
			siteConfig);
		
		// get the overwrite from the command options and set any overwrites
		var overwrite = _.findWhere(options.only||[],{name: name});
		
		// add this to be documented if options allows it
		if(!options.only || overwrite ){
			docConfig.sites[name] = siteConfig;
		} else {
			return;	
		}
		// the project could have a watch on it too
		if(project.watch) {
			siteConfig.watch = project.watch;
		}
		if(options.watch){
			siteConfig.watch = options.watch;
		}
		if(project.forceBuild || options.forceBuild) {
			siteConfig.forceBuild = true;
		}
		if(project.debug || options.debug) {
			siteConfig.debug = true;
		}
		
		// glob - an object that looks for all .js and .md files in the project path
		if(!siteConfig.glob) {
			siteConfig.glob = "**/*.{md,js}";
		}
		if(typeof siteConfig.glob === "string") {
			siteConfig.glob = { pattern: siteConfig.glob };
		}
		if(!siteConfig.glob.pattern) {
			siteConfig.glob.pattern = "**/*.{md,js}";
		}
		if(!("ignore" in siteConfig.glob)) {
			siteConfig.glob.ignore = "{node_modules,bower_components}/**/*";
		}
		// TODO: a 'smart' join so if a cwd like ./docs is given, it looks in [cwd]/docs
		if(!siteConfig.glob.cwd) {
			siteConfig.glob.cwd = project.path;
		}
		// dest - a sibling folder named with the siteConfig name
		if(!siteConfig.dest) {
			siteConfig.dest = path.join("..",name);
		}
		siteConfig.dest = fsx.smartJoin(project.simulatedPath || project.path, siteConfig.dest);
		
		// templates - template paths from the project
		if(siteConfig.templates) {
			siteConfig.templates = fsx.smartJoin(project.path, siteConfig.templates);
		}
		if(typeof siteConfig.tags === "string") {
			siteConfig.tags = fsx.smartJoin(project.path, siteConfig.tags);
		}
		if(siteConfig["static"]) {
			siteConfig["static"] = fsx.smartJoin(project.path, siteConfig["static"]);
		}
		
		// pageConfig - version of the project and a path to the docConfig
		siteConfig.pageConfig = _.extend(siteConfig.pageConfig||{},{
			docConfigDest:  slash( path.relative(siteConfig.dest, path.join(parent ? parent.path : project.path, "documentjs.json")) ),
			project: {
				version: project.version, 
				name: project.name,
				source: project.source
			}
		});
	});
	
	// adjust versions by iterating through it and creating a new, more perfect, versions
	var versions = docConfig.versions || {};
	docConfig.versions = {};
	_.each(versions, function(versionProject, versionName){
		
		if(typeof versionProject == "string") {
			versionProject = {source: versionProject};
		}
		if(!versionProject.name) {
			versionProject.name = getProjectName(versionProject.source);
		}
		
		var projectName = versionProject.name;
		
		// calculate the output location of the project
		var versionDest = _.template(docConfig.versionDest, {
			version: versionName,
			name: projectName
		}),
			defaultDest = _.template(docConfig.defaultDest, {
				version: versionName,
				name: projectName
			}),
			dest = fsx.smartJoin(
				project.path, 
				docConfig.defaultVersion == versionName ? 
					defaultDest : versionDest);
		
		versionProject = _.extend({
			version: versionName,
			path: dest
		},versionProject);
		
		var branchName = versionProject.source.split("#")[1];
		// get the overwrite from the command options and set any overwrite properties
		var overwrite = _.findWhere(options.only || [], {name: versionName}) || 
						_.findWhere(options.only || [], {name: branchName});
		if(overwrite) {
			if(overwrite.resource) {
				// we are going to read from the resource directly
				// but all paths should appear to come from simulatedPath
				versionProject.simulatedPath = versionProject.path;
				versionProject.path = overwrite.resource;
				versionProject.skipGet = true;
			}
		}
		
		if(options.watch){
			versionProject.watch = options.watch;
		}
		if(options.forceBuild){
			versionProject.forceBuild = true;
		}
		if(options.debug) {
			versionProject.debug = true;
		}
		
		// add this version to be built
		if(!options.only || overwrite ){
			docConfig.versions[versionName] = versionProject;
		} else {
			return;	
		}
		
		// relative name from 
		if(versionProject.source.indexOf("./") === 0) {
			versionProject.source = path.join(project.path, versionProject.source);
		}
		
	});
	return docConfig;
};