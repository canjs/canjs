@typedef {can-stache.sectionRenderer} can-component/can-template <can-template>
@parent can-component.elements

@description Pass templates declaratively to components.

@signature `<can-template name='NAME'/>`

When building widget-like components, it's often useful to allow the consumer of the
component to customize parts of the widget's layout.  These components can accept
templates passed to them using `<can-template>` and render these templates with
[can-component/can-slot].  The `name` attribute of a `<can-template>`
corresponds to the `name` attribute of a `<can-slot>`.

For example, the following passes a `<my-modal>` component a `<can-template>`
of the modal content:

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-modal",
	view: `
		<div class="wrapper">
			<can-slot name="modal-content" />
		</div>
	`
} );

const renderer = stache(`
	<my-modal>
		<can-template name="modal-content">
			Hello World!
		</can-template>
	</my-modal>
`);

renderer(); //-> <my-modal><div class="wrapper">Hello World!</div></my-modal>
```

By default, `<can-template>` is rendered with the surrounding scope
like `<content>`. A different context ([can-stache/keys/this]) can be added
to that scope with bindings.  Read [can-component/can-slot] for more information.

@param {String} [NAME] The name of the template that will be rendered by a corresponding
[can-component/can-slot].

@body

## Use

To use `<can-template>` elements we can create a Component that has `<can-slot>` elements in it's view
and render that component with `<can-template>` elements in the `LIGHT_DOM`.

Any `<can-template>` that has a name attribute matching the name attribute of a `<can-slot>` will
have it's inner contents rendered and replace the `<can-slot>`.

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-email",
	view: `
		<can-slot name="subject" />
		<p>My Email</p>
		<can-slot name="body" />
	`
} );

const renderer = stache(`
	<my-email>
		<can-template name="subject">
			<h1>{{subject}}</h1>
		</can-template>
		<can-template name="body">
			<span>{{body}}</span>
		</can-template>
	</my-email>
`);

renderer( {
	subject: "Hello World",
	body: "The email body"
} );

/*
<my-email>
	<h1>Hello World</h1>
	<p>My Email</p>
	<span>The email body</span>
</my-email>
*/
```
