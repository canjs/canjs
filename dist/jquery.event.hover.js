// jquery/event/livehack/livehack.js

(function($){


	var event = jQuery.event,
		
		//helper that finds handlers by type and calls back a function, this is basically handle
		findHelper = function(events, types, callback){
			for( var t =0; t< types.length; t++ ) {
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
				typeHandlers = ( events[type] || [] ).slice(0);
				
				for( var h = 0; h <typeHandlers.length; h++ ) {
					var handle = typeHandlers[h];
					if( !handle.selector && (all || namespace.test( handle.namespace ))  ){
						callback(type, handle.origHandler || handle.handler);
					}
				}
			}
		}
	
	/**
	 * Finds event handlers of a given type on an element.
	 * @param {HTMLElement} el
	 * @param {Array} types an array of event names
	 * @param {String} [selector] optional selector
	 * @return {Array} an array of event handlers
	 */
	event.find  = function(el, types, selector){
		var events = $.data(el, "events"), 
			handlers = [];

		if( !events ) {
			return handlers;
		}
		
		if( selector ) {
			if (!events.live) { 
				return [];
			}
			var live = events.live;

			for ( var t = 0; t < live.length; t++ ) {
				var liver = live[t];
				if(  liver.selector === selector &&  $.inArray(liver.origType, types  ) !== -1 ) {
					handlers.push(liver.origHandler || liver.handler);
				}
			}
		}else{
			// basically re-create handler's logic
			findHelper(events, types, function(type, handler){
				handlers.push(handler);
			})
		}
		return handlers;
	}
	/**
	 * Finds 
	 * @param {HTMLElement} el
	 * @param {Array} types
	 */
	event.findBySelector = function(el, types){
		var events = $.data(el, "events"), 
			selectors = {}, 
			//adds a handler for a given selector and event
			add = function(selector, event, handler){
				var select = selectors[selector] ||  (selectors[selector] = {}),
					events = select[event] || (select[event] = []);
				events.push(handler);
			};

		if ( !events ) {
			return selectors;
		}
		//first check live:
		$.each( events.live||[] , function(i, live) {
			if( $.inArray(live.origType, types  ) !== -1 ) {
				add( live.selector, live.origType, live.origHandler || live.handler );
			}
		})
		//then check straight binds
		
		findHelper(events, types, function(type, handler){
			add("", type, handler);
		})
		
		return selectors;
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
		this.trigger(event, data);
		return event.handled;
	}
	/**
	 * Only attaches one event handler for all types ...
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
				});
			}
			
		}
		var remove = function(handleObj){
			var selector = handleObj.selector || "";
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
				});
			}
		}
		$.each(types, function(){
			event.special[this] = {
				add:  add,
				remove: remove,
				setup : function(){}
			};
		});
	}

})(jQuery);

// jquery/event/hover/hover.js

(function($){

	/**
	 * @constructor jQuery.Hover
	 * Provides delegatable hover events.
	 * @demo jquery/event/hover/hover.html
	 * @parent specialevents
	 * @init creates a new hover
	 */
	jQuery.Hover = function(){
		this._delay =  jQuery.Hover.delay;
		this._distance = jQuery.Hover.distance;
	};
	/**
	 * @Static
	 */
	$.extend(jQuery.Hover,{
		/**
		 * @attribute delay
		 * A hover is  activated if it moves less than distance in this time.
		 */
		delay: 100,
		/**
		 * @attribute distance
		 * A hover is activated if it moves less than this distance in delay time.
		 */
		distance: 10
	})
	
	/**
	 * @Prototype
	 */
	$.extend(jQuery.Hover.prototype,{
		/**
		 * sets the delay for this hoverevent
		 * @param {Object} delay
		 */
		delay: function(delay){
			this._delay = delay;
		},
		/**
		 * sets the distance for this hoverevent
		 * @param {Object} distance
		 */
		distance: function(distance){
			this._distance = distance;
		}
	})
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
				hover = new jQuery.Hover();

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
			$.each(event.find(delegate, ["hoverinit"], selector), function(){
				this.call(entered, ev, hover)
			})
			timer = setTimeout(function(){
				//check that we aren't moveing around
				if(dist < hover._distance && $(entered).queue().length == 0){
					$.each(event.find(delegate, ["hoverenter"], selector), function(){
						this.call(entered, lastEv, hover)
					})
					called = true;
					$(entered).unbind("mousemove.specialMouseEnter")
					
				}else{
					dist = 0;
					timer = setTimeout(arguments.callee, hover._delay)
				}
				
				
			}, hover._delay)
			
		};
		
		/**
		 * @add jQuery.event.special static
		 */
		event.setupHelper( [
		/**
		 * @attribute hoverinit
		 */
		"hoverinit", 
		/**
		 * @attribute hoverenter
		 */
		"hoverenter",
		/**
		 * @attribute hoverleave
		 */
		"hoverleave",
		/**
		 * @attribute hovermove
		 */
		"hovermove"], "mouseenter", onmouseenter )
		

	

})(jQuery);

