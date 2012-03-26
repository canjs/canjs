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
      
      }
    })

With jQuery, you can create the control direct on a jQuery collection like:

    $(".tabs").tabs();
    
> __Note:__ This plugin only supports jQuery.

## Creating

__plugin__ will create a new can.Control instance on the element it has been called on,
passing the object passed to the plugin as the options:

	$(".tabs").tabs({ active : 1 });

## Updating

Talk about the update method.  How options are passed to it.

## Calling methods

Talk about calling methods

## Access

Talk about how the control instances are stored in can.Data.  How they
can be retrieved with control or controls.  