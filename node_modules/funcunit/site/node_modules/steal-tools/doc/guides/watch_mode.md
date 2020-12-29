@page steal-tools.guides.watch_mode Continuous Builds
@parent StealJS.guides 2

In 0.9.0 StealTools added a new **watch** mode to its multi-build. This enables you to continuously rebuild your application as you work. This is useful if you prefer a workflow where you are debugging your application as it will appear in production. In this guide we'll go through the process of setting up a CanJS project using the watch mode.

## Setup

The guide assumes some basic knowledge of [Node.js](http://nodejs.org). If you haven't used Node before, please go learn more about how it works on their website.

To get started we want to create a new Node.js application and install the packages we'll need.

```shell
> npm init
> npm install steal-tools -g
> npm install steal --save
> npm install can --save
```

Running `npm init` will ask you a series of questions. The answers aren't important and can be changed later by editing the produced `package.json` file.

Before we can start using the **watch** mode we'll need to create our main file. This is the entry point to your application and was specified in the `npm init` process. Assuming we called it `main.js` let's open up that file and get an initial build started.

### main.js

```js
var can = require("can");
```

## Enable watch mode

Now that we have our skeleton ready we can turn on watch mode.

```shell
steal-tools --watch
```

This will take a second or so and then you'll get an output:

```shell
[9:09:19 AM]
Watch mode ready.
```

This tells us that the initial build has been complete and watch mode is ready to rebuild our application as we develop.

## Develop your application

From here you can begin developing your application any way you like. Let's create a simple `hello-world` component to show how the output updates every time you modify your application. Back in `main.js` add this:

```js
var can = require("can");
require("can/view/stache/");
require("./components/hello/");
```

You'll get a message indicating that StealTools cannot find the hello component:

```shell
File not found: /path/to/can-proj/components/hello/hello.js
```

So let's go create it.

### components/hello/hello.js

```js
require("can/view/stache/");
var template = require("./hello.stache");
var can = require("can");

can.Component.extend({
	tag: "hello-world",
	viewModel: {
		name: "world"
	},
	template: template
});
```

### components/hello/hello.stache

```html
<div>
Hellos \{{name}}!
</div>
```

### main.js

Now back in your main add the component to your page:

```js
var can = require("can");
require("can/view/stache/");
require("./components/hello/");

var template = can.stache("<hello-world></hello-world>");
can.$("body").append(template());
```

Each time you save you will get new output; it will either be a timestamp by itself (when creating new modules) or a timestamp with the module name (when modifying an existing module). The output will be like:

```shell
[9:20:16 AM]
[9:20:22 AM]: components/hello/hello
[9:21:49 AM]: main
```

## Debug your application

Now that we've got a basic application written let's check out the debugging experience. First let's create a simple page:

### index.html

```html
<script src="node_modules/steal/steal.js"
	env="production"
	main="main"></script>
```

Open the page in a browser and open your debug tools. With the watch mode source maps are enabled by default. You can see and debug your original code from your browser's debugging tools.

That's it! As you develop and save your code StealTools will continuously rebuild your application.
