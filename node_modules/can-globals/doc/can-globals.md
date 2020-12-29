@module {Object} can-globals
@parent can-js-utilities
@collection can-infrastructure
@package ../package.json
@group can-globals/methods 0 methods
@group can-globals/modules 1 modules

@description An environment agnostic container for global variables. Useful for testing and server-side rendering (SSR), typically used internally by CanJS.

@type {Object} The `can-globals` package exports an object with
methods used to set and get global variables. For example, get the global [`location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) object:

```js
import globals from "can-globals";

const LOCATION = globals.getKeyValue( "location" );
```

New keys can be defined with the `define` method, overwritten with the `setKeyValue` method, and reset to their original value with the `reset` method.
All of these methods are demonstrated in the following example

```js
import globals from "can-globals";

globals.define( "foo", "bar" ); // foo === 'bar'

globals.setKeyValue( "foo", "baz" ); // foo === 'baz'

globals.reset( "foo" ); // foo === 'bar'
```
