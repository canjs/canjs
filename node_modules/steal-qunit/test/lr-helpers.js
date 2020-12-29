function Mocker(loader) {
	this.loader = loader;

	this.srcs = {};
	this.reset = this.trap();
}

Mocker.prototype = {
	trap: function(){
		var fetch = this.loader.fetch;
		var mock = this;
		this.loader.fetch = function(load){
			var src = mock.srcs[load.name];
			if(src) {
				return Promise.resolve(src);
			}
			return fetch.apply(this, arguments);
		};

		return function(){
			mock.loader.fetch = fetch;
		};
	},
	replace: function(moduleName, src){
		this.srcs[moduleName] = src;
		var liveReload = this.loader.get("live-reload").default;
		return liveReload(moduleName);
	},
	// Gets the contents from a function with comments
	getContent: function(fn){
		var str = fn.toString();
		var start = str.indexOf("/*");
		str = str.substr(start + 2);
		var end = str.lastIndexOf("*/");
		str = str.substr(0, end);
		return str.trim();
	}
};

module.exports = function(loader){
	return new Mocker(loader);
};
