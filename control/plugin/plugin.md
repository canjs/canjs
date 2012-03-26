@page can.Control.plugin 
@parent can.Control

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

With jQuery, you can create the control direct on a jQuery collection like:

    $(".tabs").tabs();
    
> __Note:__ This plugin only supports jQuery.

## Creating

The first time you call the plugin on an element it will create a new can.Control instance, passing it the element
and the plugin options:

	$(".tabs").tabs({ active : 1 });

## Updating

Once initialized, every subsequent plugin call on an initialized controller will trigger it's *update* method with
the options passed to the plugin call. By default *update* will merge the new options with the ones already defined.


Talk about the update method.  How options are passed to it.

## Calling methods

__plugin__ supports calling methods on the Control instance by passing the method name and parameters
to a plugin call.

Talk about calling methods

## Access

Control instances created by a plugin will be stored in the element they have been attached to using can.Data.
You can use *.controllers()* to get a list of all Control instances on an element or *.controller()* to get
the first or only one:

	$('.tabs').controllers(); // [ Tabs ]

Talk about how the control instances are stored in can.Data.  How they
can be retrieved with control or controls.  