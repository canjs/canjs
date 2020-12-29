@typedef {function(this:can-stache.context,...*,can-stache.sectionOptions){}} can-stache.simpleHelper(arg,options) simpleHelper
@parent can-stache.types

@description A helper function passed to [can-stache.addHelper].

@param {*} [...arg] Arguments passed from the tag. After the helper
name, any space separated [can-stache.key keys], numbers or
strings are passed as arguments.

The following template:

```html
<p>{{madLib "Lebron James" verb 4}}</p>
```

Rendered with

```js
{ verb: "swept" }
```

Will call a `madLib` helper with the following arguments.

```js
stache.addHelper( "madLib", function( subject, verb, number ) {

	// subject -> "Lebron James"
	// verb -> "swept"
	// number -> 4
} );
```

Unlike [can-stache.helper] simple helpers will always pass the actual
value (instead of a compute).

@param {can-stache.helperOptions} options An options object
that gets populated with optional:

- `fn` and `inverse` section rendering functions
- a `hash` object of the maps passed to the helper

@this {can-stache.context} The context the helper was
called within.

@return {String|function(HTMLElement)} The content to be inserted into
the template.

@body


## Returning an element callback function

If a helper returns a function, that function is called back after
the template has been rendered into DOM elements. This can
be used to create mustache tags that have rich behavior.

If the helper is called __within a tag__ like:

```html
<ul {{sortable}}/>
```

The returned function is called with the `<ul>` element:

```js
stache.addHelper( "sortable", function() {
	return function( el ) {
		$( el ).slider();
	};
} );
```

If the helper is called __between tags__ like:

```html
<ul>{{items}}</ul>
```

The returned function is called with a temporary element. The
following helper would be called with a temporary `<li>` element:

```js
stache.addHelper( "items", function() {
	return function( li ) {

	};
} );
```

The temporary element depends on the parent element. The default temporary element
is a `<span>` element.
