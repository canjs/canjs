@function can-stache-bindings.toParent key:to
@parent can-stache-bindings.syntaxes

@description One-way bind a value from the [can-stache-element StacheElement], [can-component.prototype.ViewModel can-component ViewModel], or element to the parent scope.

@signature `childProp:to="key"`

Exports `childProp` in the [can-stache-element StacheElement] or [can-component.prototype.ViewModel can-component ViewModel] to [can-stache.key] in the parent [can-view-scope scope]. It also updates
`key` with the value of `childProp` when `childProp` changes.

```html
<my-element someProp:to="value" />
```

> __Note:__ If [can-stache.key] is an object, changes to the object’s properties will still be visible to the component. Objects are passed by reference. See [can-stache-bindings#OneWayBindingWithObjects One Way Binding With Objects].

@param {String} childProp The name of the property to export from the
child [can-stache-element StacheElement] or [can-component.prototype.ViewModel component’s ViewModel]. Use `this:to` or `.:to` to export the entire viewModel.

@param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} key An expression that will be used to set in the parent scope.

@signature `child-prop:to="key"`

  Exports the element’s `child-prop` property or attribute to [can-stache.key] in the parent [can-view-scope scope]. It also updates
  `key` with the value of `child-prop` when `child-prop` changes.

  ```html
  <input value:to="name" />
  ```

  @param {String} child-prop The name of the element’s property or attribute to export.

  @param {can-stache/expressions/literal|can-stache/expressions/key-lookup|can-stache/expressions/call|can-stache/expressions/helper} key An expression whose resulting value with be used to set in the parent scope.

@signature `vm:childProp:to="key"`

Exports `childProp` in the [can-stache-element StacheElement] or [can-component.prototype.ViewModel can-component ViewModel] to [can-stache.key] in the parent [can-view-scope scope]. It also updates
`key` with the value of `childProp` when `childProp` changes.

```html
<my-element vm:someProp:to="value" />
```

> __Note:__ If [can-stache.key] is an object, changes to the object’s properties will still be visible to the component. Objects are passed by reference. See [can-stache-bindings#OneWayBindingWithObjects One Way Binding With Objects].

Parameters are the same as [can-stache-bindings.toParent#childProp_to__key_ childProp:to="key"]

@signature `el:child-prop:to="key"`

  Exports the element’s `child-prop` property or attribute to [can-stache.key] in the parent [can-view-scope scope]. It also updates
  `key` with the value of `child-prop` when `child-prop` changes.

  ```html
  <input el:value:to="name" />
  ```

Parameters are the same as [can-stache-bindings.toParent#child_prop_to__key_ child-prop:to="key"]

@signature `on:VIEW_MODEL_OR_DOM_EVENT:KEY:to='SCOPE_VALUE'`


If the element is a [can-stache-element], listens to an event on the element and binds the element’s value to the SCOPE_VALUE when that event occurs.

If the element is a [can-component], listens to an event on the [can-component::ViewModel ViewModel] and binds the element’s value to the SCOPE_VALUE when that event occurs.

For all other elements, listens to an event on the element and binds binds the element’s value to the SCOPE_VALUE when that event occurs.


```html
<my-element on:show:value:to="myScopeProp" />
```

@param {String} VIEW_MODEL_OR_DOM_EVENT A viewModel or DOM event.

@param {String} SCOPE_VALUE A value in the current scope.


@body

## Use

The [can-stache-bindings] page has many examples of [can-stache-bindings.toParent]. Specifically:

- [can-stache-bindings#Passavaluefromanelementtothescope Pass a value from an element to the scope]
- [can-stache-bindings#Passavaluefromacomponenttothescope Pass a value from a component to the scope]
