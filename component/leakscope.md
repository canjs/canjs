@property {Boolean} can.Component.prototype.leakScope
@parent can.Component.prototype

A component's [can.Component::leakScope leakScope] option controls whether
the surrounding template where the component is used can directly share
viewModel with the component's internal viewModel. This option defaults to `true`,
which means `<content>` is able to access internal viewModel variables on the
component, and the component will be able to use outside variables when
used on a page.

For example, if the following component is defined:

    can.Component.extend({
        tag: "hello-world",
        leakScope: true, // the default value
        template: "{{greeting}} <content></content>{{exclamation}}",
        viewModel: { greeting: "Hello" }
    })

And used like so:

    <hello-world>{{greeting}}</hello-world>

With the following data in the surrounding viewModel:

    { greeting: "World", exclamation: "!" }

Will render the following if `leakScope` is true:

    <hello-world>Hello Hello!</hello-world>

But if `leakScope` is false:

    <hello-world>Hello World</hello-world>

Because when the viewModel isn't leaked, the internal `template` for the
component does not see the surrounding binding for `exclamation` or
`greeting`, and simply uses its internal `viewModel` to render its
template. This also affects where the `{{greeting}}` will be looked up, in
the light dom.

Using the `leakScope: false` option is useful for hiding and protecting
internal details of `can.Component`, potentially preventing accidental
clashes.