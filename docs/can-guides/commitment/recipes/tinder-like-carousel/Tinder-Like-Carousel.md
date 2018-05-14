@page guides/recipes/tinder-like-carousel (Simple)
@parent guides/recipes

@description This guide walks you through building a Tinder like carousel.  


@body

In this guide you will learn how to:

- Create custom elements for an image gallary
- Use the

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/zefajic/14/embed?output&height=400px">JS Bin on jsbin.com</a>

The following sections are broken down the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it's not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS Bin__:

> Click the `JS Bin` button.  The JSBin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="https://jsbin.com/zomefef/7/embed?html,js,output">CanJS Bus Demo on jsbin.com</a>

This JS Bin has initial prototype HTML, CSS, and JS to bootstrap a basic CanJS application.




### What you need to know

There's nothing to do in this step. The JSBin is already setup with:

- A _basic_ CanJS setup.
- A `<clock-controls>` custom element that:
  - updates a `time` property every second
  - passes the `time` value to a `<digital-clock>` and
    `<analog-clock>` component that will be defined in future sections.

Please read on to understand the setup.

__A Basic CanJS Setup__

A basic CanJS setup is usually a custom element.  In the `HTML`
tab, you'll find a `<clock-controls/>` element.  The following code in the `JS` tab
defines the behavior of the `<clock-controls/>` element:

```js
const ClockControlsVM = can.DefineMap.extend("ClockControlsVM",{
  time: {
    value({ resolve }) {
      const intervalID = setInterval(() => {
        resolve( new Date() );
      },1000);

      resolve( new Date() );

      return () => clearInterval(intervalID);
    }
  }
});

can.Component.extend({
  tag: "clock-controls",
  ViewModel: ClockControlsVM,
  view: can.stache(`
    <p>{{time}}</p>
    <digital-clock time:from="time"/>
    <analog-clock time:from="time"/>
  `)
});
```

You'll notice the behavior is defined in two parts.  First is the `ClockControlsVM` type.  This
is an observable constructor function created with [can-define/map/map].  Here, a `time`
property is defined using the [can-define.types.value value behavior]. This uses `resolve` to set
the value of `time` to be an instance of a `Date` and then update the value every second to be a
new `Date`.

One could create an instance of `ClockControlsVM` and explore it's `time` property as follows:

```js
const vm = new ClockControlsVM();
vm.time //-> Wed Nov 01 2017 14:31:25 GMT-0500 (CDT)
```

The next part uses [can-component] to define the behavior of the  `<clock-controls>`
element. [can-component] has configured properties that define the behavior of the element.

- `tag` is used to specify the name of the custom element. (ex: `"clock-controls"`)
- `view` is used as the HTML content within the custom element.  It is usually a [can-stache]
  template.
- `ViewModel` provides methods and values to the `view`.  `ViewModel`s are usually a typeof
[can-define/map/map].

## Create a digital clock component ##

### The problem

In this section, we will:

- Create a `<digital-clock>` custom element.
- Pass the `time` from the `<clock-controls>` element to the `<digital-clock>` element.
- Write out the time in the format: `hh:mm:ss`.

### What you need to know

- Use [can-component] to create a custom element.
  - `tag` is used to specify the name of the custom element. (hint: `"digital-clock"`)
  - `view` is used as the HTML content within the custom element.  It is usually a [can-stache]
    template.  (hint: `can.stache("Your {{content}}")`).
  - `ViewModel` provides methods and values to the `view`.  `ViewModel`s are usually a typeof
    [can-define/map/map].
- [can-stache] can insert the return value from function calls into the page like:
  ```
  {{method()}}
  ```
  These methods are often functions on the `ViewModel`.
- Use [can-define/map/map] to define properties and methods like:
  ```js
  var DigitalClockVM = can.DefineMap.extend({
    property: Type, //hint -> time: Date
    method() {
        return ...;
    }
  })
  ```
- The [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) has
  methods that give you details about that date and time:
  - `date.getSeconds()`
  - `date.getMinutes()`
  - `date.getHours()`
- Use [padStart](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)
  to convert a string like `"1"` into `"01"` like `.padStart(2,"00")`.


### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-digital-clock.js
@highlight 1-19,only

## Draw a circle in the analog clock component ##

### The problem

In this section, we will:

- Create a `<analog-clock>` custom element.
- Draw a circle inside the `<canvas/>` element within the `<analog-clock>`.

### What you need to know

- Use another [can-component] to define a `<analog-clock>` component.
- Define the component's `view` to write out a `<canvas>` element. (hint: `<canvas id="analog"  width="255" height="255"></canvas>`).
- A component's viewModel can be defined as an object which will be passed to [can-define/map/map.extend DefineMap.extend]. (hint:`ViewModel: {}`)
- A viewModel's [can-component/connectedCallback] will be called when the component is inserted into the page and will be passed the `element` like:
  ```js
  can.Component.extend({
    tag: "my-element",
    view: can.stache(`<h1>first child</h1>`),
    ViewModel: {
      connectedCallback(element) {
        element.firstChild //-> <h1>
      }
    }
  });
  ```
- To get the [canvas rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
  from a `<canvas>` element use `canvas = canvasElement.getContext('2d')`.
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
  canvas.arc(125,125,125,0,Math.PI * 2,true)
  ```
  Then close the path like:
  ```js
  canvas.closePath()
  ```
  Finally, use `stroke` to actually draw the line:
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
  clock's radius.

### What you need to know



### The solution

Update the __JavaScript__ tab to:

@sourceref
@highlight

## Clear the canvas and create a `drawNeedle` function ##
### The problem



### What you need to know



### The solution

Update the __JavaScript__ tab to:

@sourceref
@highlight


## Draw the minute and hour hand ##
### The problem

In this section, we will:

-
-

### What you need to know

You know everything at this point.  You got this!

### The solution

Update the __JavaScript__ tab to:

@sourceref ./.js
@highlight 48-69,only



<script src="//static.jsbin.com/js/embed.min.js?4.0.4"></script>
