@page guides/recipes/tinder-like-carousel Tinder-Like-Carousel (Medium)
@parent guides/recipes

@description This guide walks you through building a [Tinder](https://tinder.com/)-like
carousel. Learn how build apps that use dragging user interactions.

@body


In this guide, you will learn how to create a custom [Tinder](https://tinder.com/)-like
carousel. The custom widget will:

- Have touch and drag functionality that works on mobile and desktop.
- Have custom `<button>`'s for liking and disliking


The final widget looks like:

<a class="jsbin-embed" href="http://jsbin.com/viruhuw/7/embed?html,js,output&height=600px">JS Bin on jsbin.com</a>


The following sections are broken down the folowing parts:

- __The problem__ - A description of what the section is trying to accomplish.

- __What you need to know__ - Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it's not obvious.
- __The solution__ - The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

> Click the `JS Bin` button.  The JS Bin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="http://jsbin.com/safago/4/embed?html,js,output">JS Bin on jsbin.com</a>

This JS Bin:

- Loads CanJS's global build. All of it's packages are available as `can.X`.  For example [can-component]
  is available as `can.Component`.
- Loads the [pepjs polyfill](https://www.npmjs.com/package/pepjs-improved) for pointer event support.

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
property like this:

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

> NOTE: We'll make use of the `ViewModel` property later.


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

- A component's `view` is rendered with its [can-component.prototype.ViewModel]. For example, we can create
  a list of profiles and write out an `<img>` for each one like:

  ```js
  can.Component.extend({
    tag: "evil-tinder",
    view: `
      {{# each(profiles) }}
          <img src="{{img}}"/>
      {{/ each}}
    `,
    ViewModel: {
      profiles: {
        default(){
          return [{img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/gru.jpg"},
              {img: "http://www.ryangwilson.com/bitovi/evil-tinder/villains/hannibal.jpg"}];
        }
      }
    }
  });
  ```

  The [can-define.types.default] behavior specifies the default value of the `profiles`
  property.

  The `view` uses [can-stache.tags.escaped] to write out values from the `ViewModel` into the DOM.

- Use a [can-map-define.get getter] to derive a value from another value on the ViewModel, this will allow   
  us to get the next profile image:

  ```js
  get currentProfile() {
    return this.profiles.get(0);
  },
  ```

  > NOTE Use `.get(0)` to make sure `currentProfile` changes when a is removed from the list.


### How to verify it works

Run the following in the `CONSOLE` tab.  The background image should move to the foreground.

```js
can.viewModel(document.querySelector("evil-tinder")).profiles.shift()
```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-profiles.js
@highlight 8,11,21-41,only


## Add a like button

### The problem

- When someone clicks the like button, console.log `LIKED` and remove the first profile image and show the
  next one in the list.


### What you need to know

- Use [can-stache-bindings.event] to call a function on the `ViewModel` when a DOM event happens:

  ```js
  <button on:click="doSomething()"></button>
  ```

- Those functions (example: `doSomething`) are usually methods on the Component’s
  [can-component.prototype.ViewModel].  For example, the following creates a `doSomething` method on the ViewModel:

  ```js
  can.Component.extend({
    tag: "some-element",
    view: `<button on:click="doSomething('dance')"></button>`,
    ViewModel: {
      doSomething(cmd) {
        alert("doing "+cmd);
      }
    }
  })
  ```

- Use `.shift` to remove an item from the start of an array:
  ```js
  this.profiles.shift();
  ```





### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-like-btn.js
@highlight 17-18,44-47,only




## Add a nope button

### The problem

- When someone clicks the like button, console.log `NOPED` and remove the first profile.

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
as the user creates a drag motion.

- Define a number property on a `ViewModel` with:

  ```js
  ViewModel: {
    ...
    howFarWeHaveMoved: "number"
  }
  ```

- As drag motion needs to be captured just not on the
  element itself, but on the entire `document`, we will setup the event binding in the
  [can-component/connectedCallback] of the `ViewModel` as follows:

  ```HTML
    ViewModel: {
      ...
      connectedCallback(el) {
        var current = el.querySelector(".current");
      }
    }
  ```

- Desktop browsers dispatch mouse events. Mobile browsers dispatch touch events.
  _Most_ desktop and dispatch [Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events).

  You can listen to pointer events with [can-event-queue/map/map.listenTo] inside `connectedCallback` like:

  ```js
  this.listenTo(current, "pointerdown", (event) => { ... })
  ```

  As mobile safari doesn't support pointer events, we have already installed the
  [pep pointer event polyfill](https://www.npmjs.com/package/pepjs-improved).

  The polyfill requires that `touch-action="none"` be added to elements that should
  dispatch pointer events like:

  ```html
  <img touch-action="none"/>
  ```

  Drag motions on images in desktop browsers will attempt to drag the image unless
  this behavior is turned off.  It can be turned off with `draggable="false"` like:

  ```html
  <img draggable="false"/>
  ```

- Pointer events dispatch with an `event` object that contains the position of
  the mouse or finger:

  ```js
  this.listenTo(current, "pointerdown", (event) => {
    event.clientX //-> 200
  })
  ```

  On a pointerdown, this will be where the drag motion starts. Listen to
  `pointermove` to be notified as the user moves their mouse or finger.

- Listen to `pointermove` on the `document` instead of the dragged item to
  better tollerate drag motions that extend outside the dragged item.

  ```js
  this.listenTo(document, "pointermove", (event) => {

  });
  ```
  The difference between `pointermove`'s position and `pointerdown`'s
  position is how far the current profile `<div>` should be moved.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-move-current-profile.js
@highlight 7-10,39,57-71,only


## Show liking animation when you drag to the right

### The problem

In this section, we will:

- Show a like "stamp" when the user has dragged the current profile to the right 100 pixels.
- The like stamp will appear when an element like `<div class='result'>` has `liking`
  added to its class list.

### What you need to know

- Use [can-stache.helpers.if] to test if a value is truthy and add a value to an element's class list like:
  ```html
  <div class='result {{# if(liking) }}liking{{/ if}}'>
  ```
- Use a [can-map-define.get getter] to derive a value from another value on the ViewModel:
  ```js
  get liking() {
    return this.howFarWeHaveMoved >= 100;
  },
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-show-liking.js
@highlight 5,47-49,only




## Show noping animation when you drag to the left

### The problem

- Show a nope "stamp" when the user has dragged the current profile to the left 100 pixels.
- The nope stamp will appear when an element like `<div class='result'>` has `noping`
  added to its class list.

### What you need to know

You know everything you need to know!

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-show-nope.js
@highlight 5-6,51-53,only




## On release, like or nope

### The problem

In this section, we will perform one of the following when the user completes their
drag motion:

- console.log `like` and move to the next profile if the drag motion has moved at least 100 pixels to the right
- console.log `nope` and move to the next profile if the drag motion has moved at least 100 pixels to the left
- do nothing if the drag motion did not move 100 pixels horizontally

And, we will perform the following no matter what state the drag motion ends:

- Reset the state of the application so it can accept further drag motions and the
  new profile image is centered horizontally.

### What you need to know

- Listen to `pointerup` to know when the user completes their drag motion:
  ```js
  this.listenTo(document, "pointerup", (event) => { });
  ```

- To stopListening to the `pointermove` and `pointerup` events on the document for the
  `ViewModel` with:

  ```js
  this.stopListening(document);
  ```


### The solution

Update the __JavaScript__ tab to:

@sourceref ./7-release.js
@highlight 77-88,only

## Add an empty profile

### The problem

In this section, we will:

-  Show the following stop sign url when the user runs out of profiles:
  `http://stickwix.com/wp-content/uploads/2016/12/Stop-Sign-NH.jpg`.


### What you need to know

- Use [can-define.types.default] to create a default property value:

  ```js
  emptyProfile: {
    default () {
        return {img: "http://stickwix.com/wp-content/uploads/2016/12/Stop-Sign-NH.jpg"};
    }
  },
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./8-empty-profile.js
@highlight 41-45,48,51,only

<script src="http://static.jsbin.com/js/embed.min.js?4.1.4"></script>
