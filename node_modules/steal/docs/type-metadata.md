@typedef {{}} load.metadata metadata
@parent StealJS.types

An object that is passed between `Loader` hooks.  Any values can be set.  These are the ones that `steal.js` recognize.

@option {String} format Specifies what type of Syntax is used.  This can be specified like:

    "format amd";

@option {Array.<moduleName>} [deps] Dependencies of this module. If the module is a global
but implicitly depends on another, like jQuery, add that dependency here.

```
"meta": {
  "jquery-cookie": {
    "deps": ["jquery"]
  }
}
```

@option {String} [exports] The global property that is exported as this module's default export.

@option {function(this:Global,Module...)} [init] Allows for calling noConflict and
for other cleanup.  `this` will be the global object.

@option {Boolean} [sideBundle=false] Create a bundle for this module and exclude it from
StealTool's bundle optimization algorithm. This is useful for modules that are infrequently
used, like a page for your app that users rarely visit.

```
"meta": {
  "moduleA": {
    "sideBundle": true
  }
}
```

@option {Boolean} [bundle=false] Exclude a module from being bundled.
```
"meta": {
  "MODULENAME": {
    "bundle": false
  }
}
```
If you exclude a module from the bundled file, you have to make sure, that in the [production environment configuration](http://stealjs.com/docs/config.envs.html)
the module is:

* ... [mapped to the pseudo-module @empty](http://stealjs.com/docs/config.map.html#ignoring-optional-dependencies)

    ```
    "envs": {
        "window-production": {
            "map": {
                "MODULENAME': "@empty"
            }
        }
    }
    ```

* ... [configured](http://stealjs.com/docs/steal.html#path-configure) to the [right location](http://stealjs.com/docs/config.paths.html) of the module e.g. a CDN

    ```
    "envs": {
        "production": {
            "paths": {
                "jquery': "//code.jquery.com/jquery-2.2.1.min.js"
            }
        }
    }
    ```

@option {Boolean} [useLocalDeps=false] Include module dependencies in the development bundle.
```
"meta": {
  "MODULENAME": {
    "useLocalDeps": true
  }
}
```
In this example all dependencies imported by `MODULENAME` will be included in the bundle during build.

This option can be used alongside [environment dependant configuration](http://stealjs.com/docs/config.envs.html) to make sure a specific version of a module is used during build time but the original (local) module dependencies are included in the development bundle.

```
"steal": {
  "meta": {
    "steal-less/less": {
      "useLocalDeps: true
    }
  },
  "envs": {
    "bundle-build": {
      "map" {
        "steal-less/less-engine": "steal-less/less-engine-node"
      }
    }
  }
}
```
The configuration above makes it so the NodeJS version of [less](http://lesscss.org/#using-less) is loaded while the application is built but `useLocalDeps` forces the local dependencies of `steal-less#less` to be included in the bundle.

@option {String} [eval=function] Specify the type of *eval* that should be applied to this module.

Most modules are evaled using the Function constructor like: `new Function(source).call(context)`. However, if you have a global module that looks like:

```
var Foo = function(){

};
```

Where `Foo` is the exported value in your configuration:

```
"steal": {
	"meta": {
		"foo": {
			"format": "global",
			"exports": "Foo"
		}
	}
}
```

In this situation, the default `new Function` method of evaluation will not work and the `Foo` variable will not be set on the window. In this case we want to update our **eval** configuration to `script`:

```
"steal": {
	"meta": {
		"foo": {
			"format": "global",
			"exports": "Foo",
			"eval": "script"
		}
	}
}
```

This will use `<script>` elements for evaluation and the `Foo` property will be set.

@option {{}} globals A map of globals to module names expected to be present for the execution of this module.

This is useful for legacy code that relies on globals being defined during execution; the module names
referenced are automatically turned into dependencies of this module.

If you have a global module `foo`, that looks like this:

```
var something = $$$;
```

Use the following configuration to make sure the global variable `$$$` is defined before `foo`
is executed:

```
"steal": {
	"meta": {
		"foo": {
			"format": "global",	
			"globals": {
				"$$$": "bar"
			}
		}
	}
}
```
