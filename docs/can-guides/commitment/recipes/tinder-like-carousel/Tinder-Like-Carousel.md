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

### The problem

When someone adds `<evil-tinder></evil-tinder>` to their HTML, we want the following HTML  
to show up:

```html
<div class="header"></div>

<div class="images">
  <div class='current'>
    <img src="http://www.ryangwilson.com/bitovi/evil-tinder/villains/wickedwitch.jpg"/>
  </div>
  <div class='next'>
    <img src="http://www.ryangwilson.com/bitovi/evil-tinder/villains/venom.jpg"/>
  </div>
</div>

<div class="footer">
  <button class="dissBtn">Dislike</button>
  <button class="likeBtn">Like</button>
</div>
```

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

### The problem

Instead of hard-coding the current and next image urls, we want to show the first two items
in the following list of profiles:

```js
[{img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/gru.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/hannibal.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/joker.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/darth.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/norman.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/stapuft.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/dalek.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/wickedwitch.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/zod.jpg"},
 {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/venom.jpg"}]
```

If we were to remove items on the `ViewModel` as follows, the images will update:

```js
can.viewModel(document.querySelector("evil-tinder")).profiles.shift()
```


### What you need to know

- Use `default` to create a default value
- Create a getter to read a value
- Use `.get()` to read from a value in a list in such a way that it is observable

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-profiles.js
@highlight 8,11,21-41,only


## Add a like button

### The problem

When someone clicks the like button, console.log `LIKED` and remove the
first profile.

### What you need to know

- on:event bindings
- remove from the start of an array

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-like-btn.js
@highlight 17-18,44-47,only




## Add a nope button

### The problem

When someone clicks the like button, console.log `NOPED` and remove the
first profile.

### What you need to know

- You know everything you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-dislike-btn.js
@highlight 16-17,49-52,only



## Drag and move the profile to the left and right


### The problem

In this section we will:

- Move the current profile to the left or right as user drags the image to the
  left or right.
- Implement drag functionality so it works on a mobile or desktop device.
- Move the `<div class='current'>` element


### What you need to know

We need to listen to when a user drags and update the `<div class='current'>` element's
horizontal position to match how far the user has dragged.

- To update an element's horizontal position with [can-stache] you can set the `element.style.left`
  property like:
  ```HTML
  <div class='current' style="left: {{howFarWeHaveMoved}}px">
  ```

The remaining problem is how to get a `howFarWeHaveMoved` ViewModel property to update
as the user creates a drag motion. As drag motions 

- Desktop browsers dispatch mouse events. Mobile browsers dispatch touch events.
  _Most_ desktop and
- pointer events
- the [pep polyfill](https://www.npmjs.com/package/pepjs-improved)
    - touch-action="none" needed for polyfill to work
- default drag behavior with a mouse we need to cancel `draggable="false"`
- listen for down on the element you want to star the move
- listen to the document for the move
- use `left: {{}}px` to update where an element is in the page
- `connectedCallback` is where "junk goes"

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
