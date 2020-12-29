
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
	get bundlesPath () {
	 	var dir = this.loader.bundlesPath;
	 	if(dir === "") {
	 		dir = "bundles";
	 	} else if(!dir) {
	 		dir = "dist/bundles";
	 	}
	 	return this.join( dir );
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








