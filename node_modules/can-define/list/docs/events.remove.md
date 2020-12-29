@typedef {Event} can-define/list/list/RemoveEvent remove
@parent can-define/list/list/events

Event fired when items are removed from the list.

@signature `handler(event, removed, index)`

Handlers registered with [can-event-queue/map/map] methods on `list` will be called back when
items are removed from a list.

```
list.on("remove", function(event, removed, index){ ... });
```

  @param {Event} event An event object.
  @param {Array} removed An array of the items removed from the list.
  @param {Number} index The location where the items were removed.
