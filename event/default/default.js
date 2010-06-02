/**
 * @add jQuery.event.special static
 */
steal.plugins('jquery/event').then(function($){

//cache default types for performance
var types = {}, rnamespaces= /\.(.*)$/;
/**
 * @attribute default
 * @parent specialevents
 * Allows you to perform default actions as a result of an event.
 * <p>
 * Event based APIs are a powerful way of exposing functionality of your widgets.  It also fits in 
 * quite nicely with how the DOM works.
 * </p>
 * <p>
 * Like default events in normal functions (e.g. submitting a form), synthetic default events run after
 * all event handlers have been triggered and no event handler has called
 * preventDefault or returned false.
 * </p>
 * <p>To listen for a default event, just prefix the event with default.</p>
 * @codestart
 * $("div").bind("default.show", function(ev){ ... });
 * $("ul").delegate("li","default.activate", function(ev){ ... });
 * @codeend
 * <h2>Example</h2>
 * <p>Lets look at how you could build a simple tabs widget with default events.
 * First with just jQuery:</p>
 * @demo jquery/event/default/defaultjquery.html
 * <p>Lets see how we would build this with JavaScriptMVC:</p>
 * @demo jquery/event/default/default.html
 */
$.event.special["default"] = {
	add: function( handleObj){
		//save the type
		types[handleObj.namespace.replace(rnamespaces,"")] = true;
		
		//move the handler ...
		var origHandler = handleObj.handler;
		
		handleObj.origHandler = origHandler;
		handleObj.handler = function(ev, data){
			if(!ev._defaultActions) ev._defaultActions = [];
			ev._defaultActions.push({element: this, handler: origHandler, event: ev, data: data, currentTarget: ev.currentTarget})
		}
	},
	setup : function(){return true}
}

// overwrite trigger to allow default types
var oldTrigger = $.event.trigger;
$.event.trigger =  function defaultTriggerer( event, data, elem, bubbling){
    //always need to convert here so we know if we have default actions
    var type = event.type || event
	//should need to trigger just on this event
	//shortcut if we never listened for a default of this type
	//if(!types[type]){
	//	 return oldTrigger.call($.event, event, data, elem, bubbling)
	//}
	
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
	
	var defaultGetter = jQuery.Event("default."+event.type), 
		res;
		
	$.extend(defaultGetter,{
		target: elem,
		_defaultActions: event._defaultActions,
		exclusive : true
	});
	
	defaultGetter.stopPropagation();
	
	//default events only work on elements
	if(elem){
		oldTrigger.call($.event, defaultGetter, [defaultGetter, data], elem, true);
	}
	
	//fire old trigger, this will call back here	
    res = oldTrigger.call($.event, event, data, elem, bubbling); 
    
	//fire if there are default actions to run && 
    //        we have not prevented default &&
    //        propagation has been stopped or we are at the document element
    //        we have reached the document
	if (!event.isDefaultPrevented() &&
         event._defaultActions  &&
        ( ( event.isPropagationStopped() ) ||
          ( !elem.parentNode && !elem.ownerDocument ) )
          
        ) {			
		
		// put event back
		event.namespace= event.type;
		event.type = "default";
		event.liveFired = null;
		
		// call each event handler
		for(var i = 0 ; i < event._defaultActions.length; i++){
			var a  = event._defaultActions[i];
			event.currentTarget = a.currentTarget;
			a.handler.call(a.element, event, a.data)
        }
        event._defaultActions = null; //set to null so everyone else on this element ignores it
    }
}
/**
 * @add jQuery.fn
 */
$.fn.
/**
 * Triggers the event, stops the event from propagating through the DOM, and 
 * returns whether or not the event's default action was prevented.  
 * If true, the default action was not prevented.  If false, the 
 * default action was prevented.  This is the same as triggerDefaults, but 
 * the event doesn't bubble.
 * @param {Object} type The type of event to trigger.
 * @param {Object} type The type of event to trigger.
 * @param {Object} data Some data to pass to callbacks listening to this 
 * event.
 */
triggerDefault = function(type, data){
	if ( this[0] ) {
		var event = $.Event( type );
		event.stopPropagation();
		jQuery.event.trigger( event, data, this[0] );
		return !event.isDefaultPrevented();
	}
	return true;
}
$.fn.
/**
 * Triggers the event and returns whether or not the event's 
 * default action was prevented.  If true, the default action was not 
 * prevented.  If false, the default action was prevented.  This is the same 
 * as triggerDefault, but the event bubbles.
 * @param {Object} type The type of event to trigger.
 * @param {Object} data Some data to pass to callbacks listening to this 
 * event.
 */
triggerDefaults = function(type, data){
	if ( this[0] ) {
		var event = $.Event( type );
		jQuery.event.trigger( event, data, this[0] );
		return !event.isDefaultPrevented();
	}
	return true;
}
	
	
	
	
	
	
});