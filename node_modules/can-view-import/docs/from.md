@function can-view-import.from from
@parent can-view-import.attributes

@description Set the module name that will be imported into the template.

@signature `from="MODULE_NAME"`

Passes MODULE_NAME to [can-util/js/import/import] and sets the [can-view-import <can-import>]'s viewModel to be the returned Promise.

```html
<can-import from="bootstrap/bootstrap.css" />
```

@param {String} MODULE_NAME The name of the module to import.
