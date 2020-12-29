@page can-stache-converters.examples.input-checkbox input[type=checkbox]
@parent can-stache-converters.examples

Cross bind a value to a checkbox.

@body

## Binding to checkboxes

To bind to a checkbox and set a boolean value within your [can-view-scope scope], set up a [can-stache-bindings.twoWay two-way] binding to the input’s `checked` property like so:

```
<input type="checkbox" checked:bind="val" />
```

[can-stache-converters] provides a couple of convenient converters that handle common use cases for binding to a checkbox.

## Binding based on whether an item is in a list

Using [can-stache-converters.boolean-to-inList] is useful to two-way bind to a checkbox based on whether an item is in a list or not. When the checkbox is checked/unchecked, the list will be updated and that item will either be removed or added to the list.

@demo demos/can-stache-converters/input-checkbox.html

## Binding based on a binary decision

An alternative true and false value can be specified by using [can-stache-converters.either-or]. This is used for setting up a “boolean” property that only has two possible valid values, whose values are modelled by the true/false checked property of a checkbox, as in the following example:


```
<input type="checkbox" checked:bind="either-or(val, 'a', 'b')" />
```

In this case, the data passed in as `val` is a [can-compute] that contains either the value **a** or **b**. If the value of `val` is **a** then the checkbox will be checked. When the user checks/unchecks the checkbox then the value of `val` is set to be either **a** or **b** depending on whether it is checked.

@demo demos/can-stache-converters/input-checkbox-binary.html
