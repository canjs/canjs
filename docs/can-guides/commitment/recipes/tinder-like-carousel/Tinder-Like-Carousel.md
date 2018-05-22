@page guides/recipes/tinder-like-carousel Tinder-Like-Carousel (Simple)
@parent guides/recipes

@description This guide walks you through building a Like-Tinder-Carousel

1.  SETUP EVIL TINDER TITLE
2.  Show currentProfile and nextProfile
3.  Like button
4.  Nope button
5.  Move the currentProfile
       - listenTo down, listenTo move, and update howFarPtrHasMoved
       - use howFarPtrHasMoved in view
6.  Show when you are liking
7.  Show when you are noping
8.  On release, like or nope.

@body



In this guide, you will learn how to create a custom __Tinder-like-carousel__  .
The custom widget will:

- Have touch and drag functionality
- Have custom `<button>`s for liking and disliking  
-

The final widget looks like:

<a class="jsbin-embed" href="http://jsbin.com/pacekeb/22/embed?html,js,output">JS Bin on jsbin.com</a><script src="http://static.jsbin.com/js/embed.min.js?4.1.4"></script>


The following sections are broken down the folowing parts:

- __The problem__ - A description of what the section is trying to accomplish.

- __What you need to know__ - Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it's not obvious.
- __The solution__ - The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS BIN__:

> Click the `JS Bin` button.  The JS Bin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="http://jsbin.com/dutacah/embed?html,js,output">JS Bin on jsbin.com</a><script src="http://static.jsbin.com/js/embed.min.js?4.1.4"></script>

This JS Bin:

- Creates a basic CanJS template, you define a custom element in JavaScript and use the custom element in your page’s `HTML`.

- Creates a custom `<tag-element>` in the `HTML` tab to use for this widget

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

### Step 2 Show currentProfile and nextProfile




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-profiles.js
@highlight 1-46,only


### Step 3 Like button




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-like-btn.js
@highlight 14-17,46-49,only




### Step 4 Nope button




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-dislike-btn.js
@highlight 14-17,53-56,only



### Step 5 Move current profile




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-move-current-profile.js
@highlight 7-10,61-87,only


### Step 6 Show like




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-show-liking.js
@highlight 6,57-60,only


### Step 7 Show nope




### What you need to know






### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-show-nope.js
@highlight 6,7,58-60,only
