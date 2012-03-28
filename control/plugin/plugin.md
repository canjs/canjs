@page can.Control.plugin 
@parent can.Control
@plugin can/control/plugin
@test can/control/plugin/qunit.html
@download http://jmvcsite.heroku.com/pluginify?plugins[]=can/control/plugin/plugin.js

The can.Control plugin extension creates a plugin for the control in the 
jQuery NodeList using the control's [can.Construct.fullName fullName] or
a static pluginName attribute. For example, if you create the following control:

	var Tabs = can.Control({
		pluginName : 'tabs'
	},{
		init : function(element, options, arg1){ },
		update : function(options) {}
	})

With jQuery, you can create the control direct on a jQuery collection like:

    $(".tabs").tabs();
    
__Note:__ This plugin only supports jQuery.

## Plugin Name

Setting the `pluginName` property allows you to change 
the can plugin helper name from its default value.

	var MxuiLayoutFill = can.Control({
		pluginName: "fillWith"
	},{});
	
	$("#foo").fillWith();
	
If you don't provide a plugin name, the control falls back
to the [can.Construct.fullName fullName] attribute.

## Updating

Update extends [can.Control.prototype.options options] 
with the `options` argument and rebinds all events.  It 
re-configures the control.

For example, the following control wraps a recipe form. When the form
is submitted, it creates the recipe on the server.  When the recipe
is `created`, it resets the form with a new instance.

	var Creator = can.Control({
		"{recipe} created" : function(){
			this.update({recipe : new Recipe()});
			this.element[0].reset();
			this.find("[type=submit]").val("Create Recipe")
		},
		"submit" : function(el, ev){
			ev.preventDefault();
			var recipe = this.options.recipe;
			recipe.attrs( this.element.formParams() );
			this.find("[type=submit]").val("Saving...")
			recipe.save();
		}
	});
	
	$('#createRecipes').creator({ recipe : new Recipe() })
	
See [can.Control.prototype.update update] for more information.

## Calling methods

You can invoke methods on a controller instance after its created through a few
different approaches.  

Once a controller is initialized on a DOM element, you can invoke a method
by querying the DOM and calling the controller name followed with the 
parameters of the plugin name and any additional arguments you want to pass.

	var MyTodo = can.Control({
		create: function(name, task){
			this.element.append(name + " " + task)
		}
	});
	
	$('.my_todo').my_todo("create", 'Austin', 'Sweep garage');

Secondly, you can retrieve the instance and invoke the method directly.  
For more information on fetching controller instances on DOM elements see 
the __Access__ section.

## Access

When the widget is initialized, the plugin control creates an association 
of controller instance(s) with the DOM element it was initialized on using 
can's data method.

### Controller

The `controller` method allows you to get a controller instance for the element.  
With no arguments, returns the first one found otherwise the first controller 
instance with this class type will be returned.

	<div id="widget" class="my_widget">

	$('#widget').controller() //- will return: MyWidget

### Controllers

The `controllers` method allows you to get all the controllers attached to the element.
For example, we can fetch both the _MyWidget_ and the _MyClock_ instance 
below by calling `controllers` on the DOM element.

	<div id="widget" class="my_widget my_clock">
	
	$('#widget').controllers() //- will return: [ MyWidget, MyClock ]
