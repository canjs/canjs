@page can.Control.view 
@parent can.Control

Renders a View template with the controller instance. If the first argument
is not supplied, it looks for a view in /views/controller_name/action_name.ejs.
If data is not provided, it uses the controller instance as data.

	TasksController = can.Control.extend('TasksController',{
		click: function( el ) {
			// renders with views/tasks/click.ejs
			el.html( this.view() ) 
			
			// renders with views/tasks/under.ejs
			el.after( this.view("under", [1,2]) );

			// renders with views/tasks/under.micro 
			el.after( this.view("under.micro", [1,2]) );

			// renders with views/shared/top.ejs
			el.before( this.view("shared/top", {phrase: "hi"}) );
		}
	})