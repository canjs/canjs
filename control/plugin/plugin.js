steal('can/control', function(){
	


//used to determine if a controller instance is one of controllers
//controllers can be strings or classes
var i,
	isAControllerOf = function( instance, controllers ) {
		for ( i = 0; i < controllers.length; i++ ) {
			if ( typeof controllers[i] == 'string' ? instance.constructor._shortName == controllers[i] : instance instanceof controllers[i] ) {
				return true;
			}
		}
		return false;
	},
	data = function(el, data){
		var $el = can.$(el);
		if(!$el.data('controllers')) {
			$el.data('controllers', data || {})
		}
		return $el.data('controllers');
	},
	makeArray = can.makeArray,
	old = can.Control.setup;


can.Control.setup = function() {
	// if you didn't provide a name, or are control, don't do anything
	if ( this !== can.Control ) {

		var pluginName = this.pluginName || this._fullName;
			
		// create can plugin
		if(pluginName !== 'can_control'){
			this.plugin(pluginName);
		}
			
		old.apply(this, arguments);
	}
};

can.prototype.extend({

	controllers: function() {
		var controllerNames = makeArray(arguments),
			instances = [],
			controllers, c, cname;
		//check if arguments
		this.each(function() {

			controllers = data(this);
			for ( cname in controllers ) {
				if ( controllers.hasOwnProperty(cname) ) {
					c = controllers[cname];
					if (!controllerNames.length || isAControllerOf(c, controllerNames) ) {
						instances.push(c);
					}
				}
			}
		});
		return instances;
	},

	controller: function( controller ) {
		// Just return the first result from the .controllers() list
		return this.controllers.apply(this, arguments)[0];
	}
});

can.Control.plugin = function(pluginname){
	var controller = this;

	if (!can.prototype[pluginname]) {
		can.prototype[pluginname] = function(options){
			var args = makeArray(arguments),   //if the arg is a method on this controller
			isMethod = typeof options == "string" && $.isFunction(controller.prototype[options]), meth = args[0];
			return this.each(function(){
				//check if created
				var controllers = data(this),    //plugin is actually the controller instance
				plugin = controllers && controllers[pluginname];
				if (plugin) {
					if (isMethod) {
						// call a method on the controller with the remaining args
						plugin[meth].apply(plugin, args.slice(1));
					}
					else {
						// call the plugin's update method
						plugin.update.apply(plugin, args);
					}
					
				}
				else {
					//create a new controller instance
					controllers[pluginname] = 
						controller.newInstance.apply(controller, [this].concat(args));
				}
			});
		};
	}
}

// Add the update method to the can.Control prototype
can.Control.prototype.update = function( options ) {
	can.extend(this.options, options);
	this.on();
};


});