@page Observables Observables
@parent Tutorial 3
@disableTableOfContents

@body

<div class="getting-started">

- - - -
**In this Chapter**
 - `can.Map` and `can.List`

- - -

[`can.Map`](../docs/can.Map.html) objects are observable. Observable objects provide a way
for you to listen for and keep track of changes to them. What this means, in
this instance, is that if you make a change to your scope, those changes will
be reflected automatically in your view. If you’ve cross-bound the values
between your scope and your view, changes to your view will also be reflected
in your scope. We’ll see how this works in a later chapter.

`can.Map` objects listen for changes made using their `attr` function. This is
important. In order to broadcast the associated events when you change a
property on a `can.Map`, you must use the `attr` function when setting a value.

The `attr` function can be used to either get or set a property on a `can.Map`.
`attr` works with deep properties&mdash;i.e., properties within properties. Here’s
an example:

```
// Get the first property off of the name property off of person
myCanMapInstance.attr('person.name.first');

// Set the last property of the person’s name property
myCanMapInstance.attr('person.name.last', 'Bach');
```

Observable arrays are also available with [`can.List`](can.List.html), which is based on `can.Map`.

- - -

<span class="pull-left">[&lsaquo; Application Foundations](ApplicationFoundations.html)</span>
<span class="pull-right">[The Define Plugin &rsaquo;](TheDefinePlugin.html)</span>

</div>
