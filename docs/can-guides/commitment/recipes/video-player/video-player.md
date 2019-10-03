@page guides/recipes/video-player Video Player
@parent guides/recipes/beginner

@description This beginner guide walks you through building custom video
controls around a video element.


@body


In this guide, you will learn how to create a custom video player using the `<video>` element and [CanJS](http://canjs.com). The
custom video player will:

- Have custom play and pause buttons.
- Show the current time and duration of the video.
- Have a `<input type="range">` slider that can adjust the position of the video.


The final player looks like:

<p class="codepen" data-height="366" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="WNeJpeZ" style="height: 366px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 Video Player - Final">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/WNeJpeZ/">
  CanJS 6.0 Video Player - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Browser or CanJS APIs that are useful for solving the problem.
- __The solution__ — The solution to the problem.


## Setup ##

__START THIS TUTORIAL BY Forking THE FOLLOWING CodePen__:

> Click the `Edit in CodePen` button.  The CodePen will open in a new window. Click the `Fork` button.

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="jONeZQK" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 Video Player - Start">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/jONeZQK/">
  CanJS 6.0 Video Player - Start</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen:

- Creates a `<video>` element that loads a video. _Right click and select “Show controls” to see the video’s controls_.
- Loads CanJS’s custom element library: [can-stache-element StacheElement].



### The problem

In this section, we will:

- Create a custom `<video-player>` element that takes a `src` attribute and creates a `<video>` element
  within itself. We should be able to create the video like:

  ```html
  <video-player src:raw="http://bit.ly/can-tom-n-jerry">
  </video-player>
  ```  
- The embedded `<video>` element should have the native controls enabled.

When complete, the result will look exactly the same as the player when you started.  The
only difference is that we will be using a custom `<video-player>` element in the `HTML`
tab instead of the native `<video>` element.



### What you need to know

To set up a basic CanJS application (or widget), you define a custom element in JavaScript and
use the custom element in your page’s `HTML`.

To define a custom element, extend [can-stache-element StacheElement] and [register a tag](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)
that matches the name of your custom element.  For example:

```js
class VideoPlayer extends StacheElement {
}
customElements.define("video-player", VideoPlayer);
```

Then you can use this tag in your HTML page:

```html
<video-player></video-player>
```

But this doesn’t do anything ... yet.  Components add their own HTML through their [can-stache-element/static.view] property:

```js
class VideoPlayer extends StacheElement {
  static view = `<h2>I am a player!</h2>`;
}
customElements.define("video-player", VideoPlayer);
```

A component’s [can-stache-element/static.view] is rendered with its [can-stache-element/static.props]. For example, we can make a `<video>` display `"http://bit.ly/can-tom-n-jerry"` by defining a `src` property and using it in the view like:

```js
class VideoPlayer extends StacheElement {
  static view = `
    <video>
      <source src="{{ this.src }}">
    </video>
  `;
  static props = {
    src: {
      type: String,
      default: "http://bit.ly/can-tom-n-jerry"
    }
  };
}
customElements.define("video-player", VideoPlayer);
```

But we want the `<video-player>` to take a `src` attribute value itself and use that for the
`<source>`’s `src`. For example, if
we wanted the video to play `"http://dl3.webmfiles.org/big-buck-bunny_trailer.webm"` instead of `"http://bit.ly/can-tom-n-jerry"`, we would:

1. Update `<video-player>` to pass `"http://dl3.webmfiles.org/big-buck-bunny_trailer.webm"` with [can-stache-bindings.raw]:
  ```html
  <video-player src:raw="http://dl3.webmfiles.org/big-buck-bunny_trailer.webm"/>
  ```
2. Update the `VideoPlayer` element to define a `src` property like:
  ```js
  class VideoPlayer extends StacheElement {
    static view = `
      <video>
        <source src="{{ this.src }}">
      </video>
    `;
    static props = {
      src: String
    };
   }
   customElements.define("video-player", VideoPlayer);
   ```
   @highlight 4

Finally, to have a `<video>` element show the _native_ controls, add a `controls`
attribute like:

```html
<video controls>
```

### The solution

Update the __JS__ tab to:

@sourceref ./1-setup.js
@highlight 3-15

Update the __HTML__ to:

@sourceref ./1-setup.html
@highlight 1



## Make play / pause button change as video is played and paused ##

### The problem

When the video is played or paused using the native controls, we want to change the content of a `<button>`
to say _“Play”_ or _“Pause”_.

When the video is played, the button should say _“Pause”_.
When the video is paused, the button should say _“Play”_.

We want the button to be within a `<div>` after the video element like:

```html
</video>
<div>
  <button>Play</button>
</div>
```


### What you need to know

- To change the HTML content of the page, use [can-stache.helpers.if] and [can-stache.helpers.else] like:
  ```html
  <button>{{# if(playing) }} Pause {{ else }} Play {{/ if }}</button>
  ````
- The [can-stache-element/static.view] responds to values in the [can-stache-element/static.props] object.  To create a `boolean` value, add it to the [can-stache-element/static.props] object like:
  ```js
  class VideoPlayer extends StacheElement {
    static props = {
      // ...
      playing: Boolean
    };
  }
  ```
- Methods can be used to change values in [can-stache-element/static.props].  The following might create methods that change the `playing` value:

  ```js
  class VideoPlayer extends StacheElement {
    // ...
    play() {
      this.playing = true;
    }
    pause() {
      this.playing = false;
    }
  }
  ```
- You can listen to events on the DOM with [can-stache-bindings.event].  For example, the following might
  listen to a click on a `<div>` and call `doSomething()`:

  ```html
  <div on:click="doSomething()">
  ```

  `<video>` elements have a variety of useful [events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement), including [play](https://developer.mozilla.org/en-US/docs/Web/Events/play) and
  [pause](https://developer.mozilla.org/en-US/docs/Web/Events/pause) events that are emitted when the video is played or paused.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-play-reflects.js
@highlight 7-8,12-16,21,24-30


## Make clicking the play/pause button play or pause the video ##

### The problem

When the _play/pause_ `<button>` we created in the previous section is clicked, we want to
either play or pause the video.

### What you need to know

The `<video>` player has state, such as if the video is `playing`.  When the _play/pause_ 
button is clicked, we want to update the state of the element `props` and have the element `props`
update the state of the video player as a side effect.

What this means is that instead of something like:

```js
togglePlay() {
  if (videoElement.paused) {
    videoElement.play()
  } else {
    videoElement.pause()
  }
}
```

We update the state like:

```js
togglePlay() {
  this.playing = !this.playing;
}
```

And listen to when `playing` changes and update the `video` element like:

```js
element.listenTo("playing", function({ value }) {
  if (value) {
    videoElement.play()
  } else {
    videoElement.pause()
  }
})
```


This means that you need to:

1. Listen to when the `<button>` is clicked and call a method that updates the `playing` state.
2. Listen to when the `playing` state changes and update the state of the `<video>` element.

You already know everything you need to know for step __#1__.  (Have the button call a `togglePlay` method with `on:click="togglePlay()"` and make the `togglePlay()` method toggle the state of the `playing` property.)

For step __#2__, you need to use the [can-stache-element/lifecycle-hooks.connected] lifecycle hook. This
hook is a good place to do side-effects. Its use looks like this:

```js
class MyComponent extends StacheElement {
  static view = `...`;
  static props = { /* ... */ };
  connected() {
    // `this` points to the element
    // perform mischief
  }
}
```

The `connected` hook gets called once the component’s `element` is in the page. You can
use [can-event-queue/map/map.listenTo] to listen to changes in the element's properties
and perform side-effects. The following listens to when `playing` changes:

```js
class VideoPlayer extends StacheElement {
  static view = `...`;
  static props = { /* ... */ };
  connected() {
    this.listenTo("playing", ({ value }) => {
    });
  }
}
```

Use `querySelector` to get the `<video>` element from the `<video-player>` like:

```js
element.querySelector("video")
```

`<video>` elements have a [.play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) and [.pause()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause) methods that can start and stop a video.


### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-play-mutates.js
@highlight 13,24-32,42-44


## Show current time and duration ##

### The problem

Show the current time and duration of the video element.  The time and duration should be
formatted like: `mm:SS`. They should be presented within two spans like:

```js
</button>
<span>1:22</span>
<span>2:45</span>
```

### What you need to know

1. Methods can be used to format values in [can-stache]. For example, you can uppercase values like  this:

   ```html
   <span>{{ upper(value) }}</span>
   ```

   With a method like:

  ```js
  class MyComponent extends StacheElement {
    static view = `...`;
    static props = { /* ... */ };
    upper(value) {
      return value.toString().toUpperCase();
    }
   }
   ```

   The following can be used to format time:

  ```js
  formatTime(time) {
    if (time === null || time === undefined) {
      return "--";
    }
    const minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
  }
  ```

2. Time is given as a number. Use the following to create a number property on
   the element:

  ```js
  class VideoPlayer {
    static view = `...`;
    static props = {
      duration: Number,
      currentTime: Number
    };
  }
  ```

3. `<video>` elements emit a [loadmetadata event](https://developer.mozilla.org/en-US/docs/Web/Events/loadedmetadata) when they know how long
   the video is. They also emit a [timeupdate event](https://developer.mozilla.org/en-US/docs/Web/Events/timeupdate) when the video’s current play position
   changes.
   - `videoElement.duration` reads the duration of a video.
   - `videoElement.currentTime` reads the current play position of a video.

4. You can get the element in an stache `on:event` binding with [can-stache/keys/scope#scope_element scope.element] like:

   ```html
   <video on:timeupdate="updateTimes(scope.element)"></video>
   ```



### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-play-mutates.js
@highlight 9,10,18,19,26,27,40-55


## Make range show position slider at current time ##

### The problem

Create a `<input type="range">` element that changes its position as the video
playing position changes.

The `<input type="range">` element should be after the `<button>` and before the
`currentTime` span like:

```html
</button>
<input type="range">
<span>{{ formatTime(currentTime) }}</span> /
```
@highlight 2

### What you need to know

- The range input can have an initial value, max value, and step size
  specified like:

  ```html
  <input type="range" value="0" max="1" step="any">
  ```

- The range will have values from 0 to 1.  We will need to translate the currentTime to
  a number between 0 and 1. We can do this with a [can-observable-object/define/get computed getter property] like:

  ```js
  class SomeElement extends StacheElement {
    static view = `...`;
    static props = {
      // ...
      get percentComplete() {
        return this.currentTime / this.duration;
      }
    };
  }
  ```

- Use [can-stache-bindings.toChild] to update a value from a custom element property like:
  ```html
  <input value:from="percentComplete">
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-play-mutates.js
@highlight 18,30-32


## Make sliding the range update the current time ##

### The problem

In this section we will:

- Remove the native controls from the video player.  We don’t need them anymore!
- Make it so when a user moves the range slider, the video position updates.

### What you need to know

Similar to when we [made the play/pause button play or pause the video](#Makeclickingtheplay_pausebuttonplayorpausethevideo), we will want to update the
`currentTime` property and then listen to when `currentTime` changes and update the  `<video>`
element’s `currentTime` as a _side-effect_.

This time, we need to translate the sliders values between 0 and 1 to `currentTime`
values. We can do this by creating a `percentComplete` [can-observable-object/define/set setter] that updates `currentTime` like:

```js
class VideoPlayer extends StacheElement {
  static view = `...`;
  static props = {
    // ...
    get percentComplete() {
      return this.currentTime / this.duration;
    },
    set percentComplete(newVal) {
      this.currentTime = newVal * this.duration;
    },
    // ...
  };
}
```

Use [can-stache-bindings.twoWay] to two-way bind a value to a custom element property:

```html
<input value:bind="someProperty">
```


### The solution  

Update the __JavaScript__ tab to:

@sourceref ./6-play-mutates.js
@highlight 5,17,36-38,42-47

## Result

When finished, you should see something like the following JS Bin:

<p class="codepen" data-height="366" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="WNeJpeZ" style="height: 366px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6.0 Video Player - Final">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/WNeJpeZ/">
  CanJS 6.0 Video Player - Final</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
