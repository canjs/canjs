@function can.view.bindings.can-EVENT can-EVENT
@parent can.view.bindings

@signature `can-EVENT='KEY'`

Specify a callback function to be called on a particular event. You can create your own special event types.

@param {String} EVENT A event name like `click` or `keyup`.  If you are
using jQuery, you can listen to jQuery special events too.

@param {can.mustache.key} key A named value in the current scope.  The value
should be a function.

@body

## Use

By adding `can-EVENT='KEY'` to an element, the function pointed to
by `KEY` is bound to the element's `EVENT` event. The function can be
passed any number of arguments from the surrounding scope, or `name=value`
attributes for named arguments. Direct arguments will be provided to the
handler in the order they were given, except `name=value` arguments, which
will all be given as part of a `hash` argument inserted after all direct
arguments.

The last 3 arguments to the callback will always be the current template
context, followed by the element, then the event object.

There are also two special variables available within handlers:

 - `@element` - the element that was bound
 - `@event` - the event that was triggered

@demo can/view/bindings/doc/can-event.html

## Special Event Types

can.view.bindings supports creating special event types (events that aren't natively triggered by the DOM), which are bound by adding attributes like `can-SPECIAL='KEY'`. This is similar to [$.special](http://benalman.com/news/2010/03/jquery-special-events/).

### can-enter

can-enter is a special event that calls its handler whenever the enter key is pressed while focused on the current element. For example: 

	<input type='text' can-enter='save' />

The above template snippet would cause the save method (in the [can.mustache Mustache] [can.view.Scope scope]) whenever the user hits the enter key on this input.
