@function can-bind.prototype.startChild startChild
@parent can-bind.prototype
@description Start listening to the child observable.
@signature `binding.startChild()`

This method checks whether the binding should listen to the child; if it should
and it hasn’t already started listening, then it will start listening to the
`child` and update the `parent` in the `queue`
provided when the binding was initialized.

```js
import Bind from "can-bind";
import DefineMap from "can-define/map/map";
import value from "can-value";

const childMap = new DefineMap({childProp: "child value"});
const parentMap = new DefineMap({parentProp: "parent value"});

// Create the binding
const binding = new Bind({
  child: value.bind(childMap, "childProp"),
  parent: value.bind(parentMap, "parentProp")
});

// Turn on just the child listener
binding.startChild();
```
