@page guides/setup Setting Up CanJS
@parent guides/essentials 1
@outline 2

@description Learn how to install CanJS in your environment.

@body

<style>
span[title] {
    color: green;
    cursor: pointer;
}
</style>

## Choosing the right environment

CanJS has a variety of packages, modules, and files ready to meet the needs of any development environment. This section is for people who aren’t sure what they
want. The following lists common scenarios and provides links to
the guide(s) that most closely satisfy that scenario.

- I just want to play, make a demo, or learn CanJS right now! 👉 Use the [ES module bundle](#ImportingthecoreESmodulebundle) or an [online code editor](#OnlineCodeEditors).
- I use webpack 👉 [Webpack](#Webpack)
- I use StealJS 👉 [StealJS](#StealJS)
- I use Browserify 👉 [Browserify](#Browserify)
- I want server-side rendering, progressive loading, continuous integration, testing,
  and a whole lot more 👉 [DoneJS](#DoneJS)
- I want to maximize long term flexibility 👉 [Importing individual packages](#Installingindividualpackages)

If this page doesn't have what you need, please
ask on the [forums](https://forums.bitovi.com/c/canjs) or
[Slack](https://www.bitovi.com/community/slack) ([#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A)).

## Explanation of different builds

CanJS has a variety of packages, modules, and files ready to meet the needs of
any development environment. This section gives technical details on these items.

- __The individual packages.__

  CanJS is composed from over 80 individual packages.  For example [can-component Component]
  is actually the [can-component](https://www.npmjs.com/package/can-component) package, housed
  in its own [GitHub repository](https://github.com/canjs/can-component). The modules within
  these packages are written in ES5 JavaScript and CommonJS, so they can be imported by webpack, Browserify,
  StealJS, and a do not require transpiling.

  Apps that need long-term flexibility should install these packages directly. Direct installation
  means you can upgrade a small part of CanJS when needed.

- __The `can` package__

  CanJS publishes a
  [can package](https://www.npmjs.com/package/can) to [npm](https://www.npmjs.com/). It contains:

  - `./can.js` - The main export, imports every CanJS subproject and exports it as
    a ES named export. For example, `can.js` looks like this:

    ```js
    export { default as Component } from "can-component";
    export { default as restModel } from "can-rest-model";
    ...
    ```

    Most module loaders setups with tree-shaking (ex: webpack 2 and StealJS 2)
    use this module. Import
    named exports from the `can` package like this:

    ```js
    import { Component, restModel } from "can";
    ```

  - `./core.mjs` - An ESM module with the named exports of each [can-core] package bundled
    together in a single file. This is useful for examples and prototyping in modern browsers that
    support ES modules and for real-world apps that use just what is in core CanJS.
    It's hosted statically on `unpkg` and can be downloaded [here](https://unpkg.com/can/core.mjs).  

    You can import directly from the file as follows:

    ```js
    <script type="module">
	import { Component } from "//unpkg.com/can/core.mjs";

	Component.extend({
		tag: "my-app",
		view: `Hello {{name}}!`,
		ViewModel: {
			name: { default: "world" }
		}
	});

    </script>
    ```

  - `./core.min.mjs` - A minified version of `./core.mjs`.

  - `./dist/global/core.js` - A JavaScript file that exports a `can` object with
    core named exports on it. Use this if you want to create a demo or example that will
    work in browsers that do not support ESM.

  - `./everything.mjs` - An ESM module with named exports of every<span title="can-zone and ylem are not included">٭</span> package bundled
    together. This is useful for examples and prototyping in modern browsers that
    support ES modules. It's hosted statically on `unpkg` and can be
    downloaded here.

    You can import directly from the file as follows:

    ```js
    <script type="module">
	import { Component } from "//unpkg.com/can@5/everything.mjs";

    	Component.extend({
    		tag: "my-app",
    		view: `Hello {{name}}!`,
    		ViewModel: {
    			name: { default: "world" }
    		}
    	});

    </script>
    ```

    This file is large as it includes nearly every extension to
    CanJS. Using this module in production, without tree-shaking, is
    not advised!

  - `./everything.min.mjs` - A minified version of `./everything.mjs`.

  - `./dist/global/everything.js` - A JavaScript file that exports a `can` object with
    every<span title="can-zone and ylem are not included">٭</span> named export. Use this if you want to create a demo or example that will
    work in browsers that do not support ESM.

## Hosted setup options (no download needed)

The following sections show setting up CanJS with scripts hosted online. These are
the easiest ways of setting up CanJS for experimentation.  


### Importing the core ES module bundle

The easiest way to get started with CanJS is to [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
the bundled ES module from [unpkg](https://unpkg.com/). This is perfect for
demos, examples, or even small apps!

The following `HTML` page imports CanJS and uses it to define a custom element:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>CanJS + Modules</title>
</head>
<body>
    <my-app></my-app>

    <script type="module">
    import { Component } from "//unpkg.com/can@5/core.mjs";

    Component.extend({
    	tag: "my-app",
    	view: `CanJS {{feels}} modules`,
    	ViewModel: {
    		feels: { default: "😍" }
    	}
    });
    </script>
</body>
</html>
```

The previous example works in all modern browsers, even Edge! If you want to support
older browsers, use the [traditional JavaScript bundle](#IncludingthecoreJavaScriptbundle) or one of the module loader setups (webpack, StealJS).

This build only includes CanJS’s [can-core] and [can-infrastructure] modules. All modules are exported as named exports. For example, if you want the [can-ajax] infrastructure module, import it as follows:

```js
import { Component, ajax } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "my-app",
	view: `
        CanJS {{feels}} modules.
        The server says: {{messagePromise.value}}
    `,
	ViewModel: {
		feels: { default: "😍" },
        messagePromise: {
            default: () => ajax({url: "/message"})
        }
	}
});
```
@highlight 1

If you want an [can-ecosystem] module like [can-stache-converters], you can use
the [Everything ES module bundle](#ImportingtheeverythingESmodulebundle), but the everything bundle should not be used in production as it
loads every module in CanJS.

<details>
<summary>
Minified core bundle
</summary>


If you use the core ES module, make sure to switch to
its minified version (`//unpkg.com/can@5/core.min.mjs`) in production like this:

```js
import { Component, ajax } from "//unpkg.com/can@5/core.min.mjs";

Component.extend({
	tag: "my-app",
	view: `
        CanJS {{feels}} modules.
        The server says: {{messagePromise.value}}
    `,
	ViewModel: {
		feels: { default: "😍" },
        messagePromise: {
            default: () => ajax({url: "/message"})
        }
	}
});
```

__NOTE:__ Every use of
the unminified URL (`//unpkg.com/can@5/core.mjs`) must be updated to
the minified version (`//unpkg.com/can@5/core.min.mjs`).

</details>



<details>
<summary>
Importing multiple modules
</summary>

The code that uses CanJS doesn't have to be within the `HTML` page itself. Instead you can import modules
that import CanJS. The following shows putting components into their own modules:

- __index.html__
  ```html
  <!doctype html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
      <title>CanJS + Modules</title>
  </head>
  <body>
      <my-app></my-app>

      <script type="module" src="./app.mjs"></script>
  </body>
  </html>
  ```
- __app.mjs__
  ```js
  import { Component } from "//unpkg.com/can@5/core.mjs";
  import "./my-greeting.mjs";
  import "./my-counter.mjs";

  Component.extend({
      tag: "my-app",
      view: `<my-greeting/><my-counter/>`,
      ViewModel: {
          feels: { default: "😍" }
      }
  });
  ```

- __my-greeting.mjs__
  ```js
  import { Component } from "//unpkg.com/can@5/core.mjs";

  Component.extend({
      tag: "my-greeting",
      view: `<h1>CanJS {{feels}} modules</h1>`,
      ViewModel: {
          feels: { default: "😍" }
      }
  });
  ```
- __my-counter.mjs__
  ```js
  import { Component } from "//unpkg.com/can@5/core.mjs";

  Component.extend({
      tag: "my-counter",
      view: `
          Count: <span>{{count}}</span>
          <button on:click='increment()'>+1</button>
      `,
      ViewModel: {
          count: {default: 0},
          increment() {
              this.count++;
          }
      }
  });
  ```

</details>




### Importing the everything ES module bundle

The [core ES module bundle](#ImportingthecoreESmodulebundle) only includes CanJS’s
[can-core] modules.  This doesn't include [can-ecosystem] modules like [can-stache-converters].  The
everything bundle hosted at `https://unpkg.com/can@5/everything.mjs` includes every CanJS module (except for `can-zone` and `ylem`).

The following shows importing and using [can-stache-converters] from `everything.mjs`:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>CanJS + Modules</title>
</head>
<body>
    <my-app></my-app>

    <script type="module">
    import { Component, stache, stacheConverters } from "//unpkg.com/can@5/everything.mjs";

    stache.addConverter(stacheConverters);

    Component.extend({
        tag: "my-app",
        view: `
            <p>Enter a value: <input on:input:value:to="string-to-any(enteredValue)"/></p>
            <p>You've typed a(n) {{enteredType}}</p>
        `,
        ViewModel: {
            enteredValue: "any",
            get enteredType(){
                return typeof this.enteredValue;
            }
        }
    });
    </script>
</body>
</html>
```

The everything bundle does not include:

- [can-zone] (https://github.com/canjs/can-zone)
- [ylem](https://github.com/bitovi/ylem)

### Online Code Editors

The following are CanJS examples in various online code editors.

__Hello World__

<p data-height="267" data-theme-id="dark" data-slug-hash="yEGGoK" data-default-tab="js,result" data-user="justinbmeyer" data-embed-version="2" data-pen-title="CanJS 5.0 Hello World" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/yEGGoK/">CanJS 5.0 Hello World</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>

- [CodePen](https://codepen.io/justinbmeyer/pen/yEGGoK/)
- [JSFiddle](https://jsfiddle.net/javascriptmvc/Ldpevngx/5/)

__Routing Example__

- [CodePen](https://codepen.io/justinbmeyer/pen/ejZMEw?editors=1010)

__Model Example__

- [CodePen](https://codepen.io/justinbmeyer/pen/RBRQom)


## StealJS

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/stealjs-example).

[After setting up Node.js and npm](#Node_jsandnpm), install `can` and [StealJS](https://stealjs.com) from npm:

```
npm install can@5 steal@2 --save
```

Next, add the following [steal configuration](https://stealjs.com/docs/StealJS.configuration.html)
to your `package.json`:

```
{
  "name": "my-canjs-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "http-server -c-1",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "steal": {
    "plugins": ["can"]
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "can": "^5.0.0",
    "steal": "^2.0.0"
  },
  "devDependencies": {
    "http-server": "^0.11.0"
  }
}
```
@highlight 10-12,only

Next, create an `app.stache` template for your app:

```html
{{! app.stache }}
<h1>{{message}}</h1>
```

Next, create an `index.js` module for your application. Import [can-component Component] and
your template to say “Hello World”:

```js
// index.js
import { Component } from "can";
import view from "./app.stache";

Component.extend({
  tag: "my-app",
  view,
  ViewModel: {
    message: {
      default: "Hello World"
    }
  }
});
```

Finally, create an `index.html` page that loads `steal.js` and includes your
`<my-app>` component:

```html
<!doctype html>
<title>CanJS and StealJS</title>
<script src="./node_modules/steal/steal.js" main></script>
<my-app></my-app>
```
@highlight 3-4

Now you can load that page in your browser at one of the addresses the HTTP
server showed you earlier (something like [http://localhost:8080/]). You should
see “Hello World” on the page—if you don’t,
[join our Slack](https://www.bitovi.com/community/slack) ([#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A))
and we can help you figure out what
went wrong.

Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!


## Webpack

> You can skip these instructions by
> [cloning the can-5 branch of this example repo on GitHub](https://github.com/canjs/webpack-example/tree/can-5).

[After setting up Node.js and npm](#Node_jsandnpm), install `can`, [webpack](https://webpack.js.org)
(with [can-stache-loader](https://www.npmjs.com/package/can-stache-loader)) from npm:

```bash
npm install can@5 --save
```

```bash
npm install webpack@4 webpack-cli@3 can-stache-loader@2 --save-dev
```

Next, create an `app.stache` template for your app:

```html
{{! app.stache }}
<h1>{{message}}</h1>
```

Next, create an `index.js` module for your application. Import [can-component Component]
and your template to say “Hello World”:

```js
// index.js
import { Component } from "can";
import view from "./app.stache";

Component.extend({
  tag: "my-app",
  view,
  ViewModel: {
    message: {
      default: "Hello World"
    }
  }
});
```

Next, we will create a `webpack.config.js` that enables tree-shaking in development:

```js
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require("webpack");

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: "development",
  module: {
   rules: [
      {
        test: /\.stache$/,
        use: {
          loader: 'can-stache-loader'
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.SideEffectsFlagPlugin(),
    new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: { compress: false, mangle: false, dead_code: true }
    })
  ]
};
```

Next, run webpack from your terminal:

```
./node_modules/.bin/webpack
```

Finally, create an `index.html` page that loads `dist/bundle.js` and includes
your `<my-app>` component:

```html
<!doctype html>
<title>CanJS and webpack</title>
<script src="./dist/bundle.js" type="text/javascript"></script>
<my-app></my-app>
```
@highlight 3-4

Now you can load that page in your browser at one of the addresses the HTTP
server showed you earlier (something like [http://localhost:8080/]). You should
see “Hello World” on the page — if you don’t, [join our Slack](https://www.bitovi.com/community/slack)
and we can help you figure out what
went wrong.


<details>
<summary>
Production build
</summary>

To build the app to production, create a `webpack.config.prod.js` that configures
webpack for a production build:

```js
const path = require('path');

module.exports = {
  entry: './index.js',
  module: {
   rules: [
      {
        test: /\.stache$/,
        use: {
          loader: 'can-stache-loader'
        }
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: "production",
  rules: [
      {
        test: /\.stache$/,
        use: {
          loader: 'can-stache-loader'
        }
      }
  ]
};
```

Next run webpack in your terminal with the production configuration:

```
./node_modules/.bin/webpack --config webpack.config.prod.js
```

Now you can load that page in your browser at one of the addresses the HTTP
server showed you earlier (something like [http://localhost:8080/]). You should
see “Hello World” on the page and the `bundle.js` size should be much smaller. If there's a problem,
[join our Slack](https://www.bitovi.com/community/slack) and we can help you figure out what
went wrong.

</details>

Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!


## Browserify

Unlike webpack and StealJS, Browserify does not support ES Modules (`import "module"`) and tree-shaking
natively.  Instead, it’s standard practice to import files with CommonJS (`require("module")`). Therefore, there are two
commonly used setups:


<details>
<summary>
Using CommonJS to require CanJS’s individual packages
</summary>

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/browserify-simple-example).

Browserify does not support tree-shaking, so the individual packages must be required.  This means that
instead of importing [can-component Component] like:

```js
const Component = require("can").Component;
```

You should do it like:

```js
const Component = require("can-component");
```

[After setting up Node.js and npm](#Node_jsandnpm), install [can-component]
and Browserify from npm:

```js
npm install can-component --save
npm install browserify --save-dev
```

Next, create a component:

```js
// index.js
const Component = require("can-component");

Component.extend({
  tag: "my-app",
  view: `<h1>{{message}}</h1>`,
  ViewModel: {
    message: {
      default: "Hello World"
    }
  }
});
```

Next, run Browserify from your terminal:

```
./node_modules/browserify/bin/cmd.js --debug --entry index.js --outfile dist/bundle.js
```

Finally, create an `index.html` page that loads `dist/bundle.js` and includes
your `<my-app>` component:

```html
<!doctype html>
<title>CanJS and Browserify</title>
<script src="./dist/bundle.js" type="text/javascript"></script>
<my-app></my-app>
```
@highlight 3-4

Now you can load that page in your browser at one of the addresses the HTTP
server showed you earlier (something like [http://localhost:8080/]). You should
see “Hello World” on the page—if you don’t, [join our Slack](https://www.bitovi.com/community/slack)
and we can help you figure out what
went wrong.

</details>


<details>
<summary>
Using ES Modules to import CanJS’s individual packages using BabelJS
</summary>

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/browserify-example).

Browserify does not support tree-shaking, so the individual packages must be imported.  This means that
instead of importing [can-component Component] like:

```js
import { Component } from "can";
```

You should do it like:

```js
import Component from "can-component";
```

[After setting up Node.js and npm](#Node_jsandnpm), install [can-component]
and Browserify (with various plugins) from npm:

```
npm install can-component --save
npm install browserify stringify babelify babel-core babel-preset-env --save-dev
```

By default, Browserify works with CommonJS modules (with `require()` statements).
To use it with ES6 modules (with `import` statements), configure the
[babelify](https://www.npmjs.com/package/babelify) plugin in your `package.json`.
We’ll also include the [stringify](https://www.npmjs.com/package/stringify)
configuration for loading [can-stache] templates:

```
{
  "name": "my-canjs-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "http-server -c-1",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "browserify": {
    "transform": [ [ "babelify", { "presets": ["env"] } ] ]
  },
  "stringify": {
    "appliesTo": { "includeExtensions": [".stache"] }
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "can-component": "^4.0.0"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-preset-env": "^1.6.0",
    "babelify": "^8.0.0",
    "browserify": "^16.1.0",
    "http-server": "^0.11.0",
    "stringify": "^5.2.0"
  }
}
```
@highlight 10-15,only

Next, create an `app.stache` template for your app:

```html
{{! app.stache }}
<h1>{{message}}</h1>
```

Next, create an `index.js` module for your application. Import [can-component]
and your template to say “Hello World”:

```js
// index.js
import Component from "can-component";
import view from "./app.stache";

Component.extend({
  tag: "my-app",
  view,
  ViewModel: {
    message: {
      default: "Hello World"
    }
  }
});
```

Next, run Browserify from your terminal:

```
./node_modules/browserify/bin/cmd.js --debug --transform babelify --transform stringify --entry index.js --outfile dist/bundle.js
```

Finally, create an `index.html` page that loads `dist/bundle.js` and includes
your `<my-app>` component:

```html
<!doctype html>
<title>CanJS and Browserify</title>
<script src="./dist/bundle.js" type="text/javascript"></script>
<my-app></my-app>
```
@highlight 3-4

Now you can load that page in your browser at one of the addresses the HTTP
server showed you earlier (something like [http://localhost:8080/]). You should
see “Hello World” on the page—if you don’t, [join our Slack](https://www.bitovi.com/community/slack)
and we can help you figure out what
went wrong.

</details>


Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!





## DoneJS

[![DoneJS.com](https://www.bitovi.com/hubfs/Imported_Blog_Media/donejs-logo-ie.png "DoneJS Logo")](http://donejs.com/)



CanJS is part of the fabulous [DoneJS](http://donejs.com) framework. DoneJS is built around CanJS, and
adds:

- [iOS, Android, and desktop builds](https://donejs.com/Features.html#ios-android-and-desktop-builds)
- [Server-side rendering](https://donejs.com/Features.html#server-side-rendered) (Isomorphic / UniversalJS)
- [Progressive loading](https://donejs.com/Features.html#progressive-loading)
- [Continuous integration (testing) and continuous deployment](https://donejs.com/Features.html#continuous-integration--deployment)
- [Code generators](https://donejs.com/Features.html#generators)

and many other [features](https://donejs.com/Features.html).

To use CanJS within DoneJS, first install the DoneJS cli:

```
npm install -g donejs
```

Then, generate a new app:

```
donejs add app hello-world --yes
```

Then go into that application directory:

```
cd hello-world
```

And start development by running:

```
donejs develop
```

Go to [http://localhost:8080/](http://localhost:8080/) to see our application showing a default homepage.

We strongly encourage people to go through DoneJS's [Quick start guide](https://donejs.com/Guide.html)
and then its [In-depth guide](https://donejs.com/place-my-order.html) to get a feel for all of
DoneJS's features.

## Script tags setups

This section helps guide setups that do not use a module loader like webpack and StealJS, and instead
concatenate scripts, often with a tool like [Grunt](https://gruntjs.com/) and [Gulp](https://gulpjs.com/), and non-node projects like the [Rails Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html).

In short, these projects should use the "global" build.  That build can be either:

- downloaded at [unpkg.com/dist/global/core.js](http://unpkg.com/dist/global/core.js), or
- installed via npm:
  ```
  npm install can
  ```
  and found in `./node_modules/can/dist/global/core.js`.

With CanJS downloaded or installed, use it to create an `index.html` page with a `<script>` tag:

```html
<!doctype html>
<title>My CanJS App</title>
<script src="./node_modules/can/dist/global/core.js"></script>

<my-app></my-app>

<script type="text/stache" id="app-template">
  <h1>{{message}}</h1>
</script>

<script type="text/javascript">
  const template = can.stache.from("app-template");

  can.Component.extend({
    tag: "my-app",
    view: template,
    ViewModel: {
      message: {
        default: "Hello World"
      }
    }
  });
</script>
```
@highlight 3


This build only includes CanJS’s [can-core] and [can-infrastructure] modules and all of CanJS’s named exports are available on the [can-namespace can] object. For example, if you want the [can-ajax] infrastructure module, use it like `can.ajax`:

```js
can.Component.extend({
	tag: "my-app",
	view: `
        CanJS {{feels}} modules.
        The server says: {{messagePromise.value}}
    `,
	ViewModel: {
		feels: { default: "😍" },
        messagePromise: {
            default: () => can.ajax({url: "/message"})
        }
	}
});
```
@highlight 10

If you want to use [can-ecosystem] modules, you can use `./node_modules/can/dist/global/everything.js`. However,
this file is quite large and shouldn't be used in production so you will want to make your own custom version of
`everything.js` containing only the modules you need. Unfortunately, we haven't posted instructions on how to do this yet, even though it’s relatively easy. Please tell us on
[Slack](https://www.bitovi.com/community/slack) to hurry up and do it already!


## Hosted traditional `<script>` tags setups

If you support older browsers that do not support modules (Internet Explorer 11),
the following sections detail detail how to use hosted JavaScript files work with traditional `<script>` tags.

If you only support browsers that do support modules please follow the [Importing the core ES module bundle with module scripts](#ImportingthecoreESmodulebundle) setup.

### Including the core JavaScript bundle

If you want your demo, example, or small app to work in browsers that do not support ES modules,
then you can use the CDN hosted JavaScript bundle on [unpkg](https://unpkg.com/#/).  

The following `HTML` page includes CanJS and uses it to define a custom element:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>CanJS + Modules</title>
</head>
<body>
    <my-app></my-app>

    <script src="//unpkg.com/can@5/dist/global/core.js"></script>
    <script>
    can.Component.extend({
    	tag: "my-app",
    	view: `CanJS {{feels}} modules`,
    	ViewModel: {
    		feels: { default: "😍" }
    	}
    });
    </script>
</body>
</html>
```

This build only includes CanJS’s [can-core] and [can-infrastructure] modules and all of CanJS’s named exports are available on the
`can` object. For example, if you want the [can-ajax] infrastructure module, use it like `can.ajax`:

```js
can.Component.extend({
	tag: "my-app",
	view: `
        CanJS {{feels}} modules.
        The server says: {{messagePromise.value}}
    `,
	ViewModel: {
		feels: { default: "😍" },
        messagePromise: {
            default: () => can.ajax({url: "/message"})
        }
	}
});
```
@highlight 10

If you want an [can-ecosystem] module like [can-stache-converters], you can use
the [everything JavaScript bundle](#IncludingtheeverythingJavaScriptbundle), but the everything bundle should not be used in production as it
loads every module in CanJS.

### Including the everything JavaScript bundle

The [core JavaScript bundle](#IncludingthecoreJavaScriptbundle) only includes CanJS’s
[can-core] modules.  This doesn't include ecosystem modules like [can-stache-converters].  The everything bundle hosted at `https://unpkg.com/can@5/everything.mjs` includes every CanJS module (except for [can-zone](https://github.com/canjs/can-zone) and [ylem](https://github.com/bitovi/ylem).

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>CanJS + Modules</title>
</head>
<body>
    <my-app></my-app>

    <script type="module">
    import { Component, stache, stacheConverters } from "//unpkg.com/can@5/everything.mjs";

    stache.addConverter(stacheConverters);

    Component.extend({
        tag: "my-app",
        view: `
            <p>Enter a value: <input on:input:value:to="string-to-any(enteredValue)"/></p>
            <p>You've typed a(n) {{enteredType}}</p>
        `,
        ViewModel: {
            enteredValue: "any",
            get enteredType(){
                return typeof this.enteredValue;
            }
        }
    });
    </script>
</body>
</html>
```

The everything bundle does not include:

- [can-zone](https://github.com/canjs/can-zone)
- [ylem](https://github.com/bitovi/ylem)


## Advanced Setup Recommendations

The following are suggestions to advanced users to maximize maintainability.

### Installing individual packages

To maximize flexibility, we recommend installing and importing individual packages and modules
instead of the named exports from the `can` package.

For example, instead of importing named exports from the `can` module like:

```js
import { Component, DefineMap } from "can";
```

These packages should be individually installed:

```
npm install can-component can-define
```

And they should be imported as follows:

```js
import Component from "can-component";
import DefineMap from "can-define/map/map"
```

<details>

<summary>
Why should I do all that boilerplate?!?!
</summary>

CanJS’s individual packages are released independently of one another.  This allows
you to update one package without having to upgrade all the other ones when a new `can`
package is published.  

</details>

<details>

<summary>
Can I avoid that boilerplate?
</summary>

You can create your own `"can"` module or package by importing and exporting
the CanJS packages and modules as named exports.

For example, after installing the packages you need, you can create `my-can.js` that looks like

```js
// my-can.js
export { default as Component } from "can-component";
export { default as restModel } from "can-rest-model";
...
```

And then import the named exports from "my-can":

```js
import { Component, restModel } from "./my-can";
```

</details>



## Prerequisites

The following sections detail how to install prerequisites common to some of the
setups above.

### Node.js and npm

Many of the following sections rely on Node.js and npm installed. Please follow these steps to
get Node.js, npm, and a local file server installed.

First, [go through npm’s guide to installing Node.js and npm](https://docs.npmjs.com/getting-started/installing-node).
If you’re new to development, that page has [additional resources](https://docs.npmjs.com/getting-started/installing-node#learn-more)
for learning about Node.js, npm, using a command-line terminal, and more.

Next, create a new directory on your computer and navigate to that directory in
your terminal.

In your terminal, [create a new package.json](https://docs.npmjs.com/cli/init):

```
npm init -y
```

Next, install [http-server](https://www.npmjs.com/package/http-server)
(so you can load the files we create):

```
npm install http-server --save-dev
```

Next, add a [start script](https://docs.npmjs.com/cli/start) to run the
HTTP server. Add the following line to your `package.json`:

```
{
  "name": "my-canjs-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "http-server -c-1",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "http-server": "^0.11.0"
  }
}
```
@highlight 7,only

Last, start the HTTP server from your terminal:

```
npm start
```

When the server starts, it’ll tell you the addresses you can open in your
browser to see your project. They will be similar to [http://localhost:8080/].

Next, you can choose to use [StealJS](#StealJS), [webpack](#Webpack), or
[Browserify](#Browserify) to load your project.

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

## IE11 Support

CanJS 4+ is compatible with Internet Explorer 11 with a few caveats that are discussed below.

CanJS uses [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), which are not supported in IE11. A Promise polyfill such as the one in [core-js](https://www.npmjs.com/package/core-js#ecmascript-6-promise) or the many others available on [NPM](https://www.npmjs.com/search?q=promise%20polyfill) can be used to enable Promise support in any environment or setup.

If using StealJS 1.x, a promise polyfill is included by default. With StealJS 2.x, a promise polyfill can be added by using the `steal-with-promises.js` or the `bundlePromisePolyfill` [build option](https://stealjs.com/docs/steal-tools.BuildOptions.html).

The ecosystem packages [can-define-backup] and [can-observe] use other features that are not fully supported by IE11.

[can-define-backup] uses [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), and although `WeakMap` is supported in IE11, there are issues with using [sealed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) objects as keys in WeakMaps. [can-define-backup] can be used in IE11 as long as the DefineMap being backed up is not [can-define/map/map.seal sealed], or a polyfill such as the one in [core-js](https://github.com/zloirock/core-js/#weakmap) is used.

[can-observe] is based on the [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object, which is not supported in IE11 and cannot be polfyilled.
