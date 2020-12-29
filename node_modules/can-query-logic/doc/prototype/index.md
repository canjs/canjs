@function can-query-logic.prototype.index index
@parent can-query-logic.prototype

@description returns the index where the `record` will be input.

@signature `queryLogic.index(query, records, record)`

  Returns where `record` should be inserted into `records` which is represented by `query`.

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const myIndex = queryLogic.index(
    {sort: "age"},
    [{id: 1, age: 3},{id: 2, age: 5},{id: 3, age: 8},{id: 4, age: 10}],
    {id: 6, age: 4}
  );
  console.log( myIndex ); //-> 1
  ```
  @codepen

  If the `sort` property is not specified, it will default to the first identity key of the
  `schema` passed to the [can-query-logic QueryLogic] constructor.

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const myIndex = queryLogic.index(
    {},
    [{id: 1, age: 3},{id: 2, age: 5},{id: 3, age: 8},{id: 4, age: 10}],
    {id: 6, age: 3}
  );
  console.log( myIndex ); //-> 4
  ```
  @codepen

  @param  {can-query-logic/query} query The query that describes the records in `records`.
  @param  {Array<Object>} records An array of data objects.
  @param  {Object} record The data object to be inserted.
  @return {Number} The position to insert `item`.  `-1` will be returned if an appropriate
  place to insert the record can not be found.
