@page can.stache.magicTagTypes Magic Tag Types
@parent can.stache.pages 0

## Magic tag types

Rendering behavior is controled with magic tags that look like `{{}}`.  There
are two main forms of magic tags:

 - Insertion tags - insert their value into the result like `{{key}}` and `{{{key}}}`.
 - Section tags - optional render a sub-section like `{{#key}} ... {{/key}}`. 

Lets see the general behavior of each tag type:

### Insertion Tags

Insertion tags render a value into result.

#### [can.stache.tags.escaped]

Inserts the escaped value of `key` into the result. This is your most common tag.

```
Template:
	<div>{{name}}</div>

Data:
	{ name: "<b>Justin</b>" }

Result:
	<div>&lt;b&gt;Justin&lt;/b&gt;</div>
```

#### [can.stache.tags.unescaped]

Inserts the unescaped value of `key` into the result.

```
Template:
	<div>{{{name}}}</div>

Data:
	{ name: "<b>Justin</b>" }

Result:
	<div><b>Justin</b></div>
```

#### [can.stache.helpers.partial]

Renders another template with the same context as the current context.

```
var template = can.stache("<h1>{{>title}}</h1>");
  
	
var frag = template(
	{message: "Hello"},
	{
		partials: { title: 	can.stache("<blink>{{message}}</blink>”) }
	});
	
	frag //-> <h1><blink>Hello</blink></h1>
```

Other ways to load and reference partials are discussed [can.stache.helpers.partial here]. 

#### [can.stache.tags.comment]

Ignores the magic tag.

```
Template:
	<h1>{{!message}}</h1>

Data:
	{ message: "<blink>Hello</blink>" };

Result:
	<h1></h1>
```

### Section Tags

Section tags are passed a subsection and an optional inverse subsection. They
optionally render the subsections and insert them into the result.

#### [can.stache.tags.section {{#key}} ... {{/key}}]

Renders the subsection or inverse subsection depending on the value of key.

If `key` is truthy, renders the subsection: 

```
Template:
	<h1>{{#shown}}Hello{{/shown}}</h1>

Data:
	{ shown: true };

Result:
	<h1>Hello</h1>
```

The subsection is rendered with the `key` value as the top of the scope:

```
Template:
	<h1>{{#person}}Hello {{first}}  {{person.last}}{{/person}}</h1>

Data:
	{ person: {first: "Alexis", last: "Abril"} };

Result:
	<h1>Hello Alexis Abril</h1>
```


If `key` is falsey, renders the inverse subsection if present: 

```
Template:
	<h1>{{#shown}}Hello{{else}}Goodbye{{/shown}}</h1>

Data:
	{ shown: false };

Result:
	<h1>Goodbye</h1>
```

If `key` is array-like and its `length` is greater than 0, the subsection
is rendered with each item in the array as the top of the scope:

```
Template:
	<p>{{#items}}{{.}} {{/items}}</p>

Data:
	{items: [2,4,8,16]}

Result:
	<p>2 4 8 16 </p>
```

If `key` is array-like and its `length` is 0, the inverse subsection
is rendered:

```
Template:
	<p>{{#items}}{{.}} {{else}}No items{{/items}}</p>

Data:
	{items: []}

Result:
	<p>No items</p>
```

#### [can.stache.tags.inverse {{^key}} ... {{/key}}]

The [can.stache.tags.inverse inverse] section does the opposite of the
normal [can.stache.tags.section] tag.  That is, it renders
the subsection when [can.stache.tags.section] would render the inverse subsection 
and it renders the inverse subsection when [can.stache.tags.section] would
render the subsection.

```
Template:
	<h1>{{^shown}}Hello{{/shown}}</h1>

Data:
	{ shown: false };

Result:
	<h1>Hello</h1>
``` 