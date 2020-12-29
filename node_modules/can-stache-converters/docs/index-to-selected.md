@function can-stache-converters.index-to-selected index-to-selected
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that binds to a `<select>` value in order to two-way bind a selected item from a list to the selected item's index as a viewModel property.

@signature `index-to-selected(item, list)`

When the getter is called, returns the index of the passed in item (which should be a [can-compute] from the provided list.

When the setter is called, takes the selected index value and finds the item from the list with that index and passes that to set the compute’s value.

```handlebars
<select value:bind="index-to-selected(person, people)">

	{{#each people}}

		<option value="{{scope.index}}">{{name}}</option>

	{{/each}}

</select>
```

@param {can-compute} item A compute whose item is in the list.
@param {can-define/list/list|can-list|Array} list A list used to find the `item`.
@return {can-compute} A compute that will be two-way bound to the select’s value.

@body

## Use

This will most often be used in conjunction with a `<select>` element and a bunch of options.

The provided `item` **must** be a [can-compute] so that its value can be set when the user selects own of the dropdown options.

You **must** use the indexes from the list as your `<option>` values. This is how it looks up items in the list both in the getter and the setter.

@demo demos/can-stache-converters/index-to-selected.html
