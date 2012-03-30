@page can.Control.plugin 
@parent can.Control
@plugin can/control/plugin
@test can/control/plugin/qunit.html
@download http://donejs.com/can/dist/can.control.plugin.js

The can.Control plugin extension creates a plugin for the control on the 
jQuery prototype, using the control's [can.Construct.fullName fullName] or
a static `pluginName` attribute. For example, given the following control:

	var Tabs = can.Control({
		pluginName: 'tabs'
	}, {
		init: function( element, options, arg1 ) {},
		update: function( options ) {}
	});

Using jQuery, create the control directly on a jQuery collection like:

    $( '.tabs' ).tabs();

__Note:__ This plugin only supports jQuery.

## Plugin Name

Setting the static `pluginName` property allows you to set the can plugin helper name:

	var Filler = can.Control({
		pluginName: "fillWith"
	}, {});

	$( '#foo' ).fillWith();

If you don't provide a plugin name, the control falls back to the
[can.Construct.fullName fullName] attribute:

	can.Control('Ui.Layout.FillWith', {}, {});
	$( '#foo' ).ui_layout_fill_with();

## Updating

Update extends [can.Control.prototype.options options] 
with the `options` argument and rebinds all events.  It 
re-configures the control.

For example, the following control wraps a recipe form. When the form
is submitted, it creates the recipe on the server.  When the recipe
is `created`, it resets the form with a new instance.

	var Creator = can.Control({
		'{recipe} created': function() {
			this.update({ recipe : new Recipe() });
			this.element[0].reset();
			this.find( '[type=submit]' ).val( 'Create Recipe' );
		},
		'submit': function( el, ev ) {
			ev.preventDefault();
			var recipe = this.options.recipe;
			recipe.attrs( this.element.formParams() );
			this.find( '[type=submit]' ).val( 'Saving...' );
			recipe.save();
		}
	});
	
	$( '#createRecipes' ).creator({ recipe : new Recipe() });
	
`update` is called if a Control's plugin helper is called with the plugin options on an element
that already has a control instance of the same type. To implement your
own update method, make sure to call the old one either using the [can.Contruct.super] plugin or
by calling `can.Control.prototype.update.apply(this, arguments);`.
For example, to change the content of the control element every time the options change:

	var Plugin = can.Control({
		pluginName: 'myPlugin'
	}, {
		init : function(el, options) {
			this.updateCount = 0;
			this.update({
				text : 'Initialized'
			});
		},

		update : function(options) {
			// Call the old update. Use this._super when using can/construct/super
			can.Control.prototype.update.call(this, options);
			this.element.html( this.options.text + ' ' + (++this.updateCount) + ' times' );
		}
	});

	$( '#control' ).myPlugin();
	$( '#control' ).html();
	// Initialized. Updated 1 times
	$( '#control' ).myPlugin({ text : 'Calling update. Updated' });
	$( '#control' ).html();
	// Calling update. Updated 2 times

## Calling methods

There are a few different ways to invoke methods on a controller instance after
it's created. Given the following Control:

	var MyTodo = can.Control({
		create: function( name, task ) {
			this.element.append( name + ' ' + task );
		}
	});

If there is only a single Control instance attached to a DOM element, you can
simply invoke the method directly on the instance like:

	var todoControl = new MyTodo( '#my_todo ');
	todoControl.create( 'Austin', 'Sweep garage' );

After a Control has been initialized on a jQuery collection, a method can be
called over the entire collection by invoking the plugin with the method
name parameter, along with any additional arguments you want to pass:

	$( '.my_todo' ).my_todo( 'create', 'Austin', 'Sweep garage' );

Keep in mind that this approach follows the jQuery plugin convention and returns
a jQuery object for chaining, not the method's return value.

For more information on fetching controller instances on DOM elements see 
the __Access__ section.

## Access

When the widget is initialized, the plugin control creates an association 
of Control instance(s) to the DOM element it was initialized on using 
[can.data] method.

### Controller

The `controller` method allows you to get a Control instance for the element.  
With no arguments, returns the first one found, otherwise the first Control
instance with this class type will be returned.

	<div id="widget" class="my_widget">

	$('#widget').controller() // will return: MyWidget

### Controllers

The `controllers` method allows you to get all the Controls attached to the element.
For example, we can fetch both the _MyWidget_ and the _MyClock_ instance 
below by calling `controllers` on the DOM element.

	<div id="widget" class="my_widget my_clock">
	
	$('#widget').controllers() // will return: [ MyWidget, MyClock ]
