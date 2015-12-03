@property {Object} can.Control.defaults defaults
@parent can.Control.static
@description Default values for the Control's options.

@body

Default options provided for when a new control is created without values set in `options`.

`defaults` provides default values for a Control's options.
Options passed into the constructor function will be shallowly merged
into the values from defaults in [can.Control::setup], and
the result will be stored in [can.Control::options this.options].

	Message = can.Control.extend({
	  defaults: {
		message: "Hello World"
	  }
	}, {
	  init: function(){
		this.element.text( this.options.message );
	  }
	});

	new Message( "#el1" ); //writes "Hello World"
	new Message( "#el12", { message: "hi" } ); //writes hi

## Shared Properties

New instances of a can.Control will create a shallow copy of the default
options. Be aware as shallow copies keep a reference to object types, such as
objects, maps and computes.

```
var Sample = can.Control.extend({
  defaults: {
    computedProp: can.compute(),
    primitiveProp: 'sample'
  }
}, {});

var a = new Sample('div');
var b = new Sample('li');

//`computedProp` will be shared across instances of the `Sample` control.
//a.options.computedProp === b.options.computedProp
```
