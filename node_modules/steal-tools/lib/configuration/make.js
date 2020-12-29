
var fs = require("fs-extra"),
	path = require("path"),
	cleanAddress = require("../clean_address");


module.exports = function(loader, buildLoader, options){
	return new Configuration(loader, buildLoader, options);
};

function Configuration(loader, buildLoader, options){
	this.loader = loader;
	this.buildLoader = buildLoader;
	this.options = options;

    this.defaultBundlesPathName = options.defaultBundlesPathName != null ?
        options.defaultBundlesPathName : "bundles";
}

// full path
// relative to

Configuration.prototype = {
	join: function(src){
		if( src.indexOf("/") === 0 || /^\w+\:[\/\\]/.test(src) ) {
			return src;
		} else if( src.indexOf("./") === 0 ){
			return path.join(process.cwd(), src.substr(2));
		} else {
			return path.join(cleanAddress(this.loader.baseURL), src);
		}
	},
	get dest() {
		var dest = this.options.dest != null ? this.options.dest : "dist";

		if(typeof dest === "function") {
			dest = "dist";
		}
		return this.join(dest);
	},
	get bundlesPath() {
		var dest = this.dest;
		var bundlesPathName = this.defaultBundlesPathName;

		return path.join(dest, bundlesPathName);
	},
	get bundlesPathURL () {
		return path.relative( this.loader.baseURL, this.bundlesPath ).replace(/\\/g, '/');
	},
	mkBundlesPathDir: function(){
		var bundlesPath = this.bundlesPath;
		return new Promise(function(resolve, reject){
			fs.mkdirs(bundlesPath, function(err){
				if(err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	},
	get configMain(){
		return this.loader.configMain || "@config";
	}
};
