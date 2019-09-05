@page guides/recipes/canvas-clock Canvas Clock
@parent guides/recipes/beginner

@description This beginner guide walks you through building a clock with the
[https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API Canvas API].


@body

In this guide you will learn how to:

- Create custom elements for digital and analog clocks
- Use the `canvas` API to draw the hands of the analog clock

The final widget looks like:

<p class="codepen" data-height="495" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="LYPZjbO" style="height: 495px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Canvas Clock (Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPZjbO/">
  Canvas Clock (Simple) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works (if it’s not obvious).
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLICKING THE “EDIT ON CODEPEN” BUTTON IN THE TOP RIGHT CORNER OF THE FOLLOWING EMBED__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="oNvpXpV" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Canvas Clock (Simple) [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/oNvpXpV/">
  Canvas Clock (Simple) [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML, CSS, and JS to bootstrap a basic CanJS application.




### What you need to know

There’s nothing to do in this step. The CodePen is already setup with:

- A _basic_ CanJS setup.
- A `<clock-controls>` custom element that:
  - updates a `time` property every second
  - passes the `time` value to `<digital-clock>` and
    `<analog-clock>` components that will be defined in future sections.

Please read on to understand the setup.

#### A Basic CanJS Setup

A basic CanJS setup is usually a custom element.  In the `HTML`
tab, you’ll find a `<clock-controls>` element.  The following code in the `JS` tab
defines the behavior of the `<clock-controls>` element:

@sourceref ./1-setup.js

[can-stache-element] is used to define the behavior of the  `<clock-controls>`
element. Elements are configured with two main properties that define their
behavior:

- [can-stache-element/static.view] is used as the HTML content within the custom
  element; by default, it is a [can-stache] template.
- [can-stache-element/static.props] provides values to the `view`.

Here, a `time` property is defined using the [can-observable-object/define/value value behavior].
This uses `resolve` to set the value of `time` to be an instance of a
[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
and then update the value every second to be a new `Date`.

Finally, the name of the custom element (e.g. `clock-controls`) is added to the
[custom element registry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) so the browser can render the `<clock-controls>` element properly.


## Create a digital clock component ##

### The problem

In this section, we will:

- Create a `<digital-clock>` custom element.
- Pass the `time` from the `<clock-controls>` element to the `<digital-clock>` element.
- Write out the time in the format: `hh:mm:ss`.

### What you need to know

- Use [can-stache-element] to create a custom element.
  - [can-stache-element/static.view] is used as the HTML content within the custom
    element; by default, it is a [can-stache] template (hint: `"Your {{content}}"`).
  - [can-stache-element/static.props] provides values to the `view` like:
    ```js
    class MyElement extends StacheElemet {
      static view = `...`;
      static props = {
        property: Type, // hint -> time: Date
      };
      method() {
        return // ...
      }
    }
    ```
- [can-stache] can insert the return value from function calls into the page like:
  ```
  {{method()}}
  ```
  These methods are often functions on the element.
- [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
  has methods that give you details about that date and time:
  - [date.getSeconds()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getSeconds)
  - [date.getMinutes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMinutes)
  - [date.getHours()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours)
- Use [padStart](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)
  to convert a string like `"1"` into `"01"` like `.padStart(2, "00")`.
- Use [https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define customElements.define] to
  specify the name of the custom element (hint: `"digital-clock"`).


### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-digital-clock.js
@highlight 3-24,only

## Draw a circle in the analog clock component ##

### The problem

In this section, we will:

- Create a `<analog-clock>` custom element.
- Draw a circle inside the `<canvas/>` element within the `<analog-clock>`.

### What you need to know

- Use another [can-stache-element custom element] to define a `<analog-clock>` component.
- Define the component’s [can-stache-element/static.view] to write out a `<canvas>`
  element (hint: `<canvas id="analog" width="255" height="255"></canvas>`).
- An element [can-stache-element/lifecycle-hooks.connected connected hook] will be called when the component is inserted into the page.
- [Pass an element reference to the scope](https://canjs.com/doc/can-stache-bindings.html#Passanelementtothescope), like the following:
```html
<div this:to="key">...</div>
```
- To get the [canvas rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
  from a `<canvas>` element, use `canvas = canvasElement.getContext("2d")`.
- To draw a line (or curve), you generally set different style properties of the rendering context like:
  ```js
  this.canvas.lineWidth = 4.0
  this.canvas.strokeStyle = "#567"
  ```
  Then you start path with:
  ```js
  this.canvas.beginPath()
  ```
  Then make [arcs](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) and [lines](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
  for your path like:
  ```js
  this.canvas.arc(125, 125, 125, 0, Math.PI * 2, true)
  ```
  Then close the path like:
  ```js
  this.canvas.closePath()
  ```
  Finally, use [stroke](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke)
  to actually draw the line:
  ```js
  this.canvas.stroke();
  ```
- The following variables will be useful for coordinates:
  ```js
  this.diameter = 255;
  this.radius = this.diameter/2 - 5;
  this.center = this.diameter/2;
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-circle.js
@highlight 3-32,only

## Draw the second hand ##

### The problem

In this section, we will:

- Draw the second hand needle when the `time` value changes
  on the element.
- The needle should be `2` pixels wide, red (`#FF0000`), and 85% of the
  clock’s radius.

### What you need to know

- [can-event-queue/map/map.listenTo this.listenTo] can be used in a component’s
  [can-stache-element/lifecycle-hooks.connected connected hook] to listen to changes in the element `props` like:
  ```js
  import { StacheElement } from "//unpkg.com/can@6/core.mjs";

  class AnalogClock extends StacheElement {
    static props = {
      time: Date
    },
    connected() {
      this.listenTo("time", (event, time) => {
        // ...
      });
    }
  }
  ```

- Use [canvas.moveTo(x1,y1)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext/moveTo)
  and [canvas.lineTo(x2,y2)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
  to draw a line from one position to another.
- To get the needle point to move around a “unit” circle, you’d want to make the
  following calls given the number of seconds:
  ```
  0s  -> .lineTo(.5,0)
  15s -> .lineTo(1,.5)
  30s -> .lineTo(.5,1)
  45s -> .lineTo(0,.5)
  ```

- Our friends [Math.sin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin)
  and [Math.cos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cos)
  can help here… but they take radians.

  ![Sine and Cosine Graph](https://www.mathsisfun.com/algebra/images/sine-cosine-graph.gif)

  Use the following `base60ToRadians` method to convert a number from 0–60 to one between 0 and 2π:

  ```js
  // 60 = 2π
  const base60ToRadians = (base60Number) =>
    2 * Math.PI * base60Number / 60;
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-second-hand.js
@highlight 3-4,34-61,only

## Clear the canvas and create a `drawNeedle` method ##
### The problem

In this section, we will:

- Clear the canvas before drawing the circle and needle.
- Refactor the needle drawing code into a `drawNeedle(length, base60Distance, styles)` method where:
  - `length` is the length in pixels of the needle.
  - `base60Distance` is a number between 0–60 representing how far around the clock the
    needle should be drawn.
  - `styles` is an object of canvas context style properties and values like:
    ```js
    {
      lineWidth: 2.0,
      strokeStyle: "#FF0000",
      lineCap: "round"
    }
    ```

### What you need to know

- Move the __draw circle__ into the `this.listenTo("time", /* ... */)` event handler so it is redrawn
  when the time changes.
- Use [clearRect(x, y, width, height)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect) to clear
  the canvas.
- Add a function inside the [can-stache-element/lifecycle-methods.connected connected hook] that will have access to all the variables created above it like:
  ```js
  class AnalogClock extends StacheElement {
    static view = "...";
    static props = {};
    drawNeedle(length, base60Distance, styles, center) {
      // ...
    }
  }
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-refactor.js
@highlight 21-30,50-59,only


## Draw the minute and hour hand ##
### The problem

In this section, we will:

- Draw the minute hand `3` pixels wide, dark gray (`#423`), and 65% of the
  clock’s radius.
- Draw the minute hand `4` pixels wide, dark blue (`#42F`), and 45% of the
  clock’s radius.

### What you need to know

You know everything at this point.  You got this!

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-min-hour-hands.js
@highlight 61-84,only

## Result

When finished, you should see something like the following CodePen:

<p class="codepen" data-height="495" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="LYPZjbO" style="height: 495px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Canvas Clock (Simple) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/LYPZjbO/">
  Canvas Clock (Simple) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
