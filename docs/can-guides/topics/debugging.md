@page guides/debugging Debugging
@parent guides/essentials 6

@description Learn how to debug CanJS applications.

@body

CanJS has many utilities that help you understand how an application behaves and
discover common problems. This guide is a central list for those utilities. It introduces
those utilities and highlights when they are useful.

## Set Up Debugging

CanJS does not have a single global export; instead, every module must be imported. While this
improves longevity, it makes access to debugging utilities difficult.  The [can-debug]
package adds a `can` object to the global window, making all of CanJS's packages
available.

For example, `can-queue`'s [can-queues.logStack] method can be called like:

```js
import { queues } from "can";
queues.logStack();
```

However, if any part of your application enables [can-debug], you can log the stack like:

```js
can.queues.logStack()
```
The following sections show how to enable [can-debug]:

### ES Module Setup

If you are using the [core](guides/setup.html#ImportingthecoreESmodulebundle) or [ecosystem](guides/setup.html#ImportingtheecosystemESmodulebundle) ES module bundle, [can-debug] will be enabled automatically in development mode.

To use [can-debug] with a minified ES module bundle, you will need to import it from the ecosystem bundle and enable it yourself:

```js
import { debug } from "can/ecosystem.min";
debug();
```

> NOTE: When first accessing properties on the global `can`, a warning will be logged. This is to discourage
> relying on the global `can` object.

If you are using [individual packages](guides/setup.html#Installingindividualpackages), the following sections show how to set up [can-debug] so that it will be enabled __only__ in development using Webpack and StealJS:

### StealJS setup

StealJS supports two ways of loading `can-debug` only in production:

- `//!steal-remove-start` comments
- conditional modules

#### Using steal-remove-start comments

Add the following to your main module:

```js
//!steal-remove-start
import { debug } from "can";
debug();
//!steal-remove-end
```

#### Conditional loading

Conditional loading makes it possible to load a module only when another module's export evaluates to `true`. To start, we'll create an `is-dev` module:

```js
// is-dev.js
export default !steal.isEnv("production");
```

Then we can conditionally load modules like:

```js
import debug from "can-debug#?~is-dev";
if (debug) {
	debug();
}
```

### WebPack Setup

To import the debug module only in development, add the following
code to your main module:

```js
if (process.env.NODE_ENV !== "production") {
    const debug = require("can-debug");
		debug();
}
```

Then, make sure `process.env` is defined in `webpack.config.js`
with the following:

```js
const webpack = require("webpack");

module.exports = {
    ...
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]
};
```

## Provide useful debugger names

CanJS tries to create useful names to help identify the objects and
functions in your application. It uses [can-reflect]'s [can-reflect.getName]
to return a useful debugger name.  By default objects are named using the following convention:

- The name starts with the observable constructor name, ex: `DefineMap`.
- The constructor name is decorated with the following characters based on its type:
  - `<>`: for value-like observables, ex: `SimpleObservable<>`
  - `[]`: for list-like observables, ex: `DefineList[]`
  - `{}`: for map-like observables, ex: `DefineMap{}`
- Any property that makes the instance unique (like ids) are printed inside the characters mentioned before.

You can assist by naming your types and functions wherever possible. The follow sections list how:

#### Provide a name to types built with [can-construct]

If you are using [can-map], [can-define/map/map] or any other package that inherits from [can-construct],
name your function by passing `.extend` a name as the first argument:

```js
import { DefineMap } from "can";

export default DefineMap.extend("TheNameOfMyType", { ... })
```

#### Label instances

[can-reflect]'s [can-reflect.setName] method can be used to uniquely name a particular object:

```js
can.reflect.setName(person, "Person{Justin}");
```

#### Name anonymous functions

If you bind to an observable, instead of an anonymous function handler, use function declarations or named function
expressions:

```js
// INSTEAD OF THIS:
map.on("key", function(ev, newVal) { ... })

// DO THIS:
map.on("key", function keyChanged(ev, newVal) { ... })
```

Similarly, if you create [can-compute]s or [can-observation]s yourself, make sure the function
passed has a name:

```js
// INSTEAD OF THIS:
new Observation(function(){
    return map.first + " " + map.last;
});

// DO THIS:
new Observation(function fullName(){
    return map.first + " " + map.last;
});
```

> NOTE: If your function is a property on an observable map or list like [can-define/map/map],
> you don't have to name it.  For example, CanJS will name the `fullName` getter in the following example:
> ```js
> DefineMap.extend("Person",{
>   fullName: {
>     get: function(){ return this.first + " " + this.last; }
>   }
> })
> ```


## Debug what caused a observable event or update to happen.

Your browser's developer tools provide a stack trace that represents
what caused the current function to run.

However, what caused a function to
run isn't always obvious by looking at the stack trace because CanJS runs
functions within [can-queues].

Consider the following code that derives an info value from the person observable:

```js
const person = new observe.Object({name: "Fran", age: 15});

const info = new Observation(function updateInfo(){
    return person.name + " is " + person.age;
});

info.on(function onInfoChanged(newVal){
    debugger;
})

person.age = 22;
```

Say you wanted to know why `onInfoChanged` was called, so you inserted the `debugger` above. When
the debugger was hit, you can enter [can-queues.logStack] in the console to see the enqueued tasks that resulted
in `onInfoChanged` being run:

```js
can.queues.logStack();
```

The following video shows using `logStack`:

<iframe width="560" height="315" src="https://www.youtube.com/embed/L0hR5ic_FvE" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>


[can-queues.log can.queues.log] can be used to log when a
task is enqueued and flushed.  Often, you only want to log when
tasks are run. This can be done with:

```js
can.queues.log("flush")
```

Both `queues.logStack()` and `queues.log()` log the function
that was run, its context (`this`), arguments and a `meta`
object that includes information such as why the task
was enqueued.

## Understand what changes an observable or what an observable changes.

[can-debug]'s [can-debug.logWhatChangesMe] logs the observables
that change a value. It logs both:

- observables that mutate the value through CanJS libraries (example: `<component viewModelProp:from="value">`).
- observables that are source values from a computed property
  (example: `get fullName(){ return this.first + " " + this.last }`

You can log what changes CanJS observables and DOM elements:

```js
can.debug.logWhatChangesMe(me, "fullName");
can.debug.logWhatChangesMe(document.querySelector("h1.name"));
```

[can-debug]'s [can-debug.logWhatIChange] reverses [can-debug.logWhatChangesMe]
and logs what observables are changed by an observable value:

```js
can.debug.logWhatIChange(me, "first");
can.debug.logWhatIChange(document.querySelector("input[name=first]"));
```

Finally, [can-debug.drawGraph] can draw these relationships in a graph like the following:

<img src="../../node_modules/can-debug/doc/map-dependency-graph.png"
  class="bit-docs-screenshot"
  alt="A visual representation of an observable's dependency graph"
  width="600px"/>

## Access a component's view-model.

Use [can-view-model] to access a component's viewModel:

```js
can.viewModel(document.querySelector("my-component"));
```

## Log when an observable changes.

Most of CanJS's observables have a log method that can be used to log when its state changes:

```js
map.log();
```

This can be quite useful when used with [can-view-model]:

```js
can.viewModel(document.querySelector("my-component")).log();
```

CanJS's observable map-types like [can-define/map/map] can be passed
a property name and log when that property changes:

```js
map.log("property");
```

## Debug [can-stache] issues

[can-stache] has two utilities for debugging:

- [can-stache.helpers.debugger] - Break within a template.
- [can-stache.helpers.console] - Call the debugger console methods.

[can-stache.helpers.debugger] can be used a variety of ways:

```
Break anytime this part of the template evaluates
{{debugger()}}

Break when condition is truthy
{{debugger(condition)}}

Break when left equals right
{{debugger(left, right)}}
```

When debugger breaks, you have access to the scope and a special `get` function that lets you inspect values in the [can-view-scope scope].

Stache templates also have access the [can-stache.helpers.console] methods, making it
easy to log value or even test performance.

```js
{{#if tasksPromise.isResolved}}
  {{ console.log("tasks resolved with", tasksPromise.value) }}
{{/if}}
```

`console` methods will be called whenever the template would normally update the
DOM. This means that `count` will be logged every second in the following component:

```js
Component.extend({
    tag: "my-counter",
    view: `{{console.log(count)}}`,
    ViewModel: {
        count: {
            value({resolve}) {
                let count = resolve(0);
                setInterval(() => {
                    resolve(++count);
                }, 1000);
            }
        }
    }
});
```

## Installing CanJS Devtools

There is a CanJS Devtools Chrome Extension available in the [Chrome Web Store](https://chrome.google.com/webstore/detail/canjs-devtools/hhdfadlgplkpapjfehnjhcebebgmibcb).

Once installed, you will see a CanJS icon next to the address bar:

<img src="../../docs/can-guides/images/devtools/canjs-button-disabled.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools extension icon - disabled"
  width="600px"/>

Initially, this icon will be disabled. In order to enable the extension, you need to install [can-debug] as explained in [Setup Debugging](#SetUpDebugging). Make sure you have `can-debug@2` or higher. Once this is set up, the icon will be enabled:

<img src="../../docs/can-guides/images/devtools/canjs-button-enabled.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools extension icon - enabled"
  width="600px"/>

The CanJS Devtools extension adds several new pieces of functionality to Chrome's Developer Tools. These are discussed in the sections below.

## Using the CanJS Devtools ViewModel Editor

When an element is selected in the Elements panel, a CanJS ViewModel Editor will be added in the sidebar:

<img src="../../docs/can-guides/images/devtools/viewmodel-editor.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools ViewModel Editor"
  width="600px"/>

In order to find this, select the Elements panel:

<img src="../../docs/can-guides/images/devtools/devtools-elements-panel.png"
  class="bit-docs-screenshot"
  alt="The Chrome Developer Tools Elements Panel"
  width="600px"/>

Then, depending on the size of your Developer Tools window, you may need to click on the overflow menu in order to find the CanJS ViewModel Editor:

<img src="../../docs/can-guides/images/devtools/devtools-sidebar-overflow-menu.png"
  class="bit-docs-screenshot"
  alt="The Chrome Developer Tools sidebar overflow menu"
  width="600px"/>

Once selected, the JSON editor can be used to view and edit the ViewModel for the selected element &mdash; or the closest parent element that has a ViewModel:

<img src="../../docs/can-guides/images/devtools/viewmodel-editor-zoomed.png"
  class="bit-docs-screenshot"
  alt="The Chrome Developer Tools sidebar overflow menu"
  width="600px"/>

## Using the CanJS Devtools Bindings Graph

Similar to the ViewModel Editor, when an element is selected, a sidebar is added for the CanJS Bindings Graph:

<img src="../../docs/can-guides/images/devtools/bindings-graph.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Bindings Graph"
  width="600px"/>

If the element that is selected has a ViewModel, the graph will show the relationships for a property of the ViewModel:

<img src="../../docs/can-guides/images/devtools/bindings-graph-viewmodel.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Bindings Graph"
  width="600px"/>

By default, the property selected will be the _first_ property on the ViewModel alphabetically. You can select a different property by clicking on the header:

<img src="../../docs/can-guides/images/devtools/bindings-graph-viewmodel-click.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Bindings Graph"
  width="600px"/>

This will give you a dropdown showing all of the available properties:

<img src="../../docs/can-guides/images/devtools/bindings-graph-viewmodel-select-property.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Bindings Graph"
  width="600px"/>

If the element selected does not have a ViewModel, the graph will show the relationships for the element itself:

<img src="../../docs/can-guides/images/devtools/bindings-graph-element.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Bindings Graph"
  width="600px"/>

## Using the CanJS Devtools Queues Stack

As discussed in [Debug what caused a observable event or update to happen](#Debugwhatcausedaobservableeventorupdatetohappen_), the [can-queues.logStack] method of [can-queues] can help figure out what tasks in CanJS's queue system caused a function to run. In order to make this easier, CanJS Devtools adds a sidebar to the Sources Panel to display the `logStack` output:

<img src="../../docs/can-guides/images/devtools/queues-stack.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Queues Stack"
  width="600px"/>

When stopped at a breakpoint in the Chrome Developer Tools, you can see this Queues Stack in the sidebar:

<img src="../../docs/can-guides/images/devtools/queues-stack-zoomed.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Queues Stack"
  width="600px"/>

You can click on any of these functions to go to their definition in the Sources panel:

<img src="../../docs/can-guides/images/devtools/queues-stack-click-through.png"
  class="bit-docs-screenshot"
  alt="The CanJS Devtools Queues Stack"
  width="600px"/>
