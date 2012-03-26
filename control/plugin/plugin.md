@page can.Control.plugin 
@parent can.Control

> __Note:__ This plugin only supports jQuery.

The can.Control __plugin__ extension creates a plugin for the control in the 
base-library's NodeList using the control's [fullName can.Construct.fullName] or
a static pluginName attribute. For example, if you create the following control:

	var Tabs = can.Control({
		pluginName : "tabs"
	},{
		init : function(element, options){
      
		},
		update : function(options) {
      
		},
		activate : function(index) {

		}
	});

With jQuery, you can create the control directly on a jQuery collection like:

    $(".tabs").tabs();

## Creating

The first time you call the plugin it will create a new can.Control instance, passing it the element
and the plugin options:

	$(".tabs").tabs({ active : 1 });

## Updating

Once initialized, every subsequent plugin call  will trigger *can.Control.update* with the options passed
to the plugin call. By default *update* will merge the new options with the ones already defined but it can also
be extended to e.g. rerender a view.

## Calling methods

__Plugin__ supports calling methods on the Control instance by passing the method name and parameters
to a plugin call:

    $('.tabs').tabs('activate', 0);

Keep in mind, that a method called this way won't return it's value but follows the jQuery convention of returning
a jQuery object.

## Access

Control instances created by a plugin will be stored on the element they have been attached to using can.Data with
a *controllers* key. You can use *.controllers()* to get a list of all Control instances or *.controller()*
to get the first or only instance:

	var controllers = $('.tabs').controllers(); // [ Tabs ]
	var control = $('.tabs').control(); // Retrieve the only control
	control.activate(0);
