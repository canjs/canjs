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