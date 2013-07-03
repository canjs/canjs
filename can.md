@page canjs CanJS
@parent javascriptmvc 0

@body

This is the detailed documentation of the API for CanJS, a framework for building
web applications that provides a lightweight inheritance system, observable
objects and values, and a powerful MVC core with live-bound templates, among other
resources. 

If you are just starting with CanJS, you may want to try our [getting started guide](../guides/Tutorial.html).

CanJS is composed of modules on the left. The following are typically distributed as part of the core
framework:

 - [can.Construct] - inheritable constructor functions
 - [can.Control] - declarative event bindings
 - [can.Observe], [can.Observe.List], [can.compute] - observable objects, list, and values.
 - [can.Model] -  observes connected to a RESTful JSON interface
 - [can.view] - template loading, caching, rendering
 - [can.EJS] - live binding templates
 - [can.route] -  back button and bookmarking support
 
The following modules are typically distributed as plugins:

 - [can.Mustache] - Live binding Handlebars and Mustache templates
 - [can.Construct.proxy] - Proxy construct methods
 - [can.Construct.super] - Call super methods
 - [can.Observe.delegate] - Listen to Observe attributes
 - [can.Observe.setter] - Use setter methods on Observes
 - [can.Observe.attributes] - Define Observe attributes
 - [can.Observe.validations] - Validate attributes
 - [can.Observe.backup] - Backup and restore an Observe's state
 - [can.Control.plugin] - Registers a jQuery plugin function for Controls[1]
 - [can.view.modifiers View modifiers] - Use jQuery modifiers to render views[1]


You can use it out of the box on top of jQuery, Zepto, YUI, and Mootools,
and it's only 13K.

@api canjs