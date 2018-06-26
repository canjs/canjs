@page guides/setup Setting Up CanJS
@parent guides/essentials 1
@outline 2

@description Learn how to install CanJS in your environment.



@body

## Choosing the right environment

CanJS has a variety of packages, modules, and files ready to meet the needs of any development environment. If you already know what type of
development environment you have or want, please click one of the links
above. This section is for people who aren't sure what they
want.  The following lists common scenarios and provides links to
the guide(s) that most closely satisfy that scenario.

- I just want to play, make a demo, or learn CanJS right now! 👉 Use the [ES module bundle](#ImportingthecoreESmodulebundlewithmodulescripts) or [JSBin](#JSBin).
- I use Webpack 👉 Webpack and ES Modules
- I use StealJS 👉 Steal and ES Modules
- I use Browserify 👉 Browserify
- I want server-side rendering, progressive loading, continuous integration, testing,
  and a whole lot more 👉 DoneJS
- I want to maximize long term flexibility 👉 Importing individual modules

If this page doesn't have what you need, please
ask on the [forums](https://forums.donejs.com/c/canjs) or [Gitter chat](https://gitter.im/canjs/canjs).


## Explanation of different builds

CanJS has a variety of packages, modules, and files ready to meet the needs of
any development environment. This section gives technical details on these items.

- __The individual packages.__

  CanJS is composed from over 80 individual packages.  For example [can-component Component]
  is actually the [can-component](https://www.npmjs.com/package/can-component) package, housed
  in its own [github repository](https://github.com/canjs/can-component). The modules within
  these packages are written in ES5 JavaScript and CommonJS, so they can be imported by Webpack, Browserify,
  StealJS, and a do not require transpiling.

  Apps that need long-term flexibility should installing these packages directly. Direct installation
  means you can upgrade a small part of CanJS when needed.

- __The `can` package__

  CanJS publishes to [npm](https://www.npmjs.com/) a
  [can package](https://www.npmjs.com/package/can). It contains:

  - `./can.js` - The main export, imports every CanJS sub project and exports it as
    a ES named export. For example, `can.js` looks like this:

    ```js
    export { default as Component } from "can-component";
    export { default as restModel } from "can-rest-model";
    ...
    ```

    Most module loaders with tree-shaking (ex: Webpack and StealJS) setups
    use this module. Import
    named exports from the `can` package like this:

    ```js
    import {Component, restModel} from "can";
    ```

  - `./dist/can.core.mjs` - An ESM module with named exports of each [core] package bundled
    together. This is useful for examples and prototyping in modern browsers that
    support ES modules and for real-world apps that use just what's in core CanJS.
    It's hosted statically on `unpkg` and can be
    downloaded here.

    You can import directly from the file as follows:

    ```js
    <script type="module">
	import { Component } from "//unpkg.com/can/dist/can.core.mjs";

    	Component.extend({
    		tag: "my-app",
    		view: `Hello {{name}}!`,
    		ViewModel: {
    			name: { default: "world" }
    		}
    	});

    </script>
    ```

  - `./dist/can.ecosystem.min.mjs` - A minified version of `./dist/can.ecosystem.mjs`.

  - `./dist/global/can.js` - A JavaScript file that exports a `can` object with
    core named exports on it. Use this if you want to create a demo or example that will
    work in browsers that do not support ESM.

  - `./dist/can.ecosystem.mjs` - An ESM module with named exports of every* package bundled
    together. This is useful for examples and prototyping in modern browsers that
    support ES modules. It's hosted statically on `unpkg` and can be
    downloaded here.

    You can import directly from the file as follows:

    ```js
    <script type="module">
	import { Component } from "//unpkg.com/can/dist/can.ecosystem.mjs";

    	Component.extend({
    		tag: "my-app",
    		view: `Hello {{name}}!`,
    		ViewModel: {
    			name: { default: "world" }
    		}
    	});

    </script>
    ```

    This file is huge as it includes nearly every extension to
    CanJS. So use of this module in production, without tree-shaking, is
    not advised!

  - `./dist/can.ecosystem.min.mjs` - A minified version of `./dist/can.ecosystem.mjs`.

  - `./dist/global/can.ecosystem.js` - A JavaScript file that exports a `can` object with
    every* named export. Use this if you want to create a demo or example that will
    work in browsers that do not support ESM.

## Hosted setup options (no download needed)

The following shows shows setting up CanJS with scripts hosted online. These are
the easiest ways of setting up CanJS for experimentation.  


### Importing the core ES module bundle with module scripts

The easiest way to get started with CanJS is to [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
the pre-built ES module from [UNPKG](https://unpkg.com/#/). This is perfect for
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
    import { Component } from "//unpkg.com/can@5/dist/can.core.mjs";

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
older browsers, use the [traditional JavaScript bundle](#IncludingthecoreJavaScriptbundlewithtraditional_script_tags) or one of the module loader setups (Webpack, StealJS).

This build only includes CanJS's [core] and [infrastructure] modules. All modules are exported as named exports. For example, if you want the [can-ajax] infrastructure module, import it like:

```js
import { Component, ajax } from "//unpkg.com/can@5/dist/can.core.mjs";

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
the [ecosystem ES module bundle], but this bundle should not be used in production as it
loads every ecosystem module in CanJS.

__Minified core bundle__

If you eventually do use this built module in production, make sure to switch to
its minified version (`//unpkg.com/can@5/dist/can.min.mjs`) like this:

```js
import { Component, ajax } from "//unpkg.com/can@5/dist/can.core.min.mjs";

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

> NOTE: Every use of
the unminified url (`//unpkg.com/can@5/dist/can.core.mjs`) must be updated to
the minified version (`//unpkg.com/can@5/dist/can.min.mjs`).

__Importing multiple modules__

You can import multiple modules too. The following shows putting components into their
own modules:

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
  import { Component } from "//unpkg.com/can@5/dist/can.core.mjs";
  import "./my-greeting.mjs";
  import "./my-counter.mjs";

  Component.extend({
      tag: "my-app",
      view: `CanJS {{feels}} modules`,
      ViewModel: {
          feels: { default: "😍" }
      }
  });
  ```

- __my-greeting.mjs__
  ```js
  import { Component } from "//unpkg.com/can@5/dist/can.core.mjs";

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






### Importing the ecosystem ES module bundle with module scripts

The [core ES module bundle](#ImportingthecoreESmodulebundlewithmodulescripts) only includes CanJS's
[can-core] modules.  This doesn't include ecosystem modules like [can-stache-converters].  The
ecosystem bundle hosted at `https://unpkg.com/can@5/dist/can.core.mjs` includes _nearly_ every CanJS module.

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
    import { Component, stache, stacheConverters } from "//unpkg.com/can@5/dist/can.ecosystem.mjs";

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

The ecosystem bundle does not include:

- [can-zone]
- [react-view-model]

### Including the core JavaScript bundle with traditional `<script>` tags

If you want your demo, example, or small app to work in browsers that do not support ES modules,
then you can use the CDN hosted JavaScript bundle on [UNPKG](https://unpkg.com/#/).  

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

    <script src="//unpkg.com/can@5/dist/global/can.core.js"></script>
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

This build only includes CanJS's [core] and [infrastructure] modules and all of CanJS's named exports are available on the
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

If you want an [ecosystem] module like [can-stache-converters], you can use
the [ecosystem JavaScript bundle], but this bundle should not be used in production as it
loads every ecosystem module in CanJS.

### Including the ecosystem JavaScript bundle with traditional `<script>` tags

The [core JavaScript bundle](#IncludingthecoreJavaScriptbundlewithtraditional_script_tags) only includes CanJS's
[can-core] modules.  This doesn't include ecosystem modules like [can-stache-converters].  The
ecosystem bundle hosted at `https://unpkg.com/can@5/dist/can.core.mjs` includes _nearly_ every CanJS module.

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
    import { Component, stache, stacheConverters } from "//unpkg.com/can@5/dist/can.ecosystem.mjs";

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

The ecosystem bundle does not include:

- [can-zone]
- [react-view-model]

### JS Bin

> > (todo)

Use this JS Bin to play around with CanJS:

<a class="jsbin-embed" href="https://jsbin.com/safigic/28/embed?html,js,output">
  Starter CanJS app on jsbin.com
</a>
<script src="https://static.jsbin.com/js/embed.min.js?4.1.4"></script>

It uses `can.ecosystem.js` so you have the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules available to you.


## Prerequisite: Node.js and npm setup

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

Next, you can choose to use [StealJS](#StealJS), [webpack](#webpack), or
[Browserify](#Browserify) to load your project.


## StealJS

> > (TODO: git-example)

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/stealjs-example).

[After setting up Node.js and npm](#Prerequisite_Node_jsandnpmsetup), install `can`, [StealJS](https://stealjs.com) and the [steal-stache] plugin from npm:

```
npm install can@5 steal@2 steal-stache --save
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
    "plugins": ["steal-stache"]
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "can": "^5.0.0",
    "steal": "^2.0.0",
    "steal-stache": "^4.1.0"
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
import {Component} from "can";
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
see “Hello World” on the page—if you don’t, join our
[Gitter chat](https://gitter.im/canjs/canjs) and we can help you figure out what
went wrong.

Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!


## Webpack

> > TODO: git repo, do we need the config?

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/webpack-example).

[After setting up Node.js and npm](#Prerequisite_Node_jsandnpmsetup), install `can`, [webpack](https://webpack.js.org)
(with [raw-loader](https://www.npmjs.com/package/raw-loader)) from npm:

```
npm install can@5 --save
```

```
npm install webpack webpack-cli raw-loader --save-dev
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
import {Component} from "can";
import view from "raw-loader!./app.stache";

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

Next, create a webpack config?

```js
const path = require('path');

module.exports = {
  entry: './index.js',
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname)
  }
};
```

Next, run webpack from your terminal:

```
./node_modules/webpack/bin/webpack.js -d index.js -o dist/bundle.js
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
see “Hello World” on the page—if you don’t, join our
[Gitter chat](https://gitter.im/canjs/canjs) and we can help you figure out what
went wrong.

Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!





### Browserify

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/browserify-example).

CanJS works with [Browserify](http://browserify.org). [After setting up Node.js and npm](#Prerequisite_Node_jsandnpmsetup), install [can-component]
and Browserify (with various plugins) from npm:

```
npm install can-component browserify stringify babelify babel-core babel-preset-env --save-dev
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
import template from "./app.stache";

Component.extend({
  tag: "my-app",
  view: template,
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
see “Hello World” on the page—if you don’t, join our
[Gitter chat](https://gitter.im/canjs/canjs) and we can help you figure out what
went wrong.

Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!

## Script tags

### npm

After following the [npm instructions above](#npm), install the
[can](https://www.npmjs.com/package/can) package from npm:

```
npm install can --save
```

The `node_modules/can/dist/global/` directory will include two files:
- `can.ecosystem.js`: includes the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules
- `can.js`: includes the [can-core core] and [can-infrastructure infrastructure] modules

With `can` installed, use it to create an `index.html` page with a `<script>` tag:

```html
<!doctype html>
<title>My CanJS App</title>
<script src="./node_modules/can/dist/global/can.ecosystem.js"></script>

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

### CDN

Another quick way to start locally is by loading CanJS from a CDN:

```html
<!doctype html>
<title>My CanJS App</title>
<script src="https://unpkg.com/can@4/dist/global/can.ecosystem.js"></script>

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

Ready to build an app with CanJS? Check out our [guides/chat] or one of our
[guides/recipes]!
