@function can-bind.prototype.start start
@parent can-bind.prototype
@description Start listening to the child & parent observables and set their
values depending on their current state and the options provided to the binding
when initialized.
@signature `binding.start()`

This method turns on both the child and parent observable listeners by calling
[can-bind.prototype.startChild] and [can-bind.prototype.startParent].

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
```

Additionally, it tries to sync the values of the child and parent observables,
depending on:

1. Whether the child or parent is equal to `undefined`.
2. The values of the `onInitDoNotUpdateChild`, `onInitDoNotUpdateParent` and `onInitSetUndefinedParentIfChildIsDefined` options.
3. If it’s a one-way or two-way binding.

@body

## How initialization works

By default, the initialization works as diagrammed below
(with `onInitDoNotUpdateChild=false` and `onInitSetUndefinedParentIfChildIsDefined=true`):

```
Child start value      Parent start value     Child end value  Parent end value  API call

child=1           <->  parent=2           =>  child=2          parent=2          _updateChild(2)
child=1           <->  parent=undefined   =>  child=1          parent=1          _updateParent(1)
child=undefined   <->  parent=2           =>  child=2          parent=2          _updateChild(2)
child=undefined   <->  parent=undefined   =>  child=undefined  parent=undefined  _updateChild(undefined)
child=3           <->  parent=3           =>  child=3          parent=3          _updateChild(3)

child=1            ->  parent=2           =>  child=1          parent=1          _updateParent(1)
child=1            ->  parent=undefined   =>  child=1          parent=1          _updateParent(1)
child=undefined    ->  parent=2           =>  child=undefined  parent=undefined  _updateParent(undefined)
child=undefined    ->  parent=undefined   =>  child=undefined  parent=undefined  _updateParent(undefined)
child=3            ->  parent=3           =>  child=3          parent=3          _updateParent(3)

child=1           <-   parent=2           =>  child=2          parent=2          _updateChild(2)
child=1           <-   parent=undefined   =>  child=undefined  parent=undefined  _updateChild(undefined)
child=undefined   <-   parent=2           =>  child=2          parent=2          _updateChild(2)
child=undefined   <-   parent=undefined   =>  child=undefined  parent=undefined  _updateChild(undefined)
child=3           <-   parent=3           =>  child=3          parent=3          _updateChild(3)
```

To summarize the diagram above: by default, one-way bindings initialize however
the binding is set up. With one-way parent-to-child bindings, the parent always
sets the child; likewise, one-way child-to-parent bindings always set the
parent’s value to the child’s value. This is true even when one of them is
`undefined` and/or if they’re already the same value.

With two-way bindings, the logic is a little different: if one of the observable
values is `undefined`, it will be set to the value of the other observable. If
the child & parent conflict, the child’s value will be set to match the parent.

The `onInitDoNotUpdateChild` option can change how initialization works. This
option’s value is `false` by default, but if it’s set to `true`, then the child
will _never_ be set when the binding is initialized. This option does not effect
one-way child-to-parent bindings because the child’s value is never set when
that type of binding is initialized.

Below is the same diagram as above, except with the options
`onInitDoNotUpdateChild=true` and `onInitSetUndefinedParentIfChildIsDefined=true`:

```
Δ Child start value     Parent start value     Child end value  Parent end value  API call

Δ child=1           <-> parent=2           =>  child=1          parent=2          None
  child=1           <-> parent=undefined   =>  child=1          parent=1          _updateParent(1)
Δ child=undefined   <-> parent=2           =>  child=undefined  parent=2          None
Δ child=undefined   <-> parent=undefined   =>  child=undefined  parent=undefined  None
Δ child=3           <-> parent=3           =>  child=3          parent=3          None

Δ child=1           <-  parent=2           =>  child=1          parent=2          None
Δ child=1           <-  parent=undefined   =>  child=1          parent=undefined  None
Δ child=undefined   <-  parent=2           =>  child=undefined  parent=2          None
Δ child=undefined   <-  parent=undefined   =>  child=undefined  parent=undefined  None
Δ child=3           <-  parent=3           =>  child=3          parent=3          None
```

The `onInitDoNotUpdateParent` option can change how initialization works. This
option’s value is `false` by default, but if it’s set to `true`, then the parent
will _never_ be set when the binding is initialized. This option does not effect
one-way parent-to-child bindings because the parent’s value is never set when
that type of binding is initialized.

Below is a diagram that shows the change (Δ) from the default behaviour when `onInitDoNotUpdateParent=true`:

```
Δ	Child start value      Parent start value     Child end value  Parent end value  API call

	child=1           <->  parent=2           =>  child=2          parent=2          _updateChild(2)
Δ	child=1           <->  parent=undefined   =>  child=1          parent=undefined  None
	child=undefined   <->  parent=2           =>  child=2          parent=2          _updateChild(2)
	child=undefined   <->  parent=undefined   =>  child=undefined  parent=undefined  _updateChild(undefined)
	child=3           <->  parent=3           =>  child=3          parent=3          _updateChild(3)

Δ	child=1            ->  parent=2           =>  child=1          parent=2          None
Δ	child=1            ->  parent=undefined   =>  child=1          parent=undefined  None
Δ	child=undefined    ->  parent=2           =>  child=undefined  parent=undefined  None
Δ	child=undefined    ->  parent=undefined   =>  child=undefined  parent=undefined  None
Δ	child=3            ->  parent=3           =>  child=3          parent=3          None
```
