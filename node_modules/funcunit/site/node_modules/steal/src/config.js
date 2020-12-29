	// Overwrites System.config with setter hooks
	var setterConfig = function(loader, configSpecial){
		var oldConfig = loader.config;

		loader.config =  function(cfg){

			var data = extend({},cfg);
			// check each special
			each(configSpecial, function(special, name){
				// if there is a setter and a value
				if(special.set && data[name]){
					// call the setter
					var res = special.set.call(loader,data[name], cfg);
					// if the setter returns a value
					if(res !== undefined) {
						// set that on the loader
						loader[name] = res;
					}
					// delete the property b/c setting is done
					delete data[name];
				}
			});
			oldConfig.call(this, data);
		};
	};

	var setIfNotPresent = function(obj, prop, value){
		if(!obj[prop]) {
			obj[prop] = value;
		}
	};

	// steal.js's default configuration values
	System.configMain = "@config";
	System.paths[System.configMain] = "stealconfig.js";
	System.env = (isWebWorker ? "worker" : "window") + "-development";
	System.ext = {
		css: '$css',
		less: '$less'
	};
	System.logLevel = 0;
	System.transpiler = "traceur";
	var cssBundlesNameGlob = "bundles/*.css",
		jsBundlesNameGlob = "bundles/*";
	setIfNotPresent(System.paths,cssBundlesNameGlob, "dist/bundles/*css");
	setIfNotPresent(System.paths,jsBundlesNameGlob, "dist/bundles/*.js");

	var configSetter = {
		set: function(val){
			var name = filename(val),
				root = dir(val);

			if(!isNode) {
				System.configPath = joinURIs( location.href, val);
			}
			System.configMain = name;
			System.paths[name] = name;
			addProductionBundles.call(this);
			this.config({ baseURL: (root === val ? "." : root) + "/" });
		}
	},
		mainSetter = {
			set: function(val){
				this.main = val;
				addProductionBundles.call(this);
			}
		};

	// checks if we're running in node, then prepends the "file:" protocol if we are
	var envPath = function(val) {
		if(isNode && !/^file:/.test(val)) {
			// If relative join with the current working directory
			if(val[0] === "." && (val[1] === "/" ||
								 (val[1] === "." && val[2] === "/"))) {
				val = require("path").join(process.cwd(), val);
			}
			if(!val) return val;

			return "file:" + val;
		}
		return val;
	};

	var fileSetter = function(prop) {
		return {
			set: function(val) {
				this[prop] = envPath(val);
			}
		};
	};

	var setToSystem = function(prop){
		return {
			set: function(val){
				if(typeof val === "object" && typeof steal.System[prop] === "object") {
					this[prop] = extend(this[prop] || {},val || {});
				} else {
					this[prop] = val;
				}
			}
		};
	};

	var pluginPart = function(name) {
		var bang = name.lastIndexOf("!");
		if(bang !== -1) {
			return name.substr(bang+1);
		}
	};
	var pluginResource = function(name){
		var bang = name.lastIndexOf("!");
		if(bang !== -1) {
			return name.substr(0, bang);
		}
	};

	var addProductionBundles = function(){
		if(this.loadBundles && this.main) {
			var main = this.main,
				bundlesDir = this.bundlesName || "bundles/",
				mainBundleName = bundlesDir+main;

			setIfNotPresent(this.meta, mainBundleName, {format:"amd"});

			// If the configMain has a plugin like package.json!npm,
			// plugin has to be defined prior to importing.
			var plugin = pluginPart(System.configMain);
			var bundle = [main, System.configMain];
			if(plugin){
				System.set(plugin, System.newModule({}));
			}
			plugin = pluginPart(main);
			if(plugin) {
				var resource = pluginResource(main);
				bundle.push(plugin);
				bundle.push(resource);

				mainBundleName = bundlesDir+resource.substr(0, resource.indexOf("."));
			}

			this.bundles[mainBundleName] = bundle;
		}
	};

	var setEnvsConfig = function(){
		if(this.envs) {
			var envConfig = this.envs[this.env];
			if(envConfig) {
				this.config(envConfig);
			}
		}
	};

	var setupLiveReload = function(){
		if(this.liveReloadInstalled) {
			var loader = this;
			this.import("live-reload", { name: "@@steal" }).then(function(reload){
				reload(loader.configMain, function(){
					setEnvsConfig.call(loader);
				});
			});
		}
	};

	var specialConfig;
	var envsSpecial = { map: true, paths: true, meta: true };
	setterConfig(System, specialConfig = {
		env: {
			set: function(val){
				this.env = val;

				if(this.isEnv("production")) {
					this.loadBundles = true;
				}

				addProductionBundles.call(this);
			}
		},
		envs: {
			set: function(val){
				// envs should be set, deep
				var envs = this.envs;
				if(!envs) envs = this.envs = {};
				each(val, function(cfg, name){
					var env = envs[name];
					if(!env) env = envs[name] = {};

					each(cfg, function(val, name){
						if(envsSpecial[name] && env[name]) {
							extend(env[name], val);
						} else {
							env[name] = val;
						}
					});

					//extend(env, cfg);
				});
			}
		},
		baseUrl: fileSetter("baseURL"),
		baseURL: fileSetter("baseURL"),
		root: fileSetter("baseURL"),  //backwards comp
		config: configSetter,
		configPath: configSetter,
		loadBundles: {
			set: function(val){
				this.loadBundles = val;
				addProductionBundles.call(this);
			}
		},
		startId: {
			set: function(val){
				mainSetter.set.call(this, normalize(val) );
			}
		},
		main: mainSetter,
		stealURL: {
			// http://domain.com/steal/steal.js?moduleName,env&
			set: function(url, cfg)	{
				System.stealURL = url;
				var urlParts = url.split("?");

				var path = urlParts.shift(),
					search = urlParts.join("?"),
					searchParts = search.split("&"),
					paths = path.split("/"),
					lastPart = paths.pop(),
					stealPath = paths.join("/"),
					platform = this.getPlatform() || (isWebWorker ? "worker" : "window");

				// if steal is bundled we always are in production environment
				if(this.stealBundled && this.stealBundled === true) {
					this.config({ env: platform+"-production" });

				}else{
					specialConfig.stealPath.set.call(this,stealPath, cfg);

					if (lastPart.indexOf("steal.production") > -1 && !cfg.env) {
						this.config({ env: platform+"-production" });
						addProductionBundles.call(this);
					}
				}

				if(searchParts.length && searchParts[0].length) {
					var searchConfig = {},
						searchPart;
					for(var i =0; i < searchParts.length; i++) {
						searchPart = searchParts[i];
						var paramParts = searchPart.split("=");
						if(paramParts.length > 1) {
							searchConfig[paramParts[0]] = paramParts.slice(1).join("=");
						} else {
							if(steal.dev) {
								steal.dev.warn("Please use search params like ?main=main&env=production");
							}
							var oldParamParts = searchPart.split(",");
							if (oldParamParts[0]) {
								searchConfig.startId = oldParamParts[0];
							}
							if (oldParamParts[1]) {
								searchConfig.env = oldParamParts[1];
							}
						}
					}
					this.config(searchConfig);
				}

				// Split on / to get rootUrl

			}
		},
		// this gets called with the __dirname steal is in
		stealPath: {
			set: function(dirname, cfg) {
				dirname = envPath(dirname);
				var parts = dirname.split("/");

				// steal keeps this around to make things easy no matter how you are using it.
				setIfNotPresent(this.paths,"@dev", dirname+"/ext/dev.js");
				setIfNotPresent(this.paths,"$css", dirname+"/ext/css.js");
				setIfNotPresent(this.paths,"$less", dirname+"/ext/less.js");
				setIfNotPresent(this.paths,"@less-engine", dirname+"/ext/less-engine.js");
				setIfNotPresent(this.paths,"npm", dirname+"/ext/npm.js");
				setIfNotPresent(this.paths,"npm-extension", dirname+"/ext/npm-extension.js");
				setIfNotPresent(this.paths,"npm-utils", dirname+"/ext/npm-utils.js");
				setIfNotPresent(this.paths,"npm-crawl", dirname+"/ext/npm-crawl.js");
				setIfNotPresent(this.paths,"npm-load", dirname+"/ext/npm-load.js");
				setIfNotPresent(this.paths,"npm-convert", dirname+"/ext/npm-convert.js");
				setIfNotPresent(this.paths,"semver", dirname+"/ext/semver.js");
				setIfNotPresent(this.paths,"bower", dirname+"/ext/bower.js");
				setIfNotPresent(this.paths,"live-reload", dirname+"/ext/live-reload.js");
				setIfNotPresent(this.paths,"steal-clone", dirname+"/ext/steal-clone.js");
				this.paths["traceur"] = dirname+"/ext/traceur.js";
				this.paths["traceur-runtime"] = dirname+"/ext/traceur-runtime.js";
				this.paths["babel"] = dirname+"/ext/babel.js";
				this.paths["babel-runtime"] = dirname+"/ext/babel-runtime.js";

				// steal-clone is contextual so it can override modules using relative paths
				this.setContextual('steal-clone', 'steal-clone');

				if(isNode) {
					System.register("@less-engine", [], false, function(){
						var r = require;
						return r('less');
					});

					if(this.configMain === "@config" && last(parts) === "steal") {
						parts.pop();
						if(last(parts) === "node_modules") {
							this.configMain = "package.json!npm";
							addProductionBundles.call(this);
							parts.pop();
						}
					}

				} else {
					setIfNotPresent(this.paths, "@less-engine", dirname + "/ext/less-engine.js");

					// make sure we don't set baseURL if something else is going to set it
					if(!cfg.root && !cfg.baseUrl && !cfg.baseURL && !cfg.config && !cfg.configPath) {
						if ( last(parts) === "steal" ) {
							parts.pop();
							if ( last(parts) === cfg.bowerPath || last(parts) === "bower_components" ) {
								System.configMain = "bower.json!bower";
								addProductionBundles.call(this);
								parts.pop();
							}
							if (last(parts) === "node_modules") {
								System.configMain = "package.json!npm";
								addProductionBundles.call(this);
								parts.pop();
							}
						}
						this.config({ baseURL: parts.join("/")+"/"});
					}
				}
				System.stealPath = dirname;
			}
		},
		// System.config does not like being passed arrays.
		bundle: {
			set: function(val){
				System.bundle = val;
			}
		},
		bundlesPath: {
			set: function(val){
				this.paths[cssBundlesNameGlob] = val+"/*css";
				this.paths[jsBundlesNameGlob]  = val+"/*.js";
				return val;
			}
		},
		instantiated: {
			set: function(val){
				var loader = this;

				each(val || {}, function(value, name){
					loader.set(name,  loader.newModule(value));
				});
			}
		},
		meta: {
			set: function(cfg){
				var loader = this;
				each(cfg || {}, function(value, name){
					if(typeof value !== "object") {
						return;
					}
					var cur = loader.meta[name];
					if(cur && cur.format === value.format) {
						// Keep the deps, if we have any
						var deps = value.deps;
						extend(value, cur);
						if(deps) {
							value.deps = deps;
						}
					}
				});
				extend(this.meta, cfg);
			}
		}
	});

	steal.config = function(cfg){
		if(typeof cfg === "string") {
			return System[cfg];
		} else {
			System.config(cfg);
		}
	};
