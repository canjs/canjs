@typedef {function} can-stream.types.streamInterface streamInterface
@parent can-stream.types

@description Stream interface function returned from [can-stream]

@signature `streamInterface( observable, propAndOrEvent[,event] )`

The stream interface function returned from [can-stream] that has the following property methods:

- .toStream(observable, propAndOrEvent[,event])
- .toStreamFromProperty(property)
- .toStreamFromEvent(property)
- .toCompute([can-stream.types.makeStream makeStream(setStream)], context):compute

@param {Object} observable An observable object

@param {String} property A property of the observable object prepended with `.`

@param {String} [event] An optional event name of the observable object

