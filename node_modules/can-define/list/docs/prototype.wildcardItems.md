@property {can-define.types.propDefinition} can-define/list/list.prototype.wildcardItems #
@parent can-define/list/list.prototype

@description Define default behavior for items in the list.

@option {can-define.types.propDefinition}

By defining a wildcard property (`"#"`) on the prototype, this will supply a
default behavior for items in the list.  The default wildcard (`"#"`) definition
makes every item run through the "observable" [can-define.types] converter.
It looks like:

```js
{
	"#": {
		type: "observable"
	}
}
```

Setting the wildcard is useful when items should be converted to a particular type.

```js
const Person = DefineMap.extend( { /* ... */ } );

const People = DefineList.extend( {
	"#": Person
} );
```

The wildcard property has optional `added` and `removed` functions that will be called after
an item is added or removed from the list with `this` being the list.

```js
const People = DefineList.extend( {
	"#": {
		added: function( itemsAdded, index ) { /* ... */ },
		removed: function( itemsRemoved, index ) { /* ... */ }
	}
} );
```
