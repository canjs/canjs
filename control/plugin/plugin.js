steal('can/control', function(){
	


//used to determine if a control instance is one of controllers
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
		return $el.data('controls');
	},
	makeArray = can.makeArray,
	old = can.Control.setup;


can.Control.setup = function() {
	// if you didn't provide a name, or are control, don't do anything
	if ( this !== can.Control ) {
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
		var pluginName = this.pluginName || this._fullName;
			
		// create jQuery plugin
		if(pluginName !== 'can_control'){
			this.plugin(pluginName);
		}
			
		old.apply(this, arguments);
	}
};

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
	 * @function jQuery.fn.controls
	 * @parent can.Control.plugin
	 * Gets all controls in the jQuery element.
	 * @return {Array} an array of control instances.
	 */
	controls: function() {
		var controllerNames = makeArray(arguments),
			instances = [],
			controls, c, cname;
		//check if arguments
		this.each(function() {

			controls = can.$(this).data("controls");
			if(!controls){
				return;
			}
			for(var i=0; i<controls.length; i++){
				c = controls[i];
				if (!controllerNames.length || isAControllerOf(c, controllerNames) ) {
					instances.push(c);
				}
			}
		});
		return instances;
	},
	/**
	 * @function jQuery.fn.control
	 * @parent can.Control.plugin
	 * Gets a control in the jQuery element.  With no arguments, returns the first one found.
	 * @param {Object} control (optional) if exists, the first control instance with this class type will be returned.
	 * @return {jQuery.Controller} the first control.
	 */
	control: function( control ) {
		return this.controls.apply(this, arguments)[0];
	}
});

can.Control.plugin = function(pluginname){
	var control = this;

	if (!can.prototype[pluginname]) {
		can.prototype[pluginname] = function(options){
		
			var args = makeArray(arguments),   //if the arg is a method on this control
			isMethod = typeof options == "string" && $.isFunction(control.prototype[options]), meth = args[0];
			return this.each(function(){
				//check if created
				var plugin = can.$(this).control(control);
				
				if (plugin) {
					if (isMethod) {
						// call a method on the control with the remaining args
						plugin[meth].apply(plugin, args.slice(1));
					}
					else {
						// call the plugin's update method
						plugin.update.apply(plugin, args);
					}
					
				}
				else {
					//create a new control instance
					control.newInstance.apply(control, [this].concat(args));
				}
			});
		};
	}
}


		/**
		 * @function can.Control.prototype.update
		 * @parent can.Control.plugin
		 * Update extends [jQuery.Control.prototype.options this.options] 
		 * with the `options` argument and rebinds all events.  It basically
		 * re-configures the control.
		 * 
		 * For example, the following control wraps a recipe form. When the form
		 * is submitted, it creates the recipe on the server.  When the recipe
		 * is `created`, it resets the form with a new instance.
		 * 
		 *     can.Control('Creator',{
		 *       "{recipe} created" : function(){
		 *         this.update({recipe : new Recipe()});
		 *         this.element[0].reset();
		 *         this.find("[type=submit]").val("Create Recipe")
		 *       },
		 *       "submit" : function(el, ev){
		 *         ev.preventDefault();
		 *         var recipe = this.options.recipe;
		 *         recipe.attrs( this.element.formParams() );
		 *         this.find("[type=submit]").val("Saving...")
		 *         recipe.save();
		 *       }
		 *     });
		 *     $('#createRecipes').creator({recipe : new Recipe()})
		 * 
		 * 
		 * @demo jquery/control/demo-update.html
		 * 
		 * Update is called if a control's [jquery.control.plugin jQuery helper] is 
		 * called on an element that already has a control instance
		 * of the same type. 
		 * 
		 * For example, a widget that listens for model updates
		 * and updates it's html would look like.  
		 * 
		 *     can.Control('Updater',{
		 *       // when the control is created, update the html
		 *       init : function(){
		 *         this.updateView();
		 *       },
		 *       
		 *       // update the html with a template
		 *       updateView : function(){
		 *         this.element.html( "content.ejs",
		 *                            this.options.model ); 
		 *       },
		 *       
		 *       // if the model is updated
		 *       "{model} updated" : function(){
		 *         this.updateView();
		 *       },
		 *       update : function(options){
		 *         // make sure you call super
		 *         this._super(options);
		 *          
		 *         this.updateView();
		 *       }
		 *     })
		 * 
		 *     // create the control
		 *     // this calls init
		 *     $('#item').updater({model: recipe1});
		 *     
		 *     // later, update that model
		 *     // this calls "{model} updated"
		 *     recipe1.update({name: "something new"});
		 *     
		 *     // later, update the control with a new recipe
		 *     // this calls update
		 *     $('#item').updater({model: recipe2});
		 *     
		 *     // later, update the new model
		 *     // this calls "{model} updated"
		 *     recipe2.update({name: "something newer"});
		 * 
		 * _NOTE:_ If you overwrite `update`, you probably need to call
		 * this._super.
		 * 
		 * ### Example
		 * 
		 *     can.Control("Thing",{
		 *       init: function( el, options ) {
		 *         alert( 'init:'+this.options.prop )
		 *       },
		 *       update: function( options ) {
		 *         this._super(options);
		 *         alert('update:'+this.options.prop)
		 *       }
		 *     });
		 *     $('#myel').thing({prop : 'val1'}); // alerts init:val1
		 *     $('#myel').thing({prop : 'val2'}); // alerts update:val2
		 * 
		 * @param {Object} options A list of options to merge with 
		 * [jQuery.Control.prototype.options this.options].  Often, this method
		 * is called by the [jquery.control.plugin jQuery helper function].
		 */
can.Control.prototype.update = function( options ) {
		can.extend(this.options, options);
		this.on();
};


});