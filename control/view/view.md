@page can.Control.view 
@parent can.Control
@plugin can/control/view
@test can/control/view/qunit.html
@download http://jmvcsite.heroku.com/pluginify?plugins[]=can/control/view/view.js

Renders a View template with the controller instance. If the first argument
is not supplied, it looks for a view in `/views/controller_name/action_name.ejs`.
If data is not provided, it uses the controller instance as data.

	var Tasks = can.Control.extend('Tasks',{
		click: function( el ) {
			// renders with views/tasks/click.ejs
			this.element.html( this.view() )

			// renders with views/tasks/click.ejs with some data
			this.element.html( 
				this.view({ name : 'The task' }) );

			// renders with views/tasks/under.ejs
			this.element.html( 
				this.view("under", [1,2]) );

			// renders with views/tasks/under.micro 
			this.element.html( 
				this.view("under.micro", [1,2]) );

			// renders with views/shared/top.ejs
			this.element.html( 
				this.view("shared/top", {phrase: "hi"}) );
		}
	})