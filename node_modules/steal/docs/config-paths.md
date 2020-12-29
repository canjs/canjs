@property {Object.<glob,glob>} config.paths paths
@parent StealJS.config

Configure the location of a module or modules.

@option {Object.<glob,glob>}

If a [moduleName] matches one of the keys of the `paths` config, it is located 
with at the value of the key. 

If paths for [@config], [@dev], [@traceur],
[$css], [$less], "bundles/\*" and "bundles/\*.css" are not set, `steal.js` 
will provide [default paths](#section_Defaultpathsconfiguredbysteal).

 
@body 

## Use

`paths` can be configured with any of the approaches in [config.config]. It
is used to provide the path of a module. You might use this if you install a module
with a package manager, for example with npm: 

```json
"steal": {
	"paths": {
		"jquery": "node_modules/jquery/dist/jquery.js"
	}
}
```

Will map the the `jquery` module to where the JavaScript file is located in node_modules.

### Wildcard paths

The `*` is used to denote wildcard paths. These allow substitution in cases where
you want a common pattern for referring to module names. A common example of this
would be a package where you want to load only certain modules and not the `main`
module.

For example:

```json
"steal": {
	"paths": {
		"lodash/*": "/js/lodash/*.js",
		"theme/*": "jquery-ui/themes/base/jquery.ui.*css"

	}
}
```

This would allow you to do:

```
import throttle from "lodash/functions/throttle"
```
to load only the throttle function.

See [this issue](https://github.com/systemjs/systemjs/issues/113) on why `css` and other extensions have
strange rules.

## Default paths configured by steal

If the following paths are not specified, `steal.js` will use a default path according
to the following rules:


- [@config] - If `steal.js` is in _ROOT/node\_modules/steal/steal.js_, `@config` defaults to
  <i>ROOT/stealconfig.js</i>; otherwise, it defaults to 
  _[config.baseURL baseURL]/stealconfig.js_. Specifying `@config` will specify [config.baseURL baseURL].
- [@dev] - defaults to _STEAL\_BASE/steal/dev.js_
- [@traceur] - defaults to _STEAL\_BASE/traceur/traceur.js_
- [$css] - defaults to _STEAL\_BASE/steal/css.js_
- [$less] - defaults to _STEAL\_BASE/steal/less.js_
- `"bundles/*"` - defaults to _"dist/bundles/\*.js"_
- `"bundles/*.css"` - defaults to _"dist/bundles/\*css"_

_Note: `STEAL_BASE` is the parent folder of the steal folder._
