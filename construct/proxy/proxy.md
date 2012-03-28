@page can.Construct.proxy
@parent can.Construct
@plugin can/construct/proxy
@test can/construct/proxy/qunit.html
@download http://donejs.com/can/dist/can.construct.proxy.js

Proxy takes a function name and returns a new function that
will always have the same context from which it was created.
This is useful for creating callback functions that have 'this' 
set correctly.

	var MyClass = can.Construct({
		getData: function() {
			this.showing = null;
			$.get('data.json',
				  this.proxy('gotData'),
				  'json')
		},
		gotData: function( data ) {
			this.showing = data;
		}
	},{});
	
In the above example when we do `$.get`, the `gotData` function
will execute when the AJAX data request is completed and
invoke `gotData` with the 'this' context of the construct rather
than the window.

## Currying Arguments

You can pass additional arguments to the proxy and it will 
fill in arguments on the returning function.  When invoked,
the additional arguments will appear first in the methods
parameters followed by the callback's arguments.

	var MyClass = can.Construct({
		getData: function(callback) {
			$.get('data.json',
				  this.proxy('process', callback),
				  'json');
		},
		process: function(callback, jsonData ) {
			//callback is added as first argument
			jsonData.processed = true;
			callback(jsonData);
		}
	},{});
	
## 	Piping Functions

Proxy can take an array of functions to call as 
the first argument.  When the returned callback function
is called each function in the array is passed the return 
value of the prior function.  This is often used
to eliminate currying initial arguments.

	var MyClass = can.Construct({
		getData: function( callback ) {
			//calls process, then callback with value from process
			$.get('data.json',
				  this.proxy(['process2',callback]),
				  'json') 
		},
		process2: function( type,jsonData ) {
			jsonData.processed = true;
			return [jsonData];
		}
	},{});
	
	MyClass.getData(showDataFunc);
