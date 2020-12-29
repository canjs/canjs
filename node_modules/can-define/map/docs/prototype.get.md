@function can-define/map/map.prototype.get get
@parent can-define/map/map.prototype

@description Get a value or all values from a DefineMap.

@signature `map.get()`

  Returns a plain JavaScript object that contains the properties and values of the map instance.  Any property values
  that also have a `get` method will have their `get` method called and the resulting value will be used as
  the property value.  This can be used to recursively convert a map instance to an object of other plain
  JavaScript objects.  Cycles are supported and only create one object.

  `.get()` can still return other non plain JS objects like Date.
  Use [can-define/map/map.prototype.serialize] when a form proper for `JSON.stringify` is needed.

  ```js
  import {DefineMap} from "can";

  const map = new DefineMap({foo: new DefineMap({bar: "zed"})});
  console.log( map.get() ); //-> {foo: {bar: "zed"}};
  ```
  @codepen

  @return {Object} A plain JavaScript `Object` that contains all the properties and values of the map instance.

@signature `map.get(propName)`

  Get a single property on a DefineMap instance.

  ```js
  import {DefineMap} from "can";

  const map = new DefineMap();
  console.log( map.get("name") ); //-> undefined;
  ```
  @codepen

  `.get(propName)` only needs to be used when reading properties that might not have been defined yet, but will be later via [can-define/map/map.prototype.set]. Predefined properties can always be read like `map.propName`.

  @param {String} propName The property name of a property that may not have been defined yet.
  @return {*} The value of that property.
