@function can.view.bindings.can-EVENT can-EVENT
@parent can.view.bindings

@signature `can-EVENT='KEY'`

Specify a callback function to be called on a particular event. You can create your own special event types.

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

## Special Event Types

can.view.bindings supports creating special event types (events that aren't natively triggered by the DOM), which are bound by adding attributes like `can-SPECIAL='KEY'`. This is similar to [$.special](http://benalman.com/news/2010/03/jquery-special-events/).

### can-enter

can-enter is a special event that calls its handler whenever the enter key is pressed while focused on the current element. For example: 

	<input type='text' can-enter='save' />

The above template snippet would cause the save method (in the [can.Mustache Mustache] [can.view.Scope scope]) whenever the user hits the enter key on this input.

### Create Your Own Special Event Type

You can add your own special events to can.view.bindings. The AMD module returned by the can/view/bindings plugin is an object called `special`. It contains all the special events. To add your 
own, add a property to special like the following:

	special.esc = function (data, el, original) {
		return {
			event: "keyup",
			handler: function (ev) {
				if (ev.keyCode === 27) {
					return original.call(this, ev);
				}
			}
		};
	}

The above example adds a can-esc binding that can be used in a template like:

	<input type='input' can-esc='cancel'/>

The special object expects a function that is called with the mustache scope data, the element, and the original event handler (the 'cancel' method in our above example).

It is expected to return an object containing:

 - `event`: which native DOM event type you want to bind to
 - `handler`: a function which performs logic to determine if your special event requirements are met, and if so, call the original handler