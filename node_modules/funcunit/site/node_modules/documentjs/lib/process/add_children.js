var  _ = require("lodash");

module.exports = function(docMap){
	
	// go through everything in docMap and
	// add yourself to your parent's children array
	_.each(docMap, function (current, name) {
		
		// make sure it has a parent
		if(current.parent){
			
			var parent = docMap[current.parent]

			if (parent && parent.name !== name) {

				parent.children = parent.children || [];
				parent.children.push(current);
			}
			
		}
		
	});
	
};