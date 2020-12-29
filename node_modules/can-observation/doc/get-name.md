@function can-observation.prototype.can.getName @can.getName
@parent can-observation.prototype prototype

@signature `canReflect.getName(observation)`

Returns this observation's debugger name. It will wrap the name of the
function passed in with `Observation<FUNCTION_NAME>` like:

```js
var observation = new Observation(function fullName(){
    return ...;
})

canReflect.getName(observation) //-> "Observation<fullName>"
```
