@typedef {can-stache.sectionRenderer} can-component/can-slot <can-slot>
@parent can-component.elements

@description Position the content of [can-component/can-template <can-template>] elements.

@signature `<can-slot name='NAME' BINDINGS>DEFAULT_CONTENT</can-slot>`

`<can-slot>` and [can-component/can-template <can-template>] are used together to
customize the layout of a component.

`<can-slot>` renders a matching `<can-template name='name'/>` element from the `LIGHT_DOM`, or
if there is no matching `<can-template>`, renders the `DEFAULT_CONTENT` instead.

For example, the following `<my-counter>` component allows users to customize the
button that increments the count:

  ```html
  <my-app></my-app>
  <script type="module">
  import {Component} from "can";

  Component.extend({
  	tag: "my-counter",
  	view: `
  		<form on:submit="this.increment(scope.event)">
  			Count: <span>{{this.count}}</span>

  			<can-slot name="incrementButton"/>
  		</form>
  	`,
  	ViewModel: {
  		count: {type: "number", default: 0},
  		increment(event) {
			event.preventDefault();
  			this.count++;
  		}
  	}
  });


  Component.extend({
  	tag: "my-app",
  	view: `
  		<my-counter>
  			<can-template name="incrementButton">
  				<button>Add One</button>
  			</can-template>
  		</my-counter>
  	`
  });
  </script>
  ```
  @codepen
  @highlight 11,28-30


@param {String} NAME The name of the [can-component/can-template] to render in place of the `<can-slot>`.

@param {can-stache-bindings} BINDINGS You can pass values to the `<can-template>`.
The following passes `count` as `number` to `<can-template name="displayCount">`:


  ```html
  <my-app></my-app>
  <script type="module">
  import {Component} from "can";

  Component.extend({
  	tag: "my-counter",
  	view: `
  		<form on:submit="this.increment(scope.event)">
  			<can-slot name="displayCount"
  				number:from="this.count" />

  			<can-slot name="incrementButton" />
  		</form>
  	`,
  	ViewModel: {
  		count: {type: "number", default: 0},
  		increment(event) {
  			event.preventDefault();
  			this.count++;
  		}
  	}
  });


  Component.extend({
  	tag: "my-app",
  	view: `
  		<my-counter>
  			<can-template name="displayCount">
  				Your number is <b>{{number}}</b>
  			</can-template>
  			<can-template name="incrementButton">
  				<button>Add One</button>
  			</can-template>
  		</my-counter>
  	`
  });
  </script>

  ```
  @codepen
  @highlight 9-10,29-31,only

  The [can-stache-bindings.toChild], [can-stache-bindings.toParent] and [can-stache-bindings.twoWay]
  bindings all work.  

  > NOTE: You are also able to set the `this` of the template like:
  > `this:from="value"`. This is an older way of passing values and
  > should be avoided.


  @param {can-stache.sectionRenderer} [DEFAULT_CONTENT]
  The content that should be used if there is no content in the matching `<can-template>`.  

  The following provides a default `displayCount`. Notice that there is no _displayCount_
  `<can-template>`:

  ```html
  <my-app></my-app>
  <script type="module">
  import {Component} from "can";

  Component.extend({
  	tag: "my-counter",
  	view: `
  		<form on:submit="this.increment(scope.event)">
  			<can-slot name="displayCount"
  				number:from="this.count">
  				Count: {{this.count}}
  			</can-slot>

  			<can-slot name="incrementButton" />
  		</form>
  	`,
  	ViewModel: {
  		count: {type: "number", default: 0},
  		increment(event) {
  			event.preventDefault();
  			this.count++;
  		}
  	}
  });

  Component.extend({
  	tag: "my-app",
  	view: `
  		<my-counter>
  			<can-template name="incrementButton">
  				<button>Add One</button>
  			</can-template>
  		</my-counter>
  	`
  });
  </script>

  ```
  <div class="codepen"></div>
  <div line-highlight="11,29-33,only"></div>



@body

## Use

`<can-slot>` and [can-component/can-template <can-template>] are used together to
customize the layout of a component.

`<can-template>` is used to provide custom layout to a component.  `<can-slot>` positions that
layout within a component's [can-component.prototype.view].  One way to think about it is that
`<can-template>` is an argument to a component.  Component uses `<can-slot>` to look up
that argument and use it.

`<can-template>` and `<can-slot>`s must have a _name_ attribute like:

```html
<can-template name="someName">...</can-template>

<can-slot name="someName">...</can-slot>
```

Those _names_ are used to match a `<can-slot>` to a user provided `<can-template>`.

For example, `<can-template name="incrementButton">` passes an `incrementButton`
template to the `<my-counter>` element below:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
	tag: "my-counter",
	view: `
		<form on:submit="this.increment(scope.event)">
			Count: <span>{{this.count}}</span>

			<can-slot name="incrementButton"/>
		</form>
	`,
	ViewModel: {
		count: {type: "number", default: 0},
		increment(event) {
		event.preventDefault();
			this.count++;
		}
	}
});


Component.extend({
	tag: "my-app",
	view: `
		<my-counter>
			<can-template name="incrementButton">
				<button>Add One</button>
			</can-template>
		</my-counter>
	`
});
</script>
```
@codepen
@highlight 11,28-30,only

## Passing values

By default, `<can-template>`s are rendered with the same scope as
the surrounding content. For example, `{{this.word}}`
is available but `{{count}}` is not:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
	tag: "my-counter",
	view: `
		<form on:submit="this.increment(scope.event)">
		<can-slot name="displayCount"/>

		<button>+1</button>
		</form>
	`,
	ViewModel: {
		count: {type: "number", default: 0},
		increment(event) {
			event.preventDefault();
			this.count++;
		}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<my-counter>
			<can-template name="displayCount">
				Your {{this.word}} is <b>{{count}}</b>
			</can-template>
		</my-counter>
	`,
	ViewModel: {
		word: {default: "number"}
	}
});
</script>
```
@codepen
@highlight 28

You can use [can-stache-bindings.toChild] or [can-stache-bindings.twoWay] to pass
values to the `<can-template>`'s content.  The following passes `count` as `number` to `<can-template name="displayCount">`:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
	tag: "my-counter",
	view: `
		<form on:submit="this.increment(scope.event)">
			<can-slot name="displayCount"
				number:from="this.count" />

			<button>+1</button>
		</form>
	`,
	ViewModel: {
		count: {type: "number", default: 0},
		increment(event) {
			event.preventDefault();
			this.count++;
		}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<my-counter>
			<can-template name="displayCount">
				Your {{this.word}} is <b>{{number}}</b>
			</can-template>
		</my-counter>
	`,
	ViewModel: {
		word: {default: "number"}
	}
});
</script>

```
@codepen
@highlight 9-10,29,only

Functions can be passed to. The following shows passing `<my-counter>`'s
`add` method:

```html
<my-app></my-app>
<script type="module">
import {Component} from "can";

Component.extend({
	tag: "my-counter",
	view: `
		<can-slot name="incrementButton"
			add:from="this.add"/>
		<can-slot name="countDisplay"
			count:from="this.count"/>
	`,
	ViewModel: {
		count: {type: "number", default: 0},
		add(increment){
			this.count += increment;
		}
	}
});


Component.extend({
	tag: "my-app",
	view: `
		<my-counter count:from="5">
			<can-template name="incrementButton">
				<button on:click="add(5)">ADD 5!</button>
			</can-template>
			<can-template name="countDisplay">
				You have counted to {{count}}!
			</can-template>
		</my-counter>
	`
});
</script>

```
@codepen
@highlight 8-9,26-28,only
