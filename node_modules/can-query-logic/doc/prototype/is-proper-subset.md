@function can-query-logic.prototype.isProperSubset isProperSubset
@parent can-query-logic.prototype

Return if a query is a strict subset of another set.

@signature `queryLogic.isProperSubset(a, b)`

  Returns true if _a_ is a strict subset of _b_.  In set theory, this is
  represented by `A ⊂ B`.

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const criticalSubset = queryLogic.isProperSubset({filter: {type: "critical"}}, {});
  console.log( criticalSubset ); //-> true

  const emptySet = queryLogic.isProperSubset({}, {});
  console.log( emptySet ); //-> false
  ```
  @codepen

  @param  {can-query-logic/query} a A query.
  @param  {can-query-logic/query} b A query.
  @return {Boolean} `true` if `a` is a subset of `b` and not equal to `b`.
