var css = require("$css");
var loader = require("@loader");
var lessEngine = require("@less-engine");

exports.instantiate = css.instantiate;

var options = loader.lessOptions || {};

// default optimization value.
options.optimization |= lessEngine.optimization;

if(lessEngine.options) {
	lessEngine.options.async = true;
}


exports.translate = function(load) {
	var address = load.address.replace(/^file\:/,"");
	var useFileCache = true;

	var pathParts = (address+'').split('/');
	pathParts[pathParts.length - 1] = ''; // Remove filename

	if (typeof window !== 'undefined') {
		pathParts = (load.address+'').split('/');
		pathParts[pathParts.length - 1] = ''; // Remove filename
	}

	function renderLess() {
		var renderOptions = {
			filename: address,
			useFileCache: useFileCache
		};
		var pluginPromises = [];

		for (var prop in options){
			if( prop !== 'plugins') {
				renderOptions[prop] = options[prop];
			}
		}
		renderOptions.paths = (options.paths || []).concat(pathParts.join('/'));

		renderOptions.plugins = [];
		if(options.plugins) {
			options.plugins.forEach(function(plugin) {
				if(typeof plugin === 'string') {
					pluginPromises.push(loader.import(plugin).then(function(resolvedPlugin){
						renderOptions.plugins.push(resolvedPlugin);
					}));
				}
			});
		}
		if (stealLessPlugin !== undefined) {
			renderOptions.plugins.push(stealLessPlugin);
		}

		renderOptions.relativeUrls = options.relativeUrls === undefined ? true : options.relativeUrls;

		var done = function(output) {
			// Put the source map on metadata if one was created.
			load.metadata.map = output.map;
			load.metadata.includedDeps = output.imports || [];
			return output.css;
		};

		return Promise.all(pluginPromises).then(function(){
			return lessEngine.render(load.source, renderOptions).then(done);
		});

	}

	if(loader.liveReloadInstalled) {
		return loader["import"]("live-reload", { name: module.id })
		.then(function(reload){
			if(reload.isReloading()) {
				useFileCache = false;
			}
		})
		.then(renderLess, renderLess);
	}

	return renderLess();
};
exports.locateScheme = true;
exports.buildType = "css";

// plugin to rewrite locate:// paths in imports
var stealLessPlugin = undefined;
if (lessEngine.FileManager) {
	var FileManager = lessEngine.FileManager;

	function StealLessManager() {
		this.PATTERN = /locate:\/\/([a-z0-9/._@-]*)/ig;
	}

	StealLessManager.prototype = new FileManager();

	StealLessManager.prototype.supports = function(filename) {
		return true;
	};

	StealLessManager.prototype.locate = function(filename, currentDirectory) {
		return Promise.resolve(loader.normalize(filename, currentDirectory))
			.then(function(name){
				return loader.locate({name: name, metadata: {}});
			});
	};

	StealLessManager.prototype.parseFile = function(file) {
		var self = this;
		var promises = [];
		// collect locate promises
		file.contents.replace(self.PATTERN, function (whole, path, index) {
			promises.push(self.locate(path, file.filename.replace(loader.baseURL, '')).then(function(filename) {
				filename = filename.replace(/^file\:/,"");

				return {
					str: relative(file._directory, filename),
					loc: index,
					del: whole.length
				}
			}));
		});

		return Promise.all(promises).then(function(spliceDefs) {
			for(var i = spliceDefs.length; i--;) {
				var def = spliceDefs[i];
				file.contents = file.contents.slice(0, def.loc) + def.str + file.contents.slice(def.loc + def.del);
			}

			return file;
		});
	};

	StealLessManager.prototype.loadFile = function(filename, currentDirectory, options, environment, callback) {
		var self = this,
			_callback = callback,
			path = (currentDirectory + filename),
			directory = normalizePath(path.substring(0, path.lastIndexOf('/')+1)),
			promise;

		callback = function(err, file) {
			if (err) {
				return _callback.call(self, err);
			}

			file._directory = directory;

			self.parseFile(file).then(function(file) {
				_callback.call(self, null, file);
			});
		};

		promise = FileManager.prototype.loadFile.call(this, filename, currentDirectory, options, environment, callback);

		// when promise is returned we must wrap promise, when one is not, the wrapped callback is used
		if (promise && typeof promise.then == 'function') {
			return promise.then(function(file) {
				file._directory = directory;

				return self.parseFile(file);
			});
		}
	};

	stealLessPlugin = {
		install: function(less, pluginManager) {
			pluginManager.addFileManager(new StealLessManager());
		}
	};

	exports.StealLessManager = StealLessManager;
}

var normalizePath = function(path) {
	var parts = path.split('/'),
		normalized = [];

	for (var i = 0 ; i< parts.length; i++) {
		var part = parts[i];
		if (part != '.') { // ignore './'
			if (part == '..') { // remove part preceding '../'
				normalized.pop();
			} else {
				normalized.push(part);
			}
		}
	}
	return normalized.join('/');
};


var relative = function(base, path){
	var uriParts = path.split("/"),
		baseParts = base.split("/"),
		result = [];

	while ( uriParts.length && baseParts.length && uriParts[0] == baseParts[0] ) {
		uriParts.shift();
		baseParts.shift();
	}

	for (var i = 0 ; i < baseParts.length-1; i++) {
		result.push("../");
	}

	return result.join("") + uriParts.join("/");
};
