@function can-query-logic.set.intersection set.intersection
@parent can-query-logic.static

Perform an intersection of set types.

@signature `QueryLogic.set.intersection(setA, setB)`

  Performs an intersection of `setA` and `setB` and returns the
  result.  Will throw an error if [can-query-logic.defineComparison] has
  not been called with comparison operations
  necessary to perform the intersection.  Use [can-query-logic.prototype.intersection]
  to perform an intersection between two plain [can-query-logic/query] objects.

  `QueryLogic.set.intersection` can be used to test custom comparison types:

  ```js
  import {QueryLogic} from "can";

  const gt3 = new QueryLogic.GreaterThan(3);
  const lt6 = new QueryLogic.LessThan(6);

  const intersect = QueryLogic.intersection(gt3, lt6);
  console.log( intersect ); //-> new QueryLogic.ValueAnd( [
  //   gt3,
  //   lt6
  // ] )
  ```
  @codepen

  @param {SetType} [setA] An instance of a SetType.
  @param {SetType} [setB] An instance of a SetType.
  @return {SetType} An instance of a SetType.
