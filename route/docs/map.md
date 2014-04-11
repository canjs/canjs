@function can.route.map map
@parent can.route.static

Assign a can.Map instance that acts as can.route's internal can.Map.  The purpose for this is to cross-bind a top level state object (Application State) to the can.route.

@signature `can.route.map(mapConstructor)`

@param {can.Map} mapConstructor A can.Map constructor function.  A new can.Map instance will be created and used as the can.Map internal to can.route.

@signature `can.route.map(mapInstance)`

@param {can.Map} mapInstance A can.Map instance, used as the can.Map internal to can.route.

@signature `can.route.map(initFunc)`

@param {function(this:*,Object):can.Map} initFunc(attrs) A method, which will be called after can.route.ready is called.  It will be passed attrs, an object representing the deparameterized URL. This function should create and return a can.Map instance, which will be used as the internal can.Map for can.route.

@body

## Use

One of the biggest challenges in a complex application is getting all the different parts of the app to talk to each other simply, cleanly, and reliably. 

An elegant way to solve this problem is using the [Observer Pattern](http://en.wikipedia.org/wiki/Observer_pattern). A single object, which can be called Application State, holds the high level state of the application.

Here is a [video](https://www.youtube.com/watch?v=LrzK4exG5Ss) explaining how this pattern can be used in an application.

CanJS recommends using an Application State object in your application. There are benefits to making this state object mirror the routing in your application. `can.route` already contains an internal can.Map instance, which is serialized into the hash (or pushstate URLs). 

`can.route.map` provides an easy to way make your Application State object cross-bound to `can.route`.

For example:

	var AppState = can.Map.extend({
		// return an object with string friendly formats
		serialize: function(){
			return {
				searchTerm: this.attr('searchTerm'),
				flags: this.attr('flags').join(',')
			}
		},
		// convert a stringified object into the javascript friendly format
		setFlags: function(val){
			if(val === ""){
				return [];
			}
			var arr = val;
			if(typeof val === "string"){
				arr = val.split(',')
			}
			return arr;
		}
	});

	var appState = new AppState;

	can.route("", {
		searchTerm: '',
		flags: ''
	});

	can.route.map(appState);

Application widgets (or components) should be passed this appState object. They can listen on changes in certain properties or update properties that are changed.

With `can.route.map` setting up this binding and your widgets all listening to changes in this appState object, single page application history support is achieved very easily. As the URL is changed, whether via the back button, a "deep link", or widgets changing the appState, all widgets will update themselves to reflect the new Application State.

## Loading data on application start

Applications commonly require loading some metadata on page load, which must be loaded as part of the Application State before the components can be initialized.

To implement this functionality, load this data, call the AppState constructor with the data and save it on the appState instance using the init method, then call can.route.map and can.route.ready to set the application init process in motion.

For example:

	var AppState = can.Map.extend({
		init: function(locations){
			// a can.List of {name: "Chicago", id: 3}
			this.attr('locations', locations);
		},
		// return an object with string friendly formats
		serialize: function(){
			return {
				locationIds: this.attr('locations').filter(function(location){
					return this.location.attr('selected');
				}),
				searchTerm: this.attr('searchTerm')
			}
		},
		setLocationIds: function(val){
			if(val === ""){
				return [];
			}
			var arr = val;
			if(typeof val === "string"){
				arr = val.split(',')
			}
			this.attr('locations').forEach(function(location){
				if(arr.indexOf(location.attr('id')) !== -1){
					location.attr('selected', true);
				}
			})
		}
	});

	Locations.findAll({}, function(locations){
		var appState = new AppState(locations);
		can.route.map(appState);
		can.route.ready();
	})

	can.route("", {
		searchTerm: '',
		locationIds: ''
	});