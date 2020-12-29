@property can-observation.prototype.value value
@parent can-observation.prototype
@description Reads the value of the observation.
@signature `observation.value`

The following creates a `fullName` observation that derives its values from
the `person` observable. The value of the observation is read with
`fullName.value`:

```js
import Observation from "can-observation";
import observe from "can-observe";

const person = observe( { first: "Grace", last: "Hopper" } );

const fullName = new Observation( function() {
	return person.first + " " + person.last;
} );

fullName.value; //-> "Grace Hopper";
```
