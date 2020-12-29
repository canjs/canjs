@typedef {Event} can-define/list/list/PropertyNameEvent propertyName
@parent can-define/list/list/events

Event fired when a property on the list changes values.

@signature `handler(event, newValue, oldValue)`

  Handlers registered on `propertyName` events will be called
  back as follows.

  ```js
  import {DefineList} from "can";

  const list = new DefineList();
  list.set("totalCount", 500);

  list.on("totalCount", (event, newVal, oldVal) => {
    console.log(newVal); //-> 5
    console.log(oldVal); //-> 500
  });
  list.set("totalCount", 5);
  ```
  @codepen

  @param {Event} event An event object.
  @param {*} newVal The new value of the `propertyName` property.
  @param {*} oldVal The old value of the `propertyName` property.
