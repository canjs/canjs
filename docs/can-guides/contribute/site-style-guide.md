@page guides/contributing/site-style-guide Site Style Guide
@parent guides/contribute 7
@outline 3

@description
Learn about the website’s design and styles.

@body

## Headings

A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### H3

A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

#### H4

A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

##### H5

A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

###### H6

A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Block elements

A paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

- List element
- Another item
- Another item

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

- List element
	- nested
	- next
		- deep
			```
			foo
			```
- Another item
- Another item
	```
	bar
	```
	multiple paragraphs

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

1. Order lists
2. Number two
3. Number three

### Blockquote

> **Note:** Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Details and summary

<details>
<summary>This is a summary element that shows a paragraph</summary>

Another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
</details>

<details>
<summary>This is a summary element that shows a pre</summary>

@sourceref ../experiment/crud-beginner/1.js
</details>

## Code examples

### Bash

```bash
cd project
npm install can --save
```

### CodePen

@sourceref ../experiment/crud-beginner/2.js
@highlight 5-14,only
@codepen

### Demo

@demo demos/technology-overview/my-counter.html
@codepen

### HTML

```html
<hello-world></hello-world>
```

### Handlebars

```handlebars
{{# for(value of values) }}
	<p>{{ value }}</p>
{{ else }}
	<p>No items</p>
{{/ for }}
```

### JavaScript

@sourceref ../experiment/crud-beginner/1.js

### Expand button

#### Copy button only
@sourceref ../experiment/crud-beginner/2.js
@highlight 7-14,only

#### Copy and Run buttons
@sourceref ../experiment/crud-beginner/2.js
@highlight 7-14,only
@codepen

## Text elements

The following is a very long sentence that will hopefully go across many lines because it
is so long and filled with <code>code elements</code>, <strong>bold elements</strong>, <em>italic elements</em>, <a href="#">link elements</a>.

## Screenshots

Use the `bit-docs-screenshot` class on images to center them. Add a `width` to the image to set a max width.

### With width

<img alt="" class="bit-docs-screenshot" src="https://canjs.com/docs/can-guides/images/devtools/panel-component-selected.png" width="600px" />

### Without width

<img alt="" class="bit-docs-screenshot" src="https://canjs.com/docs/can-guides/images/devtools/panel-component-selected.png" />
