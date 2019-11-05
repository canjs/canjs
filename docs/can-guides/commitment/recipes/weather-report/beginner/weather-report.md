@page guides/recipes/weather-report-simple Weather Report
@parent guides/recipes/beginner

@description This beginner guide walks you through building a simple weather report
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 6.2.

@body

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="VwwQBVy" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Weather Report Guide (CanJS 6 Beginner) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/VwwQBVy">
  Weather Report Guide (CanJS 6 Beginner) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

To use the widget:

1. __Enter__ a location (example: _Chicago_)
2. See the 5-Day forecast for the city you entered.

__Start this tutorial by cloning the following CodePen__:

<p class="codepen" data-height="354" data-theme-id="0" data-default-tab="html,result" data-user="bitovi" data-slug-hash="BaaryMN" style="height: 354px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Weather Report Guide (CanJS 6 Beginner) [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/BaaryMN">
  Weather Report Guide (CanJS 6 Beginner) [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

This starter code includes:

- Initial prototype HTML and CSS which is useful for getting the application to look right
- Pre-made styles so the app looks pretty 😍

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.

## Setup

### The problem

Set up this CanJS app by:

1.  Defining a `WeatherReport` [can-stache-element] class.
2.  Defining a custom element that outputs the pre-constructed HTML.
3.  Rendering the template by using the custom element.

### What you need to know

- A basic CanJS setup uses instances of a [can-stache-element StacheElement], which
 glues [can-observable-object ObservableObject]-like properties to a [can-stache-element/static.view `view`] in order
 to manage its behavior as follows:

  ```js
  import { StacheElement } from "//unpkg.com/can@6/core.mjs";

  // Define the Component
  class MyComponent extends StacheElement {
    static view = `…`;

    static props = {};
  }

  // Define the custom element tag
  customElements.define("my-component", CCPayment);
  ```

- CanJS components will be mounted in the DOM by adding the component tag in the HTML page:
  ```html
  <my-component></my-component>
  ```

### The solution

Update the __JavaScript__ tab to:

- Define [can-stache-element] class
- Define element’s view by copying the content of the __HTML__ tab in the __view__ property
- Register the custom element tag by using [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)

@sourceref ./1-setup.js
@highlight 1-27

Update the __HTML__ tab to replace the old template with custom element:

@sourceref ./1-setup.html
@highlight 1,only


## Allow a user to enter a location

### The problem

We want an `input` element to:

- Allow a person to type a location to search for weather.
- Show the user the location they typed.

### What you need to know

- The properties defined in the [can-stache-element/static.props `props`] object can have default values like:
  ```js
  class MyComponent extends StacheElement {
    static props = {
      age: {
        default: 34
      }
    };
  }
  ```

- CanJS components use [can-stache] to render data in a template and keep it live.

- The [can-stache-bindings.toParent] binding can set an input’s `value` to an element property like:
  ```html
  <input value:to="this.age" />
  ```

### The solution

Update the __JavaScript__ tab to:
1. Define a `location` property as a string.
2. Update `location` value on the element when the input changes.
3. Show value of the element’s `location` property.

@sourceref ./2-enter-location.js
@highlight 8,14,27-29,only

## Get the forecast

### The problem

Once we’ve entered a city, we need to get the forecast data.

### What you need to know

- [ES5 getter syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define a [can-stache-element/static.props] property that changes when another property changes.  For example,
  the following defines an `excitedMessage` property that always has a `!` after the `message` property:

  ```js
  class MyElement extends StacheElement
    static props = {
      get excitedMessage() {
        return this.message+"!";
      },
      message: "string"
    }
  });
  ```

- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].

- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{# if(somePromise.isPending) }}`.

- [Open Weather Map](https://openweathermap.org/forecast5) provides a service endpoint for
  retrieving a forecast that matches a city name. For example, the following requests the forecast
  for Chicago:

  ```
  https://api.openweathermap.org/data/2.5/forecast?q=Chicago&mode=json&units=imperial&apiKey=17ba01d3931252096b4ab03df56891cd
  ```

- The [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is an easy way to make requests
  to a URL and get back JSON.  Use it like:

  ```js
  fetch(url).then(response => {
    return response.json();
  }).then(data => {
  });
  ```

- [can-param] is able to convert an object into a
  query string format like:

  ```js
  param({format: "json", q: "chicago"}) //-> "format=json&q=chicago"
  ```

### The solution

Update the template in the __JS__ tab to:

1. Wrap the loading message with `{{# if(this.forecastPromise.isPending) }}`
2. Wrap the forecast with `{{# if(this.forecastPromise.isResolved) }}`
3. Define a `forecastPromise` property that gets the forecast.

@sourceref ./3-fetch-forecast.js
@highlight 1,11,13,15,27,32-48,only

## Display the forecast

### The problem

Now that we’ve fetched the forecast data, we need to display it in the app.

### What you need to know

- Use [can-stache.helpers.for-of {{# for(of) }}] to do looping in [can-stache].

- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Loop through the resolved value of the promise like: `{{# for(item of somePromise.value) }}`.

- Methods on the element can be [can-stache/expressions/call called] within a [can-stache] template like:

  ```handlebars
  {{ this.myMethod(someValue) }}
  ```

- The stylesheet includes icons for classNames that match: `sunny`, `light-rain`, `scattered-clouds`, etc.

- You can check whether one [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) is equal to another Date by calling [getDate](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDate) on both dates and comparing the values.

### The solution

Update the template in the __JS__ tab to:

1. Display each forecast day’s details (date, text, high, and low).
2. Define a `toClassName` method that lowercases and hyphenates any text passed in.
3. Use the `toClassName` method to convert the forecast’s `text` into a `className` value that
4. Define `isToday` method that returns `true` if the passed date is today
   will be matched by the stylesheet.
5. Use the `isToday` method to display the term `Today` instead of today’s date.

@sourceref ./4-display-forecast.js
@highlight 19,21-30,32,60-67,only

## Result

When finished, you should see something like the following CodePen:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="VwwQBVy" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Weather Report Guide (CanJS 6 Beginner) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/VwwQBVy">
  Weather Report Guide (CanJS 6 Beginner) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
