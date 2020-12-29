@typedef {{data:Array<Object>}} can-connect.listData ListData
@parent can-connect.types

The data format used to create typed lists.  

@type {{data:Array<Object>}} A plain JavaScript object used to [can-connect/constructor/constructor.hydrateList hydrate] 
a typed list.  This is the data format resolved by [can-connect/connection.getListData].

A `ListData` object should look like:

```js
{
	data: [
		{ id: 1, name: "take out the trash" },
		{ id: 1, name: "do the dishes" }
	]
}
```

The object must have a `data` property that is an `Array` of
instance data used to [can-connect/constructor/constructor.hydrateInstance hydrate] typed instances.  

The ListData object can have other meta information related to the data
that has been loaded.  For example, `count` might be the total
number of items the server has:

```
{
  data: [
    {id: 1, name: "take out the trash"},
    {id: 1, name: "do the dishes"}
  ],
  count: 1000
}
```

The [can-connect/data/parse/parse] behavior can be used to convert request responses to the `ListData` format.

  @option {Array<Object>} data The ListData object must have a `data` property that is an array of objects.  Each
  object is used to [can-connect/constructor/constructor.hydrateInstance hydrate] typed instances.

@body
