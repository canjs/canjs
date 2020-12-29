@function can-query-logic.makeEnum makeEnum
@parent can-query-logic.static-types

Create a schema type that represents a finite set of values.

@signature `QueryLogic.makeEnum(values)`

  `makeEnum` allows queries to perform more powerful set logic because
  the potential values is finite.  The following example uses it to
  define a status property as one of three values:

  ```js
  import {QueryLogic, DefineMap} from "can";

  const Status = QueryLogic.makeEnum(["new","assigned","complete"]);

  const Todo = DefineMap.extend({
    id: "number",
    status: Status,
    complete: "boolean",
    name: "string"
  });

  const todoLogic = new QueryLogic(Todo);
  const unionQuery = todoLogic.union(
    {filter: {status: ["new","assigned"] }},
    {filter: {status: "complete" }}
  );

  console.log( JSON.stringify( unionQuery ) ); //-> "{
  //   'filter':{
  //     'status':{
  //       '$in':['new','assigned','complete']
  //     }
  //   }
  // }"
  ```
  @codepen

  @param {Array} values An array of primitive values. For example: `["red","green"]`
  @return {function} A constructor function that can be used in a schema. The constructor has
  a `can.SetType` symbol that is used to perform set comparison logic.


@body

## Alternatives

Instead of using `makeEnum`, an enum type can be defined the following:

```js
import {canReflect} from "can";

const Status = canReflect.assignSymbols({}, {
  "can.new": function(val){
    return val.toLowerCase();
  },
  "can.getSchema": function(){
    return {
      type: "Or",
      values: ["new","assigned","complete"]
    };
  }
});

console.log( Status[Symbol.for("can.new")] ); //-> "can.new": function(val){
  //   return val.toLowerCase();
  // },
```
@codepen

This has the added benefit of being able to convert values like "NEW" to "new".
