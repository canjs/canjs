@function can-value.returnedBy returnedBy
@parent can-value/methods

@description Creates an observable that derives its value from other observable values.

@signature `value.returnedBy( getter(), context )`

  Creates an observable value that can be read and observed using [can-reflect].

  The following creates a `fullName` observable that derives its values from the
  `person` observable. The value of the observable is read with `fullName.value`:

  ```js
  import { value, Reflect as canReflect } from "can";

  const first = value.with("Grace");
  const last = value.with("Murray");

  const fullName = value.returnedBy(() => {
    return first.value + " " + last.value;
  });

  console.log(fullName.value); //-> "Grace Murray"

  const handler = newValue => {
    console.log(newValue); //-> "Grace Hopper"
  };

  canReflect.onValue(fullName, handler);
  last.value = "Hopper";
  ```
  @codepen

  @param {function} getter A function that returns the value being observed.

  @param {Object} [context] An optional context that will be used as the `this` of `getter`.

  @return {Object} An observable compatible with [can-reflect.getValue]. It also has a `value` property that can
  be used to get and set the value.

@signature `value.returnedBy( getter(lastSet), context, initialValue )`

  Creates an observable value that can be set.  When the `getter` function takes an
  argument, the `getter` function will be passed whatever the observable was last set to.

  This form is similar to [can-value.with].  But it can be used to "clean up" values as follows:

  ```js
  import { value } from "can";

  var age = value.returnedBy(function(lastSet){
    return lastSet == null ? 0 : +lastSet;
  });
  console.log(age.value); //-> 0
  age.value = "5";
  console.log(age.value); //-> 5
  ```
  @codepen

  @param {function(any)} getter(lastSet) A function that returns the value being observed.

  @param {Object} [context] An optional context that will be used as the `this` of `getter`.

  @param {Object} [initialValue] The initial `lastSet` value.

  @return {Object} An observable compatible with [can-reflect.getValue]
  and [can-reflect.setValue]. It also has a `value` property that can
  be used to get and set the value.
