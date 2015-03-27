@page BuildWidgets Build Widgets/UI Elements
@parent Recipes 5

@body

Previous recipes have demonstrated how to change page content and introduced
event handling. The following recipes will introduce `can.Component`,
which allows for straightforward widget construction by packaging
template, state, and event handling code in one place.

While similar *behavior* can be accomplished with `can.Control`,
building a Component enables building reusable widgets using custom
HTML tags.

## Create a Component

The previous recipe that displays a list of people can instead
be represented as a component.

```
<people></people>
```

By specifying `people` as the tag, a component is created wherever `<people></people>`
appears in a template.

```
can.Component.extend({
	tag: 'people',
```

The `scope` object on a `Component` contains the component's state, data,
and behavior. Here, it specifies how to `remove` a person from the list:

```
	scope: {
		people: people,
		remove: function( person ) {
			var people = this.attr("people");
			var index = people.indexOf(person);
			people.splice(index, 1);
		}
	}
});
```

The template for the component itself is passed via the `template`
property. This can either be an external file or a string.
Each `li` uses `can-click`, [which declares an event binding.](http://canjs.com/docs/can.view.bindings.can-EVENT.html)
Here, `remove` inside the component's
scope will be called with the relevant `people` object
as an argument.

```
scope: {
	template: '<ul>' +
				'{{#each people}}' +
				'<li can-click="remove">' +
					'{{lastname}}, {{firstname}}' +
				'</li>' +
				'{{/each}}' +
				'</ul>',
...
```

This behaves similarly to the `can.Control` from above.
However, the `<people>` tag can be used without having
any knowledge about the inner workings of the widget.
Using declarative HTML tags, a component can be used
without writing any javascript. The template, state,
and behavior are all combined into one Component.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/WBM9z/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

## Build a Tabs Widget

A tabs widget could be instantiated with the following HTML:

```
<tabs>
	<panel title="Fruit">Oranges, Apples, Pears</panel>
	<panel title="Vegetable">Carrot, Lettuce, Rutabega</panel>
	<panel title="Grains">Bread, Pasta, Rice</panel>
</tabs>
```

A designer that understands HTML can put together a template for a `tabs`
widget without understanding anything other than the syntax.
This is one of the most useful features of components.

## Tabs Widget Behavior

Before implementing the component itself, we'll
define an observable *view model*--the `scope` object
of the UI element. This makes the code modular and easier
to manage (and also allows for unit testing).

In order to accurately represent a tabs widget,
a `TabsViewModel` needs:
<ul>
<li>An observable list of panels</li>
<li>A state variable with the active panel</li>
<li>Helper methods to add, remove, and activate panels</li>
</ul>

Since TabsViewModel is a `can.Map`, the `panels` property is
automatically converted to a `can.List`.
The `active` property references the `panel` object
that should currently be displayed.

```
var TabsViewModel = can.Map.extend({
	panels: [],
	active: null,
	addPanel: function( panel ){
		var panels = this.attr("panels");
		panels.push(panel);
		panel.attr("visible", false);
		//activate panel if it is the first one
		if ( panels.attr("length") === 1 ){
			this.activate( panel );
		}
	},
	removePanel: function( panel ){
		var panels = this.attr("panels");
		var index = panels.indexOf(panel);
		panels.splice(index, 1);
		//activate a new panel if panel being removed was the active panel
		if( this.attr("active") === panel ){
			panels.attr("length") ? this.activate(panels[0]) : this.attr("active", null)
		}
	},
	activate: function( panel ){
		var active = this.attr("active")
		if( active !== panel ){
			active && active.attr("visible", false);
			this.attr("active", panel.attr("visible", true));
		}
	}
});
```

### Tabs Widget Component

Now that the view model is defined, making a component is simply
a matter of defining the way the tabs widget is displayed.

The template for a `tabs` component needs a list of panel titles
that will `activate` that panel when clicked. By calling `activate`
with a panel as the argument, the properties of the `panel` can
be manipulated. By changing the `visible` property of a panel,
a template can be used to display or hide the panel accordingly.

For this component, our template should look something like this:

```
<tabs>
	<panel title="Fruits">Apples, Oranges</panel>
	<panel title="Vegetables">Carrots, Celery</panel>
</tabs>
```

A designer can create a `tabs` component with `panel` components inside it.
The `template` object on the tabs component's scope needs to be able to render
the content that is inside of the `<tabs>` tag. To do this, we simply use the
`<content>` tag, which will render everything within the component's tags:

```
can.Component.extend({
	tag: "tabs",
	scope: TabsViewModel,
	template: "<ul>\
				{{#each panels}}\
					<li can-click='activate'>{{title}}</li>\
				{{/each}}\
				</ul>\
				<content />"
});
```

The `tabs` component contains panels, which are also defined
as components. The tabs template contains the logic for whether
the panel is visible (`visible` is controlled by the tabs
component's `activate` method).

Each panel's `scope` contains a title, which should be
taken from the `title` attribute in the `<panel>` tag.
If you want to set the string value of a Component's
attribute as a `scope` variable, use  `@'`.

```
can.Component.extend({
tag: "panel",
template: "{{#if visible}}<content />{{/if}}",
scope: {
	title: "@"
},
...
```

In addition to the `scope` property, a component has an
[`events` property](http://canjs.com/docs/can.Component.prototype.events.html).
This `events` property uses a `can.Control` instantiated inside
the component to handle events.

Since we defined behavior for adding panels on the parent
`tabs` component, we should use this method whenever a `panel`
is inserted into the page (and an `inserted` event is triggered).
To add the panel to the `tabs` component's scope, we call the
`addPanel` method by accessing the parent scope with `this.element.parent().scope()`:

```
...
	events: {
		inserted: function() {
			this.element.parent().scope().addPanel( this.scope )
		},
		removed: function() {
			this.element.parent().scope().addPanel( this.scope )
		}
	}
});
```

With this component, any time a `<tabs>` element with
`<panel>` elements is put in a page, a tabs widget will
automatically be created. This allows application behavior
and design to be compartmentalized from each other.

<iframe width="100%" height="300" src="http://jsfiddle.net/x6TJK/2/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>