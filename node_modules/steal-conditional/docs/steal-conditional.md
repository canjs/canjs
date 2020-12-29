@module {{}} steal-conditional
@parent StealJS.ecosystem

@description

**steal-conditional** is a plugin for StealJS that allows a condition module to
alter the resolution of an import via syntax

@body

## Use

Install steal-conditional with npm, saving it to your development dependencies:

```
> npm install steal-conditional --save-dev
```

then, add the extension to your package.json `configDependencies` so StealJS
loads it before any application module

```
"steal": {
  "configDependencies": [
    "./node_modules/steal-conditional/conditional"
  ]
}
```

### String substitution syntax

If a module is imported using the following syntax

```
import $ from 'jquery/#{browser}';
```

StealJS will first load the module "browser" via `System.import("browser")` and
take the default export of that module. If the default export is not a string,
an error is thrown.

Then StealJS substitutes the string into the module name to get conditional
resolution enabling environment-specific variations like:

```
import $ from "jquery/ie"
import $ from "jquery/firefox"
import $ from "jquery/chrome"
import $ from "jquery/safari"
```

It can be useful for a condition module to define multiple conditions.
This can be done via the `.` modifier to specify a member expression:

```
import "jquery/#{browser.grade}"
```

Where the `grade` export of the `browser` module is taken for substitution.

Note that `/` and a leading `.` are not permitted within conditional modules
so that this syntax can be well-defined.

### Boolean Conditionals

For polyfill modules, that are used as imports but have no module value,
a binary conditional allows a module not to be loaded at all if not needed:

```
import "es5-shim#?conditions.needs-es5shim"
```

These conditions can also be negated via:

```
import "es5-shim#?~is-es5-compatible"
```

### Bundling conditional modules

By default, the condition module (the one loaded first to determine whether to
load the module in the boolean conditionals or which module to load when using
string interpolation) will be added to the main bundle, this is the bundle loaded
first that starts your application. For boolean conditionals, a separate bundle is
created for the conditionally loaded module; and for string substitution, StealTools
will glob the filesystem to detect the possible variations and seperate bundles will
be created for each of them.
