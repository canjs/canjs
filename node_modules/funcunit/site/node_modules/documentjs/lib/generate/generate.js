var Q = require('q');
var findFiles = require("../find/files"),
	process = require("../process/process"),
	promiseQueue = require("../promise_queue"),
	_ = require("lodash"), 
	minimatch = require("minimatch"),
	fs = require("fs"),
	chokidar = require("chokidar"),
	path = require("path");
	

var moduleMap = {
	"html": "../generators/html/html"
};

/**
 * @function documentjs.generate generate
 * @parent DocumentJS.apis.internal
 * 
 * @signature `.generate(options)`
 * 
 * Generates documenation using specified generators.
 * 
 * @param {Object} options
 * 
 * Options that configure the [documentjs.find.files files] 
 * processed, how they are [documentjs.process procssed], and
 * how the output is generated.
 * 
 * @option {moduleName|Array<moduleName>} [generators]
 * 
 * Generators specifies a generator module or array of modules used to create an 
 * output for documentation. The default generator is "html" which maps
 * to documentjs's internal [documentjs.generators.html html generator].
 * 
 * You can specify other modules which will be passed a promise containing
 * the [documentjs.process.docMap docMap] and the `options` and be expected
 * to return a promise that resolves when they are complete.
 * 
 * @option {Boolean} [watch=false] If true, regenerates all generators when 
 * a file matched  by `options.glob` is changed.
 * 
 * @return {Promise} A promise that resolves when the documentation
 * has been successfully created.
 * 
 * @body
 * 
 * ## Use
 */
function generateOne(options){
	var fileEventEmitter = findFiles(options),
		docMapPromise = process.fileEventEmitter(fileEventEmitter, options);
	
	if(!options.generators) {
		options.generators = "html";
	}
	if(typeof options.generators === "string") {
		options.generators = [options.generators];
	}
	var functions = options.generators.map(function(moduleName){
		moduleName = moduleMap[moduleName] || moduleName;
		var generator = require(moduleName);
		return function(){
			if(typeof generator.generate === "function" ) {
				return generator.generate(docMapPromise, options);
			} else {
				return generator(docMapPromise, options);
			}
			
		};
	});
	
	return promiseQueue(functions);

}



function generateAndWatch(options){
	if(!options.watch) {
		return generateOne(options);
	} else {
		var original = options,
			copy = _.cloneDeep(options),
			scheduledRegeneration = false;
			
		var promise = generateOne(copy);
		
		var pattern = [options.glob.pattern];
		if(options.glob.ignore) {
			pattern.push("!"+options.glob.ignore);
		}
		var chokidarOptions = _.omit(options.glob,"pattern");

		var regenerate = function(event, filepath){
			
			// check if we haven't already re-scheduled this generate
			if(!scheduledRegeneration) {
				
				// Try to abort the existing project
				copy.isAborted = function(){
					throw new Error("Aborted by filesystem chagne");
				};
				// this should only be done with one project
				
				// wait for existing to finish or abort
				scheduledRegeneration = true;
				promise.then(function(){
					scheduledRegeneration = false;
					promise = generateOne(  _.cloneDeep(options) );
				}, function(){
					scheduledRegeneration = false;
					promise = generateOne(  _.cloneDeep(options) );
				});

			}
		
		};

		chokidar.watch(pattern, chokidarOptions).on('all', regenerate);
		
		if(options.templates) {
			chokidar.watch(path.join(options.templates,'*.{js,mustache}'), chokidarOptions)
				.on('all', regenerate);
		}
		if(options['static']) {
			chokidar.watch(path.join(options['static'],'**/*'), chokidarOptions)
				.on('all', regenerate);
		}
		

		return promise;
		
	}
	
}

module.exports = generateAndWatch;