@page Constructors Constructors
@parent Tutorial 3
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - Constructors in CanJS
  - The `extend` function
  - The `init` function
- - -

Before we work with any of the objects in CanJS, it will be helpful for us to
understand [can.Construct](../docs/can.Construct.html). We won’t be working
with `can.Construct` directly. However, many of the objects in CanJS are derived from
`can.Construct`. Understanding it, therefore, will make it easier for you to understand other
concepts we’re going to cover.

`can.Construct` provides a way to easily use the power of prototypal
inheritance without worrying about hooking up all the particulars
yourself. Without going into exhaustive detail, `can.Construct` contains
a few functions we’ll encounter frequently in other objects:

- Prototype
  - init
- Static
  - extend

We’ll look at the extend function first.

## The extend function
`can.Construct`’s `extend` function is used to create
“constructor functions”. Constructor functions create instances of objects.
The extend function can take up to three arguments:

1. `name`: string
2. `staticProperties`: object
3. `instanceProperties`: object

The `extend` function behaves differently depending on the number of arguments you
pass it. 
 - If you pass it one argument, it will use the value you pass it to set its
`instanceProperties`. 
 - If you pass it two arguments, it uses the first to set its
`staticProperties` and the second to set its `instanceProperties`. 
 - If you pass in all three arguments, the first will set its name, the second its
`staticProperties`, and the third its `instanceProperties`.

This pattern will apply to all objects in CanJS that have an extend function.
For example, if we only want to set `staticProperties` we must call the
function as follows:

```
can.Construct.extend({
  // Static properties here
}, {
  // Blank object as second parameter
});
```
This example is highlighted because calling a `can.Construct` with two parameters, 
the last of which is an empty object, is common. Also common is the mistake of
ommitting the last parameter of the call, which can lead to unexpected behavior.

## The init function
The `init` function is called whenever a new instance of a
`can.Construct` is created. `init` is where the bulk of your initialization code
should go. Inside of the `init` function, the `this` keyword will refer to the
new object instance created by the constructor. Additionaly, `this` will contain 
the instance properties you pass to the constructor. A common thing to do in `init` 
is save the arguments passed into the constructor. An example is below:

```
var Person = can.Construct.extend({
  init: function(first, last) {
    this.first = first;
    this.last = last;
  }
});

var actor = new Person('Abe', 'Vigoda');
```

- - -

<span class="pull-left">[&lsaquo; Application Design](ApplicationDesign.html)</span>
<span class="pull-right">[Observables &rsaquo;](Observables.html)</span>

</div>

