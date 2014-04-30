@function can.List.prototype.always
@parent can.List.plugins.promise

Add handlers to be called when the list is resolved. This works very similar 
to [jQuery's done](http://api.jquery.com/deferred.done/).

@param {function(*)} doneCallback

A function that is called when the list's promise is resolved. 
It will be called with the list instance.

@return {Promise} The list's promise.

@body


