@property can-bind.prototype.parentValue parentValue
@parent can-bind.prototype
@description Returns the parent’s value.
@signature `binding.parentValue`

The example below shows creating a new binding and then reading the parent’s
value with `parentValue`:

```js
import Bind from "can-bind";
import DefineMap from "can-define/map/map";
import value from "can-value";

const parentMap = new DefineMap({parentProp: "parent value"});
const parent = value.bind(parentMap, "parentProp");

const childMap = new DefineMap({childProp: "child value"});
const child = value.bind(childMap, "childProp");

const binding = new Bind({
  child: child,
  parent: parent
});

binding.parentValue; // is "parent value"
```

Using `parentValue` is the equivalent of using [can-reflect] to get the value:

```js
import canReflect from "can-reflect";

const parentValue = canReflect.getValue(parent);
```

The `parentValue` property is most commonly used with
[can-bind.prototype.startParent]; see its documentation for more details.
