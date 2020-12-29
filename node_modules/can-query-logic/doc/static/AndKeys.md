@function can-query-logic.KeysAnd KeysAnd
@parent can-query-logic.static-types

Create a logical AND of keys and their values.

@signature `new QueryLogic.KeysAnd(values)`

  Creates a logical AND of the keys and values in `values`. The following
  creates a representation of the set of objects whose `first` property is `"Justin"`
  and `age` property is `35`:

  ```js
  import {QueryLogic} from "can";

  const isJustinAnd35 = new QueryLogic.KeysAnd({
    first: "Justin",
    age: 35
  });

  console.log( isJustinAnd35.values ); //-> {first: Justin, age: 35}
  ```
  @codepen

  @param {Object} values An object of key-value pairs.  The values of keys might be set representations like
  `GreaterThan`.

@body

## Use

Instances of `KeysAnd` can be used to compare to other `KeysAnd` `[can-query-logic.set.intersection set.intersection]`, `[can-query-logic.set.difference set.difference]`, and
`[can-query-logic.set.union set.union]`.  For example:

```js
import {QueryLogic} from "can";

const isJustinAnd35 = new QueryLogic.KeysAnd({
  first: "Justin",
  age: 35
});

const isChicago = new QueryLogic.KeysAnd({
  location: "Chicago"
});

const intersect = QueryLogic.intersection( isJustinAnd35, isChicago )
console.log( intersect.values );//-> {first: "Justin", age: 35, location: "Chicago"}
```
@codepen

`KeysAnd` can also be used to test if an object belongs to the set:

```js
import {QueryLogic} from "can";

const isJustinAnd35 = new QueryLogic.KeysAnd({
  first: "Justin",
  age: 35
});

const matchesKeys = isJustinAnd35.isMember({
  first: "Justin",
  age: 35,
  location: "Chicago"
});
console.log( matchesKeys ); //-> true

const matchesOneKey = isJustinAnd35.isMember({
  first: "Payal",
  age: 35,
  location: "Chicago"
});
console.log( matchesOneKey ); //-> false
```
@codepen

`KeysAnd` can be used recursively to test membership.  For example:

```js
import {QueryLogic} from "can";

const isJustinPostCollege = new QueryLogic.KeysAnd({
  name: {first: "Justin"},
  age: new QueryLogic.GreaterThan(22)
});

const olderThan = isJustinPostCollege.isMember({
  name: {first: "Justin", last: "Meyer"},
  age: 36
});
console.log( olderThan ); //-> true
```
@codepen
