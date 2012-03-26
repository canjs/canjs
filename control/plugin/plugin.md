@page can.Control.plugin 
@parent can.Control

The can.Control __plugin__ extension creates a plugin for the control in the 
base-library's NodeList using the control's [fullName can.Construct.fullName] or
a static pluginName attribute. For example, if you create the following control:

	var Tabs = can.Control({
		pluginName : 'tabs',
		defaults: {}
	},{
		init : function(element, options, arg1){ },
		update : function(options) {}
	})

With jQuery, you can create the control direct on a jQuery collection like:

    can.$(".tabs").tabs();
    
__Note:__ This plugin only supports jQuery.

## Creating

### Defaults

Just like developing traditional jQuery widgets, plugin allows you
to sets default settings from which you can override on a individual
basis if needed.

	var Tabs = can.Control({
		defaults: {
			selectFirstByDefault: false
		}
	},{ });
	
	can.$('.tabs').tabs({ selectFirstByDefault: true })

### Plugin Name

Setting the __pluginName__ property allows you to change 
the can plugin helper name from its default value.

	can.Control("Mxui.Layout.Fill",{
		pluginName: "fillWith"
	},{});
	
	can.$("#foo").fillWith();

## Updating

Update extends [can.Control.prototype.options this.options] 
with the `options` argument and rebinds all events.  It basically
re-configures the control.

For example, the following control wraps a recipe form. When the form
is submitted, it creates the recipe on the server.  When the recipe
is `created`, it resets the form with a new instance.

	can.Control('Creator',{
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
	
	$('#createRecipes').creator({recipe : new Recipe()})

## Calling methods

You can invoke methods on a controller instance after its created through a few
different approaches.  

Once a controller is initialized on a DOM element, you can invoke a method
by querying the DOM and calling the controller name followed with the 
parameters of the plugin name and any additional arguments you want to pass.

	can.Control('MyTodo',
		create: function(name, task){
			this.element.append(name + " " + task)
		}
	});
	
	can.$('.my_todo').my_todo("create", 'Austin', 'Sweep garage');

Secondly, you can retrieve the instance and invoke the method directly.  
For more information on fetching controller instances on DOM elements see 
the __Access__ section.

## Access

When the widget is initialized, the plugin control creates an association 
of controller instance(s) with the DOM element it was initialized on using 
can's data method.

### Controller

The __controller__ method allows you to get a controller instance for the element.  
With no arguments, returns the first one found otherwise the first controller 
instance with this class type will be returned.

	<div id="widget" class="my_widget">

	can.$('#widget').controller() // will return: [ MyWidget ]


### Controllers

The __controllers__ method allows you to get all the controllers attached to the element.
For example, we can fetch both the __MyWidget__ and the __MyClock__ instance 
below by calling __controllers__ on the DOM element.

	<div id="widget" class="my_widget my_clock">
	
	can.$('#widget').controllers() // will return: [ MyWidget, MyClock ]
