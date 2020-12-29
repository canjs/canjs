@function can-define-stream-kefir.toCompute toCompute
@parent can-define-stream-kefir.fns

@description Create a compute that gets updated whenever the stream value changes.

@signature `DefineMap.toCompute( stream )`

Creates a compute that gets updated whenever the stream value changes.

@param {can-stream} stream A [can-stream] stream

@return {can-compute} A [can-compute] compute.
