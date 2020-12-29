@property {Object} can-query-logic.UNKNOWABLE UNKNOWABLE
@parent can-query-logic.static-types

Represents a non-answer.

@type {Object} Use `QueryLogic.UNKNOWABLE` to signal that __no__ answer to the problem
can be figured out.  

  Consider the following difference:

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const diff = queryLogic.difference({
    filter: {age: 35},
    sort: "name"
  },{
    filter: {name: "Justin"},
    sort: "age"
  });
  // Codepen logs limited nesting of objects.
  // Using JSON.stringify to circumvent issue.
  console.log( JSON.stringify( diff ) ); //-> "{
  //   'filter': {
  //     'age': '35',
  //     'name': {'$ne': 'Justin'}
  //   },
  //   'sort': 'name'
  // }"
  ```
  @codepen

  Since it is possible that there might be records in the first set that won't be in the second set, thus [can-query-logic.prototype.difference difference] it returns a query.

  Now consider a similar example, but with pagination added:

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const diff = queryLogic.difference({
    filter: {age: 35},
    sort: "name",
    page: {start: 0, end: 10}
  },{
    filter: {name: "Justin"},
    sort: "age",
    page: {start: 0, end: 12}
  });
  console.log( diff ); //-> QueryLogic.UNKNOWABLE
  ```
  @codepen

  Because we added pagination,
  the answer should paginated data in the result. This means we would have to know
  what the actual data set looked like to make a determination if the value
  was `EMPTY` or `UNDEFINABLE`. Because we don't have the actual data set, we return `UNKNOWABLE`.

  Think of:

  - `UNDEFINABLE` as representing a set between `EMPTY` and `UNIVERSAL`
  - `UNKNOWABLE` as a set that could be `EMPTY`, `UNIVERSAL` or anywhere between.
