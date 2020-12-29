
	// "path/to/folder/" -> "path/to/folder/folder"
	var addForwardSlash = function(loader) {
		if (loader._extensions) {
			loader._extensions.push(addForwardSlash);
		}

		var normalize = loader.normalize;
		var npmLike = /@.+#.+/;

		loader.normalize = function(name, parentName, parentAddress, pluginNormalize) {
			var lastPos = name.length - 1,
				secondToLast,
				folderName;

			if (name[lastPos] === "/") {
				secondToLast = name.substring(0, lastPos).lastIndexOf("/");
				folderName = name.substring(secondToLast + 1, lastPos);
				if(npmLike.test(folderName)) {
					folderName = folderName.substr(folderName.lastIndexOf("#") + 1);
				}

				name += folderName;
			}
			return normalize.call(this, name, parentName, parentAddress, pluginNormalize);
		};
	};

	if (typeof System) {
		addForwardSlash(System);
	}
