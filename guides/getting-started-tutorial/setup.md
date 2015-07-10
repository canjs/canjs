@page Setup Setup
@parent Tutorial 1
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - Recommended folder structure
 - Configuring and Downloading CanJS
 - Application Bootstrap

Get the code for: [chapter: setup](https://github.com/bitovi/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-1_canjs-getting-started.zip?raw=true)

- - -

To begin, we’ll use an [example project](https://github.com/bitovi/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-0_canjs-getting-started.zip?raw=true)
that has all of the dependencies required for the sample app that we’re going
to build. The example project also has some CSS and images to make our example
app a little bit more stylish.

## Folder Structure

The example project has the following folder structure:

<pre>
└── /
	├── app.js
	├── components
	├── css
	├── images
	├── index.html
	├── libs
	└── models
</pre>

Let's walk through each folder, and discuss it. 

The `app.js` folder is used to bootstrap our application. We’ll go over this
in more detail <a href="#application-bootstrap">below</a>.

The `components` folder is where we’ll put all of the parts that make
up our application. A component-based structure makes it easier to both manage
and port our application's components (should you, for example, want to use 
a component in another application).

The `css` folder contains a `style.css` file that is used for the entire app.
We would typically recommend putting any CSS files in their respective component 
folders, however we’ve only included one CSS file in this application for simplicity.

The `images` folder contains images that are used throughout the app.
Again, if you had images that were specific to a component, we would
recommend putting them in their respective component folder.

The `index.html` file is the HTML file that loads all of the app’s scripts and
styles.

The `libs` folder contains all of the app’s JavaScript dependencies.

The `models` folder contains some JSON files that we will use as fake server
responses and some JavaScript files that we’ll fill out later to mock an
HTTP server.

## Dependencies

### CanJS

The easiest way to get CanJS is to use <a href="../download.html" target="_blank">the custom download page</a>,
which allows you to download the specific parts of CanJS you need for your application.

The custom download page loads with all the elements in the core CanJS library
already selected. We want all of those in our build, so leave them checked.
CanJS relies on an external core library for some of its functionality. There
are several options available (jQuery, Dojo, YUI, etc.). The default option is
jQuery. That's what we’ll be working with here.

The right side of the page lists all of the plugins. From the list of plugins,
select the following:

![CanJS plugins to select](../can/guides/images/setup/DownloadOptions.png)

At the bottom of the page, clicking the download button will prompt you to
download a file called `can.custom.js`, which you can save to your local machine.

There is one additional file we need. This file is special because normally
you don't want it to be a part of your final application,
but it can be very helpful during development. The file is `can.fixture.js`.
[can.fixture](../docs/can.fixture.html) allows you to simulate RESTful services.
You can download it <a href="http://canjs.com/release/2.3.0/can.fixture.js" target="_blank">here</a>.

### jQuery

<a href="http://jquery.com/download/" target="_blank">jQuery 2.x</a> is also
required. We downloaded the most recent version of jQuery and put the `jquery.js`
file in the `libs` folder.

## index.html <a name="index-file"></a>

Our `index.html` file currently looks like this:

```html
<!DOCTYPE html>
<html>
  <head lang="en">
    <meta charset="UTF-8">
    <title>Place My Order</title>
    <link rel="stylesheet" type="text/css" href="css/style.css"/>
  </head>
  <body>
    <!-- CanJS application root -->
    <div id="can-main"></div>
    <script src="libs/jquery.js"></script>
    <script src="libs/can.custom.js"></script>
    <script src="libs/can.fixture.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

At the bottom of the page, just before the closing body tag, are all of the script
tags. We’re using the jQuery edition of CanJS, so the first script tag
loaded must be jQuery. Following jQuery, we load `can.custom.js`.

Earlier, we mentioned including `can.fixture.js`. In a
normal project, once you connected to the actual REST services, you would
remove `can.fixture.js`. In addition, to simplify things, we’ve provided a complete CSS
file for you.

## Application Bootstrap <a name="application-bootstrap"></a>
The `app.js` file is the script that will bootstrap our application. Edit the
file as follows:

```
$(function () {
  $('#can-main').html('The Requisite “Hello World” Message');
});
```

If you open up your application in a browser, you should see:

> The Requisite “Hello World” Message

At this point, we haven't done much. We aren't using CanJS at all yet.
We’re just using jQuery to set the HTML contents of a DOM element.

So, how do we get the application to actually *do something*? Building apps
with CanJS centers around building `can.Component`'s. Read on to the next
chapter to learn more.

- - -

<span class="pull-left">[&lsaquo; Getting Started](Tutorial.html)</span>
<span class="pull-right">[Application Design &rsaquo;](ApplicationDesign.html)</span>

</div>
