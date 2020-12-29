@module {undefined} can-vdom
@parent can-polyfills
@collection can-ecosystem
@group can-vdom.modules modules
@group can-vdom.types types
@package ./package.json
@description A browser-lite environment for Node.js or a worker thread.

@type {undefined}

The `can-vdom` module does not export anything, but it changes the current
environment to have the limited subset of browser environment behavior and
functionality needed to support CanJS templates and other behavior without
a native DOM.

```js
require( "can-vdom" );

window === global; // true

document.getElementsByTagName( "body" ); // [HTMLBodyElement]
```

`can-vdom` decorates the environment `global` to include:

 - a non-functional `navigator`, `location`, and `history` object.
 - a limitedly functional `document` with basic `Node` behavior, event binding and dispatching.



@body



## Shiming a browser environment

Importing `can-vdom` will shim a browser-like environment into Node's globals. Use this approach to run code that expects a global `window` and/or `document` object.

```js
require( "can-vdom" );

typeof window; // "object"

typeof window.addEventListener; // "function"

document.getElementById( "foo" ); // undefined
```

## Loading as a module

If you want to prevent setting globals you can load `can-vdom/make-window/make-window` directly:

```js
import makeWindow from "can-vdom/make-window/make-window";

const myWindow = makeWindow( global );
```
