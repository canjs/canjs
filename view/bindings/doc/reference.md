@function can.view.bindings.reference #REFERENCE
@parent can.view.bindings

@description Export a value into a template's references scope.

@signature `#ref-prop[="{childProp}"]`

  Two-way binds a property from a child component's [can.Component.prototype.viewModel viewModel] to a value in the 
  references scope.

  @param {String} prop The name of the property to set in the template's 'references' scope.

  @param {String} [childProp] The name of the property to import from the child components 
  viewModel. If this is not provided, the component's `viewModel` is exported.



@signature `#ref-prop[="{{childProp}}"]`

  One-way binds a property from a child component's [can.Component.prototype.viewModel viewModel] to a value in the 
  references scope.

  @param {String} prop The name of the property to set in the template's 'references' scope.

  @param {String} [childProp] The name of the property to import from the child components 
  viewModel. If this is not provided, the component's `viewModel` is exported.




@body

## Use

### Two way binding

`#prop="{childProp}"` can be used to export single values or the complete `viewModel` from a child component 
into the current template's "references" scope without having to set up a shared property in the parent component. 

For example, the following links `selected.licensePlate` in `<drivers-select>` to a `selectedPlate` value
that is global to the current template, but only available within the template.

	<drivers-select #selected-plate="{selected.licensePlate}"/>
	<edit-plate plate-name="{selectedPlate}"/>
	
Notice that updates to `selectedPlate` update `selected.licensePlate` and vice-versa.  This means
that  `selectedPlate` and `selected.licensePlate` are two-way bound.

@demo can/view/bindings/doc/reference-two-way.html

### One way binding

If the reference value will not or should not be updated by other components, use 
`#prop="{{childProp}}"` to export a value from a `viewModel` or the `viewModel` itself, but not
update the `viewModel` if the exported value is changed.

For example, the following exports `selectedYear` in `<year-selector>` as `year`.  `selectedYear` will
not be updated even if the value `year` is updated.

    <year-selector #year="{{selectedYear}}" />
    Celebrate like it's {{year}}!

@demo can/view/bindings/doc/reference-one-way.html