@function can-query-logic.prototype.count count
@parent can-query-logic.prototype

@description Return the number of records in a query.

@signature `queryLogic.count(query)` Returns the number of records that might be loaded by the `query`. This returns infinity unless
a `page` is provided.

  ```js
  import {QueryLogic} from "can";

  const queryLogic =  new QueryLogic();

  const count = queryLogic.count({page: {start: 10, end: 19}});
  console.log( count ); //-> 10
  ```
  @codepen

  @param {can-query-logic/query} query A query representing a set of data.

  @return {Number} The number of records in the query if known, `Infinity`
  if unknown.
