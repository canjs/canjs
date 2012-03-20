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
	$el.data("controllers", data || {})
	return $el.data('controllers');
},
makeArray = can.makeArray;


/**
 * @hide
 * @attribute pluginName
 * Setting the <code>pluginName</code> property allows you
 * to change the jQuery plugin helper name from its 
 * default value.
 * 
 *     can.Control("Mxui.Layout.Fill",{
 *       pluginName: "fillWith"
 *     },{});
 *     
 *     $("#foo").fillWith();
 */
can.prototype.extend({

	/**
	 * @function jQuery.fn.controllers
	 * @parent can.Control.plugin
	 * Gets all controllers in the jQuery element.
	 * @return {Array} an array of controller instances.
	 */
	controllers: function() {
		var controllerNames = makeArray(arguments),
			instances = [],
			controllers, c, cname;
		//check if arguments
		this.each(function() {

			controllers = can.$(this).data("controllers");
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
	/**
	 * @function jQuery.fn.controller
	 * @parent can.Control.plugin
	 * Gets a controller in the jQuery element.  With no arguments, returns the first one found.
	 * @param {Object} controller (optional) if exists, the first controller instance with this class type will be returned.
	 * @return {jQuery.Controller} the first controller.
	 */
	controller: function( controller ) {
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

});