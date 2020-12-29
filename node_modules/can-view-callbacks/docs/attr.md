@function can-view-callbacks.attr attr
@parent can-view-callbacks/methods

Register custom behavior for an attribute.

@signature `callbacks.attr(attributeName, attrHandler(el, attrData))`

Registers the `attrHandler` callback when `attributeName` is found
in a template.

Handlers must be registered before templates using them are parsed.

```js
import canViewCallbacks from "can-view-callbacks";
import domEvents from "can-dom-events";

canViewCallbacks.attr( "show-when", function( el, attrData ) {
	const prop = el.getAttribute( "show-when" );
	const compute = attrData.compute( prop );

	const showOrHide = function() {
		const val = compute();
		if ( val ) {
			el.style.display = "block";
		} else {
			el.style.display = "hidden";
		}
	};

	compute.on( "change", showOrHide );
	showOrHide();

	domEvents.addEventListener.call( el, "removed", function onremove() {
		compute.off( "change", showOrHide );
		domEvents.removeEventListener.call( "removed", onremove );
	} );
} );
```



@param {String|RegExp} attributeName A lower-case attribute name or regular expression
that matches attribute names. Examples: `"my-fill"` or `/my-\w/`.

@param {function(HTMLElement,can-view-callbacks.attrData)} attrHandler(el, attrData)
A function that adds custom behavior to `el`. Note that `el` might not be in the DOM
when the callback is called.

@body

## Use

`canViewCallbacks.attr` is used to add custom behavior to elements that contain a
specified html attribute. Typically it is used to mixin behavior (whereas
[can-view-callbacks.tag] is used to define behavior).

The following example adds a jQueryUI tooltip to any element that has
a `tooltip` attribute like `<div tooltip="Click to edit">Name</div>`.


@demo demos/can-view-callbacks/tooltip.html

## Listening to attribute changes

In the previous example, the content of the tooltip was static. However,
it’s likely that the tooltip’s value might change. For instance, the template
might want to dynamically update the tooltip like:

```html
<button tooltip="{{deleteTooltip()}}">
  Delete
</button>
```

Where `deleteTooltip()` changes depending on how many users are selected:

```js
{
	deleteTooltip: function() {
		const selectedCount = selected.length;
		if ( selectedCount ) {
			return "Delete " + selectedCount + " users";
		} else {
			return "Select users to delete them.";
		}
	}
}
```

The [can-dom-mutate/events/events attributes] event can be used to listen to when
the tooltip attribute changes its value like:

```js
var domMutateEvents = require("can-dom-mutate/events/events");
domEvents.addEvent(domMutateEvents.attributes);


canViewCallbacks.attr( "tooltip", function( el, attrData ) {

	// A helper that updates or sets up the tooltip
	const updateTooltip = function() {
		$( el ).tooltip( {
			content: el.getAttribute( "tooltip" ),
			items: "[tooltip]"
		} );
	};

	// When the tooltip attribute changes, update the tooltip
	domEvents.addEventListener( el, "attributes", function( ev ) {
		if ( ev.attributeName === "tooltip" ) {
			updateTooltip();
		}
	} );

	// Setup the tooltip
	updateTooltip();

} );
```

To see this behavior in the following demo, hover the mouse over the “Delete”
button. Then select some users and hover over the “Delete” button again:

@demo demos/can-view-callbacks/dynamic_tooltip.html


## Reading values from the scope.

It’s common that attribute mixins need complex, observable data to
perform rich behavior. The attribute mixin is able to read
data from the element’s [can-view-scope scope]. For example,
__toggle__ and __fade-in-when__ will need the value of `showing` in:

```html
<button toggle="showing">
	{{#if(showing)}}Hide{{else}}Show{{/if}} more info
</button>
<div fade-in-when="showing">
	Here is more info!
</div>
```

These values can be read from [can-view-callbacks.attrData]’s scope like:

```js
attrData.scope.attr( "showing" );
```

But often, you want to update scope value or listen when the scope value
changes. For example, the __toggle__ mixin might want to update `showing`
and the __fade-in-when__ mixin needs to know when
the `showing` changes.  Both of these can be achieved by
using [can-view-scope::compute compute] to get a get/set compute that is
tied to the value in the scope:

```js
const showing = attrData.scope.compute( "showing" );
```

This value can be written to by `toggle`:

```js
canViewCallbacks.attr( "toggle", function( el, attrData ) {
	const attrValue = el.getAttribute( "toggle" );
	const toggleCompute = attrData.scope.compute( attrValue );

	$( el ).click( function() {
		toggleCompute( !toggleCompute() );
	} );
} );
```

Or listened to by `fade-in-when`:

```js
canViewCallbacks.attr( "fade-in-when", function( el, attrData ) {
	const attrValue = el.getAttribute( "fade-in-when" );
	const fadeInCompute = attrData.scope.compute( attrValue );

	// handler for when the observable changes
	const handler = function( event, newVal, oldVal ) {
		if ( newVal && !oldVal ) {
			$( el ).fadeIn( "slow" );
		} else if ( !newVal ) {
			$( el ).hide();
		}
	};

	fadeInCompute.on( "change", handler );

	// ...

} );
```

When you listen to something other than the attribute’s element, remember to
unbind the event handler when the element is [can-dom-mutate/events/events removed] from the page:

```js
domEvents.addEventListener.call( el, "removed", function() {
	fadeInCompute.off( "change", handler );
} );
```

@demo demos/can-view-callbacks/fade_in_when.html

## When to call

`canViewCallbacks.attr` must be called before a template is processed. When
using [can-stache] to create a renderer function, `canViewCallbacks.attr` must
be called before the template is loaded, not simply before it is rendered.

```js
//Call canViewCallbacks.attr first
canViewCallbacks.attr( "tooltip", tooltipFunction );

//Preload a template for rendering
const renderer = stache( "<div tooltip='Hi There'>...</div>" );

//No calls to canViewCallbacks.attr after this will be used by `renderer`
```
