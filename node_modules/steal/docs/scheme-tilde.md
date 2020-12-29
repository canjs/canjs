@property tilde ~
@parent StealJS.schemes

The `homeAlias` is a lookup scheme that roots module lookup to your project's base folder, either your `steal.directories.lib` folder or the [config.baseURL].  It is set to `~`, by default, but can be customized.

This syntax is supported by all module formats.

## Use

Prepend lookups with `~/` such as:

    var tabs = require("~/components/tabs/tabs");

This will load the module from `BASE/components/tabs/tabs.js`. If your package.json has:

    {
      "steal": {
        "directories": {
          "lib": "src"
		}
	    ...
	  }
	}

Then it will be loaded from `BASE/src/components/tabs/tabs.js`.

## Custom `homeAlias` Symbol

You can change the symbol that's used as the `homeAlias` operator in the `steal` configuration.  The following example sets the `homeAlias` to be the `@` symbol, instead of `~`, for the entire project.

```
"steal": {
  "homeAlias": "@"
}
```

Using the above configuration, importing a module relative to the project's home folder is done like this:

```
import myComponent from "@/components/my-component/";
```

## Alternatives

The **~** scheme is an alternative to using the package name for look up, such as:

     {
	   "name": "app"

	   ...
	 }

And loading as:

     var tabs = require("app/components/tabs/tabs");

Using ~ provides a shorter alias for your app's package name.

## Production

Note that in production you need to use your app's package name in your script tag such as:

```html
<script src="node_modules/steal/steal.js" main="app/main"></script>
```
