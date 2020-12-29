@function can-observation.prototype.can.getValueDependencies @can.getValueDependencies
@parent can-observation.prototype prototype

@signature `canReflect.getValueDependencies(observation)`

If this observation is bound, returns an observation record of the dependencies:

```js
var record = canReflect.getValueDependencies(observation)
record //-> {
//    keyDependencies: Map<observable,Set<eventNames>>,
//    valueDependencies: Set<observable>
// }
```
