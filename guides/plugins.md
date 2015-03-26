@page Plugins Developing Plugins
@parent contributing 0

@body

In this guide you'll learn how to build a plugin for CanJS. As is standard with programming tutorials, we'll build something that says "Hello World".

## Setup

We'll be using [Yeoman](http://yeoman.io) and a generator built to scaffold CanJS plugins. If you don't want to use Yeoman, you will have to create the files mentioned in this guide yourself. The [canjs-hello-world](https://github.com/ccummings/canjs-hello-world) repository is where you can grok all of the files the Yeoman generator creates.

### 1) Install Yeoman

The first thing you need to do is install Yeoman and [`generator-canjs-plugin`](https://github.com/ccummings/generator-canjs-plugin) which will allow you to quickly scaffold a CanJS plugin.

Install both by running the following on the command line:

```
npm install -g yo generator-canjs-plugin
```

_For help installing or using Yeoman, there is the [Yeoman getting started guide](http://yeoman.io/gettingstarted.html)_

### 2) Run the generator

Next create a directory for your plugin and `cd` into it:

```
mkdir canjs-hello-world && cd canjs-hello-world
```

Then run the generator:

```
yo canjs-plugin
```

After answering a series of questions about your plugin the generator will create the files and install all of the dependencies you need to develop, test and publish your CanJS plugin.

## Develop

Now that you have a scaffold in place, you'll start building your plugin.

### Modify the Source

A single source file will be placed in the `src` directory. This is where you will add your plugin code. Here's what your plugin should look like:

```
can.hello = function() {
	return 'Hello World';
};
```

__Notice that the file includes bootstrapping that allows it to work with AMD loaders, Steal or stand alone with no dependency management tool.__

### Write tests

A [QUnit](https://qunitjs.com/) test file and runner are placed in the `test` folder. The `*_tests.js` file is where you will write tests for your plugin. Modify the `Hello World` test so it looks like this:

```
test('Hello World', function() {
	equal(can.hello(), 'Hello World', 'Works!');
});
```

You can run these tests by opening `test/qunit.html` in a browser or by running `grunt test` on the command line. Do this now and make sure the test passes.

### Create examples

Examples for AMD, Steal and stand alone are placed in the `example` folder. Modify the `index.html` file in each folder to show people how to use your plugin.

In each of the 3 `index.html` files replace the line `//Demo JS goes here` with:

```
console.log(can.hello());
```

Open these files in a browser and look at the console to see "Hello World" being logged.

### Create Documentation

It's highly recommended that you create documentation for your plugin. You can use your plugin repo's wiki or generate a website for it using [GitHub pages](https://pages.github.com/).

## Grunt work flow

Now that you have developed a plugin, tests and examples, it's time to build the plugin using Grunt. The following commands are available:

Run jsbeautifier and JSHint:

```
grunt quality
```

Run tests:

```
grunt test
```

Run tests and places distributable files in the `dist` folder:

```
grunt build
```

## Distribute your plugin with Bower

The easiest way to distribute your plugin is via [Bower](http://bower.io) In order to create a bower package you'll need:

- A valid manifest file ([bower.json](http://bower.io/#defining-a-package)) in the root of the project
- All code available at a Git endpoint (hosted at GitHub or BitBucket for example)
- To register your plugin with Bower

### The manifest

A valid `bower.json` file is created by the generator. If you are coding your plugin from scratch run `bower init` and answer the series of prompts to generate your own.

__Be sure to include relevant keywords in your manifest. For CanJS plugins use `can` and any other keywords that are relevant. For can.Components add a keyword of `can-components`.__

### Git endpoint

Each version of your plugin must have a [semantic version number](http://semver.org/) and a corresponding Git tag with the same version. You create a Git tag like this:

```
$ git tag -a vX.Y.Z -m 'vX.Y.Z'
```

### Register with Bower

Now that you have a valid manifest a Git endpoint and Git tag you are ready to register your plugin. To do this use the `bower register` command:

```
$ bower register [plugin-name] [git-endpoint]
```

__[git-endpoint] is the URL to your repository, typically starting with `git://`.__

Your plugin is now available via the [bower registry](http://bower.io/search)!

## Wrapping up

That's all there is to it. In this guide you developed a CanJS plugin complete with tests and examples and learned how to distribute it via bower.

If you've created a CanJS plugin we'd love to hear about it over on [BitHub](http://bithub.com) [IRC](http://webchat.freenode.net/?channels=canjs) or our [forums](http://forum.javascriptmvc.com).