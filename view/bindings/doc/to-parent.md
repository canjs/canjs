@function can.view.bindings.toParent {^to-parent}
@parent can.view.bindings 2

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

In the following example, it connects the __selected__ driver in `<drivers-list>` with an editable __plateName__ in
`<edit-plate>`:

    <drivers-list {^selected}="*editing"/>
    <edit-plate {(plate-name)}="*editing.licensePlate"/>

@demo can/view/bindings/doc/to-parent.html
	
## Exporting DOM properties

`{^$child-prop}="key"` can be used to export an attribute value into the scope.  For example:

```
<input {^$value}="name"/>
```

Updates `name` in the scope when the `<input>` element's `value` changes.

## Exporting Functions

You can export a function to the parent scope with a binding like:

```
<my-tabs {^@add-panel}="@*addPanel">
```

And pass the method like:

```
<my-panel {add-panel}="@*addPanel" title="CanJS">CanJS Content</my-panel>
```

Check it out in this demo:

@demo can/view/bindings/doc/to-parent-function.html

Notice that `@` is used to prevent reading the function.  

