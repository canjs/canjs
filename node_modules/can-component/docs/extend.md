@function can-component.extend extend
@parent can-component.define 0

@description Define the behavior of a custom element.

@signature `Component.extend(prototype)`

  Extends the [can-component Component] [can-construct constructor function] with prototype
  properties and methods.  Registers the component by its [can-component::tag] with
  [can-view-callbacks.tag can-view-callbacks.tag].

  ```html
  <tag-name></tag-name>
  <script type="module">
  import {Component} from "can";

  Component.extend( {
  	tag: "tag-name",
  	ViewModel: { /* ... */ },
  	view: ` VIEW CONTENT `
  } );
  </script>
  ```
  @codepen

@param {{}} prototype An object set as the prototype of the
constructor function. You will typically provide the following values
on the prototype object:

  - __tag__ {[can-component.prototype.tag]} - Defines the
  tag on which instances of the component constructor function will be
  created.

  - __ViewModel__ {[can-component.prototype.ViewModel]} - Specifies an object
  that is used to render the component’s view.

  - __view__ {[can-component.prototype.view]} - Specifies the view
  rendered within the custom element.

And sometimes the following values are provided:

  - __events__ {[can-component.prototype.events]} - Defines events on
  dom elements or observable objects the component listens to.

  - __helpers__ {[can-component.prototype.helpers]} - Specifies mustache helpers
  used to render the component’s view.

@return {Component}
  Returns a component constructor function.
  The constructor function has the `view` and `ViewModel` available
  for testing:

  ```js
  import {Component} from "can";

  const MyComponent = Component.extend( {
  	tag: "my-component",
  	view: `<div>You are {{this.age}}</div>`,
  	ViewModel: { age : "number" }
  } );

  console.log( MyComponent.view({age: 5}).firstChild.innerHTML )
  //-> "You are 5"

  var myComponentVM = new MyComponent.ViewModel({age: "5"});
  console.log(myComponentVM.age) //-> 5
  ```
  @codepen

@body


## Inheriting Components

Inheriting from components works differently than other CanJS APIs. You can’t call `.extend` on a particular component to create a “subclass” of that component.

Instead, components work more like HTML elements. To reuse functionality from a base component, build on top of it with parent components that wrap other components in their view and pass any needed viewModel properties via attributes.

If you really want to extend a component you can do it as follows:

```html
<extending-component age:from="36" extended:from="true"></extending-component>
<script type="module">
import {Component} from "can";

const MyComponent = Component.extend( {
	tag: "my-component",
	view: `<div>You are {{this.age}}</div>`,
	ViewModel: { age : "number" }
} );

const ExtendingComponent = Component.extend({
	tag: "extending-component",
	view: `Extended content {{this.extended}}.  {{baseView(this)}}`,
	ViewModel: MyComponent.ViewModel.extend({
		baseView: {
			default(){
				return MyComponent.view
			}
		},
		extended: "boolean"
	})
});
</script>
```
@codepen

## Timing

Components with hyphenated [can-component.prototype.tag tag names] can be extended anytime
before a [can-stache] view that uses them is rendered. This means that
templates can be defined before the component as follows:

```js
import {Component, stache} from "can";

const view = stache(`<my-component/>`);

Component.extend({
	tag: "my-component",
	view: `Component Mounted`
});

document.body.appendChild( view() );
```
@codepen
