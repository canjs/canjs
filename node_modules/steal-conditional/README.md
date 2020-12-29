
# steal-conditional

## Installation

Install the npm package running: 

```js
npm install steal-conditional --save-dev
```

then, add the extension to your package.json `configDependencies` so `steal` loads it before any application module

```

"system": {
  "configDependencies": [
    "./node_modules/steal-conditional/conditional"
  ]
}

```

## Conditions Extension

Allows a condition module to alter the resolution of an import via syntax:

```js
import $ from 'jquery/#{browser}';
```

Will first load the module 'browser' via `System.import('browser')` and
take the default export of that module.
If the default export is not a string, an error is thrown.

We then substitute the string into the require to get the conditional resolution
enabling environment-specific variations like:

```js
import $ from 'jquery/ie'
import $ from 'jquery/firefox'
import $ from 'jquery/chrome'
import $ from 'jquery/safari'
```

It can be useful for a condition module to define multiple conditions.
This can be done via the `.` modifier to specify a member expression:

```js
import 'jquery/#{browser.grade}'
```

Where the `grade` export of the `browser` module is taken for substitution.

Note that `/` and a leading `.` are not permitted within conditional modules
so that this syntax can be well-defined.


### Boolean Conditionals

For polyfill modules, that are used as imports but have no module value,
a binary conditional allows a module not to be loaded at all if not needed:

```js
import 'es5-shim#?conditions.needs-es5shim'
```

These conditions can also be negated via:

```js
import 'es5-shim#?~conditions.supports-es5'
```

## License

MIT
