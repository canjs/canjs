	// System.ext = {bar: "path/to/bar"}
	// foo.bar! -> foo.bar!path/to/bar
	var addExt = function(loader) {
		if (loader._extensions) {
			loader._extensions.push(addExt);
		}

		loader.ext = {};

		var normalize = loader.normalize,
			endingExtension = /\.(\w+)!?$/;

		loader.normalize = function(name, parentName, parentAddress, pluginNormalize){
			if(pluginNormalize) {
				return normalize.apply(this, arguments);
			}

			var matches = name.match(endingExtension),
				ext,
				newName = name;

			if(matches && loader.ext[ext = matches[1]]) {
				var hasBang = name[name.length - 1] === "!";
				newName = name + (hasBang ? "" : "!") + loader.ext[ext];
			}
			return normalize.call(this, newName, parentName, parentAddress);
		};
	};

	if(typeof System){
		addExt(System);
	}

