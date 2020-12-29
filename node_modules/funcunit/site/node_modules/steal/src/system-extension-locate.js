// override loader.translate to rewrite 'locate://' & 'pkg://' path schemes found
// in resources loaded by supporting plugins

var addLocate = function(loader){
	/**
	 * @hide
	 * @function normalizeAndLocate
	 * @description Run a module identifier through Normalize and Locate hooks.
	 * @param {String} moduleName The module to run through normalize and locate.
	 * @return {Promise} A promise to resolve when the address is found.
	 */
	var normalizeAndLocate = function(moduleName, parentName){
		var loader = this;
		return Promise.resolve(loader.normalize(moduleName, parentName))
			.then(function(name){
				return loader.locate({name: name, metadata: {}});
			}).then(function(address){
				if(address.substr(address.length - 3) === ".js") {
					address = address.substr(0, address.length - 3);
				}
				return address;
			});
	};

	var relative = function(base, path){
		var uriParts = path.split("/"),
			baseParts = base.split("/"),
			result = [];

		while ( uriParts.length && baseParts.length && uriParts[0] == baseParts[0] ) {
			uriParts.shift();
			baseParts.shift();
		}

		for(var i = 0 ; i< baseParts.length-1; i++) {
			result.push("../");
		}

		return result.join("") + uriParts.join("/");
	};

	var schemePattern = /(locate):\/\/([a-z0-9/._@-]*)/ig,
		parsePathSchemes = function(source, parent) {
			var locations = [];
			source.replace(schemePattern, function(whole, scheme, path, index){
				locations.push({
					start: index,
					end: index+whole.length,
					name: path,
					postLocate: function(address){
						return relative(parent, address);
					}
				});
			});
			return locations;
		};

	var _translate = loader.translate;
	loader.translate = function(load){
		var loader = this;

		// This only applies to plugin resources.
		if(!load.metadata.plugin) {
			return _translate.call(this, load);
		}

		// Use the translator if this file path scheme is supported by the plugin
		var locateSupport = load.metadata.plugin.locateScheme;
		if(!locateSupport) {
			return _translate.call(this, load);
		}

		// Parse array of module names
		var locations = parsePathSchemes(load.source, load.address);

		// no locations found
		if(!locations.length) {
			return _translate.call(this, load);
		}

		// normalize and locate all of the modules found and then replace those instances in the source.
		var promises = [];
		for(var i = 0, len = locations.length; i < len; i++) {
			promises.push(
				normalizeAndLocate.call(this, locations[i].name, load.name)
			);
		}
		return Promise.all(promises).then(function(addresses){
			for(var i = locations.length - 1; i >= 0; i--) {
				load.source = load.source.substr(0, locations[i].start)
					+ locations[i].postLocate(addresses[i])
					+ load.source.substr(locations[i].end, load.source.length);
			}
			return _translate.call(loader, load);
		});
	};
};

if(typeof System !== "undefined") {
	addLocate(System);
}
