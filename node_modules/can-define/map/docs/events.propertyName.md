@typedef {Event} can-define/map/map/PropertyNameEvent propertyName
@parent can-define/map/map/events

Event fired when a property on the map changes values.

@signature `handler(event, newValue, oldValue)`

  Handlers registered on `propertyName` events will be called
  back as follows.

  ```js
  import {DefineMap} from "can";

  const person = new DefineMap({name: "Justin"});

  person.on("name", (event, newVal, oldVal) => {
    console.log( newVal ); //-> "Brian"
    console.log( oldVal ); //-> "Justin"
  });
  person.set("name", "Brian");
  ```
  @codepen

  @param {Event} event An event object.
  @param {*} newVal The new value of the `propertyName` property.
  @param {*} oldVal The old value of the `propertyName` property.
