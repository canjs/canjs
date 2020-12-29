

module.exports = function(graph, name){
	var order = 0;

	function visit( node ) {
		if ( node && node.order === undefined ) {
			//prevent infinate loops
			node.order = null;
			node.dependencies.forEach(function( moduleName ) {
				visit( graph[moduleName] );
			});
			node.order = (order++);
		}
	}
	visit(graph[name]);
};
