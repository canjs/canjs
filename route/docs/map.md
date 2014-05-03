@function can.route.map map
@parent can.route.static

Assign a can.Map instance that acts as can.route's internal can.Map.  The purpose for this is to cross-bind a top level state object (Application State) to the can.route.

@signature `can.route.map(mapConstructor)`

@param {can.Map} mapConstructor A can.Map constructor function.  A new can.Map instance will be created and used as the can.Map internal to can.route.

@signature `can.route.map(mapInstance)`

@param {can.Map} mapInstance A can.Map instance, used as the can.Map internal to can.route.

@body

## Use

One of the biggest challenges in a complex application is getting all the different parts of the app to talk to each other simply, cleanly, and reliably. 

An elegant way to solve this problem is using the [Observer Pattern](http://en.wikipedia.org/wiki/Observer_pattern). A single object, which can be called Application State, holds the high level state of the application.

Here is a [video](https://www.youtube.com/watch?v=LrzK4exG5Ss) explaining how this pattern can be used in an application.

CanJS recommends using an Application State object in your application. There are benefits to making this state object mirror the routing in your application. `can.route` already contains an internal can.Map instance, which is serialized into the hash (or pushstate URLs). 

`can.route.map` provides an easy to way make your Application State object cross-bound to `can.route`.

	var appState = new can.Map({
        petType: "dog",
        storeId: 2
    });

	can.route.map(appState);

The Application State object, which is cross-bound to the can.route via `can.route.map` and represents the overall state of the application, has several obvious uses:

* It is passed into the various components and used to communicate their own internal state.
* It provides deep linking and back button support. As the URL changes, Application State changes cause changes in application components.
* It provides the ability to "save" the current state of the page, by serializing the Application State object and saving it on the backend, then restoring with that object to load this saved state.

## When to call it

Its important to call `can.route.map` at the very start of your application's lifecycle, before any calls to `can.route.bind`. This is because `can.route.map` creates a new internal `can.Map`, replacing the default one, so this order is important to ensure you're binding to the correct Map.

## Basic Example

A basic example of an Application State for a reporting application, is shown below:

	var appState = new can.Map({
        graphType: "line",
        currencyType: "USD"
    });

	can.route.map(appState);

This object would then be passed into the can.Controls or can.Components that make up the building blocks of this application. Via can.route, the URL in the page would mirror the current state of the app.

## Demo

The following shows creating an appState that loads data at page load, has a virtual property 'locationIds' which serializes an array, and synchronizes the appState to can.route:

@demo can/route/docs/map.html

## Using arrays and can.Lists

If the Application State contains a property which is any non-primitive type, its useful to use the [can.Map.define] plugin to define how that property will serialize. `can.route` calls [can.Map.prototype.serialize] internally to turn the Application State object into URL params.

The following example shows a flags property, which is an array of string-based flags:

	var AppState = can.Map.extend({
	  define: {
	  	flags: {
		  // return a string friendly format
		  serialize: function(){
			return this.attr('flags').join(',');
		  },
		  // convert a stringified object into an array
		  set: function(val){
			if(val === ""){
				return [];
			}
			var arr = val;
			if(typeof val === "string"){
				arr = val.split(',')
			}
			return arr;
		}
	  }
	});

	var appState = new AppState({
	  flags: []
	});

	can.route.map(appState);

## Loading data on application start

Applications commonly require loading some metadata on page load, which must be loaded as part of the Application State before the components can be initialized.

To implement this functionality:

1. Define a `can.Map` constructor
1. Instantiate it
1. Call `can.route.map` with this object
1. Load the data
1. When the data is ready, add it to the appState object
1. Call `can.route.ready`, to initialize can.route and begin firing event handlers bound to can.route

The following example shows a locations property, which contains a list of location `can.Map`'s loaded at page load. As users select a location, its selected property is toggled.

A locationIds property is defined, which is the serialized version of location. A setter is defined on locationIds, which will translate changes in locationIds back to the true source of the data in locations.

	var AppState = can.Map.extend({
		define: {
			locations: {
				// don't serialize this property at all in the route
				serialize: false
			},
			// virtual property that contains a comma separated list of ids based on locations that are selected
			locationIds: {

				// comma separated list of ids
				serialize: function(){
					var selected = this.attr('locations').filter(function(location){
						return location.attr('selected');
					});
					var ids = [];
					selected.each(function(item){
						ids.push(item.attr('id'));
					})
					return selected.join(',');
				},
				
				// toggle selected from a comma separated list of ids
				set: function(val){
					var arr = val;
					if(typeof val === "string"){
						arr = val.split(',')
					}
					// for each id, toggle any matched location
					this.attr('locations').each(function(location){
						if(arr.indexOf(location.attr('id')) !== -1){
							location.attr('selected', true);
						} else {
							location.attr('selected', false)
						}
					})
				}
			}
		}
	});

	// initialize and call map first, so anything binding to can.route will work correctly
	var appState = new AppState();
	can.route.map(appState);

	// GET /locations
	var locations = new Location.List({});

	// when the data is ready, set the locations property
	locations.done(function(){
		var appState.attr('locations', locations)

		// call ready after the appState is fully initialized
		can.route.ready();
	})
