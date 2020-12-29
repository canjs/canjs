var loader = require("@loader");
var steal = require("@steal");

// A simple emitter
function E () {
	// Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
	on: function (name, callback, ctx) {
		var e = this.e || (this.e = {});

		(e[name] || (e[name] = [])).push({
			fn: callback,
			ctx: ctx
		});

		return this;
	},

	once: function (name, callback, ctx) {
		var self = this;
		var fn = function () {
			self.off(name, fn);
			callback.apply(ctx, arguments);
		};

		return this.on(name, fn, ctx);
	},

	each: function(cb){
		var e = this.e || (this.e = {});
		for(var name in e) {
			cb(e[name], name);
		}
	},

	emit: function (name) {
		var data = [].slice.call(arguments, 1);
		var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
		var i = 0;
		var len = evtArr.length;

		for (i; i < len; i++) {
			evtArr[i].fn.apply(evtArr[i].ctx, data);
		}

		return this;
	},

	off: function (name, callback) {
		var e = this.e || (this.e = {});
		var evts = e[name];
		var liveEvents = [];

		if (evts && callback) {
			for (var i = 0, len = evts.length; i < len; i++) {
				if (evts[i].fn !== callback) liveEvents.push(evts[i]);
			}
		}

		(liveEvents.length)
			? e[name] = liveEvents
			: delete e[name];

		return this;
	}
};

function addLiveReload(loader) {
	if(loader._extensions) {
		loader._extensions.push(addLiveReload);
	}

	// This is a map of listeners, those who have registered reload callbacks.
	loader._liveListeners = {};
	loader.liveReloadInstalled = true;

	// Our instance
	loader._liveEmitter = new E();

	// Put a hook on `normalize` so we can keep a reverse map of modules to parents.
	// We'll use this to recursively reload modules.
	var normalize = loader.normalize;
	loader.normalize = function(identifier, parentName){
		var loader = this;
		var name = identifier;

		if(name === "live-reload") {
			name = "live-reload/" + parentName;
			if(!loader.has(name)) {
				loader.set(name, loader.newModule({
					default: makeReload(parentName),
					__useDefault: true
				}));
			}
			return name;
		}

		return normalize.apply(this, arguments);
	};

	function disposeModule(moduleName, emitter, inModList){
		var moduleList = inModList || {};

		var mod = loader.get(moduleName);
		if(mod) {
			moduleList[moduleName] = true;
			emitter.emit("!dispose/" + moduleName);
			loader.delete(moduleName);
			if(loader._liveListeners[moduleName]) {
				loader.delete("live-reload/" + moduleName);
				delete loader._liveListeners[moduleName];
			}
			return true;
		} else {
			// Delete it anyways to destroy extra state.
			loader.delete(moduleName);
		}
		return false;
	}

	// Teardown a module name by deleting it and all of its parent modules.
	function teardown(moduleName, e, inModuleNames) {
		var moduleNames = inModuleNames || {};

		if(disposeModule(moduleName, e, moduleNames)) {
			// Delete the module and call teardown on its parents as well.
			var parents = loader.getDependants(moduleName);

			for(var i = 0, len = parents.length; i < len; i++) {
				teardown(parents[i], e, moduleNames);
			}
		}

		return moduleNames;
	}

	function makeReload(moduleName, listeners){
		loader._liveListeners[moduleName] = true;
		var e = loader._liveEmitter;

		function reload(moduleName, callback){
			// 3 forms
			// reload(callback); -> after full cycle
			// reload("foo", callback); -> after "foo" is imported.
			// reload("*", callback); -> after each module imports.
			if(arguments.length === 2) {
				reload.on(moduleName, callback);
				setupUnbind(moduleName, callback);
				return;
			}
			reload.on("!cycleComplete", moduleName);
			setupUnbind("!cycleComplete", moduleName);
		}

		reload.isReloading = function(){
			return !!loader._inLiveReloadCycle;
		};
		reload.on = bind(e.on, e);
		reload.off = bind(e.off, e);
		reload.once = bind(e.once, e);

		// This allows modules to dispose themselves
		reload.dispose = function(disposingModuleName, cb){
			var name = disposingModuleName;
			var callback = cb;
			if(!callback) {
				callback = name;
				name = moduleName;
			}
			var event = "!dispose/" + name;
			reload.on(event, callback);
			setupUnbind(event, callback);
		};

		// This allows modules to dispose of other modules
		// This might be needed for cleanup.
		reload.disposeModule = function(name){
			disposeModule(name, e);
		};

		function setupUnbind(event, callback){
			e.once("!dispose/" + moduleName, function(){
				e.off(event, callback);
			});
		}

		return reload;
	}

	function bind(fn, ctx){
		return fn.bind ? fn.bind(ctx) : function(){
			return fn.apply(ctx, arguments);
		};
	}

	function getModuleNames(msg) {
		var names;
		try {
			names = JSON.parse(msg);
		} catch(ex) {
			names = [msg];
		}
		return names;
	}

	function reloadAll(msg) {
		var moduleNames = getModuleNames(msg);
		loader._inLiveReloadCycle = true;
		var promises = [];
		for(var i = 0, len = moduleNames.length; i < len; i++) {
			promises.push(reload(moduleNames[i]));
		}
		return Promise.all(promises)
		.then(function(){
			var e = loader._liveEmitter;
			loader._inLiveReloadCycle = false;
			e.emit("!cycleComplete");
		}, function(err){
			var error = err.originalErr || err;
			var e = loader._liveEmitter;
			loader._inLiveReloadCycle = false;
			e.emit("!cycleComplete", error);
		});
	}

	function reload(moduleName) {
		var e = loader._liveEmitter;
		var currentDeps = loader.getDependencies(moduleName) || [];

		// Call teardown to recursively delete all parents, then call `import` on the
		// top-level parents.
		var moduleNames = teardown(moduleName, e);

		var imports = [];
		function importModule(moduleName){
			return loader["import"](moduleName).then(function(val){
				e.emit(moduleName, val);
				e.emit("*", moduleName, val);
			});
		}

		for(var modName in moduleNames) {
			imports.push(importModule(modName));
		}
		// Once everything is imported call the global listener callback functions.
		return Promise.all(imports).then(function(){
			// Remove any newly orphaned modules before declaring the cycle complete.
			removeOrphans(moduleName, currentDeps);
		}, function(err){
			// There was an error re-importing modules
			// Workers don't have a location and no way to refresh the page.
			var canReload = loader.global.location && loader.global.location.reload;
			if(canReload && loader.liveReloadReload !== false) {
				loader.global.location.reload();
			} else {
				return Promise.reject(err);
			}
		});
	}

	function removeOrphans(moduleName, oldDeps){
		var deps = loader.getDependencies(moduleName) || [];

		var depName;
		for(var i = 0, len = oldDeps.length; i < len; i++) {
			depName = oldDeps[i];
			if(!~deps.indexOf(depName)) {
				var dependants = loader.getDependants(depName);
				// Only teardown if this is the only dependant module.
				if(dependants.length === 1) {
					disposeModule(depName, loader._liveEmitter);
				}
			}
		}
	}

	function setup(){
		if(loader.liveReload === "false" || loader.liveReload === false) {
			return;
		}
		// Save this so we can use it outside the zone
		var WS = WebSocket;

		var port = loader.liveReloadPort || 8012;

		var host = loader.liveReloadHost || window.document.location.host.replace(/:.*/, '');
		var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		var url = protocol + "//" + host + ":" + port;
		var ws = new WS(url);

		// Let the server know about the main module
		var onopen = ws.onopen = function(){
			ws.send(loader.main);
		};

		var onmessage = ws.onmessage = function(ev){
			var moduleName = ev.data;
			reloadAll(moduleName);
		};

		var attempts = typeof loader.liveReloadAttempts !== "undefined" ?
			loader.liveReloadAttempts - 1 : 0;
		var onclose = ws.onclose = function(ev){
			// 1006 means it was unable to connect to a server.
			if(ev.code === 1006 && attempts > 0) {
				attempts--;
				setTimeout(function(){
					ws = new WS(url);
					ws.open = onopen;
					ws.onmessage = onmessage;
					ws.onclose = onclose;
				}, loader.liveReloadRetryTimeout || 500);
			}
		};
	}

	var isBuildEnvironment = loader.isPlatform ?
		(loader.isPlatform("build") || loader.isEnv("build")) :
		(typeof window === "undefined");

	if(!isBuildEnvironment) {
		if(typeof steal !== "undefined") {
			steal.done().then(setup).then(null, Function.prototype);
		} else {
			setTimeout(setup);
		}

		module.exports = reloadAll;
	} else {
		var metaConfig = loader.meta["live-reload"];
		if(!metaConfig) {
			metaConfig = loader.meta["live-reload"] = {};
		}
		// For the build, translate to a noop.
		metaConfig.translate = function(load){
			load.metadata.format = "amd";
			return "def" + "ine([], function(){\n" +
				"return function(){};\n});";
		};
	}
}

addLiveReload(loader);
