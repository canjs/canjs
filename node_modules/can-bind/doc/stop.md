@function can-bind.prototype.stop stop
@parent can-bind.prototype
@description Stop listening to the observables.
@signature `binding.stop()`

This method turns off both the child and parent observable listeners.

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

// Turn on the binding
binding.start();

// ... some other code

// Turn off the binding
binding.stop();
```
