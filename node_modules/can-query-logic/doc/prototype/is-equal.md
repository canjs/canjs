@function can-query-logic.prototype.isEqual isEqual
@parent can-query-logic.prototype

@description Return if two queries represent the same data.

@signature `queryLogic.isEqual(a, b)`

  Returns true if the two queries represent the same data.

  ```js
  import {QueryLogic} from "can";
  
  const queryLogic = new QueryLogic();

  const checkEquality = queryLogic.isEqual(
    {filter: {type: "critical"}},
    {filter: {type: {$in: ["critical"]}}}
  );
  console.log( checkEquality ); //-> true
  ```
  @codepen

  @param  {can-query-logic/query} a A query.
  @param  {can-query-logic/query} b A query.
  @return {Boolean} True if the two queries are equal. [can-query-logic.UNKNOWABLE]
    is not equal to [can-query-logic.UNKNOWABLE].
