@function can-stache.safeString safeString
@parent can-stache.static

@description Indicate that a string does not need to be escaped to be safely
inserted into the page.

@signature `stache.safeString(str)`

By default, stache tries to prevent some common forms of [cross site scripting attacks](https://en.wikipedia.org/wiki/Cross-site_scripting) by escaping content passed
to tags like [can-stache.tags.escaped] and the result of helpers.  However,
one will often need to create helpers that return HTML content that shouldn’t be escaped.

`stache.safeString` can be used to indicate that a returned string from a helper is safe:

```js
stache.registerHelper( "myHelper", function() {
	return stache.safeString( "<blink>Hello There!</blink>" );
} );
```

@param {String} str A string you don’t want to become escaped.
@return {String} A string flagged by `stache` as safe, which will
not become escaped, even if you use [can-stache.tags.escaped].

@body

## Use

If you write a helper that generates its own HTML, you will
usually want to return a `stache.safeString.` In this case,
you will want to manually escape parameters with [can-string.esc].


```js
import string from "can-string";

stache.registerHelper( "link", function( text, url ) {
	text = string.esc( text );
	url  = string.esc( url );

	const result = "<a href=\"" + url + "\">" + text + "</a>";
	return stache.safeString( result );
} );
```


Rendering:

```html
<div>{{link "Google", "http://google.com"}}</div>
```

Results in:

```html
<div><a href="http://google.com">Google</a></div>
```

As an anchor tag whereas if we would have just returned the result rather than a
`stache.safeString` our template would have rendered a div with the escaped anchor tag.
