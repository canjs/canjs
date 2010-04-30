/**
 * @add jQuery.event.special static
 */
steal.plugins('jquery').then(function($){
	/**
	 * @attribute destroyed
	 * Provides a destroyed event
	 */
	$.event.special["destroyed"] = {
		remove: function( handleObj){
			//call the handler
			if(handleObj.removed) return;
			var event = jQuery.Event( "destroyed" );
			event.preventDefault();
			event.stopPropagation(); 
			handleObj.removed = true;
			handleObj.handler.call( this, event )
			
		},
		setup : function(handleObj){
			
		}
	}
})