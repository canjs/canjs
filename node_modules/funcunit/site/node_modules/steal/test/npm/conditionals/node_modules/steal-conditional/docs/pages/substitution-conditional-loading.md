@page StealJS.guides.substitution_conditional_loading Substitution Conditional Loading
@parent StealJS.guides
@outline 0

@body

<!-- hack! -->
<style>.contents { display: none; }</style>

StealJS supports conditional module loading through the [steal-conditional](https://github.com/stealjs/steal-conditional) extension;
2 types of conditionals are currently supported, string substitution and [StealJS.guides.boolean_conditional_loading boolean].

In this guide, we'll build a small demo that uses the string substitution conditional syntax to import a random translation of the famous "Hello, World!".

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
> mkdir substitution-demo
> cd substitution-demo
> npm init
```

### Create and host the main page

Create _index.html_ with:

```html
<!doctype html>
<html lang="en">
  <head>
    <style>
      #header { text-align: center; margin-top: 50px; }
    </style>
  </head>
  <body>
	<h1 id="header">Hello, World!</h1>
  </body>
</html>
```

Next install and run a local fileserver. [http-server](https://www.npmjs.com/package/http-server) handles our basic needs. We'll install it locally and then and it to our npm scripts:

```
> npm install http-server --save
```

Next, edit your `package.json` so that the start script looks like:

```json
"scripts": {
  "start": "http-server -c-1"
}
```

This allows us to start the server with:

```
> npm start
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). You should see the *Hello, World!* test.

> Before proceeding kill the development server so we can install some dependencies. Use cmd+c on Mac or ctrl+c on Windows or Linux/BSD.

### Install the application dependencies

Installing these dependencies gives us everything we need to build our application.

```
> npm install steal steal-tools steal-conditional --save-dev
```

### Set up steal-conditional

Next, configure StealJS to load the `steal-conditional` extension as a [configuration dependency](https://stealjs.com/docs/npm.html#packagestealconfigdependencies); in your `package.json` add the following:

```json
{
  "name": "substitution-demo",
  "steal": {
	"configDependencies": [
	  "./node_modules/steal-conditional/conditional.js"
	]
  }
}
```
@highlight 3-7

Now restart your server; you can keep it on while you develop the rest of the application.

```
> npm start
```

## Import your first module

### Create the module

Create _index.js_ with the following:

```js
document.getElementById("header").textContent = "Hello, World!";
```

Nothing interesting here, we grab the element with the `header` id and then set its `textContent` property to `Hello, World!`.

### Use steal.js in your page

Update _index.html_ with:

```html
<!doctype html>
<html lang="en">
  <head>
    <style>
      #header { text-align: center; margin-top: 50px; }
    </style>
  </head>
  <body>
	<h1 id="header">Hello, World!</h1>
    <script src="./node_modules/steal/steal.js"></script>
  </body>
</html>
```
@highlight 10

Also, since we are setting the `textContent` property using JavaScript, go ahead
and remove the `Hello, World!` from _index.html_.

```html
<!doctype html>
<html lang="en">
  <head>
    <style>
      #header { text-align: center; margin-top: 50px; }
    </style>
  </head>
  <body>
	<h1 id="header"></h1>
    <script src="./node_modules/steal/steal.js"></script>
  </body>
</html>
```
@highlight 9


Reload _index.html_ to see your changes.

## Create the translation files

Our goal is to import a random translation of `Hello, World!` and set it to the
`textContent` of the `h1` tag we added to _index.html_.

Create a folder name **locale**, and add the following, each translation in its
own module:

```js
// substitution-demo/locale/en.js

export default { helloWorld: "Hello, World!" };
```

```js
// substitution-demo/locale/es.js

export default { helloWorld: "¡Hola Mundo!" };
```


```js
// substitution-demo/locale/hi.js

export default { helloWorld: "नमस्ते दुनिया" };
```

Next, we need to import these modules in _index.js_ and randomly pick a specific
translation to use its value to populate the `h1` tag in _index.html_.

We could import each individual module and then write a simple algorithm to pick one
of the translation values, in our example, that's an ok solution since we only have 3
translation modules, but you can imagine how annoying it would be to do the same with
100 or even more modules.

### The string substitution syntax

Add the following to the _index.js_ file we created before:

```js
import i18n from "locale/#{lang}";

document.getElementById("header").textContent = i18n.helloWorld;
```
@highlight 1

This syntax might be already familiar and the reason is that it resembles the [ES2015 Template Literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals) syntax,
with the difference that the character before the curly braces is a `#` sign.

The name between the curly braces (`lang` in our example) is a module name, called condition module, the `steal-conditional` extension will load it first and grab [its default export](https://developer.mozilla.org/en/docs/web/javascript/reference/statements/export#Using_the_default_export); if the value is not a `string` it will throw an error, otherwise this value is used to replace the module name along with the `#` sign and the curly braces.

Let's say, `lang`'s default export value is the string `'foo'`, the conditional import in _index.js_ would be interpolated to:

```js
import i18n from "locale/foo";
```

> It is also possible for the conditional module to define multiple conditions via the `.` modifier:
> ```js
> import "locale/#{lang.helloWorld}";
> ```
> See `steal-conditional`'s [README](https://github.com/stealjs/steal-conditional/blob/master/README.md) for more details.


### Create the condition module

Create _lang.js_ with:

```js
const locales = ['en', 'es', 'hi'];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export default locales[getRandomInt(0, locales.length)];
```

The condition module creates a constant that holds the possible translation files to use,
in our example there are 3 possible modules, then, the `getRandomInt` helper is defined,
this function returns a random number between the `min` argument and `max`.

Finally, `getRandomInt` is used to export a value of the `locales` array.

Reload _index.html_ to see your changes.

![screen shot 2017-01-05 at 16 14 46](https://cloud.githubusercontent.com/assets/724877/21694104/5a33f32e-d362-11e6-8468-cafd83b0a021.png)

If you reload _index.html_ a couple more times, you should see the other translations as well:

![screen shot 2017-01-05 at 16 14 39](https://cloud.githubusercontent.com/assets/724877/21694124/6e1d4b60-d362-11e6-9d67-32ac20cbc0f3.png)

Pretty cool, don't you think?

> Showing a random language is done here for demonstration purposes, in most real world applications you'd want to use [the preferred language of the user](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/language).

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
  <head>
    <style>
      #header { text-align: center; margin-top: 50px; }
    </style>
  </head>
  <body>
	<h1 id="header"></h1>
    <script src="./dist/steal.production.js"></script>
  </body>
</html>
```
@highlight 10

By using `steal.production.js` instead of `steal.js` StealJS will know to load the production files we just built.

### A bundle for each conditional module

During the build, `steal-conditional` will detect the possible variations and `steal-tools` will create separate individual bundles for each variation.

If we take a look at the artifacts created during the build process

![screen shot 2017-01-05 at 16 03 40](https://cloud.githubusercontent.com/assets/724877/21693701/b0cebb8a-d360-11e6-905f-b276af5dcebf.png)

We can see how each of the locale modules we create gets its own bundle.

Finally, reload _index.html_ to see your changes:

![screen shot 2017-01-05 at 16 07 34](https://cloud.githubusercontent.com/assets/724877/21693798/19ac6774-d361-11e6-86e2-edf97852369d.png)
