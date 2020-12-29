@function can-bind.prototype.startParent startParent
@parent can-bind.prototype
@description Start listening to the parent observable.
@signature `binding.startParent()`

This method checks whether the binding should listen to the parent; if it should
and it hasn’t already started listening, then it will start listening to the
`parent` and update the `child` in the `queue`
provided when the binding was initialized.

Usually you would want to [can-bind.prototype.start] the `child` and `parent`
listeners at the same time, but calling `startParent` first and then calling
[can-bind.prototype.start] later is useful when the child value hasn’t been
initialized, as is the case with [can-stache-bindings] where we create the
binding, read the [can-bind.prototype.parentValue], then create the child with
all of the parent values.

The example below shows a hypothetical scenario (with a
[hypothetical API, `can-value.returnedBy`](https://github.com/canjs/can-value/issues/5))
in which the child’s value isn’t really created until after `startParent` has
been called:

```js
import Bind from "can-bind";
import DefineMap from "can-define/map/map";
import value from "can-value";

let childMap;// Will be set later
const parentMap = new DefineMap({parentProp: "parent value"});

// Create the binding
const binding = new Bind({
  child: value.returnedBy(function() {
    return childMap.childProp;
  }),
  parent: value.bind(parentMap, "parentProp")
});

// Turn on just the parent listener
binding.startParent();

// Now we can get the parent’s value to create the child
childMap = new DefineMap({
  childProp: binding.parentValue
});

// Now turn on the child listener
binding.start();
```
