@module {Object} can-value
@package ./package.json
@parent can-observables
@collection can-core
@description Get an observable that’s bound to a specific property on another object.
@group can-value/methods methods
@outline 2

@type {Object}

`can-value` exports an object with the following methods:

```js
{
  bind(object, keyPath)
  // Returns an observable for getting and setting a property on an object.

  from(object, keyPath)
  // Returns an observable for only getting a property on an object.

  returnedBy(getter)
  // Creates an observable that derives its value from other observable values.

  to(object, keyPath)
  // Returns an observable for only setting a property on an object.

  with(initialValue)
  // Creates an observable with an initial value that can be read, written, and observed.
}
```

@body

## Use

### Observable from an initial value

At its simplest, [can-value.with] can be used to
create an observable from another initial value.
As how an `age` observable being created in this next example:

```js
import { value } from "can";

const age = value.with(15);

console.log(age.value); //-> 15
```
@codepen
@highlight 3

Notice that [can-reflect/observe.onValue] can be used
to listen to changes. The following shows creating an 
`age` observable, reading it's value, then listening when 
`age` changes:

```js
import { value, Reflect as canReflect } from "can";

const age = value.with(15);

const handler = newValue => {
  console.log(newValue); //-> 18 ... time to Vote!
};

canReflect.onValue(observable, handler);
age.value = 18;
```
@codepen
@highlight 9

### Observable derived from other values

[can-value.returnedBy] can be used to create an
observable value that derives its value from other observable values. When the
derived values change, the observable's value will be updated automatically.

The following creates a `fullName` observable that derives its values from the
`first` and `last` observables. The value of the observable is read with `fullName.value`.
Notice how [can-reflect/observe.onValue] is used to listen when the observable value changes.
When one of the values from which the observable derives its value changed:

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
@highlight 6-8,16

### Bind to other objects

Use `can-value` when you need an observable that can get or set a property on an object.

In the example below, we use [can-value.bind] to get an observable that
can get _and_ set `outer.inner.key`:

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

[can-value.from] and [can-value.to] exist to create
observables that just get or just set properties on an object, respectively.
