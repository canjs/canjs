@function can-stache-converters.not not
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that two-way binds the negation of a value.

@signature `not(value)`

When the getter is called, gets the value of the compute and returns the negation.

When the setter is called, sets the compute’s value to the negation of the new value derived from the element.

*Note* that `not` needs a compute so that it can update the scope’s value when the setter is called.

```handlebars
<input type="checkbox" checked:bind="not(val)" />
```

@param {can-compute} value A value stored in a [can-compute].
@return {can-compute} A compute that will be two-way bound by [can-stache-bindings] as a getter/setter on the element.

@body

## Use

Use this converter to two-way bind to the negation of some value. For example:

```handlebars
<input type="checkbox" checked:bind="not(val)" />
```

```js
const map = new DefineMap( {
	val: true
} );

document.body.appendChild( template( map ) );

const input = document.querySelector( "input" );

input.checked; // -> false

map.val = false;

input.checked; // -> true

// Now if you click the checkbox
map.val === true; // because the checkbox is now false.
```

### Combined with other converters

`not()` can be useful when used in combination with other converters that deal with boolean conversion. [can-stache-converters.boolean-to-inList] determines if an item is in a list. Here we wrap `not()` around this conversion so that the inverse is what is saved in the map’s value:

```handlebars
<input type="checkbox" checked:bind="not(boolean-to-inList(item, list))" />
```

```js
const map = new DefineMap( {
	item: 2,
	list: new DefineList( [ 1, 2, 3 ] )
} );

document.body.appendChild( template( map ) );
const input = document.querySelector( "input" );


input.checked; // -> false

// Set `item` to a value not in the list
map.item = 4;

input.checked; // -> true

// Check the input, whick will set its value to `false`
// This will be converted to `true` by not() and pushed into the list

map.list.indexOf( 4 ); // -> 3

// Remove it from the list, which will be converted to true by not()
map.list.splice( 3, 1 );

input.checked; // -> true
```
