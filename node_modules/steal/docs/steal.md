@page steal
@parent StealJS.api
@group StealJS.syntaxes syntaxes
@group StealJS.config config
@group StealJS.modules modules
@group StealJS.types types
@group StealJS.functions functions
@group StealJS.schemes schemes
@group StealJS.hooks hooks
@group StealJS.other other

Steal is a  module loader that supports a wide variety of 
syntaxes and configuration options. It makes modular development, test
and production workflows simple.

There are four basic steps when using Steal:

 - Install steal
 - Add the steal script tag
 - Configure steal
 - Import modules and make stuff happen

Steal works slightly differently depending on how it is installed.  There
are three ways to install Steal:

 - [npm](#section_npmbasics)
 - [download](#section_Downloadbasics)

## npm basics

The following details how to use steal installed via [npm](https://www.npmjs.com/) to make
a simple jQuery app.

### Install

```
> npm install steal -S
> npm install jquery
```

Next to your application's _node_modules_ folder, create _myapp.js_ and
_myapp.html_:

```
/
  node_modules/
  package.json
  myapp.js
  myapp.html
```

### Add the script tag

In _myapp.html_, add a script tag that that loads _steal.js_ and points
to the [config.main main] entrypoint of your application. If
main is not provided, [config.main] will be set to _package.json_'s main.

```
<!-- myapp.html -->
<script src="./node_modules/steal/steal.js" main="myapp"></script>
```

### Configure

Steal reads your application's _package.json_ and all of its 
`dependencies`, `peerDependencies`, and `devDependencies` recursively.

Most configuration is done in the `steal` property of 
package.json. The special npm configuration options are listed [npm here].


The following _package.json_ only loads the `dependencies`.

```
{
  "name": "myapp",
  "main": "myapp",
  "dependencies": {
    "jquery": "2.1.3"
  },
  "devDependencies": {...}
  "steal": {

  }
}
```

If there are problems loading some of your dependencies, read how to configure them on the [npm] page.

### Import modules and make stuff happen

In _myapp.js_, import your dependencies and write your app:

```
// myapp.js
import $ from "jquery";
$("body").append("<h1>Hello World</h1>")
```

### Importing in your app

From here using packages is the same as if you used npm, just import them into
_myapp.js_ and do what you need:

```js
import can from "canjs";

var renderer = can.stache("<h1>StealJS {{what}}</h1>");
can.$("body").append(renderer({
	what: "rocks!"
}));
```

## Download basics

The following details how to use steal installed via its download to
make a basic jQuery app.

### Install

[Download Steal](https://github.com/bitovi/steal/archive/master.zip) and unzip into your application's folder. 

In your application's folder, create _myapp.js_,
_myapp.html_ and _config.js_. You should have something like:

```
/
  steal/
    ext/
    steal.js
    steal.production.js
  myapp.js
  myapp.html
```

### Add the script tag

In _myapp.html_, add a script tag that that loads _steal.js_ and points
to the [config.configPath configPath] and [config.main main] entrypoint of your application.


```
<!-- myapp.html -->
<script src="../path/to/steal/steal.js"
        config="./config.js"
        main="myapp">
</script>
```

### <a name="path-configure"></a>Configure

`config.js` is used to configure the behavior of
your site's modules. For example, to load jQuery from a CDN:

```
// config.js
steal.config({
  paths: {"jquery": "http://code.jquery.com/jquery-1.11.0.min.js"}
});
```

> Note: Steal makes an AJAX request for the above example. Both client and server will need 
> to accept/handle CORS requests properly when using remote resources.


### Import modules and make stuff happen

In _myapp.js_, import your dependencies and write your app:

```js
// myapp.js
import $ from "jquery";
$("body").append("<h1>Hello World</h1>")
```

## Configuring `steal.loader`

Once steal.js loads, its startup behavior is determined
configuration values.  Configuration values can be set in three ways:

 - Set on a `steal` object prior to loading steal.js like:
  
        <script>
          steal = {main: "myapp"};
        </script>
        <script src="../path/to/steal/steal.js"></script>

 - Attributes on the steal.js script tag like:
  
        <script src="../path/to/steal/steal.js"
                main="myapp">
        </script>
 
 - Calling [config.config]. This technique is typically used in the [config.configMain] module.

        steal.config({
          paths: {"can/*" : "http://canjs.com/release/2.0.1/can/*"}
        })

   If you are using npm, your app's package.json will be loaded automatically. Steal configuration happens in their `steal` properties:
   
        {
          "name": "myapp",
          "dependencies": { ... },
          "steal": {
            "map": {"can/util/util": "can/util/jquery/jquery"}
          }
        }

Typically, developers configure the [config.main] and [config.configPath] properties 
with attributes on the steal.js script tag like:

    <script src="../path/to/steal/steal.js"
            main="myapp"
            config-path="../config.js">
    </script>

Setting [config.configPath] sets [config.baseURL] to the 
configPath's parent directory.  This would load _config.js_ prior to
loading _../myapp.js_.

When _steal.js_ loads, it sets [config.stealPath stealPath].  [config.stealPath stealPath] sets default values
for [config.baseURL baseURL] and [config.configPath configPath]. If _steal.js_ is in _node_modules_,
[config.configPath] defaults to _node_modules_ parent folder. So if you write:

    <script src="../../node_modules/steal/steal.js"
            main="myapp">
    </script>

This will load `../../package.json` before it loads `../../myapp.js`.

## Writing Modules

Once you've loaded and configured steal's behavior, it's time to start 
writing and loading modules.  Currently, [syntax.es6 ES6 syntax] is supported
in IE9+.  ES6 syntax looks like:

    import can from "can";
    
[@traceur Traceur Compiler] is used and all of 
of its [language features](https://github.com/google/traceur-compiler/wiki/LanguageFeatures) will work.

If you must support <IE8, use any of the other syntaxes.

Finally, steal supports [$less less] and [$css css] out of the box. Import, require, or
steal them into your project by adding a "!" after the filename.

    // ES6
    import "style.less!";
    
    // AMD
    define(["style.less!"],function(){ ... });
    
    // CommonJS
    require("style.less!");
    
    // steal
    steal("style.less!")

