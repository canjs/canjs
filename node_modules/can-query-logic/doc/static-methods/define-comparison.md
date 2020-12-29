@function can-query-logic.defineComparison defineComparison
@parent can-query-logic.static


@signature `QueryLogic.defineComparison(TypeA, TypeB, comparisons)`

  This registers comparison operators between the `TypeA` and `TypeB`
  types. For example, the following might define how to compare
  the `GreaterThan` type to the `LessThan` type:

  ```js
  import {QueryLogic} from "can";

  QueryLogic.defineComparison(GreaterThan, LessThan, {
    union(greaterThan, lessThan){
      if(greaterThan.value < lessThan.value) {
        return QueryLogic.UNIVERSAL
      } else {
        return new QueryLogic.ValueOr([greaterThan, lessThan]);
      }
    },
    intersection(greaterThan, lessThan){
      if(greaterThan.value < lessThan.value) {
        return new QueryLogic.ValueAnd([greaterThan, lessThan]);
      } else {
        return QueryLogic.EMPTY;
      }
    },
    difference(greaterThan, lessThan){
      if(greaterThan.value < lessThan.value) {
        return new QueryLogic.GreaterThanEqual(lessThan.value)
      } else {
        return greaterThan;
      }
    }
  });
  ```

  Note, for comparisons of two different types, you will also want to
  define the reverse `difference` like:

  ```js
  import {QueryLogic} from "can";

  QueryLogic.defineComparison(LessThan, GreaterThan, {
    difference(lessThan, greaterThan) {
      if(greaterThan.value < lessThan.value) {
        return new QueryLogic.LessThanEqual(lessThan.value);
      } else {
        return lessThan;
      }
    }
  });
  ```

  `union` and `intersection` isn't necessary because they are symmetrical (Ex: `a U b = b U a`).

  Also, for many types you will want to define the difference between the
  [can-query-logic.UNIVERSAL] set and the type:

  ```js
  import {QueryLogic} from "can";
  QueryLogic.defineComparison(QueryLogic.UNIVERSAL, GreaterThan, {
    difference(universe, greaterThan) {
      return new QueryLogic.LessThanEqual(greaterThan.value);
    }
  })
  ```


  @param {function} TypeA A constructor function.
  @param {function} TypeB A constructor function.
  @param {Object} comparisons An object of one or more of the following comparison functions:

  - `union(typeAInstance, typeBInstance)` - Returns a representation of the union of the two sets.
  - `intersection(typeAInstance, typeBInstance)` - Returns a representation of the intersection of the two sets.
  - `difference(typeAInstance, typeBInstance)` - Returns a representation of the difference of the two sets.

  The special sets can be returned from these functions to indicate:

  - [can-query-logic.EMPTY] - The empty set.
  - [can-query-logic.UNDEFINABLE] - A representation of the result of the operation exists, but there is no way to express it.
  - [can-query-logic.UNKNOWABLE] - It is unknown if a representation of the operations result exists.

@body

## Use

If you want total control over filtering logic, you can create a `SetType` that
provides the following:

- methods:
  - `can.isMember` - A function that returns if an object belongs to the query.
  - `can.serialize` - A function that returns the serialized form of the type for the query.
- comparisons:
  - `union` - The result of taking a union of two `SetType`s.
  - `intersection` - The result of taking an intersection of two `SetType`s.
  - `difference` - The result of taking a difference of two `SetType`s.

The following creates a `SearchableStringSet` that is able to perform searches that match
the provided text like:

@sourceref ../examples/recipe-example.js
@codepen
@codepen 78-85,only

Notice how all values that match `chicken` are returned.

@sourceref ../examples/recipe-example.js
@codepen
@highlight 4-76,only

## Testing

To test `SearchableStringSet`, you can use `QueryLogic.set.union`, `QueryLogic.set.intersection`
and `QueryLogic.set.difference` as follows:


```js
test("SearchableStringSet", function(assert){

  assert.deepEqual(
    QueryLogic.set.union(
      new SearchableStringSet("foo"),
      new SearchableStringSet("food")
    ),
    new SearchableStringSet("foo"),
    "union works"
  );
})
```
