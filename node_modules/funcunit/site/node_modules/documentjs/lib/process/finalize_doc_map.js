var _ = require('lodash');

// for each tag that has a .done method, calls it on every item in the docMap
module.exports = function(docMap, tags){
	var dones = [];
	for ( var tag in tags ) {
		if ( tags[tag].done ) {
			dones.push(tags[tag].done);
		}
	}
	// some tags inherit methods other tags.  We don't want to duplicate the same done behavior
	dones = _.uniq(dones);
	
	for( var name in docMap) {
		dones.forEach(function(done){
			done.call(docMap[name]);
		});
	}
};
