@function can-query-logic.prototype.isSpecial isSpecial
@parent can-query-logic.prototype

Return if a query is a special query.

@signature `queryLogic.isSpecial(query)`

  Returns `true` if query is
  [can-query-logic.UNIVERSAL], [can-query-logic.EMPTY], [can-query-logic.UNDEFINABLE], or [can-query-logic.UNKNOWABLE].

  ```js
  import {QueryLogic} from "can";

  const queryLogic = new QueryLogic();

  const emptyObject = queryLogic.isSpecial({});
  console.log( emptyObject ); //-> false

  const testQuery = queryLogic.isSpecial({filter: {type: "Test"}});
  console.log( testQuery ); //-> false

  const universal = queryLogic.isSpecial(QueryLogic.UNIVERSAL);
  console.log( universal ); //-> true

  const undefinable = queryLogic.isSpecial(QueryLogic.UNDEFINABLE);
  console.log( undefinable ); //-> true
  ```
  @codepen

  @param  {can-query-logic/query} a A query.
  @return {Boolean} `true` if object is [can-query-logic.UNIVERSAL], [can-query-logic.EMPTY], [can-query-logic.UNDEFINABLE], or [can-query-logic.UNKNOWABLE].
