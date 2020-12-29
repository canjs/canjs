@function can-value.to to
@parent can-value/methods

@description Get an observable for setting (but not getting) a property on an object.

@signature `value.to( object, keyPath )`

  In the example below, a `keyObservable` is created that is one-way bound to the
  value at `outer.inner.key`. When `keyObservable.value` changes,
  `outer.inner.key` is updated, but changes to `outer.inner.key` do not update
  `keyObservable.value`.

  ```js
  import { ObservableObject, value } from "can";

  const outer = new ObservableObject({
    inner: {
      key: "hello"
    }
  });

  const keyObservable = value.to(outer, "inner.key");

  keyObservable.value = "aloha";
  console.log(outer.inner.key); //-> "aloha"
  ```
  @codepen

  @param {Object} object The object from which to read.

  @param {String} keyPath A String of dot-separated keys, representing a path of properties.

  @return {Object} An observable compatible with [can-reflect.setValue]
  but not [can-reflect.getValue]; it also has a `value` property that
  can be used to set the value.
