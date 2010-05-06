steal.plugins('jquery').then(function($){
    /**
	 * @add jQuery.event.special static
	 */
	var types = {
		
	}
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
	 * <p>Lets look at how you could build a simple tabs widget with default events.</p>
	 * @demo jquery/event/default/default.html
	 * <p>The code that prevents the <i>Part 2</i> tab from showing is:</p>
	 * @codestart
$("#second").bind("show",function(ev){
  if(! $("#complete")[0].checked ){
    ev.preventDefault();
  }
})
	 * @codeend
	 */
	$.event.special["default"] = {
		add: function( handleObj){
			//jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) );
			
			var origHandler = handleObj.handler;
			types[handleObj.namespace] = true;
			handleObj.origHandler = origHandler;
			handleObj.handler = function(ev, data){
				if(!ev._defaultActions) ev._defaultActions = [];
				ev._defaultActions.push({element: this, handler: origHandler, event: ev, data: data, currentTarget: ev.currentTarget})
			}
		},
		setup : function(){return true}
	}
	
	//return;
    var oldTrigger = $.event.trigger;
    $.event.trigger =  function defaultTriggerer( event, data, elem, bubbling){
        //always need to convert here so we know if we have default actions
        var type = event.type || event
		//should need to trigger just on this event
		//shortcut if we never listened for a default of this type
		if(!types[type]){
			 return oldTrigger.call($.event, event, data, elem, bubbling)
		}
		
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
		
		var defaultGetter = jQuery.Event("default."+event.type), res;
		defaultGetter.target = elem;
		defaultGetter.stopPropagation();
		defaultGetter._defaultActions = event._defaultActions;
		defaultGetter.exclusive = true;
		if(elem)
			oldTrigger.call($.event, defaultGetter, [defaultGetter, data], elem, true)
        res = oldTrigger.call($.event, event, data, elem, bubbling); //tail recursive
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
			//event.currentTarget = event.liveFired || event.currentTarget;
			event.liveFired = null;
			for(var i = 0 ; i < event._defaultActions.length; i++){
				var a  = event._defaultActions[i];
				event.currentTarget = a.currentTarget;
				a.handler.call(a.element, event, a.data)
            }
            event._defaultActions = null; //set to null so everyone else on this element ignores it
        }
    }
	$.fn.triggerHandlerDefault = function(type, data){
		if ( this[0] ) {
			var event = $.Event( type );
			event.stopPropagation();
			jQuery.event.trigger( event, data, this[0] );
			return !event.isDefaultPrevented();
		}
		return true;
	}
	$.fn.triggerDefault = function(type, data){
		if ( this[0] ) {
			var event = $.Event( type );
			jQuery.event.trigger( event, data, this[0] );
			return !event.isDefaultPrevented();
		}
		return true;
	}
	
	
	
});