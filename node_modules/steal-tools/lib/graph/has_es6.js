var source = require("../node/source");

var isES6 = function(node){
	var nodeSource = source(node) || "";
	return nodeSource.indexOf("$traceurRuntime") >= 0;
};


module.exports = function(graph){
  var node;

	if(Array.isArray(graph)) {
		for(var i = 0; i < graph.length; i++){
			node = graph[i];
			if(isES6(node)){
				return true;
			}
		}		
	} else {
		for( var name in graph ) {
			node = graph[name];
			if(isES6(node)){
				return true;
			}
		}
	}
	

	return false;
};

