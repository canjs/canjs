@typedef {Object} can-connect/Instance Instance
@parent can-connect.types
@description An instance of some JavaScript type.

@type {Object}

  `can-connect` is primarily used to connect some form of __typed data__ to
  a service layer.  For example, the typed data might be a `Todo` with methods
  like `todo.complete()` and the service layer might be a RESTful URL like
  `https://myapp.com/todos`.

  __Typed data__, with methods, validation, type coercion, and other logic is
  very useful to a client side developer.  However, a service layer
  doesn't provide this functionality, instead it just provides raw data.

  `can-connect` is used to bridge the gap between __typed data__ and the
  raw data provided by the server.  

  An `Instance` represents some form of typed data. For example,
  an `Instance` might represent an instance of the `Todo` type in the example above.

  The [can-connect/constructor/constructor] behavior is primarily responsible for
  providing methods that go [can-connect/constructor/constructor.hydrateInstance back] and
  [can-connect/constructor/constructor.serializeInstance forth] between
  instances and raw data.  Other behaviors like [can-connect/can/map/map]
  extend this functionality. 
