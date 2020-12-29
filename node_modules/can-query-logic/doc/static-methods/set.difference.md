@function can-query-logic.set.difference set.difference
@parent can-query-logic.static

Perform a difference of set types.

@signature `QueryLogic.set.difference(setA, setB)`

  Performs a difference of `setA` and `setB` and returns the
  result.  Will throw an error if [can-query-logic.defineComparison] has
  not been called with comparison operations
  necessary to perform the difference.  Use [can-query-logic.prototype.difference]
  to perform a difference between two plain [can-query-logic/query] objects.

  `QueryLogic.set.difference` can be used to test custom comparison types:

  ```js
  import {QueryLogic} from "can";

  const gt3 = new QueryLogic.GreaterThan(3);
  const lt6 = new QueryLogic.LessThan(6);
  
  const diff = QueryLogic.difference(gt3, lt6);
  console.log( diff ); //-> new QueryLogic.GreaterThanEqual(6)
  ```
  @codepen

  @param {SetType} [setA] An instance of a SetType.
  @param {SetType} [setB] An instance of a SetType.
  @return {SetType} An instance of a SetType.
