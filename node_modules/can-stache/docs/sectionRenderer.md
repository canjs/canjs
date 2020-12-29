@typedef {function()} can-stache.sectionRenderer sectionRenderer
@parent can-stache.types

@description Renders a section. These functions are usually provided as `.fn` and
`.inverse` on a stache helper’s [can-stache.helperOptions options].

@param {*|can-view-scope} [context] Specifies the data the section is rendered
with.  If a [can-view-scope] is provided, that scope is used to render the
section.  If anything else is provided, it is used to create a new scope object
with the current scope as its parent.  If nothing is provided, the current
scope is used to render the section.

@param {*|can-view-scope.Options} [helpers] Specifies the helpers the section is rendered
with.  If a [can-view-scope.Options] is provided, that scope is used to render the
section.  If anything else is provided, it is used to create a new scope object
with the current helper scope as its parent.  If nothing is provided, the current
helper scope is used to render the section.

@return {documentFragment|String} Returns the rendered result of the helper. If the
section is within a tag, like:

```html
<h1 {{#helper}}class='power'{{/helper}}>
```

a String is returned.  

If the section is outside a tag like:

```html
<div> {{#helper}}<h2>Tasks</h2>{{/helper}} </div>
```

a documentFragment is returned.

@body

## Use

Renderer functions are provided to stache [can-stache.helper helpers] on
the [can-stache.helperOptions options] argument and are used to render the
content between sections. The `context` and `helpers` option let you control
the data and helpers used to render the section.

The following example adds `{first: "Justin"}` to the lookup
data. Notice how the section has access to `first` and `last`.

```js
stache.registerHelper( "myhelper", function( options ) {
	const section = options.fn( { first: "Justin" } );
	return $( "<h1>" ).append( section );
} );

const template = stache(
	"{{#myHelper}}{{first}} {{last}}{{/myHelper}}" );

template( { last: "Meyer" } ); //-> <h1>Justin Meyer</h1>
```

If no `context` is provided, the current context is passed.  Notice
how the section has access to `last`:

```js
stache.registerHelper( "myhelper", function( options ) {

	const section = options.fn();
	return $( "<h1>" ).append( section );

} );

const template = stache(
	"{{#myHelper}}{{first}} {{last}}{{/myHelper}}" );

template( { last: "Meyer" } ); //-> <h1> Meyer</h1>
```

If a [can-view-scope] is provided, it is used to render the
section. Notice how `last` is not available in the section:

```js
stache.registerHelper( "myhelper", function( options ) {

	const section = options.fn( new Scope( { first: "Justin" } ) );
	return $( "<h1>" ).append( section );

} );

const template = stache(
	"{{#myHelper}}{{first}} {{last}}{{/myHelper}}" );

template( { last: "Meyer" } ); //-> <h1>Justin </h1>
```
