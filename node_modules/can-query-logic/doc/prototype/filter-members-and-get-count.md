@function can-query-logic.prototype.filterMembersAndGetCount filterMembersAndGetCount
@parent can-query-logic.prototype

@description Filter data using a query and get the number of records that would be returned without pagination.

@signature `queryLogic.filterMembersAndGetCount(a, [b,] bData)`

  `filterMembersAndGetCount` is just like [can-query-logic.prototype.filterMembers], except it
  includes a `count` of the number of records that would be returned if the pagination properties were
  removed.

  In the following example, notice how there are 3 records of `{type: "dog"}` in the source data, but
  only two records are provided in `data`:

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const filtered = queryLogic.filterMembersAndGetCount(
    {filter: {type: "dog"}, page: {start: 0, end: 1}},
    {},
    [
      {id: 1, type:"cat"},
      {id: 2, type: "dog"},
      {id: 3, type: "dog"},
      {id: 4, type: "zebra"},
      {id: 5, type: "dog"}
    ]
  ); 
  console.log( filtered ); //-> {data: [{id: 2, type: "dog"},{id: 3, type: "dog"}], count: 3}
  ```
  @codepen

  @param  {can-query-logic/query} a The query whose data will be returned.
  @param  {can-query-logic/query} [b] An optional superset of query `a`. If only two arguments are provided,
    the universal set is used.
  @param  {Array<Object>} bData The data in query `b`.
  @return {{count:Number, data:Array<Object>}} An object like: `{count: Number, data: [...]}` where:
    - `count` is the number of unpaginated results
    - `data` is the filtered and paginated records
