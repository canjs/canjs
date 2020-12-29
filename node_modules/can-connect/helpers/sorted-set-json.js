var canReflect = require("can-reflect");

module.exports = function(set){
	if(set == null) {
		return set;
	} else {
		return JSON.stringify(canReflect.cloneKeySort(set));
	}

};
