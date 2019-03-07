@page guides/recipes/weather-report-simple Weather Report Guide (Simple)
@parent guides/recipes

@description This guide walks you through building a simple weather report
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 5.22.0.

@body

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="cherifGsoul" data-slug-hash="OqbZaG" data-pen-title="Weather Report Guide (Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/OqbZaG/">
  Weather Report Guide (Simple) [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

To use the widget:

1. __Enter__ a location (example: _Chicago_)
2. If the location name isn’t unique, __click__ on the intended location.
3. See the 10-day forecast for your selected city.

__Start this tutorial by cloning the following CodePen__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="cherifGsoul" data-slug-hash="YgpvZg" data-pen-title="Weather Report Guide (Simple) [Starter]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/YgpvZg/">
  Weather Report Guide (Simple) [Starter]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- Problem — A description of what the section is trying to accomplish.
- Things to know — Information about CanJS that is useful for solving the problem.
- Solution — The solution to the problem.


## Setup

### The problem

Get the basic setup for a CanJS app (in a CodePen) setup by:

1.  Creating a template that outputs the pre-constructed HTML.
2.  Defining a `WeatherViewModel` constructor function.
3.  Rendering the template with an instance of `WeatherViewModel`.
4.  Inserting the result of the rendered template into the page.

### Things to know

- A [can-stache] template can be loaded from a `<script>` tag with [can-stache.from can.stache.from] and used to render data into a document fragment:
  ```js
  import { stache } from "can";
  const template = stache.from(SCRIPT_ID);
  const fragment = template({message: "Hello World"});
  // fragment -> <h1>Hello World</h1>
  ```

- [can-define/map/map can.DefineMap] can be used to define the behavior of observable objects like:

  ```js
  import { DefineMap } from "can";
  const Type = DefineMap.extend({
    message: "string"
  });
  ```

- Instances of these [can-define/map/map can.DefineMap] types are often used
  as a ViewModel that controls the behavior of a [can-stache] template (or
  [can-component]).

  ```js
  import { DefineMap } from "can";

  const MessageViewModel = can.DefineMap.extend({
    message: "string"
  });

  const messageVM = new MessageViewModel();
  const fragment = template(messageVM)
  ```

### The solution

Update the __HTML__ tab to add a `weather-report` tag:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Weather Report</title>
</head>

<body>
  <weather-report></weather-report>
</body>
</html>
```
@highlight 11,only

Update the __JavaScript__ tab to:


- Define a Component
- Write the Component's `view` property
- Add Component's ViewModel property

```js
import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" type="text"/>
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
          <span class="date">Today</span>
          <span class='description scattered-showers'>Scattered Showers</span>
          <span class="high-temp">100<sup>&deg;</sup></span>
          <span class="low-temp">-10<sup>&deg;</sup></span>
        </li>
      </ul>
    </div>
  </div>
 `,
 ViewModel: {

 }
});
```
@highlight 1-40

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
  <input value:to="property" />
  ```

- A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```html
  {{property}}
  ```

### The solution

Update the __JavaScript__ tab to:
1. define a `location` property as a string.
2. Update `location` on the ViewModel when the input changes in the view.
3. Show value of the ViewModel’s `location` property in the view.

```js
import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" value:to="location" type="text" />
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
          <span class="date">Today</span>
          <span class='description scattered-showers'>Scattered Showers</span>
          <span class="high-temp">100<sup>&deg;</sup></span>
          <span class="low-temp">-10<sup>&deg;</sup></span>
        </li>
      </ul>
    </div>
  </div>
 `,
 ViewModel: {
   location: "string"
 }
});
```
@highlight 9,25,38,only

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
  import { Define } from "can";

  DefineMap.extend({
    message: "string",
    get excitedMessage() {
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
  fetch(url).then(function(response) {
    return response.json();
  }).then(function(data) {

  });
  ```

- [can-param param] is able to convert an object into a
  query string format like:

  ```js
  import { param } from "can";
  param({format: "json", q: "select"}) //-> "format=json&q=select"
  ```  

- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.for-of {{#for(of)}}] to do looping in `can-stache`.
- `Promise`s are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{#if(somePromise.isPending)}}`.
  - Loop through the resolved value of the promise like: `{{#for(item of somePromise.value)}}`.


### The solution

Update the __JavaScript__ tab to:

1. Import `param` module
2. Show a “Loading places…” message while we wait on data.
3. Once the places are resolved, list each place’s name, state, country and type.
4. Define a `placesPromise` property that will represent the loading places.
5. If the user has typed in at least two characters, we fetch the matching places.
6. If only a single place is returned, we still convert it into an array so the data
   stays consistent.  

```js
import { Component, param } from "//unpkg.com/can@5/core.mjs";

const yqlURL = "//query.yahooapis.com/v1/public/yql?";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" value:to="location" type="text" />
    </div>

    {{# if(placesPromise.isPending) }}
      <p class="loading-message">
        Loading places…
      </p>
    {{/ if }}

    {{# if(placesPromise.isResolved) }}
      <div class="location-options">
        <label>Pick your place:</label>
        <ul>
          {{# for(place of placesPromise.value) }}
            <li>
                {{ place.name }}, {{ place.admin1.content }}, {{ place.country.code }} ({{ place.placeTypeName.content }})
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}

    <div class="forecast">
      <h1>10-day {{location}} Weather Forecast</h1>
      <ul>
        <li>
          <span class="date">Today</span>
          <span class='description scattered-showers'>Scattered Showers</span>
          <span class="high-temp">100<sup>&deg;</sup></span>
          <span class="low-temp">-10<sup>&deg;</sup></span>
        </li>
      </ul>
    </div>
  </div>
 `,
 ViewModel: {
    location: "string",
    get placesPromise() {
      if (this.location && this.location.length > 2) {
        return fetch(
          yqlURL +
          param({
            q: 'select * from geo.places where text="'+this.location+'"',
            format: "json"
          })
        ).then(function(response) {
          return response.json();
        }).then(function(data) {
          console.log(data);
          if (Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
        });
      }
    }
 }
});
```
@highlight 1,3,14,18,20,24-28,31,48-67,only

## Allow a user to select a place

### The problem

When a user clicks on a place, we need to indicate their selection.

### Things to know

- Use [can-stache-bindings.event (on:EVENT)] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `sayHi()` when the `<div>` is clicked.

   ```html
   <div on:click="sayHi()"> … </div>
   ```

- `this` in a stache template refers to the current context of a template or section.  

  For example, the `this` in `this.name` refers to the `context` object:

  ```javascript
  const template = stache("{{this.name}}");
  const context = {name: "Justin"};
  template(context);
  ```


- The [can-define.types “any” type] can be used to define a property as
  accepting any data type like:

  ```js
  const MessageViewModel = can.DefineMap.extend({
    message: "string",
    metaData: "any"
  })
  ```

- [can-define/map/map DefineMap] can also have methods:

  ```js
  import { DefineMap } from "can";

  const MessageViewModel = DefineMap.extend({
    message: "string",
    metaData: "any",
    sayHi: function() {
      this.message = "Hello";
    }
  });
  ```

### The solution

Update the __JavaScript__ tab to:

1. When a `<li>` is clicked on, call `pickPlace` with the corresponding `place`.
2. When a `place` has been set, write out the forecast header.
3.  Define a `place` property as taking any data type.
4.  Define a `pickPlace` method that sets the place property.

```js
import { Component, param } from "//unpkg.com/can@5/core.mjs";

const yqlURL = "//query.yahooapis.com/v1/public/yql?";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" value:to="location" type="text" />
    </div>

    {{# if(placesPromise.isPending) }}
      <p class="loading-message">
        Loading places…
      </p>
    {{/ if }}

    {{# if(placesPromise.isResolved) }}
      <div class="location-options">
        <label>Pick your place:</label>
        <ul>
          {{# for(place of placesPromise.value) }}
            <li on:click="this.pickPlace(place)">
                {{ place.name }}, {{ place.admin1.content }}, {{ place.country.code }} ({{ place.placeTypeName.content }})
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}

    {{# if(place) }}
      <div class="forecast">
        <h1>10-day {{place.name}} Weather Forecast</h1>
        <ul>
          <li>
            <span class="date">Today</span>
            <span class='description scattered-showers'>Scattered Showers</span>
            <span class="high-temp">100<sup>&deg;</sup></span>
            <span class="low-temp">-10<sup>&deg;</sup></span>
          </li>
        </ul>
      </div>
    {{/ if }}
  </div>
 `,
 ViewModel: {
    location: "string",
    get placesPromise() {
      if (this.location && this.location.length > 2) {
        return fetch(
          yqlURL +
          param({
            q: 'select * from geo.places where text="'+this.location+'"',
            format: "json"
          })
        ).then(function(response) {
          return response.json();
        }).then(function(data) {
          console.log(data);
          if (Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
        });
      }
    },
    place: "any",
    pickPlace: function(place) {
      this.place = place;
    }
 }
});
```
@highlight 25,31,35,45,70-73,only

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

Update the __JavaScript__ tab to:

1. Display each forecast day’s details (date, text, high, and low).
2. Use the `toClassName` method to convert the forecast’s `text` into a `className` value that
   will be matched by the stylesheet.
3. Define a `forecastPromise` property that gets a list of promises.
4. Define a `toClassName` method that lowercases and hyphenates any text passed in.

```js
import { Component, param } from "//unpkg.com/can@5/core.mjs";

const yqlURL = "//query.yahooapis.com/v1/public/yql?";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" value:to="location" type="text" />
    </div>

    {{# if(placesPromise.isPending) }}
      <p class="loading-message">
        Loading places…
      </p>
    {{/ if }}

    {{# if(placesPromise.isResolved) }}
      <div class="location-options">
        <label>Pick your place:</label>
        <ul>
          {{# for(place of placesPromise.value) }}
            <li on:click="this.pickPlace(place)">
                {{ place.name }}, {{ place.admin1.content }}, {{ place.country.code }} ({{ place.placeTypeName.content }})
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}

    {{# if(place) }}
      <div class="forecast">
        <h1>10-day {{place.name}} Weather Forecast</h1>
        <ul>
          {{# for(forecast of forecastPromise.value) }}
            <li>
              <span class="date">{{ forecast.date }}</span>
              <span class="description {{ toClassName(forecast.text) }}">{{ forecast.text }}</span>
              <span class="high-temp">{{ forecast.high }}<sup>&deg;</sup></span>
              <span class="low-temp">{{ forecast.low }}<sup>&deg;</sup></span>
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}
  </div>
 `,
 ViewModel: {
    location: "string",
    get placesPromise() {
      if (this.location && this.location.length > 2) {
        return fetch(
          yqlURL +
          param({
            q: 'select * from geo.places where text="'+this.location+'"',
            format: "json"
          })
        ).then(function(response) {
          return response.json();
        }).then(function(data) {
          console.log(data);
          if (Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
        });
      }
    },
    place: "any",
    pickPlace: function(place) {
      this.place = place;
    },
    get forecastPromise() {
      if ( this.place ) {
        return fetch(
            yqlURL+
            param({
                q: 'select * from weather.forecast where woeid='+this.place.woeid,
                format: "json"
              })
          ).then(function(response) {
            return response.json();
          }).then(function(data) {
            console.log("forecast data", data);
            const forecast = data.query.results.channel.item.forecast;

            return forecast;
          });
      }
  },
  toClassName: function(text) {
    return text.toLowerCase().replace(/ /g, "-");
  }
 }
});
```
@highlight 37,39-42,76-96,only

## Hide the forecast if the user changes the entered location

### The problem

Currently, if the user changes the entered location, the weather forecast for the
other city is still visible.  Let’s hide it!

### Things to know

- [can-define/map/map DefineMap] [can-define.types.set setter]’s can be used to add behavior when a property is set like:

  ```js
  import { DefineMap } from "can";

  const MessageViewModel = DefineMap.extend({
    message: {
    type: "string",
    set: function() {
      this.metaData = null;
    }
  },
    metaData: "any",
  });
  ```

### The solution

Update the __JavaScript__ tab to set the `place` property to null when the `location` changes.

```js
import { Component, param } from "//unpkg.com/can@5/core.mjs";

const yqlURL = "//query.yahooapis.com/v1/public/yql?";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" value:to="location" type="text" />
    </div>

    {{# if(placesPromise.isPending) }}
      <p class="loading-message">
        Loading places…
      </p>
    {{/ if }}

    {{# if(placesPromise.isResolved) }}
      <div class="location-options">
        <label>Pick your place:</label>
        <ul>
          {{# for(place of placesPromise.value) }}
            <li on:click="this.pickPlace(place)">
                {{ place.name }}, {{ place.admin1.content }}, {{ place.country.code }} ({{ place.placeTypeName.content }})
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}

    {{# if(place) }}
      <div class="forecast">
        <h1>10-day {{place.name}} Weather Forecast</h1>
        <ul>
          {{# for(forecast of forecastPromise.value) }}
            <li>
              <span class="date">{{ forecast.date }}</span>
              <span class="description {{ toClassName(forecast.text) }}">{{ forecast.text }}</span>
              <span class="high-temp">{{ forecast.high }}<sup>&deg;</sup></span>
              <span class="low-temp">{{ forecast.low }}<sup>&deg;</sup></span>
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}
  </div>
 `,
 ViewModel: {
    location: {
      type: "string",
      set: function() {
        this.place = null;
      }
    },
    get placesPromise() {
      if (this.location && this.location.length > 2) {
        return fetch(
          yqlURL +
          param({
            q: 'select * from geo.places where text="'+this.location+'"',
            format: "json"
          })
        ).then(function(response) {
          return response.json();
        }).then(function(data) {
          console.log(data);
          if (Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
        });
      }
    },
    place: "any",
    pickPlace: function(place) {
      this.place = place;
    },
    get forecastPromise() {
      if ( this.place ) {
        return fetch(
            yqlURL+
            param({
                q: 'select * from weather.forecast where woeid='+this.place.woeid,
                format: "json"
              })
          ).then(function(response) {
            return response.json();
          }).then(function(data) {
            console.log("forecast data", data);
            const forecast = data.query.results.channel.item.forecast;

            return forecast;
          });
      }
  },
  toClassName: function(text) {
    return text.toLowerCase().replace(/ /g, "-");
  }
 }
});
```
@highlight 51-56,only

## Skip selecting a place if only one place matches the entered location

### The problem

If a single place is returned for the entered location, we can skip asking the
user to select their place; instead, we should show the forecast immediately.  

### Things to know

- [can-define/map/map DefineMap] [can-define.types.get getters] are passed their last set value.  This way, the
  property can be derived from either the set value or other properties.

  ```js
  import { DefineMap } from "can";

  const MessageVM = DefineMap.extend({
    username: "string",
    message: {
      get: function(lastSet) {
        if (lastSet) {
          return lastSet;
        } else {
          return "Hello "+this.username;
        }
      }
    }
  });

  const messageVM = new MessageVM({username: "Hank"});
  messageVM.message //-> "Hello Hank";

  messageVM.message = "Welcome to Earth";
  messageVM.message //-> "Welcome to Earth"
  ```

- Use [can-define.types.get asynchronous getters] to derive data from asynchronous sources.  For example:

  ```js
  import { DefineMap } from "can";

  const MessageVM = DefineMap.extend({
    messageId: "string",
    message: {
      get: function(lastSet, resolve) {
        fetch("/message/"+this.messageId)
        .then(function(response) {
          return response.json();
        }).then(resolve);
      }
    }
  });
  ```

### The solution

Update the __JavaScript__ tab to:

1. Use a `showPlacePicker` property to determine if we should show the `place` picker list.
2. Define a `places` property that will have the places list returned by the `YQL` service.
3. Define a `showPlacePicker` property that is true if there’s more than one place in `places` and
   the `place` property hasn’t been set yet.
4. Update the `place` property to default to the first item in `places` if there is only one item.

```js
import { Component, param } from "//unpkg.com/can@5/core.mjs";

const yqlURL = "//query.yahooapis.com/v1/public/yql?";

Component.extend({
 tag: "weather-report",
 view: `
  <div class="weather-widget">
    <div class="location-entry">
      <label for="location">Enter Your location:</label>
      <input id="location" value:to="location" type="text" />
    </div>

    {{# if(placesPromise.isPending) }}
      <p class="loading-message">
        Loading places…
      </p>
    {{/ if }}

    {{# if(placesPromise.isResolved) }}
      {{# if(showPlacePicker) }}
        <div class="location-options">
          <label>Pick your place:</label>
          <ul>
            {{# for(place of placesPromise.value) }}
              <li on:click="this.pickPlace(place)">
                  {{ place.name }}, {{ place.admin1.content }}, {{ place.country.code }} ({{ place.placeTypeName.content }})
              </li>
            {{/ for }}
          </ul>
        </div>
      {{/ if }}
    {{/ if }}

    {{# if(place) }}
      <div class="forecast">
        <h1>10-day {{place.name}} Weather Forecast</h1>
        <ul>
          {{# for(forecast of forecastPromise.value) }}
            <li>
              <span class="date">{{ forecast.date }}</span>
              <span class="description {{ toClassName(forecast.text) }}">{{ forecast.text }}</span>
              <span class="high-temp">{{ forecast.high }}<sup>&deg;</sup></span>
              <span class="low-temp">{{ forecast.low }}<sup>&deg;</sup></span>
            </li>
          {{/ for }}
        </ul>
      </div>
    {{/ if }}
  </div>
 `,
 ViewModel: {
    location: {
      type: "string",
      set: function() {
        this.place = null;
      }
    },
    get placesPromise() {
      if (this.location && this.location.length > 2) {
        return fetch(
          yqlURL +
          param({
            q: 'select * from geo.places where text="'+this.location+'"',
            format: "json"
          })
        ).then(function(response) {
          return response.json();
        }).then(function(data) {
          console.log(data);
          if (Array.isArray(data.query.results.place)) {
            return data.query.results.place;
          } else {
            return [data.query.results.place];
          }
        });
      }
    },
    places: {
      get: function(lastSet, resolve) {
        if (this.placesPromise) {
          this.placesPromise.then(resolve)
        }
      }
    },
    get showPlacePicker() {
      return !this.place && this.places && this.places.length > 1;
    },
    place: {
      type: "any",
      get: function(lastSet) {
        if (lastSet) {
          return lastSet;
        } else {
          if (this.places && this.places.length === 1) {
            return this.places[0];
          }
        }
      }
    },
    pickPlace: function(place) {
      this.place = place;
    },
    get forecastPromise() {
      if ( this.place ) {
        return fetch(
            yqlURL+
            param({
                q: 'select * from weather.forecast where woeid='+this.place.woeid,
                format: "json"
              })
          ).then(function(response) {
            return response.json();
          }).then(function(data) {
            console.log("forecast data", data);
            const forecast = data.query.results.channel.item.forecast;

            return forecast;
          });
      }
  },
  toClassName: function(text) {
    return text.toLowerCase().replace(/ /g, "-");
  }
 }
});
```
@highlight 21,32,79-100,only

## Result

When finished, you should see something like the following CodePen:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="cherifGsoul" data-slug-hash="OqbZaG" data-pen-title="Weather Report Guide (Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/OqbZaG/">
  Weather Report Guide (Simple) [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
