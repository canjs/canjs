@function can.List.prototype.always
@parent can.List.plugins.promise

Add handlers to be called when the list is either resolved or 
rejected. This works very similar 
to [jQuery's always](http://api.jquery.com/deferred.always/).

@param {function(*)} alwaysCallback

A function that is called when the list's promise is resolved 
or rejected. It will be called with the list if the promise is resolved,
or the [can.List::reason reason] if the promise is rejected.

@return {Promise} The list's promise.

@body


