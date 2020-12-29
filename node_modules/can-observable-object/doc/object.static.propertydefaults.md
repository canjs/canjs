@property can-observable-object/object.static.propertyDefaults propertyDefaults
@parent can-observable-object/object.static

@description Specify default behaviors for properties.

@signature `static propertyDefaults = PROPDEFINITION`

Specify default values using a [can-observable-object/object.types.definitionObject] object.

```js
import { ObservableObject } from "can/everything";

class RouteData extends ObservableObject {
  static propertyDefaults = {
    type: String,
    enumerable: false
  };
}

let rd = new RouteData({ foo: 'bar' });

// `foo` will not be listed as an enumerated property
for(let prop in rd) {
  console.log(prop);
}
```

The above specifies a RouteData type whose properties default to a strictly typed `String` and are [can-observable-object/define/enumerable non-enumerable].

@signature `static propertyDefaults = PROPERTY`

propertyDefaults can be specified using any of the methods specified by the [can-observable-object/object.types.property property type].

```js
import { ObservableObject } from "can/everything";

class Person extends ObservableObject {
  static propertyDefaults = String;
}
```

The above specifies all properties to default to being a strictly defined `String`. See [can-observable-object/object.types.property] for other possible values.
