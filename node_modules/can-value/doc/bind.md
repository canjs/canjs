@function can-value.bind bind
@parent can-value/methods

@description Get an observable for getting and setting a property on an object.

@signature `value.bind( object, keyPath )`

  In the example below, a `keyObservable` is created that is two-way bound to the
  value at `outer.inner.key`. When `keyObservable.value` changes,
  `outer.inner.key` is updated, and vice versa.

  ```js
  import { ObservableObject, value } from "can";

  const outer = new ObservableObject({
    inner: {
      key: "hello"
    }
  });

  const keyObservable = value.bind(outer, "inner.key");

  // reading `keyObservable.value`, we get the value at `outer.inner.key`
  console.log(keyObservable.value); //-> "hello"

  // writing to `keyObservable.value` will change the value at `outer.inner.key`
  keyObservable.value = "aloha";
  console.log(outer.inner.key); //->"aloha"
  ```
  @codepen

  @param {Object} object The object from which to read.

  @param {String} keyPath A String of dot-separated keys, representing a path of properties.

  @return {Object} An observable compatible with [can-reflect.getValue]
  and [can-reflect.setValue]; it also has a `value` property that can
  be used to get and set the value.
