@property {Symbol} can-observe/can.computedPropertyDefinitions @can.computedPropertyDefinitions
@parent can-observe/function

@description Object containing rich property behaviors for a proxy-wrapped object.

@signature `@@can.computedPropertyDefinitions()`

Proxy-wrapped objects created by can-observe recognize an internal value, stored under the `can.computedPropertyDefinitions` symbol. When using can-observe class constructors, it will inherit much like other properties and methods.

The actual value is an object, and its values are functions which return instances of [can-observation]. if you access a key on your object that matches a key in this object, the function will be called with the instance and the name of the property, and its return value will be cached (each instance of your object will only get one instance of the observation), and the observation's value will be the return value of your getter. Future changes to this observation will trigger updates as if you had changed the value directly.

If you wish to expand this behavior yourself, we have provided a few helpers to assist. Firstly, there is `ensureComputedPropertyDefinitions`. This helper makes sure that your proxy-wrapped object or prototype has the correct initial value for the `can.computedPropertyDefinitions` symbol, with inheritance, etc. You should rarely need this helper however as it is called automatically by the `defineProperty` helper. This helper should be called with your target object (either a proxy-wrapped object or the prototype of proxy-wrapped class), the key where the new functionality will be added, and the function which returns an observation.

```js
import Observation from "can-observation";

observe.defineProperty( target, "name", function( instance, property ) {
	return new Observation( function() {
		return this.first + " " + this.last;
	}, instance );
} );
```
