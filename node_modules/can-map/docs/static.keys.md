@function can-map.keys keys
@parent can-map.static 0

@description Returns an array of the map's keys.

@signature `Map.keys(map)`

```js
var people = new Map({
		a: 'Alice',
		b: 'Bob',
		e: 'Eve'
});

Map.keys(people); // ['a', 'b', 'e']
```

@param {can-map} map the `Map` to get the keys from
@return {Array} array An array containing the keys from _map_.
