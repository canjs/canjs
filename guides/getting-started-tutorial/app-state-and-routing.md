@page AppStateAndRouting App State and Routing
@parent Tutorial 6
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - AppState
 - Basic Routing
 - Binding the AppState Object to the Application and Routes

Get the code for: [chapter: app state and routing](https://github.com/bitovi/canjs/blob/minor/guides/examples/PlaceMyOrder/ch-3_canjs-getting-started.zip?raw=true)
- - -

As mentioned in the [introduction](Tutorial.html), CanJS suggests using a global
`appState` object to manage the state of your application. The `appState` object
is bound to two things:

1. The application’s base template
2. The application’s routing

Since you already know about creating instances of `can.Map`, creating an
`appState` object, which is a `can.Map`, will be easy. Let’s see how this works.
Open up your `app.js` file and update it as shown below.

```
$(function () {
	var AppState = can.Map.extend({});

	var appState = new AppState();

	// Bind the application state to the root of the application
	$('#can-main').html(can.view('main.stache', appState));

	// Set up the routes
	can.route(':page', { page: 'home' });
	can.route(':page/:slug', { slug: null });
	can.route(':page/:slug/:action', { slug: null, action: null });

	$('body').on('click', 'a[href="javascript://"]', function(ev) {
		ev.preventDefault();
	});

	// Bind the application state to the can.route
	can.route.map(appState);

	can.route.ready();

	//appState.attr('page', 'restaurants');

	appState.bind('change', function(ev, prop, change, newVal, oldVal) {
		alert('Changed the “' + prop + '” property from “' + oldVal + '” to “' + newVal + '”.');
	});
});
```

## Routing
Before we dive into the details of the `appState` object, let’s quickly discuss 
routing. Routing in CanJS allows us to manage browser history and client state by 
synchronizing the `window.location.hash` with a `can.Map`. In other words, we can 
use routing to reflect the state of our application or set the state of our application. 
One of the things that makes routing powerful is that it records the state of the
application in the browser’s history. We’ll see some specific examples of this
as we proceed.

In our application, we setup routing by:

- defining the possible routes by calling `can.route`,
- binding our `appState` object to the route with a call to `can.route.map`, and
- calling `can.route.ready()`, which sets up two-way binding between the
  browser’s `window.location.hash` and the `can.route`’s internal `can.Map`.

On lines 10–12, we define all the potential routes in our application and the
properties on the `appState` object. Let’s look at each line individually.

```
can.route(':page', { page: 'home' });
```

This line does two things:

1. Creates a base route that is bound to one property: `page`.
2. Sets the default value of the `page` property to `'home'`.

In our app, this will allow the following URLs:

- `#!` (which will set `page` to `'home'` because that’s the default)
- `#!orders/` (which will set `page` to `'orders'`)
- `#!restaurants/` (which will set `page` to `'restaurants'`)

```
can.route(':page/:slug', { slug: null });
```

This line does two things:

1. Binds a new `slug` property to our `appState` object.
2. Sets the default value of the `slug` property to `null`.

This makes the following URLs possible:

- `#!restaurants/spago/` (`page` will be `'restaurants'` and `slug` will be `'spago'`)

Anything in the second part of the URL will be the `slug` property on our
`appState` object.

```
can.route(':page/:slug/:action', { slug: null, action: null });
```

This line does two things:

1. Binds a new `action` property to our `appState` object.
2. Sets the default value of the `action` property to `null`.

This makes the following URLs possible:

- `#!restaurants/spago/order/` for order confirmation; again, `action` will be `'order'`

Let’s take a moment to see how these routes are bound to our `appState` object.
Notice the `//appState.attr('page', 'restaurants');` line at the end of our
`app.js` file; let’s uncomment that line so it looks like
`appState.attr('page', 'restaurants');`

Now, refresh the app in your browser. The path will now be `#!restaurants`,
and you’ll notice that the Restaurants link in the navigation is highlighted.

![place-my-order.com home page](../can/guides/images/app-state-routing/app_state_route_rest.png)

Note that, after we initialized our routes, updating the value of our
`appState`’s `page` property caused the route to update as well.
The value of the `page` property was serialized and appended
to the `window.location.hash`.

Let’s see what happens if we adjust the value of the hash. To monitor this
change, we’ve included the following lines:

```
appState.bind('change', function(ev, prop, change, newVal, oldVal) {
	alert('Changed the “' + prop + '” property from “' + oldVal + '” to “' + newVal + '”.');
});
```

These lines use [`can.Map.bind`](../docs/can.Map.prototype.bind.html) to
watch for changes to the `appState` object. Go ahead and change the URL from
`#!restaurants` to `#!orders`. You should see an alert with this message:

![place-my-order.com home page](../can/guides/images/app-state-routing/change_state_alert.png)

It was mentioned earlier that we bound our AppState to the application’s `main.stache`. 
This is the key to connecting the AppState to our [components](Components.html). 
Because the `appState` object is bound to our main template, which includes the rest of 
the components in the app, *these attributes will automatically be included in the scope of
the components*.

Before moving on, let’s remove the following lines from our application:

```
appState.attr('page', 'restaurants');

appState.bind('change', function(ev, prop, change, newVal, oldVal) {
	alert('Changed the “' + prop + '” property from “' + oldVal + '” to “' + newVal + '”.');
});
```

- - -

<span class="pull-left">[&lsaquo; Templates and Views](StacheTemplates.html)</span>
<span class="pull-right">[Components &rsaquo;](Components.html)</span>

</div>
