@function can.view.bindings.reference *REFERENCE
@parent can.view.bindings 4

@description Export a viewModel into a template's references scope.

@signature `*ref-prop`

  A shorthand for exporting an element's viewModel to the reference scope.

  @param {String} ref-prop The name of the property to set in the template's 'references' scope.

@body

## Use

Export a view model to the references scope by adding an attribute with the 
hypenated name of the reference scope property:

```
<year-selector *year-selector />
```


@demo can/view/bindings/doc/reference-one-way.html