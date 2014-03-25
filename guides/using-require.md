@page using-require With AMD (RequireJS)
@parent Using 1

The [CanJS Download](../download.html) contains an `amd/` folder which allows you to load any CanJS component and plugin using an AMD module loader like [RequireJS](http://requirejs.org/). Unlike many other JavaScript libraries CanJS is fully modular and loading a dependency will only include the modules actually used (for example, `can/control` will only load `can/construct` and `can/util`). The `amd-dev/` folder contains the same files but with debugging message enabled which can be very helpful during development.

## Configuration

The default library used with AMD modules is jQuery. CanJS will reference the `jquery` module so that name needs to point to your jQuery source and the `can` module name needs to be mapped to the `amd/` folder of the CanJS download.

__RequireJS:__

In RequireJS a simple configuration looks like this:

    <script type="text/javascript" src="require.js"></script>
    <script type="text/javascript">
      require.config({
        paths : {
          "jquery" : "http://code.jquery.com/jquery-2.0.3",
          "can": "path/to/can/amd"
        }
      });

      require(['can/control', 'can/view/mustache'], function(Control, can) {
        // Use Mustache and Control
        var MyControl = Control.extend({
          init: function() {
            this.element.html(can.view('path/to/view.mustache', this.options));
          }
        });
      });
    </script>

The `can/can` module is a shortcut that loads CanJS's core plugins and returns the `can` namespace:

    require(['can/can'], function(can) {
      // Use can.Control, can.view, can.Model etc.
    });

__Dojo:__

The configuration for Dojo is similar but `can/util/library` needs to be mapped to `can/util/dojo`:

    <script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.3/dojo/dojo.js">
    </script>
    <script src="can.dojo.js"></script>
    <script>
      require({
        aliases : [
          ['can/util/library', 'can/util/dojo']
        ],
        paths : {
          can: 'path/to/can/amd'
        }
      });

      require(['can/control'], function(Control) {
        // Use Control
      });
    </script>

__Other libraries:__

If you would like to use another library, map the `can/util/library` module to `can/util/zepto`,
`can/util/yui` or `can/util/mootools`.

With RequireJS and Zepto, it loks like this:

    require.config({
      paths : {
        "can": "path/to/can/amd"
      },
      map : {
        '*' : {
          "can/util/library" : "can/util/zepto"
        }
      },
      paths: {
        "zepto" : "http://cdnjs.cloudflare.com/ajax/libs/zepto/1.0rc1/zepto.min"
      }
    });

## Bower + RequireJS

A fairly common setup is using CanJS with RequireJS and [Bower](http://bower.io/) as the package manager which is described in the following section. For a working example have a look at the [RequireJS + CanJS TodoMVC example](http://todomvc.com/labs/dependency-examples/canjs_require/).

If you haven't yet, initialize a `bower.json` in your project folder by running

> bower init

After that we need to add jQuery, RequireJS and CanJS as dependencies:

> bower install jquery requirejs canjs --save

And initialize RequireJS on our HTML page and point the root module to `js/app`:

    <script data-main="js/app" src="bower_components/requirejs/require.js"></script>

In `js/app.js`:

    require.config({
      paths : {
        "jquery" : "bower_components/jquery/jquery",
        "can": "bower_components/can/amd"
      }
    });

    require('./my-control', function(MyControl, can) {
      new MyControl('body', {});
    });

In `js/my-control.js`:

    require(['can/control', 'can/view/mustache'], function(Control, can) {
      // Use Mustache and Control
      return Control.extend({
        init: function() {
          this.element.html(can.view('views/index.mustache', {
            message: 'CanJS'
          }));
        }
      });
    });

In `view/index.mustache`:

    <h1>Hello {{message}}!</h1>

You are set up and good to go. Follow up in the [using-production Using CanJS in production] section on how to pre-compile your views and make a build using the RequireJS optimizer.
