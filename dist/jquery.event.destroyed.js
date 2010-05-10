// jquery/event/destroyed/destroyed.js

(function($){

	/**
	 * @attribute destroyed
	 * @parent specialevents
	 * Provides a destroyed event on an element.
	 * <p>
	 * The destroyed event does not bubble and is called when the element
	 * is removed as a result of jQuery DOM manipulators like remove, html,
	 * replaceWith, etc. 
	 * </p>
	 * <h2>Example</h2>
	 * @demo jquery/event/destroyed/destroyed.html 
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

})(jQuery);

