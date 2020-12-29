@typedef {can-stache.sectionRenderer} can-component/component-element <tag bindings...>
@parent can-component.create 0

@description Create a component using HTML and [can-stache-bindings].

@signature `<TAG BINDINGS...>[TEMPLATES][LIGHT_DOM]</TAG>`

Create an instance of a component on a particular tag in a [can-stache] view.
Use the [can-stache-bindings bindings] syntaxes to set up bindings.

The following creates a `my-autocomplete` element and passes the `my-autocomplete`’s
[can-component.prototype.ViewModel] the `Search` model as its `source` property and
a [can-component/can-template] that is used to render the search results:

```html
<my-autocomplete source:from="this.Search">
	<can-template name="search-results">
		<li>{{name}}</li>
	</can-template>
</my-autocomplete>
```

	@release 2.3

	@param {String} TAG An HTML tag name that matches the [can-component::tag tag]
	property of the component. Tag names should include a hyphen (`-`) or a colon (`:`) like:
	`acme-tabs` or `acme:tabs`.

	@param {can-stache-bindings} [BINDINGS] Use the following binding syntaxes
	to connect the component’s [can-component::ViewModel] to the view’s [can-view-scope scope]:

	 - [can-stache-bindings.toChild]=[can-stache.expressions expression] — one-way data binding to child
	 - [can-stache-bindings.toParent]=[can-stache.expressions expression] — one-way data binding to parent
	 - [can-stache-bindings.twoWay]=[can-stache.expressions expression] — two-way data binding child to parent
	 - [can-stache-bindings.event]=[can-stache/expressions/call expression] — event binding on the view model

	 @param {can-stache.sectionRenderer} [TEMPLATES] Between the starting and ending tag
	 can exist one or many [can-component/can-template] elements.  Use [can-component/can-template] elements
	 to pass custom templates to child components.  Each `<can-template>`
	 is given a `name` attribute and can be rendered by a corresponding [can-component/can-slot]
	 in the component’s [can-component.prototype.view].

	 For example, the following passes how each search result should look and an error message if
	 the source is unable to request data:

	 ```html
	 <my-autocomplete source:from="Search">
		 <can-template name="search-results">
			 <li>{{name}}</li>
		 </can-template>
		 <can-template name="search-error">
			 <div class="error">{{message}}</div>
		 </can-template>
	 </my-autocomplete>
	 ```

@body

## Use

To create a component instance, add its tag to your html page or a
[can-stache stache] view. For example, the following has a `<my-counter>`
element in the page:

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

When [can-component.extend Component.extend] defines the `my-counter` element,
a component instance will be created.  Creating a component instance involves creating
a new [can-component::ViewModel] and rendering the [can-component::view].

## Differences between components in `stache` and HTML

Currently, components embedded in your pages HTML have limited abilities compared to those
embedded in stache templates. Components embedded in HTML:

- Must have a closing tag like `<my-counter></my-counter>`. Tags like `<my-counter/>`
  are allowed in [can-stache stache].
- Are _currently_ unable to use [can-component/can-template <can-template>] or pass light DOM to
  be used by [can-component/content <content>].
- Do not have a [can-view-scope scope], so they are unable to pass anything other
  than primitives. For example, `<my-counter count:from="myNumber"></my-counter>` will
  not be able to look up a `myNumber`.


Components embedded in your pages should usually be the root component and be used to create
other components.  For example, the following `<my-app>` component creates
the `<hello-world/>` and `<goodbye-moon/>` elements:

```html
<my-app></my-app>

<script type="module">
import {Component} from "can";

Component.extend({
	tag: "hello-world",
	view: `Hello World!`
});

Component.extend({
	tag: "goodbye-moon",
	view: `Goodbye Moon.`
})


Component.extend( {
	tag: "my-app",
	view: `
		<p><hello-world/></p>
		<p><goodbye-moon/></p>
	`
} );
</script>
```
@codepen
