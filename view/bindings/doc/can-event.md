@function can.view.bindings.can-EVENT can-EVENT
@parent can.view.bindings

@signature `can-EVENT='KEY'`

Specify a callback function to be called on a particular event.

@param {String} EVENT A event name like `click` or `keyup`.  If you are
using jQuery, you can listen to jQuery special events too.

@param {can.Mustache.key} key A named value in the current scope.  The value
should be a function.

@body

## Use

By adding `can-EVENT='KEY'` to an element, the function pointed to
by `KEY` is bound to the element's `EVENT` event. The function
is called back with:

 - `context` - the context of the element
 - `element` - the element that was bound
 - `event` - the event that was triggered

@demo can/view/bindings/doc/can-event.html