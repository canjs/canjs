@property {String|can-stache.view} [can-component.prototype.view] view
@parent can-component.define 2
@outline 2

Provides a view to render directly within the component’s element. The view is rendered with the
component’s [can-component::ViewModel] instance.

@type {String} A string that will be passed to [can-stache] to create a
  [can-stache.view]. For example:

  ```js
  import {Component} from "can";

  Component.extend( {
  	tag: "hello-world",
  	view: `Hello World!`
  } );

  document.body.innerHTML = `<hello-world></hello-world>`;
  ```
  @codepen

@type {can-stache.view} A [can-stache.view] returned by [can-stache].
  For example:

  ```js
  import {Component,stache} from "can";

  Component.extend( {
  	tag: "hello-world",
  	view: stache(`Hello World!`)
  } );

  document.body.innerHTML = `<hello-world></hello-world>`;
  ```
  @codepen

  Use


`<content/>` elements within the view are replaced by the source elements within the component’s tag.

@body

## Background

Currently, most views are [can-stache] views. Please read [can-stache stache's documentation] to
understand how to do things like:

- Write values to the page
- Branching logic
- Looping

This page details the special abilities of a Component's view that are not normally available
to a generic stache view.

## Use

The view specified by the `view` property works similar to
the [http://www.w3.org/TR/shadow-dom/ W3C Shadow DOM proposal]. It represents the contents
of a custom element, while being able to reposition the user provided [can-component/can-template <can-template>]
elements with [can-component/can-slot <can-slot>] elements.

> NOTE: `Component` is also able to reposition with the [can-component/content] tag which is
> no longer favored by the W3C.

There are three things to understand about a [can-component component]’s view:

 - __Rendered with a ViewModel__ - The view is rendered with `this` as the component instance’s ViewModel.
 - __View Insertion__ - The rendered result of the view is inserted into the component’s element.
 - __<can-slot> elements__ - Any [can-component/can-slot <can-slot>] elements within the view act as insertion points for [can-component/can-template <can-template>] elements.


## Rendered with a ViewModel instance

The `view` is rendered with `this` as the component instance's ViewModel.  For example,
the following prints the `age` property of the ViewModel instance:

```js
import {Component} from "can";

Component.extend({
	tag: "my-component",
	view: `You are {{this.age}}`,
	ViewModel: {
		age: {
			default: 36
		}
	}
});

document.body.innerHTML = "<my-component></my-component>";
```
@codepen

Notice that the view is rendered with an __instance__ of the ViewModel, not the ViewModel constructor
function. A new ViewModel instance is created for each element. For example, the following shows independent age values:

```js
import {Component} from "can";

Component.extend({
	tag: "my-component",
	view: `You are {{this.age}}`,
	ViewModel: {
		age: {
			value( {resolve} ){
				const timer = setInterval( () => {
					resolve( Math.round(Math.random() * 100) )
				}, 1000);

				return clearInterval.bind(window, timer);
			}
		}
	}
});

document.body.innerHTML = `<my-component></my-component>.
	<my-component></my-component>.
	<my-component></my-component>.`;
```
@codepen


## View insertion

The view specified by `view` is rendered directly within the custom tag.

For example the following component:

```js
Component.extend( {
	tag: "my-greeting",
	view: "<h1>Hello There</h1>"
} );
```

With the following source html:

```html
<header>
	<my-greeting></my-greeting>
</header>
```

Produces the following html:

```html
<header>
	<my-greeting><h1>Hello There</h1></my-greeting>
</header>
```

If there is existing content within the source html, like:

```html
<header>
	<my-greeting>DO REMOVE ME!!!</my-greeting>
</header>
```

…that content is removed and replaced by the component’s view:

```html
<header>
	<my-greeting><h1>Hello There</h1></my-greeting>
</header>
```

Use `<can-slot>` to position content within the source html.

## <can-slot> elements

[can-component/can-slot <can-slot>] element inserts the content of [can-component/can-template <can-template>]
elements passed to the component.  This makes customizing the HTML of a component much easier.

For example, the following defines a modal component whose content can be customized with
`<can-template>` and positioned with `<can-slot>`.  Change the text of the input to see it
in action.

```html
<my-app></my-app>
<style>
my-modal {
   position: fixed;
   top: 0px;
   left: 0px;
   right: 0px;
   bottom: 0px;
   z-index: 100;
}
.background {
	width: 100%;
	height: 100%;
	background-color: #aCCaef;
	opacity: 0.2;
}
.modal-container {
	left: 50%;
	top: 50%;
	width: 300px;
	height: 300px;
	margin-top: -150px;
	margin-left: -150px;
	position: absolute;
	border: 1px solid #e1e1e8;
	background-color: white;
}
my-modal h3{
	border-bottom: 1px solid #e1e1e8;
	padding-left: 20px;
	padding-bottom: 5px;
}
my-modal .modal-contents {
	padding-left: 20px;
}
</style>
<script type="modal">
import {Component} from "can";

Component.extend({
	tag: "my-modal",
	view: `
		<div class='background'></div>
		<div class='modal-container'>
			<h3>{{this.title}}</h3>
			<div class='modal-contents'>
				<can-slot name="contents"/>
			</div>
		</div>
	`
});

Component.extend({
	tag: "my-app",
	view: `
		{{# if(this.promptSave) }}
			<my-modal title:raw="Wanna Save?">
				<can-template name="contents">
					<p> Save? </p>
					<p>
						<button class='btn btn-primary'
							on:click="this.save()">Yes</button>
							<button class='btn btn-warning'
							on:click="this.cancel()">No</button>
					</p>
				</can-template>
			</my-modal>
		{{/ if }}
		<div>
			Meetup Name:
			<input value:bind="value" disabled:from="this.saving"/>
			{{# if(this.saving) }} <span class='info'>Saving ...</span> {{/ if }}
		</div>
	`,
	ViewModel: {
		value: "any",
		backup: "any",
		saving: "boolean",

		get promptSave(){
			return !this.saving &&
				this.backup !== this.value;
		},

		save(){
			var self = this;
			this.saving = true;
			setTimeout(() => {
				this.set({
					saving: false,
					backup: this.value
				});
			},1000);
		},
		cancel(){
			this.saving = false;
			this.value = this.backup;
		},

		connectedCallback(){
			this.backup = this.value;
		}
	}
});
</script>

```
@highlight 41,47,58-66,only
@codepen

Read [can-component/can-slot <can-slot>'s documentation] for more information.

## Importing Views

The [guides/setup] guide has details on how to import stache views directly. For example,
the following example uses `import view from "./app.stache";`:

```js
import { Component } from "can";
import view from "./app.stache";

Component.extend({
  tag: "my-app",
  view,
  ViewModel: {
    message: {
      default: "Hello World"
    }
  }
});
```

This allows:

- authoring stache files in their own files
- faster load times as the stache files are pre-parsed


## Omitting the view

If the view is omitted, the content between the component tags (user DOM) is rendered
with the `ViewModel`. The following renders `Hi there!` between the `<no-view>`
and `</no-view>` tags:

```html
<my-app></my-app>
<script type="module">
import { Component } from "can";

Component.extend({
	tag: "no-view",
	ViewModel: {
		message: {default: "Hi there!"}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<no-view>
			{{this.message}}
		</no-view>
	`
})
</script>
```
@codepen
