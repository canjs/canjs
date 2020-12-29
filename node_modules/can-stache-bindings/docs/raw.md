@function can-stache-bindings.raw key:raw
@parent can-stache-bindings.syntaxes

@description One-way bind a string value to the [can-stache-element StacheElement], [can-component.prototype.ViewModel can-component ViewModel], or element.

@signature `childProp:raw="value"`

  Sets the string value `"value"` to `childProp` in [can-component.prototype.view-model viewModel].

  ```html
  <my-element someProp:raw="35" />
  ```

  @param {String} childProp The name of the property to set in the
  component’s viewmodel.

  @param {can-stache/expressions/literal} value A string literal from which `childProp` will be set.

@body

## Use

`childProp:raw="value"` is used to set a value on a child ViewModel to a string value. Use this to avoid having to wrap raw values in quotes.

The two uses below are equivalent:

```html
<player-scores scores:from="'37'" />
<player-scores scores:raw="37" />
```
