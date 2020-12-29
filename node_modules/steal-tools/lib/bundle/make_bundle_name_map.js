
module.exports = function(bundles){
	var map = {};

	bundles.forEach(function(bundle){
		map[bundle.name] = true;
	});

	return map;
};
