@function can-observation.prototype.get get
@parent can-observation.prototype prototype

@signature `observation.get()`

Returns the value of the `observation`.

```js
import Observation from "can-observation";
import observe from "can-observe";

var person = observe({first: "Ramiya", last: "Meyer"});

var fullName = new Observation(function(){
    return person.first + " " + person.last;
});

fullName.get() //-> "Ramiya Meyer";
```

If the observation is _unbound_, the observation's function will be run
each time to get the value.

Once the observation is _bound_, its cached value will be returned.  Its cached value
will be updated when any of its dependencies change.

@return {Any} Whatever the function returns.
