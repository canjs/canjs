@function can-stache-converters.selected-to-index selected-to-index
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that binds an index in a list to the selected item's value as a viewModel property.

@signature `selected-to-index(index, list)`

When the getter is called, returns the item at the passed in index (which should be a [can-compute] from the provided list.

When the setter is called, takes the selected item and finds the index from the list and passes that to set the compute’s value.

```handlebars
<input value:bind="selected-to-index(index, people)" />
```

@param {can-compute} item A compute whose value is an index from the list.
@param {can-define/list/list|can-list|Array} list A list used to find the `item`.
@return {can-compute} A compute that will be two-way bound to the value.

@body

## Use

The provided `index` **must** be a [can-compute] so that its value can be set on user actions.

@demo demos/can-stache-converters/selected-to-index.html
