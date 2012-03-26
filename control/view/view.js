steal('can/control', 'can/view').then(function( $ ) {
	var URI = steal.URI || steal.File;
	
	can.Control.getFolder = function() {
		return can.underscore(this.fullName.replace(/\./g, "/")).replace("/Controllers", "");
	};

	can.Control._calculatePosition = function( Class, view, action_name ) {
		var classParts = Class.fullName.split('.'),
			classPartsWithoutPrefix = classParts.slice(0);
			classPartsWithoutPrefix.splice(0, 2); // Remove prefix (usually 2 elements)

		var hasControllers = (classParts.length > 2) && classParts[1] == 'Controllers',
			path = hasControllers? can.underscore(classParts[0]): can.underscore(classParts.join("/")),
			controller_name = can.underscore(classPartsWithoutPrefix.join('/')).toLowerCase(),
			suffix = (typeof view == "string" && /\.[\w\d]+$/.test(view)) ? "" : can.view.ext;
			
		//calculate view
		if ( typeof view == "string" ) {
			if ( view.substr(0, 2) == "//" ) { //leave where it is
			} else {
				view = "//" + URI(path).join( 'views/' + (view.indexOf('/') !== -1 ? view : (hasControllers ? controller_name + '/' : "") + view)) + suffix;
			}
		} else if (!view ) {
			view = "//" + URI(path).join('views/' + (hasControllers ? controller_name + '/' : "") + action_name.replace(/\.|#/g, '').replace(/ /g, '_'))+ suffix;
		}
		return view;
	};
	
	var calculateHelpers = function( myhelpers ) {
		var helpers = {};
		if ( myhelpers ) {
			if ( can.isArray(myhelpers) ) {
				for ( var h = 0; h < myhelpers.length; h++ ) {
					can.extend(helpers, myhelpers[h]);
				}
			}
			else {
				can.extend(helpers, myhelpers);
			}
		} else {
			if ( this._default_helpers ) {
				helpers = this._default_helpers;
			}
			
			//load from name
			var current = window;
			var parts = this.constructor.fullName.split(/\./);
			for ( var i = 0; i < parts.length; i++ ) {
				if(current){
					if ( typeof current.Helpers == 'object' ) {
						can.extend(helpers, current.Helpers);
					}
					current = current[parts[i]];
				}
			}
			
			if (current && typeof current.Helpers == 'object' ) {
				can.extend(helpers, current.Helpers);
			}
			
			this._default_helpers = helpers;
		}
		return helpers;
	};

	/**
	 * @add can.Control.prototype
	 */
	can.Control.prototype.
	
	/**
	 * @tag view
	 * Renders a View template with the controller instance. If the first argument
	 * is not supplied, it looks for a view in /views/controller_name/action_name.ejs.
	 * If data is not provided, it uses the controller instance as data.
	 * Note that you will have to set a name when creating the Control construct for __view__ to work.
	 *
	 * @codestart
	 * var Tasks = can.Control.extend('Tasks',{
	 *   click: function( el ) {
	 *     // renders with views/tasks/click.ejs
	 *     this.element.html( this.view() );
	 *     // renders with views/tasks/click.ejs with some data
	 *     this.element.html( this.view({ name : 'The task' }) );
	 *     // renders with views/tasks/under.ejs
	 *     this.element.html( this.view("under", [1,2]) );
	 *     // renders with views/tasks/under.micro 
	 *     this.element.html( this.view("under.micro", [1,2]) );
	 *     // renders with views/shared/top.ejs
	 *     this.element.html( this.view("shared/top", {phrase: "hi"}) );
	 *   }
	 * })
	 * @codeend
	 *
	 * @plugin can/control/view
	 * @return {String} the rendered result of the view.
	 * @param {String} [view]  The view you are going to render.  If a view isn't explicity given
	 * this function will try to guess at the correct view as show in the example code above.
	 * @param {Object} [data]  data to be provided to the view.  If not present, the controller instance 
	 * is used.
	 * @param {Object} [myhelpers] an object of helpers that will be available in the view.  If not present
	 * this controller class's "Helpers" property will be used.
	 *
	 */
	view = function( view, data, myhelpers ) {
		//shift args if no view is provided
		if ( typeof view != "string" && !myhelpers ) {
			myhelpers = data;
			data = view;
			view = null;
		}
		
		//guess from controller name
		view = can.Control._calculatePosition(this.constructor, view, this.called);

		//calculate data
		data = data || this;

		//calculate helpers
		var helpers = calculateHelpers.call(this, myhelpers);

		return can.view(view, data, helpers); //what about controllers in other folders?
	};

});