@function can-stache-converters.string-to-any string-to-any
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that binds a value to a primitive value, two-way converted back to that primitive value when the attribute changes.

@signature `string-to-any(item)`

When the getter is called, gets the value of the compute and calls `.toString()` on that value.

When the setter is called, takes the new value and converts it to the primitive value using [can-util/js/string-to-any/string-to-any] and sets the compute using that converted value.

```handlebars
<select value:bind="string-to-any(favePlayer)">
  <option value="23">Michael Jordan</option>
	<option value="32">Magic Johnson</option>
</select>
```

@param {can-compute} item A compute holding a primitive value.
@return {can-compute} A compute that will be used by [can-stache-bindings] as a getter/setter when the element’s value changes.

@body

## Use

This is usually used with `<select>`s where you would like to two-way bind a string to a primitive value.

```handlebars
<select value:bind="string-to-any(someValue)">
  <option value="2">Number</option>
  <option value="null">Null</option>
  <option value="foo">String</option>
  <option value="true">Boolean</option>
  <option value="NaN">NaN</option>
  <option value="Infinity">Infinity</option>
</select>
```

```js
const str = document.getElementById( "select-template" ).innerHTML;
const template = stache( str );

const map = new DefineMap( {
	someValue: "foo"
} );

document.body.appendChild( template( map ) );

map.item = NaN; // select.value becomes "NaN"

// Click the select box and choose Boolean
map.item === true; // -> true
```
