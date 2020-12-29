
@function can-set-legacy.props.rangeInclusive rangeInclusive
@parent can-set-legacy.props

@description Supports ranged properties.

@signature `set.props.rangeInclusive(startIndexProperty, endIndexProperty)`

Makes a prop for two ranged properties that specify a range of items
that includes both the startIndex and endIndex.  For example, a range of
[0,20] loads 21 items.

```
set.props.rangeInclusive("start","end")
```

  @param  {String} startIndexProperty The starting property name
  @param  {String} endIndexProperty The ending property name
  @return {can-set-legacy.compares} Returns a prop
