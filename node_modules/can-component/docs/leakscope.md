@property {Boolean} can-component.prototype.leakScope leakScope
@parent can-component.deprecated

@deprecated {4.0} [can-stache-bindings#Passavaluefromacomponenttothescope Pass a value from a component to the scope] instead.

@description Allow reading the outer scope values from a component’s view and
a component’s viewModel values in the user content.

@option {Boolean}  `false` limits reading to:

- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
- the component’s [can-component.prototype.ViewModel] values from the user content.

The default value is `false`.

To change leakScope from the default:

```js
import Component from "can-component";

Component.extend( {
	tag: "my-component",
	leakScope: true,
	ViewModel: { message: { default: "Hello World!" } },
	view: "{{message}}"
} );
```

Leaving `leakScope` as the default `false` is useful for hiding and protecting
internal details of `Component`, potentially preventing accidental
clashes. It can be helpful to set it to `true` if you, for example, wanted to customize __user content__
based on some value in the component’s ViewModel.

@body

## Use

A component’s [can-component::leakScope leakScope] option controls if a
component’s view can access the component’s outer scope and the
user content can read the component’s view model.

Let’s define what __outer scope__, __component’s view__ and __user content__ mean.

If I have a `<hello-world>` component in a view like:

```html
{{#data}}
	<hello-world>{{subject}}</hello-world>
{{/data}}
```

The __outer scope__ of `<hello-world>` has `data` as its context.  The __user content__ of
`<hello-world>` is the view between its tags.  In this case, the __user content__
is `{{subject}}`.

Finally, if `<hello-world>` is defined like:

```js
Component.extend( {
	tag: "hello-world",
	view: "{{greeting}} <content/>{{exclamation}}"
} );
```

`{{greeting}} <content/>{{exclamation}}` represents the __component’s view__.

## Using outer scope in component view

If `leakScope` is `true`, the __component’s view__ can read the data in the outer scope and will
[can-view-scope.prototype.find] `name: "John"` in the following example:

```js
Component.extend( {
	tag: "hello-world",
	leakScope: true, // changed to true instead of the default value
	view: "Hello {{scope.find('name')}}"
} );
```

With this data in the outer scope:

```js
{ name: "John" }
```

And used like so:

```html
<hello-world />
```

If `leakScope` is `true` it will render:

```html
<hello-world>Hello John</hello-world>
```

If `leakScope` is `false` it will render:

```html
<hello-world>Hello </hello-world>
```

[Play with this example on JS Bin.](https://bitovi-jsbin.jsbin.com/safigic/38/edit?js,output)

## Using viewModel in user content

if `leakScope` is `true`, the __user content__ is able to see the name property on the component’s
viewModel instance in the following example. Else, name won't be seen.

If the following component is defined:

```js
Component.extend( {
	tag: "hello-world",
	leakScope: true, // changed to true instead of the default value
	ViewModel: { name: { default: "World" } },
	view: "Hello <content />"
} );
```

With this data in the outer scope:

```js
{ name: "John" }
```

And used like so:

```html
<hello-world>{{name}}</hello-world>
```

If `leakScope` is `true` it will render:

```html
<hello-world>Hello World</hello-world>
```

If `leakScope` is `false` it will render:

```html
<hello-world>Hello John</hello-world>
```

[Play with this example on JS Bin.](https://bitovi-jsbin.jsbin.com/safigic/40/edit?js,output)
