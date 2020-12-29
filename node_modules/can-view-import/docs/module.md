@function can-view-import.module module:to
@parent can-view-import.attributes

@description Set the module that is referenced by the [can-view-import.from from attribute] to a [can-stache.helpers.let block-level variable].

@signature `module:to="NAME"`

Sets up a [can-stache-bindings.toParent] binding to `NAME` in the block-level scope. Unlike [can-view-import.value value] this attribute isn't set by a Promise, so it's immediately available at initial template render, rather than being momentarily undefined.

@param {String} NAME The variable name to assign to in the [can-stache.helpers.let block-level scope]. This can be any string name you want to use, but it must not already be defined in the scope, or it will overwrite that existing value.

```html
<can-import from="app/person" module.default:to="person" />
<can-import from="app/helpers" module.properCase:to="properCase" />

<section>
	hello {{properCase(person.name)}}
</section>
```
