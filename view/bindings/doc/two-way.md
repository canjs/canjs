@function can.view.bindings.twoWay {\(two-way\)}
@parent can.view.bindings 3

@description Two-way bind a value in the [can.Component::viewModel viewModel] or the element to the parent scope.

@signature `{(child-prop)}="key"`

  Two-way binds `childProp` in the  [can.Component::viewModel viewModel] to 
  [can.stache.key] in the parent [can.view.Scope scope].  If `childProp` is updated `key` will be updated
  and vice-versa.
  
  ```
  <my-component {(some-prop)}="value"/>
  ```
  
  When setting up the binding:
  
  - If `childProp` is `undefined`, `key` will be set to `childProp`.
  - If `key` is `undefined`, `childProp` will be set to `key`.
  - If both `childProp` and `key` are defined, `key` will be set to `childProp`.
  


  @param {String} child-prop The name of the property of the viewModel to two-way bind.

  @param {String} key The name of the property to two-way bind in the parent scope.

@signature `{($child-prop)}="key"`

  Two-way binds the element's `childProp` property or attribute to 
  [can.stache.key] in the parent [can.view.Scope scope].  If `childProp` is updated `key` will be updated
  and vice-versa.

  ```
  <input {($value)}="name"/>
  ```

  @param {String} child-prop The name of the element's property or attribute to two-way bind.

  @param {String} key The name of the property to two-way bind in the parent scope.
  
@body

## Use

`{(child-prop)}="key"` is used to two-way bind a value in a [can.Component::viewModel viewModel] to
a value in the  [can.view.Scope scope].  If one value changes, the other value is updated.

The following two-way binds the `<edit-plate>` element's `plateName` to the `editing.licensePlate`
value in the scope.  This allows `plateName` to update if `editing.licensePlate` changes and
`editing.licensePlate` to update if `plateName` changes.

@demo can/view/bindings/doc/two-way.html

This demo can be expressed a bit easier with the references scope:

@demo can/view/bindings/doc/reference.html

## Initialization

When a binding is being initialized, the behavior of what the viewModel and scope properties
are set to depends on their initial values.

If the viewModel value is `not undefined` and the scope is `undefined`, scope will be set to the viewModel value.

If the viewModel value is `undefined` and the scope is `not undefined`, viewModel will be set to the scope value.

If both the viewModel and scope are `not undefined`, viewModel will be set to the scope value.

