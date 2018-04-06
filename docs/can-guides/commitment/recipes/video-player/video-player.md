@page guides/recipes/video-player Video Player (Simple)
@parent guides/recipes

@description This guide walks you through building custom video
controls around a video element.


@body




In this guide you will learn how to:

- Set up a custom `Video` Player
- Custom `play` and `pause` `buttons`
- Make `seekslider` respond to users interaction  


The final widget looks like:


__TODO__

The following sections are broken down the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it’s not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

> Click the `JS Bin` button.  The JS Bin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="http://jsbin.com/gejokos/1/edit?html,css,output">CanJS Video Player on jsbin.com</a>

This JS Bin:

- Creates a `<video>` element that loads a video and shows the native controls.
- Loads CanJS.


### The problem

- get a custom <video-player> on the page

```js
<video-player>
  <source> </source>
</video-player>
```

### What you need to know

- Basic HTML tags and attributes
- `Video-player` - to add the source video
- `Controls` - to give the video standard buttons to work with
- `can.Component.extend` -
- `ViewModel` - CanJS basic viewModel
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

- `<Video onclick:"">` - UI experince with the users
- `If/Else` statements / expressions
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

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-play-mutates.js
@highlight 10,24-28,29-36,only


## Show current time and duration ##

### The problem

- We need to now add an `onclick` event for the `video` time and duration

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-play-mutates.js
@highlight 7,8,15,16,22-39,only


## Make range show position slider at current time ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-play-mutates.js
@highlight 15,16,27-34,only


## Make sliding the range update the current time ##

### The problem

### What you need to know

### The solution  

Update the __JavaScript__ tab to:

@sourceref ./6-play-mutates.js
@highlight 15,16,30-32,66-69,only

## Result

<script src="https://static.jsbin.com/js/embed.min.js?4.1.2"></script>
