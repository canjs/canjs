@page can-stache.magicTagTypes Magic Tag Types
@parent can-stache.pages 0
@hide

@body



Let’s see the general behavior of each tag type:

### Insertion Tags

Insertion tags render a value into result.

#### [can-stache.tags.escaped]

Inserts the escaped value of `expression` into the result. This is the most common tag.

```html
<!-- Template -->
<div>{{name}}</div>
```

```js
{ name: "<b>Justin</b>" }
```

```html
<!-- Result -->
<div>&lt;b&gt;Justin&lt;/b&gt;</div>
```

#### [can-stache.tags.unescaped]

Inserts the unescaped value of `expression` into the result.

```html
<!-- Template -->
<div>{{{name}}}</div>
```

```js
{ name: "<b>Justin</b>" }
```

```html
<!-- Result -->
<div><b>Justin</b></div>
```

This also works for rendering [can-stache-element] instances:

```js
import {StacheElement, stache} from "can";

class MyGreeting extends StacheElement {
  static view = `<p>Hello {{subject}}</p>`;

  static props = {
    subject: String
  }
}

customElements.define("my-greeting", MyGreeting);


const myGreetingInstance = new MyGreeting({
  subject: "friend"
});

const template = stache("<div>{{{componentInstance}}}</div>");

const fragment = template({
  componentInstance
});

fragment; //-> <div><my-greeting><p>Hello friend</p></my-greeting></div>
```

#### [can-stache.tags.partial]

Renders another template with the same context as the current context.

```js
const template = stache( "<h1>{{>title}}</h1>" );


const frag = template(
	{ message: "Hello" },
	{
		partials: { title: stache( "<blink>{{message}}</blink>" ) }
	} );

frag; //-> <h1><blink>Hello</blink></h1>
```

Other ways to load and reference partials are discussed [can-stache.tags.partial here].

#### [can-stache.tags.comment]

Ignores the magic tag.

```html
<!-- Template -->
<h1>{{!message}}</h1>
```

```js
{ message: "<blink>Hello</blink>"; };
```

```html
<!-- Result -->
<h1></h1>
```

### Section Tags

Section tags are passed a subsection and an optional inverse subsection. They
optionally render the subsections and insert them into the result.

#### [can-stache.tags.section {{#expression}} ... {{/expression}}]

Renders the subsection or inverse subsection depending on the value of expression.

If `expression` is truthy, renders the subsection:

```html
<!-- Template -->
<h1>{{#shown}}Hello{{/shown}}</h1>
```

```js
{ shown: true; };
```

```html
<!-- Result -->
<h1>Hello</h1>
```

The subsection is rendered with the `expression` value as the top of the scope:

```html
<!-- Template -->
<h1>{{#person}}Hello {{first}}  {{person.last}}{{/person}}</h1>
```

```js
{ person: { first: "Alexis", last: "Abril" } }
```

```html
<!-- Result -->
<h1>Hello Alexis Abril</h1>
```

If `expression` is falsey, renders the inverse subsection if present:

```html
<!-- Template -->
<h1>{{#shown}}Hello{{else}}Goodbye{{/shown}}</h1>
```

```js
{ shown: false }
```

```html
<!-- Result -->
<h1>Goodbye</h1>
```

If `expression` is array-like and its `length` is greater than 0, the subsection
is rendered with each item in the array as the top of the scope:

```html
<!-- Template -->
<p>{{#items}}{{.}} {{/items}}</p>
```

```js
{ items: [ 2, 4, 8, 16 ] }
```

```html
<!-- Result -->
<p>2 4 8 16 </p>
```

If `expression` is array-like and its `length` is 0, the inverse subsection
is rendered:

```html
<!-- Template -->
<p>{{#items}}{{.}} {{else}}No items{{/items}}</p>
```

```js
{ items: [] }
```

```html
<!-- Result -->
<p>No items</p>
```

#### [can-stache.tags.inverse {{^expression}} ... {{/expression}}]

The [can-stache.tags.inverse inverse] section does the opposite of the
normal [can-stache.tags.section] tag.  That is, it renders
the subsection when [can-stache.tags.section] would render the inverse subsection
and it renders the inverse subsection when [can-stache.tags.section] would
render the subsection.

```html
<!-- Template -->
<h1>{{^shown}}Hello{{/shown}}</h1>
```

```js
{ shown: false }
```

```html
<!-- Result -->
<h1>Hello</h1>
```
