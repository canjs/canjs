@function can-query-logic.prototype.isDefinedAndHasMembers isDefinedAndHasMembers
@parent can-query-logic.prototype

Return if a query can have records.

@signature `queryLogic.isDefinedAndHasMembers(query)`

  Returns the query object if _query_ can have records. It returns `true` if the query is not
  [can-query-logic.EMPTY], [can-query-logic.UNDEFINABLE], or [can-query-logic.UNKNOWABLE].

  ```js
  import {QueryLogic} from "can";
  const queryLogic = new QueryLogic();

  const emptyObject = queryLogic.isDefinedAndHasMembers({});
  console.log( emptyObject ); //-> {}

  const universal = queryLogic.isDefinedAndHasMembers(QueryLogic.UNIVERSAL);
  console.log( universal ); //-> QueryLogic.UNIVERSAL

  const undefinable = queryLogic.isDefinedAndHasMembers(QueryLogic.UNDEFINABLE); 
  console.log( undefinable );//-> false
  ```
  @codepen

  @param  {can-query-logic/query} a A query.
  @return {can-query-logic/query|Boolean} returns `false` if _query_ is
  [can-query-logic.EMPTY], [can-query-logic.UNDEFINABLE], or [can-query-logic.UNKNOWABLE], else it returns the query object.
