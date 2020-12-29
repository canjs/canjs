@property {can-type.typeobject} can-type.any Any
@parent can-type/types 0
@description The `Any` type represents any type.

@signature `type.Any`

  Like an [identity function](https://en.wikipedia.org/wiki/Identity_function), `type.Any` is a [can-type.typeobject] that allows any type of a value to be allowed without checking or coercion.

  ```js
  import { ObservableObject, type } from "can";

  class EnvironmentVariable extends ObservableObject {
    static props = {
      value: type.Any
    };
  }

  let env = new EnvironmentVariable();
  env.value = 42;
  console.log(env.value); // -> 42

  env.value = null;
  console.log(env.value); // -> null

  env.value = [];
  console.log(env.value); // -> []

  env.value = new Date();
  console.log(env.value); // -> Date
  ```
  @codepen

  `type.Any` returns the same instance as passed into [can-reflect.convert] so they are referentially identical.

  ```js
  import { ObservableObject, type } from "can";

  class Schedule extends ObservableObject {
    static props = {
      firstPeriod: type.Any
    };
  }

  let today = new Date();
  let sched = new Schedule();
  
  sched.firstPeriod = today;

  console.log(sched.firstPeriod === today); // -> true
  console.log(sched.firstPeriod); // -> today
  ```
  @codepen
