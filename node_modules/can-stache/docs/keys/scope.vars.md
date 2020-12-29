@typedef {String} can-stache/keys/scope/scope.vars scope.vars
@parent can-stache/deprecated
@description Used to reference variables specific to the template context

@deprecated {4.15.0} Use `{{ let }}` [can-stache.helpers.let] instead.

@signature `scope.vars`

A placeholder for a value that is local to the template.

```html
<drivers-licenses selected:to="scope.vars.selectedDriver"/>
<edit-driver driver:from="scope.vars.selectedDriver"/>
```

@body

## Use

Template variables are often used to pass data between
components. `<component-a>` exports its `propA` value to the
template variable `scope.vars.variable`.  This is, in turn, used to update
the value of `propB` in `<component-b>`.

```html
<component-a propA:to="scope.vars.variable"/>
<component-b propB:from="scope.vars.variable"/>
```

Template variables are global to the template. Similar to JavaScript `var`
variables, template variables do not have block level scope.  The following
does not work:

```html
{{#each something}}
	<component-a propA:to="scope.vars.variable"/>
	<component-b propB:from="scope.vars.variable"/>
{{/each}}
```

To work around this, an `localContext` helper could be created as follows:

```js
stache.registerHelper( "localContext", function( options ) {
	return options.fn( new Map() );
} );
```

And used like:

```html
{{#each something}}
	{{#localContext}}
	  <component-a propA:to="./variable"/>
	  <component-b propB:from="./variable"/>
	{{/localContext}}
{{/each}}
```
