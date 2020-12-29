module.exports = function(bundles, moduleName, buildType){

	for(var i = 0; i < bundles.length; i++){
		var bundle = bundles[i];
		if(bundle.buildType === buildType && bundle.bundles.length === 1 && bundle.bundles[0] === moduleName) {
			return bundle;
		}
	}

};
