var glob = require("glob"),
	_ = require("lodash"),
	minimatch = require("minimatch");

/**
 * @function documentjs.find.files
 * 
 * @parent documentjs.find.methods
 * 
 * @signature `.find.files(options)`
 * 
 * @param {Object} options Options that configure the behavior of the
 * files that will be processed.  
 * 
 * @option {String|documentjs.find.globObject} glob The glob
 * option either specifies a [minmatch](https://github.com/isaacs/minimatch) 
 * pattern like:
 * 
 *     documentjs.find.files({glob: "*.js"})
 * 
 * Or a [documentjs.find.globObject GlobObject] that specifies the 
 * a [minmatch](https://github.com/isaacs/minimatch) pattern and
 * other options like:
 * 
 *     documentjs.find.files({
 *       glob: {
 *         pattern: "*.js",
 *         cwd: __dirname  
 *       }
 *     })
 * 
 * @return {documentjs.process.types.FileEventEmitter} An event emitter that
 * emits events for matched files.
 */
module.exports = function(options){
	var pattern;
	var globOptions;
	
	if(typeof options.glob === "string"){
		var pattern = options.glob;
		globOptions = {};
	} else {
		pattern = options.glob.pattern;
		globOptions = _.extend({}, options.glob);
		delete globOptions.pattern;
	}

	var glb = new glob.Glob(pattern, globOptions);
	var ignore = options.glob.ignore;
	
	if(typeof ignore === "string") {
		ignore = [ignore];
	}
	if(ignore) {
		// weave in ignore behavior
		var oldOn = glb.on;
		glb.on = function(event, listener) {
			if(event === "match") {
				var handler = function(filepath){
					for(var i = 0; i < ignore.length; i++) {
						if( minimatch(filepath, ignore[i]) ) {
							return;
						}
					}
					listener.apply(this, arguments);
				};
				
				return oldOn.call(this, event, handler);
			} else {
				return oldOn.apply(this, arguments);
			}
		};
	}

	
	return glb;
};