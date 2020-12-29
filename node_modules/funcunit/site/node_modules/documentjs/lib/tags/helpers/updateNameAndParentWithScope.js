var slashOrDot = /[\.\/]/;
var getParent = require('./getParent');

module.exports = function(docObject, scope, docMap){
	if(scope && docMap && scope !== docObject && !slashOrDot.test( docObject.name ) ) {
		
		var parentAndName = getParent.andName({
			parents: "*",
			useName: ["constructor","static","prototype","add","module"],
			scope: scope,
			docMap: docMap,
			name: docObject.name
		});
		if(!docObject.parent) {
			docObject.parent = parentAndName.parent;
		}
		
		docObject.name = parentAndName.name;
	}
};