@function can-fixture.rand rand
@parent can-fixture.properties

@description Returns a random integer.

@signature `fixture.rand(min, max)`

  Returns a random integer in the range [`min`, `max`]. If only one argument is provided,
  returns a random integer from [`0`, `max`].

  ```js
  import {fixture} from "can";

  console.log( fixture.rand( 1, 10 ) ); //-> Random number between 1 and 10 inclusive.
  console.log( fixture.rand( 10 ) ); //-> Random number between 0 and 10 inclusive.
  ```
  @codepen

  @param {Number} [min] The lower limit of values that will be returned.
  @param {Number} max The upper limit of values that will be returned.  `max` is valid return value.

  @return {Number} A number inclusive between `min` and `max`.

@signature `fixture.rand(choices, min, max)`

  An array of between min and max random items from choices. If only `min` is
  provided, `max` will equal `min`.  If both `max` and `min` are not provided,
  `min` will be 1 and `max` will be `choices.length`.

  ```js
  import {fixture} from "can";

  // pick a random number of items from an array
  console.log( fixture.rand( [ "a", "b", "c" ] ) ); //-> ["c"]

  // pick one item from an array
  console.log( fixture.rand( [ "a", "b", "c" ], 1 ) ); //-> ["c"]

  // get one item from an array
  console.log( fixture.rand( [ "a", "b", "c" ], 1 )[ 0 ] ); //-> "b"

  // get 2 or 3 items from the array
  console.log( fixture.rand( [ "a", "b", "c" ], 2, 3 ) ); //-> ["c","a","b"]
  ```
  @codepen

  @param {Array} choices An array of values to chose from. The returned array will only include a value once.
  @param {Number} [min] The minimum number of items to be in the returned array.
  @param {Number} [max] The maximum number of items in the returned array.

  @return {Array} an array between `min` and `max` random items from the choices array.
