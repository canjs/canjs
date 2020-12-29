@function can-observation.prototype.can.setPriority @can.setPriority
@parent can-observation.prototype prototype

@signature `canReflect.setPriority(observation, priority)`

Sets the priority used to update this observation within the [can-queues.deriveQueue]:

```js
var observation = new Observation(...);
canReflect.setPriority(observation, 4)
```

@param {Number} priority The priority number. 0 will update first.  Higher priorities update later.
