@property {Object} can-control.defaults defaults
@parent can-control.static
@description Default values for the Control's options.

@body

Default options provided for when a new control is created without values set in `options`.

`defaults` provides default values for a Control's options.
Options passed into the constructor function will be shallowly merged
into the values from defaults in [can-control::setup], and
the result will be stored in [can-control::options this.options].

	Message = Control.extend({
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

New instances of a Control will create a shallow copy of the default
options. Be aware as shallow copies keep a reference to object types, such as
objects, maps and computes.

```
var Sample = Control.extend({
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
