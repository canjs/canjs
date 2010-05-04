/**
 * @add jQuery.event.special static
 */
steal.plugins('jquery').then(function($){
	/**
	 * @attribute destroyed
	 * Provides a destroyed event on an element.
	 * <p>
	 * The destroyed event does not bubble and is called when the element
	 * is removed as a result of jQuery DOM manipulators like remove, html,
	 * replaceWith, etc. 
	 * </p>
	 * <h2>Example</h2>
	 * @iframe jquery/event/destroyed/destroyed.html 150
	 */
	$.event.special["destroyed"] = {
		remove: function( handleObj){
			//call the handler
			if(handleObj.removed || handleObj.handler.removed) return;
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