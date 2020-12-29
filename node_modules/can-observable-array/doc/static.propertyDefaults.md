@property can-observable-array/array.static.propertyDefaults propertyDefaults
@parent can-observable-array/static

@description Specify default behaviors for properties on a ObservableArray.

@signature `static propertyDefaults = PROPDEFINITION`

  Specify default values using a [can-observable-object/object.types.propDefinition] object.

  ```js
  import { ObservableArray, ObservableObject, type } from "can/everything";

  class Player extends ObservableObject {

  }

  class Players extends ObservableArray {
    static propertyDefaults = {
      type: type.convert(Number)
    };

    static items = Player;
  }

  const team = new Players();
  team.rank = "5";

  console.log(team.rank); // -> 5
  ```
  @codepen

  The above specifies a RouteData type whose properties default to a strictly typed `String` and are [can-observable-object/define/enumerable non-enumerable].

@signature `static propertyDefaults = PROPERTY`

  propertyDefaults can be specified using any of the methods specified by the [can-observable-object/object.types.property property type].

  ```js
  import { ObservableArray } from "can/everything";

  class People extends ObservableArray {
    static propertyDefaults = String;
  }
  ```

  The above specifies all properties to default to being a strictly defined `String`. See [can-observable-object/object.types.property] for other possible values.

  This does *not* set the type for items within the array. Use [can-observable-array/static.items] for that.
