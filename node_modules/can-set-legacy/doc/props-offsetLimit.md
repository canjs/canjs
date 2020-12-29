
@function can-set-legacy.props.offsetLimit offsetLimit
@parent can-set-legacy.props

@description Supports sets that include a limit and offset.

@signature `set.props.offsetLimit( [offsetProperty][, limitProperty] )`

Makes a prop for two ranged properties that specify a range of items
that includes both the offsetProperty and limitProperty.  For example, set like:
`{offset: 20, limit: 10}` loads 10 items starting at index 20.

```
new set.Algebra( set.props.offsetLimit("offset","limit") );
```

  @param  {String} offsetProperty The offset property name on sets.  Defaults to `"offset"` if none is provided.
  @param  {String} limitProperty The offset limit name on sets. Defaults to `"limit"` if none is provided.
  @return {can-set-legacy.compares} Returns a comparator used to build a set algebra.
