// Goes through the graph and figures out the highest parent
var _ = require("lodash");

var getTop = function(docMap, child){
	var parent;
	while( (parent = docMap[child.parent]) && parent !== child) {
		child = parent;
	}
	return child;
};

/**
 * @function documentjs.process.docMapInfo
 * @parent documentjs.process
 * @hide
 * 
 * Gives some useful info about a docMap and the structure of the docObjects within it.
 * 
 * @param {Object} docMap
 * 
 * 
 * @return {{}}
 * 
 * @option {String} maxName The name of the docObject who has the largest number of childDocObjects
 * @option {Object<String,Number>} nameHeightMap A map of docObject names to the number of recrusive childObjects
 * @option {String} maxParent 
 * @option {Object<String,Number>} parentHeightMap
 */
module.exports = function(docMap){
	var nameHeightMap = {},
		parentHeightMap = {},
		maxName,
		maxParent;
	for(var name in docMap) {
		
		var topDocObject =  getTop(docMap, docMap[name]);
		var topName = topDocObject.name,
			topParent = topDocObject.parent;
		// update the height map
		nameHeightMap[topName] = (nameHeightMap[topName] || 0)+1;
		
		// if it is the highest, track it
		if(!maxName || (nameHeightMap[topName] > nameHeightMap[maxName]) ) {
			maxName = topName;
		}
		
		if(topParent) {
			parentHeightMap[topParent] = (parentHeightMap[topParent] || 0)+1;
		
			if(!maxParent || (parentHeightMap[topParent] > parentHeightMap[maxParent]) ) {
				maxParent = topParent;
			}
		}

	}
	var sortedNameHeightMap= _.sortBy(_.map(nameHeightMap, function(val, name){
		return {name: name, childCount: val};
	}), "childCount").reverse();
	return {
		maxName: maxName,
		nameHeightMap: nameHeightMap,
		sortedNames: sortedNameHeightMap,
		maxParent: maxParent,
		parentHeightMap: parentHeightMap
	};
};




