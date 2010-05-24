/**
 * @add jQuery.event.special static
 */
steal.plugins('jquery/event').then(function($){
	/**
	 * @attribute destroyed
	 * @parent specialevents
	 * @download jquery/dist/jquery.event.destroyed.js
	 * Provides a destroyed event on an element.
	 * <p>
	 * The destroyed event \ is called when the element
	 * is removed as a result of jQuery DOM manipulators like remove, html,
	 * replaceWith, etc. Destroyed events do not bubble, so make sure you don't use live or delegate with destroyed
	 * events.
	 * </p>
	 * <h2>Quick Example</h2>
	 * @codestart
	 * $(".foo").bind("destroyed", function(){
	 *    //clean up code
	 * })
	 * @codeend
	 * <h2>Demo</h2>
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