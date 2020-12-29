@property {can-define.types.propDefinition} can-define/list/list.prototype.wildcard *
@parent can-define/list/list.prototype

@description Define default behavior for all properties and items in the list. Use
[can-define/list/list.prototype.wildcardItems] to define the default type of items in the list.

@option {can-define.types.propDefinition}

By defining a wildcard property (`"*"`) on the prototype, this will supply a
default behavior for every property in the list.  The default wildcard `"*"` definition
makes every property run through the "observable" [can-define.types] converter.
It looks like:

```js
{
	"*": {
		type: "observable"
	}
}
```

Setting the wildcard is useful when all properties should be converted to a particular type.

```js
const Person = DefineList.extend( { /* ... */ } );

const People = DefineList.extend( {
	"*": "string",
	"#": Person
} );

const people = new People();

people.set( "age", 21 );
people.age; //-> "21"
```
