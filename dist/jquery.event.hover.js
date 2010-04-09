// jquery/event/livehack/livehack.js

(function($){

	var liveHandler = null, event = jQuery.event;
	
	
	/**
	 * Finds event handlers of a given type on an element.
	 * @param {Object} el
	 * @param {Object} types
	 * @param {Object} selector
	 */
	event.find  = function(el, types, selector){
		var events = $.data(el, "events"), handlers = [];
		
		
		
		
		if(!events) return handlers;
		
		if(selector){
			if( !events.live) return [];
			var live = events.live, handlers = [];

			for (var t = 0; t < live.length; t++) {
				var liver = live[t];
				if(  liver.selector == selector &&  $.inArray(liver.origType, types  ) !== -1 ){
					handlers.push(liver.origHandler || liver.handler)
				}
			}
		}else{
			for(var t =0; t< types.length; t++){
				var type = types[t], 
					typeHandlers,
					all = type.indexOf(".") < 0,
					namespaces,
					namespace; 
				if ( !all ) {
					namespaces = type.split(".");
					type = namespaces.shift();
					namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
				}
				typeHandlers = ( events[type] || [] ).slice(0)
				
				for(var h = 0; h <typeHandlers.length; h++ ){
					var handle = typeHandlers[h];
					if(handle.selector == selector && (all || namespace.test( handle.namespace ))  )
						handlers.push(handle.origHandler || handle.handler)
				}
			}
			
			
		}
		return handlers;
	}
	$.fn.respondsTo = function(events){
		if(!this.length){
			return false;
		}else{
			//add default ?
			return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
		}
	}
	$.fn.triggerHandled = function(event, data){
		event = ( typeof event == "string" ? $.Event(event) : event);
		this.trigger(event, data)
		return event.handled
	}
	/**
	 * Only attaches one 
	 * @param {Array} types llist of types that will delegate here
	 * @param {Object} startingEvent the first event to start listening to
	 * @param {Object} onFirst a function to call 
	 */
	event.setupHelper = function(types, startingEvent, onFirst){
		if(!onFirst) {
			onFirst = startingEvent;
			startingEvent = null;
		}
		var add = function(handleObj){
			
			var selector = handleObj.selector || "";
			if (selector) {
				var bySelector = event.find(this, types, selector);
				if (!bySelector.length) {
					$(this).delegate(selector,startingEvent, onFirst );
				}
			}
			else {
				//var bySelector = event.find(this, types, selector);
				event.add(this, startingEvent, onFirst, {
					selector: selector,
					delegate: this
				})
			}
			
		}
		var remove = function(handleObj){
			var selector = handleObj.selector || ""
			if (selector) {
				var bySelector = event.find(this, types, selector);
				if (!bySelector.length) {
					$(this).undelegate(selector,startingEvent, onFirst );
				}
			}
			else {
				event.remove(this, startingEvent, onFirst, {
					selector: selector,
					delegate: this
				})
			}
		}
		$.each(types, function(){
			event.special[this] = {
				add:  add,
				remove: remove,
				setup : function(){}
			}
		})
	}
	
	
	

})(jQuery);

// jquery/event/hover/hover.js

(function($){

	jQuery.hoverTimers = jQuery.hoverTimers || [];
	var $ = jQuery,
		event = jQuery.event, 
		handle  = event.handle,
		onmouseenter = function(ev){
			//now start checking mousemoves to update location
			var delegate = ev.liveFired || ev.currentTarget;
			var selector = ev.handleObj.selector;
			var loc = {
					pageX : ev.pageX,
					pageY : ev.pageY
				}, 
				dist = 0, 
				timer, 
				entered = this, 
				called = false,
				lastEv = ev, 
				delay = 100;
			var hovered = {
				setDelay: function(time){
					delay = time;
				}
			}
			$(entered).bind("mousemove.specialMouseEnter", {}, function(ev){
				dist += Math.pow( ev.pageX-loc.pageX, 2 ) + Math.pow( ev.pageY-loc.pageY, 2 ); 
				loc = {
					pageX : ev.pageX,
					pageY : ev.pageY
				}
				lastEv = ev
			}).bind("mouseleave.specialMouseLeave",{}, function(ev){
				clearTimeout(timer);
				if(called){
					$.each(event.find(delegate, ["hoverleave"], selector), function(){
						this.call(entered, ev)
					})
				}
				$(entered).unbind("mouseleave.specialMouseLeave")
			})
			timer = setTimeout(function(){
				//check that we aren't moveing around
				if(dist < 10 && $(entered).queue().length == 0){
					$.each(event.find(delegate, ["hoverenter"], selector), function(){
						this.call(entered, lastEv, hovered)
					})
					called = true;
					$(entered).unbind("mousemove.specialMouseEnter")
					
				}else{
					dist = 0;
					timer = setTimeout(arguments.callee, delay)
				}
				
				
			}, delay)
			$.each(event.find(delegate, ["hoverinit"], selector), function(){
				this.call(entered, ev, hovered)
			})
			while(jQuery.hoverTimers.length)
				clearTimeout(jQuery.hoverTimers.shift());
				
			jQuery.hoverTimers.push(timer)
		};
		event.setupHelper( ["hoverinit", "hoverenter","hoverleave","hovermove"], "mouseenter", onmouseenter )
		

	

})(jQuery);

