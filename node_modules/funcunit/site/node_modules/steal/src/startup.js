	var getScriptOptions = function () {

		var options = {},
			parts, src, query, startFile, env,
			scripts = document.getElementsByTagName("script");

		var script = stealScript || getStealScript();

		if (script) {
			options.stealURL = script.src;
			// Split on question mark to get query

			each(script.attributes, function(attr){
				var optionName =
					camelize( attr.nodeName.indexOf("data-") === 0 ?
						attr.nodeName.replace("data-","") :
						attr.nodeName );
				options[optionName] = (attr.value === "") ? true : attr.value;
			});

			var source = script.innerHTML;
			if(/\S/.test(source)){
				options.mainSource = source;
			}
		}

		return options;
	};

	steal.startup = function(config){

		// Get options from the script tag
		if (isWebWorker) {
			var urlOptions = {
				stealURL: location.href
			};
		} else if(isBrowserWithWindow || isNW) {
			var urlOptions = getScriptOptions();
		} else {
			// or the only option is where steal is.
			var urlOptions = {
				stealPath: __dirname
			};
		}

		// first set the config that is set with a steal object
		if(config){
			System.config(config);
		}

		// B: DO THINGS WITH OPTIONS
		// CALCULATE CURRENT LOCATION OF THINGS ...
		System.config(urlOptions);


		setEnvsConfig.call(this.System);

		// Read the env now because we can't overwrite everything yet

		// immediate steals we do
		var steals = [];

		// we only load things with force = true
		if ( System.loadBundles ) {

			if(!System.main && System.isEnv("production") && !System.stealBundled) {
				// prevent this warning from being removed by Uglify
				var warn = console && console.warn || function() {};
				warn.call(console, "Attribute 'main' is required in production environment. Please add it to the script tag.");
			}

			configDeferred = System["import"](System.configMain);

			appDeferred = configDeferred.then(function(cfg){
				setEnvsConfig.call(System);
				return System.main ? System["import"](System.main) : cfg;
			});

		} else {
			configDeferred = System["import"](System.configMain);

			devDeferred = configDeferred.then(function(){
				setEnvsConfig.call(System);
				setupLiveReload.call(System);

				// If a configuration was passed to startup we'll use that to overwrite
				// what was loaded in stealconfig.js
				// This means we call it twice, but that's ok
				if(config) {
					System.config(config);
				}

				return System["import"]("@dev");
			},function(e){
				console.log("steal - error loading @config.",e);
				return steal.System["import"]("@dev");
			});

			appDeferred = devDeferred.then(function(){
				// if there's a main, get it, otherwise, we are just loading
				// the config.
				if(!System.main || System.env === "build") {
					return configDeferred;
				}
				var main = System.main;
				if(typeof main === "string") {
					main = [main];
				}
				return Promise.all( map(main,function(main){
					return System["import"](main);
				}) );
			});

		}

		if(System.mainSource) {
			appDeferred = appDeferred.then(function(){
				return System.module(System.mainSource);
			});
		}
		return appDeferred;
	};
	steal.done = function(){
		return appDeferred;
	};
