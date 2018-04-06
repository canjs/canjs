@page guides/recipes/video-player Video Player (Simple)
@parent guides/recipes

@description This guide walks you through building custom video
controls around a video element.


@body




In this guide, you will learn how to create a custom video player using the `<video>` element. The
custom video player will:

- Have custom play / pause buttons.
- Show the current time and duration of the video.
- Have a `<input type='range'>` slider that can adjust the position of the video.


The final widget looks like:


<a class="jsbin-embed" href="http://jsbin.com/gejokos/3/embed?html,js,output">JS Bin on jsbin.com</a>

The following sections are broken down the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it’s not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

> Click the `JS Bin` button.  The JS Bin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="http://jsbin.com/gipisuw/1/edit?html,css,output">CanJS Video Player on jsbin.com</a>

This JS Bin:

- Creates a `<video>` element that loads a video. _Right click and select "Show controls" to see the video's controls_.
- Loads CanJS.


### The problem

- Create a custom `<video-player>` element that takes a `src` attribute and creates a `<video>` element
  within itself. We should be able to create the video like:

  ```html
  <video-player src:raw="https://canjs.com/docs/can-guides/commitment/recipes/text-editor/1-setup.webm">
  </video-player>
  ```  
- The embedded `<video>` element should have the native controls enabled.



### What you need to know

To setup a basic CanJS application, you define a custom element in JavaScript and
use the custom element in your page’s `HTML`.

To define a custom element, extend [can-component] with a [can-component.prototype.tag]
that matches the name of your custom element.  For example:

```js
can.Component.extend({
  tag: "video-player"
})
```

Then you can use this tag in your HTML page:

```HTML
<video-player></video-player>
```

But this doesn’t do anything.  Components add their own HTML through their [can-component.prototype.view]
property:

```js
can.Component.extend({
  tag: "video-player",
  view: `<h2>I am a <input value='video'/> player!</h2>`
});
```

A component's `view` is rendered with it's [can-component.prototype.ViewModel]. For example, we can
make the `<input>` say `"AWESOME VIDEO"` by defining a `src` property and using it in the `view` like:

```js
can.Component.extend({
  tag: "video-player",
  view: `<h2>I am a <input value='{{src}}'/> player!</h2>`,
  ViewModel: {
    src: {default: "AWESOME VIDEO"}
  }
});
```

But we want the video player to take a `src` attribute value and use that for the
`<input>`'s `value`. For example, if
we wanted the input to say `CONFIGURABLE VIDEO` instead of `video`, we would:

1. Update `<video-player>` to pass `"CONFIGURABLE VIDEO"` with [can-stache-bindings.raw]:
   ```html
   <video-player src:raw="CONFIGURABLE VIDEO"/>
   ```
2. Update the `ViewModel` to define a `src` property like:
   ```js
   can.Component.extend({
     tag: "video-player",
     view: `<h2>I am a <input value='video'/> player!</h2>`,
     ViewModel: {
       src: "string"
     }
   });
   ```
3. Use the `src` property in the view:
   ```js
   can.Component.extend({
     tag: "video-player",
     view: `<h2>I am a <input value='{{src}}'/> player!</h2>`,
     ViewModel: {
       src: "string"
     }
   });
   ```

Finally, to have a `<video>` element show the _native_ controls, add a `controls`
attribute like:

```js
<video controls>
```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-11,only

Update the __HTML__ `<body>` element to:

@sourceref ./1-setup.html
@highlight 1,only



## Make play / pause button change as video is played and paused ##

### The problem

- Add a `button` to the `video` player for the play/pause
- Add an event attribute to the `video`
- Make button's change from pause to play, play to pause.
- Add custom `div` class for video controls

### What you need to know

- `<Video onclick:"">` - UI experince with the users - listening to events [can-stache-bindings.event].
  - how to call methods on their VM.
- `If/Else` statements / expressions [can-stache.helpers.if] [can-stache.helpers.else]
- Add

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-play-reflects.js
@highlight 5-6,9-13,16,17,19-24,only


## Make clicking the play/pause button play/pause the video ##

### The problem

- `button` - Adding event listeners
- `events` - Adding events to the `ViewModel`

### What you need to know

- `if/esle` - knowing `querySelector` to make a play and pause function

- Component's events object [can-component.prototype.events].
  - `{viewModel}` -> listen to the view model ... other option `{element} li click`
- a video element's [.play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) and `.pause()`

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-play-mutates.js
@highlight 10,24-28,29-36,only


## Show current time and duration ##

### The problem

- We need to now add an `onclick` event for the `video` time and duration

### What you need to know

- We need to listen for changes in a `<video>` time and duration
- YOu can call VM function (like `formatTime`)
- Probably just give them a `formatTime` function like:

  ```js
  formatTime(time) {
      if (time === null || time === undefined) {
        return "--"
      }
      const durmins = Math.floor(time / 60);
      let dursecs = Math.floor(time - durmins * 60);
      if (dursecs < 10) {
        dursecs = "0" + dursecs;
      }
      return durmins + ":" + dursecs
  }
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-play-mutates.js
@highlight 7,8,15,16,22-39,only


## Make range show position slider at current time ##

### The problem

### What you need to know

- [can-stache-bindings.toChild]
- how to make a getter [can-define.types.get] (also [can-define.types.propDefinition])

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-play-mutates.js
@highlight 15,16,27-34,only


## Make sliding the range update the current time ##

### The problem

### What you need to know

- [can-define.types.set]
- [can-stache-bindings.twoWay]
- Hint: how to listen for currentTime changes and update the video player's `currentTIme`

### The solution  

Update the __JavaScript__ tab to:

@sourceref ./6-play-mutates.js
@highlight 15,16,30-32,66-69,only

## Result

<script src="https://static.jsbin.com/js/embed.min.js?4.1.2"></script>
