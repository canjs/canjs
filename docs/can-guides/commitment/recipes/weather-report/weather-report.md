@page guides/recipes/weather-report-simple Weather Report Guide (Simple)
@parent guides/recipes

@description This guide walks you through building a simple weather report
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 3.5.

@body

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/vujugel/1/embed?html,js,output">JS Bin on jsbin.com</a>

To use the widget:

1. __Enter__ a location (example: _Chicago_)
2. If the location name isn’t unique, __click__ on the intended location.
3. See the 10-day forecast for your selected city.

__Start this tutorial by cloning the following JS Bin__:

<a class="jsbin-embed" href="https://jsbin.com/fudakiz/1/embed?html,output">JS Bin on jsbin.com</a>

This JS Bin has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- Problem — A description of what the section is trying to accomplish.
- Things to know — Information about CanJS that is useful for solving the problem.
- Solution — The solution to the problem.


## Setup

### The problem

Get the basic setup for a CanJS app (in a JS Bin) setup by:

1.  Creating a template that outputs the pre-constructed HTML.
2.  Defining a `WeatherViewModel` constructor function.
3.  Rendering the template with an instance of `WeatherViewModel`.
4.  Inserting the result of the rendered template into the page.

### Things to know

- A [can-stache] template is used to render data into a document fragment:

  ```js
  var template = can.stache("<h1>{{message}}</h1>");
  var frag = template({message: "Hello World"});
  frag //-> <h1>Hello World</h1>
  ```

- [can-define/map/map can.DefineMap] can be used to define the behavior of observable objects like:

  ```js
  var Type = can.DefineMap.extend({
	  message: "string"
  });
  ```

- Instances of these [can-define/map/map can.DefineMap] types are often used
  as a ViewModel that controls the behavior of a [can-stache] template (or
  [can-component]).

  ```js
  var MessageViewModel = can.DefineMap.extend({
	  message: "string"
  });

  var messageVM = new MessageViewModel();
  var frag = template(messageVM)
  ```

### The solution

Update the __HTML__ tab to wrap the template in a `script` tag:

```html
<script id="app-template" type="text/stache">
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" type='text'/>
    </div>

    <p class="loading-message">
      Loading places…
    </p>

    <div class="location-options">
      <label>Pick your place:</label>
      <ul>
        <li>Some Place</li>
        <li>Another Place</li>
      </ul>
    </div>

    <div class="forecast">
      <h1>10-day Chicago Weather Forecast</h1>
      <ul>
        <li>
          <span class='date'>Today</span>
          <span class='description scattered-showers'>Scattered Showers</span>
          <span class='high-temp'>100<sup>&deg;</sup></span>
          <span class='low-temp'>-10<sup>&deg;</sup></span>
        </li>
      </ul>
    </div>
  </div>
</script>
```
@highlight 1,32,only

Update the __JavaScript__ tab to:

- Define a ViewModel.
- Create an instance of the ViewModel .
- Load the `app-template` template.
- Render the template with the ViewModel instance.
- Insert the rendered result into the page.

```js
var WeatherViewModel = can.DefineMap.extend({

});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 1-9

## Allow a user to enter a location

### The problem

We want an `input` element to:

- Allow a person to type a location to search for weather.
- Show the user the location they typed.

### Things to know

- There are [can-define.types.propDefinition many ways] to define a property on
  a `DefineMap`.  The simplest way is `propName: "<TYPE>"` like:

  ```js
  DefineMap.extend({
    property: "string"	  
  })
  ```
- The [can-stache-bindings.toParent] can set an input’s `value` to
  a ViewModel property like:

  ```html
  <input {^$value}="property"/>
  ```

- A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```html
  {{property}}
  ```

### The solution

Update the __JavaScript__ tab to define a `location` property as a string.

```js
var WeatherViewModel = can.DefineMap.extend({
  location: "string"
});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 2

Update the template in the __HTML__ tab to:

1. Update `location` on the ViewModel when the input changes.
2. Show value of the ViewModel’s `location` property.

```html
<script id="app-template" type="text/stache">
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" {^$value}="location" type="text"/>
    </div>

    <p class="loading-message">
      Loading places…
    </p>

    <div class="location-options">
      <label>Pick your place:</label>
      <ul>
        <li>Some Place</li>
        <li>Another Place</li>
      </ul>
    </div>

    <div class="forecast">
      <h1>10-day {{location}} Weather Forecast</h1>
      <ul>
        <li>
          <span class='date'>Today</span>
          <span class='description scattered-showers'>Scattered Showers</span>
          <span class='high-temp'>100<sup>&deg;</sup></span>
          <span class='low-temp'>-10<sup>&deg;</sup></span>
        </li>
      </ul>
    </div>
  </div>
</script>
```
@highlight 5,21,only

## Get and display the places for the user’s location name

### The problem

Once the user has entered a location name, we need to get which
“place” it is.  For example, a user might enter Paris, but we don’t know if
they mean the Paris in France or the one in Illinois.  We need to get a
list of matching places for the location name and display the matching places
on the page.

### Things to know

- [ES5 Getter Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define a `DefineMap` property that changes when another property changes.  For example,
  the following defines an `excitedMessage` property that always has a `!` after the `message` property:

  ```js
  DefineMap.extend({
    message: "string",
    get excitedMessage(){
      return this.message+"!";
    }
  });
  ```

- [YQL](https://developer.yahoo.com/yql/console/) provides a service endpoint for
  retrieving a list of places that match some text.  For example, the following requests all
  places that match `Paris`:

  ```
  https://query.yahooapis.com/v1/public/yql?
    format=json&
	q=select * from geo.places where text="Paris"
  ```

  The list of matched places will be in the response data’s `data.query.results.place` property.
  If there is only a single match, `place` will be an object instead of an array.

- The [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is an easy way to make requests
  to a URL and get back JSON.  Use it like:

  ```js
  fetch(url).then(function(response){
	  return response.json();
  }).then(function(data){

  });
  ```

- [can-util/js/param/param can.param] is able to convert an object into a
  query string format like:

  ```js
  can.param({format: "json", q: "select"}) //-> "format=json&q=select"
  ```  

- Use [can-stache.helpers.if {{#if value}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.each {{#each value}}] to do looping in `can-stache`.
- `Promise`s are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{#if somePromise.isPending}}`.
  - Loop through the resolved value of the promise like: `{{#each somePromise.value}}`.


### The solution

1. Show a “Loading places…” message while we wait on data.
2. Once the places are resolved, list each place’s name, state, country and type.

Update the template in the __HTML__ tab to:

```html
<script id="app-template" type="text/stache">
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" {^$value}="location" type="text"/>
    </div>

    {{#if placesPromise.isPending}}
      <p class="loading-message">
        Loading places…
      </p>
    {{/if}}

    {{#if placesPromise.isResolved}}
      <div class="location-options">
        <label>Pick your place:</label>
        <ul>
          {{#each placesPromise.value}}
            <li>
              {{name}}, {{admin1.content}}, {{country.code}} ({{placeTypeName.content}})
            </li>
          {{/each}}
        </ul>
      </div>
    {{/if}}

    <div class="forecast">
      <h1>10-day {{location}} Weather Forecast</h1>
      <ul>
        <li>
          <span class='date'>Today</span>
          <span class='description scattered-showers'>Scattered Showers</span>
          <span class='high-temp'>100<sup>&deg;</sup></span>
          <span class='low-temp'>-10<sup>&deg;</sup></span>
        </li>
      </ul>
    </div>
  </div>
</script>
```
@highlight 8,12,14,18,19,20,21,22,25,only

Update the __JavaScript__ tab to:

1. Define a `placesPromise` property that will represent the loading places.
2. If the user has typed in at least two characters, we fetch the matching places.
3. If only a single place is returned, we still convert it into an array so the data
   stays consistent.  

```js
var yqlURL = "//query.yahooapis.com/v1/public/yql?";

var WeatherViewModel = can.DefineMap.extend({
  location: "string",
  get placesPromise(){
    if(this.location && this.location.length > 2) {
      return fetch(
        yqlURL +
        can.param({
          q: 'select * from geo.places where text="'+this.location+'"',
          format: "json"
        })
      ).then(function(response){
        return response.json();
      }).then(function(data){
        console.log(data);
        if(Array.isArray(data.query.results.place)) {
          return data.query.results.place;
        } else {
          return [data.query.results.place];
        }
      });
    }
  }
});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 1,5-24,only

## Allow a user to select a place

### The problem

When a user clicks on a place, we need to indicate their selection.

### Things to know

- Use [can-stache-bindings.event ($EVENT)] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked.

   ```html
   <div ($click)="sayHi()"> … </div>
   ```

- `this` in a stache template refers to the current context of a template or section.  

  For example, the `this` in `this.name` refers to the `context` object:

  ```javascript
  var template = stache("{{this.name}}");
  var context = {name: "Justin"};
  template(context);
  ```

  Or, when looping through a list of items, `this` refers to each item:

  ```html
  {{#each items}}
    <li>{{this.name}}</li> <!-- this is each item in items -->
  {{/each}}
  ```


- The [can-define.types “any” type] can be used to define a property as
  accepting any data type like:

  ```js
  var MessageViewModel = can.DefineMap.extend({
	  message: "string",
	  metaData: "any"
  })
  ```

- `can.DefineMap` can also have methods:

  ```js
  var MessageViewModel = can.DefineMap.extend({
	  message: "string",
	  metaData: "any",
	  sayHi: function(){
	    this.message = "Hello";
	  }
  });
  ```

### The solution

Update the template in the __HTML__ tab to:

1. When a `<li>` is clicked on, call `pickPlace` with the corresponding `place`.
2. When a `place` has been set, write out the forecast header.

```html
<script id="app-template" type="text/stache">
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" {^$value}="location" type="text"/>
    </div>

    {{#if placesPromise.isPending}}
      <p class="loading-message">
        Loading places…
      </p>
    {{/if}}

    {{#if placesPromise.isResolved}}
      <div class="location-options">
        <label>Pick your place:</label>
        <ul>
          {{#each placesPromise.value}}
            <li ($click)="../pickPlace(this)">
              {{name}}, {{admin1.content}}, {{country.code}} ({{placeTypeName.content}})
            </li>
          {{/each}}
        </ul>
      </div>
    {{/if}}

    {{#if place}}
      <div class="forecast">
        <h1>10-day {{place.name}} Weather Forecast</h1>
        <ul>
          <li>
            <span class='date'>Today</span>
            <span class='description scattered-showers'>Scattered Showers</span>
            <span class='high-temp'>100<sup>&deg;</sup></span>
            <span class='low-temp'>-10<sup>&deg;</sup></span>
          </li>
        </ul>
      </div>
    {{/if}}
  </div>
</script>
```
@highlight 19,27,29,39,only

Update the __JavaScript__ tab to:

1.  Define a `place` property as taking any data type.
2.  Define a `pickPlace` method that sets the place property.

```js
var yqlURL = "//query.yahooapis.com/v1/public/yql?";

var WeatherViewModel = can.DefineMap.extend({
  location: "string",
  get placesPromise(){
    if(this.location && this.location.length > 2) {
	  return fetch(
		  yqlURL+
		  can.param({
	        q: 'select * from geo.places where text="'+this.location+'"',
	        format: "json"
	      })
	  ).then(function(response){
		  return response.json();
	  }).then(function(data){
		  console.log(data);
          if(Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
	  });
    }
  },
  place: "any",
  pickPlace: function(place){
    this.place = place;
  }
});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 25-28,only

## Get and display the forecast

### The problem

Once we’ve selected a place, we need to get and display the forecast data for the
selected place.  

### Things to know

- ViewModel methods can be [can-stache/expressions/call called] within a [can-stache] template like:

  ```
  {{myMethod(someValue)}}
  ```

- [YQL](https://developer.yahoo.com/yql/console/) provides a service endpoint for
  retrieving a forecast that matches a `place`’s `woeid`.  For example, the following requests the forecast
  for Paris, France’s `woeid`:

  ```
  https://query.yahooapis.com/v1/public/yql?
    format=json&
	q=select * from weather.forecast where woeid=615702
  ```

- The stylesheet includes icons for classNames that match: `sunny`, `mostly-cloudy`, `scattered-thunderstorms`, etc.

### The solution

Update the template in the __HTML__ tab to:

1. Display each forecast day’s details (date, text, high, and low).
2. Use the `toClassName` method to convert the forecast’s `text` into a `className` value that
   will be matched by the stylesheet.

 ```html
 <script id="app-template" type="text/stache">
   <div class="weather-widget">
     <div class="location-entry">
       <label for="location">Enter Your location:</label>
       <input id="location" {^$value}="location" type="text"/>
     </div>

     {{#if placesPromise.isPending}}
       <p class="loading-message">
         Loading places…
       </p>
     {{/if}}

     {{#if placesPromise.isResolved}}
       <div class="location-options">
         <label>Pick your place:</label>
         <ul>
           {{#each placesPromise.value}}
             <li ($click)="../pickPlace(this)">
               {{name}}, {{admin1.content}}, {{country.code}} ({{placeTypeName.content}})
             </li>
           {{/each}}
         </ul>
       </div>
     {{/if}}

     {{#if place}}
       <div class="forecast">
         <h1>10-day {{place.name}} Weather Forecast</h1>
         <ul>
           {{#each forecastPromise.value}}
             <li>
               <span class='date'>{{date}}</span>
               <span class='description {{toClassName(text)}}'>{{text}}</span>
               <span class='high-temp'>{{high}}<sup>&deg;</sup></span>
               <span class='low-temp'>{{low}}<sup>&deg;</sup></span>
             </li>
           {{/each}}
         </ul>
       </div>
     {{/if}}
   </div>
 </script>
 ```
 @highlight 31,33,34,35,36,38,only

Update the __JavaScript__ tab to:

1. Define a `forecastPromise` property that gets a list of promises.
2. Define a `toClassName` method that lowercases and hyphenates any text passed in.

```js
var yqlURL = "//query.yahooapis.com/v1/public/yql?";

var WeatherViewModel = can.DefineMap.extend({
  location: "string",
  get placesPromise(){
    if(this.location && this.location.length > 2) {
	  return fetch(
		  yqlURL+
		  can.param({
	        q: 'select * from geo.places where text="'+this.location+'"',
	        format: "json"
	      })
	  ).then(function(response){
		  return response.json();
	  }).then(function(data){
		  console.log(data);
          if(Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
	  });
    }
  },
  place: "any",
  pickPlace: function(place){
    this.place = place;
  },
  get forecastPromise(){
    if( this.place ) {
	  return fetch(
  		  yqlURL+
  		  can.param({
  	        q: 'select * from weather.forecast where woeid='+this.place.woeid,
  	        format: "json"
  	      })
  	  ).then(function(response){
  		  return response.json();
  	  }).then(function(data){
        console.log("forecast data", data);
        var forecast = data.query.results.channel.item.forecast;

        return forecast;
      });
    }
  },
  toClassName: function(text){
	return text.toLowerCase().replace(/ /g, "-");
  }
});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 29-49,only

## Hide the forecast if the user changes the entered location

### The problem

Currently, if the user changes the entered location, the weather forecast for the
other city is still visible.  Let’s hide it!

### Things to know

- `DefineMap` [can-define.types.set setter]'s can be used to add behavior when a property is set like:

  ```js
  var MessageViewModel = can.DefineMap.extend({
    message: {
	  type: "string",
	  set: function(){
	    this.metaData = null;
	  }
	},
    metaData: "any",
  });
  ```

### The solution

Update the __JavaScript__ tab to set the `place` property to null when the `location` changes.

```js
var yqlURL = "//query.yahooapis.com/v1/public/yql?";

var WeatherViewModel = can.DefineMap.extend({
  location: {
    type: "string",
    set: function(){
      this.place = null;
    }
  },
  get placesPromise(){
    if(this.location && this.location.length > 2) {
	  return fetch(
		  yqlURL+
		  can.param({
	        q: 'select * from geo.places where text="'+this.location+'"',
	        format: "json"
	      })
	  ).then(function(response){
		  return response.json();
	  }).then(function(data){
		  console.log(data);
          if(Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
	  });
    }
  },
  place: "any",
  pickPlace: function(place){
    this.place = place;
  },
  get forecastPromise(){
    if( this.place ) {
	  return fetch(
  		  yqlURL+
  		  can.param({
  	        q: 'select * from weather.forecast where woeid='+this.place.woeid,
  	        format: "json"
  	      })
  	  ).then(function(response){
  		  return response.json();
  	  }).then(function(data){
        console.log("forecast data", data);
        var forecast = data.query.results.channel.item.forecast;

        return forecast;
      });
    }
  },
  toClassName: function(text){
	return text.toLowerCase().replace(/ /g, "-");
  }
});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 4-9,only

## Skip selecting a place if only one place matches the entered location

### The problem

If a single place is returned for the entered location, we can skip asking the
user to select their place; instead, we should show the forecast immediately.  

### Things to know

- `can.DefineMap` [can-define.types.get getters] are passed their last set value.  This way, the
  property can be derived from either the set value or other properties.

  ```js
  var MessageVM = can.DefineMap.extend({
    username: "string",
    message: {
      get: function(lastSet) {
        if(lastSet) {
          return lastSet;
        } else {
          return "Hello "+this.username;
        }
      }
    }
  });

  var messageVM = new MessageVM({username: "Hank"});
  messageVM.message //-> "Hello Hank";

  messageVM.message = "Welcome to Earth";
  messageVM.message //-> "Welcome to Earth"
  ```

- Use [can-define.types.get asynchronous getters] to derive data from asynchronous sources.  For example:

  ```js
  var MessageVM = can.DefineMap.extend({
    messageId: "string",
    message: {
      get: function(lastSet, resolve) {
        fetch("/message/"+this.messageId)
        .then(function(response){
          return response.json();
        }).then(resolve);
      }
    }
  });
  ```

### The solution

Update the template in the __HTML__ tab to use a `showPlacePicker` property to determine if we should show the `place` picker list.

```html
<script id="app-template" type="text/stache">
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" {^$value}="location" type="text"/>
    </div>

    {{#if placesPromise.isPending}}
      <p class="loading-message">
        Loading places…
      </p>
    {{/if}}

    {{#if placesPromise.isResolved}}
      {{#if showPlacePicker}}
        <div class="location-options">
          <label>Pick your place:</label>
          <ul>
            {{#each placesPromise.value}}
              <li ($click)="../pickPlace(this)">
                {{name}}, {{admin1.content}}, {{country.code}} ({{placeTypeName.content}})
              </li>
            {{/each}}
          </ul>
        </div>
      {{/if}}
    {{/if}}

    {{#if place}}
      <div class="forecast">
        <h1>10-day {{place.name}} Weather Forecast</h1>
        <ul>
          {{#each forecastPromise.value}}
            <li>
              <span class='date'>{{date}}</span>
              <span class='description {{toClassName(text)}}'>{{text}}</span>
              <span class='high-temp'>{{high}}<sup>&deg;</sup></span>
              <span class='low-temp'>{{low}}<sup>&deg;</sup></span>
            </li>
          {{/each}}
        </ul>
      </div>
    {{/if}}
  </div>
</script>
```
@highlight 15,26,only

Update the __JavaScript__ tab to:

1. Define a `places` property that will have the places list returned by the `YQL` service.
2. Define a `showPlacePicker` property that is true if there’s more than one place in `places` and
   the `place` property hasn’t been set yet.
3. Update the `place` property to default to the first item in `places` if there is only one item.

```js
var yqlURL = "//query.yahooapis.com/v1/public/yql?";

var WeatherViewModel = can.DefineMap.extend({
  location: {
    type: "string",
    set: function(){
      this.place = null;
    }
  },
  get placesPromise(){
    if(this.location && this.location.length > 2) {
	  return fetch(
		  yqlURL+
		  can.param({
	        q: 'select * from geo.places where text="'+this.location+'"',
	        format: "json"
	      })
	  ).then(function(response){
		  return response.json();
	  }).then(function(data){
		  console.log(data);
          if(Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
	  });
    }
  },
  places: {
    get: function(lastSet, resolve) {
      if(this.placesPromise) {
        this.placesPromise.then(resolve)
      }
    }
  },
  get showPlacePicker(){
    return !this.place && this.places && this.places.length > 1;
  },
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
  pickPlace: function(place){
    this.place = place;
  },
  get forecastPromise(){
    if( this.place ) {
	  return fetch(
  		  yqlURL+
  		  can.param({
  	        q: 'select * from weather.forecast where woeid='+this.place.woeid,
  	        format: "json"
  	      })
  	  ).then(function(response){
  		  return response.json();
  	  }).then(function(data){
        console.log("forecast data", data);
        var forecast = data.query.results.channel.item.forecast;

        return forecast;
      });
    }
  },
  toClassName: function(text){
		return text.toLowerCase().replace(/ /g, "-");
  }
});

var vm = new WeatherViewModel();

var template = can.stache.from("app-template");
var frag = template( vm );
document.body.appendChild(frag);
```
@highlight 30-51,only

## Result

When finished, you should see something like the following JS Bin:

<a class="jsbin-embed" href="https://jsbin.com/vujugel/1/embed?js,output">JS Bin on jsbin.com</a>

<script src="https://static.jsbin.com/js/embed.min.js?3.35.5"></script>
