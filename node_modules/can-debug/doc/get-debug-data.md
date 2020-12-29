@function can-debug.getDebugData getDebugData
@parent can-debug
@hide

@description Get a deeply nested object from a dependency graph.

@signature `canDebug.getDebugData(graph, [direction])`

Takes a dependency graph and generates a recursive data structure from it, this
method is used internally by the `logWhatChanges` and `logWhatIChange` functions.

The deeply nested object is a lot easier to iterate recursively than the graph, 
and it is useful for users wanting to roll their own log output format. The optional
`direction` argument is used to get the dependency graph in a given direction. 

That means it's possible to get only the observables used to derive the value from,
or to get all the observables that are changed by a given object.

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

console.log(
	canDebug.getDebugData( canDebug.getGraph( me, "fullName" ) ),
	"whatChangesMe"
);
```

Logs

![getDebugData](../node_modules/can-debug/doc/get-debug-data.png)

@param {Object} graph The dependency graph input
@param {String} direction The arrows direction, can be "whatIChange" or "whatChangesMe"
