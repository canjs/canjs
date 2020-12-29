@module {can-dom-events/EventRegistry} can-dom-events
@parent can-dom-utilities
@collection can-infrastructure
@package ../package.json
@group can-dom-events.static 0 static
@group can-dom-events.types 1 types
@group can-dom-events.helpers 2 helpers

@description Listen to DOM events and special events, and register
special events.

@type {can-dom-events/EventRegistry}
  The `can-dom-events` module exports the _global_ event registry.  Use
  it to listen to DOM events on HTML elements.  Any custom event
  types added to this registry are available to every other part of CanJS.


@body

## Use

The following listens to a 'change' event on an element:

```js
var domEvents = require("can-dom-events");
var input = document.createElement('input');

function onChange(event) {
    console.log('Input value changed to:', event.target.value);
}

domEvents.addEventListener(input, 'change', onChange);
```

Use [can-dom-events.dispatch] to fire custom events:
```js
domEvents.dispatch(input, 'change');
```

Use [can-dom-events.addDelegateListener] to listen to an event for all elements that
match a selector within a root element:

```js
domEvents.addDelegateListener(document.body,"click", "a", function(event){
  event.preventDefault();
});
```

Finally, you can create your own custom events and add them to
the global event registry. First, create an [can-dom-events/EventDefinition]
object. For example, the following might implement
an "escape" event that listens to when a user presses the `Escape` key:


```js
var handlerMap = new WeakMap();
var escapeEventDefinition = {
    defaultEventType: 'escape',
    addEventListener: function (target, eventType, handler) {
        var keyHandler = function (event) {
        	if (event.keyCode === 27 || event.key === 'Escape') {
        		return handler.apply(this, arguments);
        	}
        };
        handlerMap.set(handler, keyHandler)
        this.addEventListener(target, baseEventType, keyHandler);
    },
    removeEventListener: function (target, eventType, handler) {
        this.removeEventListener(target, baseEventType, handlerMap.get(handler));
    }
}
```

Then you can add this custom event to the registry and listen to that event:

```js
import domEvents from "can-dom-events";

domEvents.addEvent(escapeEventDefinition);

var input = document.querySelector("[name=search]");
domEvents.addEventListener(input, "escape", function(){

});
```
