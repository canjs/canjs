@module {function} can-deep-observable
@parent can-observables
@collection can-ecosystem
@alias can.DeepObservable
@package ./package.json
@outline 2
@templateRender true

@description Create observable objects where nested objects and arrays are also observable.

@signature `canReflect.new(DeepObservable, data)`

Creates an observable object with `data`, where inner objects and arrays are converted to [can-observable-object] and [can-observable-array] types.

```js
import { DeepObservable, Reflect as canReflect } from "can";

let obj = canReflect.new(DeepObservable, {
  inner: {
    prop: "value"
  }
});

obj.inner.on("prop", (ev, newVal) => {
  console.log(newVal); // -> "new value"
});

obj.inner.prop = "new value";
```
@codepen

  @param {Object} A plain object from which observable values will derive.
  @return {can-deep-observable} A new `DeepObservable` object.

@signature `prop: DeepObservable`

Create a new property on [can-observable-object] that is a deep observable object.

```js
import { ObservableObject, DeepObservable } from "can";

class Faves extends ObservableObject {
  static props = {
    config: DeepObservable
  };
}

let faves = new Faves({
  config: {
    inner: {
      config: "values"
    }
  }
});

faves.config.inner.on("config", (ev, newVal) => {
  console.log("New value:", newVal); // -> { enabled: true }
});

faves.config.inner.config = { enabled: true };
```
@codepen

@body

## Use

__DeepObservable__ is a type that turns an object, and nested objects, into [can-observable-object ObservableObjects] and [can-observable-array ObservableArrays].

It's most useful as a way to take plain objects which have no definable structure, but nevertheless need to be observable. Since you can't predefine these objects on [can-observable-object ObservableObjects], you can instead use DeepObservable as the type.

```js
import { ObservableObject, DeepObservable, restModel } from "can";

class ServiceData extends ObservableObject {
  static props = {
    options: DeepObservable
  }
}

ServiceData.connection = restModel({
    Map: ServiceData,
    url: "/api/data/{id}"
});

ServiceData.get({ id: "1" }).then(data => {
  data.options.nested.props...
});
```
