@page Tutorial Getting Started
@parent guides 1

@body
This tutorial will walk you though the basics of CanJS by building a small
to-do app with CanJS and jQuery like this:

<iframe src="http://jsfiddle.net/donejs/c3bfy/embedded/result,html,js,css" frameborder="0" allowfullscreen style="width: 100%; height: 300px;"></iframe>

## Loading CanJS

The first step is to get and install CanJS. In this tutorial we will be using the [using-standalone standalone] version from our CDN (and jQuery from the [Google API CDN](https://developers.google.com/speed/libraries/devguide#jquery)) so an `index.html` like this will get you started:

    <html>
    <head>
        <title>CanJS Tutorial</title>
    </head>
    <body>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js"></script>
        <script src="http://canjs.com/release/latest/can.jquery.js"></script>
        <script type="text/javascript">
            $(function() {
                // Your tutorial code here
            });
        </script>
    </body>
    </html>

## Get started

To get started, click [Constructs Constructs] in the navigation to the left, or you can watch the video version.

<iframe width="560" height="315" src="http://www.youtube.com/embed/GdT4Oq6ZQ68" frameborder="0" allowfullscreen></iframe>

You can also take a look around and see some nifty [Recipes recipes] for building functionality with CanJS, check out
our [API](../docs/index.html), or dive right in and poke around the [annotated source](http://canjs.com/release/latest/docs/can.jquery.html) for CanJS.