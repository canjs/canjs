@function can-define/map/map.prototype.set set
@parent can-define/map/map.prototype

@description Sets multiple properties on a map instance or a property that wasn't predefined.

@signature `map.set(propName, value)`

  Assigns _value_ to a property on this map instance called _propName_.  This will define
  the property if it hasn't already been predefined.

  ```js
  import {DefineMap} from "can";

  const map = new DefineMap({});
  map.set("propA", "value");

  console.log( map.serialize() ); //-> {propA: "value"}
  ```
  @codepen

  Predefined properties can always set the property directly: `map.propName = value`.

  @param {String} propName The property to set.
  @param {*} value The value to assign to `propName`.
  @return {can-define/map/map} This map instance, for chaining.

@signature `map.set(props [,removeProps])`

  Assigns each value in `props` to a property on this map instance named after the
  corresponding key in `props`, effectively merging `props` into the Map. If `removeProps` is true, properties not in
  `props` will be set to `undefined`.

  <section class="warnings">
    <div class="deprecated warning">
    <h3>Deprecated 3.10.1</h3>
    <div class="signature-wrapper">
    <p>Passing an {Object} to <code>.set</code> has been deprecated in favor of <a href="map.prototype.assign.html" title="Sets multiple properties on a map instance or a property that wasn't predefined.">assign</a> or <a href="map.prototype.update.html" title="Sets multiple properties on a map instance or a property that wasn't predefined.">update</a>. <code>map.set(propName, value)</code> is <em>not</em> deprecated.</p>
    </div>
    </div>
  </section>

  @param {Object} props A collection of key-value pairs to set.
  If any properties already exist on the map, they will be overwritten.

  @param {Boolean} [removeProps=false] Whether to set keys not present in `props` to `undefined`.

  @return {can-define/map/map} The map instance for chaining.
