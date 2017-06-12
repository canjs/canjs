@page guides/recipes/weather-report-advanced Weather Report Guide (Advanced)
@parent guides/recipes

@description This guides you through extending the [guides/recipes/weather-report-simple Simple Weather Report Guide] to
remove imperative code and automatically look up the user’s location using the
browser’s [geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation).  Both of these will be done with event streams.

This guide continues where the [guides/recipes/weather-report-simple Simple Weather Report Guide] left off.  It takes about 25 minutes to complete.  It was written with CanJS 3.8.

@body

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/jipevu/2/embed?html,js,output">JS Bin on jsbin.com</a>

__Start this tutorial by cloning the following JS Bin__:

<a class="jsbin-embed" href="https://jsbin.com/qowacac/2/embed?html,js,output">JS Bin on jsbin.com</a>

This is the ending JS Bin for the [guides/recipes/weather-report-simple Simple Weather Report Guide] with [Kefir.js](https://rpominov.github.io/kefir/) added.

The following sections are broken down into:

- Problem — A description of what the section is trying to accomplish.
- Things to know — Information about CanJS that is useful for solving the problem.
- Solution — The solution to the problem.

## Removing Imperative Code

### The problem

Currently, when a new `location` is set, the `place` property is set to `null`:

```js
var WeatherViewModel = can.DefineMap.extend({
  location: {
    type: "string",
    set: function(){
      this.place = null;
    }
  },
  ...
});
```

This is [imperative code](https://en.wikipedia.org/wiki/Imperative_programming).
It uses side-effects to change the value
of `place` when `location` is changed.  The rules for how `place` behaves are not
defined in one place, which makes the code harder to follow.

Instead, we want to completely define the behavior of `place` within the place definition, which looks like
this:

```js
var WeatherViewModel = can.DefineMap.extend({
  ...
  place: {
    type: "any",
    get: function(lastSet){
      if(lastSet) {
        return lastSet;
      } else {
        if(this.places && this.places.length === 1) {
          return this.places[0];
        }
      }
    }
  },
  ...
});
```

We want to define the behavior of `place` so that it becomes `null` when `location` changes.

### Things to know

- `DefineMap` [can-define.types.get getters] can only derive a value from other values.  They can’t
  derive a value from the change in other values.  However, event-stream libraries like [KefirJS](https://rpominov.github.io/kefir/)
  can do this.

  For example, we can create a `Kefir` stream that counts the number of times the following `person` map’s `name`
  property changes using the [can-stream-kefir] module as follows:

  ```js
  var person = new can.DefineMap({name: "Justin"});

  // Create a stream from person’s name
  var nameStream = can.streamKefir.toStream(person,".name");

  // Every time `.name` changes, increase the count 1.
  var nameChangeCountStream = nameStream.scan(function(lastValue){
	  return lastValue + 1;
  }, 0);

  // Log the current nameChangeStream value
  nameChangeStream.onValue(function(newValue){
	  console.log(newValue);
  });

  person.name = "Ramiya" // logs 1

  person.name = "Payal"  // logs 2
  ```

- The `toStream` method can take an observable object and a property (or event) and create an event stream. The following creates a stream of the `person.name` property values:

  ```js
  var person = new can.DefineMap({name: "Justin"});
  var nameStream = can.streamKefir.toStream(person,".name");

  nameStream.onValue(function(newValue){
	  console.log(newValue);
  });

  person.name = "Ramiya" // logs "Ramiya"
  person.name = "Payal" // logs "Payal"
  ```

- Kefir’s [map](https://rpominov.github.io/kefir/#map) method can be used to convert event-stream values into new values.  The following creates an event stream of upper-cased names:

  ```js
  var person = new can.DefineMap({name: "Justin"});
  var capitalizedNameStream = can.streamKefir.toStream(person,".name")
  	.map(function(name){
		return name.toUpperCase()
	});

  nameStream.onValue(function(newValue){
	  console.log(newValue);
  });

  person.name = "Ramiya" // logs "RAMIYA"
  person.name = "Payal" // logs "PAYAL"
  ```

- The [can-define-stream-kefir] module lets you define a property value using
  a stream. For example, we can define a `nameChangeCount` property of a `Person` type using `stream` like:

  ```js
  Person = can.DefineMap.extend({
	  name: "string",
	  nameChangeCount: {
		  stream: function(){
			  return this.toStream(".name").scan(function(lastValue){
				  return lastValue + 1;
			  }, 0);
		  }
	  }
  });
  can.defineStreamKefir(Person);
  ```

  Notice that the [can-define-stream-kefir] module is used as a [mixin](https://developer.mozilla.org/en-US/docs/Glossary/Mixin). When called on a type (like `Person`), the mixin
  looks for [can-define.types.propDefinition]s with `stream`
  property definition functions.  It uses the stream instance returned by the `stream` property definition function as the value of the property.

  Stream properties, like asynchronous getters, only have a value when
  bound to.  To read the `nameChangeCount`, first use `.on` like:

  ```js
  var me = new Person({name: "Justin"});
  me.on("nameChangeCount", function(ev, newValue){
	  console.log(newValue);
  });

  me.nameChangeCount //-> 0

  me.name = "Ramiya" // logs 1

  me.nameChangeCount //-> 1
  ```

- The `stream` property definition function is passed `setStream` which is
  a stream of values set on the property.  The following allows a
  user to set `nameChangeCount` to reset the count at some new value:

  ```js
  Person = can.DefineMap.extend({
	name: "string",
	nameChangeCount: {
		stream: function(setStream){
			var reset = setStream.map(function(value){
				return {type: "reset", value: value};
			});
			var increment = this.toStream(".name").map(function(){
				return {type: "increment"}
			});

			return reset.merge(increment).scan(function(lastValue, next){
				if(next.type === "increment") {
					return lastValue + 1;
				} else {
					return next.value;
				}
			}, 0);
		}
	}
  });
  can.defineStreamKefir(Person);
  ```

  The following shows the behavior of this property:

  ```js
  var me = new Person({name: "Justin"});
  me.on("nameChangeCount", function(ev, newValue){
	console.log(newValue);
  });

  me.nameChangeCount = 10;

  me.name = "Ramiya" // logs 11

  me.nameChangeCount //-> 11
  ```

- The [can-define-stream-kefir] module adds a `map.toStream` method which is an alias for
  `canStream.toStream`.  Use it to create streams from properties and events on a map instance like:

  ```js
  var Person = can.DefineMap.extend({
	  name: "string"
  });

  var me = new Person({name: "Justin"});

  var nameStream = me.toStream(".name");

  nameStream.onValue(function(){ ... })
  ```

### The solution

Update the __JavaScript__ tab to:

1. Remove the setter side-effects from `location`.
2. Change `place` to derive its value from:
   - changes in `location` -  `place` should be `null` if `location` changes.
   - the `.places` value - `place` should be the one and only _place_ in `places` if there is only one _place_ in `places`.
   - the set `.place` value.
3. Mix [can-define-stream-kefir] into the `WeatherViewModel`.

@sourceref ./advanced-1/js.js
@highlight 4,35-52,79,only

## Get the geoLocation’s latitude and longitude

### The problem

Instead of requiring the user to search for their city,
let’s change the app to use the browser’s [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) API to look up their location.  For this step, we
will add the following behaviors:

- If the user enables location services, we will write their latitude and longitude.
- If the user disables location services or there is some other type of error,
  we will print the error message.

We will do this by:

- Creating a Kefir stream of the User’s position or error messages.
- Using that stream to create the `geoLocation` and `geoLocationError` properties.
- Displaying the data of those properties in the template.

### What you need to know

- The [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
  API allows you to _request_ the user’s position as follows:

  ```js
  navigator.geolocation.getCurrentPosition(
      function(position){...},
      function(err){...});
  ```

- The [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
  API allows you to _monitor changes_ in the user’s position as follows:

  ```js
  var watch = navigator.geolocation.watchPosition(
      function(position){...},
      function(err){...});
  ```

  To cancel watching, call:

  ```js
  navigator.geolocation.clearWatch(watch);
  ```

- To create a `Kefir` stream, call `Kefir.stream` as follows:

  ```js
  var myStream = Kefir.stream(function setup(emitter){

      // INITIALIZATION CODE

      return function teardown(){
          // TEARDOWN CODE
      }
  });
  ```

  `Kefir.stream` is passed an event emitter which can emit values like:

  ```js
  emitter.value(123);
  ```

  or errors like:

  ```js
  emitter.error("something went wrong");
  ```

  or end the stream of values like:

  ```js
  emitter.end();
  ```

  Typically, you listen to sources and emit values in the `setup` function
  and stop listening to sources in the `teardown` function.  For example,
  the following might listen to where the user’s mouse is on the page:

  ```js
  var cursorPosition = Kefir.stream(function(emitter){
      var handler = function(ev){
          emitter.emit({pageX: ev.pageX, pageY: pageY});
      };
      document.documentElement.addEventListener("mousemove",handler);

      return function(){
          document.documentElement.removeEventListener("mousemove",handler);
      }
  })
  ```

- Kefir’s `stream.withHandler( handler(emitter, event) )` is able to convert one stream’s events to another stream. All other stream methods like `stream.map` and `stream.scan` can be implemented with `stream.withHandler`. For example, the following maps the `cursorPosition` stream to a `cursorDistance` stream:

  ```js
  cursorDistance = cursorPosition.withHandler(function(emitter, event){
      if (event.type === 'end') {
        emitter.end();
      }
      if (event.type === 'error') {
        emitter.error(event.value);
      }
      if (event.type === 'value') {
        var pageX = event.value.pageX;
        var pageY = event.value.pageY;
        emitter.value( Math.sqrt(pageX*pageX + pageY*pageY) );
      }
  });
  ```

  Notice how `withHandler` is called with the emitter of `cursorDistance`
  and the events of `cursorPosition`.  

### The solution

Update the __JavaScript__ tab:

@sourceref ./advanced-2/js.js
@highlight 3-21,24-40,only

Update the __HTML__ tab:

@sourceref ./advanced-2/html.html
@highlight 1-3,only

## Find the user’s place by latitude and longitude

### The problem

We need to get which place the user is in by their
latitude and longitude. We will save this place as the
`geoPlace` property and use it in the `place` property definition.

### What you need to know

Flickr has an API that can get a place that is recognized by
Yahoo’s weather APIs.  It can be retrieved with `fetch` like:

```js
fetch("https://api.flickr.com/services/rest/?"+
    can.param({
        method: "flickr.places.findByLatLon",
        api_key: "df0a221bb43ecbc2abb03426bd84e598",
        lat: LATITUDE,
        lon: LONGITUDE,
        format: "json",
        nojsoncallback: 1
    })
).then(function(response){
    return response.json()
}).then(function(responseJSON){
    return responseJSON.places.place[0];
});
```

### The solution

Update the __JavaScript__ tab:

@sourceref ./advanced-3/js.js
@highlight 41-60,108,only

## Add "Enable Location Services" message

### The problem

When a user first views the page, they will be prompted to enable location
services. While they are prompted, we will display a `Please Enable Location Services…` message.

### What you need to know

Display the message while `geoLocation` and `geoLocationError` are undefined.

### The solution

Update the __JavaScript__ tab:

@sourceref ./4-enable-location.js
@highlight 61-63,only

Update the __HTML__ tab:

@sourceref ./4-enable-location.html
@highlight 6-10,only


## Allow user to enter location only if location services failed

### The problem

Show the location entry `<div>` only when geo location has failed.

### What you need to know

Nothing, you’ve learned it all by this point.  Apply what you know!

### The solution

Update the __JavaScript__ tab:

@sourceref ./5-show-location.js
@highlight 64-66,only

Update the __HTML__ tab:

@sourceref ./5-show-location.html
@highlight 12,17,only

## Result

When finished, you should see something like the following JS Bin:

<a class="jsbin-embed" href="https://jsbin.com/jipevu/2/embed?html,js,output">JS Bin on jsbin.com</a>

<script src="https://static.jsbin.com/js/embed.min.js?4.0.0"></script>
