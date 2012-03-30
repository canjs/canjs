@page can.Control.plugin 
@parent can.Control

The can.Control __plugin__ extension creates a plugin for the control in the 
base-library's NodeList using the control's [fullName can.Construct.fullName] or
a static pluginName attribute. For example,
if you create the following control:

    var Tabs = can.Control({
      pluginName : "tabs"
    },{
      init : function(element, options, arg1){
      
      },
      update : function(options) {
      
      }
    })

With jQuery, you can create the control direct on a jQuery collection like:

    $(".tabs").tabs();
    
__Note:__ This plugin only supports jQuery.

## Creating

Show how to create an instance, how arguments are passed.  How an instance
will be created on each object.

## Updating

Talk about the update method.  How options are passed to it.

## Calling methods

Talk about calling methods

## Access

Talk about how the control instances are stored in can.Data.  How they
can be retrieved with control or controls.  