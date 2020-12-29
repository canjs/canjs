@page StealJS.loading-from-cdn Loading Scripts from a CDN
@parent StealJS.guides

@body

Steal can be used to load script files from a URL, such as a Content Delivery Network (CDN).


## Loading from a CDN in production

A common use case is to load a script from a CDN in production-mode only.
This example will show you how to load jQuery from NPM in development mode, but use jQuery's CDN in production.

There are two changes that need to be made for this to work:

* Set the System config to use the CDN path for production
* Modify the build script to ignore jQuery when creating production bundles

### System configuration

Here is an example showing how to set the System config to load jQuery from production.

```
  "system": {
    "envs": {
      "window-production": {
        "paths": {
          "jquery": "https://code.jquery.com/jquery-2.2.4.min.js"
        }
      }
    }
  }
```

### Build script

Update the build script to ignore jQuery.
This example shows how to do this with a simple build.js file.

```
var stealTools = require('steal-tools');

stealTools.build({
    config: __dirname + "/package.json!npm"
}, {
    ignore: [ 'jquery' ]
});
```


## Always Loading from a CDN

If you want to load a script from a CDN in all environments:

* Load the file using a script tag
* Configure Steal to use the previously loaded file

### Load Using a &lt;script&gt; Tag and Configure Steal to use Loaded Version

```
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script>
      steal = {
        instantiated: {
          jquery: { 'default': window.jQuery, __useDefault: true }
        }
      };
    </script>
    <script src="./node_modules/steal/steal.js"></script>
```

### Prevent Steal from Looking for jQuery During Build

In order for the production build to work, map jQuery to the `@empty` module so Steal knows it doesn't need to try and find it:

```
  "system": {
    "envs": {
      "build-development": {
        "map": {
          "jquery": "@empty"
        }
      }
    }
  }
```
