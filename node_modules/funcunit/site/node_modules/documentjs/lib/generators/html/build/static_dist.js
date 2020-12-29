var fss = require('../../../fs_extras.js'),
	Q = require('q'),
	path = require('path'),
	md5 = require('MD5'),
	promiseLock = require("../../../promise_lock");
	
var queue = promiseLock(),
	buildHash = require("./build_hash");

/**
 * @function documentjs.generators.html.build.staticDist
 * @parent documentjs.generators.html.build.methods
 * 
 * Builds a static distributable which will eventually be copied
 * to the `static` folder of the generated output.
 * 
 * @signature `.build.staticDist(options)`
 * 
 * Builds the static distributable with the following steps:
 * 
 * 1. Copies everything from _documentjs/site/default/static_ to 
 *    _documentjs/site/static/build_.
 * 2. Copies the path in `options.dest` to _documentjs/site/static/build_.
 * 3. `require`s the module at _documentjs/site/static/build/build.js_.
 * 4. Calls that "build" module function with the options and returns the result.
 * 
 * The "build" module is expected to build a minified distributable 
 * and copy the necessary contents to _documentjs/site/static/dist_ and
 * return a promise that resolves when complete.
 * 
 * @param {{}} options
 * 
 * @option {Boolean} [forceBuild=false] If set to `true`, rebuilds the 
 * static bundle even if it has already been built.
 * 
 * @option {String} dest The final destination ouput of the static
 * distributable.
 * 
 * @option {String} static The location of static content used to overwrite or
 * add to the default static content.
 * 
 * @option {Boolean} [minifyBuild=true] If set to `false` the build will not 
 * be minified. This behavior should be implemented by the "build" module.
 * 
 * @return {Promise} A promise that resolves if the static dist was successfully created.
 * 
 */
module.exports = function(options){
	// only run one build at a time.
	return queue(function(){
		var builtAlready;
		
		var hash = buildHash(options);
		
		var distFolder = path.join("site","static","dist", hash),
			buildFolder = path.join("site","static","build", hash);
		
		return Q.all([
			fss.mkdirs(distFolder),
			fss.mkdirs(buildFolder),
			fss.exists(path.join(distFolder,"bundles","static.css")).then(function(exists){
	
				// If we have already built, don't build again
				if(exists && !options.forceBuild) {
					builtAlready = true;
					if(options.debug) {
						console.log("BUILD: Using cache",distFolder);
					}
					
					return;
				}
	
				return fss.copy( path.join("site","default","static"),buildFolder).then(function(){
					if(options["static"]){
						return fss.copyFrom(options["static"], buildFolder);
					} 
				});
			})
		]).then(function(){
			if(builtAlready){
				return;
			}
			if(options.debug) {
				console.log("BUILD: Getting build module");
			}
			
			var build = require("../../../../site/static/build/"+hash+"/build.js");
			return build(options,{
				dist: distFolder,
				build: buildFolder
			});
		});
	});
	
	
};