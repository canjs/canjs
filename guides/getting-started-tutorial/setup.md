@page Setup Setup
@parent Tutorial 1
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - Configuring and Downloading CanJS
 - Recommended folder structure
 - Applicaiton Bootstrap

Get the code for: [chapter 1](https://github.com/bitovi/canjs/blob/guides-overhaul/guides/examples/PlaceMyOrder/ch-1_canjs-getting-started.zip?raw=true)

- - -

To begin, we'll make sure we have everything we need to make our application.
The first thing to do is get CanJS. The easiest way to get CanJS is to use
the the custom download page, which allows you to
download the specific parts of CanJS you need for your application.

The custom download page loads with all the elements in the core CanJS library
already selected. We want all of those in our build, so leave them checked.
CanJS relies on an external core library for some of its functionality. There
are several options available (jQuery, Dojo, YUI, etc.). The default option is
jQuery; and that's what we'll be working with here.

The right side of the page lists all of the plugins. From the list of plugins,
select the following:

![CanJS plugins to select](../can/guides/images/setup/DownloadOptions.png)

At the bottom of the page, click the download button. You'll be prompted to
download a file called `can.custom.js`. Save that file to your local machine.

You can access the custom download page here: <a href="../download.html" target="_blank">Custom downloader</a>

There is one additional file we need, which we won't download, yet. This file is
special. You normally wouldn't want it to be a part of your final application,
but it can be very helpful during development. The file is `can.fixture.js`.
[can.fixture](../docs/can.fixture.html) allows you to simulate RESTful services. We'll cover how to
include `can.fixture` in the next chapter.

In the next step, we'll set up the application's folder structure and move the
`can.custom.js` file into its appropriate folder in the app.

## Folder Structure

When building a CanJS app, because our application will be built using
components, we use a component-based folder structure. This structure makes it
easier to both manage the contents of the component and port the component,
should you want to use it in another application.

Off of a root folder called `PlaceMyOrder`, create the following subfolders:

<pre>
└── PlaceMyOrder
    └── app
        ├── components
        ├── libs
        ├── models
        └── site_css
</pre>

Copy the <a href="https://raw.githubusercontent.com/bitovi/canjs/guides-overhaul/guides/examples/PlaceMyOrder/chapter_9/app/site_css/place_my_order.css" target="_blank">CSS file</a>
that accompanies this guide into your `site_css` folder. We won't be covering
any of the CSS here. Next, copy the `can.custom.js` file you downloaded in
the previous step into the `libs` folder.

Finally, you'll need to download the supporting libraries. They are:

- <a href="http://jquery.com/download/" target="_blank">jQuery 2.x</a>
- <a href="http://canjs.com/release/2.1.4/can.fixture.js" target="_blank">can.fixture</a>

Once you've downloaded these files, rename the jQuery file to `jquery.js` and
copy both files to the `libs` directory in your application folder.

## index.html <a name="index-file"></a>
Create a
file called "index.html" in the `app` folder.

<pre>
└── app
    └── index.html
</pre>

It should look like this:

```html
<!DOCTYPE html>
<html>
  <head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <link rel="stylesheet" type="text/css" href="site_css/place_my_order.css"/>
  </head>
  <body>

    <!-- CanJS application root -->
    <div id="can-app"></div>

    <script src="libs/jquery.js"></script>
    <script src="libs/can.custom.js"></script>
    <script src="libs/can.fixture.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

At the bottom of the page, just before the body tag, are all of the script
tags. We're using the jQuery edition of CanJS, so the first script tag
loaded must be jQuery. Following jQuery, we load `can.custom.js`.

In the last chapter, we mentioned including `can.fixture.js`. In a
normal project, once you connected to the actual REST services, you would
remove `can.fixture.js`. In addition, to simplify things, we're provided a CSS
file for you with all the styles needed for this example.

### Base Template
Create a file in the `app` folder called `base_template.stache`. We'll edit the
contents of that file as we build out our application. For now, you can
leave it blank.

## Application Bootstrap
The first script we need to create is the script that will bootstrap our
application. Create a file in the `app` folder called `app.js`. Edit the
file as follows:

```
$(function () {
  $('#can-app').html('The Requisite "Hello World" Message');
});
```

If you open up your application in a browser, you should see:

> The Requisite "Hello World" Message

At this point, we haven't done much. We aren't using CanJS at all yet.
We're just using jQuery to set the HTML contents of a DOM element.

So, how do we get the application to actually *do something*? Building apps
with CanJS centers around building `can.Component`'s. Read on to the next
chapter to learn more.

- - -

<span class="pull-left">[&lsaquo; Getting Started](Tutorial.html)</span>
<span class="pull-right">[Application Foundations &rsaquo;](ApplicationFoundations.html)</span>

</div>
