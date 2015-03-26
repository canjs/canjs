@page using-production In Production
@parent Using 2

While it makes sense to use uniminified JavaScript split into separate files and a CanJS debugging version (like `can.jquery.dev.js`) during development, you should concatenate and minify all your resources for use in production. If you are using CanJS [using-standalone standalone] this can be done through a build tool like [Grunt](http://gruntjs.com/) or [Gulp](http://gulpjs.com/) or tools part of your server side framework like the [Ruby on Rails asset pipeline](http://guides.rubyonrails.org/asset_pipeline.html).

## View compilation

CanJS can pre-compile [EJS](/docs/can.ejs.html) and [Mustache](/docs/can.mustache.html) views into JavaScript functions contained within a single file in order to avoid additional requests for view files in production. When using CanJS [using-standalone standalone] or [using-require with AMD (RequireJS)] you can use the [can-compile](https://github.com/daffl/can-compile) Node module. Install with

> npm install can-compile -g

And in your project root folder run:

> can-compile --out views.production.js

This will create `views.production.js` in the current folder containing all pre-compiled views. When loaded into your page CanJS will use the per-compiled views instead of making an Ajax request to retrieve them.

## Building with the RequireJS optimizer

You can run the [RequireJS optimizer](http://requirejs.org/docs/optimization.html) against your application but need to make sure to put
all the configuration in a separate file, e.g. `js/app.js`:

```
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
```

Then run `r.js` like:

> r.js js/app.js

Read up in the [can-compile + RequireJS](https://github.com/daffl/can-compile#loading-with-requirejs) documentation how to include pre-compiled views in your build.

## Building with StealJS

When using [using-steal CanJS with StealJS] with the generated application you can simply run

> ./js app/scripts/build.js

In your JavaScriptMVC folder. This will create `app/production.js` and `app/production.css` which will be loaded when
referencing `steal.production.js` in `app/index.html` (instead of `steal.js` itself).
