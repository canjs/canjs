var css = require("$css");
var lessEngine = require("less");

exports.instantiate = css.instantiate;

var options = steal.config('lessOptions') || {};

// default optimization value.
options.optimization |= lessEngine.optimization;

exports.translate = function(load) {
	var pathParts = (load.address+'').split('/');
		pathParts[pathParts.length - 1] = ''; // Remove filename

	var paths = [];
	if (typeof window !== 'undefined') {
		pathParts = (load.address+'').split('/');
		pathParts[pathParts.length - 1] = ''; // Remove filename
		paths = [pathParts.join('/')];
	}
	return new Promise(function(resolve, reject){
		options.filename = load.address;
		options.paths = [pathParts.join('/')];

		var Parser = lessEngine.Parser;
		new Parser(options).parse(load.source, function (e, root) {
			if(e){
				reject(e);
			} else {
				resolve(root.toCSS(options));
			}
		});
	});
};

exports.tildeModules = [
	/@import ['"](~\/.+)['"]/g,
	/url\(['"](~\/.+)['"]/g
];

exports.buildType = "css";
