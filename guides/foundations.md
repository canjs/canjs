@page Foundations Application Foundations
@parent Tutorial 2

@body

- - -
**In this Chapter**
 - Application Overview
 - Page Chrome
 - Base View Template
 - Applicaiton Bootstrap

> Get the code for: [chapter 1](https://github.com/joe-crick/UpAndRunningWithCanJS/tree/master/PlaceMyOrder/chapter_1)

- - -

The first step in putting together a CanJS app is sketching out the various
states of your application, as you understand them at the moment[^requirements],
and any supporting elements you might need.

[^requirements]: Requirements are always subject to change!

We’ll be building a small application called "PlaceMyOrder". PlaceMyOrder is a
website that lets you select from available restaurants in your area, view their
menus, and purchase items for delivery. For this sample application, we’ll keep
things pretty simple. We won’t worry about registration, authentication, or
payment processing. We’re just going to create an application with three states:

1. Restaurant
2. Order Form
3. Confirmation

And a few supporting objects:

1. Menus
2. Menu Items
3. Restaurant List

![](images/1_application_foundations/AppStateDiagram.png)

Now that our basic environment has been setup, and we have an outline of
what we're going to build, let's start working with actual code. This step
will involve setting up our foundations:

- Page Chrome (index.html)
- Bootstrapping (app.js)

### index.html <a name="index-file"></a>
Let's dive in to the good stuff, and start working with the app! Create a
file called "index.html" in the app folder.

- app
    - index.html

It should look like this:

```
<!DOCTYPE html>
<html>
<head lang="en">
	<meta charset="UTF-8">
	<title></title>
	<link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css"/>
	<link rel="stylesheet" type="text/css" href="site_css/place_my_order.css"/>
</head>
<body>

<!-- CanJS application root -->
<div id="can-app">
</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js"></script>
<script src="libs/can.custom.js"></script>
<script src="//canjs.com/release/2.1.4/can.fixture.js"></script>
<script src="app.js"></script>
</body>
</html>
```

At the bottom of the page, just before the body tag, are all of the script
tags. We're using the jQuery edition of CanJS, so the first script tag
loaded must be jQuery. Following jQuery, we load can.custom.js.

In the last chapter, we mentioned including can.fixture.js. We do that in
the script tag just below can.custom.js, downloading it from the CDN. In a
normal project, once you connect to the actual REST services, you would
remove can.fixture.js. In addition, to simplify things, we're using Bootstrap
for our CSS; however Bootstrap is not required to use CanJS.

#### Base Template
Create a file in the app folder called "base_template.stache". We'll edit the
contents of that file as we build out our application. For now, you can
leave it blank.

#### Application Bootstrap
The first script we need to create is the script that will bootstrap our
application. Create a file in the app folder called "app.js". Edit the
file as follows:

```
$(function () {

	$('# can-app').html('The Requisite "Hello World" Message');

});
```

If you open up your application in a browser, you should see:

> The Requisite "Hello World" Message

At this point, we haven't done much. We aren't using CanJS at all yet.
We're just using jQuery to set the HTML contents of a DOM element.

So, how do we get the application to actually *do something*? Building apps
with CanJS centers around building can.Components, read on to the next
chapter to learn more.