steal('can/control', 'can/view').then(function( $ ) {
	var URI = steal.URI || steal.File;
	
	Can.Control.getFolder = function() {
		return Can.String.underscore(this.fullName.replace(/\./g, "/")).replace("/Controllers", "");
	};

	Can.Control._calculatePosition = function( Class, view, action_name ) {
		var classParts = Class.fullName.split('.'),
			classPartsWithoutPrefix = classParts.slice(0);
			classPartsWithoutPrefix.splice(0, 2); // Remove prefix (usually 2 elements)

		var classPartsWithoutPrefixSlashes = classPartsWithoutPrefix.join('/'),
			hasControllers = (classParts.length > 2) && classParts[1] == 'Controllers',
			path = hasControllers? Can.String.underscore(classParts[0]): Can.String.underscore(classParts.join("/")),
			controller_name = Can.String.underscore(classPartsWithoutPrefix.join('/')).toLowerCase(),
			suffix = (typeof view == "string" && /\.[\w\d]+$/.test(view)) ? "" : Can.view.ext;
			
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
			if ( Can.isArray(myhelpers) ) {
				for ( var h = 0; h < myhelpers.length; h++ ) {
					Can.extend(helpers, myhelpers[h]);
				}
			}
			else {
				Can.extend(helpers, myhelpers);
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
						Can.extend(helpers, current.Helpers);
					}
					current = current[parts[i]];
				}
			}
			
			if (current && typeof current.Helpers == 'object' ) {
				Can.extend(helpers, current.Helpers);
			}
			
			this._default_helpers = helpers;
		}
		return helpers;
	};

	/**
	 * @add Can.Control.prototype
	 */
	Can.Control.prototype.
	
	/**
	 * @tag view
	 * Renders a View template with the controller instance. If the first argument
	 * is not supplied, it looks for a view in /views/controller_name/action_name.ejs.
	 * If data is not provided, it uses the controller instance as data.
	 *
	 * @codestart
	 * TasksController = Can.Control.extend('TasksController',{
	 *   click: function( el ) {
	 *     // renders with views/tasks/click.ejs
	 *     el.html( this.view() ) 
	 *     // renders with views/tasks/under.ejs
	 *     el.after( this.view("under", [1,2]) );
	 *     // renders with views/tasks/under.micro 
	 *     el.after( this.view("under.micro", [1,2]) );
	 *     // renders with views/shared/top.ejs
	 *     el.before( this.view("shared/top", {phrase: "hi"}) );
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
		view = Can.Control._calculatePosition(this.constructor, view, this.called);

		//calculate data
		data = data || this;

		//calculate helpers
		var helpers = calculateHelpers.call(this, myhelpers);

		return Can.view(view, data, helpers); //what about controllers in other folders?
	};

});