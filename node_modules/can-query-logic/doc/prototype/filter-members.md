@function can-query-logic.prototype.filterMembers filterMembers
@parent can-query-logic.prototype

@description Filter data using a query.

@signature `queryLogic.filterMembers(a, [b,] bData)`

  Filters the `a` query's records from another _super set_ query's records.

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const filter = queryLogic.filterMembers(
    {filter: {type: "dog"}},
    {filter: {type: ["dog", "cat"]}},
    [{id: 1, type:"cat"},
    {id: 2, type: "dog"},
    {id: 3, type: "dog"},
    {id: 4, type: "zebra"}]
  );
  console.log( filter ); //-> [{id: 2, type: "dog"},{id: 3, type: "dog"}]
  ```
  @codepen

  The _super set_ `b` argument is optional.  It defaults to assuming the universal query.  For example,
  the following still works:

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const filter = queryLogic.filterMembers(
    {filter: {type: "dog"}},
    [{id: 1, type:"cat"},
    {id: 2, type: "dog"},
    {id: 3, type: "dog"},
    {id: 4, type: "zebra"}]
  );
  console.log( filter ); //-> [{id: 2, type: "dog"},{id: 3, type: "dog"}]
  ```
  @codepen

  The _super set_ `b` argument is important when pagination is present:

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const filter = queryLogic.filterMembers(
    {page: {start: 11, end: 12}},
    {page: {start: 10, end: 13}},
    [{id: 1, type:"cat"},
    {id: 2, type: "dog"},
    {id: 3, type: "dog"},
    {id: 4, type: "zebra"}]
  );
  console.log( filter ); //-> [{id: 2, type: "dog"},{id: 3, type: "dog"}]
  ```
  @codepen

  records will be returned sorted by the query's `sort` property.

  @param  {can-query-logic/query} a The query whose data will be returned.
  @param  {can-query-logic/query} [b] An optional superset of query `a`. If only two arguments are provided,
    the [can-query-logic.UNIVERSAL universal set] is used.
  @param  {Array<Object>} bData The data in query `b`.
  @return {Array<Object>} The data in query `a`.
