/**
 * @module {function():multi/lib/graph} multi/lib/graph
 * @parent multi.modules
 * @group multi/lib/graph.types types
 * 
 * @signature `new Graph(graphData)`
 * 
 * @param {multi/lib/graph.graphData} graphData The data used in the graph.
 * 
 * @return {multi/lib/graph} A graph instance
 * 
 * @body
 * 
 * ## Use
 * 
 *     import Graph from 'multi/lib/graph'
 *     graph = new Graph({data: [ ... ], columns: [...]})
 */

function Graph(graphData){
	this.graphData = graphData;
}

/**
 * @prototype
 */
Graph.prototype = {
	/**
	 * @function toChart
	 */
	toChart: function(){}
};

module.exports = Graph;