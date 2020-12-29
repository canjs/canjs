@function can-debug.getGraph getGraph
@parent can-debug
@hide

@description Get the observable's dependency graph.

@signature `canDebug.getGraph(observable, [key])`

Returns a graph data structure where each node represents an observable and the 
edges or arrows from node to node represent the "direction" of the dependency. If
an arrows goes from "x" to "y" ("x" is the head and "y" is the tail) it can be read 
as "x" changes "y"; if the arrow goes in the opposite direction it can be read as "x" 
is changed by "y" or "x" derives its value from "y".

```js
const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
} );

const me = new Person( { first: "John", last: "Doe" } );
me.on( "fullName", function() {} );

const graph = canDebug.getGraph( me, "fullName" );
```

Using a visualization library, the graph returned in the above example looks like 
this:

![dependencyGraph](../node_modules/can-debug/doc/map-dependency-graph.png)

Take a look at the `can-debug/src/graph/` module, where the `Graph` constructor
and its methods are implemented. Also, `can-debug/graph-visualization/` includes
multiple examples of how the graph looks like for other CanJS observables.

@param {Object} observable An observable.
@param {Any} [key] The key of a property on a map-like observable.
