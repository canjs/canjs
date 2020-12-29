@typedef {Object} can-set-legacy/Set Set
@parent can-set-legacy.types

An object that represents a set of data.

@type {Object}

A `Set` is a plain JavaScript object used to represent a
[https://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation set] of data usually returned by the server.  For example,
a list of all completed todos might be represented by:

```
{complete: true}
```

This set might be passed to [can-connect/can/map/map.getList] like:

```
Todo.getList({complete: true})
```

A [can-set-legacy.Algebra] is used to detail the behavior of these sets like:

```
var todoAlgebra = new set.Algebra(
  set.props.boolean("complete")    
);
```

Using an algebra, all sorts of special behaviors can be performed:

```
todoAlgebra.union({complete: true}, {complete: false}) //-> {}
```
