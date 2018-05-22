@page guides/recipes/tinder-like-carousel Tinder-Like-Carousel (Simple)
@parent guides/recipes

@description This guide walks you through building a Like-Tinder-Carousel

@body


In this guide, you will learn how to create a custom __Tinder-like-carousel__  .
The custom widget will:

- Have touch and drag functionality
- Have custom `<button>`s for liking and disliking  
-

The final widget looks like:

<a class="jsbin-embed" href="http://jsbin.com/viruhuw/4/embed?html,js,output&height=600px">JS Bin on jsbin.com</a>


The following sections are broken down the folowing parts:

- __The problem__ - A description of what the section is trying to accomplish.

- __What you need to know__ - Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it's not obvious.
- __The solution__ - The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

> Click the `JS Bin` button.  The JS Bin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="http://jsbin.com/safago/2/embed?html,js,output">JS Bin on jsbin.com</a>

This JS Bin:

- Loads CanJS
- Loads pepjs polyfill

### What you need to know

To setup a basic CanJS application, you define a custom element in JavaScript and
use the custom element in your page’s `HTML`.

To define a custom element, extend [can-component] with a [can-component.prototype.tag]
that matches the name of your custom element.  For example:

We will use `<evil-tinder>` as our custom tag:

```js
can.Component.extend({
  tag: "evil-tinder"
})
```
But this doesn’t do anything.  Components add their own HTML through their [can-component.prototype.view]
property:

```js
can.Component.extend({
  tag: "evil-tinder",
  view: `
    <h2>Evil-Tinder</h2>
  `,
  ViewModel{

  }
});
```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./0-setup.js

Update the `<body>` element in the __HTML__ tab to:

```js
<body noscroll>
    <evil-tinder></evil-tinder>
</body>
```

## Show the current and next profile images




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-profiles.js
@highlight 8,11,21-41,only


## Add a like button




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-like-btn.js
@highlight 17-18,44-47,only




## Add a nope button




### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-dislike-btn.js
@highlight 16-17,49-52,only



## Drag and move the profile to the left and right




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-move-current-profile.js
@highlight 7-10,39,57-71,only


## Show liking animation when you drag to the right

### The problem
### What you need to know
### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-show-liking.js
@highlight 5,47-49,only




## Show noping animation when you drag to the left

### The problem
### What you need to know
### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-show-nope.js
@highlight 5-6,51-53,only




## On release, like or nope

### The problem
### What you need to know
### The solution

Update the __JavaScript__ tab to:

@sourceref ./7-release.js
@highlight 77-88,only

## Add an empty profile

### The problem
### What you need to know
### The solution

Update the __JavaScript__ tab to:

@sourceref ./8-empty-profile.js
@highlight 41-45,48,51,only

<script src="http://static.jsbin.com/js/embed.min.js?4.1.4"></script>
