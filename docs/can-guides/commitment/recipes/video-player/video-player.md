@page guides/recipes/video-player Video Player (Simple)
@parent guides/recipes

@description This guide walks you through building custom video
controls around a video element.


@body




In this guide you will learn how to:

- TODO

The final widget looks like:

__TODO__

The following sections are broken down the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it’s not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

### The problem

- get a custom <video-player> on the page

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-11,only

Update the __HTML__ `<body>` element to:

@sourceref ./1-setup.html
@highlight 1,only



## Make play / pause button change as video is played and paused ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-play-reflects.js
@highlight 5-6,9-13,17,19-25,only


## Make clicking the play/pause button play/pause the video ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-play-mutates.js
@highlight 10,25-27,29-37,only


## Show current time and duration ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-play-mutates.js
@highlight 7,8,15,16,22,23,25-37,only


## Make range show position slider at current time ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-play-mutates.js
@highlight 15-17,28-33,only


## Make sliding the range update the current time ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-play-mutates.js
@highlight 57-59,only

## Result
