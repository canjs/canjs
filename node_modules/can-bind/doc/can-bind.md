@module {Function} can-bind
@package ../package.json
@parent can-observables
@collection can-infrastructure
@description Updates one observable value with the value of another observable.
@group can-bind.prototype prototype

@signature `new Bind(options)`

[can-bind] is used to keep two observable values in sync with each other. These
two observable values, the `child` and `parent`, can be tied together by a
couple of core options:

- `childToParent`: when the child’s value changes, update the parent.
- `parentToChild`: when the parent’s value changes, update the child.

If only one of these two options is true, we call that a “one-way binding;”
likewise, if both are true, then it’s a two-way binding.

Here’s an example of setting up a two-way binding:

```js
import Bind from "can-bind";
import DefineMap from "can-define/map/map";
import value from "can-value";

const childMap = new DefineMap({childProp: "child value"});
const parentMap = new DefineMap({parentProp: "parent value"});

const binding = new Bind({
  child: value.bind(childMap, "childProp"),
  parent: value.bind(parentMap, "parentProp")
});
```

[can-bind] gives you more options to control how the binding works; see the
documentation below for a brief explanation of each option, and read further
below to learn more about options such as `cycles`, `onInitDoNotUpdateChild`, `onInitDoNotUpdateParent`,
`onInitSetUndefinedParentIfChildIsDefined`, and `sticky`.

New [can-bind] instances have the following methods:

- [can-bind.prototype.start]: turn on both bindings (if they’re not already turned on) and sync the values (depending on the options passed in)
- [can-bind.prototype.startChild]: turn on just the child binding
- [can-bind.prototype.startParent]: turn on just the parent binding
- [can-bind.prototype.stop]: turn off both bindings

The binding instance also has one property, [can-bind.prototype.parentValue],
which returns the value of the parent observable.

  @param {Object} options An object with multiple options:
    - **child** `{ObservableValue|ObservableEmitter}`: Required; the child observable. It should support either [can-symbol/symbols/onValue can.onValue symbol] or [can-symbol/symbols/onEmit can.onEmit symbol] methods.  If [can-symbol/symbols/onEmit can.onEmit symbol] is provided, the parent value will be updated whenever a value is emitted.  If [can-symbol/symbols/onValue can.onValue symbol] is provided, the parent value will be updated whenever the value changes.
    - **childToParent** `{Boolean}`: Optional; by default, [can-bind] will check if the child has the [can-symbol/symbols/getValue can.getValue symbol] and either `setParent` is provided or the parent has the [can-symbol/symbols/setValue can.setValue symbol]; providing this option overrides those checks with the option’s value (e.g. `false` will force the binding to be one-way parent-to-child).
    - **cycles** `{Number}`: Optional; defaults to `0`. When an observable’s value is changed in a two-way binding, the number of times it can be changed again as a result of setting the other observable. This can be any number greater than 0 if `sticky` is undefined; otherwise, an error will be thrown if this is provided with `sticky`.
    - **onInitDoNotUpdateChild** `{Boolean}`: Optional; defaults to `false`. If `true`, then never set the child when starting a binding.
    - **onInitDoNotUpdateParent** `{Boolean}`: Optional; defaults to `false`. If `true`, then never set the parent when starting a binding.
    - **onInitSetUndefinedParentIfChildIsDefined** `{Boolean}`: Optional; defaults to `true`: when the binding is started, if the parent’s value is undefined and the child’s value is defined, then set the parent to the child’s value.
    - **parent** `{ObservableValue|ObservableEmitter}`: Required; the parent observable. It should support either [can-symbol/symbols/onValue can.onValue symbol] or [can-symbol/symbols/onEmit can.onEmit symbol] methods.  If [can-symbol/symbols/onEmit can.onEmit symbol] is provided, the child value will be updated whenever a value is emitted.  If [can-symbol/symbols/onValue can.onValue symbol] is provided, the child value will be updated whenever the value changes.
    - **parentToChild** `{Boolean}`: Optional; by default, [can-bind] will check if the parent has the [can-symbol/symbols/getValue can.getValue symbol] and either `setChild` is provided or the child has the [can-symbol/symbols/setValue can.setValue symbol]; providing this option overrides those checks with the option’s value (e.g. `false` will force the binding to be one-way child-to-parent).
    - **priority** `{Number}`: Optional; a number to [can-reflect/setPriority set as the priority] for the child and parent observables.
    - **queue** `{String}`: Optional (by default, `"domUI"`); the name of the queue in which to listen for changes. Acceptable values include `"notify"`, `"derive"`, and `"domUI"`.
    - **setChild** `{function(parentValue, child)}`: Optional; a custom function for setting the child observable’s value. This function is called in the `queue` provided. Arguments to the function include:
      - **parentValue** `{*}`: the parent’s value.
      - **child** `{ObservableValue}`: the child observable.
    - **setParent** `{function(childValue, parent)}`: Optional; a custom function for setting the parent observable’s value. This function is called in the `queue` provided. Arguments to the function include:
      - **childValue** `{*}`: the child’s value.
      - **parent** `{ObservableValue}`: the parent observable.
    - **sticky** `{String}`: Optional; defaults to `undefined`. Right now `"childSticksToParent"` is the only other allowed value, and it will try to make the child matches the parent’s value after setting the parent.
    - **updateChildName** `{String}`: Optional; a debugging name for the function that listens to the parent’s value and updates the child.
    - **updateParentName** `{String}`: Optional; a debugging name for the function that listens to the child’s value and updates the parent.
  @return {can-bind} A new binding instance.

@body

## Use

[can-bind] is mostly used as infrastructure for modules like [can-route] and
[can-stache-bindings], but you might find it useful in your application if you
need to bind the values of two observables together. Let’s look at an example
from [can-component]’s documentation:

```js
import Component from "can-component";

Component.extend({
  tag: "my-app",
  ViewModel: {
    connectedCallback: function() {
      this.listenTo( "websitesCount", function( event, count ) {
        this.paginate.count = count;
      } );
      return this.stopListening.bind( this );
    },
    paginate: {
      value: function() {
        return new Paginate( {
          limit: 5
        } );
      }
    },
    websitesCount: {
      get: function( lastValue, setValue ) {
        this.websitesPromise.then( function( websites ) {
          setValue( websites.count );
        } );
      }
    },
    websitesPromise: {
      get: function() {
        return Website.getList( {
          limit: this.paginate.limit,
          offset: this.paginate.offset
        } );
      }
    }
  }
} );
```
@highlight 7-10,only

In this example, we [can-event-queue/map/map.listenTo] the `websitesCount`
property for changes so we can update the `paginate.count` property.

This can be better expressed with [can-bind] and [can-value]:

```js
import Bind from "can-bind";
import Component from "can-component";
import value from "can-value";

Component.extend({
  tag: "my-app",
  ViewModel: {
    connectedCallback: function() {
      const binding = new Bind({
        parent: value.from(this, "websitesCount"),
        child: value.to(this, "paginate.count")
      });
      binding.start();
      return binding.stop.bind(binding);
    },
    paginate: {
      value: function() {
        return new Paginate( {
          limit: 5
        } );
      }
    },
    websitesCount: {
      get: function( lastValue, setValue ) {
        this.websitesPromise.then( function( websites ) {
          setValue( websites.count );
        } );
      }
    },
    websitesPromise: {
      get: function() {
        return Website.getList( {
          limit: this.paginate.limit,
          offset: this.paginate.offset
        } );
      }
    }
  }
} );
```
@highlight 9-14,only

[can-value] is used to get the value [can-value.from] `websitesCount` and
assign it [can-value.to] `paginate.count`. You’ll want to immediately
[can-bind.prototype.start] the binding and then return the
[can-bind.prototype.stop] method from [can-component/connectedCallback] so the
binding is turned off when the component is torn down.

### Customizing how the child & parent are set

You can optionally provide `setChild` and/or `setParent` functions to customize
how the child and parent values are set.

Here’s an example that’s similar to what [can-route] does to bind a page’s URL
(a string) to the app’s state (an object):

```js
import Bind from "can-bind";
import DefineMap from "can-define/map/map";
import deparam from "can-deparam";
import Observation from "can-observation";
import param from "can-param";
import SimpleObservable from "can-simple-observable";

// The parent will be a string
const parent = new SimpleObservable("prop=value");

// The child will be an object
const map = new DefineMap({});
const child = new Observation(function() { return map.serialize(); });

// Set up the binding
const binding = new Bind({
  child: child,
  parent: parent,
  setChild: function(newValue) {
    const objectValue = deparam(newValue);
    map.update(objectValue);
  },
  setParent: function(newValue) {
    const stringValue = param(newValue);
    parent.set(stringValue);
  }
});

// Turn on the binding
binding.start();
```

Given the binding above, when the parent’s value changes (for example):

```js
parent.set("prop=15");
```

[can-bind] will call `setChild("prop=15")`, so the child’s value is converted to
`{prop: "15"}`.

Likewise, when the child’s value changes:

```js
map.set({
	prop: 22
});
```

[can-bind] will call `setParent({ prop: 22 })`, so the parent’s value is
converted to `"prop=22"`.

## How initialization works

When [can-bind.prototype.start] is called, it starts listening for changes to the
child & parent observables and then tries to sync their values, depending on:

1. Whether the child or parent is equal to `undefined`.
2. The values of the `onInitDoNotUpdateChild`, `onInitDoNotUpdateParent` and `onInitSetUndefinedParentIfChildIsDefined` options.
3. If it’s a one-way or two-way binding.

See the [can-bind.prototype.start] documentation for more information about how
initialization works.

## How cycles & stickiness work

There are two options that dictate how two-way bindings work:

- `cycles`: the number of times an observable can be updated as a result of the other observable being updated.
- `sticky`: if `"childSticksToParent"`, then [can-bind] will try to make the child match the parent’s value after the parent is set (if they do not already match).

Both of these options are described in more detail below.

### Cycles

The `cycles` option restricts the number of times a loop can be made while
updating the child or parent observables.

Let’s imagine child and parent observables that always increment their value by
one when they’re set:

```js
import Bind from "can-bind";
import SettableObservable from "can-simple-observable/settable/settable";

const child = new SettableObservable(function(newValue) {
	return newValue + 1;
}, null, 0);
const parent = new SettableObservable(function(newValue) {
	return newValue + 1;
}, null, 0);

const binding = new Bind({
  child: child,
  parent: parent
});
```

If we set the child’s value to 1 (`child.set(1)`), it’ll increment its value to
2, then set the parent to 2, which will increment its value to 3, then set the
child… we’re in an infinite loop!

The `cycles` option protects against that: whichever value you set first, it
will only allow that value to be set `cycles` number of times as a result of the
binding.

In our example, with `cycles: 0`, the child would not be updated to 3. If
`cycles: 1`, then the child could be updated to 3 (and increment itself to 4),
then set the parent to 4 (which would be incremented to 5); one additional loop
is allowed, but no more.

### Stickiness

The `sticky` option adds another behavior as part of the update process.

When [can-bind]’s internal `_updateParent` method is called, the parent’s value is set to
the child’s value. With `sticky: "childSticksToParent"`, the parent’s value is
checked _after_ it’s set; if it doesn’t match the child’s value, then the child
is set to the parent’s new value.

This option is useful when the parent changes its own value, which might include
ignoring the value it is being set to.

Let’s imagine a parent observable that ignores being set to `undefined`:

```js
import Bind from "can-bind";
import canReflect from "can-reflect";
import SimpleObservable from "can-simple-observable";

// Both the child & parent values start at 15
const child = new SimpleObservable(15);
const parent = new SimpleObservable(15);

// If something tries to set the parent to undefined, ignore it
canReflect.assignSymbols(parent, {
  "can.setValue": function(newVal) {
    if (newVal !== undefined) {
      this.set(newVal);
    }
  }
});

// Create a two-way binding with sticky: "childSticksToParent"
const binding = new Bind({
  child: child,
  parent: parent,
  sticky: "childSticksToParent"
});
```

If we set the child’s value to `undefined` (`child.set(undefined)`),
[can-bind]’s internal `_updateParent` method will be called to set the parent to
`undefined`; this will be ignored, so the parent’s value will remain at `15`.
With the `sticky: "childSticksToParent"` option, [can-bind] will see that the
child and parent values are not the same, and will set the child to the parent’s
value (`15`).

## Debugging

### Naming functions

[can-bind] sets up an internal `_updateChild` method to listen for changes to the
parent; when it changes, [can-bind] updates the child to match the parent.
Likewise, its internal `_updateParent` method listens for changes to the child;
when it changes, [can-bind] updates the parent to match the child.

If you provide the `updateChildName` and `updateParentName` options, [can-bind]
will assign those names to their respective update functions so they show up
better in a debugger. For example, providing `updateChildName` will name
[can-bind]’s internal `_updateChild` method, so if you have a breakpoint when the child is
set, you can see this name in the debugger.

### Mutation dependency data

[can-bind] automatically sets up the correct [can-reflect-dependencies] mutation
data for both the child and the parent. For example, when
[can-bind.prototype.start] is called on a one-way child-to-parent binding,
[can-bind] will call [can-reflect-dependencies.addMutatedBy] to register the
child as a mutator of the parent and set the `@@can.getChangesDependencyRecord`
symbol on [can-bind]’s internal `_updateParent` method to indicate that it mutates the
parent.

When [can-bind.prototype.stop] is called, [can-bind] tears down the mutation
dependency data it sets up by calling [can-reflect-dependencies.deleteMutatedBy]
and removing the `@@can.getChangesDependencyRecord` symbol from the update
function(s).

## Warnings

### can-bind: attempting to update

In some circumstances, you might come across a warning like this with a two-way
binding:

```
can-bind: attempting to update parent SettableObservable<PARENT> to new value: 3
…but the parent semaphore is at 0 and the child semaphore is at 1. The number of allowed updates is 0.
The parent value will remain unchanged; it’s currently: 2.
Read https://canjs.com/doc/can-bind.html#Warnings for more information. Printing mutation history:
```

In summary, [can-bind] is trying to warn you that it could not make the child
and parent values match. This might indicate that there’s a bug in your code.

Let’s look again at the example in the cycles section above:

```js
import {Bind, value} from "can";

// Child and parent observable values
const parent = value.returnedBy(function PARENT(newValue){
	return newValue + 1;
}, null, 0);

const child = value.returnedBy(function CHILD(newValue){
	return newValue + 1;
}, null, 1);

// Create and start the binding
const binding = new Bind({
  parent: parent,
  child: child
});
binding.start();

// Set the parent to 1
parent.set(1);
```

In the example above, both the child and parent values will increment themselves
by 1 every time they’re set. When `parent` is set to 1, it will increment itself
to 2; [can-bind] listens for when the parent changes and
will set the child to 2, and it will increment itself to 3. [can-bind]’s
internal `_updateParent` listener will then try to set the `parent` to
3, but because `cycles` is 0 by default, an infinite loop will be prevented.

[can-bind] will show you a warning in this circumstance. Let’s look at parts of
the error message again:

> can-bind updateValue: attempting to update parent SettableObservable<> to new value: 3

This is saying that [can-bind] is trying to set the parent’s value to 3
(because that’s the child’s new value).

> …but the parent semaphore is at 0 and the child semaphore is at 1. The number of allowed updates is 0.

A semaphore is used to keep track of the number of updates to the child and
parent values within one cycle. This is explained more in the
[how it works](#Howitworks) section below, but to explain what it means here:
the child was updated 1 time in response to the parent being changed, but there
are 0 updates allowed (this number is 2 * `cycles`, which is 0 by default). This
is how [can-bind] determined that it shouldn’t allow the parent to be set again.

> The parent value will remain unchanged; it’s currently: 2

Since the parent won’t be update to the child’s new value, it will remain at its
current value (2 in this example).

CanJS will also print out the mutations that caused the changes and their logStack:

```
child SettableObservable<CHILD> set.
parent SettableObservable<PARENT> NOT set.
```

Read [can-queues.logStack] for more information about what is printed here.

## How it works

> **Note:** this section is non-normative and is only provided as a reference to
> _why_ [can-bind] works the way it does. The implementation described in this
> section is subject to change between releases. Do not depend on any of this
> information when using [can-bind].

### How does initialization work with the cycles and sticky options?

[can-bind]’s initialization code is meant to replicate
[how can-stache-bindings used to work](https://github.com/canjs/can-stache-bindings/blob/82ce7c98fdccd6558d3c908b6b7b183e1258b0d2/can-stache-bindings.js#L1026-L1054).
See the [can-bind.prototype.start] documentation for more information about how
the values are synchronized.

### In a two-way binding, what’s the difference between a value being the child vs. parent?

[can-stache-binding’s old binding code](https://github.com/canjs/can-stache-bindings/blob/82ce7c98fdccd6558d3c908b6b7b183e1258b0d2/can-stache-bindings.js#L655-L772)
had very different different code paths for updating the child and parent values.
This included only have a single semaphore to track cyclical updates, sometimes
calling [can-reflect.setValue] in a batch, and only implementing “stickiness” on
one side of the binding (parent setting child).

In [can-bind], all of those differences go away; the child and parent listeners
are implemented exactly the same. The only difference in how the child and parent
values are treated is how initialization works; read the
[can-bind.prototype.start] documentation for more information about how the
`onInitDoNotUpdateChild` and `onInitSetUndefinedParentIfChildIsDefined` options
influence how the two values are set when the binding is turned on.

### On init, why do we call \_updateChild/\_updateParent instead of setChild/setParent?

Let’s say we have a two-way binding with a defined parent and `undefined` child.
When the binding is initialized, the child’s value will be set to match the
parent (because the child is `undefined`). The listeners are already active when
the initial values are set, so the child listener will fire and want to update
the parent to match the child. This is prevented by the semaphore that’s
incremented when `_updateParent` is called.
