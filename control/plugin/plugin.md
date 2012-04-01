@page can.Control.plugin 
@parent can.Control
@plugin can/control/plugin
@test can/control/plugin/qunit.html
@download http://donejs.com/can/dist/can.control.plugin.js

The `can.Control.plugin` extension is a plugin for creating and accessing 
controls with jQuery helper methods.  It uses the control's [can.Construct.fullName fullName] 
or a static [can.Control.plugin.static.pluginName pluginName] attribute for the name of the control.

For example, the following plugin:

	var Tabs = can.Control({
	  pluginName : 'tabs'
	},{
	  init : function(element, options, arg1){ },
	  update : function(options) {}
	})

Can now be created directly on the jQuery collection like:

    $(".tabs").tabs();
    
__Note:__ This plugin only supports jQuery.


## Invoking Methods

You can invoke methods on a control instance after its created through a few
different approaches.  

Once a controller is initialized on a DOM element, you can invoke a method by calling
the plugin with the method name followed by the parameters for that method.

	var MyTodo = can.Control({
	  pluginName : 'my_todo'
	}, {
	  addTask: function(name, task){
	    this.element.append(name + " " + task)
	  }
	});

	//- inits the widget
	$('.my_todo').my_todo();
	
	//- calls the method `update`
	$('.my_todo').my_todo("addTask", 'Brian', 'Sweep garage');

Keep in mind that this approach follows the jQuery plugin convention and returns a jQuery object,
not the methods return value. 

You can also retrieve the control instance and invoke the method directly.

	var control = $('.my_todo').control();
	control.addTask('Brian', 'Sweep garage');
	
For more information on this, see [jQuery.fn.control] or [jQuery.fn.controls].

## Demo

The following demo shows creating a plugin widget and then updating the widget's `times` variable
for each time the button was clicked.

@demo can/control/plugin/plugin.html