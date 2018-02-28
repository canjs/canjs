@page guides/recipes/text-editor Text Editor (Medium)
@parent guides/recipes

@description This guide walks you through building a
basic rich text editor.


@body

In this guide you will learn how to:

- exec
- selection
- ranges, compare
- walk the DOM and perform mutations

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/boxibac/6/embed?output&height=400px">JS Bin on jsbin.com</a>

The following sections are broken down the following parts:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __How to verify it works__ - How to make sure the solution works if it's not obvious.
- __The solution__ — The solution to the problem.

## Setup ##

__START THIS TUTORIAL BY CLONING THE FOLLOWING JS Bin__:

> Click the `JS Bin` button.  The JSBin will open in a new window. In that new window, under `File`, click `Clone`.

<a class="jsbin-embed" href="https://jsbin.com/qeguhac/2/embed?html,js,output">CanJS Text Editor on jsbin.com</a>

This JS Bin:

- Loads CanJS
- Implements 3 helper functions we will use later: `siblingThenParentUntil`, `splitRangeStart` and `splitRangeEnd`.
- Mocks out the signature for helper functions we will implement later: `getElementsInRange` and `rangeContains`.

### The problem
- Setup a basic CanJS app
- A "contenteditable" element with some starter HTML.
### What you need to know
- basic canjs setup
- content editable

### The solution

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-16,only

Update the __HTML__ `<body>` element to:

@sourceref ./1-setup.html
@highlight 2-3,only





## Add a bold button ##

### The problem

- bold the content the user has selected

### What you need to know

- create a view model with function
- on:click
- execCommand

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-bold.js
@highlight 4-6,18-23,only







## Add an italic button ##

### The problem

### What you need to know

- nothing

### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-italic.js
@highlight 6,only







## Add a copy button ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./4-copy.js
@highlight 7,25-39,only







## Add a Funky button that works when selecting a single text node ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-funky-text.js
@highlight 8,41-49,53-59,only







## Make the Funky button only work within the editable area

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-funky-only.js
@highlight 42-44,49,53,67-70,only







## Make the Funky button work when selecting multiple text nodes ##

### The problem

### What you need to know

### The solution

Update the __JavaScript__ tab to:

@sourceref ./7-funky-range.js
@highlight 62-82,86-119,only








<script src="//static.jsbin.com/js/embed.min.js?4.0.4"></script>
