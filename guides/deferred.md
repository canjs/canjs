@page Deferreds Deferreds
@parent Tutorial 8

@body
Deferreds in CanJS are explained in greater detail in the [API](../docs/can.Deferred.html).
Below is a quick tour through can.Deferred, which should look familiar to you
if you have experience with the Deferred pattern.

```
// Create a new Deferred:
var dfd = new can.Deferred();

// Add a done callback:
dfd.done(function(foo) {
	console.log('Resolved!');
});
// Add a fail callback:
dfd.fail(function(bar) {
	console.log('Rejected!');
});
// Add a callback that fires whether the
// Deferred is resolved or rejected.
dfd.always(function(obj) {
	console.log('Apathetic!');
});

var dfd2 = new can.Deferred();
// Add done and fail callbacks:
dfd2.then(function(foo) {
	console.log('Also resolved.');
}, function(bar) {
	console.log('Also rejected.');
});

// Create a Deferred that resolves when
// all passed Deferreds resolve:
var endDfd = can.when(dfd, dfd2).then(function() {
	console.log('I open at the close.');
});

// Resolve a Deferred (and call all its done callbacks):
dfd.resolve('foo');

// Reject a Deferred (and call all its fail callbacks):
dfd.reject('bar');
```
