@function can-query-logic.prototype.difference difference
@parent can-query-logic.prototype

@description Return a query representing the values that are in one set that are not
in the another set.

@signature `queryLogic.difference(a, b)`

  Returns a set that represents the difference of sets _A_ and _B_. In set theory, a difference is
  represented by `A \ B`. The returned query would represent the values that are in one set that are not in the another set. Difference is sometimes known as [relative complement](https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement) in set theory.

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const filter = queryLogic.difference(
    { filter: { name: {$in: ["Ramiya", "Bohdi"]} } },
    { filter: { name: "Bohdi" } }
  );
  console.log( filter ); //-> {filter: {name: "Ramiya"}}

  // A is totally inside B
  const emptyFilter = queryLogic.difference(
    { filter: { name: "Bohdi" } },
    {}
  );
  console.log( emptyFilter ); //-> QueryLogic.EMPTY
  ```
  @codepen

  @param  {can-query-logic/query} a A query representing a set of data. The `a` query can be looked at as having the `b` values removed to produce the result.
  @param  {can-query-logic/query} b A query.
  @return {can-query-logic/query} Returns a query object, or one of the special sets:
  - [can-query-logic.EMPTY] - Query `a` is inside query `b`.
  - [can-query-logic.UNDEFINABLE] - A difference exists, but it can not be represented with the current logic.
  - [can-query-logic.UNKNOWABLE] - The logic is unable to determine if a difference exists or not.
