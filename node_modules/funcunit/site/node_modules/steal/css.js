if( steal.config('env') === 'production' ) {
	exports.fetch = function(load) {
		// return a thenable for fetching (as per specification)
		// alternatively return new Promise(function(resolve, reject) { ... })
		var cssFile = load.address;

		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssFile;

		document.head.appendChild(link);
		return "";
	};
} else {
	exports.instantiate = function(load) {
		load.metadata.deps = [];
		load.metadata.execute = function(){
			if(load.source) {
				var head = document.head || document.getElementsByTagName('head')[0],
					style = document.createElement('style'),
					source = load.source+"/*# sourceURL="+load.address+" */";

				// make source load relative to the current page
				source = source.replace(/url\(['"]?([^'"\)]*)['"]?\)/g, function( whole, part ) {
					return "url(" + steal.joinURIs( load.address, part) + ")";
				});
				style.type = 'text/css';

				if (style.styleSheet){
					style.styleSheet.cssText = source;
				} else {
					style.appendChild(document.createTextNode(source));
				}
				head.appendChild(style);
			}

			return System.newModule({});
		};
		load.metadata.format = "css";
	};
	
}

exports.tildeModules = /url\(['"](~\/.+)['"]/g;

exports.buildType = "css";
exports.includeInBuild = true;
