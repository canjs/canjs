steal.apps('jquery').then(function($){
    
	$.event.special["default"] = {add: function( handler, data, namespaces, handlers){
		var func =  function(ev){
			ev._defaultActions.push({element: this, handler: handler, event: ev})
		}
		func.types = handler.types;
		return func;
	},
	setup : function(){return true}}
	
	/*
	 * var add = $.event.add;
	
	$.event.add = function(elem, types, handler, data){
		//check if types has default.
		
		
		add.apply($.event, arguments)
	}
	 * 
	 */

    var oldTrigger = $.event.trigger;
    $.event.trigger =  function defaultTriggerer( event, data, elem, bubbling){
        //always need to convert here so we know if we have default actions
        
		//should need to trigger just on this event
		
        if ( !bubbling ) {
			var type = event.type || event
            event = typeof event === "object" ?
				// jQuery.Event object
				event[$.expando] ? event :
				// Object literal
				jQuery.extend( jQuery.Event(type), event ) :
				// Just the event type (string)
				jQuery.Event(type);
            event._defaultActions = []; //set depth for possibly reused events
        }
		
		var defaultGetter = jQuery.Event("default."+event.type);
		defaultGetter.stopPropagation();
		defaultGetter._defaultActions = event._defaultActions;
		if(elem)
			oldTrigger.call($.event, defaultGetter, [defaultGetter], elem, true)
        oldTrigger.call($.event, event, data, elem, bubbling); //tail recursive
        //fire if there are default actions to run && 
        //        we have not prevented default &&
        //        propagation has been stopped or we are at the document element
        //        we have reached the document
		if (!event.isDefaultPrevented() &&
             event._defaultActions  &&
            ( ( event.isPropagationStopped() ) ||
              ( !elem.parentNode && !elem.ownerDocument ) )
              
            ) {
			//put event back
			event.type = "default."+event.type;
			for(var i = 0 ; i < event._defaultActions.length; i++){
				var a  = event._defaultActions[i];
				a.handler.call(a.element, event)
            }
            event._defaultActions = null; //set to null so everyone else on this element ignores it
        }
    }
});