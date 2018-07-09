@page guides/recipes/text-editor Text Editor (Medium)
@parent guides/recipes

@description This guide walks you through building a
basic rich text editor.


@body

> A live stream of this recipe was recorded at a [DoneJS Los Angeles](https://www.meetup.com/DoneJS-LA/) [Hack Night on July 9<sup>th</sup>, 2018](https://www.meetup.com/DoneJS-LA/events/251662343/):
> <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/Hqglk6Fkvyc?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>


<style>
  video.bit-docs-screenshot {max-width: 600px;}
</style>


In this guide you will learn how to:

- Use [document.execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)
  to change the HTML and copy text to the clipboard.
- The basics of the [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) and
  [Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) APIs.
- Walk the DOM in unusual ways.

The final widget looks like:

<p data-height="300" data-theme-id="0" data-slug-hash="qKeBeZ" data-default-tab="result" data-user="chasenlehara" data-embed-version="2" data-pen-title="CanJS 5 Text Editor" class="codepen">
  See the Pen <a href="https://codepen.io/chasenlehara/pen/qKeBeZ/">CanJS 5 Text Editor</a> by Chasen Le Hara (<a href="https://codepen.io/chasenlehara">@chasenlehara</a>) on <a href="https://codepen.io">CodePen</a>.
</p>

The following sections are broken down into the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it’s not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLICKING THE “EDIT ON CODEPEN” BUTTON IN THE TOP RIGHT CORNER OF THE FOLLOWING EMBED__:

<p data-height="265" data-theme-id="0" data-slug-hash="dKxPzz" data-default-tab="js,result" data-user="chasenlehara" data-embed-version="2" data-pen-title="CanJS 5 Text Editor (Starting)" class="codepen">
  See the Pen <a href="https://codepen.io/chasenlehara/pen/dKxPzz/">CanJS 5 Text Editor (Starting)</a> by Chasen Le Hara (<a href="https://codepen.io/chasenlehara">@chasenlehara</a>) on <a href="https://codepen.io">CodePen</a>.
</p>

This CodePen:

- Loads CanJS (`import { Component } from "//unpkg.com/can@5/core.mjs"`).
- Implements 3 helper functions we will use later: `siblingThenParentUntil`, `splitRangeStart` and `splitRangeEnd`. These are hidden out of sight in the `HTML` tab.
- Mocks out the signature for helper functions we will implement later: `getElementsInRange` and `rangeContains`. These are in the `JS` tab.

### The problem

- Set up a basic CanJS app by creating a `<rich-text-editor>` element.
- The `<rich-text-editor>` element should add a [contenteditable](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content) `<div/>` with an `editbox`
  [class name](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) to the page. The `<div/>` should have the following default __inner__ content:
  ```html
  <ol>
    <li>Learn <b>about</b> CanJS.</li>
    <li>Learn <i>execCommand</i>.</li>
    <li>Learn about selection and ranges.</li>
    <li>Get Funky.</li>
  </ol>
  <div>Celebrate!</div>
  ```

<video controls class="bit-docs-screenshot">
<source src="../../../docs/can-guides/commitment/recipes/text-editor/1-setup.webm" type="video/webm">
I’m sorry; your browser doesn’t support HTML5 video in WebM with VP8/VP9 or MP4 with H.264.
</video>

### What you need to know

To set up a basic CanJS application, you define a custom element in JavaScript and
use the custom element in your page’s `HTML`.

To define a custom element, extend [can-component] with a [can-component.prototype.tag]
that matches the name of your custom element.  For example:

```js
Component.extend({
  tag: "rich-text-editor"
});
```

Then you can use this tag in your HTML page:

```html
<rich-text-editor></rich-text-editor>
```

But this doesn’t do anything.  Components add their own HTML through their [can-component.prototype.view]
property:

```js
Component.extend({
  tag: "rich-text-editor",
  view: `<h2>I am a rich-text-editor!</h2>`
});
```

Now the `H2` element in the `view` will show up within the `<rich-text-editor>` element:

```html
<rich-text-editor><h2>I am a rich-text-editor!</h2></rich-text-editor>
```

To make an element editable, set the [contenteditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable) property to `"true"`.  Once an element’s content is editable, the user can change the text and HTML structure
of that element by typing and copying and pasting text.


### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 3-16,only

Update the __HTML__ `<body>` element to:

@sourceref ./1-setup.html
@highlight 2,only

## Add a bold button ##

### The problem

- Add a <button>B</button> `<button>` that (when clicked) will bold the text the user selected.
- The button should have a [class name](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) of `bold`.
- The button should be within a `<div class="controls">` element before the `editbox` element.

<video controls class="bit-docs-screenshot">
<source src="../../../docs/can-guides/commitment/recipes/text-editor/2-bold.webm" type="video/webm">
I’m sorry; your browser doesn’t support HTML5 video in WebM with VP8/VP9 or MP4 with H.264.
</video>

### What you need to know


- Use [can-stache-bindings.event] to call a function when an element is clicked:
  ```html
  <button on:click="doSomething('bold')"></button>
  ```

- Those functions (example: `doSomething`) are usually methods on the Component’s [can-component.prototype.ViewModel].  For example, the following creates a `doSomething` method on the ViewModel:

  ```js
  Component.extend({
    tag: "some-element",
    view: `<button on:click="doSomething('bold')"></button>`,
    ViewModel: {
      doSomething(cmd) {
        alert("doing " + cmd);
      }
    }
  })
  ```

- To bold text selected in a _contenteditable_ element, use [document.execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand):
  ```js
  document.execCommand("bold", false, null)
  ```


### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-bold.js
@highlight 6-8,18-23,only







## Add an italic button ##

### The problem

- Add an <button>I</button> `<button>` that (when clicked) will italicize the user selected text.
- The button should have a [class name](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) of `italic`.
- The button should be within the `<div class="controls">` element before the `editbox` element.

### What you need to know

You know everything you need to know already for this step.  The power was inside you all along!

Well… in case you couldn’t guess, to italicize text, use [document.execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand):

```js
document.execCommand("italic", false, null)
```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-italic.js
@highlight 8,only







## Add a copy button ##

### The problem

- Add a <button>Copy All</button> `<button>` that (when clicked) will select the entire contents of
  the `editbox` element and copy the `editbox` text to the clipboard.
- The button should be within the `<div class="controls">` element before the `editbox` element.


<video controls class="bit-docs-screenshot">
<source src="../../../docs/can-guides/commitment/recipes/text-editor/4-copy.webm" type="video/webm">
I’m sorry; your browser doesn’t support HTML5 video in WebM with VP8/VP9 or MP4 with H.264.
</video>

### What you need to know

- To make <button>Copy All</button> work, we need to give the `ViewModel` access to
  the `<rich-text-editor>` element.  Usually, `ViewModel`s should not access DOM elements
  directly. However, for this widget, there’s important state (what the user has typed) that
  we need to access.

  So to make the component’s `element` available to the ViewModel, use the following pattern:

  ```js
  Component.extend({
    tag: "some-element",
    view: `...`,
    ViewModel: {
      element: "any",
      connectedCallback(el) {
        this.element = el;
      }
    }
  })
  ```

  `element: "any"` declares the element property can be of any value.

  [can-component/connectedCallback] is a lifecycle hook that gets called when the component is inserted
  into the page. This pattern saves the `element` property on the `ViewModel`.

  > **HINT:** This allows you to use `this.element` within your `copyAll()` function.

- Use [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector) to get an element by a CSS selector:

  ```js
  this.element.querySelector(".someClassName")
  ```

  > **HINT:** You’ll want to get the `editbox` element.

- The [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) and
  the [Selection](https://developer.mozilla.org/en-US/docs/Web/API/Selection) APIs are used to control
  the text a user is selecting.

  A `Range` allows you to “contain” a fragment of the document that contains nodes and parts of
  text nodes.

  The `Selection` object contains the ranges of text that a user currently has highlighted. Usually
  there is only one `Range` within a selection.

  To programmatically select text, first [create a range](https://developer.mozilla.org/en-US/docs/Web/API/Document/createRange):

  ```js
  const editBoxRange = document.createRange();
  ```

  Then you position the range over the elements you would like to select.  In our
  case we want to select the `editbox` element, so we can use [selectNodeContents](https://developer.mozilla.org/en-US/docs/Web/API/Range/selectNodeContents):

  ```js
  editBoxRange.selectNodeContents(editBox);
  ```

  Now we need to make the `editBoxRange` the only range in the user’s
  `Selection`. To do this, we first need to [get the selection](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection):

  ```js
  const selection = window.getSelection();
  ```

  Then, [remove all](https://developer.mozilla.org/en-US/docs/Web/API/Selection/removeAllRanges) current selected text with:

  ```js
  selection.removeAllRanges();
  ```

  Finally, [add the range](https://developer.mozilla.org/en-US/docs/Web/API/Selection/addRange) you want to actually select:

  ```js
  selection.addRange(editBoxRange);
  ```

- To copy to the clipboard the ranges in the user’s `Selection`, call:

  ```js
  document.execCommand("copy");
  ```

### How to verify it works

Click the <button>Copy All</button> button.  You should be able to paste the contents of the editable area
into a text editor.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-copy.js
@highlight 9,25-39,only







## Add a Funky button that works when selecting a single text node ##

### The problem

- Add a <button>Funky</button> `<button>` that (when clicked) will add `funky` to the [class name](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) of the content selected
  in the editable area.
- The button should have a [class name](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) of `funky`.
- We are only concerned with `Funk-ify` text selected within a single element. We will make the <button>Funky</button>
  button able to `Funk-ify` text selected across elements later.

<video controls class="bit-docs-screenshot">
<source src="../../../docs/can-guides/commitment/recipes/text-editor/5-funky-text.webm" type="video/webm">
I’m sorry; your browser doesn’t support HTML5 video in WebM with VP8/VP9 or MP4 with H.264.
</video>

### What you need to know

On a high level, we are going to:

1. Get the text the user has selected represented with a `Range`.
2. Wrap the selected text with a `span` element element.
3. Add `funky` to the [class name](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) of the `span` element.


__Text Nodes Exist!__

It’s critical to understand that the DOM is made up of normal nodes and
text nodes.  For example, the following `UL` has 7 child nodes:

```html
<ul>
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

The UL has children like:

```js
[
   document.createTextNode("\n  "),
   <li>First</li>
   document.createTextNode("\n  ")
   <li>Second</li>
   document.createTextNode("\n  ")
   <li>Third</li>
   document.createTextNode("\n")
]
```

If the user selects _“about selection”_ in:

```html
<li>Learn about selection and ranges</li>
```

They are selecting part of a TextNode. In order to `funk-ify`
_"about selection"_, we need to change that HTML to:

```html
<li>Learn <span class="funky">about selection</span> and ranges</li>
```

__Implementing the `getElementsInRange` helper__

To prepare for the final step, we are going to implement part of this
step within a `getElementsInRange` function, which will
return the HTML elements within a range.  If the range includes
`TextNode`s, those `TextNode`s should be wrapped in a `wrapNodeName` element.

For example, if the `aboutSelection` `Range` represents _"about selection"_ in:

```html
<li>Learn about selection and ranges</li>
```

Calling `getElementsInRange(aboutSelection, "span")` should:

- Convert the `<li>` to look like:

  ```html
  <li>Learn <span>about selection</span> and ranges</li>
  ```

- Return the `<span>` element above.

__Other stuff you need to know__

- To get the user’s current selection as a `Range`, run:
  ```js
  const selection = window.getSelection();
  if (selection && selection.rangeCount) {
    const selectedRange = selection.getRangeAt(0);
  }
  ```
- To [create an element](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement) given a tag name, write:
  ```js
  const wrapper = document.createElement(wrapNodeName);
  ```
- To [surround a range](https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents) within a textNode with another node, write:
  ```js
  selectedRange.surroundContents(wrapper);
  ```
- To add a class name to an element’s [class list](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList), write:
  ```js
  element.classList.add("funky")
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-funky-text.js
@highlight 10,41-49,53-59,only







## Make the Funky button only work within the editable area

### The problem

As shown in the previous step’s video, selecting text outside the editable area and
clicking the <button>Funky</button> button will make that text <button>Funky</button>. In this step, we will
only `funk-ify` the text in the `editbox`.

<video controls class="bit-docs-screenshot">
<source src="../../../docs/can-guides/commitment/recipes/text-editor/6-funky-only.webm" type="video/webm">
I’m sorry; your browser doesn’t support HTML5 video in WebM with VP8/VP9 or MP4 with H.264.
</video>

### What you need to know

On a high level, we are going to:

1. Create a range that represents the `editbox`
2. Compare the selected range to the `editbox` range and make sure it’s inside
  the `editbox` before adding the `funky` behavior.


__The `rangeContains` helper__

In this step, we will be implementing the `rangeContains` helper
function.  Given an `outer` range and an `inner` range, it must return `true`
if the `outer` range is equal to or contains the `inner` range:

```js
function rangeContains(outer, inner) {
  return // COMPARE RANGES
}

const documentRange = document.createRange();
documentRange.selectContents(document.documentElement);

const bodyRange = document.createRange();
bodyRange.selectContents(document.body)

rangeContains(documentRange, bodyRange) //-> true
```

__Other stuff you need to know__

- Use [selectNodeContents](https://developer.mozilla.org/en-US/docs/Web/API/Range/selectNodeContents)
  to set a range to the contents of an element:

  ```js
  const bodyRange = document.createRange();
  bodyRange.selectContents(document.body)
  ```

- Use [compareBoundaryPoints](https://developer.mozilla.org/en-US/docs/Web/API/Range/compareBoundaryPoints)
  to compare two ranges. The following makes sure `outer`’s start is before or equal to `inner`’s start AND
  `outer`’s end is after or equal to `inner`’s end:

  ```js
  outer.compareBoundaryPoints(Range.START_TO_START,inner) <= 0 &&
  outer.compareBoundaryPoints(Range.END_TO_END,inner) >= 0
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-funky-only.js
@highlight 42-44,49,53,67-72,only







## Make the Funky button work when selecting multiple nodes ##

### The problem

In this section, we will make the <button>Funky</button> button work even if text is selected
across multiple nodes.

__NOTE: This is hard!__

### What you need to know

On a high-level, we are going to edit `getElementsInRange` to work with
ranges that span multiple nodes by:

1. Detect if the range spans multiple nodes.
2. If the range does span multiple nodes, we will walk the DOM between the
  range’s start position and end position:
   1.  From the range’s start position, collect all [nextSibling](https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling)s.  Once out of siblings, move
       to the [parentNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode).  Do not collect that node, continue collecting siblings
       and moving to parent nodes until you reach a __parent node__ that is a direct descendent of the `commonAncestor`
       of the start and end of the range.  This __parent node__ is the
       _start-line node_.
   2.  From the range’s end position, collect all [previousSibling](https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling)s. Once out of siblings move,
       to the [parentNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode).  Do not collect that node, continue collecting siblings
       and moving to parent nodes until you reach a __parent node__ that is a direct descendent of the `commonAncestor`
       of the start and end of the range. This __parent node__ is the
       _end-line node_.
   3.  Collect all sibling nodes between the _start-line node_ and _end-line node_.
   4.  Do not collect TextNodes that only have spaces.
   5.  When `TextNodes` that have characters should be collected, wrap them in an element
       node of type `wrapNodeName`.

Let’s see how this works with an example.  Let’s say we’ve selected from the `out` in _about_ to
the start of `brate` in _Celebrate_.  We’ve marked the selection start and end with `|` below:

```html
<ol>
  <li>Learn <b>ab|out</b> CanJS.</li>
  <li>Learn <i>execCommand</i>.</li>
  <li>Learn about selection and ranges.</li>
  <li>Get Funky.</li>
</ol>
<div>Get Ready To</div>
<div>Cele|brate!</div>
```

So we first need to "collect" `out` in `elements`.  To do this, we will do step `#2.5` and
the DOM will look like:

```html
<ol>
  <li>Learn <b>ab<span class="funky">out</span></b> CanJS.</li>
  <li>Learn <i>execCommand</i>.</li>
  <li>Learn about selection and ranges.</li>
  <li>Get Funky.</li>
</ol>
<div>Get Ready To</div>
<div>Cele|brate!</div>
```

We will then keep doing step `#2.1`. This new span has no [nextSibling](https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling)s, so we will
walk up to it’s parent `<b>` element and collect its next siblings.  This will update the DOM to:

```html
<ol>
  <li>Learn <b>ab<span class="funky">out</span></b><span class="funky"> CanJS.</span></li>
  <li>Learn <i>execCommand</i>.</li>
  <li>Learn about selection and ranges.</li>
  <li>Get Funky.</li>
</ol>
<div>Get Ready To</div>
<div>Cele|brate!</div>
```

We will then keep doing step `#2.1`. This new span has no [nextSibling](https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling)s, so we will
walk up to it’s parent `<li>` element and collect its next siblings.  We will only collect
Elements and TextNodes with characters, resulting in:

```html
<ol>
  <li>Learn <b>ab<span class="funky">out</span></b><span class="funky"> CanJS.</span></li>
  <li class="funky">Learn <i>execCommand</i>.</li>
  <li class="funky">Learn about selection and ranges.</li>
  <li class="funky">Get Funky.</li>
</ol>
<div>Get Ready To</div>
<div>Cele|brate!</div>
```

We will then move onto the `<ol>`. Once we reached the `<ol>`, we’ve reached
the _start-line node_.  Now we will move onto step `#2.2`.  We will perform a similar walk from
the end of the range, but in reverse. In this case, we will wrap `Cele` with a `<span>` follows:

```html
<ol>
  <li>Learn <b>ab<span class="funky">out</span></b><span class="funky"> CanJS.</span></li>
  <li class="funky">Learn <i>execCommand</i>.</li>
  <li class="funky">Learn about selection and ranges.</li>
  <li class="funky">Get Funky.</li>
</ol>
<div>Get Ready To</div>
<div><span class="funky">Cele</span>|brate!</div>
```

As this `<span>` has no previous siblings, we will walk up to its container `div`. We’ve now
reached the _end-line node_.  

Finally, we move onto step `#2.3`, and collect all nodes between _start-line_ and _end-line_:

```html
<ol>
  <li>Learn <b>ab<span class="funky">out</span></b><span class="funky"> CanJS.</span></li>
  <li class="funky">Learn <i>execCommand</i>.</li>
  <li class="funky">Learn about selection and ranges.</li>
  <li class="funky">Get Funky.</li>
</ol>
<div class="funky">Get Ready To</div>
<div><span class="funky">Cele</span>|brate!</div>
```

> __NOTE:__ In the final solution, elements are first collected all at once,
> and then `class="funky"` is added later. However, we are showing `funky` being added
> incrementally here for clarity.

__Helpers:__

To make the solution easier, we’ve provided several helpers in the `HTML` tab:

`splitRangeStart` takes a range and splits the text node at the range start and
replaces the selected part with an element.  For example, if the range selected
_"a small"_ in the following HTML:

```html
<i>It’s a</i><b>small world<b>
```

Calling `splitRangeStart(range, "span")` would update the DOM to:

```html
<i>It’s <span>a</span></i><b>small world<b>
```

…and it would return the wrapping `<span>`.

`splitRangeEnd` does the same thing, but in reverse.  

`siblingThenParentUntil` is used to walk the DOM in the pattern described in
`#2.1` and `#2.2`. For example, with DOM like:

```html
<div class="editbox" contenteditable="true">
  <ol>
    <li>Learn <b>ab<span id="START">out</span></b> CanJS.</li>
    <li>Learn <i>execCommand</i>.</li>
    <li>Learn about selection and ranges.</li>
    <li>Get Funky.</li>
  </ol>
  <div>Get Ready To</div>
  <div>Cele|brate!</div>
</div>
```

Calling it as follows:

```js
const start = document.querySelector("#start");
const editbox = document.querySelector(".editbox");
siblingThenParentUntil("nextSibling", start, editbox, function handler(element) {});
```

…will call back `handler` with all the TextNodes and Elements that should be either
wrapped and collected or simply collected.  That is, it would be called with:

```html
TextNode< CanJS.>
<li>Learn <i>execCommand</i>.</li>
<li>Learn about selection and ranges.</li>
<li>Get Funky.</li>
<ol>...
```

`siblingThenParentUntil` will return the parent `<div>` of the `<ol>` as the _start-line_ node.

__Other stuff you need to know:__

- [range.commonAncestor](https://developer.mozilla.org/en-US/docs/Web/API/Range/commonAncestorContainer) returns
  the DOM node that contains both the start and end of a `Range`.
- [nextSibling](https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling) returns a node’s next sibling in the DOM.
- [previousSibling](https://developer.mozilla.org/en-US/docs/Web/API/Node/previousSibling) returns a node’s previous sibling in the DOM.
- [parentNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode) returns a node’s parent element.
- If you change the DOM, ranges, including the selected ranges, can be messed up.  Use
  [range.setStart](https://developer.mozilla.org/en-US/docs/Web/API/Range/setStart) and
  [range.setEnd](https://developer.mozilla.org/en-US/docs/Web/API/Range/setEnd) to
  update the start and end of a range after the DOM has finished changing:

  ```js
  range.setStart(startWrap, 0);
  range.setEnd(endWrap.firstChild,endWrap.textContent.length);
  ```
- Use `/[^\s\n]/.test(textNode.nodeValue)` to test if a TextNode has non-space characters.

__Some final clues:__

The following can be used to collect (and possibly wrap) nodes into the `elements` array:

```js
function addSiblingElement(element) {
  // We are going to wrap all text nodes with a span.
  if (element.nodeType === Node.TEXT_NODE) {
    // If there’s something other than a space:
    if (/[^\s\n]/.test(element.nodeValue)) {
      const span = document.createElement(wrapNodeName);
      element.parentNode.insertBefore(span, element);
      span.appendChild(element);
      elements.push(span);
    }
  } else {
    elements.push(element)
  }
}
```

With this, you could do step `#2.1` like:

```js
const startWrap = splitRangeStart(range, wrapNodeName);
addSiblingElement(startWrap);

// Add nested siblings from startWrap up to the first line.
const startLine = siblingThenParentUntil(
  "nextSibling",
  startWrap,
  range.commonAncestor,
  addSiblingElement
);
```



### The solution

Update the __JavaScript__ tab to:

@sourceref ./7-funky-range.js
@highlight 62-81,85-120,only

## Result

When finished, you should see something like the following CodePen:

<p data-height="300" data-theme-id="0" data-slug-hash="qKeBeZ" data-default-tab="result" data-user="chasenlehara" data-embed-version="2" data-pen-title="CanJS 5 Text Editor" class="codepen">
  See the Pen <a href="https://codepen.io/chasenlehara/pen/qKeBeZ/">CanJS 5 Text Editor</a> by Chasen Le Hara (<a href="https://codepen.io/chasenlehara">@chasenlehara</a>) on <a href="https://codepen.io">CodePen</a>.
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
