@typedef {function} can-component/beforeremove beforeremove
@parent can-component.deprecated

@deprecated {4.0} Use [can-component/connectedCallback] instead. See [migrate-4#inserted_removedevent Migrating to CanJS 4’s inserted/removed event section] for more information.


@description An event called only on component’s elements before they are removed from the
document if live binding is performing the removal. It can be listened to
within a component’s [can-component.prototype.events] object or on a component
element with [can-stache-bindings.event] bindings.  This is an additional
special event only on component elements. Check out [can-dom-mutate//events/events]
for other mutation events.

@signature `"{element} beforeremove": function(element, event)`

Listens to when the component element is removed.  
This is commonly used for cleaning up and tearing down a component.

For example, the following might remove the component’s ViewModel
from a parent component’s ViewModel:

```js
import canViewModel from "can-view-model";
import Component from "can-component";

Component.extend({
	tag: "my-component",
	events: {
		"{element} beforeremove": function() {
			canViewModel( this.element.parentNode )
				.removePanel( this.viewModel );
		}
	}
});
```

	@param {HTMLElement} element The component element.
	@param {Event} event The `beforeremove` event object.

@signature `on:beforeremove="CALL_EXRESSION"`

Uses [can-stache-bindings.event] bindings to listen for a component’s
`beforeremove` event.

```html
<my-panel on:beforeremove="removePanel(scope.viewModel)"/>
```

	@param {can-stache/expressions/call} CALL_EXRESSION A call expression that calls some method when the event happens.
