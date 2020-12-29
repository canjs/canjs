
@function can-set-legacy.Algebra.prototype.has has
@parent can-set-legacy.Algebra.prototype

@signature `algebra.has(set, props)`

Used to tell if the `set` contains the instance object `props`.

```
var algebra = new set.Algebra(
  new set.Translate("where","$where")
);
algebra.has(
  {"$where": {playerId: 5}},
  {id: 5, type: "3pt", playerId: 5, gameId: 7}
) //-> true
```

  @param  {can-set-legacy/Set} set A set.
  @param  {Object} props An instance's raw data.
  @return {Boolean} Returns `true` if `props` belongs in `set` and
  `false` it not.
