@page can.Control.plugin 
@parent can.Control
@plugin can/control/plugin
@test can/control/plugin/qunit.html
@download http://donejs.com/can/dist/can.control.plugin.js

The `can.Control.plugin` extension creates a plugin for the control in the 
jQuery NodeList using the control's [can.Construct.fullName fullName] or
a static [can.Control.plugin.static.pluginName pluginName] attribute. For example, if you create the following control:

	var Tabs = can.Control({
		pluginName : 'tabs'
	},{
		init : function(element, options, arg1){ },
		update : function(options) {}
	})

With jQuery, you can create the control direct on a jQuery collection like:

    $(".tabs").tabs();
    
__Note:__ This plugin only supports jQuery.


## Invoking Methods

You can invoke methods on a controller instance after its created through a few
different approaches.  

Once a controller is initialized on a DOM element, you can invoke a method by calling
the plugin with the method name followed by the parameters for that method.

	var MyTodo = can.Control({
		pluginName : 'my_toto'
	}, {
		create: function(name, task){
			this.element.append(name + " " + task)
		}
	});
	
	$('.my_todo').my_todo("create", 'Brian', 'Sweep garage');

Keep in mind that this approach follows the jQuery plugin convention and returns a jQuery object,
not the methods return value. 

You can also retrieve the control instance and invoke the method directly.

	var control = $('.my_todo').control();
	control.create('Brian', 'Sweep garage');
	
For more information on this, see [can.Control.prototype.control] or [can.Control.prototype.controls].

## Demo

The following demo shows creating a plugin widget and then updating the widget's `times` variable
for each time the button was clicked.

@demo can/control/plugin/plugin.html