@typedef {function(this:can-stache.context,...*,can-stache.sectionOptions){}} can-stache.helper(arg,options) helper
@parent can-stache.types

@description A helper function passed to [can-stache.addLiveHelper].

Given the arguments, returns the content that should be shown in the DOM
or a function that will be called on the DOM element the helper was
called on.

@param {*|can-compute} [...arg] Arguments passed from the tag. After the helper
name, any space separated [can-stache.key keys], numbers or
strings are passed as arguments. [can-stache.key Keys] that
read an observable value in [can-stache/expressions/helper helpers] are passed as [can-compute.computed]s .

@param {can-stache.helperOptions} [options] An options object
that is an additional argument in `Helper` expressions that is populated with optional:

- `fn` and `inverse` section rendering functions
- a `hash` object of the maps passed to the helper

@this {can-stache.context} The context the helper was
called within.

  @return {documentFragment|String|Array|function(Node)} The content to be inserted into the template or a callback function.  The content can be a:

   - `documentFragment` like those returned by [can-stache.helperOptions].fn.
   - `String` like `"Hello World"`
   - `Array` of strings and nodes like `["Hello", document.createElement('div')]`

  If a `function(Node)` is returned, it will be called back with an HTML Element or text node.  

  If the helper is called on an element like:

  ```html
  <div {{myHelper}}>
  ```

  …the callback function will be called with the `div`.  

  If the helper is called
  outside of an element’s tag like:

  ```html
  <div> {{myHelper}} </div>
  ```

  …the callback function will be called with a placeholder text node.  


@body


## Returning an element callback function

If a helper returns a function, that function is called back after
the template has been rendered into DOM elements. This can
be used to create stache tags that have rich behavior.

If the helper is called __within a tag__ like:

```html
<ul {{sortable}}/>
```

The returned function is called with the `<ul>` element:

```js
stache.registerHelper( "sortable", function() {
	return function( el ) {
		$( el ).slider();
	};
} );
```

If the helper is called __between tags__ like:

```html
<ul>{{items}}</ul>
```

The returned function is called with a temporary text node:

```js
stache.registerHelper( "items", function() {
	return function( textNode ) {

		// do something, probably replace textNode
	};
} );
```

While this form of helper is still supported, it’s more common
to create similar functionality with [can-component] or [can-view-callbacks].
