module.exports = function(docObject, configuration){
	var name = typeof docObject == "string" ? docObject : docObject.name;
	
	if(!name) {
		debugger;
	}
	return configuration && name === configuration.parent ? 
		'index.html' : 
		name.replace(/ /g, "_")
			.replace(/&#46;/g, ".")
			.replace(/&gt;/g, "_gt_")
			.replace(/\*/g, "_star_")
			.replace(/\//g, "|") + '.html';
};
