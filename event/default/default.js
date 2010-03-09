steal.apps('jquery').then(function($){
    
	$.event.special["default"] = {
		add: function( handleObj){
			//jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) );
			
			var origHandler = handleObj.handler;
			handleObj.origHandler = origHandler;
			handleObj.handler = function(ev){
				ev._defaultActions.push({element: this, handler: origHandler, event: ev})
			}
		},
		setup : function(){return true}
	}
	
	/*
	 * var add = $.event.add;
	
	$.event.add = function(elem, types, handler, data){
		//check if types has default.
		
		
		add.apply($.event, arguments)
	}
	 * 
	 */
	//return;
    var oldTrigger = $.event.trigger;
    $.event.trigger =  function defaultTriggerer( event, data, elem, bubbling){
        //always need to convert here so we know if we have default actions
        var type = event.type || event
		//should need to trigger just on this event
		
        if ( !bubbling ) {
			event = typeof event === "object" ?
				// jQuery.Event object
				event[$.expando] ? event :
				// Object literal
				jQuery.extend( jQuery.Event(type), event ) :
				// Just the event type (string)
				jQuery.Event(type);

			if ( type.indexOf("!") >= 0 ) {
				event.type = type = type.slice(0, -1);
				event.exclusive = true;
			}
            event._defaultActions = []; //set depth for possibly reused events
        }
		
		var defaultGetter = jQuery.Event("default."+event.type);
		defaultGetter.target = elem;
		defaultGetter.stopPropagation();
		defaultGetter._defaultActions = event._defaultActions;
		defaultGetter.exclusive = true;
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