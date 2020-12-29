@function can-simple-map.prototype.serialize serialize
@parent can-simple-map.prototype

@description Returns the serialized form of the simple-map.

@signature `map.serialize()`

Returns the serialized form of the simple-map, with any values in the map that
have a serialize method also having serialized called.

```js
const map = new SimpleMap();
map.set( "deep", new SimpleMap( { a: "b" } ) );

map.serialize(); //->  {deep: {a: "b"}}
```

@return {Object} A plain JavaScript object that will only contain
primitives and other plain JavaScript objects.
