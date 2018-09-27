@page guides/recipes/canvas-clock Canvas Clock (Simple)
@parent guides/recipes

@description This guide walks you through building a clock with the
[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).


@body

In this guide you will learn how to:

- Create custom elements for digital and analog clocks
- Use the `canvas` API to draw the hands of the analog clock

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/jeligek/3/embed?output">
  CanJS Canvas Clock on jsbin.com
</a>

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works (if it’s not obvious).
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

> Click the **JS Bin** button.  The JS Bin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="https://jsbin.com/jeligek/1/embed?html,css,js,output">
  CanJS Canvas Clock on jsbin.com
</a>

This JS Bin has initial prototype HTML, CSS, and JS to bootstrap a basic CanJS application.




### What you need to know

There’s nothing to do in this step. The JS Bin is already setup with:

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

[can-component] is used to define the behavior of the  `<clock-controls>`
element. Components are configured with three main properties that define the
behavior of the element:

- [can-component.prototype.tag] is used to specify the name of the custom element
  (e.g. `"clock-controls"`).
- [can-component.prototype.view] is used as the HTML content within the custom
  element; by default, it is a [can-stache] template.
- [can-component.prototype.ViewModel] provides methods and values to the `view`;
  by default, the `ViewModel` is a [can-define/map/map].

Here, a `time` property is defined using the [can-define.types.value value behavior].
This uses `resolve` to set the value of `time` to be an instance of a
[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
and then update the value every second to be a new `Date`.

## Create a digital clock component ##

### The problem

In this section, we will:

- Create a `<digital-clock>` custom element.
- Pass the `time` from the `<clock-controls>` element to the `<digital-clock>` element.
- Write out the time in the format: `hh:mm:ss`.

### What you need to know

- Use [can-component] to create a custom element.
  - [can-component.prototype.tag] is used to specify the name of the custom
    element (hint: `"digital-clock"`).
  - [can-component.prototype.view] is used as the HTML content within the custom
    element; by default, it is a [can-stache] template (hint: `"Your {{content}}"`).
  - [can-component.prototype.ViewModel] provides methods and values to the `view`;
    by default, the `ViewModel` is a [can-define/map/map] that defines properties
    and functions like:
    ```js
    ViewModel: {
      property: Type, // hint -> time: Date
      method() {
        return // ...
      }
    }
    ```
- [can-stache] can insert the return value from function calls into the page like:
  ```
  {{method()}}
  ```
  These methods are often functions on the `ViewModel`.
- [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
  has methods that give you details about that date and time:
  - [date.getSeconds()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getSeconds)
  - [date.getMinutes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMinutes)
  - [date.getHours()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours)
- Use [padStart](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)
  to convert a string like `"1"` into `"01"` like `.padStart(2, "00")`.


### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-digital-clock.js
@highlight 1-17,only

## Draw a circle in the analog clock component ##

### The problem

In this section, we will:

- Create a `<analog-clock>` custom element.
- Draw a circle inside the `<canvas/>` element within the `<analog-clock>`.

### What you need to know

- Use another [can-component] to define a `<analog-clock>` component.
- Define the component’s [can-component.prototype.view] to write out a `<canvas>`
  element (hint: `<canvas id="analog" width="255" height="255"></canvas>`).
- A component’s [can-component.prototype.ViewModel] can be defined as an object
  which will be passed to [can-define/map/map.extend DefineMap.extend]
  (hint:`ViewModel: {}`).
- A viewModel’s [can-component/connectedCallback] will be called when the
  component is inserted into the page; it will pass the `element` like:
  ```js
  can.Component.extend({
    tag: "my-element",
    view: "<h1>first child</h1>",
    ViewModel: {
      connectedCallback(element) {
        element.firstChild //-> <h1>
      }
    }
  });
  ```
- To get the [canvas rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
  from a `<canvas>` element, use `canvas = canvasElement.getContext("2d")`.
- To draw a line (or curve), you generally set different style properties of the rendering context like:
  ```js
  canvas.lineWidth = 4.0
  canvas.strokeStyle = "#567"
  ```
  Then you start path with:
  ```js
  canvas.beginPath()
  ```
  Then make [arcs](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) and [lines](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo)
  for your path like:
  ```js
  canvas.arc(125, 125, 125, 0, Math.PI * 2, true)
  ```
  Then close the path like:
  ```js
  canvas.closePath()
  ```
  Finally, use [stroke](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke)
  to actually draw the line:
  ```js
  canvas.stroke();
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
@highlight 1-19,only

## Draw the second hand ##

### The problem

In this section, we will:

- Draw the second hand needle when the `time` value changes
  on the `viewModel`.
- The needle should be `2` pixels wide, red (`#FF0000`), and 85% of the
  clock’s radius.

### What you need to know

- [can-event-queue/map/map.listenTo this.listenTo] can be used in a component’s
  [can-component/connectedCallback] to listen to changes in the `ViewModel` like:
  ```js
  can.Component.extend({
    tag: "analog-clock",
    // ...
    ViewModel: {
      connectedCallback() {
        this.listenTo("time", (event, time) => {
          // ...
        });
      }
    }
  });
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
@highlight 1-3,22-48,only

## Clear the canvas and create a `drawNeedle` function ##
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

- Move the __draw circle__ into the `this.listenTo("time", ...)` event handler so it is redrawn
  when the time changes.
- Use [clearRect(x, y, width, height)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect) to clear
  the canvas.
- Add a function inside the [can-component/connectedCallback] that will have
  access to all the variables created above it like:
  ```js
  ViewModel: {
    connectedCallback() {
      const canvas = element.firstChild.getContext("2d");
      const diameter = 255;
      const radius = diameter/2 - 5;
      const center = diameter/2;

      const drawNeedle = (length, base60Distance, styles) => {
        canvas // -> the canvas element
        // ...
      };
    }
  }
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-refactor.js
@highlight 15-24,27,29-35,37-46,only


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
@highlight 48-69,only

## Result

When finished, you should see something like the following JS Bin:

<a class="jsbin-embed" href="https://jsbin.com/jeligek/3/embed?output">
  CanJS Canvas Clock on jsbin.com
</a>

<script src="https://static.jsbin.com/js/embed.min.js?4.1.4"></script>
