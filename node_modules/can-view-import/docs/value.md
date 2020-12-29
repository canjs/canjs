@function can-view-import.value value:to
@parent can-view-import.attributes

@description Set the value that is returned from the [can-view-import can-import] Promise to a [can-stache-bindings.reference reference scope] variable.

@signature `value:to="scope.vars.NAME"`

Sets up a [can-stache-bindings.toParent] binding to `scope.vars.NAME` in the references scope.

@param {String} NAME The variable name to assign to the [can-stache/keys/scope/scope.vars references scope]. This can be any string name you want to use, but must be preceded by `scope.vars.` or it will be placed on the template’s View Model.

```html
<can-import from="app/person" value:to="scope.vars.person" />

<section>
	hello {{scope.vars.person.name}}
</section>
```
