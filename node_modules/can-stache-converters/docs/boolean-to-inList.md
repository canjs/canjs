@function can-stache-converters.boolean-to-inList boolean-to-inList
@parent can-stache-converters.converters
@description A [can-stache.registerConverter converter] that binds a boolean attribute, such as an `<input>` value, to whether or not an item is in a list.

@signature `boolean-to-inList(item, list)`

When the getter is called, returns true if **item** is within the **list**, determined using `.indexOf`.

When the setter is called, if the new value is truthy then the item will be added to the list using `.push`; if it is falsey the item will removed from the list using `.splice`.

```handlebars
<input type="checkbox" checked:bind="boolean-to-inList(item, list)" />
```

@param {*} item The item to which to check
@param {can-define/list/list|can-list|Array} list The list
@return {can-compute} A compute that will be used by [can-stache-bindings] as a getter/setter when the element’s value changes.

@body

## Use

Use this converter when two-way binding to an element with a boolean attribute, such as a checkbox.

```js
const map = new DefineMap( {
	item: 5,
	list: [ 1, 2, 3, 4, 5 ]
} );

const template = stache(
	"<input type=\"checkbox\" checked:bind=\"boolean-to-inList(item, list)\" />"
);

document.body.appendChild( template( map ) );

const input = document.querySelector( "input[type=checkbox]" );

console.log( input.checked ); // -> true

map.item = 6;

console.log( input.checked ); // -> false

map.list.push( 6 );

console.log( input.checked ); // -> true
```

@demo demos/can-stache-converters/input-checkbox.html
