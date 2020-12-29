@function can.view.bindings.toChild {to-child}
@parent can.view.bindings 1

@description One-way bind a value in the parent scope to the [can.Component::viewModel viewModel].

@signature `{child-prop}="key"`

  Imports [can.stache.key] in the [can.view.Scope scope] to `childProp` in [can.Component::viewModel viewModel]. It also updates
  `childProp` with the value of `key` when `key` changes.

  ```
  <my-component {some-prop}="value"/>
  ```

  @param {String} child-prop The name of the property to set in the 
  component's viewmodel.

  @param {can.stache.expressions} key A KeyLookup or Call expression whose value
  is used to set as `childProp`. 

@signature `{$child-prop}="key"`

  Imports [can.stache.key] in the [can.view.Scope scope] to `childProp` property or attribute on the element. 

  ```
  <input {$value}="name"/>
  ```

  This signature works, but the following should be used instead:
  
  ```
  <input value="{{name}}"/>
  ```

@body

## Use

`{child-prop}="key"` is used to pass values from the scope to a component.  You can use CallExpressions like:

```
<player-scores {scores}="game.scoresForPlayer('Alison')"/>
<player-scores {scores}="game.scoresForPlayer('Jeff')"/>
```

@demo can/view/bindings/doc/to-child.html
