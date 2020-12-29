/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
function amd(loader) {
  // by default we only enforce AMD noConflict mode in Node
  var isNode = typeof module != 'undefined' && module.exports;

  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/g;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  var cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])";
  var cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)";

  var fnBracketRegEx = /\(([^\)]*)\)/;

  var wsRegEx = /^\s+|\s+$/g;

  var requireRegExs = {};

  function getCJSDeps(source, requireIndex) {

    // remove comments
    source = source.replace(commentRegEx, '');

    // determine the require alias
    var params = source.match(fnBracketRegEx);
    var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');

    // find or generate the regex for this requireAlias
    var requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, 'g'));

    requireRegEx.lastIndex = 0;

    var deps = [];

    var match;
    while (match = requireRegEx.exec(source))
      deps.push(match[2] || match[3]);

    return deps;
  }

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
  */
  function require(names, callback, errback, referer) {
    // 'this' is bound to the loader
    var loader = this;

    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (names instanceof Array)
      Promise.all(names.map(function(name) {
        return loader['import'](name, referer);
      })).then(function(modules) {
        if(callback) {
          callback.apply(null, modules);
        }
      }, errback);

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw new TypeError('Invalid require');
  };
  loader.amdRequire = require;

  function makeRequire(parentName, staticRequire, loader) {
    return function(names, callback, errback) {
      if (typeof names == 'string')
        return staticRequire(names);
      return require.call(loader, names, callback, errback, { name: parentName });
    }
  }

  // run once per loader
  function generateDefine(loader) {
    // script injection mode calls this function synchronously on load
    var onScriptLoad = loader.onScriptLoad;
    loader.onScriptLoad = function(load) {
      onScriptLoad(load);
      if (anonDefine || defineBundle) {
        load.metadata.format = 'defined';
        load.metadata.registered = true;
      }

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    };

    function define(name, deps, factory) {
      if (typeof name != 'string') {
        factory = deps;
        deps = name;
        name = null;
      }
      if (!(deps instanceof Array)) {
        factory = deps;
        deps = ['require', 'exports', 'module'];
      }

      if (typeof factory != 'function')
        factory = (function(factory) {
          return function() { return factory; };
        })(factory);

      // in IE8, a trailing comma becomes a trailing undefined entry
      if (deps[deps.length - 1] === undefined)
        deps.pop();

      // remove system dependencies
      var requireIndex, exportsIndex, moduleIndex;

      if ((requireIndex = indexOf.call(deps, 'require')) != -1) {

        deps.splice(requireIndex, 1);

        var factoryText = factory.toString();

        deps = deps.concat(getCJSDeps(factoryText, requireIndex));
      }


      if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
        deps.splice(exportsIndex, 1);

      if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
        deps.splice(moduleIndex, 1);

      var define = {
        deps: deps,
        execute: function(require, exports, module) {

          var depValues = [];
          for (var i = 0; i < deps.length; i++)
            depValues.push(require(deps[i]));

          module.uri = loader.baseURL + module.id;

          module.config = function() {};

          // add back in system dependencies
          if (moduleIndex != -1)
            depValues.splice(moduleIndex, 0, module);

          if (exportsIndex != -1)
            depValues.splice(exportsIndex, 0, exports);

          if (requireIndex != -1)
            depValues.splice(requireIndex, 0, makeRequire(module.id, require, loader));

          var output = factory.apply(global, depValues);

          if (typeof output == 'undefined' && module)
            output = module.exports;

          if (typeof output != 'undefined')
            return output;
        }
      };

      // anonymous define
      if (!name) {
        // already defined anonymously -> throw
        if (anonDefine)
			throw new TypeError('Multiple defines for anonymous module');
        anonDefine = define;
      }
      // named define
      else {
        // if it has no dependencies and we don't have any other
        // defines, then let this be an anonymous define
        if (deps.length == 0 && !anonDefine && !defineBundle)
          anonDefine = define;

        // otherwise its a bundle only
        else
          anonDefine = null;

        // the above is just to support single modules of the form:
        // define('jquery')
        // still loading anonymously
        // because it is done widely enough to be useful

        // note this is now a bundle
        defineBundle = true;

        // define the module through the register registry
        loader.register(name, define.deps, false, define.execute);
      }
    };
    define.amd = {};
    loader.amdDefine = define;
  }

  var anonDefine;
  // set to true if the current module turns out to be a named define bundle
  var defineBundle;
  var anonClosureDepth = Infinity;

  var oldModule, oldExports, oldDefine;

  // adds define as a global (potentially just temporarily)
  function createDefine(loader) {
    if (!loader.amdDefine)
      generateDefine(loader);

    anonDefine = null;
    defineBundle = null;

    // ensure no NodeJS environment detection
    var global = loader.global;

    oldModule = global.module;
    oldExports = global.exports;
    oldDefine = global.define;

    global.module = undefined;
    global.exports = undefined;

    if (global.define && global.define === loader.amdDefine)
      return;

    global.define = loader.amdDefine;
  }

  function removeDefine(loader) {
    var global = loader.global;
    global.define = oldDefine;
    global.module = oldModule;
    global.exports = oldExports;
  }

  // generateDefine(loader);

  if (loader.scriptLoader) {
    var loaderFetch = loader.fetch;
    loader.fetch = function(load) {
      createDefine(this);
      return loaderFetch.call(this, load);
    };
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    if (load.metadata.format == 'amd-parse' || !load.metadata.format && load.source.match(amdRegEx)) {
      load.metadata.format = 'amd-parse';

      if (loader.execute !== false) {
        processSource(loader, load);

        if (!anonDefine && !defineBundle && !isNode)
          throw new TypeError('AMD module ' + load.name + ' did not define');
      }

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    }

    return loaderInstantiate.call(loader, load);
  };


  // ============================ NEW CODE =============================
	var indexOf = [].indexOf;

	// processes the source and supplies
	function processSource(loader, load) {
		var executed = false;
		var executedDefs = [];
	    anonDefine = null;
    	defineBundle = null;


		// only executes the source once for all defines.
		// tracks the factories
		// this is so execute can be done later
		var getExecutedDefs = function(index){
			if(!executed) {
				var global = loader.global,
					oldModule = global.module,
					oldExports = global.exports,
					oldDefine = global.define;

				global.module = undefined;
    			global.exports = undefined;

				loader.global.define = function(){
					executedDefs.push(cleanDefineArgs.apply(null, arguments));
				};
				loader.global.define.amd = {};
				loader.__exec(load);
				executed = true;
				removeDefine(loader);
			}

			return executedDefs[index];
		};

		getDefs(load.source, function(def, index, requireIndex, exportsIndex, moduleIndex){

			def.execute = function(require, exports, module) {
				var deps = def.deps;
				var depValues = [];
				for (var i = 0; i < deps.length; i++)
					depValues.push(require(deps[i]));

				module.uri = loader.baseURL + module.id;

				module.config = function() {};

				// add back in system dependencies
				if (moduleIndex != -1)
					depValues.splice(moduleIndex, 0, module);

				if (exportsIndex != -1)
					depValues.splice(exportsIndex, 0, exports);

				if (requireIndex != -1)
					depValues.splice(requireIndex, 0, makeRequire(module.id, require, loader));

				var output = getExecutedDefs(index).factory.apply(global, depValues);

				if (typeof output == 'undefined' && module)
					output = module.exports;

				if (typeof output != 'undefined') {
					return output;
				}
			};

			// anonymous define
			if (!def.name) {
				// already defined anonymously -> throw
				if (anonDefine) {
					if(def.closureDepth > anonClosureDepth) {
						return;
					}
				}
				anonClosureDepth = def.closureDepth;
				anonDefine = def;
			} else {
				// if it has no dependencies and we don't have any other
				// defines, then let this be an anonymous define
				if (def.deps.length == 0 && !anonDefine && !defineBundle)
					anonDefine = def;

				// otherwise its a bundle only
				else
					anonDefine = null;

				// the above is just to support single modules of the form:
				// define('jquery')
				// still loading anonymously
				// because it is done widely enough to be useful

				// note this is now a bundle
				defineBundle = true;

				// define the module through the register registry
				loader.register(def.name, def.deps, false, def.execute);
			}
		});
	}

	function makeClosureCounter(source) {
		var idx = 0,
			depth = 0,
			char = '';

		return function(untilIdx){
			while(idx < untilIdx) {
				char = source[idx];

				if(char === "{") {
					depth++;
				} else if(char === "}") {
					depth--;
				}

				idx++;
			}

			return depth;
		}
	}

	function cleanDefineArgs(name, deps, factory){
		// Clean up arguments
		if (typeof name != 'string') {
			factory = deps;
			deps = name;
			name = null;
		}
		if (!(deps instanceof Array)) {
			factory = deps;
			deps = ['require', 'exports', 'module'];
		}

		if (typeof factory != 'function') {
			factory = (function(factory) {
				return function() { return factory; }
			})(factory);
		}

		// in IE8, a trailing comma becomes a trailing undefined entry
		if (deps[deps.length - 1] === undefined)
			deps.pop();

		return {name: name, deps: deps, factory: factory};
	}

	function getDefs(source, cb) {
		amdRegEx.lastIndex = 0;
		var res,
			define,
			count = 0,
			closures = makeClosureCounter(source);

		while(res = amdRegEx.exec(source)) {
			// 1 is always the name
			var name = trimStr( res[1] ),
				// 2 is either an array of deps, or the start of the definition
				deps = getArgs( res[2] );

			if (!(deps instanceof Array)) {
				deps = ['require', 'exports', 'module'];
			}

			var requireIndex, exportsIndex, moduleIndex;

			if((requireIndex = deps.indexOf("require")) >= 0 ) {
				var factoryText = getFactoryText(source, res, amdRegEx.lastIndex);

				deps.splice(requireIndex, 1);
				if(factoryText) {
					deps = deps.concat(getCJSDeps(factoryText, requireIndex));
				}
			}

			if ((exportsIndex = deps.indexOf('exports')) != -1)
				deps.splice(exportsIndex, 1);

			if ((moduleIndex = deps.indexOf('module')) != -1)
				deps.splice(moduleIndex, 1);

			var closureDepth = closures(res.index);

			cb({
				deps: deps,
				name: name,
				closureDepth: closureDepth
			}, count++, requireIndex, exportsIndex, moduleIndex);
		}
	}


  	function trimStr(str){
		if(str) {
  			var parts = str.match(/["']([^"']+)["']/);
  			return parts && parts[1];
  		}
	}
	function getArgs(str) {
		if(!str) {
			return;
		}
		if(str.charAt(0) != "[" && str.charAt(str.length - 1) != "]") {
			return;
		}
		var args = [];
		str.replace(/["']([^"']+)["']/g, function(whole, name){
			args.push(name);
		});
		return args;
	}
	function getFactoryText(source, lastMatches, lastIndex) {
		// the start of the define
		var index = source.indexOf("(",lastIndex - lastMatches[0].length)+1;
		// start walking {   } and ()
		var openParens = 1,
			openBrackets = 0,
			firstBracket,
			lastBracket;

		while(openParens && index < source.length) {
			var ch = source.charAt(index);
			if(ch === "}") {
				if(openBrackets === 1) {
					lastBracket= index;
				}
				openBrackets--;
			}
			if(ch === "{") {
				if(!firstBracket && openBrackets === 0) {
					firstBracket = index;
				}
				openBrackets++;
			}
			if(ch === ")") {
				openParens--;
			}
			if(ch === "(") {
				openParens++;
			}
			index++;
		}


		// we are looking for start of args ( ... we might want to include function
		var startArgs = source.indexOf("(", lastIndex);
		var startBody = source.indexOf("{", lastIndex);
		if(!firstBracket || firstBracket != startBody) {
			// it is probably a define({})
			return null;
		}
		var openBrackets = 1;
		var index = startBody + 1;
		// start counting {} until we have found corresponding }

		return source.substring(startArgs, lastBracket+1);
	}

	return {
		processSource: processSource,
		getCJSDeps: getCJSDeps,
		getDefs: getDefs
	};

}

module.exports = amd;
