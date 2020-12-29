var path = require("path");
var regexAll = require("./regex_all");

var urlExp = /url\(["']?(.+?)[?#"')]/g;

exports.find = function(bundle){
	var nodes = bundle.nodes || [];

	return nodes.map(function(node){
		var source = node.activeSource.code;

		var results = regexAll(urlExp, source);

		if(results.length) {
			return results.map(function(res){
				return /data:|https?:/.test(res[1]) ? null : { path: res[1] };
			});
		}

	})
	.reduce(flatten, [])
	.filter(truthy);
};

exports.rewrite = function(source, bundlePath, assets){
	assets.forEach(function(asset){
		var relativePath = slashify(
			path.relative(path.dirname(bundlePath), asset.dest)
		);

		var exp = new RegExp(asset.path, "g");

		source = source.replace(exp, function(res){
			return relativePath;
		});
	});

	return source;
};

function truthy(t){
	return !!t;
}

function flatten(a, b){
	return a.concat(b);
}

function slashify(path){
	return path.replace(/\\/g, '/');
}
