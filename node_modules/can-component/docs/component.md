@module {constructor} can-component can-component
@download can/component
@test can/component/test.html
@parent can-views
@collection can-legacy
@release 2.0
@link ../docco/component/component.html docco
@group can-component.define 0 define
@group can-component.create 1 create
@group can-component.elements 2 elements
@group can-component.create
@group can-component.lifecycle 3 lifecycle hooks
@group can-component.deprecated 5 deprecated
@package ../package.json
@outline 2

@description Create a custom element that can be used to manage widgets
or application logic.

@signature `Component`

  `can-component` exports a `Component` [can-construct Construct] constructor function used to
  define custom elements.

  Call [can-component.extend Component.extend] to define a custom element. Components are
  extended with a:

  - [can-component.prototype.tag] - The custom element tag name.
  - [can-component.prototype.ViewModel] - The methods and properties that manage the
    logic of the component. This is usually a [can-define/map/map DefineMap] class.
  - [can-component.prototype.view] - A template that writes the the inner HTML of
    the custom element given the `ViewModel`. This is usually a [can-stache] template.

  The following defines a  `<my-counter>` element:

  ```js
  const MyCounter = Component.extend({
    tag: "my-counter",
    view: `
      Count: <span>{{this.count}}</span>
      <button on:click="this.increment()">+1</button>
    `,
    ViewModel: {
      count: {default: 0},
      increment() {
        this.count++;
      }
    }
  });
  ```

  To create a component instance, either:

  - Write the element [can-component/component-element tag and bindings] in a [can-stache] template like:
    ```html
    <my-counter count:from="5"/>
    ```
  - Write the component tag in an HTML page and it will be mounted automatically:
    ```html
    <my-counter></my-counter>
    ```
  - Create a [can-component.new] programatically like:
    ```html
    var myCounter = new MyCounter({
      viewModel: {
        count: 6
      }
    });
    myCounter.element   //-> <my-counter>
    myCounter.viewModel //-> MyCounterVM{count:6}
    ```

@body


## Purpose

`Component` is used to define custom elements.  Those custom elements are
used for many different layers within your application:

- __Application Component__ - A component that houses global state, for example [can-route.data route data] and
  session data, and selects different pages
  based upon the url, session and other information.  Example: `<my-app>`
- __Page Component__ - Components that contain the functionality for a page.  Example: `<todos-page>`
- Functional Components - Component that provide functionality for a segment of a page.  Example: `<todos-list>`, `<todos-create>`
- __Widget/UI Components__ - Components that create controls that could be used many places. Example: `<ui-slider>`, `<ui-tabs>`

`Component` is designed to be:

- __Testable__ - Components separate their logic into independently testable [can-component.prototype.view] and [can-component.prototype.ViewModel] pieces.
- __Flexible__ - There are many ways to manage logic in a component.  Components can be:
  - _dumb_ - Get passed their data and can only call functions passed to them to change state.
  - _smart_ - Manage their own state and request data.

  Components can also:
  - Access their DOM element through [can-component/connectedCallback]. This is an escape hatch when
    the [can-component.prototype.view] is unable to update the DOM in a way you need.
  - Support alternate [can-component.prototype.ViewModel]s types like [can-observe].

- __A bridge to web components__ - In browsers that support
  [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements), [can-component.extend] will create a custom element. We've also adopted many custom element
  conventions such as:

  - [connectedCallback](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) - Component's [can-component/connectedCallback] lifecycle hook
  - [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) - [can-component/can-slot <can-slot>]
  - [template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) - [can-component/can-template <can-slot>]
  - [content](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/content) - [can-component/content <content>] (_now obsolete_)


## Overview

On a high level using `Component` is consists of two steps:

1. Extend `Component` with a [can-component.prototype.tag], [can-component.prototype.view]
   and [can-component.prototype.ViewModel] to create a custom element:

   ```js
   Component.extend({
     tag: "my-counter",
     view: `
       Count: <span>{{this.count}}</span>
       <button on:click="this.increment()">+1</button>
     `,
     ViewModel: {
       count: {default: 0},
       increment() {
         this.count++;
       }
     }
   });
   ```

2. Use that element in your HTML or within another `Component`'s [can-component.prototype.view] and
   use [can-stache-bindings] to pass values into or out of your component:

   ```js
   <my-counter count:from="1"/>
   ```

The following video walks through how this component works:

<iframe width="560" height="315" src="https://www.youtube.com/embed/3zMwoEuyX9g" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Learning how to use Component

This section gives an overview of how to learn `Component`. As `Component`
is a combination of many other technologies, many of its parts are
documented in detail on other pages.  

Begin learning `Component` by reading the [guides/html HTML Guide] to get a background on `Component` and other related CanJS technology.

Learning `Component` mostly means learning:

- [can-define/map/map DefineMap] which serves
  as Component's [can-component.prototype.ViewModel]s. A Component's ViewModel manages the
  logic and state of the component.
- [can-stache stache] which serves as Component's [can-component.prototype.view]s. A
  Component's view translates the ViewModel into HTML to display to the user.
- [can-stache-bindings stacheBindings] which enable event binding and value passing between components and values in [can-stache] templates.

The following are good resources to learn these parts:

#### DefineMap

Read the [guides/logic Logic Guide]  on how to:
- Organize ViewModel properties
- Derive properties from other properties
- Update the DOM when [can-stache stache] is unable to cause the change

Checkout the [guides/testing Testing Guide] on how to test
ViewModels and components.

#### stache

Read [can-stache stache's documentation] on how to:

- Turn `ViewModel` values into HTML
- Read promises
- Animate HTML

#### stacheBindings

Read [can-stache-bindings stacheBindings] documentation on how to:

- Listen to events on elements or components and call a function.
- Pass values between ViewModels and elements.

The [guides/forms forms guide] details how to work with
forms and form elements.


#### After the basics

Once you've got a good understanding of how to write a ViewModel, a view and
pass values between them, this page is a good resource on how to do everything else
with Component.

For a summary of all of CanJS's core APIs, checkout the [api API page].

## Basic Use

The following sections cover:

- [Defining a component](#DefiningaComponent) with a
  [tag](#DefiningaComponent_stag), [view](#DefiningaComponent_sview) and [ViewModel](#DefiningaComponent_sViewModel).
- Creating a component in one of the following ways:
  - [In a stache template](#Creatingacomponentinstache)
  - [Directly in your HTML page](#CreatingacomponentinHTML)
  - [Programatically](l#Creatingacomponentprogrammatically) with the component's constructor
- Component's lifecycle hooks

### Defining a Component

Use [can-component.extend] to define a `Component` constructor function
that automatically gets initialized whenever the component’s tag is
found.

```js
import {Component} from "can";

const MyCounter = Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: {
    count: {default: 0},
    increment() {
      this.count++;
    }
  }
});
```

### Defining a Component's tag

A component’s [can-component::tag tag] is the element node name that
the component will be created on.  The tag should be hyphenated
as follows:


```js
Component.extend( {
	tag: "my-counter"
} );
```

The previous component matches `<my-counter>` elements.

### Defining a Component's view

A component’s [can-component::view view] is a template that is rendered as the element’s innerHTML.  

This is typically a [can-stache] template that is [can-component.prototype.view#ImportingViews imported] or passed as a string.

The following component:

```js
Component.extend({
  tag: "my-counter",
  view: ` Count: <span>1</span> `,
});
```

Changes `<my-counter></my-counter>` into:

```html
<my-counter> Count: <span>1</span> </my-counter>
```

You can see by inspecting the DOM in the following example:

```html
<my-counter></my-counter>
<script type="module">
import {Component} from "can";

Component.extend({
  tag: "my-counter",
  view: ` Count: <span>1</span> `,
});
</script>
```
@codepen



The `view` is optional.  Read [can-component.prototype.view#Omittingtheview here] what happens if it is omitted.

The `view` can also render the [can-component/can-template <can-template> tags] passed to a
component using [can-component/can-slot <can-slot> tags].  Read more about this in [Customizing a component's view](#Customizingacomponent_sview).

### Defining a Component's ViewModel

A component’s [can-component::ViewModel ViewModel] defines a constructor that creates
instances used to render the component’s view. The `ViewModel` manages the logic
and state of a component.

The `ViewModel` can be defined separately
from the component.

```js
import {Component, DefineMap} from "can";

const MyCounterVM = DefineMap.extend("MyCounterVM",{
  count: {default: 0},
  increment() {
    this.count++;
  }
});

const MyCounter = Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: MyCounterVM
});
```
@highlight 16

In the previous example, `MyCounterVM` has state (the `count` property) and logic
(the `increment` method).  We could create a `MyCounterVM` instance ourselves,
read its state and call its methods as follows:

```js
import {DefineMap} from "can";

const MyCounterVM = DefineMap.extend("MyCounterVM",{
  count: {default: 0},
  increment() {
    this.count++;
  }
});

var myCounterVM = new MyCounterVM();

console.log( myCounterVM.count ) //-> 0
myCounterVM.increment()
console.log( myCounterVM.count ) //-> 1
```
@codepen
@highlight 10-14,only

Typically, the `ViewModel` is defined _inline_ on the component, as an
object as follows:

```js
import {Component, DefineMap} from "can";

const MyCounter = Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: {
    count: {default: 0},
    increment() {
      this.count++;
    }
  }
});
```

You can access the `ViewModel` created on the component constructor as follows:

```js
import {Component, DefineMap} from "can";

const MyCounter = Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: {
    count: {default: 0},
    increment() {
      this.count++;
    }
  }
});

var myCounterVM = new MyCounter.ViewModel();

console.log( myCounterVM.count ) //-> 0
myCounterVM.increment()
console.log( myCounterVM.count ) //-> 1
```
@codepen
@highlight 17,only

### Creating a component in stache

Components are usually created in the stache template of another component's view.  

For example, a `<my-counter/>` element is created in the `<my-app>` component's view:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: {
    count: {default: 0},
    increment() {
      this.count++;
    }
  }
});

Component.extend({
  tag: "my-app",
  view: `<my-counter/>`
});
</script>
```
@codepen
@highlight 21

In stache, components can be written as self closing (like `<my-counter/>`)
or have a closing tag (like `<my-counter></my-counter>`).

[can-stache-bindings Data and event bindings] can be added to components to communicate across
components.  The following cross binds `<my-app>`'s `number`  with `<my-counter>`'s `count`:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: {
    count: {default: 0},
    increment() {
      this.count++;
    }
  }
});

Component.extend({
  tag: "my-app",
  view: `
    Your Number is {{this.number}}.<br/>
    <my-counter count:bind="this.number"/>
  `,
  ViewModel: {
    number: {default: 4}
  }
});
</script>

```
@codepen
@highlight 23,only



Read the [can-component/component-element &lt;tag bindings...>] docs for more information
on what's available when creating components in stache, including:

- The [can-stache-bindings bindings] available.
- Passing [can-component/can-template <can-template> elements].

### Creating a component in HTML

Component elements can also be inserted directly in the page. For
example, the following creates two `<my-counter>` elements in the page:

```html
<p><my-counter></my-counter></p>
<p><my-counter></my-counter></p>

<script type="module">
import {Component} from "can";

Component.extend({
  tag: "my-counter",
  view: `
    Count: <span>{{this.count}}</span>
    <button on:click="this.increment()">+1</button>
  `,
  ViewModel: {
    count: {default: 0},
    increment() {
      this.count++;
    }
  }
});
</script>

```
@codepen
@highlight 1-2

Compared to components created in `stache`, components created directly in HTML have a number of restrictions that are enumerated
[can-component/component-element#DifferencesbetweencomponentsinstacheandHTML here].

### Creating a component programmatically

[can-component.extend Component.extend] returns a constructor function. These are
often used for [guides/testing testing] and [guides/routing]. It's used for dynamically
selecting a component in the [guides/recipes/modals] recipe.

The following dynamically switches between two components:

```html
<my-app></my-app>

<script type="module">
import {Component} from "can";

const GreenLight = Component.extend({
	tag: "green-light",
	view: `💚`
});

const RedLight = Component.extend({
	tag: "red-light",
	view: `❤️`
});

Component.extend({
	tag: "my-app",
	view: `
		<button on:click="this.color = 'red'">Red</button>
		<button on:click="this.color = 'green'">Green</button>
		Color: {{component}}.
	`,
	ViewModel: {
		green: {
			default: () => new GreenLight()
		},
		red: {
			default: () => new RedLight()
		},
		color: {default: "green"},
		get component(){
			if(this.color === "green") {
				return this.green;
			} else {
				return this.red;
			}
		}
	}
});
</script>
```
@codepen



Read more about how to programmatically create components on the [can-component.new] page.

### Lifecycle / Timing

Components have a lifecycle of method calls that you can hook into
to perform various setup and teardown actions.  

The following `<lifecycle-component>`
component logs the timing of various activities.  The `<my-app>` component
will add and remove `<lifecycle-component>` from the page so you can see
when the bindings are called.  Also, `<lifecycle-component>`'s `childProperty`
is two-way bound to `<my-app>`'s `parentProperty`.

```html
<my-app></my-app>

<script type="module">
import {Component, stache, DefineMap} from "can";

var view = stache("Added Lifecycle Component");

Component.extend({
	tag: "lifecycle-component",
	view: function(){
		console.log("before the view is rendered");
		var fragment = view.apply(this, arguments);
		console.log("after the view is rendered");
		return fragment;
	},
	ViewModel: {
		setup: function(props){
			console.log("before properties are set on the ViewModel");
			return DefineMap.prototype.setup.apply(this, arguments);
		},
		init: function(){
			console.log("after initial properties are set on the ViewModel");
		},
		connectedCallback(element) {
			console.log("after the element is inserted in the page");

			return () => {
				console.log("after the element is removed from the page");
				this.stopListening();
			};
		},
		childProperty: {
			value( {resolve} ){
				console.log("childProperty bound and read");
				resolve("childProperty");
				return function(){
					console.log("childProperty unbound");
				}
			}
		}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<button on:click="this.toggle()">
			{{# if(this.show) }} Remove {{else}} Add {{/}} Component
		</button>
		{{# if(this.show) }}
			<lifecycle-component childProperty:bind="this.parentProperty"/>
		{{else}}
			Removed Lifecycle Component
		{{/}}
	`,
	ViewModel: {
		show: {default: false},
		toggle(){
			this.show = !this.show;
		},
		parentProperty: {
			value( {resolve} ){
				console.log("parentProperty bound and read");
				resolve("parentProperty");
				return function(){
					console.log("parentProperty unbound");
				}
			}
		}
	}
})
</script>
```
@codepen
@highlight 11,13,18,22,25,28,34,37,63,66

When `<lifecycle-component>` is added to the page, the following will be logged:

1. __parentProperty bound and read__ - When a component is created, we will initialize the
   `ViewModel` with component bindings  ([can-stache-bindings.toChild] or [can-stache-bindings.twoWay]) that read
   from the scope. Before anything else happens, the right hand side of bindings like `childProperty:bind="this.parentProperty"` will be bound and read to be prepared to initialize
   a new `ViewModel`.
2. __before properties are set on the ViewModel__ - As [can-define/map/map DefineMap] inherits from
   [can-construct Construct], you can overwrite initialization behavior in [can-construct.prototype.setup]
   and [can-construct.prototype.init]. DefineMap's `setup` function will set all properties on the
   `ViewModel`. `setup` can use [can-construct.ReturnValue] to return alternative instances.
3. __after initial properties are set on the ViewModel__ - Once all initial properties are set on
   the `ViewModel`, the `ViewModel`'s [can-construct.prototype.init] method will be called. This can
   be a good time to make sure the ViewModel is ready for being passed to the view.
4. __childProperty bound and read__ - Once the `ViewModel` is created, any component bindings that
   read the ViewModel will be bound and ([can-stache-bindings.toParent] or [can-stache-bindings.twoWay])
   read. At this time, the parent binding value might be updated.
5. __before the view is rendered__ - The component's `view` function will be called with the `ViewModel`.
6. __after the view is rendered__ - After the `view` is rendered, the result will be a document fragment that
   is not attached to the page.
7. __after the element is inserted in the page__ - The document fragment has been inserted within the component
   element and the component element has been inserted into the document. This is a good place to
   setup any stateful side effects as shown in the [guides/logic Logic guide] or read the DOM.

When `<lifecycle-component>` is removed from the page, the following will be logged:

1. __parentProperty unbound__ - When the element is removed, its bindings are town down immediately, starting
  with the parent value of a binding.
2. __childProperty unbound__ - Next, the child value of the parent is town down.
3. __after the element is removed from the page__  - Finally the `disconnectedCallback` is called.


## Other Uses

The following shows (or links to) how to solve common use cases.

### Customizing a component's layout

Often, you want to allow consumers of a component to adjust the HTML of
a component. There are two ways of doing this:

- Using `<can-slot>` and `<can-template>`.
- Passing a `view`

#### Slots and templates

[can-component/can-template <can-template>] Allows you to pass a view to
a component's view where its content can be inserted with a corresponding
[can-component/can-slot <can-slot>] as follows:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
	tag: "hello-world",
	view: `
		{{# if(this.show) }}
			<can-slot name="helloGreeting"
				message:from="this.message"/>
		{{/ if }}
	`,
	ViewModel: {
		show: {
			value({resolve}){
				var show = resolve(true);
				var interval = setInterval( () => resolve(show = !show), 1000);
				return () => clearInterval(interval);
			}
		},
		message: {default: "world"}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<hello-world>
			<can-template name="helloGreeting">
				<h1>Hello {{message}}!</h1>
			</can-template>
		</hello-world>
	`
})
</script>
```
@codepen
@highlight 9-10,29-31,only

Read [can-component/can-slot <can-slot>]'s documentation for more information on this
technique.  

#### Passing a view

There are two common ways of creating an passing a view:

- Creating an [can-stache.tags.named-partial inline partial].
- Creating a view programmatically as a property value.


The following creates a `helloGreeting` inline partial and passes it to
`<hello-world>` to be rendered.

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
	tag: "hello-world",
	view: `
		{{# if(this.show) }}
			{{ greeting(this) }}
		{{/ if }}
	`,
	ViewModel: {
		show: {
			value({resolve}){
				var show = resolve(true);
				var interval = setInterval( () => resolve(show = !show), 1000);
				return () => clearInterval(interval);
			}
		},
		greeting: "any",
		message: {default: "world"}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		{{<helloGreeting}}
		<h1>Hello {{message}}!</h1>
		{{/helloGreeting}}

		<hello-world greeting:from="helloGreeting"/>
	`
})
</script>
```
@codepen
@highlight 9,28-32,only

The following does the same thing, but creates `this.helloGreeting` as a ViewModel property:

```html
<my-app></my-app>
<script type="module">
import {Component, stache} from "can";

Component.extend({
	tag: "hello-world",
	view: `
		{{# if(this.show) }}
			{{ greeting(this) }}
		{{/ if }}
	`,
	ViewModel: {
		show: {
			value({resolve}){
				var show = resolve(true);
				var interval = setInterval( () => resolve(show = !show), 1000);
				return () => clearInterval(interval);
			}
		},
		greeting: "any",
		message: {default: "world"}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<hello-world greeting:from="this.helloGreeting"/>
	`,
	ViewModel: {
		helloGreeting: {
			default: ()=> stache(`<h1>Hello {{message}}!</h1>`)
		}
	}
})
</script>
```
@codepen
@highlight 9,28,31-33,only


### Debugging Components

Read the [guides/debugging] guide to learn how to solve
common issues with components.

### Inheriting Components

Read the [can-component.extend#InheritingComponents extend docs on inheriting] for how to
inherit from a base component.

### Manipulating or reading the DOM outside the view

The [can-stache stache] view should be how your component interacts with the DOM the _vast_ majority of the
time.  However, sometimes it's not able to do everything you need. In these circumstances you should
use [can-component/connectedCallback] to get the component's element and do what you need.

The [can-component#Slider Slider example] shows using [can-component/connectedCallback] to update a
component's `width` property when the page is resized.

```js
connectedCallback(el) {
    // derive the width
    this.width = width(el) - el.firstElementChild.offsetWidth;
    this.listenTo(window,"resize", () => {
        this.width = width(el) - el.firstElementChild.offsetWidth;
    });
    ...
}
```

The [guides/recipes/video-player] recipe shows calling `.play()` or `.pause()` on
a `<video>` element when the component's `playing` state changes:


```js
connectedCallback(element) {
  this.listenTo("playing", function(event, isPlaying) {
    if (isPlaying) {
      element.querySelector("video").play();
    } else {
      element.querySelector("video").pause();
    }
  });
  ...
}
```

<!--
### Binding nested observable values
### Causing effects when a component is removed
-->

## Examples

Check out the following examples built with `Component`.


### Slider

The following creates a draggable slider. It uses [can-component/connectedCallback]
to update the component's `width` when the page is resized.

```html
<percent-slider value:from="50"></percent-slider>
<script type="module">
import { Component } from "can";

function width(el) {
    var cs = window.getComputedStyle(el,null)
    return el.clientWidth - parseFloat( cs.getPropertyValue("padding-left") )
        - parseFloat( cs.getPropertyValue("padding-left") );
}

Component.extend({
    tag: "percent-slider",
    view: `
        <div class='slider'
          style="left: {{ left }}px"
          on:mousedown='startDrag(scope.event.clientX)'/>`,

    ViewModel: {
        start: {type: "number", default: 0},
        end: {type: "number", default: 100},
        currentValue: {
            default: function(){
                return this.value || 0;
            }
        },
        width: {type: "number", default: 0},
        get left(){
            var left = this.currentValue / this.end * this.width;
            return Math.min( Math.max(0, left), this.width) || 0;
        },
        connectedCallback(el) {
            // derive the width
            this.width = width(el) - el.firstElementChild.offsetWidth;
            this.listenTo(window,"resize", () => {
                this.width = width(el) - el.firstElementChild.offsetWidth;
            });

            // Produce dragmove and dragup events on the view-model
            this.listenTo("startClientX", () => {
                var startLeft = this.left;
                this.listenTo(document,"mousemove", (event)=>{
                    this.dispatch("dragmove", [event.clientX - this.startClientX + startLeft]);
                });
                this.listenTo(document,"mouseup", (event)=>{
                    this.dispatch("dragup", [event.clientX - this.startClientX + startLeft]);
                    this.stopListening(document);
                })
            });
            // Update the slider position when currentValue changes
            this.listenTo("dragmove", (ev, left)=> {
                this.currentValue = (left / this.width) * (this.end - this.start);
            },"notify");

            // If the value is set, update the current value
            this.listenTo("value", (ev, newValue) => {
                this.currentValue = newValue;
            }, "notify");

            // Update the value on a dragmove
            this.listenTo("dragup", (ev, left)=> {
                this.value = (left / this.width) * (this.end - this.start);
            },"notify");

            return this.stopListening.bind(this);
        },
        startClientX: "any",
        startDrag(clientX) {
            this.startClientX = clientX;
        }

    }
});
</script>
<style>
.slider {
    border: solid 1px blue;
    background-color: red;
    height: 40px;
    width: 40px;
    cursor: ew-resize;
    position: relative;
}
percent-slider {
    border: solid 4px black;
    padding: 5px;
    display: block;
}
</style>

```
@codepen
@highlight 33-36,only

### Tabs

The following demos a tabs widget.  Click “Add Vegetables”
to add a new tab.

@demo demos/can-component/tabs.html

An instance of the tabs widget is created by creating `<my-tabs>` and `<my-panel>`
elements like:

```html
<my-tabs>
	{{#each(foodTypes)}}
		<my-panel title:from="title">{{content}}</my-panel>
	{{/each}}
</my-tabs>
```

To add another panel, all we have to do is add data to `foodTypes` like:

```js
foodTypes.push( {
	title: "Vegetables",
	content: "Carrots, peas, kale"
} );
```

The secret is that the `<my-panel>` element listens to when it is inserted
and adds its data to the tabs’ list of panels with:

```js
const vm = this.parentViewModel = canViewModel( this.element.parentNode );
vm.addPanel( this.viewModel );
```

### TreeCombo

The following tree combo lets people walk through a hierarchy and select locations.

@demo demos/can-component/treecombo.html

The secret to this widget is the viewModel’s `breadcrumb` property, which is an array
of items the user has navigated through, and `selectableItems`, which represents the children of the
last item in the breadcrumb.  These are defined on the viewModel like:

```js
DefineMap.extend( {
	breadcrumb: {
		Default: DefineList
	},
	selectableItems: {
		get: function() {
			const breadcrumb = this.breadcrumb;

			// if there’s an item in the breadcrumb
			if ( breadcrumb.length ) {

				// return the last item’s children
				const i = breadcrumb.length - 1;
				return breadcrumb[ i ].children;
			} else {

				// return the top list of items
				return this.items;
			}
		}
	}
} );
```

When the “+” icon is clicked next to each item, the viewModel’s `showChildren` method is called, which
adds that item to the breadcrumb like:

```js
DefineMap.extend( {
	showChildren: function( item, ev ) {
		ev.stopPropagation();
		this.breadcrumb.push( item );
	}
} );
```

### Paginate

The following example shows 3
widget-like components: a grid, next / prev buttons, and a page count indicator. And, it shows an application component that puts them all together.

@demo demos/can-component/paginate.html

This demo uses a `Paginate` [can-define/map/map] to assist with maintaining a paginated state:

```js
const Paginate = DefineMap.extend( {

	// ...
} );
```

The `app` component, using [can-define/map/map], creates an instance of the `Paginate` model
and a `websitesPromise` that represents a request for the Websites
that should be displayed.  Notice how the `websitesCount` value is updated when
the `websitesPromise` resolves. [can-component/connectedCallback] is used to
listen for changes to `websitesCount`, which then updates the paginate’s `count`
value.

```js
const AppViewModel = DefineMap.extend( {
	connectedCallback: function() {
		this.listenTo( "websitesCount", function( event, count ) {
			this.paginate.count = count;
		} );
		return this.stopListening.bind( this );
	},
	paginate: {
		default: function() {
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
} );
```

The `my-app` component passes paginate, paginate’s values, and websitesPromise to
its sub-components:

```html
<my-app>
	<my-grid promiseData:from="websitesPromise">
		{{#each(items)}}
			<tr>
				<td width="40%">{{name}}</td>
				<td width="70%">{{url}}</td>
			</tr>
		{{/each}}
	</my-grid>
	<next-prev paginate:from="paginate"></next-prev>
	<page-count page:from="paginate.page" count:from="paginate.pageCount"></page-count>
</my-app>
```
