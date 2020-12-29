var md5 = require('MD5');

/**
 * @function documentjs.generators.html.build.buildHash
 * @parent documentjs.generators.html.build.methods
 * 
 * Returns a unique hash for the options that control the build.
 * 
 * @signature `.build.buildHash(options)`
 * 
 * @param {{}} options Options that might change the characteristic of the build:
 * 
 * @option {Boolean} [minifyBuild=true] If set to `false` the build will not 
 * be minified. This behavior should be implemented by the "build" module.
 * 
 * @option {Boolean} [devBuild=false] If set to `true` the build will not be built
 * and copied in "development" mode.
 * 
 * @option {String} static The location of static content used to overwrite or
 * add to the default static content.
 * 
 * @option {String} [templates] The location of templates used to overwrite or
 * add to the default templates.
 * 
 * 
 * @return {String} a hash that represents this build.
 */
module.exports = function(options){
	var values = {};
	["minifyBuild","templates","static","devBuild"].forEach(function(key){
		if(key in options) {
			values[key] = options[key];
		}
	});
	
	return md5(JSON.stringify(values));
};
