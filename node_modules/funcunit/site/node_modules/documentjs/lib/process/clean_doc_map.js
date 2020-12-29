var addChildren = require("./add_children"),
	docMapInfo = require("./doc_map_info"),
	_ = require("lodash"),
	tags = require("../tags/tags"),
	deepExtendWithoutBody = require("./deep_extend_without_body");

module.exports = function(docMap, options){
	
	if(!options.parent) {
		var info = docMapInfo(docMap);
		if(_.size(info.nameHeightMap) === 1) {
			// everything is under one object, so use that
			options.parent = info.maxName;
			
		} else if( _.size(info.parentHeightMap) === 1 ) {
			// everything is under one object that doesn't exist, so create it
			docMap[info.maxParent] = {
				name: maxParent,
				body: "This is temporary content.  Create a "+maxParent+" @page.",
				type: "page"
			};
			options.parent = info.maxParent;
		} else if(info.sortedNames.length > 1 && info.sortedNames[0].childCount > info.sortedNames[1].childCount * 5) {
			options.parent = info.maxName;
			console.log("Parent-less comments: "+_.map(info.sortedNames.slice(1),"name")+".");
		} else {
			// we need to balance an empty project, which should probably have everything
			// just added to it
			// with an older project which should have "parent" added
			var maxParent = info.maxParent || "index";
			docMap[maxParent] = {
				name: maxParent,
				body: "This is temporary content.  Create an "+(maxParent)+
				" @page or specify <code>parent</code> in your siteConfig.",
				type: "page"
			};
			_.forEach(info.nameHeightMap, function(val, name){
				if(name !== maxParent) {
					docMap[name].parent = maxParent;
				}
			});
			
			options.parent = maxParent;
			console.log("Parent-less comments:"+_.keys(info.nameHeightMap).join(", ")+".");
		}
		
		console.warn("Guessed parent '"+options.parent+"'. Set parent in your siteConfig.");
	}
	
	addChildren(docMap);
	
	_.each(docMap, function( docObject ){
		
		var opts = _.extend({}, options, options.pageConfig);
		delete opts.pageConfig;
		delete opts.tags;
		delete opts.parent;
		_.defaults(docObject, opts);
		docObject.docObjectString = JSON.stringify(deepExtendWithoutBody(docObject));
	});
	
	// Check that parent is in docMap
	if(!docMap[options.parent]){
		throw "The parent DocObject ("+options.parent+") was not found!";
	}
	return docMap;
};
