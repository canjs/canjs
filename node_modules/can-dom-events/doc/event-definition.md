@typedef {Object} can-dom-events/EventDefinition EventDefinition
@description Definition of a custom event that may be added to an event registry.
@parent can-dom-events.types
@type {Object}
    @option {String} [defaultEventType]
    The default event type of the event.

    @option {function} [addEventListener]
    The function to add the listener to the target.
        @param {DomEventTarget} target The target to which to add the listener.
        @param {String} eventType The event type which should be used to register the listener.
        @param {*} eventArgs The arguments should to configure the listener behavior.

    @option {function} [removeEventListener]
    The function to remove the listener from the target.
        @param {DomEventTarget} target The target to which to add the listener.
        @param {String} eventType The event type which should be used to register the listener.
        @param {*} eventArgs The arguments should to configure the listener behavior.
