@function can-define/list/list.extend extend
@parent can-define/list/list.static

@description Define a custom list type.

@signature `DefineList.extend([name,] [static,] prototype)`

Extends DefineList, or constructor functions derived from DefineList,
to create a new constructor function.

```js
import DefineList from "can-define/list/list";

const TodoList = DefineList.extend(
	"TodoList",
	{
		"#": { type: { complete: "boolean", name: "string" } },
		availableCount: "number",
		completedCount: {
			get: function() {
				return this.filter( { complete: true } ).length;
			}
		},
		completeAll: function() {
			this.forEach( function( todo ) {
				todo.complete = true;
			} );
		}
	} );

const todos = new TodoList( [
	{ name: "dishes", complete: false },
	{ name: "lawn", complete: false }
] );
todos.availableCount = 100;

todos.completeAll();
todos.completeCount; //-> 2
```

  @param {String} [name] Provides an optional name for this type that will
  show up nicely in debuggers.

  @param {Object} [static] Static properties that are set directly on the
  constructor function.

  @param {Object<String,Function|can-define.types.propDefinition>} prototype A definition of the properties or methods on this type.

@return {can-define/list/list} A DefineList constructor function.


@body
