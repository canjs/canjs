@function can-query-logic.prototype.intersection intersection
@parent can-query-logic.prototype

Return a query that represents the intersection of two queries.

@signature `queryLogic.intersection(a, b)`

  Returns a query that represents the intersection of queries _A_ and _B_. In set theory, an intersection is
  represented by `A ∩ B`.

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const filter = queryLogic.intersection(
    { filter: {completed: true, due: "tomorrow"} },
    { filter: {completed: true, type: "critical"} }
  );
  console.log( filter ); //-> {filter: {completed: true, due: "tomorrow", type: "critical"}}
  ```
  @codepen

  @param  {can-query-logic/query} a A query.
  @param  {can-query-logic/query} b A query.
  @return {can-query-logic/query} Returns a query object, or one of the special sets:
  - [can-query-logic.EMPTY] - Query `a` is disjoint with query `b`.
  - [can-query-logic.UNDEFINABLE] - An intersection exists, but it can not be represented with the current logic.
  - [can-query-logic.UNKNOWABLE] - The logic is unable to determine if an intersection exists or not.
