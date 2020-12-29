var _ = require("lodash");


// theme/templates/helpers.js
module.exports = function(docMap, options, getCurrent){
	
	var categories = {};
	_.forEach(docMap, function(docObject, name){
		var cat = docObject.category;
		if(!cat) {
			return;
		}
		
		if(!categories[cat]) {
			categories[cat] = [];
		}
		var docs = categories[cat];
		docs.push({
			name: name,
			docObject: docObject
		});
		if(docObject.alias) {
			docs.push({
				isAlias: true,
				newName: name,
				name: docObject.alias,
				docObject: docObject
			});
		}
		
	});
	for(var name in categories) {
		categories[name] = _.sortBy( categories[name], "name" );
	}

	
	return {
		"eachCategory": function(options){
			return _.map(categories, function(docs, name){
				return options.fn({name: name});
			}).join("");
		},
		"eachItem": function(name, options){
			return _.map(categories[name], function(doc, i){
				return options.fn(doc);
			}).join("");
		},
		"eachDocObject": function(name, options){
			return _.map(categories[name], function(doc, i){
				return doc.isAlias ? "" : options.fn(doc.docObject);
			}).join("");
		},
	};
};