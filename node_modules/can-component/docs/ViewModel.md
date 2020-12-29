@property {Object|class} can-component.prototype.ViewModel ViewModel
@parent can-component.define 3

@description

Defines a class used to provide values and methods to the component’s [can-component::view view]. The class is initialized with values specified by the component element’s [can-stache-bindings data bindings].

@type {Object} An object that will be passed to [can-define/map/map.extend DefineMap.extend] and
used to create class.  Instances of that class are accessible by the component’s [can-component::view].

  In the following example, the object set a `ViewModel` is used to create a [can-define/map/map DefineMap]:

  ```html
  <my-tag></my-tag>

  <script type="module">
  import {Component} from "can";

  Component.extend({
	tag: "my-tag",
	ViewModel: {
      message: {default: "Hello there!"}
	},
	view: `<h1>{{message}}</h1>`
  });

  var viewModelInstance = document.querySelector("my-tag").viewModel;
  console.log(viewModelInstance) //-> MyTagVM{message: "Hello there!"}
  </script>
  ```
  @codepen

  This ViewModel is equivalent to the ViewModel created in the following `class` example.

@type {class} A class or constructor function (usually defined by [can-define/map/map.extend DefineMap.extend],
or [can-observe.Object observe.Object]) that will be used to create a new observable instance accessible by the component’s [can-component::view].

  For example, every time `<my-tag>` is found, a new instance of `MyTagViewModel` will
  be created:

  ```html
  <my-tag></my-tag>

  <script type="module">
  import {Component, DefineMap} from "can";

  const MyTagViewModel = DefineMap.extend( "MyTagViewModel", {
  	message: {default: "Hello there!"}
  } );

  Component.extend({
	tag: "my-tag",
	ViewModel: MyTagViewModel,
	view: `<h1>{{message}}</h1>`
  });

  var viewModelInstance = document.querySelector("my-tag").viewModel;
  console.log(viewModelInstance) //-> MyTagViewModel{message: "Hello there!"}
  </script>
  ```
  @codepen


  Use `element.viewModel` to read a component’s view-model instance.

@param {Object} properties The initial properties that are passed by the [can-stache-bindings data bindings].

The view bindings on a tag control the properties and values used to instantiate the `ViewModel`. For example, calling `<my-tag>` as follows invokes `MyTagViewModel` as shown in the following example:

```html
<my-tag/> <!-- new MyTagViewModel({}) -->

<my-tag
	message:from="'Hi There'"/> <!-- new MyTagViewModel({message: "Hi There"}) -->
```

@return {Object} A new instance of the corresponding constructor function. This instance is
added to the top of the [can-view-scope] the component’s [can-component::view] is rendered with.

@body

## Background

Before reading this documentation, it's useful to have read the [guides/technology-overview]
and [guides/html] guides.

## Use

A component's `ViewModel` defines the logic of the component. The `ViewModel` has the
methods and properties that the `view` reads to update the DOM.  `ViewModel` are arguably
the most important part of a CanJS application to understand and write well.

On this page we will:

- Cover the basics of how a Component uses the `ViewModel` property.
- Explain the importance of writing maintainable and testable `ViewModel`s.
- Introduce how to communicate between the `view` and `ViewModel` and how to
  communicate between multiple `ViewModel`s.

## How Component uses the `ViewModel` property

[can-component Component]’s ViewModel property is used to define a class.  Instances of that
class will be created and used to render the component’s view.  For example, the following
defines a `MyCounterVM` [can-define/map/map DefineMap] class and sets it as the `ViewModel`:

```html
<my-counter count:from="2"></my-counter>

<script type="module">
import {DefineMap, Component} from "can";

const MyCounterVM = DefineMap.extend( {
	count: {default: 0},
	increment(){
		this.count++;
	}
} );

Component.extend( {
	tag: "my-counter",
	view: `
		Count: {{this.count}}.
		<button on:click="this.increment()">+1</button>
	`,
	ViewModel: MyPaginateViewModel
} );
</script>
```
@codepen

The class can be created separately as above or defined inline as follows:

```html
<my-counter count:from="2"></my-counter>

<script type="module">
import {Component} from "can";

Component.extend( {
	tag: "my-counter",
	view: `
		Count: {{this.count}}.
		<button on:click="this.increment()">+1</button>
	`,
	ViewModel: {
		count: {default: 0},
		increment(){
			this.count++;
		}
	}
} );
</script>
```
@codepen


When a `<my-counter>` element is created like:

```html
<my-counter count:from="2"></my-counter>
```

... component creates an instance of the `ViewModel` by passing it any binding values.  In this
case, the component will create an instance of `MyCounterVM` like:

```js
const viewModel = new MyCounterVM({
	count: 2
});
```

Component will then pass that component to the `view` like:

```js
const view = stache(`
	Count: {{this.count}}.
	<button on:click="this.increment()">+1</button>
`);

view(viewModel) //-> HTML
```

That `HTML` result of calling the `view` is inserted within the component
element. Read more about this on the [can-component.prototype.view]'s documentation.

It's important to notice that each component element will create a new and different instance
of the `ViewModel`.  For example, the following creates three `<my-counter>` elements,
each with unique state.  Click the __+1__ button and notice that each `<my-counter>`
has its own `count`.

```html
<p><my-counter count:from="1"></my-counter></p>
<p><my-counter count:from="2"></my-counter></p>
<p><my-counter count:from="3"></my-counter></p>

<script type="module">
import {Component} from "can";

Component.extend( {
	tag: "my-counter",
	view: `
		Count: {{this.count}}.
		<button on:click="this.increment()">+1</button>
	`,
	ViewModel: {
		count: {default: 0},
		increment(){
			this.count++;
		}
	}
} );
</script>
```
@codepen

## Writing maintainable and testable ViewModels

Component `ViewModel`s likely contain the majority of logic
in a CanJS application.  Care should be taken to write
`ViewModel`s in a maintainable and testable manner. We strongly encourage
people to read the [guides/logic] and [guides/testing] guides that go into
detail on how to write ViewModels.

In short, CanJS supports two different models of writing ViewModels: imperative vs reactive.

__Imperative__ ViewModels mutate properties like the `<my-counter>` example above:

```html
	increment(){
		this.count++;
	},
	decrement(){
		this.count--;
	}
```

Imperative programming is simple and easy for beginners to get started. However, it
can make reasoning about the nature of your application more difficult.  For instance,
there might be many other functions that change count.  Understanding how `count` changes
and what caused a particular `count` to change can be hard.

__Reactive__ ViewModels derive their properties from events. For example, the following
derives `count` reactively:

```html
<p><my-counter count:from="1"></my-counter></p>
<p><my-counter count:from="2"></my-counter></p>
<p><my-counter count:from="3"></my-counter></p>

<script type="module">
import {Component} from "can";

Component.extend( {
	tag: "my-counter",
	view: `
		Count: {{this.count}}.
		<button on:click="this.dispatch('increment')">+1</button>
		<button on:click="this.dispatch('decrement')">-1</button>
	`,
	ViewModel: {
		count: {
			value({listenTo, lastSet, resolve}) {
				listenTo(lastSet, resolve);

				let count = resolve(lastSet.value || 0);

				listenTo("increment", function( {value} ){
					resolve(count++);
				});

				listenTo("decrement", function( {value} ){
					resolve(count--);
				});
			}
		}
	}
} );
</script>
```
@codepen

This style of programming is more cumbersome. But it can reduce errors dramatically
in complex code.

We encourage both styles to be used in apps and even within the same ViewModel! Use __Imperative__
techniques for managing simple code and __Reactive__ techniques for more complex code.

## Communication with ViewModels

ViewModels rarely exist in isolation. Instead ViewModels are constantly changing due to
various actions:

- A user clicked a button or typed something into the DOM and the ViewModel needs to update.
- A different ViewModel changed and wants to update another ViewModel.

[can-stache-bindings] has lots of documentation on how to facilitate these forms of communication.

ViewModels also need to update the DOM when when their state changes.  [can-stache] has lots of
documentation on how to update the DOM to present a ViewModel's state.
