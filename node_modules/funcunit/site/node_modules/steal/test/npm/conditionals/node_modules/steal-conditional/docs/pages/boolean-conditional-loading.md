@page StealJS.guides.boolean_conditional_loading Boolean Conditional Loading
@parent StealJS.guides
@outline 0

@body

<!-- hack! -->
<style>.contents { display: none; }</style>

StealJS supports conditional module loading through the [steal-conditional](https://github.com/stealjs/steal-conditional) extension;
2 types of conditionals are currently supported, [StealJS.guides.substitution_conditional_loading string substitution] and boolean.

In this guide, we'll build a small demo that uses the boolean conditional syntax to import a
[Custom Elements V1](https://html.spec.whatwg.org/multipage/scripting.html#custom-elements) [polyfill](https://github.com/WebReflection/document-register-element) only when the host browser doesn't support it natively.

## Install Prerequisites

### Window Setup

1.  Install [NodeJS](https://nodejs.org/).
2.  Install Chocolatey, Python, Windows SDK, and Visual Studio as described [here](http://stealjs.com/docs/guides.ContributingWindows.html).

### Linux / Mac Setup

1.  Install [NodeJS](https://nodejs.org/).

## Setting up a new project

###  Create a new project folder

Create a new folder for your project and then run `npm init`. Answer all questions with their defaults.

```
> mkdir boolean-demo
> cd boolean-demo
> npm init
```

### Create and host the main page

Create _index.html_ with:

```html
<!doctype html>
<html lang="en">
  <head></head>
  <body>
    Hello World!
  </body>
</html>
```

Next install and run a local fileserver. [http-server](https://www.npmjs.com/package/http-server) handles our basic needs. We'll install it locally and then and it to our npm scripts:

```
> npm install http-server --save
```

Next edit your `package.json` so that the start script looks like:

```json
"scripts": {
  "start": "http-server -c-1"
}
```

This allows us to start the server with:

```
> npm start
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). You should see the *Hello world!* test.

> Before proceeding kill the development server so we can install some dependencies. Use cmd+c on Mac or ctrl+c on Windows or Linux/BSD.

### Install the application dependencies

Installing these dependencies gives us everything we need to build our application.

```
> npm install document-register-element --save-dev
> npm install steal steal-tools steal-conditional --save-dev
```

### Set up polyfill and steal-conditional

Next we need to make sure the right modules are loaded, first edit your `package.json` with the following:

```json
{
  "name": "boolean-demo",
  "steal": {
    "paths": {
      "document-register-element": "./node_modules/document-register-element/build/document-register-element.js"
    }
  }
}
```
@highlight 3-7

We are using [StealJS' paths](http://stealjs.com/docs/config.paths.html) configuration to make sure the browser version of the
polyfill is loaded.

Then, we configure StealJS to load the `steal-conditional` extension as a [configuration dependency](https://stealjs.com/docs/npm.html#packagestealconfigdependencies); in your `package.json` add the following:

```json
{
  "name": "boolean-demo",
  "steal": {
    "paths": { ... },
	"configDependencies": [
	  "./node_modules/steal-conditional/conditional.js"
	]
  }
}
```
@highlight 5-7

Now restart your server; you can keep it on while you develop the rest of the application.

```
> npm start
```

## Import your first module

### Create the module

Create _index.js_ with the following:

```js
import "document-register-element";

function MyElement() {
  return Reflect.construct(HTMLElement, arguments, MyElement);
}

MyElement.prototype = Object.create(HTMLElement.prototype);
MyElement.prototype.constructor = MyElement;

MyElement.prototype.connectedCallback = function() {
  this.appendChild(this._makeLinkElement());
};

MyElement.prototype._makeLinkElement = function() {
  let link = document.createElement("a");

  link.href = this.getAttribute("url");
  link.appendChild(this._makeFigureElement());

  return link;
};

MyElement.prototype._makeFigureElement = function() {
  let figure = document.createElement("figure");

  figure.appendChild(this._makeImageElement());
  figure.appendChild(this._makeCaptionElement());

  return figure;
};

MyElement.prototype._makeImageElement = function() {
  let img = document.createElement("img");

  img.alt = this.getAttribute("name");
  img.src = this.getAttribute("img-url");

  return img;
};

MyElement.prototype._makeCaptionElement = function() {
  let caption = document.createElement("figcaption");

  caption.innerText = this.getAttribute("caption");
  return caption;
};

customElements.define("my-element", MyElement);
```

Yikes! that's a lot of code there! But bear with me, let's break it up in smaller pieces and figure out what's going on:

```js
import "document-register-element";

function MyElement() {
  return Reflect.construct(HTMLElement, arguments, MyElement);
}

MyElement.prototype = Object.create(HTMLElement.prototype);
MyElement.prototype.constructor = MyElement;
```

First, we import the polyfill, notice we are using the regular `import` syntax
here, we'll change it in a moment to use the `steal-conditional` boolean syntax; the rest of the code is defining the custom element constructor function.

Next, we define the `connectedCallback` function:

```
MyElement.prototype.connectedCallback = function() {
  this.appendChild(this._makeLinkElement());
};
```

the `connectedCallback` function is called every time the element is inserted into the DOM.

The following functions with `_` in their names (e.g: `_makeLinkElement`) are used during rendering and the naming choice is to indicate that these are private methods that shouldn't be used by the custom element's consumer.

Finally, and probably the most interesting piece of the code:

```js
customElements.define("my-element", MyElement);
```

This is where the custom element is actually defined, and the whole reason why we
might need to load the polyfill.


### Use steal.js in your page

Update _index.html_ with:

```html
<!doctype html>
<html lang="en">
  <head></head>
  <body>
    <script src="./node_modules/steal/steal.js"></script>
  </body>
</html>
```
@highlight 5

### Add custom element to your page

Next, add the custom element to the _index.html_ page:

```html
<!doctype html>
<html lang="en">
  <head></head>
  <body>
    <my-element
	  name="DoneJS"
	  url="https://donejs.com/"
      caption="Your App. Done."
      img-url="http://donejs.com/static/img/donejs-logo-white.svg"
    >
    </my-element>
    <script src="./node_modules/steal/steal.js"></script>
  </body>
</html>
```
@highlight 5-11

Reload _index.html_ to see your changes.

## Use steal-conditional boolean syntax

One issue with our current code is that the polyfill is loaded every time, even when the browser already supports the Custom Elements V1 api. We cannot afford wasting precious time and resources to download code that's not needed.

The goal here is to detect whether the browser already supports the feature and only
load the polyfill when it's needed.

### The boolean conditional syntax

Let's change the `import` in _index.js_ to look like this:

```js
import "document-register-element#?needs-polyfill";
```

This should look a little bit weird to you, if it doesn't, you might want to read this [article first](http://www.2ality.com/2014/09/es6-modules-final.html).

The part before the `#?` is the polyfill package name we had before, the interesting bit is the text after; `needs-polyfill` is a module name, the `steal-conditional` extension will load it first and grab [its default export](https://developer.mozilla.org/en/docs/web/javascript/reference/statements/export#Using_the_default_export); if the value is not a boolean it will throw an error, otherwise `document-register-element` will only be loaded if the value is `true`.

> It is also possible to negate conditionals via:
> ```js
> import "document-register-element#?~supports-custom-elements";
> ```
> See `steal-conditional`'s [README](https://github.com/stealjs/steal-conditional/blob/master/README.md) for more details.


### Create the condition module

Create _needs-polyfill.js_ with:

```js
export default typeof customElements === "undefined";
```

Reload _index.html_ to see your changes.

![screen shot 2017-01-04 at 15 24 17](https://cloud.githubusercontent.com/assets/724877/21654142/0711aec2-d293-11e6-90f2-ad2e61d9b1cb.png)

In the screenshot above, there is Chrome on the left (Version 55.0.2883.95) and Firefox on the right (Version 50.0.2), highlighted on blue is the request of the
condition module which happens on both browsers, in our example that's the `needs-polyfill` module, then highlighted on red is the request to load the polyfill which only happens in Firefox which (for the tested version) doesn't support the Custom Elements V1 api.

## Build a production app

Now that we've created our application we need to share it with the public. To do this we'll create a build that will concat our JavaScript and styles down to only one file, each, for faster page loads in production.

### Build the app and switch to production

When we first installed our initial dependencies for myhub, one of those was *steal-tools*. steal-tools is a set of tools that helps with bundling assets for production use.

In your package.json `"scripts"` section add:

```json
{
  "scripts": {
    ...
	"build": "steal-tools"
  }
}
```

And then you can run:

```
> npm run build
```

To use the production artifacts rather than the development files we need to update our index.html to load them.

Update _index.html_ with:

```html
<!doctype html>
<html lang="en">
  <head></head>
  <body>
    <my-element
      name="DoneJS"
      url="https://donejs.com/"
      caption="Your App. Done."
      img-url="http://donejs.com/static/img/donejs-logo-white.svg"
    >
    </my-element>
    <script src="./dist/steal.production.js"></script>
  </body>
</html>
```
@highlight 12

By using `steal.production.js` instead of `steal.js` StealJS will know to load the production files we just built.

### A bundle for each conditional module

During the build, `steal-tools` will create separate bundles for each conditionally loaded module, this way only browsers without support will get the penalty of downloading and parsing the polyfill code.

If we take a look at the artifacts created during the build process

![screen shot 2017-01-04 at 16 13 00](https://cloud.githubusercontent.com/assets/724877/21659600/49193da0-d2aa-11e6-8e74-f44b07f38cd9.png)

We can see (the red hightlighted box) the bundle created for the `document-register-element` polyfill module.

If we reload _index.html_ and inspect the network tab, we'll notice that the polyfill bundle is only loaded in Firefox.

![screen shot 2017-01-04 at 18 24 40](https://cloud.githubusercontent.com/assets/724877/21659847/5098a754-d2ab-11e6-8f67-98fcaa34b120.png)
