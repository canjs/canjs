@page guides/recipes/weather-report-simple Weather Report
@parent guides/recipes/beginner

@description This beginner guide walks you through building a simple weather report
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 6.1.2.

@body

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="cherifGsoul" data-slug-hash="ZEEejxP" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Weather Report Guide (CanJS 6 Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/ZEEejxP">
  Weather Report Guide (CanJS 6 Simple) [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

To use the widget:

1. __Enter__ a location (example: _Chicago_)
2. See the 5-day forecast for the city you entered.

__Start this tutorial by cloning the following CodePen__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="html,result" data-user="cherifGsoul" data-slug-hash="MWWpPzQ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Weather Report Guide (CanJS 6 Simple) [Starter]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/MWWpPzQ">
  Weather Report Guide (CanJS 6 Simple) [Starter]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
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

2.  Defining a `WeatherReport` stache element class.
1.  Defining a custom element that outputs the pre-constructed HTML.
3.  Rendering the template by using the custom element.

### Things to know

- Set up a basic CanJS application.
- Use [can-stache-element] to define custom element class to render data in a template
  and keep it updated.  Templates can be authored in the element `view` property like:
  ```js
  class MyComponent extends StacheElement {
    static view = `TEMPLATE CONTENT`;
  }
  customElements.define("my-component", MyComponent);
  ```

  - A custom element view is a [can-stache] template that uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```js
  class MyComponent extends StacheElement {
    static view = `{{this.message}}`;
    static props = {
      message: "Hello, World"
    };
  }
  customElements.define("my-component", MyComponent);
  ```


### The solution

Update the __JavaScript__ tab to:

- Define [can-stache-element] class
- Define element's view by copying the content of the __HTML__ tab in the __view__ property
- Register the custom element tag by using [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)

```js
import { StacheElement } from "//unpkg.com/can@6/core.mjs";

const openWeatherURL = "//api.openweathermap.org/data/2.5/forecast?";

class WeatherReport extends StacheElement {
  static view = `
    <div class="weather-widget">
      <div class="location-entry">
        <label for="location">Enter Your location:</label>
        <input id="location" type='text'/>
      </div>

      <p class="loading-message">
        Loading places…
      </p>
    
      <div class="forecast">
        <h1>10-day Chicago Weather Forecast</h1>
        <ul>
          <li>
            <span class='date'>Today</span>
            <span class='description light-rain'>light rain</span>
            <span class='high-temp'>100<sup>&deg;</sup></span>
            <span class='low-temp'>-10<sup>&deg;</sup></span>
          </li>
        </ul>
      </div>
    </div>`;
}

customElements.define('weather-report', WeatherReport);
```
@highlight 1-31

Update the __HTML__ tab to wrap the template in a `script` tag:

```html
 <weather-report></weather-report>
```
@highlight 1,only


## Allow a user to enter a location

### The problem

We want an `input` element to:

- Allow a person to type a location to search for weather.
- Show the user the location they typed.

### Things to know

- Define element's ViewModel properties on [can-stache-element] by using [can-stache-element.props]:

  ```js
  class MyElement extends StacheElement {
    static props {
      location: String
    }
  }
  ```
- The [can-stache-bindings.toParent] can set an input’s `value` to
  a ViewModel property like:

  ```html
  <input value:to="property" />
  ```

### The solution

Update the __JavaScript__ tab to:
1. Define a `location` property as a string.
2. Update `location` value on the ViewModel when the input changes.
3. Show value of the ViewModel’s `location` property.

```js
import { StacheElement } from "//unpkg.com/can@6/core.mjs";

const openWeatherURL = "//api.openweathermap.org/data/2.5/forecast?";

class WeatherReport extends StacheElement {
  static view = `
    <div class="weather-widget">
      <div class="location-entry">
        <label for="location">Enter Your location:</label>
        <input id="location" value:to="location" type='text'/>
      </div>

      <p class="loading-message">
        Loading places…
      </p>
    
      <div class="forecast">
        <h1>5-day {{ this.location }} Weather Forecast</h1>
        <ul>
          <li>
            <span class='date'>Today</span>
            <span class='description light-rain'>light rain</span>
            <span class='high-temp'>100<sup>&deg;</sup></span>
            <span class='low-temp'>-10<sup>&deg;</sup></span>
          </li>
        </ul>
      </div>
    </div>`;

    static props = {
      location: String
    }
}

customElements.define('weather-report', WeatherReport);
```
@highlight 30-32, only

## Get and display the forecast

### The problem

Once we’ve entered a city, we need to get and display the forecast data for the
selected place.  

### Things to know

- [ES5 Getter Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define a [can-stache-element/static.props] property that changes when another property changes.  For example,
  the following defines an `excitedMessage` property that always has a `!` after the `message` property:

  ```js
  class MyElement extends StacheElement
    static props {
      message: "string",
      get excitedMessage() {
        return this.message+"!";
      }
    }
  });
  ```

- [Open Weather Map](https://openweathermap.org/forecast5) provides a service endpoint for
  retrieving a forecast that matches a city name. For example, the following requests the forecast
  for Chicago:

  ```
  http://api.openweathermap.org/data/2.5/forecast?q=Chicago&mode=json&units=imperial&apiKey=you_app_key"
  ```

- The [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is an easy way to make requests
  to a URL and get back JSON.  Use it like:

  ```js
  fetch(url).then(function(response) {
    return response.json();
  }).then(function(data) {

  });
  ```

- [can-util/js/param/param can.param] is able to convert an object into a
  query string format like:

  ```js
  can.param({format: "json", q: "chicago"}) //-> "format=json&q=chicago"
  ```  

- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in [can-stache].
- Use [can-stache.helpers.for-of {{#for(of)}}] to do looping in [can-stache].
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{#if(somePromise.isPending)}}`.
  - Loop through the resolved value of the promise like: `{{#for(item of somePromise.value)}}`.

- ViewModel methods can be [can-stache/expressions/call called] within a [can-stache] template like:

  ```
  {{ myMethod(someValue) }}
  ```

- The stylesheet includes icons for classNames that match: `sunny`, `light-rain`, `scattered-clouds`, etc.

- Format javascript `Date`

- Replace today's date with `Today`

### The solution

Update the template in the __JAVASCRIPT__ tab to:

1. Define a `forecastPromise` property that gets a list of promises.
2. Define a `toClassName` method that lowercases and hyphenates any text passed in.
3. Define `formatDate` method that formats `Date` object
3. Define `isToday` method that returns `true` if the passed date is today
3. Display each forecast day’s details (date, text, high, and low).
4. Use the `toClassName` method to convert the forecast’s `text` into a `className` value that
   will be matched by the stylesheet.
5. Use the `formatDate` method to convert the forecast’s `date` into a human readable date.
6. Use the `isToday` method to display the term `Today` instead of today's date.


 ```js
import { StacheElement, param } from "//unpkg.com/can@6/core.mjs";

const openWeatherURL = "//api.openweathermap.org/data/2.5/forecast?";

class WeatherReport extends StacheElement {
  static view = `
    <div class="weather-widget">
      <div class="location-entry">
        <label for="location">Enter Your location:</label>
        <input id="location" value:to="location" type='text'/>
      </div>

      {{# if(this.placesPromise.isPending) }}
        <p class="loading-message">
          Loading forecast…
        </p>
      {{/ if }}
    
      <div class="forecast">
        <h1>5-day {{ this.location }} Weather Forecast</h1>
        <ul>
          {{# for(forecast of this.forecastPromise.value) }}
            <li>
              <span class='date'>
                {{# if(isToday(forecast.date)) }}
                  Today
                {{ else }}
                  {{ this.formatDate(forecast.date) }}
                {{/ if }}
              </span>
              <span class='description {{ this.toClassName(forecast.text) }}'>{{ forecast.text }}</span>
              <span class='high-temp'>{{ forecast.high }}<sup>&deg;</sup></span>
              <span class='low-temp'>{{ forecast.low }}<sup>&deg;</sup></span>
            </li>
          {{/ for }}
        </ul>
      </div>
    </div>`;

  static props = {
    location: String,
    get forecastPromise(){
      if (this.location) {
        return fetch(
          openWeatherURL +
          param({
            q: this.location,
            mode: "json",
            units: 'imperial',
            apiKey: appKey
          })
        ).then(function(response){
          return response.json();
        }).then(transformData);
      }
    }
  }

  toClassName(txt){
		return txt.toLowerCase().replace(/ /g, "-");
	}

	formatDate(date) {
		return new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric', day: 'numeric' }).format(date);
	}

	isToday(date) {
		const today = new Date();
		return today.getDate() === date.getDate();
	}
}

customElements.define('weather-report', WeatherReport);
```
@highlight 1,13,17,24-33,42-56,59-70,only

## Result

When finished, you should see something like the following CodePen:


<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="cherifGsoul" data-slug-hash="ZEEejxP" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Weather Report Guide (CanJS 6 Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/ZEEejxP">
  Weather Report Guide (CanJS 6 Simple) [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
