/**
 * @add jQuery.event.special static
 */
steal.plugins('jquery/event').then(function($){
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
	var oldClean = jQuery.cleanData
	
	jQuery.cleanData= function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			jQuery.event.remove( elem, 'destroyed' );
		}
		oldClean(elems)
	}
	
})