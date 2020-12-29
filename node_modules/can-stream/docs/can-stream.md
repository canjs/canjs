@module {function} can-stream can-stream
@parent can-observables
@collection can-ecosystem
@group can-stream.types types
@package ../package.json

@description Create useful stream methods from a minimal stream wrapper implementation.

@signature `canStream(streamImplementation)`

Exports a function that takes a [can-stream.types.streamImplementation] (like [can-stream-kefir]) and uses it internally to provide several useful string methods.

@param {can-stream.types.streamImplementation} streamImplementation A [can-stream.types.streamImplementation] object that implements the `toStream` and `toCompute` methods for a stream library.

@return {can-stream.types.streamInterface} An object that has the following methods:

- .toStream(observable, propAndOrEvent[,event])
- .toStreamFromProperty(property)
- .toStreamFromEvent(property)
- .toCompute([can-stream.types.makeStream makeStream(setStream)], context):compute

@body

## Use

See [can-stream-kefir] for an example.
