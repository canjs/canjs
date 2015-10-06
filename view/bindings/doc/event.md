@function can.view.bindings.event \(EVENT\)
@parent can.view.bindings

@description Listen to events on elements or component view models.

@signature `($DOM_EVENT)='CALL_EXPRESSION'`

Specify a callback function to be called on a particular DOM event.

@param {String} DOM_EVENT A DOM event name like "click". jQuery custom events can also
be given. 

@param {can.stache.expression.callExpression} CALL_EXPRESSION A call expression like `method(key)` that is called when the `DOM_EVENT` 
is fired. The following key values are also supported:

 - `%element` - The [can.$] wrapped element the event happened upon.
 - `%event` - The event object.
 - `%viewModel` - If the element is a [can.Component], the component's [can.Component::viewModel viewModel].
 - `%context` - The current context.
 - `%scope` - The current [can.view.Scope].

@signature `(VIEW_MODEL_EVENT)='CALL_EXPRESSION'`

Specify a callback function to be called on a particular [can.Component::viewModel] event.

@param {String} DOM_EVENT A DOM event name like "click". jQuery custom events can also
be given. 

@param {can.stache.expression.callExpression} CALL_EXPRESSION A call expression like `method(key)` that is called when the `DOM_EVENT` 
is fired. The following key values are also supported:

 - `%element` - The [can.$] wrapped element the event happened upon.
 - `%event` - The event object.
 - `%viewModel` - If the element is a [can.Component], the component's [can.Component::viewModel viewModel].
 - `%context` - The current context.
 - `%scope` - The current [can.view.Scope].


@body


## Use

