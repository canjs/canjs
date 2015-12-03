@page can.view.bindings
@parent canjs
@link ../docco/view/bindings/bindings.html docco

Provides template event, one-way, and two-way bindings. 

@body

## Use

The `can/view/bindings` plugin provides [can.view.attr custom attributes] useful for template declarative event, one-way and two-way 
bindings on element attributes, component [can.Component::viewModel viewModels], and the [can.view.Scope scope]. Bindings look like:

- `(event)="key()"` for event binding.
- `{prop}="key"` for one-way binding to a child.
- `{^prop}="key"` for one-way binding to a parent.
- `{(prop)}="key"` for two-way binding.

Adding $ to a binding like `($event)="key()"` changes the binding from the `viewModel` to the element's attributes or properties.

The following are the bindings that should be used with [can.stache] and are compatible with the upcoming 
3.0 release:

#### [can.view.bindings.event event]

Binds to `childEvent` on `<my-component>`'s [can.Component::viewModel viewModel] and calls 
`method` on the [can.view.Scope scope] with the specified arguments:

```
<my-component (child-event)="method('primitive', key, hash1=key1)"/>
```

Binds to `domEvent` on `<my-component>` and calls 
`method` on the [can.view.Scope scope] with the specified arguments.

```
<my-component ($dom-event)="method('primitive', key, hash1=key1)"/>
```

#### [can.view.bindings.toChild one-way to child]

Updates `childProp` in `<my-component>`'s [can.Component::viewModel viewModel] with `value` 
in the [can.view.Scope scope]:

```
<my-component {child-prop}="value"/>
```

Updates the `child-attr` attribute or property on `<my-component>` with `value` 
in the [can.view.Scope scope]:

```
<my-component {$child-attr}="value"/>
```

#### [can.view.bindings.toParent one-way to parent]

Updates `value` in the [can.view.Scope scope]  with `childProp` 
in `<my-component>`'s [can.Component::viewModel viewModel]:

```
<my-component {^child-prop}="value"/>
```

Updates `value` 
in the [can.view.Scope scope] with the `child-attr` attribute or property on `<my-component>`:

```
<my-component {^$child-attr}="value"/>
```

#### [can.view.bindings.twoWay two-way]

Updates `childProp` in `<my-component>`'s [can.Component::viewModel viewModel] with `value` 
in the [can.view.Scope scope] and vice versa:

```
<my-component {(child-prop)}="value"/>
```

Updates the `child-attr` attribute or property on `<my-component>` with `value` 
in the [can.view.Scope scope] and vice versa:

```
<my-component {($child-attr)}="value"/>
```

