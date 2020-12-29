@property {Object} can-control.prototype.options options
@parent can-control.prototype
@description Options used to configure a control.

@body
## Options Object

The `this.options` property is an Object that contains
configuration data passed to a control when it is
created (`new Control(element, options)`).

In the following example, an options object with
a message is passed to a `Greeting` control. The
`Greeting` control changes the text of its [can-control::element element]
to the options' message value.

	var Greeting = Control.extend({
		init: function(){
			this.element.text( this.options.message )
		}
	});

	new Greeting("#greeting",{message: "I understand this.options"});

The options argument passed when creating the control
is merged with [can-control.defaults defaults] in
[can-control.prototype.setup setup].

In the following example, if no message property is provided,
the defaults' message property is used.

	var Greeting = Control.extend({
		defaults: {
			message: "Defaults merged into this.options"
		}
	},{
		init: function(){
			this.element.text( this.options.message )
		}
	});

	new Greeting("#greeting");

## Options Observable
An observable [can-map CanMap] or [can-define/map/map DefineMap] can also be passed instead of an options object.

In the following example, the defaults' message property is set on the [can-define/map/map DefineMap] options observable, which is then set directly as `this.options`:

```
	var GreetingControl = Control.extend({
		defaults: {
			message: 'Hello'
		}
	}, {
		init: function(){
			this.element.text( this.options.message + ' ' + this.options.name )
		}
	});

	var GreetingMap = DefineMap.extend({
		message: 'string',
		name: 'string'
	});

	var data = new GreetingMap();
	data.name = 'Kevin';

	new GreetingControl('#greeting', data);
```
