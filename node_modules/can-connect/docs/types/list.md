@typedef {Object} can-connect.List List
@parent can-connect.types

@description A list type.

@type {Object} The `List` type is a JavaScript type, typically
a constructor function, that is used to contain a list of typed [can-connect/Instance instances].  `List` types usually are
`Array`-like.  An instance of type `List` is what's returned by
[can-connect/constructor.hydrateList] to convert raw data into
what's returned by [can-connect/connection.getList].

```js
const list = connection.hydrateList( {
	data: [ { id: 1, name: "raw data" } ]
} );

list; //-> an instance of List
```

The `List` type often has special methods used to interact with
the collection of [can-connect/Instance] instances.

```js
const list = connection.hydrateList( {
	data: [ { id: 1, name: "raw data" } ]
} );

list.someSpecialMethod();
```

The [can-connect/constructor/constructor.list] option is used
to convert an Array of instances into the final `List` type.
