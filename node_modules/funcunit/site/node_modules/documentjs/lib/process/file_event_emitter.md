@typedef {{on: function(String), cwd: String}} documentjs.process.types.FileEventEmitter fileEventEmitter
@parent documentjs.process.types

A node [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter)
that produces events that correlate to files that should be processed.

@option {String} cwd The root directory where "match" events are relative to.

@option {function} on(event, listener)

Registers an event listener.  File event emitters should dispatch:

 - `"match"` events that call listener with the matched path.
 - `"end"` events that call listener when there are no more matches.


