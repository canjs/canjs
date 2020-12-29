@typedef {Event} can-define/list/list/LengthEvent length
@parent can-define/list/list/events

Event fired when items are added or removed from the list.

@signature `handler(event, length)`

  Handlers registered on "length" events will be called
  back as follows.

  ```js
  list.on("length", function(event, length){ ... });
  ```

  It's possible that the length was not changed, but an item was [can-define/list/list::set] on the list.
  In this case, a `length` event will still be fired.

  @param {Event} event An event object.
  @param {Number} length The new length of the list.
