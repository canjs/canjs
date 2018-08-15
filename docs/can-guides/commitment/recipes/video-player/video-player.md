@page guides/recipes/video-player Video Player (Simple)
@parent guides/recipes

@description This guide walks you through building custom video
controls around a video element.


@body


In this guide, you will learn how to create a custom video player using the `<video>` element and [CanJS](http://canjs.com). The
custom video player will:

- Have custom play and pause buttons.
- Show the current time and duration of the video.
- Have a `<input type="range">` slider that can adjust the position of the video.


The final player looks like:

<p data-height="350" data-theme-id="dark" data-slug-hash="qyRqMx" data-default-tab="js,result" data-user="justinbmeyer" data-embed-version="2" data-pen-title="CanJS 5.0 Video Player - Final" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/qyRqMx/">CanJS 5.0 Video Player - Final</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>


The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Browser or CanJS APIs that are useful for solving the problem.
- __The solution__ — The solution to the problem.


## Setup ##

__START THIS TUTORIAL BY Forking THE FOLLOWING CodePen__:

> Click the `Edit in CodePen` button.  The CodePen will open in a new window. Click the `Fork` button.

<p data-height="320" data-theme-id="dark" data-slug-hash="LBxbam" data-default-tab="js,result" data-user="justinbmeyer" data-embed-version="2" data-pen-title="CanJS 5.0 Video Player - Start" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/LBxbam/">CanJS 5.0 Video Player - Start</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>

This CodePen:

- Creates a `<video>` element that loads a video. _Right click and select “Show controls” to see the video’s controls_.
- Loads CanJS’s custom element library: [can-component Component].



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

To define a custom element, extend [can-component Component] with a [can-component.prototype.tag]
that matches the name of your custom element.  For example:

```js
Component.extend({
  tag: "video-player"
})
```

Then you can use this tag in your HTML page:

```html
<video-player></video-player>
```

But this doesn’t do anything ... yet.  Components add their own HTML through their [can-component.prototype.view]
property:

```js
Component.extend({
  tag: "video-player",
  view: `<h2>I am a player!</h2>`
});
```

A component’s [can-component.prototype.view] is rendered with its [can-component.prototype.ViewModel]. For example, we can make a `<video>` display `"http://bit.ly/can-tom-n-jerry"` by defining a `src` property on the `ViewModel` and using it in the [can-component.prototype.view] like:

```js
Component.extend({
  tag: "video-player",
  view: `
    <video>
      <source src="{{src}}"/>
    </video>
  `,
  ViewModel: {
    src: {type: "string", default: "http://bit.ly/can-tom-n-jerry"}
  }
});
```

But we want the `<video-player>` to take a `src` attribute value itself and use that for the
`<source>`’s `src`. For example, if
we wanted the video to play `"http://dl3.webmfiles.org/big-buck-bunny_trailer.webm"` instead of `"http://bit.ly/can-tom-n-jerry"`, we would:

1. Update `<video-player>` to pass `"http://dl3.webmfiles.org/big-buck-bunny_trailer.webm"` with [can-stache-bindings.raw]:
   ```html
   <video-player src:raw="http://dl3.webmfiles.org/big-buck-bunny_trailer.webm"/>
   ```
2. Update the [can-component.prototype.ViewModel] to define a `src` property like:
   ```js
   Component.extend({
     tag: "video-player",
     view: `
       <video>
         <source src="{{src}}"/>
       </video>
     `,
     ViewModel: {
       src: "string"
     }
   });
   ```
   @highlight 5

Finally, to have a `<video>` element show the _native_ controls, add a `controls`
attribute like:

```html
<video controls>
```

### The solution

Update the __JS__ tab to:

@sourceref ./1-setup.js
@highlight 3-13

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
  <button>{{#if(playing)}} Pause {{else}} Play {{/if}}</button>
  ````
- The [can-component.prototype.view] responds to values in the [can-component.prototype.ViewModel].  To create a `boolean` value in the [can-component.prototype.ViewModel] do:
  ```js
  ViewModel: {
    // ...
    playing: "boolean",
  }
  ```
- Methods can be used to change the [can-component.prototype.ViewModel].  The following might create methods that change the `playing` value:

  ```js
  ViewModel: {
    // ...
    play() {
      this.playing = true;
    },
    pause() {
      this.playing = false;
    },
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
@highlight 7-8,11-15,19,21-25


## Make clicking the play/pause button play or pause the video ##

### The problem

When the _play/pause_ `<button>` we created in the previous section is clicked, we want to
either play or pause the video.

### What you need to know

CanJS prefers to manage the state of your application in [can-component.prototype.ViewModel]. The `<video>` player has state, such as
if the video is `playing`.  When the _play/pause_ button is clicked, we want to update the state
of the [can-component.prototype.ViewModel] and have the [can-component.prototype.ViewModel] update the state of the video player as a side effect.

What this means is that instead of something like:

```js
togglePlay() {
  if ( videoElement.paused ) {
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
viewModel.listenTo("playing", function(event, isPlaying) {
  if ( isPlaying ) {
    videoElement.play()
  } else {
    videoElement.pause()
  }
})
```


This means that you need to:

1. Listen to when the `<button>` is clicked and call a ViewModel method that updates the `playing` state.
2. Listen to when the `playing` state changes and update the state of the `<video>` element.

You already know everything you need to know for step __#1__.  (Have the button call a `togglePlay` method with `on:click="togglePlay()"` and make the `togglePlay()` method toggle the state of the `playing` property.)

For step __#2__, you need to use the [can-component/connectedCallback] lifecycle hook. This
hook gives you access to the component’s element and is a good place to do side-effects. Its use looks
like this:

```js
ViewModel: {
  // ...
  connectedCallback(element) {
    // perform mischief
  }
}
```

`connectedCallback` gets called once the component’s `element` is in the page. You can use
[can-event-queue/map/map.listenTo] to listen to changes in the [can-component.prototype.ViewModel]’s properties and
perform side-effects. The following listens to when `playing` changes:

```js
ViewModel: {
  // ...
  connectedCallback(element) {
    this.listenTo("playing", function(event, isPlaying) {

    })
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
@highlight 12,27-30,31-39


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
   <span>{{upper(value)}}</span>
   ```

   With a method like:

   ```js
   ViewModel: {
     // ...
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
   the [can-component.prototype.ViewModel]:

   ```js
   ViewModel: {
     // ...
     duration: "number",
     currentTime: "number"
   }
   ```

3. `<video>` elements emit a [loadmetadata event](https://developer.mozilla.org/en-US/docs/Web/Events/loadedmetadata) when they know how long
   the video is. They also emit a [timeupdate event](https://developer.mozilla.org/en-US/docs/Web/Events/timeupdate) when the video’s current play position
   changes.
   - `videoElement.duration` reads the duration of a video.
   - `videoElement.currentTime` reads the current play position of a video.

4. You can get the element in an stache `on:event` binding with [can-stache/keys/scope#scope_element scope.element] like:

   ```html
   <video on:timeupdate="updateTimes(scope.element)"/>
   ```



### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-play-mutates.js
@highlight 9,10,17,18,24-41


## Make range show position slider at current time ##

### The problem

Create a `<input type="range"/>` element that changes its position as
the video playing position changes.

The `<input type="range"/>` element should be after the `<button>` and before the
`currentTime` span like:

```html
</button>
<input type="range"/>
<span>{{formatTime(currentTime)}}</span> /
```
@highlight 2

### What you need to know

- The range input can have an initial value, max value, and step size
  specified like:

  ```html
  <input type="range" value="0" max="1" step="any"/>
  ```

- The range will have values from 0 to 1.  We will need to translate the currentTime to
  a number between 0 and 1. We can do this with a [can-define.types.get computed getter property] like:

  ```js
  ViewModel: {
    // ...
    get percentComplete() {
      return this.currentTime / this.duration;
    },
  }
  ```

- Use [can-stache-bindings.toChild] to update a value from a [can-component.prototype.ViewModel] property like:
  ```html
  <input value:from="percentComplete"/>
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-play-mutates.js
@highlight 17-18,29-31


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
values. We can do this by creating a `percentComplete` [can-define.types.set setter] that updates `currentTime` like:

```js
ViewModel: {
  // ...
  get percentComplete() {
    return this.currentTime / this.duration;
  },
  set percentComplete(newVal) {
    this.currentTime = newVal * this.duration;
  },
  // ...
}
```

Use [can-stache-bindings.twoWay] to two-way bind a value to a [can-component.prototype.ViewModel] property:

```html
<input value:bind="someViewModelProperty"/>
```


### The solution  

Update the __JavaScript__ tab to:

@sourceref ./6-play-mutates.js
@highlight 6,18,32-34,69-74

## Result

When finished, you should see something like the following JS Bin:

<p data-height="360" data-theme-id="dark" data-slug-hash="qyRqMx" data-default-tab="js,result" data-user="justinbmeyer" data-embed-version="2" data-pen-title="CanJS 5.0 Video Player - Final" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/qyRqMx/">CanJS 5.0 Video Player - Final</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
