@function can.view.bindings.toParent {^to-parent}
@parent can.view.bindings

@description One-way bind a value in the current [can.Component::viewModel viewModel] to the parent scope.

@signature `{^child-prop}="key"`

Exports `childProp` in the [can.Component::viewModel viewModel] to [can.stache.key] in the parent [can.view.Scope scope]. It also updates
`key` with the value of `childProp` when `childProp` changes.

```
<my-component {^some-prop}="value"/>
```

@param {String} child-prop The name of the property to export from the 
child components viewmodel. Use `{^this}` or `{^.}` to export the entire viewModel.

@param {String} key The name of the property to set in the parent scope.

@signature `{^$child-prop}="key"`

  Exports the element's `childProp` property or attribute to [can.stache.key] in the parent [can.view.Scope scope]. It also updates
  `key` with the value of `childProp` when `childProp` changes.

  ```
  <input {^$value}="name"/>
  ```

  @param {String} child-prop The name of the element's property or attribute to export.

  @param {String} key The name of the property to set in the parent scope.


@body

## Use

The use of `{^to-parent}` bindings changes between exporting __viewModel properties__ or __DOM properties__.

## Exporting ViewModel properties

`{^child-prop}="key"` can be used to export single values or the complete view model from a 
child component into the parent scope. Typically, the values are exported to the references scope.

For example, a `car-selector` parent component that contains a `year-selector` and a `car-list` component where 
we want to share the `selectedYear` property from `year-selector` as the `year` property can be done like this:

	<car-selector>
		<year-selector {^selected-year}="*year" />
		<car-list {selection)="*year" />
	</car-selector>
	
## Exporting DOM properties

`{^$child-prop}="key"` can be used to export an attribute value into the scope.  For example:

```
<input {^$value}="name"/>
```

Updates `name` in the scope when the `<input>` element's `value` changes.