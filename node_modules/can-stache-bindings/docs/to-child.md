@function can-stache-bindings.toChild key:from
@parent can-stache-bindings.syntaxes

@description One-way bind a value in the parent scope to the [can-stache-element StacheElement], [can-component.prototype.ViewModel can-component ViewModel], or element.

@signature `childProp:from="key"`

  Imports [can-stache.key] in the [can-view-scope scope] to `childProp` in the [can-stache-element StacheElement] or [can-component.prototype.view-model can-component ViewModel]. It also updates `childProp` with the value of `key` when `key` changes.

  ```html
  <my-element someProp:from="value" />
  ```

  > __Note:__ If [can-stache.key] is an object, changes to the object’s properties will still be visible to the component. Objects are passed by reference. See [can-stache-bindings#OneWayBindingWithObjects One Way Binding With Objects].

  @param {String} childProp The name of the property to set in the
  [can-stache-element StacheElement] or [can-component.prototype.ViewModel can-component ViewModel].

  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} key An expression whose resulting value is used to set as `childProp`.

@signature `child-prop:from="key"`

  Imports [can-stache.key] in the [can-view-scope scope] to `child-prop` property or attribute on the element.

  ```html
  <input value:from="name" />
  ```

@signature `vm:childProp:from="key"`

  Imports [can-stache.key] in the [can-view-scope scope] to `childProp` in the [can-stache-element StacheElement] or [can-component.prototype.view-model can-component ViewModel]. It also updates `childProp` with the value of `key` when `key` changes.

  ```html
  <my-element vm:childProp:from="key" />
  ```

  > __Note:__ If [can-stache.key] is an object, changes to the object’s properties will still be visible to the component. Objects are passed by reference. See [can-stache-bindings#OneWayBindingWithObjects One Way Binding With Objects].

Parameters are the same as [can-stache-bindings.toChild#childProp_from__key_ childProp:from="key"]

@signature `el:child-prop:from="key"`

  Imports [can-stache.key] in the [can-view-scope scope] to `child-prop` property or attribute on the element.

  ```html
  <input el:value:from="name" />
  ```

Parameters are the same as [can-stache-bindings.toChild#child_prop_from__key_ child-prop:from="key"]

@body

## Use

The [can-stache-bindings] page has many examples of [can-stache-bindings.toChild]. Specifically:

- [can-stache-bindings#Updateanelement_svaluefromthescope Update a component ViewModel’s value from the scope]
- [can-stache-bindings#UpdateacomponentViewModel_svaluefromthescope Pass a value from an element to the scope]
