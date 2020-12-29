@typedef {Event} can-define/list/list/AddEvent add
@parent can-define/list/list/events

Event fired when items are added to the list.

@signature `handler(event, added, index)`

  Handlers registered with [can-event-queue/map/map] methods on `list` will be called back when
  items are added to a list.

  ```js
  list.on("add", function(event, added, index){ ... });
  ```

  @param {Event} event An event object.
  @param {Array} added An array of the items added to the list.
  @param {Number} index The location where the items were added.
