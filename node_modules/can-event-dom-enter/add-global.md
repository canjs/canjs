@module {function} can-event-dom-enter/add-global/add-global can-event-dom-enter/add-global/add-global
@parent can-event-dom-enter
@description

Registers a global `enter` event, allowing listening to enter anywhere in your application.

@signature `unregister()`

Importing `can-event-dom-enter/add-global/add-global` registers the __enter__ event globally. Calling `unregister()` removes it from the global registry.

```js
import unregister from 'can-event-dom-enter/add-global/add-global';

// Later time
unregister();
```
