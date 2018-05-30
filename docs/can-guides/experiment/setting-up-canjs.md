@page guides/setup Setting Up CanJS
@parent guides/essentials 1
@outline 2

@description Get started with CanJS by installing it with [https://www.npmjs.com/ npm], using a [https://jsbin.com/about JS Bin], or just adding it to an HTML page with a `<script>` tag.

@body

You can download CanJS from npm or a CDN. We recommend using npm. If you don’t already have Node.js and npm, [learn how to install both on npm’s website](https://docs.npmjs.com/getting-started/installing-node).

Once downloaded or installed, you can load CanJS in a variety of ways:

- [StealJS](#StealJS)
- [webpack](#webpack)
- [Browserify](#Browserify)
- [`<script>` tags](#Scripttags)

This guide shows how to set up common combinations.  If you don’t see yours, please
ask on the [forums](https://forums.donejs.com/c/canjs) or [Gitter chat](https://gitter.im/canjs/canjs).

## JS Bin

Use this JS Bin to play around with CanJS:

<a class="jsbin-embed" href="https://jsbin.com/safigic/28/embed?html,js,output">
  Starter CanJS app on jsbin.com
</a>
<script src="https://static.jsbin.com/js/embed.min.js?4.1.4"></script>

It uses `can.all.js` so you have the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules available to you.

## npm

> Want to skip setting up a new project locally and just clone a repo? Check out
> our example repos for [StealJS](https://github.com/canjs/stealjs-example),
> [webpack](https://github.com/canjs/webpack-example), and
> [Browserify](https://github.com/canjs/browserify-example).

First, [go through npm’s guide to installing Node.js and npm](https://docs.npmjs.com/getting-started/installing-node).
If you’re new to development, that page has [additional resources](https://docs.npmjs.com/getting-started/installing-node#learn-more)
for learning about Node.js, npm, using a command-line terminal, and more.

Next, create a new directory on your computer and navigate to that directory in
your terminal.

In your terminal, [create a new package.json](https://docs.npmjs.com/cli/init):

```
npm init -y
```

Next, install [can-component] (that’s CanJS’s main package) and
[http-server](https://www.npmjs.com/package/http-server)
(so you can load the files we create):

```
npm install can-component --save
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
  "dependencies": {
    "can-component": "^4.0.0"
  },
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

### StealJS

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/stealjs-example).

Install [StealJS](https://stealjs.com) and the [steal-stache] plugin from npm:

```
npm install steal steal-stache --save
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
    "can-component": "^4.0.0",
    "steal": "^1.11.0",
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

Next, create an `index.js` module for your application. Import [can-component] and
your template to say “Hello World”:

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

Finally, create an `index.html` page that loads `steal.js` and includes your
`<my-app>` component:

```html
<!doctype html>
<title>CanJS and StealJS</title>
<script src="./node_modules/steal/steal.js"></script>
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

### webpack

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/webpack-example).

First, install [webpack](https://webpack.js.org)
(with [raw-loader](https://www.npmjs.com/package/raw-loader)) from npm:

```
npm install webpack webpack-cli raw-loader --save-dev
```

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
import template from "raw-loader!./app.stache";

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

> The instructions above show using [can-component]. As of [can@4.2](https://github.com/canjs/canjs/releases/tag/v4.2.0),
> you can use the `can` package with [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)
> to `import {Component} from "can"`. See the [guides/advanced-setup experimental guide]
> for more information.

### Browserify

> You can skip these instructions by
> [cloning this example repo on GitHub](https://github.com/canjs/browserify-example).

CanJS works with [Browserify](http://browserify.org). Install [can-component]
and Browserify (with various plugins) from npm:

```
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
- `can.all.js`: includes the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules
- `can.js`: includes the [can-core core] and [can-infrastructure infrastructure] modules

With `can` installed, use it to create an `index.html` page with a `<script>` tag:

```html
<!doctype html>
<title>My CanJS App</title>
<script src="./node_modules/can/dist/global/can.all.js"></script>

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
<script src="https://unpkg.com/can@4/dist/global/can.all.js"></script>

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
