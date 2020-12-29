
@function can-set-legacy.Algebra.prototype.id id
@parent can-set-legacy.Algebra.prototype

@signature `algebra.id(props)`

Returns the configured `id` property value from `props`.  If there are
multiple ids, a `JSON.stringify`-ed JSON object is returned with each
[can-set-legacy.props.id] value is returned.

```js
var algebra1 = new set.Algebra(set.props.id("_id"));
algebra1.id({_id: 5}) //-> 5

var algebra2 = new set.Algebra(
  set.props.id("studentId"),
  set.props.id("classId")
);

algebra2.id({studentId: 6, classId: "7", foo: "bar"})
    //-> '{"studentId": 6, "classId": "7"}'
```

  @param  {Object} obj An instance's raw data.
  @return {*|String} If a single [can-set-legacy.props.id] is configured, its value will be returned.
  If multiple [can-set-legacy.props.id] properties are configured a `JSON.stringify`-ed object is returned.
