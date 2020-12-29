var buildTemplates = require("./templates"),
	getRenderer = require("./get_renderer"),
	getPartials = require("./get_partials"),
	path = require("path"),
	md5 = require("MD5"),
	Q = require("q"),
	buildHash = require("./build_hash");



/**
 * @function documentjs.generators.html.build.renderer
 * @parent documentjs.generators.html.build.methods
 * 
 * Creates a renderer function used to generate
 * the documentation.
 * 
 * @signature `.build.renderer(buildTemplatesPromise, options)`
 * 
 * Registers all `.mustache` files in the _documentjs/site/templates_ folder as 
 * partials and creates a [documentjs.generators.html.types.renderer renderer] function that
 * renders the `content.mustache` template within the `layout.mustache` template. 
 * 
 * @param {Promise<Handlebars>} buildTemplatesPromise The result of calling 
 * [documentjs.generators.html.build.templates]. Building the renderer
 * must happen after the templates have been copied over. Passing this 
 * argument enforces that.
 * 
 * @param {{}} options
 * 
 * Options used to configure the behavior of the renderer.
 * 
 * 
 * @return {Promise<documentjs.generators.html.types.renderer>} A promise that
 * resolves with the renderer function.
 */
module.exports = function(buildTemplatesPromise, options){
	// 1. Copies site/default/templates to site/templates
	// 2. Copies `options.templates` to site/templates
	return buildTemplatesPromise.then(function(Handlebars){
		// Creates a renderer function and adds partials to mustache
		var templatesPath = path.join('site/templates', buildHash(options) );
		return Q.all([
			getRenderer(templatesPath, Handlebars),
			getPartials(templatesPath, Handlebars)
		]).then(function(results){
			// returns the renderer
			return results[0];
		});
	});
};
	