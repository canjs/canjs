@property {Object} can-define.types types
@parent can-define.static

Specify a type to convert values to. Type coercion only applies when setting a property.
All types leave `null` and `undefined` as is except for
the `"htmlbool"` type converter.

@type {Object}

  All of the following type names can be used as part of a [can-define.types.type] property
  behavior like:

  ```js
  DefineMap.extend({
	  age: {type: "number"}
  });
  ```

  Or they can be used in the [can-define.types.propDefinition#String type property definition shorthand]:

  ```js
  DefineMap.extend({
	  age: "number"
  });
  ```

  @option {function} observable The default type behavior. It converts plain Objects to
  [can-define/map/map DefineMaps] and plain Arrays to [can-define/list/list DefineLists]. Everything else is left as is.
  @option {function} any Leaves the set value as is, performs no type conversion. Aliased as `*`.
  @option {function} string Converts to a string with `""+val`. This is the equivalent to [can-data-types/maybe-string/maybe-string MaybeString].
  @option {function} date Converts to a JavaScript date using `Date.parse(val)` if a string is given or `new Date(val)` if a number is passed. This is the equivalent to [can-data-types/maybe-date/maybe-date MaybeDate].
  @option {function} number Converts to a number with `+(val)`. This is the equivalent to [can-data-types/maybe-number/maybe-number MaybeNumber].
  @option {function} boolean Converts to `false` if `val` is falsey, `"0"`, or `"false"`; otherwise, converts to `true`. This is the equivalent to [can-data-types/maybe-boolean/maybe-boolean MaybeBoolean].
  @option {function} htmlbool Like `boolean`, but converts to `true` if empty string (`""`) is passed.
  @option {function} compute Allows computes to be passed and the property take on the value of the compute.
  @option {function} stringOrObservable Converts plain Objects to [can-define/map/map DefineMaps], plain Arrays to [can-define/list/list DefineLists] and everything else to strings.  This is useful for routing.

@body

## Use

Use any of the type names on a [can-define.types.propDefinition]'s `type` or directly on the prototype of a [can-define/map/map DefineMap] or [can-define/map/map DefineList].

```js
import {DefineMap} from "can";

const Person = DefineMap.extend( {
	age: "number"
} );

const person = new Person( {age: "30"} );

console.log( person.age ); //-> 30
```
@codepen

You can also pass these functions in directly:


```js
import {DefineMap, define} from "can";

const Person = DefineMap.extend( {
	age: define.types.number
} );

const person = new Person( {age: "30"} );

console.log( person.age ); //-> 30
```
@codepen


And you can use the [can-data-types] types too:

```js
import {DefineMap, MaybeNumber} from "can";

const Person = DefineMap.extend( {
	age: MaybeNumber
} );

const person = new Person({age: "30"});

console.log( person.age ); //-> 30
```
@codepen
