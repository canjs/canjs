@function can-value.with with
@parent can-value/methods

@description Creates an observable value from an initial value.

@signature `value.with( initialValue )`

  Creates an observable value can be read and written with the `value` property.
  It can observed using [can-reflect].

  ```js
  import { value } from "can";

  const number = value.with("one");
  console.log(number.value); //-> "one"

  number.value = "two";
  console.log(number.value); //-> "two"

  const handler = function(newValue) {
    console.log(newValue); //-> "three"
  };
  canReflect.onValue(number, handler);
  number.value = "three";

  canReflect.offValue(number, handler);
  ```
  @codepen

  @param {*} initialValue The initial value of the observable.

  @return {Object} An observable. Getting and setting the observable
  should be done with the `value` property. It is compatible with 
  [can-reflect.getValue] and [can-reflect.setValue], as a secondary
  option.
